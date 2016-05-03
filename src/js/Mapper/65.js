"use strict";

var Base = require('./Base');
/**** Mapper65 ****/
var Mapper65 = function(nes) {
	Base.apply(this, arguments);
	this.IRQ_Counter = 0;
	this.IRQ_Value = 0;
	this.IRQ_Flag = false;
};

Mapper65.prototype = Object.create(Base.prototype);

Mapper65.prototype.Init = function() {
	this.nes.SetPrgRomPages8K(0, 1, this.nes.PrgRomPageCount * 2 - 2, this.nes.PrgRomPageCount * 2 - 1);
	this.nes.SetChrRomPages1K(0, 1, 2, 3, 4, 5, 6, 7);
	this.IRQ_Counter = 0;
};

Mapper65.prototype.Write = function(address, data) {
	switch (address & 0xF000) {
		case 0x8000:
			this.nes.SetPrgRomPage8K(0, data);
			break;
		case 0x9000:
			switch(address) {
				case 0x9001:
					if((data & 0x80) === 0x00)
						this.nes.SetMirror(false);
					else
						this.nes.SetMirror(true);
					break;
				case 0x9003:
					this.IRQ_Flag = (data & 0x80) === 0x80;
					this.ClearIRQ();
					break;
				case 0x9004:
					this.IRQ_Counter = this.IRQ_Value;
					this.IRQ_Flag = true;
					this.ClearIRQ();
					break;
				case 0x9005:
					this.IRQ_Value = (data << 8) | (this.IRQ_Value & 0x00FF);
					break;
				case 0x9006:
					this.IRQ_Value = (this.IRQ_Value & 0xFF00) | data;
					break;
			}
			break;
		case 0xA000:
			this.nes.SetPrgRomPage8K(1, data);
			break;
		case 0xB000:
		case 0xB001:
		case 0xB002:
		case 0xB003:
		case 0xB004:
		case 0xB005:
		case 0xB006:
		case 0xB007:
			this.nes.SetChrRomPage1K(address & 0x0007, data);
			break;
		case 0xC000:
			this.nes.SetPrgRomPage8K(2, data);
			break;
	}
};

Mapper65.prototype.CPUSync = function(clock) {
	if(this.IRQ_Flag) {
		if(this.IRQ_Counter !== 0) {
			this.IRQ_Counter -= clock;
			if(this.IRQ_Counter <= 0) {
				this.IRQ_Counter = 0;
				this.IRQ_Flag = false;
				this.SetIRQ();
			}
		}
	}
};

module.exports = Mapper65;
