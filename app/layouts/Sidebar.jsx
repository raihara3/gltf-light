// lib
import { memo } from 'react';

// components
import Uploader from '../components/sidebar/Uploader';
import Statistics from "../components/sidebar/Statistics";
import Animations from "../components/sidebar/Animations";
import Materials from "../components/sidebar/Materials";
import Textures from "../components/sidebar/Textures";

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
