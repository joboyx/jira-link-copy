const ROOT_ID = 'jira-link-copy-root';

export interface ToastInput {
  kind: 'success' | 'error';
  kicker: string;
  title: string;
  body?: string;
}

/**
 * Shows a short confirmation card in the page. Replaces any previous card.
 */
export function showToast(input: ToastInput): void {
  document.getElementById(ROOT_ID)?.remove();

  const host = document.createElement('div');
  host.id = ROOT_ID;
  host.style.all = 'initial';
  host.style.position = 'fixed';
  host.style.zIndex = '2147483647';
  host.style.right = '24px';
  host.style.bottom = '24px';
  host.style.pointerEvents = 'none';

  const shadow = host.attachShadow({ mode: 'open' });
  const card = document.createElement('div');
  card.setAttribute('role', 'status');
  card.className = `card card-${input.kind}`;

  const kicker = document.createElement('div');
  kicker.className = 'kicker';
  kicker.textContent = input.kicker;

  const title = document.createElement('div');
  title.className = 'title';
  title.textContent = input.title;

  card.append(kicker, title);
  if (input.body) {
    const body = document.createElement('div');
    body.className = 'body';
    body.textContent = input.body;
    card.append(body);
  }

  const style = document.createElement('style');
  style.textContent = toastCss();
  shadow.append(style, card);
  document.documentElement.append(host);

  window.setTimeout(() => {
    host.remove();
  }, 2800);
}

function toastCss(): string {
  return `
    .card {
      min-width: 220px;
      max-width: 360px;
      padding: 14px 16px 12px;
      background: #1c1915;
      color: #f3e6c9;
      border: 1px solid #c45c26;
      box-shadow: 6px 6px 0 #c45c26;
      transform: translateY(8px);
      animation: rise 180ms ease-out forwards;
    }
    .card-error {
      border-color: #a33b2b;
      box-shadow: 6px 6px 0 #a33b2b;
    }
    .kicker {
      font-family: ui-monospace, "SF Mono", Menlo, monospace;
      font-size: 10px;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: #c45c26;
      margin-bottom: 6px;
    }
    .card-error .kicker {
      color: #e39a8e;
    }
    .title {
      font-family: "Iowan Old Style", Palatino, "Palatino Linotype", Georgia, serif;
      font-size: 16px;
      line-height: 1.25;
    }
    .body {
      font-family: ui-monospace, "SF Mono", Menlo, monospace;
      font-size: 12px;
      color: #d9cbb0;
      margin-top: 6px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    @keyframes rise {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `;
}
