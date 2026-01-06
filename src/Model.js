import { useGLTF } from "@react-three/drei";
import { useEffect, useRef, useMemo } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";
import * as THREE from "three";

const CreationOfAdam = () => {
  const meshRef = useRef();

  const { scene } = useGLTF("/creation-of-adam.glb");

  useEffect(() => {
    meshRef.current.position.set(2.25, -2, 0);
    meshRef.current.rotation.y = -Math.PI / 2;
    meshRef.current.scale.setScalar(4);
  }, []);

  // Subtle idle animation - gentle floating motion
  useFrame((state) => {
    if (!meshRef.current) return;

    const time = state.clock.elapsedTime;
    const idleX = Math.sin(time * 0.1) * 0.05; // Slow horizontal float
    const idleY = Math.cos(time * 0.1) * 0.05; // Slow vertical float (slightly different frequency)

    // Apply idle animation
    meshRef.current.position.x = 2.25 + idleX;
    meshRef.current.position.y = -2 + idleY;
  });

  return (
    <group ref={meshRef}>
      <primitive object={scene} />
    </group>
  );
};

const Book = () => {
  const meshRef = useRef();
  const { scene } = useGLTF("/book.glb");

  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.position.set(0, 0, 0);
      meshRef.current.rotation.y = 0;
      meshRef.current.rotation.z = Math.PI / 4; // Rotate on z-axis to show the cover
      meshRef.current.scale.setScalar(1); // Increased scale significantly
    }
  }, []);

  useFrame(() => {
    if (meshRef.current) {
      // Rotate the book horizontally around Y axis
      meshRef.current.rotation.y += 0.005;
    }
  });

  return (
    <group ref={meshRef}>
      <primitive object={scene} />
    </group>
  );
};

const Rocket = () => {
  const meshRef = useRef();
  const stlGeometry = useLoader(STLLoader, "/toy_rocket.stl");

  // Compute normals for proper lighting and center geometry
  const processedGeometry = useMemo(() => {
    if (!stlGeometry) return null;
    const geo = stlGeometry.clone();
    geo.computeVertexNormals();
    // Center the geometry
    geo.computeBoundingBox();
    const center = new THREE.Vector3();
    geo.boundingBox.getCenter(center);
    geo.translate(-center.x, -center.y, -center.z);
    return geo;
  }, [stlGeometry]);

  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.position.set(0, 0, 0);
      meshRef.current.rotation.y = Math.PI / 2; // Initial rotation
      meshRef.current.scale.setScalar(30); // Increased scale for testing
    }
  }, []);

  useFrame(() => {
    if (meshRef.current) {
      // Rotate the rocket around its own Z axis (its length axis)
      meshRef.current.rotation.z += 0.001;
    }
  });

  if (!processedGeometry) return null;

  return (
    <group ref={meshRef}>
      <mesh geometry={processedGeometry}>
        <meshStandardMaterial color="#ffffff" />
      </mesh>
    </group>
  );
};

export { CreationOfAdam, Book, Rocket };
