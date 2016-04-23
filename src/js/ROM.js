'use strict';

// NES ROM
var ROM = function(binary) {
	this.uint8 = new Uint8Array(binary);

};

// ROMバイナリデータをcosnole.log で dump
ROM.prototype.dump = function () {
	for(var i = 0; i < this.uint8.byteLength / 8; i++) {
		var hex_str = i * 8 + ":";
		for(var j = 0; j < 8; j++) {
			hex_str += "," + hex(this.uint8[i + j]);
		}
		console.log(hex_str);
	}
};

// 10進数を16進数文字列に変換する
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
