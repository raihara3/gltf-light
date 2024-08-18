// lib
import { memo } from 'react';

// styles
import styles from "../styles/layouts/twoColumn.module.scss"

const TwoColumn = ({ left, right, className = "" }) => {
  return (
    <div className={`${styles.layoutTwoColumn} ${className}`}>
      <div className={styles.left}>
        {left}
      </div>
      <div className={styles.right}>
        {right}
      </div>
    </div>
  )
}

export default memo(TwoColumn);