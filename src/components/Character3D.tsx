
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

interface Character3DProps {
  modelUrl?: string;
  isLeft?: boolean;
  isDamaged?: boolean;
}

export const Character3D = ({ modelUrl, isLeft = true, isDamaged = false }: Character3DProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const modelRef = useRef<THREE.Object3D | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Setup scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Setup camera with adjusted FOV and position
    const camera = new THREE.PerspectiveCamera(
      60, // Increased FOV for better view
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 2; // Moved camera closer
    camera.position.y = 0.5; // Slight upward angle
    cameraRef.current = camera;

    // Setup renderer with transparency and better quality
    const renderer = new THREE.WebGLRenderer({ 
      alpha: true,
      antialias: true,
      preserveDrawingBuffer: true
    });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x000000, 0);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Enhanced lighting setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    const backLight = new THREE.DirectionalLight(0xffffff, 0.5);
    backLight.position.set(-5, 5, -5);
    scene.add(backLight);

    // Add default cube if no model provided
    if (!modelUrl) {
      const geometry = new THREE.BoxGeometry(1, 1, 1);
      const material = new THREE.MeshPhongMaterial({
        color: isDamaged ? 0xff0000 : 0x9b87f5,
      });
      const cube = new THREE.Mesh(geometry, material);
      scene.add(cube);
      modelRef.current = cube;
    } else {
      console.log('Attempting to load model from:', modelUrl);
      // Load 3D model with enhanced error handling
      const loadingManager = new THREE.LoadingManager();
      loadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
        console.log(`Loading file: ${url}. Loaded ${itemsLoaded}/${itemsTotal} files.`);
      };
      loadingManager.onError = (url) => {
        console.error('Error loading file:', url);
      };
      
      const loader = new GLTFLoader();
      loader.manager = loadingManager; // Correctly set the manager property
      
      loader.load(
        modelUrl,
        (gltf) => {
          console.log('Model loaded successfully:', gltf);
          const model = gltf.scene;
          
          // Calculate bounding box
          const box = new THREE.Box3().setFromObject(model);
          const size = box.getSize(new THREE.Vector3());
          const maxDim = Math.max(size.x, size.y, size.z);
          const scale = 1.5 / maxDim; // Scale to fit within 1.5 units
          
          model.scale.setScalar(scale);
          
          // Center the model
          const center = box.getCenter(new THREE.Vector3());
          model.position.x = -center.x * scale;
          model.position.y = -center.y * scale;
          model.position.z = -center.z * scale;
          
          // Apply initial rotation if needed
          model.rotation.y = isLeft ? 0 : Math.PI;
          
          scene.add(model);
          modelRef.current = model;
        },
        (progress) => {
          const percentComplete = (progress.loaded / progress.total) * 100;
          console.log('Loading progress:', Math.round(percentComplete), '%');
        },
        (error) => {
          console.error('Error loading model:', error);
          // Add fallback cube on error
          const geometry = new THREE.BoxGeometry(1, 1, 1);
          const material = new THREE.MeshPhongMaterial({
            color: isDamaged ? 0xff0000 : 0x9b87f5,
          });
          const cube = new THREE.Mesh(geometry, material);
          scene.add(cube);
          modelRef.current = cube;
        }
      );
    }

    // Animation loop with smoother rotation
    const animate = () => {
      requestAnimationFrame(animate);
      
      if (modelRef.current) {
        modelRef.current.rotation.y += 0.005; // Slower rotation
      }
      
      renderer.render(scene, camera);
    };
    animate();

    // Enhanced window resize handler
    const handleResize = () => {
      if (!containerRef.current) return;
      
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      
      if (cameraRef.current) {
        cameraRef.current.aspect = width / height;
        cameraRef.current.updateProjectionMatrix();
      }
      
      if (rendererRef.current) {
        rendererRef.current.setSize(width, height);
        rendererRef.current.setPixelRatio(window.devicePixelRatio);
      }
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (rendererRef.current) {
        rendererRef.current.dispose();
        containerRef.current?.removeChild(rendererRef.current.domElement);
      }
    };
  }, [modelUrl, isLeft]);

  // Update material color when damaged state changes
  useEffect(() => {
    if (modelRef.current && !modelUrl) {
      const mesh = modelRef.current as THREE.Mesh;
      const material = mesh.material as THREE.MeshPhongMaterial;
      material.color.setHex(isDamaged ? 0xff0000 : 0x9b87f5);
    }
  }, [isDamaged, modelUrl]);

  return (
    <div 
      ref={containerRef} 
      className={`w-full h-full ${isLeft ? 'scale-x-1' : 'scale-x-[-1]'}`}
    />
  );
};
