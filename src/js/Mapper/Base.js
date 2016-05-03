"use strict";

var MapperProto = function(nes) {
	this.nes = nes;
	this.MAPPER_REG = null;
};

MapperProto.prototype.Init = function() {
};

MapperProto.prototype.ReadLow = function(address) {
	return 0x40;
};

MapperProto.prototype.WriteLow = function(address, data) {
};

MapperProto.prototype.ReadPPUData = function () {
	return this.nes.ReadPPUData_SUB();
};

MapperProto.prototype.WritePPUData = function (value) {
	this.nes.WritePPUData_SUB(value);
};

MapperProto.prototype.BuildBGLine = function () {
	this.nes.BuildBGLine_SUB();
};

MapperProto.prototype.BuildSpriteLine = function () {
	this.nes.BuildSpriteLine_SUB();
};

MapperProto.prototype.ReadSRAM = function(address) {
	return this.nes.SRAM[address & 0x1FFF];
};

MapperProto.prototype.WriteSRAM = function(address, data) {
	this.nes.SRAM[address & 0x1FFF] = data;
};

MapperProto.prototype.Write = function(address, data) {
};

MapperProto.prototype.HSync = function(y) {
};

MapperProto.prototype.CPUSync = function(clock) {
};

MapperProto.prototype.SetIRQ = function() {
	this.nes.toIRQ |= 0x04;
};

MapperProto.prototype.ClearIRQ = function() {
	this.nes.toIRQ &= ~0x04;
};

MapperProto.prototype.OutEXSound = function(soundin) {
	return soundin;
};

MapperProto.prototype.EXSoundSync = function(clock) {
};

MapperProto.prototype.OutSRAM = function() {
	var ret = "";
	for(var i=0; i<this.nes.SRAM.length; i++) {
		ret += (this.nes.SRAM[i] < 0x10 ? "0" : "") + this.nes.SRAM[i].toString(16);
	}
	return ret.toUpperCase();
};

MapperProto.prototype.InSRAM = function(sram) {
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

MapperProto.prototype.GetState = function() {
	if(this.MAPPER_REG === null)
		return;

	this.nes.StateData.Mapper = {};
	this.nes.StateData.Mapper.MAPPER_REG = this.MAPPER_REG.slice(0);
};

MapperProto.prototype.SetState = function() {
	if(this.MAPPER_REG === null)
		return;

	for(var i=0; i<this.nes.StateData.Mapper.MAPPER_REG.length; i++)
		this.MAPPER_REG[i] = this.nes.StateData.Mapper.MAPPER_REG[i];
};


module.exports = MapperProto;
