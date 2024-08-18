// lib
import { memo } from 'react';
import { useRecoilState } from 'recoil';

// states
import { upload3DModelSelector } from '../state/selectors/Upload3DModelSelector';

// components
import Uploader from './Uploader';

// styles
import commonStyles from "../styles/components/common.module.scss";
import layoutStyles from "../styles/layouts.module.scss";

const Sidebar = () => {
  const [upload3DModel, _] = useRecoilState(upload3DModelSelector);

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
    </aside>
  );
}

export default memo(Sidebar);
