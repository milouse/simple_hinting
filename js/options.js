function parse_list_field(field) {
  var clean_params = [];
  if (field && field.value != "") {
    clean_params = field.value.split(",");
    for (let i = 0; i < clean_params.length; i++) {
      clean_params[i] = clean_params[i].trim();
    }
  }
  return clean_params;
}

function saveOptions(event) {
  event.preventDefault();
  event.stopPropagation();

  let new_opts = {
    "unwanted_params": unwanted_params,
    "tiny_domains_list": tiny_domains,
    "unshorten_url": default_unshorten_service
  };

  let unshorten_url_field = document.querySelector("input#unshorten-url-field")
  if (unshorten_url_field && unshorten_url_field.value != "") {
    new_opts["unshorten_url"] = unshorten_url_field.value;
  }

  let unwanted_params_field = document.querySelector("textarea#unwanted-params-field");
  new_opts["unwanted_params"] = parse_list_field(unwanted_params_field);

  let tiny_domains_field = document.querySelector("textarea#tiny-domains-field");
  new_opts["tiny_domains_list"] = parse_list_field(tiny_domains_field);

  if (new_opts["unshorten_url"] === default_unshorten_service) {
    tiny_domains_field.disabled = true;
    unwanted_params_field.disabled = true;
  } else {
    tiny_domains_field.disabled = false;
    unwanted_params_field.disabled = false;
  }

  browser.storage.local.set(new_opts).then(function() {
    let pref_msg_status = document.getElementById("save-status");
    pref_msg_status.textContent = browser.i18n.getMessage("optionsSaved");
    pref_msg_status.style.color = "green";
  }, onError);
}
document.getElementById("simple-hinting-prefs").addEventListener("submit", saveOptions);

function init_or_update_tiny_domains(url, reset) {
  var tdf = document.querySelector("textarea#tiny-domains-field");
  if (url !== default_unshorten_service) {
    tdf.disabled = false;
    return;
  } else {
    tdf.disabled = true;
  }
  if (reset === false) {
    fetchTinyDomains().then(function() {
      var old_params = parse_list_field(tdf);
      for (let i = 0; i < old_params.length; i++) {
        if (tiny_domains.indexOf(old_params[i]) === -1) {
          tiny_domains.push(old_params[i]);
        }
      }
      tdf.value = tiny_domains.join(", ");
    }, onError);
  } else {
    initTinyDomains().then(function() {
      tdf.value = tiny_domains.join(", ");
    }, onError);
  }
}

function init_or_update_unwanted_params(url, reset) {
  var tdf = document.querySelector("textarea#unwanted-params-field");
  if (url !== default_unshorten_service) {
    tdf.disabled = false;
    return;
  } else {
    tdf.disabled = true;
  }
  if (reset === false) {
    fetchUnwantedParams().then(function() {
      var old_params = parse_list_field(tdf);
      for (let i = 0; i < old_params.length; i++) {
        if (unwanted_params.indexOf(old_params[i]) === -1) {
          unwanted_params.push(old_params[i]);
        }
      }
      tdf.value = unwanted_params.join(", ");
    }, onError);
  } else {
    initUnwantedParams().then(function() {
      tdf.value = unwanted_params.join(", ");
    }, onError);
  }
}

document.getElementById("reset-button").addEventListener("click", function(event) {
  document.querySelector("input#unshorten-url-field").value = default_unshorten_service;
  init_or_update_unwanted_params(default_unshorten_service, true);
  init_or_update_tiny_domains(default_unshorten_service, true);
  saveOptions(event);
});

function restore_list_field(field, value, my_unshorten_url) {
  if (!value || !Array.isArray(value)) return;
  let loc_val = value;
  field.value = loc_val.join(", ");
}

function restoreOptions() {
  var i18nElements = document.querySelectorAll("[data-i18n]");
  for (let i = 0; i < i18nElements.length; i++) {
    let elem = i18nElements[i];
    let i18nString = browser.i18n.getMessage(elem.getAttribute("data-i18n"));
    if (elem.tagName === "INPUT") {
      elem.value = i18nString;
    } else {
      elem.textContent = i18nString;
    }
  }
  let opts = ["unwanted_params", "tiny_domains_list", "unshorten_url"];
  browser.storage.local.get(opts).then(function(result) {
    let my_unshorten_url = default_unshorten_service;
    if (result.unshorten_url && result.unshorten_url != "") {
      my_unshorten_url = result.unshorten_url
    }
    document.querySelector("input#unshorten-url-field").value = my_unshorten_url;

    restore_list_field(
      document.querySelector("textarea#tiny-domains-field"),
      result.tiny_domains_list,
      my_unshorten_url
    );
    init_or_update_tiny_domains(my_unshorten_url, false);

    restore_list_field(
      document.querySelector("textarea#unwanted-params-field"),
      result.unwanted_params,
      my_unshorten_url
    );
    init_or_update_unwanted_params(my_unshorten_url, false);
  }, onError);
}
document.addEventListener("DOMContentLoaded", restoreOptions);
