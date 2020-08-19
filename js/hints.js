"use strict";

/**
 * This script is heavily inspired by previous work by
 * Christian Hahn (2010) for the surf webbrowser:
 * http://surf.suckless.org/files/easy_links
 */


// Globals
function SimpleHinting () {
  this.nr_base = 10;   // >=10 : normal integer,
  this.labels = new Object();
  this.ui_visible = false;
  this.input = "";
};

// functions
SimpleHinting.prototype.highlight = function () {
  var at_least_one_match = false;
  for(let id in this.labels) {
    if (this.input && id.match("^" + this.input) !== null) {
      at_least_one_match = true;
      this.labels[id].rep.classList.add("sh_hint_hl");
    } else {
      this.labels[id].rep.classList.remove("sh_hint_hl");
    }
    if (id !== 1)
      this.labels[id].rep.textContent = id;
  }
  return at_least_one_match;
}

SimpleHinting.prototype.clean_attributes = function (url_part, symbol) {
  // url_part may be "search" or "hash"
  try {
    var query = url_part.substr(1).split("&");
  } catch (e) {
    return url_part;
  }
  var new_query = [];
  for (let i = 0; i < query.length; i++) {
    let cur_crit = query[i].split("=");
    if (unwanted_params.indexOf(cur_crit[0]) === -1) {
      new_query.push(query[i]);
    }
  }
  if (new_query.length > 0) {
    return symbol + new_query.join("&");
  }
  return "";
}

SimpleHinting.prototype.clean_link = function (link) {
  if (link.search !== "") {
    link.search = this.clean_attributes(link.search, "?");
  }
  if (link.hash !== "") {
    link.hash = this.clean_attributes(link.hash, "#");
  }
  return link.toString();
}

SimpleHinting.prototype.unshorten_link = function (link, success) {
  if (tiny_domains.indexOf(link.hostname) === -1) {
    return success.call(this, link);
  }
  try {
    let req_uri = unshorten_service + link.href;
    const xhr = new XMLHttpRequest();
    xhr.open("GET", req_uri);
    var ext_this = this;
    xhr.onload = function () {
      link.href = xhr.responseText.trim();
      success.call(ext_this, link);
    };
    xhr.onerror = function () { throw xhr.statusText; };
    xhr.send();
  } catch (e) {
    onError(`Ajax failed ${e}`);
  }
}

SimpleHinting.prototype.update_link = function (link, cl) {
  link.href = cl;
  if (link.title !== "" &&
      (link.title.slice(0, 7) === "http://" ||
       link.title.slice(0, 7) === "https:/")) {
    link.title = cl;
  }
  let link_content = link.textContent.trim();
  if (link_content.slice(0, 7) === "http://" ||
      link_content.slice(0, 7) === "https:/") {
    link.textContent = cl;
    return true;
  }
  // Twitter hack as it hides the scheme
  if (tiny_domains.indexOf(link_content.split("/", 2)[0]) !== -1) {
    link.textContent = cl;
    return true;
  }
  return false;
}

SimpleHinting.prototype.view_link = function () {
  var col = browser.i18n.getMessage("columnSeparator");
  for(let id in this.labels) {
    if (id === 1) continue;
    if (this.labels[id].a.tagName !== "A") continue;
    if (this.input && id.match("^" + this.input) !== null) {
      var base_text = id;
      this.labels[id].rep.classList.add("sh_hint_view");
      this.labels[id].rep.textContent = base_text + col +
        browser.i18n.getMessage("parsingPlaceholder");
      this.unshorten_link(this.labels[id].a, function(long_link) {
        let cl = this.clean_link(long_link);
        if (this.update_link(this.labels[id].a, cl)) {
          this.labels[id].rep.textContent = base_text;
          this.labels[id].rep.classList.remove("sh_hint_view");
        } else {
          this.labels[id].rep.textContent = base_text + col + cl;
        }
      });
    }
  }
}

SimpleHinting.prototype.open_link = function (keyname) {
  try {
    var a = this.labels[this.input].a;
    if (!a) throw "no link found";
    action = actionkeys[keyname];
    if (!action) throw "no action found";
  } catch (e) {
    onError(`Failed command: ${e}`);
  } finally {
    this.remove_ui();
  }
  if (a.tagName !== "A") {
    a.focus();
    return;
  }
  this.unshorten_link(a, function(la) {
    let proper_link = this.clean_link(la);
    if(action === "follow")
      window.location.href = proper_link;
    else
      browser.runtime.sendMessage({
        "url": proper_link.toString(),
        "type": action
      });
  });
}

// Remove labels from the DOM
SimpleHinting.prototype.remove_ui = function () {
  for(let id in this.labels) {
    let pe = this.labels[id].rep.parentElement;
    if (pe) pe.removeChild(this.labels[id].rep);
  }
  this.labels = new Object();
  this.ui_visible = false;
  this.input = "";
}

// Create labels when needed
SimpleHinting.prototype.create_ui = function () {
  this.labels = new Object();
  this.input = "";
  let selectors = "a, input[type=text], input[type=search], textarea";
  var ankers = Array.from(document.querySelectorAll(selectors));

  // Add current visited page to the ankers
  var current_page = document.createElement("A");
  current_page.href = document.location.href;
  ankers.unshift(current_page);

  for (let i = 0; i < ankers.length; i++) {
    let a = ankers[i];
    if (a.tagName === "A" && !a.href) continue;
    // Are you visible?
    if (a.hidden || a.style.display === "none" ||
        a.style.visibility === "hidden") {
      continue;
    }
    let astyles = window.getComputedStyle(a);
    if (astyles.display === "none" || astyles.visibility === "hidden") {
      continue;
    }

    let b = this.base(i+1, this.nr_base);

    var d = document.createElement("span");
    d.classList.add("sh_hint");
    d.textContent = b;

    this.labels[b] = { "a": a, "rep": d };

    if (i === 0) {
      d.textContent += browser.i18n.getMessage("columnSeparator") +
        this.clean_link(a);
      d.classList.add("sh_hint_first");
      document.body.appendChild(d);
    } else {
      if (a.nextSibling) {
        a.parentNode.insertBefore(d, a.nextSibling);
      } else {
        a.parentNode.appendChild(d);
      }
    }
  }
  this.ui_visible = true;
}

SimpleHinting.prototype.base = function (n, b) {
  if (b >= 10) return n.toString();
  let res = new Array();
  while (n) {
    res.push( (n%b +1).toString() )
    n = parseInt( n / b );
  }
  return res.reverse().join("");
}

SimpleHinting.prototype.fix_one_link = function (link_uri) {
  var all_links = document.querySelectorAll(
    "a[href='" + link_uri + "']");
  for (let i = 0; i < all_links.length; i++) {
    let link = all_links[i];
    let d = document.createElement("span");
    d.className = "sh_hint sh_hint_view";
    if (link.nextSibling) {
      link.parentNode.insertBefore(d, link.nextSibling);
    } else {
      link.parentNode.appendChild(d);
    }
    d.textContent = browser.i18n.getMessage("parsingPlaceholder");
    this.ui_visible = true;
    this.labels[i] = { "rep": d };
    this.unshorten_link(link, function(long_link) {
      let cl = this.clean_link(long_link);
      d.textContent = cl;
      if (this.update_link(link, cl)) {
        link.classList.add("sh_fixed_link");
        // In the case where the URL is directly visible, we remove
        // the hint to avoid repetitive information
        this.remove_ui();
      }
      link.blur();
    });
  }
}


function is_command (key) {
  let is_c = false;
  try {
    is_c = Object.keys(actionkeys).indexOf(key) !== -1;
  } catch (_e) {
    onError(`Failed reading key: ${key}`);
  }
  return is_c;
}

function input_key_listener (e) {
  const key = e.key;
  if(key === "Escape" || key === "Esc" || key === cancelkey) {
    main_simple_hinting.remove_ui();

  } else if (key === "Backspace") {
    main_simple_hinting.input = main_simple_hinting.input.slice(0, -1);
    if (!main_simple_hinting.highlight())
      main_simple_hinting.remove_ui();

  } else if (key === viewkey) {
    main_simple_hinting.view_link(key);

  } else if (is_command(key)) {
    if (actionkeys[key] === "cleanall") {
      main_simple_hinting.remove_ui();
      fix_all_links();

    } else {
      main_simple_hinting.open_link(key);
    }

  } else if (Number.isInteger(Number.parseInt(key))) {
    main_simple_hinting.input += key;
    if (!main_simple_hinting.highlight())
      main_simple_hinting.remove_ui();
  }
  return true
}


function toggle_main_simple_hinting_ui () {
  if (main_simple_hinting.ui_visible) {
    // Remove key handler
    window.removeEventListener("keyup", input_key_listener, false);
    // Remove UI
    main_simple_hinting.remove_ui();
  } else {
    // Set key handler
    window.addEventListener("keyup", input_key_listener, false);
    // Add UI
    main_simple_hinting.create_ui();
  }
}

function fix_all_links () {
  var all_page_links = document.querySelectorAll("A");
  var already_done = [];
  var totally_done = 0;
  for (let i = 0; i < all_page_links.length; i++) {
    let link_uri = all_page_links[i].href.trim();
    if (link_uri === "" || link_uri[0] == "#") continue;
    if (already_done.indexOf(link_uri) !== -1) continue;
    already_done.push(link_uri);
    let sh = new SimpleHinting();
    sh.fix_one_link(link_uri);
    // In any case, remove ui to avoid spam
    sh.remove_ui();
    totally_done += 1;
  }
  browser.runtime.sendMessage({
    "url": document.location.href.toString(),
    "message": totally_done,
    "type": "updatebadge"
  });
}


const main_simple_hinting = new SimpleHinting();

let opts = ["unwanted_params", "tiny_domains_list", "unshorten_url"];
browser.storage.local.get(opts).then(function (result) {
  if (result.unshorten_url && result.unshorten_url !== "") {
    unshorten_service = result.unshorten_url;
  }
  let must_init = true;
  if (unshorten_service !== default_unshorten_service) {
    must_init = false;
  }
  if (result.unwanted_params && Array.isArray(result.unwanted_params)) {
    unwanted_params = result.unwanted_params;
  } else if (must_init) {
    initUnwantedParams();
  }
  if (result.tiny_domains_list && Array.isArray(result.tiny_domains_list)) {
    tiny_domains = result.tiny_domains_list;
  } else if (must_init) {
    initTinyDomains();
  }
}, onError);


browser.runtime.onMessage.addListener(function(data, sender) {
  if (sender.id !== "simple_hinting@umaneti.net") return false;
  if (!data["message"]) return false;
  if (data.message === "fix_one") {
    if (!data["link_uri"]) return false;
    let link_uri = data.link_uri.trim();
    if (link_uri === "" || link_uri[0] === "#") return false;
    let sh = new SimpleHinting();
    sh.fix_one_link(link_uri);
  } else if (data.message === "fix_all") {
    fix_all_links();
  } else if (data.message === "toggle_ui") {
    toggle_main_simple_hinting_ui();
  }
  return true;
});
