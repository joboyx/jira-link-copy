# Jira Link Copy

Chrome extension that copies a formatted Jira issue link from the current tab.

## What it copies

- Rich text: `ABC-123: Summary` as a link to `https://<host>/browse/ABC-123`
- Plain text: `[ABC-123: Summary](https://<host>/browse/ABC-123)`

The extension reads the issue on:

- an issue page (`/browse/ABC-123`)
- a board when a card is selected or focused

The copied URL is always the browse URL for that issue, not the board URL.

## Shortcut

Default: Alt+X (Option+X on Mac). Change the shortcut in `chrome://extensions/shortcuts`.

Click the toolbar icon to copy the same way.

## Install unpacked

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
| `npm run zip`   | Pack a store zip                           |

## Permissions

The extension injects a script into the active tab when you copy. It does not request host access to every site.
