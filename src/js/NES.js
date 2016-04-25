'use strict';

var PPU = require('./PPU');
var CPU = require('./CPU');
var Joypad = require('./Joypad');

var NES = function(rom, display) {
	this.rom     = rom;
	this.display = display;

	this.ppu  = new PPU(this);
	this.cpu  = new CPU(this);
	this.pad1 = new Joypad(this);

	// フレーム数
	this.count = 0;

	// 電源OFF
	this.state = this._STATE_POWER_OFF;
};

// NES Status
NES.prototype._STATE_POWER_OFF = 0;
NES.prototype._STATE_RUN       = 1;
NES.prototype._STATE_STOP      = 2;

// 初期化
NES.prototype.init = function() {
	this.ppu.init();
	this.cpu.init();
	this.pad1.init();
};


NES.prototype.handleKeyDown = function(e) {
	this.pad1.pushKeyDown(e.keyCode);
	e.preventDefault();
};
NES.prototype.handleKeyUp = function(e) {
	this.pad1.pushKeyUp(e.keyCode);
	e.preventDefault();
};

// 電源ON
NES.prototype.bootup = function(e) {

};
NES.prototype.run = function(e) {

};

module.exports = NES;
