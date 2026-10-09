import { MotionConfig } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { AppGlobalStyles } from './components/AppGlobalStyles';
import { NoteWidget } from './components/NoteWidget';
import { SettingsDrawer } from './components/SettingsDrawer';
import { TimerHud } from './components/TimerHud';
import { VideoBackground } from './components/VideoBackground';
import { VideoCarousel } from './components/VideoCarousel';
import { THEME } from './constants/theme';
import { useVideos } from './hooks/useVideos';
import { usePomodoroTimer } from './hooks/usePomodoroTimer';
import { formatTime } from './utils/time';

const getCurrentTime = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

export default function KomoTerminal() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [carouselOpen, setCarouselOpen] = useState(false);
  const [pendingVideoId, setPendingVideoId] = useState(null);
  const [carouselDirection, setCarouselDirection] = useState(1);
  const [volume, setVolume] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const [autoDim, setAutoDim] = useState(true);
  const [currentTime, setCurrentTime] = useState(getCurrentTime);
  const [noteAlign, setNoteAlign] = useState('center');
  const [isPinned, setIsPinned] = useState(false);
  const [visible, setVisible] = useState({
    timer: true,
    dock: true,
    intent: false,
  });

  const iframeRef = useRef(null);
  const lastCarouselNavigationRef = useRef(0);
  const carouselAnimatingRef = useRef(false);
  const queuedCarouselStepRef = useRef(0);
  const carouselStateRef = useRef(null);

  const timer = usePomodoroTimer();
  const videoState = useVideos();
  const { loadVideos } = videoState;
  const { videos: loadedVideos, currentVid: loadedCurrentVid, selectVideo: selectLoadedVideo, forceRefresh, loading: videosLoading } = videoState;

  useEffect(() => {
    carouselStateRef.current = { videos: loadedVideos, pendingVideoId, currentVid: loadedCurrentVid };
  }, [loadedVideos, pendingVideoId, loadedCurrentVid]);

  // A canceled Framer Motion animation does not reliably reach its completion
  // callback. Release navigation state whenever the carousel closes so a
  // canceled move can never lock the next session.
  useEffect(() => {
    if (carouselOpen) return;
    carouselAnimatingRef.current = false;
    queuedCarouselStepRef.current = 0;
    lastCarouselNavigationRef.current = 0;
  }, [carouselOpen]);


  function navigateCarousel(offset) {
    if (carouselAnimatingRef.current) {
      queuedCarouselStepRef.current = offset;
      return;
    }
    const now = Date.now();
    if (now - lastCarouselNavigationRef.current < 200) return;
    lastCarouselNavigationRef.current = now;
    const { videos, pendingVideoId: pending, currentVid } = carouselStateRef.current;
    if (videos.length > 1) {
      carouselAnimatingRef.current = true;
      const preferredId = pending && videos.some((video) => video.id === pending) ? pending : currentVid;
      const index = videos.findIndex((video) => video.id === preferredId);
      setCarouselDirection(offset);
      setPendingVideoId(videos[(Math.max(0, index) + offset + videos.length) % videos.length].id);
    }
  }

  function finishCarouselAnimation() {
    carouselAnimatingRef.current = false;
    const queuedStep = queuedCarouselStepRef.current;
    queuedCarouselStepRef.current = 0;
    if (queuedStep) navigateCarousel(queuedStep);
  }

  useEffect(() => {
    const clockInterval = setInterval(() => {
      setCurrentTime(getCurrentTime());
    }, 1000);

    const handleKeyDown = (e) => {
      const target = e.target;
      const isEditing = target instanceof HTMLElement && (
        target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
      );
      const isInteractive = target instanceof HTMLElement && (
        target.closest('button, a[href], [role="button"], [contenteditable="true"]')
      );

      // Escape is handled before the focus guard so it works from buttons and
      // controls, including the volume slider. Dismiss the topmost screen first.
      if (e.key === 'Escape') {
        e.preventDefault();
        if (carouselOpen) {
          setPendingVideoId(null);
          setCarouselOpen(false);
        } else if (drawerOpen) {
          setDrawerOpen(false);
        } else {
          setDrawerOpen(true);
        }
        return;
      }
      if (isEditing || isInteractive) return;

      if (carouselOpen && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
        e.preventDefault();
        navigateCarousel(e.key === 'ArrowLeft' ? -1 : 1);
      } else if (carouselOpen && e.key.toLowerCase() === 'r' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        if (!videosLoading) forceRefresh();
      } else if (carouselOpen && e.key === 'Enter' && pendingVideoId) {
        e.preventDefault();
        const selectedId = loadedVideos.some((video) => video.id === pendingVideoId)
          ? pendingVideoId
          : loadedVideos.find((video) => video.id === loadedCurrentVid)?.id ?? loadedVideos[0]?.id;
        if (selectedId) selectLoadedVideo(selectedId);
        setPendingVideoId(null);
        setCarouselOpen(false);
      } else if (e.key.toLowerCase() === 'g' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        setDrawerOpen(false);
        setPendingVideoId(null);
        setCarouselOpen((open) => !open);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearInterval(clockInterval);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [carouselOpen, drawerOpen, loadedVideos, loadedCurrentVid, pendingVideoId, selectLoadedVideo, videosLoading, forceRefresh]);

  useEffect(() => {
    loadVideos();
  }, [loadVideos]);

  useEffect(() => {
    document.title = `[${formatTime(timer.timeLeft)}] ${timer.mode.toUpperCase()}`;
  }, [timer.timeLeft, timer.mode]);

  useEffect(() => {
    const handlePlayerMessage = (event) => {
      let data = event.data;

      if (typeof data === 'string') {
        try {
          data = JSON.parse(data);
        } catch {
          return;
        }
      }

      const playerState = data?.event === 'onStateChange' ? data.info : data?.info?.playerState;

      // YouTube iframe states: 1 = playing, 2 = paused, 0 = ended.
      if (playerState === 1) {
        setIsVideoPlaying(true);
      } else if (playerState === 2 || playerState === 0) {
        setIsVideoPlaying(false);
      }
    };

    window.addEventListener('message', handlePlayerMessage);
    return () => window.removeEventListener('message', handlePlayerMessage);
  }, []);

  const postPlayerCommand = (func, args = []) => {
    iframeRef.current?.contentWindow.postMessage(JSON.stringify({ event: 'command', func, args }), '*');
  };

  const toggleVideoPlay = () => {
    const action = isVideoPlaying ? 'pauseVideo' : 'playVideo';
    postPlayerCommand(action);
    setIsVideoPlaying((prev) => !prev);
  };

  const getPlayerVolume = (uiVolume) => {
    if (uiVolume <= 0) return 0;
    return Math.max(1, Math.round((uiVolume / 100) ** 2 * 100));
  };

  const handleVolumeChange = (e) => {
    const newVol = parseInt(e.target.value, 10);
    const playerVolume = getPlayerVolume(newVol);
    setVolume(newVol);
    postPlayerCommand(playerVolume > 0 ? 'unMute' : 'mute');
    postPlayerCommand('setVolume', [playerVolume]);

    // Mobile YouTube embeds can pause when audio is enabled/changed.
    // If the app believed the video was playing, retry play during this user gesture.
    if (playerVolume > 0 && isVideoPlaying) {
      postPlayerCommand('playVideo');
    }
  };

  const handleVideoLoad = () => {
    postPlayerCommand('addEventListener', ['onStateChange']);

    const playerVolume = getPlayerVolume(volume);
    postPlayerCommand('setVolume', [playerVolume]);
    if (playerVolume > 0) {
      postPlayerCommand('unMute');
    }
  };

  const handleManualSubmit = (e) => {
    if (e.key !== 'Enter') return;

    const submitted = videoState.submitManualVideo();
    if (submitted) {
      setDrawerOpen(false);
      setIsVideoPlaying(true);
      timer.setIsActive(false);
    }
  };

  const selectVideo = (videoId) => {
    videoState.selectVideo(videoId);
    setIsVideoPlaying(true);
    setDrawerOpen(false);
  };

  const toggleVisible = (key) => {
    setVisible((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <MotionConfig reducedMotion="user">
      <div
        style={{
        background: THEME.obsidian,
        color: THEME.alabaster,
        fontFamily: THEME.fontUi,
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        position: 'relative',
      }}
      >
        <AppGlobalStyles />

        <VideoBackground
          currentVid={videoState.currentVid}
        iframeRef={iframeRef}
        onVideoLoad={handleVideoLoad}
        isActive={timer.isActive}
        />

        <TimerHud
        mode={timer.mode}
        timeLeft={timer.timeLeft}
        isActive={timer.isActive}
        autoDim={autoDim}
        currentTime={currentTime}
        visible={visible}
        isVideoPlaying={isVideoPlaying}
        onSwitchMode={timer.switchMode}
        onToggleTimer={timer.toggleTimer}
        onResetTimer={timer.resetTimer}
        onToggleVideoPlay={toggleVideoPlay}
        onOpenDrawer={() => setDrawerOpen(true)}
        />

        <NoteWidget
        visible={visible}
        isActive={timer.isActive}
        autoDim={autoDim}
        isPinned={isPinned}
        noteAlign={noteAlign}
        onTogglePinned={() => setIsPinned((prev) => !prev)}
        onSetNoteAlign={setNoteAlign}
        />

        <VideoCarousel
        open={carouselOpen}
        videos={videoState.videos}
        currentVid={videoState.currentVid}
        pendingVideoId={loadedVideos.some((video) => video.id === pendingVideoId) ? pendingVideoId : null}
        direction={carouselDirection}
        loading={videoState.loading}
        statusMsg={videoState.statusMsg}
        onNavigate={navigateCarousel}
        onAnimationComplete={finishCarouselAnimation}
        onClose={() => { setPendingVideoId(null); setCarouselOpen(false); }}
        onSelectVideo={selectVideo}
        />

        <SettingsDrawer
        open={drawerOpen}
        visible={visible}
        autoDim={autoDim}
        durations={timer.durations}
        manualInput={videoState.manualInput}
        statusMsg={videoState.statusMsg}
        loading={videoState.loading}
        videos={videoState.videos}
        currentVid={videoState.currentVid}
        volume={volume}
        mode={timer.mode}
        isActive={timer.isActive}
        chimeEnabled={timer.chimeEnabled}
        onClose={() => setDrawerOpen(false)}
        onToggleVisible={toggleVisible}
        onToggleAutoDim={() => setAutoDim((prev) => !prev)}
        onUpdateDuration={timer.updateDuration}
        onManualInputChange={videoState.setManualInput}
        onManualSubmit={handleManualSubmit}
        onForceRefresh={videoState.forceRefresh}
        onSelectVideo={selectVideo}
        onVolumeChange={handleVolumeChange}
        onToggleTimer={timer.toggleTimer}
        onResetTimer={timer.resetTimer}
        onToggleChime={timer.toggleChime}
        />
      </div>
    </MotionConfig>
  );
}
