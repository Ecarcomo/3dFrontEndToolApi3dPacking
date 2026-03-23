export interface BauleraInput {
  name: string;
  width: number;
  height: number;
  depth: number;
  weightLimit: number;
}

export interface PackItemInput {
  name: string;
  width: number;
  height: number;
  depth: number;
  weight: number;
  quantity: number;
}

export interface PackRequest {
  baulera: BauleraInput;
  items: PackItemInput[];
}

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface PackedItem {
  name: string;
  position: Vec3;
  rotationType: number;
  rotationLabel: string;
  dimensions: { width: number; height: number; depth: number };
  weight: number;
  volume: number;
  detail: string;
}

export interface PackResponse {
  baulera: { detail: string };
  fittedItems: PackedItem[];
  unfittedItems: PackedItem[];
}

/** Centro del mesh Three.js si `position` del API es la esquina mínima del AABB. */
export function packedItemMeshCenter(item: PackedItem): [number, number, number] {
  const { x, y, z } = item.position;
  const { width, height, depth } = item.dimensions;
  return [x + width / 2, y + height / 2, z + depth / 2];
}
