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

Base.prototype.ReadSRAM = function(address) {
	return this.nes.SRAM[address & 0x1FFF];
};

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

Base.prototype.OutSRAM = function() {
	var ret = "";
	for(var i=0; i<this.nes.SRAM.length; i++) {
		ret += (this.nes.SRAM[i] < 0x10 ? "0" : "") + this.nes.SRAM[i].toString(16);
	}
	return ret.toUpperCase();
};

Base.prototype.InSRAM = function(sram) {
	var i;
	for(i=0; i<this.nes.SRAM.length; i++)
		this.nes.SRAM[i] = 0x00;

	try{
		for(i=0; i<(this.nes.SRAM.length * 2) && i<sram.length; i+=2)
			this.nes.SRAM[i / 2] = parseInt(sram.substr(i, 2), 16);
	} catch(e) {
		return false;
	}
	return true;
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
