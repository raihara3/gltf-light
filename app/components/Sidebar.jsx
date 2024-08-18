// lib
import { memo } from 'react';
import { useRecoilValue } from 'recoil';

// states
import {
  texturesState,
 } from "../state/atoms/ModelInfo";

// components
import Uploader from './sidebar/Uploader';
import Statistics from "./sidebar/Statistics";
import Animations from "./sidebar/Animations";
import Materials from "./sidebar/Materials";

// styles
import commonStyles from "../styles/components/common.module.scss";
import layoutStyles from "../styles/layouts.module.scss";
import styles from "../styles/components/sidebar.module.scss"

const Sidebar = () => {
  const textures = useRecoilValue(texturesState);

  return (
    <aside className={styles.sidebar}>
      <Uploader />

      <Statistics />
      <Animations />
      <Materials />

      <div>
        <h3 className={commonStyles.menuTitle}>Textures ({textures.length})</h3>
        {textures.map((texture, index) => (
          <div key={index} className={layoutStyles.layoutTwoColumn}>
            <div>
              <img src={texture.src} style={{width: "100%"}}/>
            </div>
            <div className={`${commonStyles.noteText} ${commonStyles.textOverflow}`}>
              {texture.name}<br />
              w{texture.width}px / h{texture.height}px
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}

export default memo(Sidebar);
