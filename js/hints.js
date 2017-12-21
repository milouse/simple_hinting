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

function clean_link(link) {
  if (link.search == "") {
    return link.toString();
  }
  try {
    var query = link.search.substr(1).split("&");
  } catch (e) {
    return link.toString();
  }
  var new_query = [];
  for (let i = 0; i < query.length; i++) {
    let cur_crit = query[i].split("=");
    if (my_unwanted_params.indexOf(cur_crit[0]) === -1) {
      new_query.push(query[i]);
    }
  }
  if (new_query.length > 0) {
    link.search = "?" + new_query.join("&");
  } else {
    link.search = "";
  }
  return link.toString();
}

function view_link () {
  for(let id in labels) {
    if (id == 1) continue;
    if (input && id.match("^" + input) !== null) {
      labels[id].rep.textContent += ": " + clean_link(labels[id].a);
      labels[id].rep.classList.add("sh_hint_view");
    }
  }
}

function open_link (keyname) {
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
    onError("Failed command: " + e);
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
    d.classList.add("sh_hint");
    d.textContent = b;

    labels[b] = { "a": a, "rep": d };

    if (i == 0) {
      d.textContent += ": " + clean_link(a);
      d.classList.add("sh_hint_first");
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


browser.storage.local.get("unwanted_params").then(function (result) {
  if (result.unwanted_params && Array.isArray(result.unwanted_params)) {
    my_unwanted_params = result.unwanted_params;
  }
}, onError);
