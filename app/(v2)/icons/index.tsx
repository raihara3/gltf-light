// Feather-style line icons, React-ified from design/icons/*.svg.
// Every icon shares the same 24x24 stroke frame and follows `currentColor`,
// so color and size are controlled by the surrounding text style.

export type IconProps = Omit<React.SVGProps<SVGSVGElement>, "children"> & {
  /** Edge length in pixels. Defaults to 24 (the design grid). */
  size?: number;
};

function Icon({ size = 24, children, ...props }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

export const AlertIcon = (props: IconProps) => (
  <Icon {...props}><path d="M12 9v4M12 17h.01" /><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" /></Icon>
);
export const ArrowRightIcon = (props: IconProps) => (
  <Icon {...props}><path d="M5 12h14M13 6l6 6-6 6" /></Icon>
);
export const CameraIcon = (props: IconProps) => (
  <Icon {...props}><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></Icon>
);
export const CheckIcon = (props: IconProps) => (
  <Icon {...props}><path d="M20 6 9 17l-5-5" /></Icon>
);
export const CircleIcon = (props: IconProps) => (
  <Icon {...props}><circle cx="12" cy="12" r="9" /></Icon>
);
// Material sphere: circle with a specular-highlight arc.
export const SphereIcon = (props: IconProps) => (
  <Icon {...props}><circle cx="12" cy="12" r="9" /><path d="M8.5 8a5 5 0 0 1 4-1.8" /></Icon>
);
export const CubeIcon = (props: IconProps) => (
  <Icon {...props}><path d="M21 8l-9-5-9 5v8l9 5 9-5z" /><path d="M3 8l9 5 9-5" /><path d="M12 13v8" /></Icon>
);
export const CursorIcon = (props: IconProps) => (
  <Icon {...props}><path d="M3 3l7.5 18 2.1-7.4L20 11.4z" /></Icon>
);
export const DownloadIcon = (props: IconProps) => (
  <Icon {...props}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="M7 10l5 5 5-5" /><path d="M12 15V3" /></Icon>
);
export const EditIcon = (props: IconProps) => (
  <Icon {...props}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4z" /></Icon>
);
export const EyeIcon = (props: IconProps) => (
  <Icon {...props}><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" /><circle cx="12" cy="12" r="3" /></Icon>
);
export const FileIcon = (props: IconProps) => (
  <Icon {...props}><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" /><path d="M13 2v7h7" /></Icon>
);
export const FilmIcon = (props: IconProps) => (
  <Icon {...props}><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M7 4v16M17 4v16M3 9h4M17 9h4M3 15h4M17 15h4" /></Icon>
);
export const LayersIcon = (props: IconProps) => (
  <Icon {...props}><path d="M12 2 2 7l10 5 10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></Icon>
);
export const MemoIcon = (props: IconProps) => (
  <Icon {...props}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /><path d="M8 13h8" /><path d="M8 17h5" /></Icon>
);
export const MoonIcon = (props: IconProps) => (
  <Icon {...props}><path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z" /></Icon>
);
export const PauseIcon = (props: IconProps) => (
  <Icon {...props}><rect x="6" y="4" width="4" height="16" fill="currentColor" stroke="none" /><rect x="14" y="4" width="4" height="16" fill="currentColor" stroke="none" /></Icon>
);
export const PlayIcon = (props: IconProps) => (
  <Icon {...props}><path d="M6 4l14 8-14 8z" fill="currentColor" stroke="none" /></Icon>
);
export const RocketDetachIcon = (props: IconProps) => (
  <Icon {...props}><path d="M12 2c-2.3 2.2-3.7 5.4-3.7 8.7V15h7.4v-4.3C15.7 7.4 14.3 4.2 12 2z" /><circle cx="12" cy="9.8" r="1.6" /><path d="M12 17.5v3.5" /><rect x="2.4" y="8.5" width="4.4" height="7.5" rx="2.2" transform="rotate(-24 4.6 12.2)" /><rect x="17.2" y="8.5" width="4.4" height="7.5" rx="2.2" transform="rotate(24 19.4 12.2)" /></Icon>
);
export const RocketSparkleIcon = (props: IconProps) => (
  <Icon {...props}><path d="M12 2c-2.8 2.6-4.5 6.2-4.5 10v3h9v-3c0-3.8-1.7-7.4-4.5-10z" /><circle cx="12" cy="10" r="1.8" /><path d="M7.5 12l-3.5 4.5h3.5z" /><path d="M16.5 12l3.5 4.5h-3.5z" /><path d="M12 18v3.5" /><path d="M8.7 18l-1.2 2.8" /><path d="M15.3 18l1.2 2.8" /><path d="M19.2 2.8l1.9 2-1.9 2-1.9-2z" /></Icon>
);
export const RocketIcon = (props: IconProps) => (
  <Icon {...props}><path d="M12 2c-2.8 2.6-4.5 6.2-4.5 10v3h9v-3c0-3.8-1.7-7.4-4.5-10z" /><circle cx="12" cy="10" r="1.8" /><path d="M7.5 12l-3.5 4.5h3.5z" /><path d="M16.5 12l3.5 4.5h-3.5z" /><path d="M10 18c.4 1.4 1.1 2.4 2 3.4.9-1 1.6-2 2-3.4" /></Icon>
);
export const RotateIcon = (props: IconProps) => (
  <Icon {...props}><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" /></Icon>
);
export const SunIcon = (props: IconProps) => (
  <Icon {...props}><circle cx="12" cy="12" r="4" /><path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" /></Icon>
);
export const TrashIcon = (props: IconProps) => (
  <Icon {...props}><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M6 6l1 14a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-14" /></Icon>
);
export const UploadIcon = (props: IconProps) => (
  <Icon {...props}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="M17 8l-5-5-5 5" /><path d="M12 3v12" /></Icon>
);
export const ZapIcon = (props: IconProps) => (
  <Icon {...props}><path d="M13 2 4 14h7l-1 8 9-12h-7z" /></Icon>
);
