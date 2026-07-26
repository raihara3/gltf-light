"use client";

import { useState } from "react";
import type { StageController } from "./useThreeStage";
import { useTranslations } from "../i18n/useTranslations";
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
  const t = useTranslations();

  return (
    <div className={styles.root}>
      <button
        type="button"
        className={`${styles.trigger} ${open ? styles.triggerActive : ""}`}
        aria-expanded={open}
        onClick={() => setOpen((previous) => !previous)}
      >
        <CameraIcon size={16} />
        <span className={styles.triggerLabel}>{t("capture.button")}</span>
      </button>

      {open && (
        <div className={styles.panel} role="dialog" aria-label={t("capture.dialogLabel")}>
          <p className={styles.heading}>{t("capture.button")}</p>

          <div className={styles.group}>
            <span className={styles.groupLabel}>{t("capture.light")}</span>
            <Slider
              label={t("capture.ambient")}
              min={0}
              max={3}
              step={0.05}
              value={stage.ambientIntensity}
              onChange={stage.setAmbientIntensity}
            />
            <Slider
              label={t("capture.directional")}
              min={0}
              max={3}
              step={0.05}
              value={stage.directionalIntensity}
              onChange={stage.setDirectionalIntensity}
            />
          </div>

          <div className={styles.group}>
            <Check
              label={t("capture.shadow")}
              checked={stage.shadowEnabled}
              onChange={stage.setShadowEnabled}
            />
            {stage.shadowEnabled && (
              <Slider
                label={t("capture.shadowOpacity")}
                min={0}
                max={1}
                step={0.05}
                value={stage.shadowOpacity}
                onChange={stage.setShadowOpacity}
              />
            )}
          </div>

          <div className={styles.group}>
            <Check
              label={t("capture.transparent")}
              checked={transparent}
              onChange={setTransparent}
            />
          </div>

          <button type="button" className={styles.capture} onClick={() => stage.capture({ transparent })}>
            <CameraIcon size={16} />
            {t("capture.save")}
          </button>
        </div>
      )}
    </div>
  );
}
