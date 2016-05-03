"use strict";

var MapperProto = require('./Base');
/**** Mapper69 ****/
var Mapper69 = function(nes) {
	MapperProto.apply(this, arguments);
	this.MAPPER_REG = new Array(16);
	this.MAPPER_REG_Select = 0x00;
	this.R8_ROM = null;
	this.IRQ_Counter = 0;
};

Mapper69.prototype = Object.create(MapperProto.prototype);

Mapper69.prototype.Init = function() {
	var i;
	for(i=0; i<this.MAPPER_REG.length; i++)
		this.MAPPER_REG[i] = 0;

	this.nes.SetPrgRomPages8K(0, 1, 2, this.nes.PrgRomPageCount * 2 - 1);
	this.nes.SetChrRomPages1K(0, 1, 2, 3, 4, 5, 6, 7);
};

Mapper69.prototype.Write = function(address, data) {
	switch (address & 0xE000) {
		case 0x8000:
			this.MAPPER_REG_Select = data;
			break;
		case 0xA000:
			this.MAPPER_REG[this.MAPPER_REG_Select] = data;
			switch(this.MAPPER_REG_Select) {
				case 0x00:
				case 0x01:
				case 0x02:
				case 0x03:
				case 0x04:
				case 0x05:
				case 0x06:
				case 0x07:
					this.nes.SetChrRomPage1K(this.MAPPER_REG_Select, data);
					break;
				case 0x08:
					this.R8_ROM = this.nes.PRGROM_PAGES[(data & 0x3F) % (this.nes.PrgRomPageCount * 2)];
					break;
				case 0x09:
					this.nes.SetPrgRomPage8K(0, data);
					break;
				case 0x0A:
					this.nes.SetPrgRomPage8K(1, data);
					break;
				case 0x0B:
					this.nes.SetPrgRomPage8K(2, data);
					break;
				case 0x0C:
					data &= 0x03;
					if(data === 0) {
						this.nes.SetMirror(false);
					} else if(data === 1) {
						this.nes.SetMirror(true);
					} else if(data === 2) {
						this.nes.SetMirrors(0, 0, 0, 0);
					} else {
						this.nes.SetMirrors(1, 1, 1, 1);
					}
					break;
				case 0x0D:
					if((data & 0x01) === 0x00)
						this.ClearIRQ();
					break;
				case 0x0E:
					this.IRQ_Counter = (this.IRQ_Counter & 0xFF00) | data;
					break;
				case 0x0F:
					this.IRQ_Counter = (this.IRQ_Counter & 0x00FF) | (data << 8);
					break;
			}
			break;
		case 0xC000:
			this.nes.Select_AY_REG(data);
			break;
		case 0xE000:
			this.nes.Write_AY_REG(data);
			break;
	}
};

Mapper69.prototype.ReadSRAM = function(address) {
	if((this.MAPPER_REG[0x08] & 0x40) === 0x00)
		return this.R8_ROM[address & 0x1FFF];
	else
		return this.nes.SRAM[address & 0x1FFF];
};

Mapper69.prototype.WriteSRAM = function(address, data) {
	if((this.MAPPER_REG[0x08] & 0x40) === 0x40)
		this.nes.SRAM[address & 0x1FFF] = data;
};

Mapper69.prototype.CPUSync = function(clock) {
	if((this.MAPPER_REG[0x0D] & 0x80) === 0x80) {
		this.IRQ_Counter -= clock;
		if(this.IRQ_Counter < 0) {
			this.IRQ_Counter = 0xFFFF;
			if((this.MAPPER_REG[0x0D] & 0x01) === 0x01)
				this.SetIRQ();
		}
	}
};

Mapper69.prototype.OutEXSound = function(soundin) {
	return (soundin >> 1) + (this.nes.Out_AY() >> 1);
};

Mapper69.prototype.EXSoundSync = function(clock) {
	this.nes.Count_AY(clock);
};

module.exports = Mapper69;
