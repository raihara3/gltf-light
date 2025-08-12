// lib
import {
  Fragment,
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRecoilValue } from "recoil";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment";

// states
import { filePathState } from "../state/atoms/Upload3DModelAtom";
import { currentSelectAnimationState } from "../state/atoms/CurrentSelect";

// hooks
import { useModelUpload } from "../hooks/useModelUpload";

// styles
import styles from "../styles/components/viewer.module.scss";

const ThreeViewer = ({ currentResizeTexture = {} }) => {
  const filePath = useRecoilValue(filePathState);
  const currentSelectAnimation = useRecoilValue(currentSelectAnimationState);
  const { onChangeFile } = useModelUpload();

  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const modelRef = useRef(null);
  const mixerRef = useRef(null);
  const animationActionsRef = useRef({});
  const clockRef = useRef(new THREE.Clock());
  const materialsRef = useRef([]);
  const onChangeFileRef = useRef(onChangeFile);

  const [isDragging, setIsDragging] = useState(false);

  // onChangeFileの参照を更新
  useEffect(() => {
    onChangeFileRef.current = onChangeFile;
  }, [onChangeFile]);

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
    camera.position.set(2, 2, 2);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true, // 透明背景を有効化
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

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      const delta = clockRef.current.getDelta();

      if (mixerRef.current) {
        mixerRef.current.update(delta);
      }

      controls.update();
      renderer.render(scene, camera);
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
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);

      // Canvas要素のイベントリスナーを削除
      canvas.removeEventListener("dragover", canvasDragOver);
      canvas.removeEventListener("dragleave", canvasDragLeave);
      canvas.removeEventListener("drop", canvasDrop);

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

        // マテリアルの保存
        const materials = [];
        model.traverse((child) => {
          if (child.isMesh && child.material) {
            if (Array.isArray(child.material)) {
              materials.push(...child.material);
            } else {
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

        cameraRef.current.position.set(distance, distance * 0.5, distance);
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
        if (gltf.animations && gltf.animations.length > 0) {
          mixerRef.current = new THREE.AnimationMixer(model);
          animationActionsRef.current = {};

          gltf.animations.forEach((clip) => {
            const action = mixerRef.current.clipAction(clip);
            animationActionsRef.current[clip.name] = action;
          });
        }

        // モデル読み込み完了後に強制レンダリング
        console.log("Force rendering after model load");
        if (rendererRef.current && sceneRef.current && cameraRef.current) {
          rendererRef.current.render(sceneRef.current, cameraRef.current);
        }
      },
      undefined,
      (error) => {
        console.error("An error occurred loading the model:", error);
      }
    );
  }, [filePath]);

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
    selectedAnimations.forEach((animationName) => {
      const action = animationActionsRef.current[animationName];
      if (action) {
        action.reset();
        action.fadeIn(0.5);
        action.play();
      }
    });
  }, [currentSelectAnimation]);

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

      materialsRef.current.forEach((material) => {
        if (material.name === currentResizeTexture.materialName) {
          material.map = texture;
          material.needsUpdate = true;
        }
      });
    });
  }, [currentResizeTexture]);

  // エクスポート機能
  const onSave = useCallback(() => {
    if (!sceneRef.current || !modelRef.current) return;

    const exporter = new GLTFExporter();
    exporter.parse(
      modelRef.current,
      (gltf) => {
        const blob = new Blob([gltf], { type: "application/octet-stream" });
        const link = document.createElement("a");
        link.download = "gltf-light.glb";
        link.href = URL.createObjectURL(blob);
        link.click();
        URL.revokeObjectURL(link.href);
      },
      (error) => {
        console.error("An error occurred during export:", error);
      },
      { binary: true }
    );
  }, []);

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

  return (
    <Fragment>
      <button className={styles.downloadButton} onClick={onSave}>
        Download glTF
      </button>
      <div
        className={`${styles.viewerContainer} ${
          isDragging ? styles.dragging : ""
        }`}
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
