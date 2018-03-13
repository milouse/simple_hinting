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

var default_unshorten_service = "https://unshorten.deparis.io/c?url="

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
  fetch("https://unshorten.deparis.io/domains").then(function(response) {
    return response.json();
  }).then(function(upstream_tiny_domains) {
    tiny_domains = upstream_tiny_domains;
    browser.storage.local.set({
      "tiny_domains_list": upstream_tiny_domains,
    }).then(function () {
      if (in_options) {
        let successf = document.getElementById("save-status");
        successf.textContent = browser.i18n.getMessage("tinyDomainsFetched");
        successf.style.color = "green";
        setTimeout(function() {
          document.getElementById("save-status").textContent = "";
        }, 3000);
      }
    }, onError);
    if (in_options) {
      let tdf = document.querySelector("textarea#tiny-domains-field");
      tdf.value = tiny_domains.join(", ");
      tdf.disabled = true;
    }
  });
}
