
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

    // Setup camera with a wider field of view
    const camera = new THREE.PerspectiveCamera(
      50, // Reduced FOV for better perspective
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 3; // Moved camera closer
    camera.position.y = 0.5; // Slight upward angle
    cameraRef.current = camera;

    // Setup renderer with transparency
    const renderer = new THREE.WebGLRenderer({ 
      alpha: true,
      antialias: true // Added antialiasing for smoother edges
    });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setClearColor(0x000000, 0);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

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
      // Load 3D model with proper scaling and positioning
      const loader = new GLTFLoader();
      loader.load(modelUrl, (gltf) => {
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
        
        scene.add(model);
        modelRef.current = model;
      });
    }

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      
      if (modelRef.current) {
        modelRef.current.rotation.y += 0.01;
      }
      
      renderer.render(scene, camera);
    };
    animate();

    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current) return;
      
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      containerRef.current?.removeChild(renderer.domElement);
    };
  }, [modelUrl]);

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
