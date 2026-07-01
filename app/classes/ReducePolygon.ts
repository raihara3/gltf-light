// lib
import { BufferGeometry } from "three";
import { SimplifyModifier } from "three/examples/jsm/modifiers/SimplifyModifier.js";

class ReducePolygon {
  private modifier: SimplifyModifier;

  constructor() {
    this.modifier = new SimplifyModifier();
  }

  // keepRatio is the fraction of vertices to preserve (0 < keepRatio <= 1).
  // Returns a newly decimated geometry; the input geometry is left untouched.
  simplify(geometry: BufferGeometry, keepRatio: number): BufferGeometry {
    const position = geometry.getAttribute("position");
    if (!position) return geometry.clone();

    const vertexCount = position.count;
    const removeCount = Math.floor(vertexCount * (1 - keepRatio));
    if (removeCount <= 0) return geometry.clone();

    // SimplifyModifier mutates the geometry it receives (merges vertices and
    // strips morph attributes), so hand it a clone to keep the original intact.
    return this.modifier.modify(geometry.clone(), removeCount);
  }
}

export default ReducePolygon;
