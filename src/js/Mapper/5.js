"use strict";

var MapperProto = require('./Base');
/**** Mapper5 ****/
var Mapper5 = function(nes) {
	MapperProto.apply(this, arguments);
	this.MAPPER_REG = new Array(0x300);
	this.MAPPER_EXRAM = new Array(8);
	this.MAPPER_EXRAM2 = new Array(1024);
	this.MAPPER_EXRAM3 = new Array(1024);

	this.MAPPER_CHR_REG = new Array(2);

	this.MAPPER_IRQ = 0;
	this.MAPPER_IRQ_STATUS = 0;
};

Mapper5.prototype = Object.create(MapperProto.prototype);

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
