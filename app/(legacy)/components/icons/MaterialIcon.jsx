import { memo } from "react";

const MaterialIcon = ({ size = 12 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="9" />
    <circle cx="9" cy="9" r="1.6" fill="currentColor" stroke="none" />
  </svg>
);

export default memo(MaterialIcon);
