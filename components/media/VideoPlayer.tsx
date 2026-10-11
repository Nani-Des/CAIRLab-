'use client';

// components/media/VideoPlayer.tsx
// A <video> with native browser controls hidden, replaced by a single
// centered play/pause button (like YouTube's paused-state overlay). Click
// or tap anywhere on the video or the button to toggle. While playing, the
// button auto-hides after a couple of seconds and reappears on the next
// tap/click — a timer, not a CSS :hover, so it also works correctly on
// touch screens (mobile has no "hover" to leave, so a hover-based fade
// would otherwise get stuck visible after the first tap).

import { useEffect, useRef, useState } from 'react';

const AUTO_HIDE_MS = 2000;

export default function VideoPlayer({
  src,
  poster,
  style,
}: {
  src: string;
  poster?: string;
  style?: React.CSSProperties;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [playing, setPlaying] = useState(false);
  const [showButton, setShowButton] = useState(true);

  useEffect(() => {
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, []);

  const scheduleHide = () => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setShowButton(false), AUTO_HIDE_MS);
  };

  const revealButton = () => {
    setShowButton(true);
    if (videoRef.current && !videoRef.current.paused) scheduleHide();
  };

  const toggle = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play();
    else v.pause();
  };

  return (
    <div className="cl-video-player">
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        playsInline
        preload="metadata"
        style={style}
        onClick={() => {
          toggle();
          revealButton();
        }}
        onPlay={() => {
          setPlaying(true);
          scheduleHide();
        }}
        onPause={() => {
          setPlaying(false);
          if (hideTimer.current) clearTimeout(hideTimer.current);
          setShowButton(true);
        }}
      />
      <button
        type="button"
        className={`cl-video-toggle${playing && !showButton ? ' cl-video-toggle--hidden' : ''}`}
        onClick={() => {
          toggle();
          revealButton();
        }}
        aria-label={playing ? 'Pause video' : 'Play video'}
      >
        <i className={`fa-solid ${playing ? 'fa-pause' : 'fa-play'}`} aria-hidden="true"></i>
      </button>
    </div>
  );
}
