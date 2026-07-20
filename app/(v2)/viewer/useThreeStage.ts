import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { OutlinePass } from "three/examples/jsm/postprocessing/OutlinePass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";

const OUTLINE_COLOR = "#2f6bff"; // v2 highlight (electric blue)
const CLICK_DRAG_THRESHOLD = 4; // px — distinguishes a pick from an orbit drag

/** Free GPU resources held by a model subtree before discarding it. */
function disposeObject(root: THREE.Object3D) {
  root.traverse((object) => {
    const mesh = object as THREE.Mesh;
    mesh.geometry?.dispose?.();
    const material = mesh.material;
    const materials = Array.isArray(material) ? material : material ? [material] : [];
    materials.forEach((entry) => {
      Object.values(entry).forEach((value) => {
        if (value instanceof THREE.Texture) {
          value.dispose();
        }
      });
      entry.dispose();
    });
  });
}

export interface StageAnimation {
  name: string;
  duration: number;
}

interface StageRefs {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  controls: OrbitControls;
  composer: EffectComposer;
  outlinePass: OutlinePass;
  mixer: THREE.AnimationMixer | null;
  model: THREE.Object3D | null;
  actions: Map<string, THREE.AnimationAction>;
}

/**
 * Owns the three.js stage (renderer / scene / camera / controls / composer)
 * and renders a glb passed as bytes. Plain three.js behind a thin hook — three
 * objects live in refs (never in React state / the store). Selection uses a
 * Raycaster + OutlinePass; animation uses an AnimationMixer.
 */
export function useThreeStage(bytes: ArrayBuffer | null) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const refs = useRef<StageRefs | null>(null);
  const clockRef = useRef(new THREE.Clock());
  const raycasterRef = useRef(new THREE.Raycaster());
  const pointerDownRef = useRef<{ x: number; y: number } | null>(null);

  const [animations, setAnimations] = useState<StageAnimation[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedName, setSelectedName] = useState<string | null>(null);

  // ── Stage lifecycle (mount once) ─────────────────────────────────────────
  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 3);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true,
      powerPreference: "high-performance",
    });
    renderer.setClearColor(0x000000, 0);
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    container.appendChild(renderer.domElement);

    // Match legacy exactly: sharp RoomEnvironment IBL (no PMREM blur sigma).
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment()).texture;

    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const directional = new THREE.DirectionalLight(0xffffff, 0.5);
    directional.position.set(5, 5, 5);
    scene.add(directional);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    const composer = new EffectComposer(renderer);
    composer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    composer.addPass(new RenderPass(scene, camera));
    const outlinePass = new OutlinePass(new THREE.Vector2(width, height), scene, camera);
    outlinePass.visibleEdgeColor.set(OUTLINE_COLOR);
    outlinePass.hiddenEdgeColor.set(OUTLINE_COLOR);
    outlinePass.edgeStrength = 4;
    outlinePass.edgeThickness = 1;
    composer.addPass(outlinePass);
    // OutputPass applies tone mapping + sRGB conversion to the composed frame.
    // Without it, EffectComposer emits linear color and materials look far too
    // saturated/dark (matches the legacy viewer's pipeline).
    composer.addPass(new OutputPass());

    refs.current = {
      renderer,
      scene,
      camera,
      controls,
      composer,
      outlinePass,
      mixer: null,
      model: null,
      actions: new Map(),
    };

    let raf = 0;
    const renderLoop = () => {
      raf = requestAnimationFrame(renderLoop);
      const current = refs.current;
      if (!current) {
        return;
      }
      const delta = clockRef.current.getDelta();
      current.mixer?.update(delta);
      current.controls.update();
      current.composer.render();
    };
    renderLoop();

    const handleResize = () => {
      const current = refs.current;
      if (!current || !container.clientWidth) {
        return;
      }
      const nextWidth = container.clientWidth;
      const nextHeight = container.clientHeight;
      current.camera.aspect = nextWidth / nextHeight;
      current.camera.updateProjectionMatrix();
      current.renderer.setSize(nextWidth, nextHeight);
      current.composer.setSize(nextWidth, nextHeight);
      current.outlinePass.setSize(nextWidth, nextHeight);
    };
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      if (refs.current?.model) {
        disposeObject(refs.current.model);
      }
      pmrem.dispose();
      controls.dispose();
      renderer.dispose();
      renderer.domElement.remove();
      refs.current = null;
    };
  }, []);

  // ── Load / replace the model when bytes change ───────────────────────────
  useEffect(() => {
    const current = refs.current;
    if (!current || !bytes) {
      return;
    }
    let cancelled = false;
    const loader = new GLTFLoader();
    loader.parse(
      bytes.slice(0),
      "",
      (gltf) => {
        if (cancelled || !refs.current) {
          return;
        }
        const stage = refs.current;
        if (stage.model) {
          stage.mixer?.stopAllAction();
          stage.scene.remove(stage.model);
          disposeObject(stage.model);
        }
        stage.outlinePass.selectedObjects = [];
        setSelectedName(null);

        const model = gltf.scene;
        stage.scene.add(model);
        stage.model = model;

        // Fit camera to the model bounds.
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z) || 1;
        const fov = stage.camera.fov * (Math.PI / 180);
        const distance = (Math.abs(maxDim / 2 / Math.tan(fov / 2)) || 1) * 1.5;
        stage.camera.position.set(0, center.y, distance);
        stage.camera.near = distance / 100;
        stage.camera.far = distance * 100;
        stage.camera.updateProjectionMatrix();
        stage.camera.lookAt(center);
        stage.controls.target.copy(center);
        stage.controls.update();

        // Animation.
        stage.actions.clear();
        if (gltf.animations.length > 0) {
          const mixer = new THREE.AnimationMixer(model);
          stage.mixer = mixer;
          gltf.animations.forEach((clip) => {
            stage.actions.set(clip.name, mixer.clipAction(clip));
          });
          const first = gltf.animations[0];
          stage.actions.get(first.name)?.reset().play();
          setIsPlaying(true);
          setAnimations(gltf.animations.map((clip) => ({ name: clip.name, duration: clip.duration })));
        } else {
          stage.mixer = null;
          setIsPlaying(false);
          setAnimations([]);
        }
      },
      () => {
        // parse error — leave the previous scene untouched
      }
    );

    return () => {
      cancelled = true;
    };
  }, [bytes]);

  // ── Picking (click, not drag) ────────────────────────────────────────────
  const handlePointerDown = useCallback((event: React.PointerEvent) => {
    pointerDownRef.current = { x: event.clientX, y: event.clientY };
  }, []);

  const handlePointerUp = useCallback((event: React.PointerEvent) => {
    const start = pointerDownRef.current;
    pointerDownRef.current = null;
    const stage = refs.current;
    if (!start || !stage || !stage.model) {
      return;
    }
    if (Math.hypot(event.clientX - start.x, event.clientY - start.y) > CLICK_DRAG_THRESHOLD) {
      return; // it was an orbit drag
    }
    const rect = stage.renderer.domElement.getBoundingClientRect();
    const ndc = new THREE.Vector2(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1
    );
    raycasterRef.current.setFromCamera(ndc, stage.camera);
    const hit = raycasterRef.current.intersectObject(stage.model, true)[0];
    const mesh = hit?.object as THREE.Mesh | undefined;
    if (mesh) {
      stage.outlinePass.selectedObjects = [mesh];
      setSelectedName(mesh.name || "(no name)");
    } else {
      stage.outlinePass.selectedObjects = [];
      setSelectedName(null);
    }
  }, []);

  // ── Controls exposed to the UI ───────────────────────────────────────────
  const togglePlay = useCallback(() => {
    const stage = refs.current;
    if (!stage || !stage.mixer) {
      return;
    }
    setIsPlaying((playing) => {
      const next = !playing;
      stage.actions.forEach((action) => {
        action.paused = !next;
      });
      return next;
    });
  }, []);

  const resetView = useCallback(() => {
    const stage = refs.current;
    if (!stage || !stage.model) {
      return;
    }
    const box = new THREE.Box3().setFromObject(stage.model);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    const fov = stage.camera.fov * (Math.PI / 180);
    const distance = (Math.abs(maxDim / 2 / Math.tan(fov / 2)) || 1) * 1.5;
    stage.camera.position.set(0, center.y, distance);
    stage.controls.target.copy(center);
    stage.controls.update();
  }, []);

  return {
    containerRef,
    animations,
    isPlaying,
    selectedName,
    onPointerDown: handlePointerDown,
    onPointerUp: handlePointerUp,
    togglePlay,
    resetView,
  };
}
