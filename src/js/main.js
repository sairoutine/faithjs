"use strict";

// ファミコン本体クラス
var NES = require('./NES');

// canvas
var canvas = document.getElementById('mainCanvas');

var nes = new NES(canvas);

nes.initCanvas();
window.onkeydown = function(e) { nes.handleKeyDown(e); };
window.onkeyup   = function(e) { nes.handleKeyUp(e); };

function nes_pause() {
	if(nes.Pause()) {
		document.getElementById("pause").disabled = true;
		document.getElementById("start").disabled = false;
	}
}


function nes_start() {
	if(nes.Start()) {
		document.getElementById("pause").disabled = false;
		document.getElementById("start").disabled = true;
	}
}


function nes_reset() {
	if(nes.Reset()) {
		document.getElementById("pause").disabled = false;
		document.getElementById("start").disabled = true;
	}
}

function nes_rom_change(arraybuffer) {
	// 実行中のNESを停止
	nes_pause();

	if( ! nes.SetRom(arraybuffer)) {
		console.error("Can't get rom data (perhaps you don't set ArrayBuffer arguments or it's not nes rom format)");
		return;
	}

	document.getElementById("start").disabled = true;
	document.getElementById("pause").disabled = true;


	if(nes.Init())
		nes_start();
}

// ローカル上のROMを読み込み
var read_local_file = function(fileObj, cb) {
	var reader = new FileReader();
	reader.onload = function (e) { cb(e.target.result); };
	reader.readAsArrayBuffer(fileObj);
};

// URL からROMを読み込み
var read_url = function (url, cb) {
	var request = new XMLHttpRequest();

	request.onload = function() { cb(request.response); };
	request.onerror = function(e) {
		console.error("can't get rom binary");
	};
	request.open('GET', url, true);
	request.responseType = 'arraybuffer';
	request.send(null);
};

// DOMのイベントを設定
var initialize_dom_events = function() {
	if(typeof window.FileReader !== "undefined") {
		// ドラッグ&ドロップでROM読み込み
		window.addEventListener("dragenter",
			function (e) {
				e.preventDefault();
			}, false);

		window.addEventListener("dragover",
			function (e) {
				e.preventDefault();
			}, false);

		window.addEventListener("drop",
			function (e) {
				e.preventDefault();
				read_local_file(e.dataTransfer.files[0], nes_rom_change);
			}, false);

		// input type="file" から ROM読み込み
		document.getElementById("file").addEventListener("change",
			function (e) {
				read_local_file(e.target.files[0], nes_rom_change);
			}, false);

		// プルダウンから ROM読み込み
		document.getElementById("romload").addEventListener("click",
			function (e) {
				e.preventDefault();

				// ROM の場所
				var url = document.getElementById("romlist").value;

				read_url(url, nes_rom_change);
			}, false);


		document.getElementById("pause").addEventListener("click", nes_pause, false);
		document.getElementById("start").addEventListener("click", nes_start, false);
		document.getElementById("reset").addEventListener("click", nes_reset, false);

		document.getElementById("start").disabled = true;
		document.getElementById("pause").disabled = true;

	}

};

// 初期化
window.onload = function() {
	// DOMのイベントを設定
	initialize_dom_events();
};


