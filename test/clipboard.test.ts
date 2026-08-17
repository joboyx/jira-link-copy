import { copyIssueLink } from '../src/lib/clipboard';

const issue = {
  key: 'ABC-12',
  summary: 'Reset password flow',
  browseUrl: 'https://jira.example.com/browse/ABC-12',
};

describe('copyIssueLink', () => {
  const originalClipboard = navigator.clipboard;

  afterEach(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: originalClipboard,
    });
    document.execCommand = () => false;
  });

  it('falls back to execCommand when clipboard.write rejects', async () => {
    let copied = '';
    if (typeof ClipboardItem === 'undefined') {
      Object.defineProperty(globalThis, 'ClipboardItem', {
        configurable: true,
        value: class FakeClipboardItem {
          constructor(public readonly items: Record<string, Blob>) {}
        },
      });
    }
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        write: () => Promise.reject(new Error('denied')),
      },
    });
    document.execCommand = (command: string) => {
      if (command === 'copy') {
        const el = document.querySelector('textarea');
        copied = el instanceof HTMLTextAreaElement ? el.value : '';
        return true;
      }
      return false;
    };

    await copyIssueLink(issue);
    expect(copied).toBe('[ABC-12: Reset password flow](https://jira.example.com/browse/ABC-12)');
  });

  it('throws when execCommand fails', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: undefined,
    });
    document.execCommand = () => false;
    await expect(copyIssueLink(issue)).rejects.toThrow('Clipboard write failed');
  });
});
