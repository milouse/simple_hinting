function openNewTab(dataUrl) {
  browser.tabs.create(dataUrl);
}
browser.runtime.onMessage.addListener(openNewTab);
