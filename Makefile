install:
	npm install
publish:
	npm publish --dry-run
rss:
	node src/index.js
test:
	npm test
test-coverage:
	npm test -- --coverage --coverageProvider=v8
lint:
	npx eslint .