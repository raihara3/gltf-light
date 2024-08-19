// lib
import { memo } from 'react';

//styles
import styles from "../styles/components/header.module.scss"

const Header = () => {
  return (
    <header className={styles.header}>
      <div className={styles.left}>
        GLTF Light
        <img src="/images/rocket.png" alt="rocket" width="30" height="30" />
      </div>
      <div className={styles.right}>
        <a href="https://x.com/raihara3" target='_blank'>raihara3</a>
      </div>
    </header>
  )
}

export default memo(Header);