import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { motion as Motion, useAnimationControls, useReducedMotion } from 'framer-motion';
import { THEME } from '../constants/theme';

export function VideoCarousel({ open, videos, currentVid, pendingVideoId, loading = false, statusMsg, onClose, onNavigate, onAnimationComplete }) {
  const shouldReduceMotion = useReducedMotion();
  const controls = useAnimationControls();
  const selectedId = pendingVideoId ?? currentVid;
  const currentIndex = Math.max(0, videos.findIndex((video) => video.id === selectedId));
  const previousIndexRef = useRef(currentIndex);
  const wasOpenRef = useRef(false);
  const trackAnimationIdRef = useRef(0);
  const onAnimationCompleteRef = useRef(onAnimationComplete);
  const trackOffset = useCallback((slot) => `-${(slot + 0.5) * 100 / (videos.length + 2)}%`, [videos.length]);

  useLayoutEffect(() => {
    onAnimationCompleteRef.current = onAnimationComplete;
  }, [onAnimationComplete]);

  useLayoutEffect(() => {
    if (!open) {
      // The carousel track has its own imperative animation, independent of the
      // overlay's exit. Stop it so a pending wrap/reset cannot move the track
      // while AnimatePresence is fading the carousel out.
      trackAnimationIdRef.current += 1;
      controls.stop();
      previousIndexRef.current = currentIndex;
      wasOpenRef.current = false;
      return;
    }

    const normalized = currentIndex + (videos.length > 1 ? 1 : 0);
    if (!wasOpenRef.current) {
      previousIndexRef.current = currentIndex;
      wasOpenRef.current = true;
      if (videos.length > 1) controls.set({ x: trackOffset(normalized) });
      return;
    }
    if (videos.length <= 1) return;

    const previousIndex = previousIndexRef.current;
    const isForwardWrap = previousIndex === videos.length - 1 && currentIndex === 0;
    const isReverseWrap = previousIndex === 0 && currentIndex === videos.length - 1;
    const destination = isForwardWrap ? videos.length + 1 : isReverseWrap ? 0 : currentIndex + 1;
    previousIndexRef.current = currentIndex;

    const animationId = ++trackAnimationIdRef.current;
    controls.start({ x: trackOffset(destination), transition: shouldReduceMotion ? { duration: 0 } : { type: 'tween', duration: 0.4, ease: 'easeInOut' } }).then(() => {
      if (animationId !== trackAnimationIdRef.current) return;
      if (isForwardWrap || isReverseWrap) controls.set({ x: trackOffset(normalized) });
      onAnimationCompleteRef.current?.();
    });
  }, [open, currentIndex, videos.length, shouldReduceMotion, controls, trackOffset]);
  const move = (offset) => {
    if (videos.length > 1) {
      onNavigate?.(offset);
    }
  };
  const current = videos[currentIndex];
  const displayVideos = videos.length > 1
    ? [videos[videos.length - 1], ...videos, videos[0]]
    : videos;
  const displayIndex = videos.length > 1 ? currentIndex + 1 : currentIndex;

  // The sentinel cards are already in the track, but their image requests may
  // otherwise start only as the user reaches the boundary. Warm boundary assets
  // as soon as the feed arrives so the cloned card can render without a blank.
  useEffect(() => {
    if (videos.length < 2) return;
    [videos[0], videos[videos.length - 1]].forEach((video) => {
      [video.thumb, video.channelAvatar || video.channelThumbnail || video.avatar || video.author?.avatar]
        .filter(Boolean)
        .forEach((src) => {
          const image = new Image();
          image.src = src;
        });
    });
  }, [videos]);

  return (
    <>
      {open && (
        <div
          key="video-carousel-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Video carousel"
          onClick={(event) => event.target === event.currentTarget && onClose()}
          style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'grid', placeItems: 'center', padding: '20px', boxSizing: 'border-box', background: 'rgba(5, 5, 6, 0.78)', backdropFilter: 'blur(5px)', pointerEvents: open ? 'auto' : 'none' }}
        >
          <section
            style={{ width: 'min(100%, 1280px)', color: THEME.alabaster, fontFamily: THEME.fontUi }}
          >
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <span style={{ color: '#aaa', fontSize: 13 }}>{videos.length ? `${currentIndex + 1} / ${videos.length}` : 'Videos'}</span>
            </header>
            {current ? (
              <>
              <div style={{ display: 'grid', gridTemplateColumns: 'clamp(36px, 5vw, 56px) minmax(0, 1fr) clamp(36px, 5vw, 56px)', alignItems: 'stretch', boxSizing: 'border-box' }}>
                <button type="button" onClick={() => move(-1)} aria-label="Previous video" style={{ ...arrowStyle, position: 'static', transform: 'none', width: '100%', height: '100%' }}>‹</button>
                <div style={{ position: 'relative', height: 'clamp(220px, 32vw, 420px)', minWidth: 0, overflow: 'hidden', boxSizing: 'border-box' }}>
                  <Motion.div
                    style={{ display: 'flex', alignItems: 'center', height: '100%', width: `${displayVideos.length * 100 / 3}%`, position: 'absolute', left: '50%', gap: 0 }}
                    initial={false}
                    animate={controls}
                    transition={shouldReduceMotion ? { duration: 0 } : { type: 'tween', duration: 0.4, ease: 'easeInOut' }}
                  >
                  {displayVideos.map((video, slotIndex) => {
                    const isSelected = slotIndex === displayIndex;
                    const direction = slotIndex < displayIndex ? -1 : 1;
                    return (
                      <div
                        key={`${slotIndex}-${video.id}`}
                        aria-label={isSelected ? `Selected video: ${video.title}` : undefined}
                        style={{ flex: `0 0 ${100 / displayVideos.length}%`, minWidth: 0, boxSizing: 'border-box', padding: '12px clamp(4px, 0.5vw, 8px)', color: 'inherit', textAlign: 'left', opacity: isSelected ? 1 : 0.72, transform: isSelected ? 'scale(1)' : 'scale(.94)', transition: shouldReduceMotion ? 'none' : 'opacity .4s ease-in-out, transform .4s ease-in-out' }}
                      >
                        <button type="button" onClick={() => !isSelected && move(direction)} aria-label={isSelected ? `Selected video: ${video.title}` : `${direction < 0 ? 'Previous' : 'Next'} video: ${video.title}`} style={{ display: 'block', width: '100%', padding: 0, border: 0, background: 'transparent', color: 'inherit', cursor: isSelected ? 'default' : 'pointer', textAlign: 'left' }}>
                          <Motion.img src={video.thumb} alt="" style={{ ...imageStyle, aspectRatio: '16 / 9', borderRadius: 3 }} animate={{ boxShadow: isSelected ? '0 12px 32px rgba(0,0,0,.36), 0 0 52px rgba(255,255,255,.12), 0 0 18px rgba(255,255,255,.20)' : 'none' }} transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.24 }} />
                          {isSelected ? <ChannelMetadata video={video} /> : <span style={sideTitleStyle}>{video.title}</span>}
                        </button>
                      </div>
                    );
                  })}
                  </Motion.div>
                  <div aria-hidden="true" style={{ position: 'absolute', inset: '0 auto 0 0', width: 'clamp(20px, 5vw, 64px)', pointerEvents: 'none', background: 'linear-gradient(90deg, rgba(5,5,6,.38), transparent)', backdropFilter: 'blur(5px)', WebkitBackdropFilter: 'blur(5px)', maskImage: 'linear-gradient(90deg, #000 0%, transparent 100%)', WebkitMaskImage: 'linear-gradient(90deg, #000 0%, transparent 100%)' }} />
                  <div aria-hidden="true" style={{ position: 'absolute', inset: '0 0 0 auto', width: 'clamp(20px, 5vw, 64px)', pointerEvents: 'none', background: 'linear-gradient(270deg, rgba(5,5,6,.38), transparent)', backdropFilter: 'blur(5px)', WebkitBackdropFilter: 'blur(5px)', maskImage: 'linear-gradient(270deg, #000 0%, transparent 100%)', WebkitMaskImage: 'linear-gradient(270deg, #000 0%, transparent 100%)' }} />
                </div>
                <button type="button" onClick={() => move(1)} aria-label="Next video" style={{ ...arrowStyle, position: 'static', transform: 'none', width: '100%', height: '100%' }}>›</button>
              </div>
              <div style={{ marginTop: 20, textAlign: 'center', color: '#bbb', fontSize: 13 }}>Use ← / → to choose, <strong style={{ color: THEME.alabaster }}>R</strong> to reload the feed, then press <strong style={{ color: THEME.alabaster }}>Enter</strong> to play. Esc cancels.{loading && <span role="status"> Reloading…</span>}</div>
              {!loading && statusMsg?.startsWith('REFRESH FAILED') && <div role="status" style={{ marginTop: 8, textAlign: 'center', color: '#e99', fontSize: 12 }}>{statusMsg.replace(/^REFRESH FAILED > /, '')}</div>}
              </>
            ) : (
              <div role="status" style={{ padding: 32, textAlign: 'center', color: '#aaa' }}>{loading ? 'Reloading videos…' : 'No videos loaded'}</div>
            )}
          </section>
        </div>
      )}
    </>
  );
}

function ChannelMetadata({ video }) {
  const channelName = video.channelName || video.channelTitle || video.author?.name || 'Channel unavailable';
  const avatar = video.channelAvatar || video.channelThumbnail || video.avatar || video.author?.avatar;
  const [avatarFailed, setAvatarFailed] = useState(false);
  const initials = channelName === 'Channel unavailable' ? '?' : channelName.trim().charAt(0).toUpperCase();

  return (
    <div style={metadataLayoutStyle}>
      {avatar && !avatarFailed ? (
        <img src={avatar} alt="" onError={() => setAvatarFailed(true)} style={avatarStyle} />
      ) : (
        <span aria-hidden="true" style={avatarFallbackStyle}>{initials}</span>
      )}
      <div style={metadataTextStyle}>
        <div style={currentTitleStyle}>{video.title}</div>
        <span style={channelNameStyle}>{channelName}</span>
      </div>
    </div>
  );
}

const imageStyle = { display: 'block', width: '100%', height: '100%', objectFit: 'cover' };
const currentTitleStyle = { marginTop: 12, color: THEME.alabaster, fontSize: 'clamp(14px, 1.25vw, 17px)', fontWeight: 600, lineHeight: 1.35, textAlign: 'left', textShadow: '0 0 16px rgba(255,255,255,.16)', overflowWrap: 'anywhere', display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 2, overflow: 'hidden' };
const metadataLayoutStyle = { display: 'flex', alignItems: 'center', gap: 'clamp(9px, 1.4vw, 16px)', marginTop: 12, minWidth: 0, textAlign: 'left' };
const metadataTextStyle = { flex: '1 1 auto', minWidth: 0 };
const channelNameStyle = { display: 'block', marginTop: 5, color: '#bbb', fontSize: 'clamp(12px, 1.1vw, 14px)', lineHeight: 1.25, textShadow: '0 0 14px rgba(255,255,255,.12)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' };
const avatarStyle = { width: 'clamp(36px, 4.5vw, 56px)', height: 'clamp(36px, 4.5vw, 56px)', flex: '0 0 clamp(36px, 4.5vw, 56px)', borderRadius: '50%', objectFit: 'cover' };
const avatarFallbackStyle = { ...avatarStyle, display: 'grid', placeItems: 'center', background: '#333', color: THEME.alabaster, fontSize: 14, fontWeight: 600 };
const sideTitleStyle = { display: 'block', marginTop: 9, color: '#d0d0d0', fontSize: 'clamp(11px, 1vw, 13px)', fontWeight: 500, lineHeight: 1.35, textAlign: 'center', overflowWrap: 'anywhere' };
const arrowStyle = { position: 'absolute', top: '50%', transform: 'translateY(-50%)', width: 40, height: 64, padding: 0, border: 'none', background: 'transparent', color: THEME.alabaster, cursor: 'pointer', fontSize: 56, fontWeight: 200, lineHeight: 1, textShadow: '0 2px 12px #000' };
