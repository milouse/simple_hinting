if (typeof(browser) === "undefined") {
  var browser = chrome;
}

function openNewTabOrWindow (request) {
  if (!request.url) return;
  if (!request.type) request["type"] = "tab";
  if (request.type === "window")
    browser.windows.create({ "url": request.url });
  else
    browser.tabs.create({ "url": request.url });
}
browser.runtime.onMessage.addListener(openNewTabOrWindow);

/**
 * Fired when a registered command is activated using a keyboard shortcut.
 *
 * In this sample extension, there is only one registered command: "Alt+Space".
 */
function getActiveTab () {
  return browser.tabs.query({ "active": true, "currentWindow": true });
}
browser.commands.onCommand.addListener(function (command) {
  if (command === "display-hints") {
    if (typeof(chrome) !== "undefined") {
      chrome.tabs.query(
        { "active": true, "currentWindow": true },
        function (tabs) {
          chrome.tabs.sendMessage(tabs[0].id, { "command": command });
        }
      );
    } else {
      getActiveTab().then(function (tabs) {
        browser.tabs.sendMessage(tabs[0].id, { "command": command });
      });
    }
  }
});
