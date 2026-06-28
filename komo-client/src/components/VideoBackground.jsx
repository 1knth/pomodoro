export function VideoBackground({ currentVid, iframeRef, onVideoLoad, isActive }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', background: '#000' }}>
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%) scale(1.3)',
          width: '100vw',
          height: '56.25vw',
          minHeight: '100vh',
          minWidth: '177.77vh',
          opacity: isActive ? 1 : 0.4,
          transition: 'opacity 1s ease',
          filter: isActive ? 'none' : 'grayscale(100%) contrast(1.1)',
        }}
      >
        <iframe
          ref={iframeRef}
          title="Ambient YouTube video background"
          onLoad={onVideoLoad}
          width="100%"
          height="100%"
          src={`https://www.youtube.com/embed/${currentVid}?autoplay=1&mute=1&controls=0&loop=1&playlist=${currentVid}&showinfo=0&modestbranding=1&iv_load_policy=3&enablejsapi=1`}
          frameBorder="0"
          allow="autoplay; encrypted-media"
        />
      </div>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle, transparent 20%, rgba(5,5,6,0.95) 100%)' }} />
    </div>
  );
}
