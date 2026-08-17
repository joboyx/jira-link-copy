import { browser, type Browser } from 'wxt/browser';
import { defineBackground } from 'wxt/utils/define-background';

export default defineBackground(() => {
  browser.action.onClicked.addListener((tab) => {
    void copyFromTab(tab);
  });
});

async function copyFromTab(tab: Browser.tabs.Tab): Promise<void> {
  if (tab.id == null) {
    return;
  }

  try {
    await browser.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['copy-issue.js'],
    });
  } catch {
    await flashBadge(tab.id);
  }
}

async function flashBadge(tabId: number): Promise<void> {
  await browser.action.setBadgeBackgroundColor({ color: '#a33b2b', tabId });
  await browser.action.setBadgeText({ text: '!', tabId });
  setTimeout(() => {
    void browser.action.setBadgeText({ text: '', tabId });
  }, 2000);
}
