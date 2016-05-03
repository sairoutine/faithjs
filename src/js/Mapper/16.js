"use strict";

var MapperProto = require('./Base');

/**** Mapper16 ****/
var Mapper16 = function(nes) {
	MapperProto.apply(this, arguments);
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

Mapper16.prototype = Object.create(MapperProto.prototype);

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
