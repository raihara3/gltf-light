// lib
import {
  Fragment,
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRecoilValue, useSetRecoilState, useRecoilState } from "recoil";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { OutlinePass } from "three/examples/jsm/postprocessing/OutlinePass";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass";

// states
import { filePathState } from "../state/atoms/Upload3DModelAtom";
import {
  currentSelectAnimationState,
  animationPlayingState,
  animationCurrentTimeState,
  animationSeekTimeState,
  animationDurationState,
} from "../state/atoms/CurrentSelect";
import {
  selectedMaterialNameState,
  materialPropertiesState,
  copyrightState,
} from "../state/atoms/ModelInfo";
import {
  detailModeEnabledState,
  meshTreeState,
  selectedMeshUuidState,
} from "../state/atoms/MeshTree";

// hooks
import { useModelUpload } from "../hooks/useModelUpload";

// utils
import { buildMeshTree } from "../utils/buildMeshTree";
import { injectGlbCopyright } from "../utils/injectGlbCopyright";

// styles
import styles from "../styles/components/viewer.module.scss";

const createThrottle = (callback, interval) => {
  let lastTime = 0;
  return (...arguments_) => {
    const now = performance.now();
    if (now - lastTime >= interval) {
      lastTime = now;
      callback(...arguments_);
    }
  };
};

const ThreeViewer = ({ currentResizeTexture = {} }) => {
  const filePath = useRecoilValue(filePathState);
  const currentSelectAnimation = useRecoilValue(currentSelectAnimationState);
  const isPlaying = useRecoilValue(animationPlayingState);
  const [seekTime, setSeekTime] = useRecoilState(animationSeekTimeState);
  const setAnimationCurrentTime = useSetRecoilState(animationCurrentTimeState);
  const setAnimationDuration = useSetRecoilState(animationDurationState);
  const selectedMaterialName = useRecoilValue(selectedMaterialNameState);
  const materialProperties = useRecoilValue(materialPropertiesState);
  const copyright = useRecoilValue(copyrightState);
  const [detailModeEnabled, setDetailModeEnabled] = useRecoilState(detailModeEnabledState);
  const setMeshTree = useSetRecoilState(meshTreeState);
  const [selectedMeshUuid, setSelectedMeshUuid] = useRecoilState(selectedMeshUuidState);
  const { onChangeFile } = useModelUpload();

  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const modelRef = useRef(null);
  const mixerRef = useRef(null);
  const animationActionsRef = useRef({});
  const animationClipsRef = useRef([]);
  const clockRef = useRef(new THREE.Clock());
  const materialsRef = useRef([]);
  const isPlayingRef = useRef(true);
  const animationDurationRef = useRef(0);
  const throttledSetTimeRef = useRef(null);
  const onChangeFileRef = useRef(onChangeFile);

  const ambientLightRef = useRef(null);
  const directionalLightRef = useRef(null);

  const composerRef = useRef(null);
  const outlinePassRef = useRef(null);
  const raycasterRef = useRef(new THREE.Raycaster());
  const ndcRef = useRef(new THREE.Vector2());
  const pointerDownPosRef = useRef(null);

  const [isDragging, setIsDragging] = useState(false);
  const [isLightMode, setIsLightMode] = useState(false);
  const [isCaptureMode, setIsCaptureMode] = useState(false);
  const [ambientIntensity, setAmbientIntensity] = useState(0.5);
  const [directionalIntensity, setDirectionalIntensity] = useState(0.5);
  const [environmentIntensity, setEnvironmentIntensity] = useState(1.0);

  // onChangeFileの参照を更新
  useEffect(() => {
    onChangeFileRef.current = onChangeFile;
  }, [onChangeFile]);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    throttledSetTimeRef.current = createThrottle((time) => {
      setAnimationCurrentTime(time);
    }, 100);
  }, [setAnimationCurrentTime]);

  // Three.js初期化
  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    // 背景を透明にする（ページの背景色が見える）
    scene.background = null;
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 3);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true,
      powerPreference: "high-performance",
    });
    renderer.setClearColor(0x000000, 0); // 完全に透明
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    rendererRef.current = renderer;

    // Canvas要素にドラッグ&ドロップイベントを追加
    const canvas = renderer.domElement;
    canvas.style.pointerEvents = "auto";

    const canvasDragOver = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
    };

    const canvasDragLeave = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
    };

    const canvasDrop = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) {
        onChangeFileRef.current(file);
      }
    };

    canvas.addEventListener("dragover", canvasDragOver);
    canvas.addEventListener("dragleave", canvasDragLeave);
    canvas.addEventListener("drop", canvasDrop);

    mountRef.current.appendChild(canvas);

    // Environment
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const environment = new RoomEnvironment();
    const environmentTexture = pmremGenerator.fromScene(environment).texture;
    scene.environment = environmentTexture;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    ambientLightRef.current = ambientLight;

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.near = 0.1;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -10;
    directionalLight.shadow.camera.right = 10;
    directionalLight.shadow.camera.top = 10;
    directionalLight.shadow.camera.bottom = -10;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);
    directionalLightRef.current = directionalLight;

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 0.1;
    controls.maxDistance = 100;
    controls.autoRotate = false;
    controlsRef.current = controls;

    // Ground plane for shadows (will be positioned after model loads)
    const planeGeometry = new THREE.PlaneGeometry(100, 100);
    const planeMaterial = new THREE.ShadowMaterial({ opacity: 0.2 });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = 0;
    plane.receiveShadow = true;
    plane.name = "groundPlane";
    scene.add(plane);

    // Postprocessing for the Detail Mode outline highlight.
    const composer = new EffectComposer(renderer);
    composer.setSize(width, height);
    composer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    composer.addPass(new RenderPass(scene, camera));

    const outlinePass = new OutlinePass(
      new THREE.Vector2(width, height),
      scene,
      camera
    );
    outlinePass.visibleEdgeColor.set("#aaff00");
    outlinePass.hiddenEdgeColor.set("#aaff00");
    outlinePass.edgeStrength = 4;
    outlinePass.edgeThickness = 1;
    outlinePass.edgeGlow = 0;
    outlinePass.pulsePeriod = 0;

    // Workaround: OutlinePass hides every non-selected mesh during its mask
    // render. If the selected mesh is a descendant of another mesh, that
    // ancestor gets hidden and the selected child therefore does not draw
    // either, so the outline never appears. Lift each selected object to the
    // render scene root (preserving world transform) just for the pass and
    // restore the original parent immediately after.
    const originalOutlineRender = outlinePass.render.bind(outlinePass);
    outlinePass.render = function (renderer, writeBuffer, readBuffer, deltaTime, maskActive) {
      if (this.selectedObjects.length === 0) {
        originalOutlineRender(renderer, writeBuffer, readBuffer, deltaTime, maskActive);
        return;
      }
      const reparents = [];
      this.selectedObjects.forEach((object) => {
        const originalParent = object.parent;
        if (originalParent && originalParent !== this.renderScene) {
          reparents.push([object, originalParent]);
          this.renderScene.attach(object);
        }
      });
      try {
        originalOutlineRender(renderer, writeBuffer, readBuffer, deltaTime, maskActive);
      } finally {
        reparents.forEach(([object, originalParent]) => {
          originalParent.attach(object);
        });
      }
    };

    composer.addPass(outlinePass);
    composer.addPass(new OutputPass());

    composerRef.current = composer;
    outlinePassRef.current = outlinePass;

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      const delta = clockRef.current.getDelta();

      if (mixerRef.current) {
        if (isPlayingRef.current) {
          mixerRef.current.update(delta);
          if (throttledSetTimeRef.current) {
            const duration = animationDurationRef.current;
            const time = duration > 0
              ? mixerRef.current.time % duration
              : mixerRef.current.time;
            throttledSetTimeRef.current(time);
          }
        }
      }

      controls.update();
      composer.render();
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (!mountRef.current) return;
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      composer.setSize(width, height);
      outlinePass.setSize(width, height);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);

      // Canvas要素のイベントリスナーを削除
      canvas.removeEventListener("dragover", canvasDragOver);
      canvas.removeEventListener("dragleave", canvasDragLeave);
      canvas.removeEventListener("drop", canvasDrop);

      composer.dispose();
      renderer.dispose();
      pmremGenerator.dispose();
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  // GLTFモデルの読み込み
  useEffect(() => {
    if (!filePath || !sceneRef.current) return;

    const loader = new GLTFLoader();
    loader.load(
      filePath,
      (gltf) => {
        // 既存モデルの削除
        if (modelRef.current) {
          if (outlinePassRef.current) {
            outlinePassRef.current.selectedObjects = [];
          }
          setMeshTree(null);
          setSelectedMeshUuid(null);

          sceneRef.current.remove(modelRef.current);
          modelRef.current.traverse((child) => {
            if (child.geometry) child.geometry.dispose();
            if (child.material) {
              if (Array.isArray(child.material)) {
                child.material.forEach((material) => material.dispose());
              } else {
                child.material.dispose();
              }
            }
          });
        }

        // 新しいモデルの追加
        const model = gltf.scene;
        model.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        sceneRef.current.add(model);
        modelRef.current = model;

        // マテリアルの保存とテクスチャの初期設定保持
        const materials = [];
        model.traverse((child) => {
          if (child.isMesh && child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach((material) => {
                // テクスチャの初期設定を確保
                if (material.map) {
                  // GLTFから読み込まれたテクスチャの設定を保持
                  if (material.map.flipY === undefined) {
                    material.map.flipY = false; // GLTFのデフォルト
                  }
                }
              });
              materials.push(...child.material);
            } else {
              // テクスチャの初期設定を確保
              if (child.material.map) {
                if (child.material.map.flipY === undefined) {
                  child.material.map.flipY = false; // GLTFのデフォルト
                }
              }
              materials.push(child.material);
            }
          }
        });
        materialsRef.current = materials;

        // モデルをカメラフレームに収める
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const fov = cameraRef.current.fov * (Math.PI / 180);
        const cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
        const distance = cameraZ * 1.5;

        cameraRef.current.position.set(0, center.y, distance);
        cameraRef.current.lookAt(center);
        controlsRef.current.target.copy(center);
        controlsRef.current.update();

        // 地面をモデルの底に配置
        const groundPlane = sceneRef.current.getObjectByName("groundPlane");
        if (groundPlane) {
          groundPlane.position.y = box.min.y - 0.01;
          // 地面のサイズをモデルに合わせて調整
          const planeSize = Math.max(size.x, size.z) * 3;
          groundPlane.scale.set(planeSize / 100, planeSize / 100, 1);
        }

        // アニメーション設定
        setAnimationCurrentTime(0);
        animationDurationRef.current = 0;
        setAnimationDuration(0);
        setSeekTime(null);

        if (gltf.animations && gltf.animations.length > 0) {
          mixerRef.current = new THREE.AnimationMixer(model);
          animationActionsRef.current = {};
          animationClipsRef.current = gltf.animations;

          gltf.animations.forEach((clip) => {
            const action = mixerRef.current.clipAction(clip);
            animationActionsRef.current[clip.name] = action;
          });

          // 1つ目のアニメーションを自動再生
          const firstClip = gltf.animations[0];
          const firstAction = animationActionsRef.current[firstClip.name];
          if (firstAction) {
            firstAction.reset();
            firstAction.play();
            animationDurationRef.current = firstClip.duration;
            setAnimationDuration(firstClip.duration);
          }
        } else {
          animationClipsRef.current = [];
        }

        if (composerRef.current) {
          composerRef.current.render();
        }

        setMeshTree(buildMeshTree(model));
      },
      undefined,
      (error) => {
        console.error("An error occurred loading the model:", error);
      }
    );
  }, [filePath, setMeshTree, setSelectedMeshUuid]);

  // アニメーション制御（複数同時再生対応）
  useEffect(() => {
    if (!currentSelectAnimation || !animationActionsRef.current) return;

    const selectedAnimations = Array.isArray(currentSelectAnimation)
      ? currentSelectAnimation
      : [currentSelectAnimation];

    // 全てのアニメーションを一旦フェードアウト
    Object.values(animationActionsRef.current).forEach((action) => {
      action.fadeOut(0.5);
    });

    // 選択されたアニメーションをフェードインして再生
    let maxDuration = 0;
    selectedAnimations.forEach((animationName) => {
      const action = animationActionsRef.current[animationName];
      if (action) {
        action.reset();
        action.fadeIn(0.5);
        action.play();
        if (action.getClip().duration > maxDuration) {
          maxDuration = action.getClip().duration;
        }
      }
    });
    animationDurationRef.current = maxDuration;
    setAnimationDuration(maxDuration);
  }, [currentSelectAnimation, setAnimationDuration]);

  // シーク制御
  useEffect(() => {
    if (seekTime === null || !mixerRef.current) return;
    mixerRef.current.setTime(seekTime);
    setAnimationCurrentTime(seekTime);
    setSeekTime(null);
    if (composerRef.current) {
      composerRef.current.render();
    }
  }, [seekTime, setSeekTime, setAnimationCurrentTime]);

  // テクスチャの動的変更
    useEffect(() => {
    if (
      !currentResizeTexture ||
      !currentResizeTexture.src ||
      !currentResizeTexture.materialName
    )
      return;

    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(currentResizeTexture.src, (texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;

      // テクスチャのUV設定を適切に設定
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(1, 1);
      texture.offset.set(0, 0);

      // フィルタリング設定
      texture.minFilter = THREE.LinearMipmapLinearFilter;
      texture.magFilter = THREE.LinearFilter;

      // テクスチャが反転しないように設定
      texture.flipY = false;

      materialsRef.current.forEach((material) => {
        if (material.name === currentResizeTexture.materialName) {
          // 元のテクスチャの設定を保持
          const originalTexture = material.map;
          if (originalTexture) {
            // 元のテクスチャのUV設定をコピー
            texture.wrapS = originalTexture.wrapS;
            texture.wrapT = originalTexture.wrapT;
            texture.repeat.copy(originalTexture.repeat);
            texture.offset.copy(originalTexture.offset);
            texture.flipY = originalTexture.flipY;
          }

          material.map = texture;
          material.needsUpdate = true;
        }
      });
    });
  }, [currentResizeTexture]);

  // マテリアルプロパティの動的変更
  useEffect(() => {
    if (!selectedMaterialName || !materialsRef.current) return;

    // 選択されたマテリアルを名前で検索して更新
    const targetMaterial = materialsRef.current.find(
      (material) => material.name === selectedMaterialName
    );

    if (!targetMaterial) return;

    // マテリアルのroughnessとmetalnessを更新
    if (targetMaterial.roughness !== undefined) {
      targetMaterial.roughness = materialProperties.roughness;
    }
    if (targetMaterial.metalness !== undefined) {
      targetMaterial.metalness = materialProperties.metalness;
    }

    targetMaterial.needsUpdate = true;

    // レンダリングを強制更新
    if (composerRef.current) {
      composerRef.current.render();
    }
  }, [selectedMaterialName, materialProperties]);

  // エクスポート機能
  const onSave = useCallback(() => {
    if (!sceneRef.current || !modelRef.current) return;

    const exporter = new GLTFExporter();
    const exportOptions = {
      binary: true,
      animations: animationClipsRef.current,
    };

    exporter.parse(
      modelRef.current,
      (gltf) => {
        const output = copyright
          ? injectGlbCopyright(gltf, copyright)
          : gltf;
        const blob = new Blob([output], { type: "application/octet-stream" });
        const link = document.createElement("a");
        link.download = "gltf-light.glb";
        link.href = URL.createObjectURL(blob);
        link.click();
        URL.revokeObjectURL(link.href);
      },
      (error) => {
        console.error("An error occurred during export:", error);
      },
      exportOptions
    );
  }, [copyright]);

  // ドラッグ&ドロップ
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (event) => {
      event.preventDefault();
      setIsDragging(false);
      const file = event.dataTransfer.files[0];
      if (file) {
        onChangeFile(file);
      }
    },
    [onChangeFile]
  );

  useEffect(() => {
    if (ambientLightRef.current) {
      ambientLightRef.current.intensity = ambientIntensity;
    }
  }, [ambientIntensity]);

  useEffect(() => {
    if (directionalLightRef.current) {
      directionalLightRef.current.intensity = directionalIntensity;
    }
  }, [directionalIntensity]);

  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.environmentIntensity = environmentIntensity;
    }
  }, [environmentIntensity]);

  const toggleLightMode = useCallback(() => {
    setIsLightMode((previous) => !previous);
  }, []);

  const toggleCaptureMode = useCallback(() => {
    setIsCaptureMode((previous) => !previous);
  }, []);

  // Pointer-based mesh picking, gated by the sidebar viewer-picking toggle.
  useEffect(() => {
    if (!detailModeEnabled) return;
    const renderer = rendererRef.current;
    if (!renderer) return;
    const canvas = renderer.domElement;

    const handlePointerDown = (event) => {
      pointerDownPosRef.current = { x: event.clientX, y: event.clientY };
    };

    const handlePointerUp = (event) => {
      const downPos = pointerDownPosRef.current;
      pointerDownPosRef.current = null;
      if (!downPos) return;
      const dx = event.clientX - downPos.x;
      const dy = event.clientY - downPos.y;
      if (Math.hypot(dx, dy) >= 4) return;

      const camera = cameraRef.current;
      const model = modelRef.current;
      if (!camera || !model) return;

      const rect = canvas.getBoundingClientRect();
      ndcRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      ndcRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycasterRef.current.setFromCamera(ndcRef.current, camera);
      const intersects = raycasterRef.current.intersectObject(model, true);
      const hit = intersects.find(
        (intersection) =>
          intersection.object.isMesh && intersection.object.name !== "groundPlane"
      );
      if (hit) {
        setSelectedMeshUuid((previous) =>
          previous === hit.object.uuid ? null : hit.object.uuid
        );
      } else {
        setSelectedMeshUuid(null);
      }
    };

    canvas.addEventListener("pointerdown", handlePointerDown);
    canvas.addEventListener("pointerup", handlePointerUp);

    return () => {
      canvas.removeEventListener("pointerdown", handlePointerDown);
      canvas.removeEventListener("pointerup", handlePointerUp);
    };
  }, [detailModeEnabled, setSelectedMeshUuid]);

  // Sync the outline highlight with the selected mesh.
  useEffect(() => {
    const outlinePass = outlinePassRef.current;
    const model = modelRef.current;
    if (!outlinePass) return;

    if (!selectedMeshUuid || !model) {
      outlinePass.selectedObjects = [];
      return;
    }

    const targetMesh = model.getObjectByProperty("uuid", selectedMeshUuid);
    outlinePass.selectedObjects = targetMesh ? [targetMesh] : [];
  }, [selectedMeshUuid]);

  // Allow ESC to disable viewer picking while it is active.
  useEffect(() => {
    if (!detailModeEnabled) return;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setDetailModeEnabled(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [detailModeEnabled, setDetailModeEnabled]);

  const handleCapture = useCallback(() => {
    const renderer = rendererRef.current;
    const composer = composerRef.current;
    const scene = sceneRef.current;
    if (!renderer || !composer || !scene) return;

    const groundPlane = scene.getObjectByName("groundPlane");
    const previousGroundVisible = groundPlane?.visible;
    if (groundPlane) groundPlane.visible = false;

    try {
      composer.render();
      renderer.domElement.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.download = "capture.png";
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
      }, "image/png");
    } finally {
      if (groundPlane) groundPlane.visible = previousGroundVisible;
    }
  }, []);

  return (
    <Fragment>
      <div className={styles.buttonGroup}>
        <button
          className={`${styles.modeToggleButton} ${isCaptureMode ? styles.captureModeActive : ""}`}
          onClick={toggleCaptureMode}
          title={isCaptureMode ? "Exit Capture Mode" : "Enter Capture Mode"}
        >
          📷
        </button>
        <button
          className={`${styles.modeToggleButton} ${isLightMode ? styles.lightModeActive : ""}`}
          onClick={toggleLightMode}
          title={isLightMode ? "Switch to Dark Mode" : "Switch to Light Mode"}
        >
          {isLightMode ? "☀️" : "🌙"}
        </button>
        <button className={styles.downloadButton} onClick={onSave}>
          Download glTF
        </button>
      </div>
      {isCaptureMode && (
        <div className={styles.captureControls}>
          <label className={styles.captureLabel}>
            Ambient
            <input
              type="range"
              min="0"
              max="3"
              step="0.01"
              value={ambientIntensity}
              onChange={(e) => setAmbientIntensity(Number.parseFloat(e.target.value))}
            />
            <span className={styles.captureValue}>{ambientIntensity.toFixed(2)}</span>
          </label>
          <label className={styles.captureLabel}>
            Directional
            <input
              type="range"
              min="0"
              max="3"
              step="0.01"
              value={directionalIntensity}
              onChange={(e) => setDirectionalIntensity(Number.parseFloat(e.target.value))}
            />
            <span className={styles.captureValue}>{directionalIntensity.toFixed(2)}</span>
          </label>
          <label className={styles.captureLabel}>
            Environment
            <input
              type="range"
              min="0"
              max="3"
              step="0.01"
              value={environmentIntensity}
              onChange={(e) => setEnvironmentIntensity(Number.parseFloat(e.target.value))}
            />
            <span className={styles.captureValue}>{environmentIntensity.toFixed(2)}</span>
          </label>
          <button className={styles.captureButton} onClick={handleCapture}>
            Capture PNG
          </button>
        </div>
      )}
      <div
        className={`${styles.viewerContainer} ${
          isDragging ? styles.dragging : ""
        } ${isLightMode ? styles.lightMode : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {isDragging && (
          <div className={styles.dropOverlay}>
            <p>Drop 3D model here</p>
          </div>
        )}
        <div ref={mountRef} className={styles.viewer} />
      </div>
    </Fragment>
  );
};

export default memo(ThreeViewer);
