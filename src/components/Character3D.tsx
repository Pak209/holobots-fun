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

    // Setup camera
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 5;
    cameraRef.current = camera;

    // Setup renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setClearColor(0x000000, 0);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // Load default cube if no model provided
    if (!modelUrl) {
      const geometry = new THREE.BoxGeometry(2, 2, 2);
      const material = new THREE.MeshPhongMaterial({
        color: isDamaged ? 0xff0000 : 0x9b87f5,
      });
      const cube = new THREE.Mesh(geometry, material);
      scene.add(cube);
      modelRef.current = cube;
    } else {
      // Load 3D model
      const loader = new GLTFLoader();
      loader.load(modelUrl, (gltf) => {
        scene.add(gltf.scene);
        modelRef.current = gltf.scene;
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

    // Cleanup
    return () => {
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
      className={`w-16 h-16 ${isLeft ? 'scale-x-1' : 'scale-x-[-1]'}`}
    />
  );
};