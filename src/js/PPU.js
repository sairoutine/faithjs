'use strict';

var PPUStatusRegister = require('./Register/PPUStatus');

var PPU = function(nes) {
	this.nes = nes;
	this.cpu = null;
	this.ram = null;
	this.sr = new PPUStatusRegister(this._ID_SR_REG, this, true, false);
};

// レジスタのID
PPU.prototype._ID_SR_REG         = 0;


PPU.prototype.init = function() {
	this.cpu = this.nes.cpu;
	this.ram = this.nes.cpu.ram;
	// 0b10000000
	// Vertical blank has started.
	this.sr.store(0x80);
};

module.exports = PPU;
