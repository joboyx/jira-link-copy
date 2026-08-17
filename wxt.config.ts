import { defineConfig } from 'wxt';

export default defineConfig({
  srcDir: 'src',
  manifest: {
    name: 'Jira Link Copy',
    description: 'Copy a formatted Jira issue link from the current tab.',
    permissions: ['activeTab', 'scripting', 'clipboardWrite'],
    action: {
      default_title: 'Copy Jira issue link',
    },
    commands: {
      _execute_action: {
        suggested_key: {
          default: 'Alt+X',
          mac: 'Alt+X',
        },
        description: 'Copy Jira issue link',
      },
    },
    icons: {
      16: 'icon/16.png',
      32: 'icon/32.png',
      48: 'icon/48.png',
      128: 'icon/128.png',
    },
  },
});
