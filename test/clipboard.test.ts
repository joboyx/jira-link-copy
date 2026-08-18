import { copyIssueLink } from '../src/lib/clipboard';

const issue = {
  key: 'ABC-12',
  summary: 'Reset password flow',
  browseUrl: 'https://jira.example.com/browse/ABC-12',
};

describe('copyIssueLink', () => {
  const originalClipboard = navigator.clipboard;
  const originalClipboardItem = globalThis.ClipboardItem;
  const originalBlob = globalThis.Blob;

  afterEach(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: originalClipboard,
    });
    Object.defineProperty(globalThis, 'ClipboardItem', {
      configurable: true,
      value: originalClipboardItem,
    });
    globalThis.Blob = originalBlob;
    document.execCommand = () => false;
  });

  it('writes an HTML link and a plain-text label', async () => {
    const written: Record<string, string> = {};
    class RecordingBlob extends originalBlob {
      constructor(parts?: BlobPart[], options?: BlobPropertyBag) {
        super(parts, options);
        const type = options?.type;
        const part = parts?.[0];
        if (type && typeof part === 'string') {
          written[type] = part;
        }
      }
    }
    globalThis.Blob = RecordingBlob;
    Object.defineProperty(globalThis, 'ClipboardItem', {
      configurable: true,
      value: class FakeClipboardItem {
        constructor(public readonly items: Record<string, Blob>) {}
      },
    });
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        write: () => Promise.resolve(),
      },
    });

    await copyIssueLink(issue);

    expect(written['text/plain']).toBe('ABC-12: Reset password flow');
    expect(written['text/html']).toBe(
      '<a href="https://jira.example.com/browse/ABC-12">ABC-12: Reset password flow</a>',
    );
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
    expect(copied).toBe('ABC-12: Reset password flow');
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
