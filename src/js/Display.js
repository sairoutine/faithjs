'use strict';

var Display = function(mainCanvas) {
	this.ctx = mainCanvas.getContext('2d');

	this.width = Number(mainCanvas.getAttribute('width'));
	this.height = Number(mainCanvas.getAttribute('height'));
};

module.exports = Display;
