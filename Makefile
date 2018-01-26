TARGET ?= firefox
VERSION = $(shell sed -nr "s/^\s+\"version\": \"(.+)\",$$/\1/p" manifest.json)

all: build

build:
ifeq ($(TARGET), chromium)
	sed -i 14,19d manifest.json
endif
	web-ext build --ignore-files "Makefile" "web-ext-artifacts*" "**/*.xcf"
ifeq ($(TARGET), chromium)
	git checkout manifest.json
endif

sign:
	web-ext sign --api-key=$$AMO_JWT_ISSUER --api-secret=$$AMO_JWT_SECRET	\
		--ignore-files "Makefile" "web-ext-artifacts*" "**/*.xcf"
