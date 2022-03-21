clean: 
	@lerna clean

install:
	@npm install
	@lerna bootstrap

build: clean install
	@npm run build spine-base -- --types
	@npm run build -- --types

link:
	@tnpm link ./packages/*/

all: build link