# Simple Hinting

Allow keyboard browsing through links hinting.

This addon is available on [AMO][1].

## Usage

It displays small green numbered labels next to the links of the current
page when you press `Alt + Shift + L`.

If you enter one of the displayed numbers, followed by a special
keycode, you'll be redirected to the link target, either directly or by
opening a new window or tab.

The keycodes are the following:

- `f` (*follow*), browse in current tab;
- `t` (*tab*), open in a new tab;
- `w` (*window*), open in a new window;
- `i` (*incognito*) or `p` (*private*), open in a new private window
  (only if you've authorized this addons to run on private windows);
- `v` (*view*), don't do anything, just display the target URL.

At any time, pressing `c` or `Esc` will cancel the link selection and
remove all green labels.

![screenshot](https://git.umaneti.net/simple_hinting/plain/img/screen.png)

## Privacy

This addon try to protect your privacy by removing unwanted tracking
parameters from the URL you are trying to go to. Another widespread
privacy invading behavior consists by hiding real links behind a short
link, which is responsible to track who click on which link, and
when. In this later case, this addon call an [external web service][2],
which will expand a tiny URL, before removing its tracking parameters,
if any. That is why this addon ask for the permission to contact
`unshorten.umaneti.net` host.

To avoid asking too frequently to this [same remote web service][2] what
to do about a link, this addon will download from it two lists:

- a list of known tracking parameters, which will help it to remove
  them from already expanded URLs without having to contact the remote
  service;
- a list of known shorten URL services, for which this addons must
  contact the remote web service to resolve and clean them.

This two lists are then stored in your web browser addons storage area
(hence the permission to use it).

The source code of the previously mentioned external web service is
[available][3] too.

## Credits

The script behind this addon is heavily inspired by
[a previous work by Christian Hahn (2010)][4] for the surf webbrowser.

[1]: https://addons.mozilla.org/en-US/firefox/addon/simple-hinting/
[2]: https://unshorten.umaneti.net/
[3]: https://git.umaneti.net/unshorten/
[4]: http://surf.suckless.org/files/easy_links
