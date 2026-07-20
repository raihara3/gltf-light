import { describe, it, expect } from "vitest";

import { buildMeshTree } from "../buildMeshTree";

const makeObject = (overrides: Record<string, unknown> = {}) => ({
  uuid: "uuid-default",
  name: "object",
  type: "Object3D",
  isMesh: false,
  children: [],
  ...overrides,
});

describe("buildMeshTree", () => {
  it("returns null when input is null or undefined", () => {
    expect(buildMeshTree(null)).toBeNull();
    expect(buildMeshTree(undefined)).toBeNull();
  });

  it("excludes the root groundPlane object", () => {
    const root = makeObject({ uuid: "root", name: "groundPlane" });
    expect(buildMeshTree(root)).toBeNull();
  });

  it("converts a mix of mesh and group children into a tree", () => {
    const root = makeObject({
      uuid: "root",
      name: "Root",
      type: "Group",
      children: [
        makeObject({
          uuid: "group-1",
          name: "Group1",
          type: "Group",
          children: [
            makeObject({
              uuid: "mesh-1",
              name: "Mesh1",
              type: "Mesh",
              isMesh: true,
              material: { uuid: "mat-1", name: "MaterialA" },
            }),
          ],
        }),
        makeObject({
          uuid: "mesh-2",
          name: "Mesh2",
          type: "Mesh",
          isMesh: true,
          material: { uuid: "mat-2", name: "MaterialB" },
        }),
      ],
    });

    const tree = buildMeshTree(root);
    expect(tree).not.toBeNull();
    expect(tree!.uuid).toBe("root");
    expect(tree!.name).toBe("Root");
    expect(tree!.type).toBe("Group");
    expect(tree!.isMesh).toBe(false);
    expect(tree!.materials).toEqual([]);
    expect(tree!.children).toHaveLength(2);

    const [firstChild, secondChild] = tree!.children;
    expect(firstChild.uuid).toBe("group-1");
    expect(firstChild.children).toHaveLength(1);
    expect(firstChild.children[0].uuid).toBe("mesh-1");
    expect(firstChild.children[0].isMesh).toBe(true);
    expect(firstChild.children[0].materials).toEqual([
      { uuid: "mat-1", name: "MaterialA" },
    ]);

    expect(secondChild.uuid).toBe("mesh-2");
    expect(secondChild.isMesh).toBe(true);
    expect(secondChild.materials).toEqual([
      { uuid: "mat-2", name: "MaterialB" },
    ]);
  });

  it("falls back to the type when the object name is empty or undefined", () => {
    const emptyNameTree = buildMeshTree(
      makeObject({ uuid: "u-1", name: "", type: "Group" })
    );
    expect(emptyNameTree?.name).toBe("Group");

    const undefinedNameTree = buildMeshTree(
      makeObject({ uuid: "u-2", name: undefined, type: "Mesh" })
    );
    expect(undefinedNameTree?.name).toBe("Mesh");
  });

  it("handles a material as an array", () => {
    const tree = buildMeshTree(
      makeObject({
        uuid: "mesh",
        name: "Mesh",
        type: "Mesh",
        isMesh: true,
        material: [
          { uuid: "mat-a", name: "A" },
          { uuid: "mat-b", name: "B" },
        ],
      })
    );
    expect(tree?.materials).toEqual([
      { uuid: "mat-a", name: "A" },
      { uuid: "mat-b", name: "B" },
    ]);
  });

  it("handles a material as a single object", () => {
    const tree = buildMeshTree(
      makeObject({
        uuid: "mesh",
        name: "Mesh",
        type: "Mesh",
        isMesh: true,
        material: { uuid: "mat-single", name: "Solo" },
      })
    );
    expect(tree?.materials).toEqual([{ uuid: "mat-single", name: "Solo" }]);
  });

  it('replaces empty material name with "(unnamed)"', () => {
    const tree = buildMeshTree(
      makeObject({
        uuid: "mesh",
        name: "Mesh",
        type: "Mesh",
        isMesh: true,
        material: { uuid: "mat-empty", name: "" },
      })
    );
    expect(tree?.materials).toEqual([
      { uuid: "mat-empty", name: "(unnamed)" },
    ]);
  });

  it("excludes only the groundPlane child while keeping siblings", () => {
    const root = makeObject({
      uuid: "root",
      name: "Root",
      type: "Group",
      children: [
        makeObject({ uuid: "ground", name: "groundPlane", type: "Mesh" }),
        makeObject({
          uuid: "sibling",
          name: "Sibling",
          type: "Mesh",
          isMesh: true,
          material: { uuid: "mat", name: "Mat" },
        }),
      ],
    });

    const tree = buildMeshTree(root);
    expect(tree?.children).toHaveLength(1);
    expect(tree?.children[0].uuid).toBe("sibling");
  });

  it("does not collect materials when isMesh is false even if material exists", () => {
    const tree = buildMeshTree(
      makeObject({
        uuid: "group",
        name: "Group",
        type: "Group",
        isMesh: false,
        material: { uuid: "mat", name: "Ignored" },
      })
    );
    expect(tree?.materials).toEqual([]);
  });
});
