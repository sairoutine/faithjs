'use strict';

var ROM = require('./ROM');

window.onload = function() {
	// ROMのパス
	var url = 'rom/mario.nes';

	var request = new XMLHttpRequest();
	request.responseType = 'arraybuffer';

	request.onload = function() {
		var rom_binary = request.response;

		var rom = new ROM(rom_binary);
	};

	request.onerror = function(e) {
		console.log("can't get rom binary");
	};

	request.open('GET', url, true);
	request.send(null);
};
