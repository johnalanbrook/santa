play:
	cd .src && make
	cp .src/build_dbg/prosperon .
	mkdir -p core
	cp -r .src/scripts .src/fonts .src/icons core
	./prosperon

win:
	cd .src && make crosswin
	cp .src/build_win/prosperon.exe .
	mkdir -p core
	cp -r .src/scripts .src/fonts .src/icons core
	./prosperon.exe

pretty:
	clang-format -i $(SCRIPTS)
