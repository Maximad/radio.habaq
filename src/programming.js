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

export function matchProgramToPlaylist(apiState, schedule = []) {
  const playlist = comparable(apiState?.playlistDisplay || apiState?.playlist || '');
  if (!playlist) return null;

  return (
    schedule.find((program) => {
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

  if (apiState.isLive && activeProgram) {
    const presenter = withPresenter(activeProgram);
    return {
      mode: 'live-program',
      onAir: true,
      statusLabel: 'مباشر الآن',
      badgeLabel: 'مباشر الآن',
      modeLabel: 'برنامج مباشر',
      programLabel: activeProgram.format || 'برنامج مباشر',
      title: activeProgram.title,
      subtitle: presenter || activeProgram.description || radioConfig.tagline,
      source: activeProgram.presenter || apiState.streamer || 'استوديو حبق',
      cardTitle: activeProgram.title,
      cardSubtitle: presenter || 'مباشر الآن',
      dockTitle: activeProgram.title,
      dockSubtitle: presenter || 'مباشر الآن',
      documentTitle: `${activeProgram.title} — مباشر — راديو حبق`,
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

  if (activeProgram) {
    const presenter = withPresenter(activeProgram);
    return {
      mode: 'program',
      onAir: true,
      statusLabel: 'على الهواء الآن',
      badgeLabel: 'على الهواء الآن',
      modeLabel: activeProgram.format || 'برنامج',
      programLabel: activeProgram.title,
      title: apiState.title || activeProgram.title,
      subtitle: apiState.artist || presenter || activeProgram.description || radioConfig.tagline,
      source: presenter || apiState.playlistDisplay || 'مكتبة راديو حبق',
      cardTitle: activeProgram.title,
      cardSubtitle: trackLine(apiState) || presenter || activeProgram.description || '',
      dockTitle: apiState.title || activeProgram.title,
      dockSubtitle: apiState.artist || activeProgram.title,
      documentTitle: `${activeProgram.title} — راديو حبق`,
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
