import { ModelSummaryCard } from "../../components/ModelSummaryCard";
import type { StageController } from "../../viewer/useThreeStage";
import { ContextTabs } from "./ContextTabs";

/** Preview-mode sidebar: model overview header + contextual tabs. */
export function PreviewSidebar({ stage }: { stage: StageController }) {
  return (
    <>
      <ModelSummaryCard />
      <ContextTabs stage={stage} />
    </>
  );
}
