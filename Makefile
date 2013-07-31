GENERATED_FILES = \
	calendar.js \
	calendar.min.js 

.PHONY: clean all 

clean:
	@rm -f -- $(GENERATED_FILES)

all: $(GENERATED_FILES)

calendar.js: $(shell node_modules/.bin/smash --list src/calendar.js) package.json
	@rm -f $@
	node_modules/.bin/smash src/smash_calendar.js | node_modules/.bin/uglifyjs -b --indent 2 -o $@
	@chmod a-w $@

calendar.min.js: calendar.js
	@rm -f $@
	node_modules/.bin/uglifyjs $< > $@