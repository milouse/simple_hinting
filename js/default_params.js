// Default keys
var cancelkey = "c";
var viewkey = "v";
var actionkeys = {
  "f": "follow",
  "Enter": "follow",
  "w": "newwin",
  "t": "newtab",
  "i": "incognito",
  "p": "incognito"
};

var tiny_domains = [
  "bit.ly",
  "goo.gl",
  "fb.me",
  "ow.ly",
  "po.st",
  "t.co",
  "vdn.lv",
  "kck.st",
  "tinyurl.com"
];

var unshorten_service = "https://unshorten.me/s/"

var unwanted_params = [
  "utm_source",
  "utm_medium",
  "utm_term",
  "utm_content",
  "utm_campaign",
  "utm_reader",
  "utm_place",
  "utm_userid",
  "utm_cid",
  "ga_source",
  "ga_medium",
  "ga_term",
  "ga_content",
  "ga_campaign",
  "ga_place",
  "yclid",
  "_openstat",
  "fb_action_ids",
  "fb_action_types",
  "fb_ref",
  "fb_source",
  "hc_ref",
  "fref",
  "action_object_map",
  "action_type_map",
  "action_ref_map",
  "_hsenc",
  "mkt_tok",
  "gs_l",
  "xtor"
];

function onError(error) {
  let message = `[Simple Hinting extension] ${error}`;
  let pref_msg_status = document.getElementById("save-status");
  if (pref_msg_status) {
    document.getElementById("save-status").textContent = message;
    document.getElementById("save-status").style.color = "red";
  } else {
    console.error(message);
  }
}
