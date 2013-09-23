GENERATED_FILES = \
	calendar.js \
	calendar.min.js 

.PHONY: clean docs all 

clean:
	@rm -f -- $(GENERATED_FILES)
	@rm -rf docs/*;

all: $(GENERATED_FILES) docs

docs: 
	@rm -rf docs/*;
	@rm -rf tutorials/*;
	node_modules/jsdoc/jsdoc -c conf.json


calendar.js: $(shell node_modules/.bin/smash --list src/calendar.js) package.json
	@rm -f $@
	node_modules/.bin/smash src/smash_calendar.js | node_modules/.bin/uglifyjs -b --indent 2 -o $@
	@chmod a-w $@

calendar.min.js: calendar.js
	@rm -f $@
	node_modules/.bin/uglifyjs $< > $@