"use strict";

var Base = require('./Base');

/**** Mapper119 ****/
var Mapper119 = function(nes) {
	Base.apply(this, arguments);
	this.MAPPER_REG = new Array(20);
};

Mapper119.prototype = Object.create(Base.prototype);

Mapper119.prototype.Init = function() {
	var i;
	for(i=0; i<this.MAPPER_REG.length; i++)
		this.MAPPER_REG[i] = 0;

	this.MAPPER_REG[16] = 0;
	this.MAPPER_REG[17] = 1;
	this.MAPPER_REG[18] = (this.nes.PrgRomPageCount - 1) * 2;
	this.MAPPER_REG[19] = (this.nes.PrgRomPageCount - 1) * 2 + 1;
	this.nes.SetPrgRomPages8K(this.MAPPER_REG[16], this.MAPPER_REG[17], this.MAPPER_REG[18], this.MAPPER_REG[19]);

	this.MAPPER_REG[8] = 0;
	this.MAPPER_REG[9] = 1;
	this.MAPPER_REG[10] = 2;
	this.MAPPER_REG[11] = 3;
	this.MAPPER_REG[12] = 4;
	this.MAPPER_REG[13] = 5;
	this.MAPPER_REG[14] = 6;
	this.MAPPER_REG[15] = 7;
	this.nes.SetChrRomPages1K(this.MAPPER_REG[8], this.MAPPER_REG[9], this.MAPPER_REG[10], this.MAPPER_REG[11],
				this.MAPPER_REG[12], this.MAPPER_REG[13], this.MAPPER_REG[14], this.MAPPER_REG[15]);
};

Mapper119.prototype.SetChrRomPages1K = function(page0, page1, page2, page3, page4, page5, page6, page7) {
	if((page0 & 0x40) === 0x00)
		this.nes.SetChrRomPage1K(0, page0 & 0x3F);
	else
		this.nes.VRAM[0] = this.nes.VRAMS[page0 & 0x07];

	if((page1 & 0x40) === 0x00)
		this.nes.SetChrRomPage1K(1, page1 & 0x3F);
	else
		this.nes.VRAM[1] = this.nes.VRAMS[page1 & 0x07];

	if((page2 & 0x40) === 0x00)
		this.nes.SetChrRomPage1K(2, page2 & 0x3F);
	else
		this.nes.VRAM[2] = this.nes.VRAMS[page2 & 0x07];

	if((page3 & 0x40) === 0x00)
		this.nes.SetChrRomPage1K(3, page3 & 0x3F);
	else
		this.nes.VRAM[3] = this.nes.VRAMS[page3 & 0x07];

	if((page4 & 0x40) === 0x00)
		this.nes.SetChrRomPage1K(4, page4 & 0x3F);
	else
		this.nes.VRAM[4] = this.nes.VRAMS[page4 & 0x07];

	if((page5 & 0x40) === 0x00)
		this.nes.SetChrRomPage1K(5, page5 & 0x3F);
	else
		this.nes.VRAM[5] = this.nes.VRAMS[page5 & 0x07];

	if((page6 & 0x40) === 0x00)
		this.nes.SetChrRomPage1K(6, page6 & 0x3F);
	else
		this.nes.VRAM[6] = this.nes.VRAMS[page6 & 0x07];

	if((page7 & 0x40) === 0x00)
		this.nes.SetChrRomPage1K(7, page7 & 0x3F);
	else
		this.nes.VRAM[7] = this.nes.VRAMS[page7 & 0x07];
};

Mapper119.prototype.Write = function(address, data) {
	switch (address & 0xE001) {
		case 0x8000:
			this.MAPPER_REG[0] = data;
			if((data & 0x80) === 0x80) {
				this.SetChrRomPages1K(this.MAPPER_REG[12], this.MAPPER_REG[13], this.MAPPER_REG[14], this.MAPPER_REG[15], 
							this.MAPPER_REG[8], this.MAPPER_REG[9], this.MAPPER_REG[10], this.MAPPER_REG[11]); 
			} else {
				this.SetChrRomPages1K(this.MAPPER_REG[8], this.MAPPER_REG[9], this.MAPPER_REG[10], this.MAPPER_REG[11], 
							this.MAPPER_REG[12], this.MAPPER_REG[13], this.MAPPER_REG[14], this.MAPPER_REG[15]); 
			}

			if((data & 0x40) === 0x40) {
				this.nes.SetPrgRomPages8K(this.MAPPER_REG[18], this.MAPPER_REG[17], this.MAPPER_REG[16],this.MAPPER_REG[19]);
			} else {
				this.nes.SetPrgRomPages8K(this.MAPPER_REG[16], this.MAPPER_REG[17], this.MAPPER_REG[18],this.MAPPER_REG[19]);
			}
			break;
		case 0x8001:
			this.MAPPER_REG[1] = data;
			switch (this.MAPPER_REG[0] & 0x07) {
				case 0:
					data &= 0xFE;
					this.MAPPER_REG[8] = data;
					this.MAPPER_REG[9] = data + 1;
					break;
				case 1:
					data &= 0xFE;
					this.MAPPER_REG[10] = data;
					this.MAPPER_REG[11] = data + 1;
					break;
				case 2:
					this.MAPPER_REG[12] = data;
					break;
				case 3:
					this.MAPPER_REG[13] = data;
					break;
				case 4:
					this.MAPPER_REG[14] = data;
					break;
				case 5:
					this.MAPPER_REG[15] = data;
					break;
				case 6:
					this.MAPPER_REG[16] = data;
					break;
				case 7:
					this.MAPPER_REG[17] = data;
					break;
			}

			if((this.MAPPER_REG[0] & 0x80) === 0x80) {
				this.SetChrRomPages1K(this.MAPPER_REG[12], this.MAPPER_REG[13], this.MAPPER_REG[14], this.MAPPER_REG[15], 
							this.MAPPER_REG[8], this.MAPPER_REG[9], this.MAPPER_REG[10], this.MAPPER_REG[11]); 
			} else {
				this.SetChrRomPages1K(this.MAPPER_REG[8], this.MAPPER_REG[9], this.MAPPER_REG[10], this.MAPPER_REG[11], 
							this.MAPPER_REG[12], this.MAPPER_REG[13], this.MAPPER_REG[14], this.MAPPER_REG[15]); 
			}

			if((this.MAPPER_REG[0] & 0x40) === 0x40) {
				this.nes.SetPrgRomPages8K(this.MAPPER_REG[18], this.MAPPER_REG[17], this.MAPPER_REG[16],this.MAPPER_REG[19]);
			} else {
				this.nes.SetPrgRomPages8K(this.MAPPER_REG[16], this.MAPPER_REG[17], this.MAPPER_REG[18],this.MAPPER_REG[19]);
			}
			break;

		case 0xA000:
			if((data & 0x01) === 0x01)
				this.nes.SetMirror(true);
			else
				this.nes.SetMirror(false);
			this.MAPPER_REG[2] = data;
			break;
		case 0xA001:
			this.MAPPER_REG[3] = data;
			break;

		case 0xC000:
			this.MAPPER_REG[4] = data;
			break;
		case 0xC001:
			this.MAPPER_REG[5] = data;
			break;

		case 0xE000:
			this.MAPPER_REG[4] = this.MAPPER_REG[5];
			this.MAPPER_REG[7] = 0;
			this.ClearIRQ();
			break;
		case 0xE001:
			this.MAPPER_REG[7] = 1;
			break;
	}
};

Mapper119.prototype.HSync = function(y) {
	if(this.MAPPER_REG[7] === 1 && y < 240 && (this.nes.IO1[0x01] & 0x08) === 0x08) {
		if(--this.MAPPER_REG[4] === 0)
			this.SetIRQ();
		this.MAPPER_REG[4] &= 0xFF;
	}
};

module.exports = Mapper119;
