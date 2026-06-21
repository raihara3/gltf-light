import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RecoilRoot, useRecoilValue } from "recoil";

import MeshStructure from "../MeshStructure";
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

const StateProbe = ({ stateKey, onChange }) => {
  const value = useRecoilValue(stateKey);
  onChange(value);
  return null;
};

const renderSection = ({
  initialMeshTree = sampleTree,
  initialDetailMode = false,
} = {}) => {
  const initializeState = ({ set }) => {
    if (initialMeshTree !== undefined) {
      set(meshTreeState, initialMeshTree);
    }
    set(detailModeEnabledState, initialDetailMode);
  };

  let latestSelectedUuid;
  let latestDetailMode;

  const utils = render(
    <RecoilRoot initializeState={initializeState}>
      <MeshStructure />
      <StateProbe
        stateKey={selectedMeshUuidState}
        onChange={(value) => {
          latestSelectedUuid = value;
        }}
      />
      <StateProbe
        stateKey={detailModeEnabledState}
        onChange={(value) => {
          latestDetailMode = value;
        }}
      />
    </RecoilRoot>
  );

  return {
    ...utils,
    getSelectedUuid: () => latestSelectedUuid,
    getDetailMode: () => latestDetailMode,
  };
};

describe("MeshStructure sidebar section", () => {
  it("always renders the Mesh Structure heading", () => {
    renderSection({ initialMeshTree: null });
    expect(
      screen.getByRole("heading", { name: "Mesh Structure" })
    ).toBeInTheDocument();
  });

  it("does not render the tree when meshTree is null", () => {
    renderSection({ initialMeshTree: null });
    expect(screen.queryByRole("tree")).not.toBeInTheDocument();
  });

  it("renders the tree when meshTree is provided but keeps children collapsed", () => {
    renderSection();
    expect(screen.getByRole("tree")).toBeInTheDocument();
    expect(screen.getByText("Root")).toBeInTheDocument();
    expect(screen.queryByText("ChildMesh")).not.toBeInTheDocument();
  });

  it("auto-expands ancestors when selectedMeshUuid points to a descendant", () => {
    const initialState = ({ set }) => {
      set(meshTreeState, sampleTree);
      set(selectedMeshUuidState, "child-uuid");
      set(detailModeEnabledState, false);
    };

    render(
      <RecoilRoot initializeState={initialState}>
        <MeshStructure />
      </RecoilRoot>
    );

    expect(screen.getByText("Root")).toBeInTheDocument();
    expect(screen.getByText("ChildMesh")).toBeInTheDocument();
  });

  it("toggles selectedMeshUuid off when the same node is clicked twice", async () => {
    const user = userEvent.setup();
    const { getSelectedUuid } = renderSection();

    const rootLabel = screen.getByText("Root");
    await user.click(rootLabel);
    expect(getSelectedUuid()).toBe("root-uuid");

    await user.click(rootLabel);
    expect(getSelectedUuid()).toBeNull();
  });

  it("reflects detailModeEnabled state in the toggle checkbox", () => {
    renderSection({ initialDetailMode: true });
    const toggle = screen.getByRole("checkbox", { name: "Click viewer to select" });
    expect(toggle).toBeChecked();
  });

  it("updates detailModeEnabled when the toggle is clicked", async () => {
    const user = userEvent.setup();
    const { getDetailMode } = renderSection();
    const toggle = screen.getByRole("checkbox", { name: "Click viewer to select" });

    expect(getDetailMode()).toBe(false);
    await user.click(toggle);
    expect(getDetailMode()).toBe(true);

    await user.click(toggle);
    expect(getDetailMode()).toBe(false);
  });
});
