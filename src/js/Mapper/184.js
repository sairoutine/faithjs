"use strict";

var MapperProto = require('./Base');
/**** Mapper184 ****/
var Mapper184 = function(nes) {
	MapperProto.apply(this, arguments);
};

Mapper184.prototype = Object.create(MapperProto.prototype);

Mapper184.prototype.Init = function() {
	this.nes.SetPrgRomPage(0, 0);
	this.nes.SetPrgRomPage(1, this.nes.PrgRomPageCount - 1);
};

Mapper184.prototype.WriteSRAM = function(address, data) {
	var chrpage = this.nes.ChrRomPageCount * 2 - 1;
	var tmp;
	tmp = (data & chrpage) * 4;
	this.nes.SetChrRomPage1K(0, tmp);
	this.nes.SetChrRomPage1K(1, tmp + 1);
	this.nes.SetChrRomPage1K(2, tmp + 2);
	this.nes.SetChrRomPage1K(3, tmp + 3);

	tmp = ((data >>> 4) & chrpage) * 4;
	this.nes.SetChrRomPage1K(4, tmp);
	this.nes.SetChrRomPage1K(5, tmp + 1);
	this.nes.SetChrRomPage1K(6, tmp + 2);
	this.nes.SetChrRomPage1K(7, tmp + 3);
};

module.exports = Mapper184;
