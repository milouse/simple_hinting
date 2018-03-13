# Simple Hinting

Allow keyboard browsing through links hinting.

This addon is available on
[AMO](https://addons.mozilla.org/en-US/firefox/addon/simple-hinting/).

It displays small green numbered labels next to the links of the current
page when you press `Alt + Shift`.

If you enter one of the displayed numbers, followed by a special
keycode, you'll be redirected to the link target, either directly or by
opening a new window or tab.

The keycodes are the following:

- `f` (*follow*), browse in current tab;
- `t` (*tab*), open in a new tab;
- `w` (*window*), open either a new window;
  browser preference;
- `i` (*incognito*) or `p` (*private*), open in a new private window;
- `v` (*view*), don't do anything, just display the target URL.

At any time, pressing `c` or `Esc` will cancel the link selection and
remove all green labels.

![screenshot](https://git.deparis.io/simple_hinting/plain/img/screen.png)

## Privacy

This addon try to protect your privacy by removing unwanted tracking
attributes from the URL you are trying to go to. The list of the banned
attributes is customizable in the addon options.

In order to remove attributes from short URL (e.g. on Twitter), this
addon call an [external web service](https://unshorten.deparis.io/),
which is responsible for expanding this kind of links. The source code
of this service is available [as a git repository](https://git.deparis.io/unshorten/).
The location of this service is customizable in the addon options, thus
you are free to host your own, or to use another service
(e.g. unshorten.me).
