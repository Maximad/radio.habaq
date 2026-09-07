import './styles.css';
import { radioConfig, schedule } from './config.js';
import { RadioClient, normalizeNowPlaying } from './radio.js';

const DAY_INDEX = {
  الأحد: 0,
  الاثنين: 1,
  الثلاثاء: 2,
  الأربعاء: 3,
  الخميس: 4,
  الجمعة: 5,
  السبت: 6,
};

const app = document.querySelector('#app');

app.innerHTML = `
  <div class="page-shell">
    <header class="site-header">
      <a class="brand" href="#top" aria-label="راديو حبق">
        <span class="brand-mark">ح</span>
        <span class="brand-copy">
          <strong>راديو حبق</strong>
          <small>HABAQ RADIO</small>
        </span>
      </a>

      <nav class="nav" aria-label="التنقل الرئيسي">
        <a href="#recent">سبق وبث</a>
        <a href="#schedule">البرنامج</a>
        <a href="#about">عن الراديو</a>
      </nav>

      <div class="header-status" data-header-status>
        <span class="status-led"></span>
        <span data-header-status-text>جاري الاتصال</span>
      </div>
    </header>

    <main id="top">
      <section class="live-hero">
        <div class="hero-copy">
          <div class="live-line">
            <span class="live-badge" data-live-badge>
              <i></i>
              <span data-live-label>جاري الاتصال</span>
            </span>
            <span class="listeners" data-listeners hidden></span>
          </div>

          <p class="program-label" data-program-label>راديو حبق</p>
          <h1 data-title>الصوت يصل.</h1>
          <p class="artist-line" data-artist>من السويداء إلى أي مكان.</p>

          <div class="hero-controls">
            <button class="primary-play" type="button" data-play disabled>
              <span class="play-glyph" data-play-glyph>▶</span>
              <span data-play-label>جاري الاتصال</span>
            </button>

            <div class="broadcast-meta">
              <span>المصدر</span>
              <strong data-source>راديو حبق</strong>
            </div>
          </div>

          <div class="track-timeline" data-timeline hidden>
            <span data-elapsed>0:00</span>
            <div class="timeline-rail"><i data-progress></i></div>
            <span data-duration>0:00</span>
          </div>
        </div>

        <div class="hero-visual">
          <div class="cover-frame" data-cover>
            <div class="cover-glow"></div>
            <div class="cover-fallback" data-cover-fallback>
              <span>HABAQ RADIO</span>
              <strong>حبق</strong>
              <small>AS-SWEIDA · SYRIA</small>
            </div>

            <div class="signal-bars" aria-hidden="true">
              <i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i>
            </div>
          </div>

          <div class="floating-now">
            <span>الآن على الهواء</span>
            <strong data-card-title>راديو حبق</strong>
            <small data-card-artist></small>
          </div>
        </div>
      </section>

      <section class="recent-section" id="recent" data-history-section hidden>
        <div class="section-topline">
          <div>
            <p class="section-kicker">سبق وبث</p>
            <h2>ما مرّ على الراديو</h2>
          </div>
          <span class="section-index">01</span>
        </div>
        <div class="history-grid" data-history-list></div>
      </section>

      <section class="schedule-section" id="schedule">
        <div class="section-topline">
          <div>
            <p class="section-kicker">البرنامج</p>
            <h2>مواعيد لها صوتها.</h2>
          </div>
          <span class="section-index">02</span>
        </div>
        <div class="schedule-grid" data-schedule-list></div>
      </section>

      <section class="about-section" id="about">
        <div class="about-label">
          <span>03</span>
          <p>عن الراديو</p>
        </div>
        <p class="about-statement">
          راديو حبق مساحة مستقلة للصوت والموسيقى والناس. جلسات استماع، مقابلات،
          برامج وبث حي من السويداء إلى أي مكان يصل إليه الصوت.
        </p>
      </section>
    </main>

    <footer class="site-footer">
      <span>راديو حبق</span>
      <span>HABAQ RADIO · AS-SWEIDA</span>
    </footer>
  </div>

  <div class="player-dock" data-player-dock hidden>
    <button class="dock-play" type="button" data-dock-play aria-label="تشغيل أو إيقاف">▶</button>
    <div class="dock-track">
      <strong data-dock-title>راديو حبق</strong>
      <span data-dock-artist>على الهواء</span>
    </div>
    <div class="dock-live"><i></i><span>ON AIR</span></div>
    <label class="volume-control" aria-label="مستوى الصوت">
      <span>VOL</span>
      <input type="range" min="0" max="1" step="0.05" value="0.85" data-volume />
    </label>
  </div>
`;

const pick = (selector) => document.querySelector(selector);
const refs = {
  headerStatus: pick('[data-header-status]'),
  headerStatusText: pick('[data-header-status-text]'),
  liveBadge: pick('[data-live-badge]'),
  liveLabel: pick('[data-live-label]'),
  listeners: pick('[data-listeners]'),
  programLabel: pick('[data-program-label]'),
  title: pick('[data-title]'),
  artist: pick('[data-artist]'),
  source: pick('[data-source]'),
  play: pick('[data-play]'),
  playGlyph: pick('[data-play-glyph]'),
  playLabel: pick('[data-play-label]'),
  timeline: pick('[data-timeline]'),
  elapsed: pick('[data-elapsed]'),
  duration: pick('[data-duration]'),
  progress: pick('[data-progress]'),
  cover: pick('[data-cover]'),
  coverFallback: pick('[data-cover-fallback]'),
  cardTitle: pick('[data-card-title]'),
  cardArtist: pick('[data-card-artist]'),
  historySection: pick('[data-history-section]'),
  historyList: pick('[data-history-list]'),
  scheduleList: pick('[data-schedule-list]'),
  playerDock: pick('[data-player-dock]'),
  dockPlay: pick('[data-dock-play]'),
  dockTitle: pick('[data-dock-title]'),
  dockArtist: pick('[data-dock-artist]'),
  volume: pick('[data-volume]'),
};

const audio = new Audio();
audio.preload = 'none';
audio.volume = 0.85;

let apiState = normalizeNowPlaying(null, radioConfig);
let activeProgram = null;
let nextProgram = null;
let onAir = false;
let receivedAt = Date.now();

function getDamascusClock(date = new Date()) {
  const weekday = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Damascus',
    weekday: 'short',
  }).format(date);
  const dayMap = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  const time = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Damascus',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(date);
  const [hour, minute] = time.split(':').map(Number);
  return { day: dayMap[weekday], minutes: hour * 60 + minute };
}

function getProgramState() {
  const now = getDamascusClock();
  let current = null;
  let next = null;
  let smallestDistance = Infinity;

  for (const program of schedule) {
    const programDay = DAY_INDEX[program.day];
    const [hour, minute] = program.time.split(':').map(Number);
    const start = hour * 60 + minute;
    const duration = program.durationMinutes || 60;

    if (programDay === now.day && now.minutes >= start && now.minutes < start + duration) {
      current = program;
    }

    let dayDistance = (programDay - now.day + 7) % 7;
    let minuteDistance = dayDistance * 1440 + start - now.minutes;
    if (minuteDistance <= 0) minuteDistance += 7 * 1440;

    if (minuteDistance < smallestDistance) {
      smallestDistance = minuteDistance;
      next = { ...program, minuteDistance };
    }
  }

  return { current, next };
}

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const rounded = Math.floor(seconds);
  const minutes = Math.floor(rounded / 60);
  const remainder = String(rounded % 60).padStart(2, '0');
  return `${minutes}:${remainder}`;
}

function setImage(element, url) {
  if (!url) {
    element.style.backgroundImage = '';
    element.classList.remove('has-art');
    return;
  }
  element.style.backgroundImage = `linear-gradient(180deg, rgba(8,10,8,.02), rgba(8,10,8,.42)), url("${url.replace(/"/g, '%22')}")`;
  element.classList.add('has-art');
}

function renderSchedule() {
  refs.scheduleList.replaceChildren();
  const { current } = getProgramState();

  schedule.forEach((program, index) => {
    const card = document.createElement('article');
    card.className = 'schedule-card';
    if (current === program) card.classList.add('is-current');

    const number = document.createElement('span');
    number.className = 'schedule-number';
    number.textContent = String(index + 1).padStart(2, '0');

    const time = document.createElement('div');
    time.className = 'schedule-time';
    const day = document.createElement('strong');
    day.textContent = program.day;
    const clock = document.createElement('span');
    clock.textContent = program.time;
    time.append(day, clock);

    const copy = document.createElement('div');
    copy.className = 'schedule-copy';
    const title = document.createElement('h3');
    title.textContent = program.title;
    const description = document.createElement('p');
    description.textContent = program.description;
    copy.append(title, description);

    const arrow = document.createElement('span');
    arrow.className = 'schedule-arrow';
    arrow.textContent = '↗';

    card.append(number, time, copy, arrow);
    refs.scheduleList.append(card);
  });
}

function renderHistory() {
  const items = apiState.history.slice(0, 4);
  refs.historyList.replaceChildren();
  refs.historySection.hidden = items.length === 0;

  items.forEach((entry, index) => {
    const song = entry?.song || {};
    const card = document.createElement('article');
    card.className = 'history-card';

    const art = document.createElement('div');
    art.className = 'history-art';
    if (song.art) {
      art.style.backgroundImage = `url("${song.art.replace(/"/g, '%22')}")`;
      art.classList.add('has-art');
    } else {
      art.textContent = 'ح';
    }

    const meta = document.createElement('div');
    meta.className = 'history-meta';
    const count = document.createElement('span');
    count.textContent = String(index + 1).padStart(2, '0');
    const title = document.createElement('strong');
    title.textContent = song.title || 'راديو حبق';
    const artist = document.createElement('p');
    artist.textContent = song.artist || 'راديو حبق';
    meta.append(count, title, artist);

    card.append(art, meta);
    refs.historyList.append(card);
  });
}

function renderProgress() {
  const duration = apiState.duration;
  if (!onAir || !Number.isFinite(duration) || duration <= 0 || !Number.isFinite(apiState.elapsed)) {
    refs.timeline.hidden = true;
    return;
  }

  const sinceUpdate = (Date.now() - receivedAt) / 1000;
  const elapsed = Math.min(duration, apiState.elapsed + sinceUpdate);
  const percent = Math.max(0, Math.min(100, (elapsed / duration) * 100));

  refs.timeline.hidden = false;
  refs.elapsed.textContent = formatTime(elapsed);
  refs.duration.textContent = formatTime(duration);
  refs.progress.style.width = `${percent}%`;
}

function renderPlaybackState() {
  const playing = !audio.paused;
  refs.playGlyph.textContent = playing ? 'Ⅱ' : '▶';
  refs.playLabel.textContent = playing ? 'إيقاف' : onAir ? 'استمع الآن' : 'البث متوقف';
  refs.dockPlay.textContent = playing ? 'Ⅱ' : '▶';
  document.body.classList.toggle('is-playing', playing);
}

function renderBroadcast() {
  ({ current: activeProgram, next: nextProgram } = getProgramState());

  // AzuraCast's top-level is_online flag describes whether the station itself is
  // broadcasting. live.is_live only describes whether a human streamer is connected.
  onAir = Boolean(apiState.connected && (apiState.isOnline || apiState.isLive));
  const canListen = Boolean(onAir && apiState.streamUrl);

  refs.play.disabled = !canListen;
  refs.playerDock.hidden = !canListen;
  refs.headerStatus.classList.toggle('is-online', onAir);
  refs.liveBadge.classList.toggle('is-online', onAir);

  if (onAir) {
    const liveText = apiState.isLive ? 'مباشر الآن' : 'على الهواء الآن';
    refs.headerStatusText.textContent = liveText;
    refs.liveLabel.textContent = liveText;
    refs.programLabel.textContent = activeProgram?.title || apiState.playlist || 'راديو حبق';
    refs.title.textContent = apiState.title || activeProgram?.title || 'راديو حبق';
    refs.artist.textContent = apiState.artist || activeProgram?.description || radioConfig.tagline;
    refs.source.textContent = apiState.isLive
      ? apiState.streamer || 'بث مباشر'
      : apiState.playlist || 'مكتبة راديو حبق';
    refs.listeners.hidden = apiState.listeners === null;
    refs.listeners.textContent = apiState.listeners === null ? '' : `${apiState.listeners} مستمع الآن`;
    refs.cardTitle.textContent = apiState.title || 'راديو حبق';
    refs.cardArtist.textContent = apiState.artist || refs.programLabel.textContent;
    refs.dockTitle.textContent = apiState.title || 'راديو حبق';
    refs.dockArtist.textContent = apiState.artist || refs.programLabel.textContent;
    setImage(refs.cover, apiState.art);
    refs.coverFallback.hidden = Boolean(apiState.art);
    document.title = `${apiState.title || 'على الهواء'} — راديو حبق`;
  } else {
    if (!audio.paused) audio.pause();
    refs.headerStatusText.textContent = apiState.configured && !apiState.connected ? 'تعذر الاتصال' : 'خارج البث';
    refs.liveLabel.textContent = apiState.configured && !apiState.connected ? 'تعذر قراءة حالة البث' : 'البث القادم';
    refs.programLabel.textContent = nextProgram?.title || 'راديو حبق';
    refs.title.textContent = nextProgram ? `${nextProgram.day} · ${nextProgram.time}` : 'نعود قريباً.';
    refs.artist.textContent = nextProgram?.description || radioConfig.tagline;
    refs.source.textContent = 'راديو حبق';
    refs.listeners.hidden = true;
    refs.cardTitle.textContent = nextProgram?.title || 'راديو حبق';
    refs.cardArtist.textContent = nextProgram ? `${nextProgram.day} · ${nextProgram.time}` : '';
    refs.coverFallback.hidden = false;
    setImage(refs.cover, '');
    document.title = 'راديو حبق';
  }

  renderProgress();
  renderPlaybackState();
  renderSchedule();
  renderHistory();
}

async function togglePlayback() {
  if (!onAir || !apiState.streamUrl) return;

  if (audio.paused) {
    if (!audio.src) audio.src = apiState.streamUrl;
    try {
      await audio.play();
    } catch (error) {
      console.error('Unable to start radio stream', error);
    }
  } else {
    audio.pause();
  }
}

refs.play.addEventListener('click', togglePlayback);
refs.dockPlay.addEventListener('click', togglePlayback);
refs.volume.addEventListener('input', (event) => {
  audio.volume = Number(event.target.value);
});
audio.addEventListener('play', renderPlaybackState);
audio.addEventListener('pause', renderPlaybackState);

renderSchedule();
renderBroadcast();

const client = new RadioClient(radioConfig);
client.start((result) => {
  const previousStream = apiState.streamUrl;
  apiState = normalizeNowPlaying(result, radioConfig);
  receivedAt = Date.now();

  if (audio.paused && previousStream !== apiState.streamUrl) {
    audio.removeAttribute('src');
  }

  renderBroadcast();
});

window.setInterval(renderProgress, 1000);
window.setInterval(() => {
  const previous = activeProgram;
  ({ current: activeProgram, next: nextProgram } = getProgramState());
  if (previous !== activeProgram) renderBroadcast();
}, 60_000);
