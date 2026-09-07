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
  <div class="site-shell">
    <header class="site-header">
      <a class="brand" href="#top" aria-label="راديو حبق">
        <span class="brand-mark">ح</span>
        <span class="brand-name">راديو حبق</span>
      </a>
      <nav class="nav" aria-label="التنقل الرئيسي">
        <a href="#schedule">البرنامج</a>
        <a href="#about">عن الراديو</a>
      </nav>
    </header>

    <main id="top">
      <section class="hero">
        <div class="hero-copy">
          <div class="status-line">
            <span class="status-dot" data-status-dot></span>
            <span data-status-label>جاري الاتصال بالراديو</span>
          </div>

          <p class="eyebrow" data-eyebrow>راديو حبق</p>
          <h1 data-primary-title>موسيقى، أصوات،<br />وحكايات تُسمع.</h1>
          <p class="hero-subtitle" data-secondary-title>
            بث إذاعي مستقل من السويداء، في أوقات محددة وبرامج لها شخصيتها.
          </p>

          <div class="hero-actions">
            <button class="play-button" type="button" data-play disabled>
              <span class="play-icon" data-play-icon>▶</span>
              <span data-play-label>استمع الآن</span>
            </button>
            <div class="listener-count" data-listeners hidden></div>
          </div>
        </div>

        <div class="visual-stage" data-stage>
          <div class="artwork" data-artwork>
            <div class="artwork-noise"></div>
            <div class="artwork-type">
              <span>RADIO</span>
              <strong>حبق</strong>
              <span>HABAQ</span>
            </div>
          </div>
          <div class="track-card" data-track-card hidden>
            <span class="track-kicker">الآن</span>
            <strong data-track-title>—</strong>
            <span data-track-artist></span>
          </div>
        </div>
      </section>

      <section class="schedule-section" id="schedule">
        <div class="section-heading">
          <p class="eyebrow">مواعيد البث</p>
          <h2>لا نبث طوال اليوم.<br />نلتقي في وقت محدد.</h2>
        </div>
        <div class="schedule-list" data-schedule-list></div>
      </section>

      <section class="manifesto" id="about">
        <p class="manifesto-number">01</p>
        <p>
          راديو حبق مساحة للصوت والموسيقى والناس. برامج موسيقية، جلسات استماع،
          مقابلات وبث حي، من السويداء إلى أي مكان يصل إليه الصوت.
        </p>
      </section>
    </main>

    <footer class="site-footer">
      <span>راديو حبق</span>
      <span>HABAQ RADIO</span>
    </footer>

    <div class="player-bar" data-player-bar hidden>
      <button class="mini-play" type="button" data-mini-play aria-label="تشغيل أو إيقاف">▶</button>
      <div class="mini-track">
        <strong data-mini-title>راديو حبق</strong>
        <span data-mini-artist>البث المباشر</span>
      </div>
      <span class="mini-status" data-mini-status>ON AIR</span>
    </div>
  </div>
`;

const refs = {
  statusDot: document.querySelector('[data-status-dot]'),
  statusLabel: document.querySelector('[data-status-label]'),
  eyebrow: document.querySelector('[data-eyebrow]'),
  primaryTitle: document.querySelector('[data-primary-title]'),
  secondaryTitle: document.querySelector('[data-secondary-title]'),
  play: document.querySelector('[data-play]'),
  playIcon: document.querySelector('[data-play-icon]'),
  playLabel: document.querySelector('[data-play-label]'),
  listeners: document.querySelector('[data-listeners]'),
  artwork: document.querySelector('[data-artwork]'),
  trackCard: document.querySelector('[data-track-card]'),
  trackTitle: document.querySelector('[data-track-title]'),
  trackArtist: document.querySelector('[data-track-artist]'),
  scheduleList: document.querySelector('[data-schedule-list]'),
  playerBar: document.querySelector('[data-player-bar]'),
  miniPlay: document.querySelector('[data-mini-play]'),
  miniTitle: document.querySelector('[data-mini-title]'),
  miniArtist: document.querySelector('[data-mini-artist]'),
  miniStatus: document.querySelector('[data-mini-status]'),
};

const audio = new Audio();
audio.preload = 'none';

let apiState = normalizeNowPlaying(null, radioConfig);
let activeProgram = null;
let nextProgram = null;

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
    const duration = program.durationMinutes || 120;

    if (programDay === now.day && now.minutes >= start && now.minutes < start + duration) {
      current = program;
    }

    let dayDistance = (programDay - now.day + 7) % 7;
    let minuteDistance = dayDistance * 1440 + start - now.minutes;
    if (minuteDistance <= 0) minuteDistance += 7 * 1440;

    if (minuteDistance < smallestDistance) {
      smallestDistance = minuteDistance;
      next = { ...program, dayDistance, minuteDistance };
    }
  }

  return { current, next };
}

function renderSchedule() {
  refs.scheduleList.replaceChildren();

  schedule.forEach((program, index) => {
    const item = document.createElement('article');
    item.className = 'schedule-item';
    item.innerHTML = `
      <span class="schedule-index">${String(index + 1).padStart(2, '0')}</span>
      <div class="schedule-time"><strong>${program.day}</strong><span>${program.time}</span></div>
      <div class="schedule-copy"><h3></h3><p></p></div>
      <span class="schedule-arrow" aria-hidden="true">↙</span>
    `;
    item.querySelector('h3').textContent = program.title;
    item.querySelector('p').textContent = program.description;
    refs.scheduleList.append(item);
  });
}

function renderHero() {
  ({ current: activeProgram, next: nextProgram } = getProgramState());
  const onAir = Boolean(activeProgram || apiState.isLive);
  const canListen = Boolean(apiState.streamUrl);

  refs.play.disabled = !canListen;

  if (onAir) {
    refs.statusDot.classList.add('is-live');
    refs.statusLabel.textContent = apiState.isLive ? 'مباشر الآن' : 'على الهواء الآن';
    refs.eyebrow.textContent = activeProgram?.title || apiState.streamer || 'راديو حبق';
    refs.primaryTitle.textContent = apiState.title || activeProgram?.title || 'راديو حبق';
    refs.secondaryTitle.textContent =
      apiState.artist || activeProgram?.description || radioConfig.tagline;
  } else {
    refs.statusDot.classList.remove('is-live');
    refs.statusLabel.textContent = apiState.connected ? 'البث القادم' : 'البث غير متصل الآن';
    refs.eyebrow.textContent = nextProgram?.title || 'راديو حبق';
    refs.primaryTitle.textContent = nextProgram
      ? `${nextProgram.day} · ${nextProgram.time}`
      : radioConfig.tagline;
    refs.secondaryTitle.textContent =
      nextProgram?.description || 'سنعلن عن موعد البث القادم هنا.';
  }

  if (apiState.art && onAir) {
    refs.artwork.style.backgroundImage = `url("${apiState.art.replace(/"/g, '%22')}")`;
    refs.artwork.classList.add('has-art');
  } else {
    refs.artwork.style.backgroundImage = '';
    refs.artwork.classList.remove('has-art');
  }

  refs.trackCard.hidden = !(onAir && apiState.title);
  refs.trackTitle.textContent = apiState.title;
  refs.trackArtist.textContent = apiState.artist;

  refs.listeners.hidden = apiState.listeners === null;
  refs.listeners.textContent =
    apiState.listeners === null ? '' : `${apiState.listeners} يستمعون الآن`;

  refs.miniTitle.textContent = apiState.title || activeProgram?.title || 'راديو حبق';
  refs.miniArtist.textContent = apiState.artist || activeProgram?.title || 'البث المباشر';
  refs.miniStatus.textContent = onAir ? 'ON AIR' : 'RADIO HABAQ';
}

async function togglePlayback() {
  if (!apiState.streamUrl) return;

  if (audio.paused) {
    if (audio.src !== apiState.streamUrl) audio.src = apiState.streamUrl;

    try {
      await audio.play();
      refs.playerBar.hidden = false;
    } catch (error) {
      console.error('Unable to start radio stream', error);
    }
  } else {
    audio.pause();
  }
}

function renderPlaybackState() {
  const playing = !audio.paused;
  refs.playIcon.textContent = playing ? 'Ⅱ' : '▶';
  refs.playLabel.textContent = playing ? 'إيقاف مؤقت' : 'استمع الآن';
  refs.miniPlay.textContent = playing ? 'Ⅱ' : '▶';
}

refs.play.addEventListener('click', togglePlayback);
refs.miniPlay.addEventListener('click', togglePlayback);
audio.addEventListener('play', renderPlaybackState);
audio.addEventListener('pause', renderPlaybackState);

renderSchedule();
renderHero();

const client = new RadioClient(radioConfig);
client.start((result) => {
  apiState = normalizeNowPlaying(result, radioConfig);
  renderHero();
});

window.setInterval(renderHero, 60_000);
