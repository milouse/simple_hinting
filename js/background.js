if (typeof(browser) === "undefined") {
  var browser = chrome;
}

function openNewTabOrWindow (request) {
  if (!request.url) return;
  if (!request.type) request["type"] = "newtab";
  if (request.type === "newwin")
    browser.windows.create({ "url": request.url });
  else if (request.type === "incognito")
    browser.windows.create({ "url": request.url, "incognito": true });
  else
    browser.tabs.create({ "url": request.url });
}
browser.runtime.onMessage.addListener(openNewTabOrWindow);
