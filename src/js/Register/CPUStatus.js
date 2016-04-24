'use strict';

var _ = require('lodash');
var Register8Bit = require('./8Bit');

var CPUStatusRegister = function() {
	Register8Bit.apply(this, arguments);

};
// 基底クラスを継承
_.extend(CPUStatusRegister.prototype, Register8Bit.prototype);
_.extend(CPUStatusRegister, Register8Bit);

module.exports = CPUStatusRegister;
