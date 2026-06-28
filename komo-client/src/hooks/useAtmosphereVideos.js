import { useCallback, useState } from 'react';
import { API_BASE_URL } from '../constants/config';
import { SEARCH_SEQUENCE } from '../constants/searchSequence';

const FALLBACK_VIDEO_ID = 'bF2IxrQLCcQ';

export function useAtmosphereVideos() {
  const [videos, setVideos] = useState([]);
  const [currentVid, setCurrentVid] = useState(FALLBACK_VIDEO_ID);
  const [loading, setLoading] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [statusMsg, setStatusMsg] = useState('> SYSTEM IDLE');

  const loadCache = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/atmosphere`);
      if (!res.ok) throw new Error('Failed to load atmosphere videos');

      const data = await res.json();
      if (data.length > 0) {
        setVideos(data);
        setStatusMsg('LAST REFRESH');
      } else {
        setStatusMsg('> VAULT EMPTY //');
        setTimeout(loadCache, 2000);
      }
    } catch {
      setStatusMsg('// CONNECTION LOST //');
    }
  }, []);

  const forceRefresh = async () => {
    setLoading(true);
    let step = 0;
    setStatusMsg(SEARCH_SEQUENCE[0]);

    const sequenceId = setInterval(() => {
      step = (step + 1) % SEARCH_SEQUENCE.length;
      setStatusMsg(SEARCH_SEQUENCE[step]);
    }, 600);

    try {
      const res = await fetch(`${API_BASE_URL}/api/refresh`, { method: 'POST' });

      if (res.status === 429) {
        const retryAfter = res.headers.get('Retry-After') ?? '30';
        throw new Error(`Refresh rate limited. Try again in ${retryAfter}s`);
      }
      if (!res.ok) throw new Error('Failed to refresh atmosphere videos');

      const data = await res.json();
      setVideos(data);
      setStatusMsg(`SUCCESSFULLY UPDATED > [${data.length}] NEW VIDEOS LOADED`);
    } catch (error) {
      setStatusMsg(error.message?.includes('rate limited')
        ? `REFRESH LOCKED > ${error.message}`
        : 'REFRESH FAILED > PLEASE TRY AGAIN...');
    } finally {
      clearInterval(sequenceId);
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
    loadCache,
    forceRefresh,
    selectVideo,
    submitManualVideo,
    setManualInput,
  };
}
