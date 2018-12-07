function openNewTabOrWindow (request, sender) {
  if (sender.id != "simple_hinting@umaneti.net") return;
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
browser.contextMenus.create({
  id: "sh-fix-all",
  title: browser.i18n.getMessage("fixAllLinks"),
  contexts: ["page", "image"]
});
browser.contextMenus.onClicked.addListener(function(info, tab) {
  if (info.menuItemId == "sh-fix-link-at-point") {
    browser.tabs.sendMessage(tab.id, {
      message: "fix_one",
      link_uri: info.linkUrl
    });
  } else if (info.menuItemId == "sh-fix-all") {
    browser.tabs.sendMessage(tab.id, {
      message: "fix_all",
      link_uri: info.linkUrl
    });
  }
});
