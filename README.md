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
attributes from the URL you are trying to go to. The list of the banned
attributes is customizable in the addon options.

In order to remove attributes from short URL (e.g. on Twitter), this
addon call an [external web service][2], which is responsible for
expanding this kind of links. The source code of this service is
available [as a git repository][3].

## Credits

The script behind this addon is heavily inspired by
[a previous work by Christian Hahn (2010)][4] for the surf webbrowser.

[1]: https://addons.mozilla.org/en-US/firefox/addon/simple-hinting/
[2]: https://unshorten.umaneti.net/
[3]: https://git.umaneti.net/unshorten/
[4]: http://surf.suckless.org/files/easy_links
