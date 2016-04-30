'use strict';

var Register8Bit      = require('./Register/8Bit');
var Register16Bit     = require('./Register/16Bit');
var CPUStatusRegister = require('./Register/CPUStatus');

var RAM = require('./RAM');

/**
 * 6502 processor
 */

var CPU = function(nes) {
	this.nes = nes;

	// レジスタ
	// Accumulator
	this.a = new Register8Bit();
	// Indexes
	this.x = new Register8Bit();
	this.y = new Register8Bit();
	// Program Counter
	this.pc = new Register16Bit();
	// Stack Pointer
	this.sp = new Register8Bit();
	// Status Register
	this.p = new CPUStatusRegister();

	// メモリ(work RAM)
	this.ram = new RAM();

	this.pad1 = null;
	this.ppu = null;
	this.rom = null;

	// 前回実行したオペコードが消費するサイクル数
	this.consume_cycle_num = 0;
};

// CPUの割り込みの種類一覧
CPU.prototype.INTERRUPT_RESET = 0;
CPU.prototype.INTERRUPT_NMI   = 1;
CPU.prototype.INTERRUPT_IRQ   = 2;
CPU.prototype.INTERRUPT_BRK   = 3;

CPU.prototype.init = function() {
	this.ppu  = this.nes.ppu;
	this.pad1 = this.nes.pad1;
	this.rom  = this.nes.rom;
};

CPU.prototype.interrupt = function(interrupt_type) {
	// TODO: 
	switch(interrupt_type) {
		case this.INTERRUPT_IRQ:
			// IRQ割り込み中のIRQ割り込みは無視
			if(this.p.isI()) {
				return;
			}
			/*
			this._pushStack2Bytes(this.pc.load());
			this._pushStack(this.p.load());
			this.p.setI();
			this._jumpToInterruptHandler(type);
			*/
			break;
		case this.INTERRUPT_RESET:
			break;
		case this.INTERRUPT_NMI:
			break;
		case this.INTERRUPT_BRK:
			break;
	}
};


module.exports = CPU;
