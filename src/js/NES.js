'use strict';

var PPU = require('./PPU');
var CPU = require('./CPU');
var Joypad = require('./Joypad');

var NES = function(rom, display) {
	this.rom     = rom;
	this.display = display;

	this.ppu  = new PPU(this);
	this.cpu  = new CPU(rom, this.ppu);
	this.pad1 = new Joypad();
};

NES.prototype.init = function() {
	this.ppu.init();
	this.cpu.init();
	this.pad1.init();
};


NES.prototype.handleKeyDown = function(e) {

};
NES.prototype.handleKeyUp = function(e) {

};
// 電源ON
NES.prototype.bootup = function(e) {

};
NES.prototype.run = function(e) {

};

module.exports = NES;
