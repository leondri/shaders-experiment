import { OrthographicCamera } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { EffectComposer, wrapEffect } from "@react-three/postprocessing";
import { Leva, useControls, folder } from "leva";
import { Effect } from "postprocessing";
import { Suspense, useRef } from "react";
import * as THREE from "three";
import fragmentShader from "./fragmentShader.js";
import { Book } from "./Model";
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

  const { pixelSize } = useControls({
    Effect: folder({
      pixelSize: {
        value: 10.0,
        min: 8.0,
        max: 32.0,
        step: 2.0,
      },
    }),
  });

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

const Dots2 = () => {
  const fixedZoom = 1500;

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
      <Book />
      <DotsEffect />
    </>
  );
};

export const Scene2 = () => {
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
          <Dots2 />
        </Suspense>
      </Canvas>
      <Leva collapsed />
    </>
  );
};
