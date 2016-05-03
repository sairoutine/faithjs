"use strict";

var Base = require('./Base');
/**** Mapper33 ****/
var Mapper33 = function(nes) {
	Base.apply(this, arguments);
};

Mapper33.prototype = Object.create(Base.prototype);

Mapper33.prototype.Init = function() {
	this.nes.SetPrgRomPages8K(0, 1, this.nes.PrgRomPageCount * 2 - 2, this.nes.PrgRomPageCount * 2 - 1);
	this.nes.SetChrRomPages1K(0, 1, 2, 3, 4, 5, 6, 7);
};

Mapper33.prototype.Write = function(address, data) {
	switch (address & 0xA003) {
		case 0x8000:
			this.nes.SetPrgRomPage8K(0, data & 0x3F);
			if((data & 0x40) === 0x00)
				this.nes.SetMirror(false);
			else
				this.nes.SetMirror(true);
			break;
		case 0x8001:
			this.nes.SetPrgRomPage8K(1, data & 0x3F);
			break;
		case 0x8002:
			this.nes.SetChrRomPage1K(0, data << 1);
			this.nes.SetChrRomPage1K(1, (data << 1) + 1);
			break;
		case 0x8003:
			this.nes.SetChrRomPage1K(2, data << 1);
			this.nes.SetChrRomPage1K(3, (data << 1) + 1);
			break;
		case 0xA000:
			this.nes.SetChrRomPage1K(4, data);
			break;
		case 0xA001:
			this.nes.SetChrRomPage1K(5, data);
			break;
		case 0xA002:
			this.nes.SetChrRomPage1K(6, data);
			break;
		case 0xA003:
			this.nes.SetChrRomPage1K(7, data);
			break;
	}
};

module.exports = Mapper33;
