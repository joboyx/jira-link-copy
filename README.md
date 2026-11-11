# Jira Link Copy

Chrome extension that copies a formatted Jira issue link from the current tab.

## Install

Download the latest release zip. You do not need to clone the repo or run a build.

1. Open the latest GitHub Release.
2. Download the Chrome zip.
3. Unzip the file.
4. Open `chrome://extensions`.
5. Enable Developer mode.
6. Choose Load unpacked and select the unzipped folder.

Release page: https://github.com/joboyx/jira-link-copy/releases/latest

## What it copies

- Rich text (normal paste): `ABC-123: Summary` as a link to `https://<host>/browse/ABC-123`
- Plain text (paste as plain text): `ABC-123: Summary` with no hyperlink
- A label longer than 80 characters is cut and ends with `…`. The link target stays the full URL.

Paste as plain text:

- Windows: Ctrl+Shift+V
- macOS Cocoa apps: Option-Shift-Command-V (Paste and Match Style)
- Google Docs and similar web apps: Command-Shift-V (paste without formatting)

The extension reads the issue on:

- an issue page (`/browse/ABC-123`)
- a board when a card is selected or focused

The copied URL is always the browse URL for that issue, not the board URL.

After each copy, a card in the bottom-right corner shows the result. It uses the Tokyo Night colors on a dark page and Tokyo Day on a light page.

## Shortcut

Default: Alt+X (Option+X on Mac). Change the shortcut in `chrome://extensions/shortcuts`.

Click the toolbar icon to copy the same way.

## Develop

Requires Node 20 or newer.

1. Run `npm run setup`
2. Run `npm run build`
3. Open `chrome://extensions`
4. Enable Developer mode
5. Choose Load unpacked and select `.output/chrome-mv3`

For local reload while you edit, run `npm start` and load `.output/chrome-mv3` the same way.

## Commands

| Command         | What it does                               |
| --------------- | ------------------------------------------ |
| `npm run setup` | Install dependencies                       |
| `npm start`     | Build in watch mode                        |
| `npm run build` | Production build                           |
| `npm test`      | Lint, type coverage, unit tests, and build |
| `npm run zip`   | Pack a Chrome zip                          |
| `npm run fonts` | Copy the bundled fonts into `public/fonts` |

## Fonts

The card uses JetBrains Mono and IBM Plex Sans, bundled in `public/fonts` because many Jira sites block web font hosts. Both fonts use the SIL Open Font License 1.1; the license files are next to the fonts.

## Release

Every merge to `main` publishes the next patch release from the latest tag, with the Chrome zip attached.

The `package.json` version is the base. A pull request that raises it releases that version instead:
`npm version X.Y.0 --no-git-tag-version`.

## Permissions

The extension injects a script into the active tab when you copy. It does not request host access to every site.
