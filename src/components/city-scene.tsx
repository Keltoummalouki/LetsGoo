"use client";

import { useEffect, useRef } from "react";
import type * as Three from "three";

type District = "coast" | "culture" | "city";

export interface CitySceneProps {
  paused: boolean;
  activeDistrict: District;
  onReady?: () => void;
  onError?: () => void;
}

/** A small, invented Casablanca, built from geometry rather than a model asset. */
export default function CityScene({
  paused,
  activeDistrict,
  onReady,
  onError,
}: CitySceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef({ paused, activeDistrict, onReady, onError });
  const invalidateRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    stateRef.current = { paused, activeDistrict, onReady, onError };
    invalidateRef.current?.();
  }, [paused, activeDistrict, onReady, onError]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let cancelled = false;
    let destroy = () => {};

    void import("three")
      .then((THREE) => {
        if (cancelled) return;
        const scene = new THREE.Scene();
        const world = new THREE.Group();
        scene.add(world);
        const materials = new Set<Three.Material>();
        const geometries = new Set<Three.BufferGeometry>();
        let renderer: Three.WebGLRenderer | undefined;
        let frame = 0;
        const cleanups: (() => void)[] = [];

        destroy = () => {
          cancelAnimationFrame(frame);
          cleanups.forEach((cleanup) => cleanup());
          geometries.forEach((geometry) => geometry.dispose());
          materials.forEach((material) => material.dispose());
          renderer?.dispose();
          renderer?.domElement.remove();
          invalidateRef.current = null;
        };

        try {
          renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
            powerPreference: "low-power",
          });
          renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
          renderer.setClearColor(0x000000, 0);
          renderer.shadowMap.enabled = true;
          renderer.shadowMap.type = THREE.PCFShadowMap;
          renderer.outputColorSpace = THREE.SRGBColorSpace;
          renderer.toneMapping = THREE.ACESFilmicToneMapping;
          renderer.toneMappingExposure = 1.34;
          renderer.domElement.setAttribute("aria-hidden", "true");
          renderer.domElement.style.cssText =
            "width:100%;height:100%;display:block;touch-action:pan-y;cursor:grab";
          container.appendChild(renderer.domElement);

          const camera = new THREE.OrthographicCamera(-9, 9, 7, -7, 0.1, 80);
          camera.position.set(13, 11, 17);
          camera.lookAt(0, 1, 0);
          scene.add(new THREE.HemisphereLight(0xfff8e7, 0x557d72, 3.1));
          const sun = new THREE.DirectionalLight(0xffe7c7, 4.5);
          sun.position.set(-7, 15, 8);
          sun.castShadow = true;
          sun.shadow.mapSize.set(2048, 2048);
          Object.assign(sun.shadow.camera, {
            left: -11,
            right: 11,
            top: 11,
            bottom: -11,
            near: 0.5,
            far: 40,
          });
          sun.shadow.camera.updateProjectionMatrix();
          sun.shadow.normalBias = 0.035;
          sun.shadow.bias = -0.0001;
          sun.shadow.radius = 4;
          scene.add(sun);
          cleanups.push(() => sun.shadow.dispose());
          const fill = new THREE.DirectionalLight(0xd0ece5, 1.3);
          fill.position.set(8, 5, -6);
          scene.add(fill);

          const material = (color: string, roughness = 0.85) => {
            const result = new THREE.MeshStandardMaterial({ color, roughness });
            materials.add(result);
            return result;
          };
          const palette = {
            ivory: material("#f5eddb"),
            white: material("#fffaf0"),
            sand: material("#dcca9f"),
            stone: material("#dfcfaf"),
            road: material("#b9c1b6"),
            teal: material("#2b7d72"),
            water: material("#4b9c96", 0.36),
            foam: material("#b4dad0"),
            dark: material("#315a54"),
            coral: material("#ce7258"),
            peach: material("#e8a58a"),
            green: material("#477b58"),
            leaf: material("#6d9764"),
            wood: material("#a88559"),
            gold: material("#c3a066", 0.4),
          };

          const geometry = <T extends Three.BufferGeometry>(value: T): T => {
            geometries.add(value);
            return value;
          };
          const mesh = (
            shape: Three.BufferGeometry,
            finish: Three.Material,
            x = 0,
            y = 0,
            z = 0,
          ) => {
            const result = new THREE.Mesh(shape, finish);
            result.position.set(x, y, z);
            result.castShadow = true;
            result.receiveShadow = true;
            world.add(result);
            return result;
          };

          // Repeated architectural details share geometry and one draw call per finish.
          const boxGeometry = geometry(new THREE.BoxGeometry(1, 1, 1));
          const batches = new Map<Three.Material, Three.Matrix4[]>();
          const transform = new THREE.Object3D();
          const box = (
            x: number,
            y: number,
            z: number,
            w: number,
            h: number,
            d: number,
            finish: Three.Material,
            angle = 0,
          ) => {
            transform.position.set(x, y, z);
            transform.scale.set(w, h, d);
            transform.rotation.set(0, angle, 0);
            transform.updateMatrix();
            const matrices = batches.get(finish) ?? [];
            matrices.push(transform.matrix.clone());
            batches.set(finish, matrices);
          };
          const outline = (
            points: number[][],
            height: number,
            finish: Three.Material,
            y: number,
            bevel = 0.08,
          ) => {
            const path = new THREE.Shape();
            points.forEach(([x, z], index) => {
              if (index === 0) path.moveTo(x, -z);
              else path.lineTo(x, -z);
            });
            path.closePath();
            const solid = geometry(
              new THREE.ExtrudeGeometry(path, {
                depth: height,
                bevelEnabled: bevel > 0,
                bevelSegments: 3,
                steps: 1,
                bevelSize: bevel,
                bevelThickness: bevel,
                curveSegments: 8,
              }),
            );
            solid.rotateX(-Math.PI / 2);
            return mesh(solid, finish, 0, y, 0);
          };
          const roundedSlab = (
            w: number,
            d: number,
            r: number,
            h: number,
            y: number,
            finish: Three.Material,
          ) => {
            const path = new THREE.Shape();
            const x = -w / 2;
            const z = -d / 2;
            path.moveTo(x + r, z);
            path.lineTo(x + w - r, z);
            path.quadraticCurveTo(x + w, z, x + w, z + r);
            path.lineTo(x + w, z + d - r);
            path.quadraticCurveTo(x + w, z + d, x + w - r, z + d);
            path.lineTo(x + r, z + d);
            path.quadraticCurveTo(x, z + d, x, z + d - r);
            path.lineTo(x, z + r);
            path.quadraticCurveTo(x, z, x + r, z);
            const solid = geometry(
              new THREE.ExtrudeGeometry(path, {
                depth: h,
                bevelEnabled: true,
                bevelSize: 0.12,
                bevelThickness: 0.12,
                bevelSegments: 3,
                steps: 1,
              }),
            );
            solid.rotateX(-Math.PI / 2);
            return mesh(solid, finish, 0, y, 0);
          };

          roundedSlab(14.6, 10, 1.2, 0.48, -0.75, palette.water);
          outline(
            [
              [-6.8, -4.4],
              [6.8, -4.4],
              [6.8, 0.6],
              [5.8, 1.5],
              [4, 1.7],
              [2.6, 1.45],
              [1.4, 2],
              [-0.7, 2.25],
              [-2.7, 1.8],
              [-4.1, 1.3],
              [-6.8, 1.65],
            ],
            0.36,
            palette.sand,
            -0.21,
            0.14,
          );
          outline(
            [
              [-6.65, -4.25],
              [6.65, -4.25],
              [6.65, 0.45],
              [5.7, 1.1],
              [4, 1.25],
              [2.5, 1.02],
              [1.3, 1.55],
              [-0.7, 1.8],
              [-2.7, 1.36],
              [-4.1, 0.85],
              [-6.65, 1.2],
            ],
            0.1,
            palette.ivory,
            0.2,
            0.06,
          );

          // A continuous Corniche with an inland avenue and two deliberate city blocks.
          box(1.65, 0.34, -0.18, 9.8, 0.025, 0.58, palette.road);
          box(1.35, 0.34, -2.6, 0.55, 0.025, 3.2, palette.road);
          for (let x = -2.8; x < 6.5; x += 0.65)
            box(x, 0.36, -0.18, 0.28, 0.015, 0.045, palette.white);
          for (let z = -3.7; z < -0.5; z += 0.6)
            box(1.35, 0.36, z, 0.045, 0.015, 0.26, palette.white);
          for (let i = 0; i < 5; i++)
            box(
              1.35,
              0.36,
              -0.59 - i * 0.13,
              0.48,
              0.015,
              0.065,
              palette.white,
            );

          const building = (
            x: number,
            z: number,
            w: number,
            d: number,
            h: number,
            roof: Three.Material,
            balcony = false,
          ) => {
            const base = 0.34;
            box(x, base + h / 2, z, w, h, d, palette.white);
            box(x, base + h + 0.035, z, w + 0.1, 0.1, d + 0.1, palette.ivory);
            box(x, base + h + 0.09, z, w - 0.15, 0.06, d - 0.15, roof);
            box(
              x,
              base + 0.08,
              z + d / 2 + 0.025,
              w + 0.04,
              0.16,
              0.07,
              palette.stone,
            );
            const floors = Math.max(2, Math.floor(h / 0.43));
            const columns = Math.max(2, Math.floor(w / 0.36));
            for (let floor = 0; floor < floors; floor++) {
              const y = base + 0.27 + floor * ((h - 0.35) / floors);
              for (let col = 0; col < columns; col++) {
                const wx = x - w / 2 + ((col + 0.5) * w) / columns;
                box(wx, y, z + d / 2 + 0.008, 0.12, 0.2, 0.025, palette.dark);
                if (balcony && floor > 0) {
                  box(
                    wx,
                    y - 0.12,
                    z + d / 2 + 0.1,
                    0.25,
                    0.045,
                    0.22,
                    palette.ivory,
                  );
                  box(
                    wx,
                    y - 0.055,
                    z + d / 2 + 0.19,
                    0.25,
                    0.09,
                    0.025,
                    palette.teal,
                  );
                }
              }
              for (let col = 0; col < 2; col++)
                box(
                  x + w / 2 + 0.008,
                  y,
                  z + ((col - 0.5) * d) / 2,
                  0.025,
                  0.2,
                  0.12,
                  palette.dark,
                );
            }
            // Rooftop terraces, parapets and a little stairwell create an inhabited skyline.
            box(x, base + h + 0.18, z - d / 2, w, 0.2, 0.07, palette.ivory);
            box(x - w / 2, base + h + 0.18, z, 0.07, 0.2, d, palette.ivory);
            box(
              x + w * 0.24,
              base + h + 0.23,
              z - d * 0.23,
              w * 0.3,
              0.32,
              d * 0.3,
              palette.ivory,
            );
          };

          building(-5.65, -3.38, 1.15, 1.2, 1.4, palette.coral);
          building(-4.2, -3.35, 1.25, 1.3, 1.8, palette.ivory, true);
          building(-2.65, -3.3, 1.3, 1.35, 1.5, palette.teal);
          building(-1.05, -3.3, 1.45, 1.35, 2.2, palette.ivory, true);
          building(0.25, -3.25, 0.65, 1.25, 1.5, palette.peach);
          building(2.6, -3.2, 1.6, 1.4, 2.05, palette.ivory, true);
          building(4.45, -3.25, 1.5, 1.3, 2.7, palette.coral, true);
          building(5.9, -3.25, 0.8, 1.3, 1.75, palette.ivory);
          building(-1.35, -1.4, 1.6, 0.95, 1.15, palette.coral, true);
          building(0.25, -1.4, 0.8, 0.95, 1.55, palette.teal);
          building(2.6, -1.45, 1.55, 1.05, 1.3, palette.coral, true);
          building(4.4, -1.45, 1.45, 1.05, 1.6, palette.ivory, true);
          building(5.9, -1.45, 0.85, 1.05, 1.1, palette.teal);

          // Seafront mosque: square minaret, glazed crown, prayer hall and arcaded court.
          box(-4.55, 0.38, -0.65, 3.25, 0.12, 2.7, palette.stone);
          box(-4.35, 0.47, -0.7, 2.7, 0.06, 2.2, palette.ivory);
          box(-4.55, 0.94, -1.25, 2.6, 1.05, 1.15, palette.white);
          box(-4.55, 1.5, -1.25, 2.8, 0.13, 1.3, palette.stone);
          const hallRoof = mesh(
            geometry(new THREE.CylinderGeometry(0.01, 1, 0.46, 4)),
            palette.teal,
            -4.55,
            1.76,
            -1.25,
          );
          hallRoof.scale.set(1.65, 1, 0.78);
          hallRoof.rotation.y = Math.PI / 4;
          const dome = mesh(
            geometry(
              new THREE.SphereGeometry(
                0.48,
                24,
                16,
                0,
                Math.PI * 2,
                0,
                Math.PI / 2,
              ),
            ),
            palette.ivory,
            -4.6,
            1.65,
            -1.25,
          );
          dome.scale.y = 0.8;

          const archGeometry = geometry(
            new THREE.TorusGeometry(0.13, 0.034, 5, 12, Math.PI),
          );
          for (let i = 0; i < 7; i++) {
            const x = -5.7 + i * 0.38;
            box(x, 0.91, -0.661, 0.21, 0.52, 0.025, palette.dark);
            mesh(archGeometry, palette.stone, x, 1.17, -0.63);
            box(x - 0.14, 0.88, -0.62, 0.055, 0.58, 0.09, palette.stone);
          }
          // Court tiles and a small reflecting fountain.
          for (let i = 0; i < 7; i++)
            for (let j = 0; j < 3; j++)
              box(
                -5.55 + i * 0.36,
                0.51,
                -0.26 + j * 0.32,
                0.29,
                0.012,
                0.25,
                (i + j) % 2 ? palette.ivory : palette.sand,
              );
          mesh(
            geometry(new THREE.CylinderGeometry(0.27, 0.31, 0.1, 12)),
            palette.stone,
            -4.4,
            0.57,
            0.15,
          );
          mesh(
            geometry(new THREE.CylinderGeometry(0.22, 0.22, 0.025, 24)),
            palette.water,
            -4.4,
            0.63,
            0.15,
          );

          const mx = -3.2,
            mz = -0.75;
          box(mx, 2.45, mz, 0.72, 4.1, 0.72, palette.ivory);
          box(mx, 0.61, mz, 0.93, 0.38, 0.93, palette.stone);
          box(mx, 4.26, mz, 0.8, 0.13, 0.8, palette.stone);
          box(mx, 4.47, mz, 0.78, 0.3, 0.78, palette.teal);
          box(mx, 4.65, mz, 0.9, 0.09, 0.9, palette.ivory);
          box(mx, 4.86, mz, 0.44, 0.34, 0.44, palette.ivory);
          const crown = mesh(
            geometry(new THREE.CylinderGeometry(0, 0.37, 0.35, 4)),
            palette.teal,
            mx,
            5.19,
            mz,
          );
          crown.rotation.y = Math.PI / 4;
          mesh(
            geometry(new THREE.CylinderGeometry(0.018, 0.022, 0.38, 8)),
            palette.gold,
            mx,
            5.49,
            mz,
          );
          mesh(
            geometry(new THREE.SphereGeometry(0.055, 10, 8)),
            palette.gold,
            mx,
            5.7,
            mz,
          );
          for (let row = 0; row < 4; row++) {
            const y = 1.1 + row * 0.72;
            box(mx, y, mz + 0.365, 0.27, 0.49, 0.025, palette.sand);
            box(mx, y, mz + 0.385, 0.13, 0.36, 0.025, palette.teal);
            box(mx + 0.365, y, mz, 0.025, 0.49, 0.27, palette.sand);
            box(mx + 0.385, y, mz, 0.025, 0.36, 0.13, palette.teal);
            mesh(archGeometry, palette.ivory, mx, y + 0.16, mz + 0.41);
          }
          for (let i = 0; i < 5; i++) {
            box(
              mx - 0.3 + i * 0.15,
              4.48,
              mz + 0.4,
              0.045,
              0.22,
              0.025,
              palette.gold,
            );
            box(
              mx + 0.4,
              4.48,
              mz - 0.3 + i * 0.15,
              0.025,
              0.22,
              0.045,
              palette.gold,
            );
          }

          // Palm leaves are sculpted, curved strips rather than cones.
          const leafShape = geometry(new THREE.BufferGeometry());
          leafShape.setAttribute(
            "position",
            new THREE.Float32BufferAttribute(
              [
                0, 0, 0, 0.35, 0.14, -0.1, 0.35, 0.14, 0.1, 0.35, 0.14, -0.1,
                0.7, 0.08, -0.075, 0.35, 0.14, 0.1, 0.35, 0.14, 0.1, 0.7, 0.08,
                -0.075, 0.7, 0.08, 0.075, 0.7, 0.08, -0.075, 0.95, -0.14, 0,
                0.7, 0.08, 0.075,
              ],
              3,
            ),
          );
          leafShape.computeVertexNormals();
          palette.leaf.side = THREE.DoubleSide;
          palette.green.side = THREE.DoubleSide;
          const trunkGeometry = geometry(
            new THREE.CylinderGeometry(0.035, 0.065, 1, 7),
          );
          const palm = (x: number, z: number, height = 1.25) => {
            const trunk = mesh(
              trunkGeometry,
              palette.wood,
              x,
              0.35 + height / 2,
              z,
            );
            trunk.scale.y = height;
            for (let i = 0; i < 7; i++) {
              const leaf = mesh(
                leafShape,
                i % 2 ? palette.leaf : palette.green,
                x,
                0.35 + height,
                z,
              );
              leaf.rotation.y = (i * Math.PI * 2) / 7;
              leaf.scale.setScalar(0.76);
            }
          };
          [
            [-6, 0.65],
            [-2.25, 0.55],
            [-0.7, 1.3],
            [1.25, 0.95],
            [3.05, 0.65],
            [4.8, 0.75],
            [6.1, 0.45],
            [-6.2, -2.2],
            [1.8, -2.25],
          ].forEach(([x, z], i) => palm(x, z, 1.1 + (i % 3) * 0.14));

          // The beach and its striped parasols, boardwalk, benches and small sailboat.
          const parasolGeometry = geometry(
            new THREE.ConeGeometry(0.38, 0.16, 10, 1, true),
          );
          [
            [-0.5, 2],
            [0.55, 1.85],
            [3.5, 1.38],
            [4.65, 1.4],
          ].forEach(([x, z], i) => {
            mesh(
              geometry(new THREE.CylinderGeometry(0.018, 0.018, 0.57, 6)),
              palette.wood,
              x,
              0.49,
              z,
            );
            mesh(
              parasolGeometry,
              i % 2 ? palette.ivory : palette.coral,
              x,
              0.82,
              z,
            );
            box(
              x + 0.12,
              0.27,
              z + 0.33,
              0.2,
              0.055,
              0.42,
              i % 2 ? palette.teal : palette.ivory,
              -0.1,
            );
          });
          for (let i = 0; i < 7; i++)
            box(5.65, -0.04, 2 + i * 0.28, 0.75, 0.12, 0.23, palette.wood);
          for (let i = 0; i < 3; i++) {
            box(5.32, -0.32, 2.15 + i * 0.7, 0.07, 0.6, 0.07, palette.wood);
            box(5.98, -0.32, 2.15 + i * 0.7, 0.07, 0.6, 0.07, palette.wood);
          }
          [-1.5, 2.2, 4].forEach((x) => {
            box(x, 0.53, 0.72, 0.48, 0.09, 0.18, palette.wood);
            box(x, 0.66, 0.64, 0.48, 0.2, 0.045, palette.wood);
            box(x - 0.16, 0.42, 0.72, 0.035, 0.23, 0.13, palette.dark);
            box(x + 0.16, 0.42, 0.72, 0.035, 0.23, 0.13, palette.dark);
          });
          const boat = new THREE.Group();
          world.add(boat);
          boat.position.set(2.4, -0.06, 3.5);
          boat.rotation.y = -0.4;
          const hull = new THREE.Mesh(
            geometry(new THREE.SphereGeometry(0.5, 16, 8)),
            palette.ivory,
          );
          hull.scale.set(0.36, 0.2, 1);
          boat.add(hull);
          const mast = new THREE.Mesh(
            geometry(new THREE.CylinderGeometry(0.014, 0.014, 1.1, 6)),
            palette.wood,
          );
          mast.position.y = 0.53;
          boat.add(mast);
          const sailGeometry = geometry(new THREE.BufferGeometry());
          sailGeometry.setAttribute(
            "position",
            new THREE.Float32BufferAttribute(
              [0, 1.05, 0, 0, 0.18, 0, 0, 0.18, 0.49],
              3,
            ),
          );
          sailGeometry.computeVertexNormals();
          const sailMaterial = material("#fff5df");
          sailMaterial.side = THREE.DoubleSide;
          boat.add(new THREE.Mesh(sailGeometry, sailMaterial));

          // Tiny cars give scale without turning the coast into a traffic scene.
          [
            [-1.1, palette.coral],
            [3.3, palette.teal],
            [5.5, palette.ivory],
          ].forEach(([x, finish]) => {
            const cx = x as number;
            box(cx, 0.46, -0.18, 0.47, 0.16, 0.23, finish as Three.Material);
            box(cx, 0.58, -0.18, 0.25, 0.12, 0.21, palette.dark);
            for (const side of [-1, 1])
              for (const end of [-1, 1])
                box(
                  cx + end * 0.15,
                  0.39,
                  -0.18 + side * 0.12,
                  0.09,
                  0.09,
                  0.035,
                  palette.dark,
                );
          });

          const rippleGeometry = geometry(
            new THREE.TorusGeometry(1, 0.013, 4, 48, Math.PI * 0.7),
          );
          const ripples: Three.Mesh[] = [];
          for (let i = 0; i < 8; i++) {
            const wave = mesh(
              rippleGeometry,
              palette.foam,
              -5.7 + i * 1.5,
              -0.135,
              3.05 + (i % 3) * 0.43,
            );
            wave.rotation.x = -Math.PI / 2;
            wave.rotation.z = -0.7;
            wave.scale.set(0.5 + (i % 2) * 0.2, 0.23, 1);
            wave.castShadow = false;
            ripples.push(wave);
          }
          for (const [finish, matrices] of batches) {
            const instances = new THREE.InstancedMesh(
              boxGeometry,
              finish,
              matrices.length,
            );
            matrices.forEach((matrix, index) =>
              instances.setMatrixAt(index, matrix),
            );
            instances.castShadow = true;
            instances.receiveShadow = true;
            instances.computeBoundingSphere();
            world.add(instances);
            cleanups.push(() => instances.dispose());
          }

          const shadowMaterial = new THREE.ShadowMaterial({
            color: 0x3a695a,
            opacity: 0.14,
          });
          materials.add(shadowMaterial);
          const ground = new THREE.Mesh(
            geometry(new THREE.PlaneGeometry(70, 70)),
            shadowMaterial,
          );
          ground.rotation.x = -Math.PI / 2;
          ground.position.y = -1.15;
          ground.receiveShadow = true;
          scene.add(ground);

          const canvas = renderer.domElement;
          const motionQuery = window.matchMedia(
            "(prefers-reduced-motion: reduce)",
          );
          const fineQuery = window.matchMedia(
            "(hover: hover) and (pointer: fine)",
          );
          let inView = true;
          let reduced = motionQuery.matches;
          let dragging = false;
          let lastX = 0;
          let dragRotation = 0;
          let pointerX = 0;
          let pointerY = 0;
          let previousTime = 0;
          let elapsed = 0;
          let currentYaw = -0.1;
          let currentTilt = 0;
          let currentFloat = 0;
          let firstFrame = true;
          const districtAngles: Record<District, number> = {
            coast: -0.1,
            culture: 0.12,
            city: -0.3,
          };

          const render = (time: number) => {
            frame = 0;
            if (cancelled || !inView || document.hidden || !renderer) return;
            const delta = Math.min((time - previousTime) / 1000 || 0.016, 0.05);
            previousTime = time;
            const moving = !stateRef.current.paused && !reduced;
            if (moving) elapsed += delta;
            const yaw =
              districtAngles[stateRef.current.activeDistrict] +
              dragRotation +
              (moving
                ? Math.sin(elapsed * 0.28) * 0.018 + pointerX * 0.025
                : 0);
            const tilt = moving ? pointerY * 0.012 : 0;
            const float = moving ? Math.sin(elapsed * 0.8) * 0.035 : 0;
            const blend = reduced ? 1 : 1 - Math.exp(-delta * 6);
            currentYaw += (yaw - currentYaw) * blend;
            currentTilt += (tilt - currentTilt) * blend;
            currentFloat += (float - currentFloat) * blend;
            world.rotation.set(currentTilt, currentYaw, 0);
            world.position.y = currentFloat;
            if (moving) {
              boat.rotation.z = Math.sin(elapsed * 1.3) * 0.035;
              boat.position.y = -0.06 + Math.sin(elapsed * 1.2) * 0.025;
              ripples.forEach(
                (wave, index) =>
                  (wave.position.y =
                    -0.135 + Math.sin(elapsed + index) * 0.008),
              );
            }
            renderer.render(scene, camera);
            if (firstFrame) {
              firstFrame = false;
              stateRef.current.onReady?.();
            }
            if (
              moving ||
              Math.abs(yaw - currentYaw) > 0.0001 ||
              Math.abs(tilt - currentTilt) > 0.0001 ||
              Math.abs(float - currentFloat) > 0.0001
            )
              frame = requestAnimationFrame(render);
          };
          const invalidate = () => {
            if (!frame && !cancelled && inView && !document.hidden)
              frame = requestAnimationFrame(render);
          };
          invalidateRef.current = invalidate;
          const resize = () => {
            const width = container.clientWidth;
            const height = container.clientHeight;
            if (!width || !height || !renderer) return;
            const aspect = width / height;
            const halfHeight = Math.max(5.7, 9.3 / aspect);
            camera.left = -halfHeight * aspect;
            camera.right = halfHeight * aspect;
            camera.top = halfHeight;
            camera.bottom = -halfHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height, false);
            invalidate();
          };
          const resizeObserver = new ResizeObserver(resize);
          resizeObserver.observe(container);
          cleanups.push(() => resizeObserver.disconnect());
          const visibilityObserver = new IntersectionObserver(
            ([entry]) => {
              inView = entry.isIntersecting;
              if (inView) {
                previousTime = performance.now();
                invalidate();
              } else {
                cancelAnimationFrame(frame);
                frame = 0;
              }
            },
            { rootMargin: "80px" },
          );
          visibilityObserver.observe(container);
          cleanups.push(() => visibilityObserver.disconnect());
          const onVisibility = () => {
            if (document.hidden) {
              cancelAnimationFrame(frame);
              frame = 0;
            } else {
              previousTime = performance.now();
              invalidate();
            }
          };
          const onMotion = () => {
            reduced = motionQuery.matches;
            invalidate();
          };
          const onDown = (event: PointerEvent) => {
            if (event.button !== 0) return;
            dragging = true;
            lastX = event.clientX;
            canvas.setPointerCapture(event.pointerId);
            canvas.style.cursor = "grabbing";
          };
          const onMove = (event: PointerEvent) => {
            if (dragging) {
              dragRotation = THREE.MathUtils.clamp(
                dragRotation + (event.clientX - lastX) * 0.004,
                -0.42,
                0.42,
              );
              lastX = event.clientX;
              invalidate();
            } else if (fineQuery.matches && !reduced) {
              const bounds = canvas.getBoundingClientRect();
              pointerX = (event.clientX - bounds.left) / bounds.width - 0.5;
              pointerY = (event.clientY - bounds.top) / bounds.height - 0.5;
              invalidate();
            }
          };
          const onUp = () => {
            dragging = false;
            canvas.style.cursor = "grab";
          };
          const onLeave = () => {
            pointerX = 0;
            pointerY = 0;
            invalidate();
          };
          const onContextLost = (event: Event) => {
            event.preventDefault();
            cancelAnimationFrame(frame);
            frame = 0;
            stateRef.current.onError?.();
          };
          document.addEventListener("visibilitychange", onVisibility);
          motionQuery.addEventListener("change", onMotion);
          canvas.addEventListener("pointerdown", onDown);
          canvas.addEventListener("pointermove", onMove);
          canvas.addEventListener("pointerup", onUp);
          canvas.addEventListener("pointercancel", onUp);
          canvas.addEventListener("lostpointercapture", onUp);
          canvas.addEventListener("pointerleave", onLeave);
          canvas.addEventListener("webglcontextlost", onContextLost);
          cleanups.push(() => {
            document.removeEventListener("visibilitychange", onVisibility);
            motionQuery.removeEventListener("change", onMotion);
            canvas.removeEventListener("pointerdown", onDown);
            canvas.removeEventListener("pointermove", onMove);
            canvas.removeEventListener("pointerup", onUp);
            canvas.removeEventListener("pointercancel", onUp);
            canvas.removeEventListener("lostpointercapture", onUp);
            canvas.removeEventListener("pointerleave", onLeave);
            canvas.removeEventListener("webglcontextlost", onContextLost);
          });
          resize();
        } catch {
          destroy();
          if (!cancelled) stateRef.current.onError?.();
        }
      })
      .catch(() => {
        if (!cancelled) stateRef.current.onError?.();
      });

    return () => {
      cancelled = true;
      destroy();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="city-scene"
      aria-hidden="true"
      style={{ width: "100%", height: "100%" }}
    />
  );
}
