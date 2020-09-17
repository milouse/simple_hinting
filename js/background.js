"use strict";

/**
 * Utils method to avoid <all_urls> permission
 */
function codeFilesAlreadyInjected(active_tab_id) {
  return browser.tabs.sendMessage(
    active_tab_id, { message: "ping" }
  ).then(function(answer) {
    if (answer.message === "pong") {
      return true;
    }
    return false;
  }).catch(() => false);
}

function injectJsAndCssIfNecessary(active_tab_id) {
  return codeFilesAlreadyInjected(active_tab_id).then(function(result) {
    if (result) {
      console.log("[Simple Hinting extension] Files already there");
      return true;
    }
    console.log("[Simple Hinting extension] Injecting necessary files");
    browser.tabs.insertCSS({ file: "/css/hints.css" });
    return browser.tabs.executeScript(
      { file: "/js/browser-polyfill.min.js" }
    ).then(function() {
      return browser.tabs.executeScript({ file: "/js/hints.js" });
    });
  });
}

/**
 * Listener for events from the content scripts
 */
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
     * links, we should not add the new batch to the old one. 2 seconds
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


/**
 * Setup context menu items
 */
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
  injectJsAndCssIfNecessary(tab.id).then(function() {
    if (info.menuItemId == "sh-fix-link-at-point") {
      browser.tabs.sendMessage(tab.id, {
        message: "fix_one",
        link_uri: info.linkUrl
      });
    } else if (info.menuItemId == "sh-fix-all") {
      browser.tabs.sendMessage(tab.id, { message: "fix_all" });
    }
  });
});

browser.browserAction.onClicked.addListener(function(tab) {
  injectJsAndCssIfNecessary(tab.id).then(function() {
    browser.tabs.sendMessage(tab.id, { message: "fix_all" });
  });
});


/**
 * Listener for browser commands
 */
browser.commands.onCommand.addListener(function(command) {
  if (command == "toggle-hinting") {
    browser.tabs.query({currentWindow: true, active: true}).then(function(tabs){
      const active_tab_id = tabs[0].id;
      injectJsAndCssIfNecessary(active_tab_id).then(function() {
        browser.tabs.sendMessage(active_tab_id, { message: "toggle_ui" });
      });
    });
  }
});


/**
 * Sync domains and params info
 */
function onError(error) {
  console.error(`[Simple Hinting extension] ${error}`);
}

function fetchUnwantedParams() {
  return fetch("https://unshorten.umaneti.net/params").then(function(response) {
    return response.json();
  }).then(function(upstream_params) {
    browser.storage.local.set({ "unwanted_params": upstream_params });
  }).catch(onError);
}

function fetchTinyDomains() {
  return fetch("https://unshorten.umaneti.net/domains").then(function(response) {
    return response.json();
  }).then(function(upstream_tiny_domains) {
    browser.storage.local.set({ "tiny_domains_list": upstream_tiny_domains });
  }).catch(onError);
}

let opts = ["sync_dt"];
browser.storage.local.get(opts).then(function (result) {
  let last_sync = result.sync_dt || 0;
  let one_week_in_ms = 7 * 24 * 60 * 60 * 1000;
  let now_in_ms = Date.now();
  if ((last_sync + one_week_in_ms) < now_in_ms) {
    // Time to sync again
    console.log("[Simple Hinting extension] Synchronizing now params and domains.");
    fetchTinyDomains();
    fetchUnwantedParams();
    browser.storage.local.set({ "sync_dt": now_in_ms });
  }
}, onError);
