import { describe, it, expect } from "vitest";
import { snapshot_UNSTABLE } from "recoil";

import {
  detailModeEnabledState,
  meshTreeState,
  selectedMeshUuidState,
} from "../MeshTree";

describe("MeshTree atoms", () => {
  const snapshot = snapshot_UNSTABLE();

  it("detailModeEnabledState defaults to false", () => {
    expect(snapshot.getLoadable(detailModeEnabledState).valueOrThrow()).toBe(
      false
    );
  });

  it("meshTreeState defaults to null", () => {
    expect(snapshot.getLoadable(meshTreeState).valueOrThrow()).toBeNull();
  });

  it("selectedMeshUuidState defaults to null", () => {
    expect(
      snapshot.getLoadable(selectedMeshUuidState).valueOrThrow()
    ).toBeNull();
  });
});
