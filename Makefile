TARGET ?= firefox
VERSION = $(shell sed -nr "s/^\s+\"version\": \"(.+)\",$$/\1/p" manifest.json)

all: build

build: clean
ifeq ($(TARGET), chromium)
	sed -i 14,19d manifest.json
endif
	web-ext build --ignore-files "Makefile" "web-ext-artifacts*" "**/*.xcf"
ifeq ($(TARGET), chromium)
	git checkout manifest.json
endif

clean:
	rm -f "web-ext-artifacts/simple_hinting-$(VERSION).zip"
