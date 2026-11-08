# Moviebulls

Moviebulls is a Next.js movie and TV discovery app with active search, browsable catalog pages, local watchlist storage, and source switching.

## Local Development

```bash
npm run dev
```

Open http://localhost:3000 to use the app.

Set `TMDB_API_KEY` and `NEXT_PUBLIC_PLAYER_ORIGIN` in the ignored `.env.local` file. The player origin must point to the separately hosted player Worker. No secret belongs in a `NEXT_PUBLIC_` variable.

For Windows paths with spaces, `start-dev.cmd` starts the dev server from this project folder.

## Cloudflare

This project uses the separate Wrangler auth profile `moviebulls`. Both configurations pin its account ID. The `moviebulls` Worker serves the app; `moviebulls-player` serves filtered player documents on a separate origin.

- `npm run test:player`: proxy validation and filtering checks.
- `npm run cf:typegen`: regenerate Worker binding types.
- `npm run build:cloudflare`: create the deployment build.
- `npm run deploy:player`: deploy the isolated player.
- `npm run deploy`: build and deploy the app.

The app's catalogue key must also be installed as the `TMDB_API_KEY` Cloudflare secret. The player's `APP_ORIGIN` and app's `NEXT_PUBLIC_PLAYER_ORIGIN` must match their deployment URLs.

Playback uses VidSrc's primary player without an iframe sandbox. Third-party iframe backups are disabled; errors stay on the current title with a reload control. The fixed proxy accepts only numeric movie/episode paths and the primary player's small API allowlist. Requests are rate-limited, redirects are refused, and response sizes and timeouts are bounded. Video data goes directly from the provider to the visitor.

Provider scripts can change, so passing sample titles is not a guarantee for the whole catalogue. The site's advertising loader and ad placements have been removed. The old `/sw.js` URL now retires previously installed advertising workers.

## Installable app

`/install` provides the browser installation prompt when available and manual instructions for Safari, Chrome, and Edge. The root manifest supplies standalone display and app icons. `/pwa-sw.js` replaces the legacy root worker and caches the offline screen, Downloads page and its playback assets. Catalogue and online player requests remain network-only. Keep the worker URL uncached and bump its `moviebulls-pwa-v5` cache name when changing offline assets. Saved videos have separate caches that survive shell upgrades.

## Offline downloads

Start playback, then choose **Save offline** underneath the player. **Downloads** in the navigation opens the saved-video library, which can reload without the app server or provider. Save progress and cancellation are shown on the title page. Keep that page open until saving finishes. Failed/cancelled saves are removed; a browser crash leaves an incomplete entry that can be deleted. Videos are marked ready only after every part is stored. Downloads stay on the current device/browser and can be lost if site data is cleared or the browser evicts storage.

The first version saves complete, unencrypted HLS media playlists with muxed audio and optional initialization maps. Master playlists, separate audio, byte-range/encrypted streams and direct MP4s return an unsupported-format message. External subtitles and background/resumable downloads are not included. Provider links must allow cross-origin fetching and remain valid until the save finishes. Offline playback prefers the bundled HLS.js player: some browsers advertise native HLS but fail to play service-worker video responses. Physical-phone coverage remains to be checked.

`npm run prepare:offline` copies the pinned playback library and its license before dev/build. `npm run test:offline` tests playlist validation, completed saves, cancellation, storage exhaustion, player source reporting and offline range reads. For a browser regression check, generate a short HLS fixture with FFmpeg, run `node tests/serve-offline-fixture.mjs <fixture-directory>`, save from `http://127.0.0.1:4173/test.html`, open Downloads, stop the fixture server, reload, and play the saved video. This exercises the actual download/store/player code with generated media.
