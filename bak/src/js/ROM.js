'use strict';

var ROMHeader = require('./ROMHeader');
var util = require('./util');

var NROMMapper = require('./Mapper/NROM');
var CHRROM = require('./CHRROM');

// NES ROM
var ROM = function(binary) {
	this.uint8 = new Uint8Array(binary);
	this.header = new ROMHeader(this);
	this.mapper = this._generateMapper();
	this.chrrom = this._generateCHRROM(this.mapper);
};

// mapper を生成
ROM.prototype._generateMapper = function() {
	var mapper_num = this.header.getMapperNum();

	switch(mapper_num) {
		case 0:
			return new NROMMapper(this);
		default:
			window.alert('unsupport No.' + mapper_num + ' Mapper');
			throw new Error('unsupport No.' + mapper_num + ' Mapper');
	}
};

// CHR ROM を生成
ROM.prototype._generateCHRROM = function(mapper) {
	if(this.hasCHRROM()) {
		// CHR ROM のサイズ
		var chrrom_size = 8 * 1024 * this.header.getCHRROMBanksNum();

		// CHR ROMのROM上の開始位置
		var offset = this.header.SIZE + 16 * 1024 * this.header.getPRGROMBanksNum();

		var chrrom_uint8 = this.load(offset, chrrom_size);

		return new CHRROM(chrrom_uint8, mapper);
	}

	return;
};

// CHR ROM があるかどうか
ROM.prototype.hasCHRROM = function() {
	return this.header.getCHRROMBanksNum() > 0;
};




// ROMバイナリデータをconsole.log で dump
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

	return new Uint8Array(array);
};

// NESフォーマットのバイナリかどうか
ROM.prototype.isNES = function() {
	return this.header.isNES();
};

module.exports = ROM;
