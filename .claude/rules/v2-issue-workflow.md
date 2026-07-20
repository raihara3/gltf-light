# v2 Renewal: Issue Workflow Rules

Rules for the UI/UX renewal project ("v2"). These govern all implementation work on the renewal until the migration is complete.

## Branches

- Base branch: `feature/v2`. Every issue is implemented on a branch cut from `feature/v2` (e.g., `feature/v2-issue-26`), and its PR targets `feature/v2`.
- Do NOT merge renewal work into `develop` directly. `develop` keeps serving the currently published version.

## Issue order

Implement one issue at a time, in this order (GitHub raihara3/gltf-light):

1. #26 (0-1) Isolate the legacy app into a route group, serve it at `/legacy`
2. #27 (0-2) Lint guard + CI enforcing zero cross-references between legacy and v2
3. #28 (0-3) v2 layout + preview/optimize mode switch skeleton
4. #29 (0-4) Zustand store design (modelStore / optimizeStore / uiStore)
5. #30 (PoC) gltf-transform in-browser texture processing — MUST finish before #33/#35
6. #31 (1-1) 3D viewer layer (plain three.js, thin wrappers)
7. #32 (1-2) Preview mode UI (overview header + contextual tabs)
8. #33 (1-3) Optimization Worker pipeline (prune/dedup)
9. #34 (1-4) Auto estimation on optimize tab (view must not lock)
10. #35 (1-5) Bulk texture downscale (all texture maps)
11. #36 (1-6) Polygon reduction via gltf-transform simplify (off by default)
12. #37 (1-7) Before/After summary + save CTA + reset + 3D view reflection
13. #38 (1-8) Non-destructive material/texture-slot deletion (Should)
14. #39 (1-9) Link from v2 to /legacy (Should)

Do not start an issue until the previous one is accepted, unless the user explicitly approves parallel work.

## Per-issue flow

1. **Implement**: satisfy the acceptance criteria written in the issue. Follow `~/.ai-organization/workspace/gltf-light/architecture.md` for design decisions. New (v2) code never imports legacy code, and is written entirely in TypeScript.
2. **Verify (QA)**: run the app and verify every acceptance criterion in a real browser (Playwright MCP). Record evidence (screenshots) for visual criteria.
3. **PM review**: check the result against the issue and `PRD.md` (requirement fit), then report to the user with the verification results.
4. **User acceptance**: the user gives final approval. Only then close the issue and move to the next one.

## Fixed project decisions (do not re-litigate)

- Legacy app is frozen at `/legacy`: no new features, no visual changes.
- State management: Zustand (Recoil stays only in legacy).
- 3D layer: plain three.js with custom hooks (no react-three-fiber).
- Optimization: @gltf-transform inside a Web Worker; the original glb ArrayBuffer is immutable (non-destructive pipeline).
- Polygon reduction is OFF by default; applying it requires explicit user action.
- Copyright is hidden in the v2 UI, but must be preserved in saved glb metadata.
- Client-side processing only. Input format is `.glb` only.

## References

- PRD: `~/.ai-organization/workspace/gltf-light/PRD.md`
- Architecture: `~/.ai-organization/workspace/gltf-light/architecture.md`
- Project history / decisions: `~/.ai-organization/memory/gltf-light/project_history.md`
- Approved IA mockup (v2): `~/.ai-organization/workspace/gltf-light/design/mockup.html`
- Icon set: `~/.ai-organization/workspace/gltf-light/design/icons/`
