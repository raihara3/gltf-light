// lib
import { memo } from 'react';

// components
import Uploader from './Uploader';

const Sidebar = () => {
  return (
    <aside>
      <Uploader />
    </aside>
  );
}

export default memo(Sidebar);
