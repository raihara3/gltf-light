import { describe, it, expect } from "vitest";

import { collectAncestorUuids } from "../collectAncestorUuids";
import type { MeshTreeNode } from "../../state/atoms/MeshTree";

const makeNode = (overrides: Partial<MeshTreeNode> = {}): MeshTreeNode => ({
  uuid: "uuid",
  name: "Node",
  type: "Object3D",
  isMesh: false,
  materials: [],
  children: [],
  ...overrides,
});

describe("collectAncestorUuids", () => {
  it("returns an empty set when tree is null", () => {
    const result = collectAncestorUuids(null, "anything");
    expect(result.size).toBe(0);
  });

  it("returns an empty set when targetUuid is null", () => {
    const tree = makeNode({ uuid: "root" });
    const result = collectAncestorUuids(tree, null);
    expect(result.size).toBe(0);
  });

  it("returns an empty set when the target is the root itself", () => {
    const tree = makeNode({ uuid: "root" });
    const result = collectAncestorUuids(tree, "root");
    expect(result.size).toBe(0);
  });

  it("returns every uuid on the path except the target itself", () => {
    const tree = makeNode({
      uuid: "root",
      children: [
        makeNode({
          uuid: "child-a",
          children: [
            makeNode({
              uuid: "leaf",
            }),
          ],
        }),
        makeNode({ uuid: "child-b" }),
      ],
    });
    const result = collectAncestorUuids(tree, "leaf");
    expect(result.has("root")).toBe(true);
    expect(result.has("child-a")).toBe(true);
    expect(result.has("leaf")).toBe(false);
    expect(result.has("child-b")).toBe(false);
  });

  it("returns an empty set when the target is not in the tree", () => {
    const tree = makeNode({
      uuid: "root",
      children: [makeNode({ uuid: "child" })],
    });
    const result = collectAncestorUuids(tree, "missing");
    expect(result.size).toBe(0);
  });
});
