(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var ROM = function(binary) {

	this.uint8 = new Uint8Array(binary);

	for(var i = 0; i < this.uint8.length; i++) {
		console.log(hex(this.uint8[i]));
	}
};

function hex(num) {
	var str = num.toString(16);
	var prefix = '0x';
	var base = '';

	if(str.length < 2) {
		base = '0';
	}

	return prefix + base + str;
}

module.exports = ROM;

},{}],2:[function(require,module,exports){
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

},{"./ROM":1}]},{},[2]);
