// lib
import { memo, Fragment, useState, useEffect, useCallback } from "react";
import { useRecoilValue, useSetRecoilState, useRecoilState } from "recoil";

// states
import { animationsState } from "../../state/atoms/ModelInfo";
import {
  currentSelectAnimationState,
  animationPlayingState,
  animationCurrentTimeState,
  animationSeekTimeState,
  animationDurationState,
} from "../../state/atoms/CurrentSelect";

const AnimationsMulti = () => {
  const animations = useRecoilValue(animationsState);
  const setCurrentSelectAnimation = useSetRecoilState(
    currentSelectAnimationState
  );
  const [isPlaying, setIsPlaying] = useRecoilState(animationPlayingState);
  const animationCurrentTime = useRecoilValue(animationCurrentTimeState);
  const setAnimationSeekTime = useSetRecoilState(animationSeekTimeState);
  const animationDuration = useRecoilValue(animationDurationState);
  const [selectedAnimations, setSelectedAnimations] = useState([]);

  useEffect(() => {
    if (animations.length > 0 && selectedAnimations.length === 0) {
      const firstAnimation = animations[0].name;
      setSelectedAnimations([firstAnimation]);
      setCurrentSelectAnimation([firstAnimation]);
    }
  }, [animations]);

  const handleAnimationToggle = (animationName) => {
    let newSelection;

    if (selectedAnimations.includes(animationName)) {
      newSelection = selectedAnimations.filter(
        (name) => name !== animationName
      );
    } else {
      newSelection = [...selectedAnimations, animationName];
    }
    setSelectedAnimations(newSelection);
    setCurrentSelectAnimation(newSelection);
    setIsPlaying(true);
  };

  const handlePlayToggle = useCallback(() => {
    setIsPlaying((previous) => !previous);
  }, [setIsPlaying]);

  const handleSeek = useCallback(
    (event) => {
      setAnimationSeekTime(parseFloat(event.target.value));
    },
    [setAnimationSeekTime]
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
              type="checkbox"
              name="animation"
              checked={selectedAnimations.includes(animation.name)}
              onChange={() => handleAnimationToggle(animation.name)}
            />
            {animation.name} ({frames}f / {duration}s @30fps)
          </label>
        );
      })}

      {selectedAnimations.length > 0 && animationDuration > 0 && (
        <div style={{ marginTop: '12px', padding: '0 8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <button
              className="button button--light"
              onClick={handlePlayToggle}
              style={{ padding: '4px 12px', fontSize: '12px' }}
            >
              {isPlaying ? "Stop" : "Play"}
            </button>
            <span style={{ fontSize: '12px' }}>
              {animationCurrentTime.toFixed(1)}s / {animationDuration.toFixed(1)}s
            </span>
          </div>
          <input
            type="range"
            min="0"
            max={animationDuration}
            step="0.01"
            value={animationCurrentTime}
            onChange={handleSeek}
            style={{ width: '100%' }}
          />
        </div>
      )}
    </Fragment>
  );
};

export default memo(AnimationsMulti);
