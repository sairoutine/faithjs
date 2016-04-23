'use strict';

var util = {};

// 10進数を16進数文字列に変換する
util.hex = function(num) {
	var str = num.toString(16);
	var prefix = '0x';
	var base = '';

	if(str.length < 2) {
		base = '0';
	}

	return prefix + base + str;
};

// 配列が同一かどうか確認
util.isEqual = function(array1, array2) {
	return array1.toString() === array2.toString();
};

module.exports = util;
