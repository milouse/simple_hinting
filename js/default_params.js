"use strict";

// Default keys
const cancelkey = "c";
const viewkey = "v";
const actionkeys = {
  "f": "follow",
  "Enter": "follow",
  "w": "newwin",
  "t": "newtab",
  "i": "incognito",
  "p": "incognito",
  "a": "cleanall"
};

const default_unshorten_service = "https://unshorten.umaneti.net/c?url=";
var unshorten_service = default_unshorten_service;

function onError(error) {
  let message = `[Simple Hinting extension] ${error}`;
  let pref_msg_status = document.getElementById("save-status");
  if (pref_msg_status) {
    pref_msg_status.textContent = message;
    pref_msg_status.style.color = "red";
  } else {
    console.error(message);
  }
}

var unwanted_params = [];
function fetchUnwantedParams() {
  return fetch("https://unshorten.umaneti.net/params").then(
    function(response) {
      return response.json();
    }, onError
  ).then(function(upstream_params) {
    unwanted_params = upstream_params;
  }, onError);
}
function initUnwantedParams() {
  return fetchUnwantedParams().then(function() {
    browser.storage.local.set({
      "unwanted_params": unwanted_params
    });
  }, onError);
}

var tiny_domains = [];
function fetchTinyDomains() {
  return fetch("https://unshorten.umaneti.net/domains").then(
    function(response) {
      return response.json();
    }, onError
  ).then(function(upstream_tiny_domains) {
    tiny_domains = upstream_tiny_domains;
  }, onError);
}
function initTinyDomains() {
  return fetchTinyDomains().then(function() {
    browser.storage.local.set({
      "tiny_domains_list": tiny_domains
    });
  }, onError);
}
