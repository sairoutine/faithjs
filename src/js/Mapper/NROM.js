'use strict';

// lodash
var _ = require('lodash');

// 基底クラス
var Base = require('./base');

var NROM = function(rom) {
	// 継承元new呼び出し
	Base.apply(this, arguments);

	//this.prgNum = rom.header.getPRGROMBanksNum();
};
// 基底クラスを継承
_.extend(NROM.prototype, Base.prototype);
_.extend(NROM, Base);

/*
NROM.prototype.map = function(address) {
	if(this.prgNum === 1 && address >= 0x4000) {
		address -= 0x4000;
	}
	return address;
};
*/
module.exports = NROM;
