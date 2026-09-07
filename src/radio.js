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

export function normalizeNowPlaying(result, config) {
  const np = result?.data;
  const song = np?.now_playing?.song || {};
  const live = np?.live || {};
  const station = np?.station || {};
  const mounts = station?.mounts || [];

  return {
    configured: result?.configured ?? false,
    connected: result?.connected ?? false,
    isLive: Boolean(live?.is_live),
    streamer: live?.streamer_name || '',
    title: song?.title || 'راديو حبق',
    artist: song?.artist || '',
    art: song?.art || '',
    listeners: np?.listeners?.current ?? null,
    history: Array.isArray(np?.song_history) ? np.song_history : [],
    streamUrl:
      config.streamUrl ||
      station?.listen_url ||
      mounts.find((mount) => mount?.is_default)?.url ||
      mounts[0]?.url ||
      '',
  };
}
