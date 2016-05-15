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
