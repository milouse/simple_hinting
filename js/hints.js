/**
 * This script is heavily inspired by previous work by
 * Christian Hahn (2010) for the surf webbrowser:
 * http://surf.suckless.org/files/easy_links
 */

if (typeof(browser) === "undefined") {
  var browser = chrome;
}

// Default keys
var openkey      = "f";
var newwinkey    = "w";
var newtabkey    = "t";
var cancelkey    = "c";
var incognitokey = "i";

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

// Globals
var nr_base = 5;   // >=10 : normal integer,
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

function open_link (id, action) {
  try {
    var a = labels[input].a;
    if (!a) throw "no link found";
    if(action === openkey || action === "Enter")
      window.location.href = a.href;
    else if (action === newtabkey)
      browser.runtime.sendMessage({ "url": a.href });
    else if (action === newwinkey)
      browser.runtime.sendMessage({ "url": a.href, "type": "window" });
    else if (action === incognitokey)
      browser.runtime.sendMessage({ "url": a.href, "type": "incognito" });
  } catch (e) {
    console.error("Simple Hinting extension: ", e);
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
  var ankers = document.getElementsByTagName("a");
  for (let i = 0; i < ankers.length; i++) {
    let a = ankers[i];
    if (!a.href) continue;

    let b = base(i+1, nr_base);

    var d = document.createElement("span");
    d.textContent = b;

    for(let s in label_style)
      d.style[s] = label_style[s];

    labels[b] = { "a": a, "rep": d };
    a.parentNode.insertBefore(d, a.nextSibling);
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
  return (e.key === newwinkey || e.key === newtabkey || e.key === openkey || e.key === incognitokey || e.key === "Enter");
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
