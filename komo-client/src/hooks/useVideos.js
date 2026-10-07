import { useCallback, useRef, useState } from 'react';
import { API_BASE_URL } from '../constants/config';
import { SEARCH_SEQUENCE } from '../constants/searchSequence';

const FALLBACK_VIDEO_ID = 'bF2IxrQLCcQ';

async function getRefreshError(res) {
  let message;
  try {
    const body = await res.json();
    if (typeof body?.error === 'string' && body.error.trim()) {
      message = body.error.trim();
    } else if (typeof body?.message === 'string' && body.message.trim()) {
      message = body.message.trim();
    }
  } catch {
    // Some server/proxy errors do not return JSON.
  }

  if (message) return message.slice(0, 160);
  if (res.status >= 500) return 'The video service is having trouble. Please try again shortly.';
  if (res.status === 429) return 'Refresh rate limited. Please try again shortly.';
  return `Request failed (HTTP ${res.status}). Please try again.`;
}

export function useVideos() {
  const [videos, setVideos] = useState([]);
  const [currentVid, setCurrentVid] = useState(FALLBACK_VIDEO_ID);
  const [loading, setLoading] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [statusMsg, setStatusMsg] = useState('> SYSTEM IDLE');
  const refreshInFlightRef = useRef(false);

  const loadVideos = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/videos`);
      if (!res.ok) throw new Error('Failed to load videos');

      const data = await res.json();
      if (data.length > 0) {
        setVideos(data);
        setStatusMsg('LAST REFRESH');
      } else {
        setStatusMsg('> NO VIDEOS FOUND //');
        setTimeout(loadVideos, 2000);
      }
    } catch {
      setStatusMsg('// CONNECTION LOST //');
    }
  }, []);

  const forceRefresh = async () => {
    if (refreshInFlightRef.current) return;
    refreshInFlightRef.current = true;
    setLoading(true);
    let step = 0;
    setStatusMsg(SEARCH_SEQUENCE[0]);

    const sequenceId = setInterval(() => {
      step = (step + 1) % SEARCH_SEQUENCE.length;
      setStatusMsg(SEARCH_SEQUENCE[step]);
    }, 600);

    try {
      const res = await fetch(`${API_BASE_URL}/api/videos/refresh`, { method: 'POST' });

      if (!res.ok) {
        if (res.status === 429) {
          const retryAfter = res.headers.get('Retry-After') ?? '30';
          throw new Error(`Refresh rate limited. Try again in ${retryAfter}s`);
        }
        throw new Error(await getRefreshError(res));
      }

      const data = await res.json();
      setVideos(data);
      setStatusMsg(`SUCCESSFULLY UPDATED > [${data.length}] NEW VIDEOS LOADED`);
    } catch (error) {
      setStatusMsg(error.message?.includes('rate limited')
        ? `REFRESH LOCKED > ${error.message}`
        : `REFRESH FAILED > ${error.message || 'Unable to contact the video service. Check your connection and try again.'}`);
    } finally {
      clearInterval(sequenceId);
      refreshInFlightRef.current = false;
      setLoading(false);
    }
  };

  const selectVideo = (videoId) => {
    setCurrentVid(videoId);
  };

  const submitManualVideo = () => {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = manualInput.match(regExp);
    const id = match && match[7].length === 11 ? match[7] : false;

    if (!id) {
      setStatusMsg(':: ERROR // INVALID COORDINATES ::');
      return false;
    }

    setCurrentVid(id);
    setManualInput('');
    return true;
  };

  return {
    videos,
    currentVid,
    loading,
    manualInput,
    statusMsg,
    loadVideos,
    forceRefresh,
    selectVideo,
    submitManualVideo,
    setManualInput,
  };
}
