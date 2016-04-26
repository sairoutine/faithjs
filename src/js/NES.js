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
NES.prototype.bootup = function() {
	/* Status Register: 0b00110100 */
	/* 4: BRK命令による割り込みが発生 */
	/* 2: 割り込みが発生 */
	this.cpu.p.store(0x34);
	/* Stack Pointer: 0b11111101 */
	this.cpu.sp.store(0xFD);

	// RESET 割り込み
	this.cpu.interrupt(CPU.prototype.INTERRUPT_RESET);

	// 電源ON状態
	this.state = this._STATE_RUN;
};

// 起動
NES.prototype.run = function() {
	// 経過フレーム数更新
	this.count++;

	// 1秒間のCPUクロック数
	var cycles = 341*262 / 3;
	for(var i = 0; i < cycles; i++) {
		/*
		this.cpu.runCycle();
		this.ppu.runCycle();
		this.ppu.runCycle();
		this.ppu.runCycle();
	   */
	}

	if(this.state === this._STATE_RUN) {
		// 次の描画タイミングで再呼び出ししてループ
		requestAnimationFrame(this.run.bind(this));
	}
};

module.exports = NES;
