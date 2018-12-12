var handled_links = 0;
var last_update_badge = null;
function answerContentScriptRequests (request, sender) {
  if (sender.id != "simple_hinting@umaneti.net") return;
  if (!request.url) return;
  if (!request.type) request["type"] = "newtab";
  if (request.type === "newwin") {
    browser.windows.create({ "url": request.url });
  } else if (request.type === "incognito") {
    browser.windows.create({ "url": request.url, "incognito": true });
  } else if (request.type === "updatebadge") {
    let now = Date.now()
    /* Some page may generate a lot of subcount we have to add for the
     * badge. But some time later, if the user want to recompute the
     * links, we should note add the new batch to the old one. 2 seconds
     * seems to be a good interval to differentiate machine from human.
     */
    if (last_update_badge && (now - last_update_badge) > 2000) {
      handled_links = 0;
    }
    last_update_badge = now;
    if (request.message && sender.tab && sender.tab.id) {
      handled_links += request.message;
      browser.browserAction.setBadgeText(
        { "text": handled_links.toString(), "tabId": sender.tab.id });
    }
  } else {
    browser.tabs.create({ "url": request.url });
  }
}
browser.runtime.onMessage.addListener(answerContentScriptRequests);

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
    browser.tabs.sendMessage(tab.id, { message: "fix_all" });
  }
});

browser.browserAction.onClicked.addListener(function(tab) {
  browser.tabs.sendMessage(tab.id, { message: "fix_all" });
});
