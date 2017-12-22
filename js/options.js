function onError(error) {
  document.getElementById("save-status").textContent = `Error while retrieving extension options: ${error}`;
  document.getElementById("save-status").style.color = "red";
}

function saveOptions(event) {
  event.preventDefault();
  event.stopPropagation();
  var unwanted_params = [];
  let unwanted_params_field = document.querySelector("input#unwanted-params-field");
  if (!unwanted_params_field || unwanted_params_field.value == "") {
    return false;
  }
  var raw_params = unwanted_params_field.value.split(",");
  for (let i = 0; i < raw_params.length; i++) {
    unwanted_params.push(raw_params[i].trim())
  }
  browser.storage.local.set({
    "unwanted_params": unwanted_params
  }).then(function () {
    document.getElementById("save-status").textContent = "Options saved!";
    document.getElementById("save-status").style.color = "green";
    restoreOptions();
  }, onError);
}
document.getElementById("simple-hinting-prefs").addEventListener("submit", saveOptions);

document.getElementById("reset-button").addEventListener("click", function(event) {
  document.querySelector("input#unwanted-params-field").value = unwanted_params.join(", ");
  saveOptions(event);
});

function restoreOptions() {
  browser.storage.local.get(["unwanted_params"]).then(function (result) {
    let my_unwanted_params = unwanted_params;
    if (result.unwanted_params && Array.isArray(result.unwanted_params)) {
      my_unwanted_params = result.unwanted_params;
    }
    document.querySelector("input#unwanted-params-field").value = my_unwanted_params.join(", ");
  }, onError);
}
document.addEventListener("DOMContentLoaded", restoreOptions);
