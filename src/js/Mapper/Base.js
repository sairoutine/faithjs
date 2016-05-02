"use strict";

var MapperProto = function(core) {
	this.Core = core;
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
	return this.Core.ReadPPUData_SUB();
};

MapperProto.prototype.WritePPUData = function (value) {
	this.Core.WritePPUData_SUB(value);
};

MapperProto.prototype.BuildBGLine = function () {
	this.Core.BuildBGLine_SUB();
};

MapperProto.prototype.BuildSpriteLine = function () {
	this.Core.BuildSpriteLine_SUB();
};

MapperProto.prototype.ReadSRAM = function(address) {
	return this.Core.SRAM[address & 0x1FFF];
};

MapperProto.prototype.WriteSRAM = function(address, data) {
	this.Core.SRAM[address & 0x1FFF] = data;
};

MapperProto.prototype.Write = function(address, data) {
};

MapperProto.prototype.HSync = function(y) {
};

MapperProto.prototype.CPUSync = function(clock) {
};

MapperProto.prototype.SetIRQ = function() {
	this.Core.toIRQ |= 0x04;
};

MapperProto.prototype.ClearIRQ = function() {
	this.Core.toIRQ &= ~0x04;
};

MapperProto.prototype.OutEXSound = function(soundin) {
	return soundin;
};

MapperProto.prototype.EXSoundSync = function(clock) {
};

MapperProto.prototype.OutSRAM = function() {
	var ret = "";
	for(var i=0; i<this.Core.SRAM.length; i++) {
		ret += (this.Core.SRAM[i] < 0x10 ? "0" : "") + this.Core.SRAM[i].toString(16);
	}
	return ret.toUpperCase();
};

MapperProto.prototype.InSRAM = function(sram) {
	var i;
	for(i=0; i<this.Core.SRAM.length; i++)
		this.Core.SRAM[i] = 0x00;

	try{
		for(i=0; i<(this.Core.SRAM.length * 2) && i<sram.length; i+=2)
			this.Core.SRAM[i / 2] = parseInt(sram.substr(i, 2), 16);
	} catch(e) {
		return false;
	}
	return true;
};

MapperProto.prototype.GetState = function() {
	if(this.MAPPER_REG === null)
		return;

	this.Core.StateData.Mapper = {};
	this.Core.StateData.Mapper.MAPPER_REG = this.MAPPER_REG.slice(0);
};

MapperProto.prototype.SetState = function() {
	if(this.MAPPER_REG === null)
		return;

	for(var i=0; i<this.Core.StateData.Mapper.MAPPER_REG.length; i++)
		this.MAPPER_REG[i] = this.Core.StateData.Mapper.MAPPER_REG[i];
};


module.exports = MapperProto;
