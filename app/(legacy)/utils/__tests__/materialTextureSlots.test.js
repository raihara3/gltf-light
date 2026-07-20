import { describe, it, expect } from "vitest";

import {
  MATERIAL_TEXTURE_SLOTS,
  getMaterialTextureUuids,
} from "../materialTextureSlots";

describe("getMaterialTextureUuids", () => {
  it("returns an empty set when material is null", () => {
    expect(getMaterialTextureUuids(null).size).toBe(0);
  });

  it("returns an empty set when material has no texture maps", () => {
    expect(getMaterialTextureUuids({}).size).toBe(0);
  });

  it("collects uuids only from known slots that hold a map with a uuid", () => {
    const material = {
      map: { uuid: "base-uuid" },
      normalMap: { uuid: "normal-uuid" },
      roughnessMap: null,
      metalnessMap: { uuid: "" },
      unrelatedField: { uuid: "should-be-ignored" },
    };

    const uuids = getMaterialTextureUuids(material);
    expect(uuids.has("base-uuid")).toBe(true);
    expect(uuids.has("normal-uuid")).toBe(true);
    expect(uuids.has("should-be-ignored")).toBe(false);
    expect(uuids.size).toBe(2);
  });

  it("exposes a stable slot definition list covering the standard PBR maps", () => {
    const keys = MATERIAL_TEXTURE_SLOTS.map((slot) => slot.key);
    expect(keys).toContain("map");
    expect(keys).toContain("normalMap");
    expect(keys).toContain("roughnessMap");
    expect(keys).toContain("metalnessMap");
  });
});
