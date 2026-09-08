export class RadioClient {
  constructor(config) {
    this.config = config;
    this.timer = null;
  }

  async fetchNowPlaying() {
    if (!this.config.nowPlayingUrl) {
      return {
        configured: false,
        connected: false,
        data: null,
        error: null,
      };
    }

    try {
      const response = await fetch(this.config.nowPlayingUrl, {
        headers: { Accept: 'application/json' },
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(`AzuraCast returned ${response.status}`);
      }

      return {
        configured: true,
        connected: true,
        data: await response.json(),
        error: null,
      };
    } catch (error) {
      return {
        configured: true,
        connected: false,
        data: null,
        error,
      };
    }
  }

  start(onUpdate) {
    const refresh = async () => {
      onUpdate(await this.fetchNowPlaying());
      this.timer = window.setTimeout(refresh, this.config.refreshMs);
    };

    refresh();
  }

  stop() {
    if (this.timer) window.clearTimeout(this.timer);
  }
}

export function formatPlaylistName(value = '') {
  return value
    .replace(/^\s*\d+\s*[-–—.:)]\s*/u, '')
    .split('|')[0]
    .trim();
}

export function normalizeNowPlaying(result, config) {
  const np = result?.data;
  const current = np?.now_playing || {};
  const song = current?.song || {};
  const live = np?.live || {};
  const station = np?.station || {};
  const mounts = station?.mounts || [];
  const nextSong = np?.playing_next?.song || {};
  const playlist = current?.playlist || '';

  return {
    configured: result?.configured ?? false,
    connected: result?.connected ?? false,
    isOnline: Boolean(np?.is_online),
    isLive: Boolean(live?.is_live),
    streamer: live?.streamer_name || '',
    title: song?.title || station?.name || 'راديو حبق',
    artist: song?.artist || '',
    art: live?.art || song?.art || '',
    listeners: np?.listeners?.current ?? null,
    elapsed: Number.isFinite(current?.elapsed) ? current.elapsed : null,
    duration: Number.isFinite(current?.duration) ? current.duration : null,
    playlist,
    playlistDisplay: formatPlaylistName(playlist),
    nextTitle: nextSong?.title || '',
    nextArtist: nextSong?.artist || '',
    history: Array.isArray(np?.song_history) ? np.song_history : [],
    streamUrl:
      config.streamUrl ||
      station?.listen_url ||
      mounts.find((mount) => mount?.is_default)?.url ||
      mounts[0]?.url ||
      '',
  };
}
