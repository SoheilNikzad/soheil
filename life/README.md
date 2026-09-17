# Life 1.2

A minimal, private life counter: no accounts, no database, no tracking, no birth data sent to a server.

## Test before publishing

Open `life-standalone-test.html` directly in Safari or Chrome. It is a single, self-contained HTML file for checking the interface. The first online load may fetch the selected fonts from Google Fonts; otherwise fallback fonts are used. All counting functions work offline.

## Publish on soheil.info

Copy ONLY the `life/` directory from this package into the ROOT of the existing `SoheilNikzad/soheil` repository. Do not replace the site's root `index.html` or `CNAME`. After the site finishes deploying, visit `https://soheil.info/life/` in Safari and choose Share → Add to Home Screen to install.

The `manifest.webmanifest` start URL and scope are `/life/`. Host with HTTPS. The app precaches its own JavaScript, styles, icons and translation data; external fonts are optional and may fall back offline. User profile stays in `localStorage` (a previously saved Life 1.1 profile is supported). Installed iOS web apps may have separate storage from Safari: enter or restore details within the installed app.

## Data portability

Settings → Copy birth details copies one `LIFE/2` line with birth date, birth time, IANA time zone, name and selected calendar. Paste that line into Restore birth details on a new device. Legacy `LIFE/1` and Life 1.0 JSON backups are accepted. Copy/paste reveals the birth details to the user only; it does not transmit them. Keep this record private.

## Time semantics

Calendar years and calendar months are calculated with the selected Gregorian or Persian calendar. Week, day and hour are calculated from elapsed time in periods of 7×24 hours, 24 hours and 1 hour. All five boxes are 1-based. The hour progress bar tracks elapsed seconds within the current 60-minute period since birth. The birth weekday is derived from the validated birth date. In time-zone transitions where a wall clock repeats, the earlier occurrence is chosen.

## Files

`index.html`, `styles.css`, `core.mjs`, `app.mjs`, `i18n.json`, `manifest.webmanifest`, `sw.js`, `icons/`. No change to other site files is needed.
