import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { OutlinePass } from "three/examples/jsm/postprocessing/OutlinePass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { useModelStore } from "../store/modelStore";
import { parseGlbTextureSizes, type MaterialTextureSizes } from "../lib/glbTextureSizes";

const OUTLINE_COLOR = "#2f6bff"; // v2 highlight (electric blue)
const CLICK_DRAG_THRESHOLD = 4; // px — distinguishes a pick from an orbit drag

export interface StageAnimation {
  name: string;
  duration: number;
}

export interface MaterialTextureInfo {
  type: string;
  url: string;
  name: string;
  width: number;
  height: number;
  byteLength: number;
}

export interface MaterialInfo {
  id: string;
  name: string;
  roughness: number;
  metalness: number;
  textures: MaterialTextureInfo[];
}

export interface MeshNode {
  uuid: string;
  name: string;
  type: string;
  isMesh: boolean;
  children: MeshNode[];
}

const MAP_KEYS: { key: string; label: string }[] = [
  { key: "map", label: "BaseColor" },
  { key: "normalMap", label: "Normal" },
  { key: "roughnessMap", label: "Roughness" },
  { key: "metalnessMap", label: "Metalness" },
  { key: "emissiveMap", label: "Emissive" },
  { key: "aoMap", label: "AO" },
];

/** Draw a texture's source image into a small canvas and return a data URL + size. */
function textureThumbnail(
  texture: THREE.Texture | null | undefined
): { url: string; width: number; height: number; name: string } | null {
  const image = texture?.image as (CanvasImageSource & { width?: number; height?: number }) | undefined;
  if (!image) {
    return null;
  }
  try {
    const size = 128;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext("2d");
    if (!context) {
      return null;
    }
    context.drawImage(image, 0, 0, size, size);
    return {
      url: canvas.toDataURL("image/png"),
      width: image.width ?? 0,
      height: image.height ?? 0,
      name: texture?.name || (texture?.userData?.filename as string) || "",
    };
  } catch {
    return null;
  }
}

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

function countTriangles(root: THREE.Object3D): number {
  let triangles = 0;
  root.traverse((object) => {
    const mesh = object as THREE.Mesh;
    if (mesh.isMesh && mesh.geometry) {
      const index = mesh.geometry.index;
      const position = mesh.geometry.attributes.position;
      triangles += (index ? index.count : position ? position.count : 0) / 3;
    }
  });
  return Math.round(triangles);
}

function collectMaterials(
  root: THREE.Object3D,
  registry: Map<string, THREE.Material>,
  textureSizes: MaterialTextureSizes
): MaterialInfo[] {
  const infos: MaterialInfo[] = [];
  root.traverse((object) => {
    const mesh = object as THREE.Mesh;
    const material = mesh.material;
    const materials = Array.isArray(material) ? material : material ? [material] : [];
    materials.forEach((entry) => {
      if (registry.has(entry.uuid)) {
        return;
      }
      registry.set(entry.uuid, entry);
      const standard = entry as THREE.MeshStandardMaterial;
      const record = standard as unknown as Record<string, THREE.Texture | undefined>;
      const sizes = textureSizes.get(entry.name) ?? {};
      const textures: MaterialTextureInfo[] = [];
      MAP_KEYS.forEach(({ key, label }) => {
        const thumb = textureThumbnail(record[key]);
        if (thumb) {
          textures.push({ type: label, byteLength: sizes[label] ?? 0, ...thumb });
        }
      });
      infos.push({
        id: entry.uuid,
        name: entry.name || "Material",
        roughness: typeof standard.roughness === "number" ? standard.roughness : 0,
        metalness: typeof standard.metalness === "number" ? standard.metalness : 0,
        textures,
      });
    });
  });
  return infos;
}

function buildMeshTree(object: THREE.Object3D): MeshNode {
  return {
    uuid: object.uuid,
    name: object.name || object.type,
    type: object.type,
    isMesh: (object as THREE.Mesh).isMesh === true,
    children: object.children.map(buildMeshTree),
  };
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
  clips: Map<string, THREE.AnimationClip>;
  materials: Map<string, THREE.Material>;
  objectsByUuid: Map<string, THREE.Object3D>;
}

/**
 * Owns the three.js stage and renders a glb passed as bytes. Plain three.js
 * behind a thin hook — three objects live in refs (never in React state / the
 * store). Exposes serializable model data (polygons, materials, mesh tree,
 * animations) and imperative controls for the preview UI to drive.
 */
export function useThreeStage(bytes: ArrayBuffer | null) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const refs = useRef<StageRefs | null>(null);
  const clockRef = useRef(new THREE.Clock());
  const raycasterRef = useRef(new THREE.Raycaster());
  const pointerDownRef = useRef<{ x: number; y: number } | null>(null);
  const isPlayingRef = useRef(false);
  const activeClipsRef = useRef<string[]>([]);
  const setMeta = useModelStore((state) => state.setMeta);

  const [animations, setAnimations] = useState<StageAnimation[]>([]);
  const [activeClips, setActiveClips] = useState<string[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [materials, setMaterials] = useState<MaterialInfo[]>([]);
  const [meshTree, setMeshTree] = useState<MeshNode | null>(null);
  const [selectedUuid, setSelectedUuid] = useState<string | null>(null);
  const [pickingEnabled, setPickingEnabled] = useState(true);
  const pickingEnabledRef = useRef(true);

  // Keep refs in sync so the render loop can gate the mixer without re-running.
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);
  useEffect(() => {
    activeClipsRef.current = activeClips;
  }, [activeClips]);
  useEffect(() => {
    pickingEnabledRef.current = pickingEnabled;
  }, [pickingEnabled]);

  const applySelection = useCallback((uuid: string | null) => {
    const stage = refs.current;
    if (!stage) {
      return;
    }
    const object = uuid ? stage.objectsByUuid.get(uuid) : null;
    stage.outlinePass.selectedObjects = object ? [object] : [];
    setSelectedUuid(object ? uuid : null);
  }, []);

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
      clips: new Map(),
      materials: new Map(),
      objectsByUuid: new Map(),
    };

    let raf = 0;
    let lastDeci = -1;
    const renderLoop = () => {
      raf = requestAnimationFrame(renderLoop);
      const current = refs.current;
      if (!current) {
        return;
      }
      const delta = clockRef.current.getDelta();
      if (current.mixer && isPlayingRef.current) {
        current.mixer.update(delta);
        // Throttle time updates to ~10/s to avoid re-rendering every frame.
        const deci = Math.floor(current.mixer.time * 10);
        if (deci !== lastDeci) {
          lastDeci = deci;
          setCurrentTime(current.mixer.time);
        }
      }
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
        setSelectedUuid(null);

        const model = gltf.scene;
        stage.scene.add(model);
        stage.model = model;

        // Index objects for tree ↔ viewer selection.
        stage.objectsByUuid = new Map();
        model.traverse((object) => stage.objectsByUuid.set(object.uuid, object));

        // Extract serializable model data for the preview UI.
        stage.materials = new Map();
        const materialInfos = collectMaterials(model, stage.materials, parseGlbTextureSizes(bytes));
        const maxTextureSize = materialInfos.reduce(
          (max, material) =>
            material.textures.reduce((inner, texture) => Math.max(inner, texture.width, texture.height), max),
          0
        );
        const existingMeta = useModelStore.getState().meta;
        setMeta({
          ...(existingMeta ?? { name: "", size: bytes.byteLength }),
          polygons: countTriangles(model),
          maxTextureSize: maxTextureSize || undefined,
        });
        setMaterials(materialInfos);
        setMeshTree(buildMeshTree(model));

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
        stage.clips.clear();
        if (gltf.animations.length > 0) {
          const mixer = new THREE.AnimationMixer(model);
          stage.mixer = mixer;
          gltf.animations.forEach((clip) => {
            stage.actions.set(clip.name, mixer.clipAction(clip));
            stage.clips.set(clip.name, clip);
          });
          const first = gltf.animations[0];
          stage.actions.get(first.name)?.reset().play();
          setAnimations(gltf.animations.map((clip) => ({ name: clip.name, duration: clip.duration })));
          setActiveClips([first.name]);
          setDuration(first.duration);
          setIsPlaying(true);
        } else {
          stage.mixer = null;
          setAnimations([]);
          setActiveClips([]);
          setDuration(0);
          setIsPlaying(false);
        }
        setCurrentTime(0);
      },
      () => {
        // parse error — leave the previous scene untouched
      }
    );

    return () => {
      cancelled = true;
    };
  }, [bytes, setMeta]);

  // ── Picking (click, not drag) ────────────────────────────────────────────
  const handlePointerDown = useCallback((event: React.PointerEvent) => {
    pointerDownRef.current = { x: event.clientX, y: event.clientY };
  }, []);

  const handlePointerUp = useCallback(
    (event: React.PointerEvent) => {
      const start = pointerDownRef.current;
      pointerDownRef.current = null;
      const stage = refs.current;
      if (!start || !stage || !stage.model || !pickingEnabledRef.current) {
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
      applySelection(hit ? hit.object.uuid : null);
    },
    [applySelection]
  );

  // ── Controls exposed to the UI ───────────────────────────────────────────
  const selectMesh = useCallback(
    (uuid: string | null) => applySelection(uuid),
    [applySelection]
  );

  const togglePlay = useCallback(() => {
    const stage = refs.current;
    if (!stage || !stage.mixer) {
      return;
    }
    // The render loop gates mixer.update on isPlaying, so flipping the flag both
    // freezes the pose and stops the seek time from advancing.
    setIsPlaying((playing) => !playing);
  }, []);

  const toggleClip = useCallback((name: string) => {
    const stage = refs.current;
    if (!stage) {
      return;
    }
    const action = stage.actions.get(name);
    if (!action) {
      return;
    }
    const previous = activeClipsRef.current;
    let next: string[];
    if (previous.includes(name)) {
      action.stop();
      next = previous.filter((entry) => entry !== name);
    } else {
      action.reset().play();
      next = [...previous, name];
    }
    setActiveClips(next);
    // Pause playback (and freeze the seek) when nothing is selected.
    setIsPlaying(next.length > 0);
    setDuration(
      next.reduce((max, clip) => Math.max(max, stage.clips.get(clip)?.duration ?? 0), 0)
    );
  }, []);

  const seek = useCallback((time: number) => {
    const stage = refs.current;
    if (!stage || !stage.mixer) {
      return;
    }
    stage.mixer.setTime(time);
    setCurrentTime(time);
  }, []);

  const setMaterialParam = useCallback(
    (id: string, key: "roughness" | "metalness", value: number) => {
      const stage = refs.current;
      const material = stage?.materials.get(id) as THREE.MeshStandardMaterial | undefined;
      if (!material) {
        return;
      }
      material[key] = value;
      material.needsUpdate = true;
      setMaterials((prev) => prev.map((entry) => (entry.id === id ? { ...entry, [key]: value } : entry)));
    },
    []
  );

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
    onPointerDown: handlePointerDown,
    onPointerUp: handlePointerUp,
    animations,
    activeClips,
    isPlaying,
    currentTime,
    duration,
    togglePlay,
    toggleClip,
    seek,
    materials,
    setMaterialParam,
    meshTree,
    selectedUuid,
    selectMesh,
    pickingEnabled,
    setPickingEnabled,
    resetView,
  };
}

export type StageController = ReturnType<typeof useThreeStage>;
