clean: 
	@lerna clean

install:
	@npm install --force
	@lerna bootstrap

build: clean install
	@npm run build spine-base -- --types
	@npm run build -- --types

link:
	@pnpm link ./packages/*/ --global

all: build link