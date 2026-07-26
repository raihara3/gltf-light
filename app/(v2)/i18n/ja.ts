// Japanese message catalog — the source of truth. `Messages` is derived from
// its shape so `en.ts` must provide every key (missing keys = compile error).
// `{name}` style placeholders are filled by the `t()` helper.
export const ja = {
  "common.noUpload": "※サーバーにアップロードすることはありません",
  "common.polygons": "ポリゴン数",

  "header.preview": "プレビュー",
  "header.optimize": "軽量化",
  "header.brandSubtitle": "オフラインでglbのプレビューと軽量化を",
  "header.modeTabs": "表示モード",
  "header.toDark": "ダークモードに切り替え",
  "header.toLight": "ライトモードに切り替え",
  "header.language": "言語を切り替え",

  "service.heading": "このサービスでできること",
  "service.preview.title": "3Dモデルのプレビュー",
  "service.preview.body": "専用アプリがなくても3Dモデルをアップロードするだけで表示確認ができます。",
  "service.info.title": "アニメーションや詳細情報の確認",
  "service.info.body": "3Dモデルに含まれるアニメーションの再生や、マテリアルや使用テクスチャ、メッシュ構造の確認も可能です。",
  "service.optimize.title": "最適化の提案とワンクリックでの反映",
  "service.optimize.body":
    "3Dモデルをウェブで扱う上での最適化をご提案、ワンクリックで反映いただけます。ご自身での調整も可能です。",

  "dropzone.title": "3Dモデルをアップロード",
  "dropzone.hint": "ドラッグ&ドロップ、またはクリック（.glb）",
  "upload.error.glbOnly": ".glb ファイルのみ対応しています",

  "viewer.label": "3Dビュー",
  "viewer.dropHere": "ここに .glb をドロップ",
  "viewer.dropReplace": "ここに .glb をドロップして差し替え",
  "toolbar.playAnimation": "アニメーションを再生",
  "toolbar.pauseAnimation": "アニメーションを停止",
  "toolbar.resetView": "視点をリセット",

  "tabs.label": "プレビュー情報",
  "tabs.animation": "アニメーション",
  "tabs.material": "マテリアル",
  "tabs.mesh": "メッシュ",

  "animation.play": "再生",
  "animation.pause": "停止",
  "animation.seek": "再生位置",

  "material.textures": "テクスチャ",
  "material.roughness": "粗さ (Roughness)",
  "material.metalness": "金属感 (Metalness)",
  "material.optimizeCta": "マテリアルの最適化をする",

  "mesh.title": "メッシュ構造",
  "mesh.pickHint": "右のビューアーでクリックしてメッシュを選択する",
  "mesh.collapse": "折りたたむ",
  "mesh.expand": "展開する",
  "mesh.optimizeCta": "ポリゴンの最適化をする",

  "optimize.heading": "軽量化の設定はカスタマイズが可能です",

  "prune.label": "未使用データの削除",
  "prune.text": "使われていないデータを削除して軽量化します。",
  "prune.dataLabel": "未使用データ",

  "texture.label": "テクスチャの最適化",
  "texture.text": "最大解像度を選ぶだけで、すべての画像をまとめて縮小します。",
  "texture.note": "※指定解像度を超えるもののみ調整します",
  "texture.currentMax": "現在の最大解像度",
  "texture.individual": "個別で設定する",
  "texture.maxResolution": "最大解像度",
  "texture.keep": "変更なし",
  "texture.recommendedOption": "{resolution}（おすすめ）",
  "texture.resolutionOf": "{name} の解像度",
  "texture.delete": "{name} を削除",
  "texture.restore": "{name} を戻す",
  "texture.chip.min": "最軽量",
  "texture.chip.recommended": "おすすめ",
  "texture.chip.high": "高品質",

  "polygon.label": "ポリゴンの削減",
  "polygon.text": "面の数を減らして軽くします（既定はオフ）。",
  "polygon.warning": "※形やアニメーションが崩れる場合があります",
  "polygon.reductionRate": "削減率",
  "polygon.wireframe": "ワイヤーフレームで確認",

  "summary.calculating": "計算中…",
  "summary.save": "軽量化して保存",

  "model.size": "サイズ",
  "model.optimizeCta": "モデルの軽量化をする",

  "legacy.open": "以前のバージョンを開く",

  "capture.button": "キャプチャ",
  "capture.dialogLabel": "キャプチャ設定",
  "capture.light": "ライト",
  "capture.ambient": "環境光",
  "capture.directional": "直接光",
  "capture.shadow": "影をつける",
  "capture.shadowOpacity": "影の濃さ",
  "capture.transparent": "背景を透過する",
  "capture.save": "キャプチャして保存",
};

export type Messages = typeof ja;
export type MessageKey = keyof Messages;
