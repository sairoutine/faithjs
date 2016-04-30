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

CPU.prototype.runCycle = function() {
	// 前回のオペコード実行にかかるサイクル数を消費しきったら
	if(this.consume_cycle_num <= 0) {

		// プログラムカウンタの指すメモリの値を読み込み
		var opc = this.load(this.pc.load());
		this.pc.increment();

		// オペコード実行
		var op = this._OP[opc];
		this._operate(op);

		// オペコード実行にかかるサイクル数
		this.consume_cycle_num = op.cycle;
	}

	this.consume_cycle_num--;
};

// メモリからデータを読み込み
CPU.prototype.load = function(address) {
	// メモリから該当するデバイスにアクセス
	var map = this._map(address);
	return map.target.load(map.addr);
};

// NESは Memory Mapped I/Oなので
// メモリを通じて各種デバイスにアクセスする
CPU.prototype._map = function(address) {
	var addr = null;
	var target = null;

	// 2KB of work RAM and Mirror
	if(address >= 0x0000 && address < 0x2000) {
		target = this.ram;

		// 0x0800 以降はwork RAMのMirror
		addr = address & 0x07ff; // 0b011111111111
	}
	// PPU Ctrl Registers
	else if(address >= 0x2000 && address < 0x4000) {
		// 0x0008 以降は PPU Ctrl Registers のMirror
		addr = address & 0x0007; // 0b000000000111

		switch(addr) {
			case 0x0000:
				// PPUCTRL
				target = this.ppu.ctrl1;
				break;
			case 0x0001:
				// PPUMASK
				target = this.ppu.ctrl2;
				break;
			case 0x0002:
				// PPUSTATUS
				target = this.ppu.sr;
				break;
			case 0x0003:
				// OAMADDR
				target = this.ppu.sprAddr;
				break;
			case 0x0004:
				// OAMDATA
				target = this.ppu.sprIO;
				break;
			case 0x0005:
				// PPUSCROLL
				target = this.ppu.vRAMAddr1;
				break;
			case 0x0006:
				// PPUADDR
				target = this.ppu.vRAMAddr2;
				break;
			case 0x0007:
				// PPUDATA
				target = this.ppu.vRAMIO;
				break;
		}
		addr = null;
	}
	// Registers(Mostly APU)
	else if(address >= 0x4000 && address < 0x4020) {
		// TODO: imply APU
		switch(address) {
			case 0x4000:
				break;
			case 0x4001:
				break;
			case 0x4002:
				break;
			case 0x4003:
				break;
			case 0x4004:
				break;
			case 0x4005:
				break;
			case 0x4006:
				break;
			case 0x4007:
				break;
			case 0x4008:
				break;
			case 0x4009:
				break;
			case 0x400A:
				break;
			case 0x400B:
				break;
			case 0x400C:
				break;
			case 0x400D:
				break;
			case 0x400E:
				break;
			case 0x400F:
				break;
			case 0x4010:
				break;
			case 0x4011:
				break;
			case 0x4012:
				break;
			case 0x4013:
				break;
			case 0x4014:
				// PPU OAMDMA
				target = this.ppu.sprDMA;
				break;
			case 0x4015:
				break;
			case 0x4016:
				// PAD I/O Register
				target = this.pad1.register;
				break;
			case 0x4017:
				break;
			case 0x4018:
				break;
			case 0x4019:
				break;
			case 0x401A:
				break;
			case 0x401B:
				break;
			case 0x401C:
				break;
			case 0x401D:
				break;
			case 0x401E:
				break;
			case 0x401F:
				break;
		}
		addr = null;

		// APU未実装なので適当なレジスタに突っ込む
		if(target === null) {
			target = new Register();
		}

	}
	// 拡張ROM
	else if(address >= 0x4020 && address < 0x6000) {
		// TODO: why?
		target = this.ram;
		addr = address;
	}
	// 拡張RAM
	else if(address >= 0x6000 && address < 0x8000) {
		target = this.ram;
		addr = address;
	}
	// RPG-ROM
	else if(address >= 0x8000 && address < 0x10000) {
		target = this.rom;

		// TODO: why?
		// this address translation might should be done by ROM Memory mapper.
		addr = address - 0x8000;
	}

	// return data
	var result = {'target': null, 'addr': null};
	result.target = target;
	result.addr = addr;

	return result;
};


module.exports = CPU;
