# Radio Habaq

A custom public frontend for **راديو حبق**, using AzuraCast as the broadcast and metadata backend.

The public website is deliberately independent from AzuraCast's built-in player so the visual identity, schedule, program pages, archive, and listening experience can evolve without being constrained by AzuraCast templates.

## Stack

- Vite
- Vanilla JavaScript
- CSS
- AzuraCast Now Playing API
- Native HTML5 Audio

The frontend has no runtime framework dependency.

## Local development

```bash
npm install
cp .env.example .env
npm run dev
```

Then configure `.env`:

```env
VITE_AZURACAST_URL=https://cast.example.com
VITE_AZURACAST_STATION=radio_habaq
```

The site derives the standard AzuraCast endpoint as:

```text
https://cast.example.com/api/nowplaying/radio_habaq
```

You can override either endpoint when needed:

```env
VITE_AZURACAST_NOW_PLAYING_URL=https://...
VITE_STREAM_URL=https://...
```

No AzuraCast API key should be exposed in this frontend. The public Now Playing feed is sufficient for current-track metadata and listening information.

## Broadcast schedule

The initial schedule lives in:

```text
src/config.js
```

Each program is deliberately data-driven so schedule changes do not require changing the player or visual components.

The interface uses `Asia/Damascus` when deciding whether a scheduled program is currently on air.

## Behavior

- Outside programmed broadcast windows, the homepage emphasizes the next broadcast.
- During a scheduled window, the current program becomes the main state.
- If a live DJ connects through AzuraCast, the live state overrides the normal off-air state.
- When AzuraCast is configured, current song, artist, artwork, listener count, live-DJ state, and stream URL are read from the public Now Playing response.
- The Now Playing endpoint is refreshed every 15 seconds.
- After a listener starts playback, a persistent mini-player stays at the bottom of the interface.

## Production build

```bash
npm run build
```

The static build is generated in `dist/` and can be deployed behind Nginx, Cloudflare Pages, Netlify, Vercel, or another static host.

## Project structure

```text
.
├── index.html
├── src/
│   ├── config.js       # station settings and broadcast schedule
│   ├── main.js         # interface and player state
│   ├── radio.js        # AzuraCast integration
│   └── styles.css      # visual system and responsive layout
├── .env.example
└── package.json
```

## Next milestones

1. Connect the real Radio Habaq AzuraCast station.
2. Replace the temporary typographic mark with final Radio Habaq branding.
3. Finalize the real weekly broadcast schedule.
4. Add individual program pages and episode/archive data.
5. Add richer player controls and recent-track history.
6. Add production deployment for `radio.habaq.media`.

AzuraCast Now Playing documentation: https://www.azuracast.com/docs/developers/now-playing-data/
