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

// オペコード
CPU.prototype._OP_INV = {'opc':  0, 'name': 'inv'}; // Invalid
CPU.prototype._OP_ADC = {'opc':  1, 'name': 'adc'};
CPU.prototype._OP_AND = {'opc':  2, 'name': 'and'};
CPU.prototype._OP_ASL = {'opc':  3, 'name': 'asl'};
CPU.prototype._OP_BCC = {'opc':  4, 'name': 'bcc'};
CPU.prototype._OP_BCS = {'opc':  5, 'name': 'bcs'};
CPU.prototype._OP_BEQ = {'opc':  6, 'name': 'beq'};
CPU.prototype._OP_BIT = {'opc':  7, 'name': 'bit'};
CPU.prototype._OP_BMI = {'opc':  8, 'name': 'bmi'};
CPU.prototype._OP_BNE = {'opc':  9, 'name': 'bne'};
CPU.prototype._OP_BPL = {'opc': 10, 'name': 'bpl'};
CPU.prototype._OP_BRK = {'opc': 11, 'name': 'brk'};
CPU.prototype._OP_BVC = {'opc': 12, 'name': 'bvc'};
CPU.prototype._OP_BVS = {'opc': 13, 'name': 'bvs'};
CPU.prototype._OP_CLC = {'opc': 14, 'name': 'clc'};
CPU.prototype._OP_CLD = {'opc': 15, 'name': 'cld'};
CPU.prototype._OP_CLI = {'opc': 16, 'name': 'cli'};
CPU.prototype._OP_CLV = {'opc': 17, 'name': 'clv'};
CPU.prototype._OP_CMP = {'opc': 18, 'name': 'cmp'};
CPU.prototype._OP_CPX = {'opc': 19, 'name': 'cpx'};
CPU.prototype._OP_CPY = {'opc': 20, 'name': 'cpy'};
CPU.prototype._OP_DEC = {'opc': 21, 'name': 'dec'};
CPU.prototype._OP_DEX = {'opc': 22, 'name': 'dex'};
CPU.prototype._OP_DEY = {'opc': 23, 'name': 'dey'};
CPU.prototype._OP_EOR = {'opc': 24, 'name': 'eor'};
CPU.prototype._OP_INC = {'opc': 25, 'name': 'inc'};
CPU.prototype._OP_INX = {'opc': 26, 'name': 'inx'};
CPU.prototype._OP_INY = {'opc': 27, 'name': 'iny'};
CPU.prototype._OP_JMP = {'opc': 28, 'name': 'jmp'};
CPU.prototype._OP_JSR = {'opc': 29, 'name': 'jsr'};
CPU.prototype._OP_LDA = {'opc': 30, 'name': 'lda'};
CPU.prototype._OP_LDX = {'opc': 31, 'name': 'ldx'};
CPU.prototype._OP_LDY = {'opc': 32, 'name': 'ldy'};
CPU.prototype._OP_LSR = {'opc': 33, 'name': 'lsr'};
CPU.prototype._OP_NOP = {'opc': 34, 'name': 'nop'};
CPU.prototype._OP_ORA = {'opc': 35, 'name': 'ora'};
CPU.prototype._OP_PHA = {'opc': 36, 'name': 'pha'};
CPU.prototype._OP_PHP = {'opc': 37, 'name': 'php'};
CPU.prototype._OP_PLA = {'opc': 38, 'name': 'pla'};
CPU.prototype._OP_PLP = {'opc': 39, 'name': 'plp'};
CPU.prototype._OP_ROL = {'opc': 40, 'name': 'rol'};
CPU.prototype._OP_ROR = {'opc': 41, 'name': 'ror'};
CPU.prototype._OP_RTI = {'opc': 42, 'name': 'rti'};
CPU.prototype._OP_RTS = {'opc': 43, 'name': 'rts'};
CPU.prototype._OP_SBC = {'opc': 44, 'name': 'sbc'};
CPU.prototype._OP_SEC = {'opc': 45, 'name': 'sec'};
CPU.prototype._OP_SED = {'opc': 46, 'name': 'sed'};
CPU.prototype._OP_SEI = {'opc': 47, 'name': 'sei'};
CPU.prototype._OP_STA = {'opc': 48, 'name': 'sta'};
CPU.prototype._OP_STX = {'opc': 49, 'name': 'stx'};
CPU.prototype._OP_STY = {'opc': 50, 'name': 'sty'};
CPU.prototype._OP_TAX = {'opc': 51, 'name': 'tax'};
CPU.prototype._OP_TAY = {'opc': 52, 'name': 'tay'};
CPU.prototype._OP_TSX = {'opc': 53, 'name': 'tsx'};
CPU.prototype._OP_TXA = {'opc': 54, 'name': 'txa'};
CPU.prototype._OP_TXS = {'opc': 55, 'name': 'txs'};
CPU.prototype._OP_TYA = {'opc': 56, 'name': 'tya'};

//////////////////////////////////////////////////////////////////////
// アドレッシングモード一覧
//////////////////////////////////////////////////////////////////////

// イミディエイト・アドレス指定（Immediate Addressing）
// 2番目のバイトをデータそのものとして使用します。
// * オペコード データ
CPU.prototype._ADDRESSING_IMMEDIATE           = {'id':  0, 'pc': 2, 'name': 'immediate'};

// アブソリュート・アドレス指定（Absolute Addressing）
// 2番目のバイトを下位アドレス、 3番目のバイトを上位アドレスとして実効アドレスとします。
// * オペコード 下位アドレス 上位アドレス
CPU.prototype._ADDRESSING_ABSOLUTE            = {'id':  1, 'pc': 3, 'name': 'absolute'};

// ゼロページ・インデックス・アドレス指定（Indexed Zero Page Addressing）
// 上位アドレスとして$00、 下位アドレスとして2番目のバイトに
// インデックスレジスタ（X or Y）を加算（8） した値を実効アドレスとします。
// * オペコード 下位アドレス
CPU.prototype._ADDRESSING_INDEXED_ABSOLUTE_X  = {'id':  2, 'pc': 3, 'name': 'indexed_absolute_x'};
CPU.prototype._ADDRESSING_INDEXED_ABSOLUTE_Y  = {'id':  3, 'pc': 3, 'name': 'indexed_absolute_y'};

// ゼロページ・アドレス指定（Zero Page Addressing）
// 上位アドレスとして$00、下位アドレスとして2番目のバイトを使用し実効アドレスとします。
// * オペコード 下位アドレス
CPU.prototype._ADDRESSING_ZERO_PAGE           = {'id':  4, 'pc': 2, 'name': 'zero_page'};

// ゼロページ・インデックス・アドレス指定（Indexed Zero Page Addressing）
// 上位アドレスとして$00、 下位アドレスとして2番目のバイトに
// インデックスレジスタ（X or Y）を加算（8） した値を実効アドレスとします。
// * オペコード 下位アドレス
CPU.prototype._ADDRESSING_INDEXED_ZERO_PAGE_X = {'id':  5, 'pc': 2, 'name': 'indexed_zero_page_x'};
CPU.prototype._ADDRESSING_INDEXED_ZERO_PAGE_Y = {'id':  6, 'pc': 2, 'name': 'indexed_zero_page_y'};

// インプライド・アドレス指定（Implied Addressing）
// レジスタ類を操作する命令で使用され、アドレス指定はありません。
// * オペコード
CPU.prototype._ADDRESSING_IMPLIED             = {'id':  7, 'pc': 1, 'name': 'implied'};

// アキュムレータ・アドレス指定（Accumulator Addressing）
// アキュムレータ上での実行を意味します。
// * オペコード
CPU.prototype._ADDRESSING_ACCUMULATOR         = {'id':  8, 'pc': 1, 'name': 'accumulator'};

// アブソリュート・インダイレクト・アドレス指定（Absolute Indirect Addressing）
// 2、3番目のバイトで示されるアドレスに格納されている値を
// 実効アドレスの下位バイト、 その次のアドレスに格納されている値を
// 実効アドレスの上位バイトとします。
// このインクリメントで下位バイトからのキャリーは無視します。
// * オペコード 下位アドレス 上位アドレス
CPU.prototype._ADDRESSING_INDIRECT            = {'id':  9, 'pc': 3, 'name': 'indirect'};

// インデックス・インダイレクト・アドレス指定（Indexed Indirect Addressing）
// 上位アドレスを$00とし、 また2番目のバイトに
// インデックスレジスタXを加算（8）した値を下位アドレスとします。
// このアドレスに格納されている値を実効アドレスの下位バイト、
// そしてその次のアドレスに格納されている値を実効アドレスの上位バイトとします。
// このインクリメントにおいてキャリーは無視します。
// * オペコード 下位アドレス
CPU.prototype._ADDRESSING_INDEXED_INDIRECT_X  = {'id': 10, 'pc': 2, 'name': 'indexed_indirect_x'};

// インダイレクト・インデックス・アドレス指定（Indirect Indexed Addressing）
// まず上位アドレスを$00とし、下位アドレスとして2番目のバイトを使用します。
// このアドレスに格納されている値を次の上位アドレス、
// その次のアドレスに格納されている値を次の下位アドレスとします。
// このときのインクリメントにおけるキャリーは無視します。
// 得られたアドレスにインデックスレジスタYを加算（16）したものを実効アドレスとします。
// * オペコード 下位アドレス
CPU.prototype._ADDRESSING_INDEXED_INDIRECT_Y  = {'id': 11, 'pc': 2, 'name': 'indexed_indirect_y'};

// リラティブ・アドレス指定（Relative Addressing）
// 条件分岐命令で使用されます。 次の命令を示すプログラムカウンタに
// 2番目のバイトを加算（符号拡張）した値を実効アドレスとします。
// オフセットとして、-128（$80）～+127（$7F）を指定できます。
// * オペコード オフセット
CPU.prototype._ADDRESSING_RELATIVE            = {'id': 12, 'pc': 2, 'name': 'relative'};






module.exports = CPU;
