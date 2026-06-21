import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RecoilRoot, useRecoilValue } from "recoil";

import MeshStructurePanel from "../MeshStructurePanel";
import {
  detailModeEnabledState,
  meshTreeState,
  selectedMeshUuidState,
} from "../../../state/atoms/MeshTree";

const sampleTree = {
  uuid: "root-uuid",
  name: "Root",
  type: "Group",
  isMesh: false,
  materials: [],
  children: [
    {
      uuid: "child-uuid",
      name: "ChildMesh",
      type: "Mesh",
      isMesh: true,
      materials: [{ uuid: "mat-1", name: "MaterialA" }],
      children: [],
    },
  ],
};

// Note: ThreeViewer.jsx is intentionally not mounted in tests.
// It depends on WebGL and Three.js side effects that cannot run in jsdom.
// We focus on the Recoil + React interactions of MeshStructurePanel here.

const StateProbe = ({ stateKey, onChange }) => {
  const value = useRecoilValue(stateKey);
  onChange(value);
  return null;
};

const renderPanel = (initialMeshTree = sampleTree) => {
  const initializeState = ({ set }) => {
    set(detailModeEnabledState, true);
    if (initialMeshTree !== undefined) {
      set(meshTreeState, initialMeshTree);
    }
  };

  let latestDetailMode;
  let latestSelectedUuid;

  const utils = render(
    <RecoilRoot initializeState={initializeState}>
      <MeshStructurePanel />
      <StateProbe
        stateKey={detailModeEnabledState}
        onChange={(value) => {
          latestDetailMode = value;
        }}
      />
      <StateProbe
        stateKey={selectedMeshUuidState}
        onChange={(value) => {
          latestSelectedUuid = value;
        }}
      />
    </RecoilRoot>
  );

  return {
    ...utils,
    getDetailMode: () => latestDetailMode,
    getSelectedUuid: () => latestSelectedUuid,
  };
};

describe("MeshStructurePanel", () => {
  it("renders the Mesh Structure heading when a tree is set", () => {
    renderPanel();
    expect(
      screen.getByRole("heading", { name: "Mesh Structure" })
    ).toBeInTheDocument();
  });

  it("links the region to its heading via aria-labelledby", () => {
    renderPanel();
    const region = screen.getByRole("region");
    const heading = screen.getByRole("heading", { name: "Mesh Structure" });
    expect(region).toHaveAttribute("aria-labelledby", heading.id);
    expect(heading.id).toBeTruthy();
  });

  it("disables detail mode when the close button is clicked", async () => {
    const user = userEvent.setup();
    const { getDetailMode } = renderPanel();
    expect(getDetailMode()).toBe(true);

    await user.click(
      screen.getByRole("button", { name: "Close Detail Mode" })
    );
    expect(getDetailMode()).toBe(false);
  });

  it("disables detail mode when the Escape key is pressed", () => {
    const { getDetailMode } = renderPanel();
    expect(getDetailMode()).toBe(true);

    act(() => {
      fireEvent.keyDown(window, { key: "Escape" });
    });
    expect(getDetailMode()).toBe(false);
  });

  it("does not render the tree when meshTree is null", () => {
    renderPanel(null);
    expect(screen.queryByRole("tree")).not.toBeInTheDocument();
  });

  it("toggles selectedMeshUuid off when the same node is clicked twice", async () => {
    const user = userEvent.setup();
    const { getSelectedUuid } = renderPanel();

    const rootLabel = screen.getByText("Root");
    await user.click(rootLabel);
    expect(getSelectedUuid()).toBe("root-uuid");

    await user.click(rootLabel);
    expect(getSelectedUuid()).toBeNull();
  });
});
