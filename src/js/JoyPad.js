'use strict';

var JoyPad = function() {
	// キー押下フラグ
	this.keyflag = 0x0;

	// 一つ前のフレームで押下されたキー
	this.before_keyflag = 0x0;
};

// キー押下フラグ
JoyPad.prototype.BUTTON_LEFT   = 0x01;
JoyPad.prototype.BUTTON_UP     = 0x02;
JoyPad.prototype.BUTTON_RIGHT  = 0x04;
JoyPad.prototype.BUTTON_DOWN   = 0x08;
JoyPad.prototype.BUTTON_A      = 0x10;
JoyPad.prototype.BUTTON_B      = 0x20;
JoyPad.prototype.BUTTON_SELECT = 0x40;
JoyPad.prototype.BUTTON_START  = 0x80;


JoyPad.prototype.init = function() {

};

// キー押下
JoyPad.prototype.pushKeyDown = function(keyCode){
	this.keyflag |= this._keyCodeToBitCode(keyCode);
};

// キー押下解除
JoyPad.prototype.pushKeyUp   = function(keyCode){
	this.keyflag &= ~this._keyCodeToBitCode(keyCode);
};

// 指定のキーが押下状態か確認する
JoyPad.prototype.isKeyDown = function(flag) {
	return this.keyflag & flag;
};

// 指定のキーが押下されたか確認する
JoyPad.prototype.isKeyPush = function(flag) {
	// 1フレーム前に押下されておらず、現フレームで押下されてるなら true
	return !(this.before_keyflag & flag) && this.keyflag & flag;
};

// キーコードをBitに変換
JoyPad.prototype._keyCodeToBitCode = function(keyCode) {
	var flag;
	switch(keyCode) {
		case 13: // enter
			flag = this.BUTTON_START;
			break;
		case 32: // space
			flag = this.BUTTON_SELECT;
			break;
		case 37: // left
			flag = this.BUTTON_LEFT;
			break;
		case 38: // up
			flag = this.BUTTON_UP;
			break;
		case 39: // right
			flag = this.BUTTON_RIGHT;
			break;
		case 40: // down
			flag = this.BUTTON_DOWN;
			break;
		case 88: // x
			flag = this.BUTTON_B;
			break;
		case 90: // z
			flag = this.BUTTON_A;
			break;
	}
	return flag;
};



module.exports = JoyPad;
