// lib
import { memo } from 'react';
import { useRecoilState } from 'recoil';

// states
import { animationsState } from '../state/atoms/Upload3DModelAtom';
import { upload3DModelSelector } from '../state/selectors/Upload3DModelSelector';

// components
import Uploader from './Uploader';

// styles
import commonStyles from "../styles/components/common.module.scss";
import layoutStyles from "../styles/layouts.module.scss";

const Sidebar = () => {
  const [upload3DModel, setUpload3DModel] = useRecoilState(upload3DModelSelector);
  const [animations, setAnimations] = useRecoilState(animationsState);

  return (
    <aside>
      <Uploader />

      <div>
        <h3 className={commonStyles.menuTitle}>Statistics</h3>
        <div className={layoutStyles.layoutTwoColumn}>
          <div className={commonStyles.noteText}>Name:</div>
          <div className={commonStyles.noteText}>
            {upload3DModel.name}
          </div>
        </div>
        <div className={layoutStyles.layoutTwoColumn}>
          <div className={commonStyles.noteText}>Size:</div>
          <div className={commonStyles.noteText}>
            {upload3DModel.fileSize}
          </div>
        </div>
      </div>

      <div>
        <h3 className={commonStyles.menuTitle}>Animations</h3>
        {animations.map((animation, index) => (
          <div key={index} className={commonStyles.noteText}>
            {animation.name}
          </div>
        ))}
      </div>
    </aside>
  );
}

export default memo(Sidebar);
