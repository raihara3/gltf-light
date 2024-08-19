// lib
import { memo, useState, useEffect } from 'react';
import { useRecoilValue } from 'recoil';

// states
import { logsState } from "../state/atoms/Logs";

// styles
import styles from "../styles/components/logbox.module.scss";

const Logbox = () => {
  const logs = useRecoilValue(logsState);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if(logs.length > 0) setIsOpen(true);
  }, [logs])

  return (
    <details className={styles.logbox} open={isOpen}>
      <summary className={styles.logboxTitle}>Logs</summary>
      <div className={styles.logboxText}>
        {logs.map((log, index) => (
          <div className={styles[log.logType.toLowerCase()]} key={index}>
            {log.logType}: {log.message}
          </div>
        ))}
      </div>
    </details>
  )
}

export default memo(Logbox);