import { MotionConfig } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { AppGlobalStyles } from './components/AppGlobalStyles';
import { NoteWidget } from './components/NoteWidget';
import { SettingsDrawer } from './components/SettingsDrawer';
import { TimerHud } from './components/TimerHud';
import { VideoBackground } from './components/VideoBackground';
import { THEME } from './constants/theme';
import { useVideos } from './hooks/useVideos';
import { usePomodoroTimer } from './hooks/usePomodoroTimer';
import { formatTime } from './utils/time';

const getCurrentTime = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

export default function KomoTerminal() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [volume, setVolume] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const [autoDim, setAutoDim] = useState(true);
  const [currentTime, setCurrentTime] = useState(getCurrentTime);
  const [noteAlign, setNoteAlign] = useState('center');
  const [isPinned, setIsPinned] = useState(false);
  const [visible, setVisible] = useState({
    timer: true,
    dock: true,
    volume: true,
    intent: true,
  });

  const iframeRef = useRef(null);

  const timer = usePomodoroTimer();
  const videoState = useVideos();
  const { loadVideos } = videoState;

  useEffect(() => {
    const clockInterval = setInterval(() => {
      setCurrentTime(getCurrentTime());
    }, 1000);

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setDrawerOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearInterval(clockInterval);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    loadVideos();
  }, [loadVideos]);

  useEffect(() => {
    document.title = `[${formatTime(timer.timeLeft)}] ${timer.mode.toUpperCase()}`;
  }, [timer.timeLeft, timer.mode]);

  const postPlayerCommand = (func, args = []) => {
    iframeRef.current?.contentWindow.postMessage(JSON.stringify({ event: 'command', func, args }), '*');
  };

  const toggleVideoPlay = () => {
    const action = isVideoPlaying ? 'pauseVideo' : 'playVideo';
    postPlayerCommand(action);
    setIsVideoPlaying((prev) => !prev);
  };

  const handleVolumeChange = (e) => {
    const newVol = parseInt(e.target.value, 10);
    setVolume(newVol);
    postPlayerCommand(newVol > 0 ? 'unMute' : 'mute');
    postPlayerCommand('setVolume', [newVol]);
  };

  const handleVideoLoad = () => {
    postPlayerCommand('setVolume', [volume]);
    if (volume > 0) {
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
        volume={volume}
        isVideoPlaying={isVideoPlaying}
        onSwitchMode={timer.switchMode}
        onToggleTimer={timer.toggleTimer}
        onResetTimer={timer.resetTimer}
        onToggleVideoPlay={toggleVideoPlay}
        onOpenDrawer={() => setDrawerOpen(true)}
        onVolumeChange={handleVolumeChange}
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
        onClose={() => setDrawerOpen(false)}
        onToggleVisible={toggleVisible}
        onToggleAutoDim={() => setAutoDim((prev) => !prev)}
        onUpdateDuration={timer.updateDuration}
        onManualInputChange={videoState.setManualInput}
        onManualSubmit={handleManualSubmit}
        onForceRefresh={videoState.forceRefresh}
        onSelectVideo={selectVideo}
        />
      </div>
    </MotionConfig>
  );
}
