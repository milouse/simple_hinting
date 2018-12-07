TARGET     = firefox
VERSION   != sed -nr "s/^\s+\"version\": \"(.+)\",$$/\1/p" manifest.json
BUILD_FILE = web-ext-artifacts/simple_hinting-$(VERSION).zip

.PHONY: beta build clean

all: build

build: js/browser-polyfill.min.js
ifeq ($(TARGET), chromium)
	sed -i 14,19d manifest.json
endif
	web-ext build --ignore-files "Makefile" "web-ext-artifacts*" "**/*.xcf"
ifeq ($(TARGET), chromium)
	git checkout manifest.json
endif

beta: js/browser-polyfill.min.js
	web-ext sign --api-key=$$AMO_JWT_ISSUER --api-secret=$$AMO_JWT_SECRET	\
		--ignore-files "Makefile" "web-ext-artifacts*" "**/*.xcf" || true
	gio open "https://addons.mozilla.org/en-US/developers/addon/simple-hinting/versions"

clean:
	rm -rf webextension-polyfill

js/browser-polyfill.min.js:
	git clone "https://github.com/mozilla/webextension-polyfill.git"
	sed -i "s/sourceMap: true,/sourceMap: false,/" webextension-polyfill/Gruntfile.js
	sed -i "/\"prepublish\":/d" webextension-polyfill/package.json
	cd webextension-polyfill && \
		npm install && npm run build && npm run test
	cp webextension-polyfill/dist/browser-polyfill.min.js js/
