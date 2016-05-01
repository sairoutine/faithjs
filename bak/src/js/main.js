'use strict';

var ROM = require('./ROM');
var Display = require('./Display');
var NES = require('./NES');

window.onload = function() {
	// ROMのパス
	var url = 'rom/mario.nes';

	var request = new XMLHttpRequest();
	request.responseType = 'arraybuffer';

	request.onload = function() {
		var rom_binary = request.response;

		// NES ROM
		var rom = new ROM(rom_binary);

	  	if(! rom.isNES()) {
			console.error("this file doesn't seem to be nes rom");
			return;
		}

		// Display
		var canvas = document.getElementById('mainCanvas');
		var display = new Display(canvas);

		// NES
		var nes = new NES(rom, display);
		nes.init();
		window.onkeydown = function(e) { nes.handleKeyDown(e) };
		window.onkeyup   = function(e) { nes.handleKeyUp(e) };

		// 電源ON
		nes.bootup();
		// RUN !
		nes.run();
		return;
	};

	request.onerror = function(e) {
		console.log("can't get rom binary");
	};

	request.open('GET', url, true);
	request.send(null);
};
