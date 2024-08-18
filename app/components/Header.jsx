// lib
import { memo } from 'react';

//styles
import styles from "../styles/components/header.module.scss"

const Header = () => {
  return (
    <header className={styles.header}>
      GLTF Light
      <img src="/images/rocket.png" alt="rocket" width="30" height="30" />
    </header>
  )
}

export default memo(Header);