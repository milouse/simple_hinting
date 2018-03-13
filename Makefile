TARGET     = firefox
VERSION   != sed -nr "s/^\s+\"version\": \"(.+)\",$$/\1/p" manifest.json
BUILD_FILE = web-ext-artifacts/simple_hinting-$(VERSION).zip

.PHONY: build clean deps

all: build

build: clean $(BUILD_FILE)
ifeq ($(TARGET), chromium)
	git checkout manifest.json
endif

$(BUILD_FILE):
ifeq ($(TARGET), chromium)
	sed -i 14,19d manifest.json
endif
	web-ext build --ignore-files "Makefile" "web-ext-artifacts*" "**/*.xcf"

clean:
	rm -f $(BUILD_FILE)
	rm -rf webextension-polyfill

webextension-polyfill/dist/browser-polyfill.min.js:
	git clone "https://github.com/mozilla/webextension-polyfill.git"
	sed -i "s/sourceMap: true,/sourceMap: false,/" webextension-polyfill/Gruntfile.js
	sed -i "/\"prepublish\":/d" webextension-polyfill/package.json
	cd webextension-polyfill && \
		npm install && npm run build && npm run test

deps: webextension-polyfill/dist/browser-polyfill.min.js
	cp webextension-polyfill/dist/browser-polyfill.min.js js/
