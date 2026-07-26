import type { Messages } from "./ja";

// English catalog. Typed as `Messages` so every key from `ja.ts` is required.
export const en: Messages = {
  "common.noUpload": "* Nothing is uploaded to any server",
  "common.polygons": "Polygons",

  "header.preview": "Preview",
  "header.optimize": "Optimize",
  "header.brandSubtitle": "Preview & optimize glb, offline",
  "header.modeTabs": "View mode",
  "header.toDark": "Switch to dark mode",
  "header.toLight": "Switch to light mode",
  "header.language": "Switch language",

  "service.heading": "What you can do here",
  "service.preview.title": "Preview 3D models",
  "service.preview.body": "Just upload a 3D model to check it — no dedicated app required.",
  "service.info.title": "Inspect animations & details",
  "service.info.body":
    "Play animations and inspect materials, textures, and mesh structure contained in the model.",
  "service.optimize.title": "Optimization suggestions, applied in one click",
  "service.optimize.body":
    "We suggest optimizations for using 3D models on the web and apply them in one click. You can also fine-tune them yourself.",

  "dropzone.title": "Upload a 3D model",
  "dropzone.hint": "Drag & drop, or click (.glb)",
  "upload.error.glbOnly": "Only .glb files are supported",

  "viewer.label": "3D view",
  "viewer.dropHere": "Drop a .glb here",
  "viewer.dropReplace": "Drop a .glb here to replace",
  "toolbar.playAnimation": "Play animation",
  "toolbar.pauseAnimation": "Pause animation",
  "toolbar.resetView": "Reset view",

  "tabs.label": "Preview info",
  "tabs.animation": "Animation",
  "tabs.material": "Material",
  "tabs.mesh": "Mesh",

  "animation.play": "Play",
  "animation.pause": "Pause",
  "animation.seek": "Playback position",

  "material.textures": "Textures",
  "material.roughness": "Roughness",
  "material.metalness": "Metalness",
  "material.optimizeCta": "Optimize materials",

  "mesh.title": "Mesh structure",
  "mesh.pickHint": "Click in the viewer to select a mesh",
  "mesh.collapse": "Collapse",
  "mesh.expand": "Expand",
  "mesh.optimizeCta": "Optimize polygons",

  "optimize.heading": "You can customize the optimization settings",

  "prune.label": "Remove unused data",
  "prune.text": "Removes unused data to make the model lighter.",
  "prune.dataLabel": "Unused data",

  "texture.label": "Texture optimization",
  "texture.text": "Just pick a max resolution to shrink every image at once.",
  "texture.note": "* Only images larger than the chosen resolution are adjusted",
  "texture.currentMax": "Current max resolution",
  "texture.individual": "Set individually",
  "texture.maxResolution": "Max resolution",
  "texture.keep": "No change",
  "texture.recommendedOption": "{resolution} (recommended)",
  "texture.resolutionOf": "Resolution of {name}",
  "texture.delete": "Delete {name}",
  "texture.restore": "Restore {name}",
  "texture.chip.min": "Smallest",
  "texture.chip.recommended": "Recommended",
  "texture.chip.high": "High quality",

  "polygon.label": "Polygon reduction",
  "polygon.text": "Reduces the number of faces to make the model lighter (off by default).",
  "polygon.warning": "* Shape or animation may break",
  "polygon.reductionRate": "Reduction",
  "polygon.wireframe": "Show wireframe",

  "summary.calculating": "Calculating…",
  "summary.save": "Save optimized",

  "model.size": "Size",
  "model.optimizeCta": "Optimize this model",

  "legacy.open": "Open the previous version",

  "capture.button": "Capture",
  "capture.dialogLabel": "Capture settings",
  "capture.light": "Light",
  "capture.ambient": "Ambient",
  "capture.directional": "Directional",
  "capture.shadow": "Add shadow",
  "capture.shadowOpacity": "Shadow opacity",
  "capture.transparent": "Transparent background",
  "capture.save": "Capture & save",
};
