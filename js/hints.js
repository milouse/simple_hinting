/**
 * This script is heavily inspired by previous work by
 * Christian Hahn (2010) for the surf webbrowser:
 * http://surf.suckless.org/files/easy_links
 */

if (typeof(browser) === "undefined") {
  var browser = chrome;
}

// Default keys
var cancelkey = "c";
var actionkeys = {
  "f": "follow",
  "Enter": "follow",
  "w": "newwin",
  "t": "newtab",
  "i": "incognito",
  "p": "incognito"
};

// styles
var label_style = {
  "color": "black",
  "fontSize": "10px",
  "backgroundColor": "#27FF27",
  "fontWeight": "normal",
  "margin": "0px",
  "padding": "0px",
  "position": "absolute",
  "zIndex": 99
};
var hl_style = {
  "backgroundColor": "#E3FF38",
  "fontSize": "15px"
};

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
  "action_object_map",
  "action_type_map",
  "action_ref_map",
  "_hsenc",
  "mkt_tok",
  "gs_l",
  "xtor"
];

// Globals
var nr_base = 10;   // >=10 : normal integer,
var labels = new Object();
var ui_visible = false;
var input = "";

// functions
function hl (t) {
  var at_least_one_match = false;
  for(let id in labels) {
    if (t && id.match("^" + t) == t) {
      at_least_one_match = true;
      for(let s in hl_style)
        labels[id].rep.style[s] = hl_style[s];
    } else {
      for(let s in label_style)
        labels[id].rep.style[s] = label_style[s];
    }
  }
  return at_least_one_match;
}

function clean_link(link) {
  if (link.href.search == "") {
    return link.href.toString();
  }
  try {
    var query = link.href.search.substr(1).split("&");
  } catch (e) {
    return link.href.toString();
  }
  var new_query = [];
  for (let i = 0; i < query.length; i++) {
    let cur_crit = query[i].split("=");
    if (unwanted_params.indexOf(cur_crit[0]) === -1) {
      new_query.push(query[i]);
    }
  }
  link.href.search = "?" + new_query.join("&");
  return link.href.toString();
}

function open_link (id, keyname) {
  try {
    var a = labels[input].a;
    if (!a) throw "no link found";
    action = actionkeys[keyname];
    if (!action) throw "no action found";
    let proper_link = clean_link(a);
    if(action === "follow")
      window.location.href = proper_link;
    else
      browser.runtime.sendMessage({ "url": proper_link, "type": action });
  } catch (e) {
    console.error("[Simple Hinting extension] Failed command", e);
  } finally {
    remove_ui();
  }
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
  var ankers = Array.from(document.getElementsByTagName("a"));

  // Add current visited page to the ankers
  var current_page = document.createElement("A");
  current_page.href = document.location.href;
  ankers.unshift(current_page);

  for (let i = 0; i < ankers.length; i++) {
    let a = ankers[i];
    if (!a.href) continue;

    let b = base(i+1, nr_base);

    var d = document.createElement("span");
    d.textContent = b;

    for(let s in label_style)
      d.style[s] = label_style[s];

    labels[b] = { "a": a, "rep": d };

    if (i == 0) {
      d.textContent += ": " + a.href;
      d.style.display = "block";
      d.style.position = "absolute";
      d.style.top = "0px";
      d.style.left = "0px";
      d.style.zIndex = "9999";
      document.body.appendChild(d);
    } else {
      a.parentNode.insertBefore(d, a.nextSibling);
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
    console.error("[Simple Hinting extension] Failed reading key", e);
  }
  return is_c;
}

// set key handler
window.addEventListener("keyup", function (e) {
  if (!ui_visible) return false;

  if(is_escape(e)) {
    remove_ui();

  } else if (is_command(e)) {
    open_link(input, e.key);

  } else if (Number.isInteger(Number.parseInt(e.key))) {
    input += e.key;
    if (!hl(input)) remove_ui();
  }
}, false);

function toggle_ui (request) {
  if (!request.command || request.command !== "display-hints") return;
  if (ui_visible)
    remove_ui();
  else
    create_ui();
}
browser.runtime.onMessage.addListener(toggle_ui);
