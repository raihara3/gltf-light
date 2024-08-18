// lib
import { memo, Fragment } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';

// states
import { animationsState } from "../../state/atoms/ModelInfo";
import { currentSelectAnimationState } from "../../state/atoms/CurrentSelect";

const Animations = () => {
  const animations = useRecoilValue(animationsState);
  const setCurrentSelectAnimation = useSetRecoilState(currentSelectAnimationState);

  return (
    <Fragment>
      <h3 className="title">Animations ({animations.length})</h3>
      {animations.map((animation, index) => (
        <label key={index} className="note text-overflow">
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
    </Fragment>
  )
}

export default memo(Animations);