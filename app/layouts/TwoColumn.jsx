// lib
import { memo } from 'react';

// styles
import styles from "../styles/layouts/twoColumn.module.scss"
import commonStyles from "../styles/components/common.module.scss"

const TwoColumn = ({ left, right, leftClassName = "", rightClassName = "" }) => {
  return (
    <div className={styles.layoutTwoColumn}>
      <div className={`${commonStyles.noteText} ${leftClassName}`}>
        {left}
      </div>
      <div className={`${commonStyles.noteText} ${commonStyles.textOverflow} ${rightClassName}`}>
        {right}
      </div>
    </div>
  )
}

export default memo(TwoColumn);