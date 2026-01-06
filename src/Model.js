import { useGLTF } from "@react-three/drei";
import { useEffect, useRef, useState, useMemo } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";
import * as THREE from "three";

const CreationOfAdam = () => {
  const meshRef = useRef();
  const targetOffsetRef = useRef({ x: 0, y: 0 });
  const currentOffsetRef = useRef({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const hoverProgressRef = useRef(0);
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());
  const targetRotationZ = useRef(0);
  const currentRotationZ = useRef(0);

  const { scene } = useGLTF("/creation-of-adam.glb");

  useEffect(() => {
    meshRef.current.position.set(2.25, -2, 0);
    meshRef.current.rotation.y = -Math.PI / 2;
    meshRef.current.scale.setScalar(4);

    // Track mouse movement for follow animation and raycasting
    const handleMouseMove = (event) => {
      // Normalize mouse position to -1 to 1 range (center is 0,0)
      const x = (event.clientX / window.innerWidth) * 2 - 1;
      const y = -(event.clientY / window.innerHeight) * 2 + 1;

      // Calculate target offset with max range limit
      const maxRange = 0.1; // Maximum movement distance
      const distance = Math.sqrt(x * x + y * y);

      // Clamp distance to 1 (max normalized distance) to limit movement range
      const clampedDistance = Math.min(distance, 0.5);

      if (distance > 0) {
        // Normalize direction and apply clamped distance
        const normalizedX = x / distance;
        const normalizedY = y / distance;
        targetOffsetRef.current.x = normalizedX * clampedDistance * maxRange;
        targetOffsetRef.current.y = normalizedY * clampedDistance * maxRange;
      } else {
        targetOffsetRef.current.x = 0;
        targetOffsetRef.current.y = 0;
      }

      // Update mouse vector for raycasting
      mouse.current.x = x;
      mouse.current.y = y;

      // Calculate target z-axis rotation based on mouse x position
      const maxRotation = Math.PI / 18; // ~10 degrees max rotation (more subtle)
      targetRotationZ.current = -x * maxRotation; // Inverted direction (not downwards)
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Smoothly interpolate to target offset and handle hover
  useFrame((state, delta) => {
    if (!meshRef.current) return;

    // Subtle idle animation - gentle floating motion
    const time = state.clock.elapsedTime;
    const idleX = Math.sin(time * 0.1) * 0.05; // Slow horizontal float
    const idleY = Math.cos(time * 0.1) * 0.05; // Slow vertical float (slightly different frequency)

    // Check for hover using raycasting
    raycaster.current.setFromCamera(mouse.current, state.camera);
    const intersects = raycaster.current.intersectObject(meshRef.current, true);
    const hovered = intersects.length > 0;

    if (hovered !== isHovered) {
      setIsHovered(hovered);
    }

    // Animate hover progress (0 to 1)
    const targetHover = hovered ? 1 : 0;
    hoverProgressRef.current += (targetHover - hoverProgressRef.current) * 0.1;

    // Smooth interpolation factor for mouse follow (lower = smoother, slower)
    const lerpFactor = 0.05;

    // Interpolate current offset towards target
    currentOffsetRef.current.x +=
      (targetOffsetRef.current.x - currentOffsetRef.current.x) * lerpFactor;
    currentOffsetRef.current.y +=
      (targetOffsetRef.current.y - currentOffsetRef.current.y) * lerpFactor;

    // Calculate hover offset (hands drift apart - move model slightly left/right)
    const hoverOffset = hoverProgressRef.current * 0.3; // Max drift distance
    const leftHandOffset = -hoverOffset * 0.5; // Left hand moves left
    const rightHandOffset = hoverOffset * 0.5; // Right hand moves right

    // Apply idle animation + mouse follow + hover offsets
    meshRef.current.position.x =
      2.25 +
      idleX +
      currentOffsetRef.current.x +
      (leftHandOffset + rightHandOffset) / 2;
    meshRef.current.position.y = -2 + idleY + currentOffsetRef.current.y;

    // Smoothly interpolate z-axis rotation based on mouse movement
    currentRotationZ.current +=
      (targetRotationZ.current - currentRotationZ.current) * lerpFactor;
    meshRef.current.rotation.z = currentRotationZ.current;
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
