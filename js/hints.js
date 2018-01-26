/**
 * This script is heavily inspired by previous work by
 * Christian Hahn (2010) for the surf webbrowser:
 * http://surf.suckless.org/files/easy_links
 */

// Globals
var nr_base = 10;   // >=10 : normal integer,
var labels = new Object();
var ui_visible = false;
var input = "";

// functions
function highlight () {
  var at_least_one_match = false;
  for(let id in labels) {
    if (input && id.match("^" + input) !== null) {
      at_least_one_match = true;
      labels[id].rep.classList.add("sh_hint_hl");
    } else {
      labels[id].rep.classList.remove("sh_hint_hl");
    }
    if (id != 1)
      labels[id].rep.textContent = id;
  }
  return at_least_one_match;
}

function clean_attributes (url_part, symbol) {
  // url_part may be 'search' or 'hash'
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

function clean_link (link) {
  if (link.search != "") {
    link.search = clean_attributes(link.search, "?");
  }
  if (link.hash != "") {
    link.hash = clean_attributes(link.hash, "#");
  }
  return link.toString();
}

function unshorten_link (link, success) {
  if (link.hasAttribute("data-expanded-url")){
    // shortcut for twitter timeline links
    link.href = link.getAttribute("data-expanded-url");
  }
  if (tiny_domains.indexOf(link.hostname) === -1) {
    return success(link);
  }
  try {
    let req_uri = unshorten_service + link.href;
    const xhr = new XMLHttpRequest();
    xhr.open("GET", req_uri);
    xhr.onload = function () {
      link.href = xhr.responseText.trim();
      success(link);
    };
    xhr.onerror = function () { throw xhr.statusText; };
    xhr.send();
  } catch (e) {
    onError(`Ajax failed ${e}`);
  }
}

function update_link (link, cl) {
  link.href = cl;
  if (link.title != "" &&
      (link.title.slice(0, 7) == "http://" ||
       link.title.slice(0, 7) == "https:/")) {
    link.title = cl;
  }
  let link_content = link.textContent.trim();
  if (link_content.slice(0, 7) == "http://" ||
      link_content.slice(0, 7) == "https:/") {
    link.textContent = cl;
    return true;
  }
  return false;
}

function view_link () {
  var col = browser.i18n.getMessage("columnSeparator");
  for(let id in labels) {
    if (id == 1) continue;
    if (labels[id].a.tagName != "A") continue;
    if (input && id.match("^" + input) !== null) {
      var base_text = id;
      labels[id].rep.classList.add("sh_hint_view");
      labels[id].rep.textContent = base_text + col +
        browser.i18n.getMessage("parsingPlaceholder");
      unshorten_link(labels[id].a, function(long_link) {
        let cl = clean_link(long_link);
        if (update_link(labels[id].a, cl)) {
          labels[id].rep.textContent = base_text;
          labels[id].rep.classList.remove("sh_hint_view");
        } else {
          labels[id].rep.textContent = base_text + col + cl;
        }
      });
    }
  }
}

function open_link (keyname) {
  try {
    var a = labels[input].a;
    if (!a) throw "no link found";
    action = actionkeys[keyname];
    if (!action) throw "no action found";
  } catch (e) {
    onError("Failed command: " + e);
  } finally {
    remove_ui();
  }
  if (a.tagName != "A") {
    a.focus();
    return;
  }
  unshorten_link(a, function(la) {
    let proper_link = clean_link(la);
    if(action === "follow")
      window.location.href = proper_link;
    else
      browser.runtime.sendMessage({
        "url": proper_link,
        "type": action
      });
  });
}

// Remove labels from the DOM
function remove_ui () {
  for(let id in labels) {
    let pe = labels[id].rep.parentElement;
    if (pe) pe.removeChild(labels[id].rep);
  }
  labels = new Object();
  ui_visible = false;
  input = "";
}

// Create labels when needed
function create_ui () {
  let selectors = "a, input[type=text], input[type=search], textarea";
  var ankers = Array.from(document.querySelectorAll(selectors));

  // Add current visited page to the ankers
  var current_page = document.createElement("A");
  current_page.href = document.location.href;
  ankers.unshift(current_page);

  for (let i = 0; i < ankers.length; i++) {
    let a = ankers[i];
    if (a.tagName == "A" && !a.href) continue;
    // Are you visible?
    if (a.hidden || a.style.display == "none" ||
        a.style.visibility == "hidden") {
      continue;
    }
    astyles = window.getComputedStyle(a);
    if (astyles.display == "none" || astyles.visibility == "hidden") {
      continue;
    }

    let b = base(i+1, nr_base);

    var d = document.createElement("span");
    d.classList.add("sh_hint");
    d.textContent = b;

    labels[b] = { "a": a, "rep": d };

    if (i == 0) {
      d.textContent += browser.i18n.getMessage("columnSeparator") +
        clean_link(a);
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
  ui_visible = true;
}

function base (n, b) {
  if (b >= 10) return n.toString();
  let res = new Array();
  while (n) {
    res.push( (n%b +1).toString() )
    n = parseInt( n / b );
  }
  return res.reverse().join("");
}

function is_lshift (e) {
  return (e.key === "Shift" || e.key === "GroupPrevious" || e.shiftKey);
}

function is_alt (e) {
  return (e.key === "Alt" || e.key === "Meta" || e.altKey);
}

function is_escape (e) {
  return (e.key === "Escape" || e.key === "Esc" || e.key === cancelkey);
}

function is_command (e) {
  var is_c = false;
  try {
    is_c = Object.keys(actionkeys).indexOf(e.key) !== -1;
  } catch (e) {
    onError("Failed reading key: " + e);
  }
  return is_c;
}

// set key handler
window.addEventListener("keyup", function(e) {
  if (is_lshift(e) && is_alt(e)) {
    if (ui_visible) remove_ui();
    else create_ui();
    return true
  } else if (!ui_visible) {
    return false
  }

  if(is_escape(e)) {
    remove_ui();

  } else if (e.key == "Backspace") {
    input = input.slice(0, -1);
    if (!highlight()) remove_ui();

  } else if (e.key === viewkey) {
    view_link(e.key);

  } else if (is_command(e)) {
    open_link(e.key);

  } else if (Number.isInteger(Number.parseInt(e.key))) {
    input += e.key;
    if (!highlight()) remove_ui();
  }
  return true
}, false);


let opts = ["unwanted_params", "tiny_domains_list", "unshorten_url"];
browser.storage.local.get(opts).then(function (result) {
  if (result.unwanted_params && Array.isArray(result.unwanted_params)) {
    unwanted_params = result.unwanted_params;
  }
  if (result.tiny_domains_list && Array.isArray(result.tiny_domains_list)) {
    tiny_domains = result.tiny_domains_list;
  }
  if (result.unshorten_url && result.unshorten_url != "") {
    unshorten_service = result.unshorten_url;
  }
}, onError);

browser.runtime.onMessage.addListener(function(data) {
  if (!data['message']) return false;
  if (data.message != "fix_one" || !data['link_uri']) return false;
  if (data.link_uri == "" || data.link_uri[0] == "#") return false;
  var all_links = document.querySelectorAll(
    "a[href='" + data.link_uri + "']");
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
    ui_visible = true;
    labels[i] = { "rep": d };
    unshorten_link(link, function(long_link) {
      let cl = clean_link(long_link);
      d.textContent = cl;
      if (update_link(link, cl)) {
        link.classList.add("sh_fixed_link");
        // In the case where the URL is directly visible, we remove
        // the hint to avoid repetitive information
        remove_ui();
      }
      link.blur();
    });
  }
  return true;
});
