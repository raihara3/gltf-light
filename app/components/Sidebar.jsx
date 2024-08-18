// lib
import { Fragment, memo } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';

// states
import {
  animationsState,
  materialsState,
  texturesState,
 } from "../state/atoms/ModelInfo";
import { currentSelectAnimationState } from '../state/atoms/CurrentSelect';
import { upload3DModelSelector } from '../state/selectors/Upload3DModelSelector';

// components
import Uploader from './sidebar/Uploader';
import Statistics from "./sidebar/Statistics";

// styles
import commonStyles from "../styles/components/common.module.scss";
import layoutStyles from "../styles/layouts.module.scss";
import styles from "../styles/components/sidebar.module.scss"

const Sidebar = () => {
  const animations = useRecoilValue(animationsState);
  const materials = useRecoilValue(materialsState);
  const textures = useRecoilValue(texturesState);
  const setCurrentSelectAnimation = useSetRecoilState(currentSelectAnimationState);

  return (
    <aside className={styles.sidebar}>
      <Uploader />

      <Statistics />

      <div>
        <h3 className={commonStyles.menuTitle}>Animations ({animations.length})</h3>
        {animations.map((animation, index) => (
          <label key={index} className={`${commonStyles.noteText} ${commonStyles.textOverflow}`}>
            <input
              type="radio"
              name="animation"
              onChange={() => {
                setCurrentSelectAnimation(animation.name);
              }}
            />
            {animation.name}
          </label>
        ))}
      </div>

      <div>
        <h3 className={commonStyles.menuTitle}>Materials ({materials.length})</h3>
        {materials.map((material, index) => (
          <div key={index} className={`${commonStyles.noteText} ${commonStyles.textOverflow}`}>
            {material.name}
          </div>
        ))}
      </div>

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
