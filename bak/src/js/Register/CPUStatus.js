'use strict';

var _ = require('lodash');
var Register8Bit = require('./8Bit');

var CPUStatusRegister = function() {
	Register8Bit.apply(this, arguments);

};
// 基底クラスを継承
_.extend(CPUStatusRegister.prototype, Register8Bit.prototype);
_.extend(CPUStatusRegister, Register8Bit);

// レジスタの各種bit
CPUStatusRegister.prototype.N_BIT = 7;
CPUStatusRegister.prototype.V_BIT = 6;
CPUStatusRegister.prototype.A_BIT = 5;  // 使ってない
CPUStatusRegister.prototype.B_BIT = 4;
CPUStatusRegister.prototype.D_BIT = 3;
CPUStatusRegister.prototype.I_BIT = 2;
CPUStatusRegister.prototype.Z_BIT = 1;
CPUStatusRegister.prototype.C_BIT = 0;

/////////////////////////////////////////////////////////////////////////////////
//
// N（Negative flag）
// 演算結果のビット7をストアします。 BIT命令ではメモリ値のビット7をストアします。
//
/////////////////////////////////////////////////////////////////////////////////

CPUStatusRegister.prototype.isN = function() {
	return this.loadBit(this.N_BIT);
};

CPUStatusRegister.prototype.setN = function() {
	this.storeBit(this.N_BIT, 1);
};

CPUStatusRegister.prototype.clearN = function() {
	this.storeBit(this.N_BIT, 0);
};

/////////////////////////////////////////////////////////////////////////////////
//
// V（oVerflow flag）
// 演算によって$7F-$80をまたぐときにセットし、そうでないならクリア（0をストア）します。
// またBIT命令でメモリ値のビット6をストアし、CLV命令でクリアします。
//
/////////////////////////////////////////////////////////////////////////////////

CPUStatusRegister.prototype.isV = function() {
	return this.loadBit(this.V_BIT);
};

CPUStatusRegister.prototype.setV = function() {
	this.storeBit(this.V_BIT, 1);
};

CPUStatusRegister.prototype.clearV = function() {
	this.storeBit(this.V_BIT, 0);
};

/////////////////////////////////////////////////////////////////////////////////
//
// B（Break flag）
// BRK命令による割り込みが発生したときにセットします。 NMIやIRQの場合はクリアします。
//
/////////////////////////////////////////////////////////////////////////////////

CPUStatusRegister.prototype.isB = function() {
	return this.loadBit(this.B_BIT);
};

CPUStatusRegister.prototype.setB = function() {
	this.storeBit(this.B_BIT, 1);
};

CPUStatusRegister.prototype.clearB = function() {
	this.storeBit(this.B_BIT, 0);
};

/////////////////////////////////////////////////////////////////////////////////
//
// D（Decimal flag）
// オリジナルの6502ではこのフラグをセットすることによって、 演算命令で10進演算が使用されます。
// NESでは10進演算は削除されているため、 このフラグは無視します。
// ただし、SED、CLD命令によって操作は可能です。
//
/////////////////////////////////////////////////////////////////////////////////

CPUStatusRegister.prototype.isD = function() {
	return this.loadBit(this.D_BIT);
};

CPUStatusRegister.prototype.setD = function() {
	this.storeBit(this.D_BIT, 1);
};

CPUStatusRegister.prototype.clearD = function() {
	this.storeBit(this.D_BIT, 0);
};

/////////////////////////////////////////////////////////////////////////////////
//
// I（Interrupt flag）
// 割り込みが発生するとセットします。 またCLI命令でクリア、SEI命令でセットします。
//
/////////////////////////////////////////////////////////////////////////////////

CPUStatusRegister.prototype.isI = function() {
	return this.loadBit(this.I_BIT);
};


CPUStatusRegister.prototype.setI = function() {
	this.storeBit(this.I_BIT, 1);
};


CPUStatusRegister.prototype.clearI = function() {
	this.storeBit(this.I_BIT, 0);
};

/////////////////////////////////////////////////////////////////////////////////
//
// Z（Zero flag）
// 演算結果がゼロであった場合にセットし、 そうでない場合はクリアします。
//
/////////////////////////////////////////////////////////////////////////////////

CPUStatusRegister.prototype.isZ = function() {
	return this.loadBit(this.Z_BIT);
};


CPUStatusRegister.prototype.setZ = function() {
	this.storeBit(this.Z_BIT, 1);
};

CPUStatusRegister.prototype.clearZ = function() {
	this.storeBit(this.Z_BIT, 0);
};

/////////////////////////////////////////////////////////////////////////////////
//
// C（Carry flag）
// ADC命令によってビット7からの桁上げが発生したとき、
// SBC、CMP、CPX、CPX命令によってビット7からの桁上げが
// 発生しなかったときにセットします。 またASL、ROL命令ではAのビット7を、
// LSR、ROR命令ではAのビット0をストアします。 CLC命令でクリア、SEC命令で
// セットします。
//
/////////////////////////////////////////////////////////////////////////////////

CPUStatusRegister.prototype.isC = function() {
	return this.loadBit(this.C_BIT);
};

CPUStatusRegister.prototype.setC = function() {
	this.storeBit(this.C_BIT, 1);
};

CPUStatusRegister.prototype.clearC = function() {
	this.storeBit(this.C_BIT, 0);
};

module.exports = CPUStatusRegister;
