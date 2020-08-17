TARGET = firefox
VERSION = $(shell sed -nr "s/^\s+\"version\": \"(.+)\",$$/\1/p" manifest.json)
WEBEXT = ./node_modules/web-ext/bin/web-ext
WEBEXTOPTS = --ignore-files Makefile webextension-polyfill "package*.json" "web-ext-artifacts*" "img/icon.xcf"

.PHONY: beta build clean cleanall

all: build

build: js/browser-polyfill.min.js
ifeq ($(TARGET), chromium)
	sed -i 14,19d manifest.json
endif
	$(WEBEXT) build $(WEBEXTOPTS)
ifeq ($(TARGET), chromium)
	git checkout manifest.json
endif

beta: js/browser-polyfill.min.js
	$(WEBEXT) sign --api-key=$$AMO_JWT_ISSUER --api-secret=$$AMO_JWT_SECRET \
		--channel=unlisted $(WEBEXTOPTS) || true
	gio open "https://addons.mozilla.org/en-US/developers/addon/simple-hinting/versions"

clean:
	rm -rf webextension-polyfill

cleanall: clean
	rm -rf node_modules

js/browser-polyfill.min.js:
	[ -d webextension-polyfill ] && git -C webextension-polyfill pull || \
		git clone "https://github.com/mozilla/webextension-polyfill.git"
	sed -i "s/sourceMap: true,/sourceMap: false,/" webextension-polyfill/Gruntfile.js
	sed -i "/\"prepublish\":/d" webextension-polyfill/package.json
	cd webextension-polyfill && npm install && npm run build && npm run test
	cp webextension-polyfill/dist/browser-polyfill.min.js js/
