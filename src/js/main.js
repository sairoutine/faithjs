"use strict";

// ファミコン本体クラス
var NES = require('./NES');

// canvas
var canvas = document.getElementById('mainCanvas');
var canvas_width = canvas.width;
var canvas_height = canvas.height;

var nes = new NES(canvas);

nes.initCanvas();

// キーボード取得 設定
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

// 画面の高さに応じてcanvasサイズ変更
function resize_canvas() {
	var diameter = (parseInt)(window.innerHeight / canvas_height);
	canvas.style.width = canvas_width * diameter;
	canvas.style.height = canvas_height * diameter;
}


function fullscreen() {
	if (canvas.requestFullscreen) {
		canvas.requestFullscreen();
	}
	else if (canvas.msRequestuestFullscreen) {
		canvas.msRequestuestFullscreen();
	}
	else if (canvas.mozRequestFullScreen) {
		canvas.mozRequestFullScreen();
	}
	else if (canvas.webkitRequestFullscreen) {
		canvas.webkitRequestFullscreen();
	}
}

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

		document.getElementById("fullscreen").addEventListener("click", fullscreen, false);

		document.getElementById("start").disabled = true;
		document.getElementById("pause").disabled = true;
	}

	// 画面の高さに応じてcanvasサイズ変更
	window.addEventListener('resize', resize_canvas);

	// Chrome ではイベント発生してから resume しないと音が再生されない。
	// よってマウスクリック時に resume を設定
	var ontouchendEventName = typeof window.document.ontouchend !== 'undefined' ? 'touchend' : 'mouseup';
	var resume_audio_func = function () {
		nes.webAudioContextResume();
		window.removeEventListener(ontouchendEventName, resume_audio_func);
	};

	window.addEventListener(ontouchendEventName, resume_audio_func);
};

// 初期化
window.onload = function() {
	// DOMのイベントを設定
	initialize_dom_events();

	// 画面の高さに応じてcanvasサイズ変更
	resize_canvas();
};
