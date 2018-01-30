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

var default_unshorten_service = "https://deparis.io/unshorten.php?url="

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

var tiny_domains = [];
function initTinyDomains(unshorten_url, in_options) {
  if (unshorten_url != default_unshorten_service) {
    if (in_options) {
      let tdf = document.querySelector("textarea#tiny-domains-field");
      tdf.value = "";
      tdf.disabled = false;
    }
    return;
  }
  fetch("https://deparis.io/unshorten.php?json").then(function(response) {
    return response.json();
  }).then(function(upstream_tiny_domains) {
    if (!in_options) {
      tiny_domains = upstream_tiny_domains;
      return;
    }
    let tdf = document.querySelector("textarea#tiny-domains-field");
    tdf.value = upstream_tiny_domains.join(", ");
    tdf.disabled = true;
  });
}
