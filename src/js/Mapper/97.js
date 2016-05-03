"use strict";

var MapperProto = require('./Base');
/**** Mapper97 ****/
var Mapper97 = function(nes) {
	MapperProto.apply(this, arguments);
};

Mapper97.prototype = Object.create(MapperProto.prototype);

Mapper97.prototype.Init = function() {
	this.nes.SetPrgRomPage(0, this.nes.PrgRomPageCount - 1);
	this.nes.SetPrgRomPage(1, 0);

	this.nes.SetChrRomPage(0);
};

Mapper97.prototype.Write = function(address, data) {
	this.nes.SetPrgRomPage(1, data & 0x0F);

	switch(data & 0xC0) {
		case 0x00:
			this.nes.SetMirrors(0, 0, 0, 0);
			break;
		case 0x40:
			this.nes.SetMirror(true);
			break;
		case 0x80:
			this.nes.SetMirror(false);
			break;
		case 0xC0:
			this.nes.SetMirrors(1, 1, 1, 1);
			break;
	}
};

module.exports = Mapper97;
