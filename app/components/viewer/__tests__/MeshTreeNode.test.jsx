import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RecoilRoot, useRecoilValue } from "recoil";

import MeshTreeNode from "../MeshTreeNode";
import {
  materialsState,
  selectedMaterialNameState,
  materialPropertiesState,
} from "../../../state/atoms/ModelInfo";

const StateProbe = ({ stateKey, onChange }) => {
  const value = useRecoilValue(stateKey);
  onChange(value);
  return null;
};

const renderNode = (props) => {
  const onSelect = props.onSelect ?? vi.fn();
  const selectedUuid = props.selectedUuid ?? null;
  const expandedAncestorUuids = props.expandedAncestorUuids ?? new Set();
  const initialMaterials = props.initialMaterials ?? [];
  const initialSelectedMaterialName = props.initialSelectedMaterialName ?? null;

  const initializeState = ({ set }) => {
    set(materialsState, initialMaterials);
    set(selectedMaterialNameState, initialSelectedMaterialName);
  };

  let latestSelectedMaterialName;
  let latestMaterialProperties;

  const wrapper = ({ children }) => (
    <RecoilRoot initializeState={initializeState}>
      <ul>{children}</ul>
      <StateProbe
        stateKey={selectedMaterialNameState}
        onChange={(value) => {
          latestSelectedMaterialName = value;
        }}
      />
      <StateProbe
        stateKey={materialPropertiesState}
        onChange={(value) => {
          latestMaterialProperties = value;
        }}
      />
    </RecoilRoot>
  );

  const utils = render(
    <MeshTreeNode
      node={props.node}
      selectedUuid={selectedUuid}
      expandedAncestorUuids={expandedAncestorUuids}
      onSelect={onSelect}
    />,
    { wrapper }
  );

  return {
    ...utils,
    onSelect,
    getSelectedMaterialName: () => latestSelectedMaterialName,
    getMaterialProperties: () => latestMaterialProperties,
  };
};

const makeLeaf = (overrides = {}) => ({
  uuid: "leaf-uuid",
  name: "LeafMesh",
  type: "Mesh",
  isMesh: true,
  materials: [],
  children: [],
  ...overrides,
});

describe("MeshTreeNode", () => {
  it("displays the node name and type label", () => {
    renderNode({ node: makeLeaf({ name: "Wheel", type: "Mesh" }) });
    expect(screen.getByText("Wheel")).toBeInTheDocument();
    expect(screen.getByText("Mesh")).toBeInTheDocument();
  });

  it("renders every material as a chip when materials are present", () => {
    renderNode({
      node: makeLeaf({
        materials: [
          { uuid: "m1", name: "Red" },
          { uuid: "m2", name: "Blue" },
          { uuid: "m3", name: "Green" },
        ],
      }),
    });

    expect(screen.getByText("Red")).toBeInTheDocument();
    expect(screen.getByText("Blue")).toBeInTheDocument();
    expect(screen.getByText("Green")).toBeInTheDocument();
  });

  it("does not render material chips when isMesh is false", () => {
    renderNode({
      node: makeLeaf({
        isMesh: false,
        type: "Group",
        materials: [{ uuid: "m1", name: "ShouldNotShow" }],
      }),
    });
    expect(screen.queryByText("ShouldNotShow")).not.toBeInTheDocument();
  });

  it("starts collapsed and toggles child visibility when the caret is clicked", async () => {
    const user = userEvent.setup();
    const node = {
      uuid: "parent",
      name: "Parent",
      type: "Group",
      isMesh: false,
      materials: [],
      children: [
        {
          uuid: "child",
          name: "Child",
          type: "Mesh",
          isMesh: true,
          materials: [],
          children: [],
        },
      ],
    };
    renderNode({ node });

    expect(screen.queryByText("Child")).not.toBeInTheDocument();
    const expandCaret = screen.getByRole("button", { name: "Expand" });
    expect(expandCaret).toHaveTextContent("▸");

    await user.click(expandCaret);
    expect(screen.getByText("Child")).toBeInTheDocument();
    const collapseCaret = screen.getByRole("button", { name: "Collapse" });
    expect(collapseCaret).toHaveTextContent("▾");

    await user.click(collapseCaret);
    expect(screen.queryByText("Child")).not.toBeInTheDocument();
  });

  it("invokes onSelect with the node uuid when the row is clicked", async () => {
    const user = userEvent.setup();
    const node = makeLeaf({ uuid: "click-uuid", name: "Clickable" });
    const { onSelect } = renderNode({ node });

    await user.click(screen.getByText("Clickable"));
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith("click-uuid");
  });

  it("invokes onSelect with the node uuid on Enter and Space, with preventDefault", () => {
    const node = makeLeaf({ uuid: "key-uuid", name: "Keyable" });
    const onSelect = vi.fn();
    renderNode({ node, onSelect });

    const treeitem = screen.getByRole("treeitem");
    const row = within(treeitem).getByText("Keyable").parentElement;

    const enterEvent = new KeyboardEvent("keydown", {
      key: "Enter",
      bubbles: true,
      cancelable: true,
    });
    row.dispatchEvent(enterEvent);
    expect(onSelect).toHaveBeenCalledWith("key-uuid");
    expect(enterEvent.defaultPrevented).toBe(true);

    onSelect.mockClear();

    const spaceEvent = new KeyboardEvent("keydown", {
      key: " ",
      bubbles: true,
      cancelable: true,
    });
    row.dispatchEvent(spaceEvent);
    expect(onSelect).toHaveBeenCalledWith("key-uuid");
    expect(spaceEvent.defaultPrevented).toBe(true);
  });

  it("marks the matching row with the selected class and aria-selected", () => {
    const node = makeLeaf({ uuid: "selected-uuid", name: "SelectedNode" });
    renderNode({ node, selectedUuid: "selected-uuid" });

    const treeitem = screen.getByRole("treeitem");
    expect(treeitem).toHaveAttribute("aria-selected", "true");

    const row = within(treeitem).getByText("SelectedNode").parentElement;
    expect(row.className).toMatch(/nodeRowSelected/);
  });

  it("only assigns aria-expanded to nodes that have children", () => {
    const leafNode = makeLeaf({ uuid: "leaf-only" });
    const { unmount } = renderNode({ node: leafNode });
    expect(screen.getByRole("treeitem")).not.toHaveAttribute("aria-expanded");
    unmount();

    const parentNode = {
      uuid: "parent-only",
      name: "Parent",
      type: "Group",
      isMesh: false,
      materials: [],
      children: [
        {
          uuid: "leaf-child",
          name: "Leaf",
          type: "Mesh",
          isMesh: true,
          materials: [],
          children: [],
        },
      ],
    };
    renderNode({ node: parentNode });
    const parentTreeitem = screen.getByRole("treeitem");
    expect(parentTreeitem).toHaveAttribute("aria-expanded", "false");
  });

  it("auto-expands when the node is on the selection ancestor path", () => {
    const node = {
      uuid: "ancestor",
      name: "Ancestor",
      type: "Group",
      isMesh: false,
      materials: [],
      children: [
        {
          uuid: "selected-leaf",
          name: "Leaf",
          type: "Mesh",
          isMesh: true,
          materials: [],
          children: [],
        },
      ],
    };
    renderNode({
      node,
      expandedAncestorUuids: new Set(["ancestor"]),
    });

    expect(screen.getByText("Leaf")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Collapse" })).toBeInTheDocument();
  });

  it("stays collapsed when the node is not on the selection ancestor path", () => {
    const node = {
      uuid: "other",
      name: "Other",
      type: "Group",
      isMesh: false,
      materials: [],
      children: [
        {
          uuid: "hidden-leaf",
          name: "Hidden",
          type: "Mesh",
          isMesh: true,
          materials: [],
          children: [],
        },
      ],
    };
    renderNode({
      node,
      expandedAncestorUuids: new Set(["different-uuid"]),
    });

    expect(screen.queryByText("Hidden")).not.toBeInTheDocument();
  });

  it("syncs selectedMaterialName when a chip is clicked", async () => {
    const user = userEvent.setup();
    const sharedMaterial = {
      name: "Steel",
      roughness: 0.2,
      metalness: 0.9,
    };
    const { getSelectedMaterialName, getMaterialProperties } = renderNode({
      node: makeLeaf({
        materials: [{ uuid: "m-1", name: "Steel" }],
      }),
      initialMaterials: [sharedMaterial],
    });

    await user.click(screen.getByRole("button", { name: /Steel/ }));
    expect(getSelectedMaterialName()).toBe("Steel");
    expect(getMaterialProperties()).toEqual({
      roughness: 0.2,
      metalness: 0.9,
    });
  });

  it("highlights the chip when its material is the currently selected one", () => {
    renderNode({
      node: makeLeaf({
        materials: [{ uuid: "m-1", name: "Steel" }],
      }),
      initialSelectedMaterialName: "Steel",
    });

    const chip = screen.getByRole("button", { name: /Steel/ });
    expect(chip).toHaveAttribute("aria-pressed", "true");
    expect(chip.className).toMatch(/materialChipSelected/);
  });

  it("does not invoke onSelect when a chip is clicked", async () => {
    const user = userEvent.setup();
    const { onSelect } = renderNode({
      node: makeLeaf({
        uuid: "mesh-uuid",
        materials: [{ uuid: "m-1", name: "Steel" }],
      }),
      initialMaterials: [{ name: "Steel", roughness: 0.3, metalness: 0.4 }],
    });

    await user.click(screen.getByRole("button", { name: /Steel/ }));
    expect(onSelect).not.toHaveBeenCalled();
  });
});
