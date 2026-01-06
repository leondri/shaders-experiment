import { OrthographicCamera } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { EffectComposer, wrapEffect } from "@react-three/postprocessing";
import { Leva } from "leva";
import { Effect } from "postprocessing";
import { Suspense, useRef } from "react";
import * as THREE from "three";

import fragmentShader from "./fragmentShader.js";
import { CreationOfAdam } from "./Model";
import "./scene.css";

class CustomDotsEffectImpl extends Effect {
  constructor({ pixelSize = 1.0 }) {
    const uniforms = new Map([["pixelSize", new THREE.Uniform(pixelSize)]]);

    super("CustomDotsEffect", fragmentShader, {
      uniforms,
    });

    this.uniforms = uniforms;
  }

  update(_renderer, _inputBuffer, _deltaTime) {
    this.uniforms.get("pixelSize").value = this.pixelSize;
  }
}

const CustomDotsEffect = wrapEffect(CustomDotsEffectImpl);

export const DotsEffect = () => {
  const effectRef = useRef();
  const pixelSize = 10.0;

  useFrame(() => {
    if (effectRef.current) {
      effectRef.current.pixelSize = pixelSize;
    }
  });

  return (
    <EffectComposer>
      <CustomDotsEffect ref={effectRef} pixelSize={pixelSize} />
    </EffectComposer>
  );
};

const Dots = () => {
  const fixedZoom = 275;

  useFrame((state) => {
    const camera = state.camera;
    camera.lookAt(0, 0, 0);
    camera.zoom = fixedZoom;
    camera.updateProjectionMatrix();
  });

  return (
    <>
      <OrthographicCamera
        makeDefault
        position={[-0, 0, -5]}
        zoom={fixedZoom}
        near={0.01}
        far={500}
      />
      <CreationOfAdam />
      <DotsEffect />
    </>
  );
};

const Scene = () => {
  return (
    <>
      <Canvas
        shadows
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: true }}
        style={{ background: "transparent" }}
      >
        <Suspense>
          <ambientLight intensity={0.55} />
          <directionalLight position={[5, 10, 0]} intensity={10.0} />
          <Dots />
        </Suspense>
      </Canvas>
      <Leva collapsed />
    </>
  );
};

export { Scene };
