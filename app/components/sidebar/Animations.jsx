// lib
import { memo, Fragment } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";

// states
import { animationsState } from "../../state/atoms/ModelInfo";
import { currentSelectAnimationState } from "../../state/atoms/CurrentSelect";

const Animations = () => {
  const animations = useRecoilValue(animationsState);
  const setCurrentSelectAnimation = useSetRecoilState(
    currentSelectAnimationState
  );

  return (
    <Fragment>
      <h3 className="title">Animations ({animations.length})</h3>
      {animations.map((animation, index) => {
        const duration = animation.duration.toFixed(1);
        const frames = Math.round(animation.duration * 30);
        return (
          <label key={index} className="note text-overflow">
            <input
              type="radio"
              name="animation"
              onChange={() => {
                setCurrentSelectAnimation(animation.name);
              }}
            />
            {animation.name} ({frames}f / {duration}s @30fps)
          </label>
        );
      })}
    </Fragment>
  );
};

export default memo(Animations);
