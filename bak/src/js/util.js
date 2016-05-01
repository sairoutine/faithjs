'use strict';

var util = {};

// 10進数を16進数文字列に変換する
util.hex = function(num) {
	var str = num.toString(16);
	var prefix = '0x';

	if(str.length < 2) {
		str = ('00' + str).slice(-2);
	}

	return prefix + str;
};

// 10進数を2進数文字列に変換する
util.bit = function(num) {
	var str = num.toString(2);
	var prefix = '0b';

	if(str.length < 8) {
		str = ('00000000' + str).slice(-8);
	}

	return prefix + str;
};


// 配列が同一かどうか確認
util.isEqual = function(array1, array2) {
	return array1.toString() === array2.toString();
};

// 特定bitを取得
util.getPartialBits = function(value, bit, mask) {
	return (value >> bit) & mask;
};




module.exports = util;
