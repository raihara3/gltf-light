// lib
import { memo } from 'react';

// components
import Uploader from './sidebar/Uploader';
import Statistics from "./sidebar/Statistics";
import Animations from "./sidebar/Animations";
import Materials from "./sidebar/Materials";
import Textures from "./sidebar/Textures";

// styles
import styles from "../styles/components/sidebar.module.scss"

const Sidebar = () => {
  return (
    <aside className={styles.sidebar}>
      <Uploader />

      <Statistics />
      <Animations />
      <Materials />
      <Textures />
    </aside>
  );
}

export default memo(Sidebar);
