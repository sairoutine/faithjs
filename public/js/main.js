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
