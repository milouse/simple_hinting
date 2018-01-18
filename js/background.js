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

browser.contextMenus.create({
  id: "sh-fix-link-at-point",
  title: browser.i18n.getMessage("fixThisLink"),
  contexts: ["link"]
});
browser.contextMenus.onClicked.addListener(function(info, tab) {
  if (info.menuItemId == "sh-fix-link-at-point") {
    browser.tabs.query({
      active: true,
      currentWindow: true
    }).then(function (tabs) {
      browser.tabs.sendMessage(tabs[0].id, {
        message: "fix_one",
        link_uri: info.linkUrl
      });
    });
  }
});
