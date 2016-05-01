"use strict";

var FC = require('./FC');

var fc = null;


var FCUse_FileReader;


window.addEventListener('load', FCSet, false);





function FCFileChange(e) {
	fc_file_read(e.target.files[0]);
}


var File = null;
function fc_file_read(file) {
	File = file;
	var reader = new FileReader();
	reader.onload = function (e) {
		fc_rom_change(e.target.result);
	};
	reader.readAsArrayBuffer(file);
}


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


function FCReset() {
	if(fc.Reset()) {
		document.getElementById("pause").disabled = false;
		document.getElementById("start").disabled = true;
	}
}


function parse_rom(argrom) {
	var rom = argrom.slice(0);
	var head;
	if(rom < 0x10)
		return {"rom": rom, "type": 0};//??

	if(rom[0] === 0x4E && rom[1] === 0x45 && rom[2] === 0x53 && rom[3] === 0x1A) {
		if(rom.length === 40976) {
			if(rom[0x6010] === 0x00 && rom[0x6011] === 0x38 &&  rom[0x6012] === 0x4C && rom[0x6013] === 0xC6) {
				rom[6] = 0x40;
				rom[7] = 0x10;
				return {"rom": rom, "type": 2};//May Be FDS BIOS
			}
		}
		return {"rom": rom, "type": 1};//Nes Rom
	}

	if(rom.length === 8192) {
		if(rom[0] === 0x00 && rom[1] === 0x38 &&  rom[2] === 0x4C && rom[3] === 0xC6) {
			var padd = new Array(24 * 1024);
			for(var i=0; i<padd.length; i++)
				padd[i] = 0x00;
			head = [0x4E, 0x45, 0x53, 0x1A, 0x02, 0x01, 0x40, 0x10, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00];
			rom = head.concat(padd).concat(rom).concat(padd.slice(0, 8192));
			return {"rom": rom, "type": 2};//May Be FDS BIOS
		}
	}

	if(rom[0] === 0x46 && rom[1] === 0x44 && rom[2] === 0x53 && rom[3] === 0x1A) {
		return {"rom": rom, "type": 3};//FDS Disk
	}

	if((rom.length % 65500) === 0) {
		head =[0x46, 0x44, 0x53, 0x1A, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00];
		rom = head.concat(rom);
		rom[4] = (rom.length - 16) / 65500;
		return {"rom": rom, "type": 3};//FDS Disk
	}

	return {"rom": rom, "type": 0};//??
}


function fc_rom_change(changerom) {
	fc_pause();

	var rom;
	var i;
	if(typeof changerom === "string") {
		rom = [];
		for(i=0; i<changerom.length; i+=2)
			rom.push(eval("0x" + changerom.substr(i, 2)));
	} else if(changerom instanceof ArrayBuffer) {
		var u8array = new Uint8Array(changerom);
		rom = [];
		for(i=0; i<u8array.length; i++)
			rom.push(u8array[i]);
	} else if(changerom instanceof Array) {
		rom = changerom;
	} else
		return;

	var tmp = parse_rom(rom);

	document.getElementById("start").disabled = true;
	document.getElementById("pause").disabled = true;

	document.getElementById("insert").disabled = true;
	document.getElementById("eject").disabled = true;

	if(tmp.type === 0)
		return;

	if(tmp.type === 3) {
		if(fc.MapperNumber === 20) {
			document.getElementById("disk_filename").innerHTML = File.name;
			fc.Mapper.SetDisk(tmp.rom);
			fc_start();
			disk_side_check();
		}
		return;
	}

	document.getElementById("rom_filename").innerHTML = File.name;
	document.getElementById("disk_filename").innerHTML = "";
	fc.SetRom(tmp.rom);
	if(fc.Init())
		fc_start();
	disk_side_check();
}


function fc_setup() {
	fc = new FC();
	if (!fc.SetCanvas("mainCanvas"))
		return false;
	return true;
}


function FCSet() {
	if(!fc_setup())
		return;

	FCUse_FileReader = typeof window.FileReader !== "undefined";
	if(FCUse_FileReader) {
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
				fc_file_read(e.dataTransfer.files[0]);
			}, false);

		document.getElementById("file").addEventListener("change", FCFileChange, false);

		document.getElementById("pause").addEventListener("click", fc_pause, false);
		document.getElementById("start").addEventListener("click", fc_start, false);
		document.getElementById("reset").addEventListener("click", FCReset, false);

		window.addEventListener("gamepadconnected", function(e) {
			if(e.gamepad.index === 0)
				document.getElementById("pad0state").innerHTML = "Gamepad 0 connected: " + e.gamepad.id;
			if(e.gamepad.index === 1)
				document.getElementById("pad1state").innerHTML = "Gamepad 1 connected: " + e.gamepad.id;
		});

		window.addEventListener("gamepaddisconnected", function(e) {
			if(e.gamepad.index === 0)
				document.getElementById("pad0state").innerHTML = "Gamepad 0 disconnected";
			if(e.gamepad.index === 1)
				document.getElementById("pad1state").innerHTML = "Gamepad 1 disconnected";
		});
		document.getElementById("pad0state").innerHTML = "Gamepad 0 disconnected";
		document.getElementById("pad1state").innerHTML = "Gamepad 1 disconnected";

		document.getElementById("insert").addEventListener("click", DiskInsert, false);
		document.getElementById("eject").addEventListener("click", DiskEject, false);

		document.getElementById("sramout").addEventListener("click", SramOut, false);
		document.getElementById("sramin").addEventListener("click", SramIn, false);

		//document.getElementById("statesave").addEventListener("click", StateSave, false);
		//document.getElementById("stateload").addEventListener("click", StateLoad, false);

		document.getElementById("start").disabled = true;
		document.getElementById("pause").disabled = true;

		document.getElementById("insert").disabled = true;
		document.getElementById("eject").disabled = true;
	}

	// ROM読み込み
	// ROMのパス
	//var url = 'rom/mario.nes';
	var url = "rom/bad_apple_2_5.nes";

	var request = new XMLHttpRequest();
	request.responseType = 'arraybuffer';

	request.onload = function() {
		var rom_binary = request.response;
		File = {};
		File.name = url;
		fc_rom_change(rom_binary);
		return;
	};

	request.onerror = function(e) {
		console.log("can't get rom binary");
	};

	request.open('GET', url, true);
	request.send(null);
}


function StateSave() {
	fc.GetState();
}


function StateLoad() {
	fc.SetState();
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
