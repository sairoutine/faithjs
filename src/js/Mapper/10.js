"use strict";

var Base = require('./Base');
/**** Mapper10 ****/
var Mapper10 = function(nes) {//<--
	Base.apply(this, arguments);
	//this.MAPPER_REG = new Array(6);
	this.MAPPER_REG = new Array(4);
	this.MAPPER_Latch0 = true;
	this.MAPPER_Latch1 = true;
};

Mapper10.prototype = Object.create(Base.prototype);

Mapper10.prototype.Init = function() {
	this.nes.SetPrgRomPages8K(0, 0, this.nes.PrgRomPageCount * 2 - 2, this.nes.PrgRomPageCount * 2 - 1);
	this.nes.SetChrRomPages1K(0, 0, 0, 0, 0, 0, 0, 0);
	for(var i=0; i<this.MAPPER_REG.length; i++)
		this.MAPPER_REG[i] = 0x00;
	this.MAPPER_Latch0 = true;
	this.MAPPER_Latch1 = true;
	//this.MAPPER_REG[4] = true;
	//this.MAPPER_REG[5] = true;
};

Mapper10.prototype.Write = function(address, data) {
	switch(address & 0xF000) {
		case 0xA000:
			this.nes.SetPrgRomPage8K(0, data * 2);
			this.nes.SetPrgRomPage8K(1, data * 2 + 1);
			break;
		case 0xB000:
			this.MAPPER_REG[0] = data;
			break;
		case 0xC000:
			this.MAPPER_REG[1] = data;
			break;
		case 0xD000:
			this.MAPPER_REG[2] = data;
			break;
		case 0xE000:
			this.MAPPER_REG[3] = data;
			break;
		case 0xF000:
			if((data & 0x01) === 0x00)
				this.nes.SetMirror(false);
			else
				this.nes.SetMirror(true);
			break;
	}
};

Mapper10.prototype.BuildBGLine = function () {
	var tmpBgLineBuffer = this.nes.BgLineBuffer;
	var tmpVRAM = this.nes.VRAM;
	var nameAddr = 0x2000 | (this.nes.PPUAddress & 0x0FFF);
	var tableAddr = ((this.nes.PPUAddress & 0x7000) >> 12) | (this.nes.IO1[0x00] & 0x10) << 8;
	var nameAddrHigh = nameAddr >> 10;
	var nameAddrLow = nameAddr & 0x03FF;
	var tmpVRAMHigh = tmpVRAM[nameAddrHigh];
	var tmpPaletteArray = this.nes.PaletteArray;
	var tmpSPBitArray = this.nes.SPBitArray;

	var q = 0;
	var s = this.nes.HScrollTmp;

	for(var p=0; p<33; p++) {
		var ptnDist = (tmpVRAMHigh[nameAddrLow] << 4) | tableAddr;
		var tmpptnDist = ptnDist;

		this.SetChrRom(tmpptnDist);

		var tmpSrcV = tmpVRAM[ptnDist >> 10];
		ptnDist &= 0x03FF;
		var attr = ((tmpVRAMHigh[((nameAddrLow & 0x0380) >> 4) | ((nameAddrLow & 0x001C) >> 2) + 0x03C0] << 2) >> (((nameAddrLow & 0x0040) >> 4) | (nameAddrLow & 0x0002))) & 0x0C;
		var ptn = tmpSPBitArray[tmpSrcV[ptnDist]][tmpSrcV[ptnDist + 8]];

		for(; s<8; s++, q++)
			tmpBgLineBuffer[q] = tmpPaletteArray[ptn[s] | attr];
		s = 0;

		this.SetLatch(tmpptnDist);

		if((nameAddrLow & 0x001F) === 0x001F) {
			nameAddrLow &= 0xFFE0;
			tmpVRAMHigh = tmpVRAM[(nameAddrHigh ^= 0x01)];
		} else
			nameAddrLow++;
	}
};

Mapper10.prototype.SetLatch = function (addr) {
	addr &= 0x1FF0;
	if(addr === 0x0FD0)
		this.MAPPER_Latch0 = false;
		//this.MAPPER_REG[4] = false;
	if(addr === 0x1FD0)
		this.MAPPER_Latch1 = false;
		//this.MAPPER_REG[5] = false;
	if(addr === 0x0FE0)
		this.MAPPER_Latch0 = true;
		//this.MAPPER_REG[4] = true;
	if(addr === 0x1FE0)
		this.MAPPER_Latch1 = true;
		//this.MAPPER_REG[5] = true;
};

Mapper10.prototype.SetChrRom = function (addr) {
	if((addr & 0x1000) === 0x0000) {
		if(!this.MAPPER_Latch0) {
		//if(!this.MAPPER_REG[4]) {
			this.nes.SetChrRomPage1K(0, this.MAPPER_REG[0] * 4);
			this.nes.SetChrRomPage1K(1, this.MAPPER_REG[0] * 4 + 1);
			this.nes.SetChrRomPage1K(2, this.MAPPER_REG[0] * 4 + 2);
			this.nes.SetChrRomPage1K(3, this.MAPPER_REG[0] * 4 + 3);
		} else {
			this.nes.SetChrRomPage1K(0, this.MAPPER_REG[1] * 4);
			this.nes.SetChrRomPage1K(1, this.MAPPER_REG[1] * 4 + 1);
			this.nes.SetChrRomPage1K(2, this.MAPPER_REG[1] * 4 + 2);
			this.nes.SetChrRomPage1K(3, this.MAPPER_REG[1] * 4 + 3);
		}
	} else {
		if(!this.MAPPER_Latch1) {
		//if(!this.MAPPER_REG[5]) {
			this.nes.SetChrRomPage1K(4, this.MAPPER_REG[2] * 4);
			this.nes.SetChrRomPage1K(5, this.MAPPER_REG[2] * 4 + 1);
			this.nes.SetChrRomPage1K(6, this.MAPPER_REG[2] * 4 + 2);
			this.nes.SetChrRomPage1K(7, this.MAPPER_REG[2] * 4 + 3);
		} else {
			this.nes.SetChrRomPage1K(4, this.MAPPER_REG[3] * 4);
			this.nes.SetChrRomPage1K(5, this.MAPPER_REG[3] * 4 + 1);
			this.nes.SetChrRomPage1K(6, this.MAPPER_REG[3] * 4 + 2);
			this.nes.SetChrRomPage1K(7, this.MAPPER_REG[3] * 4 + 3);
		}
	}
};

Mapper10.prototype.BuildSpriteLine = function () {
	var tmpBgLineBuffer = this.nes.BgLineBuffer;
	var tmpIsSpriteClipping = (this.nes.IO1[0x01] & 0x04) === 0x04 ? 0 : 8;

	if((this.nes.IO1[0x01] & 0x10) === 0x10) {
		var tmpSpLine = this.nes.SpriteLineBuffer;
		for(var p=0; p<256; p++)
			tmpSpLine[p] = 256;

		var tmpSpRAM = this.nes.SPRITE_RAM;
		var tmpBigSize = (this.nes.IO1[0x00] & 0x20) === 0x20 ? 16 : 8;
		var tmpSpPatternTableAddress = (this.nes.IO1[0x00] & 0x08) << 9;

		var tmpVRAM = this.nes.VRAM;
		var tmpSPBitArray = this.nes.SPBitArray;

		var lineY = this.nes.PpuY;
		var count = 0;

		for(var i=0; i<=252; i+=4) {
			var isy = tmpSpRAM[i] + 1;
			if(isy > lineY || (isy + tmpBigSize) <= lineY)
				continue;

			if(i === 0)
				this.nes.Sprite0Line = true;

			if(++count === 9) {
				i = 256;
				continue;
			}

			var x = tmpSpRAM[i + 3];
			var ex = x + 8;
			if(ex > 256)
				ex = 256;

			var attr = tmpSpRAM[i + 2];

			var attribute = ((attr & 0x03) << 2) | 0x10;
			var bgsp = attr & 0x20;

			var iy = (attr & 0x80) === 0x80 ? tmpBigSize - 1 - (lineY - isy) : lineY - isy;
			var tileNum = ((iy & 0x08) << 1) + (iy & 0x07) +
				(tmpBigSize === 8 ? (tmpSpRAM[i + 1] << 4) + tmpSpPatternTableAddress : ((tmpSpRAM[i + 1] & 0xFE) << 4) + ((tmpSpRAM[i + 1] & 0x01) << 12));

			this.SetChrRom(tileNum);

			var tmpHigh = tmpVRAM[tileNum >> 10];
			var tmpLow = tileNum & 0x03FF;
			var ptn = tmpSPBitArray[tmpHigh[tmpLow]][tmpHigh[tmpLow + 8]];

			var is;
			var ia;
			if((attr & 0x40) === 0x00) {
				is = 0;
				ia = 1;
			} else {
				is = 7;
				ia = -1;
			}

			for(; x<ex; x++, is+=ia) {
				var tmpPtn = ptn[is];
				if(tmpPtn !== 0x00 && tmpSpLine[x] === 256) {
					tmpSpLine[x] = i;

					if(x >= tmpIsSpriteClipping && (bgsp === 0x00 || tmpBgLineBuffer[x] === 0x10))
							tmpBgLineBuffer[x] = tmpPtn | attribute;
				}
			}

			this.SetLatch(tileNum);
		}

		if(count >= 8)
			this.nes.IO1[0x02] |= 0x20;
		else
			this.nes.IO1[0x02] &= 0xDF;
	}
};

Mapper10.prototype.GetState = function() {
	this.nes.StateData.Mapper = {};
	this.nes.StateData.Mapper.MAPPER_REG = this.MAPPER_REG.slice(0);

	this.nes.StateData.Mapper.MAPPER_Latch0 = this.MAPPER_Latch0;
	this.nes.StateData.Mapper.MAPPER_Latch1 = this.MAPPER_Latch1;
};

Mapper10.prototype.SetState = function() {
	for(var i=0; i<this.nes.StateData.Mapper.MAPPER_REG.length; i++)
		this.MAPPER_REG[i] = this.nes.StateData.Mapper.MAPPER_REG[i];

	this.MAPPER_Latch0 = this.nes.StateData.Mapper.MAPPER_Latch0;
	this.MAPPER_Latch1 = this.nes.StateData.Mapper.MAPPER_Latch1;
};

module.exports = Mapper10;
