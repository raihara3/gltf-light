// lib
import { memo, Fragment, useState, useEffect } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";

// states
import { animationsState } from "../../state/atoms/ModelInfo";
import { currentSelectAnimationState } from "../../state/atoms/CurrentSelect";

const AnimationsMulti = () => {
  const animations = useRecoilValue(animationsState);
  const setCurrentSelectAnimation = useSetRecoilState(
    currentSelectAnimationState
  );
  const [selectedAnimations, setSelectedAnimations] = useState([]);

  // Three.jsビューワーを常に使用
  const useThreeViewer = true;

  useEffect(() => {
    // 初回ロード時に最初のアニメーションを自動選択（autoplay）
    if (animations.length > 0 && selectedAnimations.length === 0) {
      const firstAnimation = animations[0].name;
      setSelectedAnimations([firstAnimation]);
      setCurrentSelectAnimation([firstAnimation]);
    }
  }, [animations]);

  const handleAnimationToggle = (animationName) => {
    let newSelection;

    if (useThreeViewer) {
      // Three.jsビューワーの場合は複数選択可能
      if (selectedAnimations.includes(animationName)) {
        newSelection = selectedAnimations.filter(
          (name) => name !== animationName
        );
      } else {
        newSelection = [...selectedAnimations, animationName];
      }
      setSelectedAnimations(newSelection);
      setCurrentSelectAnimation(newSelection);
    } else {
      // model-viewerの場合は単一選択のまま
      setSelectedAnimations([animationName]);
      setCurrentSelectAnimation(animationName);
    }
  };

  return (
    <Fragment>
      <h3 className="title">Animations ({animations.length})</h3>
      {animations.map((animation, index) => {
        const duration = animation.duration.toFixed(1);
        const frames = Math.round(animation.duration * 30);
        return (
          <label key={index} className="note text-overflow">
            <input
              type={useThreeViewer ? "checkbox" : "radio"}
              name="animation"
              checked={
                useThreeViewer
                  ? selectedAnimations.includes(animation.name)
                  : selectedAnimations[0] === animation.name
              }
              onChange={() => handleAnimationToggle(animation.name)}
            />
            {animation.name} ({frames}f / {duration}s @30fps)
          </label>
        );
      })}
    </Fragment>
  );
};

export default memo(AnimationsMulti);
