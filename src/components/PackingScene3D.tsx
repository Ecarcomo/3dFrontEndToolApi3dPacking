import { Canvas } from "@react-three/fiber";
import { Billboard, Grid, Line, OrbitControls, Text } from "@react-three/drei";
import type { BauleraInput, PackResponse, PackedItem } from "../types/packing";
import { packedItemMeshCenter } from "../types/packing";

interface SceneProps {
  container: BauleraInput;
  fittedItems: PackedItem[];
}

/** Un hue por cada nombre distinto (orden de primera aparición); mismo `name` → mismo color. */
function hueByNameMap(items: PackedItem[]): Map<string, number> {
  const map = new Map<string, number>();
  let n = 0;
  for (const item of items) {
    if (!map.has(item.name)) {
      map.set(item.name, (n * 53) % 360);
      n += 1;
    }
  }
  return map;
}

function formatMeters(value: number): string {
  return `${value.toFixed(2)} m`;
}

/** Cotas del contenedor: ancho y profundo en el plano del piso (y≈0), alto en arista vertical. */
function ContainerDimensions({ w, h, d, maxDim }: { w: number; h: number; d: number; maxDim: number }) {
  const pad = Math.max(maxDim * 0.1, 0.06);
  const fs = Math.max(maxDim * 0.07, 0.07);
  const yLine = 0.02;

  return (
    <group>
      <Line
        points={[
          [0, yLine, 0],
          [w, yLine, 0],
        ]}
        color="#7a8694"
        lineWidth={1.2}
      />
      <Billboard position={[w / 2, pad * 0.85, -pad]} follow>
        <Text fontSize={fs} color="#d8dee6" anchorX="center" anchorY="middle">
          {`ANCHO\n${formatMeters(w)}`}
        </Text>
      </Billboard>

      <Line
        points={[
          [0, yLine, 0],
          [0, yLine, d],
        ]}
        color="#7a8694"
        lineWidth={1.2}
      />
      <Billboard position={[-pad, pad * 0.85, d / 2]} follow>
        <Text fontSize={fs} color="#d8dee6" anchorX="center" anchorY="middle">
          {`PROFUNDO\n${formatMeters(d)}`}
        </Text>
      </Billboard>

      <Line
        points={[
          [0, 0, 0],
          [0, h, 0],
        ]}
        color="#7a8694"
        lineWidth={1.2}
      />
      <Billboard position={[-pad, h / 2, -pad * 0.35]} follow>
        <Text fontSize={fs} color="#d8dee6" anchorX="center" anchorY="middle">
          {`ALTO\n${formatMeters(h)}`}
        </Text>
      </Billboard>

      {/* Frente: plano Z = profundidad (z = d). Texto en el piso hacia +Z. */}
      <Billboard position={[w / 2, pad * 0.85, d + pad]} follow>
        <Text
          fontSize={Math.max(fs * 1.1, 0.09)}
          color="#e8c170"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.03}
          outlineColor="#0d0f12"
        >
          FRENTE CONTENEDOR
        </Text>
      </Billboard>
    </group>
  );
}

function Scene({ container, fittedItems }: SceneProps) {
  const w = container.width;
  const h = container.height;
  const d = container.depth;
  const maxDim = Math.max(w, h, d, 0.1);
  const cx = w / 2;
  const cy = h / 2;
  const cz = d / 2;

  const gridCell = Math.max(maxDim / 24, 0.08);
  const gridSection = Math.max(maxDim / 5, 0.35);
  const nameHue = hueByNameMap(fittedItems);
  /** Cada eje mide ~15% más que el mayor lado del contenedor (w, h, d). */
  const axesSize = maxDim * 1.15;
  const axisLabelPad = Math.max(maxDim * 0.04, 0.04);
  const axisLabelFs = Math.max(maxDim * 0.11, 0.09);

  return (
    <>
      <color attach="background" args={["#14161a"]} />
      <ambientLight intensity={0.55} />
      <directionalLight position={[maxDim * 2, maxDim * 3, maxDim * 2]} intensity={1} />
      {/* X rojo, Y verde, Z azul (convención Three.js) + letras en los extremos */}
      <group position={[0, 0, 0]}>
        <axesHelper args={[axesSize]} />
        <Billboard position={[axesSize + axisLabelPad, 0, 0]} follow>
          <Text
            fontSize={axisLabelFs}
            color="#ff6b6b"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.025}
            outlineColor="#0d0f12"
          >
            X
          </Text>
        </Billboard>
        <Billboard position={[0, axesSize + axisLabelPad, 0]} follow>
          <Text
            fontSize={axisLabelFs}
            color="#8ce99a"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.025}
            outlineColor="#0d0f12"
          >
            Y
          </Text>
        </Billboard>
        <Billboard position={[0, 0, axesSize + axisLabelPad]} follow>
          <Text
            fontSize={axisLabelFs}
            color="#74c0fc"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.025}
            outlineColor="#0d0f12"
          >
            Z
          </Text>
        </Billboard>
      </group>
      <Grid
        position={[cx, -0.02, cz]}
        args={[maxDim * 6, maxDim * 6]}
        cellSize={gridCell}
        cellThickness={0.4}
        cellColor="#3d4249"
        sectionSize={gridSection}
        sectionThickness={0.6}
        sectionColor="#525a63"
        fadeDistance={maxDim * 10}
        fadeStrength={1.1}
        followCamera={false}
        infiniteGrid
      />
      <ContainerDimensions w={w} h={h} d={d} maxDim={maxDim} />
      <mesh position={[cx, cy, cz]}>
        <boxGeometry args={[w, h, d]} />
        <meshBasicMaterial color="#5ad1ff" wireframe />
      </mesh>
      {fittedItems.map((item, i) => {
        const [px, py, pz] = packedItemMeshCenter(item);
        const { width, height, depth } = item.dimensions;
        const hue = nameHue.get(item.name) ?? 0;
        return (
          <mesh key={`${item.name}-${i}`} position={[px, py, pz]}>
            <boxGeometry args={[width, height, depth]} />
            <meshStandardMaterial
              color={`hsl(${hue}, 65%, 52%)`}
              metalness={0.12}
              roughness={0.68}
            />
          </mesh>
        );
      })}
      <OrbitControls makeDefault target={[cx, cy, cz]} />
    </>
  );
}

interface PackingScene3DProps {
  requestContainer: BauleraInput | null;
  packResponse: PackResponse | null;
  /** Altura del área del canvas (px, %, vh, etc.). Por defecto 360. */
  canvasHeight?: number | string;
  className?: string;
}

export function PackingScene3D({
  requestContainer,
  packResponse,
  canvasHeight = 360,
  className,
}: PackingScene3DProps) {
  const sizeStyle =
    typeof canvasHeight === "number" ? `${canvasHeight}px` : canvasHeight;

  if (!requestContainer || !packResponse) {
    return (
      <div
        className={className ? `packing-scene-placeholder ${className}` : "packing-scene-placeholder"}
        style={{
          height: sizeStyle,
          minHeight: typeof canvasHeight === "number" ? canvasHeight : 200,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "1px solid #2a2e34",
          borderRadius: 4,
          background: "#14161a",
          color: "#9aa3ad",
        }}
      >
        Calculá el espacio para ver la vista 3D.
      </div>
    );
  }

  const w = requestContainer.width;
  const h = requestContainer.height;
  const d = requestContainer.depth;
  const maxDim = Math.max(w, h, d, 0.1);

  return (
    <Canvas
      className={className}
      style={{ height: sizeStyle, width: "100%", borderRadius: 4, display: "block" }}
      camera={{
        position: [maxDim * 2.2, maxDim * 1.8, maxDim * 2.5],
        fov: 50,
      }}
      gl={{ antialias: true }}
      onCreated={({ camera }) => {
        camera.lookAt(w / 2, h / 2, d / 2);
      }}
    >
      <Scene container={requestContainer} fittedItems={packResponse.fittedItems} />
    </Canvas>
  );
}
