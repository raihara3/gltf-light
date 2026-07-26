"use client";

import { useState } from "react";
import type { StageController } from "./useThreeStage";
import { CameraIcon, CheckIcon } from "../icons";
import styles from "./CapturePanel.module.scss";

function Slider({
  label,
  min,
  max,
  step,
  value,
  onChange,
}: {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
}) {
  const trackPct = ((value - min) / (max - min)) * 100;
  return (
    <div className={styles.slider}>
      <span className={styles.sliderHead}>
        <span>{label}</span>
        <span className={styles.value}>{value.toFixed(2)}</span>
      </span>
      <div className={styles.bar}>
        <div className={styles.fill} style={{ width: `${trackPct}%` }} />
        <span className={styles.knob} style={{ left: `${trackPct}%` }} />
        <input
          type="range"
          className={styles.input}
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
          aria-label={label}
        />
      </div>
    </div>
  );
}

function Check({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      className={styles.check}
      role="checkbox"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
    >
      <span className={`${styles.checkBox} ${checked ? styles.checkOn : ""}`}>
        {checked && <CheckIcon size={10} />}
      </span>
      <span className={styles.checkLabel}>{label}</span>
    </button>
  );
}

/**
 * Capture control (preview only): a camera button at the viewer's top-right that
 * opens a panel to tune the light + shadow and choose background transparency,
 * then export the 3D view as a PNG.
 */
export function CapturePanel({ stage }: { stage: StageController }) {
  const [open, setOpen] = useState(false);
  const [transparent, setTransparent] = useState(false);

  return (
    <div className={styles.root}>
      <button
        type="button"
        className={`${styles.trigger} ${open ? styles.triggerActive : ""}`}
        aria-expanded={open}
        onClick={() => setOpen((previous) => !previous)}
      >
        <CameraIcon size={16} />
        <span className={styles.triggerLabel}>キャプチャ</span>
      </button>

      {open && (
        <div className={styles.panel} role="dialog" aria-label="キャプチャ設定">
          <p className={styles.heading}>キャプチャ</p>

          <div className={styles.group}>
            <span className={styles.groupLabel}>ライト</span>
            <Slider
              label="環境光"
              min={0}
              max={3}
              step={0.05}
              value={stage.ambientIntensity}
              onChange={stage.setAmbientIntensity}
            />
            <Slider
              label="直接光"
              min={0}
              max={3}
              step={0.05}
              value={stage.directionalIntensity}
              onChange={stage.setDirectionalIntensity}
            />
          </div>

          <div className={styles.group}>
            <Check label="影をつける" checked={stage.shadowEnabled} onChange={stage.setShadowEnabled} />
            {stage.shadowEnabled && (
              <Slider
                label="影の濃さ"
                min={0}
                max={1}
                step={0.05}
                value={stage.shadowOpacity}
                onChange={stage.setShadowOpacity}
              />
            )}
          </div>

          <div className={styles.group}>
            <Check label="背景を透過する" checked={transparent} onChange={setTransparent} />
          </div>

          <button type="button" className={styles.capture} onClick={() => stage.capture({ transparent })}>
            <CameraIcon size={16} />
            キャプチャして保存
          </button>
        </div>
      )}
    </div>
  );
}
