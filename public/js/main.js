<<<<<<< HEAD
(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{"./Base":55}],2:[function(require,module,exports){
"use strict";

var Base = require('./Base');

/**** Mapper1 ****/
var Mapper1 = function(nes) {
	Base.apply(this, arguments);
	this.MAPPER_REG = new Array(16);
};

Mapper1.prototype = Object.create(Base.prototype);

Mapper1.prototype.Init = function() {
	var i;
	for(i=0; i<this.MAPPER_REG.length; i++)
		this.MAPPER_REG[i] = 0;

	this.MAPPER_REG[13] = 0;
	this.MAPPER_REG[14] = 0x00;
	this.MAPPER_REG[0] = 0x0C;
	this.MAPPER_REG[1] = 0x00;
	this.MAPPER_REG[2] = 0x00;
	this.MAPPER_REG[3] = 0x00;

	if(this.nes.PrgRomPageCount === 64) {
		this.MAPPER_REG[10] = 2;
	} else if(this.nes.PrgRomPageCount === 32) {
		this.MAPPER_REG[10] = 1;
	} else {
		this.MAPPER_REG[10] = 0;
	}
	this.MAPPER_REG[11] = 0;
	this.MAPPER_REG[12] = 0;

	if(this.MAPPER_REG[10] === 0) {
		this.MAPPER_REG[8] = this.nes.PrgRomPageCount * 2 - 2;
		this.MAPPER_REG[9] = this.nes.PrgRomPageCount * 2 - 1;
	} else {
		this.MAPPER_REG[8] = 30;
		this.MAPPER_REG[9] = 31;
	}

	this.MAPPER_REG[4] = 0;
	this.MAPPER_REG[5] = 1;
	this.MAPPER_REG[6] = this.MAPPER_REG[8];
	this.MAPPER_REG[7] = this.MAPPER_REG[9];

	this.nes.SetPrgRomPages8K(this.MAPPER_REG[4], this.MAPPER_REG[5], this.MAPPER_REG[6], this.MAPPER_REG[7]);
};

Mapper1.prototype.Write = function(address, data) {
	var reg_num;

	if((address & 0x6000) !== (this.MAPPER_REG[15] & 0x6000)) {
		this.MAPPER_REG[13] = 0;
		this.MAPPER_REG[14] = 0x00;
	}
	this.MAPPER_REG[15] = address;

	if((data & 0x80) !== 0) {
		this.MAPPER_REG[13] = 0;
		this.MAPPER_REG[14] = 0x00;
		return;
	}

	if((data & 0x01) !== 0)
		this.MAPPER_REG[14] |= (1 << this.MAPPER_REG[13]);
		this.MAPPER_REG[13]++;
	if(this.MAPPER_REG[13] < 5)
		return;

	reg_num = (address & 0x7FFF) >> 13;
	this.MAPPER_REG[reg_num] = this.MAPPER_REG[14];

	this.MAPPER_REG[13] = 0;
	this.MAPPER_REG[14] = 0x00;

	var bank_num;

	switch (reg_num) {
		case 0 :
			if((this.MAPPER_REG[0] & 0x02) !== 0) {
				if((this.MAPPER_REG[0] & 0x01) !== 0) {
					this.nes.SetMirror(true);
				} else {
					this.nes.SetMirror(false);
				}
			} else {
				if((this.MAPPER_REG[0] & 0x01) !== 0) {
					this.nes.SetMirrors(1, 1, 1, 1);
				} else {
					this.nes.SetMirrors(0, 0, 0, 0);
				}
			}
			break;

		case 1 :
			bank_num = this.MAPPER_REG[1];
			if(this.MAPPER_REG[10] === 2) {
				if((this.MAPPER_REG[0] & 0x10) !== 0) {
					if(this.MAPPER_REG[12] !== 0) {
						this.MAPPER_REG[11] = (this.MAPPER_REG[1] & 0x10) >> 4;
						if((this.MAPPER_REG[0] & 0x08) !== 0) {
							this.MAPPER_REG[11] |= ((this.MAPPER_REG[2] & 0x10) >> 3);
						}
						this.SetPrgRomPages8K_Mapper01();
						this.MAPPER_REG[12] = 0;
					} else {
						this.MAPPER_REG[12] = 1;
					}
				} else {
					this.MAPPER_REG[11] = (this.MAPPER_REG[1] & 0x10) !== 0 ? 3 : 0;
					this.SetPrgRomPages8K_Mapper01();
				}
			} else if((this.MAPPER_REG[10] === 1) && (this.nes.ChrRomPageCount === 0)) {
				this.MAPPER_REG[11] = (this.MAPPER_REG[1] & 0x10) >> 4;
				this.SetPrgRomPages8K_Mapper01();
			} else if(this.nes.ChrRomPageCount !== 0) {
    				if((this.MAPPER_REG[0] & 0x10) !== 0) {
					bank_num <<= 2;
					this.nes.SetChrRomPage1K(0, bank_num + 0);
					this.nes.SetChrRomPage1K(1, bank_num + 1);
					this.nes.SetChrRomPage1K(2, bank_num + 2);
					this.nes.SetChrRomPage1K(3, bank_num + 3);
				} else {
					bank_num <<= 2;
					this.nes.SetChrRomPages1K(bank_num + 0, bank_num + 1, bank_num + 2, bank_num + 3,
								 bank_num + 4, bank_num + 5, bank_num + 6, bank_num + 7);
				}
			} else {
				if((this.MAPPER_REG[0] & 0x10) !== 0) {
					bank_num <<= 2;
					this.nes.VRAM[0] = this.nes.VRAMS[bank_num + 0];
					this.nes.VRAM[1] = this.nes.VRAMS[bank_num + 1];
					this.nes.VRAM[2] = this.nes.VRAMS[bank_num + 2];
					this.nes.VRAM[3] = this.nes.VRAMS[bank_num + 3];
				}
			}
	                break;

		case 2 :
			bank_num = this.MAPPER_REG[2];

			if((this.MAPPER_REG[10] === 2) && (this.MAPPER_REG[0] & 0x08) !== 0) {
				if(this.MAPPER_REG[12] !== 0) {
					this.MAPPER_REG[11] = (this.MAPPER_REG[1] & 0x10) >> 4;
					this.MAPPER_REG[11] |= ((this.MAPPER_REG[2] & 0x10) >> 3);
					this.SetPrgRomPages8K_Mapper01();
					this.MAPPER_REG[12] = 0;
				} else {
					this.MAPPER_REG[12] = 1;
				}
			}

			if(this.nes.ChrRomPageCount === 0) {
				if((this.MAPPER_REG[0] & 0x10) !== 0) {
					bank_num <<= 2;
					this.nes.VRAM[4] = this.nes.VRAMS[bank_num + 0];
					this.nes.VRAM[5] = this.nes.VRAMS[bank_num + 1];
					this.nes.VRAM[6] = this.nes.VRAMS[bank_num + 2];
					this.nes.VRAM[7] = this.nes.VRAMS[bank_num + 3];
					break;
				}
			}

			if((this.MAPPER_REG[0] & 0x10) !== 0) {
					bank_num <<= 2;
					this.nes.SetChrRomPage1K(4, bank_num + 0);
					this.nes.SetChrRomPage1K(5, bank_num + 1);
					this.nes.SetChrRomPage1K(6, bank_num + 2);
					this.nes.SetChrRomPage1K(7, bank_num + 3);
			}
			break;


		case 3 :
			bank_num = this.MAPPER_REG[3];

			if((this.MAPPER_REG[0] & 0x08) !== 0) {
				bank_num <<= 1;

				if((this.MAPPER_REG[0] & 0x04) !== 0) {
					this.MAPPER_REG[4] = bank_num;
					this.MAPPER_REG[5] = bank_num + 1;
					this.MAPPER_REG[6] = this.MAPPER_REG[8];
					this.MAPPER_REG[7] = this.MAPPER_REG[9];
				} else {
					if(this.MAPPER_REG[10] === 0) {
						this.MAPPER_REG[4] = 0;
						this.MAPPER_REG[5] = 1;
						this.MAPPER_REG[6] = bank_num;
						this.MAPPER_REG[7] = bank_num + 1;
					}
				}
			} else {
	                        bank_num <<= 1;
				this.MAPPER_REG[4] = bank_num;
				this.MAPPER_REG[5] = bank_num + 1;
				if(this.MAPPER_REG[10] === 0) {
					this.MAPPER_REG[6] = bank_num + 2;
					this.MAPPER_REG[7] = bank_num + 3;
				}
			}

			this.SetPrgRomPages8K_Mapper01();
			break;
	}
};

Mapper1.prototype.SetPrgRomPages8K_Mapper01 = function (){
	this.nes.SetPrgRomPage8K(0, (this.MAPPER_REG[11] << 5) + (this.MAPPER_REG[4] & 31));
	this.nes.SetPrgRomPage8K(1, (this.MAPPER_REG[11] << 5) + (this.MAPPER_REG[5] & 31));
	this.nes.SetPrgRomPage8K(2, (this.MAPPER_REG[11] << 5) + (this.MAPPER_REG[6] & 31));
	this.nes.SetPrgRomPage8K(3, (this.MAPPER_REG[11] << 5) + (this.MAPPER_REG[7] & 31));
};

module.exports = Mapper1;

},{"./Base":55}],3:[function(require,module,exports){
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

},{"./Base":55}],4:[function(require,module,exports){
"use strict";

var Base = require('./Base');
/**** Mapper101 ****/
var Mapper101 = function(nes) {
	Base.apply(this, arguments);
};

Mapper101.prototype = Object.create(Base.prototype);

Mapper101.prototype.Init = function() {
	this.nes.SetPrgRomPage(0, 0);
	this.nes.SetPrgRomPage(1, this.nes.PrgRomPageCount - 1);
	this.nes.SetChrRomPage(0);
};

Mapper101.prototype.WriteSRAM = function(address, data) {
	this.nes.SetChrRomPage(data & 0x03);
};

module.exports = Mapper101;

},{"./Base":55}],5:[function(require,module,exports){
"use strict";

var Base = require('./Base');
/**** Mapper118 ****/
var Mapper118 = function(nes) {
	Base.apply(this, arguments);
	this.MAPPER_REG = new Array(20);
};

Mapper118.prototype = Object.create(Base.prototype);

Mapper118.prototype.Init = function() {
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

Mapper118.prototype.Write = function(address, data) {
	switch (address & 0xE001) {
		case 0x8000:
			this.MAPPER_REG[0] = data;
			if((data & 0x80) === 0x80) {
				this.nes.SetChrRomPages1K(this.MAPPER_REG[12], this.MAPPER_REG[13], this.MAPPER_REG[14], this.MAPPER_REG[15], 
							this.MAPPER_REG[8], this.MAPPER_REG[9], this.MAPPER_REG[10], this.MAPPER_REG[11]); 
			} else {
				this.nes.SetChrRomPages1K(this.MAPPER_REG[8], this.MAPPER_REG[9], this.MAPPER_REG[10], this.MAPPER_REG[11], 
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

			if((this.MAPPER_REG[0] & 0x80) === 0x80) {
				if((this.MAPPER_REG[0] & 0x07) === 0x02) {
					if((data & 0x80) === 0x80)
						this.nes.SetMirrors(0,0,0,0);
					else
						this.nes.SetMirrors(1,1,1,1);
				}
			} else {
				if((this.MAPPER_REG[0] & 0x07) === 0x00) {
					if((data & 0x80) === 0x80)
						this.nes.SetMirrors(0,0,0,0);
					else
						this.nes.SetMirrors(1,1,1,1);
				}
			}

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
				this.nes.SetChrRomPages1K(this.MAPPER_REG[12], this.MAPPER_REG[13], this.MAPPER_REG[14], this.MAPPER_REG[15], 
							this.MAPPER_REG[8], this.MAPPER_REG[9], this.MAPPER_REG[10], this.MAPPER_REG[11]); 
			} else {
				this.nes.SetChrRomPages1K(this.MAPPER_REG[8], this.MAPPER_REG[9], this.MAPPER_REG[10], this.MAPPER_REG[11], 
							this.MAPPER_REG[12], this.MAPPER_REG[13], this.MAPPER_REG[14], this.MAPPER_REG[15]); 
			}

			if((this.MAPPER_REG[0] & 0x40) === 0x40) {
				this.nes.SetPrgRomPages8K(this.MAPPER_REG[18], this.MAPPER_REG[17], this.MAPPER_REG[16],this.MAPPER_REG[19]);
			} else {
				this.nes.SetPrgRomPages8K(this.MAPPER_REG[16], this.MAPPER_REG[17], this.MAPPER_REG[18],this.MAPPER_REG[19]);
			}
			break;

		case 0xA000:
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

Mapper118.prototype.HSync = function(y) {
	if(this.MAPPER_REG[7] === 1 && y < 240 && (this.nes.IO1[0x01] & 0x08) === 0x08) {
		if(--this.MAPPER_REG[4] === 0)
			this.SetIRQ();
		this.MAPPER_REG[4] &= 0xFF;
	}
};

module.exports = Mapper118;

},{"./Base":55}],6:[function(require,module,exports){
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

},{"./Base":55}],7:[function(require,module,exports){
"use strict";

var Base = require('./Base');

/**** Mapper140 ****/
var Mapper140 = function(nes) {
	Base.apply(this, arguments);
};

Mapper140.prototype = Object.create(Base.prototype);

Mapper140.prototype.Init = function() {
	this.nes.SetPrgRomPage(0, 0);
	this.nes.SetPrgRomPage(1, 1);
	this.nes.SetChrRomPage(0);
};

Mapper140.prototype.WriteSRAM = function(address, data) {
	var tmp = (data & 0x30) >> 3;
	this.nes.SetPrgRomPage(0, tmp);
	this.nes.SetPrgRomPage(1, tmp + 1);
	this.nes.SetChrRomPage(data & 0x0F);
};

module.exports = Mapper140;

},{"./Base":55}],8:[function(require,module,exports){
"use strict";

var Base = require('./Base');

/**** Mapper152 ****/
var Mapper152 = function(nes) {
	Base.apply(this, arguments);
};

Mapper152.prototype = Object.create(Base.prototype);

Mapper152.prototype.Init = function() {
	this.nes.SetPrgRomPage(0, 0);
	this.nes.SetPrgRomPage(1, this.nes.PrgRomPageCount - 1);
	this.nes.SetChrRomPage(0);
};

Mapper152.prototype.WriteSRAM = function(address, data) {
	this.nes.SetPrgRomPage(0, (data & 0x70) >> 4);
	this.nes.SetChrRomPage(data & 0x0F);

	if((data & 0x80) === 0x80)
		this.nes.SetMirrors(0, 0, 0, 0);
	else
		this.nes.SetMirrors(1, 1, 1, 1);
};

module.exports = Mapper152;

},{"./Base":55}],9:[function(require,module,exports){
"use strict";

var Base = require('./Base');

/**** Mapper16 ****/
var Mapper16 = function(nes) {
	Base.apply(this, arguments);
	this.MAPPER_REG = new Array(5);

	this.EEPROM_ADDRESS = 0;
	this.OUT_DATA = 0;
	this.BIT_DATA = 0;
	this.BIT_DATA_TMP = 0;
	this.BIT_COUNTER = 0;
	this.READ_WRITE = false;
	this.SCL_OLD = false;
	this.SCL = false;
	this.SDA_OLD = false;
	this.SDA = false;
	this.STATE = 0;

	this.EEPROM = new Array(256);
	for(var i=0; i<this.EEPROM.length; i++)
		this.EEPROM[i] = 0x00;
};

Mapper16.prototype = Object.create(Base.prototype);

Mapper16.prototype.Init = function() {
	this.MAPPER_REG[0] = 0;
	this.MAPPER_REG[1] = 0;
	this.nes.SetPrgRomPages8K(0, 1, this.nes.PrgRomPageCount * 2 - 2, this.nes.PrgRomPageCount * 2 - 1);
	this.nes.SetChrRomPages1K(0, 1, 2, 3, 4, 5, 6, 7);

	this.EEPROM_ADDRESS = 0;
	this.OUT_DATA = 0;
	this.BIT_DATA = 0;
	this.BIT_DATA_TMP = 0;
	this.BIT_COUNTER = 0;
	this.READ_WRITE = false;
	this.SCL_OLD = false;
	this.SCL = false;
	this.SDA_OLD = false;
	this.SDA = false;
	this.STATE = 0;
};

Mapper16.prototype.Write = function(address, data) {
	switch (address & 0x000F) {
		case 0x0000:
			this.nes.SetChrRomPage1K(0, data);
			break;
		case 0x0001:
			this.nes.SetChrRomPage1K(1, data);
			break;
		case 0x0002:
			this.nes.SetChrRomPage1K(2, data);
			break;
		case 0x0003:
			this.nes.SetChrRomPage1K(3, data);
			break;
		case 0x0004:
			this.nes.SetChrRomPage1K(4, data);
			break;
		case 0x0005:
			this.nes.SetChrRomPage1K(5, data);
			break;
		case 0x0006:
			this.nes.SetChrRomPage1K(6, data);
			break;
		case 0x0007:
			this.nes.SetChrRomPage1K(7, data);
			break;
		case 0x0008:
			this.nes.SetPrgRomPage8K(0, data * 2);
			this.nes.SetPrgRomPage8K(1, data * 2 + 1);
			break;

		case 0x0009:
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

		case 0x000A:
			this.MAPPER_REG[0] = data & 0x01;
			this.ClearIRQ();
			break;

		case 0x000B:
			this.MAPPER_REG[1] = (this.MAPPER_REG[1] & 0xFF00) | data;
			break;

		case 0x000C:
			this.MAPPER_REG[1] = (this.MAPPER_REG[1] & 0x00FF) | (data << 8);
			break;

		case 0x000D:
			this.SCL_OLD = this.SCL;
			this.SCL = (data & 0x20) === 0x20;
			this.SDA_OLD = this.SDA;
			this.SDA = (data & 0x40) === 0x40;

			if(this.SCL_OLD && this.SCL && this.SDA_OLD && !this.SDA) {//START
				this.STATE = 1;
				this.BIT_DATA_TMP = 0;
				this.BIT_COUNTER = 0;
			}

			if(this.SCL_OLD && this.SCL && !this.SDA_OLD && this.SDA) {//STOP
				this.STATE = 0;
			}

			if(!this.SCL_OLD && this.SCL) {
				switch(this.STATE) {
					case 1://CONTROL BYTE
						if(this.BIT_IN()) {
							this.READ_WRITE = (this.BIT_DATA & 0x01) === 0x01;
							this.STATE = this.READ_WRITE ? 4 : 2;
						}
						break;

					case 2://ADDRESS
						if(this.BIT_IN()) {
							this.STATE = 3;
							this.EEPROM_ADDRESS = this.BIT_DATA;
						}
						break;

					case 3://WRITE
						if(this.BIT_IN()) {
							this.EEPROM[this.EEPROM_ADDRESS] = this.BIT_DATA;
							this.EEPROM_ADDRESS = (this.EEPROM_ADDRESS + 1) & 0xFF;
						}
						break;

					case 4://READ
						if(this.BIT_COUNTER === 0) {
							this.BIT_DATA = this.EEPROM[this.EEPROM_ADDRESS];
							this.EEPROM_ADDRESS = (this.EEPROM_ADDRESS + 1) & 0xFF;
						}
						this.BIT_OUT();
						break;
				}
			}
			break;
	}
};

Mapper16.prototype.BIT_OUT = function () {
	if(this.BIT_COUNTER === 8) {
		this.BIT_COUNTER = 0;//ACK;
		return true;
	} else {
		this.OUT_DATA = (this.BIT_DATA & 0x80) >>> 3;

		this.BIT_DATA = (this.BIT_DATA << 1) & 0xFF;
		this.BIT_COUNTER++;
	}
	return false;
};

Mapper16.prototype.BIT_IN = function () {
	if(this.BIT_COUNTER === 8) {
		this.BIT_COUNTER = 0;
		this.OUT_DATA = 0;//ACK;
		return true;
	} else {
		this.BIT_DATA = ((this.BIT_DATA << 1) | (this.SDA ? 0x01 : 0x00)) & 0xFF;
		this.BIT_COUNTER++;
	}
	return false;
};

Mapper16.prototype.ReadSRAM = function(address) {
	return this.OUT_DATA;
};

Mapper16.prototype.WriteSRAM = function(address, data) {
	this.Write(address, data);
};

Mapper16.prototype.CPUSync = function(clock) {
	if(this.MAPPER_REG[0] === 0x01) {
		if(this.MAPPER_REG[1] === 0x0000)
			this.MAPPER_REG[1] = 0x10000;

		this.MAPPER_REG[1] -= clock;

		if(this.MAPPER_REG[1] <= 0) {
			this.SetIRQ();
			this.MAPPER_REG[0] = 0x00;
			this.MAPPER_REG[1] = 0x0000;
		}
	}
};

module.exports = Mapper16;

},{"./Base":55}],10:[function(require,module,exports){
"use strict";

var Base = require('./Base');

/**** Mapper18 ****/
var Mapper18 = function(nes) {
	Base.apply(this, arguments);
	this.MAPPER_REG = new Array(15);
	this.IRQ_Counter = 0;
};

Mapper18.prototype = Object.create(Base.prototype);

Mapper18.prototype.Init = function() {
	for(var i=0; i<this.MAPPER_REG.length; i++)
		this.MAPPER_REG[i] = 0;
	this.IRQ_Counter = 0;

	this.nes.SetPrgRomPages8K(0, 1, 2, this.nes.PrgRomPageCount * 2 - 1);
	this.nes.SetChrRomPages1K(0, 1, 2, 3, 4, 5, 6, 7);
};

Mapper18.prototype.Write = function(address, data) {
	if(address >= 0x8000 && address < 0xE000) {
		var i = ((address & 0x7000) >>> 11) | ((address & 0x0002) >>> 1);
		if((address & 0x0001) === 0x0000)
			this.MAPPER_REG[i] = (this.MAPPER_REG[i] & 0xF0) | (data & 0x0F);
		else
			this.MAPPER_REG[i] = (this.MAPPER_REG[i] & 0x0F) | ((data & 0x0F) << 4);
		if(i < 3)
			this.nes.SetPrgRomPage8K(i, this.MAPPER_REG[i]);
		if(i >= 4)
			this.nes.SetChrRomPage1K(i - 4, this.MAPPER_REG[i]);
		return;
	}

	switch (address & 0xF003) {
		case 0xE000:
		case 0xE001:
		case 0xE002:
		case 0xE003:
			var tmp = (address & 0x0003) * 4;
			this.MAPPER_REG[12] = (this.MAPPER_REG[12] & ~(0x000F << tmp)) | ((data & 0x0F) << tmp);
			break;
		case 0xF000:
			this.IRQ_Counter = this.MAPPER_REG[12];
			this.ClearIRQ();
			break;
		case 0xF001:
			this.MAPPER_REG[13] = data;
			this.ClearIRQ();
			break;
		case 0xF002:
			this.MAPPER_REG[14] = data;
			data &= 0x03;
			if(data === 0) {
				this.nes.SetMirror(true);
			} else if(data === 1) {
				this.nes.SetMirror(false);
			} else if(data === 2) {
				this.nes.SetMirrors(0, 0, 0, 0);
			} else {
				this.nes.SetMirrors(1, 1, 1, 1);
			}
			break;
	}
};

Mapper18.prototype.CPUSync = function(clock) {
	if((this.MAPPER_REG[13] & 0x01) === 0x01) {
		var mask;
		switch(this.MAPPER_REG[13] & 0x0E) {
			case 0x00:
				mask = 0xFFFF;
				break;
			case 0x02:
				mask = 0x0FFF;
				break;
			case 0x04:
			case 0x06:
				mask = 0x00FF;
				break;
			case 0x08:
			case 0x0A:
			case 0x0C:
			case 0x0E:
				mask = 0x000F;
				break;
		}

		var tmp = (this.IRQ_Counter & mask) - clock;

		if(tmp < 0)
			this.SetIRQ();

		this.IRQ_Counter = (this.IRQ_Counter & ~mask) | (tmp & mask);
	}
};

module.exports = Mapper18;

},{"./Base":55}],11:[function(require,module,exports){
"use strict";

var Base = require('./Base');
/**** Mapper180 ****/
var Mapper180 = function(nes) {
	Base.apply(this, arguments);
};

Mapper180.prototype = Object.create(Base.prototype);

Mapper180.prototype.Init = function() {
	this.nes.SetPrgRomPage(0, 0);
	this.nes.SetPrgRomPage(1, this.nes.PrgRomPageCount - 1);
	this.nes.SetChrRomPage(0);
};

Mapper180.prototype.Write = function(address, data) {
	this.nes.SetPrgRomPage(1, data);
};

module.exports = Mapper180;

},{"./Base":55}],12:[function(require,module,exports){
"use strict";

var Base = require('./Base');
/**** Mapper184 ****/
var Mapper184 = function(nes) {
	Base.apply(this, arguments);
};

Mapper184.prototype = Object.create(Base.prototype);

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

},{"./Base":55}],13:[function(require,module,exports){
"use strict";

var Base = require('./Base');
/**** Mapper185 ****/
var Mapper185 = function(nes) {
	Base.apply(this, arguments);
	this.MAPPER_REG = 0;
	this.EX_ChrRom = new Array(0x0400);
};

Mapper185.prototype = Object.create(Base.prototype);

Mapper185.prototype.Init = function() {
	for(var i=0; i<this.EX_ChrRom.length; i++)
		this.EX_ChrRom[i] = 0xFF;
	this.MAPPER_REG = 0;

	this.nes.SetPrgRomPages8K(0, 1, 2, 3);
	this.nes.VRAM[0] = this.EX_ChrRom;
	this.nes.VRAM[1] = this.EX_ChrRom;
	this.nes.VRAM[2] = this.EX_ChrRom;
	this.nes.VRAM[3] = this.EX_ChrRom;
	this.nes.VRAM[4] = this.EX_ChrRom;
	this.nes.VRAM[5] = this.EX_ChrRom;
	this.nes.VRAM[6] = this.EX_ChrRom;
	this.nes.VRAM[7] = this.EX_ChrRom;
};

Mapper185.prototype.Write = function(address, data) {
	this.MAPPER_REG = data;

	if((data & 0x03) !== 0x00) {
		this.nes.SetChrRomPages1K(0, 1, 2, 3, 4, 5, 6, 7);
	} else {
		this.nes.VRAM[0] = this.EX_ChrRom;
		this.nes.VRAM[1] = this.EX_ChrRom;
		this.nes.VRAM[2] = this.EX_ChrRom;
		this.nes.VRAM[3] = this.EX_ChrRom;
		this.nes.VRAM[4] = this.EX_ChrRom;
		this.nes.VRAM[5] = this.EX_ChrRom;
		this.nes.VRAM[6] = this.EX_ChrRom;
		this.nes.VRAM[7] = this.EX_ChrRom;
	}
};

module.exports = Mapper185;

},{"./Base":55}],14:[function(require,module,exports){
"use strict";

var Base = require('./Base');
/**** Mapper19 ****/
var Mapper19 = function(nes) {
	Base.apply(this, arguments);
	this.MAPPER_REG = new Array(5);
	this.EX_VRAM = new Array(32);
};

Mapper19.prototype = Object.create(Base.prototype);

Mapper19.prototype.Init = function() {
	var i;
	for(i=0; i<this.MAPPER_REG.length; i++)
		this.MAPPER_REG[i] = 0;

	for(i=0; i<this.EX_VRAM.length; i++) {
		this.EX_VRAM[i] = new Array(0x0400);
		for(var j=0; j<this.EX_VRAM[i].length; j++)
			this.EX_VRAM[i][j] = 0x00;
	}

	this.nes.SetPrgRomPages8K(0, 1, this.nes.PrgRomPageCount * 2 - 2, this.nes.PrgRomPageCount * 2 - 1);

	if(this.nes.ChrRomPageCount >= 1){
		this.nes.SetChrRomPages1K(this.nes.ChrRomPageCount * 8 - 8, this.nes.ChrRomPageCount * 8 - 7,
						this.nes.ChrRomPageCount * 8 - 6, this.nes.ChrRomPageCount * 8 - 5,
						this.nes.ChrRomPageCount * 8 - 4, this.nes.ChrRomPageCount * 8 - 3,
						this.nes.ChrRomPageCount * 8 - 2, this.nes.ChrRomPageCount * 8 - 1);
	}

};

Mapper19.prototype.ReadLow = function(address) {
	switch(address & 0xF800) {
		case 0x4800:
			return this.nes.Read_N163_RAM();
		case 0x5000:
			this.ClearIRQ();
			return (this.MAPPER_REG[4] & 0x00FF);
		case 0x5800:
			this.ClearIRQ();
			return (this.MAPPER_REG[3] << 7) | ((this.MAPPER_REG[4] & 0x7F00) >> 8);
	}
	return 0x00;
};

Mapper19.prototype.WriteLow = function(address, data) {
	switch (address & 0xF800) {
		case 0x4800:
			if(address === 0x4800) {
				this.nes.Write_N163_RAM(data);
			}
			break;

		case 0x5000:
			this.MAPPER_REG[4] = (this.MAPPER_REG[4] & 0xFF00) | data;
			this.ClearIRQ();
			break;

		case 0x5800:
			this.MAPPER_REG[4] = (this.MAPPER_REG[4] & 0x00FF) | ((data & 0x7F) << 8);
			this.MAPPER_REG[3] = (data & 0x80) >> 7;
			this.ClearIRQ();
			break;
	}
};

Mapper19.prototype.Write = function(address, data) {
	switch (address & 0xF800) {
		case 0x8000:
			if(data < 0xE0 || this.MAPPER_REG[0] === 1) {
				this.nes.SetChrRomPage1K(0, data);
			} else {
				this.nes.VRAM[0] = this.EX_VRAM[data &0xE0];
			}
			break;

		case 0x8800:
			if(data < 0xE0 || this.MAPPER_REG[0] === 1) {
				this.nes.SetChrRomPage1K(1, data);
			} else {
				this.nes.VRAM[1] = this.EX_VRAM[data &0xE0];
			}
			break;

		case 0x9000:
			if(data < 0xE0 || this.MAPPER_REG[0] === 1) {
				this.nes.SetChrRomPage1K(2, data);
			} else {
				this.nes.VRAM[2] = this.EX_VRAM[data &0xE0];
			}
			break;

		case 0x9800:
			if(data < 0xE0 || this.MAPPER_REG[0] === 1) {
				this.nes.SetChrRomPage1K(3, data);
			} else {
				this.nes.VRAM[3] = this.EX_VRAM[data &0xE0];
			}
			break;

		case 0xA000:
			if(data < 0xE0 || this.MAPPER_REG[1] === 1) {
				this.nes.SetChrRomPage1K(4, data);
			} else {
				this.nes.VRAM[4] = this.EX_VRAM[data &0xE0];
			}
			break;

		case 0xA800:
			if(data < 0xE0 || this.MAPPER_REG[1] === 1) {
				this.nes.SetChrRomPage1K(5, data);
			} else {
				this.nes.VRAM[5] = this.EX_VRAM[data &0xE0];
			}
			break;

		case 0xB000:
			if(data < 0xE0 || this.MAPPER_REG[1] === 1) {
				this.nes.SetChrRomPage1K(6, data);
			} else {
				this.nes.VRAM[6] = this.EX_VRAM[data &0xE0];
			}
			break;

		case 0xB800:
			if(data < 0xE0 || this.MAPPER_REG[1] === 1) {
				this.nes.SetChrRomPage1K(7, data);
			} else {
				this.nes.VRAM[7] = this.EX_VRAM[data &0xE0];
			}
			break;

		case 0xC000:
			if(data < 0xE0) {
				this.nes.SetChrRomPage1K(8, data);
			} else {
				this.nes.VRAM[8] = this.nes.VRAMS[(data & 0x01) + 8];
			}
			break;

		case 0xC800:
			if(data < 0xE0) {
				this.nes.SetChrRomPage1K(9, data);
			} else {
				this.nes.VRAM[9] = this.nes.VRAMS[(data & 0x01) + 8];
			}
			break;

		case 0xD000:
			if(data < 0xE0) {
				this.nes.SetChrRomPage1K(10, data);
			} else {
				this.nes.VRAM[10] = this.nes.VRAMS[(data & 0x01) + 8];
			}
			break;

		case 0xD800:
			if(data < 0xE0) {
				this.nes.SetChrRomPage1K(11, data);
			} else {
				this.nes.VRAM[11] = this.nes.VRAMS[(data & 0x01) + 8];
			}
			break;

		case 0xE000:
			this.nes.SetPrgRomPage8K(0, data & 0x3F);
			break;

		case 0xE800:
			this.nes.SetPrgRomPage8K(1, data & 0x3F);
			this.MAPPER_REG[0] = (data & 0x40) >> 6;
			this.MAPPER_REG[1] = (data & 0x80) >> 7;
			break;

		case 0xF000:
			this.nes.SetPrgRomPage8K(2, data & 0x3F);
			break;

		case 0xF800:
			if(address === 0xF800) {
				this.nes.N163_Address = data;
			}
			break;
	}
};

Mapper19.prototype.CPUSync = function(clock) {
	if(this.MAPPER_REG[3] !== 0) {
		this.MAPPER_REG[4] += clock;
		if(this.MAPPER_REG[4] >= 0x7FFF) {
			this.MAPPER_REG[4] -= 0x7FFF;
			this.SetIRQ();
		}
	}
};

Mapper19.prototype.OutEXSound = function(soundin) {
	return (soundin >> 1) + (this.nes.Out_N163() >> 1);
};

Mapper19.prototype.EXSoundSync = function(clock) {
	this.nes.Count_N163(clock);
};

module.exports = Mapper19;

},{"./Base":55}],15:[function(require,module,exports){
"use strict";

var Base = require('./Base');
/**** Mapper2 ****/
var Mapper2 = function(nes) {
	Base.apply(this, arguments);
};

Mapper2.prototype = Object.create(Base.prototype);

Mapper2.prototype.Init = function() {
	this.nes.SetPrgRomPage(0, 0);
	this.nes.SetPrgRomPage(1, this.nes.PrgRomPageCount - 1);
	this.nes.SetChrRomPage(0);
};

Mapper2.prototype.Write = function(address, data) {
	this.nes.SetPrgRomPage(0, data);
};

module.exports = Mapper2;

},{"./Base":55}],16:[function(require,module,exports){
"use strict";

var Base = require('./Base');
/**** Mapper207 ****/
var Mapper207 = function(nes) {
	Base.apply(this, arguments);
	this.MAPPER_REG = new Array(11);
	this.EX_RAM = new Array(128);
};

Mapper207.prototype = Object.create(Base.prototype);

Mapper207.prototype.Init = function() {
	var i;
	for(i=0; i<this.MAPPER_REG.length; i++)
		this.MAPPER_REG[i] = 0;

	for(i=0; i<this.EX_RAM.length; i++) {
		this.EX_RAM[i] = 0x00;
	}

	this.nes.SetPrgRomPages8K(0, 1, 2, this.nes.PrgRomPageCount * 2 - 1);
	this.nes.SetChrRomPages1K(0, 1, 2, 3, 4, 5, 6, 7);
};

Mapper207.prototype.ReadSRAM = function(address) {
	if(address >= 0x7F00 && address <= 0x7FFF)
		return this.EX_RAM[address & 0x007F];

	switch(address) {
		case 0x7EF0:
			return this.MAPPER_REG[0];
		case 0x7EF1:
			return this.MAPPER_REG[1];
		case 0x7EF2:
			return this.MAPPER_REG[2];
		case 0x7EF3:
			return this.MAPPER_REG[3];
		case 0x7EF4:
			return this.MAPPER_REG[4];
		case 0x7EF5:
			return this.MAPPER_REG[5];
		case 0x7EF6:
		case 0x7EF7:
			return this.MAPPER_REG[6];
		case 0x7EF8:
		case 0x7EF9:
			return this.MAPPER_REG[7];
		case 0x7EFA:
		case 0x7EFB:
			return this.MAPPER_REG[8];
		case 0x7EFC:
		case 0x7EFD:
			return this.MAPPER_REG[9];
		case 0x7EFE:
		case 0x7EFF:
			return this.MAPPER_REG[10];
	}

	return 0x00;
};

Mapper207.prototype.WriteSRAM = function(address, data) {
	if(address >= 0x7F00 && address <= 0x7FFF) {
		this.EX_RAM[address & 0x007F] = data;
		return;
	}

	switch(address) {
		case 0x7EF0:
			this.MAPPER_REG[0] = data;
			if((data & 0x80) === 0x00) {
				this.nes.VRAM[8] = this.nes.VRAMS[8];
				this.nes.VRAM[9] = this.nes.VRAMS[8];
			} else {
				this.nes.VRAM[8] = this.nes.VRAMS[9];
				this.nes.VRAM[9] = this.nes.VRAMS[9];
			}
			this.nes.SetChrRomPage1K(0, data & 0x7E);
			this.nes.SetChrRomPage1K(1, (data & 0x7E) + 1);
			break;
		case 0x7EF1:
			this.MAPPER_REG[1] = data;
			if((data & 0x80) === 0x00) {
				this.nes.SetChrRomPage1K(10, 8 + 0x0100);
				this.nes.SetChrRomPage1K(11, 8 + 0x0100);
			} else {
				this.nes.SetChrRomPage1K(10, 9 + 0x0100);
				this.nes.SetChrRomPage1K(11, 9 + 0x0100);
			}
			this.nes.SetChrRomPage1K(2, data & 0x7E);
			this.nes.SetChrRomPage1K(3, (data & 0x7E) + 1);
			break;
		case 0x7EF2:
			this.MAPPER_REG[2] = data;
			this.nes.SetChrRomPage1K(4, data);
			break;
		case 0x7EF3:
			this.MAPPER_REG[3] = data;
			this.nes.SetChrRomPage1K(5, data);
			break;
		case 0x7EF4:
			this.MAPPER_REG[4] = data;
			this.nes.SetChrRomPage1K(6, data);
			break;
		case 0x7EF5:
			this.MAPPER_REG[5] = data;
			this.nes.SetChrRomPage1K(7, data);
			break;
		case 0x7EF8:
		case 0x7EF9:
			this.MAPPER_REG[7] = data;
			break;
		case 0x7EFA:
		case 0x7EFB:
			this.MAPPER_REG[8] = data;
			this.nes.SetPrgRomPage8K(0, data);
			break;
		case 0x7EFC:
		case 0x7EFD:
			this.MAPPER_REG[9] = data;
			this.nes.SetPrgRomPage8K(1, data);
			break;
		case 0x7EFE:
		case 0x7EFF:
			this.MAPPER_REG[10] = data;
			this.nes.SetPrgRomPage8K(2, data);
			break;
	}
};

module.exports = Mapper207;

},{"./Base":55}],17:[function(require,module,exports){
"use strict";

var Base = require('./Base');
/**** Mapper22 ****/
var Mapper22 = function(nes) {
	Base.apply(this, arguments);
	this.MAPPER_REG = new Array(16);
};

Mapper22.prototype = Object.create(Base.prototype);

Mapper22.prototype.Init = function() {
	var i;
	for(i=0; i<this.MAPPER_REG.length; i++)
		this.MAPPER_REG[i] = 0;

	this.nes.SetPrgRomPages8K(0, 1, this.nes.PrgRomPageCount * 2 - 2, this.nes.PrgRomPageCount * 2 - 1);

	if(this.nes.ChrRomPageCount !== 0) {
		this.nes.SetChrRomPages1K(0, 1, 2, 3, 4, 5, 6, 7);
	}
};

Mapper22.prototype.Write = function(address, data) {
	switch (address & 0xF000) {
		case 0x8000:
			if((this.MAPPER_REG[10] & 0x02) !== 0)
				this.nes.SetPrgRomPage8K(2, data);
			else
				this.nes.SetPrgRomPage8K(0, data);
			break;

		case 0xA000:
			this.nes.SetPrgRomPage8K(1, data);
			break;
	}

	switch (address & 0xF00F) {
		case 0x9000:
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

		case 0x9008:
			this.MAPPER_REG[10] = data;
			break;

		case 0xB000:
			this.MAPPER_REG[0] = (this.MAPPER_REG[0] & 0xF0) | (data & 0x0F);
			this.nes.SetChrRomPage1K(0, this.MAPPER_REG[0] >> 1);
			break;

		case 0xB002:
		case 0xB008:
			this.MAPPER_REG[0] = (this.MAPPER_REG[0] & 0x0F) | ((data & 0x0F) << 4);
			this.nes.SetChrRomPage1K(0, this.MAPPER_REG[0] >> 1);
			break;

		case 0xB001:
		case 0xB004:
			this.MAPPER_REG[1] = (this.MAPPER_REG[1] & 0xF0) | (data & 0x0F);
			this.nes.SetChrRomPage1K(1, this.MAPPER_REG[1] >> 1);
			break;

		case 0xB003:
		case 0xB00C:
			this.MAPPER_REG[1] = (this.MAPPER_REG[1] & 0x0F) | ((data & 0x0F) << 4);
			this.nes.SetChrRomPage1K(1, this.MAPPER_REG[1] >> 1);
			break;

		case 0xC000:
			this.MAPPER_REG[2] = (this.MAPPER_REG[2] & 0xF0) | (data & 0x0F);
			this.nes.SetChrRomPage1K(2, this.MAPPER_REG[2] >> 1);
			break;

		case 0xC002:
		case 0xC008:
			this.MAPPER_REG[2] = (this.MAPPER_REG[2] & 0x0F) | ((data & 0x0F) << 4);
			this.nes.SetChrRomPage1K(2, this.MAPPER_REG[2] >> 1);
			break;

		case 0xC001:
		case 0xC004:
			this.MAPPER_REG[3] = (this.MAPPER_REG[3] & 0xF0) | (data & 0x0F);
			this.nes.SetChrRomPage1K(3, this.MAPPER_REG[3] >> 1);
			break;

		case 0xC003:
		case 0xC00C:
			this.MAPPER_REG[3] = (this.MAPPER_REG[3] & 0x0F) | ((data & 0x0F) << 4);
			this.nes.SetChrRomPage1K(3, this.MAPPER_REG[3] >> 1);
			break;

		case 0xD000:
			this.MAPPER_REG[4] = (this.MAPPER_REG[4] & 0xF0) | (data & 0x0F);
			this.nes.SetChrRomPage1K(4, this.MAPPER_REG[4] >> 1);
			break;

		case 0xD002:
		case 0xD008:
			this.MAPPER_REG[4] = (this.MAPPER_REG[4] & 0x0F) | ((data & 0x0F) << 4);
			this.nes.SetChrRomPage1K(4, this.MAPPER_REG[4] >> 1);
			break;

		case 0xD001:
		case 0xD004:
			this.MAPPER_REG[5] = (this.MAPPER_REG[5] & 0xF0) | (data & 0x0F);
			this.nes.SetChrRomPage1K(5, this.MAPPER_REG[5] >> 1);
			break;

		case 0xD003:
		case 0xD00C:
			this.MAPPER_REG[5] = (this.MAPPER_REG[5] & 0x0F) | ((data & 0x0F) << 4);
			this.nes.SetChrRomPage1K(5, this.MAPPER_REG[5] >> 1);
			break;

		case 0xE000:
			this.MAPPER_REG[6] = (this.MAPPER_REG[6] & 0xF0) | (data & 0x0F);
			this.nes.SetChrRomPage1K(6, this.MAPPER_REG[6] >> 1);
			break;

		case 0xE002:
		case 0xE008:
			this.MAPPER_REG[6] = (this.MAPPER_REG[6] & 0x0F) | ((data & 0x0F) << 4);
			this.nes.SetChrRomPage1K(6, this.MAPPER_REG[6] >> 1);
			break;

		case 0xE001:
		case 0xE004:
			this.MAPPER_REG[7] = (this.MAPPER_REG[7] & 0xF0) | (data & 0x0F);
			this.nes.SetChrRomPage1K(7, this.MAPPER_REG[7] >> 1);
			break;

		case 0xE003:
		case 0xE00C:
			this.MAPPER_REG[7] = (this.MAPPER_REG[7] & 0x0F) | ((data & 0x0F) << 4);
			this.nes.SetChrRomPage1K(7, this.MAPPER_REG[7] >> 1);
			break;
	}
};

module.exports = Mapper22;

},{"./Base":55}],18:[function(require,module,exports){
"use strict";

var Base = require('./Base');

/**** Mapper23 ****/
var Mapper23 = function(nes) {
	Base.apply(this, arguments);
	this.MAPPER_REG = new Array(16);
};

Mapper23.prototype = Object.create(Base.prototype);

Mapper23.prototype.Init = function() {
	var i;
	for(i=0; i<this.MAPPER_REG.length; i++)
		this.MAPPER_REG[i] = 0;

	this.nes.SetPrgRomPages8K(0, 1, this.nes.PrgRomPageCount * 2 - 2, this.nes.PrgRomPageCount * 2 - 1);

	if(this.nes.ChrRomPageCount !== 0) {
		this.nes.SetChrRomPages1K(0, 1, 2, 3, 4, 5, 6, 7);
	}
};

Mapper23.prototype.Write = function(address, data) {
	switch (address & 0xF000) {
		case 0x8000:
			if((this.MAPPER_REG[10] & 0x02) !== 0)
				this.nes.SetPrgRomPage8K(2, data);
			else
				this.nes.SetPrgRomPage8K(0, data);
			break;

		case 0xA000:
			this.nes.SetPrgRomPage8K(1, data);
			break;
	}

	switch (address & 0xF00F) {
		case 0x9000:
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

		case 0x9008:
			this.MAPPER_REG[10] = data;
			break;

		case 0xB000:
			this.MAPPER_REG[0] = (this.MAPPER_REG[0] & 0xF0) | (data & 0x0F);
			this.nes.SetChrRomPage1K(0, this.MAPPER_REG[0]);
			break;

		case 0xB001:
		case 0xB004:
			this.MAPPER_REG[0] = (this.MAPPER_REG[0] & 0x0F) | ((data & 0x0F) << 4);
			this.nes.SetChrRomPage1K(0, this.MAPPER_REG[0]);
			break;

		case 0xB002:
		case 0xB008:
			this.MAPPER_REG[1] = (this.MAPPER_REG[1] & 0xF0) | (data & 0x0F);
			this.nes.SetChrRomPage1K(1, this.MAPPER_REG[1]);
			break;

		case 0xB003:
		case 0xB00C:
			this.MAPPER_REG[1] = (this.MAPPER_REG[1] & 0x0F) | ((data & 0x0F) << 4);
			this.nes.SetChrRomPage1K(1, this.MAPPER_REG[1]);
			break;

		case 0xC000:
			this.MAPPER_REG[2] = (this.MAPPER_REG[2] & 0xF0) | (data & 0x0F);
			this.nes.SetChrRomPage1K(2, this.MAPPER_REG[2]);
			break;

		case 0xC001:
		case 0xC004:
			this.MAPPER_REG[2] = (this.MAPPER_REG[2] & 0x0F) | ((data & 0x0F) << 4);
			this.nes.SetChrRomPage1K(2, this.MAPPER_REG[2]);
			break;

		case 0xC002:
		case 0xC008:
			this.MAPPER_REG[3] = (this.MAPPER_REG[3] & 0xF0) | (data & 0x0F);
			this.nes.SetChrRomPage1K(3, this.MAPPER_REG[3]);
			break;

		case 0xC003:
		case 0xC00C:
			this.MAPPER_REG[3] = (this.MAPPER_REG[3] & 0x0F) | ((data & 0x0F) << 4);
			this.nes.SetChrRomPage1K(3, this.MAPPER_REG[3]);
			break;

		case 0xD000:
			this.MAPPER_REG[4] = (this.MAPPER_REG[4] & 0xF0) | (data & 0x0F);
			this.nes.SetChrRomPage1K(4, this.MAPPER_REG[4]);
			break;

		case 0xD001:
		case 0xD004:
			this.MAPPER_REG[4] = (this.MAPPER_REG[4] & 0x0F) | ((data & 0x0F) << 4);
			this.nes.SetChrRomPage1K(4, this.MAPPER_REG[4]);
			break;

		case 0xD002:
		case 0xD008:
			this.MAPPER_REG[5] = (this.MAPPER_REG[5] & 0xF0) | (data & 0x0F);
			this.nes.SetChrRomPage1K(5, this.MAPPER_REG[5]);
			break;

		case 0xD003:
		case 0xD00C:
			this.MAPPER_REG[5] = (this.MAPPER_REG[5] & 0x0F) | ((data & 0x0F) << 4);
			this.nes.SetChrRomPage1K(5, this.MAPPER_REG[5]);
			break;

		case 0xE000:
			this.MAPPER_REG[6] = (this.MAPPER_REG[6] & 0xF0) | (data & 0x0F);
			this.nes.SetChrRomPage1K(6, this.MAPPER_REG[6]);
			break;

		case 0xE001:
		case 0xE004:
			this.MAPPER_REG[6] = (this.MAPPER_REG[6] & 0x0F) | ((data & 0x0F) << 4);
			this.nes.SetChrRomPage1K(6, this.MAPPER_REG[6]);
			break;

		case 0xE002:
		case 0xE008:
			this.MAPPER_REG[7] = (this.MAPPER_REG[7] & 0xF0) | (data & 0x0F);
			this.nes.SetChrRomPage1K(7, this.MAPPER_REG[7]);
			break;

		case 0xE003:
		case 0xE00C:
			this.MAPPER_REG[7] = (this.MAPPER_REG[7] & 0x0F) | ((data & 0x0F) << 4);
			this.nes.SetChrRomPage1K(7, this.MAPPER_REG[7]);
			break;

		case 0xF000:
			this.MAPPER_REG[13] = (this.MAPPER_REG[13] & 0xF0) | (data & 0x0F);
			break;

		case 0xF001:
		case 0xF004:
			this.MAPPER_REG[13] = (this.MAPPER_REG[13] & 0x0F) | ((data & 0x0F) << 4);
			break;

		case 0xF002:
		case 0xF008:
			this.MAPPER_REG[11] = data & 0x07;
			if((this.MAPPER_REG[11] & 0x02) !== 0) {
				this.MAPPER_REG[12] = this.MAPPER_REG[13];
			}
			break;

		case 0xF003:
		case 0xF00C:
			if((this.MAPPER_REG[11] & 0x01) !== 0) {
				this.MAPPER_REG[11] |= 0x02;
			} else {
				this.MAPPER_REG[11] &= 0x01;
			}
			this.ClearIRQ();
			break;
	}
};

Mapper23.prototype.HSync = function(y) {
	if((this.MAPPER_REG[11] & 0x06) === 0x02) {
		if(this.MAPPER_REG[12] === 0xFF) {
			this.MAPPER_REG[12] = this.MAPPER_REG[13];
			this.SetIRQ();
		} else
			this.MAPPER_REG[12]++;
	}
};

Mapper23.prototype.CPUSync = function(clock) {
	if((this.MAPPER_REG[11] & 0x06) === 0x06) {
		if(this.MAPPER_REG[12] >= 0xFF) {
			this.MAPPER_REG[12] = this.MAPPER_REG[13];
			this.SetIRQ();
		} else
			this.MAPPER_REG[12] += clock;
	}
};

module.exports = Mapper23;

},{"./Base":55}],19:[function(require,module,exports){
"use strict";

var Base = require('./Base');
/**** Mapper24 ****/
var Mapper24 = function(nes) {
	Base.apply(this, arguments);
	this.MAPPER_REG = new Array(3);
};

Mapper24.prototype = Object.create(Base.prototype);

Mapper24.prototype.Init = function() {
	this.MAPPER_REG[0] = 0x00;
	this.MAPPER_REG[1] = 0x00;
	this.MAPPER_REG[2] = 0x00;
	this.nes.SetPrgRomPages8K(0, 1, 2, this.nes.PrgRomPageCount * 2 - 1);
	this.nes.SetChrRomPages1K(0, 1, 2, 3, 4, 5, 6, 7);
};

Mapper24.prototype.Write = function(address, data) {
	switch(address & 0xF003) {
		case 0x8000:
		case 0x8001:
		case 0x8002:
		case 0x8003:
			this.nes.SetPrgRomPage8K(0, data * 2);
			this.nes.SetPrgRomPage8K(1, data * 2 + 1);
			break;


		case 0x9000:
		case 0x9001:
		case 0x9002:
			this.nes.Write_VRC6_REG(address & 0x03, data);
			break;


		case 0xA000:
		case 0xA001:
		case 0xA002:
			this.nes.Write_VRC6_REG((address & 0x03) + 4, data);
			break;


		case 0xB000:
		case 0xB001:
		case 0xB002:
			this.nes.Write_VRC6_REG((address & 0x03) + 8, data);
			break;


		case 0xB003:
			data &= 0x0C;
			if(data === 0x00) {
				this.nes.SetMirror(false);
			} else if(data === 0x04) {
				this.nes.SetMirror(true);
			} else if(data === 0x08) {
				this.nes.SetMirrors(0, 0, 0, 0);
			} else {
				this.nes.SetMirrors(1, 1, 1, 1);
			}
			break;

		case 0xC000:
		case 0xC001:
		case 0xC002:
		case 0xC003:
			this.nes.SetPrgRomPage8K(2, data);
			break;

		case 0xD000:
		case 0xD001:
		case 0xD002:
		case 0xD003:
			this.nes.SetChrRomPage1K(address & 0x03, data);
			break;

		case 0xE000:
		case 0xE001:
		case 0xE002:
		case 0xE003:
			this.nes.SetChrRomPage1K((address & 0x03) + 4, data);
			break;

		case 0xF000:
			this.MAPPER_REG[0] = data;
			break;

		case 0xF001:
			this.MAPPER_REG[1] = data & 0x07;
			if((this.MAPPER_REG[1] & 0x02) !== 0) {
				this.MAPPER_REG[2] = this.MAPPER_REG[0];
			}
			break;

		case 0xF002:
			if((this.MAPPER_REG[1] & 0x01) !== 0) {
				this.MAPPER_REG[1] |= 0x02;
			} else {
				this.MAPPER_REG[1] &= 0x01;
			}
			this.ClearIRQ();
			break;
	}
};

Mapper24.prototype.HSync = function(y) {
	if((this.MAPPER_REG[1] & 0x06) === 0x02) {
		if(this.MAPPER_REG[2] === 0xFF) {
			this.MAPPER_REG[2] = this.MAPPER_REG[0];
			this.SetIRQ();
		} else
			this.MAPPER_REG[2]++;
	}
};

Mapper24.prototype.CPUSync = function(clock) {
	if((this.MAPPER_REG[1] & 0x06) === 0x06) {
		if(this.MAPPER_REG[2] >= 0xFF) {
			this.MAPPER_REG[2] = this.MAPPER_REG[0];
			this.SetIRQ();
		} else
			this.MAPPER_REG[2] += clock;
	}
};

Mapper24.prototype.OutEXSound = function(soundin) {
	return (soundin >> 1) + (this.nes.Out_VRC6() >> 1);
};

Mapper24.prototype.EXSoundSync = function(clock) {
	this.nes.Count_VRC6(clock);
};

module.exports = Mapper24;

},{"./Base":55}],20:[function(require,module,exports){
"use strict";

var Base = require('./Base');
/**** Mapper25 ****/
var Mapper25 = function(nes) {
	Base.apply(this, arguments);
	this.MAPPER_REG = new Array(16);
};

Mapper25.prototype = Object.create(Base.prototype);

Mapper25.prototype.Init = function() {
	var i;
	for(i=0; i<this.MAPPER_REG.length; i++)
		this.MAPPER_REG[i] = 0;

	this.nes.SetPrgRomPages8K(0, 1, this.nes.PrgRomPageCount * 2 - 2, this.nes.PrgRomPageCount * 2 - 1);

	if(this.nes.ChrRomPageCount !== 0) {
		this.nes.SetChrRomPages1K(0, 1, 2, 3, 4, 5, 6, 7);
	}
	this.MAPPER_REG[9] = this.nes.PrgRomPageCount * 2 - 2;
};

Mapper25.prototype.Write = function(address, data) {
	switch (address & 0xF000) {
		case 0x8000:
			if((this.MAPPER_REG[10] & 0x02) !== 0) {
				this.MAPPER_REG[9] = data;
				this.nes.SetPrgRomPage8K(2, data);
			} else {
				this.MAPPER_REG[8] = data;
				this.nes.SetPrgRomPage8K(0, data);
			}
			break;

		case 0xA000:
			this.nes.SetPrgRomPage8K(1, data);
			break;
	}

	switch (address & 0xF00F) {
		case 0x9000:
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

		case 0x9001:
		case 0x9004:
			if((this.MAPPER_REG[10] & 0x02) !== (data & 0x02)) {
				var swap = this.MAPPER_REG[8];
				this.MAPPER_REG[8] = this.MAPPER_REG[9];
				this.MAPPER_REG[9] = swap;
				this.nes.SetPrgRomPage8K(0, this.MAPPER_REG[8]);
				this.nes.SetPrgRomPage8K(2, this.MAPPER_REG[9]);
			}
			this.MAPPER_REG[10] = data;
			break;

		case 0xB000:
			this.MAPPER_REG[0] = (this.MAPPER_REG[0] & 0xF0) | (data & 0x0F);
			this.nes.SetChrRomPage1K(0, this.MAPPER_REG[0]);
			break;

		case 0xB001:
		case 0xB004:
			this.MAPPER_REG[1] = (this.MAPPER_REG[1] & 0xF0) | (data & 0x0F);
			this.nes.SetChrRomPage1K(1, this.MAPPER_REG[1]);
			break;

		case 0xB002:
		case 0xB008:
			this.MAPPER_REG[0] = (this.MAPPER_REG[0] & 0x0F) | ((data & 0x0F) << 4);
			this.nes.SetChrRomPage1K(0, this.MAPPER_REG[0]);
			break;

		case 0xB003:
		case 0xB00C:
			this.MAPPER_REG[1] = (this.MAPPER_REG[1] & 0x0F) | ((data & 0x0F) << 4);
			this.nes.SetChrRomPage1K(1, this.MAPPER_REG[1]);
			break;

		case 0xC000:
			this.MAPPER_REG[2] = (this.MAPPER_REG[2] & 0xF0) | (data & 0x0F);
			this.nes.SetChrRomPage1K(2, this.MAPPER_REG[2]);
			break;

		case 0xC001:
		case 0xC004:
			this.MAPPER_REG[3] = (this.MAPPER_REG[3] & 0xF0) | (data & 0x0F);
			this.nes.SetChrRomPage1K(3, this.MAPPER_REG[3]);
			break;

		case 0xC002:
		case 0xC008:
			this.MAPPER_REG[2] = (this.MAPPER_REG[2] & 0x0F) | ((data & 0x0F) << 4);
			this.nes.SetChrRomPage1K(2, this.MAPPER_REG[2]);
			break;

		case 0xC003:
		case 0xC00C:
			this.MAPPER_REG[3] = (this.MAPPER_REG[3] & 0x0F) | ((data & 0x0F) << 4);
			this.nes.SetChrRomPage1K(3, this.MAPPER_REG[3]);
			break;

		case 0xD000:
			this.MAPPER_REG[4] = (this.MAPPER_REG[4] & 0xF0) | (data & 0x0F);
			this.nes.SetChrRomPage1K(4, this.MAPPER_REG[4]);
			break;

		case 0xD001:
		case 0xD004:
			this.MAPPER_REG[5] = (this.MAPPER_REG[5] & 0xF0) | (data & 0x0F);
			this.nes.SetChrRomPage1K(5, this.MAPPER_REG[5]);
			break;

		case 0xD002:
		case 0xD008:
			this.MAPPER_REG[4] = (this.MAPPER_REG[4] & 0x0F) | ((data & 0x0F) << 4);
			this.nes.SetChrRomPage1K(4, this.MAPPER_REG[4]);
			break;

		case 0xD003:
		case 0xD00C:
			this.MAPPER_REG[5] = (this.MAPPER_REG[5] & 0x0F) | ((data & 0x0F) << 4);
			this.nes.SetChrRomPage1K(5, this.MAPPER_REG[5]);
			break;

		case 0xE000:
			this.MAPPER_REG[6] = (this.MAPPER_REG[6] & 0xF0) | (data & 0x0F);
			this.nes.SetChrRomPage1K(6, this.MAPPER_REG[6]);
			break;

		case 0xE001:
		case 0xE004:
			this.MAPPER_REG[7] = (this.MAPPER_REG[7] & 0xF0) | (data & 0x0F);
			this.nes.SetChrRomPage1K(7, this.MAPPER_REG[7]);
			break;

		case 0xE002:
		case 0xE008:
			this.MAPPER_REG[6] = (this.MAPPER_REG[6] & 0x0F) | ((data & 0x0F) << 4);
			this.nes.SetChrRomPage1K(6, this.MAPPER_REG[6]);
			break;

		case 0xE003:
		case 0xE00C:
			this.MAPPER_REG[7] = (this.MAPPER_REG[7] & 0x0F) | ((data & 0x0F) << 4);
			this.nes.SetChrRomPage1K(7, this.MAPPER_REG[7]);
			break;

		case 0xF000:
			this.MAPPER_REG[13] = (this.MAPPER_REG[13] & 0xF0) | (data & 0x0F);
			break;

		case 0xF001:
		case 0xF004:
			this.MAPPER_REG[11] = data & 0x07;
			if((this.MAPPER_REG[11] & 0x02) !== 0) {
				this.MAPPER_REG[12] = this.MAPPER_REG[13];
			}
			break;

		case 0xF002:
		case 0xF008:
			this.MAPPER_REG[13] = (this.MAPPER_REG[13] & 0x0F) | ((data & 0x0F) << 4);
			break;

		case 0xF003:
		case 0xF00C:
			if((this.MAPPER_REG[11] & 0x01) !== 0) {
				this.MAPPER_REG[11] |= 0x02;
			} else {
				this.MAPPER_REG[11] &= 0x01;
			}
			this.ClearIRQ();
			break;
	}
};

Mapper25.prototype.HSync = function(y) {
	if((this.MAPPER_REG[11] & 0x06) === 0x02) {
		if(this.MAPPER_REG[12] === 0xFF) {
			this.MAPPER_REG[12] = this.MAPPER_REG[13];
			this.SetIRQ();
		} else
			this.MAPPER_REG[12]++;
	}
};

Mapper25.prototype.CPUSync = function(clock) {
	if((this.MAPPER_REG[11] & 0x06) === 0x06) {
		if(this.MAPPER_REG[12] >= 0xFF) {
			this.MAPPER_REG[12] = this.MAPPER_REG[13];
			this.SetIRQ();
		} else
			this.MAPPER_REG[12] += clock;
	}
};

module.exports = Mapper25;

},{"./Base":55}],21:[function(require,module,exports){
"use strict";

var Base = require('./Base');
/**** Mapper26 ****/
var Mapper26 = function(nes) {
	Base.apply(this, arguments);
	this.MAPPER_REG = new Array(3);
};

Mapper26.prototype = Object.create(Base.prototype);

Mapper26.prototype.Init = function() {
	this.MAPPER_REG[0] = 0x00;
	this.MAPPER_REG[1] = 0x00;
	this.MAPPER_REG[2] = 0x00;
	this.nes.SetPrgRomPages8K(0, 1, 2, this.nes.PrgRomPageCount * 2 - 1);
	this.nes.SetChrRomPages1K(0, 1, 2, 3, 4, 5, 6, 7);
};

Mapper26.prototype.Write = function(address, data) {
	address = (address & 0xFFFC) | ((address & 0x0002) >> 1) | ((address & 0x0001) << 1);

	switch(address & 0xF003) {
		case 0x8000:
		case 0x8001:
		case 0x8002:
		case 0x8003:
			this.nes.SetPrgRomPage8K(0, data * 2);
			this.nes.SetPrgRomPage8K(1, data * 2 + 1);
			break;


		case 0x9000:
		case 0x9001:
		case 0x9002:
			this.nes.Write_VRC6_REG(address & 0x03, data);
			break;


		case 0xA000:
		case 0xA001:
		case 0xA002:
			this.nes.Write_VRC6_REG((address & 0x03) + 4, data);
			break;


		case 0xB000:
		case 0xB001:
		case 0xB002:
			this.nes.Write_VRC6_REG((address & 0x03) + 8, data);
			break;


		case 0xB003:
			data &= 0x0C;
			if(data === 0x00) {
				this.nes.SetMirror(false);
			} else if(data === 0x04) {
				this.nes.SetMirror(true);
			} else if(data === 0x08) {
				this.nes.SetMirrors(0, 0, 0, 0);
			} else {
				this.nes.SetMirrors(1, 1, 1, 1);
			}
			break;

		case 0xC000:
		case 0xC001:
		case 0xC002:
		case 0xC003:
			this.nes.SetPrgRomPage8K(2, data);
			break;

		case 0xD000:
		case 0xD001:
		case 0xD002:
		case 0xD003:
			this.nes.SetChrRomPage1K(address & 0x03, data);
			break;

		case 0xE000:
		case 0xE001:
		case 0xE002:
		case 0xE003:
			this.nes.SetChrRomPage1K((address & 0x03) + 4, data);
			break;

		case 0xF000:
			this.MAPPER_REG[0] = data;
			break;

		case 0xF001:
			this.MAPPER_REG[1] = data & 0x07;
			if((this.MAPPER_REG[1] & 0x02) !== 0) {
				this.MAPPER_REG[2] = this.MAPPER_REG[0];
			}
			this.ClearIRQ();
			break;

		case 0xF002:
			if((this.MAPPER_REG[1] & 0x01) !== 0) {
				this.MAPPER_REG[1] |= 0x02;
			} else {
				this.MAPPER_REG[1] &= 0x01;
			}
			break;
	}
};

Mapper26.prototype.HSync = function(y) {
	if((this.MAPPER_REG[1] & 0x06) === 0x02) {
		if(this.MAPPER_REG[2] === 0xFF) {
			this.MAPPER_REG[2] = this.MAPPER_REG[0];
			this.SetIRQ();
		} else
			this.MAPPER_REG[2]++;
	}
};

Mapper26.prototype.CPUSync = function(clock) {
	if((this.MAPPER_REG[1] & 0x06) === 0x06) {
		if(this.MAPPER_REG[2] >= 0xFF) {
			this.MAPPER_REG[2] = this.MAPPER_REG[0];
			this.SetIRQ();
		} else
			this.MAPPER_REG[2] += clock;
	}
};

Mapper26.prototype.OutEXSound = function(soundin) {
	return (soundin >> 1) + (this.nes.Out_VRC6() >> 1);
};

Mapper26.prototype.EXSoundSync = function(clock) {
	this.nes.Count_VRC6(clock);
};

module.exports = Mapper26;

},{"./Base":55}],22:[function(require,module,exports){
"use strict";

var Base = require('./Base');
/**** Mapper3 ****/
var Mapper3 = function(nes) {
	Base.apply(this, arguments);
};

Mapper3.prototype = Object.create(Base.prototype);

Mapper3.prototype.Init = function() {
	this.nes.SetPrgRomPage(0, 0);
	this.nes.SetPrgRomPage(1, this.nes.PrgRomPageCount - 1);
	this.nes.SetChrRomPage(0);
};

Mapper3.prototype.Write = function(address, data) {
	this.nes.SetChrRomPage(data & 0x0F);
};

module.exports = Mapper3;

},{"./Base":55}],23:[function(require,module,exports){
"use strict";

var Base = require('./Base');
/**** Mapper32 ****/
var Mapper32 = function(nes) {
	Base.apply(this, arguments);
	this.MAPPER_REG = new Array(11);
};

Mapper32.prototype = Object.create(Base.prototype);

Mapper32.prototype.Init = function() {
	for(var i=0; i<this.MAPPER_REG.length; i++)
		this.MAPPER_REG[i] = 0;

	this.nes.SetPrgRomPages8K(0, 1, this.nes.PrgRomPageCount * 2 - 2, this.nes.PrgRomPageCount * 2 - 1);
	this.nes.SetChrRomPages1K(0, 1, 2, 3, 4, 5, 6, 7);
};

Mapper32.prototype.Write = function(address, data) {
	switch (address & 0xF000) {
		case 0x8000:
			this.MAPPER_REG[8] = data;
			if((this.MAPPER_REG[10] & 0x02) === 0x00)
				this.nes.SetPrgRomPage8K(0, data);
			else
				this.nes.SetPrgRomPage8K(2, data);
			break;
		case 0x9000:
			this.MAPPER_REG[10] = data;
			if((data & 0x01) === 0x00)
				this.nes.SetMirror(false);
			else
				this.nes.SetMirror(true);

			if((data & 0x02) === 0x00) {
				this.nes.SetPrgRomPage8K(0, this.MAPPER_REG[8]);
				this.nes.SetPrgRomPage8K(2, (this.nes.PrgRomPageCount - 1) * 2);
			} else {
				this.nes.SetPrgRomPage8K(0, 0);
				this.nes.SetPrgRomPage8K(2, this.MAPPER_REG[8]);
			}
			break;
		case 0xA000:
			this.MAPPER_REG[9] = data;
			this.nes.SetPrgRomPage8K(1, data);
			break;
		case 0xB000:
			var tmp = address & 0x0007;
			this.MAPPER_REG[tmp] = data;
			this.nes.SetChrRomPage1K(tmp, data);
			break;
	}
};

module.exports = Mapper32;

},{"./Base":55}],24:[function(require,module,exports){
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

},{"./Base":55}],25:[function(require,module,exports){
"use strict";

var Base = require('./Base');
/**** Mapper34 ****/
var Mapper34 = function(nes) {
	Base.apply(this, arguments);
};

Mapper34.prototype = Object.create(Base.prototype);

Mapper34.prototype.Init = function() {
	this.nes.SetPrgRomPage(0, 0);
	this.nes.SetPrgRomPage(1, 1);
	this.nes.SetChrRomPage(0);
};

Mapper34.prototype.Write = function(address, data) {
	var tmp = (data & 0x03) << 1;

	this.nes.SetPrgRomPage(0, tmp);
	this.nes.SetPrgRomPage(1, tmp + 1);
};

module.exports = Mapper34;

},{"./Base":55}],26:[function(require,module,exports){
"use strict";

var Base = require('./Base');
/**** Mapper4 ****/
var Mapper4 = function(nes) {
	Base.apply(this, arguments);
	this.MAPPER_REG = new Array(20);
};

Mapper4.prototype = Object.create(Base.prototype);

Mapper4.prototype.Init = function() {
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

Mapper4.prototype.Write = function(address, data) {
	switch (address & 0xE001) {
		case 0x8000:
			this.MAPPER_REG[0] = data;
			if((data & 0x80) === 0x80) {
				this.nes.SetChrRomPages1K(this.MAPPER_REG[12], this.MAPPER_REG[13], this.MAPPER_REG[14], this.MAPPER_REG[15], 
							this.MAPPER_REG[8], this.MAPPER_REG[9], this.MAPPER_REG[10], this.MAPPER_REG[11]); 
			} else {
				this.nes.SetChrRomPages1K(this.MAPPER_REG[8], this.MAPPER_REG[9], this.MAPPER_REG[10], this.MAPPER_REG[11], 
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
				this.nes.SetChrRomPages1K(this.MAPPER_REG[12], this.MAPPER_REG[13], this.MAPPER_REG[14], this.MAPPER_REG[15], 
							this.MAPPER_REG[8], this.MAPPER_REG[9], this.MAPPER_REG[10], this.MAPPER_REG[11]); 
			} else {
				this.nes.SetChrRomPages1K(this.MAPPER_REG[8], this.MAPPER_REG[9], this.MAPPER_REG[10], this.MAPPER_REG[11], 
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

Mapper4.prototype.HSync = function(y) {
	if(this.MAPPER_REG[7] === 1 && y < 240 && (this.nes.IO1[0x01] & 0x08) === 0x08) {
		if(--this.MAPPER_REG[4] === 0)
			this.SetIRQ();
		this.MAPPER_REG[4] &= 0xFF;
	}
};

module.exports = Mapper4;

},{"./Base":55}],27:[function(require,module,exports){
"use strict";

var Base = require('./Base');
/**** Mapper48 ****/
var Mapper48 = function(nes) {
	Base.apply(this, arguments);
	this.MAPPER_REG = new Array(3);
};

Mapper48.prototype = Object.create(Base.prototype);

Mapper48.prototype.Init = function() {
	for(var i=0; i<this.MAPPER_REG.length; i++)
		this.MAPPER_REG[i] = 0;

	this.nes.SetPrgRomPages8K(0, 1, this.nes.PrgRomPageCount * 2 - 2, this.nes.PrgRomPageCount * 2 - 1);
	this.nes.SetChrRomPages1K(0, 1, 2, 3, 4, 5, 6, 7);
};

Mapper48.prototype.Write = function(address, data) {
	switch (address & 0xE003) {
		case 0x8000:
			this.nes.SetPrgRomPage8K(0, data);
			break;
		case 0x8001:
			this.nes.SetPrgRomPage8K(1, data);
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

		case 0xC000:
			this.MAPPER_REG[1] = data;
			this.MAPPER_REG[0] = 0;
			this.ClearIRQ();
			break;
		case 0xC001:
			this.MAPPER_REG[1] = data;
			this.MAPPER_REG[0] = 1;
			break;

		case 0xE000:
			if((data & 0x40) === 0x00)
				this.nes.SetMirror(false);
			else
				this.nes.SetMirror(true);
			break;
	}
};

Mapper48.prototype.HSync = function(y) {
	if(this.MAPPER_REG[0] === 1 && y < 240 && (this.nes.IO1[0x01] & 0x08) === 0x08) {
		if(this.MAPPER_REG[1] === 0xFF) {
			this.SetIRQ();
			this.MAPPER_REG[0] = 0;
		}
		this.MAPPER_REG[1]++;
	}
};

module.exports = Mapper48;

},{"./Base":55}],28:[function(require,module,exports){
"use strict";

var Base = require('./Base');
/**** Mapper5 ****/
var Mapper5 = function(nes) {
	Base.apply(this, arguments);
	this.MAPPER_REG = new Array(0x300);
	this.MAPPER_EXRAM = new Array(8);
	this.MAPPER_EXRAM2 = new Array(1024);
	this.MAPPER_EXRAM3 = new Array(1024);

	this.MAPPER_CHR_REG = new Array(2);

	this.MAPPER_IRQ = 0;
	this.MAPPER_IRQ_STATUS = 0;
};

Mapper5.prototype = Object.create(Base.prototype);

Mapper5.prototype.Init = function() {
	this.MAPPER_IRQ = 0;
	this.MAPPER_IRQ_STATUS = 0;

	var i;
	var j;
	for(i=0; i<this.MAPPER_REG.length; i++)
		this.MAPPER_REG[i] = 0;

	for(i=0; i<this.MAPPER_EXRAM.length; i++) {
		this.MAPPER_EXRAM[i] = new Array(8192);
		for(j=0; j<this.MAPPER_EXRAM[i].length; j++)
			this.MAPPER_EXRAM[i][j] = 0x00;
	}

	for(i=0; i<this.MAPPER_EXRAM2.length; i++) {
		this.MAPPER_EXRAM2[i] = 0x00;
	}

	for(i=0; i<this.MAPPER_EXRAM3.length; i++) {
		this.MAPPER_EXRAM3[i] = 0x00;
	}

	for(i=0; i<this.MAPPER_CHR_REG.length; i++) {
		this.MAPPER_CHR_REG[i] = new Array(8);
		for(j=0; j<this.MAPPER_CHR_REG[i].length; j++)
			this.MAPPER_CHR_REG[i][j] = 0x00;
	}

	var tmp = this.nes.PrgRomPageCount * 2 - 1;
	this.nes.SetPrgRomPages8K(tmp, tmp, tmp, tmp);
	tmp = 0;
	this.nes.SetChrRomPages1K(tmp, tmp + 1, tmp + 2, tmp + 3, tmp + 4, tmp + 5, tmp + 6, tmp + 7);
};

Mapper5.prototype.HSync = function(y) {
	if(y < 240) {
		this.MAPPER_IRQ_STATUS |= 0x40;

		if(y === this.MAPPER_REG[0x0203]) {
			this.MAPPER_IRQ_STATUS |= 0x80;
		}
		if ((this.MAPPER_IRQ_STATUS & 0x80) === 0x80 && (this.MAPPER_REG[0x0204] & 0x80) === 0x80) {
			this.SetIRQ();
		}
	} else {
		this.MAPPER_IRQ_STATUS &= 0xBF;
	}
};

Mapper5.prototype.ReadLow = function(address) {
	if(address >= 0x5C00) {
		return this.MAPPER_EXRAM2[address - 0x5C00];
	}

	if (address === 0x5204) {
		var ret = this.MAPPER_IRQ_STATUS;
		this.MAPPER_IRQ_STATUS &= 0x7F;
		this.ClearIRQ();
		return ret;
	}

	if (address === 0x5205) {
		return (this.MAPPER_REG[0x0205] * this.MAPPER_REG[0x0206]) & 0x00FF;
	}

	if (address === 0x5206) {
		return (this.MAPPER_REG[0x0205] * this.MAPPER_REG[0x0206]) >>> 8;
	}
};

Mapper5.prototype.WriteLow = function(address, data) {
	var i;
	if(address >= 0x5C00) {
		this.MAPPER_EXRAM2[address - 0x5C00] = data;
		return;
	}

	if(address >= 0x5000 && address <= 0x5015) {
		this.MAPPER_REG[address - 0x5000] = data;
		this.nes.Write_MMC5_REG(address - 0x5000, data);
		return;
	}

	if((address >= 0x5100 && address <= 0x5104) ||
	    address === 0x5130 ||
	   (address >= 0x5200 && address <= 0x5206)) {
		this.MAPPER_REG[address - 0x5000] = data;
		return;
	}

	if(address === 0x5105) {
		this.MAPPER_REG[0x0105] = data;
		for(i=0; i<4; i++) {
			switch((data >>> (i * 2)) & 0x03) {
				case 0:
					this.nes.VRAM[8 + i] = this.nes.VRAMS[8];
					break;
				case 1:
					this.nes.VRAM[8 + i] = this.nes.VRAMS[9];
					break;
				case 2:
					this.nes.VRAM[8 + i] = this.MAPPER_EXRAM2;
					break;
				case 3:
					this.nes.VRAM[8 + i] = this.MAPPER_EXRAM3;
					break;
			}
		}
		return;
	}

	if(address === 0x5106) {
		this.MAPPER_REG[0x0106] = data;
		for(i=0; i<30*32; i++)
			this.MAPPER_EXRAM3[i] = data;
		return;
	}

	if(address === 0x5107) {
		this.MAPPER_REG[0x0107] = data;
		for(i=30*32; i<32*32; i++)
			this.MAPPER_EXRAM3[i] = data;
		return;
	}

	if(address === 0x5113) {
		this.MAPPER_REG[0x0113] = data;
		this.nes.SRAM = this.MAPPER_EXRAM[data & 0x07];
		return;
	}

	if(address >= 0x5114 && address <= 0x5117) {
		this.MAPPER_REG[address - 0x5000] = data;
		this.SetPrgRomPages8K_Mapper05(address - 0x5000);
		return;
	}

	if(address >= 0x5120 && address <= 0x5127) {
		this.MAPPER_REG[address - 0x5000] = (this.MAPPER_REG[0x0130] << 8) | data;
		this.SetChrRomPages1K_Mapper05_A();
		return;
	}

	if(address >= 0x5128 && address <= 0x512B) {
		this.MAPPER_REG[address - 0x5000] = (this.MAPPER_REG[0x0130] << 8) | data;
		this.SetChrRomPages1K_Mapper05_B();
		return;
	}
};

Mapper5.prototype.SetChrRomPages1K_Mapper05_A = function (){
	var tmp;
	switch(this.MAPPER_REG[0x0101] & 0x03) {
		case 0:
			tmp = this.MAPPER_REG[0x0127] * 8;
			this.MAPPER_CHR_REG[0][0] = tmp;
			this.MAPPER_CHR_REG[0][1] = tmp + 1;
			this.MAPPER_CHR_REG[0][2] = tmp + 2;
			this.MAPPER_CHR_REG[0][3] = tmp + 3;
			this.MAPPER_CHR_REG[0][4] = tmp + 4;
			this.MAPPER_CHR_REG[0][5] = tmp + 5;
			this.MAPPER_CHR_REG[0][6] = tmp + 6;
			this.MAPPER_CHR_REG[0][7] = tmp + 7;
			break;
		case 1:
			tmp = this.MAPPER_REG[0x0123] * 4;
			this.MAPPER_CHR_REG[0][0] = tmp;
			this.MAPPER_CHR_REG[0][1] = tmp + 1;
			this.MAPPER_CHR_REG[0][2] = tmp + 2;
			this.MAPPER_CHR_REG[0][3] = tmp + 3;

			tmp = this.MAPPER_REG[0x0127] * 4;
			this.MAPPER_CHR_REG[0][4] = tmp;
			this.MAPPER_CHR_REG[0][5] = tmp + 1;
			this.MAPPER_CHR_REG[0][6] = tmp + 2;
			this.MAPPER_CHR_REG[0][7] = tmp + 3;
			break;
		case 2:
			tmp = this.MAPPER_REG[0x0121] * 2;
			this.MAPPER_CHR_REG[0][0] = tmp;
			this.MAPPER_CHR_REG[0][1] = tmp + 1;

			tmp = this.MAPPER_REG[0x0123] * 2;
			this.MAPPER_CHR_REG[0][2] = tmp;
			this.MAPPER_CHR_REG[0][3] = tmp + 1;

			tmp = this.MAPPER_REG[0x0125] * 2;
			this.MAPPER_CHR_REG[0][4] = tmp;
			this.MAPPER_CHR_REG[0][5] = tmp + 1;

			tmp = this.MAPPER_REG[0x0126] * 2;
			this.MAPPER_CHR_REG[0][6] = tmp;
			this.MAPPER_CHR_REG[0][7] = tmp + 1;
			break;
		case 3:
			this.MAPPER_CHR_REG[0][0] = this.MAPPER_REG[0x0120];
			this.MAPPER_CHR_REG[0][1] = this.MAPPER_REG[0x0121];
			this.MAPPER_CHR_REG[0][2] = this.MAPPER_REG[0x0122];
			this.MAPPER_CHR_REG[0][3] = this.MAPPER_REG[0x0123];
			this.MAPPER_CHR_REG[0][4] = this.MAPPER_REG[0x0124];
			this.MAPPER_CHR_REG[0][5] = this.MAPPER_REG[0x0125];
			this.MAPPER_CHR_REG[0][6] = this.MAPPER_REG[0x0126];
			this.MAPPER_CHR_REG[0][7] = this.MAPPER_REG[0x0127];
			break;
	}
};

Mapper5.prototype.SetChrRomPages1K_Mapper05_B = function (){
	var tmp;
	switch(this.MAPPER_REG[0x0101] & 0x03) {
		case 0:
			tmp = this.MAPPER_REG[0x012B] * 8;
			this.MAPPER_CHR_REG[1][0] = tmp;
			this.MAPPER_CHR_REG[1][1] = tmp + 1;
			this.MAPPER_CHR_REG[1][2] = tmp + 2;
			this.MAPPER_CHR_REG[1][3] = tmp + 3;
			this.MAPPER_CHR_REG[1][4] = tmp + 4;
			this.MAPPER_CHR_REG[1][5] = tmp + 5;
			this.MAPPER_CHR_REG[1][6] = tmp + 6;
			this.MAPPER_CHR_REG[1][7] = tmp + 7;
			break;
		case 1:
			tmp = this.MAPPER_REG[0x012B] * 4;
			this.MAPPER_CHR_REG[1][0] = tmp;
			this.MAPPER_CHR_REG[1][1] = tmp + 1;
			this.MAPPER_CHR_REG[1][2] = tmp + 2;
			this.MAPPER_CHR_REG[1][3] = tmp + 3;
			this.MAPPER_CHR_REG[1][4] = tmp;
			this.MAPPER_CHR_REG[1][5] = tmp + 1;
			this.MAPPER_CHR_REG[1][6] = tmp + 2;
			this.MAPPER_CHR_REG[1][7] = tmp + 3;
			break;
		case 2:
			tmp = this.MAPPER_REG[0x0129] * 2;
			this.MAPPER_CHR_REG[1][0] = tmp;
			this.MAPPER_CHR_REG[1][1] = tmp + 1;
			this.MAPPER_CHR_REG[1][4] = tmp;
			this.MAPPER_CHR_REG[1][5] = tmp + 1;

			tmp = this.MAPPER_REG[0x012B] * 2;
			this.MAPPER_CHR_REG[1][2] = tmp;
			this.MAPPER_CHR_REG[1][3] = tmp + 1;
			this.MAPPER_CHR_REG[1][6] = tmp;
			this.MAPPER_CHR_REG[1][7] = tmp + 1;
			break;
		case 3:
			tmp = this.MAPPER_REG[0x0128];
			this.MAPPER_CHR_REG[1][0] = tmp;
			this.MAPPER_CHR_REG[1][4] = tmp;

			tmp = this.MAPPER_REG[0x0129];
			this.MAPPER_CHR_REG[1][1] = tmp;
			this.MAPPER_CHR_REG[1][5] = tmp;

			tmp = this.MAPPER_REG[0x012A];
			this.MAPPER_CHR_REG[1][2] = tmp;
			this.MAPPER_CHR_REG[1][6] = tmp;

			tmp = this.MAPPER_REG[0x012B];
			this.MAPPER_CHR_REG[1][3] = tmp;
			this.MAPPER_CHR_REG[1][7] = tmp;
			break;
	}
};

Mapper5.prototype.SetPrgRomPages8K_Mapper05 = function (no){
	var tmp;
	switch(this.MAPPER_REG[0x0100] & 0x03) {
		case 0x00:
			if(no === 0x0117) {
				tmp = this.MAPPER_REG[0x0117] & 0x7C;
				this.nes.SetPrgRomPage8K(0, tmp);
				this.nes.SetPrgRomPage8K(1, tmp + 1);
				this.nes.SetPrgRomPage8K(2, tmp + 2);
				this.nes.SetPrgRomPage8K(3, tmp + 3);
			}
			break;
		case 0x01:
			if(no === 0x0115) {
				tmp = this.MAPPER_REG[0x0115];
				if((tmp & 0x80) === 0x80) {
					tmp &= 0x7E;
					this.nes.SetPrgRomPage8K(0, tmp);
					this.nes.SetPrgRomPage8K(1, tmp + 1);
				} else {
					this.nes.ROM[0] = this.MAPPER_EXRAM[tmp & 0x07];
					this.nes.ROM[1] = this.MAPPER_EXRAM[(tmp + 1) & 0x07];
				}
			}
			if(no === 0x0117) {
				tmp = this.MAPPER_REG[0x0117] & 0x7E;
				this.nes.SetPrgRomPage8K(2, tmp);
				this.nes.SetPrgRomPage8K(3, tmp + 1);
			}
			break;
		case 0x02:
			if(no === 0x0115) {
				tmp = this.MAPPER_REG[0x0115];
				if((tmp & 0x80) === 0x80) {
					tmp &= 0x7E;
					this.nes.SetPrgRomPage8K(0, tmp);
					this.nes.SetPrgRomPage8K(1, tmp + 1);
				} else {
					this.nes.ROM[0] = this.MAPPER_EXRAM[tmp & 0x07];
					this.nes.ROM[1] = this.MAPPER_EXRAM[(tmp + 1) & 0x07];
				}
			}
			if(no === 0x0116) {
				tmp = this.MAPPER_REG[0x0116];
				if((tmp & 0x80) === 0x80) {
					this.nes.SetPrgRomPage8K(2, tmp & 0x7F);
				} else {
					this.nes.ROM[2] = this.MAPPER_EXRAM[tmp & 0x07];
				}
			}
			if(no === 0x0117)
				this.nes.SetPrgRomPage8K(3, this.MAPPER_REG[0x0117] & 0x7F);
			break;
		case 0x03:
			if(no === 0x0114 || no === 0x0115 || no === 0x0116) {
				tmp = this.MAPPER_REG[no];
				if((tmp & 0x80) === 0x80) {
					this.nes.SetPrgRomPage8K(no - 0x0114, tmp & 0x7F);
				} else {
					this.nes.ROM[no - 0x0114] = this.MAPPER_EXRAM[tmp & 0x07];
				}
			}
			if(no === 0x0117)
				this.nes.SetPrgRomPage8K(3, this.MAPPER_REG[0x0117] & 0x7F);
			break;
	}
};

Mapper5.prototype.BuildBGLine = function () {
	this.nes.SetChrRomPages1K(this.MAPPER_CHR_REG[1][0], this.MAPPER_CHR_REG[1][1], this.MAPPER_CHR_REG[1][2], this.MAPPER_CHR_REG[1][3],
				   this.MAPPER_CHR_REG[1][4], this.MAPPER_CHR_REG[1][5], this.MAPPER_CHR_REG[1][6], this.MAPPER_CHR_REG[1][7]);

	this.nes.BuildBGLine_SUB();

	if((this.MAPPER_REG[0x0200] & 0x80) === 0x80) {
		var chrpage = this.MAPPER_REG[0x0202] * 4;
		this.nes.SetChrRomPage1K(0, chrpage);
		this.nes.SetChrRomPage1K(1, chrpage + 1);
		this.nes.SetChrRomPage1K(2, chrpage + 2);
		this.nes.SetChrRomPage1K(3, chrpage + 3);

		var spilt_index = this.MAPPER_REG[0x0200] & 0x1F;

		var si;
		var ei;
		if((this.MAPPER_REG[0x0200] & 0x40) === 0x00) {
			si = 0;
			ei = spilt_index - 1;
		} else {
			si = spilt_index;
			ei = 31;
		}

		var tmpVRAM = this.nes.VRAM;
		var tmpPaletteArray = this.nes.PaletteArray;
		var tmpSPBitArray = this.nes.SPBitArray;

		var tmpBgLineBuffer = this.nes.BgLineBuffer;
		var nameAddr = 0x0000;
		var tmpy = (this.nes.PpuY + this.MAPPER_REG[0x0201]) % 240;
		nameAddr += (tmpy >>> 3) << 5;
		var iy = tmpy & 0x07;

		for(var i=si; i<=ei; i++) {
			var ptnDist = (this.MAPPER_EXRAM2[nameAddr + i] << 4) + iy;
			var tmpSrcV = tmpVRAM[ptnDist >> 10];
			ptnDist &= 0x03FF;
			var attr = ((this.MAPPER_EXRAM2[((nameAddr & 0x0380) >> 4) | ((nameAddr & 0x001C) >> 2) + 0x03C0] << 2) >> (((nameAddr & 0x0040) >> 4) | (nameAddr & 0x0002))) & 0x0C;
			var ptn = tmpSPBitArray[tmpSrcV[ptnDist]][tmpSrcV[ptnDist + 8]];

			for(var j=0; j<8; j++) {
				tmpBgLineBuffer[i * 8 + j] = tmpPaletteArray[ptn[j] | attr];
			}
		}
	}
};

Mapper5.prototype.BuildSpriteLine = function () {
	this.nes.SetChrRomPages1K(this.MAPPER_CHR_REG[0][0], this.MAPPER_CHR_REG[0][1], this.MAPPER_CHR_REG[0][2], this.MAPPER_CHR_REG[0][3],
				   this.MAPPER_CHR_REG[0][4], this.MAPPER_CHR_REG[0][5], this.MAPPER_CHR_REG[0][6], this.MAPPER_CHR_REG[0][7]);
	this.nes.BuildSpriteLine_SUB();
};

Mapper5.prototype.ReadPPUData = function () {
	this.nes.SetChrRomPages1K(this.MAPPER_CHR_REG[0][0], this.MAPPER_CHR_REG[0][1], this.MAPPER_CHR_REG[0][2], this.MAPPER_CHR_REG[0][3],
				   this.MAPPER_CHR_REG[0][4], this.MAPPER_CHR_REG[0][5], this.MAPPER_CHR_REG[0][6], this.MAPPER_CHR_REG[0][7]);
	return this.nes.ReadPPUData_SUB();
};

Mapper5.prototype.WritePPUData = function (value) {
	this.nes.SetChrRomPages1K(this.MAPPER_CHR_REG[0][0], this.MAPPER_CHR_REG[0][1], this.MAPPER_CHR_REG[0][2], this.MAPPER_CHR_REG[0][3],
				   this.MAPPER_CHR_REG[0][4], this.MAPPER_CHR_REG[0][5], this.MAPPER_CHR_REG[0][6], this.MAPPER_CHR_REG[0][7]);
	this.nes.WritePPUData_SUB(value);
};

Mapper5.prototype.OutEXSound = function(soundin) {
	return (soundin >> 1) + (this.nes.Out_MMC5() >> 1);
};

Mapper5.prototype.EXSoundSync = function(clock) {
	this.nes.Count_MMC5(clock);
};

module.exports = Mapper5;

},{"./Base":55}],29:[function(require,module,exports){
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

},{"./Base":55}],30:[function(require,module,exports){
"use strict";

var Base = require('./Base');
/**** Mapper66 ****/
var Mapper66 = function(nes) {
	Base.apply(this, arguments);
};

Mapper66.prototype = Object.create(Base.prototype);

Mapper66.prototype.Init = function() {
	this.nes.SetPrgRomPage(0, 0);
	this.nes.SetPrgRomPage(1, 1);
	this.nes.SetChrRomPage(0);
};

Mapper66.prototype.Write = function(address, data) {
	var tmp = (data & 0x30) >> 3;
	this.nes.SetPrgRomPage(0, tmp);
	this.nes.SetPrgRomPage(1, tmp + 1);

	this.nes.SetChrRomPage(data & 0x03);
};

module.exports = Mapper66;

},{"./Base":55}],31:[function(require,module,exports){
"use strict";

var Base = require('./Base');
/**** Mapper67 ****/
var Mapper67 = function(nes) {
	Base.apply(this, arguments);
	this.MAPPER_REG = new Array(8);
	this.IRQ_Toggle = 0x00;
};

Mapper67.prototype = Object.create(Base.prototype);

Mapper67.prototype.Init = function() {
	for(var i=0; i<this.MAPPER_REG.length; i++)
		this.MAPPER_REG[i] = 0;

	this.nes.SetPrgRomPages8K(0, 1, this.nes.PrgRomPageCount * 2 - 2, this.nes.PrgRomPageCount * 2 - 1);
	this.nes.SetChrRomPages1K(0, 1, 2, 3, this.nes.ChrRomPageCount * 8 - 4, this.nes.ChrRomPageCount * 8 - 3, this.nes.ChrRomPageCount * 8 - 2, this.nes.ChrRomPageCount * 8 - 1);

	this.IRQ_Toggle = 0x00;
};

Mapper67.prototype.Write = function(address, data) {
	switch (address & 0xF800) {
		case 0x8800:
			this.MAPPER_REG[0] = data;
			this.nes.SetChrRomPage1K(0, data << 1);
			this.nes.SetChrRomPage1K(1, (data << 1) + 1);
			break;
		case 0x9800:
			this.MAPPER_REG[1] = data;
			this.nes.SetChrRomPage1K(2, data << 1);
			this.nes.SetChrRomPage1K(3, (data << 1) + 1);
			break;
		case 0xA800:
			this.MAPPER_REG[2] = data;
			this.nes.SetChrRomPage1K(4, data << 1);
			this.nes.SetChrRomPage1K(5, (data << 1) + 1);
			break;
		case 0xB800:
			this.MAPPER_REG[3] = data;
			this.nes.SetChrRomPage1K(6, data << 1);
			this.nes.SetChrRomPage1K(7, (data << 1) + 1);
			break;
		case 0xC800:
			if(this.IRQ_Toggle === 0x00)
				this.MAPPER_REG[4] = (this.MAPPER_REG[4] & 0x00FF) | (data << 8);
			else
				this.MAPPER_REG[4] = (this.MAPPER_REG[4] & 0xFF00) | data;
			this.IRQ_Toggle ^= 0x01;
			break;
		case 0xD800:
			this.MAPPER_REG[5] = data;
			this.IRQ_Toggle = 0x00;
			this.ClearIRQ();
			break;
		case 0xE800:
			this.MAPPER_REG[6] = data;
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
		case 0xF800:
			this.MAPPER_REG[7] = data;
			this.nes.SetPrgRomPage8K(0, data << 1);
			this.nes.SetPrgRomPage8K(1, (data << 1) + 1);
			break;
	}
};

Mapper67.prototype.CPUSync = function(clock) {
	if((this.MAPPER_REG[5] & 0x10) === 0x10) {
		this.MAPPER_REG[4] -= clock;
		if(this.MAPPER_REG[4] < 0) {
			this.MAPPER_REG[4] = 0xFFFF;
			this.MAPPER_REG[5] &= 0xEF;
			this.SetIRQ();
		}
	}
};

module.exports = Mapper67;

},{"./Base":55}],32:[function(require,module,exports){
"use strict";

var Base = require('./Base');
/**** Mapper68 ****/
var Mapper68 = function(nes) {
	Base.apply(this, arguments);
	this.MAPPER_REG = new Array(8);
};

Mapper68.prototype = Object.create(Base.prototype);

Mapper68.prototype.Init = function() {
	for(var i=0; i<this.MAPPER_REG.length; i++)
		this.MAPPER_REG[i] = 0;

	this.nes.SetPrgRomPages8K(0, 1, this.nes.PrgRomPageCount * 2 - 2, this.nes.PrgRomPageCount * 2 - 1);
	this.nes.SetChrRomPages1K(0, 1, 2, 3, 4, 5, 6, 7);
};

Mapper68.prototype.Write = function(address, data) {
	switch (address & 0xF000) {
		case 0x8000:
			this.MAPPER_REG[0] = data;
			this.nes.SetChrRomPage1K(0, data << 1);
			this.nes.SetChrRomPage1K(1, (data << 1) + 1);
			break;
		case 0x9000:
			this.MAPPER_REG[1] = data;
			this.nes.SetChrRomPage1K(2, data << 1);
			this.nes.SetChrRomPage1K(3, (data << 1) + 1);
			break;
		case 0xA000:
			this.MAPPER_REG[2] = data;
			this.nes.SetChrRomPage1K(4, data << 1);
			this.nes.SetChrRomPage1K(5, (data << 1) + 1);
			break;
		case 0xB000:
			this.MAPPER_REG[3] = data;
			this.nes.SetChrRomPage1K(6, data << 1);
			this.nes.SetChrRomPage1K(7, (data << 1) + 1);
			break;
		case 0xC000:
			this.MAPPER_REG[4] = data;
			this.SetMirror();
			break;
		case 0xD000:
			this.MAPPER_REG[5] = data;
			this.SetMirror();
			break;
		case 0xE000:
			this.MAPPER_REG[6] = data;
			this.SetMirror();
			break;
		case 0xF000:
			this.MAPPER_REG[7] = data;
			this.nes.SetPrgRomPage8K(0, data << 1);
			this.nes.SetPrgRomPage8K(1, (data << 1) + 1);
			break;
	}
};

Mapper68.prototype.SetMirror = function() {
	switch (this.MAPPER_REG[6] & 0x11) {
		case 0x00:
			this.nes.SetMirror(false);
			break;
		case 0x01:
			this.nes.SetMirror(true);
			break;
		case 0x10:
			this.nes.SetChrRomPage1K(8, this.MAPPER_REG[4] | 0x80);
			this.nes.SetChrRomPage1K(9, this.MAPPER_REG[5] | 0x80);
			this.nes.SetChrRomPage1K(10, this.MAPPER_REG[4] | 0x80);
			this.nes.SetChrRomPage1K(11, this.MAPPER_REG[5] | 0x80);
			break;
		case 0x11:
			this.nes.SetChrRomPage1K(8, this.MAPPER_REG[4] | 0x80);
			this.nes.SetChrRomPage1K(9, this.MAPPER_REG[4] | 0x80);
			this.nes.SetChrRomPage1K(10, this.MAPPER_REG[5] | 0x80);
			this.nes.SetChrRomPage1K(11, this.MAPPER_REG[5] | 0x80);
			break;
	}
};

module.exports = Mapper68;

},{"./Base":55}],33:[function(require,module,exports){
"use strict";

var Base = require('./Base');
/**** Mapper69 ****/
var Mapper69 = function(nes) {
	Base.apply(this, arguments);
	this.MAPPER_REG = new Array(16);
	this.MAPPER_REG_Select = 0x00;
	this.R8_ROM = null;
	this.IRQ_Counter = 0;
};

Mapper69.prototype = Object.create(Base.prototype);

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

},{"./Base":55}],34:[function(require,module,exports){
"use strict";

var Base = require('./Base');
/**** Mapper7 ****/
var Mapper7 = function(nes) {
	Base.apply(this, arguments);
};

Mapper7.prototype = Object.create(Base.prototype);

Mapper7.prototype.Init = function() {
	this.nes.SetPrgRomPage(0, 0);
	this.nes.SetPrgRomPage(1, 1);
	this.nes.SetChrRomPage(0);
};

Mapper7.prototype.Write = function(address, data) {
	var tmp = (data & 0x07) << 1;
	this.nes.SetPrgRomPage(0, tmp);
	this.nes.SetPrgRomPage(1, tmp + 1);

	if((data & 0x10) === 0x00)
		this.nes.SetMirrors(0,0,0,0);
	else
		this.nes.SetMirrors(1,1,1,1);
};

module.exports = Mapper7;

},{"./Base":55}],35:[function(require,module,exports){
"use strict";

var Base = require('./Base');
/**** Mapper70 ****/
var Mapper70 = function(nes) {
	Base.apply(this, arguments);
};

Mapper70.prototype = Object.create(Base.prototype);

Mapper70.prototype.Init = function() {
	this.nes.SetPrgRomPage(0, 0);
	this.nes.SetPrgRomPage(1, this.nes.PrgRomPageCount - 1);
	this.nes.SetChrRomPage(0);
};

Mapper70.prototype.Write = function(address, data) {
	this.nes.SetPrgRomPage(0, (data & 0x70)>> 4);
	this.nes.SetChrRomPage(data & 0x0F);

	if((data & 0x80) === 0x00)
		this.nes.SetMirrors(0,0,0,0);
	else
		this.nes.SetMirrors(1,1,1,1);
};

module.exports = Mapper70;

},{"./Base":55}],36:[function(require,module,exports){
"use strict";

var Base = require('./Base');
/**** Mapper72 ****/
var Mapper72 = function(nes) {
	Base.apply(this, arguments);
	this.MAPPER_REG = new Array(1);
};

Mapper72.prototype = Object.create(Base.prototype);

Mapper72.prototype.Init = function() {
	this.MAPPER_REG[0] = 0;

	this.nes.SetPrgRomPages8K(0, 1, this.nes.PrgRomPageCount * 2 - 2, this.nes.PrgRomPageCount * 2 - 1);
	this.nes.SetChrRomPages1K(0, 1, 2, 3, 4, 5, 6, 7);
};

Mapper72.prototype.Write = function(address, data) {
	var tmp;
	if((this.MAPPER_REG[0] & 0xC0) === 0x00) {
		if((data & 0x80) === 0x80) {
			tmp = (data & 0x07) * 2;
			this.nes.SetPrgRomPage8K(0, tmp);
			this.nes.SetPrgRomPage8K(1, tmp + 1);
		}
		if((data & 0x40) === 0x40) {
			tmp = (data & 0x0F) * 8;
			this.nes.SetChrRomPages1K(tmp, tmp + 1, tmp + 2, tmp + 3, tmp + 4, tmp + 5, tmp + 6, tmp + 7);
		}
	}
	this.MAPPER_REG[0] = data;
};

module.exports = Mapper72;

},{"./Base":55}],37:[function(require,module,exports){
"use strict";

var Base = require('./Base');
/**** Mapper73 ****/
var Mapper73 = function(nes) {
	Base.apply(this, arguments);
	this.MAPPER_REG = new Array(3);
};

Mapper73.prototype = Object.create(Base.prototype);

Mapper73.prototype.Init = function() {
	this.nes.SetPrgRomPages8K(0, 1, this.nes.PrgRomPageCount * 2 - 2, this.nes.PrgRomPageCount * 2 - 1);
	this.MAPPER_REG[0] = 0;
	this.MAPPER_REG[1] = 0;
	this.MAPPER_REG[2] = 0;
};

Mapper73.prototype.Write = function(address, data) {
	switch (address) {
		case 0x8000:
			this.MAPPER_REG[0] = (this.MAPPER_REG[0] & 0xFFF0) | (data & 0x0F);
			this.MAPPER_REG[2] = this.MAPPER_REG[0];
			break;

		case 0x9000:
			this.MAPPER_REG[0] = (this.MAPPER_REG[0] & 0xFF0F) | ((data & 0x0F) << 4);
			this.MAPPER_REG[2] = this.MAPPER_REG[0];
			break;

		case 0xA000:
			this.MAPPER_REG[0] = (this.MAPPER_REG[0] & 0xF0FF) | ((data & 0x0F) << 8);
			this.MAPPER_REG[2] = this.MAPPER_REG[0];
			break;

		case 0xB000:
			this.MAPPER_REG[0] = (this.MAPPER_REG[0] & 0x0FFF) | ((data & 0x0F) << 12);
			this.MAPPER_REG[2] = this.MAPPER_REG[0];
			break;

		case 0xC000:
			this.MAPPER_REG[1] = data & 0x07;
			if((this.MAPPER_REG[1] & 0x02) !== 0) {
				this.MAPPER_REG[2] = this.MAPPER_REG[0];
			}
			break;

		case 0xD000:
			if((this.MAPPER_REG[1] & 0x01) !== 0) {
				this.MAPPER_REG[1] |= 0x02;
			} else {
				this.MAPPER_REG[1] &= 0x01;
			}
			this.ClearIRQ();
			break;

		case 0xF000:
			this.nes.SetPrgRomPage8K(0, data * 2);
			this.nes.SetPrgRomPage8K(1, data * 2 + 1);
			break;
	}
};

Mapper73.prototype.CPUSync = function(clock) {
	if((this.MAPPER_REG[1] & 0x02) !== 0) {
		if((this.MAPPER_REG[1] & 0x04) !== 0) {
			this.MAPPER_REG[2] += clock;
			if(this.MAPPER_REG[2] > 0xFF) {
				this.MAPPER_REG[2] = this.MAPPER_REG[0];
				this.SetIRQ();
			}
		} else {
			this.MAPPER_REG[2] += clock;
			if(this.MAPPER_REG[2] > 0xFFFF) {
				this.MAPPER_REG[2] = this.MAPPER_REG[0];
				this.SetIRQ();
			}
		}
	}
};

module.exports = Mapper73;

},{"./Base":55}],38:[function(require,module,exports){
"use strict";

var Base = require('./Base');
/**** Mapper75 ****/
var Mapper75 = function(nes) {
	Base.apply(this, arguments);
	this.MAPPER_REG = new Array(1);
};

Mapper75.prototype = Object.create(Base.prototype);

Mapper75.prototype.Init = function() {
	this.nes.SetPrgRomPages8K(0, 0, 0, this.nes.PrgRomPageCount * 2 - 1);
	this.nes.SetChrRomPages1K(0, 0, 0, 0, 0, 0, 0, 0);
	this.MAPPER_REG[0] = 0x00;
};

Mapper75.prototype.Write = function(address, data) {
	var tmp;
	switch (address) {
		case 0x8000:
			this.nes.SetPrgRomPage8K(0, data & 0x0F);
			break;

		case 0x9000:
			this.MAPPER_REG[0] = data;
			if((data & 0x01) === 0x00)
				this.nes.SetMirror(false);
			else
				this.nes.SetMirror(true);
			break;

		case 0xA000:
			this.nes.SetPrgRomPage8K(1, data & 0x0F);
			break;

		case 0xC000:
			this.nes.SetPrgRomPage8K(2, data & 0x0F);
			break;

		case 0xE000:
			tmp = (((this.MAPPER_REG[0] & 0x02) << 3) | (data & 0x0F)) << 2;
			this.nes.SetChrRomPage1K(0, tmp);
			this.nes.SetChrRomPage1K(1, tmp + 1);
			this.nes.SetChrRomPage1K(2, tmp + 2);
			this.nes.SetChrRomPage1K(3, tmp + 3);
			break;

		case 0xF000:
			tmp = (((this.MAPPER_REG[0] & 0x04) << 2) | (data & 0x0F)) << 2;
			this.nes.SetChrRomPage1K(4, tmp);
			this.nes.SetChrRomPage1K(5, tmp + 1);
			this.nes.SetChrRomPage1K(6, tmp + 2);
			this.nes.SetChrRomPage1K(7, tmp + 3);
			break;
	}
};

module.exports = Mapper75;

},{"./Base":55}],39:[function(require,module,exports){
"use strict";

var Base = require('./Base');
/**** Mapper76 ****/
var Mapper76 = function(nes) {
	Base.apply(this, arguments);
	this.MAPPER_REG = new Array(1);
};

Mapper76.prototype = Object.create(Base.prototype);

Mapper76.prototype.Init = function() {
	this.nes.SetPrgRomPages8K(0, 0, this.nes.PrgRomPageCount * 2 - 2, this.nes.PrgRomPageCount * 2 - 1);
	this.nes.SetChrRomPages1K(0, 0, 0, 0, 0, 0, 0, 0);
	this.MAPPER_REG[0] = 0x00;
};

Mapper76.prototype.Write = function(address, data) {
	if(address === 0x8000)
		this.MAPPER_REG[0] = data & 0x07;

	if(address === 0x8001) {
		switch(this.MAPPER_REG[0]) {
			case 0x02:
				this.nes.SetChrRomPage1K(0, (data & 0x3F) * 2);
				this.nes.SetChrRomPage1K(1, (data & 0x3F) * 2 + 1);
				break;
			case 0x03:
				this.nes.SetChrRomPage1K(2, (data & 0x3F) * 2);
				this.nes.SetChrRomPage1K(3, (data & 0x3F) * 2 + 1);
				break;
			case 0x04:
				this.nes.SetChrRomPage1K(4, (data & 0x3F) * 2);
				this.nes.SetChrRomPage1K(5, (data & 0x3F) * 2 + 1);
				break;
			case 0x05:
				this.nes.SetChrRomPage1K(6, (data & 0x3F) * 2);
				this.nes.SetChrRomPage1K(7, (data & 0x3F) * 2 + 1);
				break;
			case 0x06:
				this.nes.SetPrgRomPage8K(0, data & 0x0F);
				break;
			case 0x07:
				this.nes.SetPrgRomPage8K(1, data & 0x0F);
				break;
		}
	}
};

module.exports = Mapper76;

},{"./Base":55}],40:[function(require,module,exports){
"use strict";

var Base = require('./Base');
/**** Mapper77 ****/
var Mapper77 = function(nes) {
	Base.apply(this, arguments);
};

Mapper77.prototype = Object.create(Base.prototype);

Mapper77.prototype.Init = function() {
	this.nes.SetPrgRomPage(0, 0);
	this.nes.SetPrgRomPage(1, 1);

	this.nes.SetChrRomPage1K(0, 0);
	this.nes.SetChrRomPage1K(1, 1);
	this.nes.SetChrRomPage1K(2, 2 + 0x0100);
	this.nes.SetChrRomPage1K(3, 3 + 0x0100);
	this.nes.SetChrRomPage1K(4, 4 + 0x0100);
	this.nes.SetChrRomPage1K(5, 5 + 0x0100);
	this.nes.SetChrRomPage1K(6, 6 + 0x0100);
	this.nes.SetChrRomPage1K(7, 7 + 0x0100);
};

Mapper77.prototype.Write = function(address, data) {
	var tmp = (data & 0x0F) << 1;
	this.nes.SetPrgRomPage(0, tmp);
	this.nes.SetPrgRomPage(1, tmp + 1);

	tmp = (data & 0xF0) >> 3;
	this.nes.SetChrRomPage1K(0, tmp);
	this.nes.SetChrRomPage1K(1, tmp + 1);
};

module.exports = Mapper77;

},{"./Base":55}],41:[function(require,module,exports){
"use strict";

var Base = require('./Base');
/**** Mapper78 ****/
var Mapper78 = function(nes) {
	Base.apply(this, arguments);
};

Mapper78.prototype = Object.create(Base.prototype);

Mapper78.prototype.Init = function() {
	this.nes.SetPrgRomPage(0, 0);
	this.nes.SetPrgRomPage(1, this.nes.PrgRomPageCount - 1);

	this.nes.SetChrRomPage(0);
};

Mapper78.prototype.Write = function(address, data) {
	this.nes.SetPrgRomPage(0, data & 0x07);
	this.nes.SetChrRomPage(data >> 4);

	if((data & 0x08) === 0x08)
		this.nes.SetMirror(false);
	else
		this.nes.SetMirror(true);
};

module.exports = Mapper78;

},{"./Base":55}],42:[function(require,module,exports){
"use strict";

var Base = require('./Base');
/**** Mapper80 ****/
var Mapper80 = function(nes) {
	Base.apply(this, arguments);
	this.MAPPER_REG = new Array(11);
	this.EX_RAM = new Array(128);
};

Mapper80.prototype = Object.create(Base.prototype);

Mapper80.prototype.Init = function() {
	var i;
	for(i=0; i<this.MAPPER_REG.length; i++)
		this.MAPPER_REG[i] = 0;

	for(i=0; i<this.EX_RAM.length; i++) {
		this.EX_RAM[i] = 0x00;
	}

	this.nes.SetPrgRomPages8K(0, 1, 2, this.nes.PrgRomPageCount * 2 - 1);
	this.nes.SetChrRomPages1K(0, 1, 2, 3, 4, 5, 6, 7);
};

Mapper80.prototype.ReadSRAM = function(address) {
	if(address >= 0x7F00 && address <= 0x7FFF)
		return this.EX_RAM[address & 0x007F];

	switch(address) {
		case 0x7EF0:
			return this.MAPPER_REG[0];
		case 0x7EF1:
			return this.MAPPER_REG[1];
		case 0x7EF2:
			return this.MAPPER_REG[2];
		case 0x7EF3:
			return this.MAPPER_REG[3];
		case 0x7EF4:
			return this.MAPPER_REG[4];
		case 0x7EF5:
			return this.MAPPER_REG[5];
		case 0x7EF6:
		case 0x7EF7:
			return this.MAPPER_REG[6];
		case 0x7EF8:
		case 0x7EF9:
			return this.MAPPER_REG[7];
		case 0x7EFA:
		case 0x7EFB:
			return this.MAPPER_REG[8];
		case 0x7EFC:
		case 0x7EFD:
			return this.MAPPER_REG[9];
		case 0x7EFE:
		case 0x7EFF:
			return this.MAPPER_REG[10];
	}

	return 0x00;
};

Mapper80.prototype.WriteSRAM = function(address, data) {
	if(address >= 0x7F00 && address <= 0x7FFF) {
		this.EX_RAM[address & 0x007F] = data;
		return;
	}

	switch(address) {
		case 0x7EF0:
			this.MAPPER_REG[0] = data;
			this.nes.SetChrRomPage1K(0, data & 0xFE);
			this.nes.SetChrRomPage1K(1, (data & 0xFE) + 1);
			break;
		case 0x7EF1:
			this.MAPPER_REG[1] = data;
			this.nes.SetChrRomPage1K(2, data & 0xFE);
			this.nes.SetChrRomPage1K(3, (data & 0xFE) + 1);
			break;
		case 0x7EF2:
			this.MAPPER_REG[2] = data;
			this.nes.SetChrRomPage1K(4, data);
			break;
		case 0x7EF3:
			this.MAPPER_REG[3] = data;
			this.nes.SetChrRomPage1K(5, data);
			break;
		case 0x7EF4:
			this.MAPPER_REG[4] = data;
			this.nes.SetChrRomPage1K(6, data);
			break;
		case 0x7EF5:
			this.MAPPER_REG[5] = data;
			this.nes.SetChrRomPage1K(7, data);
			break;
		case 0x7EF6:
		case 0x7EF7:
			this.MAPPER_REG[6] = data;
			if((data & 0x01) === 0x01)
				this.nes.SetMirror(false);
			else
				this.nes.SetMirror(true);
			break;
		case 0x7EF8:
		case 0x7EF9:
			this.MAPPER_REG[7] = data;
			break;
		case 0x7EFA:
		case 0x7EFB:
			this.MAPPER_REG[8] = data;
			this.nes.SetPrgRomPage8K(0, data);
			break;
		case 0x7EFC:
		case 0x7EFD:
			this.MAPPER_REG[9] = data;
			this.nes.SetPrgRomPage8K(1, data);
			break;
		case 0x7EFE:
		case 0x7EFF:
			this.MAPPER_REG[10] = data;
			this.nes.SetPrgRomPage8K(2, data);
			break;
	}
};

module.exports = Mapper80;

},{"./Base":55}],43:[function(require,module,exports){
"use strict";

var Base = require('./Base');
/**** Mapper82 ****/
var Mapper82 = function(nes) {
	Base.apply(this, arguments);
	this.MAPPER_REG = new Array(13);
	this.EX_RAM = new Array(0x1400);
};

Mapper82.prototype = Object.create(Base.prototype);

Mapper82.prototype.Init = function() {
	var i;
	for(i=0; i<this.MAPPER_REG.length; i++)
		this.MAPPER_REG[i] = 0;

	for(i=0; i<this.EX_RAM.length; i++) {
		this.EX_RAM[i] = 0x00;
	}

	this.nes.SetPrgRomPages8K(0, 1, 2, this.nes.PrgRomPageCount * 2 - 1);
	this.nes.SetChrRomPages1K(0, 1, 2, 3, 4, 5, 6, 7);
};

Mapper82.prototype.ReadSRAM = function(address) {
	if(address >= 0x6000 && address <= 0x73FF)
		return this.EX_RAM[address - 0x6000];

	if(address >= 0x7EF0 && address <= 0x7EFC)
		return this.MAPPER_REG[address - 0x7EF0];
};

Mapper82.prototype.WriteSRAM = function(address, data) {
	if(address >= 0x6000 && address <= 0x73FF) {
		this.EX_RAM[address - 0x6000] = data;
		return;
	}

	switch(address) {
		case 0x7EF0:
			this.MAPPER_REG[0] = data;
			this.SetChr();
			break;
		case 0x7EF1:
			this.MAPPER_REG[1] = data;
			this.SetChr();
			break;
		case 0x7EF2:
			this.MAPPER_REG[2] = data;
			this.SetChr();
			break;
		case 0x7EF3:
			this.MAPPER_REG[3] = data;
			this.SetChr();
			break;
		case 0x7EF4:
			this.MAPPER_REG[4] = data;
			this.SetChr();
			break;
		case 0x7EF5:
			this.MAPPER_REG[5] = data;
			this.SetChr();
			break;
		case 0x7EF6:
			this.MAPPER_REG[6] = data;
			this.SetChr();
			if((data & 0x01) === 0x01)
				this.nes.SetMirror(false);
			else
				this.nes.SetMirror(true);
			break;
		case 0x7EF7:
			this.MAPPER_REG[7] = data;
			break;
		case 0x7EF8:
			this.MAPPER_REG[8] = data;
			break;
		case 0x7EF9:
			this.MAPPER_REG[9] = data;
			break;
		case 0x7EFA:
			this.MAPPER_REG[10] = data;
			this.nes.SetPrgRomPage8K(0, data >>> 2);
			break;
		case 0x7EFB:
			this.MAPPER_REG[11] = data;
			this.nes.SetPrgRomPage8K(1, data >>> 2);
			break;
		case 0x7EFC:
			this.MAPPER_REG[12] = data;
			this.nes.SetPrgRomPage8K(2, data >>> 2);
			break;
	}
};

Mapper82.prototype.SetChr = function() {
	if((this.MAPPER_REG[6] & 0x02) === 0x00) {
		this.nes.SetChrRomPage1K(0, this.MAPPER_REG[0] & 0xFE);
		this.nes.SetChrRomPage1K(1, (this.MAPPER_REG[0] & 0xFE) + 1);
		this.nes.SetChrRomPage1K(2, this.MAPPER_REG[1] & 0xFE);
		this.nes.SetChrRomPage1K(3, (this.MAPPER_REG[1] & 0xFE) + 1);
		this.nes.SetChrRomPage1K(4, this.MAPPER_REG[2]);
		this.nes.SetChrRomPage1K(5, this.MAPPER_REG[3]);
		this.nes.SetChrRomPage1K(6, this.MAPPER_REG[4]);
		this.nes.SetChrRomPage1K(7, this.MAPPER_REG[5]);
	} else {
		this.nes.SetChrRomPage1K(4, this.MAPPER_REG[0] & 0xFE);
		this.nes.SetChrRomPage1K(5, (this.MAPPER_REG[0] & 0xFE) + 1);
		this.nes.SetChrRomPage1K(6, this.MAPPER_REG[1] & 0xFE);
		this.nes.SetChrRomPage1K(7, (this.MAPPER_REG[1] & 0xFE) + 1);
		this.nes.SetChrRomPage1K(0, this.MAPPER_REG[2]);
		this.nes.SetChrRomPage1K(1, this.MAPPER_REG[3]);
		this.nes.SetChrRomPage1K(2, this.MAPPER_REG[4]);
		this.nes.SetChrRomPage1K(3, this.MAPPER_REG[5]);
	}
};

module.exports = Mapper82;

},{"./Base":55}],44:[function(require,module,exports){
"use strict";

var Base = require('./Base');
/**** Mapper85 ****/
var Mapper85 = function(nes) {
	Base.apply(this, arguments);
	this.MAPPER_REG = new Array(15);
	this.MAPPER_EXVRAM = new Array(8);
};

Mapper85.prototype = Object.create(Base.prototype);

Mapper85.prototype.Init = function() {
	var i;
	for(i=0; i<this.MAPPER_REG.length; i++)
		this.MAPPER_REG[i] = 0;

	for(i=0; i<this.MAPPER_EXVRAM.length; i++) {
		this.MAPPER_EXVRAM[i] = new Array(1024);
		for(var j=0; j<this.MAPPER_EXVRAM[i].length; j++)
			this.MAPPER_EXVRAM[i][j] = 0x00;
	}

	this.nes.SetPrgRomPages8K(0, 1, 2, this.nes.PrgRomPageCount * 2 - 1);

	if(this.nes.ChrRomPageCount === 0) {
		this.nes.VRAM[0] = this.MAPPER_EXVRAM[0];
		this.nes.VRAM[1] = this.MAPPER_EXVRAM[0];
		this.nes.VRAM[2] = this.MAPPER_EXVRAM[0];
		this.nes.VRAM[3] = this.MAPPER_EXVRAM[0];
		this.nes.VRAM[4] = this.MAPPER_EXVRAM[0];
		this.nes.VRAM[5] = this.MAPPER_EXVRAM[0];
		this.nes.VRAM[6] = this.MAPPER_EXVRAM[0];
		this.nes.VRAM[7] = this.MAPPER_EXVRAM[0];
	} else
		this.nes.SetChrRomPages1K(0, 1, 2, 3, 4, 5, 6, 7);

};

Mapper85.prototype.Write = function(address, data) {
	switch(address & 0xF038) {
		case 0x8000:
			this.MAPPER_REG[0] = data;
			this.nes.SetPrgRomPage8K(0, data);
			break;
		case 0x8008:
		case 0x8010:
			this.MAPPER_REG[1] = data;
			this.nes.SetPrgRomPage8K(1, data);
			break;
		case 0x9000:
			this.MAPPER_REG[2] = data;
			this.nes.SetPrgRomPage8K(2, data);
			break;

		case 0xA000:
			this.MAPPER_REG[3] = data;
			if(this.nes.ChrRomPageCount === 0)
				this.nes.VRAM[0] = this.MAPPER_EXVRAM[data];// & 0x07];
			else
				this.nes.SetChrRomPage1K(0, data);
			break;
		case 0xA008:
		case 0xA010:
			this.MAPPER_REG[4] = data;
			if(this.nes.ChrRomPageCount === 0)
				this.nes.VRAM[1] = this.MAPPER_EXVRAM[data];// & 0x07];
			else
				this.nes.SetChrRomPage1K(1, data);
			break;
		case 0xB000:
			this.MAPPER_REG[5] = data;
			if(this.nes.ChrRomPageCount === 0)
				this.nes.VRAM[2] = this.MAPPER_EXVRAM[data];// & 0x07];
			else
				this.nes.SetChrRomPage1K(2, data);
			break;
		case 0xB008:
		case 0xB010:
			this.MAPPER_REG[6] = data;
			if(this.nes.ChrRomPageCount === 0)
				this.nes.VRAM[3] = this.MAPPER_EXVRAM[data];// & 0x07];
			else
				this.nes.SetChrRomPage1K(3, data);
			break;
		case 0xC000:
			this.MAPPER_REG[7] = data;
			if(this.nes.ChrRomPageCount === 0)
				this.nes.VRAM[4] = this.MAPPER_EXVRAM[data];// & 0x07];
			else
				this.nes.SetChrRomPage1K(4, data);
			break;
		case 0xC008:
		case 0xC010:
			this.MAPPER_REG[8] = data;
			if(this.nes.ChrRomPageCount === 0)
				this.nes.VRAM[5] = this.MAPPER_EXVRAM[data];// & 0x07];
			else
				this.nes.SetChrRomPage1K(5, data);
			break;
		case 0xD000:
			this.MAPPER_REG[9] = data;
			if(this.nes.ChrRomPageCount === 0)
				this.nes.VRAM[6] = this.MAPPER_EXVRAM[data];// & 0x07];
			else
				this.nes.SetChrRomPage1K(6, data);
			break;
		case 0xD008:
		case 0xD010:
			this.MAPPER_REG[10] = data;
			if(this.nes.ChrRomPageCount === 0)
				this.nes.VRAM[7] = this.MAPPER_EXVRAM[data];// & 0x07];
			else
				this.nes.SetChrRomPage1K(7, data);
			break;

		case 0xE000:
			this.MAPPER_REG[14] = data;
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

		case 0xE008:
		case 0xE010:
			this.MAPPER_REG[13] = data;
			break;

		case 0xF000:
			this.MAPPER_REG[11] = data & 0x07;
			if((this.MAPPER_REG[11] & 0x02) !== 0) {
				this.MAPPER_REG[12] = this.MAPPER_REG[13];
			}
			break;
		case 0xF008:
		case 0xF010:
			if((this.MAPPER_REG[11] & 0x01) !== 0) {
				this.MAPPER_REG[11] |= 0x02;
			} else {
				this.MAPPER_REG[11] &= 0x01;
			}
			this.ClearIRQ();
			break;
	}
};

Mapper85.prototype.HSync = function(y) {
	if((this.MAPPER_REG[11] & 0x06) === 0x02) {
		if(this.MAPPER_REG[12] === 0xFF) {
			this.MAPPER_REG[12] = this.MAPPER_REG[13];
			this.SetIRQ();
		} else
			this.MAPPER_REG[12]++;
	}
};

Mapper85.prototype.CPUSync = function(clock) {
	if((this.MAPPER_REG[11] & 0x06) === 0x06) {
		if(this.MAPPER_REG[12] >= 0xFF) {
			this.MAPPER_REG[12] = this.MAPPER_REG[13];
			this.SetIRQ();
		} else
			this.MAPPER_REG[12] += clock;
	}
};

module.exports = Mapper85;

},{"./Base":55}],45:[function(require,module,exports){
"use strict";

var Base = require('./Base');
/**** Mapper86 ****/
var Mapper86 = function(nes) {
	Base.apply(this, arguments);
};

Mapper86.prototype = Object.create(Base.prototype);

Mapper86.prototype.Init = function() {
	this.nes.SetPrgRomPages8K(this.nes.PrgRomPageCount * 2 - 4, this.nes.PrgRomPageCount * 2 - 3, this.nes.PrgRomPageCount * 2 - 2, this.nes.PrgRomPageCount * 2 - 1);
	this.nes.SetChrRomPages1K(0, 1, 2, 3, 4, 5, 6, 7);
};

Mapper86.prototype.WriteSRAM = function(address, data) {
	if(address >= 0x6000 && address < 0x6FFF) {
		var prg = ((data & 0x30) >>> 4) << 2;
		var chr = (((data & 0x40) >>> 4) | (data & 0x03)) << 3;
		this.nes.SetPrgRomPages8K(prg, prg + 1, prg + 2, prg + 3);
		this.nes.SetChrRomPages1K(chr, chr + 1, chr + 2, chr + 3, chr + 4, chr + 5, chr + 6, chr + 7);
	}
};

module.exports = Mapper86;

},{"./Base":55}],46:[function(require,module,exports){
"use strict";

var Base = require('./Base');
/**** Mapper87 ****/
var Mapper87 = function(nes) {
	Base.apply(this, arguments);
};

Mapper87.prototype = Object.create(Base.prototype);

Mapper87.prototype.Init = function() {
	this.nes.SetPrgRomPage(0, 0);
	this.nes.SetPrgRomPage(1, this.nes.PrgRomPageCount - 1);
	this.nes.SetChrRomPage(0);
};

Mapper87.prototype.WriteSRAM = function(address, data) {
	var chr = ((data & 0x02) >>> 1) | ((data & 0x01) << 1);
	this.nes.SetChrRomPage(chr);
};

module.exports = Mapper87;

},{"./Base":55}],47:[function(require,module,exports){
"use strict";

var Base = require('./Base');
/**** Mapper88 ****/
var Mapper88 = function(nes) {
	Base.apply(this, arguments);
	this.MAPPER_REG = new Array(1);
};

Mapper88.prototype = Object.create(Base.prototype);

Mapper88.prototype.Init = function() {
	this.nes.SetPrgRomPages8K(0, 0, this.nes.PrgRomPageCount * 2 - 2, this.nes.PrgRomPageCount * 2 - 1);
	this.nes.SetChrRomPages1K(0, 0, 0, 0, 0, 0, 0, 0);
	this.MAPPER_REG[0] = 0x00;
};

Mapper88.prototype.Write = function(address, data) {
	if(address === 0x8000)
		this.MAPPER_REG[0] = data & 0x07;

	if(address === 0x8001) {
		switch(this.MAPPER_REG[0]) {
			case 0x00:
				this.nes.SetChrRomPage1K(0, data & 0x3E);
				this.nes.SetChrRomPage1K(1, (data & 0x3E) + 1);
				break;
			case 0x01:
				this.nes.SetChrRomPage1K(2, data & 0x3E);
				this.nes.SetChrRomPage1K(3, (data & 0x3E) + 1);
				break;
			case 0x02:
				this.nes.SetChrRomPage1K(4, (data & 0x3F) | 0x40);
				break;
			case 0x03:
				this.nes.SetChrRomPage1K(5, (data & 0x3F) | 0x40);
				break;
			case 0x04:
				this.nes.SetChrRomPage1K(6, (data & 0x3F) | 0x40);
				break;
			case 0x05:
				this.nes.SetChrRomPage1K(7, (data & 0x3F) | 0x40);
				break;
			case 0x06:
				this.nes.SetPrgRomPage8K(0, data & 0x0F);
				break;
			case 0x07:
				this.nes.SetPrgRomPage8K(1, data & 0x0F);
				break;
		}
	}
};

module.exports = Mapper88;

},{"./Base":55}],48:[function(require,module,exports){
"use strict";

var Base = require('./Base');
/**** Mapper89 ****/
var Mapper89 = function(nes) {
	Base.apply(this, arguments);
};

Mapper89.prototype = Object.create(Base.prototype);

Mapper89.prototype.Init = function() {
	this.nes.SetPrgRomPage(0, 0);
	this.nes.SetPrgRomPage(1, this.nes.PrgRomPageCount - 1);

	this.nes.SetChrRomPage(0);
};

Mapper89.prototype.Write = function(address, data) {
	this.nes.SetPrgRomPage(0, (data & 0x70) >> 4);
	this.nes.SetChrRomPage(((data & 0x80) >> 4) | (data & 0x07));

	if((data & 0x08) === 0x00)
		this.nes.SetMirrors(0, 0, 0, 0);
	else
		this.nes.SetMirrors(1, 1, 1, 1);
};

module.exports = Mapper89;

},{"./Base":55}],49:[function(require,module,exports){
"use strict";

var Base = require('./Base');
/**** Mapper9 ****/
var Mapper9 = function(nes) {//<--
	Base.apply(this, arguments);
	//this.MAPPER_REG = new Array(6);
	this.MAPPER_REG = new Array(4);
	this.MAPPER_Latch0 = true;
	this.MAPPER_Latch1 = true;
};

Mapper9.prototype = Object.create(Base.prototype);

Mapper9.prototype.Init = function() {
	this.nes.SetPrgRomPages8K(0, this.nes.PrgRomPageCount * 2 - 3, this.nes.PrgRomPageCount * 2 - 2, this.nes.PrgRomPageCount * 2 - 1);
	this.nes.SetChrRomPages1K(0, 0, 0, 0, 0, 0, 0, 0);
	for(var i=0; i<this.MAPPER_REG.length; i++)
		this.MAPPER_REG[i] = 0x00;
	this.MAPPER_Latch0 = true;
	this.MAPPER_Latch1 = true;
	//this.MAPPER_REG[4] = true;
	//this.MAPPER_REG[5] = true;
};

Mapper9.prototype.Write = function(address, data) {
	switch(address & 0xF000) {
		case 0xA000:
			this.nes.SetPrgRomPage8K(0, data);
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

Mapper9.prototype.BuildBGLine = function () {
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

Mapper9.prototype.SetLatch = function (addr) {
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

Mapper9.prototype.SetChrRom = function (addr) {
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

Mapper9.prototype.BuildSpriteLine = function () {
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

Mapper9.prototype.GetState = function() {
	this.nes.StateData.Mapper = {};
	this.nes.StateData.Mapper.MAPPER_REG = this.MAPPER_REG.slice(0);

	this.nes.StateData.Mapper.MAPPER_Latch0 = this.MAPPER_Latch0;
	this.nes.StateData.Mapper.MAPPER_Latch1 = this.MAPPER_Latch1;
};

Mapper9.prototype.SetState = function() {
	for(var i=0; i<this.nes.StateData.Mapper.MAPPER_REG.length; i++)
		this.MAPPER_REG[i] = this.nes.StateData.Mapper.MAPPER_REG[i];

	this.MAPPER_Latch0 = this.nes.StateData.Mapper.MAPPER_Latch0;
	this.MAPPER_Latch1 = this.nes.StateData.Mapper.MAPPER_Latch1;
};

module.exports = Mapper9;

},{"./Base":55}],50:[function(require,module,exports){
"use strict";

var Base = require('./Base');
/**** Mapper92 ****/
var Mapper92 = function(nes) {
	Base.apply(this, arguments);
};

Mapper92.prototype = Object.create(Base.prototype);

Mapper92.prototype.Init = function() {

	this.nes.SetPrgRomPages8K(0, 1, this.nes.PrgRomPageCount * 2 - 2, this.nes.PrgRomPageCount * 2 - 1);
	this.nes.SetChrRomPages1K(0, 1, 2, 3, 4, 5, 6, 7);
};

Mapper92.prototype.Write = function(address, data) {
	var prg = (address & 0x0F) << 1;
	var chr = (address & 0x0F) << 3;
	if(address >= 0x9000) {
		if((address & 0xF0) === 0xD0) {
			this.nes.SetPrgRomPages8K(0, 1, prg, prg + 1);
		} else if((address & 0xF0) === 0xE0) {
			this.nes.SetChrRomPages1K(chr, chr + 1, chr + 2, chr + 3, chr + 4, chr + 5, chr + 6, chr + 7);
		}
	} else {
		if((address & 0xF0) === 0xB0) {
			this.nes.SetPrgRomPages8K(0, 1, prg, prg + 1);
		} else if((address & 0xF0) === 0x70) {
			this.nes.SetChrRomPages1K(chr, chr + 1, chr + 2, chr + 3, chr + 4, chr + 5, chr + 6, chr + 7);
		}
	}
};

module.exports = Mapper92;

},{"./Base":55}],51:[function(require,module,exports){
"use strict";

var Base = require('./Base');
/**** Mapper93 ****/
var Mapper93 = function(nes) {
	Base.apply(this, arguments);
};

Mapper93.prototype = Object.create(Base.prototype);

Mapper93.prototype.Init = function() {
	this.nes.SetPrgRomPages8K(0, 1, this.nes.PrgRomPageCount * 2 - 2, this.nes.PrgRomPageCount * 2 - 1);
	this.nes.SetChrRomPages1K(0, 1, 2, 3, 4, 5, 6, 7);
};

Mapper93.prototype.WriteSRAM = function(address, data) {
	if(address === 0x6000) {
		this.nes.SetPrgRomPage8K(0, data * 2);
		this.nes.SetPrgRomPage8K(1, data * 2 + 1);
	}
};

module.exports = Mapper93;

},{"./Base":55}],52:[function(require,module,exports){
"use strict";

var Base = require('./Base');
/**** Mapper94 ****/
var Mapper94 = function(nes) {
	Base.apply(this, arguments);
};

Mapper94.prototype = Object.create(Base.prototype);

Mapper94.prototype.Init = function() {
	this.nes.SetPrgRomPage(0, 0);
	this.nes.SetPrgRomPage(1, this.nes.PrgRomPageCount - 1);
	this.nes.SetChrRomPage(0);
};

Mapper94.prototype.Write = function(address, data) {
	this.nes.SetPrgRomPage(0, data >> 2);
};

module.exports = Mapper94;

},{"./Base":55}],53:[function(require,module,exports){
"use strict";

var Base = require('./Base');
/**** Mapper95 ****/
var Mapper95 = function(nes) {
	Base.apply(this, arguments);
	this.MAPPER_REG = new Array(1);
};

Mapper95.prototype = Object.create(Base.prototype);

Mapper95.prototype.Init = function() {
	this.nes.SetPrgRomPages8K(0, 0, this.nes.PrgRomPageCount * 2 - 2, this.nes.PrgRomPageCount * 2 - 1);
	this.nes.SetChrRomPages1K(0, 0, 0, 0, 0, 0, 0, 0);
	this.MAPPER_REG[0] = 0x00;
};

Mapper95.prototype.Write = function(address, data) {
	if((address & 0x0001) === 0x0000)
		this.MAPPER_REG[0] = data & 0x07;

	if((address & 0x0001) === 0x0001) {
		if(this.MAPPER_REG[0] <= 0x05) {
			if((data & 0x20) === 0x20)
				this.nes.SetMirrors(1, 1, 1, 1);
			else
				this.nes.SetMirrors(0, 0, 0, 0);
		}

		switch(this.MAPPER_REG[0]) {
			case 0x00:
				this.nes.SetChrRomPage1K(0, data & 0x1E);
				this.nes.SetChrRomPage1K(1, (data & 0x1E) + 1);
				break;
			case 0x01:
				this.nes.SetChrRomPage1K(2, data & 0x1E);
				this.nes.SetChrRomPage1K(3, (data & 0x1E) + 1);
				break;
			case 0x02:
				this.nes.SetChrRomPage1K(4, data & 0x1F);
				break;
			case 0x03:
				this.nes.SetChrRomPage1K(5, data & 0x1F);
				break;
			case 0x04:
				this.nes.SetChrRomPage1K(6, data & 0x1F);
				break;
			case 0x05:
				this.nes.SetChrRomPage1K(7, data & 0x1F);
				break;
			case 0x06:
				this.nes.SetPrgRomPage8K(0, data & 0x0F);
				break;
			case 0x07:
				this.nes.SetPrgRomPage8K(1, data & 0x0F);
				break;
		}
	}
};

module.exports = Mapper95;

},{"./Base":55}],54:[function(require,module,exports){
"use strict";

var Base = require('./Base');
/**** Mapper97 ****/
var Mapper97 = function(nes) {
	Base.apply(this, arguments);
};

Mapper97.prototype = Object.create(Base.prototype);

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

},{"./Base":55}],55:[function(require,module,exports){
"use strict";

var Base = function(nes) {
	this.nes = nes;
	this.MAPPER_REG = null;
};

Base.prototype.Init = function() {
};

Base.prototype.ReadLow = function(address) {
	return 0x40;
};

Base.prototype.WriteLow = function(address, data) {
};

Base.prototype.ReadPPUData = function () {
	return this.nes.ReadPPUData_SUB();
};

Base.prototype.WritePPUData = function (value) {
	this.nes.WritePPUData_SUB(value);
};

Base.prototype.BuildBGLine = function () {
	this.nes.BuildBGLine_SUB();
};

Base.prototype.BuildSpriteLine = function () {
	this.nes.BuildSpriteLine_SUB();
};

// セーブ用RAM読み込み
Base.prototype.ReadSRAM = function(address) {
	return this.nes.SRAM[address & 0x1FFF];
};
// セーブ用RAM書き込み
Base.prototype.WriteSRAM = function(address, data) {
	this.nes.SRAM[address & 0x1FFF] = data;
};

Base.prototype.Write = function(address, data) {
};

Base.prototype.HSync = function(y) {
};

Base.prototype.CPUSync = function(clock) {
};

Base.prototype.SetIRQ = function() {
	this.nes.toIRQ |= 0x04;
};

Base.prototype.ClearIRQ = function() {
	this.nes.toIRQ &= ~0x04;
};

Base.prototype.OutEXSound = function(soundin) {
	return soundin;
};

Base.prototype.EXSoundSync = function(clock) {
};

Base.prototype.GetState = function() {
	if(this.MAPPER_REG === null)
		return;

	this.nes.StateData.Mapper = {};
	this.nes.StateData.Mapper.MAPPER_REG = this.MAPPER_REG.slice(0);
};

Base.prototype.SetState = function() {
	if(this.MAPPER_REG === null)
		return;

	for(var i=0; i<this.nes.StateData.Mapper.MAPPER_REG.length; i++)
		this.MAPPER_REG[i] = this.nes.StateData.Mapper.MAPPER_REG[i];
};


module.exports = Base;

},{}],56:[function(require,module,exports){
"use strict";

/* **************************************************************** */
/* Mapper
/* **************************************************************** */

var Mapper0   = require('./Mapper/0');
var Mapper1   = require('./Mapper/1');
var Mapper10  = require('./Mapper/10');
var Mapper101 = require('./Mapper/101');
var Mapper118 = require('./Mapper/118');
var Mapper119 = require('./Mapper/119');
var Mapper140 = require('./Mapper/140');
var Mapper152 = require('./Mapper/152');
var Mapper16  = require('./Mapper/16');
var Mapper18  = require('./Mapper/18');
var Mapper180 = require('./Mapper/180');
var Mapper184 = require('./Mapper/184');
var Mapper185 = require('./Mapper/185');
var Mapper19  = require('./Mapper/19');
var Mapper2   = require('./Mapper/2');
var Mapper207 = require('./Mapper/207');
var Mapper22  = require('./Mapper/22');
var Mapper23  = require('./Mapper/23');
var Mapper24  = require('./Mapper/24');
var Mapper25  = require('./Mapper/25');
var Mapper26  = require('./Mapper/26');
var Mapper3   = require('./Mapper/3');
var Mapper32  = require('./Mapper/32');
var Mapper33  = require('./Mapper/33');
var Mapper34  = require('./Mapper/34');
var Mapper4   = require('./Mapper/4');
var Mapper48  = require('./Mapper/48');
var Mapper5   = require('./Mapper/5');
var Mapper65  = require('./Mapper/65');
var Mapper66  = require('./Mapper/66');
var Mapper67  = require('./Mapper/67');
var Mapper68  = require('./Mapper/68');
var Mapper69  = require('./Mapper/69');
var Mapper7   = require('./Mapper/7');
var Mapper70  = require('./Mapper/70');
var Mapper72  = require('./Mapper/72');
var Mapper73  = require('./Mapper/73');
var Mapper75  = require('./Mapper/75');
var Mapper76  = require('./Mapper/76');
var Mapper77  = require('./Mapper/77');
var Mapper78  = require('./Mapper/78');
var Mapper80  = require('./Mapper/80');
var Mapper82  = require('./Mapper/82');
var Mapper85  = require('./Mapper/85');
var Mapper86  = require('./Mapper/86');
var Mapper87  = require('./Mapper/87');
var Mapper88  = require('./Mapper/88');
var Mapper89  = require('./Mapper/89');
var Mapper9   = require('./Mapper/9');
var Mapper92  = require('./Mapper/92');
var Mapper93  = require('./Mapper/93');
var Mapper94  = require('./Mapper/94');
var Mapper95  = require('./Mapper/95');
var Mapper97  = require('./Mapper/97');

/* **************************************************************** */
/* コンストラクタ
/* **************************************************************** */

var NES = function(canvas) {
	// requestAnimationFrame 対応ブラウザのみ遊べます
	if(typeof window.requestAnimationFrame === "undefined") {
		window.alert('use a brower that supports requestAnimationFrame method');
		return;
	}

	// window.requestAnimationFrame() の呼び出しによって返された ID 値
	this.requestID = null;

	//////////////////////////////////////////////////////////////////
	// NES CPU
	//////////////////////////////////////////////////////////////////

	// レジスタ
	this.A = 0;
	this.X = 0;
	this.Y = 0;
	this.S = 0;
	this.P = 0;
	this.PC = 0;

	// 割り込み
	this.toNMI = false;
	this.toIRQ = 0x00;
	this.CPUClock = 0;

	//TODO: 削除
	//this.HalfCarry = false;

	//TODO: 削除
	// ゼロフラグ、ネガティブフラグを
	// 簡単にセットするためのキャッシュテーブル
	//   0..127 -> 0b00000000
	// 128..256 -> 0b10000000
	this.ZNCacheTable = new Array(256);
	this.ZNCacheTable[0] = 0x02; // 0b0010
	var i;
	for(i=1; i<256; i++) {
		this.ZNCacheTable[i] = i & 0x80; // 0x80 = 0b10000000
	}

	//   0..127 -> 0b00000001
	// 128..255 -> 0b10000001
	// 256..383 -> 0b00000000
	// 384..512 -> 0b10000000
	this.ZNCacheTableCMP = new Array(512);
	for(i=0; i<256; i++) {
		this.ZNCacheTableCMP[i] = this.ZNCacheTable[i] | 0x01;
		this.ZNCacheTableCMP[i + 256] = this.ZNCacheTable[i];
	}

	//////////////////////////////////////////////////////////////////
	// NES PPU
	//////////////////////////////////////////////////////////////////

	// PPUSCROLLレジスタは2回書き込む。1度目の書き込みかどうか
	this.ScrollRegisterFlag = false;
	// PPUADDRレジスタは2回書き込む。1度目の書き込みかどうか
	this.PPUAddressRegisterFlag = false;
	// TODO: 調べる
	this.HScrollTmp = 0;
	this.PPUAddress = 0;
	this.PPUAddressBuffer = 0;

	this.Palette = null;

	this.SpriteLineBuffer = null;

	this.PPUReadBuffer = 0;

	this.BgLineBuffer = null;

	this.SPBitArray = new Array(256);
	for(i=0; i<256; i++) {
		this.SPBitArray[i] = new Array(256);
		for(var j=0; j<256; j++) {
			this.SPBitArray[i][j] = new Array(8);
			for(var k=0; k<8; k++)
				this.SPBitArray[i][j][k] = (((i << k) & 0x80) >>> 7) | (((j << k) & 0x80) >>> 6);
		}
	}

	this.PaletteArray = [0x10, 0x01, 0x02, 0x03, 0x10, 0x05, 0x06, 0x07, 0x10, 0x09, 0x0A, 0x0B, 0x10, 0x0D, 0x0E, 0x0F];

	this.PpuX = 0; //クロック
	this.PpuY = 0; //スキャンライン

	// 画面データ
	this.ImageData = null;
	this.DrawFlag = false;
	this.ctx = canvas.getContext("2d");

	this.Sprite0Line = false;

	//////////////////////////////////////////////////////////////////
	// NES Header
	//////////////////////////////////////////////////////////////////

	this.PrgRomPageCount = 0;
	this.ChrRomPageCount = 0;
	this.HMirror = false; // Horizontal mirroring
	this.VMirror = false; // Vertical mirroring
	// TODO: ちゃんとSramEnableをチェックする
	this.SramEnable = false; // Cartridge contains battery-backed PRG RAM ($6000-7FFF) or other persistent memory
	this.TrainerEnable = false;
	this.FourScreen = false;
	this.MapperNumber = -1;

	// NES Mapper
	this.Mapper = null;

	//////////////////////////////////////////////////////////////////
	// NES Storage
	//////////////////////////////////////////////////////////////////

	this.RAM = new Array(0x800);

	// セーブ用RAM
	this.SRAM = new Array(0x2000);

	this.VRAM = new Array(16);

	this.VRAMS = new Array(16);
	for(i=0; i<16; i++)
		this.VRAMS[i] = new Array(0x0400);

	this.SPRITE_RAM = new Array(0x100);

	this.ROM = new Array(4);
	this.PRGROM_STATE = new Array(4);
	this.CHRROM_STATE = new Array(8);

	this.PRGROM_PAGES = null;
	this.CHRROM_PAGES = null;

	// PPU Registers
	// (0x2000 〜 0x2007)
	this.IO1 = new Array(8);
	// APU Registers
	// (0x4000 〜 0x4017)
	this.IO2 = new Array(0x20);

	// NES ROMデータ
	this.Rom = null;

	//////////////////////////////////////////////////////////////////
	// JoyPad
	//////////////////////////////////////////////////////////////////

	this.JoyPadStrobe = false;
	// 押下されたの状態
	this.JoyPadState = [0x00, 0x00];
	this.JoyPadBuffer = [0x00, 0x00];

	//////////////////////////////////////////////////////////////////
	// APU
	//////////////////////////////////////////////////////////////////

	//TODO: APU周りを調べる
	this.MainClock = 1789772.5;
	this.WaveOut = true;
	this.WaveDatas = [];
	this.WaveBaseCount = 0;
	this.WaveSampleRate = 24000;
	this.WaveFrameSequence = 0;
	this.WaveFrameSequenceCounter = 0;
	this.WaveVolume = 0.5;

	this.WaveCh1LengthCounter = 0;
	this.WaveCh1Envelope = 0;
	this.WaveCh1EnvelopeCounter = 0;
	this.WaveCh1Sweep = 0;
	this.WaveCh1Frequency = 0;

	this.WaveCh2LengthCounter = 0;
	this.WaveCh2Envelope = 0;
	this.WaveCh2EnvelopeCounter = 0;
	this.WaveCh2Sweep = 0;
	this.WaveCh2Frequency = 0;

	this.WaveCh3LengthCounter = 0;
	this.WaveCh3LinearCounter = 0;

	this.WaveCh4Angle = -1;
	this.WaveCh4LengthCounter = 0;
	this.WaveCh4Envelope = 0;
	this.WaveCh4EnvelopeCounter = 0;
	this.WaveCh4Register = 0;
	this.WaveCh4BitSequence = 0;
	this.WaveCh4Angle = 0;

	this.WaveCh5Angle = -1;
	this.WaveCh5DeltaCounter = 0;
	this.WaveCh5Register = 0;
	this.WaveCh5SampleAddress = 0;
	this.WaveCh5SampleCounter = 0;

	this.ApuClockCounter = 0;

	this.WaveLengthCount = [
	0x0A, 0xFE, 0x14, 0x02, 0x28, 0x04, 0x50, 0x06,
	0xA0, 0x08, 0x3C, 0x0A, 0x0E, 0x0C, 0x1A, 0x0E,
	0x0C, 0x10, 0x18, 0x12, 0x30, 0x14, 0x60, 0x16,
	0xC0, 0x18, 0x48, 0x1A, 0x10, 0x1C, 0x20, 0x1E];

	this.WaveCh1_2DutyData = [4, 8, 16, 24];

	this.WaveCh3SequenceData = [
	  15,  13,  11,  9,   7,   5,   3,   1,
	  -1,  -3,  -5, -7,  -9, -11, -13, -15,
	 -15, -13, -11, -9,  -7,  -5,  -3,  -1,
	   1,   3,   5,  7,   9,  11,  13,  15];

	this.WaveCh4FrequencyData = [
	0x004, 0x008, 0x010, 0x020,
	0x040, 0x060, 0x080, 0x0A0,
	0x0CA, 0x0FE, 0x17C, 0x1FC,
	0x2FA, 0x3F8, 0x7F2, 0xFE4];

	this.WaveCh5FrequencyData = [
	0x1AC, 0x17C, 0x154, 0x140,
	0x11E, 0x0FE, 0x0E2, 0x0D6,
	0x0BE, 0x0A0, 0x08E, 0x080,
	0x06A, 0x054, 0x048, 0x036];

	this.WebAudioCtx = null;
	this.WebAudioJsNode = null;
	this.WebAudioGainNode = null;
	this.WebAudioBufferSize = 4096;

	this.ApuCpuClockCounter = 0;

	window.AudioContext = window.AudioContext || window.webkitAudioContext;
	this.canAudioContext = typeof window.AudioContext !== "undefined";

	if(this.canAudioContext) {
		this.WebAudioCtx = new window.AudioContext();
		this.WebAudioJsNode = this.WebAudioCtx.createScriptProcessor(this.WebAudioBufferSize, 1, 1);
		this.WebAudioJsNode.onaudioprocess = this.WebAudioFunction.bind(this);
		this.WebAudioGainNode = this.WebAudioCtx.createGain();
		this.WebAudioJsNode.connect(this.WebAudioGainNode);
		this.WebAudioGainNode.connect(this.WebAudioCtx.destination);
		this.WaveSampleRate = this.WebAudioCtx.sampleRate;
	}


/* **** EX Sound **** */
	/* FDS */
	this.FDS_WAVE_REG = new Array(0x40);
	this.FDS_LFO_REG = new Array(0x20);
	this.FDS_REG = new Array(0x10);
	this.FDS_LFO_DATA = [0, 1, 2, 4, 0, -4, -2, -1];
	//this.FDS_LFO_DATA = [0, 1, 2, 3, -4, -3, -2, -1];//<--

	this.FDS_WaveIndexCounter = 0;
	this.FDS_WaveIndex = 0;

	this.FDS_LFOIndexCounter = 0;
	this.FDS_LFOIndex = 0;
	this.FDS_REGAddress = 0;

	this.FDS_VolumeEnvCounter = 0;
	this.FDS_VolumeEnv = 0;

	this.FDS_SweepEnvCounter = 0;
	this.FDS_SweepEnv = 0;
	this.FDS_SweepBias = 0;

	this.FDS_Volume = 0;

	/* MMC5 */
	this.MMC5_FrameSequenceCounter = 0;
	this.MMC5_FrameSequence = 0;
	this.MMC5_REG = new Array(0x20);
	this.MMC5_Ch = new Array(2);
	this.MMC5_Level = 0;

	/* VRC6 */
	this.VRC6_REG = new Array(12);
	this.VRC6_Ch3_Counter = 0;
	this.VRC6_Ch3_index = 0;
	this.VRC6_Level = 0;

	/* N163 */
	this.N163_ch_data = new Array(8);
	this.N163_RAM = new Array(128);
	this.N163_Address = 0x00;
	this.N163_ch = 0;
	this.N163_Level = 0;
	this.N163_Clock = 0;

	/* AY-3-8910 */
	this.AY_ClockCounter = 0;
	this.AY_REG = new Array(16);
	this.AY_Noise_Seed = 0x0001;
	this.AY_Noise_Angle = 0;
	this.AY_Env_Counter = 0;
	this.AY_Env_Index = 0;
	this.AY_REG_Select = 0x00;
	this.AY_Level = 0;

	this.AY_Env_Pattern = [
	[15,14,13,12,11,10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0,
	  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
	  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[15,14,13,12,11,10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0,
	  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
	  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[15,14,13,12,11,10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0,
	  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
	  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[15,14,13,12,11,10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0,
	  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
	  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9,10,11,12,13,14,15,
	  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
	  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9,10,11,12,13,14,15,
	  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
	  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9,10,11,12,13,14,15,
	  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
	  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9,10,11,12,13,14,15,
	  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
	  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[15,14,13,12,11,10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0,
	 15,14,13,12,11,10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0,
	 15,14,13,12,11,10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
	[15,14,13,12,11,10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0,
	  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
	  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[15,14,13,12,11,10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0,
	  0, 1, 2, 3, 4, 5, 6, 7, 8, 9,10,11,12,13,14,15,
	 15,14,13,12,11,10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
	[15,14,13,12,11,10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0,
	 15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,
	 15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15],
	[ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9,10,11,12,13,14,15,
	  0, 1, 2, 3, 4, 5, 6, 7, 8, 9,10,11,12,13,14,15,
	  0, 1, 2, 3, 4, 5, 6, 7, 8, 9,10,11,12,13,14,15],
	[ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9,10,11,12,13,14,15,
	 15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,
	 15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15],
	[ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9,10,11,12,13,14,15,
	 15,14,13,12,11,10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0,
	  0, 1, 2, 3, 4, 5, 6, 7, 8, 9,10,11,12,13,14,15],
	[ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9,10,11,12,13,14,15,
	  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
	  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]];

	this.AY_Env_Volume = [    0,   16,   23,   32,
				 45,   64,   90,  128,
				181,  256,  362,  512,
				724, 1023, 1447, 2047];
};

/* **************************************************************** */
/* 定数
/* **************************************************************** */

// 1P, 2P
NES.prototype.JOYPAD_1P = 0;
NES.prototype.JOYPAD_2P = 1;

// コントローラーのボタン
NES.prototype.BUTTON_A = 0x01;
NES.prototype.BUTTON_B = 0x02;
NES.prototype.BUTTON_SELECT = 0x04;
NES.prototype.BUTTON_START  = 0x08;
NES.prototype.BUTTON_UP     = 0x10;
NES.prototype.BUTTON_DOWN   = 0x20;
NES.prototype.BUTTON_LEFT   = 0x40;
NES.prototype.BUTTON_RIGHT  = 0x80;

// 各命令で消費するCPUクロック数
NES.prototype.CycleTable = [
	7, 6, 2, 8, 3, 3, 5, 5, 3, 2, 2, 2, 4, 4, 6, 6, //0x00
	2, 5, 2, 8, 4, 4, 6, 6, 2, 4, 2, 7, 4, 4, 6, 7, //0x10
	6, 6, 2, 8, 3, 3, 5, 5, 4, 2, 2, 2, 4, 4, 6, 6, //0x20
	2, 5, 2, 8, 4, 4, 6, 6, 2, 4, 2, 7, 4, 4, 6, 7, //0x30
	6, 6, 2, 8, 3, 3, 5, 5, 3, 2, 2, 2, 3, 4, 6, 6, //0x40
	2, 5, 2, 8, 4, 4, 6, 6, 2, 4, 2, 7, 4, 4, 6, 7, //0x50
	6, 6, 2, 8, 3, 3, 5, 5, 4, 2, 2, 2, 5, 4, 6, 6, //0x60
	2, 5, 2, 8, 4, 4, 6, 6, 2, 4, 2, 7, 4, 4, 6, 7, //0x70
	2, 6, 2, 6, 3, 3, 3, 3, 2, 2, 2, 2, 4, 4, 4, 4, //0x80
	2, 5, 2, 6, 4, 4, 4, 4, 2, 4, 2, 5, 5, 4, 5, 5, //0x90
	2, 6, 2, 6, 3, 3, 3, 3, 2, 2, 2, 2, 4, 4, 4, 4, //0xA0
	2, 5, 2, 5, 4, 4, 4, 4, 2, 4, 2, 4, 4, 4, 4, 4, //0xB0
	2, 6, 2, 8, 3, 3, 5, 5, 2, 2, 2, 2, 4, 4, 6, 6, //0xC0
	2, 5, 2, 8, 4, 4, 6, 6, 2, 4, 2, 7, 4, 4, 6, 7, //0xD0
	2, 6, 2, 8, 3, 3, 5, 5, 2, 2, 2, 2, 4, 4, 6, 6, //0xE0
	2, 5, 2, 8, 4, 4, 6, 6, 2, 4, 2, 7, 4, 4, 6, 7  //0xF0
];

// ZERO PRG-ROM
NES.prototype.ZEROS_ROM_PAGE = new Array(0x2000);
for(var i = 0; i < NES.prototype.ZEROS_ROM_PAGE.length; i++) {
	NES.prototype.ZEROS_ROM_PAGE[i] = 0;
}

// ネガティブフラグ(7bit目)
NES.prototype.REG_P_NEGATIVE = 0x80;
// オーバーフローフラグ(6bit目)
NES.prototype.REG_P_OVERFLOW = 0x40;
// 未使用フラグ(5bit目) (フラグとして使われていない)
NES.prototype.REG_P_NOTUSED  = 0x20;
// ソフトウェア割り込みフラグ(4bit目)
NES.prototype.REG_P_BREAK    = 0x10;
// 10 進モードステータスフラグ(3bit目)
NES.prototype.REG_P_DECIMAL  = 0x08;
// 割り込み禁止フラグ(2bit目)
NES.prototype.REG_P_INTERRUPT= 0x04;
// ゼロフラグ(1bit目)
NES.prototype.REG_P_ZERO     = 0x02;
// キャリーフラグ(0bit目)
NES.prototype.REG_P_CARRY    = 0x01;

// 割り込みベクタ 1 (マスク不可割り込み)
NES.prototype.IRQ_NMI_ADDR   = 0xFFFA;
// 割り込みベクタ 2 (リセット)
NES.prototype.IRQ_RESET_ADDR = 0xFFFC;
// 割り込みベクタ 3 (ソフトウェア割り込み)
NES.prototype.IRQ_BRK_ADDR   = 0xFFFE;

// ファミコン固有のパレットテーブル
NES.prototype.PaletteTable = [
	[ 0x80,0x80,0x80 ], [ 0x00,0x3D,0xA6 ], [ 0x00,0x12,0xB0 ], [ 0x44,0x00,0x96 ],
	[ 0xA1,0x00,0x5E ], [ 0xC7,0x00,0x28 ], [ 0xBA,0x06,0x00 ], [ 0x8C,0x17,0x00 ],
	[ 0x5C,0x2F,0x00 ], [ 0x10,0x45,0x00 ], [ 0x05,0x4A,0x00 ], [ 0x00,0x47,0x2E ],
	[ 0x00,0x41,0x66 ], [ 0x00,0x00,0x00 ], [ 0x05,0x05,0x05 ], [ 0x05,0x05,0x05 ],
	[ 0xC7,0xC7,0xC7 ], [ 0x00,0x77,0xFF ], [ 0x21,0x55,0xFF ], [ 0x82,0x37,0xFA ],
	[ 0xEB,0x2F,0xB5 ], [ 0xFF,0x29,0x50 ], [ 0xFF,0x22,0x00 ], [ 0xD6,0x32,0x00 ],
	[ 0xC4,0x62,0x00 ], [ 0x35,0x80,0x00 ], [ 0x05,0x8F,0x00 ], [ 0x00,0x8A,0x55 ],
	[ 0x00,0x99,0xCC ], [ 0x21,0x21,0x21 ], [ 0x09,0x09,0x09 ], [ 0x09,0x09,0x09 ],
	[ 0xFF,0xFF,0xFF ], [ 0x0F,0xD7,0xFF ], [ 0x69,0xA2,0xFF ], [ 0xD4,0x80,0xFF ],
	[ 0xFF,0x45,0xF3 ], [ 0xFF,0x61,0x8B ], [ 0xFF,0x88,0x33 ], [ 0xFF,0x9C,0x12 ],
	[ 0xFA,0xBC,0x20 ], [ 0x9F,0xE3,0x0E ], [ 0x2B,0xF0,0x35 ], [ 0x0C,0xF0,0xA4 ],
	[ 0x05,0xFB,0xFF ], [ 0x5E,0x5E,0x5E ], [ 0x0D,0x0D,0x0D ], [ 0x0D,0x0D,0x0D ],
	[ 0xFF,0xFF,0xFF ], [ 0xA6,0xFC,0xFF ], [ 0xB3,0xEC,0xFF ], [ 0xDA,0xAB,0xEB ],
	[ 0xFF,0xA8,0xF9 ], [ 0xFF,0xAB,0xB3 ], [ 0xFF,0xD2,0xB0 ], [ 0xFF,0xEF,0xA6 ],
	[ 0xFF,0xF7,0x9C ], [ 0xD7,0xE8,0x95 ], [ 0xA6,0xED,0xAF ], [ 0xA2,0xF2,0xDA ],
	[ 0x99,0xFF,0xFC ], [ 0xDD,0xDD,0xDD ], [ 0x11,0x11,0x11 ], [ 0x11,0x11,0x11 ]
];


/* **************************************************************** */
NES.prototype.Init = function () {
	// iNES ヘッダーを読み込み
	this.ParseHeader();

	// 各種メモリを初期化
	this.StorageClear();

	// PRGROM と CHRROMを読み込み
	this.StorageInit();
	this.PpuInit();
	this.ApuInit();

	// Mapper を読み込み
	if(!this.MapperSelect()) {
		window.alert("Unsupported Mapper: " + this.MapperNumber);
		return false;
	}

	this.Mapper.Init();
	this.CpuInit();
	return true;
};

NES.prototype.ParseHeader = function () {
	if(!this.Rom) {
		return;
	}

	this.PrgRomPageCount = this.Rom[4];
	this.ChrRomPageCount = this.Rom[5];
	this.HMirror  = (this.Rom[6] & 0x01) === 0;
	this.VMirror  = (this.Rom[6] & 0x01) !== 0;
	this.SramEnable = (this.Rom[6] & 0x02) !== 0;
	this.TrainerEnable = (this.Rom[6] & 0x04) !== 0;
	this.FourScreen = (this.Rom[6] & 0x08) !== 0;
	this.MapperNumber = (this.Rom[6] >> 4) | (this.Rom[7] & 0xF0);

	return true;
};

// Mapper を読み込み
NES.prototype.MapperSelect = function () {
	switch(this.MapperNumber) {
		case 0:
			this.Mapper = new Mapper0(this);
			break;
		case 1:
			this.Mapper = new Mapper1(this);
			break;
		case 2:
			this.Mapper = new Mapper2(this);
			break;
		case 3:
			this.Mapper = new Mapper3(this);
			break;
		case 4:
			this.Mapper = new Mapper4(this);
			break;
		case 5:
			this.Mapper = new Mapper5(this);
			break;
		case 7:
			this.Mapper = new Mapper7(this);
			break;
		case 9:
			this.Mapper = new Mapper9(this);
			break;
		case 10:
			this.Mapper = new Mapper10(this);
			break;
		case 16:
			this.Mapper = new Mapper16(this);
			break;
		case 18:
			this.Mapper = new Mapper18(this);
			break;
		case 19:
			this.Mapper = new Mapper19(this);
			break;
		case 20:
			// DiskSystem
			//this.Mapper = new Mapper20(this);
		case 21:
			this.Mapper = new Mapper25(this);
			break;
		case 22:
			this.Mapper = new Mapper22(this);
			break;
		case 23:
			this.Mapper = new Mapper23(this);
			break;
		case 24:
			this.Mapper = new Mapper24(this);
			break;
		case 25:
			this.Mapper = new Mapper25(this);
			break;
		case 26:
			this.Mapper = new Mapper26(this);
			break;
		case 32:
			this.Mapper = new Mapper32(this);
			break;
		case 33:
			this.Mapper = new Mapper33(this);
			break;
		case 34:
			this.Mapper = new Mapper34(this);
			break;
		case 48:
			this.Mapper = new Mapper48(this);
			break;
		case 65:
			this.Mapper = new Mapper65(this);
			break;
		case 66:
			this.Mapper = new Mapper66(this);
			break;
		case 67:
			this.Mapper = new Mapper67(this);
			break;
		case 68:
			this.Mapper = new Mapper68(this);
			break;
		case 69:
			this.Mapper = new Mapper69(this);
			break;
		case 70:
			this.Mapper = new Mapper70(this);
			break;
		case 72:
			this.Mapper = new Mapper72(this);
			break;
		case 73:
			this.Mapper = new Mapper73(this);
			break;
		case 75:
			this.Mapper = new Mapper75(this);
			break;
		case 76:
			this.Mapper = new Mapper76(this);
			break;
		case 77:
			this.Mapper = new Mapper77(this);
			break;
		case 78:
			this.Mapper = new Mapper78(this);
			break;
		case 80:
			this.Mapper = new Mapper80(this);
			break;
		case 82:
			this.Mapper = new Mapper82(this);
			break;
		case 85:
			this.Mapper = new Mapper85(this);
			break;
		case 86:
			this.Mapper = new Mapper86(this);
			break;
		case 87:
			this.Mapper = new Mapper87(this);
			break;
		case 88:
			this.Mapper = new Mapper88(this);
			break;
		case 89:
			this.Mapper = new Mapper89(this);
			break;
		case 92:
			this.Mapper = new Mapper92(this);
			break;
		case 93:
			this.Mapper = new Mapper93(this);
			break;
		case 94:
			this.Mapper = new Mapper94(this);
			break;
		case 95:
			this.Mapper = new Mapper95(this);
			break;
		case 97:
			this.Mapper = new Mapper97(this);
			break;
		case 101:
			this.Mapper = new Mapper101(this);
			break;
		case 118:
			this.Mapper = new Mapper118(this);
			break;
		case 119:
			this.Mapper = new Mapper119(this);
			break;
		case 140:
			this.Mapper = new Mapper140(this);
			break;
		case 152:
			this.Mapper = new Mapper152(this);
			break;
		case 180:
			this.Mapper = new Mapper180(this);
			break;
		case 184:
			this.Mapper = new Mapper184(this);
			break;
		case 185:
			this.Mapper = new Mapper185(this);
			break;
		case 207:
			this.Mapper = new Mapper207(this);
			break;
		case 210:
			this.Mapper = new Mapper19(this);
			break;
		default:
			return false;
	}
	return true;
};


NES.prototype.Start = function () {
	if(this.Mapper !== null && this.requestID === null) {
		this.Run();
		return true;
	}
	return false;
};

NES.prototype.Run = function () {
	// Run
	this.CpuRun();

	// 再帰的に自身を呼び出す。
	this.requestID = window.requestAnimationFrame(this.Run.bind(this));
};

NES.prototype.Pause = function () {
	if(this.Mapper !== null && this.requestID !== null) {
		window.cancelAnimationFrame(this.requestID);
		this.requestID = null;
		return true;
	}
	return false;
};

NES.prototype.Reset = function () {
	if(this.Mapper !== null) {
		this.Pause();
		this.PpuInit();
		this.ApuInit();
		this.Mapper.Init();
		this.CpuReset();
		this.Start();
		return true;
	}
	return false;
};

/* **************************************************************** */
/* NES CPU
/* **************************************************************** */

NES.prototype.CpuInit = function () {
	// 各種レジスタ
	this.A = 0;
	this.X = 0;
	this.Y = 0;
	this.S = 0xFD; // 11111101
	this.P = 0x34; // 00110100

	// RESET割り込みにより PC の下位バイトを$FFFCから、上位バイトを$FFFDからフェッチ
	this.PC = this.Get16(this.IRQ_RESET_ADDR);

	// 割り込み
	this.toNMI = false;
	this.toIRQ = 0x00;

	//TODO: why?
	this.Set(0x0008, 0xF7);
	this.Set(0x0009, 0xEF);
	this.Set(0x000A, 0xDF);
	this.Set(0x000F, 0xBF);
};

NES.prototype.CpuRun = function () {
	// 画面を描画したかどうか
	this.DrawFlag = false;

	// 1フレーム1描画。描画するまでCPU, APU, PPUをrun
	while(!this.DrawFlag) {
		if(this.toNMI) {
			// NMI割り込み
			this.NMI();
			this.toNMI = false;
		}
		// ステータスレジスタにIRQ割り込み禁止フラグが立ってなければ
		else if((this.P & 0x04) === 0x00 && this.toIRQ !== 0x00) { // 0x04 = 0b0100
			// IRQ割り込み
			this.IRQ();
		}

		var opcode = this.Get(this.PC++);
		this.CPUClock += this.CycleTable[opcode];
		this.Mapper.CPUSync(this.CPUClock);
		this.PpuRun();
		this.ApuRun();
		this.CPUClock = 0;
		this.ExecuteOpCode(opcode);
	}
};

NES.prototype.ExecuteOpCode = function (opcode) {
	switch(opcode){
		case 0xA1://LDA XIND
			this.LDA(this.GetAddressIndirectX());
			break;
		case 0xA5://LDA ZP
			this.LDA(this.GetAddressZeroPage());
			break;
		case 0xA9://LDA IMM
			this.LDA(this.GetAddressImmediate());
			break;
		case 0xAD://LDA ABS
			this.LDA(this.GetAddressAbsolute());
			break;
		case 0xB1://LDA INDY
			this.LDA(this.GetAddressIndirectY());
			break;
		case 0xB5://LDA ZPX
			this.LDA(this.GetAddressZeroPageX());
			break;
		case 0xB9://LDA ABSY
			this.LDA(this.GetAddressAbsoluteY());
			break;
		case 0xBD://LDA ABSX
			this.LDA(this.GetAddressAbsoluteX());
			break;

		case 0xA2://LDX IMM
			this.LDX(this.GetAddressImmediate());
			break;
		case 0xA6://LDX ZP
			this.LDX(this.GetAddressZeroPage());
			break;
		case 0xAE://LDX ABS
			this.LDX(this.GetAddressAbsolute());
			break;
		case 0xB6://LDX ZPY
			this.LDX(this.GetAddressZeroPageY());
			break;
		case 0xBE://LDX ABSY
			this.LDX(this.GetAddressAbsoluteY());
			break;

		case 0xA0://LDY IMM
			this.LDY(this.GetAddressImmediate());
			break;
		case 0xA4://LDY ZP
			this.LDY(this.GetAddressZeroPage());
			break;
		case 0xAC://LDY ABS
			this.LDY(this.GetAddressAbsolute());
			break;
		case 0xB4://LDY ZPX
			this.LDY(this.GetAddressZeroPageX());
			break;
		case 0xBC://LDY ABSX
			this.LDY(this.GetAddressAbsoluteX());
			break;

		case 0x81://STA XIND
			this.STA(this.GetAddressIndirectX());
			break;
		case 0x85://STA ZP
			this.STA(this.GetAddressZeroPage());
			break;
		case 0x8D://STA ABS
			this.STA(this.GetAddressAbsolute());
			break;
		case 0x91://STA INDY
			this.STA(this.GetAddressIndirectY());
			break;
		case 0x95://STA ZPX
			this.STA(this.GetAddressZeroPageX());
			break;
		case 0x99://STA ABSY
			this.STA(this.GetAddressAbsoluteY());
			break;
		case 0x9D://STA ABSX
			this.STA(this.GetAddressAbsoluteX());
			break;

		case 0x86://STX ZP
			this.STX(this.GetAddressZeroPage());
			break;
		case 0x8E://STX ABS
			this.STX(this.GetAddressAbsolute());
			break;
		case 0x96://STX ZPY
			this.STX(this.GetAddressZeroPageY());
			break;

		case 0x84://STY ZP
			this.STY(this.GetAddressZeroPage());
			break;
		case 0x8C://STY ABS
			this.STY(this.GetAddressAbsolute());
			break;
		case 0x94://STY ZPX
			this.STY(this.GetAddressZeroPageX());
			break;

		case 0x8A://TXA
			this.TXA();
			break;
		case 0x98://TYA
			this.TYA();
			break;
		case 0x9A://TXS
			this.TXS();
			break;
		case 0xA8://TAY
			this.TAY();
			break;
		case 0xAA://TAX
			this.TAX();
			break;
		case 0xBA://TSX
			this.TSX();
			break;

		case 0x08://PHP
			this.PHP();
			break;
		case 0x28://PLP
			this.PLP();
			break;
		case 0x48://PHA
			this.PHA();
			break;
		case 0x68://PLA
			this.PLA();
			break;

		case 0x61://ADC XIND
			this.ADC(this.GetAddressIndirectX());
			break;
		case 0x65://ADC ZP
			this.ADC(this.GetAddressZeroPage());
			break;
		case 0x69://ADC IMM
			this.ADC(this.GetAddressImmediate());
			break;
		case 0x6D://ADC ABS
			this.ADC(this.GetAddressAbsolute());
			break;
		case 0x71://ADC INDY
			this.ADC(this.GetAddressIndirectY());
			break;
		case 0x75://ADC ZPX
			this.ADC(this.GetAddressZeroPageX());
			break;
		case 0x79://ADC ABSY
			this.ADC(this.GetAddressAbsoluteY());
			break;
		case 0x7D://ADC ABSX
			this.ADC(this.GetAddressAbsoluteX());
			break;

		case 0xE1://SBC XIND
			this.SBC(this.GetAddressIndirectX());
			break;
		case 0xE5://SBC ZP
			this.SBC(this.GetAddressZeroPage());
			break;
		case 0xE9://SBC IMM
			this.SBC(this.GetAddressImmediate());
			break;
		case 0xED://SBC ABS
			this.SBC(this.GetAddressAbsolute());
			break;
		case 0xF1://SBC INDY
			this.SBC(this.GetAddressIndirectY());
			break;
		case 0xF5://SBC ZPX
			this.SBC(this.GetAddressZeroPageX());
			break;
		case 0xF9://SBC ABSY
			this.SBC(this.GetAddressAbsoluteY());
			break;
		case 0xFD://SBC ABSX
			this.SBC(this.GetAddressAbsoluteX());
			break;

		case 0xC1://CMP XIND
			this.CMP(this.GetAddressIndirectX());
			break;
		case 0xC5://CMP ZP
			this.CMP(this.GetAddressZeroPage());
			break;
		case 0xC9://CMP IMM
			this.CMP(this.GetAddressImmediate());
			break;
		case 0xCD://CMP ABS
			this.CMP(this.GetAddressAbsolute());
			break;
		case 0xD1://CMP INDY
			this.CMP(this.GetAddressIndirectY());
			break;
		case 0xD5://CMP ZPX
			this.CMP(this.GetAddressZeroPageX());
			break;
		case 0xD9://CMP ABSY
			this.CMP(this.GetAddressAbsoluteY());
			break;
		case 0xDD://CMP ABSX
			this.CMP(this.GetAddressAbsoluteX());
			break;

		case 0xE0://CPX IMM
			this.CPX(this.GetAddressImmediate());
			break;
		case 0xE4://CPX ZP
			this.CPX(this.GetAddressZeroPage());
			break;
		case 0xEC://CPX ABS
			this.CPX(this.GetAddressAbsolute());
			break;

		case 0xC0://CPY IMM
			this.CPY(this.GetAddressImmediate());
			break;
		case 0xC4://CPY ZP
			this.CPY(this.GetAddressZeroPage());
			break;
		case 0xCC://CPY ABS
			this.CPY(this.GetAddressAbsolute());
			break;

		case 0x21://AND XIND
			this.AND(this.GetAddressIndirectX());
			break;
		case 0x25://AND ZP
			this.AND(this.GetAddressZeroPage());
			break;
		case 0x29://AND IMM
			this.AND(this.GetAddressImmediate());
			break;
		case 0x2D://AND ABS
			this.AND(this.GetAddressAbsolute());
			break;
		case 0x31://AND INDY
			this.AND(this.GetAddressIndirectY());
			break;
		case 0x35://AND ZPX
			this.AND(this.GetAddressZeroPageX());
			break;
		case 0x39://AND ABSY
			this.AND(this.GetAddressAbsoluteY());
			break;
		case 0x3D://AND ABSX
			this.AND(this.GetAddressAbsoluteX());
			break;

		case 0x41://EOR XIND
			this.EOR(this.GetAddressIndirectX());
			break;
		case 0x45://EOR ZP
			this.EOR(this.GetAddressZeroPage());
			break;
		case 0x49://EOR IMM
			this.EOR(this.GetAddressImmediate());
			break;
		case 0x4D://EOR ABS
			this.EOR(this.GetAddressAbsolute());
			break;
		case 0x51://EOR INDY
			this.EOR(this.GetAddressIndirectY());
			break;
		case 0x55://EOR ZPX
			this.EOR(this.GetAddressZeroPageX());
			break;
		case 0x59://EOR ABSY
			this.EOR(this.GetAddressAbsoluteY());
			break;
		case 0x5D://EOR ABSX
			this.EOR(this.GetAddressAbsoluteX());
			break;

		case 0x01://ORA XIND
			this.ORA(this.GetAddressIndirectX());
			break;
		case 0x05://ORA ZP
			this.ORA(this.GetAddressZeroPage());
			break;
		case 0x09://ORA IMM
			this.ORA(this.GetAddressImmediate());
			break;
		case 0x0D://ORA ABS
			this.ORA(this.GetAddressAbsolute());
			break;
		case 0x11://ORA INDY
			this.ORA(this.GetAddressIndirectY());
			break;
		case 0x15://ORA ZPX
			this.ORA(this.GetAddressZeroPageX());
			break;
		case 0x19://ORA ABSY
			this.ORA(this.GetAddressAbsoluteY());
			break;
		case 0x1D://ORA ABSX
			this.ORA(this.GetAddressAbsoluteX());
			break;

		case 0x24://BIT ZP
			this.BIT(this.GetAddressZeroPage());
			break;
		case 0x2C://BIT ABS
			this.BIT(this.GetAddressAbsolute());
			break;

		case 0x06://ASL ZP
			this.ASL(this.GetAddressZeroPage());
			break;
		case 0x0A://ASL A
			this.A = this.ASL_Sub(this.A);
			break;
		case 0x0E://ASL ABS
			this.ASL(this.GetAddressAbsolute());
			break;
		case 0x16://ASL ZPX
			this.ASL(this.GetAddressZeroPageX());
			break;
		case 0x1E://ASL ABSX
			this.ASL(this.GetAddressAbsoluteX());
			break;

		case 0x46://LSR ZP
			this.LSR(this.GetAddressZeroPage());
			break;
		case 0x4A://LSR A
			this.A = this.LSR_Sub(this.A);
			break;
		case 0x4E://LSR ABS
			this.LSR(this.GetAddressAbsolute());
			break;
		case 0x56://LSR ZPX
			this.LSR(this.GetAddressZeroPageX());
			break;
		case 0x5E://LSR ABSX
			this.LSR(this.GetAddressAbsoluteX());
			break;

		case 0x26://ROL ZP
			this.ROL(this.GetAddressZeroPage());
			break;
		case 0x2A://ROL A
			this.A = this.ROL_Sub(this.A);
			break;
		case 0x2E://ROL ABS
			this.ROL(this.GetAddressAbsolute());
			break;
		case 0x36://ROL ZPX
			this.ROL(this.GetAddressZeroPageX());
			break;
		case 0x3E://ROL ABSX
			this.ROL(this.GetAddressAbsoluteX());
			break;

		case 0x66://ROR ZP
			this.ROR(this.GetAddressZeroPage());
			break;
		case 0x6A://ROR A
			this.A = this.ROR_Sub(this.A);
			break;
		case 0x6E://ROR ABS
			this.ROR(this.GetAddressAbsolute());
			break;
		case 0x76://ROR ZPX
			this.ROR(this.GetAddressZeroPageX());
			break;
		case 0x7E://ROR ABSX
			this.ROR(this.GetAddressAbsoluteX());
			break;

		case 0xE6://INC ZP
			this.INC(this.GetAddressZeroPage());
			break;
		case 0xEE://INC ABS
			this.INC(this.GetAddressAbsolute());
			break;
		case 0xF6://INC ZPX
			this.INC(this.GetAddressZeroPageX());
			break;
		case 0xFE://INC ABSX
			this.INC(this.GetAddressAbsoluteX());
			break;

		case 0xE8://INX
			this.INX();
			break;
		case 0xC8://INY
			this.INY();
			break;

		case 0xC6://DEC ZP
			this.DEC(this.GetAddressZeroPage());
			break;
		case 0xCE://DEC ABS
			this.DEC(this.GetAddressAbsolute());
			break;
		case 0xD6://DEC ZPX
			this.DEC(this.GetAddressZeroPageX());
			break;
		case 0xDE://DEC ABSX
			this.DEC(this.GetAddressAbsoluteX());
			break;

		case 0xCA://DEX
			this.DEX();
			break;
		case 0x88://DEY
			this.DEY();
			break;

		case 0x18://CLC
			this.P &= 0xFE;
			break;
		case 0x58://CLI
			this.P &= 0xFB;
			break;
		case 0xB8://CLV
			this.P &= 0xBF;
			break;
		case 0xD8://CLD
			this.P &= 0xF7;
			break;
		case 0x38://SEC
			this.P |= 0x01;
			break;
		case 0x78://SEI
			this.P |= 0x04;
			break;
		case 0xF8://SED
			this.P |= 0x08;
			break;

		case 0xEA://NOP
			this.NOP();
			break;

		case 0x00://BRK
			this.BRK();
			break;

		case 0x4C://JMP ABS
			this.JMP(this.GetAddressAbsolute());
			break;
		case 0x6C://JMP IND
			//TODO: refactor
			var address = this.GetAddressAbsolute();
			var tmp = (((address + 1) & 0x00FF) | (address & 0xFF00));
			this.JMP(this.Get(address) | (this.Get(tmp) << 8));
			break;

		case 0x20://JSR ABS
			this.JSR();
			break;
		case 0x60://RTS
			this.RTS();
			break;
		case 0x40://RTI
			this.RTI();
			break;

		case 0x10://BPL REL
			this.BPL();
			break;
		case 0x30://BMI REL
			this.BMI();
			break;
		case 0x50://BVC REL
			this.BVC();
			break;
		case 0x70://BVS REL
			this.BVS();
			break;
		case 0x90://BCC REL
			this.BCC();
			break;
		case 0xB0://BCS REL
			this.BCS();
			break;
		case 0xD0://BNE REL
			this.BNE();
			break;
		case 0xF0://BEQ REL
			this.BEQ();
			break;

		/* Undocument */
		case 0x0B://ANC IMM
		case 0x2B://ANC IMM
			this.ANC(this.GetAddressImmediate());
			break;

		case 0x8B://ANE IMM
			this.ANE(this.GetAddressImmediate());
			break;

		case 0x6B://ARR IMM
			this.ARR(this.GetAddressImmediate());
			break;

		case 0x4B://ASR IMM
			this.ASR(this.GetAddressImmediate());
			break;

		case 0xC7://DCP ZP
			this.DCP(this.GetAddressZeroPage());
			break;
		case 0xD7://DCP ZPX
			this.DCP(this.GetAddressZeroPageX());
			break;
		case 0xCF://DCP ABS
			this.DCP(this.GetAddressAbsolute());
			break;
		case 0xDF://DCP ABSX
			this.DCP(this.GetAddressAbsoluteX());
			break;
		case 0xDB://DCP ABSY
			this.DCP(this.GetAddressAbsoluteY());
			break;
		case 0xC3://DCP XIND
			this.DCP(this.GetAddressIndirectX());
			break;
		case 0xD3://DCP INDY
			this.DCP(this.GetAddressIndirectY());
			break;

		case 0xE7://ISB ZP
			this.ISB(this.GetAddressZeroPage());
			break;
		case 0xF7://ISB ZPX
			this.ISB(this.GetAddressZeroPageX());
			break;
		case 0xEF://ISB ABS
			this.ISB(this.GetAddressAbsolute());
			break;
		case 0xFF://ISB ABSX
			this.ISB(this.GetAddressAbsoluteX());
			break;
		case 0xFB://ISB ABSY
			this.ISB(this.GetAddressAbsoluteY());
			break;
		case 0xE3://ISB XIND
			this.ISB(this.GetAddressIndirectX());
			break;
		case 0xF3://ISB INDY
			this.ISB(this.GetAddressIndirectY());
			break;

		case 0xBB://LAS ABSY
			this.LAS(this.GetAddressAbsoluteY());
			break;

		case 0xA7://LAX ZP
			this.LAX(this.GetAddressZeroPage());
			break;
		case 0xB7://LAX ZPY
			this.LAX(this.GetAddressZeroPageY());
			break;
		case 0xAF://LAX ABS
			this.LAX(this.GetAddressAbsolute());
			break;
		case 0xBF://LAX ABSY
			this.LAX(this.GetAddressAbsoluteY());
			break;
		case 0xA3://LAX XIND
			this.LAX(this.GetAddressIndirectX());
			break;
		case 0xB3://LAX INDY
			this.LAX(this.GetAddressIndirectY());
			break;

		case 0xAB://LXA IMM
			this.LXA(this.GetAddressImmediate());
			break;

		case 0x27://RLA ZP
			this.RLA(this.GetAddressZeroPage());
			break;
		case 0x37://RLA ZPX
			this.RLA(this.GetAddressZeroPageX());
			break;
		case 0x2F://RLA ABS
			this.RLA(this.GetAddressAbsolute());
			break;
		case 0x3F://RLA ABSX
			this.RLA(this.GetAddressAbsoluteX());
			break;
		case 0x3B://RLA ABSY
			this.RLA(this.GetAddressAbsoluteY());
			break;
		case 0x23://RLA XIND
			this.RLA(this.GetAddressIndirectX());
			break;
		case 0x33://RLA INDY
			this.RLA(this.GetAddressIndirectY());
			break;

		case 0x67://RRA ZP
			this.RRA(this.GetAddressZeroPage());
			break;
		case 0x77://RRA ZPX
			this.RRA(this.GetAddressZeroPageX());
			break;
		case 0x6F://RRA ABS
			this.RRA(this.GetAddressAbsolute());
			break;
		case 0x7F://RRA ABSX
			this.RRA(this.GetAddressAbsoluteX());
			break;
		case 0x7B://RRA ABSY
			this.RRA(this.GetAddressAbsoluteY());
			break;
		case 0x63://RRA XIND
			this.RRA(this.GetAddressIndirectX());
			break;
		case 0x73://RRA INDY
			this.RRA(this.GetAddressIndirectY());
			break;

		case 0x87://SAX ZP
			this.SAX(this.GetAddressZeroPage());
			break;
		case 0x97://SAX ZPY
			this.SAX(this.GetAddressZeroPageY());
			break;
		case 0x8F://SAX ABS
			this.SAX(this.GetAddressAbsolute());
			break;
		case 0x83://SAX XIND
			this.SAX(this.GetAddressIndirectX());
			break;

		case 0xCB://SBX IMM
			this.SBX(this.GetAddressImmediate());
			break;

		case 0x9F://SHA ABSY
			this.SHA(this.GetAddressAbsoluteY());
			break;
		case 0x93://SHA INDY
			this.SHA(this.GetAddressIndirectY());
			break;

		case 0x9B://SHS ABSY
			this.SHS(this.GetAddressAbsoluteY());
			break;

		case 0x9E://SHX ABSY
			this.SHX(this.GetAddressAbsoluteY());
			break;

		case 0x9C://SHY ABSX
			this.SHY(this.GetAddressAbsoluteX());
			break;

		case 0x07://SLO ZP
			this.SLO(this.GetAddressZeroPage());
			break;
		case 0x17://SLO ZPX
			this.SLO(this.GetAddressZeroPageX());
			break;
		case 0x0F://SLO ABS
			this.SLO(this.GetAddressAbsolute());
			break;
		case 0x1F://SLO ABSX
			this.SLO(this.GetAddressAbsoluteX());
			break;
		case 0x1B://SLO ABSY
			this.SLO(this.GetAddressAbsoluteY());
			break;
		case 0x03://SLO XIND
			this.SLO(this.GetAddressIndirectX());
			break;
		case 0x13://SLO INDY
			this.SLO(this.GetAddressIndirectY());
			break;

		case 0x47://SRE ZP
			this.SRE(this.GetAddressZeroPage());
			break;
		case 0x57://SRE ZPX
			this.SRE(this.GetAddressZeroPageX());
			break;
		case 0x4F://SRE ABS
			this.SRE(this.GetAddressAbsolute());
			break;
		case 0x5F://SRE ABSX
			this.SRE(this.GetAddressAbsoluteX());
			break;
		case 0x5B://SRE ABSY
			this.SRE(this.GetAddressAbsoluteY());
			break;
		case 0x43://SRE XIND
			this.SRE(this.GetAddressIndirectX());
			break;
		case 0x53://SRE INDY
			this.SRE(this.GetAddressIndirectY());
			break;

		case 0xEB://SBC IMM
			this.SBC(this.GetAddressImmediate());
			break;

		case 0x1A://NOP
		case 0x3A://NOP
		case 0x5A://NOP
		case 0x7A://NOP
		case 0xDA://NOP
		case 0xFA://NOP
			break;

		case 0x80://DOP IMM
		case 0x82://DOP IMM
		case 0x89://DOP IMM
		case 0xC2://DOP IMM
		case 0xE2://DOP IMM
		case 0x04://DOP ZP
		case 0x44://DOP ZP
		case 0x64://DOP ZP
		case 0x14://DOP ZPX
		case 0x34://DOP ZPX
		case 0x54://DOP ZPX
		case 0x74://DOP ZPX
		case 0xD4://DOP ZPX
		case 0xF4://DOP ZPX
			this.PC++;
			break;

		case 0x0C://TOP ABS
		case 0x1C://TOP ABSX
		case 0x3C://TOP ABSX
		case 0x5C://TOP ABSX
		case 0x7C://TOP ABSX
		case 0xDC://TOP ABSX
		case 0xFC://TOP ABSX
			this.PC += 2;
			break;

		case 0x02://JAM
		case 0x12://JAM
		case 0x22://JAM
		case 0x32://JAM
		case 0x42://JAM
		case 0x52://JAM
		case 0x62://JAM
		case 0x72://JAM
		case 0x92://JAM
		case 0xB2://JAM
		case 0xD2://JAM
		case 0xF2://JAM
		/* falls through */
		default:
			window.alert("Unknown opcode: " + opcode);
			this.PC--;
			break;
	}
};


/* **************************************************************** */
/* NES CPU ステータスレジスタ
/* **************************************************************** */

// ネガティブフラグ
NES.prototype.SetNegativeFlag = function() {
	this.P |=  this.REG_P_NEGATIVE;
};
NES.prototype.ClearNegativeFlag = function() {
	this.P &= ~this.REG_P_NEGATIVE;
};

// オーバーフローフラグ
NES.prototype.SetOverflowFlag = function() {
	this.P |=  this.REG_P_OVERFLOW;
};
NES.prototype.ClearOverflowFlag = function() {
	this.P &= ~this.REG_P_OVERFLOW;
};

// 割り込みフラグ
NES.prototype.SetBreakFlag = function() {
	this.P |=  this.REG_P_BREAK;
};
NES.prototype.ClearBreakFlag = function() {
	this.P &= ~this.REG_P_BREAK;
};

// 10 進モードステータスフラグ
NES.prototype.SetDecimalModeFlag = function() {
	this.P |=  this.REG_P_DECIMAL;
};
NES.prototype.ClearDecimalModeFlag = function() {
	this.P &= ~this.REG_P_DECIMAL;
};

// 割り込み禁止フラグ
NES.prototype.SetInterruptFlag = function() {
	this.P |=  this.REG_P_INTERRUPT;
};
NES.prototype.ClearInterruptFlag = function() {
	this.P &= ~this.REG_P_INTERRUPT;
};

// ゼロフラグ
NES.prototype.SetZeroFlag = function() {
	this.P |=  this.REG_P_INTERRUPT;
};
NES.prototype.ClearZeroFlag = function() {
	this.P &= ~this.REG_P_INTERRUPT;
};

// キャリーフラグをセット
NES.prototype.SetCarryFlag = function() {
	this.P |=  this.REG_P_CARRY;
};
NES.prototype.ClearCarryFlag = function() {
	this.P &= ~this.REG_P_CARRY;
};

/* **************************************************************** */
/* NES CPU 割り込み
/* **************************************************************** */

NES.prototype.CpuReset = function () {
	this.S = (this.S - 3) & 0xFF;
	this.P |= 0x04;
	this.toNMI = false;
	this.toIRQ = 0x00;
	this.PC = this.Get16(this.IRQ_RESET_ADDR);
};


NES.prototype.NMI = function () {
	this.CPUClock += 7;

	// PCの上位8バイト
	this.Push((this.PC >> 8) & 0xFF); // 0xFF = 0b11111111
	// PCの下位8バイト
	this.Push(this.PC & 0xFF);

	// 0xEF = 0b11101111, 0x20 = 0b00100000
	// ステータスレジスタのブレークモードをクリア
	// ステータスレジスタの予約済フラグを1に再度セット
	// その状態でスタックにpush
	this.Push((this.P & 0xEF) | 0x20);

	// ステータスレジスタのIRQ禁止をON
	// ステータスレジスタのブレークモードをクリア
	this.P = (this.P | 0x04) & 0xEF; // 0x04 = 0b0100

	// 割り込みベクタ
	this.PC = this.Get16(this.IRQ_NMI_ADDR);
};


NES.prototype.IRQ = function () {
	this.CPUClock += 7;

	// PCの上位8バイト
	this.Push((this.PC >> 8) & 0xFF);
	// PCの下位8バイト
	this.Push(this.PC & 0xFF);

	// 0xEF = 0b11101111, 0x20 = 0b00100000
	// ステータスレジスタのブレークモードをクリア
	// ステータスレジスタの予約済フラグを1に再度セット
	// その状態でスタックにpush
	this.Push((this.P & 0xEF) | 0x20);

	// ステータスレジスタのIRQ禁止をON
	// ステータスレジスタのブレークモードをクリア
	this.P = (this.P | 0x04) & 0xEF;

	// 割り込みベクタ
	this.PC = this.Get16(this.IRQ_BRK_ADDR);
};

NES.prototype.BRK = function () {
	// BRK呼び出し側で CPUClock += 7 する

	this.PC++;

	// PCの上位8バイト
	this.Push(this.PC >> 8);
	// PCの下位8バイト
	this.Push(this.PC & 0xFF);

	// ステータスレジスタのブレークモードをセット
	// ステータスレジスタの予約済フラグを1に再度セット
	this.Push(this.P | 0x30); // 0x30 = 0b00110000


	// ステータスレジスタのブレークモードをセット
	// ステータスレジスタのインタラプトフラグをセット
	this.P |= 0x14; // 0x14 = 0b00010100

	// 割り込みベクタ
	this.PC = this.Get16(this.IRQ_BRK_ADDR);
};

/* **************************************************************** */
/* NES CPU アドレッシングモード
/* **************************************************************** */

// Zero Page Addressing
// 上位アドレスとして$00、下位アドレスとして2番目のバイトを使用し実効アドレスとします。
NES.prototype.GetAddressZeroPage = function () {
	return this.Get(this.PC++);
};

// Immediate Addressing
// 2番目のバイトをデータそのものとして使用します。
NES.prototype.GetAddressImmediate = function () {
	return this.PC++;
};

// Absolute Addressing
// 2番目のバイトを下位アドレス、 3番目のバイトを上位アドレスとして実効アドレスとします。
NES.prototype.GetAddressAbsolute = function () {
	var address = this.Get16(this.PC);
	this.PC += 2;
	return address;
};

// Indexed Zero Page Addressing X
// 上位アドレスとして$00、 下位アドレスとして2番目のバイトにインデックスレジスタXを加算した値を実効アドレスとします。
NES.prototype.GetAddressZeroPageX = function () {
	return (this.GetAddressZeroPage() + this.X) & 0xFF;
};


// Indexed Zero Page Addressing Y
// 上位アドレスとして$00、 下位アドレスとして2番目のバイトにインデックスレジスタYを加算した値を実効アドレスとします。
NES.prototype.GetAddressZeroPageY = function () {
	return (this.GetAddressZeroPage() + this.Y) & 0xFF;
};

// Indexed Indirect Addressing
// 上位アドレスを$00とし、 また2番目のバイトにインデックスレジスタXを加算した値を下位アドレスとします。
// このアドレスに格納されている値を実効アドレスの下位バイト、
// そしてその次のアドレスに格納されている値を実効アドレスの上位バイトとします。
// このインクリメントにおいてキャリーは無視します。
NES.prototype.GetAddressIndirectX = function () {
	var tmp = (this.GetAddressZeroPage() + this.X) & 0xFF;
	return this.Get(tmp) | (this.Get((tmp + 1) & 0xFF) << 8);
};

// Indirect Indexed Addressing
// まず上位アドレスを$00とし、下位アドレスとして2番目のバイトを使用します。
// このアドレスに格納されている値を次の上位アドレス、
// その次のアドレスに格納されている値を次の下位アドレスとします。
// このときのインクリメントにおけるキャリーは無視します。
// 得られたアドレスにインデックスレジスタYを加算したものを実効アドレスとします。
NES.prototype.GetAddressIndirectY = function () {
	var tmp = this.GetAddressZeroPage();
	tmp = this.Get(tmp) | (this.Get((tmp + 1) & 0xFF) << 8);
	var address = tmp + this.Y;

	// 加算によって桁上りしたら
	if(((address ^ tmp) & 0x100) > 0) {
		this.CPUClock += 1;
	}
	return address;
};

// Indexed Absolute Addressing X
// 2番目のバイトを下位アドレス、3番目のバイトを上位アドレスとして、
// このアドレスにインデックスレジスタXを加算したものを実効アドレスとします。
NES.prototype.GetAddressAbsoluteX = function () {
	var tmp = this.GetAddressAbsolute();
	var address = tmp + this.X;

	// 加算によって桁上りしたら
	if(((address ^ tmp) & 0x100) > 0) {
		this.CPUClock += 1;
	}
	return address;
};

// Indexed Absolute Addressing Y
// 2番目のバイトを下位アドレス、3番目のバイトを上位アドレスとして、
// このアドレスにインデックスレジスタYを加算したものを実効アドレスとします。
NES.prototype.GetAddressAbsoluteY = function () {
	var tmp = this.GetAddressAbsolute();
	var address = tmp + this.Y;

	// 加算によって桁上りしたら
	if(((address ^ tmp) & 0x100) > 0) {
		this.CPUClock += 1;
	}
	return address;
};

/* **************************************************************** */
/* NES CPU スタック
/* **************************************************************** */

// スタックにpush
NES.prototype.Push = function (data) {
	// スタック領域: 0x0100~0x01FF
	this.RAM[0x100 + this.S] = data;
	this.S = (this.S - 1) & 0xFF;
};


// スタックからpop
NES.prototype.Pop = function () {
	// スタック領域: 0x0100~0x01FF
	this.S = (this.S + 1) & 0xFF;
	return this.RAM[0x100 + this.S];
};

/* **************************************************************** */
/* NES CPU オペコード
/* **************************************************************** */

// Aレジスタにロード
NES.prototype.LDA = function (address) {
	this.A = this.Get(address);
	// N と Z をクリア -> 演算結果のbit7をNにストア
	this.P = this.P & 0x7D | this.ZNCacheTable[this.A];
};


// Xレジスタにロード
NES.prototype.LDX = function (address) {
	this.X = this.Get(address);
	// N と Z をクリア -> 演算結果のbit7をNにストア
	this.P = this.P & 0x7D | this.ZNCacheTable[this.X]; // 0x7D = 0b01111101
};


// Yレジスタにロード
NES.prototype.LDY = function (address) {
	this.Y = this.Get(address);
	// N と Z をクリア -> 演算結果のbit7をNにストア
	this.P = this.P & 0x7D | this.ZNCacheTable[this.Y];
};


// Aレジスタをストア
NES.prototype.STA = function (address) {
	this.Set(address, this.A);
};


// Xレジスタをストア
NES.prototype.STX = function (address) {
	this.Set(address, this.X);
};


// Yレジスタをストア
NES.prototype.STY = function (address) {
	this.Set(address, this.Y);
};

// XレジスタをAレジスタにコピー
NES.prototype.TXA = function () {
	this.A = this.X;

	// N と Z をクリア -> 演算結果のbit7をNにストア
	this.P = this.P & 0x7D | this.ZNCacheTable[this.A];
};

// YレジスタをAレジスタにコピー
NES.prototype.TYA = function () {
	this.A = this.Y;

	// N と Z をクリア -> 演算結果のbit7をNにストア
	this.P = this.P & 0x7D | this.ZNCacheTable[this.A];
};

// XレジスタをSレジスタにコピー
NES.prototype.TXS = function () {
	this.S = this.X;
};

// AレジスタをYレジスタにコピー
NES.prototype.TAY = function () {
	this.Y = this.A;

	// N と Z をクリア -> 演算結果のbit7をNにストア
	this.P = this.P & 0x7D | this.ZNCacheTable[this.A];
};

// AレジスタをXレジスタにコピー
NES.prototype.TAX = function () {
	this.X = this.A;

	// N と Z をクリア -> 演算結果のbit7をNにストア
	this.P = this.P & 0x7D | this.ZNCacheTable[this.A];
};

// SレジスタをXレジスタにコピー
NES.prototype.TSX = function () {
	this.X = this.S;

	// N と Z をクリア -> 演算結果のbit7をNにストア
	this.P = this.P & 0x7D | this.ZNCacheTable[this.X];
};

// ステータスレジスタをプッシュする
NES.prototype.PHP = function () {
	// BRK割り込みをセット
	// 0x30 = 0b00110000
	this.Push(this.P | 0x30);
};

// ステータスレジスタをポップする
NES.prototype.PLP = function () {
	this.P = this.Pop();
};

// Aレジスタをプッシュする
NES.prototype.PHA = function () {
	this.Push(this.A);
};

// Aレジスタをポップする
NES.prototype.PLA = function () {
	this.A = this.Pop();
	// N と Z をクリア -> 演算結果のbit7をNにストア
	this.P = this.P & 0x7D | this.ZNCacheTable[this.A];
};

NES.prototype.Adder = function (data) {
	var carry_flag = this.P & 0x01;
	var tmp = this.A + data + carry_flag;

	//this.HalfCarry = ((this.A & 0x0F) + (data & 0x0F) + carry_flag) >= 0x10 ? true : false;

	// 0x3C = 0b00111100
	this.P = this.P & 0x3C;

	// TODO: 引き続き調査
	// 0x80 = 0b10000000
	this.P |= (~(this.A ^ data) & (this.A ^ tmp) & 0x80) >>> 1;
	this.P |= (tmp >>> 8);
	this.P |= this.ZNCacheTable[tmp & 0xFF];
	this.A = tmp & 0xFF;
};

// (A + メモリ + キャリーフラグ) を演算して結果をAへ返します
NES.prototype.ADC = function (address) {
	this.Adder(this.Get(address));

	/*if((this.P & 0x08) === 0x08) {
		if((this.A & 0x0F) > 0x09 || this.HalfCarry)
			this.A += 0x06;
		if((this.A & 0xF0) > 0x90 || (this.P & 0x01) === 0x01)
			this.A += 0x60;
		if(this.A > 0xFF) {
			this.A &= 0xFF;
			this.P |= 0x01;
		}
	}*/
};


// (A - メモリ + キャリーフラグ) を演算して結果をAへ返します
NES.prototype.SBC = function (address) {
	this.Adder(~this.Get(address) & 0xFF);

	/*if((this.P & 0x08) === 0x08) {
		if((this.A & 0x0F) > 0x09 || !this.HalfCarry)
			this.A -= 0x06;
		if((this.A & 0xF0) > 0x90 || (this.P & 0x01) === 0x00)
			this.A -= 0x60;
	}*/
};

// TODO: 調べる
// Aレジスタと比較する
NES.prototype.CMP = function (address) {
	// 0x7C = 0b01111100
	this.P = this.P & 0x7C | this.ZNCacheTableCMP[(this.A - this.Get(address)) & 0x1FF];
};


// TODO: 調べる
// Xレジスタと比較する
NES.prototype.CPX = function (address) {
	this.P = this.P & 0x7C | this.ZNCacheTableCMP[(this.X - this.Get(address)) & 0x1FF];
};


// TODO: 調べる
// Yレジスタと比較する
NES.prototype.CPY = function (address) {
	this.P = this.P & 0x7C | this.ZNCacheTableCMP[(this.Y - this.Get(address)) & 0x1FF];
};

// AレジスタとAND演算をする
NES.prototype.AND = function (address) {
	this.A &= this.Get(address);

	// N と Z をクリア -> 演算結果のbit7をNにストア
	this.P = this.P & 0x7D | this.ZNCacheTable[this.A];
};

// AレジスタとEX-OR演算をする
NES.prototype.EOR = function (address) {
	this.A ^= this.Get(address);

	// N と Z をクリア -> 演算結果のbit7をNにストア
	this.P = this.P & 0x7D | this.ZNCacheTable[this.A];
};

// AレジスタとOR演算をする
NES.prototype.ORA = function (address) {
	this.A |= this.Get(address);

	// N と Z をクリア -> 演算結果のbit7をNにストア
	this.P = this.P & 0x7D | this.ZNCacheTable[this.A];
};

// AレジスタとAND比較をする
NES.prototype.BIT = function (address) {
	var x = this.Get(address);
	// 0x3D = 0b00111101
	// 0x02 = 0b00000010
	// 0xC0 = 0b11000000
	// TODO: 調べる
	this.P = this.P & 0x3D | this.ZNCacheTable[x & this.A] & 0x02 | x & 0xC0;
};


NES.prototype.ASL_Sub = function (data) {
	this.P = this.P & 0xFE | (data >> 7);
	data = (data << 1) & 0xFF;
	this.P = this.P & 0x7D | this.ZNCacheTable[data];
	return data;
};

// 左シフト
// TODO: 調べる
NES.prototype.ASL = function (address) {
	this.Set(address, this.ASL_Sub(this.Get(address)));
};


NES.prototype.LSR_Sub = function (data) {
	this.P = this.P & 0x7C | data & 0x01;
	data >>= 1;
	this.P |= this.ZNCacheTable[data];
	return data;
};

// 右シフト
// TODO: 調べる
NES.prototype.LSR = function (address) {
	this.Set(address, this.LSR_Sub(this.Get(address)));
};


NES.prototype.ROL_Sub = function (data) {
	var carry = data >> 7;
	data = (data << 1) & 0xFF | this.P & 0x01;
	this.P = this.P & 0x7C | carry | this.ZNCacheTable[data];
	return data;
};

// 左ローテイト
// TODO: 調べる
NES.prototype.ROL = function (address) {
	this.Set(address, this.ROL_Sub(this.Get(address)));
};


NES.prototype.ROR_Sub = function (data) {
	var carry = data & 0x01;
	data = (data >> 1) | ((this.P & 0x01) << 7);
	this.P = this.P & 0x7C | carry | this.ZNCacheTable[data];
	return  data;
};


// 右ローテイト
// TODO: 調べる
NES.prototype.ROR = function (address) {
	this.Set(address, this.ROR_Sub(this.Get(address)));
};

// 1を加算する
NES.prototype.INC = function (address) {
	var data = (this.Get(address) + 1) & 0xFF;

	// N と Z をクリア -> 演算結果のbit7をNにストア
	this.P = this.P & 0x7D | this.ZNCacheTable[data];
	this.Set(address, data);
};

// 1を減算する
NES.prototype.DEC = function (address) {
	var data = (this.Get(address) - 1) & 0xFF;

	// N と Z をクリア -> 演算結果のbit7をNにストア
	this.P = this.P & 0x7D | this.ZNCacheTable[data];
	this.Set(address, data);
};

// Xレジスタに1を加算
NES.prototype.INX = function () {
	this.X = (this.X + 1) & 0xFF;

	// N と Z をクリア -> 演算結果のbit7をNにストア
	this.P = this.P & 0x7D | this.ZNCacheTable[this.X];
};

// Yレジスタに1を加算
NES.prototype.INY = function () {
	this.Y = (this.Y + 1) & 0xFF;

	// N と Z をクリア -> 演算結果のbit7をNにストア
	this.P = this.P & 0x7D | this.ZNCacheTable[this.Y];
};

// Xレジスタに1を減算
NES.prototype.DEX = function () {
	this.X = (this.X - 1) & 0xFF;

	// N と Z をクリア -> 演算結果のbit7をNにストア
	this.P = this.P & 0x7D | this.ZNCacheTable[this.X];
};

// Yレジスタに1を減算
NES.prototype.DEY = function () {
	this.Y = (this.Y - 1) & 0xFF;

	// N と Z をクリア -> 演算結果のbit7をNにストア
	this.P = this.P & 0x7D | this.ZNCacheTable[this.Y];
};

// 何もしない
NES.prototype.NOP = function () {
};

// Cフラグをクリア
NES.prototype.CLC = function () {
	this.P &= 0xFE;
};

// Iフラグをクリア
NES.prototype.CLC = function () {
	this.P &= 0xFB;
};

// Iフラグをクリア
NES.prototype.CLV = function () {
	this.P &= 0xBF;
};

// Dフラグをクリア
NES.prototype.CLD = function () {
	this.P &= 0xF7;
};

// Cフラグをセット
NES.prototype.SEC = function () {
	this.P |= 0x01;
};

// Iフラグをセット
NES.prototype.SEI = function () {
	this.P |= 0x04;
};

// Dフラグをセット
NES.prototype.SED = function () {
	this.P |= 0x08;
};

// ジャンプ
NES.prototype.JMP = function (address) {
	this.PC = address;
};

// サブルーチン呼び出し
NES.prototype.JSR = function () {
	var PC = (this.PC + 1) & 0xFFFF;
	this.Push(PC >> 8);
	this.Push(PC & 0xFF);
	this.JMP(this.GetAddressAbsolute());
};

// サブルーチンから復帰
NES.prototype.RTS = function () {
	this.PC = (this.Pop() | (this.Pop() << 8)) + 1;
};

// 割り込みから復帰
NES.prototype.RTI = function () {
	this.P = this.Pop();
	this.PC = this.Pop() | (this.Pop() << 8);
};

// キャリーフラグが立っていない時ジャンプ
NES.prototype.BCC = function () {
	this.Branch((this.P & 0x01) === 0);
};

// キャリーフラグが立っている時ジャンプ
NES.prototype.BCS = function () {
	this.Branch((this.P & 0x01) !== 0);
};

// ネガティブフラグが立っていない時ジャンプ
NES.prototype.BPL = function () {
	this.Branch((this.P & 0x80) === 0);
};

// ネガティブフラグが立っている時ジャンプ
NES.prototype.BMI = function () {
	this.Branch((this.P & 0x80) !== 0);
};

// オーバーフローフラグが立っていない時ジャンプ
NES.prototype.BVC = function () {
	this.Branch((this.P & 0x40) === 0);
};

// オーバーフローフラグが立っている時ジャンプ
NES.prototype.BVS = function () {
	this.Branch((this.P & 0x40) !== 0);
};

// ゼロフラグが立っていない時ジャンプ
NES.prototype.BNE = function () {
	this.Branch((this.P & 0x02) === 0);
};

// ゼロフラグが立っている時ジャンプ
NES.prototype.BEQ = function () {
	this.Branch((this.P & 0x02) !== 0);
};

// 条件分岐命令
NES.prototype.Branch = function (state) {
	if(!state) {
		this.PC++;
		return;
	}
	var displace = this.Get(this.PC);
	var tmp = this.PC + 1;
	this.PC = (tmp + (displace >= 128 ? displace - 256 : displace)) & 0xFFFF;

	this.CPUClock += (((tmp ^ this.PC) & 0x100) > 0) ? 2 : 1;
};


/* Undocument */
NES.prototype.ANC = function (address) {
	this.A &= this.Get(address);
	this.P = this.P & 0x7D | this.ZNCacheTable[this.A];
	this.P = this.P & 0xFE | (this.A >>> 7);
};


NES.prototype.ANE = function (address) {
	this.A = (this.A | 0xEE) & this.X & this.Get(address);
	this.P = this.P & 0x7D | this.ZNCacheTable[this.A];
};


NES.prototype.ARR = function (address) {
	this.A &= this.Get(address);
	this.A = (this.A >> 1) | ((this.P & 0x01) << 7);
	this.P = this.P & 0x7D | this.ZNCacheTable[this.A];

	this.P = (this.P & 0xFE) | ((this.A & 0x40) >> 6);

	var tmp = (this.A ^ (this.A << 1)) & 0x40;
	this.P = (this.P & 0xBF) | tmp;
};


NES.prototype.ASR = function (address) {
	this.A &= this.Get(address);

	this.P = (this.P & 0xFE) | (this.A & 0x01);

	this.A = this.A >> 1;
	this.P = this.P & 0x7D | this.ZNCacheTable[this.A];
};


NES.prototype.DCP = function (address) {
	var tmp = (this.Get(address) - 1) & 0xFF;
	this.P = this.P & 0x7C | this.ZNCacheTableCMP[(this.A - tmp) & 0x1FF];
	this.Set(address, tmp);
};


NES.prototype.ISB = function (address) {
	var tmp = (this.Get(address) + 1) & 0xFF;
	this.Adder(~tmp & 0xFF);
	this.Set(address, tmp);
};


NES.prototype.LAS = function (address) {
	var tmp = this.Get(address) & this.S;
	this.A = this.X = this.S = tmp;
	this.P = this.P & 0x7D | this.ZNCacheTable[this.A];
};


NES.prototype.LAX = function (address) {
	this.A = this.X = this.Get(address);
	this.P = this.P & 0x7D | this.ZNCacheTable[this.A];
};


NES.prototype.LXA = function (address) {
	var tmp = (this.A | 0xEE) & this.Get(address);
	this.A = this.X = tmp;
	this.P = this.P & 0x7D | this.ZNCacheTable[this.A];
};


NES.prototype.RLA = function (address) {
	var tmp = this.Get(address);
	tmp = (tmp << 1) | (this.P & 0x01);
	this.P = (this.P & 0xFE) | (tmp >> 8);
	this.A &= tmp;
	this.P = this.P & 0x7D | this.ZNCacheTable[this.A];
	this.Set(address, tmp);
};


NES.prototype.RRA = function (address) {
	var tmp = this.Get(address);
	var c = tmp & 0x01;
	tmp = (tmp >> 1) | ((this.P & 0x01) << 7);
	this.P = (this.P & 0xFE) | c;
	this.Adder(tmp);
	this.Set(address, tmp);
};


NES.prototype.SAX = function (address) {
	var tmp = this.A & this.X;
	this.Set(address, tmp);
};


NES.prototype.SBX = function (address) {
	var tmp = (this.A & this.X) - this.Get(address);
	this.P = (this.P & 0xFE) | ((~tmp >> 8) & 0x01);
	this.X = tmp & 0xFF;
	this.P = this.P & 0x7D | this.ZNCacheTable[this.X];
};


NES.prototype.SHA = function (address) {
	var tmp = this.A & this.X & ((address >> 8) + 1);
	this.Set(address, tmp);
};


NES.prototype.SHS = function (address) {
	this.S = this.A & this.X;
	var tmp = this.S & ((address >> 8) + 1);
	this.Set(address, tmp);
};


NES.prototype.SHX = function (address) {
	var tmp = this.X & ((address >> 8) + 1);
	this.Set(address, tmp);
};


NES.prototype.SHY = function (address) {
	var tmp = this.Y & ((address >> 8) + 1);
	this.Set(address, tmp);
};


NES.prototype.SLO = function (address) {
	var tmp = this.Get(address);
	this.P = (this.P & 0xFE) | (tmp >> 7);
	tmp = (tmp << 1) & 0xFF;
	this.A |= tmp;
	this.P = this.P & 0x7D | this.ZNCacheTable[this.A];
	this.Set(address, tmp);
};


NES.prototype.SRE = function (address) {
	var tmp = this.Get(address);
	this.P = (this.P & 0xFE) | (tmp & 0x01);
	tmp >>= 1;
	this.A ^= tmp;
	this.P = this.P & 0x7D | this.ZNCacheTable[this.A];
	this.Set(address, tmp);
};


/* **************************************************************** */
/* NES PPU
/* **************************************************************** */

NES.prototype.PpuInit = function () {
	this.ScrollRegisterFlag = false;
	this.PPUAddressRegisterFlag = false;
	this.HScrollTmp = 0;
	this.PPUAddress = 0;
	this.PPUAddressBuffer = 0;

	this.Palette = new Array(33);

	var i;
	for(i=0; i<this.Palette.length; i++) {
		this.Palette[i] = 0x0F;
	}

	this.SpriteLineBuffer = new Array(256);
	for(i=0; i<this.SpriteLineBuffer.length; i++) {
		this.SpriteLineBuffer[i] = 0;
	}

	this.PPUReadBuffer = 0;

	if(this.FourScreen) {
		this.SetMirrors(0, 1, 2, 3);
	}
	else {
		this.SetMirror(this.HMirror);
	}

	this.BgLineBuffer = new Array(256 + 8);

	this.PpuX = 341;
	this.PpuY = 0;

	this.Sprite0Line = false;
};


NES.prototype.SetMirror = function (value) {
	if(value)
		this.SetMirrors(0, 0, 1, 1);
	else
		this.SetMirrors(0, 1, 0, 1);
};


NES.prototype.SetMirrors = function (value0, value1, value2, value3) {
	this.SetChrRomPage1K( 8, value0 + 8 + 0x0100);
	this.SetChrRomPage1K( 9, value1 + 8 + 0x0100);
	this.SetChrRomPage1K(10, value2 + 8 + 0x0100);
	this.SetChrRomPage1K(11, value3 + 8 + 0x0100);
};


NES.prototype.SetChrRomPage1K = function (page, romPage){
	if(romPage >= 0x0100) {
		this.CHRROM_STATE[page] = romPage;
		this.VRAM[page] = this.VRAMS[romPage & 0xFF];
	} else {
		if(this.ChrRomPageCount > 0) {
			this.CHRROM_STATE[page] = romPage % (this.ChrRomPageCount * 8);
			this.VRAM[page] = this.CHRROM_PAGES[this.CHRROM_STATE[page]];
		}
	}
};


NES.prototype.SetChrRomPages1K = function (romPage0, romPage1, romPage2, romPage3, romPage4, romPage5, romPage6, romPage7){
	this.SetChrRomPage1K(0, romPage0);
	this.SetChrRomPage1K(1, romPage1);
	this.SetChrRomPage1K(2, romPage2);
	this.SetChrRomPage1K(3, romPage3);
	this.SetChrRomPage1K(4, romPage4);
	this.SetChrRomPage1K(5, romPage5);
	this.SetChrRomPage1K(6, romPage6);
	this.SetChrRomPage1K(7, romPage7);
};


NES.prototype.SetChrRomPage = function (num){
	num <<= 3;
	for(var i=0; i<8; i++)
		this.SetChrRomPage1K(i, num + i);
};


// Canvasを初期化(真っ黒画面にする)
NES.prototype.initCanvas = function () {
	if(!this.ctx) {
		return false;
	}

	this.ImageData = this.ctx.createImageData(256, 224);

	for(var i=0; i<256*224*4; i+=4) {
		this.ImageData.data[i + 3] = 0xFF;
	}
	this.ctx.putImageData(this.ImageData, 0, 0);
	return true;
};


NES.prototype.PpuRun = function () {
	var tmpx = this.PpuX;

	// PPUクロック数 = CPUクロック数の3倍
	this.PpuX += this.CPUClock * 3;

	// PPUは341クロックで一つのラインの描画と次のラインの準備を行います
	while(this.PpuX >= 341) {
		// 画面を表示するかどうか
		var IsScreenEnable = (this.IO1[0x01] & 0x08) === 0x08; // 0b00001000
		// スプライトを画面に表示するかどうかを設定
		var IsSpriteEnable = (this.IO1[0x01] & 0x10) === 0x10; // 0b00010000

		this.PpuX -= 341;
		tmpx = 0;
		this.Sprite0Line = false;
		this.PpuY++;

		// 垂直回帰時間の終了
		if(this.PpuY === 262) {
			this.PpuY = 0;
			if(IsScreenEnable || IsSpriteEnable) {
				this.PPUAddress = this.PPUAddressBuffer;
			}
			// VBlankフラグを消去
			this.IO1[0x02] &= 0x7F; // 0x7F = 0b01111111
		}

		this.Mapper.HSync(this.PpuY);

		// 画面の描画終了
		if(this.PpuY === 240) {
			this.ctx.putImageData(this.ImageData, 0, 0);

			this.DrawFlag = true;
			this.ScrollRegisterFlag = false;

			// VBlankフラグをクリア
			// スプライトヒットをクリア
			// スキャンラインスプライト数をクリア
			this.IO1[0x02] &= 0x1F; // 0x1F = 0b00011111

			// VBlankフラグを立てる
			this.IO1[0x02] |= 0x80; // 0x80 = 0b10000000

			// VBlank時のNMI割り込み
			this.toNMI = (this.IO1[0x00] & 0x80) === 0x80;
			continue;
		}

		// 画面描画中
		if(this.PpuY < 240) {
			var p;
			var tmpDist;
			var tmpPal;
			if(IsScreenEnable || IsSpriteEnable) {
				// 0xFBE0 = 0b 11111011 11100000
				// 0x041F = 0b 00000100 00011111
				this.PPUAddress = (this.PPUAddress & 0xFBE0) | (this.PPUAddressBuffer & 0x041F);

				// 上下8ラインは画面表示されない
				if(8 <= this.PpuY && this.PpuY < 232) {
					this.BuildBGLine();
					this.BuildSpriteLine();

					tmpDist = (this.PpuY - 8) << 10;
					for(p=0; p<256; p++, tmpDist+=4) {
						tmpPal = this.PaletteTable[this.Palette[this.BgLineBuffer[p]]];
						this.ImageData.data[tmpDist]     = tmpPal[0];
						this.ImageData.data[tmpDist + 1] = tmpPal[1];
						this.ImageData.data[tmpDist + 2] = tmpPal[2];
					}
				} else {
					for(p=0; p<264; p++)
						this.BgLineBuffer[p] = 0x10;
					this.BuildSpriteLine();
				}

				if((this.PPUAddress & 0x7000) === 0x7000) {
					this.PPUAddress &= 0x8FFF;
					if((this.PPUAddress & 0x03E0) === 0x03A0)
						this.PPUAddress = (this.PPUAddress ^ 0x0800) & 0xFC1F;
					else if((this.PPUAddress & 0x03E0) === 0x03E0)
						this.PPUAddress &= 0xFC1F;
					else
						this.PPUAddress += 0x0020;
				} else
					this.PPUAddress += 0x1000;

			}
			// 上下8ラインは画面表示されない
			else if(8 <= this.PpuY && this.PpuY < 232) {
				tmpDist = (this.PpuY - 8) << 10;
				tmpPal = this.PaletteTable[this.Palette[0x10]];
				for(p=0; p<256; p++, tmpDist += 4) {
					this.ImageData.data[tmpDist]     = tmpPal[0];
					this.ImageData.data[tmpDist + 1] = tmpPal[1];
					this.ImageData.data[tmpDist + 2] = tmpPal[2];
				}
			}
		}
	}

	// 0番スプライトヒット検出
	if(this.Sprite0Line && (this.IO1[0x02] & 0x40) !== 0x40) { // 0x40 = 0b01000000
		var i = this.PpuX > 255 ? 255 : this.PpuX;
		for(; tmpx<=i; tmpx++) {
			if(this.SpriteLineBuffer[tmpx] === 0) {
				this.IO1[0x02] |= 0x40; // スプライトヒット
				break;
			}
		}
	}
};


NES.prototype.BuildBGLine = function () {
	var p;
	var tmpBgLineBuffer = this.BgLineBuffer;
	if((this.IO1[0x01] & 0x08) !== 0x08) {
		for(p=0; p<264; p++)
			tmpBgLineBuffer[p] = 0x10;
		return;
	}

	this.Mapper.BuildBGLine();

	if((this.IO1[0x01] & 0x02) !== 0x02) {
		for(p=0; p<8; p++)
			tmpBgLineBuffer[p] = 0x10;
	}
};


NES.prototype.BuildBGLine_SUB = function () {
	var tmpBgLineBuffer = this.BgLineBuffer;
	var tmpVRAM = this.VRAM;
	var nameAddr = 0x2000 | (this.PPUAddress & 0x0FFF);
	var tableAddr = ((this.PPUAddress & 0x7000) >> 12) | (this.IO1[0x00] & 0x10) << 8;
	var nameAddrHigh = nameAddr >> 10;
	var nameAddrLow = nameAddr & 0x03FF;
	var tmpVRAMHigh = tmpVRAM[nameAddrHigh];
	var tmpPaletteArray = this.PaletteArray;
	var tmpSPBitArray = this.SPBitArray;

	var q = 0;
	var s = this.HScrollTmp;

	for(var p=0; p<33; p++) {
		var ptnDist = (tmpVRAMHigh[nameAddrLow] << 4) | tableAddr;
		var tmpSrcV = tmpVRAM[ptnDist >> 10];
		ptnDist &= 0x03FF;
		var attr = ((tmpVRAMHigh[((nameAddrLow & 0x0380) >> 4) | ((nameAddrLow & 0x001C) >> 2) + 0x03C0] << 2) >> (((nameAddrLow & 0x0040) >> 4) | (nameAddrLow & 0x0002))) & 0x0C;
		var ptn = tmpSPBitArray[tmpSrcV[ptnDist]][tmpSrcV[ptnDist + 8]];

		for(; s<8; s++, q++)
			tmpBgLineBuffer[q] = tmpPaletteArray[ptn[s] | attr];
		s = 0;

		if((nameAddrLow & 0x001F) === 0x001F) {
			nameAddrLow &= 0xFFE0;
			tmpVRAMHigh = tmpVRAM[(nameAddrHigh ^= 0x01)];
		} else
			nameAddrLow++;
	}
};


NES.prototype.BuildSpriteLine = function () {
	this.Mapper.BuildSpriteLine();
};


NES.prototype.BuildSpriteLine_SUB = function () {
	var tmpBgLineBuffer = this.BgLineBuffer;
	var tmpIsSpriteClipping = (this.IO1[0x01] & 0x04) === 0x04 ? 0 : 8;

	if((this.IO1[0x01] & 0x10) === 0x10) {
		var tmpSpLine = this.SpriteLineBuffer;
		for(var p=0; p<256; p++)
			tmpSpLine[p] = 256;

		var tmpSpRAM = this.SPRITE_RAM;
		var tmpBigSize = (this.IO1[0x00] & 0x20) === 0x20 ? 16 : 8;
		var tmpSpPatternTableAddress = (this.IO1[0x00] & 0x08) << 9;

		var tmpVRAM = this.VRAM;
		var tmpSPBitArray = this.SPBitArray;

		var lineY = this.PpuY;
		var count = 0;

		for(var i=0; i<=252; i+=4) {
			var isy = tmpSpRAM[i] + 1;
			if(isy > lineY || (isy + tmpBigSize) <= lineY)
				continue;

			if(i === 0)
				this.Sprite0Line = true;

			if(++count === 9)
				break;

			var x = tmpSpRAM[i + 3];
			var ex = x + 8;
			if(ex > 256)
				ex = 256;

			var attr = tmpSpRAM[i + 2];

			var attribute = ((attr & 0x03) << 2) | 0x10;
			var bgsp = (attr & 0x20) === 0x00;

			var iy = (attr & 0x80) === 0x80 ? tmpBigSize - 1 - (lineY - isy) : lineY - isy;
			var tileNum = ((iy & 0x08) << 1) + (iy & 0x07) +
				(tmpBigSize === 8 ? (tmpSpRAM[i + 1] << 4) + tmpSpPatternTableAddress : ((tmpSpRAM[i + 1] & 0xFE) << 4) + ((tmpSpRAM[i + 1] & 0x01) << 12));
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
					if(x >= tmpIsSpriteClipping && (bgsp || tmpBgLineBuffer[x] === 0x10))
							tmpBgLineBuffer[x] = tmpPtn | attribute;
				}
			}
		}

		if(count >= 8)
			this.IO1[0x02] |= 0x20;
		else
			this.IO1[0x02] &= 0xDF;
	}
};


NES.prototype.WriteScrollRegister = function (value) {
	this.IO1[0x05] = value;

	if(this.ScrollRegisterFlag) {
		this.PPUAddressBuffer = (this.PPUAddressBuffer & 0x8C1F) | ((value & 0xF8) << 2) | ((value & 0x07) << 12);
	} else {
		this.PPUAddressBuffer = (this.PPUAddressBuffer & 0xFFE0) | ((value & 0xF8) >> 3);
		this.HScrollTmp = value & 7;
	}
	this.ScrollRegisterFlag = !this.ScrollRegisterFlag;
};


NES.prototype.WritePPUControlRegister0 = function (value) {
	this.IO1[0x00] = value;

	this.PPUAddressBuffer = (this.PPUAddressBuffer & 0xF3FF) | ((value & 0x03) << 10);
};


NES.prototype.WritePPUControlRegister1 = function (value) {
	this.IO1[0x01] = value;
};


NES.prototype.WritePPUAddressRegister = function (value) {
	this.IO1[0x06] = value;

	if(this.PPUAddressRegisterFlag)
		this.PPUAddress = this.PPUAddressBuffer = (this.PPUAddressBuffer & 0xFF00) | value;
	else
		this.PPUAddressBuffer = (this.PPUAddressBuffer & 0x00FF) | ((value & 0x3F) << 8);
	this.PPUAddressRegisterFlag = !this.PPUAddressRegisterFlag;
};


NES.prototype.ReadPPUStatus = function () {
	var result = this.IO1[0x02];

	// TODO: V-Blank 終了?
	this.IO1[0x02] &= 0x1F;
	this.ScrollRegisterFlag = false;
	this.PPUAddressRegisterFlag = false;
	return result;
};


NES.prototype.ReadPPUData = function () {
	return this.Mapper.ReadPPUData();
};


NES.prototype.ReadPPUData_SUB = function () {
	var tmp = this.PPUReadBuffer;
	var addr = this.PPUAddress & 0x3FFF;
	this.PPUReadBuffer = this.VRAM[addr >> 10][addr & 0x03FF];
	this.PPUAddress = (this.PPUAddress + ((this.IO1[0x00] & 0x04) === 0x04 ? 32 : 1)) & 0xFFFF;
	return tmp;
};


NES.prototype.WritePPUData = function (value) {
	this.Mapper.WritePPUData(value);
};


NES.prototype.WritePPUData_SUB = function (value) {
	this.IO1[0x07] = value;

	var tmpPPUAddress = this.PPUAddress & 0x3FFF;

	this.VRAM[tmpPPUAddress >> 10][tmpPPUAddress & 0x03FF] = value;

	if(tmpPPUAddress < 0x3000) {
		this.PPUAddress = (this.PPUAddress + ((this.IO1[0x00] & 0x04) === 0x04 ? 32 : 1)) & 0xFFFF;
		return;
	}

	if(tmpPPUAddress < 0x3EFF) {
		this.VRAM[(tmpPPUAddress - 0x1000) >> 10][(tmpPPUAddress - 0x1000) & 0x03FF] = value;
		this.PPUAddress = (this.PPUAddress + ((this.IO1[0x00] & 0x04) === 0x04 ? 32 : 1)) & 0xFFFF;
		return;
	}

	var palNo = tmpPPUAddress & 0x001F;
	if(palNo === 0x00 || palNo === 0x10)
		this.Palette[0x00] = this.Palette[0x10] = value & 0x3F;
	else
		this.Palette[palNo] = value & 0x3F;
	this.PPUAddress = (this.PPUAddress + ((this.IO1[0x00] & 0x04) === 0x04 ? 32 : 1)) & 0xFFFF;
};


NES.prototype.WriteSpriteData = function (data){
	this.SPRITE_RAM[this.IO1[0x03]] = data;
	this.IO1[0x03] = (this.IO1[0x03] + 1) & 0xFF;
};


NES.prototype.WriteSpriteAddressRegister = function (data) {
	this.IO1[0x03] = data;
};


NES.prototype.StartDMA = function (data) {
	var offset = data << 8;
	var tmpDist = this.SPRITE_RAM;
	var tmpSrc = this.RAM;
	for(var i = 0; i < 0x100; i++, offset++)
		tmpDist[i] = tmpSrc[offset];
	this.CPUClock += 514;
};

/* **************************************************************** */
/* NES RAM or ROM
/* **************************************************************** */

NES.prototype.StorageClear = function () {
	var i, j;
	for(i=0; i<this.RAM.length; i++) {
		this.RAM[i] = 0;
	}

	for(i=0; i<this.SRAM.length; i++) {
		this.SRAM[i] = 0;
	}

	for(i=0; i<this.PRGROM_STATE.length; i++) {
		this.PRGROM_STATE[i] = 0;
	}

	for(i=0; i<this.CHRROM_STATE.length; i++) {
		this.CHRROM_STATE[i] = 0;
	}

	for(i=0; i<this.VRAMS.length; i++) {
		for(j=0; j<this.VRAMS[i].length; j++) {
			this.VRAMS[i][j] = 0;
		}
		this.SetChrRomPage1K(i, i + 0x0100);
	}

	for(i=0; i<this.SPRITE_RAM.length; i++) {
		this.SPRITE_RAM[i] = 0;
	}

	for(i=0; i < 4; i++) {
		this.SetPrgRomPage8K(i, -(i + 1));
	}

	for(i=0; i<this.IO1.length; i++) {
		this.IO1[i] = 0;
	}

	for(i=0; i<this.IO2.length; i++) {
		this.IO2[i] = 0;
	}

	// APU Frame Counter
	// TODO: why?
	this.IO2[0x17] = 0x40;
};


NES.prototype.SetRom = function (arraybuffer) {
	if( ! (arraybuffer instanceof ArrayBuffer)) {
		return false;
	}

	var u8array = new Uint8Array(arraybuffer);

	var rom = [];
	// Uint8Array -> Array に変換
	for(var i=0; i < u8array.length; i++) {
		rom.push(u8array[i]);
	}

	// ROMがiNES format かどうかチェック
	if( ! (rom[0] === 0x4E && rom[1] === 0x45 && rom[2] === 0x53 && rom[3] === 0x1A)) {
		return false;
	}

	this.Rom = rom.concat(0);
	return true;
};

// PRGROM と CHRROMを読み込み
NES.prototype.StorageInit = function () {
	this.PRGROM_PAGES = null;
	this.CHRROM_PAGES = null;

	// iNES ファイルのヘッダーの長さ(16 Bytes)
	var nes_header_length = 0x0010;

	// PRGROMのページサイズ(16384 bytes)
	var prgrom_pagesize = 0x4000;

	// CHRROMのページサイズ(8192 bytes)
	var chrrom_pagesize = 0x2000;

	var i;

	if(this.PrgRomPageCount > 0) {
		// PRGROM読み込み(本プログラム上ではページをさらに 1/2 して扱う)
		this.PRGROM_PAGES = new Array(this.PrgRomPageCount * 2);

		for(i=0; i < this.PrgRomPageCount * 2; i++) {
			var prgrom_offset = nes_header_length + prgrom_pagesize / 2 * i;
			this.PRGROM_PAGES[i] = this.Rom.slice(
				prgrom_offset,
				prgrom_offset + prgrom_pagesize / 2
			);
		}
	}

	if(this.ChrRomPageCount > 0) {
		// PRGROM読み込み(本プログラム上ではページをさらに 1/8 して扱う)
		this.CHRROM_PAGES = new Array(this.ChrRomPageCount * 8);
		for(i=0; i < this.ChrRomPageCount * 8; i++) {
			var chrrom_offset = nes_header_length + prgrom_pagesize * this.PrgRomPageCount + chrrom_pagesize / 8 * i;
			this.CHRROM_PAGES[i] = this.Rom.slice(
				chrrom_offset,
				chrrom_offset + chrrom_pagesize / 2
			);
		}
	}
};


NES.prototype.Get = function (address) {
	switch(address & 0xE000) {
		// 2KB of work RAM and Mirror
		case 0x0000:
			// 0x0800 以降はwork RAMのMirror
			return this.RAM[address & 0x7FF];
		// PPU Ctrl Registers
		case 0x2000:
			// 0x0008 以降は PPU Ctrl Registers のMirror
			switch (address & 0x0007) {
				case 0x0000:
					// PPUCTRL
				case 0x0001:
					// PPUMASK
				case 0x0002:
					// PPUSTATUS
					return this.ReadPPUStatus();
				case 0x0003:
					// OAMADDR
				case 0x0004:
					// OAMDATA
				case 0x0005:
					// PPUSCROLL
				case 0x0006:
					// PPUADDR
				case 0x0007:
					// PPUDATA
					return this.ReadPPUData();
			}
			return 0;
		case 0x4000:
			if(address >= 0x4020) {
				// 拡張ROM
				return this.Mapper.ReadLow(address);
			}

			// Registers(Mostly APU)
			switch (address) {
				case 0x4000: // 矩形波制御レジスタ #1
				case 0x4001: // 矩形波制御レジスタ #2
				case 0x4002: // 矩形波周波数値レジスタ #1
				case 0x4003: // 矩形波周波数値レジスタ #2
				case 0x4004: // 矩形波制御レジスタ #1
				case 0x4005: // 矩形波制御レジスタ #2
				case 0x4006: // 矩形波周波数値レジスタ #1
				case 0x4007: // 矩形波周波数値レジスタ #2
				case 0x4008: // 三角波制御レジスタ #1
				case 0x4009: // 三角波制御レジスタ #2
				case 0x400A: // 三角波周波数値レジスタ #1
				case 0x400B: // 三角波周波数値レジスタ #2
				case 0x400C: // ノイズ制御レジスタ #1
				case 0x400D: // ノイズ制御レジスタ #2
				case 0x400E: // 周波数値レジスタ #1
				case 0x400F: // 周波数値レジスタ #2
				case 0x4010: // PCM 制御レジスタ #1
				case 0x4011: // PCM 音量制御レジスタ
				case 0x4012: // PCM アドレスレジスタ
				case 0x4013: // PCM データ長レジスタ
				case 0x4014: // SPRDMA (W) スプライト DMA
				case 0x4015: // SNDCNT (RW) サウンド制御レジスタ
					return this.ReadWaveControl();
				case 0x4016:
					// PAD I/O Register(1P)
					return this.ReadJoyPadRegister1();
				case 0x4017:
					// PAD I/O Register(2P)
					return this.ReadJoyPadRegister2();
				case 0x4018:
				case 0x4019:
				case 0x401A:
				case 0x401B:
				case 0x401C:
				case 0x401D:
				case 0x401E:
				case 0x401F:
			}

			// サウンドのドキュメントによると、
			// 0x40 が返ってくる確率が高いらしい
			return 0x40;
		case 0x6000:
			// 拡張RAM
			// セーブ用RAMを読み込み
			return this.Mapper.ReadSRAM(address);
		case 0x8000:
			// PRG-ROM
			return this.ROM[0][address & 0x1FFF];
		case 0xA000:
			// PRG-ROM
			return this.ROM[1][address & 0x1FFF];
		case 0xC000:
			// PRG-ROM
			return this.ROM[2][address & 0x1FFF];
		case 0xE000:
			// PRG-ROM
			return this.ROM[3][address & 0x1FFF];
	}
};


// 下位バイトをaddressから、上位バイトをaddress + 1からフェッチ
NES.prototype.Get16 = function (address) {
	return this.Get(address) | (this.Get(address + 1) << 8);
};


NES.prototype.Set = function (address, data) {
	switch(address & 0xE000) {
		// 2KB of work RAM and Mirror
		case 0x0000:
			// 0x0800 以降はwork RAMのMirror
			this.RAM[address & 0x7FF] = data;
			return;
		// PPU Ctrl Registers
		case 0x2000:
			// 0x0008 以降は PPU Ctrl Registers のMirror
			switch (address & 0x07) {
				case 0x00:
					// PPUCTRL
					this.WritePPUControlRegister0(data);
					return;
				case 0x01:
					// PPUMASK
					this.WritePPUControlRegister1(data);
					return;
				case 0x02:
					// PPUSTATUS
					return;
				case 0x03:
					// OAMADDR
					this.WriteSpriteAddressRegister(data);
					return;
				case 0x04:
					// OAMDATA
					this.WriteSpriteData(data);
					return;
				case 0x05:
					// PPUSCROLL
					this.WriteScrollRegister(data);
					return;
				case 0x06:
					// PPUADDR
					this.WritePPUAddressRegister(data);
					return;
				case 0x07:
					// PPUDATA
					this.WritePPUData(data);
					return;
			}
			return;
		case 0x4000:
			// Registers(Mostly APU)
			if(address < 0x4020) {
				// APU Registers
				// TODO: why?
				this.IO2[address & 0x00FF] = data;
				switch (address) {
					case 0x4000: // 矩形波制御レジスタ #1
					case 0x4001: // 矩形波制御レジスタ #2
					case 0x4002: // 矩形波周波数値レジスタ #1
						this.WriteCh1Length0();
						return;
					case 0x4003: // 矩形波周波数値レジスタ #2
						this.WriteCh1Length1();
						return;
					case 0x4004: // 矩形波制御レジスタ #1
					case 0x4005: // 矩形波制御レジスタ #2
					case 0x4006: // 矩形波周波数値レジスタ #1
						this.WriteCh2Length0();
						return;
					case 0x4007: // 矩形波周波数値レジスタ #2
						this.WriteCh2Length1();
						return;
					case 0x4008: // 三角波制御レジスタ #1
						this.WriteCh3LinearCounter();
						return;
					case 0x4009: // 三角波制御レジスタ #2
					case 0x4010: // PCM 制御レジスタ #1
					case 0x400A: // 三角波周波数値レジスタ #1
					case 0x400B: // 三角波周波数値レジスタ #2
						this.WriteCh3Length1();
						return;
					case 0x400C: // ノイズ制御レジスタ #1
					case 0x400D: // ノイズ制御レジスタ #2
					case 0x400E: // 周波数値レジスタ #1
					case 0x400F: // 周波数値レジスタ #2
						this.WriteCh4Length1();
						return;
					case 0x4010: // PCM 制御レジスタ #1
						this.WriteCh5DeltaControl();
						return;
					case 0x4011: // PCM 音量制御レジスタ
						this.WriteCh5DeltaCounter();
						return;
					case 0x4012: // PCM アドレスレジスタ
					case 0x4013: // PCM データ長レジスタ
					case 0x4014: // SPRDMA (W) スプライト DMA
						// PPU OAMDMA
						this.StartDMA(data);
						return;
					case 0x4015: // SNDCNT (RW) サウンド制御レジスタ
						this.WriteWaveControl();
						return;
					case 0x4016:
						// PAD I/O Register(1P)
						this.WriteJoyPadRegister1(data);
						return;
					case 0x4017:
						// PAD I/O Register(2P)
						return;
					case 0x4018:
					case 0x4019:
					case 0x401A:
					case 0x401B:
					case 0x401C:
					case 0x401D:
					case 0x401E:
					case 0x401F:
				}
				return;
			}
			// 拡張ROM
			this.Mapper.WriteLow(address, data);
			return;
		case 0x6000:
			// 拡張RAM
			// セーブ用RAMに書き込み
			this.Mapper.WriteSRAM(address, data);
			return;
		case 0x8000:
			// PRG-ROM
		case 0xA000:
			// PRG-ROM
		case 0xC000:
			// PRG-ROM
		case 0xE000:
			// PRG-ROM
			this.Mapper.Write(address, data);
			return;
	}
};

NES.prototype.SetPrgRomPage8K = function (page, romPage){
	if(romPage < 0) {
		this.PRGROM_STATE[page] = romPage;
		this.ROM[page] = this.ZEROS_ROM_PAGE; //All 0
	} else {
		this.PRGROM_STATE[page] = romPage % (this.PrgRomPageCount * 2);
		this.ROM[page] = this.PRGROM_PAGES[this.PRGROM_STATE[page]];
	}
};


NES.prototype.SetPrgRomPages8K = function (romPage0, romPage1, romPage2, romPage3){
	this.SetPrgRomPage8K(0, romPage0);
	this.SetPrgRomPage8K(1, romPage1);
	this.SetPrgRomPage8K(2, romPage2);
	this.SetPrgRomPage8K(3, romPage3);
};


NES.prototype.SetPrgRomPage = function (no, num){
	this.SetPrgRomPage8K(no * 2, num * 2);
	this.SetPrgRomPage8K(no * 2 + 1, num * 2 + 1);
};


/* **************************************************************** */
/* NES JoyPad
/* **************************************************************** */

NES.prototype.WriteJoyPadRegister1 = function (value) {
	// value の 0bit目が立っているかどうか
	var s = (value & 0x01) === 0x01 ? true : false;

	if(this.JoyPadStrobe && !s) { // 前回立ってて今回立ってない
		this.JoyPadBuffer[0] = this.JoyPadState[0];
		this.JoyPadBuffer[1] = this.JoyPadState[1];
	}
	this.JoyPadStrobe = s;
};

// N回読みだして、0bit目がセットされていれば押下されている
NES.prototype.ReadJoyPadRegister1 = function () {
	var result = this.JoyPadBuffer[0] & 0x01;
	this.JoyPadBuffer[0] >>>= 1;
	return result;
};
NES.prototype.ReadJoyPadRegister2 = function () {
	var result = this.JoyPadBuffer[1] & 0x01;
	this.JoyPadBuffer[1] >>>= 1;
	return result;
};


// キーコードをBitに変換
NES.prototype._keyCodeToBitCode = function(keyCode) {
	var data = {
		player: null,
		flag:   null,
	};

	switch(keyCode) {
		// player 1
		case 88:// X
		case 75:// K
			data.player = this.JOYPAD_1P;
			data.flag   = this.BUTTON_A;
			break;
		case 90:// Z
		case 74:// J
			data.player = this.JOYPAD_1P;
			data.flag   = this.BUTTON_B;
			break;
		case 65:// A
		case 188:// ,
			data.player = this.JOYPAD_1P;
			data.flag   = this.BUTTON_SELECT;
			break;
		case 13:// ENTER
		case 190:// .
			data.player = this.JOYPAD_1P;
			data.flag   = this.BUTTON_START;
			break;
		case 38:// ↑
		case 69:// E
			data.player = this.JOYPAD_1P;
			data.flag   = this.BUTTON_UP;
			break;
		case 40:// ↓
		case 68:// D
			data.player = this.JOYPAD_1P;
			data.flag   = this.BUTTON_DOWN;
			break;
		case 37:// ←
		case 83:// S
			data.player = this.JOYPAD_1P;
			data.flag   = this.BUTTON_LEFT;
			break;
		case 39:// →
		case 70:// F
			data.player = this.JOYPAD_1P;
			data.flag   = this.BUTTON_RIGHT;
			break;
		// player 2
		case 105:// Num7
			data.player = this.JOYPAD_2P;
			data.flag   = this.BUTTON_A;
			break;
		case 103:// Num9
			data.player = this.JOYPAD_2P;
			data.flag   = this.BUTTON_B;
			break;
		case 104:// Num8
			data.player = this.JOYPAD_2P;
			data.flag   = this.BUTTON_UP;
			break;
		case 98:// Num2
			data.player = this.JOYPAD_2P;
			data.flag   = this.BUTTON_DOWN;
			break;
		case 100:// Num4
			data.player = this.JOYPAD_2P;
			data.flag   = this.BUTTON_LEFT;
			break;
		case 102:// Num6
			data.player = this.JOYPAD_2P;
			data.flag   = this.BUTTON_RIGHT;
			break;
	}
	return data;
};

NES.prototype.handleKeyUp = function (e){
	var data = this._keyCodeToBitCode(e.keyCode);
	var player = data.player;
	var flag   = data.flag;

	if(player !== null) {
		this.JoyPadState[player] &= ~flag;
	}
	e.preventDefault();
};


NES.prototype.handleKeyDown = function (e){
	var data = this._keyCodeToBitCode(e.keyCode);
	var player = data.player;
	var flag   = data.flag;

	if(player !== null) {
		this.JoyPadState[player] |= flag;
	}

	e.preventDefault();
};

/* **************************************************************** */
/* NES APU
/* **************************************************************** */

NES.prototype.WebAudioFunction = function (e) {
	var output = e.outputBuffer.getChannelData(0);

	var i;
	var data;
	if(this.WaveDatas.length === 0) {
		data = new Float32Array(this.WebAudioBufferSize);
		for(i=0; i<this.WebAudioBufferSize; i++)
			data[i] = 0.0;
	} else {
		var len = this.WaveDatas.length > this.WebAudioBufferSize ? this.WebAudioBufferSize : this.WaveDatas.length;
		data = new Float32Array(len);
		for(i=0; i<len; i++)
			data[i] = this.WaveDatas[i] / (128 * 16);
		this.WaveDatas = this.WaveDatas.slice(len);

		if(this.WaveDatas.length >= this.WebAudioBufferSize * 2)
			this.WaveDatas = this.WaveDatas.slice(this.WebAudioBufferSize * 2);
	}
	output.set(data);
};


NES.prototype.ReadWaveControl = function () {
	var tmp = 0x00;
	if(this.WaveCh1LengthCounter !== 0)
		tmp |= 0x01;

	if(this.WaveCh2LengthCounter !== 0)
		tmp |= 0x02;

	if(this.WaveCh3LengthCounter !== 0)
		tmp |= 0x04;

	if(this.WaveCh4LengthCounter !== 0)
		tmp |= 0x08;

	if(this.WaveCh5SampleCounter !== 0)
		tmp |= 0x10;

	tmp |= this.toIRQ & 0xC0;

	this.toIRQ &= ~0x40;

	return tmp;
};


NES.prototype.WriteWaveControl = function () {
	var tmp = this.IO2[0x15];

	if((tmp & 0x01) !== 0x01)
		this.WaveCh1LengthCounter = 0;

	if((tmp & 0x02) !== 0x02)
		this.WaveCh2LengthCounter = 0;

	if((tmp & 0x04) !== 0x04)
		this.WaveCh3LengthCounter = 0;

	if((tmp & 0x08) !== 0x08)
		this.WaveCh4LengthCounter = 0;

	if((tmp & 0x10) !== 0x10) {
		this.WaveCh5SampleCounter = 0;
		this.toIRQ &= ~0x80;
	} else if(this.WaveCh5SampleCounter === 0) {
		this.SetCh5Delta();
	}
};


NES.prototype.WriteCh1Length0 = function () {
	this.WaveCh1Frequency = ((this.IO2[0x03] & 0x07) << 8) + this.IO2[0x02] + 1;
};


NES.prototype.WriteCh1Length1 = function () {
	this.WaveCh1LengthCounter = this.WaveLengthCount[this.IO2[0x03] >> 3];
	this.WaveCh1Envelope = 0;
	this.WaveCh1EnvelopeCounter = 0x0F;
	this.WaveCh1Sweep = 0;
	this.WaveCh1Frequency = ((this.IO2[0x03] & 0x07) << 8) + this.IO2[0x02] + 1;
};


NES.prototype.WriteCh2Length0 = function () {
	this.WaveCh2Frequency = ((this.IO2[0x07] & 0x07) << 8) + this.IO2[0x06] + 1;
};


NES.prototype.WriteCh2Length1 = function () {
	this.WaveCh2LengthCounter = this.WaveLengthCount[this.IO2[0x07] >> 3];
	this.WaveCh2Envelope = 0;
	this.WaveCh2EnvelopeCounter = 0x0F;
	this.WaveCh2Sweep = 0;
	this.WaveCh2Frequency = ((this.IO2[0x07] & 0x07) << 8) + this.IO2[0x06] + 1;
};


NES.prototype.WriteCh3LinearCounter = function (){
	this.WaveCh3LinearCounter = this.IO2[0x08] & 0x7F;
};


NES.prototype.WriteCh3Length1 = function () {
	this.WaveCh3LengthCounter = this.WaveLengthCount[this.IO2[0x0B] >> 3];
	this.WaveCh3LinearCounter = this.IO2[0x08] & 0x7F;
};


NES.prototype.WriteCh4Length1 = function () {
	this.WaveCh4LengthCounter = this.WaveLengthCount[this.IO2[0x0F] >> 3];
	this.WaveCh4Envelope = 0;
	this.WaveCh4EnvelopeCounter = 0x0F;
};


NES.prototype.WriteCh5DeltaControl = function () {
	if((this.IO2[0x10] & 0x80) !== 0x80)
		this.toIRQ &= ~0x80;
};


NES.prototype.WriteCh5DeltaCounter = function () {
	this.WaveCh5DeltaCounter = this.IO2[0x11] & 0x7F;
};


NES.prototype.SetCh5Delta = function () {
	var tmpIO2 = this.IO2;
	this.WaveCh5DeltaCounter = tmpIO2[0x11] & 0x7F;
	this.WaveCh5SampleAddress = (tmpIO2[0x12] << 6);
	this.WaveCh5SampleCounter = ((tmpIO2[0x13] << 4) + 1) << 3;
	this.WaveCh5Register = 0;
	this.WaveCh5Angle = -1;
	this.toIRQ &= ~0x80;
};


NES.prototype.ApuInit = function () {
	this.WaveFrameSequence = 0;

	this.WaveCh1LengthCounter = 0;
	this.WaveCh1Envelope = 0;
	this.WaveCh1EnvelopeCounter = 0;
	this.WaveCh1Sweep = 0;
	this.WaveCh1Frequency = 0;

	this.WaveCh2LengthCounter = 0;
	this.WaveCh2Envelope = 0;
	this.WaveCh2EnvelopeCounter = 0;
	this.WaveCh2Sweep = 0;
	this.WaveCh2Frequency = 0;

	this.WaveCh3LengthCounter = 0;
	this.WaveCh3LinearCounter = 0;

	this.WaveCh4LengthCounter = 0;
	this.WaveCh4Envelope = 0;
	this.WaveCh4EnvelopeCounter = 0;
	this.WaveCh4Register = 1;
	this.WaveCh4BitSequence = 0;

	this.WaveCh5DeltaCounter = 0;
	this.WaveCh5Register = 0;
	this.WaveCh5SampleAddress = 0;
	this.WaveCh5SampleCounter = 0;
	this.WaveCh5Angle = -1;

	this.ApuClockCounter = 0;

	this.WaveFrameSequenceCounter = 0;

	this.WaveDatas = [];

	this.ApuCpuClockCounter = 0;

	this.EXSoundInit();
};


NES.prototype.Out_Apu = function () {
	var all_out = 0;
	var tmpWaveBaseCount2 = this.WaveBaseCount;
	var tmpWaveBaseCount = tmpWaveBaseCount2 << 1;
	var tmpIO2 = this.IO2;

	// **** CH1 ****
	if(this.WaveCh1LengthCounter !== 0 && this.WaveCh1Frequency > 3)
		all_out += ((tmpIO2[0x00] & 0x10) === 0x10 ? (tmpIO2[0x00] & 0x0F) : this.WaveCh1EnvelopeCounter) * (((tmpWaveBaseCount / this.WaveCh1Frequency) & 0x1F) < this.WaveCh1_2DutyData[(tmpIO2[0x00] & 0xC0) >> 6] ? 1 : -1);

	// **** CH2 ****
	if(this.WaveCh2LengthCounter !== 0 && this.WaveCh2Frequency > 3)
		all_out += ((tmpIO2[0x04] & 0x10) === 0x10 ? (tmpIO2[0x04] & 0x0F) : this.WaveCh2EnvelopeCounter) * (((tmpWaveBaseCount / this.WaveCh2Frequency) & 0x1F) < this.WaveCh1_2DutyData[(tmpIO2[0x04] & 0xC0) >> 6] ? 1 : -1);

	// **** CH3 ****
	var ch3freq = ((tmpIO2[0x0B] & 0x07) << 8) + tmpIO2[0x0A] + 1;
	if(this.WaveCh3LengthCounter !== 0 && this.WaveCh3LinearCounter !== 0 && ch3freq > 3)
		all_out += this.WaveCh3SequenceData[(tmpWaveBaseCount2 / ch3freq) & 0x1F];

	// **** CH4 ****
	var angle = (tmpWaveBaseCount / this.WaveCh4FrequencyData[tmpIO2[0x0E] & 0x0F]) | 0;
	if(angle !== this.WaveCh4Angle) {
		this.WaveCh4Register = (tmpIO2[0x0E] & 0x80) === 0x80 ?
				(this.WaveCh4Register >> 1) | (((this.WaveCh4Register & 0x0040) <<  8) ^ ((this.WaveCh4Register & 0x0001) << 14)) :
				(this.WaveCh4Register >> 1) | (((this.WaveCh4Register & 0x0002) << 13) ^ ((this.WaveCh4Register & 0x0001) << 14));
		this.WaveCh4Angle = angle;
	}
	if(this.WaveCh4LengthCounter !== 0 && (this.WaveCh4Register & 0x0001) === 0x0000)
		all_out += (tmpIO2[0x0C] & 0x10) === 0x10 ? (tmpIO2[0x0C] & 0x0F) : this.WaveCh4EnvelopeCounter;

	// **** CH5 ****
	if(this.WaveCh5SampleCounter !== 0) {
		angle = (tmpWaveBaseCount2 / this.WaveCh5FrequencyData[tmpIO2[0x10] & 0x0F]) & 0x1F;

		if(this.WaveCh5Angle !== angle) {
			var ii = this.WaveCh5Angle;
			var jj = 0;
			if(ii !== -1) {
				jj = angle;
				if(jj < ii)
					jj += 32;
			}
			this.WaveCh5Angle = angle;

			for(; ii<jj; ii++){
				if((this.WaveCh5SampleCounter & 0x0007) === 0) {
					if(this.WaveCh5SampleCounter !== 0){
						this.WaveCh5Register = this.ROM[(this.WaveCh5SampleAddress >> 13) + 2][this.WaveCh5SampleAddress & 0x1FFF];
						this.WaveCh5SampleAddress++;
						this.CPUClock += 4;
					}
				}

				if(this.WaveCh5SampleCounter !== 0) {
					if((this.WaveCh5Register & 0x01) === 0x00) {
						if(this.WaveCh5DeltaCounter > 1)
							this.WaveCh5DeltaCounter -= 2;
					} else {
						if(this.WaveCh5DeltaCounter < 126)
							this.WaveCh5DeltaCounter += 2;
					}
					this.WaveCh5Register >>= 1;
					this.WaveCh5SampleCounter--;
				}
			}
		}

		if(this.WaveCh5SampleCounter === 0) {
			if((tmpIO2[0x10] & 0x40) === 0x40)
				this.SetCh5Delta();
			else
				this.toIRQ |= tmpIO2[0x10] & 0x80;
		}
	}
	return (all_out + this.WaveCh5DeltaCounter) << 5;
};


NES.prototype.WaveFrameSequencer = function (clock) {
	this.WaveFrameSequenceCounter += 240 * clock;
	if(this.WaveFrameSequenceCounter >= this.MainClock) {
		this.WaveFrameSequenceCounter -= this.MainClock;

		if((this.IO2[0x17] & 0x80) === 0x00) {
			this.WaveCh1_2_4_Envelope_WaveCh3_Linear();
			if(this.WaveFrameSequence === 1 || this.WaveFrameSequence === 3)
				this.WaveCh1_2_3_4_Length_WaveCh1_2_Sweep();
			if(this.WaveFrameSequence === 3 && (this.IO2[0x17] & 0x40) === 0x00) {
				this.toIRQ |= 0x40;
			}
			this.WaveFrameSequence = ++this.WaveFrameSequence & 0x03;
		} else {
			if(this.WaveFrameSequence !== 4)
				this.WaveCh1_2_4_Envelope_WaveCh3_Linear();
			if(this.WaveFrameSequence === 0 || this.WaveFrameSequence === 2)
				this.WaveCh1_2_3_4_Length_WaveCh1_2_Sweep();
			this.WaveFrameSequence = ++this.WaveFrameSequence % 5;
		}
	}
};


NES.prototype.ApuRun = function () {
	this.WaveBaseCount = (this.WaveBaseCount + this.CPUClock) % this.MainClock;

	this.WaveFrameSequencer(this.CPUClock);

	this.Mapper.EXSoundSync(this.CPUClock);

	this.ApuClockCounter += this.WaveSampleRate * this.CPUClock;
	while(this.ApuClockCounter >= this.MainClock) {
		this.ApuClockCounter -= this.MainClock;
		if(this.canAudioContext && this.WaveOut) {
			this.WaveDatas.push(this.Mapper.OutEXSound(this.Out_Apu()));
			this.WebAudioGainNode.gain.value = this.WaveVolume;
		}
	}
};


NES.prototype.WaveCh1_2_3_4_Length_WaveCh1_2_Sweep = function () {
	var tmpIO2 = this.IO2;

	if((tmpIO2[0x00] & 0x20) === 0x00 && this.WaveCh1LengthCounter !== 0) {
		if(--this.WaveCh1LengthCounter === 0)
			tmpIO2[0x15] &= 0xFE;
	}

	if((tmpIO2[0x04] & 0x20) === 0x00 && this.WaveCh2LengthCounter !== 0) {
		if(--this.WaveCh2LengthCounter === 0)
			tmpIO2[0x15] &= 0xFD;
	}

	if((tmpIO2[0x08] & 0x80) === 0x00 && this.WaveCh3LengthCounter !== 0) {
		if(--this.WaveCh3LengthCounter === 0)
			tmpIO2[0x15] &= 0xFB;
	}

	if((tmpIO2[0x0C] & 0x20) === 0x00 && this.WaveCh4LengthCounter !== 0) {
		if(--this.WaveCh4LengthCounter === 0)
			tmpIO2[0x15] &= 0xF7;
	}

	if(++this.WaveCh1Sweep === (((tmpIO2[0x01] & 0x70) >> 4) + 1)) {
		this.WaveCh1Sweep = 0;
		if((tmpIO2[0x01] & 0x80) === 0x80 && (tmpIO2[0x01] & 0x07) !== 0x00 && this.WaveCh1LengthCounter !== 0) {
			if((tmpIO2[0x01] & 0x08) === 0x00)
				this.WaveCh1Frequency += this.WaveCh1Frequency >> (tmpIO2[0x01] & 0x07);
			else 
				this.WaveCh1Frequency -= this.WaveCh1Frequency >> (tmpIO2[0x01] & 0x07);

			if(this.WaveCh1Frequency < 0x08 || this.WaveCh1Frequency > 0x7FF) {
				this.WaveCh1LengthCounter = 0;
				tmpIO2[0x15] &= 0xFE;
			}
		}
	}

	if(++this.WaveCh2Sweep === (((tmpIO2[0x05] & 0x70) >> 4) + 1)) {
		this.WaveCh2Sweep = 0;
		if((tmpIO2[0x05] & 0x80) === 0x80 && (tmpIO2[0x05] & 0x07) !== 0x00 && this.WaveCh2LengthCounter !== 0) {
			if((tmpIO2[0x05] & 0x08) === 0x00)
				this.WaveCh2Frequency += this.WaveCh2Frequency >> (tmpIO2[0x05] & 0x07);
			else 
				this.WaveCh2Frequency -= this.WaveCh2Frequency >> (tmpIO2[0x05] & 0x07);

			if(this.WaveCh2Frequency < 0x08 || this.WaveCh2Frequency > 0x7FF) {
				this.WaveCh2LengthCounter = 0;
				tmpIO2[0x15] &= 0xFD;
			}
		}
	}
};


NES.prototype.WaveCh1_2_4_Envelope_WaveCh3_Linear = function () {
	var tmpIO2 = this.IO2;

	if((tmpIO2[0x00] & 0x10) === 0x00) {
		if(++this.WaveCh1Envelope === ((tmpIO2[0x00] & 0x0F) + 1)) {
			this.WaveCh1Envelope = 0;
			if(this.WaveCh1EnvelopeCounter === 0) {
				if((tmpIO2[0x00] & 0x20) === 0x20)
					this.WaveCh1EnvelopeCounter = 0x0F;
			} else
				this.WaveCh1EnvelopeCounter--;
		}
	}

	if((tmpIO2[0x04] & 0x10) === 0x00) {
		if(++this.WaveCh2Envelope === ((tmpIO2[0x04] & 0x0F) + 1)) {
			this.WaveCh2Envelope = 0;
			if(this.WaveCh2EnvelopeCounter === 0) {
				if((tmpIO2[0x04] & 0x20) === 0x20)
					this.WaveCh2EnvelopeCounter = 0x0F;
			} else
				this.WaveCh2EnvelopeCounter--;
		}
	}

	if((tmpIO2[0x0C] & 0x10) === 0x00) {
		if(++this.WaveCh4Envelope === ((tmpIO2[0x0C] & 0x0F) + 1)) {
			this.WaveCh4Envelope = 0;
			if(this.WaveCh4EnvelopeCounter === 0) {
				if((tmpIO2[0x0C] & 0x20) === 0x20)
					this.WaveCh4EnvelopeCounter = 0x0F;
			} else
				this.WaveCh4EnvelopeCounter--;
		}
	}

	if((tmpIO2[0x08] & 0x80) === 0x00 && this.WaveCh3LinearCounter !== 0)
		this.WaveCh3LinearCounter--;
};


/* **** EX Sound **** */
NES.prototype.EXSoundInit = function () {
	this.Init_FDS();
	this.Init_MMC5();
	this.Init_VRC6();
	this.Init_N163();
	this.Init_AY();
};


/* FDS */
NES.prototype.Init_FDS = function () {
	var i;
	for(i=0; i<this.FDS_WAVE_REG.length; i++)
		this.FDS_WAVE_REG[i] = 0x00;
	for(i=0; i<this.FDS_LFO_REG.length; i++)
		this.FDS_LFO_REG[i] = 0x00;
	for(i=0; i<this.FDS_REG.length; i++)
		this.FDS_REG[i] = 0x00;

	this.FDS_WaveIndexCounter = 0;
	this.FDS_WaveIndex = 0;

	this.FDS_LFOIndexCounter = 0;
	this.FDS_LFOIndex = 0;
	this.FDS_REGAddress = 0;

	this.FDS_VolumeEnvCounter = 0;
	this.FDS_VolumeEnv = 0;

	this.FDS_SweepEnvCounter = 0;
	this.FDS_SweepEnv = 0;
	this.FDS_SweepBias = 0;

	this.FDS_Volume = 0;
};


NES.prototype.Write_FDS_WAVE_REG = function (no, data) {
	if((this.FDS_REG[9] & 0x80) !== 0x80)
		return;
	this.FDS_WAVE_REG[no] = data & 0x3F;
};


NES.prototype.Write_FDS_REG = function (no, data) {
	this.FDS_REG[no] = data;
	switch(no) {
		case 0:
			if((data & 0x80) === 0x80)
				this.FDS_VolumeEnv = data & 0x3F;

			this.FDS_VolumeEnvCounter = 0;
			break;
		case 3:
			if((data & 0x80) === 0x80)
				this.FDS_WaveIndex = 0;
			break;
		case 4:
			if((data & 0x80) === 0x80)
				this.FDS_SweepEnv = data & 0x3F;

			this.FDS_SweepEnvCounter = 0;
			break;
		case 5:
			this.FDS_SweepBias = data & 0x7F;
			if(this.FDS_SweepBias >= 0x40)
				this.FDS_SweepBias = this.FDS_SweepBias - 0x80;
			this.FDS_REGAddress = 0;
			break;
		case 7:
			this.FDS_LFOIndexCounter = 0;
			this.FDS_LFOIndex = 0;
			break;
		case 8:
			if((this.FDS_REG[7] & 0x80) === 0x80) {
				this.FDS_LFO_REG[this.FDS_REGAddress] = data & 0x07;
				this.FDS_REGAddress = (this.FDS_REGAddress + 1) & 0x1F;
			}
			break;
	}
};


NES.prototype.Count_FDS = function (clock) {
	if((this.FDS_REG[3] & 0x40) !== 0x40) {
		var c;
		if((this.FDS_REG[0] & 0xC0) < 0x80) {
			c = this.FDS_REG[10] * ((this.FDS_REG[0] & 0x3F) + 1) * 8;
			if(c > 0) {
				this.FDS_VolumeEnvCounter += clock;
				while(this.FDS_VolumeEnvCounter >= c) {
					this.FDS_VolumeEnvCounter -= c;

					if((this.FDS_REG[0] & 0x40) === 0x00) {
						if(this.FDS_VolumeEnv > 0)
							this.FDS_VolumeEnv--;
					} else {
						if(this.FDS_VolumeEnv < 0x20)
							this.FDS_VolumeEnv++;
					}
				}

			}
		}

		if((this.FDS_REG[4] & 0xC0) < 0x80) {
			c = this.FDS_REG[10] * ((this.FDS_REG[4] & 0x3F) + 1) * 8;
			if(c > 0) {
				this.FDS_SweepEnvCounter += clock;
				while(this.FDS_SweepEnvCounter >= c) {
					this.FDS_SweepEnvCounter -= c;

					if((this.FDS_REG[4] & 0x40) === 0x00) {
						if(this.FDS_SweepEnv > 0)
							this.FDS_SweepEnv--;
					} else {
						if(this.FDS_SweepEnv < 0x3F)
							this.FDS_SweepEnv++;
					}
				}

			}
		}
	}

	var f;
	if((this.FDS_REG[7] & 0x80) !== 0x80) {
		f = this.FDS_REG[6] | ((this.FDS_REG[7] & 0x0F) << 8);
		this.FDS_LFOIndexCounter += f * clock;
		while(this.FDS_LFOIndexCounter >= 65536) {
			this.FDS_LFOIndexCounter -= 65536;

			var lfo = this.FDS_LFO_REG[this.FDS_LFOIndex >> 1];
			this.FDS_SweepBias += this.FDS_LFO_DATA[lfo];
			if(lfo === 4)
				this.FDS_SweepBias = 0;

			if(this.FDS_SweepBias > 63)
				this.FDS_SweepBias -= 128;
			else if(this.FDS_SweepBias < -64)
				this.FDS_SweepBias += 128;

			this.FDS_LFOIndex += 1;
			if(this.FDS_LFOIndex > 0x3F) {
				this.FDS_LFOIndex = 0;
			}
		}
	}

	var tmp = this.FDS_SweepBias * this.FDS_SweepEnv;
	var rem = tmp & 0x0F;
	tmp >>= 4;
	if(rem > 0) {
		if(this.FDS_SweepBias < 0)
			tmp -= 1;
		else
			tmp += 2;
	}

	if(tmp >= 192)
		tmp -= 256;
	else if(tmp < -64)
		tmp += 256;
	f = this.FDS_REG[2] | ((this.FDS_REG[3] & 0x0F) << 8);
	tmp = f * tmp;
	tmp >>= 6;
	f = f + tmp;

	this.FDS_WaveIndexCounter += f * clock;
	this.FDS_WaveIndex += this.FDS_WaveIndexCounter >> 16;
	this.FDS_WaveIndexCounter &= 0xFFFF;
	if(this.FDS_WaveIndex > 0x3F) {
		this.FDS_WaveIndex &= 0x3F;
		this.FDS_Volume = this.FDS_VolumeEnv;
	}
};


NES.prototype.Out_FDS = function () {
	if((this.FDS_REG[3] & 0x80) !== 0x80)
		return ((this.FDS_WAVE_REG[this.FDS_WaveIndex] - 32) * this.FDS_Volume) >> 1;
	return 0;
};


/* MMC5 */
NES.prototype.Init_MMC5 = function () {
	this.MMC5_FrameSequenceCounter = 0;
	this.MMC5_FrameSequence = 0;
	for(var i=0; i<this.MMC5_REG.length; i++)
		this.MMC5_REG[i] = 0x00;
	this.MMC5_Ch[0] = {"LengthCounter": 0, "Envelope": 0, "EnvelopeCounter": 0, "Sweep": 0, "Frequency": 0};
	this.MMC5_Ch[1] = {"LengthCounter": 0, "Envelope": 0, "EnvelopeCounter": 0, "Sweep": 0, "Frequency": 0};
};


NES.prototype.Write_MMC5_ChLength0 = function (ch) {
	var tmp = ch << 2;
	this.MMC5_Ch[ch].Frequency = ((this.MMC5_REG[tmp + 0x03] & 0x07) << 8) + this.MMC5_REG[tmp + 0x02] + 1;
};


NES.prototype.Write_MMC5_ChLength1 = function (ch) {
	var tmp = ch << 2;
	this.MMC5_Ch[ch].LengthCounter = this.WaveLengthCount[this.MMC5_REG[tmp + 0x03] >> 3];
	this.MMC5_Ch[ch].Envelope = 0;
	this.MMC5_Ch[ch].EnvelopeCounter = 0x0F;
	this.MMC5_Ch[ch].Sweep = 0;
	this.MMC5_Ch[ch].Frequency = ((this.MMC5_REG[tmp + 0x03] & 0x07) << 8) + this.MMC5_REG[tmp + 0x02] + 1;
};


NES.prototype.Write_MMC5_REG = function (no, data) {
	this.MMC5_REG[no] = data;

	switch(no) {
		case 0x02:
			this.Write_MMC5_ChLength0(0);
			break;
		case 0x03:
			this.Write_MMC5_ChLength1(0);
			break;
		case 0x06:
			this.Write_MMC5_ChLength0(1);
			break;
		case 0x07:
			this.Write_MMC5_ChLength1(1);
			break;
		case 0x015:
			for(var i=0; i<2; i++) {
				if((this.MMC5_REG[0x15] & (0x01 << i)) === 0x00)
					this.MMC5_Ch[i].LengthCounter = 0;
			}
			break;
	}
};


NES.prototype.Read_MMC5_REG = function (no) {
	if(no === 0x15) {
		var tmp =0;
		for(var i=0; i<2; i++) {
		if(this.MMC5_Ch[i].LengthCounter !== 0)
			tmp |= 0x01 << i;
		}
	}
};


NES.prototype.Count_MMC5 = function (clock) {
	this.MMC5_FrameSequenceCounter += 240 * clock;

	var i, tmp;
	if(this.MMC5_FrameSequenceCounter >= this.MainClock) {
		this.MMC5_FrameSequenceCounter -= this.MainClock;

		for(i=0; i<2; i++) {
			tmp = i << 2;
			if((this.MMC5_REG[tmp] & 0x10) === 0x00) {
				if(++this.MMC5_Ch[i].Envelope === ((this.MMC5_REG[tmp] & 0x0F) + 1)) {
					this.MMC5_Ch[i].Envelope = 0;
					if(this.MMC5_Ch[i].EnvelopeCounter === 0) {
						if((this.MMC5_REG[tmp] & 0x20) === 0x20)
							this.MMC5_Ch[i].EnvelopeCounter = 0x0F;
					} else
						this.MMC5_Ch[i].EnvelopeCounter--;
				}
			}
		}

		if(this.MMC5_FrameSequence === 1 || this.MMC5_FrameSequence === 3) {
			for(i=0; i<2; i++) {
				tmp = i << 2;

				if((this.MMC5_REG[tmp] & 0x20) === 0x00 && this.MMC5_Ch[i].LengthCounter !== 0) {
					if(--this.MMC5_Ch[i].LengthCounter === 0)
						this.MMC5_REG[0x15] &= ~(0x01 << i);
				}

				if(++this.MMC5_Ch[i].Sweep === (((this.MMC5_REG[tmp + 0x01] & 0x70) >> 4) + 1)) {
					this.MMC5_Ch[i].Sweep = 0;
					if((this.MMC5_REG[tmp + 0x01] & 0x80) === 0x80 && (this.MMC5_REG[tmp + 0x01] & 0x07) !== 0x00 && this.MMC5_Ch[i].LengthCounter !== 0) {
						if((this.MMC5_REG[tmp + 0x01] & 0x08) === 0x00)
							this.MMC5_Ch[i].Frequency += this.MMC5_Ch[i].Frequency >> (this.MMC5_REG[tmp + 0x01] & 0x07);
						else 
							this.MMC5_Ch[i].Frequency -= this.MMC5_Ch[i].Frequency >> (this.MMC5_REG[tmp + 0x01] & 0x07);

						if(this.MMC5_Ch[i].Frequency < 0x08 || this.MMC5_Ch[i].Frequency > 0x7FF) {
							this.MMC5_Ch[i].LengthCounter = 0;
							this.MMC5_REG[0x15] &= ~(0x01 << i);
						}
					}
				}
			}
		}

		this.MMC5_FrameSequence = ++this.MMC5_FrameSequence & 0x03;
	}
};


NES.prototype.Out_MMC5 = function () {
	var all_out = 0;
	var tmpWaveBaseCount = this.WaveBaseCount << 1;

	for(var i=0; i<2; i++) {
		var tmp = i << 2;
		if(this.MMC5_Ch[i].LengthCounter !== 0 && this.MMC5_Ch[i].Frequency > 3)
			all_out += ((this.MMC5_REG[tmp] & 0x10) === 0x10 ? (this.MMC5_REG[tmp] & 0x0F) : this.MMC5_Ch[i].EnvelopeCounter) * (((tmpWaveBaseCount / this.MMC5_Ch[i].Frequency) & 0x1F) < this.WaveCh1_2DutyData[(this.MMC5_REG[tmp] & 0xC0) >> 6] ? 1 : -1);
	}

	all_out += (this.MMC5_REG[0x11] >> 2) - 16;
	return all_out << 5;
};


/* VRC6 */
NES.prototype.Init_VRC6 = function () {
	for(var i=0; i<this.VRC6_REG.length; i++)
		this.VRC6_REG[i] = 0x00;
	this.VRC6_Ch3_Counter = 0;
	this.VRC6_Ch3_index = 0;
};


NES.prototype.Write_VRC6_REG = function (no, data) {
	this.VRC6_REG[no] = data;
};


NES.prototype.Count_VRC6 = function (clock) {
	var chfreq = (((this.VRC6_REG[10] & 0x0F) << 8) | this.VRC6_REG[9]) + 1;
	this.VRC6_Ch3_Counter += clock;
	this.VRC6_Ch3_index += (this.VRC6_Ch3_Counter / chfreq) | 0;
	this.VRC6_Ch3_index %= 14;
	this.VRC6_Ch3_Counter %= chfreq;
};


NES.prototype.Out_VRC6 = function () {
	var all_out = 0;
	var tmpWaveBaseCount = this.WaveBaseCount;

	// **** CH1-2 ****
	for(var i=0; i<8; i+=4) {
		if((this.VRC6_REG[i + 2] & 0x80) === 0x80) {
			if((this.VRC6_REG[i + 0] & 0x80) === 0x00) {
				var chfreq = ((this.VRC6_REG[i + 2] & 0x0F) << 8) | this.VRC6_REG[i + 1];
				var duty = (this.VRC6_REG[i + 0] & 0x70) >>> 4;
				all_out += (this.VRC6_REG[i + 0] & 0x0F) * (((tmpWaveBaseCount / chfreq) & 0x0F) < duty ? 1 : -1);
			} else
				all_out += this.VRC6_REG[i + 0] & 0x0F;
		}
	}

	// **** CH3 ****
	if((this.VRC6_REG[10] & 0x80) === 0x80)
		all_out += (((this.VRC6_Ch3_index >>> 1) * (this.VRC6_REG[8] & 0x3F)) >>> 3) - 16;

	return all_out << 5;
};


/* N163 */
NES.prototype.Init_N163 = function () {
	var i;
	for(i=0; i<this.N163_RAM.length; i++)
		this.N163_RAM[i] = 0x00;
	for(i=0; i<this.N163_ch_data.length; i++)
		this.N163_ch_data[i] = {"Freq" : 0, "Phase" : 0, "Length" : 0, "Address" : 0, "Vol" : 0};
	this.N163_Address = 0x00;
	this.N163_ch = 0;
	this.N163_Clock = 0;
};


NES.prototype.Write_N163_RAM = function (data) {
	var address = this.N163_Address & 0x7F;
	this.N163_RAM[address] = data;

	if(address >= 0x40) {
		var ch = (address >>> 3) & 0x07;
		switch(address & 0x07) {
			case 0x00:
				this.N163_ch_data[ch].Freq = (this.N163_ch_data[ch].Freq & 0x3FF00) | data;
				break;
			case 0x01:
				this.N163_ch_data[ch].Phase = (this.N163_ch_data[ch].Freq & 0xFFFF00) | data;
				break;
			case 0x02:
				this.N163_ch_data[ch].Freq = (this.N163_ch_data[ch].Freq & 0x300FF) | (data << 8);
				break;
			case 0x03:
				this.N163_ch_data[ch].Phase = (this.N163_ch_data[ch].Freq & 0xFF00FF) | (data << 8);
				break;
			case 0x04:
				this.N163_ch_data[ch].Freq = (this.N163_ch_data[ch].Freq & 0x0FFFF) | ((data & 0x03) << 16);
				this.N163_ch_data[ch].Length = (256 - (data & 0xFC)) << 16;
				break;
			case 0x05:
				this.N163_ch_data[ch].Phase = (this.N163_ch_data[ch].Freq & 0x00FFFF) | (data << 16);
				break;
			case 0x06:
				this.N163_ch_data[ch].Address = data;
				break;
			case 0x07:
				this.N163_ch_data[ch].Vol = data & 0x0F;
				if(address === 0x7F)
					this.N163_ch = (data >>> 4) & 0x07;
				break;
		}
	}

	if((this.N163_Address & 0x80) === 0x80)
		this.N163_Address = ((this.N163_Address & 0x7F) + 1) | 0x80;
};


NES.prototype.Read_N163_RAM = function () {
	var ret = this.N163_RAM[this.N163_Address & 0x7F];
	if((this.N163_Address & 0x80) === 0x80)
		this.N163_Address = ((this.N163_Address & 0x7F) + 1) | 0x80;
	return ret;
};


NES.prototype.Count_N163 = function (clock) {
	this.N163_Clock += clock;
	var cl = (this.N163_ch + 1) * 15;
	while(this.N163_Clock >= cl) {
		this.N163_Clock -= cl;
		for(var i=7-this.N163_ch; i<8; i++) {
			if(this.N163_ch_data[i].Length > 0)
				this.N163_ch_data[i].Phase = (this.N163_ch_data[i].Phase + this.N163_ch_data[i].Freq) % this.N163_ch_data[i].Length;
		}
	}
};


NES.prototype.Out_N163 = function () {
	var all_out = 0;

	for(var i=7-this.N163_ch; i<8; i++) {
		var addr = (this.N163_ch_data[i].Address + (this.N163_ch_data[i].Phase >> 16)) & 0xFF;
		var data = this.N163_RAM[addr >>> 1];
		data = (addr & 0x01) === 0x00 ? (data & 0x0F) : (data >>> 4);
		all_out += (data - 8) * this.N163_ch_data[i].Vol;
	}
	return all_out << 2;
};


/* AY-3-8910 */
NES.prototype.Init_AY = function () {
	this.AY_ClockCounter = 0;
	for(var i=0; i<this.AY_REG.length; i++)
		this.AY_REG[i] = 0x00;
	this.AY_Noise_Seed = 0x0001;
	this.AY_Noise_Angle = 0;
	this.AY_Env_Counter = 0;
	this.AY_Env_Index = 0;
	this.AY_REG_Select = 0x00;
};


NES.prototype.Select_AY_REG = function (data) {
	this.AY_REG_Select = data & 0x0F;
};


NES.prototype.Write_AY_REG = function (data) {
	this.AY_REG[this.AY_REG_Select] = data;

	if(this.AY_REG_Select === 13)
		this.AY_Env_Index = 0;
};


NES.prototype.Read_AY_REG = function () {
	// TODO: why?
	return 0;
	//return this.AY_REG[this.AY_REG_Select];
};


NES.prototype.Count_AY = function (clock) {
	this.AY_Env_Counter += clock;
	var ef = (((this.AY_REG[12] << 8) | this.AY_REG[11]) + 1) * 8;
	var envtmp = (this.AY_Env_Counter / ef) | 0;
	this.AY_Env_Counter %= ef;

	this.AY_Env_Index += envtmp;
	if(this.AY_Env_Index >= 48)
		this.AY_Env_Index = ((this.AY_Env_Index - 48) % 32) + 32;
};


NES.prototype.Out_AY = function () {
	var tmpWaveBaseCount = this.WaveBaseCount;
	var all_out = 0;

	var noiseout = (this.AY_Noise_Seed & 0x0001) === 0x0001 ? 1 : -1;
	var angle = (tmpWaveBaseCount / (((this.AY_REG[5] & 0x1F) + 1) * 32)) | 0;
	if(angle !== this.AY_Noise_Angle) {
		this.AY_Noise_Seed = (this.AY_Noise_Seed >>> 1) | (((this.AY_Noise_Seed & 0x0001) << 15) ^ ((this.AY_Noise_Seed & 0x0008) << 12));
		this.AY_Noise_Angle = angle;
	}

	for(var i=0; i<3; i++) {
		var vol = (this.AY_REG[8 + i] & 0x10) === 0x00 ? (this.AY_REG[8 + i] & 0x0F) : this.AY_Env_Pattern[this.AY_REG[13] & 0x0F][this.AY_Env_Index];
		vol = this.AY_Env_Volume[vol];

		if(((this.AY_REG[7] >> i) & 0x01) === 0x00) {
			var f = (((this.AY_REG[i * 2 + 1] & 0x0F) << 8) | this.AY_REG[i * 2]) + 1;
			if(f > 1)
				all_out += vol * (((tmpWaveBaseCount / f) & 0x1F) < 0x10 ? 1 : -1);
			else
				all_out += vol;
		}

		if(((this.AY_REG[7] >> i) & 0x08) === 0x00)
			all_out += vol * noiseout;
	}
	return all_out;
};

module.exports = NES;

},{"./Mapper/0":1,"./Mapper/1":2,"./Mapper/10":3,"./Mapper/101":4,"./Mapper/118":5,"./Mapper/119":6,"./Mapper/140":7,"./Mapper/152":8,"./Mapper/16":9,"./Mapper/18":10,"./Mapper/180":11,"./Mapper/184":12,"./Mapper/185":13,"./Mapper/19":14,"./Mapper/2":15,"./Mapper/207":16,"./Mapper/22":17,"./Mapper/23":18,"./Mapper/24":19,"./Mapper/25":20,"./Mapper/26":21,"./Mapper/3":22,"./Mapper/32":23,"./Mapper/33":24,"./Mapper/34":25,"./Mapper/4":26,"./Mapper/48":27,"./Mapper/5":28,"./Mapper/65":29,"./Mapper/66":30,"./Mapper/67":31,"./Mapper/68":32,"./Mapper/69":33,"./Mapper/7":34,"./Mapper/70":35,"./Mapper/72":36,"./Mapper/73":37,"./Mapper/75":38,"./Mapper/76":39,"./Mapper/77":40,"./Mapper/78":41,"./Mapper/80":42,"./Mapper/82":43,"./Mapper/85":44,"./Mapper/86":45,"./Mapper/87":46,"./Mapper/88":47,"./Mapper/89":48,"./Mapper/9":49,"./Mapper/92":50,"./Mapper/93":51,"./Mapper/94":52,"./Mapper/95":53,"./Mapper/97":54}],57:[function(require,module,exports){
"use strict";

// ファミコン本体クラス
var NES = require('./NES');

// canvas
var canvas = document.getElementById('mainCanvas');

var nes = new NES(canvas);

nes.initCanvas();
window.onkeydown = function(e) { nes.handleKeyDown(e); };
window.onkeyup   = function(e) { nes.handleKeyUp(e); };

function nes_pause() {
	if(nes.Pause()) {
		document.getElementById("pause").disabled = true;
		document.getElementById("start").disabled = false;
	}
}


function nes_start() {
	if(nes.Start()) {
		document.getElementById("pause").disabled = false;
		document.getElementById("start").disabled = true;
	}
}


function nes_reset() {
	if(nes.Reset()) {
		document.getElementById("pause").disabled = false;
		document.getElementById("start").disabled = true;
	}
}

function nes_rom_change(arraybuffer) {
	// 実行中のNESを停止
	nes_pause();

	if( ! nes.SetRom(arraybuffer)) {
		console.error("Can't get rom data (perhaps you don't set ArrayBuffer arguments or it's not nes rom format)");
		return;
	}

	document.getElementById("start").disabled = true;
	document.getElementById("pause").disabled = true;


	if(nes.Init())
		nes_start();
}

// ローカル上のROMを読み込み
var read_local_file = function(fileObj, cb) {
	var reader = new FileReader();
	reader.onload = function (e) { cb(e.target.result); };
	reader.readAsArrayBuffer(fileObj);
};

// URL からROMを読み込み
var read_url = function (url, cb) {
	var request = new XMLHttpRequest();

	request.onload = function() { cb(request.response); };
	request.onerror = function(e) {
		console.error("can't get rom binary");
	};
	request.open('GET', url, true);
	request.responseType = 'arraybuffer';
	request.send(null);
};

// DOMのイベントを設定
var initialize_dom_events = function() {
	if(typeof window.FileReader !== "undefined") {
		// ドラッグ&ドロップでROM読み込み
		window.addEventListener("dragenter",
			function (e) {
				e.preventDefault();
			}, false);

		window.addEventListener("dragover",
			function (e) {
				e.preventDefault();
			}, false);

		window.addEventListener("drop",
			function (e) {
				e.preventDefault();
				read_local_file(e.dataTransfer.files[0], nes_rom_change);
			}, false);

		// input type="file" から ROM読み込み
		document.getElementById("file").addEventListener("change",
			function (e) {
				read_local_file(e.target.files[0], nes_rom_change);
			}, false);

		// プルダウンから ROM読み込み
		document.getElementById("romload").addEventListener("click",
			function (e) {
				e.preventDefault();

				// ROM の場所
				var url = document.getElementById("romlist").value;

				read_url(url, nes_rom_change);
			}, false);


		document.getElementById("pause").addEventListener("click", nes_pause, false);
		document.getElementById("start").addEventListener("click", nes_start, false);
		document.getElementById("reset").addEventListener("click", nes_reset, false);

		document.getElementById("start").disabled = true;
		document.getElementById("pause").disabled = true;

	}

};

// 初期化
window.onload = function() {
	// DOMのイベントを設定
	initialize_dom_events();
};



},{"./NES":56}]},{},[57]);
=======
(()=>{"use strict";var t={6856:(t,e,s)=>{var i=s(9678),h=function(t){i.apply(this,arguments)};(h.prototype=Object.create(i.prototype)).Init=function(){this.nes.SetPrgRomPage(0,0),this.nes.SetPrgRomPage(1,this.nes.PrgRomPageCount-1),this.nes.SetChrRomPage(0)},t.exports=h},3461:(t,e,s)=>{var i=s(9678),h=function(t){i.apply(this,arguments),this.MAPPER_REG=new Array(16)};(h.prototype=Object.create(i.prototype)).Init=function(){var t;for(t=0;t<this.MAPPER_REG.length;t++)this.MAPPER_REG[t]=0;this.MAPPER_REG[13]=0,this.MAPPER_REG[14]=0,this.MAPPER_REG[0]=12,this.MAPPER_REG[1]=0,this.MAPPER_REG[2]=0,this.MAPPER_REG[3]=0,64===this.nes.PrgRomPageCount?this.MAPPER_REG[10]=2:32===this.nes.PrgRomPageCount?this.MAPPER_REG[10]=1:this.MAPPER_REG[10]=0,this.MAPPER_REG[11]=0,this.MAPPER_REG[12]=0,0===this.MAPPER_REG[10]?(this.MAPPER_REG[8]=2*this.nes.PrgRomPageCount-2,this.MAPPER_REG[9]=2*this.nes.PrgRomPageCount-1):(this.MAPPER_REG[8]=30,this.MAPPER_REG[9]=31),this.MAPPER_REG[4]=0,this.MAPPER_REG[5]=1,this.MAPPER_REG[6]=this.MAPPER_REG[8],this.MAPPER_REG[7]=this.MAPPER_REG[9],this.nes.SetPrgRomPages8K(this.MAPPER_REG[4],this.MAPPER_REG[5],this.MAPPER_REG[6],this.MAPPER_REG[7])},h.prototype.Write=function(t,e){var s,i;if((24576&t)!=(24576&this.MAPPER_REG[15])&&(this.MAPPER_REG[13]=0,this.MAPPER_REG[14]=0),this.MAPPER_REG[15]=t,0!=(128&e))return this.MAPPER_REG[13]=0,void(this.MAPPER_REG[14]=0);if(0!=(1&e)&&(this.MAPPER_REG[14]|=1<<this.MAPPER_REG[13]),this.MAPPER_REG[13]++,!(this.MAPPER_REG[13]<5))switch(s=(32767&t)>>13,this.MAPPER_REG[s]=this.MAPPER_REG[14],this.MAPPER_REG[13]=0,this.MAPPER_REG[14]=0,s){case 0:0!=(2&this.MAPPER_REG[0])?0!=(1&this.MAPPER_REG[0])?this.nes.SetMirror(!0):this.nes.SetMirror(!1):0!=(1&this.MAPPER_REG[0])?this.nes.SetMirrors(1,1,1,1):this.nes.SetMirrors(0,0,0,0);break;case 1:i=this.MAPPER_REG[1],2===this.MAPPER_REG[10]?0!=(16&this.MAPPER_REG[0])?0!==this.MAPPER_REG[12]?(this.MAPPER_REG[11]=(16&this.MAPPER_REG[1])>>4,0!=(8&this.MAPPER_REG[0])&&(this.MAPPER_REG[11]|=(16&this.MAPPER_REG[2])>>3),this.SetPrgRomPages8K_Mapper01(),this.MAPPER_REG[12]=0):this.MAPPER_REG[12]=1:(this.MAPPER_REG[11]=0!=(16&this.MAPPER_REG[1])?3:0,this.SetPrgRomPages8K_Mapper01()):1===this.MAPPER_REG[10]&&0===this.nes.ChrRomPageCount?(this.MAPPER_REG[11]=(16&this.MAPPER_REG[1])>>4,this.SetPrgRomPages8K_Mapper01()):0!==this.nes.ChrRomPageCount?0!=(16&this.MAPPER_REG[0])?(i<<=2,this.nes.SetChrRomPage1K(0,i+0),this.nes.SetChrRomPage1K(1,i+1),this.nes.SetChrRomPage1K(2,i+2),this.nes.SetChrRomPage1K(3,i+3)):(i<<=2,this.nes.SetChrRomPages1K(i+0,i+1,i+2,i+3,i+4,i+5,i+6,i+7)):0!=(16&this.MAPPER_REG[0])&&(i<<=2,this.nes.VRAM[0]=this.nes.VRAMS[i+0],this.nes.VRAM[1]=this.nes.VRAMS[i+1],this.nes.VRAM[2]=this.nes.VRAMS[i+2],this.nes.VRAM[3]=this.nes.VRAMS[i+3]);break;case 2:if(i=this.MAPPER_REG[2],2===this.MAPPER_REG[10]&&0!=(8&this.MAPPER_REG[0])&&(0!==this.MAPPER_REG[12]?(this.MAPPER_REG[11]=(16&this.MAPPER_REG[1])>>4,this.MAPPER_REG[11]|=(16&this.MAPPER_REG[2])>>3,this.SetPrgRomPages8K_Mapper01(),this.MAPPER_REG[12]=0):this.MAPPER_REG[12]=1),0===this.nes.ChrRomPageCount&&0!=(16&this.MAPPER_REG[0])){i<<=2,this.nes.VRAM[4]=this.nes.VRAMS[i+0],this.nes.VRAM[5]=this.nes.VRAMS[i+1],this.nes.VRAM[6]=this.nes.VRAMS[i+2],this.nes.VRAM[7]=this.nes.VRAMS[i+3];break}0!=(16&this.MAPPER_REG[0])&&(i<<=2,this.nes.SetChrRomPage1K(4,i+0),this.nes.SetChrRomPage1K(5,i+1),this.nes.SetChrRomPage1K(6,i+2),this.nes.SetChrRomPage1K(7,i+3));break;case 3:i=this.MAPPER_REG[3],0!=(8&this.MAPPER_REG[0])?(i<<=1,0!=(4&this.MAPPER_REG[0])?(this.MAPPER_REG[4]=i,this.MAPPER_REG[5]=i+1,this.MAPPER_REG[6]=this.MAPPER_REG[8],this.MAPPER_REG[7]=this.MAPPER_REG[9]):0===this.MAPPER_REG[10]&&(this.MAPPER_REG[4]=0,this.MAPPER_REG[5]=1,this.MAPPER_REG[6]=i,this.MAPPER_REG[7]=i+1)):(i<<=1,this.MAPPER_REG[4]=i,this.MAPPER_REG[5]=i+1,0===this.MAPPER_REG[10]&&(this.MAPPER_REG[6]=i+2,this.MAPPER_REG[7]=i+3)),this.SetPrgRomPages8K_Mapper01()}},h.prototype.SetPrgRomPages8K_Mapper01=function(){this.nes.SetPrgRomPage8K(0,(this.MAPPER_REG[11]<<5)+(31&this.MAPPER_REG[4])),this.nes.SetPrgRomPage8K(1,(this.MAPPER_REG[11]<<5)+(31&this.MAPPER_REG[5])),this.nes.SetPrgRomPage8K(2,(this.MAPPER_REG[11]<<5)+(31&this.MAPPER_REG[6])),this.nes.SetPrgRomPage8K(3,(this.MAPPER_REG[11]<<5)+(31&this.MAPPER_REG[7]))},t.exports=h},2541:(t,e,s)=>{var i=s(9678),h=function(t){i.apply(this,arguments),this.MAPPER_REG=new Array(4),this.MAPPER_Latch0=!0,this.MAPPER_Latch1=!0};(h.prototype=Object.create(i.prototype)).Init=function(){this.nes.SetPrgRomPages8K(0,0,2*this.nes.PrgRomPageCount-2,2*this.nes.PrgRomPageCount-1),this.nes.SetChrRomPages1K(0,0,0,0,0,0,0,0);for(var t=0;t<this.MAPPER_REG.length;t++)this.MAPPER_REG[t]=0;this.MAPPER_Latch0=!0,this.MAPPER_Latch1=!0},h.prototype.Write=function(t,e){switch(61440&t){case 40960:this.nes.SetPrgRomPage8K(0,2*e),this.nes.SetPrgRomPage8K(1,2*e+1);break;case 45056:this.MAPPER_REG[0]=e;break;case 49152:this.MAPPER_REG[1]=e;break;case 53248:this.MAPPER_REG[2]=e;break;case 57344:this.MAPPER_REG[3]=e;break;case 61440:0==(1&e)?this.nes.SetMirror(!1):this.nes.SetMirror(!0)}},h.prototype.BuildBGLine=function(){for(var t=this.nes.BgLineBuffer,e=this.nes.VRAM,s=8192|4095&this.nes.PPUAddress,i=(28672&this.nes.PPUAddress)>>12|(16&this.nes.IO1[0])<<8,h=s>>10,r=1023&s,P=e[h],R=this.nes.PaletteArray,a=this.nes.SPBitArray,o=0,n=this.nes.HScrollTmp,E=0;E<33;E++){var A=P[r]<<4|i,_=A;this.SetChrRom(_);var M=e[A>>10];A&=1023;for(var c=P[(896&r)>>4|960+((28&r)>>2)]<<2>>((64&r)>>4|2&r)&12,G=a[M[A]][M[A+8]];n<8;n++,o++)t[o]=R[G[n]|c];n=0,this.SetLatch(_),31==(31&r)?(r&=65504,P=e[h^=1]):r++}},h.prototype.SetLatch=function(t){4048==(t&=8176)&&(this.MAPPER_Latch0=!1),8144===t&&(this.MAPPER_Latch1=!1),4064===t&&(this.MAPPER_Latch0=!0),8160===t&&(this.MAPPER_Latch1=!0)},h.prototype.SetChrRom=function(t){0==(4096&t)?this.MAPPER_Latch0?(this.nes.SetChrRomPage1K(0,4*this.MAPPER_REG[1]),this.nes.SetChrRomPage1K(1,4*this.MAPPER_REG[1]+1),this.nes.SetChrRomPage1K(2,4*this.MAPPER_REG[1]+2),this.nes.SetChrRomPage1K(3,4*this.MAPPER_REG[1]+3)):(this.nes.SetChrRomPage1K(0,4*this.MAPPER_REG[0]),this.nes.SetChrRomPage1K(1,4*this.MAPPER_REG[0]+1),this.nes.SetChrRomPage1K(2,4*this.MAPPER_REG[0]+2),this.nes.SetChrRomPage1K(3,4*this.MAPPER_REG[0]+3)):this.MAPPER_Latch1?(this.nes.SetChrRomPage1K(4,4*this.MAPPER_REG[3]),this.nes.SetChrRomPage1K(5,4*this.MAPPER_REG[3]+1),this.nes.SetChrRomPage1K(6,4*this.MAPPER_REG[3]+2),this.nes.SetChrRomPage1K(7,4*this.MAPPER_REG[3]+3)):(this.nes.SetChrRomPage1K(4,4*this.MAPPER_REG[2]),this.nes.SetChrRomPage1K(5,4*this.MAPPER_REG[2]+1),this.nes.SetChrRomPage1K(6,4*this.MAPPER_REG[2]+2),this.nes.SetChrRomPage1K(7,4*this.MAPPER_REG[2]+3))},h.prototype.BuildSpriteLine=function(){var t=this.nes.BgLineBuffer,e=4==(4&this.nes.IO1[1])?0:8;if(16==(16&this.nes.IO1[1])){for(var s=this.nes.SpriteLineBuffer,i=0;i<256;i++)s[i]=256;for(var h=this.nes.SPRITE_RAM,r=32==(32&this.nes.IO1[0])?16:8,P=(8&this.nes.IO1[0])<<9,R=this.nes.VRAM,a=this.nes.SPBitArray,o=this.nes.PpuY,n=0,E=0;E<=252;E+=4){var A=h[E]+1;if(!(A>o||A+r<=o))if(0===E&&(this.nes.Sprite0Line=!0),9!=++n){var _=h[E+3],M=_+8;M>256&&(M=256);var c=h[E+2],G=(3&c)<<2|16,p=32&c,C=128==(128&c)?r-1-(o-A):o-A,S=((8&C)<<1)+(7&C)+(8===r?(h[E+1]<<4)+P:((254&h[E+1])<<4)+((1&h[E+1])<<12));this.SetChrRom(S);var u,g,d=R[S>>10],m=1023&S,b=a[d[m]][d[m+8]];for(0==(64&c)?(u=0,g=1):(u=7,g=-1);_<M;_++,u+=g){var f=b[u];0!==f&&256===s[_]&&(s[_]=E,_>=e&&(0===p||16===t[_])&&(t[_]=f|G))}this.SetLatch(S)}else E=256}n>=8?this.nes.IO1[2]|=32:this.nes.IO1[2]&=223}},h.prototype.GetState=function(){this.nes.StateData.Mapper={},this.nes.StateData.Mapper.MAPPER_REG=this.MAPPER_REG.slice(0),this.nes.StateData.Mapper.MAPPER_Latch0=this.MAPPER_Latch0,this.nes.StateData.Mapper.MAPPER_Latch1=this.MAPPER_Latch1},h.prototype.SetState=function(){for(var t=0;t<this.nes.StateData.Mapper.MAPPER_REG.length;t++)this.MAPPER_REG[t]=this.nes.StateData.Mapper.MAPPER_REG[t];this.MAPPER_Latch0=this.nes.StateData.Mapper.MAPPER_Latch0,this.MAPPER_Latch1=this.nes.StateData.Mapper.MAPPER_Latch1},t.exports=h},3712:(t,e,s)=>{var i=s(9678),h=function(t){i.apply(this,arguments)};(h.prototype=Object.create(i.prototype)).Init=function(){this.nes.SetPrgRomPage(0,0),this.nes.SetPrgRomPage(1,this.nes.PrgRomPageCount-1),this.nes.SetChrRomPage(0)},h.prototype.WriteSRAM=function(t,e){this.nes.SetChrRomPage(3&e)},t.exports=h},7070:(t,e,s)=>{var i=s(9678),h=function(t){i.apply(this,arguments),this.MAPPER_REG=new Array(20)};(h.prototype=Object.create(i.prototype)).Init=function(){var t;for(t=0;t<this.MAPPER_REG.length;t++)this.MAPPER_REG[t]=0;this.MAPPER_REG[16]=0,this.MAPPER_REG[17]=1,this.MAPPER_REG[18]=2*(this.nes.PrgRomPageCount-1),this.MAPPER_REG[19]=2*(this.nes.PrgRomPageCount-1)+1,this.nes.SetPrgRomPages8K(this.MAPPER_REG[16],this.MAPPER_REG[17],this.MAPPER_REG[18],this.MAPPER_REG[19]),this.MAPPER_REG[8]=0,this.MAPPER_REG[9]=1,this.MAPPER_REG[10]=2,this.MAPPER_REG[11]=3,this.MAPPER_REG[12]=4,this.MAPPER_REG[13]=5,this.MAPPER_REG[14]=6,this.MAPPER_REG[15]=7,this.nes.SetChrRomPages1K(this.MAPPER_REG[8],this.MAPPER_REG[9],this.MAPPER_REG[10],this.MAPPER_REG[11],this.MAPPER_REG[12],this.MAPPER_REG[13],this.MAPPER_REG[14],this.MAPPER_REG[15])},h.prototype.Write=function(t,e){switch(57345&t){case 32768:this.MAPPER_REG[0]=e,128==(128&e)?this.nes.SetChrRomPages1K(this.MAPPER_REG[12],this.MAPPER_REG[13],this.MAPPER_REG[14],this.MAPPER_REG[15],this.MAPPER_REG[8],this.MAPPER_REG[9],this.MAPPER_REG[10],this.MAPPER_REG[11]):this.nes.SetChrRomPages1K(this.MAPPER_REG[8],this.MAPPER_REG[9],this.MAPPER_REG[10],this.MAPPER_REG[11],this.MAPPER_REG[12],this.MAPPER_REG[13],this.MAPPER_REG[14],this.MAPPER_REG[15]),64==(64&e)?this.nes.SetPrgRomPages8K(this.MAPPER_REG[18],this.MAPPER_REG[17],this.MAPPER_REG[16],this.MAPPER_REG[19]):this.nes.SetPrgRomPages8K(this.MAPPER_REG[16],this.MAPPER_REG[17],this.MAPPER_REG[18],this.MAPPER_REG[19]);break;case 32769:switch(this.MAPPER_REG[1]=e,128==(128&this.MAPPER_REG[0])?2==(7&this.MAPPER_REG[0])&&(128==(128&e)?this.nes.SetMirrors(0,0,0,0):this.nes.SetMirrors(1,1,1,1)):0==(7&this.MAPPER_REG[0])&&(128==(128&e)?this.nes.SetMirrors(0,0,0,0):this.nes.SetMirrors(1,1,1,1)),7&this.MAPPER_REG[0]){case 0:e&=254,this.MAPPER_REG[8]=e,this.MAPPER_REG[9]=e+1;break;case 1:e&=254,this.MAPPER_REG[10]=e,this.MAPPER_REG[11]=e+1;break;case 2:this.MAPPER_REG[12]=e;break;case 3:this.MAPPER_REG[13]=e;break;case 4:this.MAPPER_REG[14]=e;break;case 5:this.MAPPER_REG[15]=e;break;case 6:this.MAPPER_REG[16]=e;break;case 7:this.MAPPER_REG[17]=e}128==(128&this.MAPPER_REG[0])?this.nes.SetChrRomPages1K(this.MAPPER_REG[12],this.MAPPER_REG[13],this.MAPPER_REG[14],this.MAPPER_REG[15],this.MAPPER_REG[8],this.MAPPER_REG[9],this.MAPPER_REG[10],this.MAPPER_REG[11]):this.nes.SetChrRomPages1K(this.MAPPER_REG[8],this.MAPPER_REG[9],this.MAPPER_REG[10],this.MAPPER_REG[11],this.MAPPER_REG[12],this.MAPPER_REG[13],this.MAPPER_REG[14],this.MAPPER_REG[15]),64==(64&this.MAPPER_REG[0])?this.nes.SetPrgRomPages8K(this.MAPPER_REG[18],this.MAPPER_REG[17],this.MAPPER_REG[16],this.MAPPER_REG[19]):this.nes.SetPrgRomPages8K(this.MAPPER_REG[16],this.MAPPER_REG[17],this.MAPPER_REG[18],this.MAPPER_REG[19]);break;case 40960:this.MAPPER_REG[2]=e;break;case 40961:this.MAPPER_REG[3]=e;break;case 49152:this.MAPPER_REG[4]=e;break;case 49153:this.MAPPER_REG[5]=e;break;case 57344:this.MAPPER_REG[4]=this.MAPPER_REG[5],this.MAPPER_REG[7]=0,this.ClearIRQ();break;case 57345:this.MAPPER_REG[7]=1}},h.prototype.HSync=function(t){1===this.MAPPER_REG[7]&&t<240&&8==(8&this.nes.IO1[1])&&(0==--this.MAPPER_REG[4]&&this.SetIRQ(),this.MAPPER_REG[4]&=255)},t.exports=h},9454:(t,e,s)=>{var i=s(9678),h=function(t){i.apply(this,arguments),this.MAPPER_REG=new Array(20)};(h.prototype=Object.create(i.prototype)).Init=function(){var t;for(t=0;t<this.MAPPER_REG.length;t++)this.MAPPER_REG[t]=0;this.MAPPER_REG[16]=0,this.MAPPER_REG[17]=1,this.MAPPER_REG[18]=2*(this.nes.PrgRomPageCount-1),this.MAPPER_REG[19]=2*(this.nes.PrgRomPageCount-1)+1,this.nes.SetPrgRomPages8K(this.MAPPER_REG[16],this.MAPPER_REG[17],this.MAPPER_REG[18],this.MAPPER_REG[19]),this.MAPPER_REG[8]=0,this.MAPPER_REG[9]=1,this.MAPPER_REG[10]=2,this.MAPPER_REG[11]=3,this.MAPPER_REG[12]=4,this.MAPPER_REG[13]=5,this.MAPPER_REG[14]=6,this.MAPPER_REG[15]=7,this.nes.SetChrRomPages1K(this.MAPPER_REG[8],this.MAPPER_REG[9],this.MAPPER_REG[10],this.MAPPER_REG[11],this.MAPPER_REG[12],this.MAPPER_REG[13],this.MAPPER_REG[14],this.MAPPER_REG[15])},h.prototype.SetChrRomPages1K=function(t,e,s,i,h,r,P,R){0==(64&t)?this.nes.SetChrRomPage1K(0,63&t):this.nes.VRAM[0]=this.nes.VRAMS[7&t],0==(64&e)?this.nes.SetChrRomPage1K(1,63&e):this.nes.VRAM[1]=this.nes.VRAMS[7&e],0==(64&s)?this.nes.SetChrRomPage1K(2,63&s):this.nes.VRAM[2]=this.nes.VRAMS[7&s],0==(64&i)?this.nes.SetChrRomPage1K(3,63&i):this.nes.VRAM[3]=this.nes.VRAMS[7&i],0==(64&h)?this.nes.SetChrRomPage1K(4,63&h):this.nes.VRAM[4]=this.nes.VRAMS[7&h],0==(64&r)?this.nes.SetChrRomPage1K(5,63&r):this.nes.VRAM[5]=this.nes.VRAMS[7&r],0==(64&P)?this.nes.SetChrRomPage1K(6,63&P):this.nes.VRAM[6]=this.nes.VRAMS[7&P],0==(64&R)?this.nes.SetChrRomPage1K(7,63&R):this.nes.VRAM[7]=this.nes.VRAMS[7&R]},h.prototype.Write=function(t,e){switch(57345&t){case 32768:this.MAPPER_REG[0]=e,128==(128&e)?this.SetChrRomPages1K(this.MAPPER_REG[12],this.MAPPER_REG[13],this.MAPPER_REG[14],this.MAPPER_REG[15],this.MAPPER_REG[8],this.MAPPER_REG[9],this.MAPPER_REG[10],this.MAPPER_REG[11]):this.SetChrRomPages1K(this.MAPPER_REG[8],this.MAPPER_REG[9],this.MAPPER_REG[10],this.MAPPER_REG[11],this.MAPPER_REG[12],this.MAPPER_REG[13],this.MAPPER_REG[14],this.MAPPER_REG[15]),64==(64&e)?this.nes.SetPrgRomPages8K(this.MAPPER_REG[18],this.MAPPER_REG[17],this.MAPPER_REG[16],this.MAPPER_REG[19]):this.nes.SetPrgRomPages8K(this.MAPPER_REG[16],this.MAPPER_REG[17],this.MAPPER_REG[18],this.MAPPER_REG[19]);break;case 32769:switch(this.MAPPER_REG[1]=e,7&this.MAPPER_REG[0]){case 0:e&=254,this.MAPPER_REG[8]=e,this.MAPPER_REG[9]=e+1;break;case 1:e&=254,this.MAPPER_REG[10]=e,this.MAPPER_REG[11]=e+1;break;case 2:this.MAPPER_REG[12]=e;break;case 3:this.MAPPER_REG[13]=e;break;case 4:this.MAPPER_REG[14]=e;break;case 5:this.MAPPER_REG[15]=e;break;case 6:this.MAPPER_REG[16]=e;break;case 7:this.MAPPER_REG[17]=e}128==(128&this.MAPPER_REG[0])?this.SetChrRomPages1K(this.MAPPER_REG[12],this.MAPPER_REG[13],this.MAPPER_REG[14],this.MAPPER_REG[15],this.MAPPER_REG[8],this.MAPPER_REG[9],this.MAPPER_REG[10],this.MAPPER_REG[11]):this.SetChrRomPages1K(this.MAPPER_REG[8],this.MAPPER_REG[9],this.MAPPER_REG[10],this.MAPPER_REG[11],this.MAPPER_REG[12],this.MAPPER_REG[13],this.MAPPER_REG[14],this.MAPPER_REG[15]),64==(64&this.MAPPER_REG[0])?this.nes.SetPrgRomPages8K(this.MAPPER_REG[18],this.MAPPER_REG[17],this.MAPPER_REG[16],this.MAPPER_REG[19]):this.nes.SetPrgRomPages8K(this.MAPPER_REG[16],this.MAPPER_REG[17],this.MAPPER_REG[18],this.MAPPER_REG[19]);break;case 40960:1==(1&e)?this.nes.SetMirror(!0):this.nes.SetMirror(!1),this.MAPPER_REG[2]=e;break;case 40961:this.MAPPER_REG[3]=e;break;case 49152:this.MAPPER_REG[4]=e;break;case 49153:this.MAPPER_REG[5]=e;break;case 57344:this.MAPPER_REG[4]=this.MAPPER_REG[5],this.MAPPER_REG[7]=0,this.ClearIRQ();break;case 57345:this.MAPPER_REG[7]=1}},h.prototype.HSync=function(t){1===this.MAPPER_REG[7]&&t<240&&8==(8&this.nes.IO1[1])&&(0==--this.MAPPER_REG[4]&&this.SetIRQ(),this.MAPPER_REG[4]&=255)},t.exports=h},2178:(t,e,s)=>{var i=s(9678),h=function(t){i.apply(this,arguments)};(h.prototype=Object.create(i.prototype)).Init=function(){this.nes.SetPrgRomPage(0,0),this.nes.SetPrgRomPage(1,1),this.nes.SetChrRomPage(0)},h.prototype.WriteSRAM=function(t,e){var s=(48&e)>>3;this.nes.SetPrgRomPage(0,s),this.nes.SetPrgRomPage(1,s+1),this.nes.SetChrRomPage(15&e)},t.exports=h},1816:(t,e,s)=>{var i=s(9678),h=function(t){i.apply(this,arguments)};(h.prototype=Object.create(i.prototype)).Init=function(){this.nes.SetPrgRomPage(0,0),this.nes.SetPrgRomPage(1,this.nes.PrgRomPageCount-1),this.nes.SetChrRomPage(0)},h.prototype.WriteSRAM=function(t,e){this.nes.SetPrgRomPage(0,(112&e)>>4),this.nes.SetChrRomPage(15&e),128==(128&e)?this.nes.SetMirrors(0,0,0,0):this.nes.SetMirrors(1,1,1,1)},t.exports=h},9785:(t,e,s)=>{var i=s(9678),h=function(t){i.apply(this,arguments),this.MAPPER_REG=new Array(5),this.EEPROM_ADDRESS=0,this.OUT_DATA=0,this.BIT_DATA=0,this.BIT_DATA_TMP=0,this.BIT_COUNTER=0,this.READ_WRITE=!1,this.SCL_OLD=!1,this.SCL=!1,this.SDA_OLD=!1,this.SDA=!1,this.STATE=0,this.EEPROM=new Array(256);for(var e=0;e<this.EEPROM.length;e++)this.EEPROM[e]=0};(h.prototype=Object.create(i.prototype)).Init=function(){this.MAPPER_REG[0]=0,this.MAPPER_REG[1]=0,this.nes.SetPrgRomPages8K(0,1,2*this.nes.PrgRomPageCount-2,2*this.nes.PrgRomPageCount-1),this.nes.SetChrRomPages1K(0,1,2,3,4,5,6,7),this.EEPROM_ADDRESS=0,this.OUT_DATA=0,this.BIT_DATA=0,this.BIT_DATA_TMP=0,this.BIT_COUNTER=0,this.READ_WRITE=!1,this.SCL_OLD=!1,this.SCL=!1,this.SDA_OLD=!1,this.SDA=!1,this.STATE=0},h.prototype.Write=function(t,e){switch(15&t){case 0:this.nes.SetChrRomPage1K(0,e);break;case 1:this.nes.SetChrRomPage1K(1,e);break;case 2:this.nes.SetChrRomPage1K(2,e);break;case 3:this.nes.SetChrRomPage1K(3,e);break;case 4:this.nes.SetChrRomPage1K(4,e);break;case 5:this.nes.SetChrRomPage1K(5,e);break;case 6:this.nes.SetChrRomPage1K(6,e);break;case 7:this.nes.SetChrRomPage1K(7,e);break;case 8:this.nes.SetPrgRomPage8K(0,2*e),this.nes.SetPrgRomPage8K(1,2*e+1);break;case 9:0==(e&=3)?this.nes.SetMirror(!1):1===e?this.nes.SetMirror(!0):2===e?this.nes.SetMirrors(0,0,0,0):this.nes.SetMirrors(1,1,1,1);break;case 10:this.MAPPER_REG[0]=1&e,this.ClearIRQ();break;case 11:this.MAPPER_REG[1]=65280&this.MAPPER_REG[1]|e;break;case 12:this.MAPPER_REG[1]=255&this.MAPPER_REG[1]|e<<8;break;case 13:if(this.SCL_OLD=this.SCL,this.SCL=32==(32&e),this.SDA_OLD=this.SDA,this.SDA=64==(64&e),this.SCL_OLD&&this.SCL&&this.SDA_OLD&&!this.SDA&&(this.STATE=1,this.BIT_DATA_TMP=0,this.BIT_COUNTER=0),this.SCL_OLD&&this.SCL&&!this.SDA_OLD&&this.SDA&&(this.STATE=0),!this.SCL_OLD&&this.SCL)switch(this.STATE){case 1:this.BIT_IN()&&(this.READ_WRITE=1==(1&this.BIT_DATA),this.STATE=this.READ_WRITE?4:2);break;case 2:this.BIT_IN()&&(this.STATE=3,this.EEPROM_ADDRESS=this.BIT_DATA);break;case 3:this.BIT_IN()&&(this.EEPROM[this.EEPROM_ADDRESS]=this.BIT_DATA,this.EEPROM_ADDRESS=this.EEPROM_ADDRESS+1&255);break;case 4:0===this.BIT_COUNTER&&(this.BIT_DATA=this.EEPROM[this.EEPROM_ADDRESS],this.EEPROM_ADDRESS=this.EEPROM_ADDRESS+1&255),this.BIT_OUT()}}},h.prototype.BIT_OUT=function(){return 8===this.BIT_COUNTER?(this.BIT_COUNTER=0,!0):(this.OUT_DATA=(128&this.BIT_DATA)>>>3,this.BIT_DATA=this.BIT_DATA<<1&255,this.BIT_COUNTER++,!1)},h.prototype.BIT_IN=function(){return 8===this.BIT_COUNTER?(this.BIT_COUNTER=0,this.OUT_DATA=0,!0):(this.BIT_DATA=255&(this.BIT_DATA<<1|(this.SDA?1:0)),this.BIT_COUNTER++,!1)},h.prototype.ReadSRAM=function(t){return this.OUT_DATA},h.prototype.WriteSRAM=function(t,e){this.Write(t,e)},h.prototype.CPUSync=function(t){1===this.MAPPER_REG[0]&&(0===this.MAPPER_REG[1]&&(this.MAPPER_REG[1]=65536),this.MAPPER_REG[1]-=t,this.MAPPER_REG[1]<=0&&(this.SetIRQ(),this.MAPPER_REG[0]=0,this.MAPPER_REG[1]=0))},t.exports=h},7336:(t,e,s)=>{var i=s(9678),h=function(t){i.apply(this,arguments),this.MAPPER_REG=new Array(15),this.IRQ_Counter=0};(h.prototype=Object.create(i.prototype)).Init=function(){for(var t=0;t<this.MAPPER_REG.length;t++)this.MAPPER_REG[t]=0;this.IRQ_Counter=0,this.nes.SetPrgRomPages8K(0,1,2,2*this.nes.PrgRomPageCount-1),this.nes.SetChrRomPages1K(0,1,2,3,4,5,6,7)},h.prototype.Write=function(t,e){if(t>=32768&&t<57344){var s=(28672&t)>>>11|(2&t)>>>1;return this.MAPPER_REG[s]=0==(1&t)?240&this.MAPPER_REG[s]|15&e:15&this.MAPPER_REG[s]|(15&e)<<4,s<3&&this.nes.SetPrgRomPage8K(s,this.MAPPER_REG[s]),void(s>=4&&this.nes.SetChrRomPage1K(s-4,this.MAPPER_REG[s]))}switch(61443&t){case 57344:case 57345:case 57346:case 57347:var i=4*(3&t);this.MAPPER_REG[12]=this.MAPPER_REG[12]&~(15<<i)|(15&e)<<i;break;case 61440:this.IRQ_Counter=this.MAPPER_REG[12],this.ClearIRQ();break;case 61441:this.MAPPER_REG[13]=e,this.ClearIRQ();break;case 61442:this.MAPPER_REG[14]=e,0==(e&=3)?this.nes.SetMirror(!0):1===e?this.nes.SetMirror(!1):2===e?this.nes.SetMirrors(0,0,0,0):this.nes.SetMirrors(1,1,1,1)}},h.prototype.CPUSync=function(t){if(1==(1&this.MAPPER_REG[13])){var e;switch(14&this.MAPPER_REG[13]){case 0:e=65535;break;case 2:e=4095;break;case 4:case 6:e=255;break;case 8:case 10:case 12:case 14:e=15}var s=(this.IRQ_Counter&e)-t;s<0&&this.SetIRQ(),this.IRQ_Counter=this.IRQ_Counter&~e|s&e}},t.exports=h},2066:(t,e,s)=>{var i=s(9678),h=function(t){i.apply(this,arguments)};(h.prototype=Object.create(i.prototype)).Init=function(){this.nes.SetPrgRomPage(0,0),this.nes.SetPrgRomPage(1,this.nes.PrgRomPageCount-1),this.nes.SetChrRomPage(0)},h.prototype.Write=function(t,e){this.nes.SetPrgRomPage(1,e)},t.exports=h},6686:(t,e,s)=>{var i=s(9678),h=function(t){i.apply(this,arguments)};(h.prototype=Object.create(i.prototype)).Init=function(){this.nes.SetPrgRomPage(0,0),this.nes.SetPrgRomPage(1,this.nes.PrgRomPageCount-1)},h.prototype.WriteSRAM=function(t,e){var s,i=2*this.nes.ChrRomPageCount-1;s=4*(e&i),this.nes.SetChrRomPage1K(0,s),this.nes.SetChrRomPage1K(1,s+1),this.nes.SetChrRomPage1K(2,s+2),this.nes.SetChrRomPage1K(3,s+3),s=4*(e>>>4&i),this.nes.SetChrRomPage1K(4,s),this.nes.SetChrRomPage1K(5,s+1),this.nes.SetChrRomPage1K(6,s+2),this.nes.SetChrRomPage1K(7,s+3)},t.exports=h},7185:(t,e,s)=>{var i=s(9678),h=function(t){i.apply(this,arguments),this.MAPPER_REG=0,this.EX_ChrRom=new Array(1024)};(h.prototype=Object.create(i.prototype)).Init=function(){for(var t=0;t<this.EX_ChrRom.length;t++)this.EX_ChrRom[t]=255;this.MAPPER_REG=0,this.nes.SetPrgRomPages8K(0,1,2,3),this.nes.VRAM[0]=this.EX_ChrRom,this.nes.VRAM[1]=this.EX_ChrRom,this.nes.VRAM[2]=this.EX_ChrRom,this.nes.VRAM[3]=this.EX_ChrRom,this.nes.VRAM[4]=this.EX_ChrRom,this.nes.VRAM[5]=this.EX_ChrRom,this.nes.VRAM[6]=this.EX_ChrRom,this.nes.VRAM[7]=this.EX_ChrRom},h.prototype.Write=function(t,e){this.MAPPER_REG=e,0!=(3&e)?this.nes.SetChrRomPages1K(0,1,2,3,4,5,6,7):(this.nes.VRAM[0]=this.EX_ChrRom,this.nes.VRAM[1]=this.EX_ChrRom,this.nes.VRAM[2]=this.EX_ChrRom,this.nes.VRAM[3]=this.EX_ChrRom,this.nes.VRAM[4]=this.EX_ChrRom,this.nes.VRAM[5]=this.EX_ChrRom,this.nes.VRAM[6]=this.EX_ChrRom,this.nes.VRAM[7]=this.EX_ChrRom)},t.exports=h},9677:(t,e,s)=>{var i=s(9678),h=function(t){i.apply(this,arguments),this.MAPPER_REG=new Array(5),this.EX_VRAM=new Array(32)};(h.prototype=Object.create(i.prototype)).Init=function(){var t;for(t=0;t<this.MAPPER_REG.length;t++)this.MAPPER_REG[t]=0;for(t=0;t<this.EX_VRAM.length;t++){this.EX_VRAM[t]=new Array(1024);for(var e=0;e<this.EX_VRAM[t].length;e++)this.EX_VRAM[t][e]=0}this.nes.SetPrgRomPages8K(0,1,2*this.nes.PrgRomPageCount-2,2*this.nes.PrgRomPageCount-1),this.nes.ChrRomPageCount>=1&&this.nes.SetChrRomPages1K(8*this.nes.ChrRomPageCount-8,8*this.nes.ChrRomPageCount-7,8*this.nes.ChrRomPageCount-6,8*this.nes.ChrRomPageCount-5,8*this.nes.ChrRomPageCount-4,8*this.nes.ChrRomPageCount-3,8*this.nes.ChrRomPageCount-2,8*this.nes.ChrRomPageCount-1)},h.prototype.ReadLow=function(t){switch(63488&t){case 18432:return this.nes.Read_N163_RAM();case 20480:return this.ClearIRQ(),255&this.MAPPER_REG[4];case 22528:return this.ClearIRQ(),this.MAPPER_REG[3]<<7|(32512&this.MAPPER_REG[4])>>8}return 0},h.prototype.WriteLow=function(t,e){switch(63488&t){case 18432:18432===t&&this.nes.Write_N163_RAM(e);break;case 20480:this.MAPPER_REG[4]=65280&this.MAPPER_REG[4]|e,this.ClearIRQ();break;case 22528:this.MAPPER_REG[4]=255&this.MAPPER_REG[4]|(127&e)<<8,this.MAPPER_REG[3]=(128&e)>>7,this.ClearIRQ()}},h.prototype.Write=function(t,e){switch(63488&t){case 32768:e<224||1===this.MAPPER_REG[0]?this.nes.SetChrRomPage1K(0,e):this.nes.VRAM[0]=this.EX_VRAM[224&e];break;case 34816:e<224||1===this.MAPPER_REG[0]?this.nes.SetChrRomPage1K(1,e):this.nes.VRAM[1]=this.EX_VRAM[224&e];break;case 36864:e<224||1===this.MAPPER_REG[0]?this.nes.SetChrRomPage1K(2,e):this.nes.VRAM[2]=this.EX_VRAM[224&e];break;case 38912:e<224||1===this.MAPPER_REG[0]?this.nes.SetChrRomPage1K(3,e):this.nes.VRAM[3]=this.EX_VRAM[224&e];break;case 40960:e<224||1===this.MAPPER_REG[1]?this.nes.SetChrRomPage1K(4,e):this.nes.VRAM[4]=this.EX_VRAM[224&e];break;case 43008:e<224||1===this.MAPPER_REG[1]?this.nes.SetChrRomPage1K(5,e):this.nes.VRAM[5]=this.EX_VRAM[224&e];break;case 45056:e<224||1===this.MAPPER_REG[1]?this.nes.SetChrRomPage1K(6,e):this.nes.VRAM[6]=this.EX_VRAM[224&e];break;case 47104:e<224||1===this.MAPPER_REG[1]?this.nes.SetChrRomPage1K(7,e):this.nes.VRAM[7]=this.EX_VRAM[224&e];break;case 49152:e<224?this.nes.SetChrRomPage1K(8,e):this.nes.VRAM[8]=this.nes.VRAMS[8+(1&e)];break;case 51200:e<224?this.nes.SetChrRomPage1K(9,e):this.nes.VRAM[9]=this.nes.VRAMS[8+(1&e)];break;case 53248:e<224?this.nes.SetChrRomPage1K(10,e):this.nes.VRAM[10]=this.nes.VRAMS[8+(1&e)];break;case 55296:e<224?this.nes.SetChrRomPage1K(11,e):this.nes.VRAM[11]=this.nes.VRAMS[8+(1&e)];break;case 57344:this.nes.SetPrgRomPage8K(0,63&e);break;case 59392:this.nes.SetPrgRomPage8K(1,63&e),this.MAPPER_REG[0]=(64&e)>>6,this.MAPPER_REG[1]=(128&e)>>7;break;case 61440:this.nes.SetPrgRomPage8K(2,63&e);break;case 63488:63488===t&&(this.nes.N163_Address=e)}},h.prototype.CPUSync=function(t){0!==this.MAPPER_REG[3]&&(this.MAPPER_REG[4]+=t,this.MAPPER_REG[4]>=32767&&(this.MAPPER_REG[4]-=32767,this.SetIRQ()))},h.prototype.OutEXSound=function(t){return(t>>1)+(this.nes.Out_N163()>>1)},h.prototype.EXSoundSync=function(t){this.nes.Count_N163(t)},t.exports=h},6433:(t,e,s)=>{var i=s(9678),h=function(t){i.apply(this,arguments)};(h.prototype=Object.create(i.prototype)).Init=function(){this.nes.SetPrgRomPage(0,0),this.nes.SetPrgRomPage(1,this.nes.PrgRomPageCount-1),this.nes.SetChrRomPage(0)},h.prototype.Write=function(t,e){this.nes.SetPrgRomPage(0,e)},t.exports=h},4030:(t,e,s)=>{var i=s(9678),h=function(t){i.apply(this,arguments),this.MAPPER_REG=new Array(11),this.EX_RAM=new Array(128)};(h.prototype=Object.create(i.prototype)).Init=function(){var t;for(t=0;t<this.MAPPER_REG.length;t++)this.MAPPER_REG[t]=0;for(t=0;t<this.EX_RAM.length;t++)this.EX_RAM[t]=0;this.nes.SetPrgRomPages8K(0,1,2,2*this.nes.PrgRomPageCount-1),this.nes.SetChrRomPages1K(0,1,2,3,4,5,6,7)},h.prototype.ReadSRAM=function(t){if(t>=32512&&t<=32767)return this.EX_RAM[127&t];switch(t){case 32496:return this.MAPPER_REG[0];case 32497:return this.MAPPER_REG[1];case 32498:return this.MAPPER_REG[2];case 32499:return this.MAPPER_REG[3];case 32500:return this.MAPPER_REG[4];case 32501:return this.MAPPER_REG[5];case 32502:case 32503:return this.MAPPER_REG[6];case 32504:case 32505:return this.MAPPER_REG[7];case 32506:case 32507:return this.MAPPER_REG[8];case 32508:case 32509:return this.MAPPER_REG[9];case 32510:case 32511:return this.MAPPER_REG[10]}return 0},h.prototype.WriteSRAM=function(t,e){if(t>=32512&&t<=32767)this.EX_RAM[127&t]=e;else switch(t){case 32496:this.MAPPER_REG[0]=e,0==(128&e)?(this.nes.VRAM[8]=this.nes.VRAMS[8],this.nes.VRAM[9]=this.nes.VRAMS[8]):(this.nes.VRAM[8]=this.nes.VRAMS[9],this.nes.VRAM[9]=this.nes.VRAMS[9]),this.nes.SetChrRomPage1K(0,126&e),this.nes.SetChrRomPage1K(1,1+(126&e));break;case 32497:this.MAPPER_REG[1]=e,0==(128&e)?(this.nes.SetChrRomPage1K(10,264),this.nes.SetChrRomPage1K(11,264)):(this.nes.SetChrRomPage1K(10,265),this.nes.SetChrRomPage1K(11,265)),this.nes.SetChrRomPage1K(2,126&e),this.nes.SetChrRomPage1K(3,1+(126&e));break;case 32498:this.MAPPER_REG[2]=e,this.nes.SetChrRomPage1K(4,e);break;case 32499:this.MAPPER_REG[3]=e,this.nes.SetChrRomPage1K(5,e);break;case 32500:this.MAPPER_REG[4]=e,this.nes.SetChrRomPage1K(6,e);break;case 32501:this.MAPPER_REG[5]=e,this.nes.SetChrRomPage1K(7,e);break;case 32504:case 32505:this.MAPPER_REG[7]=e;break;case 32506:case 32507:this.MAPPER_REG[8]=e,this.nes.SetPrgRomPage8K(0,e);break;case 32508:case 32509:this.MAPPER_REG[9]=e,this.nes.SetPrgRomPage8K(1,e);break;case 32510:case 32511:this.MAPPER_REG[10]=e,this.nes.SetPrgRomPage8K(2,e)}},t.exports=h},1338:(t,e,s)=>{var i=s(9678),h=function(t){i.apply(this,arguments),this.MAPPER_REG=new Array(16)};(h.prototype=Object.create(i.prototype)).Init=function(){var t;for(t=0;t<this.MAPPER_REG.length;t++)this.MAPPER_REG[t]=0;this.nes.SetPrgRomPages8K(0,1,2*this.nes.PrgRomPageCount-2,2*this.nes.PrgRomPageCount-1),0!==this.nes.ChrRomPageCount&&this.nes.SetChrRomPages1K(0,1,2,3,4,5,6,7)},h.prototype.Write=function(t,e){switch(61440&t){case 32768:0!=(2&this.MAPPER_REG[10])?this.nes.SetPrgRomPage8K(2,e):this.nes.SetPrgRomPage8K(0,e);break;case 40960:this.nes.SetPrgRomPage8K(1,e)}switch(61455&t){case 36864:0==(e&=3)?this.nes.SetMirror(!1):1===e?this.nes.SetMirror(!0):2===e?this.nes.SetMirrors(0,0,0,0):this.nes.SetMirrors(1,1,1,1);break;case 36872:this.MAPPER_REG[10]=e;break;case 45056:this.MAPPER_REG[0]=240&this.MAPPER_REG[0]|15&e,this.nes.SetChrRomPage1K(0,this.MAPPER_REG[0]>>1);break;case 45058:case 45064:this.MAPPER_REG[0]=15&this.MAPPER_REG[0]|(15&e)<<4,this.nes.SetChrRomPage1K(0,this.MAPPER_REG[0]>>1);break;case 45057:case 45060:this.MAPPER_REG[1]=240&this.MAPPER_REG[1]|15&e,this.nes.SetChrRomPage1K(1,this.MAPPER_REG[1]>>1);break;case 45059:case 45068:this.MAPPER_REG[1]=15&this.MAPPER_REG[1]|(15&e)<<4,this.nes.SetChrRomPage1K(1,this.MAPPER_REG[1]>>1);break;case 49152:this.MAPPER_REG[2]=240&this.MAPPER_REG[2]|15&e,this.nes.SetChrRomPage1K(2,this.MAPPER_REG[2]>>1);break;case 49154:case 49160:this.MAPPER_REG[2]=15&this.MAPPER_REG[2]|(15&e)<<4,this.nes.SetChrRomPage1K(2,this.MAPPER_REG[2]>>1);break;case 49153:case 49156:this.MAPPER_REG[3]=240&this.MAPPER_REG[3]|15&e,this.nes.SetChrRomPage1K(3,this.MAPPER_REG[3]>>1);break;case 49155:case 49164:this.MAPPER_REG[3]=15&this.MAPPER_REG[3]|(15&e)<<4,this.nes.SetChrRomPage1K(3,this.MAPPER_REG[3]>>1);break;case 53248:this.MAPPER_REG[4]=240&this.MAPPER_REG[4]|15&e,this.nes.SetChrRomPage1K(4,this.MAPPER_REG[4]>>1);break;case 53250:case 53256:this.MAPPER_REG[4]=15&this.MAPPER_REG[4]|(15&e)<<4,this.nes.SetChrRomPage1K(4,this.MAPPER_REG[4]>>1);break;case 53249:case 53252:this.MAPPER_REG[5]=240&this.MAPPER_REG[5]|15&e,this.nes.SetChrRomPage1K(5,this.MAPPER_REG[5]>>1);break;case 53251:case 53260:this.MAPPER_REG[5]=15&this.MAPPER_REG[5]|(15&e)<<4,this.nes.SetChrRomPage1K(5,this.MAPPER_REG[5]>>1);break;case 57344:this.MAPPER_REG[6]=240&this.MAPPER_REG[6]|15&e,this.nes.SetChrRomPage1K(6,this.MAPPER_REG[6]>>1);break;case 57346:case 57352:this.MAPPER_REG[6]=15&this.MAPPER_REG[6]|(15&e)<<4,this.nes.SetChrRomPage1K(6,this.MAPPER_REG[6]>>1);break;case 57345:case 57348:this.MAPPER_REG[7]=240&this.MAPPER_REG[7]|15&e,this.nes.SetChrRomPage1K(7,this.MAPPER_REG[7]>>1);break;case 57347:case 57356:this.MAPPER_REG[7]=15&this.MAPPER_REG[7]|(15&e)<<4,this.nes.SetChrRomPage1K(7,this.MAPPER_REG[7]>>1)}},t.exports=h},1747:(t,e,s)=>{var i=s(9678),h=function(t){i.apply(this,arguments),this.MAPPER_REG=new Array(16)};(h.prototype=Object.create(i.prototype)).Init=function(){var t;for(t=0;t<this.MAPPER_REG.length;t++)this.MAPPER_REG[t]=0;this.nes.SetPrgRomPages8K(0,1,2*this.nes.PrgRomPageCount-2,2*this.nes.PrgRomPageCount-1),0!==this.nes.ChrRomPageCount&&this.nes.SetChrRomPages1K(0,1,2,3,4,5,6,7)},h.prototype.Write=function(t,e){switch(61440&t){case 32768:0!=(2&this.MAPPER_REG[10])?this.nes.SetPrgRomPage8K(2,e):this.nes.SetPrgRomPage8K(0,e);break;case 40960:this.nes.SetPrgRomPage8K(1,e)}switch(61455&t){case 36864:0==(e&=3)?this.nes.SetMirror(!1):1===e?this.nes.SetMirror(!0):2===e?this.nes.SetMirrors(0,0,0,0):this.nes.SetMirrors(1,1,1,1);break;case 36872:this.MAPPER_REG[10]=e;break;case 45056:this.MAPPER_REG[0]=240&this.MAPPER_REG[0]|15&e,this.nes.SetChrRomPage1K(0,this.MAPPER_REG[0]);break;case 45057:case 45060:this.MAPPER_REG[0]=15&this.MAPPER_REG[0]|(15&e)<<4,this.nes.SetChrRomPage1K(0,this.MAPPER_REG[0]);break;case 45058:case 45064:this.MAPPER_REG[1]=240&this.MAPPER_REG[1]|15&e,this.nes.SetChrRomPage1K(1,this.MAPPER_REG[1]);break;case 45059:case 45068:this.MAPPER_REG[1]=15&this.MAPPER_REG[1]|(15&e)<<4,this.nes.SetChrRomPage1K(1,this.MAPPER_REG[1]);break;case 49152:this.MAPPER_REG[2]=240&this.MAPPER_REG[2]|15&e,this.nes.SetChrRomPage1K(2,this.MAPPER_REG[2]);break;case 49153:case 49156:this.MAPPER_REG[2]=15&this.MAPPER_REG[2]|(15&e)<<4,this.nes.SetChrRomPage1K(2,this.MAPPER_REG[2]);break;case 49154:case 49160:this.MAPPER_REG[3]=240&this.MAPPER_REG[3]|15&e,this.nes.SetChrRomPage1K(3,this.MAPPER_REG[3]);break;case 49155:case 49164:this.MAPPER_REG[3]=15&this.MAPPER_REG[3]|(15&e)<<4,this.nes.SetChrRomPage1K(3,this.MAPPER_REG[3]);break;case 53248:this.MAPPER_REG[4]=240&this.MAPPER_REG[4]|15&e,this.nes.SetChrRomPage1K(4,this.MAPPER_REG[4]);break;case 53249:case 53252:this.MAPPER_REG[4]=15&this.MAPPER_REG[4]|(15&e)<<4,this.nes.SetChrRomPage1K(4,this.MAPPER_REG[4]);break;case 53250:case 53256:this.MAPPER_REG[5]=240&this.MAPPER_REG[5]|15&e,this.nes.SetChrRomPage1K(5,this.MAPPER_REG[5]);break;case 53251:case 53260:this.MAPPER_REG[5]=15&this.MAPPER_REG[5]|(15&e)<<4,this.nes.SetChrRomPage1K(5,this.MAPPER_REG[5]);break;case 57344:this.MAPPER_REG[6]=240&this.MAPPER_REG[6]|15&e,this.nes.SetChrRomPage1K(6,this.MAPPER_REG[6]);break;case 57345:case 57348:this.MAPPER_REG[6]=15&this.MAPPER_REG[6]|(15&e)<<4,this.nes.SetChrRomPage1K(6,this.MAPPER_REG[6]);break;case 57346:case 57352:this.MAPPER_REG[7]=240&this.MAPPER_REG[7]|15&e,this.nes.SetChrRomPage1K(7,this.MAPPER_REG[7]);break;case 57347:case 57356:this.MAPPER_REG[7]=15&this.MAPPER_REG[7]|(15&e)<<4,this.nes.SetChrRomPage1K(7,this.MAPPER_REG[7]);break;case 61440:this.MAPPER_REG[13]=240&this.MAPPER_REG[13]|15&e;break;case 61441:case 61444:this.MAPPER_REG[13]=15&this.MAPPER_REG[13]|(15&e)<<4;break;case 61442:case 61448:this.MAPPER_REG[11]=7&e,0!=(2&this.MAPPER_REG[11])&&(this.MAPPER_REG[12]=this.MAPPER_REG[13]);break;case 61443:case 61452:0!=(1&this.MAPPER_REG[11])?this.MAPPER_REG[11]|=2:this.MAPPER_REG[11]&=1,this.ClearIRQ()}},h.prototype.HSync=function(t){2==(6&this.MAPPER_REG[11])&&(255===this.MAPPER_REG[12]?(this.MAPPER_REG[12]=this.MAPPER_REG[13],this.SetIRQ()):this.MAPPER_REG[12]++)},h.prototype.CPUSync=function(t){6==(6&this.MAPPER_REG[11])&&(this.MAPPER_REG[12]>=255?(this.MAPPER_REG[12]=this.MAPPER_REG[13],this.SetIRQ()):this.MAPPER_REG[12]+=t)},t.exports=h},8646:(t,e,s)=>{var i=s(9678),h=function(t){i.apply(this,arguments),this.MAPPER_REG=new Array(3)};(h.prototype=Object.create(i.prototype)).Init=function(){this.MAPPER_REG[0]=0,this.MAPPER_REG[1]=0,this.MAPPER_REG[2]=0,this.nes.SetPrgRomPages8K(0,1,2,2*this.nes.PrgRomPageCount-1),this.nes.SetChrRomPages1K(0,1,2,3,4,5,6,7)},h.prototype.Write=function(t,e){switch(61443&t){case 32768:case 32769:case 32770:case 32771:this.nes.SetPrgRomPage8K(0,2*e),this.nes.SetPrgRomPage8K(1,2*e+1);break;case 36864:case 36865:case 36866:this.nes.Write_VRC6_REG(3&t,e);break;case 40960:case 40961:case 40962:this.nes.Write_VRC6_REG(4+(3&t),e);break;case 45056:case 45057:case 45058:this.nes.Write_VRC6_REG(8+(3&t),e);break;case 45059:0==(e&=12)?this.nes.SetMirror(!1):4===e?this.nes.SetMirror(!0):8===e?this.nes.SetMirrors(0,0,0,0):this.nes.SetMirrors(1,1,1,1);break;case 49152:case 49153:case 49154:case 49155:this.nes.SetPrgRomPage8K(2,e);break;case 53248:case 53249:case 53250:case 53251:this.nes.SetChrRomPage1K(3&t,e);break;case 57344:case 57345:case 57346:case 57347:this.nes.SetChrRomPage1K(4+(3&t),e);break;case 61440:this.MAPPER_REG[0]=e;break;case 61441:this.MAPPER_REG[1]=7&e,0!=(2&this.MAPPER_REG[1])&&(this.MAPPER_REG[2]=this.MAPPER_REG[0]);break;case 61442:0!=(1&this.MAPPER_REG[1])?this.MAPPER_REG[1]|=2:this.MAPPER_REG[1]&=1,this.ClearIRQ()}},h.prototype.HSync=function(t){2==(6&this.MAPPER_REG[1])&&(255===this.MAPPER_REG[2]?(this.MAPPER_REG[2]=this.MAPPER_REG[0],this.SetIRQ()):this.MAPPER_REG[2]++)},h.prototype.CPUSync=function(t){6==(6&this.MAPPER_REG[1])&&(this.MAPPER_REG[2]>=255?(this.MAPPER_REG[2]=this.MAPPER_REG[0],this.SetIRQ()):this.MAPPER_REG[2]+=t)},h.prototype.OutEXSound=function(t){return(t>>1)+(this.nes.Out_VRC6()>>1)},h.prototype.EXSoundSync=function(t){this.nes.Count_VRC6(t)},t.exports=h},3362:(t,e,s)=>{var i=s(9678),h=function(t){i.apply(this,arguments),this.MAPPER_REG=new Array(16)};(h.prototype=Object.create(i.prototype)).Init=function(){var t;for(t=0;t<this.MAPPER_REG.length;t++)this.MAPPER_REG[t]=0;this.nes.SetPrgRomPages8K(0,1,2*this.nes.PrgRomPageCount-2,2*this.nes.PrgRomPageCount-1),0!==this.nes.ChrRomPageCount&&this.nes.SetChrRomPages1K(0,1,2,3,4,5,6,7),this.MAPPER_REG[9]=2*this.nes.PrgRomPageCount-2},h.prototype.Write=function(t,e){switch(61440&t){case 32768:0!=(2&this.MAPPER_REG[10])?(this.MAPPER_REG[9]=e,this.nes.SetPrgRomPage8K(2,e)):(this.MAPPER_REG[8]=e,this.nes.SetPrgRomPage8K(0,e));break;case 40960:this.nes.SetPrgRomPage8K(1,e)}switch(61455&t){case 36864:0==(e&=3)?this.nes.SetMirror(!1):1===e?this.nes.SetMirror(!0):2===e?this.nes.SetMirrors(0,0,0,0):this.nes.SetMirrors(1,1,1,1);break;case 36865:case 36868:if((2&this.MAPPER_REG[10])!=(2&e)){var s=this.MAPPER_REG[8];this.MAPPER_REG[8]=this.MAPPER_REG[9],this.MAPPER_REG[9]=s,this.nes.SetPrgRomPage8K(0,this.MAPPER_REG[8]),this.nes.SetPrgRomPage8K(2,this.MAPPER_REG[9])}this.MAPPER_REG[10]=e;break;case 45056:this.MAPPER_REG[0]=240&this.MAPPER_REG[0]|15&e,this.nes.SetChrRomPage1K(0,this.MAPPER_REG[0]);break;case 45057:case 45060:this.MAPPER_REG[1]=240&this.MAPPER_REG[1]|15&e,this.nes.SetChrRomPage1K(1,this.MAPPER_REG[1]);break;case 45058:case 45064:this.MAPPER_REG[0]=15&this.MAPPER_REG[0]|(15&e)<<4,this.nes.SetChrRomPage1K(0,this.MAPPER_REG[0]);break;case 45059:case 45068:this.MAPPER_REG[1]=15&this.MAPPER_REG[1]|(15&e)<<4,this.nes.SetChrRomPage1K(1,this.MAPPER_REG[1]);break;case 49152:this.MAPPER_REG[2]=240&this.MAPPER_REG[2]|15&e,this.nes.SetChrRomPage1K(2,this.MAPPER_REG[2]);break;case 49153:case 49156:this.MAPPER_REG[3]=240&this.MAPPER_REG[3]|15&e,this.nes.SetChrRomPage1K(3,this.MAPPER_REG[3]);break;case 49154:case 49160:this.MAPPER_REG[2]=15&this.MAPPER_REG[2]|(15&e)<<4,this.nes.SetChrRomPage1K(2,this.MAPPER_REG[2]);break;case 49155:case 49164:this.MAPPER_REG[3]=15&this.MAPPER_REG[3]|(15&e)<<4,this.nes.SetChrRomPage1K(3,this.MAPPER_REG[3]);break;case 53248:this.MAPPER_REG[4]=240&this.MAPPER_REG[4]|15&e,this.nes.SetChrRomPage1K(4,this.MAPPER_REG[4]);break;case 53249:case 53252:this.MAPPER_REG[5]=240&this.MAPPER_REG[5]|15&e,this.nes.SetChrRomPage1K(5,this.MAPPER_REG[5]);break;case 53250:case 53256:this.MAPPER_REG[4]=15&this.MAPPER_REG[4]|(15&e)<<4,this.nes.SetChrRomPage1K(4,this.MAPPER_REG[4]);break;case 53251:case 53260:this.MAPPER_REG[5]=15&this.MAPPER_REG[5]|(15&e)<<4,this.nes.SetChrRomPage1K(5,this.MAPPER_REG[5]);break;case 57344:this.MAPPER_REG[6]=240&this.MAPPER_REG[6]|15&e,this.nes.SetChrRomPage1K(6,this.MAPPER_REG[6]);break;case 57345:case 57348:this.MAPPER_REG[7]=240&this.MAPPER_REG[7]|15&e,this.nes.SetChrRomPage1K(7,this.MAPPER_REG[7]);break;case 57346:case 57352:this.MAPPER_REG[6]=15&this.MAPPER_REG[6]|(15&e)<<4,this.nes.SetChrRomPage1K(6,this.MAPPER_REG[6]);break;case 57347:case 57356:this.MAPPER_REG[7]=15&this.MAPPER_REG[7]|(15&e)<<4,this.nes.SetChrRomPage1K(7,this.MAPPER_REG[7]);break;case 61440:this.MAPPER_REG[13]=240&this.MAPPER_REG[13]|15&e;break;case 61441:case 61444:this.MAPPER_REG[11]=7&e,0!=(2&this.MAPPER_REG[11])&&(this.MAPPER_REG[12]=this.MAPPER_REG[13]);break;case 61442:case 61448:this.MAPPER_REG[13]=15&this.MAPPER_REG[13]|(15&e)<<4;break;case 61443:case 61452:0!=(1&this.MAPPER_REG[11])?this.MAPPER_REG[11]|=2:this.MAPPER_REG[11]&=1,this.ClearIRQ()}},h.prototype.HSync=function(t){2==(6&this.MAPPER_REG[11])&&(255===this.MAPPER_REG[12]?(this.MAPPER_REG[12]=this.MAPPER_REG[13],this.SetIRQ()):this.MAPPER_REG[12]++)},h.prototype.CPUSync=function(t){6==(6&this.MAPPER_REG[11])&&(this.MAPPER_REG[12]>=255?(this.MAPPER_REG[12]=this.MAPPER_REG[13],this.SetIRQ()):this.MAPPER_REG[12]+=t)},t.exports=h},3358:(t,e,s)=>{var i=s(9678),h=function(t){i.apply(this,arguments),this.MAPPER_REG=new Array(3)};(h.prototype=Object.create(i.prototype)).Init=function(){this.MAPPER_REG[0]=0,this.MAPPER_REG[1]=0,this.MAPPER_REG[2]=0,this.nes.SetPrgRomPages8K(0,1,2,2*this.nes.PrgRomPageCount-1),this.nes.SetChrRomPages1K(0,1,2,3,4,5,6,7)},h.prototype.Write=function(t,e){switch(61443&(t=65532&t|(2&t)>>1|(1&t)<<1)){case 32768:case 32769:case 32770:case 32771:this.nes.SetPrgRomPage8K(0,2*e),this.nes.SetPrgRomPage8K(1,2*e+1);break;case 36864:case 36865:case 36866:this.nes.Write_VRC6_REG(3&t,e);break;case 40960:case 40961:case 40962:this.nes.Write_VRC6_REG(4+(3&t),e);break;case 45056:case 45057:case 45058:this.nes.Write_VRC6_REG(8+(3&t),e);break;case 45059:0==(e&=12)?this.nes.SetMirror(!1):4===e?this.nes.SetMirror(!0):8===e?this.nes.SetMirrors(0,0,0,0):this.nes.SetMirrors(1,1,1,1);break;case 49152:case 49153:case 49154:case 49155:this.nes.SetPrgRomPage8K(2,e);break;case 53248:case 53249:case 53250:case 53251:this.nes.SetChrRomPage1K(3&t,e);break;case 57344:case 57345:case 57346:case 57347:this.nes.SetChrRomPage1K(4+(3&t),e);break;case 61440:this.MAPPER_REG[0]=e;break;case 61441:this.MAPPER_REG[1]=7&e,0!=(2&this.MAPPER_REG[1])&&(this.MAPPER_REG[2]=this.MAPPER_REG[0]),this.ClearIRQ();break;case 61442:0!=(1&this.MAPPER_REG[1])?this.MAPPER_REG[1]|=2:this.MAPPER_REG[1]&=1}},h.prototype.HSync=function(t){2==(6&this.MAPPER_REG[1])&&(255===this.MAPPER_REG[2]?(this.MAPPER_REG[2]=this.MAPPER_REG[0],this.SetIRQ()):this.MAPPER_REG[2]++)},h.prototype.CPUSync=function(t){6==(6&this.MAPPER_REG[1])&&(this.MAPPER_REG[2]>=255?(this.MAPPER_REG[2]=this.MAPPER_REG[0],this.SetIRQ()):this.MAPPER_REG[2]+=t)},h.prototype.OutEXSound=function(t){return(t>>1)+(this.nes.Out_VRC6()>>1)},h.prototype.EXSoundSync=function(t){this.nes.Count_VRC6(t)},t.exports=h},3074:(t,e,s)=>{var i=s(9678),h=function(t){i.apply(this,arguments)};(h.prototype=Object.create(i.prototype)).Init=function(){this.nes.SetPrgRomPage(0,0),this.nes.SetPrgRomPage(1,this.nes.PrgRomPageCount-1),this.nes.SetChrRomPage(0)},h.prototype.Write=function(t,e){this.nes.SetChrRomPage(15&e)},t.exports=h},7360:(t,e,s)=>{var i=s(9678),h=function(t){i.apply(this,arguments),this.MAPPER_REG=new Array(11)};(h.prototype=Object.create(i.prototype)).Init=function(){for(var t=0;t<this.MAPPER_REG.length;t++)this.MAPPER_REG[t]=0;this.nes.SetPrgRomPages8K(0,1,2*this.nes.PrgRomPageCount-2,2*this.nes.PrgRomPageCount-1),this.nes.SetChrRomPages1K(0,1,2,3,4,5,6,7)},h.prototype.Write=function(t,e){switch(61440&t){case 32768:this.MAPPER_REG[8]=e,0==(2&this.MAPPER_REG[10])?this.nes.SetPrgRomPage8K(0,e):this.nes.SetPrgRomPage8K(2,e);break;case 36864:this.MAPPER_REG[10]=e,0==(1&e)?this.nes.SetMirror(!1):this.nes.SetMirror(!0),0==(2&e)?(this.nes.SetPrgRomPage8K(0,this.MAPPER_REG[8]),this.nes.SetPrgRomPage8K(2,2*(this.nes.PrgRomPageCount-1))):(this.nes.SetPrgRomPage8K(0,0),this.nes.SetPrgRomPage8K(2,this.MAPPER_REG[8]));break;case 40960:this.MAPPER_REG[9]=e,this.nes.SetPrgRomPage8K(1,e);break;case 45056:var s=7&t;this.MAPPER_REG[s]=e,this.nes.SetChrRomPage1K(s,e)}},t.exports=h},1962:(t,e,s)=>{var i=s(9678),h=function(t){i.apply(this,arguments)};(h.prototype=Object.create(i.prototype)).Init=function(){this.nes.SetPrgRomPages8K(0,1,2*this.nes.PrgRomPageCount-2,2*this.nes.PrgRomPageCount-1),this.nes.SetChrRomPages1K(0,1,2,3,4,5,6,7)},h.prototype.Write=function(t,e){switch(40963&t){case 32768:this.nes.SetPrgRomPage8K(0,63&e),0==(64&e)?this.nes.SetMirror(!1):this.nes.SetMirror(!0);break;case 32769:this.nes.SetPrgRomPage8K(1,63&e);break;case 32770:this.nes.SetChrRomPage1K(0,e<<1),this.nes.SetChrRomPage1K(1,1+(e<<1));break;case 32771:this.nes.SetChrRomPage1K(2,e<<1),this.nes.SetChrRomPage1K(3,1+(e<<1));break;case 40960:this.nes.SetChrRomPage1K(4,e);break;case 40961:this.nes.SetChrRomPage1K(5,e);break;case 40962:this.nes.SetChrRomPage1K(6,e);break;case 40963:this.nes.SetChrRomPage1K(7,e)}},t.exports=h},3101:(t,e,s)=>{var i=s(9678),h=function(t){i.apply(this,arguments)};(h.prototype=Object.create(i.prototype)).Init=function(){this.nes.SetPrgRomPage(0,0),this.nes.SetPrgRomPage(1,1),this.nes.SetChrRomPage(0)},h.prototype.Write=function(t,e){var s=(3&e)<<1;this.nes.SetPrgRomPage(0,s),this.nes.SetPrgRomPage(1,s+1)},t.exports=h},6619:(t,e,s)=>{var i=s(9678),h=function(t){i.apply(this,arguments),this.MAPPER_REG=new Array(20)};(h.prototype=Object.create(i.prototype)).Init=function(){var t;for(t=0;t<this.MAPPER_REG.length;t++)this.MAPPER_REG[t]=0;this.MAPPER_REG[16]=0,this.MAPPER_REG[17]=1,this.MAPPER_REG[18]=2*(this.nes.PrgRomPageCount-1),this.MAPPER_REG[19]=2*(this.nes.PrgRomPageCount-1)+1,this.nes.SetPrgRomPages8K(this.MAPPER_REG[16],this.MAPPER_REG[17],this.MAPPER_REG[18],this.MAPPER_REG[19]),this.MAPPER_REG[8]=0,this.MAPPER_REG[9]=1,this.MAPPER_REG[10]=2,this.MAPPER_REG[11]=3,this.MAPPER_REG[12]=4,this.MAPPER_REG[13]=5,this.MAPPER_REG[14]=6,this.MAPPER_REG[15]=7,this.nes.SetChrRomPages1K(this.MAPPER_REG[8],this.MAPPER_REG[9],this.MAPPER_REG[10],this.MAPPER_REG[11],this.MAPPER_REG[12],this.MAPPER_REG[13],this.MAPPER_REG[14],this.MAPPER_REG[15])},h.prototype.Write=function(t,e){switch(57345&t){case 32768:this.MAPPER_REG[0]=e,128==(128&e)?this.nes.SetChrRomPages1K(this.MAPPER_REG[12],this.MAPPER_REG[13],this.MAPPER_REG[14],this.MAPPER_REG[15],this.MAPPER_REG[8],this.MAPPER_REG[9],this.MAPPER_REG[10],this.MAPPER_REG[11]):this.nes.SetChrRomPages1K(this.MAPPER_REG[8],this.MAPPER_REG[9],this.MAPPER_REG[10],this.MAPPER_REG[11],this.MAPPER_REG[12],this.MAPPER_REG[13],this.MAPPER_REG[14],this.MAPPER_REG[15]),64==(64&e)?this.nes.SetPrgRomPages8K(this.MAPPER_REG[18],this.MAPPER_REG[17],this.MAPPER_REG[16],this.MAPPER_REG[19]):this.nes.SetPrgRomPages8K(this.MAPPER_REG[16],this.MAPPER_REG[17],this.MAPPER_REG[18],this.MAPPER_REG[19]);break;case 32769:switch(this.MAPPER_REG[1]=e,7&this.MAPPER_REG[0]){case 0:e&=254,this.MAPPER_REG[8]=e,this.MAPPER_REG[9]=e+1;break;case 1:e&=254,this.MAPPER_REG[10]=e,this.MAPPER_REG[11]=e+1;break;case 2:this.MAPPER_REG[12]=e;break;case 3:this.MAPPER_REG[13]=e;break;case 4:this.MAPPER_REG[14]=e;break;case 5:this.MAPPER_REG[15]=e;break;case 6:this.MAPPER_REG[16]=e;break;case 7:this.MAPPER_REG[17]=e}128==(128&this.MAPPER_REG[0])?this.nes.SetChrRomPages1K(this.MAPPER_REG[12],this.MAPPER_REG[13],this.MAPPER_REG[14],this.MAPPER_REG[15],this.MAPPER_REG[8],this.MAPPER_REG[9],this.MAPPER_REG[10],this.MAPPER_REG[11]):this.nes.SetChrRomPages1K(this.MAPPER_REG[8],this.MAPPER_REG[9],this.MAPPER_REG[10],this.MAPPER_REG[11],this.MAPPER_REG[12],this.MAPPER_REG[13],this.MAPPER_REG[14],this.MAPPER_REG[15]),64==(64&this.MAPPER_REG[0])?this.nes.SetPrgRomPages8K(this.MAPPER_REG[18],this.MAPPER_REG[17],this.MAPPER_REG[16],this.MAPPER_REG[19]):this.nes.SetPrgRomPages8K(this.MAPPER_REG[16],this.MAPPER_REG[17],this.MAPPER_REG[18],this.MAPPER_REG[19]);break;case 40960:1==(1&e)?this.nes.SetMirror(!0):this.nes.SetMirror(!1),this.MAPPER_REG[2]=e;break;case 40961:this.MAPPER_REG[3]=e;break;case 49152:this.MAPPER_REG[4]=e;break;case 49153:this.MAPPER_REG[5]=e;break;case 57344:this.MAPPER_REG[4]=this.MAPPER_REG[5],this.MAPPER_REG[7]=0,this.ClearIRQ();break;case 57345:this.MAPPER_REG[7]=1}},h.prototype.HSync=function(t){1===this.MAPPER_REG[7]&&t<240&&8==(8&this.nes.IO1[1])&&(0==--this.MAPPER_REG[4]&&this.SetIRQ(),this.MAPPER_REG[4]&=255)},t.exports=h},960:(t,e,s)=>{var i=s(9678),h=function(t){i.apply(this,arguments),this.MAPPER_REG=new Array(3)};(h.prototype=Object.create(i.prototype)).Init=function(){for(var t=0;t<this.MAPPER_REG.length;t++)this.MAPPER_REG[t]=0;this.nes.SetPrgRomPages8K(0,1,2*this.nes.PrgRomPageCount-2,2*this.nes.PrgRomPageCount-1),this.nes.SetChrRomPages1K(0,1,2,3,4,5,6,7)},h.prototype.Write=function(t,e){switch(57347&t){case 32768:this.nes.SetPrgRomPage8K(0,e);break;case 32769:this.nes.SetPrgRomPage8K(1,e);break;case 32770:this.nes.SetChrRomPage1K(0,e<<1),this.nes.SetChrRomPage1K(1,1+(e<<1));break;case 32771:this.nes.SetChrRomPage1K(2,e<<1),this.nes.SetChrRomPage1K(3,1+(e<<1));break;case 40960:this.nes.SetChrRomPage1K(4,e);break;case 40961:this.nes.SetChrRomPage1K(5,e);break;case 40962:this.nes.SetChrRomPage1K(6,e);break;case 40963:this.nes.SetChrRomPage1K(7,e);break;case 49152:this.MAPPER_REG[1]=e,this.MAPPER_REG[0]=0,this.ClearIRQ();break;case 49153:this.MAPPER_REG[1]=e,this.MAPPER_REG[0]=1;break;case 57344:0==(64&e)?this.nes.SetMirror(!1):this.nes.SetMirror(!0)}},h.prototype.HSync=function(t){1===this.MAPPER_REG[0]&&t<240&&8==(8&this.nes.IO1[1])&&(255===this.MAPPER_REG[1]&&(this.SetIRQ(),this.MAPPER_REG[0]=0),this.MAPPER_REG[1]++)},t.exports=h},8033:(t,e,s)=>{var i=s(9678),h=function(t){i.apply(this,arguments),this.MAPPER_REG=new Array(768),this.MAPPER_EXRAM=new Array(8),this.MAPPER_EXRAM2=new Array(1024),this.MAPPER_EXRAM3=new Array(1024),this.MAPPER_CHR_REG=new Array(2),this.MAPPER_IRQ=0,this.MAPPER_IRQ_STATUS=0};(h.prototype=Object.create(i.prototype)).Init=function(){var t,e;for(this.MAPPER_IRQ=0,this.MAPPER_IRQ_STATUS=0,t=0;t<this.MAPPER_REG.length;t++)this.MAPPER_REG[t]=0;for(t=0;t<this.MAPPER_EXRAM.length;t++)for(this.MAPPER_EXRAM[t]=new Array(8192),e=0;e<this.MAPPER_EXRAM[t].length;e++)this.MAPPER_EXRAM[t][e]=0;for(t=0;t<this.MAPPER_EXRAM2.length;t++)this.MAPPER_EXRAM2[t]=0;for(t=0;t<this.MAPPER_EXRAM3.length;t++)this.MAPPER_EXRAM3[t]=0;for(t=0;t<this.MAPPER_CHR_REG.length;t++)for(this.MAPPER_CHR_REG[t]=new Array(8),e=0;e<this.MAPPER_CHR_REG[t].length;e++)this.MAPPER_CHR_REG[t][e]=0;var s=2*this.nes.PrgRomPageCount-1;this.nes.SetPrgRomPages8K(s,s,s,s),s=0,this.nes.SetChrRomPages1K(s,s+1,s+2,s+3,s+4,s+5,s+6,s+7)},h.prototype.HSync=function(t){t<240?(this.MAPPER_IRQ_STATUS|=64,t===this.MAPPER_REG[515]&&(this.MAPPER_IRQ_STATUS|=128),128==(128&this.MAPPER_IRQ_STATUS)&&128==(128&this.MAPPER_REG[516])&&this.SetIRQ()):this.MAPPER_IRQ_STATUS&=191},h.prototype.ReadLow=function(t){if(t>=23552)return this.MAPPER_EXRAM2[t-23552];if(20996===t){var e=this.MAPPER_IRQ_STATUS;return this.MAPPER_IRQ_STATUS&=127,this.ClearIRQ(),e}return 20997===t?this.MAPPER_REG[517]*this.MAPPER_REG[518]&255:20998===t?this.MAPPER_REG[517]*this.MAPPER_REG[518]>>>8:void 0},h.prototype.WriteLow=function(t,e){var s;if(t>=23552)this.MAPPER_EXRAM2[t-23552]=e;else{if(t>=20480&&t<=20501)return this.MAPPER_REG[t-20480]=e,void this.nes.Write_MMC5_REG(t-20480,e);if(t>=20736&&t<=20740||20784===t||t>=20992&&t<=20998)this.MAPPER_REG[t-20480]=e;else if(20741!==t)if(20742!==t){if(20743!==t)return 20755===t?(this.MAPPER_REG[275]=e,void(this.nes.SRAM=this.MAPPER_EXRAM[7&e])):t>=20756&&t<=20759?(this.MAPPER_REG[t-20480]=e,void this.SetPrgRomPages8K_Mapper05(t-20480)):t>=20768&&t<=20775?(this.MAPPER_REG[t-20480]=this.MAPPER_REG[304]<<8|e,void this.SetChrRomPages1K_Mapper05_A()):t>=20776&&t<=20779?(this.MAPPER_REG[t-20480]=this.MAPPER_REG[304]<<8|e,void this.SetChrRomPages1K_Mapper05_B()):void 0;for(this.MAPPER_REG[263]=e,s=960;s<1024;s++)this.MAPPER_EXRAM3[s]=e}else for(this.MAPPER_REG[262]=e,s=0;s<960;s++)this.MAPPER_EXRAM3[s]=e;else for(this.MAPPER_REG[261]=e,s=0;s<4;s++)switch(e>>>2*s&3){case 0:this.nes.VRAM[8+s]=this.nes.VRAMS[8];break;case 1:this.nes.VRAM[8+s]=this.nes.VRAMS[9];break;case 2:this.nes.VRAM[8+s]=this.MAPPER_EXRAM2;break;case 3:this.nes.VRAM[8+s]=this.MAPPER_EXRAM3}}},h.prototype.SetChrRomPages1K_Mapper05_A=function(){var t;switch(3&this.MAPPER_REG[257]){case 0:t=8*this.MAPPER_REG[295],this.MAPPER_CHR_REG[0][0]=t,this.MAPPER_CHR_REG[0][1]=t+1,this.MAPPER_CHR_REG[0][2]=t+2,this.MAPPER_CHR_REG[0][3]=t+3,this.MAPPER_CHR_REG[0][4]=t+4,this.MAPPER_CHR_REG[0][5]=t+5,this.MAPPER_CHR_REG[0][6]=t+6,this.MAPPER_CHR_REG[0][7]=t+7;break;case 1:t=4*this.MAPPER_REG[291],this.MAPPER_CHR_REG[0][0]=t,this.MAPPER_CHR_REG[0][1]=t+1,this.MAPPER_CHR_REG[0][2]=t+2,this.MAPPER_CHR_REG[0][3]=t+3,t=4*this.MAPPER_REG[295],this.MAPPER_CHR_REG[0][4]=t,this.MAPPER_CHR_REG[0][5]=t+1,this.MAPPER_CHR_REG[0][6]=t+2,this.MAPPER_CHR_REG[0][7]=t+3;break;case 2:t=2*this.MAPPER_REG[289],this.MAPPER_CHR_REG[0][0]=t,this.MAPPER_CHR_REG[0][1]=t+1,t=2*this.MAPPER_REG[291],this.MAPPER_CHR_REG[0][2]=t,this.MAPPER_CHR_REG[0][3]=t+1,t=2*this.MAPPER_REG[293],this.MAPPER_CHR_REG[0][4]=t,this.MAPPER_CHR_REG[0][5]=t+1,t=2*this.MAPPER_REG[294],this.MAPPER_CHR_REG[0][6]=t,this.MAPPER_CHR_REG[0][7]=t+1;break;case 3:this.MAPPER_CHR_REG[0][0]=this.MAPPER_REG[288],this.MAPPER_CHR_REG[0][1]=this.MAPPER_REG[289],this.MAPPER_CHR_REG[0][2]=this.MAPPER_REG[290],this.MAPPER_CHR_REG[0][3]=this.MAPPER_REG[291],this.MAPPER_CHR_REG[0][4]=this.MAPPER_REG[292],this.MAPPER_CHR_REG[0][5]=this.MAPPER_REG[293],this.MAPPER_CHR_REG[0][6]=this.MAPPER_REG[294],this.MAPPER_CHR_REG[0][7]=this.MAPPER_REG[295]}},h.prototype.SetChrRomPages1K_Mapper05_B=function(){var t;switch(3&this.MAPPER_REG[257]){case 0:t=8*this.MAPPER_REG[299],this.MAPPER_CHR_REG[1][0]=t,this.MAPPER_CHR_REG[1][1]=t+1,this.MAPPER_CHR_REG[1][2]=t+2,this.MAPPER_CHR_REG[1][3]=t+3,this.MAPPER_CHR_REG[1][4]=t+4,this.MAPPER_CHR_REG[1][5]=t+5,this.MAPPER_CHR_REG[1][6]=t+6,this.MAPPER_CHR_REG[1][7]=t+7;break;case 1:t=4*this.MAPPER_REG[299],this.MAPPER_CHR_REG[1][0]=t,this.MAPPER_CHR_REG[1][1]=t+1,this.MAPPER_CHR_REG[1][2]=t+2,this.MAPPER_CHR_REG[1][3]=t+3,this.MAPPER_CHR_REG[1][4]=t,this.MAPPER_CHR_REG[1][5]=t+1,this.MAPPER_CHR_REG[1][6]=t+2,this.MAPPER_CHR_REG[1][7]=t+3;break;case 2:t=2*this.MAPPER_REG[297],this.MAPPER_CHR_REG[1][0]=t,this.MAPPER_CHR_REG[1][1]=t+1,this.MAPPER_CHR_REG[1][4]=t,this.MAPPER_CHR_REG[1][5]=t+1,t=2*this.MAPPER_REG[299],this.MAPPER_CHR_REG[1][2]=t,this.MAPPER_CHR_REG[1][3]=t+1,this.MAPPER_CHR_REG[1][6]=t,this.MAPPER_CHR_REG[1][7]=t+1;break;case 3:t=this.MAPPER_REG[296],this.MAPPER_CHR_REG[1][0]=t,this.MAPPER_CHR_REG[1][4]=t,t=this.MAPPER_REG[297],this.MAPPER_CHR_REG[1][1]=t,this.MAPPER_CHR_REG[1][5]=t,t=this.MAPPER_REG[298],this.MAPPER_CHR_REG[1][2]=t,this.MAPPER_CHR_REG[1][6]=t,t=this.MAPPER_REG[299],this.MAPPER_CHR_REG[1][3]=t,this.MAPPER_CHR_REG[1][7]=t}},h.prototype.SetPrgRomPages8K_Mapper05=function(t){var e;switch(3&this.MAPPER_REG[256]){case 0:279===t&&(e=124&this.MAPPER_REG[279],this.nes.SetPrgRomPage8K(0,e),this.nes.SetPrgRomPage8K(1,e+1),this.nes.SetPrgRomPage8K(2,e+2),this.nes.SetPrgRomPage8K(3,e+3));break;case 1:277===t&&(128==(128&(e=this.MAPPER_REG[277]))?(e&=126,this.nes.SetPrgRomPage8K(0,e),this.nes.SetPrgRomPage8K(1,e+1)):(this.nes.ROM[0]=this.MAPPER_EXRAM[7&e],this.nes.ROM[1]=this.MAPPER_EXRAM[e+1&7])),279===t&&(e=126&this.MAPPER_REG[279],this.nes.SetPrgRomPage8K(2,e),this.nes.SetPrgRomPage8K(3,e+1));break;case 2:277===t&&(128==(128&(e=this.MAPPER_REG[277]))?(e&=126,this.nes.SetPrgRomPage8K(0,e),this.nes.SetPrgRomPage8K(1,e+1)):(this.nes.ROM[0]=this.MAPPER_EXRAM[7&e],this.nes.ROM[1]=this.MAPPER_EXRAM[e+1&7])),278===t&&(128==(128&(e=this.MAPPER_REG[278]))?this.nes.SetPrgRomPage8K(2,127&e):this.nes.ROM[2]=this.MAPPER_EXRAM[7&e]),279===t&&this.nes.SetPrgRomPage8K(3,127&this.MAPPER_REG[279]);break;case 3:276!==t&&277!==t&&278!==t||(128==(128&(e=this.MAPPER_REG[t]))?this.nes.SetPrgRomPage8K(t-276,127&e):this.nes.ROM[t-276]=this.MAPPER_EXRAM[7&e]),279===t&&this.nes.SetPrgRomPage8K(3,127&this.MAPPER_REG[279])}},h.prototype.BuildBGLine=function(){if(this.nes.SetChrRomPages1K(this.MAPPER_CHR_REG[1][0],this.MAPPER_CHR_REG[1][1],this.MAPPER_CHR_REG[1][2],this.MAPPER_CHR_REG[1][3],this.MAPPER_CHR_REG[1][4],this.MAPPER_CHR_REG[1][5],this.MAPPER_CHR_REG[1][6],this.MAPPER_CHR_REG[1][7]),this.nes.BuildBGLine_SUB(),128==(128&this.MAPPER_REG[512])){var t=4*this.MAPPER_REG[514];this.nes.SetChrRomPage1K(0,t),this.nes.SetChrRomPage1K(1,t+1),this.nes.SetChrRomPage1K(2,t+2),this.nes.SetChrRomPage1K(3,t+3);var e,s,i=31&this.MAPPER_REG[512];0==(64&this.MAPPER_REG[512])?(e=0,s=i-1):(e=i,s=31);var h=this.nes.VRAM,r=this.nes.PaletteArray,P=this.nes.SPBitArray,R=this.nes.BgLineBuffer,a=0,o=(this.nes.PpuY+this.MAPPER_REG[513])%240;a+=o>>>3<<5;for(var n=7&o,E=e;E<=s;E++){var A=(this.MAPPER_EXRAM2[a+E]<<4)+n,_=h[A>>10];A&=1023;for(var M=this.MAPPER_EXRAM2[(896&a)>>4|960+((28&a)>>2)]<<2>>((64&a)>>4|2&a)&12,c=P[_[A]][_[A+8]],G=0;G<8;G++)R[8*E+G]=r[c[G]|M]}}},h.prototype.BuildSpriteLine=function(){this.nes.SetChrRomPages1K(this.MAPPER_CHR_REG[0][0],this.MAPPER_CHR_REG[0][1],this.MAPPER_CHR_REG[0][2],this.MAPPER_CHR_REG[0][3],this.MAPPER_CHR_REG[0][4],this.MAPPER_CHR_REG[0][5],this.MAPPER_CHR_REG[0][6],this.MAPPER_CHR_REG[0][7]),this.nes.BuildSpriteLine_SUB()},h.prototype.ReadPPUData=function(){return this.nes.SetChrRomPages1K(this.MAPPER_CHR_REG[0][0],this.MAPPER_CHR_REG[0][1],this.MAPPER_CHR_REG[0][2],this.MAPPER_CHR_REG[0][3],this.MAPPER_CHR_REG[0][4],this.MAPPER_CHR_REG[0][5],this.MAPPER_CHR_REG[0][6],this.MAPPER_CHR_REG[0][7]),this.nes.ReadPPUData_SUB()},h.prototype.WritePPUData=function(t){this.nes.SetChrRomPages1K(this.MAPPER_CHR_REG[0][0],this.MAPPER_CHR_REG[0][1],this.MAPPER_CHR_REG[0][2],this.MAPPER_CHR_REG[0][3],this.MAPPER_CHR_REG[0][4],this.MAPPER_CHR_REG[0][5],this.MAPPER_CHR_REG[0][6],this.MAPPER_CHR_REG[0][7]),this.nes.WritePPUData_SUB(t)},h.prototype.OutEXSound=function(t){return(t>>1)+(this.nes.Out_MMC5()>>1)},h.prototype.EXSoundSync=function(t){this.nes.Count_MMC5(t)},t.exports=h},3030:(t,e,s)=>{var i=s(9678),h=function(t){i.apply(this,arguments),this.IRQ_Counter=0,this.IRQ_Value=0,this.IRQ_Flag=!1};(h.prototype=Object.create(i.prototype)).Init=function(){this.nes.SetPrgRomPages8K(0,1,2*this.nes.PrgRomPageCount-2,2*this.nes.PrgRomPageCount-1),this.nes.SetChrRomPages1K(0,1,2,3,4,5,6,7),this.IRQ_Counter=0},h.prototype.Write=function(t,e){switch(61440&t){case 32768:this.nes.SetPrgRomPage8K(0,e);break;case 36864:switch(t){case 36865:0==(128&e)?this.nes.SetMirror(!1):this.nes.SetMirror(!0);break;case 36867:this.IRQ_Flag=128==(128&e),this.ClearIRQ();break;case 36868:this.IRQ_Counter=this.IRQ_Value,this.IRQ_Flag=!0,this.ClearIRQ();break;case 36869:this.IRQ_Value=e<<8|255&this.IRQ_Value;break;case 36870:this.IRQ_Value=65280&this.IRQ_Value|e}break;case 40960:this.nes.SetPrgRomPage8K(1,e);break;case 45056:case 45057:case 45058:case 45059:case 45060:case 45061:case 45062:case 45063:this.nes.SetChrRomPage1K(7&t,e);break;case 49152:this.nes.SetPrgRomPage8K(2,e)}},h.prototype.CPUSync=function(t){this.IRQ_Flag&&0!==this.IRQ_Counter&&(this.IRQ_Counter-=t,this.IRQ_Counter<=0&&(this.IRQ_Counter=0,this.IRQ_Flag=!1,this.SetIRQ()))},t.exports=h},9681:(t,e,s)=>{var i=s(9678),h=function(t){i.apply(this,arguments)};(h.prototype=Object.create(i.prototype)).Init=function(){this.nes.SetPrgRomPage(0,0),this.nes.SetPrgRomPage(1,1),this.nes.SetChrRomPage(0)},h.prototype.Write=function(t,e){var s=(48&e)>>3;this.nes.SetPrgRomPage(0,s),this.nes.SetPrgRomPage(1,s+1),this.nes.SetChrRomPage(3&e)},t.exports=h},3394:(t,e,s)=>{var i=s(9678),h=function(t){i.apply(this,arguments),this.MAPPER_REG=new Array(8),this.IRQ_Toggle=0};(h.prototype=Object.create(i.prototype)).Init=function(){for(var t=0;t<this.MAPPER_REG.length;t++)this.MAPPER_REG[t]=0;this.nes.SetPrgRomPages8K(0,1,2*this.nes.PrgRomPageCount-2,2*this.nes.PrgRomPageCount-1),this.nes.SetChrRomPages1K(0,1,2,3,8*this.nes.ChrRomPageCount-4,8*this.nes.ChrRomPageCount-3,8*this.nes.ChrRomPageCount-2,8*this.nes.ChrRomPageCount-1),this.IRQ_Toggle=0},h.prototype.Write=function(t,e){switch(63488&t){case 34816:this.MAPPER_REG[0]=e,this.nes.SetChrRomPage1K(0,e<<1),this.nes.SetChrRomPage1K(1,1+(e<<1));break;case 38912:this.MAPPER_REG[1]=e,this.nes.SetChrRomPage1K(2,e<<1),this.nes.SetChrRomPage1K(3,1+(e<<1));break;case 43008:this.MAPPER_REG[2]=e,this.nes.SetChrRomPage1K(4,e<<1),this.nes.SetChrRomPage1K(5,1+(e<<1));break;case 47104:this.MAPPER_REG[3]=e,this.nes.SetChrRomPage1K(6,e<<1),this.nes.SetChrRomPage1K(7,1+(e<<1));break;case 51200:0===this.IRQ_Toggle?this.MAPPER_REG[4]=255&this.MAPPER_REG[4]|e<<8:this.MAPPER_REG[4]=65280&this.MAPPER_REG[4]|e,this.IRQ_Toggle^=1;break;case 55296:this.MAPPER_REG[5]=e,this.IRQ_Toggle=0,this.ClearIRQ();break;case 59392:this.MAPPER_REG[6]=e,0==(e&=3)?this.nes.SetMirror(!1):1===e?this.nes.SetMirror(!0):2===e?this.nes.SetMirrors(0,0,0,0):this.nes.SetMirrors(1,1,1,1);break;case 63488:this.MAPPER_REG[7]=e,this.nes.SetPrgRomPage8K(0,e<<1),this.nes.SetPrgRomPage8K(1,1+(e<<1))}},h.prototype.CPUSync=function(t){16==(16&this.MAPPER_REG[5])&&(this.MAPPER_REG[4]-=t,this.MAPPER_REG[4]<0&&(this.MAPPER_REG[4]=65535,this.MAPPER_REG[5]&=239,this.SetIRQ()))},t.exports=h},3576:(t,e,s)=>{var i=s(9678),h=function(t){i.apply(this,arguments),this.MAPPER_REG=new Array(8)};(h.prototype=Object.create(i.prototype)).Init=function(){for(var t=0;t<this.MAPPER_REG.length;t++)this.MAPPER_REG[t]=0;this.nes.SetPrgRomPages8K(0,1,2*this.nes.PrgRomPageCount-2,2*this.nes.PrgRomPageCount-1),this.nes.SetChrRomPages1K(0,1,2,3,4,5,6,7)},h.prototype.Write=function(t,e){switch(61440&t){case 32768:this.MAPPER_REG[0]=e,this.nes.SetChrRomPage1K(0,e<<1),this.nes.SetChrRomPage1K(1,1+(e<<1));break;case 36864:this.MAPPER_REG[1]=e,this.nes.SetChrRomPage1K(2,e<<1),this.nes.SetChrRomPage1K(3,1+(e<<1));break;case 40960:this.MAPPER_REG[2]=e,this.nes.SetChrRomPage1K(4,e<<1),this.nes.SetChrRomPage1K(5,1+(e<<1));break;case 45056:this.MAPPER_REG[3]=e,this.nes.SetChrRomPage1K(6,e<<1),this.nes.SetChrRomPage1K(7,1+(e<<1));break;case 49152:this.MAPPER_REG[4]=e,this.SetMirror();break;case 53248:this.MAPPER_REG[5]=e,this.SetMirror();break;case 57344:this.MAPPER_REG[6]=e,this.SetMirror();break;case 61440:this.MAPPER_REG[7]=e,this.nes.SetPrgRomPage8K(0,e<<1),this.nes.SetPrgRomPage8K(1,1+(e<<1))}},h.prototype.SetMirror=function(){switch(17&this.MAPPER_REG[6]){case 0:this.nes.SetMirror(!1);break;case 1:this.nes.SetMirror(!0);break;case 16:this.nes.SetChrRomPage1K(8,128|this.MAPPER_REG[4]),this.nes.SetChrRomPage1K(9,128|this.MAPPER_REG[5]),this.nes.SetChrRomPage1K(10,128|this.MAPPER_REG[4]),this.nes.SetChrRomPage1K(11,128|this.MAPPER_REG[5]);break;case 17:this.nes.SetChrRomPage1K(8,128|this.MAPPER_REG[4]),this.nes.SetChrRomPage1K(9,128|this.MAPPER_REG[4]),this.nes.SetChrRomPage1K(10,128|this.MAPPER_REG[5]),this.nes.SetChrRomPage1K(11,128|this.MAPPER_REG[5])}},t.exports=h},2220:(t,e,s)=>{var i=s(9678),h=function(t){i.apply(this,arguments),this.MAPPER_REG=new Array(16),this.MAPPER_REG_Select=0,this.R8_ROM=null,this.IRQ_Counter=0};(h.prototype=Object.create(i.prototype)).Init=function(){var t;for(t=0;t<this.MAPPER_REG.length;t++)this.MAPPER_REG[t]=0;this.nes.SetPrgRomPages8K(0,1,2,2*this.nes.PrgRomPageCount-1),this.nes.SetChrRomPages1K(0,1,2,3,4,5,6,7)},h.prototype.Write=function(t,e){switch(57344&t){case 32768:this.MAPPER_REG_Select=e;break;case 40960:switch(this.MAPPER_REG[this.MAPPER_REG_Select]=e,this.MAPPER_REG_Select){case 0:case 1:case 2:case 3:case 4:case 5:case 6:case 7:this.nes.SetChrRomPage1K(this.MAPPER_REG_Select,e);break;case 8:this.R8_ROM=this.nes.PRGROM_PAGES[(63&e)%(2*this.nes.PrgRomPageCount)];break;case 9:this.nes.SetPrgRomPage8K(0,e);break;case 10:this.nes.SetPrgRomPage8K(1,e);break;case 11:this.nes.SetPrgRomPage8K(2,e);break;case 12:0==(e&=3)?this.nes.SetMirror(!1):1===e?this.nes.SetMirror(!0):2===e?this.nes.SetMirrors(0,0,0,0):this.nes.SetMirrors(1,1,1,1);break;case 13:0==(1&e)&&this.ClearIRQ();break;case 14:this.IRQ_Counter=65280&this.IRQ_Counter|e;break;case 15:this.IRQ_Counter=255&this.IRQ_Counter|e<<8}break;case 49152:this.nes.Select_AY_REG(e);break;case 57344:this.nes.Write_AY_REG(e)}},h.prototype.ReadSRAM=function(t){return 0==(64&this.MAPPER_REG[8])?this.R8_ROM[8191&t]:this.nes.SRAM[8191&t]},h.prototype.WriteSRAM=function(t,e){64==(64&this.MAPPER_REG[8])&&(this.nes.SRAM[8191&t]=e)},h.prototype.CPUSync=function(t){128==(128&this.MAPPER_REG[13])&&(this.IRQ_Counter-=t,this.IRQ_Counter<0&&(this.IRQ_Counter=65535,1==(1&this.MAPPER_REG[13])&&this.SetIRQ()))},h.prototype.OutEXSound=function(t){return(t>>1)+(this.nes.Out_AY()>>1)},h.prototype.EXSoundSync=function(t){this.nes.Count_AY(t)},t.exports=h},6335:(t,e,s)=>{var i=s(9678),h=function(t){i.apply(this,arguments)};(h.prototype=Object.create(i.prototype)).Init=function(){this.nes.SetPrgRomPage(0,0),this.nes.SetPrgRomPage(1,1),this.nes.SetChrRomPage(0)},h.prototype.Write=function(t,e){var s=(7&e)<<1;this.nes.SetPrgRomPage(0,s),this.nes.SetPrgRomPage(1,s+1),0==(16&e)?this.nes.SetMirrors(0,0,0,0):this.nes.SetMirrors(1,1,1,1)},t.exports=h},7387:(t,e,s)=>{var i=s(9678),h=function(t){i.apply(this,arguments)};(h.prototype=Object.create(i.prototype)).Init=function(){this.nes.SetPrgRomPage(0,0),this.nes.SetPrgRomPage(1,this.nes.PrgRomPageCount-1),this.nes.SetChrRomPage(0)},h.prototype.Write=function(t,e){this.nes.SetPrgRomPage(0,(112&e)>>4),this.nes.SetChrRomPage(15&e),0==(128&e)?this.nes.SetMirrors(0,0,0,0):this.nes.SetMirrors(1,1,1,1)},t.exports=h},7735:(t,e,s)=>{var i=s(9678),h=function(t){i.apply(this,arguments),this.MAPPER_REG=new Array(1)};(h.prototype=Object.create(i.prototype)).Init=function(){this.MAPPER_REG[0]=0,this.nes.SetPrgRomPages8K(0,1,2*this.nes.PrgRomPageCount-2,2*this.nes.PrgRomPageCount-1),this.nes.SetChrRomPages1K(0,1,2,3,4,5,6,7)},h.prototype.Write=function(t,e){var s;0==(192&this.MAPPER_REG[0])&&(128==(128&e)&&(s=2*(7&e),this.nes.SetPrgRomPage8K(0,s),this.nes.SetPrgRomPage8K(1,s+1)),64==(64&e)&&(s=8*(15&e),this.nes.SetChrRomPages1K(s,s+1,s+2,s+3,s+4,s+5,s+6,s+7))),this.MAPPER_REG[0]=e},t.exports=h},8346:(t,e,s)=>{var i=s(9678),h=function(t){i.apply(this,arguments),this.MAPPER_REG=new Array(3)};(h.prototype=Object.create(i.prototype)).Init=function(){this.nes.SetPrgRomPages8K(0,1,2*this.nes.PrgRomPageCount-2,2*this.nes.PrgRomPageCount-1),this.MAPPER_REG[0]=0,this.MAPPER_REG[1]=0,this.MAPPER_REG[2]=0},h.prototype.Write=function(t,e){switch(t){case 32768:this.MAPPER_REG[0]=65520&this.MAPPER_REG[0]|15&e,this.MAPPER_REG[2]=this.MAPPER_REG[0];break;case 36864:this.MAPPER_REG[0]=65295&this.MAPPER_REG[0]|(15&e)<<4,this.MAPPER_REG[2]=this.MAPPER_REG[0];break;case 40960:this.MAPPER_REG[0]=61695&this.MAPPER_REG[0]|(15&e)<<8,this.MAPPER_REG[2]=this.MAPPER_REG[0];break;case 45056:this.MAPPER_REG[0]=4095&this.MAPPER_REG[0]|(15&e)<<12,this.MAPPER_REG[2]=this.MAPPER_REG[0];break;case 49152:this.MAPPER_REG[1]=7&e,0!=(2&this.MAPPER_REG[1])&&(this.MAPPER_REG[2]=this.MAPPER_REG[0]);break;case 53248:0!=(1&this.MAPPER_REG[1])?this.MAPPER_REG[1]|=2:this.MAPPER_REG[1]&=1,this.ClearIRQ();break;case 61440:this.nes.SetPrgRomPage8K(0,2*e),this.nes.SetPrgRomPage8K(1,2*e+1)}},h.prototype.CPUSync=function(t){0!=(2&this.MAPPER_REG[1])&&(0!=(4&this.MAPPER_REG[1])?(this.MAPPER_REG[2]+=t,this.MAPPER_REG[2]>255&&(this.MAPPER_REG[2]=this.MAPPER_REG[0],this.SetIRQ())):(this.MAPPER_REG[2]+=t,this.MAPPER_REG[2]>65535&&(this.MAPPER_REG[2]=this.MAPPER_REG[0],this.SetIRQ())))},t.exports=h},6523:(t,e,s)=>{var i=s(9678),h=function(t){i.apply(this,arguments),this.MAPPER_REG=new Array(1)};(h.prototype=Object.create(i.prototype)).Init=function(){this.nes.SetPrgRomPages8K(0,0,0,2*this.nes.PrgRomPageCount-1),this.nes.SetChrRomPages1K(0,0,0,0,0,0,0,0),this.MAPPER_REG[0]=0},h.prototype.Write=function(t,e){var s;switch(t){case 32768:this.nes.SetPrgRomPage8K(0,15&e);break;case 36864:this.MAPPER_REG[0]=e,0==(1&e)?this.nes.SetMirror(!1):this.nes.SetMirror(!0);break;case 40960:this.nes.SetPrgRomPage8K(1,15&e);break;case 49152:this.nes.SetPrgRomPage8K(2,15&e);break;case 57344:s=((2&this.MAPPER_REG[0])<<3|15&e)<<2,this.nes.SetChrRomPage1K(0,s),this.nes.SetChrRomPage1K(1,s+1),this.nes.SetChrRomPage1K(2,s+2),this.nes.SetChrRomPage1K(3,s+3);break;case 61440:s=((4&this.MAPPER_REG[0])<<2|15&e)<<2,this.nes.SetChrRomPage1K(4,s),this.nes.SetChrRomPage1K(5,s+1),this.nes.SetChrRomPage1K(6,s+2),this.nes.SetChrRomPage1K(7,s+3)}},t.exports=h},7890:(t,e,s)=>{var i=s(9678),h=function(t){i.apply(this,arguments),this.MAPPER_REG=new Array(1)};(h.prototype=Object.create(i.prototype)).Init=function(){this.nes.SetPrgRomPages8K(0,0,2*this.nes.PrgRomPageCount-2,2*this.nes.PrgRomPageCount-1),this.nes.SetChrRomPages1K(0,0,0,0,0,0,0,0),this.MAPPER_REG[0]=0},h.prototype.Write=function(t,e){if(32768===t&&(this.MAPPER_REG[0]=7&e),32769===t)switch(this.MAPPER_REG[0]){case 2:this.nes.SetChrRomPage1K(0,2*(63&e)),this.nes.SetChrRomPage1K(1,2*(63&e)+1);break;case 3:this.nes.SetChrRomPage1K(2,2*(63&e)),this.nes.SetChrRomPage1K(3,2*(63&e)+1);break;case 4:this.nes.SetChrRomPage1K(4,2*(63&e)),this.nes.SetChrRomPage1K(5,2*(63&e)+1);break;case 5:this.nes.SetChrRomPage1K(6,2*(63&e)),this.nes.SetChrRomPage1K(7,2*(63&e)+1);break;case 6:this.nes.SetPrgRomPage8K(0,15&e);break;case 7:this.nes.SetPrgRomPage8K(1,15&e)}},t.exports=h},789:(t,e,s)=>{var i=s(9678),h=function(t){i.apply(this,arguments)};(h.prototype=Object.create(i.prototype)).Init=function(){this.nes.SetPrgRomPage(0,0),this.nes.SetPrgRomPage(1,1),this.nes.SetChrRomPage1K(0,0),this.nes.SetChrRomPage1K(1,1),this.nes.SetChrRomPage1K(2,258),this.nes.SetChrRomPage1K(3,259),this.nes.SetChrRomPage1K(4,260),this.nes.SetChrRomPage1K(5,261),this.nes.SetChrRomPage1K(6,262),this.nes.SetChrRomPage1K(7,263)},h.prototype.Write=function(t,e){var s=(15&e)<<1;this.nes.SetPrgRomPage(0,s),this.nes.SetPrgRomPage(1,s+1),s=(240&e)>>3,this.nes.SetChrRomPage1K(0,s),this.nes.SetChrRomPage1K(1,s+1)},t.exports=h},472:(t,e,s)=>{var i=s(9678),h=function(t){i.apply(this,arguments)};(h.prototype=Object.create(i.prototype)).Init=function(){this.nes.SetPrgRomPage(0,0),this.nes.SetPrgRomPage(1,this.nes.PrgRomPageCount-1),this.nes.SetChrRomPage(0)},h.prototype.Write=function(t,e){this.nes.SetPrgRomPage(0,7&e),this.nes.SetChrRomPage(e>>4),8==(8&e)?this.nes.SetMirror(!1):this.nes.SetMirror(!0)},t.exports=h},222:(t,e,s)=>{var i=s(9678),h=function(t){i.apply(this,arguments),this.MAPPER_REG=new Array(11),this.EX_RAM=new Array(128)};(h.prototype=Object.create(i.prototype)).Init=function(){var t;for(t=0;t<this.MAPPER_REG.length;t++)this.MAPPER_REG[t]=0;for(t=0;t<this.EX_RAM.length;t++)this.EX_RAM[t]=0;this.nes.SetPrgRomPages8K(0,1,2,2*this.nes.PrgRomPageCount-1),this.nes.SetChrRomPages1K(0,1,2,3,4,5,6,7)},h.prototype.ReadSRAM=function(t){if(t>=32512&&t<=32767)return this.EX_RAM[127&t];switch(t){case 32496:return this.MAPPER_REG[0];case 32497:return this.MAPPER_REG[1];case 32498:return this.MAPPER_REG[2];case 32499:return this.MAPPER_REG[3];case 32500:return this.MAPPER_REG[4];case 32501:return this.MAPPER_REG[5];case 32502:case 32503:return this.MAPPER_REG[6];case 32504:case 32505:return this.MAPPER_REG[7];case 32506:case 32507:return this.MAPPER_REG[8];case 32508:case 32509:return this.MAPPER_REG[9];case 32510:case 32511:return this.MAPPER_REG[10]}return 0},h.prototype.WriteSRAM=function(t,e){if(t>=32512&&t<=32767)this.EX_RAM[127&t]=e;else switch(t){case 32496:this.MAPPER_REG[0]=e,this.nes.SetChrRomPage1K(0,254&e),this.nes.SetChrRomPage1K(1,1+(254&e));break;case 32497:this.MAPPER_REG[1]=e,this.nes.SetChrRomPage1K(2,254&e),this.nes.SetChrRomPage1K(3,1+(254&e));break;case 32498:this.MAPPER_REG[2]=e,this.nes.SetChrRomPage1K(4,e);break;case 32499:this.MAPPER_REG[3]=e,this.nes.SetChrRomPage1K(5,e);break;case 32500:this.MAPPER_REG[4]=e,this.nes.SetChrRomPage1K(6,e);break;case 32501:this.MAPPER_REG[5]=e,this.nes.SetChrRomPage1K(7,e);break;case 32502:case 32503:this.MAPPER_REG[6]=e,1==(1&e)?this.nes.SetMirror(!1):this.nes.SetMirror(!0);break;case 32504:case 32505:this.MAPPER_REG[7]=e;break;case 32506:case 32507:this.MAPPER_REG[8]=e,this.nes.SetPrgRomPage8K(0,e);break;case 32508:case 32509:this.MAPPER_REG[9]=e,this.nes.SetPrgRomPage8K(1,e);break;case 32510:case 32511:this.MAPPER_REG[10]=e,this.nes.SetPrgRomPage8K(2,e)}},t.exports=h},1398:(t,e,s)=>{var i=s(9678),h=function(t){i.apply(this,arguments),this.MAPPER_REG=new Array(13),this.EX_RAM=new Array(5120)};(h.prototype=Object.create(i.prototype)).Init=function(){var t;for(t=0;t<this.MAPPER_REG.length;t++)this.MAPPER_REG[t]=0;for(t=0;t<this.EX_RAM.length;t++)this.EX_RAM[t]=0;this.nes.SetPrgRomPages8K(0,1,2,2*this.nes.PrgRomPageCount-1),this.nes.SetChrRomPages1K(0,1,2,3,4,5,6,7)},h.prototype.ReadSRAM=function(t){return t>=24576&&t<=29695?this.EX_RAM[t-24576]:t>=32496&&t<=32508?this.MAPPER_REG[t-32496]:void 0},h.prototype.WriteSRAM=function(t,e){if(t>=24576&&t<=29695)this.EX_RAM[t-24576]=e;else switch(t){case 32496:this.MAPPER_REG[0]=e,this.SetChr();break;case 32497:this.MAPPER_REG[1]=e,this.SetChr();break;case 32498:this.MAPPER_REG[2]=e,this.SetChr();break;case 32499:this.MAPPER_REG[3]=e,this.SetChr();break;case 32500:this.MAPPER_REG[4]=e,this.SetChr();break;case 32501:this.MAPPER_REG[5]=e,this.SetChr();break;case 32502:this.MAPPER_REG[6]=e,this.SetChr(),1==(1&e)?this.nes.SetMirror(!1):this.nes.SetMirror(!0);break;case 32503:this.MAPPER_REG[7]=e;break;case 32504:this.MAPPER_REG[8]=e;break;case 32505:this.MAPPER_REG[9]=e;break;case 32506:this.MAPPER_REG[10]=e,this.nes.SetPrgRomPage8K(0,e>>>2);break;case 32507:this.MAPPER_REG[11]=e,this.nes.SetPrgRomPage8K(1,e>>>2);break;case 32508:this.MAPPER_REG[12]=e,this.nes.SetPrgRomPage8K(2,e>>>2)}},h.prototype.SetChr=function(){0==(2&this.MAPPER_REG[6])?(this.nes.SetChrRomPage1K(0,254&this.MAPPER_REG[0]),this.nes.SetChrRomPage1K(1,1+(254&this.MAPPER_REG[0])),this.nes.SetChrRomPage1K(2,254&this.MAPPER_REG[1]),this.nes.SetChrRomPage1K(3,1+(254&this.MAPPER_REG[1])),this.nes.SetChrRomPage1K(4,this.MAPPER_REG[2]),this.nes.SetChrRomPage1K(5,this.MAPPER_REG[3]),this.nes.SetChrRomPage1K(6,this.MAPPER_REG[4]),this.nes.SetChrRomPage1K(7,this.MAPPER_REG[5])):(this.nes.SetChrRomPage1K(4,254&this.MAPPER_REG[0]),this.nes.SetChrRomPage1K(5,1+(254&this.MAPPER_REG[0])),this.nes.SetChrRomPage1K(6,254&this.MAPPER_REG[1]),this.nes.SetChrRomPage1K(7,1+(254&this.MAPPER_REG[1])),this.nes.SetChrRomPage1K(0,this.MAPPER_REG[2]),this.nes.SetChrRomPage1K(1,this.MAPPER_REG[3]),this.nes.SetChrRomPage1K(2,this.MAPPER_REG[4]),this.nes.SetChrRomPage1K(3,this.MAPPER_REG[5]))},t.exports=h},5191:(t,e,s)=>{var i=s(9678),h=function(t){i.apply(this,arguments),this.MAPPER_REG=new Array(15),this.MAPPER_EXVRAM=new Array(8)};(h.prototype=Object.create(i.prototype)).Init=function(){var t;for(t=0;t<this.MAPPER_REG.length;t++)this.MAPPER_REG[t]=0;for(t=0;t<this.MAPPER_EXVRAM.length;t++){this.MAPPER_EXVRAM[t]=new Array(1024);for(var e=0;e<this.MAPPER_EXVRAM[t].length;e++)this.MAPPER_EXVRAM[t][e]=0}this.nes.SetPrgRomPages8K(0,1,2,2*this.nes.PrgRomPageCount-1),0===this.nes.ChrRomPageCount?(this.nes.VRAM[0]=this.MAPPER_EXVRAM[0],this.nes.VRAM[1]=this.MAPPER_EXVRAM[0],this.nes.VRAM[2]=this.MAPPER_EXVRAM[0],this.nes.VRAM[3]=this.MAPPER_EXVRAM[0],this.nes.VRAM[4]=this.MAPPER_EXVRAM[0],this.nes.VRAM[5]=this.MAPPER_EXVRAM[0],this.nes.VRAM[6]=this.MAPPER_EXVRAM[0],this.nes.VRAM[7]=this.MAPPER_EXVRAM[0]):this.nes.SetChrRomPages1K(0,1,2,3,4,5,6,7)},h.prototype.Write=function(t,e){switch(61496&t){case 32768:this.MAPPER_REG[0]=e,this.nes.SetPrgRomPage8K(0,e);break;case 32776:case 32784:this.MAPPER_REG[1]=e,this.nes.SetPrgRomPage8K(1,e);break;case 36864:this.MAPPER_REG[2]=e,this.nes.SetPrgRomPage8K(2,e);break;case 40960:this.MAPPER_REG[3]=e,0===this.nes.ChrRomPageCount?this.nes.VRAM[0]=this.MAPPER_EXVRAM[e]:this.nes.SetChrRomPage1K(0,e);break;case 40968:case 40976:this.MAPPER_REG[4]=e,0===this.nes.ChrRomPageCount?this.nes.VRAM[1]=this.MAPPER_EXVRAM[e]:this.nes.SetChrRomPage1K(1,e);break;case 45056:this.MAPPER_REG[5]=e,0===this.nes.ChrRomPageCount?this.nes.VRAM[2]=this.MAPPER_EXVRAM[e]:this.nes.SetChrRomPage1K(2,e);break;case 45064:case 45072:this.MAPPER_REG[6]=e,0===this.nes.ChrRomPageCount?this.nes.VRAM[3]=this.MAPPER_EXVRAM[e]:this.nes.SetChrRomPage1K(3,e);break;case 49152:this.MAPPER_REG[7]=e,0===this.nes.ChrRomPageCount?this.nes.VRAM[4]=this.MAPPER_EXVRAM[e]:this.nes.SetChrRomPage1K(4,e);break;case 49160:case 49168:this.MAPPER_REG[8]=e,0===this.nes.ChrRomPageCount?this.nes.VRAM[5]=this.MAPPER_EXVRAM[e]:this.nes.SetChrRomPage1K(5,e);break;case 53248:this.MAPPER_REG[9]=e,0===this.nes.ChrRomPageCount?this.nes.VRAM[6]=this.MAPPER_EXVRAM[e]:this.nes.SetChrRomPage1K(6,e);break;case 53256:case 53264:this.MAPPER_REG[10]=e,0===this.nes.ChrRomPageCount?this.nes.VRAM[7]=this.MAPPER_EXVRAM[e]:this.nes.SetChrRomPage1K(7,e);break;case 57344:this.MAPPER_REG[14]=e,0==(e&=3)?this.nes.SetMirror(!1):1===e?this.nes.SetMirror(!0):2===e?this.nes.SetMirrors(0,0,0,0):this.nes.SetMirrors(1,1,1,1);break;case 57352:case 57360:this.MAPPER_REG[13]=e;break;case 61440:this.MAPPER_REG[11]=7&e,0!=(2&this.MAPPER_REG[11])&&(this.MAPPER_REG[12]=this.MAPPER_REG[13]);break;case 61448:case 61456:0!=(1&this.MAPPER_REG[11])?this.MAPPER_REG[11]|=2:this.MAPPER_REG[11]&=1,this.ClearIRQ()}},h.prototype.HSync=function(t){2==(6&this.MAPPER_REG[11])&&(255===this.MAPPER_REG[12]?(this.MAPPER_REG[12]=this.MAPPER_REG[13],this.SetIRQ()):this.MAPPER_REG[12]++)},h.prototype.CPUSync=function(t){6==(6&this.MAPPER_REG[11])&&(this.MAPPER_REG[12]>=255?(this.MAPPER_REG[12]=this.MAPPER_REG[13],this.SetIRQ()):this.MAPPER_REG[12]+=t)},t.exports=h},177:(t,e,s)=>{var i=s(9678),h=function(t){i.apply(this,arguments)};(h.prototype=Object.create(i.prototype)).Init=function(){this.nes.SetPrgRomPages8K(2*this.nes.PrgRomPageCount-4,2*this.nes.PrgRomPageCount-3,2*this.nes.PrgRomPageCount-2,2*this.nes.PrgRomPageCount-1),this.nes.SetChrRomPages1K(0,1,2,3,4,5,6,7)},h.prototype.WriteSRAM=function(t,e){if(t>=24576&&t<28671){var s=(48&e)>>>4<<2,i=((64&e)>>>4|3&e)<<3;this.nes.SetPrgRomPages8K(s,s+1,s+2,s+3),this.nes.SetChrRomPages1K(i,i+1,i+2,i+3,i+4,i+5,i+6,i+7)}},t.exports=h},8310:(t,e,s)=>{var i=s(9678),h=function(t){i.apply(this,arguments)};(h.prototype=Object.create(i.prototype)).Init=function(){this.nes.SetPrgRomPage(0,0),this.nes.SetPrgRomPage(1,this.nes.PrgRomPageCount-1),this.nes.SetChrRomPage(0)},h.prototype.WriteSRAM=function(t,e){var s=(2&e)>>>1|(1&e)<<1;this.nes.SetChrRomPage(s)},t.exports=h},9806:(t,e,s)=>{var i=s(9678),h=function(t){i.apply(this,arguments),this.MAPPER_REG=new Array(1)};(h.prototype=Object.create(i.prototype)).Init=function(){this.nes.SetPrgRomPages8K(0,0,2*this.nes.PrgRomPageCount-2,2*this.nes.PrgRomPageCount-1),this.nes.SetChrRomPages1K(0,0,0,0,0,0,0,0),this.MAPPER_REG[0]=0},h.prototype.Write=function(t,e){if(32768===t&&(this.MAPPER_REG[0]=7&e),32769===t)switch(this.MAPPER_REG[0]){case 0:this.nes.SetChrRomPage1K(0,62&e),this.nes.SetChrRomPage1K(1,1+(62&e));break;case 1:this.nes.SetChrRomPage1K(2,62&e),this.nes.SetChrRomPage1K(3,1+(62&e));break;case 2:this.nes.SetChrRomPage1K(4,63&e|64);break;case 3:this.nes.SetChrRomPage1K(5,63&e|64);break;case 4:this.nes.SetChrRomPage1K(6,63&e|64);break;case 5:this.nes.SetChrRomPage1K(7,63&e|64);break;case 6:this.nes.SetPrgRomPage8K(0,15&e);break;case 7:this.nes.SetPrgRomPage8K(1,15&e)}},t.exports=h},2605:(t,e,s)=>{var i=s(9678),h=function(t){i.apply(this,arguments)};(h.prototype=Object.create(i.prototype)).Init=function(){this.nes.SetPrgRomPage(0,0),this.nes.SetPrgRomPage(1,this.nes.PrgRomPageCount-1),this.nes.SetChrRomPage(0)},h.prototype.Write=function(t,e){this.nes.SetPrgRomPage(0,(112&e)>>4),this.nes.SetChrRomPage((128&e)>>4|7&e),0==(8&e)?this.nes.SetMirrors(0,0,0,0):this.nes.SetMirrors(1,1,1,1)},t.exports=h},730:(t,e,s)=>{var i=s(9678),h=function(t){i.apply(this,arguments),this.MAPPER_REG=new Array(4),this.MAPPER_Latch0=!0,this.MAPPER_Latch1=!0};(h.prototype=Object.create(i.prototype)).Init=function(){this.nes.SetPrgRomPages8K(0,2*this.nes.PrgRomPageCount-3,2*this.nes.PrgRomPageCount-2,2*this.nes.PrgRomPageCount-1),this.nes.SetChrRomPages1K(0,0,0,0,0,0,0,0);for(var t=0;t<this.MAPPER_REG.length;t++)this.MAPPER_REG[t]=0;this.MAPPER_Latch0=!0,this.MAPPER_Latch1=!0},h.prototype.Write=function(t,e){switch(61440&t){case 40960:this.nes.SetPrgRomPage8K(0,e);break;case 45056:this.MAPPER_REG[0]=e;break;case 49152:this.MAPPER_REG[1]=e;break;case 53248:this.MAPPER_REG[2]=e;break;case 57344:this.MAPPER_REG[3]=e;break;case 61440:0==(1&e)?this.nes.SetMirror(!1):this.nes.SetMirror(!0)}},h.prototype.BuildBGLine=function(){for(var t=this.nes.BgLineBuffer,e=this.nes.VRAM,s=8192|4095&this.nes.PPUAddress,i=(28672&this.nes.PPUAddress)>>12|(16&this.nes.IO1[0])<<8,h=s>>10,r=1023&s,P=e[h],R=this.nes.PaletteArray,a=this.nes.SPBitArray,o=0,n=this.nes.HScrollTmp,E=0;E<33;E++){var A=P[r]<<4|i,_=A;this.SetChrRom(_);var M=e[A>>10];A&=1023;for(var c=P[(896&r)>>4|960+((28&r)>>2)]<<2>>((64&r)>>4|2&r)&12,G=a[M[A]][M[A+8]];n<8;n++,o++)t[o]=R[G[n]|c];n=0,this.SetLatch(_),31==(31&r)?(r&=65504,P=e[h^=1]):r++}},h.prototype.SetLatch=function(t){4048==(t&=8176)&&(this.MAPPER_Latch0=!1),8144===t&&(this.MAPPER_Latch1=!1),4064===t&&(this.MAPPER_Latch0=!0),8160===t&&(this.MAPPER_Latch1=!0)},h.prototype.SetChrRom=function(t){0==(4096&t)?this.MAPPER_Latch0?(this.nes.SetChrRomPage1K(0,4*this.MAPPER_REG[1]),this.nes.SetChrRomPage1K(1,4*this.MAPPER_REG[1]+1),this.nes.SetChrRomPage1K(2,4*this.MAPPER_REG[1]+2),this.nes.SetChrRomPage1K(3,4*this.MAPPER_REG[1]+3)):(this.nes.SetChrRomPage1K(0,4*this.MAPPER_REG[0]),this.nes.SetChrRomPage1K(1,4*this.MAPPER_REG[0]+1),this.nes.SetChrRomPage1K(2,4*this.MAPPER_REG[0]+2),this.nes.SetChrRomPage1K(3,4*this.MAPPER_REG[0]+3)):this.MAPPER_Latch1?(this.nes.SetChrRomPage1K(4,4*this.MAPPER_REG[3]),this.nes.SetChrRomPage1K(5,4*this.MAPPER_REG[3]+1),this.nes.SetChrRomPage1K(6,4*this.MAPPER_REG[3]+2),this.nes.SetChrRomPage1K(7,4*this.MAPPER_REG[3]+3)):(this.nes.SetChrRomPage1K(4,4*this.MAPPER_REG[2]),this.nes.SetChrRomPage1K(5,4*this.MAPPER_REG[2]+1),this.nes.SetChrRomPage1K(6,4*this.MAPPER_REG[2]+2),this.nes.SetChrRomPage1K(7,4*this.MAPPER_REG[2]+3))},h.prototype.BuildSpriteLine=function(){var t=this.nes.BgLineBuffer,e=4==(4&this.nes.IO1[1])?0:8;if(16==(16&this.nes.IO1[1])){for(var s=this.nes.SpriteLineBuffer,i=0;i<256;i++)s[i]=256;for(var h=this.nes.SPRITE_RAM,r=32==(32&this.nes.IO1[0])?16:8,P=(8&this.nes.IO1[0])<<9,R=this.nes.VRAM,a=this.nes.SPBitArray,o=this.nes.PpuY,n=0,E=0;E<=252;E+=4){var A=h[E]+1;if(!(A>o||A+r<=o))if(0===E&&(this.nes.Sprite0Line=!0),9!=++n){var _=h[E+3],M=_+8;M>256&&(M=256);var c=h[E+2],G=(3&c)<<2|16,p=32&c,C=128==(128&c)?r-1-(o-A):o-A,S=((8&C)<<1)+(7&C)+(8===r?(h[E+1]<<4)+P:((254&h[E+1])<<4)+((1&h[E+1])<<12));this.SetChrRom(S);var u,g,d=R[S>>10],m=1023&S,b=a[d[m]][d[m+8]];for(0==(64&c)?(u=0,g=1):(u=7,g=-1);_<M;_++,u+=g){var f=b[u];0!==f&&256===s[_]&&(s[_]=E,_>=e&&(0===p||16===t[_])&&(t[_]=f|G))}this.SetLatch(S)}else E=256}n>=8?this.nes.IO1[2]|=32:this.nes.IO1[2]&=223}},h.prototype.GetState=function(){this.nes.StateData.Mapper={},this.nes.StateData.Mapper.MAPPER_REG=this.MAPPER_REG.slice(0),this.nes.StateData.Mapper.MAPPER_Latch0=this.MAPPER_Latch0,this.nes.StateData.Mapper.MAPPER_Latch1=this.MAPPER_Latch1},h.prototype.SetState=function(){for(var t=0;t<this.nes.StateData.Mapper.MAPPER_REG.length;t++)this.MAPPER_REG[t]=this.nes.StateData.Mapper.MAPPER_REG[t];this.MAPPER_Latch0=this.nes.StateData.Mapper.MAPPER_Latch0,this.MAPPER_Latch1=this.nes.StateData.Mapper.MAPPER_Latch1},t.exports=h},7115:(t,e,s)=>{var i=s(9678),h=function(t){i.apply(this,arguments)};(h.prototype=Object.create(i.prototype)).Init=function(){this.nes.SetPrgRomPages8K(0,1,2*this.nes.PrgRomPageCount-2,2*this.nes.PrgRomPageCount-1),this.nes.SetChrRomPages1K(0,1,2,3,4,5,6,7)},h.prototype.Write=function(t,e){var s=(15&t)<<1,i=(15&t)<<3;t>=36864?208==(240&t)?this.nes.SetPrgRomPages8K(0,1,s,s+1):224==(240&t)&&this.nes.SetChrRomPages1K(i,i+1,i+2,i+3,i+4,i+5,i+6,i+7):176==(240&t)?this.nes.SetPrgRomPages8K(0,1,s,s+1):112==(240&t)&&this.nes.SetChrRomPages1K(i,i+1,i+2,i+3,i+4,i+5,i+6,i+7)},t.exports=h},1524:(t,e,s)=>{var i=s(9678),h=function(t){i.apply(this,arguments)};(h.prototype=Object.create(i.prototype)).Init=function(){this.nes.SetPrgRomPages8K(0,1,2*this.nes.PrgRomPageCount-2,2*this.nes.PrgRomPageCount-1),this.nes.SetChrRomPages1K(0,1,2,3,4,5,6,7)},h.prototype.WriteSRAM=function(t,e){24576===t&&(this.nes.SetPrgRomPage8K(0,2*e),this.nes.SetPrgRomPage8K(1,2*e+1))},t.exports=h},1831:(t,e,s)=>{var i=s(9678),h=function(t){i.apply(this,arguments)};(h.prototype=Object.create(i.prototype)).Init=function(){this.nes.SetPrgRomPage(0,0),this.nes.SetPrgRomPage(1,this.nes.PrgRomPageCount-1),this.nes.SetChrRomPage(0)},h.prototype.Write=function(t,e){this.nes.SetPrgRomPage(0,e>>2)},t.exports=h},2734:(t,e,s)=>{var i=s(9678),h=function(t){i.apply(this,arguments),this.MAPPER_REG=new Array(1)};(h.prototype=Object.create(i.prototype)).Init=function(){this.nes.SetPrgRomPages8K(0,0,2*this.nes.PrgRomPageCount-2,2*this.nes.PrgRomPageCount-1),this.nes.SetChrRomPages1K(0,0,0,0,0,0,0,0),this.MAPPER_REG[0]=0},h.prototype.Write=function(t,e){if(0==(1&t)&&(this.MAPPER_REG[0]=7&e),1==(1&t))switch(this.MAPPER_REG[0]<=5&&(32==(32&e)?this.nes.SetMirrors(1,1,1,1):this.nes.SetMirrors(0,0,0,0)),this.MAPPER_REG[0]){case 0:this.nes.SetChrRomPage1K(0,30&e),this.nes.SetChrRomPage1K(1,1+(30&e));break;case 1:this.nes.SetChrRomPage1K(2,30&e),this.nes.SetChrRomPage1K(3,1+(30&e));break;case 2:this.nes.SetChrRomPage1K(4,31&e);break;case 3:this.nes.SetChrRomPage1K(5,31&e);break;case 4:this.nes.SetChrRomPage1K(6,31&e);break;case 5:this.nes.SetChrRomPage1K(7,31&e);break;case 6:this.nes.SetPrgRomPage8K(0,15&e);break;case 7:this.nes.SetPrgRomPage8K(1,15&e)}},t.exports=h},5791:(t,e,s)=>{var i=s(9678),h=function(t){i.apply(this,arguments)};(h.prototype=Object.create(i.prototype)).Init=function(){this.nes.SetPrgRomPage(0,this.nes.PrgRomPageCount-1),this.nes.SetPrgRomPage(1,0),this.nes.SetChrRomPage(0)},h.prototype.Write=function(t,e){switch(this.nes.SetPrgRomPage(1,15&e),192&e){case 0:this.nes.SetMirrors(0,0,0,0);break;case 64:this.nes.SetMirror(!0);break;case 128:this.nes.SetMirror(!1);break;case 192:this.nes.SetMirrors(1,1,1,1)}},t.exports=h},9678:t=>{var e=function(t){this.nes=t,this.MAPPER_REG=null};e.prototype.Init=function(){},e.prototype.ReadLow=function(t){return 64},e.prototype.WriteLow=function(t,e){},e.prototype.ReadPPUData=function(){return this.nes.ReadPPUData_SUB()},e.prototype.WritePPUData=function(t){this.nes.WritePPUData_SUB(t)},e.prototype.BuildBGLine=function(){this.nes.BuildBGLine_SUB()},e.prototype.BuildSpriteLine=function(){this.nes.BuildSpriteLine_SUB()},e.prototype.ReadSRAM=function(t){return this.nes.SRAM[8191&t]},e.prototype.WriteSRAM=function(t,e){this.nes.SRAM[8191&t]=e},e.prototype.Write=function(t,e){},e.prototype.HSync=function(t){},e.prototype.CPUSync=function(t){},e.prototype.SetIRQ=function(){this.nes.toIRQ|=4},e.prototype.ClearIRQ=function(){this.nes.toIRQ&=-5},e.prototype.OutEXSound=function(t){return t},e.prototype.EXSoundSync=function(t){},e.prototype.GetState=function(){null!==this.MAPPER_REG&&(this.nes.StateData.Mapper={},this.nes.StateData.Mapper.MAPPER_REG=this.MAPPER_REG.slice(0))},e.prototype.SetState=function(){if(null!==this.MAPPER_REG)for(var t=0;t<this.nes.StateData.Mapper.MAPPER_REG.length;t++)this.MAPPER_REG[t]=this.nes.StateData.Mapper.MAPPER_REG[t]},t.exports=e},4495:(t,e,s)=>{var i=s(6856),h=s(3461),r=s(2541),P=s(3712),R=s(7070),a=s(9454),o=s(2178),n=s(1816),E=s(9785),A=s(7336),_=s(2066),M=s(6686),c=s(7185),G=s(9677),p=s(6433),C=s(4030),S=s(1338),u=s(1747),g=s(8646),d=s(3362),m=s(3358),b=s(3074),f=s(7360),l=s(1962),y=s(3101),k=s(6619),v=s(960),K=s(8033),I=s(3030),W=s(9681),D=s(3394),O=s(3576),L=s(2220),T=s(6335),w=s(7387),B=s(7735),F=s(8346),X=s(6523),V=s(7890),N=s(789),U=s(472),Y=s(222),H=s(1398),x=s(5191),Q=s(177),Z=s(8310),q=s(9806),j=s(2605),J=s(730),z=s(7115),$=s(1524),tt=s(1831),et=s(2734),st=s(5791),it=function(t){if(void 0!==window.requestAnimationFrame){var e;for(this.requestID=null,this.A=0,this.X=0,this.Y=0,this.S=0,this.P=0,this.PC=0,this.toNMI=!1,this.toIRQ=0,this.CPUClock=0,this.ZNCacheTable=new Array(256),this.ZNCacheTable[0]=2,e=1;e<256;e++)this.ZNCacheTable[e]=128&e;for(this.ZNCacheTableCMP=new Array(512),e=0;e<256;e++)this.ZNCacheTableCMP[e]=1|this.ZNCacheTable[e],this.ZNCacheTableCMP[e+256]=this.ZNCacheTable[e];for(this.ScrollRegisterFlag=!1,this.PPUAddressRegisterFlag=!1,this.HScrollTmp=0,this.PPUAddress=0,this.PPUAddressBuffer=0,this.Palette=null,this.SpriteLineBuffer=null,this.PPUReadBuffer=0,this.BgLineBuffer=null,this.SPBitArray=new Array(256),e=0;e<256;e++){this.SPBitArray[e]=new Array(256);for(var s=0;s<256;s++){this.SPBitArray[e][s]=new Array(8);for(var i=0;i<8;i++)this.SPBitArray[e][s][i]=(e<<i&128)>>>7|(s<<i&128)>>>6}}for(this.PaletteArray=[16,1,2,3,16,5,6,7,16,9,10,11,16,13,14,15],this.PpuX=0,this.PpuY=0,this.ImageData=null,this.DrawFlag=!1,this.ctx=t.getContext("2d"),this.Sprite0Line=!1,this.PrgRomPageCount=0,this.ChrRomPageCount=0,this.HMirror=!1,this.VMirror=!1,this.SramEnable=!1,this.TrainerEnable=!1,this.FourScreen=!1,this.MapperNumber=-1,this.Mapper=null,this.RAM=new Array(2048),this.SRAM=new Array(8192),this.VRAM=new Array(16),this.VRAMS=new Array(16),e=0;e<16;e++)this.VRAMS[e]=new Array(1024);this.SPRITE_RAM=new Array(256),this.ROM=new Array(4),this.PRGROM_STATE=new Array(4),this.CHRROM_STATE=new Array(8),this.PRGROM_PAGES=null,this.CHRROM_PAGES=null,this.IO1=new Array(8),this.IO2=new Array(32),this.Rom=null,this.JoyPadStrobe=!1,this.JoyPadState=[0,0],this.JoyPadBuffer=[0,0],this.MainClock=1789772.5,this.WaveOut=!0,this.WaveDatas=[],this.WaveBaseCount=0,this.WaveSampleRate=24e3,this.WaveFrameSequence=0,this.WaveFrameSequenceCounter=0,this.WaveVolume=.5,this.WaveCh1LengthCounter=0,this.WaveCh1Envelope=0,this.WaveCh1EnvelopeCounter=0,this.WaveCh1Sweep=0,this.WaveCh1Frequency=0,this.WaveCh2LengthCounter=0,this.WaveCh2Envelope=0,this.WaveCh2EnvelopeCounter=0,this.WaveCh2Sweep=0,this.WaveCh2Frequency=0,this.WaveCh3LengthCounter=0,this.WaveCh3LinearCounter=0,this.WaveCh4Angle=-1,this.WaveCh4LengthCounter=0,this.WaveCh4Envelope=0,this.WaveCh4EnvelopeCounter=0,this.WaveCh4Register=0,this.WaveCh4BitSequence=0,this.WaveCh4Angle=0,this.WaveCh5Angle=-1,this.WaveCh5DeltaCounter=0,this.WaveCh5Register=0,this.WaveCh5SampleAddress=0,this.WaveCh5SampleCounter=0,this.ApuClockCounter=0,this.WaveLengthCount=[10,254,20,2,40,4,80,6,160,8,60,10,14,12,26,14,12,16,24,18,48,20,96,22,192,24,72,26,16,28,32,30],this.WaveCh1_2DutyData=[4,8,16,24],this.WaveCh3SequenceData=[15,13,11,9,7,5,3,1,-1,-3,-5,-7,-9,-11,-13,-15,-15,-13,-11,-9,-7,-5,-3,-1,1,3,5,7,9,11,13,15],this.WaveCh4FrequencyData=[4,8,16,32,64,96,128,160,202,254,380,508,762,1016,2034,4068],this.WaveCh5FrequencyData=[428,380,340,320,286,254,226,214,190,160,142,128,106,84,72,54],this.WebAudioCtx=null,this.WebAudioJsNode=null,this.WebAudioGainNode=null,this.WebAudioBufferSize=4096,this.ApuCpuClockCounter=0,window.AudioContext=window.AudioContext||window.webkitAudioContext,this.canAudioContext=void 0!==window.AudioContext,this.canAudioContext&&(this.WebAudioCtx=new window.AudioContext,this.WebAudioJsNode=this.WebAudioCtx.createScriptProcessor(this.WebAudioBufferSize,1,1),this.WebAudioJsNode.onaudioprocess=this.WebAudioFunction.bind(this),this.WebAudioGainNode=this.WebAudioCtx.createGain(),this.WebAudioJsNode.connect(this.WebAudioGainNode),this.WebAudioGainNode.connect(this.WebAudioCtx.destination),this.WaveSampleRate=this.WebAudioCtx.sampleRate),this.FDS_WAVE_REG=new Array(64),this.FDS_LFO_REG=new Array(32),this.FDS_REG=new Array(16),this.FDS_LFO_DATA=[0,1,2,4,0,-4,-2,-1],this.FDS_WaveIndexCounter=0,this.FDS_WaveIndex=0,this.FDS_LFOIndexCounter=0,this.FDS_LFOIndex=0,this.FDS_REGAddress=0,this.FDS_VolumeEnvCounter=0,this.FDS_VolumeEnv=0,this.FDS_SweepEnvCounter=0,this.FDS_SweepEnv=0,this.FDS_SweepBias=0,this.FDS_Volume=0,this.MMC5_FrameSequenceCounter=0,this.MMC5_FrameSequence=0,this.MMC5_REG=new Array(32),this.MMC5_Ch=new Array(2),this.MMC5_Level=0,this.VRC6_REG=new Array(12),this.VRC6_Ch3_Counter=0,this.VRC6_Ch3_index=0,this.VRC6_Level=0,this.N163_ch_data=new Array(8),this.N163_RAM=new Array(128),this.N163_Address=0,this.N163_ch=0,this.N163_Level=0,this.N163_Clock=0,this.AY_ClockCounter=0,this.AY_REG=new Array(16),this.AY_Noise_Seed=1,this.AY_Noise_Angle=0,this.AY_Env_Counter=0,this.AY_Env_Index=0,this.AY_REG_Select=0,this.AY_Level=0,this.AY_Env_Pattern=[[15,14,13,12,11,10,9,8,7,6,5,4,3,2,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[15,14,13,12,11,10,9,8,7,6,5,4,3,2,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[15,14,13,12,11,10,9,8,7,6,5,4,3,2,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[15,14,13,12,11,10,9,8,7,6,5,4,3,2,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[15,14,13,12,11,10,9,8,7,6,5,4,3,2,1,0,15,14,13,12,11,10,9,8,7,6,5,4,3,2,1,0,15,14,13,12,11,10,9,8,7,6,5,4,3,2,1,0],[15,14,13,12,11,10,9,8,7,6,5,4,3,2,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[15,14,13,12,11,10,9,8,7,6,5,4,3,2,1,0,0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,15,14,13,12,11,10,9,8,7,6,5,4,3,2,1,0],[15,14,13,12,11,10,9,8,7,6,5,4,3,2,1,0,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15],[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15],[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15],[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,15,14,13,12,11,10,9,8,7,6,5,4,3,2,1,0,0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15],[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]],this.AY_Env_Volume=[0,16,23,32,45,64,90,128,181,256,362,512,724,1023,1447,2047]}else window.alert("use a brower that supports requestAnimationFrame method")};it.prototype.JOYPAD_1P=0,it.prototype.JOYPAD_2P=1,it.prototype.BUTTON_A=1,it.prototype.BUTTON_B=2,it.prototype.BUTTON_SELECT=4,it.prototype.BUTTON_START=8,it.prototype.BUTTON_UP=16,it.prototype.BUTTON_DOWN=32,it.prototype.BUTTON_LEFT=64,it.prototype.BUTTON_RIGHT=128,it.prototype.CycleTable=[7,6,2,8,3,3,5,5,3,2,2,2,4,4,6,6,2,5,2,8,4,4,6,6,2,4,2,7,4,4,6,7,6,6,2,8,3,3,5,5,4,2,2,2,4,4,6,6,2,5,2,8,4,4,6,6,2,4,2,7,4,4,6,7,6,6,2,8,3,3,5,5,3,2,2,2,3,4,6,6,2,5,2,8,4,4,6,6,2,4,2,7,4,4,6,7,6,6,2,8,3,3,5,5,4,2,2,2,5,4,6,6,2,5,2,8,4,4,6,6,2,4,2,7,4,4,6,7,2,6,2,6,3,3,3,3,2,2,2,2,4,4,4,4,2,5,2,6,4,4,4,4,2,4,2,5,5,4,5,5,2,6,2,6,3,3,3,3,2,2,2,2,4,4,4,4,2,5,2,5,4,4,4,4,2,4,2,4,4,4,4,4,2,6,2,8,3,3,5,5,2,2,2,2,4,4,6,6,2,5,2,8,4,4,6,6,2,4,2,7,4,4,6,7,2,6,2,8,3,3,5,5,2,2,2,2,4,4,6,6,2,5,2,8,4,4,6,6,2,4,2,7,4,4,6,7],it.prototype.ZEROS_ROM_PAGE=new Array(8192);for(var ht=0;ht<it.prototype.ZEROS_ROM_PAGE.length;ht++)it.prototype.ZEROS_ROM_PAGE[ht]=0;it.prototype.REG_P_NEGATIVE=128,it.prototype.REG_P_OVERFLOW=64,it.prototype.REG_P_NOTUSED=32,it.prototype.REG_P_BREAK=16,it.prototype.REG_P_DECIMAL=8,it.prototype.REG_P_INTERRUPT=4,it.prototype.REG_P_ZERO=2,it.prototype.REG_P_CARRY=1,it.prototype.IRQ_NMI_ADDR=65530,it.prototype.IRQ_RESET_ADDR=65532,it.prototype.IRQ_BRK_ADDR=65534,it.prototype.PaletteTable=[[128,128,128],[0,61,166],[0,18,176],[68,0,150],[161,0,94],[199,0,40],[186,6,0],[140,23,0],[92,47,0],[16,69,0],[5,74,0],[0,71,46],[0,65,102],[0,0,0],[5,5,5],[5,5,5],[199,199,199],[0,119,255],[33,85,255],[130,55,250],[235,47,181],[255,41,80],[255,34,0],[214,50,0],[196,98,0],[53,128,0],[5,143,0],[0,138,85],[0,153,204],[33,33,33],[9,9,9],[9,9,9],[255,255,255],[15,215,255],[105,162,255],[212,128,255],[255,69,243],[255,97,139],[255,136,51],[255,156,18],[250,188,32],[159,227,14],[43,240,53],[12,240,164],[5,251,255],[94,94,94],[13,13,13],[13,13,13],[255,255,255],[166,252,255],[179,236,255],[218,171,235],[255,168,249],[255,171,179],[255,210,176],[255,239,166],[255,247,156],[215,232,149],[166,237,175],[162,242,218],[153,255,252],[221,221,221],[17,17,17],[17,17,17]],it.prototype.Init=function(){return this.ParseHeader(),this.StorageClear(),this.StorageInit(),this.PpuInit(),this.ApuInit(),this.MapperSelect()?(this.Mapper.Init(),this.CpuInit(),!0):(window.alert("Unsupported Mapper: "+this.MapperNumber),!1)},it.prototype.ParseHeader=function(){if(this.Rom)return this.PrgRomPageCount=this.Rom[4],this.ChrRomPageCount=this.Rom[5],this.HMirror=0==(1&this.Rom[6]),this.VMirror=0!=(1&this.Rom[6]),this.SramEnable=0!=(2&this.Rom[6]),this.TrainerEnable=0!=(4&this.Rom[6]),this.FourScreen=0!=(8&this.Rom[6]),this.MapperNumber=this.Rom[6]>>4|240&this.Rom[7],!0},it.prototype.MapperSelect=function(){switch(this.MapperNumber){case 0:this.Mapper=new i(this);break;case 1:this.Mapper=new h(this);break;case 2:this.Mapper=new p(this);break;case 3:this.Mapper=new b(this);break;case 4:this.Mapper=new k(this);break;case 5:this.Mapper=new K(this);break;case 7:this.Mapper=new T(this);break;case 9:this.Mapper=new J(this);break;case 10:this.Mapper=new r(this);break;case 16:this.Mapper=new E(this);break;case 18:this.Mapper=new A(this);break;case 19:case 210:this.Mapper=new G(this);break;case 20:case 21:case 25:this.Mapper=new d(this);break;case 22:this.Mapper=new S(this);break;case 23:this.Mapper=new u(this);break;case 24:this.Mapper=new g(this);break;case 26:this.Mapper=new m(this);break;case 32:this.Mapper=new f(this);break;case 33:this.Mapper=new l(this);break;case 34:this.Mapper=new y(this);break;case 48:this.Mapper=new v(this);break;case 65:this.Mapper=new I(this);break;case 66:this.Mapper=new W(this);break;case 67:this.Mapper=new D(this);break;case 68:this.Mapper=new O(this);break;case 69:this.Mapper=new L(this);break;case 70:this.Mapper=new w(this);break;case 72:this.Mapper=new B(this);break;case 73:this.Mapper=new F(this);break;case 75:this.Mapper=new X(this);break;case 76:this.Mapper=new V(this);break;case 77:this.Mapper=new N(this);break;case 78:this.Mapper=new U(this);break;case 80:this.Mapper=new Y(this);break;case 82:this.Mapper=new H(this);break;case 85:this.Mapper=new x(this);break;case 86:this.Mapper=new Q(this);break;case 87:this.Mapper=new Z(this);break;case 88:this.Mapper=new q(this);break;case 89:this.Mapper=new j(this);break;case 92:this.Mapper=new z(this);break;case 93:this.Mapper=new $(this);break;case 94:this.Mapper=new tt(this);break;case 95:this.Mapper=new et(this);break;case 97:this.Mapper=new st(this);break;case 101:this.Mapper=new P(this);break;case 118:this.Mapper=new R(this);break;case 119:this.Mapper=new a(this);break;case 140:this.Mapper=new o(this);break;case 152:this.Mapper=new n(this);break;case 180:this.Mapper=new _(this);break;case 184:this.Mapper=new M(this);break;case 185:this.Mapper=new c(this);break;case 207:this.Mapper=new C(this);break;default:return!1}return!0},it.prototype.Start=function(){return null!==this.Mapper&&null===this.requestID&&(this.Run(),!0)},it.prototype.Run=function(){this.CpuRun(),this.requestID=window.requestAnimationFrame(this.Run.bind(this))},it.prototype.Pause=function(){return null!==this.Mapper&&null!==this.requestID&&(window.cancelAnimationFrame(this.requestID),this.requestID=null,!0)},it.prototype.Reset=function(){return null!==this.Mapper&&(this.Pause(),this.PpuInit(),this.ApuInit(),this.Mapper.Init(),this.CpuReset(),this.Start(),!0)},it.prototype.CpuInit=function(){this.A=0,this.X=0,this.Y=0,this.S=253,this.P=52,this.PC=this.Get16(this.IRQ_RESET_ADDR),this.toNMI=!1,this.toIRQ=0,this.Set(8,247),this.Set(9,239),this.Set(10,223),this.Set(15,191)},it.prototype.CpuRun=function(){for(this.DrawFlag=!1;!this.DrawFlag;){this.toNMI?(this.NMI(),this.toNMI=!1):0==(4&this.P)&&0!==this.toIRQ&&this.IRQ();var t=this.Get(this.PC++);this.CPUClock+=this.CycleTable[t],this.Mapper.CPUSync(this.CPUClock),this.PpuRun(),this.ApuRun(),this.CPUClock=0,this.ExecuteOpCode(t)}},it.prototype.ExecuteOpCode=function(t){switch(t){case 161:this.LDA(this.GetAddressIndirectX());break;case 165:this.LDA(this.GetAddressZeroPage());break;case 169:this.LDA(this.GetAddressImmediate());break;case 173:this.LDA(this.GetAddressAbsolute());break;case 177:this.LDA(this.GetAddressIndirectY());break;case 181:this.LDA(this.GetAddressZeroPageX());break;case 185:this.LDA(this.GetAddressAbsoluteY());break;case 189:this.LDA(this.GetAddressAbsoluteX());break;case 162:this.LDX(this.GetAddressImmediate());break;case 166:this.LDX(this.GetAddressZeroPage());break;case 174:this.LDX(this.GetAddressAbsolute());break;case 182:this.LDX(this.GetAddressZeroPageY());break;case 190:this.LDX(this.GetAddressAbsoluteY());break;case 160:this.LDY(this.GetAddressImmediate());break;case 164:this.LDY(this.GetAddressZeroPage());break;case 172:this.LDY(this.GetAddressAbsolute());break;case 180:this.LDY(this.GetAddressZeroPageX());break;case 188:this.LDY(this.GetAddressAbsoluteX());break;case 129:this.STA(this.GetAddressIndirectX());break;case 133:this.STA(this.GetAddressZeroPage());break;case 141:this.STA(this.GetAddressAbsolute());break;case 145:this.STA(this.GetAddressIndirectY());break;case 149:this.STA(this.GetAddressZeroPageX());break;case 153:this.STA(this.GetAddressAbsoluteY());break;case 157:this.STA(this.GetAddressAbsoluteX());break;case 134:this.STX(this.GetAddressZeroPage());break;case 142:this.STX(this.GetAddressAbsolute());break;case 150:this.STX(this.GetAddressZeroPageY());break;case 132:this.STY(this.GetAddressZeroPage());break;case 140:this.STY(this.GetAddressAbsolute());break;case 148:this.STY(this.GetAddressZeroPageX());break;case 138:this.TXA();break;case 152:this.TYA();break;case 154:this.TXS();break;case 168:this.TAY();break;case 170:this.TAX();break;case 186:this.TSX();break;case 8:this.PHP();break;case 40:this.PLP();break;case 72:this.PHA();break;case 104:this.PLA();break;case 97:this.ADC(this.GetAddressIndirectX());break;case 101:this.ADC(this.GetAddressZeroPage());break;case 105:this.ADC(this.GetAddressImmediate());break;case 109:this.ADC(this.GetAddressAbsolute());break;case 113:this.ADC(this.GetAddressIndirectY());break;case 117:this.ADC(this.GetAddressZeroPageX());break;case 121:this.ADC(this.GetAddressAbsoluteY());break;case 125:this.ADC(this.GetAddressAbsoluteX());break;case 225:this.SBC(this.GetAddressIndirectX());break;case 229:this.SBC(this.GetAddressZeroPage());break;case 233:case 235:this.SBC(this.GetAddressImmediate());break;case 237:this.SBC(this.GetAddressAbsolute());break;case 241:this.SBC(this.GetAddressIndirectY());break;case 245:this.SBC(this.GetAddressZeroPageX());break;case 249:this.SBC(this.GetAddressAbsoluteY());break;case 253:this.SBC(this.GetAddressAbsoluteX());break;case 193:this.CMP(this.GetAddressIndirectX());break;case 197:this.CMP(this.GetAddressZeroPage());break;case 201:this.CMP(this.GetAddressImmediate());break;case 205:this.CMP(this.GetAddressAbsolute());break;case 209:this.CMP(this.GetAddressIndirectY());break;case 213:this.CMP(this.GetAddressZeroPageX());break;case 217:this.CMP(this.GetAddressAbsoluteY());break;case 221:this.CMP(this.GetAddressAbsoluteX());break;case 224:this.CPX(this.GetAddressImmediate());break;case 228:this.CPX(this.GetAddressZeroPage());break;case 236:this.CPX(this.GetAddressAbsolute());break;case 192:this.CPY(this.GetAddressImmediate());break;case 196:this.CPY(this.GetAddressZeroPage());break;case 204:this.CPY(this.GetAddressAbsolute());break;case 33:this.AND(this.GetAddressIndirectX());break;case 37:this.AND(this.GetAddressZeroPage());break;case 41:this.AND(this.GetAddressImmediate());break;case 45:this.AND(this.GetAddressAbsolute());break;case 49:this.AND(this.GetAddressIndirectY());break;case 53:this.AND(this.GetAddressZeroPageX());break;case 57:this.AND(this.GetAddressAbsoluteY());break;case 61:this.AND(this.GetAddressAbsoluteX());break;case 65:this.EOR(this.GetAddressIndirectX());break;case 69:this.EOR(this.GetAddressZeroPage());break;case 73:this.EOR(this.GetAddressImmediate());break;case 77:this.EOR(this.GetAddressAbsolute());break;case 81:this.EOR(this.GetAddressIndirectY());break;case 85:this.EOR(this.GetAddressZeroPageX());break;case 89:this.EOR(this.GetAddressAbsoluteY());break;case 93:this.EOR(this.GetAddressAbsoluteX());break;case 1:this.ORA(this.GetAddressIndirectX());break;case 5:this.ORA(this.GetAddressZeroPage());break;case 9:this.ORA(this.GetAddressImmediate());break;case 13:this.ORA(this.GetAddressAbsolute());break;case 17:this.ORA(this.GetAddressIndirectY());break;case 21:this.ORA(this.GetAddressZeroPageX());break;case 25:this.ORA(this.GetAddressAbsoluteY());break;case 29:this.ORA(this.GetAddressAbsoluteX());break;case 36:this.BIT(this.GetAddressZeroPage());break;case 44:this.BIT(this.GetAddressAbsolute());break;case 6:this.ASL(this.GetAddressZeroPage());break;case 10:this.A=this.ASL_Sub(this.A);break;case 14:this.ASL(this.GetAddressAbsolute());break;case 22:this.ASL(this.GetAddressZeroPageX());break;case 30:this.ASL(this.GetAddressAbsoluteX());break;case 70:this.LSR(this.GetAddressZeroPage());break;case 74:this.A=this.LSR_Sub(this.A);break;case 78:this.LSR(this.GetAddressAbsolute());break;case 86:this.LSR(this.GetAddressZeroPageX());break;case 94:this.LSR(this.GetAddressAbsoluteX());break;case 38:this.ROL(this.GetAddressZeroPage());break;case 42:this.A=this.ROL_Sub(this.A);break;case 46:this.ROL(this.GetAddressAbsolute());break;case 54:this.ROL(this.GetAddressZeroPageX());break;case 62:this.ROL(this.GetAddressAbsoluteX());break;case 102:this.ROR(this.GetAddressZeroPage());break;case 106:this.A=this.ROR_Sub(this.A);break;case 110:this.ROR(this.GetAddressAbsolute());break;case 118:this.ROR(this.GetAddressZeroPageX());break;case 126:this.ROR(this.GetAddressAbsoluteX());break;case 230:this.INC(this.GetAddressZeroPage());break;case 238:this.INC(this.GetAddressAbsolute());break;case 246:this.INC(this.GetAddressZeroPageX());break;case 254:this.INC(this.GetAddressAbsoluteX());break;case 232:this.INX();break;case 200:this.INY();break;case 198:this.DEC(this.GetAddressZeroPage());break;case 206:this.DEC(this.GetAddressAbsolute());break;case 214:this.DEC(this.GetAddressZeroPageX());break;case 222:this.DEC(this.GetAddressAbsoluteX());break;case 202:this.DEX();break;case 136:this.DEY();break;case 24:this.P&=254;break;case 88:this.P&=251;break;case 184:this.P&=191;break;case 216:this.P&=247;break;case 56:this.P|=1;break;case 120:this.P|=4;break;case 248:this.P|=8;break;case 234:this.NOP();break;case 0:this.BRK();break;case 76:this.JMP(this.GetAddressAbsolute());break;case 108:var e=this.GetAddressAbsolute(),s=e+1&255|65280&e;this.JMP(this.Get(e)|this.Get(s)<<8);break;case 32:this.JSR();break;case 96:this.RTS();break;case 64:this.RTI();break;case 16:this.BPL();break;case 48:this.BMI();break;case 80:this.BVC();break;case 112:this.BVS();break;case 144:this.BCC();break;case 176:this.BCS();break;case 208:this.BNE();break;case 240:this.BEQ();break;case 11:case 43:this.ANC(this.GetAddressImmediate());break;case 139:this.ANE(this.GetAddressImmediate());break;case 107:this.ARR(this.GetAddressImmediate());break;case 75:this.ASR(this.GetAddressImmediate());break;case 199:this.DCP(this.GetAddressZeroPage());break;case 215:this.DCP(this.GetAddressZeroPageX());break;case 207:this.DCP(this.GetAddressAbsolute());break;case 223:this.DCP(this.GetAddressAbsoluteX());break;case 219:this.DCP(this.GetAddressAbsoluteY());break;case 195:this.DCP(this.GetAddressIndirectX());break;case 211:this.DCP(this.GetAddressIndirectY());break;case 231:this.ISB(this.GetAddressZeroPage());break;case 247:this.ISB(this.GetAddressZeroPageX());break;case 239:this.ISB(this.GetAddressAbsolute());break;case 255:this.ISB(this.GetAddressAbsoluteX());break;case 251:this.ISB(this.GetAddressAbsoluteY());break;case 227:this.ISB(this.GetAddressIndirectX());break;case 243:this.ISB(this.GetAddressIndirectY());break;case 187:this.LAS(this.GetAddressAbsoluteY());break;case 167:this.LAX(this.GetAddressZeroPage());break;case 183:this.LAX(this.GetAddressZeroPageY());break;case 175:this.LAX(this.GetAddressAbsolute());break;case 191:this.LAX(this.GetAddressAbsoluteY());break;case 163:this.LAX(this.GetAddressIndirectX());break;case 179:this.LAX(this.GetAddressIndirectY());break;case 171:this.LXA(this.GetAddressImmediate());break;case 39:this.RLA(this.GetAddressZeroPage());break;case 55:this.RLA(this.GetAddressZeroPageX());break;case 47:this.RLA(this.GetAddressAbsolute());break;case 63:this.RLA(this.GetAddressAbsoluteX());break;case 59:this.RLA(this.GetAddressAbsoluteY());break;case 35:this.RLA(this.GetAddressIndirectX());break;case 51:this.RLA(this.GetAddressIndirectY());break;case 103:this.RRA(this.GetAddressZeroPage());break;case 119:this.RRA(this.GetAddressZeroPageX());break;case 111:this.RRA(this.GetAddressAbsolute());break;case 127:this.RRA(this.GetAddressAbsoluteX());break;case 123:this.RRA(this.GetAddressAbsoluteY());break;case 99:this.RRA(this.GetAddressIndirectX());break;case 115:this.RRA(this.GetAddressIndirectY());break;case 135:this.SAX(this.GetAddressZeroPage());break;case 151:this.SAX(this.GetAddressZeroPageY());break;case 143:this.SAX(this.GetAddressAbsolute());break;case 131:this.SAX(this.GetAddressIndirectX());break;case 203:this.SBX(this.GetAddressImmediate());break;case 159:this.SHA(this.GetAddressAbsoluteY());break;case 147:this.SHA(this.GetAddressIndirectY());break;case 155:this.SHS(this.GetAddressAbsoluteY());break;case 158:this.SHX(this.GetAddressAbsoluteY());break;case 156:this.SHY(this.GetAddressAbsoluteX());break;case 7:this.SLO(this.GetAddressZeroPage());break;case 23:this.SLO(this.GetAddressZeroPageX());break;case 15:this.SLO(this.GetAddressAbsolute());break;case 31:this.SLO(this.GetAddressAbsoluteX());break;case 27:this.SLO(this.GetAddressAbsoluteY());break;case 3:this.SLO(this.GetAddressIndirectX());break;case 19:this.SLO(this.GetAddressIndirectY());break;case 71:this.SRE(this.GetAddressZeroPage());break;case 87:this.SRE(this.GetAddressZeroPageX());break;case 79:this.SRE(this.GetAddressAbsolute());break;case 95:this.SRE(this.GetAddressAbsoluteX());break;case 91:this.SRE(this.GetAddressAbsoluteY());break;case 67:this.SRE(this.GetAddressIndirectX());break;case 83:this.SRE(this.GetAddressIndirectY());break;case 26:case 58:case 90:case 122:case 218:case 250:break;case 128:case 130:case 137:case 194:case 226:case 4:case 68:case 100:case 20:case 52:case 84:case 116:case 212:case 244:this.PC++;break;case 12:case 28:case 60:case 92:case 124:case 220:case 252:this.PC+=2;break;default:window.alert("Unknown opcode: "+t),this.PC--}},it.prototype.SetNegativeFlag=function(){this.P|=this.REG_P_NEGATIVE},it.prototype.ClearNegativeFlag=function(){this.P&=~this.REG_P_NEGATIVE},it.prototype.SetOverflowFlag=function(){this.P|=this.REG_P_OVERFLOW},it.prototype.ClearOverflowFlag=function(){this.P&=~this.REG_P_OVERFLOW},it.prototype.SetBreakFlag=function(){this.P|=this.REG_P_BREAK},it.prototype.ClearBreakFlag=function(){this.P&=~this.REG_P_BREAK},it.prototype.SetDecimalModeFlag=function(){this.P|=this.REG_P_DECIMAL},it.prototype.ClearDecimalModeFlag=function(){this.P&=~this.REG_P_DECIMAL},it.prototype.SetInterruptFlag=function(){this.P|=this.REG_P_INTERRUPT},it.prototype.ClearInterruptFlag=function(){this.P&=~this.REG_P_INTERRUPT},it.prototype.SetZeroFlag=function(){this.P|=this.REG_P_INTERRUPT},it.prototype.ClearZeroFlag=function(){this.P&=~this.REG_P_INTERRUPT},it.prototype.SetCarryFlag=function(){this.P|=this.REG_P_CARRY},it.prototype.ClearCarryFlag=function(){this.P&=~this.REG_P_CARRY},it.prototype.CpuReset=function(){this.S=this.S-3&255,this.P|=4,this.toNMI=!1,this.toIRQ=0,this.PC=this.Get16(this.IRQ_RESET_ADDR)},it.prototype.NMI=function(){this.CPUClock+=7,this.Push(this.PC>>8&255),this.Push(255&this.PC),this.Push(239&this.P|32),this.P=239&(4|this.P),this.PC=this.Get16(this.IRQ_NMI_ADDR)},it.prototype.IRQ=function(){this.CPUClock+=7,this.Push(this.PC>>8&255),this.Push(255&this.PC),this.Push(239&this.P|32),this.P=239&(4|this.P),this.PC=this.Get16(this.IRQ_BRK_ADDR)},it.prototype.BRK=function(){this.PC++,this.Push(this.PC>>8),this.Push(255&this.PC),this.Push(48|this.P),this.P|=20,this.PC=this.Get16(this.IRQ_BRK_ADDR)},it.prototype.GetAddressZeroPage=function(){return this.Get(this.PC++)},it.prototype.GetAddressImmediate=function(){return this.PC++},it.prototype.GetAddressAbsolute=function(){var t=this.Get16(this.PC);return this.PC+=2,t},it.prototype.GetAddressZeroPageX=function(){return this.GetAddressZeroPage()+this.X&255},it.prototype.GetAddressZeroPageY=function(){return this.GetAddressZeroPage()+this.Y&255},it.prototype.GetAddressIndirectX=function(){var t=this.GetAddressZeroPage()+this.X&255;return this.Get(t)|this.Get(t+1&255)<<8},it.prototype.GetAddressIndirectY=function(){var t=this.GetAddressZeroPage(),e=(t=this.Get(t)|this.Get(t+1&255)<<8)+this.Y;return(256&(e^t))>0&&(this.CPUClock+=1),e},it.prototype.GetAddressAbsoluteX=function(){var t=this.GetAddressAbsolute(),e=t+this.X;return(256&(e^t))>0&&(this.CPUClock+=1),e},it.prototype.GetAddressAbsoluteY=function(){var t=this.GetAddressAbsolute(),e=t+this.Y;return(256&(e^t))>0&&(this.CPUClock+=1),e},it.prototype.Push=function(t){this.RAM[256+this.S]=t,this.S=this.S-1&255},it.prototype.Pop=function(){return this.S=this.S+1&255,this.RAM[256+this.S]},it.prototype.LDA=function(t){this.A=this.Get(t),this.P=125&this.P|this.ZNCacheTable[this.A]},it.prototype.LDX=function(t){this.X=this.Get(t),this.P=125&this.P|this.ZNCacheTable[this.X]},it.prototype.LDY=function(t){this.Y=this.Get(t),this.P=125&this.P|this.ZNCacheTable[this.Y]},it.prototype.STA=function(t){this.Set(t,this.A)},it.prototype.STX=function(t){this.Set(t,this.X)},it.prototype.STY=function(t){this.Set(t,this.Y)},it.prototype.TXA=function(){this.A=this.X,this.P=125&this.P|this.ZNCacheTable[this.A]},it.prototype.TYA=function(){this.A=this.Y,this.P=125&this.P|this.ZNCacheTable[this.A]},it.prototype.TXS=function(){this.S=this.X},it.prototype.TAY=function(){this.Y=this.A,this.P=125&this.P|this.ZNCacheTable[this.A]},it.prototype.TAX=function(){this.X=this.A,this.P=125&this.P|this.ZNCacheTable[this.A]},it.prototype.TSX=function(){this.X=this.S,this.P=125&this.P|this.ZNCacheTable[this.X]},it.prototype.PHP=function(){this.Push(48|this.P)},it.prototype.PLP=function(){this.P=this.Pop()},it.prototype.PHA=function(){this.Push(this.A)},it.prototype.PLA=function(){this.A=this.Pop(),this.P=125&this.P|this.ZNCacheTable[this.A]},it.prototype.Adder=function(t){var e=1&this.P,s=this.A+t+e;this.P=60&this.P,this.P|=(~(this.A^t)&(this.A^s)&128)>>>1,this.P|=s>>>8,this.P|=this.ZNCacheTable[255&s],this.A=255&s},it.prototype.ADC=function(t){this.Adder(this.Get(t))},it.prototype.SBC=function(t){this.Adder(255&~this.Get(t))},it.prototype.CMP=function(t){this.P=124&this.P|this.ZNCacheTableCMP[this.A-this.Get(t)&511]},it.prototype.CPX=function(t){this.P=124&this.P|this.ZNCacheTableCMP[this.X-this.Get(t)&511]},it.prototype.CPY=function(t){this.P=124&this.P|this.ZNCacheTableCMP[this.Y-this.Get(t)&511]},it.prototype.AND=function(t){this.A&=this.Get(t),this.P=125&this.P|this.ZNCacheTable[this.A]},it.prototype.EOR=function(t){this.A^=this.Get(t),this.P=125&this.P|this.ZNCacheTable[this.A]},it.prototype.ORA=function(t){this.A|=this.Get(t),this.P=125&this.P|this.ZNCacheTable[this.A]},it.prototype.BIT=function(t){var e=this.Get(t);this.P=61&this.P|2&this.ZNCacheTable[e&this.A]|192&e},it.prototype.ASL_Sub=function(t){return this.P=254&this.P|t>>7,t=t<<1&255,this.P=125&this.P|this.ZNCacheTable[t],t},it.prototype.ASL=function(t){this.Set(t,this.ASL_Sub(this.Get(t)))},it.prototype.LSR_Sub=function(t){return this.P=124&this.P|1&t,t>>=1,this.P|=this.ZNCacheTable[t],t},it.prototype.LSR=function(t){this.Set(t,this.LSR_Sub(this.Get(t)))},it.prototype.ROL_Sub=function(t){var e=t>>7;return t=t<<1&255|1&this.P,this.P=124&this.P|e|this.ZNCacheTable[t],t},it.prototype.ROL=function(t){this.Set(t,this.ROL_Sub(this.Get(t)))},it.prototype.ROR_Sub=function(t){var e=1&t;return t=t>>1|(1&this.P)<<7,this.P=124&this.P|e|this.ZNCacheTable[t],t},it.prototype.ROR=function(t){this.Set(t,this.ROR_Sub(this.Get(t)))},it.prototype.INC=function(t){var e=this.Get(t)+1&255;this.P=125&this.P|this.ZNCacheTable[e],this.Set(t,e)},it.prototype.DEC=function(t){var e=this.Get(t)-1&255;this.P=125&this.P|this.ZNCacheTable[e],this.Set(t,e)},it.prototype.INX=function(){this.X=this.X+1&255,this.P=125&this.P|this.ZNCacheTable[this.X]},it.prototype.INY=function(){this.Y=this.Y+1&255,this.P=125&this.P|this.ZNCacheTable[this.Y]},it.prototype.DEX=function(){this.X=this.X-1&255,this.P=125&this.P|this.ZNCacheTable[this.X]},it.prototype.DEY=function(){this.Y=this.Y-1&255,this.P=125&this.P|this.ZNCacheTable[this.Y]},it.prototype.NOP=function(){},it.prototype.CLC=function(){this.P&=254},it.prototype.CLC=function(){this.P&=251},it.prototype.CLV=function(){this.P&=191},it.prototype.CLD=function(){this.P&=247},it.prototype.SEC=function(){this.P|=1},it.prototype.SEI=function(){this.P|=4},it.prototype.SED=function(){this.P|=8},it.prototype.JMP=function(t){this.PC=t},it.prototype.JSR=function(){var t=this.PC+1&65535;this.Push(t>>8),this.Push(255&t),this.JMP(this.GetAddressAbsolute())},it.prototype.RTS=function(){this.PC=1+(this.Pop()|this.Pop()<<8)},it.prototype.RTI=function(){this.P=this.Pop(),this.PC=this.Pop()|this.Pop()<<8},it.prototype.BCC=function(){this.Branch(0==(1&this.P))},it.prototype.BCS=function(){this.Branch(0!=(1&this.P))},it.prototype.BPL=function(){this.Branch(0==(128&this.P))},it.prototype.BMI=function(){this.Branch(0!=(128&this.P))},it.prototype.BVC=function(){this.Branch(0==(64&this.P))},it.prototype.BVS=function(){this.Branch(0!=(64&this.P))},it.prototype.BNE=function(){this.Branch(0==(2&this.P))},it.prototype.BEQ=function(){this.Branch(0!=(2&this.P))},it.prototype.Branch=function(t){if(t){var e=this.Get(this.PC),s=this.PC+1;this.PC=s+(e>=128?e-256:e)&65535,this.CPUClock+=(256&(s^this.PC))>0?2:1}else this.PC++},it.prototype.ANC=function(t){this.A&=this.Get(t),this.P=125&this.P|this.ZNCacheTable[this.A],this.P=254&this.P|this.A>>>7},it.prototype.ANE=function(t){this.A=(238|this.A)&this.X&this.Get(t),this.P=125&this.P|this.ZNCacheTable[this.A]},it.prototype.ARR=function(t){this.A&=this.Get(t),this.A=this.A>>1|(1&this.P)<<7,this.P=125&this.P|this.ZNCacheTable[this.A],this.P=254&this.P|(64&this.A)>>6;var e=64&(this.A^this.A<<1);this.P=191&this.P|e},it.prototype.ASR=function(t){this.A&=this.Get(t),this.P=254&this.P|1&this.A,this.A=this.A>>1,this.P=125&this.P|this.ZNCacheTable[this.A]},it.prototype.DCP=function(t){var e=this.Get(t)-1&255;this.P=124&this.P|this.ZNCacheTableCMP[this.A-e&511],this.Set(t,e)},it.prototype.ISB=function(t){var e=this.Get(t)+1&255;this.Adder(255&~e),this.Set(t,e)},it.prototype.LAS=function(t){var e=this.Get(t)&this.S;this.A=this.X=this.S=e,this.P=125&this.P|this.ZNCacheTable[this.A]},it.prototype.LAX=function(t){this.A=this.X=this.Get(t),this.P=125&this.P|this.ZNCacheTable[this.A]},it.prototype.LXA=function(t){var e=(238|this.A)&this.Get(t);this.A=this.X=e,this.P=125&this.P|this.ZNCacheTable[this.A]},it.prototype.RLA=function(t){var e=this.Get(t);e=e<<1|1&this.P,this.P=254&this.P|e>>8,this.A&=e,this.P=125&this.P|this.ZNCacheTable[this.A],this.Set(t,e)},it.prototype.RRA=function(t){var e=this.Get(t),s=1&e;e=e>>1|(1&this.P)<<7,this.P=254&this.P|s,this.Adder(e),this.Set(t,e)},it.prototype.SAX=function(t){var e=this.A&this.X;this.Set(t,e)},it.prototype.SBX=function(t){var e=(this.A&this.X)-this.Get(t);this.P=254&this.P|~e>>8&1,this.X=255&e,this.P=125&this.P|this.ZNCacheTable[this.X]},it.prototype.SHA=function(t){var e=this.A&this.X&1+(t>>8);this.Set(t,e)},it.prototype.SHS=function(t){this.S=this.A&this.X;var e=this.S&1+(t>>8);this.Set(t,e)},it.prototype.SHX=function(t){var e=this.X&1+(t>>8);this.Set(t,e)},it.prototype.SHY=function(t){var e=this.Y&1+(t>>8);this.Set(t,e)},it.prototype.SLO=function(t){var e=this.Get(t);this.P=254&this.P|e>>7,e=e<<1&255,this.A|=e,this.P=125&this.P|this.ZNCacheTable[this.A],this.Set(t,e)},it.prototype.SRE=function(t){var e=this.Get(t);this.P=254&this.P|1&e,e>>=1,this.A^=e,this.P=125&this.P|this.ZNCacheTable[this.A],this.Set(t,e)},it.prototype.PpuInit=function(){var t;for(this.ScrollRegisterFlag=!1,this.PPUAddressRegisterFlag=!1,this.HScrollTmp=0,this.PPUAddress=0,this.PPUAddressBuffer=0,this.Palette=new Array(33),t=0;t<this.Palette.length;t++)this.Palette[t]=15;for(this.SpriteLineBuffer=new Array(256),t=0;t<this.SpriteLineBuffer.length;t++)this.SpriteLineBuffer[t]=0;this.PPUReadBuffer=0,this.FourScreen?this.SetMirrors(0,1,2,3):this.SetMirror(this.HMirror),this.BgLineBuffer=new Array(264),this.PpuX=341,this.PpuY=0,this.Sprite0Line=!1},it.prototype.SetMirror=function(t){t?this.SetMirrors(0,0,1,1):this.SetMirrors(0,1,0,1)},it.prototype.SetMirrors=function(t,e,s,i){this.SetChrRomPage1K(8,t+8+256),this.SetChrRomPage1K(9,e+8+256),this.SetChrRomPage1K(10,s+8+256),this.SetChrRomPage1K(11,i+8+256)},it.prototype.SetChrRomPage1K=function(t,e){e>=256?(this.CHRROM_STATE[t]=e,this.VRAM[t]=this.VRAMS[255&e]):this.ChrRomPageCount>0&&(this.CHRROM_STATE[t]=e%(8*this.ChrRomPageCount),this.VRAM[t]=this.CHRROM_PAGES[this.CHRROM_STATE[t]])},it.prototype.SetChrRomPages1K=function(t,e,s,i,h,r,P,R){this.SetChrRomPage1K(0,t),this.SetChrRomPage1K(1,e),this.SetChrRomPage1K(2,s),this.SetChrRomPage1K(3,i),this.SetChrRomPage1K(4,h),this.SetChrRomPage1K(5,r),this.SetChrRomPage1K(6,P),this.SetChrRomPage1K(7,R)},it.prototype.SetChrRomPage=function(t){t<<=3;for(var e=0;e<8;e++)this.SetChrRomPage1K(e,t+e)},it.prototype.initCanvas=function(){if(!this.ctx)return!1;this.ImageData=this.ctx.createImageData(256,224);for(var t=0;t<229376;t+=4)this.ImageData.data[t+3]=255;return this.ctx.putImageData(this.ImageData,0,0),!0},it.prototype.PpuRun=function(){var t=this.PpuX;for(this.PpuX+=3*this.CPUClock;this.PpuX>=341;){var e,s,i,h=8==(8&this.IO1[1]),r=16==(16&this.IO1[1]);if(this.PpuX-=341,t=0,this.Sprite0Line=!1,this.PpuY++,262===this.PpuY&&(this.PpuY=0,(h||r)&&(this.PPUAddress=this.PPUAddressBuffer),this.IO1[2]&=127),this.Mapper.HSync(this.PpuY),240!==this.PpuY){if(this.PpuY<240)if(h||r){if(this.PPUAddress=64480&this.PPUAddress|1055&this.PPUAddressBuffer,8<=this.PpuY&&this.PpuY<232)for(this.BuildBGLine(),this.BuildSpriteLine(),s=this.PpuY-8<<10,e=0;e<256;e++,s+=4)i=this.PaletteTable[this.Palette[this.BgLineBuffer[e]]],this.ImageData.data[s]=i[0],this.ImageData.data[s+1]=i[1],this.ImageData.data[s+2]=i[2];else{for(e=0;e<264;e++)this.BgLineBuffer[e]=16;this.BuildSpriteLine()}28672==(28672&this.PPUAddress)?(this.PPUAddress&=36863,928==(992&this.PPUAddress)?this.PPUAddress=64543&(2048^this.PPUAddress):992==(992&this.PPUAddress)?this.PPUAddress&=64543:this.PPUAddress+=32):this.PPUAddress+=4096}else if(8<=this.PpuY&&this.PpuY<232)for(s=this.PpuY-8<<10,i=this.PaletteTable[this.Palette[16]],e=0;e<256;e++,s+=4)this.ImageData.data[s]=i[0],this.ImageData.data[s+1]=i[1],this.ImageData.data[s+2]=i[2]}else this.ctx.putImageData(this.ImageData,0,0),this.DrawFlag=!0,this.ScrollRegisterFlag=!1,this.IO1[2]&=31,this.IO1[2]|=128,this.toNMI=128==(128&this.IO1[0])}if(this.Sprite0Line&&64!=(64&this.IO1[2]))for(var P=this.PpuX>255?255:this.PpuX;t<=P;t++)if(0===this.SpriteLineBuffer[t]){this.IO1[2]|=64;break}},it.prototype.BuildBGLine=function(){var t,e=this.BgLineBuffer;if(8==(8&this.IO1[1])){if(this.Mapper.BuildBGLine(),2!=(2&this.IO1[1]))for(t=0;t<8;t++)e[t]=16}else for(t=0;t<264;t++)e[t]=16},it.prototype.BuildBGLine_SUB=function(){for(var t=this.BgLineBuffer,e=this.VRAM,s=8192|4095&this.PPUAddress,i=(28672&this.PPUAddress)>>12|(16&this.IO1[0])<<8,h=s>>10,r=1023&s,P=e[h],R=this.PaletteArray,a=this.SPBitArray,o=0,n=this.HScrollTmp,E=0;E<33;E++){var A=P[r]<<4|i,_=e[A>>10];A&=1023;for(var M=P[(896&r)>>4|960+((28&r)>>2)]<<2>>((64&r)>>4|2&r)&12,c=a[_[A]][_[A+8]];n<8;n++,o++)t[o]=R[c[n]|M];n=0,31==(31&r)?(r&=65504,P=e[h^=1]):r++}},it.prototype.BuildSpriteLine=function(){this.Mapper.BuildSpriteLine()},it.prototype.BuildSpriteLine_SUB=function(){var t=this.BgLineBuffer,e=4==(4&this.IO1[1])?0:8;if(16==(16&this.IO1[1])){for(var s=this.SpriteLineBuffer,i=0;i<256;i++)s[i]=256;for(var h=this.SPRITE_RAM,r=32==(32&this.IO1[0])?16:8,P=(8&this.IO1[0])<<9,R=this.VRAM,a=this.SPBitArray,o=this.PpuY,n=0,E=0;E<=252;E+=4){var A=h[E]+1;if(!(A>o||A+r<=o)){if(0===E&&(this.Sprite0Line=!0),9==++n)break;var _=h[E+3],M=_+8;M>256&&(M=256);var c,G,p=h[E+2],C=(3&p)<<2|16,S=0==(32&p),u=128==(128&p)?r-1-(o-A):o-A,g=((8&u)<<1)+(7&u)+(8===r?(h[E+1]<<4)+P:((254&h[E+1])<<4)+((1&h[E+1])<<12)),d=R[g>>10],m=1023&g,b=a[d[m]][d[m+8]];for(0==(64&p)?(c=0,G=1):(c=7,G=-1);_<M;_++,c+=G){var f=b[c];0!==f&&256===s[_]&&(s[_]=E,_>=e&&(S||16===t[_])&&(t[_]=f|C))}}}n>=8?this.IO1[2]|=32:this.IO1[2]&=223}},it.prototype.WriteScrollRegister=function(t){this.IO1[5]=t,this.ScrollRegisterFlag?this.PPUAddressBuffer=35871&this.PPUAddressBuffer|(248&t)<<2|(7&t)<<12:(this.PPUAddressBuffer=65504&this.PPUAddressBuffer|(248&t)>>3,this.HScrollTmp=7&t),this.ScrollRegisterFlag=!this.ScrollRegisterFlag},it.prototype.WritePPUControlRegister0=function(t){this.IO1[0]=t,this.PPUAddressBuffer=62463&this.PPUAddressBuffer|(3&t)<<10},it.prototype.WritePPUControlRegister1=function(t){this.IO1[1]=t},it.prototype.WritePPUAddressRegister=function(t){this.IO1[6]=t,this.PPUAddressRegisterFlag?this.PPUAddress=this.PPUAddressBuffer=65280&this.PPUAddressBuffer|t:this.PPUAddressBuffer=255&this.PPUAddressBuffer|(63&t)<<8,this.PPUAddressRegisterFlag=!this.PPUAddressRegisterFlag},it.prototype.ReadPPUStatus=function(){var t=this.IO1[2];return this.IO1[2]&=31,this.ScrollRegisterFlag=!1,this.PPUAddressRegisterFlag=!1,t},it.prototype.ReadPPUData=function(){return this.Mapper.ReadPPUData()},it.prototype.ReadPPUData_SUB=function(){var t=this.PPUReadBuffer,e=16383&this.PPUAddress;return this.PPUReadBuffer=this.VRAM[e>>10][1023&e],this.PPUAddress=this.PPUAddress+(4==(4&this.IO1[0])?32:1)&65535,t},it.prototype.WritePPUData=function(t){this.Mapper.WritePPUData(t)},it.prototype.WritePPUData_SUB=function(t){this.IO1[7]=t;var e=16383&this.PPUAddress;if(this.VRAM[e>>10][1023&e]=t,e<12288)this.PPUAddress=this.PPUAddress+(4==(4&this.IO1[0])?32:1)&65535;else{if(e<16127)return this.VRAM[e-4096>>10][e-4096&1023]=t,void(this.PPUAddress=this.PPUAddress+(4==(4&this.IO1[0])?32:1)&65535);var s=31&e;0===s||16===s?this.Palette[0]=this.Palette[16]=63&t:this.Palette[s]=63&t,this.PPUAddress=this.PPUAddress+(4==(4&this.IO1[0])?32:1)&65535}},it.prototype.WriteSpriteData=function(t){this.SPRITE_RAM[this.IO1[3]]=t,this.IO1[3]=this.IO1[3]+1&255},it.prototype.WriteSpriteAddressRegister=function(t){this.IO1[3]=t},it.prototype.StartDMA=function(t){for(var e=t<<8,s=this.SPRITE_RAM,i=this.RAM,h=0;h<256;h++,e++)s[h]=i[e];this.CPUClock+=514},it.prototype.StorageClear=function(){var t,e;for(t=0;t<this.RAM.length;t++)this.RAM[t]=0;for(t=0;t<this.SRAM.length;t++)this.SRAM[t]=0;for(t=0;t<this.PRGROM_STATE.length;t++)this.PRGROM_STATE[t]=0;for(t=0;t<this.CHRROM_STATE.length;t++)this.CHRROM_STATE[t]=0;for(t=0;t<this.VRAMS.length;t++){for(e=0;e<this.VRAMS[t].length;e++)this.VRAMS[t][e]=0;this.SetChrRomPage1K(t,t+256)}for(t=0;t<this.SPRITE_RAM.length;t++)this.SPRITE_RAM[t]=0;for(t=0;t<4;t++)this.SetPrgRomPage8K(t,-(t+1));for(t=0;t<this.IO1.length;t++)this.IO1[t]=0;for(t=0;t<this.IO2.length;t++)this.IO2[t]=0;this.IO2[23]=64},it.prototype.SetRom=function(t){if(!(t instanceof ArrayBuffer))return!1;for(var e=new Uint8Array(t),s=[],i=0;i<e.length;i++)s.push(e[i]);return 78===s[0]&&69===s[1]&&83===s[2]&&26===s[3]&&(this.Rom=s.concat(0),!0)},it.prototype.StorageInit=function(){this.PRGROM_PAGES=null,this.CHRROM_PAGES=null;var t;if(this.PrgRomPageCount>0)for(this.PRGROM_PAGES=new Array(2*this.PrgRomPageCount),t=0;t<2*this.PrgRomPageCount;t++){var e=16+8192*t;this.PRGROM_PAGES[t]=this.Rom.slice(e,e+8192)}if(this.ChrRomPageCount>0)for(this.CHRROM_PAGES=new Array(8*this.ChrRomPageCount),t=0;t<8*this.ChrRomPageCount;t++){var s=16+16384*this.PrgRomPageCount+1024*t;this.CHRROM_PAGES[t]=this.Rom.slice(s,s+4096)}},it.prototype.Get=function(t){switch(57344&t){case 0:return this.RAM[2047&t];case 8192:switch(7&t){case 0:case 1:case 2:return this.ReadPPUStatus();case 3:case 4:case 5:case 6:case 7:return this.ReadPPUData()}return 0;case 16384:if(t>=16416)return this.Mapper.ReadLow(t);switch(t){case 16384:case 16385:case 16386:case 16387:case 16388:case 16389:case 16390:case 16391:case 16392:case 16393:case 16394:case 16395:case 16396:case 16397:case 16398:case 16399:case 16400:case 16401:case 16402:case 16403:case 16404:case 16405:return this.ReadWaveControl();case 16406:return this.ReadJoyPadRegister1();case 16407:return this.ReadJoyPadRegister2()}return 64;case 24576:return this.Mapper.ReadSRAM(t);case 32768:return this.ROM[0][8191&t];case 40960:return this.ROM[1][8191&t];case 49152:return this.ROM[2][8191&t];case 57344:return this.ROM[3][8191&t]}},it.prototype.Get16=function(t){return this.Get(t)|this.Get(t+1)<<8},it.prototype.Set=function(t,e){switch(57344&t){case 0:return void(this.RAM[2047&t]=e);case 8192:switch(7&t){case 0:return void this.WritePPUControlRegister0(e);case 1:return void this.WritePPUControlRegister1(e);case 2:return;case 3:return void this.WriteSpriteAddressRegister(e);case 4:return void this.WriteSpriteData(e);case 5:return void this.WriteScrollRegister(e);case 6:return void this.WritePPUAddressRegister(e);case 7:return void this.WritePPUData(e)}return;case 16384:if(t<16416){switch(this.IO2[255&t]=e,t){case 16384:case 16385:case 16386:return void this.WriteCh1Length0();case 16387:return void this.WriteCh1Length1();case 16388:case 16389:case 16390:return void this.WriteCh2Length0();case 16391:return void this.WriteCh2Length1();case 16392:return void this.WriteCh3LinearCounter();case 16393:case 16400:case 16394:case 16395:return void this.WriteCh3Length1();case 16396:case 16397:case 16398:case 16399:return void this.WriteCh4Length1();case 16400:return void this.WriteCh5DeltaControl();case 16401:return void this.WriteCh5DeltaCounter();case 16402:case 16403:case 16404:return void this.StartDMA(e);case 16405:return void this.WriteWaveControl();case 16406:return void this.WriteJoyPadRegister1(e);case 16407:return}return}return void this.Mapper.WriteLow(t,e);case 24576:return void this.Mapper.WriteSRAM(t,e);case 32768:case 40960:case 49152:case 57344:return void this.Mapper.Write(t,e)}},it.prototype.SetPrgRomPage8K=function(t,e){e<0?(this.PRGROM_STATE[t]=e,this.ROM[t]=this.ZEROS_ROM_PAGE):(this.PRGROM_STATE[t]=e%(2*this.PrgRomPageCount),this.ROM[t]=this.PRGROM_PAGES[this.PRGROM_STATE[t]])},it.prototype.SetPrgRomPages8K=function(t,e,s,i){this.SetPrgRomPage8K(0,t),this.SetPrgRomPage8K(1,e),this.SetPrgRomPage8K(2,s),this.SetPrgRomPage8K(3,i)},it.prototype.SetPrgRomPage=function(t,e){this.SetPrgRomPage8K(2*t,2*e),this.SetPrgRomPage8K(2*t+1,2*e+1)},it.prototype.WriteJoyPadRegister1=function(t){var e=1==(1&t);this.JoyPadStrobe&&!e&&(this.JoyPadBuffer[0]=this.JoyPadState[0],this.JoyPadBuffer[1]=this.JoyPadState[1]),this.JoyPadStrobe=e},it.prototype.ReadJoyPadRegister1=function(){var t=1&this.JoyPadBuffer[0];return this.JoyPadBuffer[0]>>>=1,t},it.prototype.ReadJoyPadRegister2=function(){var t=1&this.JoyPadBuffer[1];return this.JoyPadBuffer[1]>>>=1,t},it.prototype._keyCodeToBitCode=function(t){var e={player:null,flag:null};switch(t){case 88:e.player=this.JOYPAD_1P,e.flag=this.BUTTON_A;break;case 90:e.player=this.JOYPAD_1P,e.flag=this.BUTTON_B;break;case 65:e.player=this.JOYPAD_1P,e.flag=this.BUTTON_SELECT;break;case 83:e.player=this.JOYPAD_1P,e.flag=this.BUTTON_START;break;case 38:e.player=this.JOYPAD_1P,e.flag=this.BUTTON_UP;break;case 40:e.player=this.JOYPAD_1P,e.flag=this.BUTTON_DOWN;break;case 37:e.player=this.JOYPAD_1P,e.flag=this.BUTTON_LEFT;break;case 39:e.player=this.JOYPAD_1P,e.flag=this.BUTTON_RIGHT;break;case 105:e.player=this.JOYPAD_2P,e.flag=this.BUTTON_A;break;case 103:e.player=this.JOYPAD_2P,e.flag=this.BUTTON_B;break;case 104:e.player=this.JOYPAD_2P,e.flag=this.BUTTON_UP;break;case 98:e.player=this.JOYPAD_2P,e.flag=this.BUTTON_DOWN;break;case 100:e.player=this.JOYPAD_2P,e.flag=this.BUTTON_LEFT;break;case 102:e.player=this.JOYPAD_2P,e.flag=this.BUTTON_RIGHT}return e},it.prototype.handleKeyUp=function(t){var e=this._keyCodeToBitCode(t.keyCode),s=e.player,i=e.flag;null!==s&&(this.JoyPadState[s]&=~i),t.preventDefault()},it.prototype.handleKeyDown=function(t){var e=this._keyCodeToBitCode(t.keyCode),s=e.player,i=e.flag;null!==s&&(this.JoyPadState[s]|=i),t.preventDefault()},it.prototype.WebAudioFunction=function(t){var e,s,i=t.outputBuffer.getChannelData(0);if(0===this.WaveDatas.length)for(s=new Float32Array(this.WebAudioBufferSize),e=0;e<this.WebAudioBufferSize;e++)s[e]=0;else{var h=this.WaveDatas.length>this.WebAudioBufferSize?this.WebAudioBufferSize:this.WaveDatas.length;for(s=new Float32Array(h),e=0;e<h;e++)s[e]=this.WaveDatas[e]/2048;this.WaveDatas=this.WaveDatas.slice(h),this.WaveDatas.length>=2*this.WebAudioBufferSize&&(this.WaveDatas=this.WaveDatas.slice(2*this.WebAudioBufferSize))}i.set(s)},it.prototype.ReadWaveControl=function(){var t=0;return 0!==this.WaveCh1LengthCounter&&(t|=1),0!==this.WaveCh2LengthCounter&&(t|=2),0!==this.WaveCh3LengthCounter&&(t|=4),0!==this.WaveCh4LengthCounter&&(t|=8),0!==this.WaveCh5SampleCounter&&(t|=16),t|=192&this.toIRQ,this.toIRQ&=-65,t},it.prototype.WriteWaveControl=function(){var t=this.IO2[21];1!=(1&t)&&(this.WaveCh1LengthCounter=0),2!=(2&t)&&(this.WaveCh2LengthCounter=0),4!=(4&t)&&(this.WaveCh3LengthCounter=0),8!=(8&t)&&(this.WaveCh4LengthCounter=0),16!=(16&t)?(this.WaveCh5SampleCounter=0,this.toIRQ&=-129):0===this.WaveCh5SampleCounter&&this.SetCh5Delta()},it.prototype.WriteCh1Length0=function(){this.WaveCh1Frequency=((7&this.IO2[3])<<8)+this.IO2[2]+1},it.prototype.WriteCh1Length1=function(){this.WaveCh1LengthCounter=this.WaveLengthCount[this.IO2[3]>>3],this.WaveCh1Envelope=0,this.WaveCh1EnvelopeCounter=15,this.WaveCh1Sweep=0,this.WaveCh1Frequency=((7&this.IO2[3])<<8)+this.IO2[2]+1},it.prototype.WriteCh2Length0=function(){this.WaveCh2Frequency=((7&this.IO2[7])<<8)+this.IO2[6]+1},it.prototype.WriteCh2Length1=function(){this.WaveCh2LengthCounter=this.WaveLengthCount[this.IO2[7]>>3],this.WaveCh2Envelope=0,this.WaveCh2EnvelopeCounter=15,this.WaveCh2Sweep=0,this.WaveCh2Frequency=((7&this.IO2[7])<<8)+this.IO2[6]+1},it.prototype.WriteCh3LinearCounter=function(){this.WaveCh3LinearCounter=127&this.IO2[8]},it.prototype.WriteCh3Length1=function(){this.WaveCh3LengthCounter=this.WaveLengthCount[this.IO2[11]>>3],this.WaveCh3LinearCounter=127&this.IO2[8]},it.prototype.WriteCh4Length1=function(){this.WaveCh4LengthCounter=this.WaveLengthCount[this.IO2[15]>>3],this.WaveCh4Envelope=0,this.WaveCh4EnvelopeCounter=15},it.prototype.WriteCh5DeltaControl=function(){128!=(128&this.IO2[16])&&(this.toIRQ&=-129)},it.prototype.WriteCh5DeltaCounter=function(){this.WaveCh5DeltaCounter=127&this.IO2[17]},it.prototype.SetCh5Delta=function(){var t=this.IO2;this.WaveCh5DeltaCounter=127&t[17],this.WaveCh5SampleAddress=t[18]<<6,this.WaveCh5SampleCounter=1+(t[19]<<4)<<3,this.WaveCh5Register=0,this.WaveCh5Angle=-1,this.toIRQ&=-129},it.prototype.ApuInit=function(){this.WaveFrameSequence=0,this.WaveCh1LengthCounter=0,this.WaveCh1Envelope=0,this.WaveCh1EnvelopeCounter=0,this.WaveCh1Sweep=0,this.WaveCh1Frequency=0,this.WaveCh2LengthCounter=0,this.WaveCh2Envelope=0,this.WaveCh2EnvelopeCounter=0,this.WaveCh2Sweep=0,this.WaveCh2Frequency=0,this.WaveCh3LengthCounter=0,this.WaveCh3LinearCounter=0,this.WaveCh4LengthCounter=0,this.WaveCh4Envelope=0,this.WaveCh4EnvelopeCounter=0,this.WaveCh4Register=1,this.WaveCh4BitSequence=0,this.WaveCh5DeltaCounter=0,this.WaveCh5Register=0,this.WaveCh5SampleAddress=0,this.WaveCh5SampleCounter=0,this.WaveCh5Angle=-1,this.ApuClockCounter=0,this.WaveFrameSequenceCounter=0,this.WaveDatas=[],this.ApuCpuClockCounter=0,this.EXSoundInit()},it.prototype.Out_Apu=function(){var t=0,e=this.WaveBaseCount,s=e<<1,i=this.IO2;0!==this.WaveCh1LengthCounter&&this.WaveCh1Frequency>3&&(t+=(16==(16&i[0])?15&i[0]:this.WaveCh1EnvelopeCounter)*((s/this.WaveCh1Frequency&31)<this.WaveCh1_2DutyData[(192&i[0])>>6]?1:-1)),0!==this.WaveCh2LengthCounter&&this.WaveCh2Frequency>3&&(t+=(16==(16&i[4])?15&i[4]:this.WaveCh2EnvelopeCounter)*((s/this.WaveCh2Frequency&31)<this.WaveCh1_2DutyData[(192&i[4])>>6]?1:-1));var h=((7&i[11])<<8)+i[10]+1;0!==this.WaveCh3LengthCounter&&0!==this.WaveCh3LinearCounter&&h>3&&(t+=this.WaveCh3SequenceData[e/h&31]);var r=s/this.WaveCh4FrequencyData[15&i[14]]|0;if(r!==this.WaveCh4Angle&&(this.WaveCh4Register=128==(128&i[14])?this.WaveCh4Register>>1|(64&this.WaveCh4Register)<<8^(1&this.WaveCh4Register)<<14:this.WaveCh4Register>>1|(2&this.WaveCh4Register)<<13^(1&this.WaveCh4Register)<<14,this.WaveCh4Angle=r),0!==this.WaveCh4LengthCounter&&0==(1&this.WaveCh4Register)&&(t+=16==(16&i[12])?15&i[12]:this.WaveCh4EnvelopeCounter),0!==this.WaveCh5SampleCounter){if(r=e/this.WaveCh5FrequencyData[15&i[16]]&31,this.WaveCh5Angle!==r){var P=this.WaveCh5Angle,R=0;for(-1!==P&&(R=r)<P&&(R+=32),this.WaveCh5Angle=r;P<R;P++)0==(7&this.WaveCh5SampleCounter)&&0!==this.WaveCh5SampleCounter&&(this.WaveCh5Register=this.ROM[2+(this.WaveCh5SampleAddress>>13)][8191&this.WaveCh5SampleAddress],this.WaveCh5SampleAddress++,this.CPUClock+=4),0!==this.WaveCh5SampleCounter&&(0==(1&this.WaveCh5Register)?this.WaveCh5DeltaCounter>1&&(this.WaveCh5DeltaCounter-=2):this.WaveCh5DeltaCounter<126&&(this.WaveCh5DeltaCounter+=2),this.WaveCh5Register>>=1,this.WaveCh5SampleCounter--)}0===this.WaveCh5SampleCounter&&(64==(64&i[16])?this.SetCh5Delta():this.toIRQ|=128&i[16])}return t+this.WaveCh5DeltaCounter<<5},it.prototype.WaveFrameSequencer=function(t){this.WaveFrameSequenceCounter+=240*t,this.WaveFrameSequenceCounter>=this.MainClock&&(this.WaveFrameSequenceCounter-=this.MainClock,0==(128&this.IO2[23])?(this.WaveCh1_2_4_Envelope_WaveCh3_Linear(),1!==this.WaveFrameSequence&&3!==this.WaveFrameSequence||this.WaveCh1_2_3_4_Length_WaveCh1_2_Sweep(),3===this.WaveFrameSequence&&0==(64&this.IO2[23])&&(this.toIRQ|=64),this.WaveFrameSequence=3&++this.WaveFrameSequence):(4!==this.WaveFrameSequence&&this.WaveCh1_2_4_Envelope_WaveCh3_Linear(),0!==this.WaveFrameSequence&&2!==this.WaveFrameSequence||this.WaveCh1_2_3_4_Length_WaveCh1_2_Sweep(),this.WaveFrameSequence=++this.WaveFrameSequence%5))},it.prototype.ApuRun=function(){for(this.WaveBaseCount=(this.WaveBaseCount+this.CPUClock)%this.MainClock,this.WaveFrameSequencer(this.CPUClock),this.Mapper.EXSoundSync(this.CPUClock),this.ApuClockCounter+=this.WaveSampleRate*this.CPUClock;this.ApuClockCounter>=this.MainClock;)this.ApuClockCounter-=this.MainClock,this.canAudioContext&&this.WaveOut&&(this.WaveDatas.push(this.Mapper.OutEXSound(this.Out_Apu())),this.WebAudioGainNode.gain.value=this.WaveVolume)},it.prototype.WaveCh1_2_3_4_Length_WaveCh1_2_Sweep=function(){var t=this.IO2;0==(32&t[0])&&0!==this.WaveCh1LengthCounter&&0==--this.WaveCh1LengthCounter&&(t[21]&=254),0==(32&t[4])&&0!==this.WaveCh2LengthCounter&&0==--this.WaveCh2LengthCounter&&(t[21]&=253),0==(128&t[8])&&0!==this.WaveCh3LengthCounter&&0==--this.WaveCh3LengthCounter&&(t[21]&=251),0==(32&t[12])&&0!==this.WaveCh4LengthCounter&&0==--this.WaveCh4LengthCounter&&(t[21]&=247),++this.WaveCh1Sweep==1+((112&t[1])>>4)&&(this.WaveCh1Sweep=0,128==(128&t[1])&&0!=(7&t[1])&&0!==this.WaveCh1LengthCounter&&(0==(8&t[1])?this.WaveCh1Frequency+=this.WaveCh1Frequency>>(7&t[1]):this.WaveCh1Frequency-=this.WaveCh1Frequency>>(7&t[1]),(this.WaveCh1Frequency<8||this.WaveCh1Frequency>2047)&&(this.WaveCh1LengthCounter=0,t[21]&=254))),++this.WaveCh2Sweep==1+((112&t[5])>>4)&&(this.WaveCh2Sweep=0,128==(128&t[5])&&0!=(7&t[5])&&0!==this.WaveCh2LengthCounter&&(0==(8&t[5])?this.WaveCh2Frequency+=this.WaveCh2Frequency>>(7&t[5]):this.WaveCh2Frequency-=this.WaveCh2Frequency>>(7&t[5]),(this.WaveCh2Frequency<8||this.WaveCh2Frequency>2047)&&(this.WaveCh2LengthCounter=0,t[21]&=253)))},it.prototype.WaveCh1_2_4_Envelope_WaveCh3_Linear=function(){var t=this.IO2;0==(16&t[0])&&++this.WaveCh1Envelope==1+(15&t[0])&&(this.WaveCh1Envelope=0,0===this.WaveCh1EnvelopeCounter?32==(32&t[0])&&(this.WaveCh1EnvelopeCounter=15):this.WaveCh1EnvelopeCounter--),0==(16&t[4])&&++this.WaveCh2Envelope==1+(15&t[4])&&(this.WaveCh2Envelope=0,0===this.WaveCh2EnvelopeCounter?32==(32&t[4])&&(this.WaveCh2EnvelopeCounter=15):this.WaveCh2EnvelopeCounter--),0==(16&t[12])&&++this.WaveCh4Envelope==1+(15&t[12])&&(this.WaveCh4Envelope=0,0===this.WaveCh4EnvelopeCounter?32==(32&t[12])&&(this.WaveCh4EnvelopeCounter=15):this.WaveCh4EnvelopeCounter--),0==(128&t[8])&&0!==this.WaveCh3LinearCounter&&this.WaveCh3LinearCounter--},it.prototype.EXSoundInit=function(){this.Init_FDS(),this.Init_MMC5(),this.Init_VRC6(),this.Init_N163(),this.Init_AY()},it.prototype.Init_FDS=function(){var t;for(t=0;t<this.FDS_WAVE_REG.length;t++)this.FDS_WAVE_REG[t]=0;for(t=0;t<this.FDS_LFO_REG.length;t++)this.FDS_LFO_REG[t]=0;for(t=0;t<this.FDS_REG.length;t++)this.FDS_REG[t]=0;this.FDS_WaveIndexCounter=0,this.FDS_WaveIndex=0,this.FDS_LFOIndexCounter=0,this.FDS_LFOIndex=0,this.FDS_REGAddress=0,this.FDS_VolumeEnvCounter=0,this.FDS_VolumeEnv=0,this.FDS_SweepEnvCounter=0,this.FDS_SweepEnv=0,this.FDS_SweepBias=0,this.FDS_Volume=0},it.prototype.Write_FDS_WAVE_REG=function(t,e){128==(128&this.FDS_REG[9])&&(this.FDS_WAVE_REG[t]=63&e)},it.prototype.Write_FDS_REG=function(t,e){switch(this.FDS_REG[t]=e,t){case 0:128==(128&e)&&(this.FDS_VolumeEnv=63&e),this.FDS_VolumeEnvCounter=0;break;case 3:128==(128&e)&&(this.FDS_WaveIndex=0);break;case 4:128==(128&e)&&(this.FDS_SweepEnv=63&e),this.FDS_SweepEnvCounter=0;break;case 5:this.FDS_SweepBias=127&e,this.FDS_SweepBias>=64&&(this.FDS_SweepBias=this.FDS_SweepBias-128),this.FDS_REGAddress=0;break;case 7:this.FDS_LFOIndexCounter=0,this.FDS_LFOIndex=0;break;case 8:128==(128&this.FDS_REG[7])&&(this.FDS_LFO_REG[this.FDS_REGAddress]=7&e,this.FDS_REGAddress=this.FDS_REGAddress+1&31)}},it.prototype.Count_FDS=function(t){if(64!=(64&this.FDS_REG[3])){var e;if((192&this.FDS_REG[0])<128&&(e=this.FDS_REG[10]*(1+(63&this.FDS_REG[0]))*8)>0)for(this.FDS_VolumeEnvCounter+=t;this.FDS_VolumeEnvCounter>=e;)this.FDS_VolumeEnvCounter-=e,0==(64&this.FDS_REG[0])?this.FDS_VolumeEnv>0&&this.FDS_VolumeEnv--:this.FDS_VolumeEnv<32&&this.FDS_VolumeEnv++;if((192&this.FDS_REG[4])<128&&(e=this.FDS_REG[10]*(1+(63&this.FDS_REG[4]))*8)>0)for(this.FDS_SweepEnvCounter+=t;this.FDS_SweepEnvCounter>=e;)this.FDS_SweepEnvCounter-=e,0==(64&this.FDS_REG[4])?this.FDS_SweepEnv>0&&this.FDS_SweepEnv--:this.FDS_SweepEnv<63&&this.FDS_SweepEnv++}var s;if(128!=(128&this.FDS_REG[7]))for(s=this.FDS_REG[6]|(15&this.FDS_REG[7])<<8,this.FDS_LFOIndexCounter+=s*t;this.FDS_LFOIndexCounter>=65536;){this.FDS_LFOIndexCounter-=65536;var i=this.FDS_LFO_REG[this.FDS_LFOIndex>>1];this.FDS_SweepBias+=this.FDS_LFO_DATA[i],4===i&&(this.FDS_SweepBias=0),this.FDS_SweepBias>63?this.FDS_SweepBias-=128:this.FDS_SweepBias<-64&&(this.FDS_SweepBias+=128),this.FDS_LFOIndex+=1,this.FDS_LFOIndex>63&&(this.FDS_LFOIndex=0)}var h=this.FDS_SweepBias*this.FDS_SweepEnv,r=15&h;h>>=4,r>0&&(this.FDS_SweepBias<0?h-=1:h+=2),h>=192?h-=256:h<-64&&(h+=256),h*=s=this.FDS_REG[2]|(15&this.FDS_REG[3])<<8,s+=h>>=6,this.FDS_WaveIndexCounter+=s*t,this.FDS_WaveIndex+=this.FDS_WaveIndexCounter>>16,this.FDS_WaveIndexCounter&=65535,this.FDS_WaveIndex>63&&(this.FDS_WaveIndex&=63,this.FDS_Volume=this.FDS_VolumeEnv)},it.prototype.Out_FDS=function(){return 128!=(128&this.FDS_REG[3])?(this.FDS_WAVE_REG[this.FDS_WaveIndex]-32)*this.FDS_Volume>>1:0},it.prototype.Init_MMC5=function(){this.MMC5_FrameSequenceCounter=0,this.MMC5_FrameSequence=0;for(var t=0;t<this.MMC5_REG.length;t++)this.MMC5_REG[t]=0;this.MMC5_Ch[0]={LengthCounter:0,Envelope:0,EnvelopeCounter:0,Sweep:0,Frequency:0},this.MMC5_Ch[1]={LengthCounter:0,Envelope:0,EnvelopeCounter:0,Sweep:0,Frequency:0}},it.prototype.Write_MMC5_ChLength0=function(t){var e=t<<2;this.MMC5_Ch[t].Frequency=((7&this.MMC5_REG[e+3])<<8)+this.MMC5_REG[e+2]+1},it.prototype.Write_MMC5_ChLength1=function(t){var e=t<<2;this.MMC5_Ch[t].LengthCounter=this.WaveLengthCount[this.MMC5_REG[e+3]>>3],this.MMC5_Ch[t].Envelope=0,this.MMC5_Ch[t].EnvelopeCounter=15,this.MMC5_Ch[t].Sweep=0,this.MMC5_Ch[t].Frequency=((7&this.MMC5_REG[e+3])<<8)+this.MMC5_REG[e+2]+1},it.prototype.Write_MMC5_REG=function(t,e){switch(this.MMC5_REG[t]=e,t){case 2:this.Write_MMC5_ChLength0(0);break;case 3:this.Write_MMC5_ChLength1(0);break;case 6:this.Write_MMC5_ChLength0(1);break;case 7:this.Write_MMC5_ChLength1(1);break;case 21:for(var s=0;s<2;s++)0==(this.MMC5_REG[21]&1<<s)&&(this.MMC5_Ch[s].LengthCounter=0)}},it.prototype.Read_MMC5_REG=function(t){if(21===t)for(var e=0;e<2;e++)this.MMC5_Ch[e].LengthCounter},it.prototype.Count_MMC5=function(t){var e,s;if(this.MMC5_FrameSequenceCounter+=240*t,this.MMC5_FrameSequenceCounter>=this.MainClock){for(this.MMC5_FrameSequenceCounter-=this.MainClock,e=0;e<2;e++)s=e<<2,0==(16&this.MMC5_REG[s])&&++this.MMC5_Ch[e].Envelope==1+(15&this.MMC5_REG[s])&&(this.MMC5_Ch[e].Envelope=0,0===this.MMC5_Ch[e].EnvelopeCounter?32==(32&this.MMC5_REG[s])&&(this.MMC5_Ch[e].EnvelopeCounter=15):this.MMC5_Ch[e].EnvelopeCounter--);if(1===this.MMC5_FrameSequence||3===this.MMC5_FrameSequence)for(e=0;e<2;e++)s=e<<2,0==(32&this.MMC5_REG[s])&&0!==this.MMC5_Ch[e].LengthCounter&&0==--this.MMC5_Ch[e].LengthCounter&&(this.MMC5_REG[21]&=~(1<<e)),++this.MMC5_Ch[e].Sweep==1+((112&this.MMC5_REG[s+1])>>4)&&(this.MMC5_Ch[e].Sweep=0,128==(128&this.MMC5_REG[s+1])&&0!=(7&this.MMC5_REG[s+1])&&0!==this.MMC5_Ch[e].LengthCounter&&(0==(8&this.MMC5_REG[s+1])?this.MMC5_Ch[e].Frequency+=this.MMC5_Ch[e].Frequency>>(7&this.MMC5_REG[s+1]):this.MMC5_Ch[e].Frequency-=this.MMC5_Ch[e].Frequency>>(7&this.MMC5_REG[s+1]),(this.MMC5_Ch[e].Frequency<8||this.MMC5_Ch[e].Frequency>2047)&&(this.MMC5_Ch[e].LengthCounter=0,this.MMC5_REG[21]&=~(1<<e))));this.MMC5_FrameSequence=3&++this.MMC5_FrameSequence}},it.prototype.Out_MMC5=function(){for(var t=0,e=this.WaveBaseCount<<1,s=0;s<2;s++){var i=s<<2;0!==this.MMC5_Ch[s].LengthCounter&&this.MMC5_Ch[s].Frequency>3&&(t+=(16==(16&this.MMC5_REG[i])?15&this.MMC5_REG[i]:this.MMC5_Ch[s].EnvelopeCounter)*((e/this.MMC5_Ch[s].Frequency&31)<this.WaveCh1_2DutyData[(192&this.MMC5_REG[i])>>6]?1:-1))}return(t+=(this.MMC5_REG[17]>>2)-16)<<5},it.prototype.Init_VRC6=function(){for(var t=0;t<this.VRC6_REG.length;t++)this.VRC6_REG[t]=0;this.VRC6_Ch3_Counter=0,this.VRC6_Ch3_index=0},it.prototype.Write_VRC6_REG=function(t,e){this.VRC6_REG[t]=e},it.prototype.Count_VRC6=function(t){var e=1+((15&this.VRC6_REG[10])<<8|this.VRC6_REG[9]);this.VRC6_Ch3_Counter+=t,this.VRC6_Ch3_index+=this.VRC6_Ch3_Counter/e|0,this.VRC6_Ch3_index%=14,this.VRC6_Ch3_Counter%=e},it.prototype.Out_VRC6=function(){for(var t=0,e=this.WaveBaseCount,s=0;s<8;s+=4)if(128==(128&this.VRC6_REG[s+2]))if(0==(128&this.VRC6_REG[s+0])){var i=(15&this.VRC6_REG[s+2])<<8|this.VRC6_REG[s+1],h=(112&this.VRC6_REG[s+0])>>>4;t+=(15&this.VRC6_REG[s+0])*((e/i&15)<h?1:-1)}else t+=15&this.VRC6_REG[s+0];return 128==(128&this.VRC6_REG[10])&&(t+=((this.VRC6_Ch3_index>>>1)*(63&this.VRC6_REG[8])>>>3)-16),t<<5},it.prototype.Init_N163=function(){var t;for(t=0;t<this.N163_RAM.length;t++)this.N163_RAM[t]=0;for(t=0;t<this.N163_ch_data.length;t++)this.N163_ch_data[t]={Freq:0,Phase:0,Length:0,Address:0,Vol:0};this.N163_Address=0,this.N163_ch=0,this.N163_Clock=0},it.prototype.Write_N163_RAM=function(t){var e=127&this.N163_Address;if(this.N163_RAM[e]=t,e>=64){var s=e>>>3&7;switch(7&e){case 0:this.N163_ch_data[s].Freq=261888&this.N163_ch_data[s].Freq|t;break;case 1:this.N163_ch_data[s].Phase=16776960&this.N163_ch_data[s].Freq|t;break;case 2:this.N163_ch_data[s].Freq=196863&this.N163_ch_data[s].Freq|t<<8;break;case 3:this.N163_ch_data[s].Phase=16711935&this.N163_ch_data[s].Freq|t<<8;break;case 4:this.N163_ch_data[s].Freq=65535&this.N163_ch_data[s].Freq|(3&t)<<16,this.N163_ch_data[s].Length=256-(252&t)<<16;break;case 5:this.N163_ch_data[s].Phase=65535&this.N163_ch_data[s].Freq|t<<16;break;case 6:this.N163_ch_data[s].Address=t;break;case 7:this.N163_ch_data[s].Vol=15&t,127===e&&(this.N163_ch=t>>>4&7)}}128==(128&this.N163_Address)&&(this.N163_Address=1+(127&this.N163_Address)|128)},it.prototype.Read_N163_RAM=function(){var t=this.N163_RAM[127&this.N163_Address];return 128==(128&this.N163_Address)&&(this.N163_Address=1+(127&this.N163_Address)|128),t},it.prototype.Count_N163=function(t){this.N163_Clock+=t;for(var e=15*(this.N163_ch+1);this.N163_Clock>=e;){this.N163_Clock-=e;for(var s=7-this.N163_ch;s<8;s++)this.N163_ch_data[s].Length>0&&(this.N163_ch_data[s].Phase=(this.N163_ch_data[s].Phase+this.N163_ch_data[s].Freq)%this.N163_ch_data[s].Length)}},it.prototype.Out_N163=function(){for(var t=0,e=7-this.N163_ch;e<8;e++){var s=this.N163_ch_data[e].Address+(this.N163_ch_data[e].Phase>>16)&255,i=this.N163_RAM[s>>>1];t+=((i=0==(1&s)?15&i:i>>>4)-8)*this.N163_ch_data[e].Vol}return t<<2},it.prototype.Init_AY=function(){this.AY_ClockCounter=0;for(var t=0;t<this.AY_REG.length;t++)this.AY_REG[t]=0;this.AY_Noise_Seed=1,this.AY_Noise_Angle=0,this.AY_Env_Counter=0,this.AY_Env_Index=0,this.AY_REG_Select=0},it.prototype.Select_AY_REG=function(t){this.AY_REG_Select=15&t},it.prototype.Write_AY_REG=function(t){this.AY_REG[this.AY_REG_Select]=t,13===this.AY_REG_Select&&(this.AY_Env_Index=0)},it.prototype.Read_AY_REG=function(){return 0},it.prototype.Count_AY=function(t){this.AY_Env_Counter+=t;var e=8*(1+(this.AY_REG[12]<<8|this.AY_REG[11])),s=this.AY_Env_Counter/e|0;this.AY_Env_Counter%=e,this.AY_Env_Index+=s,this.AY_Env_Index>=48&&(this.AY_Env_Index=(this.AY_Env_Index-48)%32+32)},it.prototype.Out_AY=function(){var t=this.WaveBaseCount,e=0,s=1==(1&this.AY_Noise_Seed)?1:-1,i=t/(32*(1+(31&this.AY_REG[5])))|0;i!==this.AY_Noise_Angle&&(this.AY_Noise_Seed=this.AY_Noise_Seed>>>1|(1&this.AY_Noise_Seed)<<15^(8&this.AY_Noise_Seed)<<12,this.AY_Noise_Angle=i);for(var h=0;h<3;h++){var r=0==(16&this.AY_REG[8+h])?15&this.AY_REG[8+h]:this.AY_Env_Pattern[15&this.AY_REG[13]][this.AY_Env_Index];if(r=this.AY_Env_Volume[r],0==(this.AY_REG[7]>>h&1)){var P=1+((15&this.AY_REG[2*h+1])<<8|this.AY_REG[2*h]);e+=P>1?r*((t/P&31)<16?1:-1):r}0==(this.AY_REG[7]>>h&8)&&(e+=r*s)}return e},t.exports=it}},e={};function s(i){var h=e[i];if(void 0!==h)return h.exports;var r=e[i]={exports:{}};return t[i](r,r.exports,s),r.exports}(()=>{var t=new(s(4495))(document.getElementById("mainCanvas"));function e(){t.Pause()&&(document.getElementById("pause").disabled=!0,document.getElementById("start").disabled=!1)}function i(){t.Start()&&(document.getElementById("pause").disabled=!1,document.getElementById("start").disabled=!0)}function h(){t.Reset()&&(document.getElementById("pause").disabled=!1,document.getElementById("start").disabled=!0)}function r(s){e(),t.SetRom(s)?(document.getElementById("start").disabled=!0,document.getElementById("pause").disabled=!0,t.Init()&&i()):console.error("Can't get rom data (perhaps you don't set ArrayBuffer arguments or it's not nes rom format)")}t.initCanvas(),window.onkeydown=function(e){t.handleKeyDown(e)},window.onkeyup=function(e){t.handleKeyUp(e)};var P=function(t,e){var s=new FileReader;s.onload=function(t){e(t.target.result)},s.readAsArrayBuffer(t)};window.onload=function(){void 0!==window.FileReader&&(window.addEventListener("dragenter",(function(t){t.preventDefault()}),!1),window.addEventListener("dragover",(function(t){t.preventDefault()}),!1),window.addEventListener("drop",(function(t){t.preventDefault(),P(t.dataTransfer.files[0],r)}),!1),document.getElementById("file").addEventListener("change",(function(t){P(t.target.files[0],r)}),!1),document.getElementById("romload").addEventListener("click",(function(t){var e,s,i;t.preventDefault(),e=document.getElementById("romlist").value,s=r,(i=new XMLHttpRequest).onload=function(){s(i.response)},i.onerror=function(t){console.error("can't get rom binary")},i.open("GET",e,!0),i.responseType="arraybuffer",i.send(null)}),!1),document.getElementById("pause").addEventListener("click",e,!1),document.getElementById("start").addEventListener("click",i,!1),document.getElementById("reset").addEventListener("click",h,!1),document.getElementById("start").disabled=!0,document.getElementById("pause").disabled=!0)}})()})();
>>>>>>> 044eda8 (update: use webpack instead of gulp)
