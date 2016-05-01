"use strict";

// ファミコン本体クラス
var FC = require('./FC');

var fc = new FC();
fc.SetCanvas("mainCanvas");



function fc_pause() {
	if(fc.Pause()) {
		document.getElementById("pause").disabled = true;
		document.getElementById("start").disabled = false;
	}
}


function fc_start() {
	if(fc.Start()) {
		document.getElementById("pause").disabled = false;
		document.getElementById("start").disabled = true;
	}
}


function fc_reset() {
	if(fc.Reset()) {
		document.getElementById("pause").disabled = false;
		document.getElementById("start").disabled = true;
	}
}

function fc_rom_change(changerom) {
	fc_pause();

	var rom;
	var i;
	if(changerom instanceof ArrayBuffer) {
		var u8array = new Uint8Array(changerom);
		rom = [];
		for(i=0; i<u8array.length; i++)
			rom.push(u8array[i]);
	} else {
		console.error("Can't get rom data(perhaps you must set ArrayBuffer arguments)");
		return;
	}

	if( ! (rom[0] === 0x4E && rom[1] === 0x45 && rom[2] === 0x53 && rom[3] === 0x1A)) {
		console.error("This rom seems not to be nes rom");
	}

	document.getElementById("start").disabled = true;
	document.getElementById("pause").disabled = true;

	document.getElementById("insert").disabled = true;
	document.getElementById("eject").disabled = true;

	fc.SetRom(rom);
	if(fc.Init())
		fc_start();
	disk_side_check();
}

function SramOut() {
	var tmp = fc.Mapper.OutSRAM();
	document.getElementById("sramdata").value = tmp;
}


function SramIn() {
	fc.Mapper.InSRAM(document.getElementById("sramdata").value);
}


var DiskSideString = [" drop FDS Disk ", " EJECT ", " SIDE 1-A ", " SIDE 1-B ", " SIDE 2-A ", " SIDE 2-B "];
function disk_side_check() {
	document.getElementById("insert").disabled = true;
	document.getElementById("eject").disabled = true;

	if(fc.Mapper === null || fc.MapperNumber !== 20)
		document.getElementById("diskside").innerHTML = " drop FDS BIOS ";
	else {
		var tmp = fc.Mapper.InDisk();
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
	if(fc.Mapper === null || fc.MapperNumber !== 20)
		return;
	var select = document.getElementById("diskselect");
	fc.Mapper.InsertDisk(parseInt(select.options[select.selectedIndex].value, 10));
	disk_side_check();
}


function DiskEject() {
	if(fc.Mapper === null || fc.MapperNumber !== 20)
		return;
	fc.Mapper.EjectDisk();
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
				read_local_file(e.dataTransfer.files[0], fc_rom_change);
			}, false);

		// input type="file" から ROM読み込み
		document.getElementById("file").addEventListener("change",
			function (e) {
				read_local_file(e.target.files[0], fc_rom_change);
			}, false);

		document.getElementById("pause").addEventListener("click", fc_pause, false);
		document.getElementById("start").addEventListener("click", fc_start, false);
		document.getElementById("reset").addEventListener("click", fc_reset, false);

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
	read_url(url, fc_rom_change);
};


