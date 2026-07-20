// states
import type { MeshTreeNode } from "../state/atoms/MeshTree";

export const collectAncestorUuids = (
  tree: MeshTreeNode | null | undefined,
  targetUuid: string | null
): Set<string> => {
  const ancestors = new Set<string>();
  if (!tree || !targetUuid) return ancestors;

  const visit = (node: MeshTreeNode): boolean => {
    if (node.uuid === targetUuid) return true;
    for (const child of node.children) {
      if (visit(child)) {
        ancestors.add(node.uuid);
        return true;
      }
    }
    return false;
  };

  visit(tree);
  return ancestors;
};
