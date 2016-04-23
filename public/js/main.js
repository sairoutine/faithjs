(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var ROMHeader = require('./ROMHeader');
var util = require('./util');

// NES ROM
var ROM = function(binary) {
	this.uint8 = new Uint8Array(binary);
	this.header = new ROMHeader(this);
	this.mapper = this._generateMapper();
	this.chrrom = null;
	//this._initCHRROM(this.mapper);
};

// mapper を生成
ROM.prototype._generateMapper = function() {
	var mapper_num = this.header.getMapperNum();

	switch(mapper_num) {
		case 0:
			//return new NROMMapper(this);
			break;
		default:
			window.alert('unsupport No.' + mapper_num + ' Mapper');
			throw new Error('unsupport No.' + mapper_num + ' Mapper');
	}
};







// ROMバイナリデータをcosnole.log で dump
ROM.prototype.dump = function () {
	for(var i = 0; i < this.uint8.byteLength / 8; i++) {
		var hex_str = i * 8 + ":";
		for(var j = 0; j < 8; j++) {
			hex_str += "," + util.hex(this.uint8[i + j]);
		}
		console.log(hex_str);
	}
};

// ROMからデータをロード
ROM.prototype.load = function (address, length) {
	if(!length) {
		return this.uint8[address];
	}

	var array = [];
	for(var i = 0; i < length; i++) {
		array.push(this.uint8[address + i]);
	}

	return array;
};

// NESフォーマットのバイナリかどうか
ROM.prototype.isNES = function() {
	return this.header.isNES();
};

module.exports = ROM;

},{"./ROMHeader":2,"./util":4}],2:[function(require,module,exports){
'use strict';

var util = require('./util');

// NES ROM Header
var ROMHeader = function(rom) {
	this.rom = rom;
};


// NES Signature
ROMHeader.prototype.SIGNATURE = [0x4E,0x45,0x53,0x1A];

// check NES Signature
ROMHeader.prototype.isNES = function() {
	var signature = this.rom.load(0, 4);

	return util.isEqual(signature, this.SIGNATURE);
};

ROMHeader.prototype.getMapperNum = function() {
	var flags6 = this.rom.load(6);
	var lowerBits = util.getPartialBits(flags6, 4, 0xf);
	var flags7 = this.rom.load(6);
	var higherBits = util.getPartialBits(flags7, 4, 0xf);
	return (higherBits << 4) | lowerBits;
};

ROMHeader.prototype.getPartialBits = function(value, bit, mask) {
  return (value >> bit) & mask;
};



module.exports = ROMHeader;

},{"./util":4}],3:[function(require,module,exports){
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

},{"./ROM":1}],4:[function(require,module,exports){
'use strict';

var util = {};

// 10進数を16進数文字列に変換する
util.hex = function(num) {
	var str = num.toString(16);
	var prefix = '0x';

	if(str.length < 2) {
		str = ('00' + str).slice(-2);
	}

	return prefix + str;
};

// 10進数を2進数文字列に変換する
util.bit = function(num) {
	var str = num.toString(2);
	var prefix = '0b';

	if(str.length < 8) {
		str = ('00000000' + str).slice(-8);
	}

	return prefix + str;
};


// 配列が同一かどうか確認
util.isEqual = function(array1, array2) {
	return array1.toString() === array2.toString();
};

// 特定bitを取得
util.getPartialBits = function(value, bit, mask) {
	return (value >> bit) & mask;
};




module.exports = util;

},{}]},{},[3]);
