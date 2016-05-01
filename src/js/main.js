"use strict";

// ファミコン本体クラス
var NES = require('./NES');

var nes = new NES();
nes.SetCanvas("mainCanvas");



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

	document.getElementById("insert").disabled = true;
	document.getElementById("eject").disabled = true;

	if(nes.Init())
		nes_start();
	disk_side_check();
}

function SramOut() {
	var tmp = nes.Mapper.OutSRAM();
	document.getElementById("sramdata").value = tmp;
}


function SramIn() {
	nes.Mapper.InSRAM(document.getElementById("sramdata").value);
}


var DiskSideString = [" drop FDS Disk ", " EJECT ", " SIDE 1-A ", " SIDE 1-B ", " SIDE 2-A ", " SIDE 2-B "];
function disk_side_check() {
	document.getElementById("insert").disabled = true;
	document.getElementById("eject").disabled = true;

	if(nes.Mapper === null || nes.MapperNumber !== 20)
		document.getElementById("diskside").innerHTML = " drop FDS BIOS ";
	else {
		var tmp = nes.Mapper.InDisk();
		tmp += 2;
		document.getElementById("diskside").innerHTML = DiskSideString[tmp];

		if(tmp !== 0) {
			if(tmp === 1)
				document.getElementById("insert").disabled = false;
			else
				document.getElementById("eject").disabled = false;
		}
	}
}


function DiskInsert() {
	if(nes.Mapper === null || nes.MapperNumber !== 20)
		return;
	var select = document.getElementById("diskselect");
	nes.Mapper.InsertDisk(parseInt(select.options[select.selectedIndex].value, 10));
	disk_side_check();
}


function DiskEject() {
	if(nes.Mapper === null || nes.MapperNumber !== 20)
		return;
	nes.Mapper.EjectDisk();
	disk_side_check();
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
	request.responseType = 'arraybuffer';

	request.onload = function() { cb(request.response); };
	request.onerror = function(e) {
		console.error("can't get rom binary");
	};
	request.open('GET', url, true);
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

		document.getElementById("pause").addEventListener("click", nes_pause, false);
		document.getElementById("start").addEventListener("click", nes_start, false);
		document.getElementById("reset").addEventListener("click", nes_reset, false);

		document.getElementById("insert").addEventListener("click", DiskInsert, false);
		document.getElementById("eject").addEventListener("click", DiskEject, false);

		document.getElementById("sramout").addEventListener("click", SramOut, false);
		document.getElementById("sramin").addEventListener("click", SramIn, false);

		document.getElementById("start").disabled = true;
		document.getElementById("pause").disabled = true;

		document.getElementById("insert").disabled = true;
		document.getElementById("eject").disabled = true;
	}

};

// 初期化
window.onload = function() {
	// DOMのイベントを設定
	initialize_dom_events();

	// TODO: Now Loading...的なものを入れる

	// onload でデフォルトのゲームを読み込む
	//var url = 'rom/mario.nes';
	var url = "rom/bad_apple_2_5.nes";
	read_url(url, nes_rom_change);
};


