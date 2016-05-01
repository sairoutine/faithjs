"use strict";

var NES = require('./NES');

/* **** NES Mapper **** */
/**** MapperProto ****/
NES.prototype.MapperProto = function(core) {
	this.Core = core;
	this.MAPPER_REG = null;
};

NES.prototype.MapperProto.prototype.Init = function() {
};

NES.prototype.MapperProto.prototype.ReadLow = function(address) {
	return 0x40;
};

NES.prototype.MapperProto.prototype.WriteLow = function(address, data) {
};

NES.prototype.MapperProto.prototype.ReadPPUData = function () {
	return this.Core.ReadPPUData_SUB();
};

NES.prototype.MapperProto.prototype.WritePPUData = function (value) {
	this.Core.WritePPUData_SUB(value);
};

NES.prototype.MapperProto.prototype.BuildBGLine = function () {
	this.Core.BuildBGLine_SUB();
};

NES.prototype.MapperProto.prototype.BuildSpriteLine = function () {
	this.Core.BuildSpriteLine_SUB();
};

NES.prototype.MapperProto.prototype.ReadSRAM = function(address) {
	return this.Core.SRAM[address & 0x1FFF];
};

NES.prototype.MapperProto.prototype.WriteSRAM = function(address, data) {
	this.Core.SRAM[address & 0x1FFF] = data;
};

NES.prototype.MapperProto.prototype.Write = function(address, data) {
};

NES.prototype.MapperProto.prototype.HSync = function(y) {
};

NES.prototype.MapperProto.prototype.CPUSync = function(clock) {
};

NES.prototype.MapperProto.prototype.SetIRQ = function() {
	this.Core.toIRQ |= 0x04;
};

NES.prototype.MapperProto.prototype.ClearIRQ = function() {
	this.Core.toIRQ &= ~0x04;
};

NES.prototype.MapperProto.prototype.OutEXSound = function(soundin) {
	return soundin;
};

NES.prototype.MapperProto.prototype.EXSoundSync = function(clock) {
};

NES.prototype.MapperProto.prototype.OutSRAM = function() {
	var ret = "";
	for(var i=0; i<this.Core.SRAM.length; i++) {
		ret += (this.Core.SRAM[i] < 0x10 ? "0" : "") + this.Core.SRAM[i].toString(16);
	}
	return ret.toUpperCase();
};

NES.prototype.MapperProto.prototype.InSRAM = function(sram) {
	for(var i=0; i<this.Core.SRAM.length; i++)
		this.Core.SRAM[i] = 0x00;

	try{
		for(var i=0; i<(this.Core.SRAM.length * 2) && i<sram.length; i+=2)
			this.Core.SRAM[i / 2] = parseInt(sram.substr(i, 2), 16);
	} catch(e) {
		return false;
	}
	return true;
};

NES.prototype.MapperProto.prototype.GetState = function() {
	if(this.MAPPER_REG === null)
		return;

	this.Core.StateData.Mapper = new Object();
	this.Core.StateData.Mapper.MAPPER_REG = this.MAPPER_REG.slice(0);
};

NES.prototype.MapperProto.prototype.SetState = function() {
	if(this.MAPPER_REG === null)
		return;

	for(var i=0; i<this.Core.StateData.Mapper.MAPPER_REG.length; i++)
		this.MAPPER_REG[i] = this.Core.StateData.Mapper.MAPPER_REG[i];
};


/**** Mapper0 ****/
NES.prototype.Mapper0 = function(core) {
	NES.prototype.MapperProto.apply(this, arguments);
};

NES.prototype.Mapper0.prototype = Object.create(NES.prototype.MapperProto.prototype);

NES.prototype.Mapper0.prototype.Init = function() {
	this.Core.SetPrgRomPage(0, 0);
	this.Core.SetPrgRomPage(1, this.Core.PrgRomPageCount - 1);
	this.Core.SetChrRomPage(0);
};


/**** Mapper1 ****/
NES.prototype.Mapper1 = function(core) {
	NES.prototype.MapperProto.apply(this, arguments);
	this.MAPPER_REG = new Array(16);
};

NES.prototype.Mapper1.prototype = Object.create(NES.prototype.MapperProto.prototype);

NES.prototype.Mapper1.prototype.Init = function() {
	var i;
	for(i=0; i<this.MAPPER_REG.length; i++)
		this.MAPPER_REG[i] = 0;

	this.MAPPER_REG[13] = 0;
	this.MAPPER_REG[14] = 0x00;
	this.MAPPER_REG[0] = 0x0C;
	this.MAPPER_REG[1] = 0x00;
	this.MAPPER_REG[2] = 0x00;
	this.MAPPER_REG[3] = 0x00;

	if(this.Core.PrgRomPageCount === 64) {
		this.MAPPER_REG[10] = 2;
	} else if(this.Core.PrgRomPageCount === 32) {
		this.MAPPER_REG[10] = 1;
	} else {
		this.MAPPER_REG[10] = 0;
	}
	this.MAPPER_REG[11] = 0;
	this.MAPPER_REG[12] = 0;

	if(this.MAPPER_REG[10] === 0) {
		this.MAPPER_REG[8] = this.Core.PrgRomPageCount * 2 - 2;
		this.MAPPER_REG[9] = this.Core.PrgRomPageCount * 2 - 1;
	} else {
		this.MAPPER_REG[8] = 30;
		this.MAPPER_REG[9] = 31;
	}

	this.MAPPER_REG[4] = 0;
	this.MAPPER_REG[5] = 1;
	this.MAPPER_REG[6] = this.MAPPER_REG[8];
	this.MAPPER_REG[7] = this.MAPPER_REG[9];

	this.Core.SetPrgRomPages8K(this.MAPPER_REG[4], this.MAPPER_REG[5], this.MAPPER_REG[6], this.MAPPER_REG[7]);
};

NES.prototype.Mapper1.prototype.Write = function(address, data) {
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
					this.Core.SetMirror(true);
				} else {
					this.Core.SetMirror(false);
				}
			} else {
				if((this.MAPPER_REG[0] & 0x01) !== 0) {
					this.Core.SetMirrors(1, 1, 1, 1);
				} else {
					this.Core.SetMirrors(0, 0, 0, 0);
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
			} else if((this.MAPPER_REG[10] === 1) && (this.Core.ChrRomPageCount === 0)) {
				this.MAPPER_REG[11] = (this.MAPPER_REG[1] & 0x10) >> 4;
				this.SetPrgRomPages8K_Mapper01();
			} else if(this.Core.ChrRomPageCount !== 0) {
    				if((this.MAPPER_REG[0] & 0x10) !== 0) {
					bank_num <<= 2;
					this.Core.SetChrRomPage1K(0, bank_num + 0);
					this.Core.SetChrRomPage1K(1, bank_num + 1);
					this.Core.SetChrRomPage1K(2, bank_num + 2);
					this.Core.SetChrRomPage1K(3, bank_num + 3);
				} else {
					bank_num <<= 2;
					this.Core.SetChrRomPages1K(bank_num + 0, bank_num + 1, bank_num + 2, bank_num + 3,
								 bank_num + 4, bank_num + 5, bank_num + 6, bank_num + 7);
				}
			} else {
				if((this.MAPPER_REG[0] & 0x10) !== 0) {
					bank_num <<= 2;
					this.Core.VRAM[0] = this.Core.VRAMS[bank_num + 0];
					this.Core.VRAM[1] = this.Core.VRAMS[bank_num + 1];
					this.Core.VRAM[2] = this.Core.VRAMS[bank_num + 2];
					this.Core.VRAM[3] = this.Core.VRAMS[bank_num + 3];
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

			if(this.Core.ChrRomPageCount === 0) {
				if((this.MAPPER_REG[0] & 0x10) !== 0) {
					bank_num <<= 2;
					this.Core.VRAM[4] = this.Core.VRAMS[bank_num + 0];
					this.Core.VRAM[5] = this.Core.VRAMS[bank_num + 1];
					this.Core.VRAM[6] = this.Core.VRAMS[bank_num + 2];
					this.Core.VRAM[7] = this.Core.VRAMS[bank_num + 3];
					break;
				}
			}

			if((this.MAPPER_REG[0] & 0x10) !== 0) {
					bank_num <<= 2;
					this.Core.SetChrRomPage1K(4, bank_num + 0);
					this.Core.SetChrRomPage1K(5, bank_num + 1);
					this.Core.SetChrRomPage1K(6, bank_num + 2);
					this.Core.SetChrRomPage1K(7, bank_num + 3);
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

NES.prototype.Mapper1.prototype.SetPrgRomPages8K_Mapper01 = function (){
	this.Core.SetPrgRomPage8K(0, (this.MAPPER_REG[11] << 5) + (this.MAPPER_REG[4] & 31));
	this.Core.SetPrgRomPage8K(1, (this.MAPPER_REG[11] << 5) + (this.MAPPER_REG[5] & 31));
	this.Core.SetPrgRomPage8K(2, (this.MAPPER_REG[11] << 5) + (this.MAPPER_REG[6] & 31));
	this.Core.SetPrgRomPage8K(3, (this.MAPPER_REG[11] << 5) + (this.MAPPER_REG[7] & 31));
};


/**** Mapper2 ****/
NES.prototype.Mapper2 = function(core) {
	NES.prototype.MapperProto.apply(this, arguments);
};

NES.prototype.Mapper2.prototype = Object.create(NES.prototype.MapperProto.prototype);

NES.prototype.Mapper2.prototype.Init = function() {
	this.Core.SetPrgRomPage(0, 0);
	this.Core.SetPrgRomPage(1, this.Core.PrgRomPageCount - 1);
	this.Core.SetChrRomPage(0);
};

NES.prototype.Mapper2.prototype.Write = function(address, data) {
	this.Core.SetPrgRomPage(0, data);
};


/**** Mapper3 ****/
NES.prototype.Mapper3 = function(core) {
	NES.prototype.MapperProto.apply(this, arguments);
};

NES.prototype.Mapper3.prototype = Object.create(NES.prototype.MapperProto.prototype);

NES.prototype.Mapper3.prototype.Init = function() {
	this.Core.SetPrgRomPage(0, 0);
	this.Core.SetPrgRomPage(1, this.Core.PrgRomPageCount - 1);
	this.Core.SetChrRomPage(0);
};

NES.prototype.Mapper3.prototype.Write = function(address, data) {
	this.Core.SetChrRomPage(data & 0x0F);
};


/**** Mapper4 ****/
NES.prototype.Mapper4 = function(core) {
	NES.prototype.MapperProto.apply(this, arguments);
	this.MAPPER_REG = new Array(20);
};

NES.prototype.Mapper4.prototype = Object.create(NES.prototype.MapperProto.prototype);

NES.prototype.Mapper4.prototype.Init = function() {
	var i;
	for(i=0; i<this.MAPPER_REG.length; i++)
		this.MAPPER_REG[i] = 0;

	this.MAPPER_REG[16] = 0;
	this.MAPPER_REG[17] = 1;
	this.MAPPER_REG[18] = (this.Core.PrgRomPageCount - 1) * 2;
	this.MAPPER_REG[19] = (this.Core.PrgRomPageCount - 1) * 2 + 1;
	this.Core.SetPrgRomPages8K(this.MAPPER_REG[16], this.MAPPER_REG[17], this.MAPPER_REG[18], this.MAPPER_REG[19]);

	this.MAPPER_REG[8] = 0;
	this.MAPPER_REG[9] = 1;
	this.MAPPER_REG[10] = 2;
	this.MAPPER_REG[11] = 3;
	this.MAPPER_REG[12] = 4;
	this.MAPPER_REG[13] = 5;
	this.MAPPER_REG[14] = 6;
	this.MAPPER_REG[15] = 7;
	this.Core.SetChrRomPages1K(this.MAPPER_REG[8], this.MAPPER_REG[9], this.MAPPER_REG[10], this.MAPPER_REG[11],
				this.MAPPER_REG[12], this.MAPPER_REG[13], this.MAPPER_REG[14], this.MAPPER_REG[15]);
};

NES.prototype.Mapper4.prototype.Write = function(address, data) {
	switch (address & 0xE001) {
		case 0x8000:
			this.MAPPER_REG[0] = data;
			if((data & 0x80) === 0x80) {
				this.Core.SetChrRomPages1K(this.MAPPER_REG[12], this.MAPPER_REG[13], this.MAPPER_REG[14], this.MAPPER_REG[15], 
							this.MAPPER_REG[8], this.MAPPER_REG[9], this.MAPPER_REG[10], this.MAPPER_REG[11]); 
			} else {
				this.Core.SetChrRomPages1K(this.MAPPER_REG[8], this.MAPPER_REG[9], this.MAPPER_REG[10], this.MAPPER_REG[11], 
							this.MAPPER_REG[12], this.MAPPER_REG[13], this.MAPPER_REG[14], this.MAPPER_REG[15]); 
			}

			if((data & 0x40) === 0x40) {
				this.Core.SetPrgRomPages8K(this.MAPPER_REG[18], this.MAPPER_REG[17], this.MAPPER_REG[16],this.MAPPER_REG[19]);
			} else {
				this.Core.SetPrgRomPages8K(this.MAPPER_REG[16], this.MAPPER_REG[17], this.MAPPER_REG[18],this.MAPPER_REG[19]);
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
				this.Core.SetChrRomPages1K(this.MAPPER_REG[12], this.MAPPER_REG[13], this.MAPPER_REG[14], this.MAPPER_REG[15], 
							this.MAPPER_REG[8], this.MAPPER_REG[9], this.MAPPER_REG[10], this.MAPPER_REG[11]); 
			} else {
				this.Core.SetChrRomPages1K(this.MAPPER_REG[8], this.MAPPER_REG[9], this.MAPPER_REG[10], this.MAPPER_REG[11], 
							this.MAPPER_REG[12], this.MAPPER_REG[13], this.MAPPER_REG[14], this.MAPPER_REG[15]); 
			}

			if((this.MAPPER_REG[0] & 0x40) === 0x40) {
				this.Core.SetPrgRomPages8K(this.MAPPER_REG[18], this.MAPPER_REG[17], this.MAPPER_REG[16],this.MAPPER_REG[19]);
			} else {
				this.Core.SetPrgRomPages8K(this.MAPPER_REG[16], this.MAPPER_REG[17], this.MAPPER_REG[18],this.MAPPER_REG[19]);
			}
			break;

		case 0xA000:
			if((data & 0x01) === 0x01)
				this.Core.SetMirror(true);
			else
				this.Core.SetMirror(false);
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

NES.prototype.Mapper4.prototype.HSync = function(y) {
	if(this.MAPPER_REG[7] === 1 && y < 240 && (this.Core.IO1[0x01] & 0x08) === 0x08) {
		if(--this.MAPPER_REG[4] === 0)
			this.SetIRQ();
		this.MAPPER_REG[4] &= 0xFF;
	}
};


/**** Mapper5 ****/
NES.prototype.Mapper5 = function(core) {
	NES.prototype.MapperProto.apply(this, arguments);
	this.MAPPER_REG = new Array(0x300);
	this.MAPPER_EXRAM = new Array(8);
	this.MAPPER_EXRAM2 = new Array(1024);
	this.MAPPER_EXRAM3 = new Array(1024);

	this.MAPPER_CHR_REG = new Array(2);

	this.MAPPER_IRQ = 0;
	this.MAPPER_IRQ_STATUS = 0;
};

NES.prototype.Mapper5.prototype = Object.create(NES.prototype.MapperProto.prototype);

NES.prototype.Mapper5.prototype.Init = function() {
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

	var tmp = this.Core.PrgRomPageCount * 2 - 1;
	this.Core.SetPrgRomPages8K(tmp, tmp, tmp, tmp);
	tmp = 0;
	this.Core.SetChrRomPages1K(tmp, tmp + 1, tmp + 2, tmp + 3, tmp + 4, tmp + 5, tmp + 6, tmp + 7);
};

NES.prototype.Mapper5.prototype.HSync = function(y) {
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

NES.prototype.Mapper5.prototype.ReadLow = function(address) {
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

NES.prototype.Mapper5.prototype.WriteLow = function(address, data) {
	if(address >= 0x5C00) {
		this.MAPPER_EXRAM2[address - 0x5C00] = data;
		return;
	}

	if(address >= 0x5000 && address <= 0x5015) {
		this.MAPPER_REG[address - 0x5000] = data;
		this.Core.Write_MMC5_REG(address - 0x5000, data);
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
		for(var i=0; i<4; i++) {
			switch((data >>> (i * 2)) & 0x03) {
				case 0:
					this.Core.VRAM[8 + i] = this.Core.VRAMS[8];
					break;
				case 1:
					this.Core.VRAM[8 + i] = this.Core.VRAMS[9];
					break;
				case 2:
					this.Core.VRAM[8 + i] = this.MAPPER_EXRAM2;
					break;
				case 3:
					this.Core.VRAM[8 + i] = this.MAPPER_EXRAM3;
					break;
			}
		}
		return;
	}

	if(address === 0x5106) {
		this.MAPPER_REG[0x0106] = data;
		for(var i=0; i<30*32; i++)
			this.MAPPER_EXRAM3[i] = data;
		return;
	}

	if(address === 0x5107) {
		this.MAPPER_REG[0x0107] = data;
		for(var i=30*32; i<32*32; i++)
			this.MAPPER_EXRAM3[i] = data;
		return;
	}

	if(address === 0x5113) {
		this.MAPPER_REG[0x0113] = data;
		this.Core.SRAM = this.MAPPER_EXRAM[data & 0x07];
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

NES.prototype.Mapper5.prototype.SetChrRomPages1K_Mapper05_A = function (){
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

NES.prototype.Mapper5.prototype.SetChrRomPages1K_Mapper05_B = function (){
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

NES.prototype.Mapper5.prototype.SetPrgRomPages8K_Mapper05 = function (no){
	switch(this.MAPPER_REG[0x0100] & 0x03) {
		case 0x00:
			if(no === 0x0117) {
				var tmp = this.MAPPER_REG[0x0117] & 0x7C;
				this.Core.SetPrgRomPage8K(0, tmp);
				this.Core.SetPrgRomPage8K(1, tmp + 1);
				this.Core.SetPrgRomPage8K(2, tmp + 2);
				this.Core.SetPrgRomPage8K(3, tmp + 3);
			}
			break;
		case 0x01:
			if(no === 0x0115) {
				var tmp = this.MAPPER_REG[0x0115];
				if((tmp & 0x80) === 0x80) {
					tmp &= 0x7E;
					this.Core.SetPrgRomPage8K(0, tmp);
					this.Core.SetPrgRomPage8K(1, tmp + 1);
				} else {
					this.Core.ROM[0] = this.MAPPER_EXRAM[tmp & 0x07];
					this.Core.ROM[1] = this.MAPPER_EXRAM[(tmp + 1) & 0x07];
				}
			}
			if(no === 0x0117) {
				var tmp = this.MAPPER_REG[0x0117] & 0x7E;
				this.Core.SetPrgRomPage8K(2, tmp);
				this.Core.SetPrgRomPage8K(3, tmp + 1);
			}
			break;
		case 0x02:
			if(no === 0x0115) {
				var tmp = this.MAPPER_REG[0x0115];
				if((tmp & 0x80) === 0x80) {
					tmp &= 0x7E;
					this.Core.SetPrgRomPage8K(0, tmp);
					this.Core.SetPrgRomPage8K(1, tmp + 1);
				} else {
					this.Core.ROM[0] = this.MAPPER_EXRAM[tmp & 0x07];
					this.Core.ROM[1] = this.MAPPER_EXRAM[(tmp + 1) & 0x07];
				}
			}
			if(no === 0x0116) {
				var tmp = this.MAPPER_REG[0x0116];
				if((tmp & 0x80) === 0x80) {
					this.Core.SetPrgRomPage8K(2, tmp & 0x7F);
				} else {
					this.Core.ROM[2] = this.MAPPER_EXRAM[tmp & 0x07];
				}
			}
			if(no === 0x0117)
				this.Core.SetPrgRomPage8K(3, this.MAPPER_REG[0x0117] & 0x7F);
			break;
		case 0x03:
			if(no === 0x0114 || no === 0x0115 || no === 0x0116) {
				var tmp = this.MAPPER_REG[no];
				if((tmp & 0x80) === 0x80) {
					this.Core.SetPrgRomPage8K(no - 0x0114, tmp & 0x7F);
				} else {
					this.Core.ROM[no - 0x0114] = this.MAPPER_EXRAM[tmp & 0x07];
				}
			}
			if(no === 0x0117)
				this.Core.SetPrgRomPage8K(3, this.MAPPER_REG[0x0117] & 0x7F);
			break;
	}
};

NES.prototype.Mapper5.prototype.BuildBGLine = function () {
	this.Core.SetChrRomPages1K(this.MAPPER_CHR_REG[1][0], this.MAPPER_CHR_REG[1][1], this.MAPPER_CHR_REG[1][2], this.MAPPER_CHR_REG[1][3],
				   this.MAPPER_CHR_REG[1][4], this.MAPPER_CHR_REG[1][5], this.MAPPER_CHR_REG[1][6], this.MAPPER_CHR_REG[1][7]);

	this.Core.BuildBGLine_SUB();

	if((this.MAPPER_REG[0x0200] & 0x80) === 0x80) {
		var chrpage = this.MAPPER_REG[0x0202] * 4;
		this.Core.SetChrRomPage1K(0, chrpage);
		this.Core.SetChrRomPage1K(1, chrpage + 1);
		this.Core.SetChrRomPage1K(2, chrpage + 2);
		this.Core.SetChrRomPage1K(3, chrpage + 3);

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

		var tmpVRAM = this.Core.VRAM;
		var tmpPaletteArray = this.Core.PaletteArray;
		var tmpSPBitArray = this.Core.SPBitArray;

		var tmpBgLineBuffer = this.Core.BgLineBuffer;
		var nameAddr = 0x0000;
		var tmpy = (this.Core.PpuY + this.MAPPER_REG[0x0201]) % 240;
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

NES.prototype.Mapper5.prototype.BuildSpriteLine = function () {
	this.Core.SetChrRomPages1K(this.MAPPER_CHR_REG[0][0], this.MAPPER_CHR_REG[0][1], this.MAPPER_CHR_REG[0][2], this.MAPPER_CHR_REG[0][3],
				   this.MAPPER_CHR_REG[0][4], this.MAPPER_CHR_REG[0][5], this.MAPPER_CHR_REG[0][6], this.MAPPER_CHR_REG[0][7]);
	this.Core.BuildSpriteLine_SUB();
};

NES.prototype.Mapper5.prototype.ReadPPUData = function () {
	this.Core.SetChrRomPages1K(this.MAPPER_CHR_REG[0][0], this.MAPPER_CHR_REG[0][1], this.MAPPER_CHR_REG[0][2], this.MAPPER_CHR_REG[0][3],
				   this.MAPPER_CHR_REG[0][4], this.MAPPER_CHR_REG[0][5], this.MAPPER_CHR_REG[0][6], this.MAPPER_CHR_REG[0][7]);
	return this.Core.ReadPPUData_SUB();
};

NES.prototype.Mapper5.prototype.WritePPUData = function (value) {
	this.Core.SetChrRomPages1K(this.MAPPER_CHR_REG[0][0], this.MAPPER_CHR_REG[0][1], this.MAPPER_CHR_REG[0][2], this.MAPPER_CHR_REG[0][3],
				   this.MAPPER_CHR_REG[0][4], this.MAPPER_CHR_REG[0][5], this.MAPPER_CHR_REG[0][6], this.MAPPER_CHR_REG[0][7]);
	this.Core.WritePPUData_SUB(value);
};

NES.prototype.Mapper5.prototype.OutEXSound = function(soundin) {
	return (soundin >> 1) + (this.Core.Out_MMC5() >> 1);
};

NES.prototype.Mapper5.prototype.EXSoundSync = function(clock) {
	this.Core.Count_MMC5(clock);
};


/**** Mapper7 ****/
NES.prototype.Mapper7 = function(core) {
	NES.prototype.MapperProto.apply(this, arguments);
};

NES.prototype.Mapper7.prototype = Object.create(NES.prototype.MapperProto.prototype);

NES.prototype.Mapper7.prototype.Init = function() {
	this.Core.SetPrgRomPage(0, 0);
	this.Core.SetPrgRomPage(1, 1);
	this.Core.SetChrRomPage(0);
};

NES.prototype.Mapper7.prototype.Write = function(address, data) {
	var tmp = (data & 0x07) << 1;
	this.Core.SetPrgRomPage(0, tmp);
	this.Core.SetPrgRomPage(1, tmp + 1);

	if((data & 0x10) === 0x00)
		this.Core.SetMirrors(0,0,0,0);
	else
		this.Core.SetMirrors(1,1,1,1);
};


/**** Mapper9 ****/
NES.prototype.Mapper9 = function(core) {//<--
	NES.prototype.MapperProto.apply(this, arguments);
	//this.MAPPER_REG = new Array(6);
	this.MAPPER_REG = new Array(4);
	this.MAPPER_Latch0 = true;
	this.MAPPER_Latch1 = true;
};

NES.prototype.Mapper9.prototype = Object.create(NES.prototype.MapperProto.prototype);

NES.prototype.Mapper9.prototype.Init = function() {
	this.Core.SetPrgRomPages8K(0, this.Core.PrgRomPageCount * 2 - 3, this.Core.PrgRomPageCount * 2 - 2, this.Core.PrgRomPageCount * 2 - 1);
	this.Core.SetChrRomPages1K(0, 0, 0, 0, 0, 0, 0, 0);
	for(var i=0; i<this.MAPPER_REG.length; i++)
		this.MAPPER_REG[i] = 0x00;
	this.MAPPER_Latch0 = true;
	this.MAPPER_Latch1 = true;
	//this.MAPPER_REG[4] = true;
	//this.MAPPER_REG[5] = true;
};

NES.prototype.Mapper9.prototype.Write = function(address, data) {
	switch(address & 0xF000) {
		case 0xA000:
			this.Core.SetPrgRomPage8K(0, data);
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
				this.Core.SetMirror(false);
			else
				this.Core.SetMirror(true);
			break;
	}
};

NES.prototype.Mapper9.prototype.BuildBGLine = function () {
	var tmpBgLineBuffer = this.Core.BgLineBuffer;
	var tmpVRAM = this.Core.VRAM;
	var nameAddr = 0x2000 | (this.Core.PPUAddress & 0x0FFF);
	var tableAddr = ((this.Core.PPUAddress & 0x7000) >> 12) | (this.Core.IO1[0x00] & 0x10) << 8;
	var nameAddrHigh = nameAddr >> 10;
	var nameAddrLow = nameAddr & 0x03FF;
	var tmpVRAMHigh = tmpVRAM[nameAddrHigh];
	var tmpPaletteArray = this.Core.PaletteArray;
	var tmpSPBitArray = this.Core.SPBitArray;

	var q = 0;
	var s = this.Core.HScrollTmp;

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

NES.prototype.Mapper9.prototype.SetLatch = function (addr) {
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

NES.prototype.Mapper9.prototype.SetChrRom = function (addr) {
	if((addr & 0x1000) === 0x0000) {
		if(!this.MAPPER_Latch0) {
		//if(!this.MAPPER_REG[4]) {
			this.Core.SetChrRomPage1K(0, this.MAPPER_REG[0] * 4);
			this.Core.SetChrRomPage1K(1, this.MAPPER_REG[0] * 4 + 1);
			this.Core.SetChrRomPage1K(2, this.MAPPER_REG[0] * 4 + 2);
			this.Core.SetChrRomPage1K(3, this.MAPPER_REG[0] * 4 + 3);
		} else {
			this.Core.SetChrRomPage1K(0, this.MAPPER_REG[1] * 4);
			this.Core.SetChrRomPage1K(1, this.MAPPER_REG[1] * 4 + 1);
			this.Core.SetChrRomPage1K(2, this.MAPPER_REG[1] * 4 + 2);
			this.Core.SetChrRomPage1K(3, this.MAPPER_REG[1] * 4 + 3);
		}
	} else {
		if(!this.MAPPER_Latch1) {
		//if(!this.MAPPER_REG[5]) {
			this.Core.SetChrRomPage1K(4, this.MAPPER_REG[2] * 4);
			this.Core.SetChrRomPage1K(5, this.MAPPER_REG[2] * 4 + 1);
			this.Core.SetChrRomPage1K(6, this.MAPPER_REG[2] * 4 + 2);
			this.Core.SetChrRomPage1K(7, this.MAPPER_REG[2] * 4 + 3);
		} else {
			this.Core.SetChrRomPage1K(4, this.MAPPER_REG[3] * 4);
			this.Core.SetChrRomPage1K(5, this.MAPPER_REG[3] * 4 + 1);
			this.Core.SetChrRomPage1K(6, this.MAPPER_REG[3] * 4 + 2);
			this.Core.SetChrRomPage1K(7, this.MAPPER_REG[3] * 4 + 3);
		}
	}
};

NES.prototype.Mapper9.prototype.BuildSpriteLine = function () {
	var tmpBgLineBuffer = this.Core.BgLineBuffer;
	var tmpIsSpriteClipping = (this.Core.IO1[0x01] & 0x04) === 0x04 ? 0 : 8;

	if((this.Core.IO1[0x01] & 0x10) === 0x10) {
		var tmpSpLine = this.Core.SpriteLineBuffer;
		for(var p=0; p<256; p++)
			tmpSpLine[p] = 256;

		var tmpSpRAM = this.Core.SPRITE_RAM;
		var tmpBigSize = (this.Core.IO1[0x00] & 0x20) === 0x20 ? 16 : 8;
		var tmpSpPatternTableAddress = (this.Core.IO1[0x00] & 0x08) << 9;

		var tmpVRAM = this.Core.VRAM;
		var tmpSPBitArray = this.Core.SPBitArray;

		var lineY = this.Core.PpuY;
		var count = 0;

		for(var i=0; i<=252; i+=4) {
			var isy = tmpSpRAM[i] + 1;
			if(isy > lineY || (isy + tmpBigSize) <= lineY)
				continue;

			if(i === 0)
				this.Core.Sprite0Line = true;

			if(++count === 9 && this.Core.SpriteLimit) {
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
			this.Core.IO1[0x02] |= 0x20;
		else
			this.Core.IO1[0x02] &= 0xDF;
	}
};

NES.prototype.Mapper9.prototype.GetState = function() {
	this.Core.StateData.Mapper = new Object();
	this.Core.StateData.Mapper.MAPPER_REG = this.MAPPER_REG.slice(0);

	this.Core.StateData.Mapper.MAPPER_Latch0 = this.MAPPER_Latch0;
	this.Core.StateData.Mapper.MAPPER_Latch1 = this.MAPPER_Latch1;
};

NES.prototype.Mapper9.prototype.SetState = function() {
	for(var i=0; i<this.Core.StateData.Mapper.MAPPER_REG.length; i++)
		this.MAPPER_REG[i] = this.Core.StateData.Mapper.MAPPER_REG[i];

	this.MAPPER_Latch0 = this.Core.StateData.Mapper.MAPPER_Latch0;
	this.MAPPER_Latch1 = this.Core.StateData.Mapper.MAPPER_Latch1;
};


/**** Mapper10 ****/
NES.prototype.Mapper10 = function(core) {//<--
	NES.prototype.MapperProto.apply(this, arguments);
	//this.MAPPER_REG = new Array(6);
	this.MAPPER_REG = new Array(4);
	this.MAPPER_Latch0 = true;
	this.MAPPER_Latch1 = true;
};

NES.prototype.Mapper10.prototype = Object.create(NES.prototype.MapperProto.prototype);

NES.prototype.Mapper10.prototype.Init = function() {
	this.Core.SetPrgRomPages8K(0, 0, this.Core.PrgRomPageCount * 2 - 2, this.Core.PrgRomPageCount * 2 - 1);
	this.Core.SetChrRomPages1K(0, 0, 0, 0, 0, 0, 0, 0);
	for(var i=0; i<this.MAPPER_REG.length; i++)
		this.MAPPER_REG[i] = 0x00;
	this.MAPPER_Latch0 = true;
	this.MAPPER_Latch1 = true;
	//this.MAPPER_REG[4] = true;
	//this.MAPPER_REG[5] = true;
};

NES.prototype.Mapper10.prototype.Write = function(address, data) {
	switch(address & 0xF000) {
		case 0xA000:
			this.Core.SetPrgRomPage8K(0, data * 2);
			this.Core.SetPrgRomPage8K(1, data * 2 + 1);
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
				this.Core.SetMirror(false);
			else
				this.Core.SetMirror(true);
			break;
	}
};

NES.prototype.Mapper10.prototype.BuildBGLine = function () {
	var tmpBgLineBuffer = this.Core.BgLineBuffer;
	var tmpVRAM = this.Core.VRAM;
	var nameAddr = 0x2000 | (this.Core.PPUAddress & 0x0FFF);
	var tableAddr = ((this.Core.PPUAddress & 0x7000) >> 12) | (this.Core.IO1[0x00] & 0x10) << 8;
	var nameAddrHigh = nameAddr >> 10;
	var nameAddrLow = nameAddr & 0x03FF;
	var tmpVRAMHigh = tmpVRAM[nameAddrHigh];
	var tmpPaletteArray = this.Core.PaletteArray;
	var tmpSPBitArray = this.Core.SPBitArray;

	var q = 0;
	var s = this.Core.HScrollTmp;

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

NES.prototype.Mapper10.prototype.SetLatch = function (addr) {
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

NES.prototype.Mapper10.prototype.SetChrRom = function (addr) {
	if((addr & 0x1000) === 0x0000) {
		if(!this.MAPPER_Latch0) {
		//if(!this.MAPPER_REG[4]) {
			this.Core.SetChrRomPage1K(0, this.MAPPER_REG[0] * 4);
			this.Core.SetChrRomPage1K(1, this.MAPPER_REG[0] * 4 + 1);
			this.Core.SetChrRomPage1K(2, this.MAPPER_REG[0] * 4 + 2);
			this.Core.SetChrRomPage1K(3, this.MAPPER_REG[0] * 4 + 3);
		} else {
			this.Core.SetChrRomPage1K(0, this.MAPPER_REG[1] * 4);
			this.Core.SetChrRomPage1K(1, this.MAPPER_REG[1] * 4 + 1);
			this.Core.SetChrRomPage1K(2, this.MAPPER_REG[1] * 4 + 2);
			this.Core.SetChrRomPage1K(3, this.MAPPER_REG[1] * 4 + 3);
		}
	} else {
		if(!this.MAPPER_Latch1) {
		//if(!this.MAPPER_REG[5]) {
			this.Core.SetChrRomPage1K(4, this.MAPPER_REG[2] * 4);
			this.Core.SetChrRomPage1K(5, this.MAPPER_REG[2] * 4 + 1);
			this.Core.SetChrRomPage1K(6, this.MAPPER_REG[2] * 4 + 2);
			this.Core.SetChrRomPage1K(7, this.MAPPER_REG[2] * 4 + 3);
		} else {
			this.Core.SetChrRomPage1K(4, this.MAPPER_REG[3] * 4);
			this.Core.SetChrRomPage1K(5, this.MAPPER_REG[3] * 4 + 1);
			this.Core.SetChrRomPage1K(6, this.MAPPER_REG[3] * 4 + 2);
			this.Core.SetChrRomPage1K(7, this.MAPPER_REG[3] * 4 + 3);
		}
	}
};

NES.prototype.Mapper10.prototype.BuildSpriteLine = function () {
	var tmpBgLineBuffer = this.Core.BgLineBuffer;
	var tmpIsSpriteClipping = (this.Core.IO1[0x01] & 0x04) === 0x04 ? 0 : 8;

	if((this.Core.IO1[0x01] & 0x10) === 0x10) {
		var tmpSpLine = this.Core.SpriteLineBuffer;
		for(var p=0; p<256; p++)
			tmpSpLine[p] = 256;

		var tmpSpRAM = this.Core.SPRITE_RAM;
		var tmpBigSize = (this.Core.IO1[0x00] & 0x20) === 0x20 ? 16 : 8;
		var tmpSpPatternTableAddress = (this.Core.IO1[0x00] & 0x08) << 9;

		var tmpVRAM = this.Core.VRAM;
		var tmpSPBitArray = this.Core.SPBitArray;

		var lineY = this.Core.PpuY;
		var count = 0;

		for(var i=0; i<=252; i+=4) {
			var isy = tmpSpRAM[i] + 1;
			if(isy > lineY || (isy + tmpBigSize) <= lineY)
				continue;

			if(i === 0)
				this.Core.Sprite0Line = true;

			if(++count === 9 && this.Core.SpriteLimit) {
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
			this.Core.IO1[0x02] |= 0x20;
		else
			this.Core.IO1[0x02] &= 0xDF;
	}
};

NES.prototype.Mapper10.prototype.GetState = function() {
	this.Core.StateData.Mapper = new Object();
	this.Core.StateData.Mapper.MAPPER_REG = this.MAPPER_REG.slice(0);

	this.Core.StateData.Mapper.MAPPER_Latch0 = this.MAPPER_Latch0;
	this.Core.StateData.Mapper.MAPPER_Latch1 = this.MAPPER_Latch1;
};

NES.prototype.Mapper10.prototype.SetState = function() {
	for(var i=0; i<this.Core.StateData.Mapper.MAPPER_REG.length; i++)
		this.MAPPER_REG[i] = this.Core.StateData.Mapper.MAPPER_REG[i];

	this.MAPPER_Latch0 = this.Core.StateData.Mapper.MAPPER_Latch0;
	this.MAPPER_Latch1 = this.Core.StateData.Mapper.MAPPER_Latch1;
};


/**** Mapper16 ****/
NES.prototype.Mapper16 = function(core) {
	NES.prototype.MapperProto.apply(this, arguments);
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

NES.prototype.Mapper16.prototype = Object.create(NES.prototype.MapperProto.prototype);

NES.prototype.Mapper16.prototype.Init = function() {
	this.MAPPER_REG[0] = 0;
	this.MAPPER_REG[1] = 0;
	this.Core.SetPrgRomPages8K(0, 1, this.Core.PrgRomPageCount * 2 - 2, this.Core.PrgRomPageCount * 2 - 1);
	this.Core.SetChrRomPages1K(0, 1, 2, 3, 4, 5, 6, 7);

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

NES.prototype.Mapper16.prototype.Write = function(address, data) {
	switch (address & 0x000F) {
		case 0x0000:
			this.Core.SetChrRomPage1K(0, data);
			break;
		case 0x0001:
			this.Core.SetChrRomPage1K(1, data);
			break;
		case 0x0002:
			this.Core.SetChrRomPage1K(2, data);
			break;
		case 0x0003:
			this.Core.SetChrRomPage1K(3, data);
			break;
		case 0x0004:
			this.Core.SetChrRomPage1K(4, data);
			break;
		case 0x0005:
			this.Core.SetChrRomPage1K(5, data);
			break;
		case 0x0006:
			this.Core.SetChrRomPage1K(6, data);
			break;
		case 0x0007:
			this.Core.SetChrRomPage1K(7, data);
			break;
		case 0x0008:
			this.Core.SetPrgRomPage8K(0, data * 2);
			this.Core.SetPrgRomPage8K(1, data * 2 + 1);
			break;

		case 0x0009:
			data &= 0x03;
			if(data === 0) {
				this.Core.SetMirror(false);
			} else if(data === 1) {
				this.Core.SetMirror(true);
			} else if(data === 2) {
				this.Core.SetMirrors(0, 0, 0, 0);
			} else {
				this.Core.SetMirrors(1, 1, 1, 1);
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

NES.prototype.Mapper16.prototype.BIT_OUT = function () {
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

NES.prototype.Mapper16.prototype.BIT_IN = function () {
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

NES.prototype.Mapper16.prototype.ReadSRAM = function(address) {
	return this.OUT_DATA;
};

NES.prototype.Mapper16.prototype.WriteSRAM = function(address, data) {
	this.Write(address, data);
};

NES.prototype.Mapper16.prototype.CPUSync = function(clock) {
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


/**** Mapper18 ****/
NES.prototype.Mapper18 = function(core) {
	NES.prototype.MapperProto.apply(this, arguments);
	this.MAPPER_REG = new Array(15);
	this.IRQ_Counter = 0;
};

NES.prototype.Mapper18.prototype = Object.create(NES.prototype.MapperProto.prototype);

NES.prototype.Mapper18.prototype.Init = function() {
	for(var i=0; i<this.MAPPER_REG.length; i++)
		this.MAPPER_REG[i] = 0;
	this.IRQ_Counter = 0;

	this.Core.SetPrgRomPages8K(0, 1, 2, this.Core.PrgRomPageCount * 2 - 1);
	this.Core.SetChrRomPages1K(0, 1, 2, 3, 4, 5, 6, 7);
};

NES.prototype.Mapper18.prototype.Write = function(address, data) {
	if(address >= 0x8000 && address < 0xE000) {
		var i = ((address & 0x7000) >>> 11) | ((address & 0x0002) >>> 1);
		if((address & 0x0001) === 0x0000)
			this.MAPPER_REG[i] = (this.MAPPER_REG[i] & 0xF0) | (data & 0x0F);
		else
			this.MAPPER_REG[i] = (this.MAPPER_REG[i] & 0x0F) | ((data & 0x0F) << 4);
		if(i < 3)
			this.Core.SetPrgRomPage8K(i, this.MAPPER_REG[i]);
		if(i >= 4)
			this.Core.SetChrRomPage1K(i - 4, this.MAPPER_REG[i]);
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
				this.Core.SetMirror(true);
			} else if(data === 1) {
				this.Core.SetMirror(false);
			} else if(data === 2) {
				this.Core.SetMirrors(0, 0, 0, 0);
			} else {
				this.Core.SetMirrors(1, 1, 1, 1);
			}
			break;
	}
};

NES.prototype.Mapper18.prototype.CPUSync = function(clock) {
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


/**** Mapper19 ****/
NES.prototype.Mapper19 = function(core) {
	NES.prototype.MapperProto.apply(this, arguments);
	this.MAPPER_REG = new Array(5);
	this.EX_VRAM = new Array(32);
};

NES.prototype.Mapper19.prototype = Object.create(NES.prototype.MapperProto.prototype);

NES.prototype.Mapper19.prototype.Init = function() {
	for(var i=0; i<this.MAPPER_REG.length; i++)
		this.MAPPER_REG[i] = 0;

	for(var i=0; i<this.EX_VRAM.length; i++) {
		this.EX_VRAM[i] = new Array(0x0400);
		for(var j=0; j<this.EX_VRAM[i].length; j++)
			this.EX_VRAM[i][j] = 0x00;
	}

	this.Core.SetPrgRomPages8K(0, 1, this.Core.PrgRomPageCount * 2 - 2, this.Core.PrgRomPageCount * 2 - 1);

	if(this.Core.ChrRomPageCount >= 1){
		this.Core.SetChrRomPages1K(this.Core.ChrRomPageCount * 8 - 8, this.Core.ChrRomPageCount * 8 - 7,
						this.Core.ChrRomPageCount * 8 - 6, this.Core.ChrRomPageCount * 8 - 5,
						this.Core.ChrRomPageCount * 8 - 4, this.Core.ChrRomPageCount * 8 - 3,
						this.Core.ChrRomPageCount * 8 - 2, this.Core.ChrRomPageCount * 8 - 1);
	}

};

NES.prototype.Mapper19.prototype.ReadLow = function(address) {
	switch(address & 0xF800) {
		case 0x4800:
			return this.Core.Read_N163_RAM();
		case 0x5000:
			this.ClearIRQ();
			return (this.MAPPER_REG[4] & 0x00FF);
		case 0x5800:
			this.ClearIRQ();
			return (this.MAPPER_REG[3] << 7) | ((this.MAPPER_REG[4] & 0x7F00) >> 8);
	}
	return 0x00;
};

NES.prototype.Mapper19.prototype.WriteLow = function(address, data) {
	switch (address & 0xF800) {
		case 0x4800:
			if(address === 0x4800) {
				this.Core.Write_N163_RAM(data);
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

NES.prototype.Mapper19.prototype.Write = function(address, data) {
	switch (address & 0xF800) {
		case 0x8000:
			if(data < 0xE0 || this.MAPPER_REG[0] === 1) {
				this.Core.SetChrRomPage1K(0, data);
			} else {
				this.Core.VRAM[0] = this.EX_VRAM[data &0xE0];
			}
			break;

		case 0x8800:
			if(data < 0xE0 || this.MAPPER_REG[0] === 1) {
				this.Core.SetChrRomPage1K(1, data);
			} else {
				this.Core.VRAM[1] = this.EX_VRAM[data &0xE0];
			}
			break;

		case 0x9000:
			if(data < 0xE0 || this.MAPPER_REG[0] === 1) {
				this.Core.SetChrRomPage1K(2, data);
			} else {
				this.Core.VRAM[2] = this.EX_VRAM[data &0xE0];
			}
			break;

		case 0x9800:
			if(data < 0xE0 || this.MAPPER_REG[0] === 1) {
				this.Core.SetChrRomPage1K(3, data);
			} else {
				this.Core.VRAM[3] = this.EX_VRAM[data &0xE0];
			}
			break;

		case 0xA000:
			if(data < 0xE0 || this.MAPPER_REG[1] === 1) {
				this.Core.SetChrRomPage1K(4, data);
			} else {
				this.Core.VRAM[4] = this.EX_VRAM[data &0xE0];
			}
			break;

		case 0xA800:
			if(data < 0xE0 || this.MAPPER_REG[1] === 1) {
				this.Core.SetChrRomPage1K(5, data);
			} else {
				this.Core.VRAM[5] = this.EX_VRAM[data &0xE0];
			}
			break;

		case 0xB000:
			if(data < 0xE0 || this.MAPPER_REG[1] === 1) {
				this.Core.SetChrRomPage1K(6, data);
			} else {
				this.Core.VRAM[6] = this.EX_VRAM[data &0xE0];
			}
			break;

		case 0xB800:
			if(data < 0xE0 || this.MAPPER_REG[1] === 1) {
				this.Core.SetChrRomPage1K(7, data);
			} else {
				this.Core.VRAM[7] = this.EX_VRAM[data &0xE0];
			}
			break;

		case 0xC000:
			if(data < 0xE0) {
				this.Core.SetChrRomPage1K(8, data);
			} else {
				this.Core.VRAM[8] = this.Core.VRAMS[(data & 0x01) + 8];
			}
			break;

		case 0xC800:
			if(data < 0xE0) {
				this.Core.SetChrRomPage1K(9, data);
			} else {
				this.Core.VRAM[9] = this.Core.VRAMS[(data & 0x01) + 8];
			}
			break;

		case 0xD000:
			if(data < 0xE0) {
				this.Core.SetChrRomPage1K(10, data);
			} else {
				this.Core.VRAM[10] = this.Core.VRAMS[(data & 0x01) + 8];
			}
			break;

		case 0xD800:
			if(data < 0xE0) {
				this.Core.SetChrRomPage1K(11, data);
			} else {
				this.Core.VRAM[11] = this.Core.VRAMS[(data & 0x01) + 8];
			}
			break;

		case 0xE000:
			this.Core.SetPrgRomPage8K(0, data & 0x3F);
			break;

		case 0xE800:
			this.Core.SetPrgRomPage8K(1, data & 0x3F);
			this.MAPPER_REG[0] = (data & 0x40) >> 6;
			this.MAPPER_REG[1] = (data & 0x80) >> 7;
			break;

		case 0xF000:
			this.Core.SetPrgRomPage8K(2, data & 0x3F);
			break;

		case 0xF800:
			if(address === 0xF800) {
				this.Core.N163_Address = data;
			}
			break;
	}
};

NES.prototype.Mapper19.prototype.CPUSync = function(clock) {
	if(this.MAPPER_REG[3] !== 0) {
		this.MAPPER_REG[4] += clock;
		if(this.MAPPER_REG[4] >= 0x7FFF) {
			this.MAPPER_REG[4] -= 0x7FFF;
			this.SetIRQ();
		}
	}
};

NES.prototype.Mapper19.prototype.OutEXSound = function(soundin) {
	return (soundin >> 1) + (this.Core.Out_N163() >> 1);
};

NES.prototype.Mapper19.prototype.EXSoundSync = function(clock) {
	this.Core.Count_N163(clock);
};


/**** Mapper20 ****/
/* Disk System Code it's not seem to be non-need
 * TODO:
NES.prototype.Mapper20 = function(core) {
	NES.prototype.MapperProto.apply(this, arguments);

	this.Disk = null;
	this.DISK_PAGES = null;
	this.DISK_PAGES_COUNT = 0;

	this.MAPPER_REG = new Array(8);

	this.Side = -1;
	this.Position = 0;

	this.IrqEnable = 0;
	this.IrqCounter = 0;
	this.IrqLatch = 0;

	this.IrqWait = 0;
	this.WriteSkip = 0;
};

NES.prototype.Mapper20.prototype = Object.create(NES.prototype.MapperProto.prototype);

NES.prototype.Mapper20.prototype.Init = function() {
	for(var i=0; i<this.MAPPER_REG.length; i++)
		this.MAPPER_REG[i] = 0;

	this.Core.SetPrgRomPage8K(3, 3);
};

NES.prototype.Mapper20.prototype.Write = function(address, data) {
	switch(address & 0xE000) {
		case 0x8000:
			this.Core.ROM[0][address & 0x1FFF] = data;
			break;
		case 0xA000:
			this.Core.ROM[1][address & 0x1FFF] = data;
			break;
		case 0xC000:
			this.Core.ROM[2][address & 0x1FFF] = data;
			break;
	}
};

NES.prototype.Mapper20.prototype.InDisk = function() {
	if(this.DISK_PAGES_COUNT === 0)
		return -2;
	return this.Side;
};

NES.prototype.Mapper20.prototype.GetDiskPagesCount = function() {
	return this.DISK_PAGES_COUNT;
};

NES.prototype.Mapper20.prototype.InsertDisk = function(side) {
	if(this.DISK_PAGES_COUNT > 0 && side < this.DISK_PAGES_COUNT && this.Side === -1) {
		this.Side = side;
		this.Position = 0;
		return true;
	}
	return false;
};

NES.prototype.Mapper20.prototype.EjectDisk = function() {
	this.Side = -1;
};

NES.prototype.Mapper20.prototype.SetDisk = function(disk) {
	this.Disk = disk.concat(0);
	var padd = 0;

	if(this.Disk[0] === 0x46 && this.Disk[1] === 0x44 && this.Disk[2] === 0x53 && this.Disk[3] === 0x1A) {
		this.DISK_PAGES_COUNT = this.Disk[4];
		var padd = 16;
	} else
		this.DISK_PAGES_COUNT = (this.Disk.length / 65500) | 0;
	this.DISK_PAGES = new Array(this.DISK_PAGES_COUNT);
	for(var i=0; i<this.DISK_PAGES_COUNT; i++)
		this.DISK_PAGES[i] = this.Disk.slice(padd + 65500 * i, padd + 65500 * (i + 1));

	this.Side = -1;
	this.Position = 0;
};

NES.prototype.Mapper20.prototype.ReadLow = function(address) {
	switch (address) {
		case 0x4030:
			var tmp = (this.Core.toIRQ & 0x0C) >> 2;
			this.ClearIRQ();
			this.ClearSeekIRQ();
			return tmp;
		case 0x4031:
			if(this.Side > -1) {
				var tmp = this.DISK_PAGES[this.Side][this.Position];
					this.Position += this.Position < 64999 ? 1 : 0;
					this.IrqWait = 200;
					this.ClearSeekIRQ();
				return tmp;
			} else
				return 0xFF;
		case 0x4032:
			var tmp = this.Side > -1 ? 0x40 : 0x45;
			tmp |= ((this.Side > -1) && ((this.MAPPER_REG[5] & 0x03) === 0x01)) ? 0x00 : 0x02;
			return tmp;
		case 0x4033:
			return 0x80;
	}
	return 0x00;
};

NES.prototype.Mapper20.prototype.WriteLow = function(address, data) {
	if(address >= 0x4040 && address <= 0x407F) {
		this.Core.Write_FDS_WAVE_REG(address - 0x4040, data);
		return;
	}

	if(address >= 0x4080 && address <= 0x408A) {
		this.Core.Write_FDS_REG(address - 0x4080, data);
		return;
	}

	switch (address) {
		case 0x4020:
			this.IrqLatch = (this.IrqLatch & 0xFF00) | data;
			break;
		case 0x4021:
			this.IrqLatch = (this.IrqLatch & 0x00FF) | (data << 8);
			break;
		case 0x4022:
			this.IrqCounter = this.IrqLatch;
			this.IrqEnable = data & 0x03;
			break;
		case 0x4023:
			break;
		case 0x4024:
			if (this.Side > -1 && (this.MAPPER_REG[5] & 0x04) !== 0x04 && (this.MAPPER_REG[3] & 0x01) === 0x01) {
				if (this.Position >= 0 && this.Position < 65500) {
					if (this.WriteSkip > 0)
						this.WriteSkip--;
					else if (this.Position >= 2) {
						this.DISK_PAGES[this.Side][this.Position - 2] = data;
					}
				}
			}
			break;
		case 0x4025:
			this.ClearSeekIRQ();
			if(this.Side > -1) {
				if((data & 0x40) !== 0x40) {
					if((this.MAPPER_REG[5] & 0x40) === 0x40 && (data & 0x10) !== 0x10) {
						this.IrqWait = 200;
						this.Position -= 2;
					}
					if(this.Position < 0)
						this.Position = 0;
				}
				if((data & 0x04) !== 0x04)
					this.WriteSkip = 2;
				if((data & 0x02) === 0x02) {
					this.Position = 0;
					this.IrqWait = 200;
				}
				if((data & 0x40) === 0x40) {
					this.IrqWait = 200;
				}
			}

			this.Core.SetMirror((data & 0x08) === 0x08);
			break;
	}
	this.MAPPER_REG[address & 0x0007] = data;
};

NES.prototype.Mapper20.prototype.SetSeekIRQ = function() {
	this.Core.toIRQ |= 0x08;
};

NES.prototype.Mapper20.prototype.ClearSeekIRQ = function() {
	this.Core.toIRQ &= ~0x08;
};

NES.prototype.Mapper20.prototype.CPUSync = function(clock) {
	if ((this.IrqEnable & 0x02) === 0x02 && this.IrqCounter > 0) {
		this.IrqCounter -= clock;
		if (this.IrqCounter <= 0) {
			if ((this.IrqEnable & 0x01) !== 0x01) {
				this.IrqEnable &= ~0x02;
				this.IrqCounter = 0;
				this.IrqLatch = 0;
			} else
				this.IrqCounter = this.IrqLatch;
				this.SetIRQ();
		}
	}

	if(this.IrqWait > 0) {
		this.IrqWait -= clock;
		if(this.IrqWait <= 0) {
			if((this.MAPPER_REG[5] & 0x80) === 0x80) {
				this.SetSeekIRQ();
			}
		}
	}
};

NES.prototype.Mapper20.prototype.OutEXSound = function(soundin) {
	return (soundin >> 1) + (this.Core.Out_FDS() >> 1);
};

NES.prototype.Mapper20.prototype.EXSoundSync = function(clock) {
	this.Core.Count_FDS(clock);
};


/**** Mapper22 ****/
NES.prototype.Mapper22 = function(core) {
	NES.prototype.MapperProto.apply(this, arguments);
	this.MAPPER_REG = new Array(16);
};

NES.prototype.Mapper22.prototype = Object.create(NES.prototype.MapperProto.prototype);

NES.prototype.Mapper22.prototype.Init = function() {
	var i;
	for(i=0; i<this.MAPPER_REG.length; i++)
		this.MAPPER_REG[i] = 0;

	this.Core.SetPrgRomPages8K(0, 1, this.Core.PrgRomPageCount * 2 - 2, this.Core.PrgRomPageCount * 2 - 1);

	if(this.Core.ChrRomPageCount !== 0) {
		this.Core.SetChrRomPages1K(0, 1, 2, 3, 4, 5, 6, 7);
	}
};

NES.prototype.Mapper22.prototype.Write = function(address, data) {
	switch (address & 0xF000) {
		case 0x8000:
			if((this.MAPPER_REG[10] & 0x02) !== 0)
				this.Core.SetPrgRomPage8K(2, data);
			else
				this.Core.SetPrgRomPage8K(0, data);
			break;

		case 0xA000:
			this.Core.SetPrgRomPage8K(1, data);
			break;
	}

	switch (address & 0xF00F) {
		case 0x9000:
			data &= 0x03;
			if(data === 0) {
				this.Core.SetMirror(false);
			} else if(data === 1) {
				this.Core.SetMirror(true);
			} else if(data === 2) {
				this.Core.SetMirrors(0, 0, 0, 0);
			} else {
				this.Core.SetMirrors(1, 1, 1, 1);
			}
			break;

		case 0x9008:
			this.MAPPER_REG[10] = data;
			break;

		case 0xB000:
			this.MAPPER_REG[0] = (this.MAPPER_REG[0] & 0xF0) | (data & 0x0F);
			this.Core.SetChrRomPage1K(0, this.MAPPER_REG[0] >> 1);
			break;

		case 0xB002:
		case 0xB008:
			this.MAPPER_REG[0] = (this.MAPPER_REG[0] & 0x0F) | ((data & 0x0F) << 4);
			this.Core.SetChrRomPage1K(0, this.MAPPER_REG[0] >> 1);
			break;

		case 0xB001:
		case 0xB004:
			this.MAPPER_REG[1] = (this.MAPPER_REG[1] & 0xF0) | (data & 0x0F);
			this.Core.SetChrRomPage1K(1, this.MAPPER_REG[1] >> 1);
			break;

		case 0xB003:
		case 0xB00C:
			this.MAPPER_REG[1] = (this.MAPPER_REG[1] & 0x0F) | ((data & 0x0F) << 4);
			this.Core.SetChrRomPage1K(1, this.MAPPER_REG[1] >> 1);
			break;

		case 0xC000:
			this.MAPPER_REG[2] = (this.MAPPER_REG[2] & 0xF0) | (data & 0x0F);
			this.Core.SetChrRomPage1K(2, this.MAPPER_REG[2] >> 1);
			break;

		case 0xC002:
		case 0xC008:
			this.MAPPER_REG[2] = (this.MAPPER_REG[2] & 0x0F) | ((data & 0x0F) << 4);
			this.Core.SetChrRomPage1K(2, this.MAPPER_REG[2] >> 1);
			break;

		case 0xC001:
		case 0xC004:
			this.MAPPER_REG[3] = (this.MAPPER_REG[3] & 0xF0) | (data & 0x0F);
			this.Core.SetChrRomPage1K(3, this.MAPPER_REG[3] >> 1);
			break;

		case 0xC003:
		case 0xC00C:
			this.MAPPER_REG[3] = (this.MAPPER_REG[3] & 0x0F) | ((data & 0x0F) << 4);
			this.Core.SetChrRomPage1K(3, this.MAPPER_REG[3] >> 1);
			break;

		case 0xD000:
			this.MAPPER_REG[4] = (this.MAPPER_REG[4] & 0xF0) | (data & 0x0F);
			this.Core.SetChrRomPage1K(4, this.MAPPER_REG[4] >> 1);
			break;

		case 0xD002:
		case 0xD008:
			this.MAPPER_REG[4] = (this.MAPPER_REG[4] & 0x0F) | ((data & 0x0F) << 4);
			this.Core.SetChrRomPage1K(4, this.MAPPER_REG[4] >> 1);
			break;

		case 0xD001:
		case 0xD004:
			this.MAPPER_REG[5] = (this.MAPPER_REG[5] & 0xF0) | (data & 0x0F);
			this.Core.SetChrRomPage1K(5, this.MAPPER_REG[5] >> 1);
			break;

		case 0xD003:
		case 0xD00C:
			this.MAPPER_REG[5] = (this.MAPPER_REG[5] & 0x0F) | ((data & 0x0F) << 4);
			this.Core.SetChrRomPage1K(5, this.MAPPER_REG[5] >> 1);
			break;

		case 0xE000:
			this.MAPPER_REG[6] = (this.MAPPER_REG[6] & 0xF0) | (data & 0x0F);
			this.Core.SetChrRomPage1K(6, this.MAPPER_REG[6] >> 1);
			break;

		case 0xE002:
		case 0xE008:
			this.MAPPER_REG[6] = (this.MAPPER_REG[6] & 0x0F) | ((data & 0x0F) << 4);
			this.Core.SetChrRomPage1K(6, this.MAPPER_REG[6] >> 1);
			break;

		case 0xE001:
		case 0xE004:
			this.MAPPER_REG[7] = (this.MAPPER_REG[7] & 0xF0) | (data & 0x0F);
			this.Core.SetChrRomPage1K(7, this.MAPPER_REG[7] >> 1);
			break;

		case 0xE003:
		case 0xE00C:
			this.MAPPER_REG[7] = (this.MAPPER_REG[7] & 0x0F) | ((data & 0x0F) << 4);
			this.Core.SetChrRomPage1K(7, this.MAPPER_REG[7] >> 1);
			break;
	}
};


/**** Mapper23 ****/
NES.prototype.Mapper23 = function(core) {
	NES.prototype.MapperProto.apply(this, arguments);
	this.MAPPER_REG = new Array(16);
};

NES.prototype.Mapper23.prototype = Object.create(NES.prototype.MapperProto.prototype);

NES.prototype.Mapper23.prototype.Init = function() {
	var i;
	for(i=0; i<this.MAPPER_REG.length; i++)
		this.MAPPER_REG[i] = 0;

	this.Core.SetPrgRomPages8K(0, 1, this.Core.PrgRomPageCount * 2 - 2, this.Core.PrgRomPageCount * 2 - 1);

	if(this.Core.ChrRomPageCount !== 0) {
		this.Core.SetChrRomPages1K(0, 1, 2, 3, 4, 5, 6, 7);
	}
};

NES.prototype.Mapper23.prototype.Write = function(address, data) {
	switch (address & 0xF000) {
		case 0x8000:
			if((this.MAPPER_REG[10] & 0x02) !== 0)
				this.Core.SetPrgRomPage8K(2, data);
			else
				this.Core.SetPrgRomPage8K(0, data);
			break;

		case 0xA000:
			this.Core.SetPrgRomPage8K(1, data);
			break;
	}

	switch (address & 0xF00F) {
		case 0x9000:
			data &= 0x03;
			if(data === 0) {
				this.Core.SetMirror(false);
			} else if(data === 1) {
				this.Core.SetMirror(true);
			} else if(data === 2) {
				this.Core.SetMirrors(0, 0, 0, 0);
			} else {
				this.Core.SetMirrors(1, 1, 1, 1);
			}
			break;

		case 0x9008:
			this.MAPPER_REG[10] = data;
			break;

		case 0xB000:
			this.MAPPER_REG[0] = (this.MAPPER_REG[0] & 0xF0) | (data & 0x0F);
			this.Core.SetChrRomPage1K(0, this.MAPPER_REG[0]);
			break;

		case 0xB001:
		case 0xB004:
			this.MAPPER_REG[0] = (this.MAPPER_REG[0] & 0x0F) | ((data & 0x0F) << 4);
			this.Core.SetChrRomPage1K(0, this.MAPPER_REG[0]);
			break;

		case 0xB002:
		case 0xB008:
			this.MAPPER_REG[1] = (this.MAPPER_REG[1] & 0xF0) | (data & 0x0F);
			this.Core.SetChrRomPage1K(1, this.MAPPER_REG[1]);
			break;

		case 0xB003:
		case 0xB00C:
			this.MAPPER_REG[1] = (this.MAPPER_REG[1] & 0x0F) | ((data & 0x0F) << 4);
			this.Core.SetChrRomPage1K(1, this.MAPPER_REG[1]);
			break;

		case 0xC000:
			this.MAPPER_REG[2] = (this.MAPPER_REG[2] & 0xF0) | (data & 0x0F);
			this.Core.SetChrRomPage1K(2, this.MAPPER_REG[2]);
			break;

		case 0xC001:
		case 0xC004:
			this.MAPPER_REG[2] = (this.MAPPER_REG[2] & 0x0F) | ((data & 0x0F) << 4);
			this.Core.SetChrRomPage1K(2, this.MAPPER_REG[2]);
			break;

		case 0xC002:
		case 0xC008:
			this.MAPPER_REG[3] = (this.MAPPER_REG[3] & 0xF0) | (data & 0x0F);
			this.Core.SetChrRomPage1K(3, this.MAPPER_REG[3]);
			break;

		case 0xC003:
		case 0xC00C:
			this.MAPPER_REG[3] = (this.MAPPER_REG[3] & 0x0F) | ((data & 0x0F) << 4);
			this.Core.SetChrRomPage1K(3, this.MAPPER_REG[3]);
			break;

		case 0xD000:
			this.MAPPER_REG[4] = (this.MAPPER_REG[4] & 0xF0) | (data & 0x0F);
			this.Core.SetChrRomPage1K(4, this.MAPPER_REG[4]);
			break;

		case 0xD001:
		case 0xD004:
			this.MAPPER_REG[4] = (this.MAPPER_REG[4] & 0x0F) | ((data & 0x0F) << 4);
			this.Core.SetChrRomPage1K(4, this.MAPPER_REG[4]);
			break;

		case 0xD002:
		case 0xD008:
			this.MAPPER_REG[5] = (this.MAPPER_REG[5] & 0xF0) | (data & 0x0F);
			this.Core.SetChrRomPage1K(5, this.MAPPER_REG[5]);
			break;

		case 0xD003:
		case 0xD00C:
			this.MAPPER_REG[5] = (this.MAPPER_REG[5] & 0x0F) | ((data & 0x0F) << 4);
			this.Core.SetChrRomPage1K(5, this.MAPPER_REG[5]);
			break;

		case 0xE000:
			this.MAPPER_REG[6] = (this.MAPPER_REG[6] & 0xF0) | (data & 0x0F);
			this.Core.SetChrRomPage1K(6, this.MAPPER_REG[6]);
			break;

		case 0xE001:
		case 0xE004:
			this.MAPPER_REG[6] = (this.MAPPER_REG[6] & 0x0F) | ((data & 0x0F) << 4);
			this.Core.SetChrRomPage1K(6, this.MAPPER_REG[6]);
			break;

		case 0xE002:
		case 0xE008:
			this.MAPPER_REG[7] = (this.MAPPER_REG[7] & 0xF0) | (data & 0x0F);
			this.Core.SetChrRomPage1K(7, this.MAPPER_REG[7]);
			break;

		case 0xE003:
		case 0xE00C:
			this.MAPPER_REG[7] = (this.MAPPER_REG[7] & 0x0F) | ((data & 0x0F) << 4);
			this.Core.SetChrRomPage1K(7, this.MAPPER_REG[7]);
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

NES.prototype.Mapper23.prototype.HSync = function(y) {
	if((this.MAPPER_REG[11] & 0x06) === 0x02) {
		if(this.MAPPER_REG[12] === 0xFF) {
			this.MAPPER_REG[12] = this.MAPPER_REG[13];
			this.SetIRQ();
		} else
			this.MAPPER_REG[12]++;
	}
};

NES.prototype.Mapper23.prototype.CPUSync = function(clock) {
	if((this.MAPPER_REG[11] & 0x06) === 0x06) {
		if(this.MAPPER_REG[12] >= 0xFF) {
			this.MAPPER_REG[12] = this.MAPPER_REG[13];
			this.SetIRQ();
		} else
			this.MAPPER_REG[12] += clock;
	}
};


/**** Mapper24 ****/
NES.prototype.Mapper24 = function(core) {
	NES.prototype.MapperProto.apply(this, arguments);
	this.MAPPER_REG = new Array(3);
};

NES.prototype.Mapper24.prototype = Object.create(NES.prototype.MapperProto.prototype);

NES.prototype.Mapper24.prototype.Init = function() {
	this.MAPPER_REG[0] = 0x00;
	this.MAPPER_REG[1] = 0x00;
	this.MAPPER_REG[2] = 0x00;
	this.Core.SetPrgRomPages8K(0, 1, 2, this.Core.PrgRomPageCount * 2 - 1);
	this.Core.SetChrRomPages1K(0, 1, 2, 3, 4, 5, 6, 7);
};

NES.prototype.Mapper24.prototype.Write = function(address, data) {
	switch(address & 0xF003) {
		case 0x8000:
		case 0x8001:
		case 0x8002:
		case 0x8003:
			this.Core.SetPrgRomPage8K(0, data * 2);
			this.Core.SetPrgRomPage8K(1, data * 2 + 1);
			break;


		case 0x9000:
		case 0x9001:
		case 0x9002:
			this.Core.Write_VRC6_REG(address & 0x03, data);
			break;


		case 0xA000:
		case 0xA001:
		case 0xA002:
			this.Core.Write_VRC6_REG((address & 0x03) + 4, data);
			break;


		case 0xB000:
		case 0xB001:
		case 0xB002:
			this.Core.Write_VRC6_REG((address & 0x03) + 8, data);
			break;


		case 0xB003:
			data &= 0x0C;
			if(data === 0x00) {
				this.Core.SetMirror(false);
			} else if(data === 0x04) {
				this.Core.SetMirror(true);
			} else if(data === 0x08) {
				this.Core.SetMirrors(0, 0, 0, 0);
			} else {
				this.Core.SetMirrors(1, 1, 1, 1);
			}
			break;

		case 0xC000:
		case 0xC001:
		case 0xC002:
		case 0xC003:
			this.Core.SetPrgRomPage8K(2, data);
			break;

		case 0xD000:
		case 0xD001:
		case 0xD002:
		case 0xD003:
			this.Core.SetChrRomPage1K(address & 0x03, data);
			break;

		case 0xE000:
		case 0xE001:
		case 0xE002:
		case 0xE003:
			this.Core.SetChrRomPage1K((address & 0x03) + 4, data);
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

NES.prototype.Mapper24.prototype.HSync = function(y) {
	if((this.MAPPER_REG[1] & 0x06) === 0x02) {
		if(this.MAPPER_REG[2] === 0xFF) {
			this.MAPPER_REG[2] = this.MAPPER_REG[0];
			this.SetIRQ();
		} else
			this.MAPPER_REG[2]++;
	}
};

NES.prototype.Mapper24.prototype.CPUSync = function(clock) {
	if((this.MAPPER_REG[1] & 0x06) === 0x06) {
		if(this.MAPPER_REG[2] >= 0xFF) {
			this.MAPPER_REG[2] = this.MAPPER_REG[0];
			this.SetIRQ();
		} else
			this.MAPPER_REG[2] += clock;
	}
};

NES.prototype.Mapper24.prototype.OutEXSound = function(soundin) {
	return (soundin >> 1) + (this.Core.Out_VRC6() >> 1);
};

NES.prototype.Mapper24.prototype.EXSoundSync = function(clock) {
	this.Core.Count_VRC6(clock);
};


/**** Mapper25 ****/
NES.prototype.Mapper25 = function(core) {
	NES.prototype.MapperProto.apply(this, arguments);
	this.MAPPER_REG = new Array(16);
};

NES.prototype.Mapper25.prototype = Object.create(NES.prototype.MapperProto.prototype);

NES.prototype.Mapper25.prototype.Init = function() {
	var i;
	for(i=0; i<this.MAPPER_REG.length; i++)
		this.MAPPER_REG[i] = 0;

	this.Core.SetPrgRomPages8K(0, 1, this.Core.PrgRomPageCount * 2 - 2, this.Core.PrgRomPageCount * 2 - 1);

	if(this.Core.ChrRomPageCount !== 0) {
		this.Core.SetChrRomPages1K(0, 1, 2, 3, 4, 5, 6, 7);
	}
	this.MAPPER_REG[9] = this.Core.PrgRomPageCount * 2 - 2;
};

NES.prototype.Mapper25.prototype.Write = function(address, data) {
	switch (address & 0xF000) {
		case 0x8000:
			if((this.MAPPER_REG[10] & 0x02) !== 0) {
				this.MAPPER_REG[9] = data;
				this.Core.SetPrgRomPage8K(2, data);
			} else {
				this.MAPPER_REG[8] = data;
				this.Core.SetPrgRomPage8K(0, data);
			}
			break;

		case 0xA000:
			this.Core.SetPrgRomPage8K(1, data);
			break;
	}

	switch (address & 0xF00F) {
		case 0x9000:
			data &= 0x03;
			if(data === 0) {
				this.Core.SetMirror(false);
			} else if(data === 1) {
				this.Core.SetMirror(true);
			} else if(data === 2) {
				this.Core.SetMirrors(0, 0, 0, 0);
			} else {
				this.Core.SetMirrors(1, 1, 1, 1);
			}
			break;

		case 0x9001:
		case 0x9004:
			if((this.MAPPER_REG[10] & 0x02) !== (data & 0x02)) {
				var swap = this.MAPPER_REG[8];
				this.MAPPER_REG[8] = this.MAPPER_REG[9];
				this.MAPPER_REG[9] = swap;
				this.Core.SetPrgRomPage8K(0, this.MAPPER_REG[8]);
				this.Core.SetPrgRomPage8K(2, this.MAPPER_REG[9]);
			}
			this.MAPPER_REG[10] = data;
			break;

		case 0xB000:
			this.MAPPER_REG[0] = (this.MAPPER_REG[0] & 0xF0) | (data & 0x0F);
			this.Core.SetChrRomPage1K(0, this.MAPPER_REG[0]);
			break;

		case 0xB001:
		case 0xB004:
			this.MAPPER_REG[1] = (this.MAPPER_REG[1] & 0xF0) | (data & 0x0F);
			this.Core.SetChrRomPage1K(1, this.MAPPER_REG[1]);
			break;

		case 0xB002:
		case 0xB008:
			this.MAPPER_REG[0] = (this.MAPPER_REG[0] & 0x0F) | ((data & 0x0F) << 4);
			this.Core.SetChrRomPage1K(0, this.MAPPER_REG[0]);
			break;

		case 0xB003:
		case 0xB00C:
			this.MAPPER_REG[1] = (this.MAPPER_REG[1] & 0x0F) | ((data & 0x0F) << 4);
			this.Core.SetChrRomPage1K(1, this.MAPPER_REG[1]);
			break;

		case 0xC000:
			this.MAPPER_REG[2] = (this.MAPPER_REG[2] & 0xF0) | (data & 0x0F);
			this.Core.SetChrRomPage1K(2, this.MAPPER_REG[2]);
			break;

		case 0xC001:
		case 0xC004:
			this.MAPPER_REG[3] = (this.MAPPER_REG[3] & 0xF0) | (data & 0x0F);
			this.Core.SetChrRomPage1K(3, this.MAPPER_REG[3]);
			break;

		case 0xC002:
		case 0xC008:
			this.MAPPER_REG[2] = (this.MAPPER_REG[2] & 0x0F) | ((data & 0x0F) << 4);
			this.Core.SetChrRomPage1K(2, this.MAPPER_REG[2]);
			break;

		case 0xC003:
		case 0xC00C:
			this.MAPPER_REG[3] = (this.MAPPER_REG[3] & 0x0F) | ((data & 0x0F) << 4);
			this.Core.SetChrRomPage1K(3, this.MAPPER_REG[3]);
			break;

		case 0xD000:
			this.MAPPER_REG[4] = (this.MAPPER_REG[4] & 0xF0) | (data & 0x0F);
			this.Core.SetChrRomPage1K(4, this.MAPPER_REG[4]);
			break;

		case 0xD001:
		case 0xD004:
			this.MAPPER_REG[5] = (this.MAPPER_REG[5] & 0xF0) | (data & 0x0F);
			this.Core.SetChrRomPage1K(5, this.MAPPER_REG[5]);
			break;

		case 0xD002:
		case 0xD008:
			this.MAPPER_REG[4] = (this.MAPPER_REG[4] & 0x0F) | ((data & 0x0F) << 4);
			this.Core.SetChrRomPage1K(4, this.MAPPER_REG[4]);
			break;

		case 0xD003:
		case 0xD00C:
			this.MAPPER_REG[5] = (this.MAPPER_REG[5] & 0x0F) | ((data & 0x0F) << 4);
			this.Core.SetChrRomPage1K(5, this.MAPPER_REG[5]);
			break;

		case 0xE000:
			this.MAPPER_REG[6] = (this.MAPPER_REG[6] & 0xF0) | (data & 0x0F);
			this.Core.SetChrRomPage1K(6, this.MAPPER_REG[6]);
			break;

		case 0xE001:
		case 0xE004:
			this.MAPPER_REG[7] = (this.MAPPER_REG[7] & 0xF0) | (data & 0x0F);
			this.Core.SetChrRomPage1K(7, this.MAPPER_REG[7]);
			break;

		case 0xE002:
		case 0xE008:
			this.MAPPER_REG[6] = (this.MAPPER_REG[6] & 0x0F) | ((data & 0x0F) << 4);
			this.Core.SetChrRomPage1K(6, this.MAPPER_REG[6]);
			break;

		case 0xE003:
		case 0xE00C:
			this.MAPPER_REG[7] = (this.MAPPER_REG[7] & 0x0F) | ((data & 0x0F) << 4);
			this.Core.SetChrRomPage1K(7, this.MAPPER_REG[7]);
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

NES.prototype.Mapper25.prototype.HSync = function(y) {
	if((this.MAPPER_REG[11] & 0x06) === 0x02) {
		if(this.MAPPER_REG[12] === 0xFF) {
			this.MAPPER_REG[12] = this.MAPPER_REG[13];
			this.SetIRQ();
		} else
			this.MAPPER_REG[12]++;
	}
};

NES.prototype.Mapper25.prototype.CPUSync = function(clock) {
	if((this.MAPPER_REG[11] & 0x06) === 0x06) {
		if(this.MAPPER_REG[12] >= 0xFF) {
			this.MAPPER_REG[12] = this.MAPPER_REG[13];
			this.SetIRQ();
		} else
			this.MAPPER_REG[12] += clock;
	}
};


/**** Mapper26 ****/
NES.prototype.Mapper26 = function(core) {
	NES.prototype.MapperProto.apply(this, arguments);
	this.MAPPER_REG = new Array(3);
};

NES.prototype.Mapper26.prototype = Object.create(NES.prototype.MapperProto.prototype);

NES.prototype.Mapper26.prototype.Init = function() {
	this.MAPPER_REG[0] = 0x00;
	this.MAPPER_REG[1] = 0x00;
	this.MAPPER_REG[2] = 0x00;
	this.Core.SetPrgRomPages8K(0, 1, 2, this.Core.PrgRomPageCount * 2 - 1);
	this.Core.SetChrRomPages1K(0, 1, 2, 3, 4, 5, 6, 7);
};

NES.prototype.Mapper26.prototype.Write = function(address, data) {
	address = (address & 0xFFFC) | ((address & 0x0002) >> 1) | ((address & 0x0001) << 1);

	switch(address & 0xF003) {
		case 0x8000:
		case 0x8001:
		case 0x8002:
		case 0x8003:
			this.Core.SetPrgRomPage8K(0, data * 2);
			this.Core.SetPrgRomPage8K(1, data * 2 + 1);
			break;


		case 0x9000:
		case 0x9001:
		case 0x9002:
			this.Core.Write_VRC6_REG(address & 0x03, data);
			break;


		case 0xA000:
		case 0xA001:
		case 0xA002:
			this.Core.Write_VRC6_REG((address & 0x03) + 4, data);
			break;


		case 0xB000:
		case 0xB001:
		case 0xB002:
			this.Core.Write_VRC6_REG((address & 0x03) + 8, data);
			break;


		case 0xB003:
			data &= 0x0C;
			if(data === 0x00) {
				this.Core.SetMirror(false);
			} else if(data === 0x04) {
				this.Core.SetMirror(true);
			} else if(data === 0x08) {
				this.Core.SetMirrors(0, 0, 0, 0);
			} else {
				this.Core.SetMirrors(1, 1, 1, 1);
			}
			break;

		case 0xC000:
		case 0xC001:
		case 0xC002:
		case 0xC003:
			this.Core.SetPrgRomPage8K(2, data);
			break;

		case 0xD000:
		case 0xD001:
		case 0xD002:
		case 0xD003:
			this.Core.SetChrRomPage1K(address & 0x03, data);
			break;

		case 0xE000:
		case 0xE001:
		case 0xE002:
		case 0xE003:
			this.Core.SetChrRomPage1K((address & 0x03) + 4, data);
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

NES.prototype.Mapper26.prototype.HSync = function(y) {
	if((this.MAPPER_REG[1] & 0x06) === 0x02) {
		if(this.MAPPER_REG[2] === 0xFF) {
			this.MAPPER_REG[2] = this.MAPPER_REG[0];
			this.SetIRQ();
		} else
			this.MAPPER_REG[2]++;
	}
};

NES.prototype.Mapper26.prototype.CPUSync = function(clock) {
	if((this.MAPPER_REG[1] & 0x06) === 0x06) {
		if(this.MAPPER_REG[2] >= 0xFF) {
			this.MAPPER_REG[2] = this.MAPPER_REG[0];
			this.SetIRQ();
		} else
			this.MAPPER_REG[2] += clock;
	}
};

NES.prototype.Mapper26.prototype.OutEXSound = function(soundin) {
	return (soundin >> 1) + (this.Core.Out_VRC6() >> 1);
};

NES.prototype.Mapper26.prototype.EXSoundSync = function(clock) {
	this.Core.Count_VRC6(clock);
};


/**** Mapper32 ****/
NES.prototype.Mapper32 = function(core) {
	NES.prototype.MapperProto.apply(this, arguments);
	this.MAPPER_REG = new Array(11);
};

NES.prototype.Mapper32.prototype = Object.create(NES.prototype.MapperProto.prototype);

NES.prototype.Mapper32.prototype.Init = function() {
	for(var i=0; i<this.MAPPER_REG.length; i++)
		this.MAPPER_REG[i] = 0;

	this.Core.SetPrgRomPages8K(0, 1, this.Core.PrgRomPageCount * 2 - 2, this.Core.PrgRomPageCount * 2 - 1);
	this.Core.SetChrRomPages1K(0, 1, 2, 3, 4, 5, 6, 7);
};

NES.prototype.Mapper32.prototype.Write = function(address, data) {
	switch (address & 0xF000) {
		case 0x8000:
			this.MAPPER_REG[8] = data;
			if((this.MAPPER_REG[10] & 0x02) === 0x00)
				this.Core.SetPrgRomPage8K(0, data);
			else
				this.Core.SetPrgRomPage8K(2, data);
			break;
		case 0x9000:
			this.MAPPER_REG[10] = data;
			if((data & 0x01) === 0x00)
				this.Core.SetMirror(false);
			else
				this.Core.SetMirror(true);

			if((data & 0x02) === 0x00) {
				this.Core.SetPrgRomPage8K(0, this.MAPPER_REG[8]);
				this.Core.SetPrgRomPage8K(2, (this.Core.PrgRomPageCount - 1) * 2);
			} else {
				this.Core.SetPrgRomPage8K(0, 0);
				this.Core.SetPrgRomPage8K(2, this.MAPPER_REG[8]);
			}
			break;
		case 0xA000:
			this.MAPPER_REG[9] = data;
			this.Core.SetPrgRomPage8K(1, data);
			break;
		case 0xB000:
			var tmp = address & 0x0007
			this.MAPPER_REG[tmp] = data;
			this.Core.SetChrRomPage1K(tmp, data);
			break;
	}
};


/**** Mapper33 ****/
NES.prototype.Mapper33 = function(core) {
	NES.prototype.MapperProto.apply(this, arguments);
};

NES.prototype.Mapper33.prototype = Object.create(NES.prototype.MapperProto.prototype);

NES.prototype.Mapper33.prototype.Init = function() {
	this.Core.SetPrgRomPages8K(0, 1, this.Core.PrgRomPageCount * 2 - 2, this.Core.PrgRomPageCount * 2 - 1);
	this.Core.SetChrRomPages1K(0, 1, 2, 3, 4, 5, 6, 7);
};

NES.prototype.Mapper33.prototype.Write = function(address, data) {
	switch (address & 0xA003) {
		case 0x8000:
			this.Core.SetPrgRomPage8K(0, data & 0x3F);
			if((data & 0x40) === 0x00)
				this.Core.SetMirror(false);
			else
				this.Core.SetMirror(true);
			break;
		case 0x8001:
			this.Core.SetPrgRomPage8K(1, data & 0x3F);
			break;
		case 0x8002:
			this.Core.SetChrRomPage1K(0, data << 1);
			this.Core.SetChrRomPage1K(1, (data << 1) + 1);
			break;
		case 0x8003:
			this.Core.SetChrRomPage1K(2, data << 1);
			this.Core.SetChrRomPage1K(3, (data << 1) + 1);
			break;
		case 0xA000:
			this.Core.SetChrRomPage1K(4, data);
			break;
		case 0xA001:
			this.Core.SetChrRomPage1K(5, data);
			break;
		case 0xA002:
			this.Core.SetChrRomPage1K(6, data);
			break;
		case 0xA003:
			this.Core.SetChrRomPage1K(7, data);
			break;
	}
};


/**** Mapper34 ****/
NES.prototype.Mapper34 = function(core) {
	NES.prototype.MapperProto.apply(this, arguments);
};

NES.prototype.Mapper34.prototype = Object.create(NES.prototype.MapperProto.prototype);

NES.prototype.Mapper34.prototype.Init = function() {
	this.Core.SetPrgRomPage(0, 0);
	this.Core.SetPrgRomPage(1, 1);
	this.Core.SetChrRomPage(0);
};

NES.prototype.Mapper34.prototype.Write = function(address, data) {
	var tmp = (data & 0x03) << 1;

	this.Core.SetPrgRomPage(0, tmp);
	this.Core.SetPrgRomPage(1, tmp + 1);
};


/**** Mapper48 ****/
NES.prototype.Mapper48 = function(core) {
	NES.prototype.MapperProto.apply(this, arguments);
	this.MAPPER_REG = new Array(3);
};

NES.prototype.Mapper48.prototype = Object.create(NES.prototype.MapperProto.prototype);

NES.prototype.Mapper48.prototype.Init = function() {
	for(var i=0; i<this.MAPPER_REG.length; i++)
		this.MAPPER_REG[i] = 0;

	this.Core.SetPrgRomPages8K(0, 1, this.Core.PrgRomPageCount * 2 - 2, this.Core.PrgRomPageCount * 2 - 1);
	this.Core.SetChrRomPages1K(0, 1, 2, 3, 4, 5, 6, 7);
};

NES.prototype.Mapper48.prototype.Write = function(address, data) {
	switch (address & 0xE003) {
		case 0x8000:
			this.Core.SetPrgRomPage8K(0, data);
			break;
		case 0x8001:
			this.Core.SetPrgRomPage8K(1, data);
			break;
		case 0x8002:
			this.Core.SetChrRomPage1K(0, data << 1);
			this.Core.SetChrRomPage1K(1, (data << 1) + 1);
			break;
		case 0x8003:
			this.Core.SetChrRomPage1K(2, data << 1);
			this.Core.SetChrRomPage1K(3, (data << 1) + 1);
			break;
		case 0xA000:
			this.Core.SetChrRomPage1K(4, data);
			break;
		case 0xA001:
			this.Core.SetChrRomPage1K(5, data);
			break;
		case 0xA002:
			this.Core.SetChrRomPage1K(6, data);
			break;
		case 0xA003:
			this.Core.SetChrRomPage1K(7, data);
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
				this.Core.SetMirror(false);
			else
				this.Core.SetMirror(true);
			break;
	}
};

NES.prototype.Mapper48.prototype.HSync = function(y) {
	if(this.MAPPER_REG[0] === 1 && y < 240 && (this.Core.IO1[0x01] & 0x08) === 0x08) {
		if(this.MAPPER_REG[1] === 0xFF) {
			this.SetIRQ();
			this.MAPPER_REG[0] = 0;
		}
		this.MAPPER_REG[1]++;
	}
};


/**** Mapper65 ****/
NES.prototype.Mapper65 = function(core) {
	NES.prototype.MapperProto.apply(this, arguments);
	this.IRQ_Counter = 0;
	this.IRQ_Value = 0;
	this.IRQ_Flag = false;
};

NES.prototype.Mapper65.prototype = Object.create(NES.prototype.MapperProto.prototype);

NES.prototype.Mapper65.prototype.Init = function() {
	this.Core.SetPrgRomPages8K(0, 1, this.Core.PrgRomPageCount * 2 - 2, this.Core.PrgRomPageCount * 2 - 1);
	this.Core.SetChrRomPages1K(0, 1, 2, 3, 4, 5, 6, 7);
	this.IRQ_Counter = 0;
};

NES.prototype.Mapper65.prototype.Write = function(address, data) {
	switch (address & 0xF000) {
		case 0x8000:
			this.Core.SetPrgRomPage8K(0, data);
			break;
		case 0x9000:
			switch(address) {
				case 0x9001:
					if((data & 0x80) === 0x00)
						this.Core.SetMirror(false);
					else
						this.Core.SetMirror(true);
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
			this.Core.SetPrgRomPage8K(1, data);
			break;
		case 0xB000:
		case 0xB001:
		case 0xB002:
		case 0xB003:
		case 0xB004:
		case 0xB005:
		case 0xB006:
		case 0xB007:
			this.Core.SetChrRomPage1K(address & 0x0007, data);
			break;
		case 0xC000:
			this.Core.SetPrgRomPage8K(2, data);
			break;
	}
};

NES.prototype.Mapper65.prototype.CPUSync = function(clock) {
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


/**** Mapper66 ****/
NES.prototype.Mapper66 = function(core) {
	NES.prototype.MapperProto.apply(this, arguments);
};

NES.prototype.Mapper66.prototype = Object.create(NES.prototype.MapperProto.prototype);

NES.prototype.Mapper66.prototype.Init = function() {
	this.Core.SetPrgRomPage(0, 0);
	this.Core.SetPrgRomPage(1, 1);
	this.Core.SetChrRomPage(0);
};

NES.prototype.Mapper66.prototype.Write = function(address, data) {
	var tmp = (data & 0x30) >> 3;
	this.Core.SetPrgRomPage(0, tmp);
	this.Core.SetPrgRomPage(1, tmp + 1);

	this.Core.SetChrRomPage(data & 0x03);
};


/**** Mapper67 ****/
NES.prototype.Mapper67 = function(core) {
	NES.prototype.MapperProto.apply(this, arguments);
	this.MAPPER_REG = new Array(8);
	this.IRQ_Toggle = 0x00;
};

NES.prototype.Mapper67.prototype = Object.create(NES.prototype.MapperProto.prototype);

NES.prototype.Mapper67.prototype.Init = function() {
	for(var i=0; i<this.MAPPER_REG.length; i++)
		this.MAPPER_REG[i] = 0;

	this.Core.SetPrgRomPages8K(0, 1, this.Core.PrgRomPageCount * 2 - 2, this.Core.PrgRomPageCount * 2 - 1);
	this.Core.SetChrRomPages1K(0, 1, 2, 3, this.Core.ChrRomPageCount * 8 - 4, this.Core.ChrRomPageCount * 8 - 3, this.Core.ChrRomPageCount * 8 - 2, this.Core.ChrRomPageCount * 8 - 1);

	this.IRQ_Toggle = 0x00;
};

NES.prototype.Mapper67.prototype.Write = function(address, data) {
	switch (address & 0xF800) {
		case 0x8800:
			this.MAPPER_REG[0] = data;
			this.Core.SetChrRomPage1K(0, data << 1);
			this.Core.SetChrRomPage1K(1, (data << 1) + 1);
			break;
		case 0x9800:
			this.MAPPER_REG[1] = data;
			this.Core.SetChrRomPage1K(2, data << 1);
			this.Core.SetChrRomPage1K(3, (data << 1) + 1);
			break;
		case 0xA800:
			this.MAPPER_REG[2] = data;
			this.Core.SetChrRomPage1K(4, data << 1);
			this.Core.SetChrRomPage1K(5, (data << 1) + 1);
			break;
		case 0xB800:
			this.MAPPER_REG[3] = data;
			this.Core.SetChrRomPage1K(6, data << 1);
			this.Core.SetChrRomPage1K(7, (data << 1) + 1);
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
				this.Core.SetMirror(false);
			} else if(data === 1) {
				this.Core.SetMirror(true);
			} else if(data === 2) {
				this.Core.SetMirrors(0, 0, 0, 0);
			} else {
				this.Core.SetMirrors(1, 1, 1, 1);
			}
			break;
		case 0xF800:
			this.MAPPER_REG[7] = data;
			this.Core.SetPrgRomPage8K(0, data << 1);
			this.Core.SetPrgRomPage8K(1, (data << 1) + 1);
			break;
	}
};

NES.prototype.Mapper67.prototype.CPUSync = function(clock) {
	if((this.MAPPER_REG[5] & 0x10) === 0x10) {
		this.MAPPER_REG[4] -= clock;
		if(this.MAPPER_REG[4] < 0) {
			this.MAPPER_REG[4] = 0xFFFF;
			this.MAPPER_REG[5] &= 0xEF;
			this.SetIRQ();
		}
	}
};


/**** Mapper68 ****/
NES.prototype.Mapper68 = function(core) {
	NES.prototype.MapperProto.apply(this, arguments);
	this.MAPPER_REG = new Array(8);
};

NES.prototype.Mapper68.prototype = Object.create(NES.prototype.MapperProto.prototype);

NES.prototype.Mapper68.prototype.Init = function() {
	for(var i=0; i<this.MAPPER_REG.length; i++)
		this.MAPPER_REG[i] = 0;

	this.Core.SetPrgRomPages8K(0, 1, this.Core.PrgRomPageCount * 2 - 2, this.Core.PrgRomPageCount * 2 - 1);
	this.Core.SetChrRomPages1K(0, 1, 2, 3, 4, 5, 6, 7);
};

NES.prototype.Mapper68.prototype.Write = function(address, data) {
	switch (address & 0xF000) {
		case 0x8000:
			this.MAPPER_REG[0] = data;
			this.Core.SetChrRomPage1K(0, data << 1);
			this.Core.SetChrRomPage1K(1, (data << 1) + 1);
			break;
		case 0x9000:
			this.MAPPER_REG[1] = data;
			this.Core.SetChrRomPage1K(2, data << 1);
			this.Core.SetChrRomPage1K(3, (data << 1) + 1);
			break;
		case 0xA000:
			this.MAPPER_REG[2] = data;
			this.Core.SetChrRomPage1K(4, data << 1);
			this.Core.SetChrRomPage1K(5, (data << 1) + 1);
			break;
		case 0xB000:
			this.MAPPER_REG[3] = data;
			this.Core.SetChrRomPage1K(6, data << 1);
			this.Core.SetChrRomPage1K(7, (data << 1) + 1);
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
			this.Core.SetPrgRomPage8K(0, data << 1);
			this.Core.SetPrgRomPage8K(1, (data << 1) + 1);
			break;
	}
};

NES.prototype.Mapper68.prototype.SetMirror = function() {
	switch (this.MAPPER_REG[6] & 0x11) {
		case 0x00:
			this.Core.SetMirror(false);
			break;
		case 0x01:
			this.Core.SetMirror(true);
			break;
		case 0x10:
			this.Core.SetChrRomPage1K(8, this.MAPPER_REG[4] | 0x80);
			this.Core.SetChrRomPage1K(9, this.MAPPER_REG[5] | 0x80);
			this.Core.SetChrRomPage1K(10, this.MAPPER_REG[4] | 0x80);
			this.Core.SetChrRomPage1K(11, this.MAPPER_REG[5] | 0x80);
			break;
		case 0x11:
			this.Core.SetChrRomPage1K(8, this.MAPPER_REG[4] | 0x80);
			this.Core.SetChrRomPage1K(9, this.MAPPER_REG[4] | 0x80);
			this.Core.SetChrRomPage1K(10, this.MAPPER_REG[5] | 0x80);
			this.Core.SetChrRomPage1K(11, this.MAPPER_REG[5] | 0x80);
			break;
	}
};


/**** Mapper69 ****/
NES.prototype.Mapper69 = function(core) {
	NES.prototype.MapperProto.apply(this, arguments);
	this.MAPPER_REG = new Array(16);
	this.MAPPER_REG_Select = 0x00;
	this.R8_ROM = null;
	this.IRQ_Counter = 0;
};

NES.prototype.Mapper69.prototype = Object.create(NES.prototype.MapperProto.prototype);

NES.prototype.Mapper69.prototype.Init = function() {
	var i;
	for(i=0; i<this.MAPPER_REG.length; i++)
		this.MAPPER_REG[i] = 0;

	this.Core.SetPrgRomPages8K(0, 1, 2, this.Core.PrgRomPageCount * 2 - 1);
	this.Core.SetChrRomPages1K(0, 1, 2, 3, 4, 5, 6, 7);
};

NES.prototype.Mapper69.prototype.Write = function(address, data) {
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
					this.Core.SetChrRomPage1K(this.MAPPER_REG_Select, data);
					break;
				case 0x08:
					this.R8_ROM = this.Core.PRGROM_PAGES[(data & 0x3F) % (this.Core.PrgRomPageCount * 2)];
					break;
				case 0x09:
					this.Core.SetPrgRomPage8K(0, data);
					break;
				case 0x0A:
					this.Core.SetPrgRomPage8K(1, data);
					break;
				case 0x0B:
					this.Core.SetPrgRomPage8K(2, data);
					break;
				case 0x0C:
					data &= 0x03;
					if(data === 0) {
						this.Core.SetMirror(false);
					} else if(data === 1) {
						this.Core.SetMirror(true);
					} else if(data === 2) {
						this.Core.SetMirrors(0, 0, 0, 0);
					} else {
						this.Core.SetMirrors(1, 1, 1, 1);
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
			this.Core.Select_AY_REG(data);
			break;
		case 0xE000:
			this.Core.Write_AY_REG(data);
			break;
	}
};

NES.prototype.Mapper69.prototype.ReadSRAM = function(address) {
	if((this.MAPPER_REG[0x08] & 0x40) === 0x00)
		return this.R8_ROM[address & 0x1FFF];
	else
		return this.Core.SRAM[address & 0x1FFF];
};

NES.prototype.Mapper69.prototype.WriteSRAM = function(address, data) {
	if((this.MAPPER_REG[0x08] & 0x40) === 0x40)
		this.Core.SRAM[address & 0x1FFF] = data;
};

NES.prototype.Mapper69.prototype.CPUSync = function(clock) {
	if((this.MAPPER_REG[0x0D] & 0x80) === 0x80) {
		this.IRQ_Counter -= clock;
		if(this.IRQ_Counter < 0) {
			this.IRQ_Counter = 0xFFFF;
			if((this.MAPPER_REG[0x0D] & 0x01) === 0x01)
				this.SetIRQ();
		}
	}
};

NES.prototype.Mapper69.prototype.OutEXSound = function(soundin) {
	return (soundin >> 1) + (this.Core.Out_AY() >> 1);
};

NES.prototype.Mapper69.prototype.EXSoundSync = function(clock) {
	this.Core.Count_AY(clock);
};


/**** Mapper70 ****/
NES.prototype.Mapper70 = function(core) {
	NES.prototype.MapperProto.apply(this, arguments);
};

NES.prototype.Mapper70.prototype = Object.create(NES.prototype.MapperProto.prototype);

NES.prototype.Mapper70.prototype.Init = function() {
	this.Core.SetPrgRomPage(0, 0);
	this.Core.SetPrgRomPage(1, this.Core.PrgRomPageCount - 1);
	this.Core.SetChrRomPage(0);
};

NES.prototype.Mapper70.prototype.Write = function(address, data) {
	this.Core.SetPrgRomPage(0, (data & 0x70)>> 4);
	this.Core.SetChrRomPage(data & 0x0F);

	if((data & 0x80) === 0x00)
		this.Core.SetMirrors(0,0,0,0);
	else
		this.Core.SetMirrors(1,1,1,1);
};


/**** Mapper72 ****/
NES.prototype.Mapper72 = function(core) {
	NES.prototype.MapperProto.apply(this, arguments);
	this.MAPPER_REG = new Array(1);
};

NES.prototype.Mapper72.prototype = Object.create(NES.prototype.MapperProto.prototype);

NES.prototype.Mapper72.prototype.Init = function() {
	this.MAPPER_REG[0] = 0;

	this.Core.SetPrgRomPages8K(0, 1, this.Core.PrgRomPageCount * 2 - 2, this.Core.PrgRomPageCount * 2 - 1);
	this.Core.SetChrRomPages1K(0, 1, 2, 3, 4, 5, 6, 7);
};

NES.prototype.Mapper72.prototype.Write = function(address, data) {
	if((this.MAPPER_REG[0] & 0xC0) === 0x00) {
		if((data & 0x80) === 0x80) {
			var tmp = (data & 0x07) * 2;
			this.Core.SetPrgRomPage8K(0, tmp);
			this.Core.SetPrgRomPage8K(1, tmp + 1);
		}
		if((data & 0x40) === 0x40) {
			var tmp = (data & 0x0F) * 8;
			this.Core.SetChrRomPages1K(tmp, tmp + 1, tmp + 2, tmp + 3, tmp + 4, tmp + 5, tmp + 6, tmp + 7);
		}
	}
	this.MAPPER_REG[0] = data;
};


/**** Mapper73 ****/
NES.prototype.Mapper73 = function(core) {
	NES.prototype.MapperProto.apply(this, arguments);
	this.MAPPER_REG = new Array(3);
};

NES.prototype.Mapper73.prototype = Object.create(NES.prototype.MapperProto.prototype);

NES.prototype.Mapper73.prototype.Init = function() {
	this.Core.SetPrgRomPages8K(0, 1, this.Core.PrgRomPageCount * 2 - 2, this.Core.PrgRomPageCount * 2 - 1);
	this.MAPPER_REG[0] = 0;
	this.MAPPER_REG[1] = 0;
	this.MAPPER_REG[2] = 0;
};

NES.prototype.Mapper73.prototype.Write = function(address, data) {
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
			this.Core.SetPrgRomPage8K(0, data * 2);
			this.Core.SetPrgRomPage8K(1, data * 2 + 1);
			break;
	}
};

NES.prototype.Mapper73.prototype.CPUSync = function(clock) {
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


/**** Mapper75 ****/
NES.prototype.Mapper75 = function(core) {
	NES.prototype.MapperProto.apply(this, arguments);
	this.MAPPER_REG = new Array(1);
};

NES.prototype.Mapper75.prototype = Object.create(NES.prototype.MapperProto.prototype);

NES.prototype.Mapper75.prototype.Init = function() {
	this.Core.SetPrgRomPages8K(0, 0, 0, this.Core.PrgRomPageCount * 2 - 1);
	this.Core.SetChrRomPages1K(0, 0, 0, 0, 0, 0, 0, 0);
	this.MAPPER_REG[0] = 0x00;
};

NES.prototype.Mapper75.prototype.Write = function(address, data) {
	switch (address) {
		case 0x8000:
			this.Core.SetPrgRomPage8K(0, data & 0x0F);
			break;

		case 0x9000:
			this.MAPPER_REG[0] = data;
			if((data & 0x01) === 0x00)
				this.Core.SetMirror(false);
			else
				this.Core.SetMirror(true);
			break;

		case 0xA000:
			this.Core.SetPrgRomPage8K(1, data & 0x0F);
			break;

		case 0xC000:
			this.Core.SetPrgRomPage8K(2, data & 0x0F);
			break;

		case 0xE000:
			var tmp = (((this.MAPPER_REG[0] & 0x02) << 3) | (data & 0x0F)) << 2;
			this.Core.SetChrRomPage1K(0, tmp);
			this.Core.SetChrRomPage1K(1, tmp + 1);
			this.Core.SetChrRomPage1K(2, tmp + 2);
			this.Core.SetChrRomPage1K(3, tmp + 3);
			break;

		case 0xF000:
			var tmp = (((this.MAPPER_REG[0] & 0x04) << 2) | (data & 0x0F)) << 2;
			this.Core.SetChrRomPage1K(4, tmp);
			this.Core.SetChrRomPage1K(5, tmp + 1);
			this.Core.SetChrRomPage1K(6, tmp + 2);
			this.Core.SetChrRomPage1K(7, tmp + 3);
			break;
	}
};


/**** Mapper76 ****/
NES.prototype.Mapper76 = function(core) {
	NES.prototype.MapperProto.apply(this, arguments);
	this.MAPPER_REG = new Array(1);
};

NES.prototype.Mapper76.prototype = Object.create(NES.prototype.MapperProto.prototype);

NES.prototype.Mapper76.prototype.Init = function() {
	this.Core.SetPrgRomPages8K(0, 0, this.Core.PrgRomPageCount * 2 - 2, this.Core.PrgRomPageCount * 2 - 1);
	this.Core.SetChrRomPages1K(0, 0, 0, 0, 0, 0, 0, 0);
	this.MAPPER_REG[0] = 0x00;
};

NES.prototype.Mapper76.prototype.Write = function(address, data) {
	if(address === 0x8000)
		this.MAPPER_REG[0] = data & 0x07;

	if(address === 0x8001) {
		switch(this.MAPPER_REG[0]) {
			case 0x02:
				this.Core.SetChrRomPage1K(0, (data & 0x3F) * 2);
				this.Core.SetChrRomPage1K(1, (data & 0x3F) * 2 + 1);
				break;
			case 0x03:
				this.Core.SetChrRomPage1K(2, (data & 0x3F) * 2);
				this.Core.SetChrRomPage1K(3, (data & 0x3F) * 2 + 1);
				break;
			case 0x04:
				this.Core.SetChrRomPage1K(4, (data & 0x3F) * 2);
				this.Core.SetChrRomPage1K(5, (data & 0x3F) * 2 + 1);
				break;
			case 0x05:
				this.Core.SetChrRomPage1K(6, (data & 0x3F) * 2);
				this.Core.SetChrRomPage1K(7, (data & 0x3F) * 2 + 1);
				break;
			case 0x06:
				this.Core.SetPrgRomPage8K(0, data & 0x0F);
				break;
			case 0x07:
				this.Core.SetPrgRomPage8K(1, data & 0x0F);
				break;
		}
	}
};


/**** Mapper77 ****/
NES.prototype.Mapper77 = function(core) {
	NES.prototype.MapperProto.apply(this, arguments);
};

NES.prototype.Mapper77.prototype = Object.create(NES.prototype.MapperProto.prototype);

NES.prototype.Mapper77.prototype.Init = function() {
	this.Core.SetPrgRomPage(0, 0);
	this.Core.SetPrgRomPage(1, 1);

	this.Core.SetChrRomPage1K(0, 0);
	this.Core.SetChrRomPage1K(1, 1);
	this.Core.SetChrRomPage1K(2, 2 + 0x0100);
	this.Core.SetChrRomPage1K(3, 3 + 0x0100);
	this.Core.SetChrRomPage1K(4, 4 + 0x0100);
	this.Core.SetChrRomPage1K(5, 5 + 0x0100);
	this.Core.SetChrRomPage1K(6, 6 + 0x0100);
	this.Core.SetChrRomPage1K(7, 7 + 0x0100);
};

NES.prototype.Mapper77.prototype.Write = function(address, data) {
	var tmp = (data & 0x0F) << 1;
	this.Core.SetPrgRomPage(0, tmp);
	this.Core.SetPrgRomPage(1, tmp + 1);

	tmp = (data & 0xF0) >> 3;
	this.Core.SetChrRomPage1K(0, tmp);
	this.Core.SetChrRomPage1K(1, tmp + 1);
};


/**** Mapper78 ****/
NES.prototype.Mapper78 = function(core) {
	NES.prototype.MapperProto.apply(this, arguments);
};

NES.prototype.Mapper78.prototype = Object.create(NES.prototype.MapperProto.prototype);

NES.prototype.Mapper78.prototype.Init = function() {
	this.Core.SetPrgRomPage(0, 0);
	this.Core.SetPrgRomPage(1, this.Core.PrgRomPageCount - 1);

	this.Core.SetChrRomPage(0);
};

NES.prototype.Mapper78.prototype.Write = function(address, data) {
	this.Core.SetPrgRomPage(0, data & 0x07);
	this.Core.SetChrRomPage(data >> 4);

	if((data & 0x08) === 0x08)
		this.Core.SetMirror(false);
	else
		this.Core.SetMirror(true);
};


/**** Mapper80 ****/
NES.prototype.Mapper80 = function(core) {
	NES.prototype.MapperProto.apply(this, arguments);
	this.MAPPER_REG = new Array(11);
	this.EX_RAM = new Array(128);
};

NES.prototype.Mapper80.prototype = Object.create(NES.prototype.MapperProto.prototype);

NES.prototype.Mapper80.prototype.Init = function() {
	for(var i=0; i<this.MAPPER_REG.length; i++)
		this.MAPPER_REG[i] = 0;

	for(var i=0; i<this.EX_RAM.length; i++) {
		this.EX_RAM[i] = 0x00;
	}

	this.Core.SetPrgRomPages8K(0, 1, 2, this.Core.PrgRomPageCount * 2 - 1);
	this.Core.SetChrRomPages1K(0, 1, 2, 3, 4, 5, 6, 7);
};

NES.prototype.Mapper80.prototype.ReadSRAM = function(address) {
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

NES.prototype.Mapper80.prototype.WriteSRAM = function(address, data) {
	if(address >= 0x7F00 && address <= 0x7FFF) {
		this.EX_RAM[address & 0x007F] = data;
		return;
	}

	switch(address) {
		case 0x7EF0:
			this.MAPPER_REG[0] = data;
			this.Core.SetChrRomPage1K(0, data & 0xFE);
			this.Core.SetChrRomPage1K(1, (data & 0xFE) + 1);
			break;
		case 0x7EF1:
			this.MAPPER_REG[1] = data;
			this.Core.SetChrRomPage1K(2, data & 0xFE);
			this.Core.SetChrRomPage1K(3, (data & 0xFE) + 1);
			break;
		case 0x7EF2:
			this.MAPPER_REG[2] = data;
			this.Core.SetChrRomPage1K(4, data);
			break;
		case 0x7EF3:
			this.MAPPER_REG[3] = data;
			this.Core.SetChrRomPage1K(5, data);
			break;
		case 0x7EF4:
			this.MAPPER_REG[4] = data;
			this.Core.SetChrRomPage1K(6, data);
			break;
		case 0x7EF5:
			this.MAPPER_REG[5] = data;
			this.Core.SetChrRomPage1K(7, data);
			break;
		case 0x7EF6:
		case 0x7EF7:
			this.MAPPER_REG[6] = data;
			if((data & 0x01) === 0x01)
				this.Core.SetMirror(false);
			else
				this.Core.SetMirror(true);
			break;
		case 0x7EF8:
		case 0x7EF9:
			this.MAPPER_REG[7] = data;
			break;
		case 0x7EFA:
		case 0x7EFB:
			this.MAPPER_REG[8] = data;
			this.Core.SetPrgRomPage8K(0, data);
			break;
		case 0x7EFC:
		case 0x7EFD:
			this.MAPPER_REG[9] = data;
			this.Core.SetPrgRomPage8K(1, data);
			break;
		case 0x7EFE:
		case 0x7EFF:
			this.MAPPER_REG[10] = data;
			this.Core.SetPrgRomPage8K(2, data);
			break;
	}
};


/**** Mapper82 ****/
NES.prototype.Mapper82 = function(core) {
	NES.prototype.MapperProto.apply(this, arguments);
	this.MAPPER_REG = new Array(13);
	this.EX_RAM = new Array(0x1400);
};

NES.prototype.Mapper82.prototype = Object.create(NES.prototype.MapperProto.prototype);

NES.prototype.Mapper82.prototype.Init = function() {
	for(var i=0; i<this.MAPPER_REG.length; i++)
		this.MAPPER_REG[i] = 0;

	for(var i=0; i<this.EX_RAM.length; i++) {
		this.EX_RAM[i] = 0x00;
	}

	this.Core.SetPrgRomPages8K(0, 1, 2, this.Core.PrgRomPageCount * 2 - 1);
	this.Core.SetChrRomPages1K(0, 1, 2, 3, 4, 5, 6, 7);
};

NES.prototype.Mapper82.prototype.ReadSRAM = function(address) {
	if(address >= 0x6000 && address <= 0x73FF)
		return this.EX_RAM[address - 0x6000];

	if(address >= 0x7EF0 && address <= 0x7EFC)
		return this.MAPPER_REG[address - 0x7EF0];
};

NES.prototype.Mapper82.prototype.WriteSRAM = function(address, data) {
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
				this.Core.SetMirror(false);
			else
				this.Core.SetMirror(true);
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
			this.Core.SetPrgRomPage8K(0, data >>> 2);
			break;
		case 0x7EFB:
			this.MAPPER_REG[11] = data;
			this.Core.SetPrgRomPage8K(1, data >>> 2);
			break;
		case 0x7EFC:
			this.MAPPER_REG[12] = data;
			this.Core.SetPrgRomPage8K(2, data >>> 2);
			break;
	}
};

NES.prototype.Mapper82.prototype.SetChr = function() {
	if((this.MAPPER_REG[6] & 0x02) === 0x00) {
		this.Core.SetChrRomPage1K(0, this.MAPPER_REG[0] & 0xFE);
		this.Core.SetChrRomPage1K(1, (this.MAPPER_REG[0] & 0xFE) + 1);
		this.Core.SetChrRomPage1K(2, this.MAPPER_REG[1] & 0xFE);
		this.Core.SetChrRomPage1K(3, (this.MAPPER_REG[1] & 0xFE) + 1);
		this.Core.SetChrRomPage1K(4, this.MAPPER_REG[2]);
		this.Core.SetChrRomPage1K(5, this.MAPPER_REG[3]);
		this.Core.SetChrRomPage1K(6, this.MAPPER_REG[4]);
		this.Core.SetChrRomPage1K(7, this.MAPPER_REG[5]);
	} else {
		this.Core.SetChrRomPage1K(4, this.MAPPER_REG[0] & 0xFE);
		this.Core.SetChrRomPage1K(5, (this.MAPPER_REG[0] & 0xFE) + 1);
		this.Core.SetChrRomPage1K(6, this.MAPPER_REG[1] & 0xFE);
		this.Core.SetChrRomPage1K(7, (this.MAPPER_REG[1] & 0xFE) + 1);
		this.Core.SetChrRomPage1K(0, this.MAPPER_REG[2]);
		this.Core.SetChrRomPage1K(1, this.MAPPER_REG[3]);
		this.Core.SetChrRomPage1K(2, this.MAPPER_REG[4]);
		this.Core.SetChrRomPage1K(3, this.MAPPER_REG[5]);
	}
};


/**** Mapper85 ****/
NES.prototype.Mapper85 = function(core) {
	NES.prototype.MapperProto.apply(this, arguments);
	this.MAPPER_REG = new Array(15);
	this.MAPPER_EXVRAM = new Array(8);
};

NES.prototype.Mapper85.prototype = Object.create(NES.prototype.MapperProto.prototype);

NES.prototype.Mapper85.prototype.Init = function() {
	for(var i=0; i<this.MAPPER_REG.length; i++)
		this.MAPPER_REG[i] = 0;

	for(var i=0; i<this.MAPPER_EXVRAM.length; i++) {
		this.MAPPER_EXVRAM[i] = new Array(1024);
		for(var j=0; j<this.MAPPER_EXVRAM[i].length; j++)
			this.MAPPER_EXVRAM[i][j] = 0x00;
	}

	this.Core.SetPrgRomPages8K(0, 1, 2, this.Core.PrgRomPageCount * 2 - 1);

	if(this.Core.ChrRomPageCount === 0) {
		this.Core.VRAM[0] = this.MAPPER_EXVRAM[0];
		this.Core.VRAM[1] = this.MAPPER_EXVRAM[0];
		this.Core.VRAM[2] = this.MAPPER_EXVRAM[0];
		this.Core.VRAM[3] = this.MAPPER_EXVRAM[0];
		this.Core.VRAM[4] = this.MAPPER_EXVRAM[0];
		this.Core.VRAM[5] = this.MAPPER_EXVRAM[0];
		this.Core.VRAM[6] = this.MAPPER_EXVRAM[0];
		this.Core.VRAM[7] = this.MAPPER_EXVRAM[0];
	} else
		this.Core.SetChrRomPages1K(0, 1, 2, 3, 4, 5, 6, 7);

};

NES.prototype.Mapper85.prototype.Write = function(address, data) {
	switch(address & 0xF038) {
		case 0x8000:
			this.MAPPER_REG[0] = data;
			this.Core.SetPrgRomPage8K(0, data);
			break;
		case 0x8008:
		case 0x8010:
			this.MAPPER_REG[1] = data;
			this.Core.SetPrgRomPage8K(1, data);
			break;
		case 0x9000:
			this.MAPPER_REG[2] = data;
			this.Core.SetPrgRomPage8K(2, data);
			break;

		case 0xA000:
			this.MAPPER_REG[3] = data;
			if(this.Core.ChrRomPageCount === 0)
				this.Core.VRAM[0] = this.MAPPER_EXVRAM[data];// & 0x07];
			else
				this.Core.SetChrRomPage1K(0, data);
			break;
		case 0xA008:
		case 0xA010:
			this.MAPPER_REG[4] = data;
			if(this.Core.ChrRomPageCount === 0)
				this.Core.VRAM[1] = this.MAPPER_EXVRAM[data];// & 0x07];
			else
				this.Core.SetChrRomPage1K(1, data);
			break;
		case 0xB000:
			this.MAPPER_REG[5] = data;
			if(this.Core.ChrRomPageCount === 0)
				this.Core.VRAM[2] = this.MAPPER_EXVRAM[data];// & 0x07];
			else
				this.Core.SetChrRomPage1K(2, data);
			break;
		case 0xB008:
		case 0xB010:
			this.MAPPER_REG[6] = data;
			if(this.Core.ChrRomPageCount === 0)
				this.Core.VRAM[3] = this.MAPPER_EXVRAM[data];// & 0x07];
			else
				this.Core.SetChrRomPage1K(3, data);
			break;
		case 0xC000:
			this.MAPPER_REG[7] = data;
			if(this.Core.ChrRomPageCount === 0)
				this.Core.VRAM[4] = this.MAPPER_EXVRAM[data];// & 0x07];
			else
				this.Core.SetChrRomPage1K(4, data);
			break;
		case 0xC008:
		case 0xC010:
			this.MAPPER_REG[8] = data;
			if(this.Core.ChrRomPageCount === 0)
				this.Core.VRAM[5] = this.MAPPER_EXVRAM[data];// & 0x07];
			else
				this.Core.SetChrRomPage1K(5, data);
			break;
		case 0xD000:
			this.MAPPER_REG[9] = data;
			if(this.Core.ChrRomPageCount === 0)
				this.Core.VRAM[6] = this.MAPPER_EXVRAM[data];// & 0x07];
			else
				this.Core.SetChrRomPage1K(6, data);
			break;
		case 0xD008:
		case 0xD010:
			this.MAPPER_REG[10] = data;
			if(this.Core.ChrRomPageCount === 0)
				this.Core.VRAM[7] = this.MAPPER_EXVRAM[data];// & 0x07];
			else
				this.Core.SetChrRomPage1K(7, data);
			break;

		case 0xE000:
			this.MAPPER_REG[14] = data;
			data &= 0x03;
			if(data === 0) {
				this.Core.SetMirror(false);
			} else if(data === 1) {
				this.Core.SetMirror(true);
			} else if(data === 2) {
				this.Core.SetMirrors(0, 0, 0, 0);
			} else {
				this.Core.SetMirrors(1, 1, 1, 1);
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

NES.prototype.Mapper85.prototype.HSync = function(y) {
	if((this.MAPPER_REG[11] & 0x06) === 0x02) {
		if(this.MAPPER_REG[12] === 0xFF) {
			this.MAPPER_REG[12] = this.MAPPER_REG[13];
			this.SetIRQ();
		} else
			this.MAPPER_REG[12]++;
	}
};

NES.prototype.Mapper85.prototype.CPUSync = function(clock) {
	if((this.MAPPER_REG[11] & 0x06) === 0x06) {
		if(this.MAPPER_REG[12] >= 0xFF) {
			this.MAPPER_REG[12] = this.MAPPER_REG[13];
			this.SetIRQ();
		} else
			this.MAPPER_REG[12] += clock;
	}
};


/**** Mapper86 ****/
NES.prototype.Mapper86 = function(core) {
	NES.prototype.MapperProto.apply(this, arguments);
};

NES.prototype.Mapper86.prototype = Object.create(NES.prototype.MapperProto.prototype);

NES.prototype.Mapper86.prototype.Init = function() {
	this.Core.SetPrgRomPages8K(this.Core.PrgRomPageCount * 2 - 4, this.Core.PrgRomPageCount * 2 - 3, this.Core.PrgRomPageCount * 2 - 2, this.Core.PrgRomPageCount * 2 - 1);
	this.Core.SetChrRomPages1K(0, 1, 2, 3, 4, 5, 6, 7);
};

NES.prototype.Mapper86.prototype.WriteSRAM = function(address, data) {
	if(address >= 0x6000 && address < 0x6FFF) {
		var prg = ((data & 0x30) >>> 4) << 2;
		var chr = (((data & 0x40) >>> 4) | (data & 0x03)) << 3;
		this.Core.SetPrgRomPages8K(prg, prg + 1, prg + 2, prg + 3);
		this.Core.SetChrRomPages1K(chr, chr + 1, chr + 2, chr + 3, chr + 4, chr + 5, chr + 6, chr + 7);
	}
};


/**** Mapper87 ****/
NES.prototype.Mapper87 = function(core) {
	NES.prototype.MapperProto.apply(this, arguments);
};

NES.prototype.Mapper87.prototype = Object.create(NES.prototype.MapperProto.prototype);

NES.prototype.Mapper87.prototype.Init = function() {
	this.Core.SetPrgRomPage(0, 0);
	this.Core.SetPrgRomPage(1, this.Core.PrgRomPageCount - 1);
	this.Core.SetChrRomPage(0);
};

NES.prototype.Mapper87.prototype.WriteSRAM = function(address, data) {
	var chr = ((data & 0x02) >>> 1) | ((data & 0x01) << 1);
	this.Core.SetChrRomPage(chr);
};


/**** Mapper88 ****/
NES.prototype.Mapper88 = function(core) {
	NES.prototype.MapperProto.apply(this, arguments);
	this.MAPPER_REG = new Array(1);
};

NES.prototype.Mapper88.prototype = Object.create(NES.prototype.MapperProto.prototype);

NES.prototype.Mapper88.prototype.Init = function() {
	this.Core.SetPrgRomPages8K(0, 0, this.Core.PrgRomPageCount * 2 - 2, this.Core.PrgRomPageCount * 2 - 1);
	this.Core.SetChrRomPages1K(0, 0, 0, 0, 0, 0, 0, 0);
	this.MAPPER_REG[0] = 0x00;
};

NES.prototype.Mapper88.prototype.Write = function(address, data) {
	if(address === 0x8000)
		this.MAPPER_REG[0] = data & 0x07;

	if(address === 0x8001) {
		switch(this.MAPPER_REG[0]) {
			case 0x00:
				this.Core.SetChrRomPage1K(0, data & 0x3E);
				this.Core.SetChrRomPage1K(1, (data & 0x3E) + 1);
				break;
			case 0x01:
				this.Core.SetChrRomPage1K(2, data & 0x3E);
				this.Core.SetChrRomPage1K(3, (data & 0x3E) + 1);
				break;
			case 0x02:
				this.Core.SetChrRomPage1K(4, (data & 0x3F) | 0x40);
				break;
			case 0x03:
				this.Core.SetChrRomPage1K(5, (data & 0x3F) | 0x40);
				break;
			case 0x04:
				this.Core.SetChrRomPage1K(6, (data & 0x3F) | 0x40);
				break;
			case 0x05:
				this.Core.SetChrRomPage1K(7, (data & 0x3F) | 0x40);
				break;
			case 0x06:
				this.Core.SetPrgRomPage8K(0, data & 0x0F);
				break;
			case 0x07:
				this.Core.SetPrgRomPage8K(1, data & 0x0F);
				break;
		}
	}
};


/**** Mapper89 ****/
NES.prototype.Mapper89 = function(core) {
	NES.prototype.MapperProto.apply(this, arguments);
};

NES.prototype.Mapper89.prototype = Object.create(NES.prototype.MapperProto.prototype);

NES.prototype.Mapper89.prototype.Init = function() {
	this.Core.SetPrgRomPage(0, 0);
	this.Core.SetPrgRomPage(1, this.Core.PrgRomPageCount - 1);

	this.Core.SetChrRomPage(0);
};

NES.prototype.Mapper89.prototype.Write = function(address, data) {
	this.Core.SetPrgRomPage(0, (data & 0x70) >> 4);
	this.Core.SetChrRomPage(((data & 0x80) >> 4) | (data & 0x07));

	if((data & 0x08) === 0x00)
		this.Core.SetMirrors(0, 0, 0, 0);
	else
		this.Core.SetMirrors(1, 1, 1, 1);
};


/**** Mapper92 ****/
NES.prototype.Mapper92 = function(core) {
	NES.prototype.MapperProto.apply(this, arguments);
};

NES.prototype.Mapper92.prototype = Object.create(NES.prototype.MapperProto.prototype);

NES.prototype.Mapper92.prototype.Init = function() {

	this.Core.SetPrgRomPages8K(0, 1, this.Core.PrgRomPageCount * 2 - 2, this.Core.PrgRomPageCount * 2 - 1);
	this.Core.SetChrRomPages1K(0, 1, 2, 3, 4, 5, 6, 7);
};

NES.prototype.Mapper92.prototype.Write = function(address, data) {
	var prg = (address & 0x0F) << 1;
	var chr = (address & 0x0F) << 3;
	if(address >= 0x9000) {
		if((address & 0xF0) === 0xD0) {
			this.Core.SetPrgRomPages8K(0, 1, prg, prg + 1);
		} else if((address & 0xF0) === 0xE0) {
			this.Core.SetChrRomPages1K(chr, chr + 1, chr + 2, chr + 3, chr + 4, chr + 5, chr + 6, chr + 7);
		}
	} else {
		if((address & 0xF0) === 0xB0) {
			this.Core.SetPrgRomPages8K(0, 1, prg, prg + 1);
		} else if((address & 0xF0) === 0x70) {
			this.Core.SetChrRomPages1K(chr, chr + 1, chr + 2, chr + 3, chr + 4, chr + 5, chr + 6, chr + 7);
		}
	}
};


/**** Mapper93 ****/
NES.prototype.Mapper93 = function(core) {
	NES.prototype.MapperProto.apply(this, arguments);
};

NES.prototype.Mapper93.prototype = Object.create(NES.prototype.MapperProto.prototype);

NES.prototype.Mapper93.prototype.Init = function() {
	this.Core.SetPrgRomPages8K(0, 1, this.Core.PrgRomPageCount * 2 - 2, this.Core.PrgRomPageCount * 2 - 1);
	this.Core.SetChrRomPages1K(0, 1, 2, 3, 4, 5, 6, 7);
};

NES.prototype.Mapper93.prototype.WriteSRAM = function(address, data) {
	if(address === 0x6000) {
		this.Core.SetPrgRomPage8K(0, data * 2);
		this.Core.SetPrgRomPage8K(1, data * 2 + 1);
	}
};


/**** Mapper94 ****/
NES.prototype.Mapper94 = function(core) {
	NES.prototype.MapperProto.apply(this, arguments);
};

NES.prototype.Mapper94.prototype = Object.create(NES.prototype.MapperProto.prototype);

NES.prototype.Mapper94.prototype.Init = function() {
	this.Core.SetPrgRomPage(0, 0);
	this.Core.SetPrgRomPage(1, this.Core.PrgRomPageCount - 1);
	this.Core.SetChrRomPage(0);
};

NES.prototype.Mapper94.prototype.Write = function(address, data) {
	this.Core.SetPrgRomPage(0, data >> 2);
};


/**** Mapper95 ****/
NES.prototype.Mapper95 = function(core) {
	NES.prototype.MapperProto.apply(this, arguments);
	this.MAPPER_REG = new Array(1);
};

NES.prototype.Mapper95.prototype = Object.create(NES.prototype.MapperProto.prototype);

NES.prototype.Mapper95.prototype.Init = function() {
	this.Core.SetPrgRomPages8K(0, 0, this.Core.PrgRomPageCount * 2 - 2, this.Core.PrgRomPageCount * 2 - 1);
	this.Core.SetChrRomPages1K(0, 0, 0, 0, 0, 0, 0, 0);
	this.MAPPER_REG[0] = 0x00;
};

NES.prototype.Mapper95.prototype.Write = function(address, data) {
	if((address & 0x0001) === 0x0000)
		this.MAPPER_REG[0] = data & 0x07;

	if((address & 0x0001) === 0x0001) {
		if(this.MAPPER_REG[0] <= 0x05) {
			if((data & 0x20) === 0x20)
				this.Core.SetMirrors(1, 1, 1, 1);
			else
				this.Core.SetMirrors(0, 0, 0, 0);
		}

		switch(this.MAPPER_REG[0]) {
			case 0x00:
				this.Core.SetChrRomPage1K(0, data & 0x1E);
				this.Core.SetChrRomPage1K(1, (data & 0x1E) + 1);
				break;
			case 0x01:
				this.Core.SetChrRomPage1K(2, data & 0x1E);
				this.Core.SetChrRomPage1K(3, (data & 0x1E) + 1);
				break;
			case 0x02:
				this.Core.SetChrRomPage1K(4, data & 0x1F);
				break;
			case 0x03:
				this.Core.SetChrRomPage1K(5, data & 0x1F);
				break;
			case 0x04:
				this.Core.SetChrRomPage1K(6, data & 0x1F);
				break;
			case 0x05:
				this.Core.SetChrRomPage1K(7, data & 0x1F);
				break;
			case 0x06:
				this.Core.SetPrgRomPage8K(0, data & 0x0F);
				break;
			case 0x07:
				this.Core.SetPrgRomPage8K(1, data & 0x0F);
				break;
		}
	}
};


/**** Mapper97 ****/
NES.prototype.Mapper97 = function(core) {
	NES.prototype.MapperProto.apply(this, arguments);
};

NES.prototype.Mapper97.prototype = Object.create(NES.prototype.MapperProto.prototype);

NES.prototype.Mapper97.prototype.Init = function() {
	this.Core.SetPrgRomPage(0, this.Core.PrgRomPageCount - 1);
	this.Core.SetPrgRomPage(1, 0);

	this.Core.SetChrRomPage(0);
};

NES.prototype.Mapper97.prototype.Write = function(address, data) {
	this.Core.SetPrgRomPage(1, data & 0x0F);

	switch(data & 0xC0) {
		case 0x00:
			this.Core.SetMirrors(0, 0, 0, 0);
			break;
		case 0x40:
			this.Core.SetMirror(true);
			break;
		case 0x80:
			this.Core.SetMirror(false);
			break;
		case 0xC0:
			this.Core.SetMirrors(1, 1, 1, 1);
			break;
	}
};


/**** Mapper101 ****/
NES.prototype.Mapper101 = function(core) {
	NES.prototype.MapperProto.apply(this, arguments);
};

NES.prototype.Mapper101.prototype = Object.create(NES.prototype.MapperProto.prototype);

NES.prototype.Mapper101.prototype.Init = function() {
	this.Core.SetPrgRomPage(0, 0);
	this.Core.SetPrgRomPage(1, this.Core.PrgRomPageCount - 1);
	this.Core.SetChrRomPage(0);
};

NES.prototype.Mapper101.prototype.WriteSRAM = function(address, data) {
	this.Core.SetChrRomPage(data & 0x03);
};


/**** Mapper118 ****/
NES.prototype.Mapper118 = function(core) {
	NES.prototype.MapperProto.apply(this, arguments);
	this.MAPPER_REG = new Array(20);
};

NES.prototype.Mapper118.prototype = Object.create(NES.prototype.MapperProto.prototype);

NES.prototype.Mapper118.prototype.Init = function() {
	var i;
	for(i=0; i<this.MAPPER_REG.length; i++)
		this.MAPPER_REG[i] = 0;

	this.MAPPER_REG[16] = 0;
	this.MAPPER_REG[17] = 1;
	this.MAPPER_REG[18] = (this.Core.PrgRomPageCount - 1) * 2;
	this.MAPPER_REG[19] = (this.Core.PrgRomPageCount - 1) * 2 + 1;
	this.Core.SetPrgRomPages8K(this.MAPPER_REG[16], this.MAPPER_REG[17], this.MAPPER_REG[18], this.MAPPER_REG[19]);

	this.MAPPER_REG[8] = 0;
	this.MAPPER_REG[9] = 1;
	this.MAPPER_REG[10] = 2;
	this.MAPPER_REG[11] = 3;
	this.MAPPER_REG[12] = 4;
	this.MAPPER_REG[13] = 5;
	this.MAPPER_REG[14] = 6;
	this.MAPPER_REG[15] = 7;
	this.Core.SetChrRomPages1K(this.MAPPER_REG[8], this.MAPPER_REG[9], this.MAPPER_REG[10], this.MAPPER_REG[11],
				this.MAPPER_REG[12], this.MAPPER_REG[13], this.MAPPER_REG[14], this.MAPPER_REG[15]);
};

NES.prototype.Mapper118.prototype.Write = function(address, data) {
	switch (address & 0xE001) {
		case 0x8000:
			this.MAPPER_REG[0] = data;
			if((data & 0x80) === 0x80) {
				this.Core.SetChrRomPages1K(this.MAPPER_REG[12], this.MAPPER_REG[13], this.MAPPER_REG[14], this.MAPPER_REG[15], 
							this.MAPPER_REG[8], this.MAPPER_REG[9], this.MAPPER_REG[10], this.MAPPER_REG[11]); 
			} else {
				this.Core.SetChrRomPages1K(this.MAPPER_REG[8], this.MAPPER_REG[9], this.MAPPER_REG[10], this.MAPPER_REG[11], 
							this.MAPPER_REG[12], this.MAPPER_REG[13], this.MAPPER_REG[14], this.MAPPER_REG[15]); 
			}

			if((data & 0x40) === 0x40) {
				this.Core.SetPrgRomPages8K(this.MAPPER_REG[18], this.MAPPER_REG[17], this.MAPPER_REG[16],this.MAPPER_REG[19]);
			} else {
				this.Core.SetPrgRomPages8K(this.MAPPER_REG[16], this.MAPPER_REG[17], this.MAPPER_REG[18],this.MAPPER_REG[19]);
			}
			break;
		case 0x8001:
			this.MAPPER_REG[1] = data;

			if((this.MAPPER_REG[0] & 0x80) === 0x80) {
				if((this.MAPPER_REG[0] & 0x07) === 0x02) {
					if((data & 0x80) === 0x80)
						this.Core.SetMirrors(0,0,0,0);
					else
						this.Core.SetMirrors(1,1,1,1);
				}
			} else {
				if((this.MAPPER_REG[0] & 0x07) === 0x00) {
					if((data & 0x80) === 0x80)
						this.Core.SetMirrors(0,0,0,0);
					else
						this.Core.SetMirrors(1,1,1,1);
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
				this.Core.SetChrRomPages1K(this.MAPPER_REG[12], this.MAPPER_REG[13], this.MAPPER_REG[14], this.MAPPER_REG[15], 
							this.MAPPER_REG[8], this.MAPPER_REG[9], this.MAPPER_REG[10], this.MAPPER_REG[11]); 
			} else {
				this.Core.SetChrRomPages1K(this.MAPPER_REG[8], this.MAPPER_REG[9], this.MAPPER_REG[10], this.MAPPER_REG[11], 
							this.MAPPER_REG[12], this.MAPPER_REG[13], this.MAPPER_REG[14], this.MAPPER_REG[15]); 
			}

			if((this.MAPPER_REG[0] & 0x40) === 0x40) {
				this.Core.SetPrgRomPages8K(this.MAPPER_REG[18], this.MAPPER_REG[17], this.MAPPER_REG[16],this.MAPPER_REG[19]);
			} else {
				this.Core.SetPrgRomPages8K(this.MAPPER_REG[16], this.MAPPER_REG[17], this.MAPPER_REG[18],this.MAPPER_REG[19]);
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

NES.prototype.Mapper118.prototype.HSync = function(y) {
	if(this.MAPPER_REG[7] === 1 && y < 240 && (this.Core.IO1[0x01] & 0x08) === 0x08) {
		if(--this.MAPPER_REG[4] === 0)
			this.SetIRQ();
		this.MAPPER_REG[4] &= 0xFF;
	}
};


/**** Mapper119 ****/
NES.prototype.Mapper119 = function(core) {
	NES.prototype.MapperProto.apply(this, arguments);
	this.MAPPER_REG = new Array(20);
};

NES.prototype.Mapper119.prototype = Object.create(NES.prototype.MapperProto.prototype);

NES.prototype.Mapper119.prototype.Init = function() {
	var i;
	for(i=0; i<this.MAPPER_REG.length; i++)
		this.MAPPER_REG[i] = 0;

	this.MAPPER_REG[16] = 0;
	this.MAPPER_REG[17] = 1;
	this.MAPPER_REG[18] = (this.Core.PrgRomPageCount - 1) * 2;
	this.MAPPER_REG[19] = (this.Core.PrgRomPageCount - 1) * 2 + 1;
	this.Core.SetPrgRomPages8K(this.MAPPER_REG[16], this.MAPPER_REG[17], this.MAPPER_REG[18], this.MAPPER_REG[19]);

	this.MAPPER_REG[8] = 0;
	this.MAPPER_REG[9] = 1;
	this.MAPPER_REG[10] = 2;
	this.MAPPER_REG[11] = 3;
	this.MAPPER_REG[12] = 4;
	this.MAPPER_REG[13] = 5;
	this.MAPPER_REG[14] = 6;
	this.MAPPER_REG[15] = 7;
	this.Core.SetChrRomPages1K(this.MAPPER_REG[8], this.MAPPER_REG[9], this.MAPPER_REG[10], this.MAPPER_REG[11],
				this.MAPPER_REG[12], this.MAPPER_REG[13], this.MAPPER_REG[14], this.MAPPER_REG[15]);
};

NES.prototype.Mapper119.prototype.SetChrRomPages1K = function(page0, page1, page2, page3, page4, page5, page6, page7) {
	if((page0 & 0x40) === 0x00)
		this.Core.SetChrRomPage1K(0, page0 & 0x3F);
	else
		this.Core.VRAM[0] = this.Core.VRAMS[page0 & 0x07];

	if((page1 & 0x40) === 0x00)
		this.Core.SetChrRomPage1K(1, page1 & 0x3F);
	else
		this.Core.VRAM[1] = this.Core.VRAMS[page1 & 0x07];

	if((page2 & 0x40) === 0x00)
		this.Core.SetChrRomPage1K(2, page2 & 0x3F);
	else
		this.Core.VRAM[2] = this.Core.VRAMS[page2 & 0x07];

	if((page3 & 0x40) === 0x00)
		this.Core.SetChrRomPage1K(3, page3 & 0x3F);
	else
		this.Core.VRAM[3] = this.Core.VRAMS[page3 & 0x07];

	if((page4 & 0x40) === 0x00)
		this.Core.SetChrRomPage1K(4, page4 & 0x3F);
	else
		this.Core.VRAM[4] = this.Core.VRAMS[page4 & 0x07];

	if((page5 & 0x40) === 0x00)
		this.Core.SetChrRomPage1K(5, page5 & 0x3F);
	else
		this.Core.VRAM[5] = this.Core.VRAMS[page5 & 0x07];

	if((page6 & 0x40) === 0x00)
		this.Core.SetChrRomPage1K(6, page6 & 0x3F);
	else
		this.Core.VRAM[6] = this.Core.VRAMS[page6 & 0x07];

	if((page7 & 0x40) === 0x00)
		this.Core.SetChrRomPage1K(7, page7 & 0x3F);
	else
		this.Core.VRAM[7] = this.Core.VRAMS[page7 & 0x07];
};

NES.prototype.Mapper119.prototype.Write = function(address, data) {
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
				this.Core.SetPrgRomPages8K(this.MAPPER_REG[18], this.MAPPER_REG[17], this.MAPPER_REG[16],this.MAPPER_REG[19]);
			} else {
				this.Core.SetPrgRomPages8K(this.MAPPER_REG[16], this.MAPPER_REG[17], this.MAPPER_REG[18],this.MAPPER_REG[19]);
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
				this.Core.SetPrgRomPages8K(this.MAPPER_REG[18], this.MAPPER_REG[17], this.MAPPER_REG[16],this.MAPPER_REG[19]);
			} else {
				this.Core.SetPrgRomPages8K(this.MAPPER_REG[16], this.MAPPER_REG[17], this.MAPPER_REG[18],this.MAPPER_REG[19]);
			}
			break;

		case 0xA000:
			if((data & 0x01) === 0x01)
				this.Core.SetMirror(true);
			else
				this.Core.SetMirror(false);
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

NES.prototype.Mapper119.prototype.HSync = function(y) {
	if(this.MAPPER_REG[7] === 1 && y < 240 && (this.Core.IO1[0x01] & 0x08) === 0x08) {
		if(--this.MAPPER_REG[4] === 0)
			this.SetIRQ();
		this.MAPPER_REG[4] &= 0xFF;
	}
};


/**** Mapper140 ****/
NES.prototype.Mapper140 = function(core) {
	NES.prototype.MapperProto.apply(this, arguments);
};

NES.prototype.Mapper140.prototype = Object.create(NES.prototype.MapperProto.prototype);

NES.prototype.Mapper140.prototype.Init = function() {
	this.Core.SetPrgRomPage(0, 0);
	this.Core.SetPrgRomPage(1, 1);
	this.Core.SetChrRomPage(0);
};

NES.prototype.Mapper140.prototype.WriteSRAM = function(address, data) {
	var tmp = (data & 0x30) >> 3;
	this.Core.SetPrgRomPage(0, tmp);
	this.Core.SetPrgRomPage(1, tmp + 1);
	this.Core.SetChrRomPage(data & 0x0F);
};


/**** Mapper152 ****/
NES.prototype.Mapper152 = function(core) {
	NES.prototype.MapperProto.apply(this, arguments);
};

NES.prototype.Mapper152.prototype = Object.create(NES.prototype.MapperProto.prototype);

NES.prototype.Mapper152.prototype.Init = function() {
	this.Core.SetPrgRomPage(0, 0);
	this.Core.SetPrgRomPage(1, this.Core.PrgRomPageCount - 1);
	this.Core.SetChrRomPage(0);
};

NES.prototype.Mapper152.prototype.WriteSRAM = function(address, data) {
	this.Core.SetPrgRomPage(0, (data & 0x70) >> 4);
	this.Core.SetChrRomPage(data & 0x0F);

	if((data & 0x80) === 0x80)
		this.Core.SetMirrors(0, 0, 0, 0);
	else
		this.Core.SetMirrors(1, 1, 1, 1);
};


/**** Mapper180 ****/
NES.prototype.Mapper180 = function(core) {
	NES.prototype.MapperProto.apply(this, arguments);
};

NES.prototype.Mapper180.prototype = Object.create(NES.prototype.MapperProto.prototype);

NES.prototype.Mapper180.prototype.Init = function() {
	this.Core.SetPrgRomPage(0, 0);
	this.Core.SetPrgRomPage(1, this.Core.PrgRomPageCount - 1);
	this.Core.SetChrRomPage(0);
};

NES.prototype.Mapper180.prototype.Write = function(address, data) {
	this.Core.SetPrgRomPage(1, data);
};


/**** Mapper184 ****/
NES.prototype.Mapper184 = function(core) {
	NES.prototype.MapperProto.apply(this, arguments);
};

NES.prototype.Mapper184.prototype = Object.create(NES.prototype.MapperProto.prototype);

NES.prototype.Mapper184.prototype.Init = function() {
	this.Core.SetPrgRomPage(0, 0);
	this.Core.SetPrgRomPage(1, this.Core.PrgRomPageCount - 1);
};

NES.prototype.Mapper184.prototype.WriteSRAM = function(address, data) {
	var chrpage = this.Core.ChrRomPageCount * 2 - 1;
	var tmp;
	tmp = (data & chrpage) * 4;
	this.Core.SetChrRomPage1K(0, tmp);
	this.Core.SetChrRomPage1K(1, tmp + 1);
	this.Core.SetChrRomPage1K(2, tmp + 2);
	this.Core.SetChrRomPage1K(3, tmp + 3);

	tmp = ((data >>> 4) & chrpage) * 4;
	this.Core.SetChrRomPage1K(4, tmp);
	this.Core.SetChrRomPage1K(5, tmp + 1);
	this.Core.SetChrRomPage1K(6, tmp + 2);
	this.Core.SetChrRomPage1K(7, tmp + 3);
};


/**** Mapper185 ****/
NES.prototype.Mapper185 = function(core) {
	NES.prototype.MapperProto.apply(this, arguments);
	this.MAPPER_REG = 0;
	this.EX_ChrRom = new Array(0x0400);
};

NES.prototype.Mapper185.prototype = Object.create(NES.prototype.MapperProto.prototype);

NES.prototype.Mapper185.prototype.Init = function() {
	for(var i=0; i<this.EX_ChrRom.length; i++)
		this.EX_ChrRom[i] = 0xFF;
	this.MAPPER_REG = 0;

	this.Core.SetPrgRomPages8K(0, 1, 2, 3);
	this.Core.VRAM[0] = this.EX_ChrRom;
	this.Core.VRAM[1] = this.EX_ChrRom;
	this.Core.VRAM[2] = this.EX_ChrRom;
	this.Core.VRAM[3] = this.EX_ChrRom;
	this.Core.VRAM[4] = this.EX_ChrRom;
	this.Core.VRAM[5] = this.EX_ChrRom;
	this.Core.VRAM[6] = this.EX_ChrRom;
	this.Core.VRAM[7] = this.EX_ChrRom;
};

NES.prototype.Mapper185.prototype.Write = function(address, data) {
	this.MAPPER_REG = data;

	if((data & 0x03) !== 0x00) {
		this.Core.SetChrRomPages1K(0, 1, 2, 3, 4, 5, 6, 7);
	} else {
		this.Core.VRAM[0] = this.EX_ChrRom;
		this.Core.VRAM[1] = this.EX_ChrRom;
		this.Core.VRAM[2] = this.EX_ChrRom;
		this.Core.VRAM[3] = this.EX_ChrRom;
		this.Core.VRAM[4] = this.EX_ChrRom;
		this.Core.VRAM[5] = this.EX_ChrRom;
		this.Core.VRAM[6] = this.EX_ChrRom;
		this.Core.VRAM[7] = this.EX_ChrRom;
	}
};


/**** Mapper207 ****/
NES.prototype.Mapper207 = function(core) {
	NES.prototype.MapperProto.apply(this, arguments);
	this.MAPPER_REG = new Array(11);
	this.EX_RAM = new Array(128);
};

NES.prototype.Mapper207.prototype = Object.create(NES.prototype.MapperProto.prototype);

NES.prototype.Mapper207.prototype.Init = function() {
	for(var i=0; i<this.MAPPER_REG.length; i++)
		this.MAPPER_REG[i] = 0;

	for(var i=0; i<this.EX_RAM.length; i++) {
		this.EX_RAM[i] = 0x00;
	}

	this.Core.SetPrgRomPages8K(0, 1, 2, this.Core.PrgRomPageCount * 2 - 1);
	this.Core.SetChrRomPages1K(0, 1, 2, 3, 4, 5, 6, 7);
};

NES.prototype.Mapper207.prototype.ReadSRAM = function(address) {
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

NES.prototype.Mapper207.prototype.WriteSRAM = function(address, data) {
	if(address >= 0x7F00 && address <= 0x7FFF) {
		this.EX_RAM[address & 0x007F] = data;
		return;
	}

	switch(address) {
		case 0x7EF0:
			this.MAPPER_REG[0] = data;
			if((data & 0x80) === 0x00) {
				this.Core.VRAM[8] = this.Core.VRAMS[8];
				this.Core.VRAM[9] = this.Core.VRAMS[8];
			} else {
				this.Core.VRAM[8] = this.Core.VRAMS[9];
				this.Core.VRAM[9] = this.Core.VRAMS[9];
			}
			this.Core.SetChrRomPage1K(0, data & 0x7E);
			this.Core.SetChrRomPage1K(1, (data & 0x7E) + 1);
			break;
		case 0x7EF1:
			this.MAPPER_REG[1] = data;
			if((data & 0x80) === 0x00) {
				this.Core.SetChrRomPage1K(10, 8 + 0x0100);
				this.Core.SetChrRomPage1K(11, 8 + 0x0100);
			} else {
				this.Core.SetChrRomPage1K(10, 9 + 0x0100);
				this.Core.SetChrRomPage1K(11, 9 + 0x0100);
			}
			this.Core.SetChrRomPage1K(2, data & 0x7E);
			this.Core.SetChrRomPage1K(3, (data & 0x7E) + 1);
			break;
		case 0x7EF2:
			this.MAPPER_REG[2] = data;
			this.Core.SetChrRomPage1K(4, data);
			break;
		case 0x7EF3:
			this.MAPPER_REG[3] = data;
			this.Core.SetChrRomPage1K(5, data);
			break;
		case 0x7EF4:
			this.MAPPER_REG[4] = data;
			this.Core.SetChrRomPage1K(6, data);
			break;
		case 0x7EF5:
			this.MAPPER_REG[5] = data;
			this.Core.SetChrRomPage1K(7, data);
			break;
		case 0x7EF8:
		case 0x7EF9:
			this.MAPPER_REG[7] = data;
			break;
		case 0x7EFA:
		case 0x7EFB:
			this.MAPPER_REG[8] = data;
			this.Core.SetPrgRomPage8K(0, data);
			break;
		case 0x7EFC:
		case 0x7EFD:
			this.MAPPER_REG[9] = data;
			this.Core.SetPrgRomPage8K(1, data);
			break;
		case 0x7EFE:
		case 0x7EFF:
			this.MAPPER_REG[10] = data;
			this.Core.SetPrgRomPage8K(2, data);
			break;
	}
};


NES.prototype.MapperSelect = function () {
	switch(this.MapperNumber) {
		case 0:
			this.Mapper = new this.Mapper0(this);
			break;
		case 1:
			this.Mapper = new this.Mapper1(this);
			break;
		case 2:
			this.Mapper = new this.Mapper2(this);
			break;
		case 3:
			this.Mapper = new this.Mapper3(this);
			break;
		case 4:
			this.Mapper = new this.Mapper4(this);
			break;
		case 5:
			this.Mapper = new this.Mapper5(this);
			break;
		case 7:
			this.Mapper = new this.Mapper7(this);
			break;
		case 9:
			this.Mapper = new this.Mapper9(this);
			break;
		case 10:
			this.Mapper = new this.Mapper10(this);
			break;
		case 16:
			this.Mapper = new this.Mapper16(this);
			break;
		case 18:
			this.Mapper = new this.Mapper18(this);
			break;
		case 19:
			this.Mapper = new this.Mapper19(this);
			break;
		case 20:
			this.Mapper = new this.Mapper20(this);
			break;
		case 21:
			this.Mapper = new this.Mapper25(this);
			break;
		case 22:
			this.Mapper = new this.Mapper22(this);
			break;
		case 23:
			this.Mapper = new this.Mapper23(this);
			break;
		case 24:
			this.Mapper = new this.Mapper24(this);
			break;
		case 25:
			this.Mapper = new this.Mapper25(this);
			break;
		case 26:
			this.Mapper = new this.Mapper26(this);
			break;
		case 32:
			this.Mapper = new this.Mapper32(this);
			break;
		case 33:
			this.Mapper = new this.Mapper33(this);
			break;
		case 34:
			this.Mapper = new this.Mapper34(this);
			break;
		case 48:
			this.Mapper = new this.Mapper48(this);
			break;
		case 65:
			this.Mapper = new this.Mapper65(this);
			break;
		case 66:
			this.Mapper = new this.Mapper66(this);
			break;
		case 67:
			this.Mapper = new this.Mapper67(this);
			break;
		case 68:
			this.Mapper = new this.Mapper68(this);
			break;
		case 69:
			this.Mapper = new this.Mapper69(this);
			break;
		case 70:
			this.Mapper = new this.Mapper70(this);
			break;
		case 72:
			this.Mapper = new this.Mapper72(this);
			break;
		case 73:
			this.Mapper = new this.Mapper73(this);
			break;
		case 75:
			this.Mapper = new this.Mapper75(this);
			break;
		case 76:
			this.Mapper = new this.Mapper76(this);
			break;
		case 77:
			this.Mapper = new this.Mapper77(this);
			break;
		case 78:
			this.Mapper = new this.Mapper78(this);
			break;
		case 80:
			this.Mapper = new this.Mapper80(this);
			break;
		case 82:
			this.Mapper = new this.Mapper82(this);
			break;
		case 85:
			this.Mapper = new this.Mapper85(this);
			break;
		case 86:
			this.Mapper = new this.Mapper86(this);
			break;
		case 87:
			this.Mapper = new this.Mapper87(this);
			break;
		case 88:
			this.Mapper = new this.Mapper88(this);
			break;
		case 89:
			this.Mapper = new this.Mapper89(this);
			break;
		case 92:
			this.Mapper = new this.Mapper92(this);
			break;
		case 93:
			this.Mapper = new this.Mapper93(this);
			break;
		case 94:
			this.Mapper = new this.Mapper94(this);
			break;
		case 95:
			this.Mapper = new this.Mapper95(this);
			break;
		case 97:
			this.Mapper = new this.Mapper97(this);
			break;
		case 101:
			this.Mapper = new this.Mapper101(this);
			break;
		case 118:
			this.Mapper = new this.Mapper118(this);
			break;
		case 119:
			this.Mapper = new this.Mapper119(this);
			break;
		case 140:
			this.Mapper = new this.Mapper140(this);
			break;
		case 152:
			this.Mapper = new this.Mapper152(this);
			break;
		case 180:
			this.Mapper = new this.Mapper180(this);
			break;
		case 184:
			this.Mapper = new this.Mapper184(this);
			break;
		case 185:
			this.Mapper = new this.Mapper185(this);
			break;
		case 207:
			this.Mapper = new this.Mapper207(this);
			break;
		case 210:
			this.Mapper = new this.Mapper19(this);
			break;
		default:
			return false;
	}
	return true;
};

module.exports = NES;
