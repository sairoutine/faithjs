'use strict';

var util = require('../util');

// 8bit
var Register = function() {
	var buffer = new ArrayBuffer(this.WORD_SIZE);
	this.uint8 = new Uint8Array(buffer);
	this.uint8[0] = 0;
};

Register.prototype.WORD_SIZE = 1; // 1 byte

// レジスタに値を設定
Register.prototype.store = function(value) {
	this.uint8[0] = value;
};

// レジスタの値を取得
Register.prototype.load = function(value) {
	return this.uint8[0];
};


// レジスタの特定bitを取得(1 or 0)
Register.prototype.loadBit = function(additive_expression) {
	return (this.uint8[0] >> additive_expression) & 1;
};

// レジスタの特定bitに値を設定
Register.prototype.storeBit = function(additive_expression, value) {
	var flag = value ? 1 : 0;
	this.uint8[0] = this.uint8[0] & ~(1 << additive_expression) | (flag << additive_expression);
};
module.exports = Register;
