function onError(error) {
  document.getElementById("save-status").textContent = `Error while retrieving extension options: ${error}`;
  document.getElementById("save-status").style.color = "red";
}

function saveOptions(event) {
  event.preventDefault();
  event.stopPropagation();
  var raw_params = [];
  let unwanted_params_field = document.querySelector("textarea#unwanted-params-field");
  if (unwanted_params_field && unwanted_params_field.value != "") {
    raw_params = unwanted_params_field.value.split(",");
    unwanted_params = [];
    for (let i = 0; i < raw_params.length; i++) {
      unwanted_params.push(raw_params[i].trim());
    }
  }
  let tiny_domains_field = document.querySelector("textarea#tiny-domains-field");
  if (tiny_domains_field && tiny_domains_field.value != "") {
    raw_params = tiny_domains_field.value.split(",");
    tiny_domains = [];
    for (let i = 0; i < raw_params.length; i++) {
      tiny_domains.push(raw_params[i].trim());
    }
  }
  unshorten_url_field = document.querySelector("input#unshorten-url-field")
  if (unshorten_url_field && unshorten_url_field.value != "") {
    unshorten_service = unshorten_url_field.value;
  }
  browser.storage.local.set({
    "unwanted_params": unwanted_params,
    "tiny_domains_list": tiny_domains,
    "unshorten_url": unshorten_service
  }).then(function () {
    document.getElementById("save-status").textContent = browser.i18n.getMessage("optionsSaved");
    document.getElementById("save-status").style.color = "green";
    restoreOptions();
  }, onError);
}
document.getElementById("simple-hinting-prefs").addEventListener("submit", saveOptions);

document.getElementById("reset-button").addEventListener("click", function(event) {
  document.querySelector("textarea#unwanted-params-field").value = unwanted_params.join(", ");
  document.querySelector("textarea#tiny-domains-field").value = tiny_domains.join(", ");
  document.querySelector("input#unshorten-url-field").value = unshorten_service;
  saveOptions(event);
});

function restoreOptions() {
  var i18nElements = document.querySelectorAll("[data-i18n]");
  for (let i = 0; i < i18nElements.length; i++) {
    let elem = i18nElements[i];
    let i18nString = browser.i18n.getMessage(elem.getAttribute("data-i18n"));
    if (elem.tagName == 'INPUT') {
      elem.value = i18nString;
    } else {
      elem.textContent = i18nString;
    }
  }
  let opts = ["unwanted_params", "tiny_domains_list", "unshorten_url"];
  browser.storage.local.get(opts).then(function (result) {
    let my_unwanted_params = unwanted_params;
    if (result.unwanted_params && Array.isArray(result.unwanted_params)) {
      my_unwanted_params = result.unwanted_params;
    }
    document.querySelector("textarea#unwanted-params-field").value = my_unwanted_params.join(", ");
    let my_tiny_domains = tiny_domains;
    if (result.tiny_domains_list && Array.isArray(result.tiny_domains_list)) {
      my_tiny_domains = result.tiny_domains_list;
    }
    document.querySelector("textarea#tiny-domains-field").value = my_tiny_domains.join(", ");
    let my_unshorten_url = unshorten_service;
    if (result.unshorten_url && result.unshorten_url != "") {
      my_unshorten_url = result.unshorten_url
    }
    document.querySelector("input#unshorten-url-field").value = my_unshorten_url;
  }, onError);
}
document.addEventListener("DOMContentLoaded", restoreOptions);
