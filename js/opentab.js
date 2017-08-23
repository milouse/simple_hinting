function openNewTabOrWindow (request) {
  if (!request.url) return;
  if (!request.type) request["type"] = "tab";
  if (request.type === "window")
    browser.windows.create({ "url": request.url });
  else
    browser.tabs.create({ "url": request.url });
}
browser.runtime.onMessage.addListener(openNewTabOrWindow);
