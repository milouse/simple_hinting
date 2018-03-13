TARGET     = firefox
VERSION   != sed -nr "s/^\s+\"version\": \"(.+)\",$$/\1/p" manifest.json
BUILD_FILE = web-ext-artifacts/simple_hinting-$(VERSION).zip

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
