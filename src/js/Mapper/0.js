"use strict";

var Base = require('./Base');

/**** Mapper0 ****/
var Mapper0 = function(nes) {
	Base.apply(this, arguments);
};

Mapper0.prototype = Object.create(Base.prototype);

Mapper0.prototype.Init = function() {
	this.nes.SetPrgRomPage(0, 0);
	this.nes.SetPrgRomPage(1, this.nes.PrgRomPageCount - 1);
	this.nes.SetChrRomPage(0);
};


module.exports = Mapper0;
