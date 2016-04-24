'use strict';

var Register8Bit      = require('./Register/8Bit');
var Register16Bit     = require('./Register/16Bit');
var CPUStatusRegister = require('./Register/CPUStatus');

var RAM = require('./RAM');

/**
 * 6502 processor
 */

function CPU(nes) {
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

	// メモリ
	this.ram = new RAM();

	this.pad1 = null;
	this.ppu = null;
	this.rom = null;
	//this.handling = 0;
};

CPU.prototype.init = function() {
	this.ppu  = this.nes.ppu;
	this.pad1 = this.nes.pad1;
	this.rom  = this.nes.rom;
};
module.exports = CPU;
