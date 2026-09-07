const trimSlash = (value = '') => value.replace(/\/+$/, '');

const azuracastUrl = trimSlash(import.meta.env.VITE_AZURACAST_URL || '');
const stationShortcode = import.meta.env.VITE_AZURACAST_STATION || '';

export const radioConfig = {
  stationName: 'راديو حبق',
  tagline: 'موسيقى، أصوات، وحكايات تُسمع.',
  azuracastUrl,
  stationShortcode,
  nowPlayingUrl:
    import.meta.env.VITE_AZURACAST_NOW_PLAYING_URL ||
    (azuracastUrl && stationShortcode
      ? `${azuracastUrl}/api/nowplaying/${stationShortcode}`
      : ''),
  streamUrl: import.meta.env.VITE_STREAM_URL || '',
  refreshMs: 15000,
};

export const schedule = [
  {
    day: 'الأحد',
    time: '20:00',
    durationMinutes: 60,
    title: 'المسّال الموسيقي',
    description: 'جلسة استماع مخصصة لألبوم، فنان، أو تجربة موسيقية.',
  },
  {
    day: 'الثلاثاء',
    time: '20:00',
    durationMinutes: 60,
    title: 'راديو مكسور',
    description: 'موسيقى بديلة وحوار مع موسيقيين من سوريا والمنطقة والشتات.',
  },
  {
    day: 'الخميس',
    time: '20:00',
    durationMinutes: 120,
    title: 'ليلة حبق',
    description: 'بث موسيقي حي أو DJ set واختيارات ليلية.',
  },
];
