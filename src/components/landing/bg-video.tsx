import React from 'react';

type Props = {
  src: string;
  poster?: string;
  className?: string;
  /** Extra element rendered above the video, e.g. a darkening overlay */
  overlayClassName?: string;
};

/**
 * Ambient background video for the marketing site: muted, looping, lazy —
 * playback only starts when the element is on screen. If the file is missing
 * or fails to load, it renders nothing so the design underneath shows through.
 */
export default function BgVideo({ src, poster, className = '', overlayClassName }: Props) {
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const [failed, setFailed] = React.useState(false);
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const node = videoRef.current;
    if (!node || typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            node.play().catch(() => {});
          } else {
            node.pause();
          }
        });
      },
      { threshold: 0.1 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [failed]);

  if (failed) return null;

  return (
    <>
      <video
        ref={videoRef}
        className={`pointer-events-none absolute inset-0 h-full w-full object-cover ${className}`}
        src={visible ? src : undefined}
        poster={poster}
        muted
        loop
        playsInline
        autoPlay
        preload="none"
        aria-hidden="true"
        onError={() => setFailed(true)}
      />
      {overlayClassName && (
        <div className={`pointer-events-none absolute inset-0 ${overlayClassName}`} />
      )}
    </>
  );
}
