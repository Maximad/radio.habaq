import { schedule } from './config.js';

function withPresenter(program) {
  return program?.presenter ? `مع ${program.presenter}` : '';
}

function trackLine(apiState) {
  return [apiState?.title, apiState?.artist].filter(Boolean).join(' — ');
}

function comparable(value = '') {
  return value
    .toLocaleLowerCase('ar')
    .replace(/[\sـ_\-|/\\:]+/gu, ' ')
    .trim();
}

export function matchProgramToPlaylist(apiState, programs = schedule) {
  const playlist = comparable(apiState?.playlistDisplay || apiState?.playlist || '');
  if (!playlist) return null;

  return (
    programs.find((program) => {
      const title = comparable(program?.title || '');
      return title && (playlist.includes(title) || title.includes(playlist));
    }) || null
  );
}

export function resolveBroadcastPresentation({
  apiState,
  activeProgram,
  nextProgram,
  radioConfig,
}) {
  const connected = Boolean(apiState?.connected);
  const onAir = Boolean(connected && (apiState?.isOnline || apiState?.isLive));
  const program = apiState?.isLive ? activeProgram : matchProgramToPlaylist(apiState);

  if (!onAir) {
    const connectionFailed = Boolean(apiState?.configured && !connected);
    return {
      mode: 'offline',
      onAir: false,
      statusLabel: connectionFailed ? 'تعذر الاتصال' : 'خارج البث',
      badgeLabel: connectionFailed ? 'تعذر قراءة حالة البث' : 'البث القادم',
      modeLabel: 'التالي',
      programLabel: nextProgram?.title || 'راديو حبق',
      title: nextProgram ? `${nextProgram.day} · ${nextProgram.time}` : 'نعود قريباً.',
      subtitle: nextProgram?.description || radioConfig.tagline,
      source: 'راديو حبق',
      cardTitle: nextProgram?.title || 'راديو حبق',
      cardSubtitle: nextProgram ? `${nextProgram.day} · ${nextProgram.time}` : '',
      dockTitle: nextProgram?.title || 'راديو حبق',
      dockSubtitle: 'خارج البث',
      documentTitle: 'راديو حبق',
      useArtwork: false,
    };
  }

  if (apiState.isLive && program) {
    const presenter = withPresenter(program);
    return {
      mode: 'live-program',
      onAir: true,
      statusLabel: 'مباشر الآن',
      badgeLabel: 'مباشر الآن',
      modeLabel: 'برنامج مباشر',
      programLabel: program.format || 'برنامج مباشر',
      title: program.title,
      subtitle: presenter || program.description || radioConfig.tagline,
      source: program.presenter || apiState.streamer || 'استوديو حبق',
      cardTitle: program.title,
      cardSubtitle: presenter || 'مباشر الآن',
      dockTitle: program.title,
      dockSubtitle: presenter || 'مباشر الآن',
      documentTitle: `${program.title} — مباشر — راديو حبق`,
      useArtwork: true,
    };
  }

  if (apiState.isLive) {
    return {
      mode: 'live',
      onAir: true,
      statusLabel: 'مباشر الآن',
      badgeLabel: 'مباشر الآن',
      modeLabel: 'بث مباشر',
      programLabel: apiState.streamer || 'استوديو حبق',
      title: apiState.title || 'راديو حبق',
      subtitle: apiState.artist || radioConfig.tagline,
      source: apiState.streamer || 'استوديو حبق',
      cardTitle: apiState.title || 'راديو حبق',
      cardSubtitle: apiState.artist || apiState.streamer || 'مباشر الآن',
      dockTitle: apiState.title || 'راديو حبق',
      dockSubtitle: apiState.artist || apiState.streamer || 'مباشر الآن',
      documentTitle: `${apiState.title || 'مباشر الآن'} — راديو حبق`,
      useArtwork: true,
    };
  }

  if (program) {
    const presenter = withPresenter(program);
    return {
      mode: 'program',
      onAir: true,
      statusLabel: 'على الهواء الآن',
      badgeLabel: 'على الهواء الآن',
      modeLabel: program.format || 'برنامج',
      programLabel: program.title,
      title: apiState.title || program.title,
      subtitle: apiState.artist || presenter || program.description || radioConfig.tagline,
      source: presenter || apiState.playlistDisplay || 'مكتبة راديو حبق',
      cardTitle: program.title,
      cardSubtitle: trackLine(apiState) || presenter || program.description || '',
      dockTitle: apiState.title || program.title,
      dockSubtitle: apiState.artist || program.title,
      documentTitle: `${program.title} — راديو حبق`,
      useArtwork: true,
    };
  }

  const rotation = apiState.playlistDisplay || 'اختيارات حبق';
  return {
    mode: 'rotation',
    onAir: true,
    statusLabel: 'على الهواء الآن',
    badgeLabel: 'على الهواء الآن',
    modeLabel: 'اختيارات حبق',
    programLabel: rotation,
    title: apiState.title || 'راديو حبق',
    subtitle: apiState.artist || radioConfig.tagline,
    source: rotation,
    cardTitle: apiState.title || 'راديو حبق',
    cardSubtitle: apiState.artist || rotation,
    dockTitle: apiState.title || 'راديو حبق',
    dockSubtitle: apiState.artist || rotation,
    documentTitle: `${apiState.title || rotation} — راديو حبق`,
    useArtwork: true,
  };
}
