// lib
import { memo } from 'react';

//styles
import styles from "../styles/components/header.module.scss"

const Header = () => {
  return (
    <header className={styles.header}>
      GLTF Light
    </header>
  )
}

export default memo(Header);