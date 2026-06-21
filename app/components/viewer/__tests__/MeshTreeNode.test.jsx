import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import MeshTreeNode from "../MeshTreeNode";

const renderNode = (props) => {
  const onSelect = props.onSelect ?? vi.fn();
  const selectedUuid = props.selectedUuid ?? null;
  const wrapper = ({ children }) => <ul>{children}</ul>;
  const utils = render(
    <MeshTreeNode
      node={props.node}
      selectedUuid={selectedUuid}
      onSelect={onSelect}
    />,
    { wrapper }
  );
  return { ...utils, onSelect };
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

  it("toggles child visibility when the caret button is clicked", async () => {
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

    expect(screen.getByText("Child")).toBeInTheDocument();
    const caret = screen.getByRole("button", { name: "Collapse" });
    expect(caret).toHaveTextContent("▾");

    await user.click(caret);
    expect(screen.queryByText("Child")).not.toBeInTheDocument();
    const expandCaret = screen.getByRole("button", { name: "Expand" });
    expect(expandCaret).toHaveTextContent("▸");

    await user.click(expandCaret);
    expect(screen.getByText("Child")).toBeInTheDocument();
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
    const treeitems = screen.getAllByRole("treeitem");
    const parentTreeitem = treeitems.find((item) =>
      within(item).queryByText("Parent")
    );
    expect(parentTreeitem).toHaveAttribute("aria-expanded", "true");
  });
});
