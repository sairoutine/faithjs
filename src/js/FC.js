//by yhzmr442
//Ver. 10.1.21

"use strict";


function FC() {
	this.Use_requestAnimationFrame = typeof window.requestAnimationFrame !== "undefined";
	this.Use_GetGamepads = typeof navigator.getGamepads !== "undefined";
	window.AudioContext = window.AudioContext || window.webkitAudioContext;
	this.Use_AudioContext = typeof window.AudioContext !== "undefined";
	this.TimerID = null;

	this.StateData = null;


/* **** FC CPU **** */
	this.CycleTable = [
	 7, 6, 2, 8, 3, 3, 5, 5, 3, 2, 2, 2, 4, 4, 6, 6, //0x00
	 2, 5, 2, 8, 4, 4, 6, 6, 2, 4, 2, 7, 4, 4, 6, 7, //0x10
	 6, 6, 2, 8, 3, 3, 5, 5, 4, 2, 2, 2, 4, 4, 6, 6, //0x20
	 2, 5, 2, 8, 4, 4, 6, 6, 2, 4, 2, 7, 4, 4, 6, 7, //0x30
	 6, 6, 2, 8, 3, 3, 5, 5, 3, 2, 2, 2, 3, 4, 6, 6, //0x40
	 2, 5, 2, 8, 4, 4, 6, 6, 2, 4, 2, 7, 4, 4, 6, 7, //0x50
	 6, 6, 2, 8, 3, 3, 5, 5, 4, 2, 2, 2, 5, 4, 6, 6, //0x60
	 2, 5, 2, 8, 4, 4, 6, 6, 2, 4, 2, 7, 4, 4, 6, 7, //0x70
	 2, 6, 2, 6, 3, 3, 3, 3, 2, 2, 2, 2, 4, 4, 4, 4, //0x80
	 2, 5, 2, 6, 4, 4, 4, 4, 2, 4, 2, 5, 5, 4, 5, 5, //0x90
	 2, 6, 2, 6, 3, 3, 3, 3, 2, 2, 2, 2, 4, 4, 4, 4, //0xA0
	 2, 5, 2, 5, 4, 4, 4, 4, 2, 4, 2, 4, 4, 4, 4, 4, //0xB0
	 2, 6, 2, 8, 3, 3, 5, 5, 2, 2, 2, 2, 4, 4, 6, 6, //0xC0
	 2, 5, 2, 8, 4, 4, 6, 6, 2, 4, 2, 7, 4, 4, 6, 7, //0xD0
	 2, 6, 2, 8, 3, 3, 5, 5, 2, 2, 2, 2, 4, 4, 6, 6, //0xE0
	 2, 5, 2, 8, 4, 4, 6, 6, 2, 4, 2, 7, 4, 4, 6, 7];//0xF0

	this.MainClock = 1789772.5;

	this.A = 0;
	this.X = 0;
	this.Y = 0;
	this.S = 0;
	this.P = 0;
	this.PC = 0;

	this.toNMI = false;
	this.toIRQ = 0x00;
	this.CPUClock = 0;

	//this.HalfCarry = false;

	this.ZNCacheTable = new Array(256);
	this.ZNCacheTable[0] = 0x02;
	for(var i=1; i<256; i++)
		this.ZNCacheTable[i] = i & 0x80;

	this.ZNCacheTableCMP = new Array(512);
	for(var i=0; i<256; i++) {
		this.ZNCacheTableCMP[i] = this.ZNCacheTable[i] | 0x01;
		this.ZNCacheTableCMP[i + 256] = this.ZNCacheTable[i];
	}


/* **** FC PPU **** */
	this.ScrollRegisterFlag = false;
	this.PPUAddressRegisterFlag = false;
	this.HScrollTmp = 0;
	this.PPUAddress = 0;
	this.PPUAddressBuffer = 0;

	this.Palette = null;

	this.SpriteLineBuffer = null;

	this.PPUReadBuffer = 0;

	this.PaletteTable = [
	[0x78,0x78,0x78],[0x20,0x00,0xB0],[0x28,0x00,0xB8],[0x60,0x10,0xA0],
	[0x98,0x20,0x78],[0xB0,0x10,0x30],[0xA0,0x30,0x00],[0x78,0x40,0x00],
	[0x48,0x58,0x00],[0x38,0x68,0x00],[0x38,0x6C,0x00],[0x30,0x60,0x40],
	[0x30,0x50,0x80],[0x00,0x00,0x00],[0x00,0x00,0x00],[0x00,0x00,0x00],
	[0xB0,0xB0,0xB0],[0x40,0x60,0xF8],[0x40,0x40,0xFF],[0x90,0x40,0xF0],
	[0xD8,0x40,0xC0],[0xD8,0x40,0x60],[0xE0,0x50,0x00],[0xC0,0x70,0x00],
	[0x88,0x88,0x00],[0x50,0xA0,0x00],[0x48,0xA8,0x10],[0x48,0xA0,0x68],
	[0x40,0x90,0xC0],[0x00,0x00,0x00],[0x00,0x00,0x00],[0x00,0x00,0x00],
	[0xFF,0xFF,0xFF],[0x60,0xA0,0xFF],[0x50,0x80,0xFF],[0xA0,0x70,0xFF],
	[0xF0,0x60,0xFF],[0xFF,0x60,0xB0],[0xFF,0x78,0x30],[0xFF,0xA0,0x00],
	[0xE8,0xD0,0x20],[0x98,0xE8,0x00],[0x70,0xF0,0x40],[0x70,0xE0,0x90],
	[0x60,0xD0,0xE0],[0x78,0x78,0x78],[0x00,0x00,0x00],[0x00,0x00,0x00],
	[0xFF,0xFF,0xFF],[0x90,0xD0,0xFF],[0xA0,0xB8,0xFF],[0xC0,0xB0,0xFF],
	[0xE0,0xB0,0xFF],[0xFF,0xB8,0xE8],[0xFF,0xC8,0xB8],[0xFF,0xD8,0xA0],
	[0xFF,0xF0,0x90],[0xC8,0xF0,0x80],[0xA0,0xF0,0xA0],[0xA0,0xFF,0xC8],
	[0xA0,0xFF,0xF0],[0xA0,0xA0,0xA0],[0x00,0x00,0x00],[0x00,0x00,0x00]];

	this.BgLineBuffer = null;

	this.SPBitArray = new Array(256);
	for(var i=0; i<256; i++) {
		this.SPBitArray[i] = new Array(256);
		for(var j=0; j<256; j++) {
			this.SPBitArray[i][j] = new Array(8);
			for(var k=0; k<8; k++)
				this.SPBitArray[i][j][k] = (((i << k) & 0x80) >>> 7) | (((j << k) & 0x80) >>> 6);
		}
	}

	this.PaletteArray = [0x10, 0x01, 0x02, 0x03, 0x10, 0x05, 0x06, 0x07, 0x10, 0x09, 0x0A, 0x0B, 0x10, 0x0D, 0x0E, 0x0F];

	this.PpuX = 0;
	this.PpuY = 0;

	this.Canvas = null;
	this.ctx = null;
	this.ImageData = null;
	this.DrawFlag = false;

	this.Sprite0Line = false;
	this.SpriteLimit = true;


/* **** FC Header **** */
	this.PrgRomPageCount = 0;
	this.ChrRomPageCount = 0;
	this.HMirror = false;
	this.VMirror = false;
	this.SramEnable = false;
	this.TrainerEnable = false;
	this.FourScreen = false;
	this.MapperNumber = -1;


/* **** FC Storage **** */
	this.RAM = new Array(0x800);

	this.INNERSRAM = new Array(0x2000);
	this.SRAM;

	this.VRAM = new Array(16);

	this.VRAMS = new Array(16);
	for(var i=0; i<16; i++)
		this.VRAMS[i] = new Array(0x0400);

	this.SPRITE_RAM = new Array(0x100);

	this.ROM = new Array(4);
	this.ROM_RAM = new Array(4);
	for(var i=0; i<4; i++)
		this.ROM_RAM[i] = new Array(0x2000);

	this.PRGROM_STATE = new Array(4);
	this.CHRROM_STATE = new Array(8);

	this.PRGROM_PAGES = null;
	this.CHRROM_PAGES = null;

	this.IO1 = new Array(8);
	this.IO2 = new Array(0x20);

	this.Rom = null;


/* **** FC JoyPad **** */
	this.JoyPadStrobe = false;
	this.JoyPadState = [0x00, 0x00];
	this.JoyPadBuffer = [0x00, 0x00];
	this.JoyPadKeyUpFunction = null;
	this.JoyPadKeyDownFunction = null;


/* **** FC APU **** */
	this.WaveOut = true;
	this.WaveDatas = new Array();
	this.WaveBaseCount = 0;
	this.WaveSampleRate = 24000;
	this.WaveFrameSequence = 0;
	this.WaveFrameSequenceCounter = 0;
	this.WaveVolume = 0.5;

	this.WaveCh1LengthCounter = 0;
	this.WaveCh1Envelope = 0;
	this.WaveCh1EnvelopeCounter = 0;
	this.WaveCh1Sweep = 0;
	this.WaveCh1Frequency = 0;

	this.WaveCh2LengthCounter = 0;
	this.WaveCh2Envelope = 0;
	this.WaveCh2EnvelopeCounter = 0;
	this.WaveCh2Sweep = 0;
	this.WaveCh2Frequency = 0;

	this.WaveCh3LengthCounter = 0;
	this.WaveCh3LinearCounter = 0;

	this.WaveCh4Angle = -1;
	this.WaveCh4LengthCounter = 0;
	this.WaveCh4Envelope = 0;
	this.WaveCh4EnvelopeCounter = 0;
	this.WaveCh4Register = 0;
	this.WaveCh4BitSequence = 0;
	this.WaveCh4Angle = 0;

	this.WaveCh5Angle = -1;
	this.WaveCh5DeltaCounter = 0;
	this.WaveCh5Register = 0;
	this.WaveCh5SampleAddress = 0;
	this.WaveCh5SampleCounter = 0;

	this.ApuClockCounter = 0;

	this.WaveLengthCount = [
	0x0A, 0xFE, 0x14, 0x02, 0x28, 0x04, 0x50, 0x06,
	0xA0, 0x08, 0x3C, 0x0A, 0x0E, 0x0C, 0x1A, 0x0E,
	0x0C, 0x10, 0x18, 0x12, 0x30, 0x14, 0x60, 0x16,
	0xC0, 0x18, 0x48, 0x1A, 0x10, 0x1C, 0x20, 0x1E];

	this.WaveCh1_2DutyData = [4, 8, 16, 24];

	this.WaveCh3SequenceData = [
	  15,  13,  11,  9,   7,   5,   3,   1,
	  -1,  -3,  -5, -7,  -9, -11, -13, -15,
	 -15, -13, -11, -9,  -7,  -5,  -3,  -1,
	   1,   3,   5,  7,   9,  11,  13,  15];

	this.WaveCh4FrequencyData = [
	0x004, 0x008, 0x010, 0x020,
	0x040, 0x060, 0x080, 0x0A0,
	0x0CA, 0x0FE, 0x17C, 0x1FC,
	0x2FA, 0x3F8, 0x7F2, 0xFE4];

	this.WaveCh5FrequencyData = [
	0x1AC, 0x17C, 0x154, 0x140,
	0x11E, 0x0FE, 0x0E2, 0x0D6,
	0x0BE, 0x0A0, 0x08E, 0x080,
	0x06A, 0x054, 0x048, 0x036];

	this.WebAudioCtx = null;
	this.WebAudioJsNode;
	this.WebAudioGainNode;
	this.WebAudioBufferSize = 4096;

	this.ApuCpuClockCounter = 0;

	if(this.Use_AudioContext) {
		this.WebAudioCtx = new window.AudioContext();
		this.WebAudioJsNode = this.WebAudioCtx.createScriptProcessor(this.WebAudioBufferSize, 1, 1);
		this.WebAudioJsNode.onaudioprocess = this.WebAudioFunction.bind(this);
		this.WebAudioGainNode = this.WebAudioCtx.createGain();
		this.WebAudioJsNode.connect(this.WebAudioGainNode);
		this.WebAudioGainNode.connect(this.WebAudioCtx.destination);
		this.WaveSampleRate = this.WebAudioCtx.sampleRate;
	}


/* **** EX Sound **** */
	/* FDS */
	this.FDS_WAVE_REG = new Array(0x40);
	this.FDS_LFO_REG = new Array(0x20);
	this.FDS_REG = new Array(0x10);
	this.FDS_LFO_DATA = [0, 1, 2, 4, 0, -4, -2, -1];
	//this.FDS_LFO_DATA = [0, 1, 2, 3, -4, -3, -2, -1];//<--

	this.FDS_WaveIndexCounter = 0;
	this.FDS_WaveIndex = 0;

	this.FDS_LFOIndexCounter = 0;
	this.FDS_LFOIndex = 0;
	this.FDS_REGAddress = 0;

	this.FDS_VolumeEnvCounter = 0;
	this.FDS_VolumeEnv = 0;

	this.FDS_SweepEnvCounter = 0;
	this.FDS_SweepEnv = 0;
	this.FDS_SweepBias = 0;

	this.FDS_Volume = 0;

	/* MMC5 */
	this.MMC5_FrameSequenceCounter = 0;
	this.MMC5_FrameSequence = 0;
	this.MMC5_REG = new Array(0x20);
	this.MMC5_Ch = new Array(2);
	this.MMC5_Level = 0;

	/* VRC6 */
	this.VRC6_REG = new Array(12);
	this.VRC6_Ch3_Counter = 0;
	this.VRC6_Ch3_index = 0;
	this.VRC6_Level = 0;

	/* N163 */
	this.N163_ch_data = new Array(8);
	this.N163_RAM = new Array(128);
	this.N163_Address = 0x00;
	this.N163_ch = 0;
	this.N163_Level = 0;
	this.N163_Clock = 0;

	/* AY-3-8910 */
	this.AY_ClockCounter = 0;
	this.AY_REG = new Array(16);
	this.AY_Noise_Seed = 0x0001;
	this.AY_Noise_Angle = 0;
	this.AY_Env_Counter = 0;
	this.AY_Env_Index = 0;
	this.AY_REG_Select = 0x00;
	this.AY_Level = 0;

	this.AY_Env_Pattern = [
	[15,14,13,12,11,10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0,
	  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
	  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[15,14,13,12,11,10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0,
	  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
	  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[15,14,13,12,11,10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0,
	  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
	  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[15,14,13,12,11,10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0,
	  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
	  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9,10,11,12,13,14,15,
	  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
	  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9,10,11,12,13,14,15,
	  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
	  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9,10,11,12,13,14,15,
	  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
	  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9,10,11,12,13,14,15,
	  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
	  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[15,14,13,12,11,10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0,
	 15,14,13,12,11,10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0,
	 15,14,13,12,11,10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
	[15,14,13,12,11,10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0,
	  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
	  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[15,14,13,12,11,10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0,
	  0, 1, 2, 3, 4, 5, 6, 7, 8, 9,10,11,12,13,14,15,
	 15,14,13,12,11,10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
	[15,14,13,12,11,10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0,
	 15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,
	 15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15],
	[ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9,10,11,12,13,14,15,
	  0, 1, 2, 3, 4, 5, 6, 7, 8, 9,10,11,12,13,14,15,
	  0, 1, 2, 3, 4, 5, 6, 7, 8, 9,10,11,12,13,14,15],
	[ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9,10,11,12,13,14,15,
	 15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,
	 15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15],
	[ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9,10,11,12,13,14,15,
	 15,14,13,12,11,10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0,
	  0, 1, 2, 3, 4, 5, 6, 7, 8, 9,10,11,12,13,14,15],
	[ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9,10,11,12,13,14,15,
	  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
	  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]];

	this.AY_Env_Volume = [    0,   16,   23,   32,
				 45,   64,   90,  128,
				181,  256,  362,  512,
				724, 1023, 1447, 2047];


/* **** FC Mapper **** */
	this.Mapper = null;
}


/* **************************************************************** */
FC.prototype.requestAnimationFrame = function (){
	if(this.Use_requestAnimationFrame)
		this.UpdateAnimationFrame();
	else
		this.TimerID = setInterval(this.Run.bind(this), 16);
}


FC.prototype.cancelAnimationFrame = function (){
	if(this.cancelAnimationFrame)
		window.cancelAnimationFrame(this.TimerID);
	else
		clearInterval(this.TimerID);
}


FC.prototype.UpdateAnimationFrame = function () {
	this.TimerID = window.requestAnimationFrame(this.UpdateAnimationFrame.bind(this));
	this.Run();
}


FC.prototype.Run = function () {
	this.CheckGamePad();
	this.CpuRun();
}


FC.prototype.Start = function () {
	if(this.Mapper != null && this.TimerID == null) {
		this.JoyPadInit();
		this.TimerID = this.requestAnimationFrame();
		return true;
	}
	return false;
}


FC.prototype.Pause = function () {
	if(this.Mapper != null && this.TimerID != null) {
		this.cancelAnimationFrame();
		this.JoyPadRelease();
		this.TimerID = null;
		return true;
	}
	return false;
}


FC.prototype.Init = function () {
	this.ParseHeader();
	this.StorageClear();
	this.StorageInit();
	this.PpuInit();
	this.ApuInit();

	if(!this.MapperSelect()) {
		alert("Unsupported Mapper : " + this.MapperNumber);
		return false;
	}

	this.Mapper.Init();
	this.CpuInit();
	return true;
}


FC.prototype.Reset = function () {
	if(this.Mapper != null) {
		this.Pause();
		this.PpuInit();
		this.ApuInit();
		this.Mapper.Init();
		this.CpuReset();
		this.Start();
		return true;
	}
	return false;
}


FC.prototype.GetState = function () {
	if(this.Mapper == null)
		return false;

	this.StateData = new Object();

	this.StateData.A =		 	this.A;
	this.StateData.X =			this.X;
	this.StateData.Y =			this.Y;
	this.StateData.S =			this.S;
	this.StateData.P =			this.P;
	this.StateData.PC =			this.PC;

	this.StateData.toNMI =			this.toNMI;
	this.StateData.toIRQ =			this.toIRQ;
	this.StateData.CPUClock =		this.CPUClock;

	this.StateData.ScrollRegisterFlag =	this.ScrollRegisterFlag;
	this.StateData.PPUAddressRegisterFlag =	this.PPUAddressRegisterFlag;
	this.StateData.HScrollTmp =		this.HScrollTmp;
	this.StateData.PPUAddress =		this.PPUAddress;
	this.StateData.PPUAddressBuffer =	this.PPUAddressBuffer;

	this.StateData.Palette =		this.Palette.slice(0);

	this.StateData.PpuX =			this.PpuX;
	this.StateData.PpuY =			this.PpuY;

	this.StateData.Sprite0Line =		this.Sprite0Line;
	this.StateData.SpriteLimit =		this.SpriteLimit;

	this.StateData.PrgRomPageCount =	this.PrgRomPageCount;
	this.StateData.ChrRomPageCount =	this.ChrRomPageCount;
	this.StateData.HMirror =		this.HMirror;
	this.StateData.VMirror =		this.VMirror;
	this.StateData.SramEnable =		this.SramEnable;
	this.StateData.TrainerEnable =		this.TrainerEnable;
	this.StateData.FourScreen =		this.FourScreen;
	this.StateData.MapperNumber =		this.MapperNumber;

	this.StateData.RAM =			this.RAM.slice(0);
	this.StateData.INNERSRAM =		this.INNERSRAM.slice(0);

	this.StateData.VRAMS = new  Array(16);
	for(var i=0; i<16; i++)
		this.StateData.VRAMS[i] =	this.VRAMS[i].slice(0);

	this.StateData.SPRITE_RAM =		this.SPRITE_RAM.slice(0);

	this.StateData.ROM_RAM = new Array(4);
	for(var i=0; i<4; i++)
		this.StateData.ROM_RAM[i] =	this.ROM_RAM[i].slice(0);

	this.StateData.IO1 =			this.IO1.slice(0);
	this.StateData.IO2 =			this.IO2.slice(0);

	this.StateData.PRGROM_STATE =		this.PRGROM_STATE.slice(0);
	this.StateData.CHRROM_STATE =		this.CHRROM_STATE.slice(0);

	this.Mapper.GetState();

	return true;
}


FC.prototype.SetState = function () {
	if(this.Mapper == null || this.StateData == null)
		return false;

	this.A =		 	this.StateData.A;
	this.X =			this.StateData.X;
	this.Y =			this.StateData.Y;
	this.S =			this.StateData.S;
	this.P =			this.StateData.P;
	this.PC =			this.StateData.PC;

	this.toNMI =			this.StateData.toNMI;
	this.toIRQ =			this.StateData.toIRQ;
	this.CPUClock =			this.StateData.CPUClock;

	this.ScrollRegisterFlag =	this.StateData.ScrollRegisterFlag;
	this.PPUAddressRegisterFlag =	this.StateData.PPUAddressRegisterFlag;
	this.HScrollTmp =		this.StateData.HScrollTmp;
	this.PPUAddress =		this.StateData.PPUAddress;
	this.PPUAddressBuffer =		this.StateData.PPUAddressBuffer;

	for(var i=0; i<this.Palette.length; i++)
		this.Palette[i] =	this.StateData.Palette[i];

	this.PpuX =			this.StateData.PpuX;
	this.PpuY =			this.StateData.PpuY;

	this.Sprite0Line =		this.StateData.Sprite0Line;
	this.SpriteLimit =		this.StateData.SpriteLimit;

	this.PrgRomPageCount =		this.StateData.PrgRomPageCount;
	this.ChrRomPageCount =		this.StateData.ChrRomPageCount;
	this.HMirror =			this.StateData.HMirror;
	this.VMirror =			this.StateData.VMirror;
	this.SramEnable =		this.StateData.SramEnable;
	this.TrainerEnable =		this.StateData.TrainerEnable;
	this.FourScreen =		this.StateData.FourScreen;
	this.MapperNumber =		this.StateData.MapperNumber;

	for(var i=0; i<this.RAM.length; i++)
		this.RAM[i] =		this.StateData.RAM[i];

	for(var i=0; i<this.INNERSRAM.length; i++)
		this.INNERSRAM[i] =	this.StateData.INNERSRAM[i];

	for(var i=0; i<16; i++)
		for(var j=0; j<this.VRAMS[i].length; j++)
			this.VRAMS[i][j] =	this.StateData.VRAMS[i][j];

	for(var i=0; i<this.SPRITE_RAM.length; i++)
		this.SPRITE_RAM[i] =	this.StateData.SPRITE_RAM[i];

	for(var i=0; i<4; i++)
		for(var j=0; j<this.ROM_RAM[i].length; j++)
			this.ROM_RAM[i][j] =	this.StateData.ROM_RAM[i][j];

	for(var i=0; i<this.IO1.length; i++)
		this.IO1[i] =		this.StateData.IO1[i];

	for(var i=0; i<this.IO2.length; i++)
		this.IO2[i] =		this.StateData.IO2[i];

	for(var i=0; i<this.StateData.PRGROM_STATE.length; i++)
		this.SetPrgRomPage8K(i, this.StateData.PRGROM_STATE[i]);

	for(var i=0; i<this.StateData.CHRROM_STATE.length; i++)
		this.SetChrRomPage1K(i, this.StateData.CHRROM_STATE[i]);

	this.Mapper.SetState();

	return true;
}


/* **** FC CPU **** */
FC.prototype.CpuInit = function () {
	this.A = 0;
	this.X = 0;
	this.Y = 0;
	this.S = 0xFD;
	this.P = 0x34;
	this.toNMI = false;
	this.toIRQ = 0x00;
	this.PC = this.Get16(0xFFFC);

	this.Set(0x0008, 0xF7);
	this.Set(0x0009, 0xEF);
	this.Set(0x000A, 0xDF);
	this.Set(0x000F, 0xBF);
}


FC.prototype.CpuReset = function () {
	this.S = (this.S - 3) & 0xFF;
	this.P |= 0x04;
	this.toNMI = false;
	this.toIRQ = 0x00;
	this.PC = this.Get16(0xFFFC);
}


FC.prototype.NMI = function () {
	this.CPUClock += 7;
	this.Push((this.PC >> 8) & 0xFF);
	this.Push(this.PC & 0xFF);
	this.Push((this.P & 0xEF) | 0x20);
	this.P = (this.P | 0x04) & 0xEF;
	this.PC = this.Get16(0xFFFA);
}


FC.prototype.IRQ = function () {
	this.CPUClock += 7;
	this.Push((this.PC >> 8) & 0xFF);
	this.Push(this.PC & 0xFF);
	this.Push((this.P & 0xEF) | 0x20);
	this.P = (this.P | 0x04) & 0xEF;
	this.PC = this.Get16(0xFFFE);
}


FC.prototype.GetAddressZeroPage = function () {
	return this.Get(this.PC++);
}


FC.prototype.GetAddressImmediate = function () {
	return this.PC++;
}


FC.prototype.GetAddressAbsolute = function () {
	return this.Get(this.PC++) | (this.Get(this.PC++) << 8);
}


FC.prototype.GetAddressZeroPageX = function () {
	return (this.X + this.Get(this.PC++)) & 0xFF;
}


FC.prototype.GetAddressZeroPageY = function () {
	return (this.Y + this.Get(this.PC++)) & 0xFF;
}


FC.prototype.GetAddressIndirectX = function () {
	var tmp = (this.Get(this.PC++) + this.X) & 0xFF;
	return this.Get(tmp) | (this.Get((tmp + 1) & 0xFF) << 8);
}


FC.prototype.GetAddressIndirectY = function () {
	var tmp = this.Get(this.PC++);
	tmp = this.Get(tmp) | (this.Get((tmp + 1) & 0xFF) << 8);
	var address = tmp + this.Y;
	if(((address ^ tmp) & 0x100) > 0)
		this.CPUClock += 1;
	return address;
}


FC.prototype.GetAddressAbsoluteX = function () {
	var tmp = this.Get(this.PC++) | (this.Get(this.PC++) << 8);
	var address = tmp + this.X;
	if(((address ^ tmp) & 0x100) > 0)
		this.CPUClock += 1;
	return address;
}


FC.prototype.GetAddressAbsoluteY = function () {
	var tmp = this.Get(this.PC++) | (this.Get(this.PC++) << 8);
	var address = tmp + this.Y;
	if(((address ^ tmp) & 0x100) > 0)
		this.CPUClock += 1;
	return address;
}


FC.prototype.Push = function (data) {
	this.RAM[0x100 + this.S] = data;
	this.S = (this.S - 1) & 0xFF;
}


FC.prototype.Pop = function () {
	this.S = (this.S + 1) & 0xFF;
	return this.RAM[0x100 + this.S];
}


FC.prototype.LDA = function (address) {
	this.A = this.Get(address);
	this.P = this.P & 0x7D | this.ZNCacheTable[this.A];
}


FC.prototype.LDX = function (address) {
	this.X = this.Get(address);
	this.P = this.P & 0x7D | this.ZNCacheTable[this.X];
}


FC.prototype.LDY = function (address) {
	this.Y = this.Get(address);
	this.P = this.P & 0x7D | this.ZNCacheTable[this.Y];
}


FC.prototype.STA = function (address) {
	this.Set(address, this.A);
}


FC.prototype.STX = function (address) {
	this.Set(address, this.X);
}


FC.prototype.STY = function (address) {
	this.Set(address, this.Y);
}


FC.prototype.Adder = function (data1) {
	/*var data0 = this.A;
	this.HalfCarry = ((data0 & 0x0F) + (data1 & 0x0F) + (this.P & 0x01)) >= 0x10 ? true : false;
	var tmp = data0 + data1 + (this.P & 0x01);
	this.A = tmp & 0xFF;
	this.P = (this.P & 0x3C) | ((~(data0 ^ data1) & (data0 ^ tmp) & 0x80) >>> 1) | (tmp >>> 8) | this.ZNCacheTable[this.A];*/

	var data0 = this.A;
	var tmp = data0 + data1 + (this.P & 0x01);
	this.A = tmp & 0xFF;
	this.P = (this.P & 0x3C) | ((~(data0 ^ data1) & (data0 ^ tmp) & 0x80) >>> 1) | (tmp >>> 8) | this.ZNCacheTable[this.A];
}


FC.prototype.ADC = function (address) {
	this.Adder(this.Get(address));

	/*if((this.P & 0x08) == 0x08) {
		if((this.A & 0x0F) > 0x09 || this.HalfCarry)
			this.A += 0x06;
		if((this.A & 0xF0) > 0x90 || (this.P & 0x01) == 0x01)
			this.A += 0x60;
		if(this.A > 0xFF) {
			this.A &= 0xFF;
			this.P |= 0x01;
		}
	}*/
}


FC.prototype.SBC = function (address) {
	this.Adder(~this.Get(address) & 0xFF);

	/*if((this.P & 0x08) == 0x08) {
		if((this.A & 0x0F) > 0x09 || !this.HalfCarry)
			this.A -= 0x06;
		if((this.A & 0xF0) > 0x90 || (this.P & 0x01) == 0x00)
			this.A -= 0x60;
	}*/
}


FC.prototype.CMP = function (address) {
	this.P = this.P & 0x7C | this.ZNCacheTableCMP[(this.A - this.Get(address)) & 0x1FF];
}


FC.prototype.CPX = function (address) {
	this.P = this.P & 0x7C | this.ZNCacheTableCMP[(this.X - this.Get(address)) & 0x1FF];
}


FC.prototype.CPY = function (address) {
	this.P = this.P & 0x7C | this.ZNCacheTableCMP[(this.Y - this.Get(address)) & 0x1FF];
}


FC.prototype.AND = function (address) {
	this.A &= this.Get(address);
	this.P = this.P & 0x7D | this.ZNCacheTable[this.A];
}


FC.prototype.EOR = function (address) {
	this.A ^= this.Get(address);
	this.P = this.P & 0x7D | this.ZNCacheTable[this.A];
}


FC.prototype.ORA = function (address) {
	this.A |= this.Get(address);
	this.P = this.P & 0x7D | this.ZNCacheTable[this.A];
}


FC.prototype.BIT = function (address) {
	var x = this.Get(address);
	this.P = this.P & 0x3D | this.ZNCacheTable[x & this.A] & 0x02 | x & 0xC0;
}


FC.prototype.ASL_Sub = function (data) {
	this.P = this.P & 0xFE | (data >> 7);
	data = (data << 1) & 0xFF;
	this.P = this.P & 0x7D | this.ZNCacheTable[data];
	return data;
}


FC.prototype.ASL = function (address) {
	this.Set(address, this.ASL_Sub(this.Get(address)));
}


FC.prototype.LSR_Sub = function (data) {
	this.P = this.P & 0x7C | data & 0x01;
	data >>= 1;
	this.P |= this.ZNCacheTable[data];
	return data;
}


FC.prototype.LSR = function (address) {
	this.Set(address, this.LSR_Sub(this.Get(address)));
}


FC.prototype.ROL_Sub = function (data) {
	var carry = data >> 7;
	data = (data << 1) & 0xFF | this.P & 0x01;
	this.P = this.P & 0x7C | carry | this.ZNCacheTable[data];
	return data;
}


FC.prototype.ROL = function (address) {
	this.Set(address, this.ROL_Sub(this.Get(address)));
}


FC.prototype.ROR_Sub = function (data) {
	var carry = data & 0x01;
	data = (data >> 1) | ((this.P & 0x01) << 7);
	this.P = this.P & 0x7C | carry | this.ZNCacheTable[data];
	return  data;
}


FC.prototype.ROR = function (address) {
	this.Set(address, this.ROR_Sub(this.Get(address)));
}


FC.prototype.INC = function (address) {
	var data = (this.Get(address) + 1) & 0xFF;
	this.P = this.P & 0x7D | this.ZNCacheTable[data];
	this.Set(address, data);
}


FC.prototype.DEC = function (address) {
	var data = (this.Get(address) - 1) & 0xFF;
	this.P = this.P & 0x7D | this.ZNCacheTable[data];
	this.Set(address, data);
}


FC.prototype.Branch = function (state) {
	if(!state) {
		this.PC++;
		return;
	}
	var displace = this.Get(this.PC);
	var tmp = this.PC + 1;
	this.PC = (tmp + (displace >= 128 ? displace - 256 : displace)) & 0xFFFF;

	this.CPUClock += (((tmp ^ this.PC) & 0x100) > 0) ? 2 : 1;
}


/* Undocument */
FC.prototype.ANC = function (address) {
	this.A &= this.Get(address);
	this.P = this.P & 0x7D | this.ZNCacheTable[this.A];
	this.P = this.P & 0xFE | (this.A >>> 7);
}


FC.prototype.ANE = function (address) {
	this.A = (this.A | 0xEE) & this.X & this.Get(address);
	this.P = this.P & 0x7D | this.ZNCacheTable[this.A];
}


FC.prototype.ARR = function (address) {
	this.A &= this.Get(address);
	this.A = (this.A >> 1) | ((this.P & 0x01) << 7);
	this.P = this.P & 0x7D | this.ZNCacheTable[this.A];

	this.P = (this.P & 0xFE) | ((this.A & 0x40) >> 6);

	var tmp = (this.A ^ (this.A << 1)) & 0x40;
	this.P = (this.P & 0xBF) | tmp;
}


FC.prototype.ASR = function (address) {
	this.A &= this.Get(address);

	this.P = (this.P & 0xFE) | (this.A & 0x01);

	this.A = this.A >> 1;
	this.P = this.P & 0x7D | this.ZNCacheTable[this.A];
}


FC.prototype.DCP = function (address) {
	var tmp = (this.Get(address) - 1) & 0xFF;
	this.P = this.P & 0x7C | this.ZNCacheTableCMP[(this.A - tmp) & 0x1FF];
	this.Set(address, tmp);
}


FC.prototype.ISB = function (address) {
	var tmp = (this.Get(address) + 1) & 0xFF;
	this.Adder(~tmp & 0xFF);
	this.Set(address, tmp);
}


FC.prototype.LAS = function (address) {
	var tmp = this.Get(address) & this.S;
	this.A = this.X = this.S = tmp;
	this.P = this.P & 0x7D | this.ZNCacheTable[this.A];
}


FC.prototype.LAX = function (address) {
	this.A = this.X = this.Get(address);
	this.P = this.P & 0x7D | this.ZNCacheTable[this.A];
}


FC.prototype.LXA = function (address) {
	var tmp = (this.A | 0xEE) & this.Get(address);
	this.A = this.X = tmp;
	this.P = this.P & 0x7D | this.ZNCacheTable[this.A];
}


FC.prototype.RLA = function (address) {
	var tmp = this.Get(address);
	tmp = (tmp << 1) | (this.P & 0x01);
	this.P = (this.P & 0xFE) | (tmp >> 8);
	this.A &= tmp;
	this.P = this.P & 0x7D | this.ZNCacheTable[this.A];
	this.Set(address, tmp);
}


FC.prototype.RRA = function (address) {
	var tmp = this.Get(address);
	var c = tmp & 0x01;
	var tmp = (tmp >> 1) | ((this.P & 0x01) << 7)
	this.P = (this.P & 0xFE) | c;
	this.Adder(tmp);
	this.Set(address, tmp);
}


FC.prototype.SAX = function (address) {
	var tmp = this.A & this.X;
	this.Set(address, tmp);
}


FC.prototype.SBX = function (address) {
	var tmp = (this.A & this.X) - this.Get(address);
	this.P = (this.P & 0xFE) | ((~tmp >> 8) & 0x01);
	this.X = tmp & 0xFF;
	this.P = this.P & 0x7D | this.ZNCacheTable[this.X];
}


FC.prototype.SHA = function (address) {
	var tmp = this.A & this.X & ((address >> 8) + 1);
	this.Set(address, tmp);
}


FC.prototype.SHS = function (address) {
	this.S = this.A & this.X;
	var tmp = this.S & ((address >> 8) + 1);
	this.Set(address, tmp);
}


FC.prototype.SHX = function (address) {
	var tmp = this.X & ((address >> 8) + 1);
	this.Set(address, tmp);
}


FC.prototype.SHY = function (address) {
	var tmp = this.Y & ((address >> 8) + 1);
	this.Set(address, tmp);
}


FC.prototype.SLO = function (address) {
	var tmp = this.Get(address);
	this.P = (this.P & 0xFE) | (tmp >> 7);
	tmp = (tmp << 1) & 0xFF;
	this.A |= tmp;
	this.P = this.P & 0x7D | this.ZNCacheTable[this.A];
	this.Set(address, tmp);
}


FC.prototype.SRE = function (address) {
	var tmp = this.Get(address);
	this.P = (this.P & 0xFE) | (tmp & 0x01);
	tmp >>= 1;
	this.A ^= tmp;
	this.P = this.P & 0x7D | this.ZNCacheTable[this.A];
	this.Set(address, tmp);
}


FC.prototype.CpuRun = function () {
	this.DrawFlag = false;
	var cycletable = this.CycleTable;
	var mapper = this.Mapper;

	do {
		if(this.toNMI) {
			this.NMI();
			this.toNMI = false;
		} else if((this.P & 0x04) == 0x00 && this.toIRQ != 0x00)
			this.IRQ();
		var opcode = this.Get(this.PC++);
		this.CPUClock += cycletable[opcode];
		mapper.CPUSync(this.CPUClock);
		this.PpuRun();
		this.ApuRun();
		this.CPUClock = 0;

		switch(opcode){
			case 0xA1://LDA XIND
				this.LDA(this.GetAddressIndirectX());
				break;
			case 0xA5://LDA ZP
				this.LDA(this.GetAddressZeroPage());
				break;
			case 0xA9://LDA IMM
				this.LDA(this.GetAddressImmediate());
				break;
			case 0xAD://LDA ABS
				this.LDA(this.GetAddressAbsolute());
				break;
			case 0xB1://LDA INDY
				this.LDA(this.GetAddressIndirectY());
				break;
			case 0xB5://LDA ZPX
				this.LDA(this.GetAddressZeroPageX());
				break;
			case 0xB9://LDA ABSY
				this.LDA(this.GetAddressAbsoluteY());
				break;
			case 0xBD://LDA ABSX
				this.LDA(this.GetAddressAbsoluteX());
				break;

			case 0xA2://LDX IMM
				this.LDX(this.GetAddressImmediate());
				break;
			case 0xA6://LDX ZP
				this.LDX(this.GetAddressZeroPage());
				break;
			case 0xAE://LDX ABS
				this.LDX(this.GetAddressAbsolute());
				break;
			case 0xB6://LDX ZPY
				this.LDX(this.GetAddressZeroPageY());
				break;
			case 0xBE://LDX ABSY
				this.LDX(this.GetAddressAbsoluteY());
				break;

			case 0xA0://LDY IMM
				this.LDY(this.GetAddressImmediate());
				break;
			case 0xA4://LDY ZP
				this.LDY(this.GetAddressZeroPage());
				break;
			case 0xAC://LDY ABS
				this.LDY(this.GetAddressAbsolute());
				break;
			case 0xB4://LDY ZPX
				this.LDY(this.GetAddressZeroPageX());
				break;
			case 0xBC://LDY ABSX
				this.LDY(this.GetAddressAbsoluteX());
				break;

			case 0x81://STA XIND
				this.STA(this.GetAddressIndirectX());
				break;
			case 0x85://STA ZP
				this.STA(this.GetAddressZeroPage());
				break;
			case 0x8D://STA ABS
				this.STA(this.GetAddressAbsolute());
				break;
			case 0x91://STA INDY
				this.STA(this.GetAddressIndirectY());
				break;
			case 0x95://STA ZPX
				this.STA(this.GetAddressZeroPageX());
				break;
			case 0x99://STA ABSY
				this.STA(this.GetAddressAbsoluteY());
				break;
			case 0x9D://STA ABSX
				this.STA(this.GetAddressAbsoluteX());
				break;

			case 0x86://STX ZP
				this.STX(this.GetAddressZeroPage());
				break;
			case 0x8E://STX ABS
				this.STX(this.GetAddressAbsolute());
				break;
			case 0x96://STX ZPY
				this.STX(this.GetAddressZeroPageY());
				break;

			case 0x84://STY ZP
				this.STY(this.GetAddressZeroPage());
				break;
			case 0x8C://STY ABS
				this.STY(this.GetAddressAbsolute());
				break;
			case 0x94://STY ZPX
				this.STY(this.GetAddressZeroPageX());
				break;

			case 0x8A://TXA
				this.A = this.X;
				this.P = this.P & 0x7D | this.ZNCacheTable[this.A];
				break;
			case 0x98://TYA
				this.A = this.Y;
				this.P = this.P & 0x7D | this.ZNCacheTable[this.A];
				break;
			case 0x9A://TXS
				this.S = this.X;
				break;
			case 0xA8://TAY
				this.Y = this.A;
				this.P = this.P & 0x7D | this.ZNCacheTable[this.A];
				break;
			case 0xAA://TAX
				this.X = this.A;
				this.P = this.P & 0x7D | this.ZNCacheTable[this.A];
				break;
			case 0xBA://TSX
				this.X = this.S;
				this.P = this.P & 0x7D | this.ZNCacheTable[this.X];
				break;

			case 0x08://PHP
				this.Push(this.P | 0x30);
				break;
			case 0x28://PLP
				this.P = this.Pop();
				break;
			case 0x48://PHA
				this.Push(this.A);
				break;
			case 0x68://PLA
				this.A = this.Pop();
				this.P = this.P & 0x7D | this.ZNCacheTable[this.A];
				break;

			case 0x61://ADC XIND
				this.ADC(this.GetAddressIndirectX());
				break;
			case 0x65://ADC ZP
				this.ADC(this.GetAddressZeroPage());
				break;
			case 0x69://ADC IMM
				this.ADC(this.GetAddressImmediate());
				break;
			case 0x6D://ADC ABS
				this.ADC(this.GetAddressAbsolute());
				break;
			case 0x71://ADC INDY
				this.ADC(this.GetAddressIndirectY());
				break;
			case 0x75://ADC ZPX
				this.ADC(this.GetAddressZeroPageX());
				break;
			case 0x79://ADC ABSY
				this.ADC(this.GetAddressAbsoluteY());
				break;
			case 0x7D://ADC ABSX
				this.ADC(this.GetAddressAbsoluteX());
				break;

			case 0xE1://SBC XIND
				this.SBC(this.GetAddressIndirectX());
				break;
			case 0xE5://SBC ZP
				this.SBC(this.GetAddressZeroPage());
				break;
			case 0xE9://SBC IMM
				this.SBC(this.GetAddressImmediate());
				break;
			case 0xED://SBC ABS
				this.SBC(this.GetAddressAbsolute());
				break;
			case 0xF1://SBC INDY
				this.SBC(this.GetAddressIndirectY());
				break;
			case 0xF5://SBC ZPX
				this.SBC(this.GetAddressZeroPageX());
				break;
			case 0xF9://SBC ABSY
				this.SBC(this.GetAddressAbsoluteY());
				break;
			case 0xFD://SBC ABSX
				this.SBC(this.GetAddressAbsoluteX());
				break;

			case 0xC1://CMP XIND
				this.CMP(this.GetAddressIndirectX());
				break;
			case 0xC5://CMP ZP
				this.CMP(this.GetAddressZeroPage());
				break;
			case 0xC9://CMP IMM
				this.CMP(this.GetAddressImmediate());
				break;
			case 0xCD://CMP ABS
				this.CMP(this.GetAddressAbsolute());
				break;
			case 0xD1://CMP INDY
				this.CMP(this.GetAddressIndirectY());
				break;
			case 0xD5://CMP ZPX
				this.CMP(this.GetAddressZeroPageX());
				break;
			case 0xD9://CMP ABSY
				this.CMP(this.GetAddressAbsoluteY());
				break;
			case 0xDD://CMP ABSX
				this.CMP(this.GetAddressAbsoluteX());
				break;

			case 0xE0://CPX IMM
				this.CPX(this.GetAddressImmediate());
				break;
			case 0xE4://CPX ZP
				this.CPX(this.GetAddressZeroPage());
				break;
			case 0xEC://CPX ABS
				this.CPX(this.GetAddressAbsolute());
				break;

			case 0xC0://CPY IMM
				this.CPY(this.GetAddressImmediate());
				break;
			case 0xC4://CPY ZP
				this.CPY(this.GetAddressZeroPage());
				break;
			case 0xCC://CPY ABS
				this.CPY(this.GetAddressAbsolute());
				break;

			case 0x21://AND XIND
				this.AND(this.GetAddressIndirectX());
				break;
			case 0x25://AND ZP
				this.AND(this.GetAddressZeroPage());
				break;
			case 0x29://AND IMM
				this.AND(this.GetAddressImmediate());
				break;
			case 0x2D://AND ABS
				this.AND(this.GetAddressAbsolute());
				break;
			case 0x31://AND INDY
				this.AND(this.GetAddressIndirectY());
				break;
			case 0x35://AND ZPX
				this.AND(this.GetAddressZeroPageX());
				break;
			case 0x39://AND ABSY
				this.AND(this.GetAddressAbsoluteY());
				break;
			case 0x3D://AND ABSX
				this.AND(this.GetAddressAbsoluteX());
				break;

			case 0x41://EOR XIND
				this.EOR(this.GetAddressIndirectX());
				break;
			case 0x45://EOR ZP
				this.EOR(this.GetAddressZeroPage());
				break;
			case 0x49://EOR IMM
				this.EOR(this.GetAddressImmediate());
				break;
			case 0x4D://EOR ABS
				this.EOR(this.GetAddressAbsolute());
				break;
			case 0x51://EOR INDY
				this.EOR(this.GetAddressIndirectY());
				break;
			case 0x55://EOR ZPX
				this.EOR(this.GetAddressZeroPageX());
				break;
			case 0x59://EOR ABSY
				this.EOR(this.GetAddressAbsoluteY());
				break;
			case 0x5D://EOR ABSX
				this.EOR(this.GetAddressAbsoluteX());
				break;

			case 0x01://ORA XIND
				this.ORA(this.GetAddressIndirectX());
				break;
			case 0x05://ORA ZP
				this.ORA(this.GetAddressZeroPage());
				break;
			case 0x09://ORA IMM
				this.ORA(this.GetAddressImmediate());
				break;
			case 0x0D://ORA ABS
				this.ORA(this.GetAddressAbsolute());
				break;
			case 0x11://ORA INDY
				this.ORA(this.GetAddressIndirectY());
				break;
			case 0x15://ORA ZPX
				this.ORA(this.GetAddressZeroPageX());
				break;
			case 0x19://ORA ABSY
				this.ORA(this.GetAddressAbsoluteY());
				break;
			case 0x1D://ORA ABSX
				this.ORA(this.GetAddressAbsoluteX());
				break;

			case 0x24://BIT ZP
				this.BIT(this.GetAddressZeroPage());
				break;
			case 0x2C://BIT ABS
				this.BIT(this.GetAddressAbsolute());
				break;

			case 0x06://ASL ZP
				this.ASL(this.GetAddressZeroPage());
				break;
			case 0x0A://ASL A
				this.A = this.ASL_Sub(this.A);
				break;
			case 0x0E://ASL ABS
				this.ASL(this.GetAddressAbsolute());
				break;
			case 0x16://ASL ZPX
				this.ASL(this.GetAddressZeroPageX());
				break;
			case 0x1E://ASL ABSX
				this.ASL(this.GetAddressAbsoluteX());
				break;

			case 0x46://LSR ZP
				this.LSR(this.GetAddressZeroPage());
				break;
			case 0x4A://LSR A
				this.A = this.LSR_Sub(this.A);
				break;
			case 0x4E://LSR ABS
				this.LSR(this.GetAddressAbsolute());
				break;
			case 0x56://LSR ZPX
				this.LSR(this.GetAddressZeroPageX());
				break;
			case 0x5E://LSR ABSX
				this.LSR(this.GetAddressAbsoluteX());
				break;

			case 0x26://ROL ZP
				this.ROL(this.GetAddressZeroPage());
				break;
			case 0x2A://ROL A
				this.A = this.ROL_Sub(this.A);
				break;
			case 0x2E://ROL ABS
				this.ROL(this.GetAddressAbsolute());
				break;
			case 0x36://ROL ZPX
				this.ROL(this.GetAddressZeroPageX());
				break;
			case 0x3E://ROL ABSX
				this.ROL(this.GetAddressAbsoluteX());
				break;

			case 0x66://ROR ZP
				this.ROR(this.GetAddressZeroPage());
				break;
			case 0x6A://ROR A
				this.A = this.ROR_Sub(this.A);
				break;
			case 0x6E://ROR ABS
				this.ROR(this.GetAddressAbsolute());
				break;
			case 0x76://ROR ZPX
				this.ROR(this.GetAddressZeroPageX());
				break;
			case 0x7E://ROR ABSX
				this.ROR(this.GetAddressAbsoluteX());
				break;

			case 0xE6://INC ZP
				this.INC(this.GetAddressZeroPage());
				break;
			case 0xEE://INC ABS
				this.INC(this.GetAddressAbsolute());
				break;
			case 0xF6://INC ZPX
				this.INC(this.GetAddressZeroPageX());
				break;
			case 0xFE://INC ABSX
				this.INC(this.GetAddressAbsoluteX());
				break;

			case 0xE8://INX
				this.X = (this.X + 1) & 0xFF;
				this.P = this.P & 0x7D | this.ZNCacheTable[this.X];
				break;
			case 0xC8://INY
				this.Y = (this.Y + 1) & 0xFF;
				this.P = this.P & 0x7D | this.ZNCacheTable[this.Y]; 
				break;

			case 0xC6://DEC ZP
				this.DEC(this.GetAddressZeroPage());
				break;
			case 0xCE://DEC ABS
				this.DEC(this.GetAddressAbsolute());
				break;
			case 0xD6://DEC ZPX
				this.DEC(this.GetAddressZeroPageX());
				break;
			case 0xDE://DEC ABSX
				this.DEC(this.GetAddressAbsoluteX());
				break;

			case 0xCA://DEX
				this.X = (this.X - 1) & 0xFF;
				this.P = this.P & 0x7D | this.ZNCacheTable[this.X];
				break;
			case 0x88://DEY
				this.Y = (this.Y - 1) & 0xFF;
				this.P = this.P & 0x7D | this.ZNCacheTable[this.Y];
				break;

			case 0x18://CLC
				this.P &= 0xFE;
				break;
			case 0x58://CLI
				this.P &= 0xFB;
				break;
			case 0xB8://CLV
				this.P &= 0xBF;
				break;
			case 0xD8://CLD
				this.P &= 0xF7;
				break;
			case 0x38://SEC
				this.P |= 0x01;
				break;
			case 0x78://SEI
				this.P |= 0x04;
				break;
			case 0xF8://SED
				this.P |= 0x08;
				break;

			case 0xEA://NOP
				break;

			case 0x00://BRK
				this.Push(++this.PC >> 8);
				this.Push(this.PC & 0xFF);
				this.Push(this.P | 0x30);
				this.P |= 0x14;
				this.PC = this.Get16(0xFFFE);
				break;

			case 0x4C://JMP ABS
				this.PC = this.GetAddressAbsolute();
				break;
			case 0x6C://JMP IND
				var address = this.GetAddressAbsolute();
				var tmp = (((address + 1) & 0x00FF) | (address & 0xFF00));
				this.PC = this.Get(address) | (this.Get(tmp) << 8);
				break;

			case 0x20://JSR ABS
				var PC = (this.PC + 1) & 0xFFFF;
				this.Push(PC >> 8);
				this.Push(PC & 0xFF);
				this.PC = this.GetAddressAbsolute();
				break;

			case 0x60://RTS
				this.PC = (this.Pop() | (this.Pop() << 8)) + 1;
				break;
			case 0x40://RTI
				this.P = this.Pop();
				this.PC = this.Pop() | (this.Pop() << 8);
				break;

			case 0x10://BPL REL
				this.Branch((this.P & 0x80) == 0);
				break;
			case 0x30://BMI REL
				this.Branch((this.P & 0x80) != 0);
				break;
			case 0x50://BVC REL
				this.Branch((this.P & 0x40) == 0);
				break;
			case 0x70://BVS REL
				this.Branch((this.P & 0x40) != 0);
				break;
			case 0x90://BCC REL
				this.Branch((this.P & 0x01) == 0);
				break;
			case 0xB0://BCS REL
				this.Branch((this.P & 0x01) != 0);
				break;
			case 0xD0://BNE REL
				this.Branch((this.P & 0x02) == 0);
				break;
			case 0xF0://BEQ REL
				this.Branch((this.P & 0x02) != 0);
				break;

			/* Undocument */
			case 0x0B://ANC IMM
			case 0x2B://ANC IMM
				this.ANC(this.GetAddressImmediate());
				break;

			case 0x8B://ANE IMM
				this.ANE(this.GetAddressImmediate());
				break;

			case 0x6B://ARR IMM
				this.ARR(this.GetAddressImmediate());
				break;

			case 0x4B://ASR IMM
				this.ASR(this.GetAddressImmediate());
				break;

			case 0xC7://DCP ZP
				this.DCP(this.GetAddressZeroPage());
				break;
			case 0xD7://DCP ZPX
				this.DCP(this.GetAddressZeroPageX());
				break;
			case 0xCF://DCP ABS
				this.DCP(this.GetAddressAbsolute());
				break;
			case 0xDF://DCP ABSX
				this.DCP(this.GetAddressAbsoluteX());
				break;
			case 0xDB://DCP ABSY
				this.DCP(this.GetAddressAbsoluteY());
				break;
			case 0xC3://DCP XIND
				this.DCP(this.GetAddressIndirectX());
				break;
			case 0xD3://DCP INDY
				this.DCP(this.GetAddressIndirectY());
				break;

			case 0xE7://ISB ZP
				this.ISB(this.GetAddressZeroPage());
				break;
			case 0xF7://ISB ZPX
				this.ISB(this.GetAddressZeroPageX());
				break;
			case 0xEF://ISB ABS
				this.ISB(this.GetAddressAbsolute());
				break;
			case 0xFF://ISB ABSX
				this.ISB(this.GetAddressAbsoluteX());
				break;
			case 0xFB://ISB ABSY
				this.ISB(this.GetAddressAbsoluteY());
				break;
			case 0xE3://ISB XIND
				this.ISB(this.GetAddressIndirectX());
				break;
			case 0xF3://ISB INDY
				this.ISB(this.GetAddressIndirectY());
				break;

			case 0xBB://LAS ABSY
				this.LAS(this.GetAddressAbsoluteY());
				break;

			case 0xA7://LAX ZP
				this.LAX(this.GetAddressZeroPage());
				break;
			case 0xB7://LAX ZPY
				this.LAX(this.GetAddressZeroPageY());
				break;
			case 0xAF://LAX ABS
				this.LAX(this.GetAddressAbsolute());
				break;
			case 0xBF://LAX ABSY
				this.LAX(this.GetAddressAbsoluteY());
				break;
			case 0xA3://LAX XIND
				this.LAX(this.GetAddressIndirectX());
				break;
			case 0xB3://LAX INDY
				this.LAX(this.GetAddressIndirectY());
				break;

			case 0xAB://LXA IMM
				this.LXA(this.GetAddressImmediate());
				break;

			case 0x27://RLA ZP
				this.RLA(this.GetAddressZeroPage());
				break;
			case 0x37://RLA ZPX
				this.RLA(this.GetAddressZeroPageX());
				break;
			case 0x2F://RLA ABS
				this.RLA(this.GetAddressAbsolute());
				break;
			case 0x3F://RLA ABSX
				this.RLA(this.GetAddressAbsoluteX());
				break;
			case 0x3B://RLA ABSY
				this.RLA(this.GetAddressAbsoluteY());
				break;
			case 0x23://RLA XIND
				this.RLA(this.GetAddressIndirectX());
				break;
			case 0x33://RLA INDY
				this.RLA(this.GetAddressIndirectY());
				break;

			case 0x67://RRA ZP
				this.RRA(this.GetAddressZeroPage());
				break;
			case 0x77://RRA ZPX
				this.RRA(this.GetAddressZeroPageX());
				break;
			case 0x6F://RRA ABS
				this.RRA(this.GetAddressAbsolute());
				break;
			case 0x7F://RRA ABSX
				this.RRA(this.GetAddressAbsoluteX());
				break;
			case 0x7B://RRA ABSY
				this.RRA(this.GetAddressAbsoluteY());
				break;
			case 0x63://RRA XIND
				this.RRA(this.GetAddressIndirectX());
				break;
			case 0x73://RRA INDY
				this.RRA(this.GetAddressIndirectY());
				break;

			case 0x87://SAX ZP
				this.SAX(this.GetAddressZeroPage());
				break;
			case 0x97://SAX ZPY
				this.SAX(this.GetAddressZeroPageY());
				break;
			case 0x8F://SAX ABS
				this.SAX(this.GetAddressAbsolute());
				break;
			case 0x83://SAX XIND
				this.SAX(this.GetAddressIndirectX());
				break;

			case 0xCB://SBX IMM
				this.SBX(this.GetAddressImmediate());
				break;

			case 0x9F://SHA ABSY
				this.SHA(this.GetAddressAbsoluteY());
				break;
			case 0x93://SHA INDY
				this.SHA(this.GetAddressIndirectY());
				break;

			case 0x9B://SHS ABSY
				this.SHS(this.GetAddressAbsoluteY());
				break;

			case 0x9E://SHX ABSY
				this.SHX(this.GetAddressAbsoluteY());
				break;

			case 0x9C://SHY ABSX
				this.SHY(this.GetAddressAbsoluteX());
				break;

			case 0x07://SLO ZP
				this.SLO(this.GetAddressZeroPage());
				break;
			case 0x17://SLO ZPX
				this.SLO(this.GetAddressZeroPageX());
				break;
			case 0x0F://SLO ABS
				this.SLO(this.GetAddressAbsolute());
				break;
			case 0x1F://SLO ABSX
				this.SLO(this.GetAddressAbsoluteX());
				break;
			case 0x1B://SLO ABSY
				this.SLO(this.GetAddressAbsoluteY());
				break;
			case 0x03://SLO XIND
				this.SLO(this.GetAddressIndirectX());
				break;
			case 0x13://SLO INDY
				this.SLO(this.GetAddressIndirectY());
				break;

			case 0x47://SRE ZP
				this.SRE(this.GetAddressZeroPage());
				break;
			case 0x57://SRE ZPX
				this.SRE(this.GetAddressZeroPageX());
				break;
			case 0x4F://SRE ABS
				this.SRE(this.GetAddressAbsolute());
				break;
			case 0x5F://SRE ABSX
				this.SRE(this.GetAddressAbsoluteX());
				break;
			case 0x5B://SRE ABSY
				this.SRE(this.GetAddressAbsoluteY());
				break;
			case 0x43://SRE XIND
				this.SRE(this.GetAddressIndirectX());
				break;
			case 0x53://SRE INDY
				this.SRE(this.GetAddressIndirectY());
				break;

			case 0xEB://SBC IMM
				this.SBC(this.GetAddressImmediate());
				break;

			case 0x1A://NOP
			case 0x3A://NOP
			case 0x5A://NOP
			case 0x7A://NOP
			case 0xDA://NOP
			case 0xFA://NOP
				break;

			case 0x80://DOP IMM
			case 0x82://DOP IMM
			case 0x89://DOP IMM
			case 0xC2://DOP IMM
			case 0xE2://DOP IMM
			case 0x04://DOP ZP
			case 0x44://DOP ZP
			case 0x64://DOP ZP
			case 0x14://DOP ZPX
			case 0x34://DOP ZPX
			case 0x54://DOP ZPX
			case 0x74://DOP ZPX
			case 0xD4://DOP ZPX
			case 0xF4://DOP ZPX
				this.PC++;
				break;

			case 0x0C://TOP ABS
			case 0x1C://TOP ABSX
			case 0x3C://TOP ABSX
			case 0x5C://TOP ABSX
			case 0x7C://TOP ABSX
			case 0xDC://TOP ABSX
			case 0xFC://TOP ABSX
				this.PC += 2;
				break;

			case 0x02://JAM
			case 0x12://JAM
			case 0x22://JAM
			case 0x32://JAM
			case 0x42://JAM
			case 0x52://JAM
			case 0x62://JAM
			case 0x72://JAM
			case 0x92://JAM
			case 0xB2://JAM
			case 0xD2://JAM
			case 0xF2://JAM
			default:
				alert("oops");
				this.PC--;
				break;
		}
	} while(!this.DrawFlag);
}


/* **** FC PPU **** */
FC.prototype.PpuInit = function () {
	this.ScrollRegisterFlag = false;
	this.PPUAddressRegisterFlag = false;
	this.HScrollTmp = 0;
	this.PPUAddress = 0;
	this.PPUAddressBuffer = 0;

	this.Palette = new Array(33);
	for(var i=0; i<this.Palette.length; i++)
		this.Palette[i] = 0x0F;

	this.SpriteLineBuffer = new Array(256);
	for(var i=0; i<this.SpriteLineBuffer.length; i++)
		this.SpriteLineBuffer[i] = 0;

	this.PPUReadBuffer = 0;

	if(this.FourScreen)
		this.SetMirrors(0, 1, 2, 3);
	else
		this.SetMirror(this.HMirror);

	this.BgLineBuffer = new Array(256 + 8);

	this.PpuX = 341;
	this.PpuY = 0;

	this.Sprite0Line = false;
}


FC.prototype.SetMirror = function (value) {
	if(value)
		this.SetMirrors(0, 0, 1, 1);
	else
		this.SetMirrors(0, 1, 0, 1);
}


FC.prototype.SetMirrors = function (value0, value1, value2, value3) {
	this.SetChrRomPage1K( 8, value0 + 8 + 0x0100);
	this.SetChrRomPage1K( 9, value1 + 8 + 0x0100);
	this.SetChrRomPage1K(10, value2 + 8 + 0x0100);
	this.SetChrRomPage1K(11, value3 + 8 + 0x0100);
}


FC.prototype.SetChrRomPage1K = function (page, romPage){
	if(romPage >= 0x0100) {
		this.CHRROM_STATE[page] = romPage;
		this.VRAM[page] = this.VRAMS[romPage & 0xFF];
	} else {
		if(this.ChrRomPageCount > 0) {
			this.CHRROM_STATE[page] = romPage % (this.ChrRomPageCount * 8);
			this.VRAM[page] = this.CHRROM_PAGES[this.CHRROM_STATE[page]];
		}
	}
}


FC.prototype.SetChrRomPages1K = function (romPage0, romPage1, romPage2, romPage3, romPage4, romPage5, romPage6, romPage7){
	this.SetChrRomPage1K(0, romPage0);
	this.SetChrRomPage1K(1, romPage1);
	this.SetChrRomPage1K(2, romPage2);
	this.SetChrRomPage1K(3, romPage3);
	this.SetChrRomPage1K(4, romPage4);
	this.SetChrRomPage1K(5, romPage5);
	this.SetChrRomPage1K(6, romPage6);
	this.SetChrRomPage1K(7, romPage7);
}


FC.prototype.SetChrRomPage = function (num){
	num <<= 3;
	for(var i=0; i<8; i++)
		this.SetChrRomPage1K(i, num + i);
}


FC.prototype.SetCanvas = function (id) {
	this.Canvas = document.getElementById(id);
	if(!this.Canvas.getContext)
		return false;
	this.ctx = this.Canvas.getContext("2d");
	this.ImageData = this.ctx.createImageData(256, 224);
	for(var i=0; i<256*224*4; i+=4)
		this.ImageData.data[i + 3] = 255;
	this.ctx.putImageData(this.ImageData, 0, 0);
	return true;
}


FC.prototype.PpuRun = function () {
	var tmpIO1 = this.IO1;
	var tmpSpLine = this.SpriteLineBuffer;
	var tmpx = this.PpuX;
	this.PpuX += this.CPUClock * 3;

	while(this.PpuX >= 341) {
		var tmpIsScreenEnable = (tmpIO1[0x01] & 0x08) == 0x08;
		var tmpIsSpriteEnable = (tmpIO1[0x01] & 0x10) == 0x10;

		this.PpuX -= 341;
		tmpx = 0;
		this.Sprite0Line = false;
		this.PpuY++;

		if(this.PpuY == 262) {
			this.PpuY = 0;
			if(tmpIsScreenEnable || tmpIsSpriteEnable)
				this.PPUAddress = this.PPUAddressBuffer;
			tmpIO1[0x02] &= 0x7F;
		}

		this.Mapper.HSync(this.PpuY);

		if(this.PpuY == 240) {
			this.ctx.putImageData(this.ImageData, 0, 0);

			this.DrawFlag = true;
			this.ScrollRegisterFlag = false;
			tmpIO1[0x02] = (tmpIO1[0x02] & 0x1F) | 0x80;

			this.toNMI = (tmpIO1[0x00] & 0x80) == 0x80;
			continue;
		}

		if(this.PpuY < 240) {
			var tmpPalette = this.Palette;
			var tmpPaletteTable = this.PaletteTable;
			var tmpImageData = this.ImageData.data;
			var tmpBgLineBuffer = this.BgLineBuffer;

			if(tmpIsScreenEnable || tmpIsSpriteEnable) {
				this.PPUAddress = (this.PPUAddress & 0xFBE0) | (this.PPUAddressBuffer & 0x041F);

				if(this.PpuY >= 8 && this.PpuY < 232) {
					this.BuildBGLine();
					this.BuildSpriteLine();

					var tmpDist = (this.PpuY - 8) << 10;
					for(var p=0; p<256; p++, tmpDist+=4) {
						var tmpPal = tmpPaletteTable[tmpPalette[tmpBgLineBuffer[p]]];
						tmpImageData[tmpDist] = tmpPal[0];
						tmpImageData[tmpDist + 1] = tmpPal[1];
						tmpImageData[tmpDist + 2] = tmpPal[2];
					}
				} else {
					var tmpBgLineBuffer = this.BgLineBuffer;
					for(var p=0; p<264; p++)
						tmpBgLineBuffer[p] = 0x10;
					this.BuildSpriteLine();
				}

				if((this.PPUAddress & 0x7000) == 0x7000) {
					this.PPUAddress &= 0x8FFF;
					if((this.PPUAddress & 0x03E0) == 0x03A0)
						this.PPUAddress = (this.PPUAddress ^ 0x0800) & 0xFC1F;
					else if((this.PPUAddress & 0x03E0) == 0x03E0)
						this.PPUAddress &= 0xFC1F;
					else
						this.PPUAddress += 0x0020;
				} else
					this.PPUAddress += 0x1000;

			} else if(this.PpuY >= 8 && this.PpuY < 232) {
				var tmpDist = (this.PpuY - 8) << 10;
				var tmpPal = tmpPaletteTable[tmpPalette[0x10]];
				for(var p=0; p<256; p++, tmpDist += 4) {
					tmpImageData[tmpDist] = tmpPal[0];
					tmpImageData[tmpDist + 1] = tmpPal[1];
					tmpImageData[tmpDist + 2] = tmpPal[2];
				}
			}
		}
	}

	if(this.Sprite0Line && (tmpIO1[0x02] & 0x40) != 0x40) {
		var i = this.PpuX > 255 ? 255 : this.PpuX;
		for(; tmpx<=i; tmpx++) {
			if(tmpSpLine[tmpx] == 0) {
				tmpIO1[0x02] |= 0x40;
				break;
			}
		}
	}
}


FC.prototype.BuildBGLine = function () {
	var tmpBgLineBuffer = this.BgLineBuffer;
	if((this.IO1[0x01] & 0x08) != 0x08) {
		for(var p=0; p<264; p++)
			tmpBgLineBuffer[p] = 0x10;
		return;
	}

	this.Mapper.BuildBGLine();

	if((this.IO1[0x01] & 0x02) != 0x02) {
		for(var p=0; p<8; p++)
			tmpBgLineBuffer[p] = 0x10;
	}
}


FC.prototype.BuildBGLine_SUB = function () {
	var tmpBgLineBuffer = this.BgLineBuffer;
	var tmpVRAM = this.VRAM;
	var nameAddr = 0x2000 | (this.PPUAddress & 0x0FFF);
	var tableAddr = ((this.PPUAddress & 0x7000) >> 12) | (this.IO1[0x00] & 0x10) << 8;
	var nameAddrHigh = nameAddr >> 10;
	var nameAddrLow = nameAddr & 0x03FF;
	var tmpVRAMHigh = tmpVRAM[nameAddrHigh];
	var tmpPaletteArray = this.PaletteArray;
	var tmpSPBitArray = this.SPBitArray;

	var q = 0;
	var s = this.HScrollTmp;

	for(var p=0; p<33; p++) {
		var ptnDist = (tmpVRAMHigh[nameAddrLow] << 4) | tableAddr;
		var tmpSrcV = tmpVRAM[ptnDist >> 10];
		ptnDist &= 0x03FF;
		var attr = ((tmpVRAMHigh[((nameAddrLow & 0x0380) >> 4) | ((nameAddrLow & 0x001C) >> 2) + 0x03C0] << 2) >> (((nameAddrLow & 0x0040) >> 4) | (nameAddrLow & 0x0002))) & 0x0C;
		var ptn = tmpSPBitArray[tmpSrcV[ptnDist]][tmpSrcV[ptnDist + 8]];

		for(; s<8; s++, q++)
			tmpBgLineBuffer[q] = tmpPaletteArray[ptn[s] | attr];
		s = 0;

		if((nameAddrLow & 0x001F) == 0x001F) {
			nameAddrLow &= 0xFFE0;
			tmpVRAMHigh = tmpVRAM[(nameAddrHigh ^= 0x01)];
		} else
			nameAddrLow++;
	}
}


FC.prototype.BuildSpriteLine = function () {
	this.Mapper.BuildSpriteLine();
}


FC.prototype.BuildSpriteLine_SUB = function () {
	var tmpBgLineBuffer = this.BgLineBuffer;
	var tmpIsSpriteClipping = (this.IO1[0x01] & 0x04) == 0x04 ? 0 : 8;

	if((this.IO1[0x01] & 0x10) == 0x10) {
		var tmpSpLine = this.SpriteLineBuffer;
		for(var p=0; p<256; p++)
			tmpSpLine[p] = 256;

		var tmpSpRAM = this.SPRITE_RAM;
		var tmpBigSize = (this.IO1[0x00] & 0x20) == 0x20 ? 16 : 8;
		var tmpSpPatternTableAddress = (this.IO1[0x00] & 0x08) << 9;

		var tmpVRAM = this.VRAM;
		var tmpSPBitArray = this.SPBitArray;

		var lineY = this.PpuY;
		var count = 0;

		for(var i=0; i<=252; i+=4) {
			var isy = tmpSpRAM[i] + 1;
			if(isy > lineY || (isy + tmpBigSize) <= lineY)
				continue;

			if(i == 0)
				this.Sprite0Line = true;

			if(++count == 9 && this.SpriteLimit)
				break;

			var x = tmpSpRAM[i + 3];
			var ex = x + 8;
			if(ex > 256)
				ex = 256;

			var attr = tmpSpRAM[i + 2];

			var attribute = ((attr & 0x03) << 2) | 0x10;
			var bgsp = (attr & 0x20) == 0x00;

			var iy = (attr & 0x80) == 0x80 ? tmpBigSize - 1 - (lineY - isy) : lineY - isy;
			var tileNum = ((iy & 0x08) << 1) + (iy & 0x07) +
				(tmpBigSize == 8 ? (tmpSpRAM[i + 1] << 4) + tmpSpPatternTableAddress : ((tmpSpRAM[i + 1] & 0xFE) << 4) + ((tmpSpRAM[i + 1] & 0x01) << 12));
			var tmpHigh = tmpVRAM[tileNum >> 10];
			var tmpLow = tileNum & 0x03FF;
			var ptn = tmpSPBitArray[tmpHigh[tmpLow]][tmpHigh[tmpLow + 8]];

			var is;
			var ia;
			if((attr & 0x40) == 0x00) {
				is = 0;
				ia = 1;
			} else {
				is = 7;
				ia = -1;
			}

			for(; x<ex; x++, is+=ia) {
				var tmpPtn = ptn[is];
				if(tmpPtn != 0x00 && tmpSpLine[x] == 256) {
					tmpSpLine[x] = i;
					if(x >= tmpIsSpriteClipping && (bgsp || tmpBgLineBuffer[x] == 0x10))
							tmpBgLineBuffer[x] = tmpPtn | attribute;
				}
			}
		}

		if(count >= 8)
			this.IO1[0x02] |= 0x20;
		else
			this.IO1[0x02] &= 0xDF;
	}
}


FC.prototype.WriteScrollRegister = function (value) {
	this.IO1[0x05] = value;

	if(this.ScrollRegisterFlag) {
		this.PPUAddressBuffer = (this.PPUAddressBuffer & 0x8C1F) | ((value & 0xF8) << 2) | ((value & 0x07) << 12);
	} else {
		this.PPUAddressBuffer = (this.PPUAddressBuffer & 0xFFE0) | ((value & 0xF8) >> 3);
		this.HScrollTmp = value & 7;
	}
	this.ScrollRegisterFlag = !this.ScrollRegisterFlag;
}


FC.prototype.WritePPUControlRegister0 = function (value) {
	this.IO1[0x00] = value;

	this.PPUAddressBuffer = (this.PPUAddressBuffer & 0xF3FF) | ((value & 0x03) << 10);
}


FC.prototype.WritePPUControlRegister1 = function (value) {
	this.IO1[0x01] = value;
}


FC.prototype.WritePPUAddressRegister = function (value) {
	this.IO1[0x06] = value;

	if(this.PPUAddressRegisterFlag)
		this.PPUAddress = this.PPUAddressBuffer = (this.PPUAddressBuffer & 0xFF00) | value;
	else
		this.PPUAddressBuffer = (this.PPUAddressBuffer & 0x00FF) | ((value & 0x3F) << 8);
	this.PPUAddressRegisterFlag = !this.PPUAddressRegisterFlag;
}


FC.prototype.ReadPPUStatus = function () {
	var result = this.IO1[0x02];
	this.IO1[0x02] &= 0x1F;
	this.ScrollRegisterFlag = false;
	this.PPUAddressRegisterFlag = false;
	return result;
}


FC.prototype.ReadPPUData = function () {
	return this.Mapper.ReadPPUData();
}


FC.prototype.ReadPPUData_SUB = function () {
	var tmp = this.PPUReadBuffer;
	var addr = this.PPUAddress & 0x3FFF;
	this.PPUReadBuffer = this.VRAM[addr >> 10][addr & 0x03FF];
	this.PPUAddress = (this.PPUAddress + ((this.IO1[0x00] & 0x04) == 0x04 ? 32 : 1)) & 0xFFFF;
	return tmp;
}


FC.prototype.WritePPUData = function (value) {
	this.Mapper.WritePPUData(value);
}


FC.prototype.WritePPUData_SUB = function (value) {
	this.IO1[0x07] = value;

	var tmpPPUAddress = this.PPUAddress & 0x3FFF;

	this.VRAM[tmpPPUAddress >> 10][tmpPPUAddress & 0x03FF] = value;

	if(tmpPPUAddress < 0x3000) {
		this.PPUAddress = (this.PPUAddress + ((this.IO1[0x00] & 0x04) == 0x04 ? 32 : 1)) & 0xFFFF;
		return;
	}

	if(tmpPPUAddress < 0x3EFF) {
		this.VRAM[(tmpPPUAddress - 0x1000) >> 10][(tmpPPUAddress - 0x1000) & 0x03FF] = value;
		this.PPUAddress = (this.PPUAddress + ((this.IO1[0x00] & 0x04) == 0x04 ? 32 : 1)) & 0xFFFF;
		return;
	}

	var palNo = tmpPPUAddress & 0x001F;
	if(palNo == 0x00 || palNo == 0x10)
		this.Palette[0x00] = this.Palette[0x10] = value & 0x3F;
	else
		this.Palette[palNo] = value & 0x3F;
	this.PPUAddress = (this.PPUAddress + ((this.IO1[0x00] & 0x04) == 0x04 ? 32 : 1)) & 0xFFFF;
}


FC.prototype.WriteSpriteData = function (data){
	this.SPRITE_RAM[this.IO1[0x03]] = data;
	this.IO1[0x03] = (this.IO1[0x03] + 1) & 0xFF;
}


FC.prototype.WriteSpriteAddressRegister = function (data) {
	this.IO1[0x03] = data;
}


FC.prototype.StartDMA = function (data) {
	var offset = data << 8;
	var tmpDist = this.SPRITE_RAM;
	var tmpSrc = this.RAM;
	for(var i = 0; i < 0x100; i++, offset++)
		tmpDist[i] = tmpSrc[offset];
	this.CPUClock += 514;
}

/* **** FC Header **** */
FC.prototype.ParseHeader = function () {
	if(this.Rom.length < 0x10 || this.Rom[0] != 0x4E || this.Rom[1] != 0x45 ||  this.Rom[2] != 0x53 || this.Rom[3] != 0x1A)
		return false;

	this.PrgRomPageCount = this.Rom[4]
	this.ChrRomPageCount = this.Rom[5];
	this.HMirror  = (this.Rom[6] & 0x01) == 0;
	this.VMirror  = (this.Rom[6] & 0x01) != 0;
	this.SramEnable = (this.Rom[6] & 0x02) != 0;
	this.TrainerEnable = (this.Rom[6] & 0x04) != 0;
	this.FourScreen = (this.Rom[6] & 0x08) != 0;
	this.MapperNumber = (this.Rom[6] >> 4) | (this.Rom[7] & 0xF0);

	return true;
}


/* **** FC Storage **** */
FC.prototype.StorageClear = function () {
	var i;
	var j;

	for(i=0; i<this.RAM.length; i++)
		this.RAM[i] = 0;

	for(i=0; i<this.INNERSRAM.length; i++)
		this.INNERSRAM[i] = 0;
	this.SRAM = this.INNERSRAM;

	for(i=0; i<this.PRGROM_STATE.length; i++)
		this.PRGROM_STATE[i] = 0;
	for(i=0; i<this.CHRROM_STATE.length; i++)
		this.CHRROM_STATE[i] = 0;

	for(i=0; i<this.VRAMS.length; i++) {
		for(j=0; j<this.VRAMS[i].length; j++)
			this.VRAMS[i][j] = 0;
		this.SetChrRomPage1K(i, i + 0x0100);
	}

	for(i=0; i<this.SPRITE_RAM.length; i++)
		this.SPRITE_RAM[i] = 0;

	for(i=0; i<this.ROM_RAM.length; i++) {
		for(j=0; j<this.ROM_RAM[i].length; j++)
			this.ROM_RAM[i][j] = 0;
		this.SetPrgRomPage8K(i, -(i + 1));
	}

	for(i=0; i<this.IO1.length; i++)
		this.IO1[i] = 0;
	for(i=0; i<this.IO2.length; i++)
		this.IO2[i] = 0;
	this.IO2[0x17] = 0x40;
}


FC.prototype.SetRom = function (rom) {
	this.Rom = rom.concat(0);
}


FC.prototype.StorageInit = function () {
	this.PRGROM_PAGES = null;
	this.CHRROM_PAGES = null;

	var i;
	this.PRGROM_PAGES = new Array(this.PrgRomPageCount * 2);
	for(i=0; i< this.PrgRomPageCount * 2; i++)
		this.PRGROM_PAGES[i] = this.Rom.slice(i * 0x2000 + 0x0010, i * 0x2000 + 0x2010);

	if(this.ChrRomPageCount > 0) {
		this.CHRROM_PAGES = new Array(this.ChrRomPageCount * 8);
		for(i=0; i< this.ChrRomPageCount * 8; i++)
			this.CHRROM_PAGES[i] = this.Rom.slice(this.PrgRomPageCount * 0x4000 + i * 0x0400 + 0x0010,
							this.PrgRomPageCount * 0x4000 + i * 0x0400 + 0x0410);
	}
}


FC.prototype.Get = function (address) {
	switch(address & 0xE000) {
		case 0x0000:
			return this.RAM[address & 0x7FF];
		case 0x2000:
			switch (address & 0x07) {
				case 0x02:
					return this.ReadPPUStatus();
				case 0x07:
					return this.ReadPPUData();
			}
			return 0;
		case 0x4000:
			if(address >= 0x4020)
				return this.Mapper.ReadLow(address);
			switch (address) {
				case 0x4015:
					return this.ReadWaveControl();
				case 0x4016:
					return this.ReadJoyPadRegister1();
				case 0x4017:
					return this.ReadJoyPadRegister2();
			}
			return 0x40;
		case 0x6000:
			return this.Mapper.ReadSRAM(address);
		case 0x8000:
			return this.ROM[0][address & 0x1FFF];
		case 0xA000:
			return this.ROM[1][address & 0x1FFF];
		case 0xC000:
			return this.ROM[2][address & 0x1FFF];
		case 0xE000:
			return this.ROM[3][address & 0x1FFF];
	}
}


FC.prototype.Get16 = function (address) {
	return this.Get(address) | (this.Get(address + 1) << 8);
}


FC.prototype.Set = function (address, data) {
	switch(address & 0xE000) {
		case 0x0000:
			this.RAM[address & 0x7FF] = data;
			return;
		case 0x2000:
			switch (address & 0x07) {
				case 0:
					this.WritePPUControlRegister0(data);
					return;
				case 1:
					this.WritePPUControlRegister1(data);
					return;
				case 2:
					return;
				case 3:
					this.WriteSpriteAddressRegister(data);
					return;
				case 4:
					this.WriteSpriteData(data);
					return;
				case 5:
					this.WriteScrollRegister(data);
					return;
				case 6:
					this.WritePPUAddressRegister(data);
					return;
				case 7:
					this.WritePPUData(data);
					return;
			}
		case 0x4000:
			if(address < 0x4020) {
				this.IO2[address & 0x00FF] = data;
				switch (address) {
					case 0x4002:
						this.WriteCh1Length0();
						return;
					case 0x4003:
						this.WriteCh1Length1();
						return;
					case 0x4006:
						this.WriteCh2Length0();
						return;
					case 0x4007:
						this.WriteCh2Length1();
						return;
					case 0x4008:
						this.WriteCh3LinearCounter();
						return;
					case 0x400B:
						this.WriteCh3Length1();
						return;
					case 0x400F:
						this.WriteCh4Length1();
						return;
					case 0x4010:
						this.WriteCh5DeltaControl();
						return;
					case 0x4011:
						this.WriteCh5DeltaCounter();
						return;
					case 0x4014:
						this.StartDMA(data);
						return;
					case 0x4015:
						this.WriteWaveControl();
						return;
					case 0x4016:
						this.WriteJoyPadRegister1(data);
						return;
				}
				return;
			}
			this.Mapper.WriteLow(address, data);
			return;
		case 0x6000:
			this.Mapper.WriteSRAM(address, data);
			return;
		case 0x8000:
		case 0xA000:
		case 0xC000:
		case 0xE000:
			this.Mapper.Write(address, data);
			return;
	}
}


FC.prototype.SetPrgRomPage8K = function (page, romPage){
	if(romPage < 0) {
		this.PRGROM_STATE[page] = romPage;
		this.ROM[page] = this.ROM_RAM[-(romPage + 1)];
	} else {
		this.PRGROM_STATE[page] = romPage % (this.PrgRomPageCount * 2);
		this.ROM[page] = this.PRGROM_PAGES[this.PRGROM_STATE[page]];
	}
}


FC.prototype.SetPrgRomPages8K = function (romPage0, romPage1, romPage2, romPage3){
	this.SetPrgRomPage8K(0, romPage0);
	this.SetPrgRomPage8K(1, romPage1);
	this.SetPrgRomPage8K(2, romPage2);
	this.SetPrgRomPage8K(3, romPage3);
}


FC.prototype.SetPrgRomPage = function (no, num){
	this.SetPrgRomPage8K(no * 2, num * 2);
	this.SetPrgRomPage8K(no * 2 + 1, num * 2 + 1);
}


/* **** FC JoyPad **** */
FC.prototype.WriteJoyPadRegister1 = function (value) {
	var s = (value & 0x01) == 0x01 ? true : false;
	if(this.JoyPadStrobe && !s) {
		this.JoyPadBuffer[0] = this.JoyPadState[0];
		this.JoyPadBuffer[1] = this.JoyPadState[1];
	}
	this.JoyPadStrobe = s;
}


FC.prototype.ReadJoyPadRegister1 = function () {
	var result = this.JoyPadBuffer[0] & 0x01;
	this.JoyPadBuffer[0] >>>= 1;
	return result;
}


FC.prototype.ReadJoyPadRegister2 = function () {
	var result = this.JoyPadBuffer[1] & 0x01;
	this.JoyPadBuffer[1] >>>= 1;
	return result;
}


FC.prototype.KeyUpFunction = function (evt){
	switch (evt.keyCode){
		//1CON
		case 88:// A
			this.JoyPadState[0] &= ~0x01;
			break;
		case 90:// B
			this.JoyPadState[0] &= ~0x02;
			break;
		case 65:// SELECT
			this.JoyPadState[0] &= ~0x04;
			break;
		case 83:// START
			this.JoyPadState[0] &= ~0x08;
			break;
		case 38:// UP
			this.JoyPadState[0] &= ~0x10;
			break;
		case 40:// DOWN
			this.JoyPadState[0] &= ~0x20;
			break;
		case 37:// LEFT
			this.JoyPadState[0] &= ~0x40;
			break;
		case 39:// RIGHT
			this.JoyPadState[0] &= ~0x80;
			break;

		//2CON
		case 105:// A
			this.JoyPadState[1] &= ~0x01;
			break;
		case 103:// B
			this.JoyPadState[1] &= ~0x02;
			break;
		case 104:// UP
			this.JoyPadState[1] &= ~0x10;
			break;
		case 98:// DOWN
			this.JoyPadState[1] &= ~0x20;
			break;
		case 100:// LEFT
			this.JoyPadState[1] &= ~0x40;
			break;
		case 102:// RIGHT
			this.JoyPadState[1] &= ~0x80;
			break;
	}
	evt.preventDefault();
}


FC.prototype.KeyDownFunction = function (evt){
	switch (evt.keyCode){
		//1CON
		case 88:// A
			this.JoyPadState[0] |= 0x01;
			break;
		case 90:// B
			this.JoyPadState[0] |= 0x02;
			break;
		case 65:// SELECT
			this.JoyPadState[0] |= 0x04;
			break;
		case 83:// START
			this.JoyPadState[0] |= 0x08;
			break;
		case 38:// UP
			this.JoyPadState[0] |= 0x10;
			break;
		case 40:// DOWN
			this.JoyPadState[0] |= 0x20;
			break;
		case 37:// LEFT
			this.JoyPadState[0] |= 0x40;
			break;
		case 39:// RIGHT
			this.JoyPadState[0] |= 0x80;
			break;

		//2CON
		case 105:// A
			this.JoyPadState[1] |= 0x01;
			break;
		case 103:// B
			this.JoyPadState[1] |= 0x02;
			break;
		case 104:// UP
			this.JoyPadState[1] |= 0x10;
			break;
		case 98:// DOWN
			this.JoyPadState[1] |= 0x20;
			break;
		case 100:// LEFT
			this.JoyPadState[1] |= 0x40;
			break;
		case 102:// RIGHT
			this.JoyPadState[1] |= 0x80;
			break;
	}
	evt.preventDefault();
}


FC.prototype.JoyPadInit = function () {
	this.JoyPadKeyUpFunction = this.KeyUpFunction.bind(this);
	this.JoyPadKeyDownFunction = this.KeyDownFunction.bind(this);
	document.addEventListener("keyup", this.JoyPadKeyUpFunction, true);
	document.addEventListener("keydown", this.JoyPadKeyDownFunction, true);
}


FC.prototype.JoyPadRelease = function () {
	document.removeEventListener("keyup", this.JoyPadKeyUpFunction, true);
	document.removeEventListener("keydown", this.JoyPadKeyDownFunction, true);
}


FC.prototype.CheckGamePad = function () {
	if(!this.Use_GetGamepads)
		return;

	var pads = navigator.getGamepads();
	for(var i=0; i<2; i++) {
		var pad = pads[i];
		if(typeof pad !== "undefined") {
			this.JoyPadState[i] = 0x00;
			this.JoyPadState[i] |= pad.buttons[1].pressed ? 0x01 : 0x00;// A
			this.JoyPadState[i] |= pad.buttons[0].pressed ? 0x02 : 0x00;// B
			this.JoyPadState[i] |= pad.buttons[2].pressed ? 0x04 : 0x00;// SELECT
			this.JoyPadState[i] |= pad.buttons[3].pressed ? 0x08 : 0x00;// START
			//this.JoyPadState[i] |= pad.buttons[8].pressed ? 0x04 : 0x00;// SELECT
			//this.JoyPadState[i] |= pad.buttons[9].pressed ? 0x08 : 0x00;// START

			this.JoyPadState[i] |= pad.axes[1] < -0.5 ? 0x10 : 0x00;// UP
			this.JoyPadState[i] |= pad.axes[1] >  0.5 ? 0x20 : 0x00;// DOWN
			this.JoyPadState[i] |= pad.axes[0] < -0.5 ? 0x40 : 0x00;// LEFT
			this.JoyPadState[i] |= pad.axes[0] >  0.5 ? 0x80 : 0x00;// RIGHT
		}
	}
}


/* **** FC APU **** */
FC.prototype.WebAudioFunction = function (e) {
	var output = e.outputBuffer.getChannelData(0);

	var data;
	if(this.WaveDatas.length == 0) {
		var data = new Float32Array(this.WebAudioBufferSize);
		for(var i=0; i<this.WebAudioBufferSize; i++)
			data[i] = 0.0;
	} else {
		var len = this.WaveDatas.length > this.WebAudioBufferSize ? this.WebAudioBufferSize : this.WaveDatas.length;
		data = new Float32Array(len);
		for(var i=0; i<len; i++)
			data[i] = this.WaveDatas[i] / (128 * 16);
		this.WaveDatas = this.WaveDatas.slice(len);

		if(this.WaveDatas.length >= this.WebAudioBufferSize * 2)
			this.WaveDatas = this.WaveDatas.slice(this.WebAudioBufferSize * 2);
	}
	output.set(data);
}


FC.prototype.ReadWaveControl = function () {
	var tmp = 0x00;
	if(this.WaveCh1LengthCounter != 0)
		tmp |= 0x01;

	if(this.WaveCh2LengthCounter != 0)
		tmp |= 0x02;

	if(this.WaveCh3LengthCounter != 0)
		tmp |= 0x04;

	if(this.WaveCh4LengthCounter != 0)
		tmp |= 0x08;

	if(this.WaveCh5SampleCounter != 0)
		tmp |= 0x10;

	tmp |= this.toIRQ & 0xC0;

	this.toIRQ &= ~0x40;

	return tmp;
}


FC.prototype.WriteWaveControl = function () {
	var tmp = this.IO2[0x15];

	if((tmp & 0x01) != 0x01)
		this.WaveCh1LengthCounter = 0;

	if((tmp & 0x02) != 0x02)
		this.WaveCh2LengthCounter = 0;

	if((tmp & 0x04) != 0x04)
		this.WaveCh3LengthCounter = 0;

	if((tmp & 0x08) != 0x08)
		this.WaveCh4LengthCounter = 0;

	if((tmp & 0x10) != 0x10) {
		this.WaveCh5SampleCounter = 0;
		this.toIRQ &= ~0x80;
	} else if(this.WaveCh5SampleCounter == 0) {
		this.SetCh5Delta();
	}
}


FC.prototype.WriteCh1Length0 = function () {
	this.WaveCh1Frequency = ((this.IO2[0x03] & 0x07) << 8) + this.IO2[0x02] + 1;
}


FC.prototype.WriteCh1Length1 = function () {
	this.WaveCh1LengthCounter = this.WaveLengthCount[this.IO2[0x03] >> 3];
	this.WaveCh1Envelope = 0;
	this.WaveCh1EnvelopeCounter = 0x0F;
	this.WaveCh1Sweep = 0;
	this.WaveCh1Frequency = ((this.IO2[0x03] & 0x07) << 8) + this.IO2[0x02] + 1;
}


FC.prototype.WriteCh2Length0 = function () {
	this.WaveCh2Frequency = ((this.IO2[0x07] & 0x07) << 8) + this.IO2[0x06] + 1;
}


FC.prototype.WriteCh2Length1 = function () {
	this.WaveCh2LengthCounter = this.WaveLengthCount[this.IO2[0x07] >> 3];
	this.WaveCh2Envelope = 0;
	this.WaveCh2EnvelopeCounter = 0x0F;
	this.WaveCh2Sweep = 0;
	this.WaveCh2Frequency = ((this.IO2[0x07] & 0x07) << 8) + this.IO2[0x06] + 1;
}


FC.prototype.WriteCh3LinearCounter = function (){
	this.WaveCh3LinearCounter = this.IO2[0x08] & 0x7F;
}


FC.prototype.WriteCh3Length1 = function () {
	this.WaveCh3LengthCounter = this.WaveLengthCount[this.IO2[0x0B] >> 3];
	this.WaveCh3LinearCounter = this.IO2[0x08] & 0x7F;
}


FC.prototype.WriteCh4Length1 = function () {
	this.WaveCh4LengthCounter = this.WaveLengthCount[this.IO2[0x0F] >> 3];
	this.WaveCh4Envelope = 0;
	this.WaveCh4EnvelopeCounter = 0x0F;
}


FC.prototype.WriteCh5DeltaControl = function () {
	if((this.IO2[0x10] & 0x80) != 0x80)
		this.toIRQ &= ~0x80;
}


FC.prototype.WriteCh5DeltaCounter = function () {
	this.WaveCh5DeltaCounter = this.IO2[0x11] & 0x7F;
}


FC.prototype.SetCh5Delta = function () {
	var tmpIO2 = this.IO2;
	this.WaveCh5DeltaCounter = tmpIO2[0x11] & 0x7F;
	this.WaveCh5SampleAddress = (tmpIO2[0x12] << 6);
	this.WaveCh5SampleCounter = ((tmpIO2[0x13] << 4) + 1) << 3;
	this.WaveCh5Register = 0;
	this.WaveCh5Angle = -1;
	this.toIRQ &= ~0x80;
}


FC.prototype.ApuInit = function () {
	this.WaveFrameSequence = 0;

	this.WaveCh1LengthCounter = 0;
	this.WaveCh1Envelope = 0;
	this.WaveCh1EnvelopeCounter = 0;
	this.WaveCh1Sweep = 0;
	this.WaveCh1Frequency = 0;

	this.WaveCh2LengthCounter = 0;
	this.WaveCh2Envelope = 0;
	this.WaveCh2EnvelopeCounter = 0;
	this.WaveCh2Sweep = 0;
	this.WaveCh2Frequency = 0;

	this.WaveCh3LengthCounter = 0;
	this.WaveCh3LinearCounter = 0;

	this.WaveCh4LengthCounter = 0;
	this.WaveCh4Envelope = 0;
	this.WaveCh4EnvelopeCounter = 0;
	this.WaveCh4Register = 1;
	this.WaveCh4BitSequence = 0;

	this.WaveCh5DeltaCounter = 0;
	this.WaveCh5Register = 0;
	this.WaveCh5SampleAddress = 0;
	this.WaveCh5SampleCounter = 0;
	this.WaveCh5Angle = -1;

	this.ApuClockCounter = 0;

	this.WaveFrameSequenceCounter = 0;

	this.WaveDatas = new Array();

	this.ApuCpuClockCounter = 0;

	this.EXSoundInit();
}


FC.prototype.Out_Apu = function () {
	var all_out = 0;
	var tmpWaveBaseCount2 = this.WaveBaseCount;
	var tmpWaveBaseCount = tmpWaveBaseCount2 << 1;
	var tmpIO2 = this.IO2;

	// **** CH1 ****
	if(this.WaveCh1LengthCounter != 0 && this.WaveCh1Frequency > 3)
		all_out += ((tmpIO2[0x00] & 0x10) == 0x10 ? (tmpIO2[0x00] & 0x0F) : this.WaveCh1EnvelopeCounter) * (((tmpWaveBaseCount / this.WaveCh1Frequency) & 0x1F) < this.WaveCh1_2DutyData[(tmpIO2[0x00] & 0xC0) >> 6] ? 1 : -1);

	// **** CH2 ****
	if(this.WaveCh2LengthCounter != 0 && this.WaveCh2Frequency > 3)
		all_out += ((tmpIO2[0x04] & 0x10) == 0x10 ? (tmpIO2[0x04] & 0x0F) : this.WaveCh2EnvelopeCounter) * (((tmpWaveBaseCount / this.WaveCh2Frequency) & 0x1F) < this.WaveCh1_2DutyData[(tmpIO2[0x04] & 0xC0) >> 6] ? 1 : -1);

	// **** CH3 ****
	var ch3freq = ((tmpIO2[0x0B] & 0x07) << 8) + tmpIO2[0x0A] + 1;
	if(this.WaveCh3LengthCounter != 0 && this.WaveCh3LinearCounter != 0 && ch3freq > 3)
		all_out += this.WaveCh3SequenceData[(tmpWaveBaseCount2 / ch3freq) & 0x1F];

	// **** CH4 ****
	var angle = (tmpWaveBaseCount / this.WaveCh4FrequencyData[tmpIO2[0x0E] & 0x0F]) | 0;
	if(angle != this.WaveCh4Angle) {
		this.WaveCh4Register = (tmpIO2[0x0E] & 0x80) == 0x80 ?
				(this.WaveCh4Register >> 1) | (((this.WaveCh4Register & 0x0040) <<  8) ^ ((this.WaveCh4Register & 0x0001) << 14)) :
				(this.WaveCh4Register >> 1) | (((this.WaveCh4Register & 0x0002) << 13) ^ ((this.WaveCh4Register & 0x0001) << 14));
		this.WaveCh4Angle = angle;
	}
	if(this.WaveCh4LengthCounter != 0 && (this.WaveCh4Register & 0x0001) == 0x0000)
		all_out += (tmpIO2[0x0C] & 0x10) == 0x10 ? (tmpIO2[0x0C] & 0x0F) : this.WaveCh4EnvelopeCounter;

	// **** CH5 ****
	if(this.WaveCh5SampleCounter != 0) {
		angle = (tmpWaveBaseCount2 / this.WaveCh5FrequencyData[tmpIO2[0x10] & 0x0F]) & 0x1F;

		if(this.WaveCh5Angle != angle) {
			var ii = this.WaveCh5Angle;
			var jj = 0;
			if(ii != -1) {
				jj = angle;
				if(jj < ii)
					jj += 32;
			}
			this.WaveCh5Angle = angle;

			for(; ii<jj; ii++){
				if((this.WaveCh5SampleCounter & 0x0007) == 0) {
					if(this.WaveCh5SampleCounter != 0){
						this.WaveCh5Register = this.ROM[(this.WaveCh5SampleAddress >> 13) + 2][this.WaveCh5SampleAddress & 0x1FFF];
						this.WaveCh5SampleAddress++;
						this.CPUClock += 4;
					}
				}

				if(this.WaveCh5SampleCounter != 0) {
					if((this.WaveCh5Register & 0x01) == 0x00) {
						if(this.WaveCh5DeltaCounter > 1)
							this.WaveCh5DeltaCounter -= 2;
					} else {
						if(this.WaveCh5DeltaCounter < 126)
							this.WaveCh5DeltaCounter += 2;
					}
					this.WaveCh5Register >>= 1;
					this.WaveCh5SampleCounter--;
				}
			}
		}

		if(this.WaveCh5SampleCounter == 0) {
			if((tmpIO2[0x10] & 0x40) == 0x40)
				this.SetCh5Delta();
			else
				this.toIRQ |= tmpIO2[0x10] & 0x80;
		}
	}
	return (all_out + this.WaveCh5DeltaCounter) << 5;
}


FC.prototype.WaveFrameSequencer = function (clock) {
	this.WaveFrameSequenceCounter += 240 * clock;
	if(this.WaveFrameSequenceCounter >= this.MainClock) {
		this.WaveFrameSequenceCounter -= this.MainClock;

		if((this.IO2[0x17] & 0x80) == 0x00) {
			this.WaveCh1_2_4_Envelope_WaveCh3_Linear();
			if(this.WaveFrameSequence == 1 || this.WaveFrameSequence == 3)
				this.WaveCh1_2_3_4_Length_WaveCh1_2_Sweep();
			if(this.WaveFrameSequence == 3 && (this.IO2[0x17] & 0x40) == 0x00) {
				this.toIRQ |= 0x40;
			}
			this.WaveFrameSequence = ++this.WaveFrameSequence & 0x03;
		} else {
			if(this.WaveFrameSequence != 4)
				this.WaveCh1_2_4_Envelope_WaveCh3_Linear();
			if(this.WaveFrameSequence == 0 || this.WaveFrameSequence == 2)
				this.WaveCh1_2_3_4_Length_WaveCh1_2_Sweep();
			this.WaveFrameSequence = ++this.WaveFrameSequence % 5;
		}
	}
}


FC.prototype.ApuRun = function () {
	this.WaveBaseCount = (this.WaveBaseCount + this.CPUClock) % this.MainClock;

	this.WaveFrameSequencer(this.CPUClock);

	this.Mapper.EXSoundSync(this.CPUClock);

	this.ApuClockCounter += this.WaveSampleRate * this.CPUClock;
	while(this.ApuClockCounter >= this.MainClock) {
		this.ApuClockCounter -= this.MainClock;
		if(this.Use_AudioContext && this.WaveOut) {
			this.WaveDatas.push(this.Mapper.OutEXSound(this.Out_Apu()));
			this.WebAudioGainNode.gain.value = this.WaveVolume;
		}
	}
}


FC.prototype.WaveCh1_2_3_4_Length_WaveCh1_2_Sweep = function () {
	var tmpIO2 = this.IO2;

	if((tmpIO2[0x00] & 0x20) == 0x00 && this.WaveCh1LengthCounter != 0) {
		if(--this.WaveCh1LengthCounter == 0)
			tmpIO2[0x15] &= 0xFE;
	}

	if((tmpIO2[0x04] & 0x20) == 0x00 && this.WaveCh2LengthCounter != 0) {
		if(--this.WaveCh2LengthCounter == 0)
			tmpIO2[0x15] &= 0xFD;
	}

	if((tmpIO2[0x08] & 0x80) == 0x00 && this.WaveCh3LengthCounter != 0) {
		if(--this.WaveCh3LengthCounter == 0)
			tmpIO2[0x15] &= 0xFB;
	}

	if((tmpIO2[0x0C] & 0x20) == 0x00 && this.WaveCh4LengthCounter != 0) {
		if(--this.WaveCh4LengthCounter == 0)
			tmpIO2[0x15] &= 0xF7;
	}

	if(++this.WaveCh1Sweep == (((tmpIO2[0x01] & 0x70) >> 4) + 1)) {
		this.WaveCh1Sweep = 0;
		if((tmpIO2[0x01] & 0x80) == 0x80 && (tmpIO2[0x01] & 0x07) != 0x00 && this.WaveCh1LengthCounter != 0) {
			if((tmpIO2[0x01] & 0x08) == 0x00)
				this.WaveCh1Frequency += this.WaveCh1Frequency >> (tmpIO2[0x01] & 0x07);
			else 
				this.WaveCh1Frequency -= this.WaveCh1Frequency >> (tmpIO2[0x01] & 0x07);

			if(this.WaveCh1Frequency < 0x08 || this.WaveCh1Frequency > 0x7FF) {
				this.WaveCh1LengthCounter = 0;
				tmpIO2[0x15] &= 0xFE;
			}
		}
	}

	if(++this.WaveCh2Sweep == (((tmpIO2[0x05] & 0x70) >> 4) + 1)) {
		this.WaveCh2Sweep = 0;
		if((tmpIO2[0x05] & 0x80) == 0x80 && (tmpIO2[0x05] & 0x07) != 0x00 && this.WaveCh2LengthCounter != 0) {
			if((tmpIO2[0x05] & 0x08) == 0x00)
				this.WaveCh2Frequency += this.WaveCh2Frequency >> (tmpIO2[0x05] & 0x07);
			else 
				this.WaveCh2Frequency -= this.WaveCh2Frequency >> (tmpIO2[0x05] & 0x07);

			if(this.WaveCh2Frequency < 0x08 || this.WaveCh2Frequency > 0x7FF) {
				this.WaveCh2LengthCounter = 0;
				tmpIO2[0x15] &= 0xFD;
			}
		}
	}
}


FC.prototype.WaveCh1_2_4_Envelope_WaveCh3_Linear = function () {
	var tmpIO2 = this.IO2;

	if((tmpIO2[0x00] & 0x10) == 0x00) {
		if(++this.WaveCh1Envelope == ((tmpIO2[0x00] & 0x0F) + 1)) {
			this.WaveCh1Envelope = 0;
			if(this.WaveCh1EnvelopeCounter == 0) {
				if((tmpIO2[0x00] & 0x20) == 0x20)
					this.WaveCh1EnvelopeCounter = 0x0F;
			} else
				this.WaveCh1EnvelopeCounter--;
		}
	}

	if((tmpIO2[0x04] & 0x10) == 0x00) {
		if(++this.WaveCh2Envelope == ((tmpIO2[0x04] & 0x0F) + 1)) {
			this.WaveCh2Envelope = 0;
			if(this.WaveCh2EnvelopeCounter == 0) {
				if((tmpIO2[0x04] & 0x20) == 0x20)
					this.WaveCh2EnvelopeCounter = 0x0F;
			} else
				this.WaveCh2EnvelopeCounter--;
		}
	}

	if((tmpIO2[0x0C] & 0x10) == 0x00) {
		if(++this.WaveCh4Envelope == ((tmpIO2[0x0C] & 0x0F) + 1)) {
			this.WaveCh4Envelope = 0;
			if(this.WaveCh4EnvelopeCounter == 0) {
				if((tmpIO2[0x0C] & 0x20) == 0x20)
					this.WaveCh4EnvelopeCounter = 0x0F;
			} else
				this.WaveCh4EnvelopeCounter--;
		}
	}

	if((tmpIO2[0x08] & 0x80) == 0x00 && this.WaveCh3LinearCounter != 0)
		this.WaveCh3LinearCounter--;
}


/* **** EX Sound **** */
FC.prototype.EXSoundInit = function () {
	this.Init_FDS();
	this.Init_MMC5();
	this.Init_VRC6();
	this.Init_N163();
	this.Init_AY();
}


/* FDS */
FC.prototype.Init_FDS = function () {
	for(var i=0; i<this.FDS_WAVE_REG.length; i++)
		this.FDS_WAVE_REG[i] = 0x00;
	for(var i=0; i<this.FDS_LFO_REG.length; i++)
		this.FDS_LFO_REG[i] = 0x00;
	for(var i=0; i<this.FDS_REG.length; i++)
		this.FDS_REG[i] = 0x00;

	this.FDS_WaveIndexCounter = 0;
	this.FDS_WaveIndex = 0;

	this.FDS_LFOIndexCounter = 0;
	this.FDS_LFOIndex = 0;
	this.FDS_REGAddress = 0;

	this.FDS_VolumeEnvCounter = 0;
	this.FDS_VolumeEnv = 0;

	this.FDS_SweepEnvCounter = 0;
	this.FDS_SweepEnv = 0;
	this.FDS_SweepBias = 0;

	this.FDS_Volume = 0;
}


FC.prototype.Write_FDS_WAVE_REG = function (no, data) {
	if((this.FDS_REG[9] & 0x80) != 0x80)
		return;
	this.FDS_WAVE_REG[no] = data & 0x3F;
}


FC.prototype.Write_FDS_REG = function (no, data) {
	this.FDS_REG[no] = data;
	switch(no) {
		case 0:
			if((data & 0x80) == 0x80)
				this.FDS_VolumeEnv = data & 0x3F;

			this.FDS_VolumeEnvCounter = 0;
			break;
		case 3:
			if((data & 0x80) == 0x80)
				this.FDS_WaveIndex = 0;
			break;
		case 4:
			if((data & 0x80) == 0x80)
				this.FDS_SweepEnv = data & 0x3F;

			this.FDS_SweepEnvCounter = 0;
			break;
		case 5:
			this.FDS_SweepBias = data & 0x7F;
			if(this.FDS_SweepBias >= 0x40)
				this.FDS_SweepBias = this.FDS_SweepBias - 0x80;
			this.FDS_REGAddress = 0;
			break;
		case 7:
			this.FDS_LFOIndexCounter = 0;
			this.FDS_LFOIndex = 0;
			break;
		case 8:
			if((this.FDS_REG[7] & 0x80) == 0x80) {
				this.FDS_LFO_REG[this.FDS_REGAddress] = data & 0x07;
				this.FDS_REGAddress = (this.FDS_REGAddress + 1) & 0x1F;
			}
			break;
	}
}


FC.prototype.Count_FDS = function (clock) {
	if((this.FDS_REG[3] & 0x40) != 0x40) {
		if((this.FDS_REG[0] & 0xC0) < 0x80) {
			var c = this.FDS_REG[10] * ((this.FDS_REG[0] & 0x3F) + 1) * 8;
			if(c > 0) {
				this.FDS_VolumeEnvCounter += clock;
				while(this.FDS_VolumeEnvCounter >= c) {
					this.FDS_VolumeEnvCounter -= c;

					if((this.FDS_REG[0] & 0x40) == 0x00) {
						if(this.FDS_VolumeEnv > 0)
							this.FDS_VolumeEnv--;
					} else {
						if(this.FDS_VolumeEnv < 0x20)
							this.FDS_VolumeEnv++;
					}
				}

			}
		}

		if((this.FDS_REG[4] & 0xC0) < 0x80) {
			var c = this.FDS_REG[10] * ((this.FDS_REG[4] & 0x3F) + 1) * 8;
			if(c > 0) {
				this.FDS_SweepEnvCounter += clock;
				while(this.FDS_SweepEnvCounter >= c) {
					this.FDS_SweepEnvCounter -= c;

					if((this.FDS_REG[4] & 0x40) == 0x00) {
						if(this.FDS_SweepEnv > 0)
							this.FDS_SweepEnv--;
					} else {
						if(this.FDS_SweepEnv < 0x3F)
							this.FDS_SweepEnv++;
					}
				}

			}
		}
	}

	var f;
	if((this.FDS_REG[7] & 0x80) != 0x80) {
		f = this.FDS_REG[6] | ((this.FDS_REG[7] & 0x0F) << 8);
		this.FDS_LFOIndexCounter += f * clock;
		while(this.FDS_LFOIndexCounter >= 65536) {
			this.FDS_LFOIndexCounter -= 65536;

			var lfo = this.FDS_LFO_REG[this.FDS_LFOIndex >> 1];
			this.FDS_SweepBias += this.FDS_LFO_DATA[lfo];
			if(lfo == 4)
				this.FDS_SweepBias = 0;

			if(this.FDS_SweepBias > 63)
				this.FDS_SweepBias -= 128;
			else if(this.FDS_SweepBias < -64)
				this.FDS_SweepBias += 128;

			this.FDS_LFOIndex += 1;
			if(this.FDS_LFOIndex > 0x3F) {
				this.FDS_LFOIndex = 0;
			}
		}
	}

	var tmp = this.FDS_SweepBias * this.FDS_SweepEnv;
	var rem = tmp & 0x0F;
	tmp >>= 4;
	if(rem > 0) {
		if(this.FDS_SweepBias < 0)
			tmp -= 1;
		else
			tmp += 2;
	}

	if(tmp >= 192)
		tmp -= 256;
	else if(tmp < -64)
		tmp += 256;
	f = this.FDS_REG[2] | ((this.FDS_REG[3] & 0x0F) << 8);
	tmp = f * tmp;
	tmp >>= 6;
	f = f + tmp;

	this.FDS_WaveIndexCounter += f * clock;
	this.FDS_WaveIndex += this.FDS_WaveIndexCounter >> 16;
	this.FDS_WaveIndexCounter &= 0xFFFF;
	if(this.FDS_WaveIndex > 0x3F) {
		this.FDS_WaveIndex &= 0x3F;
		this.FDS_Volume = this.FDS_VolumeEnv;
	}
}


FC.prototype.Out_FDS = function () {
	if((this.FDS_REG[3] & 0x80) != 0x80)
		return ((this.FDS_WAVE_REG[this.FDS_WaveIndex] - 32) * this.FDS_Volume) >> 1;
	return 0;
}


/* MMC5 */
FC.prototype.Init_MMC5 = function () {
	this.MMC5_FrameSequenceCounter = 0;
	this.MMC5_FrameSequence = 0;
	for(var i=0; i<this.MMC5_REG.length; i++)
		this.MMC5_REG[i] = 0x00;
	this.MMC5_Ch[0] = {"LengthCounter": 0, "Envelope": 0, "EnvelopeCounter": 0, "Sweep": 0, "Frequency": 0};
	this.MMC5_Ch[1] = {"LengthCounter": 0, "Envelope": 0, "EnvelopeCounter": 0, "Sweep": 0, "Frequency": 0};
}


FC.prototype.Write_MMC5_ChLength0 = function (ch) {
	var tmp = ch << 2;
	this.MMC5_Ch[ch].Frequency = ((this.MMC5_REG[tmp + 0x03] & 0x07) << 8) + this.MMC5_REG[tmp + 0x02] + 1;
}


FC.prototype.Write_MMC5_ChLength1 = function (ch) {
	var tmp = ch << 2;
	this.MMC5_Ch[ch].LengthCounter = this.WaveLengthCount[this.MMC5_REG[tmp + 0x03] >> 3];
	this.MMC5_Ch[ch].Envelope = 0;
	this.MMC5_Ch[ch].EnvelopeCounter = 0x0F;
	this.MMC5_Ch[ch].Sweep = 0;
	this.MMC5_Ch[ch].Frequency = ((this.MMC5_REG[tmp + 0x03] & 0x07) << 8) + this.MMC5_REG[tmp + 0x02] + 1;
}


FC.prototype.Write_MMC5_REG = function (no, data) {
	this.MMC5_REG[no] = data;

	switch(no) {
		case 0x02:
			this.Write_MMC5_ChLength0(0);
			break;
		case 0x03:
			this.Write_MMC5_ChLength1(0);
			break;
		case 0x06:
			this.Write_MMC5_ChLength0(1);
			break;
		case 0x07:
			this.Write_MMC5_ChLength1(1);
			break;
		case 0x015:
			for(var i=0; i<2; i++) {
				if((this.MMC5_REG[0x15] & (0x01 << i)) == 0x00)
					this.MMC5_Ch[i].LengthCounter = 0;
			}
			break;
	}
}


FC.prototype.Read_MMC5_REG = function (no) {
	if(no == 0x15) {
		var tmp =0;
		for(var i=0; i<2; i++) {
		if(this.MMC5_Ch[i].LengthCounter != 0)
			tmp |= 0x01 << i;
		}
	}
}


FC.prototype.Count_MMC5 = function (clock) {
	this.MMC5_FrameSequenceCounter += 240 * clock;
	if(this.MMC5_FrameSequenceCounter >= this.MainClock) {
		this.MMC5_FrameSequenceCounter -= this.MainClock;

		for(var i=0; i<2; i++) {
			var tmp = i << 2;
			if((this.MMC5_REG[tmp] & 0x10) == 0x00) {
				if(++this.MMC5_Ch[i].Envelope == ((this.MMC5_REG[tmp] & 0x0F) + 1)) {
					this.MMC5_Ch[i].Envelope = 0;
					if(this.MMC5_Ch[i].EnvelopeCounter == 0) {
						if((this.MMC5_REG[tmp] & 0x20) == 0x20)
							this.MMC5_Ch[i].EnvelopeCounter = 0x0F;
					} else
						this.MMC5_Ch[i].EnvelopeCounter--;
				}
			}
		}

		if(this.MMC5_FrameSequence == 1 || this.MMC5_FrameSequence == 3) {
			for(var i=0; i<2; i++) {
				var tmp = i << 2;

				if((this.MMC5_REG[tmp] & 0x20) == 0x00 && this.MMC5_Ch[i].LengthCounter != 0) {
					if(--this.MMC5_Ch[i].LengthCounter == 0)
						this.MMC5_REG[0x15] &= ~(0x01 << i);
				}

				if(++this.MMC5_Ch[i].Sweep == (((this.MMC5_REG[tmp + 0x01] & 0x70) >> 4) + 1)) {
					this.MMC5_Ch[i].Sweep = 0;
					if((this.MMC5_REG[tmp + 0x01] & 0x80) == 0x80 && (this.MMC5_REG[tmp + 0x01] & 0x07) != 0x00 && this.MMC5_Ch[i].LengthCounter != 0) {
						if((this.MMC5_REG[tmp + 0x01] & 0x08) == 0x00)
							this.MMC5_Ch[i].Frequency += this.MMC5_Ch[i].Frequency >> (this.MMC5_REG[tmp + 0x01] & 0x07);
						else 
							this.MMC5_Ch[i].Frequency -= this.MMC5_Ch[i].Frequency >> (this.MMC5_REG[tmp + 0x01] & 0x07);

						if(this.MMC5_Ch[i].Frequency < 0x08 || this.MMC5_Ch[i].Frequency > 0x7FF) {
							this.MMC5_Ch[i].LengthCounter = 0;
							this.MMC5_REG[0x15] &= ~(0x01 << i);
						}
					}
				}
			}
		}

		this.MMC5_FrameSequence = ++this.MMC5_FrameSequence & 0x03;
	}
}


FC.prototype.Out_MMC5 = function () {
	var all_out = 0;
	var tmpWaveBaseCount = this.WaveBaseCount << 1;

	for(var i=0; i<2; i++) {
		var tmp = i << 2;
		if(this.MMC5_Ch[i].LengthCounter != 0 && this.MMC5_Ch[i].Frequency > 3)
			all_out += ((this.MMC5_REG[tmp] & 0x10) == 0x10 ? (this.MMC5_REG[tmp] & 0x0F) : this.MMC5_Ch[i].EnvelopeCounter) * (((tmpWaveBaseCount / this.MMC5_Ch[i].Frequency) & 0x1F) < this.WaveCh1_2DutyData[(this.MMC5_REG[tmp] & 0xC0) >> 6] ? 1 : -1);
	}

	all_out += (this.MMC5_REG[0x11] >> 2) - 16;
	return all_out << 5;
}


/* VRC6 */
FC.prototype.Init_VRC6 = function () {
	for(var i=0; i<this.VRC6_REG.length; i++)
		this.VRC6_REG[i] = 0x00;
	this.VRC6_Ch3_Counter = 0;
	this.VRC6_Ch3_index = 0;
}


FC.prototype.Write_VRC6_REG = function (no, data) {
	this.VRC6_REG[no] = data;
}


FC.prototype.Count_VRC6 = function (clock) {
	var chfreq = (((this.VRC6_REG[10] & 0x0F) << 8) | this.VRC6_REG[9]) + 1;
	this.VRC6_Ch3_Counter += clock;
	this.VRC6_Ch3_index += (this.VRC6_Ch3_Counter / chfreq) | 0;
	this.VRC6_Ch3_index %= 14;
	this.VRC6_Ch3_Counter %= chfreq;
}


FC.prototype.Out_VRC6 = function () {
	var all_out = 0;
	var tmpWaveBaseCount = this.WaveBaseCount;

	// **** CH1-2 ****
	for(var i=0; i<8; i+=4) {
		if((this.VRC6_REG[i + 2] & 0x80) == 0x80) {
			if((this.VRC6_REG[i + 0] & 0x80) == 0x00) {
				var chfreq = ((this.VRC6_REG[i + 2] & 0x0F) << 8) | this.VRC6_REG[i + 1];
				var duty = (this.VRC6_REG[i + 0] & 0x70) >>> 4;
				all_out += (this.VRC6_REG[i + 0] & 0x0F) * (((tmpWaveBaseCount / chfreq) & 0x0F) < duty ? 1 : -1);
			} else
				all_out += this.VRC6_REG[i + 0] & 0x0F;
		}
	}

	// **** CH3 ****
	if((this.VRC6_REG[10] & 0x80) == 0x80)
		all_out += (((this.VRC6_Ch3_index >>> 1) * (this.VRC6_REG[8] & 0x3F)) >>> 3) - 16;

	return all_out << 5;
}


/* N163 */
FC.prototype.Init_N163 = function () {
	for(var i=0; i<this.N163_RAM.length; i++)
		this.N163_RAM[i] = 0x00;
	for(var i=0; i<this.N163_ch_data.length; i++)
		this.N163_ch_data[i] = {"Freq" : 0, "Phase" : 0, "Length" : 0, "Address" : 0, "Vol" : 0};
	this.N163_Address = 0x00;
	this.N163_ch = 0;
	this.N163_Clock = 0;
}


FC.prototype.Write_N163_RAM = function (data) {
	var address = this.N163_Address & 0x7F;
	this.N163_RAM[address] = data;

	if(address >= 0x40) {
		var ch = (address >>> 3) & 0x07;
		switch(address & 0x07) {
			case 0x00:
				this.N163_ch_data[ch].Freq = (this.N163_ch_data[ch].Freq & 0x3FF00) | data;
				break;
			case 0x01:
				this.N163_ch_data[ch].Phase = (this.N163_ch_data[ch].Freq & 0xFFFF00) | data;
				break;
			case 0x02:
				this.N163_ch_data[ch].Freq = (this.N163_ch_data[ch].Freq & 0x300FF) | (data << 8);
				break;
			case 0x03:
				this.N163_ch_data[ch].Phase = (this.N163_ch_data[ch].Freq & 0xFF00FF) | (data << 8);
				break;
			case 0x04:
				this.N163_ch_data[ch].Freq = (this.N163_ch_data[ch].Freq & 0x0FFFF) | ((data & 0x03) << 16);
				this.N163_ch_data[ch].Length = (256 - (data & 0xFC)) << 16;
				break;
			case 0x05:
				this.N163_ch_data[ch].Phase = (this.N163_ch_data[ch].Freq & 0x00FFFF) | (data << 16);
				break;
			case 0x06:
				this.N163_ch_data[ch].Address = data;
				break;
			case 0x07:
				this.N163_ch_data[ch].Vol = data & 0x0F;
				if(address == 0x7F)
					this.N163_ch = (data >>> 4) & 0x07;
				break;
		}
	}

	if((this.N163_Address & 0x80) == 0x80)
		this.N163_Address = ((this.N163_Address & 0x7F) + 1) | 0x80;
}


FC.prototype.Read_N163_RAM = function () {
	var ret = this.N163_RAM[this.N163_Address & 0x7F];
	if((this.N163_Address & 0x80) == 0x80)
		this.N163_Address = ((this.N163_Address & 0x7F) + 1) | 0x80;
	return ret;
}


FC.prototype.Count_N163 = function (clock) {
	this.N163_Clock += clock;
	var cl = (this.N163_ch + 1) * 15;
	while(this.N163_Clock >= cl) {
		this.N163_Clock -= cl;
		for(var i=7-this.N163_ch; i<8; i++) {
			if(this.N163_ch_data[i].Length > 0)
				this.N163_ch_data[i].Phase = (this.N163_ch_data[i].Phase + this.N163_ch_data[i].Freq) % this.N163_ch_data[i].Length;
		}
	}
}


FC.prototype.Out_N163 = function () {
	var all_out = 0;

	for(var i=7-this.N163_ch; i<8; i++) {
		var addr = (this.N163_ch_data[i].Address + (this.N163_ch_data[i].Phase >> 16)) & 0xFF;
		var data = this.N163_RAM[addr >>> 1];
		data = (addr & 0x01) == 0x00 ? (data & 0x0F) : (data >>> 4);
		all_out += (data - 8) * this.N163_ch_data[i].Vol;
	}
	return all_out << 2;
}


/* AY-3-8910 */
FC.prototype.Init_AY = function () {
	this.AY_ClockCounter = 0;
	for(var i=0; i<this.AY_REG.length; i++)
		this.AY_REG[i] = 0x00;
	this.AY_Noise_Seed = 0x0001;
	this.AY_Noise_Angle = 0;
	this.AY_Env_Counter = 0;
	this.AY_Env_Index = 0;
	this.AY_REG_Select = 0x00;
}


FC.prototype.Select_AY_REG = function (data) {
	this.AY_REG_Select = data & 0x0F;
}


FC.prototype.Write_AY_REG = function (data) {
	this.AY_REG[this.AY_REG_Select] = data;

	if(this.AY_REG_Select == 13)
		this.AY_Env_Index = 0;
}


FC.prototype.Read_AY_REG = function () {return 0;
	return this.AY_REG[this.AY_REG_Select];
}


FC.prototype.Count_AY = function (clock) {
	this.AY_Env_Counter += clock;
	var ef = (((this.AY_REG[12] << 8) | this.AY_REG[11]) + 1) * 8;
	var envtmp = (this.AY_Env_Counter / ef) | 0;
	this.AY_Env_Counter %= ef;

	this.AY_Env_Index += envtmp;
	if(this.AY_Env_Index >= 48)
		this.AY_Env_Index = ((this.AY_Env_Index - 48) % 32) + 32;
}


FC.prototype.Out_AY = function () {
	var tmpWaveBaseCount = this.WaveBaseCount;
	var all_out = 0;

	var noiseout = (this.AY_Noise_Seed & 0x0001) == 0x0001 ? 1 : -1;
	var angle = (tmpWaveBaseCount / (((this.AY_REG[5] & 0x1F) + 1) * 32)) | 0;
	if(angle != this.AY_Noise_Angle) {
		this.AY_Noise_Seed = (this.AY_Noise_Seed >>> 1) | (((this.AY_Noise_Seed & 0x0001) << 15) ^ ((this.AY_Noise_Seed & 0x0008) << 12));
		this.AY_Noise_Angle = angle;
	}

	for(var i=0; i<3; i++) {
		var vol = (this.AY_REG[8 + i] & 0x10) == 0x00 ? (this.AY_REG[8 + i] & 0x0F) : this.AY_Env_Pattern[this.AY_REG[13] & 0x0F][this.AY_Env_Index];
		vol = this.AY_Env_Volume[vol];

		if(((this.AY_REG[7] >> i) & 0x01) == 0x00) {
			var f = (((this.AY_REG[i * 2 + 1] & 0x0F) << 8) | this.AY_REG[i * 2]) + 1;
			if(f > 1)
				all_out += vol * (((tmpWaveBaseCount / f) & 0x1F) < 0x10 ? 1 : -1);
			else
				all_out += vol;
		}

		if(((this.AY_REG[7] >> i) & 0x08) == 0x00)
			all_out += vol * noiseout;
	}
	return all_out;
}


/* **** FC Mapper **** */
/**** MapperProto ****/
FC.prototype.MapperProto = function(core) {
	this.Core = core;
	this.MAPPER_REG = null;
}

FC.prototype.MapperProto.prototype.Init = function() {
}

FC.prototype.MapperProto.prototype.ReadLow = function(address) {
	return 0x40;
}

FC.prototype.MapperProto.prototype.WriteLow = function(address, data) {
}

FC.prototype.MapperProto.prototype.ReadPPUData = function () {
	return this.Core.ReadPPUData_SUB();
}

FC.prototype.MapperProto.prototype.WritePPUData = function (value) {
	this.Core.WritePPUData_SUB(value);
}

FC.prototype.MapperProto.prototype.BuildBGLine = function () {
	this.Core.BuildBGLine_SUB();
}

FC.prototype.MapperProto.prototype.BuildSpriteLine = function () {
	this.Core.BuildSpriteLine_SUB();
}

FC.prototype.MapperProto.prototype.ReadSRAM = function(address) {
	return this.Core.SRAM[address & 0x1FFF];
}

FC.prototype.MapperProto.prototype.WriteSRAM = function(address, data) {
	this.Core.SRAM[address & 0x1FFF] = data;
}

FC.prototype.MapperProto.prototype.Write = function(address, data) {
}

FC.prototype.MapperProto.prototype.HSync = function(y) {
}

FC.prototype.MapperProto.prototype.CPUSync = function(clock) {
}

FC.prototype.MapperProto.prototype.SetIRQ = function() {
	this.Core.toIRQ |= 0x04;
}

FC.prototype.MapperProto.prototype.ClearIRQ = function() {
	this.Core.toIRQ &= ~0x04;
}

FC.prototype.MapperProto.prototype.OutEXSound = function(soundin) {
	return soundin;
}

FC.prototype.MapperProto.prototype.EXSoundSync = function(clock) {
}

FC.prototype.MapperProto.prototype.OutSRAM = function() {
	var ret = "";
	for(var i=0; i<this.Core.SRAM.length; i++) {
		ret += (this.Core.SRAM[i] < 0x10 ? "0" : "") + this.Core.SRAM[i].toString(16);
	}
	return ret.toUpperCase();
}

FC.prototype.MapperProto.prototype.InSRAM = function(sram) {
	for(var i=0; i<this.Core.SRAM.length; i++)
		this.Core.SRAM[i] = 0x00;

	try{
		for(var i=0; i<(this.Core.SRAM.length * 2) && i<sram.length; i+=2)
			this.Core.SRAM[i / 2] = parseInt(sram.substr(i, 2), 16);
	} catch(e) {
		return false;
	}
	return true;
}

FC.prototype.MapperProto.prototype.GetState = function() {
	if(this.MAPPER_REG == null)
		return;

	this.Core.StateData.Mapper = new Object();
	this.Core.StateData.Mapper.MAPPER_REG = this.MAPPER_REG.slice(0);
}

FC.prototype.MapperProto.prototype.SetState = function() {
	if(this.MAPPER_REG == null)
		return;

	for(var i=0; i<this.Core.StateData.Mapper.MAPPER_REG.length; i++)
		this.MAPPER_REG[i] = this.Core.StateData.Mapper.MAPPER_REG[i];
}


/**** Mapper0 ****/
FC.prototype.Mapper0 = function(core) {
	FC.prototype.MapperProto.apply(this, arguments);
}

FC.prototype.Mapper0.prototype = Object.create(FC.prototype.MapperProto.prototype);

FC.prototype.Mapper0.prototype.Init = function() {
	this.Core.SetPrgRomPage(0, 0);
	this.Core.SetPrgRomPage(1, this.Core.PrgRomPageCount - 1);
	this.Core.SetChrRomPage(0);
}


/**** Mapper1 ****/
FC.prototype.Mapper1 = function(core) {
	FC.prototype.MapperProto.apply(this, arguments);
	this.MAPPER_REG = new Array(16);
}

FC.prototype.Mapper1.prototype = Object.create(FC.prototype.MapperProto.prototype);

FC.prototype.Mapper1.prototype.Init = function() {
	var i;
	for(i=0; i<this.MAPPER_REG.length; i++)
		this.MAPPER_REG[i] = 0;

	this.MAPPER_REG[13] = 0;
	this.MAPPER_REG[14] = 0x00;
	this.MAPPER_REG[0] = 0x0C;
	this.MAPPER_REG[1] = 0x00;
	this.MAPPER_REG[2] = 0x00;
	this.MAPPER_REG[3] = 0x00;

	if(this.Core.PrgRomPageCount == 64) {
		this.MAPPER_REG[10] = 2;
	} else if(this.Core.PrgRomPageCount == 32) {
		this.MAPPER_REG[10] = 1;
	} else {
		this.MAPPER_REG[10] = 0;
	}
	this.MAPPER_REG[11] = 0;
	this.MAPPER_REG[12] = 0;

	if(this.MAPPER_REG[10] == 0) {
		this.MAPPER_REG[8] = this.Core.PrgRomPageCount * 2 - 2;
		this.MAPPER_REG[9] = this.Core.PrgRomPageCount * 2 - 1;
	} else {
		this.MAPPER_REG[8] = 30;
		this.MAPPER_REG[9] = 31;
	}

	this.MAPPER_REG[4] = 0;
	this.MAPPER_REG[5] = 1;
	this.MAPPER_REG[6] = this.MAPPER_REG[8];
	this.MAPPER_REG[7] = this.MAPPER_REG[9];

	this.Core.SetPrgRomPages8K(this.MAPPER_REG[4], this.MAPPER_REG[5], this.MAPPER_REG[6], this.MAPPER_REG[7]);
}

FC.prototype.Mapper1.prototype.Write = function(address, data) {
	var reg_num;

	if((address & 0x6000) != (this.MAPPER_REG[15] & 0x6000)) {
		this.MAPPER_REG[13] = 0;
		this.MAPPER_REG[14] = 0x00;
	}
	this.MAPPER_REG[15] = address;

	if((data & 0x80) != 0) {
		this.MAPPER_REG[13] = 0;
		this.MAPPER_REG[14] = 0x00;
		return;
	}

	if((data & 0x01) != 0)
		this.MAPPER_REG[14] |= (1 << this.MAPPER_REG[13]);
		this.MAPPER_REG[13]++;
	if(this.MAPPER_REG[13] < 5)
		return;

	reg_num = (address & 0x7FFF) >> 13;
	this.MAPPER_REG[reg_num] = this.MAPPER_REG[14];

	this.MAPPER_REG[13] = 0;
	this.MAPPER_REG[14] = 0x00;

	var bank_num;

	switch (reg_num) {
		case 0 :
			if((this.MAPPER_REG[0] & 0x02) != 0) {
				if((this.MAPPER_REG[0] & 0x01) != 0) {
					this.Core.SetMirror(true);
				} else {
					this.Core.SetMirror(false);
				}
			} else {
				if((this.MAPPER_REG[0] & 0x01) != 0) {
					this.Core.SetMirrors(1, 1, 1, 1);
				} else {
					this.Core.SetMirrors(0, 0, 0, 0);
				}
			}
			break;

		case 1 :
			bank_num = this.MAPPER_REG[1];
			if(this.MAPPER_REG[10] == 2) {
				if((this.MAPPER_REG[0] & 0x10) != 0) {
					if(this.MAPPER_REG[12] != 0) {
						this.MAPPER_REG[11] = (this.MAPPER_REG[1] & 0x10) >> 4;
						if((this.MAPPER_REG[0] & 0x08) != 0) {
							this.MAPPER_REG[11] |= ((this.MAPPER_REG[2] & 0x10) >> 3);
						}
						this.SetPrgRomPages8K_Mapper01();
						this.MAPPER_REG[12] = 0;
					} else {
						this.MAPPER_REG[12] = 1;
					}
				} else {
					this.MAPPER_REG[11] = (this.MAPPER_REG[1] & 0x10) != 0 ? 3 : 0;
					this.SetPrgRomPages8K_Mapper01();
				}
			} else if((this.MAPPER_REG[10] == 1) && (this.Core.ChrRomPageCount == 0)) {
				this.MAPPER_REG[11] = (this.MAPPER_REG[1] & 0x10) >> 4;
				this.SetPrgRomPages8K_Mapper01();
			} else if(this.Core.ChrRomPageCount != 0) {
    				if((this.MAPPER_REG[0] & 0x10) != 0) {
					bank_num <<= 2;
					this.Core.SetChrRomPage1K(0, bank_num + 0);
					this.Core.SetChrRomPage1K(1, bank_num + 1);
					this.Core.SetChrRomPage1K(2, bank_num + 2);
					this.Core.SetChrRomPage1K(3, bank_num + 3);
				} else {
					bank_num <<= 2;
					this.Core.SetChrRomPages1K(bank_num + 0, bank_num + 1, bank_num + 2, bank_num + 3,
								 bank_num + 4, bank_num + 5, bank_num + 6, bank_num + 7);
				}
			} else {
				if((this.MAPPER_REG[0] & 0x10) != 0) {
					bank_num <<= 2;
					this.Core.VRAM[0] = this.Core.VRAMS[bank_num + 0];
					this.Core.VRAM[1] = this.Core.VRAMS[bank_num + 1];
					this.Core.VRAM[2] = this.Core.VRAMS[bank_num + 2];
					this.Core.VRAM[3] = this.Core.VRAMS[bank_num + 3];
				}
			}
	                break;

		case 2 :
			bank_num = this.MAPPER_REG[2];

			if((this.MAPPER_REG[10] == 2) && (this.MAPPER_REG[0] & 0x08) != 0) {
				if(this.MAPPER_REG[12] != 0) {
					this.MAPPER_REG[11] = (this.MAPPER_REG[1] & 0x10) >> 4;
					this.MAPPER_REG[11] |= ((this.MAPPER_REG[2] & 0x10) >> 3);
					this.SetPrgRomPages8K_Mapper01();
					this.MAPPER_REG[12] = 0;
				} else {
					this.MAPPER_REG[12] = 1;
				}
			}

			if(this.Core.ChrRomPageCount == 0) {
				if((this.MAPPER_REG[0] & 0x10) != 0) {
					bank_num <<= 2;
					this.Core.VRAM[4] = this.Core.VRAMS[bank_num + 0];
					this.Core.VRAM[5] = this.Core.VRAMS[bank_num + 1];
					this.Core.VRAM[6] = this.Core.VRAMS[bank_num + 2];
					this.Core.VRAM[7] = this.Core.VRAMS[bank_num + 3];
					break;
				}
			}

			if((this.MAPPER_REG[0] & 0x10) != 0) {
					bank_num <<= 2;
					this.Core.SetChrRomPage1K(4, bank_num + 0);
					this.Core.SetChrRomPage1K(5, bank_num + 1);
					this.Core.SetChrRomPage1K(6, bank_num + 2);
					this.Core.SetChrRomPage1K(7, bank_num + 3);
			}
			break;


		case 3 :
			bank_num = this.MAPPER_REG[3];

			if((this.MAPPER_REG[0] & 0x08) != 0) {
				bank_num <<= 1;

				if((this.MAPPER_REG[0] & 0x04) != 0) {
					this.MAPPER_REG[4] = bank_num;
					this.MAPPER_REG[5] = bank_num + 1;
					this.MAPPER_REG[6] = this.MAPPER_REG[8];
					this.MAPPER_REG[7] = this.MAPPER_REG[9];
				} else {
					if(this.MAPPER_REG[10] == 0) {
						this.MAPPER_REG[4] = 0;
						this.MAPPER_REG[5] = 1;
						this.MAPPER_REG[6] = bank_num;
						this.MAPPER_REG[7] = bank_num + 1;
					}
				}
			} else {
	                        bank_num <<= 1;
				this.MAPPER_REG[4] = bank_num;
				this.MAPPER_REG[5] = bank_num + 1;
				if(this.MAPPER_REG[10] == 0) {
					this.MAPPER_REG[6] = bank_num + 2;
					this.MAPPER_REG[7] = bank_num + 3;
				}
			}

			this.SetPrgRomPages8K_Mapper01();
			break;
	}
}

FC.prototype.Mapper1.prototype.SetPrgRomPages8K_Mapper01 = function (){
	this.Core.SetPrgRomPage8K(0, (this.MAPPER_REG[11] << 5) + (this.MAPPER_REG[4] & 31));
	this.Core.SetPrgRomPage8K(1, (this.MAPPER_REG[11] << 5) + (this.MAPPER_REG[5] & 31));
	this.Core.SetPrgRomPage8K(2, (this.MAPPER_REG[11] << 5) + (this.MAPPER_REG[6] & 31));
	this.Core.SetPrgRomPage8K(3, (this.MAPPER_REG[11] << 5) + (this.MAPPER_REG[7] & 31));
}


/**** Mapper2 ****/
FC.prototype.Mapper2 = function(core) {
	FC.prototype.MapperProto.apply(this, arguments);
}

FC.prototype.Mapper2.prototype = Object.create(FC.prototype.MapperProto.prototype);

FC.prototype.Mapper2.prototype.Init = function() {
	this.Core.SetPrgRomPage(0, 0);
	this.Core.SetPrgRomPage(1, this.Core.PrgRomPageCount - 1);
	this.Core.SetChrRomPage(0);
}

FC.prototype.Mapper2.prototype.Write = function(address, data) {
	this.Core.SetPrgRomPage(0, data);
}


/**** Mapper3 ****/
FC.prototype.Mapper3 = function(core) {
	FC.prototype.MapperProto.apply(this, arguments);
}

FC.prototype.Mapper3.prototype = Object.create(FC.prototype.MapperProto.prototype);

FC.prototype.Mapper3.prototype.Init = function() {
	this.Core.SetPrgRomPage(0, 0);
	this.Core.SetPrgRomPage(1, this.Core.PrgRomPageCount - 1);
	this.Core.SetChrRomPage(0);
}

FC.prototype.Mapper3.prototype.Write = function(address, data) {
	this.Core.SetChrRomPage(data & 0x0F);
}


/**** Mapper4 ****/
FC.prototype.Mapper4 = function(core) {
	FC.prototype.MapperProto.apply(this, arguments);
	this.MAPPER_REG = new Array(20);
}

FC.prototype.Mapper4.prototype = Object.create(FC.prototype.MapperProto.prototype);

FC.prototype.Mapper4.prototype.Init = function() {
	var i;
	for(i=0; i<this.MAPPER_REG.length; i++)
		this.MAPPER_REG[i] = 0;

	this.MAPPER_REG[16] = 0;
	this.MAPPER_REG[17] = 1;
	this.MAPPER_REG[18] = (this.Core.PrgRomPageCount - 1) * 2;
	this.MAPPER_REG[19] = (this.Core.PrgRomPageCount - 1) * 2 + 1;
	this.Core.SetPrgRomPages8K(this.MAPPER_REG[16], this.MAPPER_REG[17], this.MAPPER_REG[18], this.MAPPER_REG[19]);

	this.MAPPER_REG[8] = 0;
	this.MAPPER_REG[9] = 1;
	this.MAPPER_REG[10] = 2;
	this.MAPPER_REG[11] = 3;
	this.MAPPER_REG[12] = 4;
	this.MAPPER_REG[13] = 5;
	this.MAPPER_REG[14] = 6;
	this.MAPPER_REG[15] = 7;
	this.Core.SetChrRomPages1K(this.MAPPER_REG[8], this.MAPPER_REG[9], this.MAPPER_REG[10], this.MAPPER_REG[11],
				this.MAPPER_REG[12], this.MAPPER_REG[13], this.MAPPER_REG[14], this.MAPPER_REG[15]);
}

FC.prototype.Mapper4.prototype.Write = function(address, data) {
	switch (address & 0xE001) {
		case 0x8000:
			this.MAPPER_REG[0] = data;
			if((data & 0x80) == 0x80) {
				this.Core.SetChrRomPages1K(this.MAPPER_REG[12], this.MAPPER_REG[13], this.MAPPER_REG[14], this.MAPPER_REG[15], 
							this.MAPPER_REG[8], this.MAPPER_REG[9], this.MAPPER_REG[10], this.MAPPER_REG[11]); 
			} else {
				this.Core.SetChrRomPages1K(this.MAPPER_REG[8], this.MAPPER_REG[9], this.MAPPER_REG[10], this.MAPPER_REG[11], 
							this.MAPPER_REG[12], this.MAPPER_REG[13], this.MAPPER_REG[14], this.MAPPER_REG[15]); 
			}

			if((data & 0x40) == 0x40) {
				this.Core.SetPrgRomPages8K(this.MAPPER_REG[18], this.MAPPER_REG[17], this.MAPPER_REG[16],this.MAPPER_REG[19]);
			} else {
				this.Core.SetPrgRomPages8K(this.MAPPER_REG[16], this.MAPPER_REG[17], this.MAPPER_REG[18],this.MAPPER_REG[19]);
			}
			break;
		case 0x8001:
			this.MAPPER_REG[1] = data;
			switch (this.MAPPER_REG[0] & 0x07) {
				case 0:
					data &= 0xFE;
					this.MAPPER_REG[8] = data;
					this.MAPPER_REG[9] = data + 1;
					break;
				case 1:
					data &= 0xFE;
					this.MAPPER_REG[10] = data;
					this.MAPPER_REG[11] = data + 1;
					break;
				case 2:
					this.MAPPER_REG[12] = data;
					break;
				case 3:
					this.MAPPER_REG[13] = data;
					break;
				case 4:
					this.MAPPER_REG[14] = data;
					break;
				case 5:
					this.MAPPER_REG[15] = data;
					break;
				case 6:
					this.MAPPER_REG[16] = data;
					break;
				case 7:
					this.MAPPER_REG[17] = data;
					break;
			}

			if((this.MAPPER_REG[0] & 0x80) == 0x80) {
				this.Core.SetChrRomPages1K(this.MAPPER_REG[12], this.MAPPER_REG[13], this.MAPPER_REG[14], this.MAPPER_REG[15], 
							this.MAPPER_REG[8], this.MAPPER_REG[9], this.MAPPER_REG[10], this.MAPPER_REG[11]); 
			} else {
				this.Core.SetChrRomPages1K(this.MAPPER_REG[8], this.MAPPER_REG[9], this.MAPPER_REG[10], this.MAPPER_REG[11], 
							this.MAPPER_REG[12], this.MAPPER_REG[13], this.MAPPER_REG[14], this.MAPPER_REG[15]); 
			}

			if((this.MAPPER_REG[0] & 0x40) == 0x40) {
				this.Core.SetPrgRomPages8K(this.MAPPER_REG[18], this.MAPPER_REG[17], this.MAPPER_REG[16],this.MAPPER_REG[19]);
			} else {
				this.Core.SetPrgRomPages8K(this.MAPPER_REG[16], this.MAPPER_REG[17], this.MAPPER_REG[18],this.MAPPER_REG[19]);
			}
			break;

		case 0xA000:
			if((data & 0x01) == 0x01)
				this.Core.SetMirror(true);
			else
				this.Core.SetMirror(false);
			this.MAPPER_REG[2] = data;
			break;
		case 0xA001:
			this.MAPPER_REG[3] = data;
			break;

		case 0xC000:
			this.MAPPER_REG[4] = data;
			break;
		case 0xC001:
			this.MAPPER_REG[5] = data;
			break;

		case 0xE000:
			this.MAPPER_REG[4] = this.MAPPER_REG[5];
			this.MAPPER_REG[7] = 0;
			this.ClearIRQ();
			break;
		case 0xE001:
			this.MAPPER_REG[7] = 1;
			break;
	}
}

FC.prototype.Mapper4.prototype.HSync = function(y) {
	if(this.MAPPER_REG[7] == 1 && y < 240 && (this.Core.IO1[0x01] & 0x08) == 0x08) {
		if(--this.MAPPER_REG[4] == 0)
			this.SetIRQ();
		this.MAPPER_REG[4] &= 0xFF;
	}
}


/**** Mapper5 ****/
FC.prototype.Mapper5 = function(core) {
	FC.prototype.MapperProto.apply(this, arguments);
	this.MAPPER_REG = new Array(0x300);
	this.MAPPER_EXRAM = new Array(8);
	this.MAPPER_EXRAM2 = new Array(1024);
	this.MAPPER_EXRAM3 = new Array(1024);

	this.MAPPER_CHR_REG = new Array(2);

	this.MAPPER_IRQ = 0;
	this.MAPPER_IRQ_STATUS = 0;
}

FC.prototype.Mapper5.prototype = Object.create(FC.prototype.MapperProto.prototype);

FC.prototype.Mapper5.prototype.Init = function() {
	this.MAPPER_IRQ = 0;
	this.MAPPER_IRQ_STATUS = 0;

	var i;
	var j;
	for(i=0; i<this.MAPPER_REG.length; i++)
		this.MAPPER_REG[i] = 0;

	for(i=0; i<this.MAPPER_EXRAM.length; i++) {
		this.MAPPER_EXRAM[i] = new Array(8192);
		for(j=0; j<this.MAPPER_EXRAM[i].length; j++)
			this.MAPPER_EXRAM[i][j] = 0x00;
	}

	for(i=0; i<this.MAPPER_EXRAM2.length; i++) {
		this.MAPPER_EXRAM2[i] = 0x00;
	}

	for(i=0; i<this.MAPPER_EXRAM3.length; i++) {
		this.MAPPER_EXRAM3[i] = 0x00;
	}

	for(i=0; i<this.MAPPER_CHR_REG.length; i++) {
		this.MAPPER_CHR_REG[i] = new Array(8);
		for(j=0; j<this.MAPPER_CHR_REG[i].length; j++)
			this.MAPPER_CHR_REG[i][j] = 0x00;
	}

	var tmp = this.Core.PrgRomPageCount * 2 - 1;
	this.Core.SetPrgRomPages8K(tmp, tmp, tmp, tmp);
	tmp = 0;
	this.Core.SetChrRomPages1K(tmp, tmp + 1, tmp + 2, tmp + 3, tmp + 4, tmp + 5, tmp + 6, tmp + 7);
}

FC.prototype.Mapper5.prototype.HSync = function(y) {
	if(y < 240) {
		this.MAPPER_IRQ_STATUS |= 0x40;

		if(y == this.MAPPER_REG[0x0203]) {
			this.MAPPER_IRQ_STATUS |= 0x80;
		}
		if ((this.MAPPER_IRQ_STATUS & 0x80) == 0x80 && (this.MAPPER_REG[0x0204] & 0x80) == 0x80) {
			this.SetIRQ();
		}
	} else {
		this.MAPPER_IRQ_STATUS &= 0xBF;
	}
}

FC.prototype.Mapper5.prototype.ReadLow = function(address) {
	if(address >= 0x5C00) {
		return this.MAPPER_EXRAM2[address - 0x5C00];
	}

	if (address == 0x5204) {
		var ret = this.MAPPER_IRQ_STATUS;
		this.MAPPER_IRQ_STATUS &= 0x7F;
		this.ClearIRQ();
		return ret;
	}

	if (address == 0x5205) {
		return (this.MAPPER_REG[0x0205] * this.MAPPER_REG[0x0206]) & 0x00FF;
	}

	if (address == 0x5206) {
		return (this.MAPPER_REG[0x0205] * this.MAPPER_REG[0x0206]) >>> 8;
	}
}

FC.prototype.Mapper5.prototype.WriteLow = function(address, data) {
	if(address >= 0x5C00) {
		this.MAPPER_EXRAM2[address - 0x5C00] = data;
		return;
	}

	if(address >= 0x5000 && address <= 0x5015) {
		this.MAPPER_REG[address - 0x5000] = data;
		this.Core.Write_MMC5_REG(address - 0x5000, data);
		return;
	}

	if((address >= 0x5100 && address <= 0x5104) ||
	    address == 0x5130 ||
	   (address >= 0x5200 && address <= 0x5206)) {
		this.MAPPER_REG[address - 0x5000] = data;
		return;
	}

	if(address == 0x5105) {
		this.MAPPER_REG[0x0105] = data;
		for(var i=0; i<4; i++) {
			switch((data >>> (i * 2)) & 0x03) {
				case 0:
					this.Core.VRAM[8 + i] = this.Core.VRAMS[8];
					break;
				case 1:
					this.Core.VRAM[8 + i] = this.Core.VRAMS[9];
					break;
				case 2:
					this.Core.VRAM[8 + i] = this.MAPPER_EXRAM2;
					break;
				case 3:
					this.Core.VRAM[8 + i] = this.MAPPER_EXRAM3;
					break;
			}
		}
		return;
	}

	if(address == 0x5106) {
		this.MAPPER_REG[0x0106] = data;
		for(var i=0; i<30*32; i++)
			this.MAPPER_EXRAM3[i] = data;
		return;
	}

	if(address == 0x5107) {
		this.MAPPER_REG[0x0107] = data;
		for(var i=30*32; i<32*32; i++)
			this.MAPPER_EXRAM3[i] = data;
		return;
	}

	if(address == 0x5113) {
		this.MAPPER_REG[0x0113] = data;
		this.Core.SRAM = this.MAPPER_EXRAM[data & 0x07];
		return;
	}

	if(address >= 0x5114 && address <= 0x5117) {
		this.MAPPER_REG[address - 0x5000] = data;
		this.SetPrgRomPages8K_Mapper05(address - 0x5000);
		return;
	}

	if(address >= 0x5120 && address <= 0x5127) {
		this.MAPPER_REG[address - 0x5000] = (this.MAPPER_REG[0x0130] << 8) | data;
		this.SetChrRomPages1K_Mapper05_A();
		return;
	}

	if(address >= 0x5128 && address <= 0x512B) {
		this.MAPPER_REG[address - 0x5000] = (this.MAPPER_REG[0x0130] << 8) | data;
		this.SetChrRomPages1K_Mapper05_B();
		return;
	}
}

FC.prototype.Mapper5.prototype.SetChrRomPages1K_Mapper05_A = function (){
	var tmp;
	switch(this.MAPPER_REG[0x0101] & 0x03) {
		case 0:
			tmp = this.MAPPER_REG[0x0127] * 8;
			this.MAPPER_CHR_REG[0][0] = tmp;
			this.MAPPER_CHR_REG[0][1] = tmp + 1;
			this.MAPPER_CHR_REG[0][2] = tmp + 2;
			this.MAPPER_CHR_REG[0][3] = tmp + 3;
			this.MAPPER_CHR_REG[0][4] = tmp + 4;
			this.MAPPER_CHR_REG[0][5] = tmp + 5;
			this.MAPPER_CHR_REG[0][6] = tmp + 6;
			this.MAPPER_CHR_REG[0][7] = tmp + 7;
			break;
		case 1:
			tmp = this.MAPPER_REG[0x0123] * 4;
			this.MAPPER_CHR_REG[0][0] = tmp;
			this.MAPPER_CHR_REG[0][1] = tmp + 1;
			this.MAPPER_CHR_REG[0][2] = tmp + 2;
			this.MAPPER_CHR_REG[0][3] = tmp + 3;

			tmp = this.MAPPER_REG[0x0127] * 4;
			this.MAPPER_CHR_REG[0][4] = tmp;
			this.MAPPER_CHR_REG[0][5] = tmp + 1;
			this.MAPPER_CHR_REG[0][6] = tmp + 2;
			this.MAPPER_CHR_REG[0][7] = tmp + 3;
			break;
		case 2:
			tmp = this.MAPPER_REG[0x0121] * 2;
			this.MAPPER_CHR_REG[0][0] = tmp;
			this.MAPPER_CHR_REG[0][1] = tmp + 1;

			tmp = this.MAPPER_REG[0x0123] * 2;
			this.MAPPER_CHR_REG[0][2] = tmp;
			this.MAPPER_CHR_REG[0][3] = tmp + 1;

			tmp = this.MAPPER_REG[0x0125] * 2;
			this.MAPPER_CHR_REG[0][4] = tmp;
			this.MAPPER_CHR_REG[0][5] = tmp + 1;

			tmp = this.MAPPER_REG[0x0126] * 2;
			this.MAPPER_CHR_REG[0][6] = tmp;
			this.MAPPER_CHR_REG[0][7] = tmp + 1;
			break;
		case 3:
			this.MAPPER_CHR_REG[0][0] = this.MAPPER_REG[0x0120];
			this.MAPPER_CHR_REG[0][1] = this.MAPPER_REG[0x0121];
			this.MAPPER_CHR_REG[0][2] = this.MAPPER_REG[0x0122];
			this.MAPPER_CHR_REG[0][3] = this.MAPPER_REG[0x0123];
			this.MAPPER_CHR_REG[0][4] = this.MAPPER_REG[0x0124];
			this.MAPPER_CHR_REG[0][5] = this.MAPPER_REG[0x0125];
			this.MAPPER_CHR_REG[0][6] = this.MAPPER_REG[0x0126];
			this.MAPPER_CHR_REG[0][7] = this.MAPPER_REG[0x0127];
			break;
	}
}

FC.prototype.Mapper5.prototype.SetChrRomPages1K_Mapper05_B = function (){
	var tmp;
	switch(this.MAPPER_REG[0x0101] & 0x03) {
		case 0:
			tmp = this.MAPPER_REG[0x012B] * 8;
			this.MAPPER_CHR_REG[1][0] = tmp;
			this.MAPPER_CHR_REG[1][1] = tmp + 1;
			this.MAPPER_CHR_REG[1][2] = tmp + 2;
			this.MAPPER_CHR_REG[1][3] = tmp + 3;
			this.MAPPER_CHR_REG[1][4] = tmp + 4;
			this.MAPPER_CHR_REG[1][5] = tmp + 5;
			this.MAPPER_CHR_REG[1][6] = tmp + 6;
			this.MAPPER_CHR_REG[1][7] = tmp + 7;
			break;
		case 1:
			tmp = this.MAPPER_REG[0x012B] * 4;
			this.MAPPER_CHR_REG[1][0] = tmp;
			this.MAPPER_CHR_REG[1][1] = tmp + 1;
			this.MAPPER_CHR_REG[1][2] = tmp + 2;
			this.MAPPER_CHR_REG[1][3] = tmp + 3;
			this.MAPPER_CHR_REG[1][4] = tmp;
			this.MAPPER_CHR_REG[1][5] = tmp + 1;
			this.MAPPER_CHR_REG[1][6] = tmp + 2;
			this.MAPPER_CHR_REG[1][7] = tmp + 3;
			break;
		case 2:
			tmp = this.MAPPER_REG[0x0129] * 2;
			this.MAPPER_CHR_REG[1][0] = tmp;
			this.MAPPER_CHR_REG[1][1] = tmp + 1;
			this.MAPPER_CHR_REG[1][4] = tmp;
			this.MAPPER_CHR_REG[1][5] = tmp + 1;

			tmp = this.MAPPER_REG[0x012B] * 2;
			this.MAPPER_CHR_REG[1][2] = tmp;
			this.MAPPER_CHR_REG[1][3] = tmp + 1;
			this.MAPPER_CHR_REG[1][6] = tmp;
			this.MAPPER_CHR_REG[1][7] = tmp + 1;
			break;
		case 3:
			tmp = this.MAPPER_REG[0x0128];
			this.MAPPER_CHR_REG[1][0] = tmp;
			this.MAPPER_CHR_REG[1][4] = tmp;

			tmp = this.MAPPER_REG[0x0129];
			this.MAPPER_CHR_REG[1][1] = tmp;
			this.MAPPER_CHR_REG[1][5] = tmp;

			tmp = this.MAPPER_REG[0x012A];
			this.MAPPER_CHR_REG[1][2] = tmp;
			this.MAPPER_CHR_REG[1][6] = tmp;

			tmp = this.MAPPER_REG[0x012B];
			this.MAPPER_CHR_REG[1][3] = tmp;
			this.MAPPER_CHR_REG[1][7] = tmp;
			break;
	}
}

FC.prototype.Mapper5.prototype.SetPrgRomPages8K_Mapper05 = function (no){
	switch(this.MAPPER_REG[0x0100] & 0x03) {
		case 0x00:
			if(no == 0x0117) {
				var tmp = this.MAPPER_REG[0x0117] & 0x7C;
				this.Core.SetPrgRomPage8K(0, tmp);
				this.Core.SetPrgRomPage8K(1, tmp + 1);
				this.Core.SetPrgRomPage8K(2, tmp + 2);
				this.Core.SetPrgRomPage8K(3, tmp + 3);
			}
			break;
		case 0x01:
			if(no == 0x0115) {
				var tmp = this.MAPPER_REG[0x0115];
				if((tmp & 0x80) == 0x80) {
					tmp &= 0x7E;
					this.Core.SetPrgRomPage8K(0, tmp);
					this.Core.SetPrgRomPage8K(1, tmp + 1);
				} else {
					this.Core.ROM[0] = this.MAPPER_EXRAM[tmp & 0x07];
					this.Core.ROM[1] = this.MAPPER_EXRAM[(tmp + 1) & 0x07];
				}
			}
			if(no == 0x0117) {
				var tmp = this.MAPPER_REG[0x0117] & 0x7E;
				this.Core.SetPrgRomPage8K(2, tmp);
				this.Core.SetPrgRomPage8K(3, tmp + 1);
			}
			break;
		case 0x02:
			if(no == 0x0115) {
				var tmp = this.MAPPER_REG[0x0115];
				if((tmp & 0x80) == 0x80) {
					tmp &= 0x7E;
					this.Core.SetPrgRomPage8K(0, tmp);
					this.Core.SetPrgRomPage8K(1, tmp + 1);
				} else {
					this.Core.ROM[0] = this.MAPPER_EXRAM[tmp & 0x07];
					this.Core.ROM[1] = this.MAPPER_EXRAM[(tmp + 1) & 0x07];
				}
			}
			if(no == 0x0116) {
				var tmp = this.MAPPER_REG[0x0116];
				if((tmp & 0x80) == 0x80) {
					this.Core.SetPrgRomPage8K(2, tmp & 0x7F);
				} else {
					this.Core.ROM[2] = this.MAPPER_EXRAM[tmp & 0x07];
				}
			}
			if(no == 0x0117)
				this.Core.SetPrgRomPage8K(3, this.MAPPER_REG[0x0117] & 0x7F);
			break;
		case 0x03:
			if(no == 0x0114 || no == 0x0115 || no == 0x0116) {
				var tmp = this.MAPPER_REG[no];
				if((tmp & 0x80) == 0x80) {
					this.Core.SetPrgRomPage8K(no - 0x0114, tmp & 0x7F);
				} else {
					this.Core.ROM[no - 0x0114] = this.MAPPER_EXRAM[tmp & 0x07];
				}
			}
			if(no == 0x0117)
				this.Core.SetPrgRomPage8K(3, this.MAPPER_REG[0x0117] & 0x7F);
			break;
	}
}

FC.prototype.Mapper5.prototype.BuildBGLine = function () {
	this.Core.SetChrRomPages1K(this.MAPPER_CHR_REG[1][0], this.MAPPER_CHR_REG[1][1], this.MAPPER_CHR_REG[1][2], this.MAPPER_CHR_REG[1][3],
				   this.MAPPER_CHR_REG[1][4], this.MAPPER_CHR_REG[1][5], this.MAPPER_CHR_REG[1][6], this.MAPPER_CHR_REG[1][7]);

	this.Core.BuildBGLine_SUB();

	if((this.MAPPER_REG[0x0200] & 0x80) == 0x80) {
		var chrpage = this.MAPPER_REG[0x0202] * 4;
		this.Core.SetChrRomPage1K(0, chrpage);
		this.Core.SetChrRomPage1K(1, chrpage + 1);
		this.Core.SetChrRomPage1K(2, chrpage + 2);
		this.Core.SetChrRomPage1K(3, chrpage + 3);

		var spilt_index = this.MAPPER_REG[0x0200] & 0x1F;

		var si;
		var ei;
		if((this.MAPPER_REG[0x0200] & 0x40) == 0x00) {
			si = 0;
			ei = spilt_index - 1;
		} else {
			si = spilt_index;
			ei = 31;
		}

		var tmpVRAM = this.Core.VRAM;
		var tmpPaletteArray = this.Core.PaletteArray;
		var tmpSPBitArray = this.Core.SPBitArray;

		var tmpBgLineBuffer = this.Core.BgLineBuffer;
		var nameAddr = 0x0000;
		var tmpy = (this.Core.PpuY + this.MAPPER_REG[0x0201]) % 240;
		nameAddr += (tmpy >>> 3) << 5;
		var iy = tmpy & 0x07;

		for(var i=si; i<=ei; i++) {
			var ptnDist = (this.MAPPER_EXRAM2[nameAddr + i] << 4) + iy;
			var tmpSrcV = tmpVRAM[ptnDist >> 10];
			ptnDist &= 0x03FF;
			var attr = ((this.MAPPER_EXRAM2[((nameAddr & 0x0380) >> 4) | ((nameAddr & 0x001C) >> 2) + 0x03C0] << 2) >> (((nameAddr & 0x0040) >> 4) | (nameAddr & 0x0002))) & 0x0C;
			var ptn = tmpSPBitArray[tmpSrcV[ptnDist]][tmpSrcV[ptnDist + 8]];

			for(var j=0; j<8; j++) {
				tmpBgLineBuffer[i * 8 + j] = tmpPaletteArray[ptn[j] | attr];
			}
		}
	}
}

FC.prototype.Mapper5.prototype.BuildSpriteLine = function () {
	this.Core.SetChrRomPages1K(this.MAPPER_CHR_REG[0][0], this.MAPPER_CHR_REG[0][1], this.MAPPER_CHR_REG[0][2], this.MAPPER_CHR_REG[0][3],
				   this.MAPPER_CHR_REG[0][4], this.MAPPER_CHR_REG[0][5], this.MAPPER_CHR_REG[0][6], this.MAPPER_CHR_REG[0][7]);
	this.Core.BuildSpriteLine_SUB();
}

FC.prototype.Mapper5.prototype.ReadPPUData = function () {
	this.Core.SetChrRomPages1K(this.MAPPER_CHR_REG[0][0], this.MAPPER_CHR_REG[0][1], this.MAPPER_CHR_REG[0][2], this.MAPPER_CHR_REG[0][3],
				   this.MAPPER_CHR_REG[0][4], this.MAPPER_CHR_REG[0][5], this.MAPPER_CHR_REG[0][6], this.MAPPER_CHR_REG[0][7]);
	return this.Core.ReadPPUData_SUB();
}

FC.prototype.Mapper5.prototype.WritePPUData = function (value) {
	this.Core.SetChrRomPages1K(this.MAPPER_CHR_REG[0][0], this.MAPPER_CHR_REG[0][1], this.MAPPER_CHR_REG[0][2], this.MAPPER_CHR_REG[0][3],
				   this.MAPPER_CHR_REG[0][4], this.MAPPER_CHR_REG[0][5], this.MAPPER_CHR_REG[0][6], this.MAPPER_CHR_REG[0][7]);
	this.Core.WritePPUData_SUB(value);
}

FC.prototype.Mapper5.prototype.OutEXSound = function(soundin) {
	return (soundin >> 1) + (this.Core.Out_MMC5() >> 1);
}

FC.prototype.Mapper5.prototype.EXSoundSync = function(clock) {
	this.Core.Count_MMC5(clock);
}


/**** Mapper7 ****/
FC.prototype.Mapper7 = function(core) {
	FC.prototype.MapperProto.apply(this, arguments);
}

FC.prototype.Mapper7.prototype = Object.create(FC.prototype.MapperProto.prototype);

FC.prototype.Mapper7.prototype.Init = function() {
	this.Core.SetPrgRomPage(0, 0);
	this.Core.SetPrgRomPage(1, 1);
	this.Core.SetChrRomPage(0);
}

FC.prototype.Mapper7.prototype.Write = function(address, data) {
	var tmp = (data & 0x07) << 1;
	this.Core.SetPrgRomPage(0, tmp);
	this.Core.SetPrgRomPage(1, tmp + 1);

	if((data & 0x10) == 0x00)
		this.Core.SetMirrors(0,0,0,0);
	else
		this.Core.SetMirrors(1,1,1,1);
}


/**** Mapper9 ****/
FC.prototype.Mapper9 = function(core) {//<--
	FC.prototype.MapperProto.apply(this, arguments);
	//this.MAPPER_REG = new Array(6);
	this.MAPPER_REG = new Array(4);
	this.MAPPER_Latch0 = true;
	this.MAPPER_Latch1 = true;
}

FC.prototype.Mapper9.prototype = Object.create(FC.prototype.MapperProto.prototype);

FC.prototype.Mapper9.prototype.Init = function() {
	this.Core.SetPrgRomPages8K(0, this.Core.PrgRomPageCount * 2 - 3, this.Core.PrgRomPageCount * 2 - 2, this.Core.PrgRomPageCount * 2 - 1);
	this.Core.SetChrRomPages1K(0, 0, 0, 0, 0, 0, 0, 0);
	for(var i=0; i<this.MAPPER_REG.length; i++)
		this.MAPPER_REG[i] = 0x00;
	this.MAPPER_Latch0 = true;
	this.MAPPER_Latch1 = true;
	//this.MAPPER_REG[4] = true;
	//this.MAPPER_REG[5] = true;
}

FC.prototype.Mapper9.prototype.Write = function(address, data) {
	switch(address & 0xF000) {
		case 0xA000:
			this.Core.SetPrgRomPage8K(0, data);
			break;
		case 0xB000:
			this.MAPPER_REG[0] = data;
			break;
		case 0xC000:
			this.MAPPER_REG[1] = data;
			break;
		case 0xD000:
			this.MAPPER_REG[2] = data;
			break;
		case 0xE000:
			this.MAPPER_REG[3] = data;
			break;
		case 0xF000:
			if((data & 0x01) == 0x00)
				this.Core.SetMirror(false);
			else
				this.Core.SetMirror(true);
			break;
	}
}

FC.prototype.Mapper9.prototype.BuildBGLine = function () {
	var tmpBgLineBuffer = this.Core.BgLineBuffer;
	var tmpVRAM = this.Core.VRAM;
	var nameAddr = 0x2000 | (this.Core.PPUAddress & 0x0FFF);
	var tableAddr = ((this.Core.PPUAddress & 0x7000) >> 12) | (this.Core.IO1[0x00] & 0x10) << 8;
	var nameAddrHigh = nameAddr >> 10;
	var nameAddrLow = nameAddr & 0x03FF;
	var tmpVRAMHigh = tmpVRAM[nameAddrHigh];
	var tmpPaletteArray = this.Core.PaletteArray;
	var tmpSPBitArray = this.Core.SPBitArray;

	var q = 0;
	var s = this.Core.HScrollTmp;

	for(var p=0; p<33; p++) {
		var ptnDist = (tmpVRAMHigh[nameAddrLow] << 4) | tableAddr;
		var tmpptnDist = ptnDist;

		this.SetChrRom(tmpptnDist);

		var tmpSrcV = tmpVRAM[ptnDist >> 10];
		ptnDist &= 0x03FF;
		var attr = ((tmpVRAMHigh[((nameAddrLow & 0x0380) >> 4) | ((nameAddrLow & 0x001C) >> 2) + 0x03C0] << 2) >> (((nameAddrLow & 0x0040) >> 4) | (nameAddrLow & 0x0002))) & 0x0C;
		var ptn = tmpSPBitArray[tmpSrcV[ptnDist]][tmpSrcV[ptnDist + 8]];

		for(; s<8; s++, q++)
			tmpBgLineBuffer[q] = tmpPaletteArray[ptn[s] | attr];
		s = 0;

		this.SetLatch(tmpptnDist);

		if((nameAddrLow & 0x001F) == 0x001F) {
			nameAddrLow &= 0xFFE0;
			tmpVRAMHigh = tmpVRAM[(nameAddrHigh ^= 0x01)];
		} else
			nameAddrLow++;
	}
}

FC.prototype.Mapper9.prototype.SetLatch = function (addr) {
	addr &= 0x1FF0;
	if(addr == 0x0FD0)
		this.MAPPER_Latch0 = false;
		//this.MAPPER_REG[4] = false;
	if(addr == 0x1FD0)
		this.MAPPER_Latch1 = false;
		//this.MAPPER_REG[5] = false;
	if(addr == 0x0FE0)
		this.MAPPER_Latch0 = true;
		//this.MAPPER_REG[4] = true;
	if(addr == 0x1FE0)
		this.MAPPER_Latch1 = true;
		//this.MAPPER_REG[5] = true;
}

FC.prototype.Mapper9.prototype.SetChrRom = function (addr) {
	if((addr & 0x1000) == 0x0000) {
		if(!this.MAPPER_Latch0) {
		//if(!this.MAPPER_REG[4]) {
			this.Core.SetChrRomPage1K(0, this.MAPPER_REG[0] * 4);
			this.Core.SetChrRomPage1K(1, this.MAPPER_REG[0] * 4 + 1);
			this.Core.SetChrRomPage1K(2, this.MAPPER_REG[0] * 4 + 2);
			this.Core.SetChrRomPage1K(3, this.MAPPER_REG[0] * 4 + 3);
		} else {
			this.Core.SetChrRomPage1K(0, this.MAPPER_REG[1] * 4);
			this.Core.SetChrRomPage1K(1, this.MAPPER_REG[1] * 4 + 1);
			this.Core.SetChrRomPage1K(2, this.MAPPER_REG[1] * 4 + 2);
			this.Core.SetChrRomPage1K(3, this.MAPPER_REG[1] * 4 + 3);
		}
	} else {
		if(!this.MAPPER_Latch1) {
		//if(!this.MAPPER_REG[5]) {
			this.Core.SetChrRomPage1K(4, this.MAPPER_REG[2] * 4);
			this.Core.SetChrRomPage1K(5, this.MAPPER_REG[2] * 4 + 1);
			this.Core.SetChrRomPage1K(6, this.MAPPER_REG[2] * 4 + 2);
			this.Core.SetChrRomPage1K(7, this.MAPPER_REG[2] * 4 + 3);
		} else {
			this.Core.SetChrRomPage1K(4, this.MAPPER_REG[3] * 4);
			this.Core.SetChrRomPage1K(5, this.MAPPER_REG[3] * 4 + 1);
			this.Core.SetChrRomPage1K(6, this.MAPPER_REG[3] * 4 + 2);
			this.Core.SetChrRomPage1K(7, this.MAPPER_REG[3] * 4 + 3);
		}
	}
}

FC.prototype.Mapper9.prototype.BuildSpriteLine = function () {
	var tmpBgLineBuffer = this.Core.BgLineBuffer;
	var tmpIsSpriteClipping = (this.Core.IO1[0x01] & 0x04) == 0x04 ? 0 : 8;

	if((this.Core.IO1[0x01] & 0x10) == 0x10) {
		var tmpSpLine = this.Core.SpriteLineBuffer;
		for(var p=0; p<256; p++)
			tmpSpLine[p] = 256;

		var tmpSpRAM = this.Core.SPRITE_RAM;
		var tmpBigSize = (this.Core.IO1[0x00] & 0x20) == 0x20 ? 16 : 8;
		var tmpSpPatternTableAddress = (this.Core.IO1[0x00] & 0x08) << 9;

		var tmpVRAM = this.Core.VRAM;
		var tmpSPBitArray = this.Core.SPBitArray;

		var lineY = this.Core.PpuY;
		var count = 0;

		for(var i=0; i<=252; i+=4) {
			var isy = tmpSpRAM[i] + 1;
			if(isy > lineY || (isy + tmpBigSize) <= lineY)
				continue;

			if(i == 0)
				this.Core.Sprite0Line = true;

			if(++count == 9 && this.Core.SpriteLimit) {
				i = 256;
				continue;
			}

			var x = tmpSpRAM[i + 3];
			var ex = x + 8;
			if(ex > 256)
				ex = 256;

			var attr = tmpSpRAM[i + 2];

			var attribute = ((attr & 0x03) << 2) | 0x10;
			var bgsp = attr & 0x20;

			var iy = (attr & 0x80) == 0x80 ? tmpBigSize - 1 - (lineY - isy) : lineY - isy;
			var tileNum = ((iy & 0x08) << 1) + (iy & 0x07) +
				(tmpBigSize == 8 ? (tmpSpRAM[i + 1] << 4) + tmpSpPatternTableAddress : ((tmpSpRAM[i + 1] & 0xFE) << 4) + ((tmpSpRAM[i + 1] & 0x01) << 12));

			this.SetChrRom(tileNum);

			var tmpHigh = tmpVRAM[tileNum >> 10];
			var tmpLow = tileNum & 0x03FF;
			var ptn = tmpSPBitArray[tmpHigh[tmpLow]][tmpHigh[tmpLow + 8]];

			var is;
			var ia;
			if((attr & 0x40) == 0x00) {
				is = 0;
				ia = 1;
			} else {
				is = 7;
				ia = -1;
			}

			for(; x<ex; x++, is+=ia) {
				var tmpPtn = ptn[is];
				if(tmpPtn != 0x00 && tmpSpLine[x] == 256) {
					tmpSpLine[x] = i;

					if(x >= tmpIsSpriteClipping && (bgsp == 0x00 || tmpBgLineBuffer[x] == 0x10))
							tmpBgLineBuffer[x] = tmpPtn | attribute;
				}
			}

			this.SetLatch(tileNum);
		}

		if(count >= 8)
			this.Core.IO1[0x02] |= 0x20;
		else
			this.Core.IO1[0x02] &= 0xDF;
	}
}

FC.prototype.Mapper9.prototype.GetState = function() {
	this.Core.StateData.Mapper = new Object();
	this.Core.StateData.Mapper.MAPPER_REG = this.MAPPER_REG.slice(0);

	this.Core.StateData.Mapper.MAPPER_Latch0 = this.MAPPER_Latch0;
	this.Core.StateData.Mapper.MAPPER_Latch1 = this.MAPPER_Latch1;
}

FC.prototype.Mapper9.prototype.SetState = function() {
	for(var i=0; i<this.Core.StateData.Mapper.MAPPER_REG.length; i++)
		this.MAPPER_REG[i] = this.Core.StateData.Mapper.MAPPER_REG[i];

	this.MAPPER_Latch0 = this.Core.StateData.Mapper.MAPPER_Latch0;
	this.MAPPER_Latch1 = this.Core.StateData.Mapper.MAPPER_Latch1;
}


/**** Mapper10 ****/
FC.prototype.Mapper10 = function(core) {//<--
	FC.prototype.MapperProto.apply(this, arguments);
	//this.MAPPER_REG = new Array(6);
	this.MAPPER_REG = new Array(4);
	this.MAPPER_Latch0 = true;
	this.MAPPER_Latch1 = true;
}

FC.prototype.Mapper10.prototype = Object.create(FC.prototype.MapperProto.prototype);

FC.prototype.Mapper10.prototype.Init = function() {
	this.Core.SetPrgRomPages8K(0, 0, this.Core.PrgRomPageCount * 2 - 2, this.Core.PrgRomPageCount * 2 - 1);
	this.Core.SetChrRomPages1K(0, 0, 0, 0, 0, 0, 0, 0);
	for(var i=0; i<this.MAPPER_REG.length; i++)
		this.MAPPER_REG[i] = 0x00;
	this.MAPPER_Latch0 = true;
	this.MAPPER_Latch1 = true;
	//this.MAPPER_REG[4] = true;
	//this.MAPPER_REG[5] = true;
}

FC.prototype.Mapper10.prototype.Write = function(address, data) {
	switch(address & 0xF000) {
		case 0xA000:
			this.Core.SetPrgRomPage8K(0, data * 2);
			this.Core.SetPrgRomPage8K(1, data * 2 + 1);
			break;
		case 0xB000:
			this.MAPPER_REG[0] = data;
			break;
		case 0xC000:
			this.MAPPER_REG[1] = data;
			break;
		case 0xD000:
			this.MAPPER_REG[2] = data;
			break;
		case 0xE000:
			this.MAPPER_REG[3] = data;
			break;
		case 0xF000:
			if((data & 0x01) == 0x00)
				this.Core.SetMirror(false);
			else
				this.Core.SetMirror(true);
			break;
	}
}

FC.prototype.Mapper10.prototype.BuildBGLine = function () {
	var tmpBgLineBuffer = this.Core.BgLineBuffer;
	var tmpVRAM = this.Core.VRAM;
	var nameAddr = 0x2000 | (this.Core.PPUAddress & 0x0FFF);
	var tableAddr = ((this.Core.PPUAddress & 0x7000) >> 12) | (this.Core.IO1[0x00] & 0x10) << 8;
	var nameAddrHigh = nameAddr >> 10;
	var nameAddrLow = nameAddr & 0x03FF;
	var tmpVRAMHigh = tmpVRAM[nameAddrHigh];
	var tmpPaletteArray = this.Core.PaletteArray;
	var tmpSPBitArray = this.Core.SPBitArray;

	var q = 0;
	var s = this.Core.HScrollTmp;

	for(var p=0; p<33; p++) {
		var ptnDist = (tmpVRAMHigh[nameAddrLow] << 4) | tableAddr;
		var tmpptnDist = ptnDist;

		this.SetChrRom(tmpptnDist);

		var tmpSrcV = tmpVRAM[ptnDist >> 10];
		ptnDist &= 0x03FF;
		var attr = ((tmpVRAMHigh[((nameAddrLow & 0x0380) >> 4) | ((nameAddrLow & 0x001C) >> 2) + 0x03C0] << 2) >> (((nameAddrLow & 0x0040) >> 4) | (nameAddrLow & 0x0002))) & 0x0C;
		var ptn = tmpSPBitArray[tmpSrcV[ptnDist]][tmpSrcV[ptnDist + 8]];

		for(; s<8; s++, q++)
			tmpBgLineBuffer[q] = tmpPaletteArray[ptn[s] | attr];
		s = 0;

		this.SetLatch(tmpptnDist);

		if((nameAddrLow & 0x001F) == 0x001F) {
			nameAddrLow &= 0xFFE0;
			tmpVRAMHigh = tmpVRAM[(nameAddrHigh ^= 0x01)];
		} else
			nameAddrLow++;
	}
}

FC.prototype.Mapper10.prototype.SetLatch = function (addr) {
	addr &= 0x1FF0;
	if(addr == 0x0FD0)
		this.MAPPER_Latch0 = false;
		//this.MAPPER_REG[4] = false;
	if(addr == 0x1FD0)
		this.MAPPER_Latch1 = false;
		//this.MAPPER_REG[5] = false;
	if(addr == 0x0FE0)
		this.MAPPER_Latch0 = true;
		//this.MAPPER_REG[4] = true;
	if(addr == 0x1FE0)
		this.MAPPER_Latch1 = true;
		//this.MAPPER_REG[5] = true;
}

FC.prototype.Mapper10.prototype.SetChrRom = function (addr) {
	if((addr & 0x1000) == 0x0000) {
		if(!this.MAPPER_Latch0) {
		//if(!this.MAPPER_REG[4]) {
			this.Core.SetChrRomPage1K(0, this.MAPPER_REG[0] * 4);
			this.Core.SetChrRomPage1K(1, this.MAPPER_REG[0] * 4 + 1);
			this.Core.SetChrRomPage1K(2, this.MAPPER_REG[0] * 4 + 2);
			this.Core.SetChrRomPage1K(3, this.MAPPER_REG[0] * 4 + 3);
		} else {
			this.Core.SetChrRomPage1K(0, this.MAPPER_REG[1] * 4);
			this.Core.SetChrRomPage1K(1, this.MAPPER_REG[1] * 4 + 1);
			this.Core.SetChrRomPage1K(2, this.MAPPER_REG[1] * 4 + 2);
			this.Core.SetChrRomPage1K(3, this.MAPPER_REG[1] * 4 + 3);
		}
	} else {
		if(!this.MAPPER_Latch1) {
		//if(!this.MAPPER_REG[5]) {
			this.Core.SetChrRomPage1K(4, this.MAPPER_REG[2] * 4);
			this.Core.SetChrRomPage1K(5, this.MAPPER_REG[2] * 4 + 1);
			this.Core.SetChrRomPage1K(6, this.MAPPER_REG[2] * 4 + 2);
			this.Core.SetChrRomPage1K(7, this.MAPPER_REG[2] * 4 + 3);
		} else {
			this.Core.SetChrRomPage1K(4, this.MAPPER_REG[3] * 4);
			this.Core.SetChrRomPage1K(5, this.MAPPER_REG[3] * 4 + 1);
			this.Core.SetChrRomPage1K(6, this.MAPPER_REG[3] * 4 + 2);
			this.Core.SetChrRomPage1K(7, this.MAPPER_REG[3] * 4 + 3);
		}
	}
}

FC.prototype.Mapper10.prototype.BuildSpriteLine = function () {
	var tmpBgLineBuffer = this.Core.BgLineBuffer;
	var tmpIsSpriteClipping = (this.Core.IO1[0x01] & 0x04) == 0x04 ? 0 : 8;

	if((this.Core.IO1[0x01] & 0x10) == 0x10) {
		var tmpSpLine = this.Core.SpriteLineBuffer;
		for(var p=0; p<256; p++)
			tmpSpLine[p] = 256;

		var tmpSpRAM = this.Core.SPRITE_RAM;
		var tmpBigSize = (this.Core.IO1[0x00] & 0x20) == 0x20 ? 16 : 8;
		var tmpSpPatternTableAddress = (this.Core.IO1[0x00] & 0x08) << 9;

		var tmpVRAM = this.Core.VRAM;
		var tmpSPBitArray = this.Core.SPBitArray;

		var lineY = this.Core.PpuY;
		var count = 0;

		for(var i=0; i<=252; i+=4) {
			var isy = tmpSpRAM[i] + 1;
			if(isy > lineY || (isy + tmpBigSize) <= lineY)
				continue;

			if(i == 0)
				this.Core.Sprite0Line = true;

			if(++count == 9 && this.Core.SpriteLimit) {
				i = 256;
				continue;
			}

			var x = tmpSpRAM[i + 3];
			var ex = x + 8;
			if(ex > 256)
				ex = 256;

			var attr = tmpSpRAM[i + 2];

			var attribute = ((attr & 0x03) << 2) | 0x10;
			var bgsp = attr & 0x20;

			var iy = (attr & 0x80) == 0x80 ? tmpBigSize - 1 - (lineY - isy) : lineY - isy;
			var tileNum = ((iy & 0x08) << 1) + (iy & 0x07) +
				(tmpBigSize == 8 ? (tmpSpRAM[i + 1] << 4) + tmpSpPatternTableAddress : ((tmpSpRAM[i + 1] & 0xFE) << 4) + ((tmpSpRAM[i + 1] & 0x01) << 12));

			this.SetChrRom(tileNum);

			var tmpHigh = tmpVRAM[tileNum >> 10];
			var tmpLow = tileNum & 0x03FF;
			var ptn = tmpSPBitArray[tmpHigh[tmpLow]][tmpHigh[tmpLow + 8]];

			var is;
			var ia;
			if((attr & 0x40) == 0x00) {
				is = 0;
				ia = 1;
			} else {
				is = 7;
				ia = -1;
			}

			for(; x<ex; x++, is+=ia) {
				var tmpPtn = ptn[is];
				if(tmpPtn != 0x00 && tmpSpLine[x] == 256) {
					tmpSpLine[x] = i;

					if(x >= tmpIsSpriteClipping && (bgsp == 0x00 || tmpBgLineBuffer[x] == 0x10))
							tmpBgLineBuffer[x] = tmpPtn | attribute;
				}
			}

			this.SetLatch(tileNum);
		}

		if(count >= 8)
			this.Core.IO1[0x02] |= 0x20;
		else
			this.Core.IO1[0x02] &= 0xDF;
	}
}

FC.prototype.Mapper10.prototype.GetState = function() {
	this.Core.StateData.Mapper = new Object();
	this.Core.StateData.Mapper.MAPPER_REG = this.MAPPER_REG.slice(0);

	this.Core.StateData.Mapper.MAPPER_Latch0 = this.MAPPER_Latch0;
	this.Core.StateData.Mapper.MAPPER_Latch1 = this.MAPPER_Latch1;
}

FC.prototype.Mapper10.prototype.SetState = function() {
	for(var i=0; i<this.Core.StateData.Mapper.MAPPER_REG.length; i++)
		this.MAPPER_REG[i] = this.Core.StateData.Mapper.MAPPER_REG[i];

	this.MAPPER_Latch0 = this.Core.StateData.Mapper.MAPPER_Latch0;
	this.MAPPER_Latch1 = this.Core.StateData.Mapper.MAPPER_Latch1;
}


/**** Mapper16 ****/
FC.prototype.Mapper16 = function(core) {
	FC.prototype.MapperProto.apply(this, arguments);
	this.MAPPER_REG = new Array(5);

	this.EEPROM_ADDRESS = 0;
	this.OUT_DATA = 0;
	this.BIT_DATA = 0;
	this.BIT_DATA_TMP = 0;
	this.BIT_COUNTER = 0;
	this.READ_WRITE = false;
	this.SCL_OLD = false;
	this.SCL = false;
	this.SDA_OLD = false;
	this.SDA = false;
	this.STATE = 0;

	this.EEPROM = new Array(256);
	for(var i=0; i<this.EEPROM.length; i++)
		this.EEPROM[i] = 0x00;
}

FC.prototype.Mapper16.prototype = Object.create(FC.prototype.MapperProto.prototype);

FC.prototype.Mapper16.prototype.Init = function() {
	this.MAPPER_REG[0] = 0;
	this.MAPPER_REG[1] = 0;
	this.Core.SetPrgRomPages8K(0, 1, this.Core.PrgRomPageCount * 2 - 2, this.Core.PrgRomPageCount * 2 - 1);
	this.Core.SetChrRomPages1K(0, 1, 2, 3, 4, 5, 6, 7);

	this.EEPROM_ADDRESS = 0;
	this.OUT_DATA = 0;
	this.BIT_DATA = 0;
	this.BIT_DATA_TMP = 0;
	this.BIT_COUNTER = 0;
	this.READ_WRITE = false;
	this.SCL_OLD = false;
	this.SCL = false;
	this.SDA_OLD = false;
	this.SDA = false;
	this.STATE = 0;
}

FC.prototype.Mapper16.prototype.Write = function(address, data) {
	switch (address & 0x000F) {
		case 0x0000:
			this.Core.SetChrRomPage1K(0, data);
			break;
		case 0x0001:
			this.Core.SetChrRomPage1K(1, data);
			break;
		case 0x0002:
			this.Core.SetChrRomPage1K(2, data);
			break;
		case 0x0003:
			this.Core.SetChrRomPage1K(3, data);
			break;
		case 0x0004:
			this.Core.SetChrRomPage1K(4, data);
			break;
		case 0x0005:
			this.Core.SetChrRomPage1K(5, data);
			break;
		case 0x0006:
			this.Core.SetChrRomPage1K(6, data);
			break;
		case 0x0007:
			this.Core.SetChrRomPage1K(7, data);
			break;
		case 0x0008:
			this.Core.SetPrgRomPage8K(0, data * 2);
			this.Core.SetPrgRomPage8K(1, data * 2 + 1);
			break;

		case 0x0009:
			data &= 0x03;
			if(data == 0) {
				this.Core.SetMirror(false);
			} else if(data == 1) {
				this.Core.SetMirror(true);
			} else if(data == 2) {
				this.Core.SetMirrors(0, 0, 0, 0);
			} else {
				this.Core.SetMirrors(1, 1, 1, 1);
			}
			break;

		case 0x000A:
			this.MAPPER_REG[0] = data & 0x01;
			this.ClearIRQ();
			break;

		case 0x000B:
			this.MAPPER_REG[1] = (this.MAPPER_REG[1] & 0xFF00) | data;
			break;

		case 0x000C:
			this.MAPPER_REG[1] = (this.MAPPER_REG[1] & 0x00FF) | (data << 8);
			break;

		case 0x000D:
			this.SCL_OLD = this.SCL;
			this.SCL = (data & 0x20) == 0x20;
			this.SDA_OLD = this.SDA;
			this.SDA = (data & 0x40) == 0x40;

			if(this.SCL_OLD && this.SCL && this.SDA_OLD && !this.SDA) {//START
				this.STATE = 1;
				this.BIT_DATA_TMP = 0;
				this.BIT_COUNTER = 0;
			}

			if(this.SCL_OLD && this.SCL && !this.SDA_OLD && this.SDA) {//STOP
				this.STATE = 0;
			}

			if(!this.SCL_OLD && this.SCL) {
				switch(this.STATE) {
					case 1://CONTROL BYTE
						if(this.BIT_IN()) {
							this.READ_WRITE = (this.BIT_DATA & 0x01) == 0x01;
							this.STATE = this.READ_WRITE ? 4 : 2;
						}
						break;

					case 2://ADDRESS
						if(this.BIT_IN()) {
							this.STATE = 3;
							this.EEPROM_ADDRESS = this.BIT_DATA;
						}
						break;

					case 3://WRITE
						if(this.BIT_IN()) {
							this.EEPROM[this.EEPROM_ADDRESS] = this.BIT_DATA;
							this.EEPROM_ADDRESS = (this.EEPROM_ADDRESS + 1) & 0xFF;
						}
						break;

					case 4://READ
						if(this.BIT_COUNTER == 0) {
							this.BIT_DATA = this.EEPROM[this.EEPROM_ADDRESS];
							this.EEPROM_ADDRESS = (this.EEPROM_ADDRESS + 1) & 0xFF;
						}
						this.BIT_OUT();
						break;
				}
			}
			break;
	}
}

FC.prototype.Mapper16.prototype.BIT_OUT = function () {
	if(this.BIT_COUNTER == 8) {
		this.BIT_COUNTER = 0;//ACK;
		return true;
	} else {
		this.OUT_DATA = (this.BIT_DATA & 0x80) >>> 3;

		this.BIT_DATA = (this.BIT_DATA << 1) & 0xFF;
		this.BIT_COUNTER++;
	}
	return false;
}

FC.prototype.Mapper16.prototype.BIT_IN = function () {
	if(this.BIT_COUNTER == 8) {
		this.BIT_COUNTER = 0;
		this.OUT_DATA = 0;//ACK;
		return true;
	} else {
		this.BIT_DATA = ((this.BIT_DATA << 1) | (this.SDA ? 0x01 : 0x00)) & 0xFF;
		this.BIT_COUNTER++;
	}
	return false;
}

FC.prototype.Mapper16.prototype.ReadSRAM = function(address) {
	return this.OUT_DATA;
}

FC.prototype.Mapper16.prototype.WriteSRAM = function(address, data) {
	this.Write(address, data);
}

FC.prototype.Mapper16.prototype.CPUSync = function(clock) {
	if(this.MAPPER_REG[0] == 0x01) {
		if(this.MAPPER_REG[1] == 0x0000)
			this.MAPPER_REG[1] = 0x10000;

		this.MAPPER_REG[1] -= clock;

		if(this.MAPPER_REG[1] <= 0) {
			this.SetIRQ();
			this.MAPPER_REG[0] = 0x00;
			this.MAPPER_REG[1] = 0x0000;
		}
	}
}


/**** Mapper18 ****/
FC.prototype.Mapper18 = function(core) {
	FC.prototype.MapperProto.apply(this, arguments);
	this.MAPPER_REG = new Array(15);
	this.IRQ_Counter = 0;
}

FC.prototype.Mapper18.prototype = Object.create(FC.prototype.MapperProto.prototype);

FC.prototype.Mapper18.prototype.Init = function() {
	for(var i=0; i<this.MAPPER_REG.length; i++)
		this.MAPPER_REG[i] = 0;
	this.IRQ_Counter = 0;

	this.Core.SetPrgRomPages8K(0, 1, 2, this.Core.PrgRomPageCount * 2 - 1);
	this.Core.SetChrRomPages1K(0, 1, 2, 3, 4, 5, 6, 7);
}

FC.prototype.Mapper18.prototype.Write = function(address, data) {
	if(address >= 0x8000 && address < 0xE000) {
		var i = ((address & 0x7000) >>> 11) | ((address & 0x0002) >>> 1);
		if((address & 0x0001) == 0x0000)
			this.MAPPER_REG[i] = (this.MAPPER_REG[i] & 0xF0) | (data & 0x0F);
		else
			this.MAPPER_REG[i] = (this.MAPPER_REG[i] & 0x0F) | ((data & 0x0F) << 4);
		if(i < 3)
			this.Core.SetPrgRomPage8K(i, this.MAPPER_REG[i]);
		if(i >= 4)
			this.Core.SetChrRomPage1K(i - 4, this.MAPPER_REG[i]);
		return;
	}

	switch (address & 0xF003) {
		case 0xE000:
		case 0xE001:
		case 0xE002:
		case 0xE003:
			var tmp = (address & 0x0003) * 4;
			this.MAPPER_REG[12] = (this.MAPPER_REG[12] & ~(0x000F << tmp)) | ((data & 0x0F) << tmp);
			break;
		case 0xF000:
			this.IRQ_Counter = this.MAPPER_REG[12];
			this.ClearIRQ();
			break;
		case 0xF001:
			this.MAPPER_REG[13] = data;
			this.ClearIRQ();
			break;
		case 0xF002:
			this.MAPPER_REG[14] = data;
			data &= 0x03;
			if(data == 0) {
				this.Core.SetMirror(true);
			} else if(data == 1) {
				this.Core.SetMirror(false);
			} else if(data == 2) {
				this.Core.SetMirrors(0, 0, 0, 0);
			} else {
				this.Core.SetMirrors(1, 1, 1, 1);
			}
			break;
	}
}

FC.prototype.Mapper18.prototype.CPUSync = function(clock) {
	if((this.MAPPER_REG[13] & 0x01) == 0x01) {
		var mask;
		switch(this.MAPPER_REG[13] & 0x0E) {
			case 0x00:
				mask = 0xFFFF;
				break;
			case 0x02:
				mask = 0x0FFF;
				break;
			case 0x04:
			case 0x06:
				mask = 0x00FF;
				break;
			case 0x08:
			case 0x0A:
			case 0x0C:
			case 0x0E:
				mask = 0x000F;
				break;
		}

		var tmp = (this.IRQ_Counter & mask) - clock;

		if(tmp < 0)
			this.SetIRQ();

		this.IRQ_Counter = (this.IRQ_Counter & ~mask) | (tmp & mask);
	}
}


/**** Mapper19 ****/
FC.prototype.Mapper19 = function(core) {
	FC.prototype.MapperProto.apply(this, arguments);
	this.MAPPER_REG = new Array(5);
	this.EX_VRAM = new Array(32);
}

FC.prototype.Mapper19.prototype = Object.create(FC.prototype.MapperProto.prototype);

FC.prototype.Mapper19.prototype.Init = function() {
	for(var i=0; i<this.MAPPER_REG.length; i++)
		this.MAPPER_REG[i] = 0;

	for(var i=0; i<this.EX_VRAM.length; i++) {
		this.EX_VRAM[i] = new Array(0x0400);
		for(var j=0; j<this.EX_VRAM[i].length; j++)
			this.EX_VRAM[i][j] = 0x00;
	}

	this.Core.SetPrgRomPages8K(0, 1, this.Core.PrgRomPageCount * 2 - 2, this.Core.PrgRomPageCount * 2 - 1);

	if(this.Core.ChrRomPageCount >= 1){
		this.Core.SetChrRomPages1K(this.Core.ChrRomPageCount * 8 - 8, this.Core.ChrRomPageCount * 8 - 7,
						this.Core.ChrRomPageCount * 8 - 6, this.Core.ChrRomPageCount * 8 - 5,
						this.Core.ChrRomPageCount * 8 - 4, this.Core.ChrRomPageCount * 8 - 3,
						this.Core.ChrRomPageCount * 8 - 2, this.Core.ChrRomPageCount * 8 - 1);
	}

}

FC.prototype.Mapper19.prototype.ReadLow = function(address) {
	switch(address & 0xF800) {
		case 0x4800:
			return this.Core.Read_N163_RAM();
		case 0x5000:
			this.ClearIRQ();
			return (this.MAPPER_REG[4] & 0x00FF);
		case 0x5800:
			this.ClearIRQ();
			return (this.MAPPER_REG[3] << 7) | ((this.MAPPER_REG[4] & 0x7F00) >> 8);
	}
	return 0x00;
}

FC.prototype.Mapper19.prototype.WriteLow = function(address, data) {
	switch (address & 0xF800) {
		case 0x4800:
			if(address == 0x4800) {
				this.Core.Write_N163_RAM(data);
			}
			break;

		case 0x5000:
			this.MAPPER_REG[4] = (this.MAPPER_REG[4] & 0xFF00) | data;
			this.ClearIRQ();
			break;

		case 0x5800:
			this.MAPPER_REG[4] = (this.MAPPER_REG[4] & 0x00FF) | ((data & 0x7F) << 8);
			this.MAPPER_REG[3] = (data & 0x80) >> 7;
			this.ClearIRQ();
			break;
	}
}

FC.prototype.Mapper19.prototype.Write = function(address, data) {
	switch (address & 0xF800) {
		case 0x8000:
			if(data < 0xE0 || this.MAPPER_REG[0] == 1) {
				this.Core.SetChrRomPage1K(0, data);
			} else {
				this.Core.VRAM[0] = this.EX_VRAM[data &0xE0];
			}
			break;

		case 0x8800:
			if(data < 0xE0 || this.MAPPER_REG[0] == 1) {
				this.Core.SetChrRomPage1K(1, data);
			} else {
				this.Core.VRAM[1] = this.EX_VRAM[data &0xE0];
			}
			break;

		case 0x9000:
			if(data < 0xE0 || this.MAPPER_REG[0] == 1) {
				this.Core.SetChrRomPage1K(2, data);
			} else {
				this.Core.VRAM[2] = this.EX_VRAM[data &0xE0];
			}
			break;

		case 0x9800:
			if(data < 0xE0 || this.MAPPER_REG[0] == 1) {
				this.Core.SetChrRomPage1K(3, data);
			} else {
				this.Core.VRAM[3] = this.EX_VRAM[data &0xE0];
			}
			break;

		case 0xA000:
			if(data < 0xE0 || this.MAPPER_REG[1] == 1) {
				this.Core.SetChrRomPage1K(4, data);
			} else {
				this.Core.VRAM[4] = this.EX_VRAM[data &0xE0];
			}
			break;

		case 0xA800:
			if(data < 0xE0 || this.MAPPER_REG[1] == 1) {
				this.Core.SetChrRomPage1K(5, data);
			} else {
				this.Core.VRAM[5] = this.EX_VRAM[data &0xE0];
			}
			break;

		case 0xB000:
			if(data < 0xE0 || this.MAPPER_REG[1] == 1) {
				this.Core.SetChrRomPage1K(6, data);
			} else {
				this.Core.VRAM[6] = this.EX_VRAM[data &0xE0];
			}
			break;

		case 0xB800:
			if(data < 0xE0 || this.MAPPER_REG[1] == 1) {
				this.Core.SetChrRomPage1K(7, data);
			} else {
				this.Core.VRAM[7] = this.EX_VRAM[data &0xE0];
			}
			break;

		case 0xC000:
			if(data < 0xE0) {
				this.Core.SetChrRomPage1K(8, data);
			} else {
				this.Core.VRAM[8] = this.Core.VRAMS[(data & 0x01) + 8];
			}
			break;

		case 0xC800:
			if(data < 0xE0) {
				this.Core.SetChrRomPage1K(9, data);
			} else {
				this.Core.VRAM[9] = this.Core.VRAMS[(data & 0x01) + 8];
			}
			break;

		case 0xD000:
			if(data < 0xE0) {
				this.Core.SetChrRomPage1K(10, data);
			} else {
				this.Core.VRAM[10] = this.Core.VRAMS[(data & 0x01) + 8];
			}
			break;

		case 0xD800:
			if(data < 0xE0) {
				this.Core.SetChrRomPage1K(11, data);
			} else {
				this.Core.VRAM[11] = this.Core.VRAMS[(data & 0x01) + 8];
			}
			break;

		case 0xE000:
			this.Core.SetPrgRomPage8K(0, data & 0x3F);
			break;

		case 0xE800:
			this.Core.SetPrgRomPage8K(1, data & 0x3F);
			this.MAPPER_REG[0] = (data & 0x40) >> 6;
			this.MAPPER_REG[1] = (data & 0x80) >> 7;
			break;

		case 0xF000:
			this.Core.SetPrgRomPage8K(2, data & 0x3F);
			break;

		case 0xF800:
			if(address == 0xF800) {
				this.Core.N163_Address = data;
			}
			break;
	}
}

FC.prototype.Mapper19.prototype.CPUSync = function(clock) {
	if(this.MAPPER_REG[3] != 0) {
		this.MAPPER_REG[4] += clock;
		if(this.MAPPER_REG[4] >= 0x7FFF) {
			this.MAPPER_REG[4] -= 0x7FFF;
			this.SetIRQ();
		}
	}
}

FC.prototype.Mapper19.prototype.OutEXSound = function(soundin) {
	return (soundin >> 1) + (this.Core.Out_N163() >> 1);
}

FC.prototype.Mapper19.prototype.EXSoundSync = function(clock) {
	this.Core.Count_N163(clock);
}


/**** Mapper20 ****/
FC.prototype.Mapper20 = function(core) {
	FC.prototype.MapperProto.apply(this, arguments);

	this.Disk = null;
	this.DISK_PAGES = null;
	this.DISK_PAGES_COUNT = 0;

	this.MAPPER_REG = new Array(8);

	this.Side = -1;
	this.Position = 0;

	this.IrqEnable = 0;
	this.IrqCounter = 0;
	this.IrqLatch = 0;

	this.IrqWait = 0;
	this.WriteSkip = 0;
}

FC.prototype.Mapper20.prototype = Object.create(FC.prototype.MapperProto.prototype);

FC.prototype.Mapper20.prototype.Init = function() {
	for(var i=0; i<this.MAPPER_REG.length; i++)
		this.MAPPER_REG[i] = 0;

	this.Core.SetPrgRomPage8K(3, 3);
}

FC.prototype.Mapper20.prototype.Write = function(address, data) {
	switch(address & 0xE000) {
		case 0x8000:
			this.Core.ROM[0][address & 0x1FFF] = data;
			break;
		case 0xA000:
			this.Core.ROM[1][address & 0x1FFF] = data;
			break;
		case 0xC000:
			this.Core.ROM[2][address & 0x1FFF] = data;
			break;
	}
}

FC.prototype.Mapper20.prototype.InDisk = function() {
	if(this.DISK_PAGES_COUNT == 0)
		return -2;
	return this.Side;
}

FC.prototype.Mapper20.prototype.GetDiskPagesCount = function() {
	return this.DISK_PAGES_COUNT;
}

FC.prototype.Mapper20.prototype.InsertDisk = function(side) {
	if(this.DISK_PAGES_COUNT > 0 && side < this.DISK_PAGES_COUNT && this.Side == -1) {
		this.Side = side;
		this.Position = 0;
		return true;
	}
	return false;
}

FC.prototype.Mapper20.prototype.EjectDisk = function() {
	this.Side = -1;
}

FC.prototype.Mapper20.prototype.SetDisk = function(disk) {
	this.Disk = disk.concat(0);
	var padd = 0;

	if(this.Disk[0] == 0x46 && this.Disk[1] == 0x44 && this.Disk[2] == 0x53 && this.Disk[3] == 0x1A) {
		this.DISK_PAGES_COUNT = this.Disk[4];
		var padd = 16;
	} else
		this.DISK_PAGES_COUNT = (this.Disk.length / 65500) | 0;
	this.DISK_PAGES = new Array(this.DISK_PAGES_COUNT);
	for(var i=0; i<this.DISK_PAGES_COUNT; i++)
		this.DISK_PAGES[i] = this.Disk.slice(padd + 65500 * i, padd + 65500 * (i + 1));

	this.Side = -1;
	this.Position = 0;
}

FC.prototype.Mapper20.prototype.ReadLow = function(address) {
	switch (address) {
		case 0x4030:
			var tmp = (this.Core.toIRQ & 0x0C) >> 2;
			this.ClearIRQ();
			this.ClearSeekIRQ();
			return tmp;
		case 0x4031:
			if(this.Side > -1) {
				var tmp = this.DISK_PAGES[this.Side][this.Position];
					this.Position += this.Position < 64999 ? 1 : 0;
					this.IrqWait = 200;
					this.ClearSeekIRQ();
				return tmp;
			} else
				return 0xFF;
		case 0x4032:
			var tmp = this.Side > -1 ? 0x40 : 0x45;
			tmp |= ((this.Side > -1) && ((this.MAPPER_REG[5] & 0x03) == 0x01)) ? 0x00 : 0x02;
			return tmp;
		case 0x4033:
			return 0x80;
	}
	return 0x00;
}

FC.prototype.Mapper20.prototype.WriteLow = function(address, data) {
	if(address >= 0x4040 && address <= 0x407F) {
		this.Core.Write_FDS_WAVE_REG(address - 0x4040, data);
		return;
	}

	if(address >= 0x4080 && address <= 0x408A) {
		this.Core.Write_FDS_REG(address - 0x4080, data);
		return;
	}

	switch (address) {
		case 0x4020:
			this.IrqLatch = (this.IrqLatch & 0xFF00) | data;
			break;
		case 0x4021:
			this.IrqLatch = (this.IrqLatch & 0x00FF) | (data << 8);
			break;
		case 0x4022:
			this.IrqCounter = this.IrqLatch;
			this.IrqEnable = data & 0x03;
			break;
		case 0x4023:
			break;
		case 0x4024:
			if (this.Side > -1 && (this.MAPPER_REG[5] & 0x04) != 0x04 && (this.MAPPER_REG[3] & 0x01) == 0x01) {
				if (this.Position >= 0 && this.Position < 65500) {
					if (this.WriteSkip > 0)
						this.WriteSkip--;
					else if (this.Position >= 2) {
						this.DISK_PAGES[this.Side][this.Position - 2] = data;
					}
				}
			}
			break;
		case 0x4025:
			this.ClearSeekIRQ();
			if(this.Side > -1) {
				if((data & 0x40) != 0x40) {
					if((this.MAPPER_REG[5] & 0x40) == 0x40 && (data & 0x10) != 0x10) {
						this.IrqWait = 200;
						this.Position -= 2;
					}
					if(this.Position < 0)
						this.Position = 0;
				}
				if((data & 0x04) != 0x04)
					this.WriteSkip = 2;
				if((data & 0x02) == 0x02) {
					this.Position = 0;
					this.IrqWait = 200;
				}
				if((data & 0x40) == 0x40) {
					this.IrqWait = 200;
				}
			}

			this.Core.SetMirror((data & 0x08) == 0x08);
			break;
	}
	this.MAPPER_REG[address & 0x0007] = data;
}

FC.prototype.Mapper20.prototype.SetSeekIRQ = function() {
	this.Core.toIRQ |= 0x08;
}

FC.prototype.Mapper20.prototype.ClearSeekIRQ = function() {
	this.Core.toIRQ &= ~0x08;
}

FC.prototype.Mapper20.prototype.CPUSync = function(clock) {
	if ((this.IrqEnable & 0x02) == 0x02 && this.IrqCounter > 0) {
		this.IrqCounter -= clock;
		if (this.IrqCounter <= 0) {
			if ((this.IrqEnable & 0x01) != 0x01) {
				this.IrqEnable &= ~0x02;
				this.IrqCounter = 0;
				this.IrqLatch = 0;
			} else
				this.IrqCounter = this.IrqLatch;
				this.SetIRQ();
		}
	}

	if(this.IrqWait > 0) {
		this.IrqWait -= clock;
		if(this.IrqWait <= 0) {
			if((this.MAPPER_REG[5] & 0x80) == 0x80) {
				this.SetSeekIRQ();
			}
		}
	}
}

FC.prototype.Mapper20.prototype.OutEXSound = function(soundin) {
	return (soundin >> 1) + (this.Core.Out_FDS() >> 1);
}

FC.prototype.Mapper20.prototype.EXSoundSync = function(clock) {
	this.Core.Count_FDS(clock);
}


/**** Mapper22 ****/
FC.prototype.Mapper22 = function(core) {
	FC.prototype.MapperProto.apply(this, arguments);
	this.MAPPER_REG = new Array(16);
}

FC.prototype.Mapper22.prototype = Object.create(FC.prototype.MapperProto.prototype);

FC.prototype.Mapper22.prototype.Init = function() {
	var i;
	for(i=0; i<this.MAPPER_REG.length; i++)
		this.MAPPER_REG[i] = 0;

	this.Core.SetPrgRomPages8K(0, 1, this.Core.PrgRomPageCount * 2 - 2, this.Core.PrgRomPageCount * 2 - 1);

	if(this.Core.ChrRomPageCount != 0) {
		this.Core.SetChrRomPages1K(0, 1, 2, 3, 4, 5, 6, 7);
	}
}

FC.prototype.Mapper22.prototype.Write = function(address, data) {
	switch (address & 0xF000) {
		case 0x8000:
			if((this.MAPPER_REG[10] & 0x02) != 0)
				this.Core.SetPrgRomPage8K(2, data);
			else
				this.Core.SetPrgRomPage8K(0, data);
			break;

		case 0xA000:
			this.Core.SetPrgRomPage8K(1, data);
			break;
	}

	switch (address & 0xF00F) {
		case 0x9000:
			data &= 0x03;
			if(data == 0) {
				this.Core.SetMirror(false);
			} else if(data == 1) {
				this.Core.SetMirror(true);
			} else if(data == 2) {
				this.Core.SetMirrors(0, 0, 0, 0);
			} else {
				this.Core.SetMirrors(1, 1, 1, 1);
			}
			break;

		case 0x9008:
			this.MAPPER_REG[10] = data;
			break;

		case 0xB000:
			this.MAPPER_REG[0] = (this.MAPPER_REG[0] & 0xF0) | (data & 0x0F);
			this.Core.SetChrRomPage1K(0, this.MAPPER_REG[0] >> 1);
			break;

		case 0xB002:
		case 0xB008:
			this.MAPPER_REG[0] = (this.MAPPER_REG[0] & 0x0F) | ((data & 0x0F) << 4);
			this.Core.SetChrRomPage1K(0, this.MAPPER_REG[0] >> 1);
			break;

		case 0xB001:
		case 0xB004:
			this.MAPPER_REG[1] = (this.MAPPER_REG[1] & 0xF0) | (data & 0x0F);
			this.Core.SetChrRomPage1K(1, this.MAPPER_REG[1] >> 1);
			break;

		case 0xB003:
		case 0xB00C:
			this.MAPPER_REG[1] = (this.MAPPER_REG[1] & 0x0F) | ((data & 0x0F) << 4);
			this.Core.SetChrRomPage1K(1, this.MAPPER_REG[1] >> 1);
			break;

		case 0xC000:
			this.MAPPER_REG[2] = (this.MAPPER_REG[2] & 0xF0) | (data & 0x0F);
			this.Core.SetChrRomPage1K(2, this.MAPPER_REG[2] >> 1);
			break;

		case 0xC002:
		case 0xC008:
			this.MAPPER_REG[2] = (this.MAPPER_REG[2] & 0x0F) | ((data & 0x0F) << 4);
			this.Core.SetChrRomPage1K(2, this.MAPPER_REG[2] >> 1);
			break;

		case 0xC001:
		case 0xC004:
			this.MAPPER_REG[3] = (this.MAPPER_REG[3] & 0xF0) | (data & 0x0F);
			this.Core.SetChrRomPage1K(3, this.MAPPER_REG[3] >> 1);
			break;

		case 0xC003:
		case 0xC00C:
			this.MAPPER_REG[3] = (this.MAPPER_REG[3] & 0x0F) | ((data & 0x0F) << 4);
			this.Core.SetChrRomPage1K(3, this.MAPPER_REG[3] >> 1);
			break;

		case 0xD000:
			this.MAPPER_REG[4] = (this.MAPPER_REG[4] & 0xF0) | (data & 0x0F);
			this.Core.SetChrRomPage1K(4, this.MAPPER_REG[4] >> 1);
			break;

		case 0xD002:
		case 0xD008:
			this.MAPPER_REG[4] = (this.MAPPER_REG[4] & 0x0F) | ((data & 0x0F) << 4);
			this.Core.SetChrRomPage1K(4, this.MAPPER_REG[4] >> 1);
			break;

		case 0xD001:
		case 0xD004:
			this.MAPPER_REG[5] = (this.MAPPER_REG[5] & 0xF0) | (data & 0x0F);
			this.Core.SetChrRomPage1K(5, this.MAPPER_REG[5] >> 1);
			break;

		case 0xD003:
		case 0xD00C:
			this.MAPPER_REG[5] = (this.MAPPER_REG[5] & 0x0F) | ((data & 0x0F) << 4);
			this.Core.SetChrRomPage1K(5, this.MAPPER_REG[5] >> 1);
			break;

		case 0xE000:
			this.MAPPER_REG[6] = (this.MAPPER_REG[6] & 0xF0) | (data & 0x0F);
			this.Core.SetChrRomPage1K(6, this.MAPPER_REG[6] >> 1);
			break;

		case 0xE002:
		case 0xE008:
			this.MAPPER_REG[6] = (this.MAPPER_REG[6] & 0x0F) | ((data & 0x0F) << 4);
			this.Core.SetChrRomPage1K(6, this.MAPPER_REG[6] >> 1);
			break;

		case 0xE001:
		case 0xE004:
			this.MAPPER_REG[7] = (this.MAPPER_REG[7] & 0xF0) | (data & 0x0F);
			this.Core.SetChrRomPage1K(7, this.MAPPER_REG[7] >> 1);
			break;

		case 0xE003:
		case 0xE00C:
			this.MAPPER_REG[7] = (this.MAPPER_REG[7] & 0x0F) | ((data & 0x0F) << 4);
			this.Core.SetChrRomPage1K(7, this.MAPPER_REG[7] >> 1);
			break;
	}
}


/**** Mapper23 ****/
FC.prototype.Mapper23 = function(core) {
	FC.prototype.MapperProto.apply(this, arguments);
	this.MAPPER_REG = new Array(16);
}

FC.prototype.Mapper23.prototype = Object.create(FC.prototype.MapperProto.prototype);

FC.prototype.Mapper23.prototype.Init = function() {
	var i;
	for(i=0; i<this.MAPPER_REG.length; i++)
		this.MAPPER_REG[i] = 0;

	this.Core.SetPrgRomPages8K(0, 1, this.Core.PrgRomPageCount * 2 - 2, this.Core.PrgRomPageCount * 2 - 1);

	if(this.Core.ChrRomPageCount != 0) {
		this.Core.SetChrRomPages1K(0, 1, 2, 3, 4, 5, 6, 7);
	}
}

FC.prototype.Mapper23.prototype.Write = function(address, data) {
	switch (address & 0xF000) {
		case 0x8000:
			if((this.MAPPER_REG[10] & 0x02) != 0)
				this.Core.SetPrgRomPage8K(2, data);
			else
				this.Core.SetPrgRomPage8K(0, data);
			break;

		case 0xA000:
			this.Core.SetPrgRomPage8K(1, data);
			break;
	}

	switch (address & 0xF00F) {
		case 0x9000:
			data &= 0x03;
			if(data == 0) {
				this.Core.SetMirror(false);
			} else if(data == 1) {
				this.Core.SetMirror(true);
			} else if(data == 2) {
				this.Core.SetMirrors(0, 0, 0, 0);
			} else {
				this.Core.SetMirrors(1, 1, 1, 1);
			}
			break;

		case 0x9008:
			this.MAPPER_REG[10] = data;
			break;

		case 0xB000:
			this.MAPPER_REG[0] = (this.MAPPER_REG[0] & 0xF0) | (data & 0x0F);
			this.Core.SetChrRomPage1K(0, this.MAPPER_REG[0]);
			break;

		case 0xB001:
		case 0xB004:
			this.MAPPER_REG[0] = (this.MAPPER_REG[0] & 0x0F) | ((data & 0x0F) << 4);
			this.Core.SetChrRomPage1K(0, this.MAPPER_REG[0]);
			break;

		case 0xB002:
		case 0xB008:
			this.MAPPER_REG[1] = (this.MAPPER_REG[1] & 0xF0) | (data & 0x0F);
			this.Core.SetChrRomPage1K(1, this.MAPPER_REG[1]);
			break;

		case 0xB003:
		case 0xB00C:
			this.MAPPER_REG[1] = (this.MAPPER_REG[1] & 0x0F) | ((data & 0x0F) << 4);
			this.Core.SetChrRomPage1K(1, this.MAPPER_REG[1]);
			break;

		case 0xC000:
			this.MAPPER_REG[2] = (this.MAPPER_REG[2] & 0xF0) | (data & 0x0F);
			this.Core.SetChrRomPage1K(2, this.MAPPER_REG[2]);
			break;

		case 0xC001:
		case 0xC004:
			this.MAPPER_REG[2] = (this.MAPPER_REG[2] & 0x0F) | ((data & 0x0F) << 4);
			this.Core.SetChrRomPage1K(2, this.MAPPER_REG[2]);
			break;

		case 0xC002:
		case 0xC008:
			this.MAPPER_REG[3] = (this.MAPPER_REG[3] & 0xF0) | (data & 0x0F);
			this.Core.SetChrRomPage1K(3, this.MAPPER_REG[3]);
			break;

		case 0xC003:
		case 0xC00C:
			this.MAPPER_REG[3] = (this.MAPPER_REG[3] & 0x0F) | ((data & 0x0F) << 4);
			this.Core.SetChrRomPage1K(3, this.MAPPER_REG[3]);
			break;

		case 0xD000:
			this.MAPPER_REG[4] = (this.MAPPER_REG[4] & 0xF0) | (data & 0x0F);
			this.Core.SetChrRomPage1K(4, this.MAPPER_REG[4]);
			break;

		case 0xD001:
		case 0xD004:
			this.MAPPER_REG[4] = (this.MAPPER_REG[4] & 0x0F) | ((data & 0x0F) << 4);
			this.Core.SetChrRomPage1K(4, this.MAPPER_REG[4]);
			break;

		case 0xD002:
		case 0xD008:
			this.MAPPER_REG[5] = (this.MAPPER_REG[5] & 0xF0) | (data & 0x0F);
			this.Core.SetChrRomPage1K(5, this.MAPPER_REG[5]);
			break;

		case 0xD003:
		case 0xD00C:
			this.MAPPER_REG[5] = (this.MAPPER_REG[5] & 0x0F) | ((data & 0x0F) << 4);
			this.Core.SetChrRomPage1K(5, this.MAPPER_REG[5]);
			break;

		case 0xE000:
			this.MAPPER_REG[6] = (this.MAPPER_REG[6] & 0xF0) | (data & 0x0F);
			this.Core.SetChrRomPage1K(6, this.MAPPER_REG[6]);
			break;

		case 0xE001:
		case 0xE004:
			this.MAPPER_REG[6] = (this.MAPPER_REG[6] & 0x0F) | ((data & 0x0F) << 4);
			this.Core.SetChrRomPage1K(6, this.MAPPER_REG[6]);
			break;

		case 0xE002:
		case 0xE008:
			this.MAPPER_REG[7] = (this.MAPPER_REG[7] & 0xF0) | (data & 0x0F);
			this.Core.SetChrRomPage1K(7, this.MAPPER_REG[7]);
			break;

		case 0xE003:
		case 0xE00C:
			this.MAPPER_REG[7] = (this.MAPPER_REG[7] & 0x0F) | ((data & 0x0F) << 4);
			this.Core.SetChrRomPage1K(7, this.MAPPER_REG[7]);
			break;

		case 0xF000:
			this.MAPPER_REG[13] = (this.MAPPER_REG[13] & 0xF0) | (data & 0x0F);
			break;

		case 0xF001:
		case 0xF004:
			this.MAPPER_REG[13] = (this.MAPPER_REG[13] & 0x0F) | ((data & 0x0F) << 4);
			break;

		case 0xF002:
		case 0xF008:
			this.MAPPER_REG[11] = data & 0x07;
			if((this.MAPPER_REG[11] & 0x02) != 0) {
				this.MAPPER_REG[12] = this.MAPPER_REG[13];
			}
			break;

		case 0xF003:
		case 0xF00C:
			if((this.MAPPER_REG[11] & 0x01) != 0) {
				this.MAPPER_REG[11] |= 0x02;
			} else {
				this.MAPPER_REG[11] &= 0x01;
			}
			this.ClearIRQ();
			break;
	}
}

FC.prototype.Mapper23.prototype.HSync = function(y) {
	if((this.MAPPER_REG[11] & 0x06) == 0x02) {
		if(this.MAPPER_REG[12] == 0xFF) {
			this.MAPPER_REG[12] = this.MAPPER_REG[13];
			this.SetIRQ();
		} else
			this.MAPPER_REG[12]++;
	}
}

FC.prototype.Mapper23.prototype.CPUSync = function(clock) {
	if((this.MAPPER_REG[11] & 0x06) == 0x06) {
		if(this.MAPPER_REG[12] >= 0xFF) {
			this.MAPPER_REG[12] = this.MAPPER_REG[13];
			this.SetIRQ();
		} else
			this.MAPPER_REG[12] += clock;
	}
}


/**** Mapper24 ****/
FC.prototype.Mapper24 = function(core) {
	FC.prototype.MapperProto.apply(this, arguments);
	this.MAPPER_REG = new Array(3);
}

FC.prototype.Mapper24.prototype = Object.create(FC.prototype.MapperProto.prototype);

FC.prototype.Mapper24.prototype.Init = function() {
	this.MAPPER_REG[0] = 0x00;
	this.MAPPER_REG[1] = 0x00;
	this.MAPPER_REG[2] = 0x00;
	this.Core.SetPrgRomPages8K(0, 1, 2, this.Core.PrgRomPageCount * 2 - 1);
	this.Core.SetChrRomPages1K(0, 1, 2, 3, 4, 5, 6, 7);
}

FC.prototype.Mapper24.prototype.Write = function(address, data) {
	switch(address & 0xF003) {
		case 0x8000:
		case 0x8001:
		case 0x8002:
		case 0x8003:
			this.Core.SetPrgRomPage8K(0, data * 2);
			this.Core.SetPrgRomPage8K(1, data * 2 + 1);
			break;


		case 0x9000:
		case 0x9001:
		case 0x9002:
			this.Core.Write_VRC6_REG(address & 0x03, data);
			break;


		case 0xA000:
		case 0xA001:
		case 0xA002:
			this.Core.Write_VRC6_REG((address & 0x03) + 4, data);
			break;


		case 0xB000:
		case 0xB001:
		case 0xB002:
			this.Core.Write_VRC6_REG((address & 0x03) + 8, data);
			break;


		case 0xB003:
			data &= 0x0C;
			if(data == 0x00) {
				this.Core.SetMirror(false);
			} else if(data == 0x04) {
				this.Core.SetMirror(true);
			} else if(data == 0x08) {
				this.Core.SetMirrors(0, 0, 0, 0);
			} else {
				this.Core.SetMirrors(1, 1, 1, 1);
			}
			break;

		case 0xC000:
		case 0xC001:
		case 0xC002:
		case 0xC003:
			this.Core.SetPrgRomPage8K(2, data);
			break;

		case 0xD000:
		case 0xD001:
		case 0xD002:
		case 0xD003:
			this.Core.SetChrRomPage1K(address & 0x03, data);
			break;

		case 0xE000:
		case 0xE001:
		case 0xE002:
		case 0xE003:
			this.Core.SetChrRomPage1K((address & 0x03) + 4, data);
			break;

		case 0xF000:
			this.MAPPER_REG[0] = data;
			break;

		case 0xF001:
			this.MAPPER_REG[1] = data & 0x07;
			if((this.MAPPER_REG[1] & 0x02) != 0) {
				this.MAPPER_REG[2] = this.MAPPER_REG[0];
			}
			break;

		case 0xF002:
			if((this.MAPPER_REG[1] & 0x01) != 0) {
				this.MAPPER_REG[1] |= 0x02;
			} else {
				this.MAPPER_REG[1] &= 0x01;
			}
			this.ClearIRQ();
			break;
	}
}

FC.prototype.Mapper24.prototype.HSync = function(y) {
	if((this.MAPPER_REG[1] & 0x06) == 0x02) {
		if(this.MAPPER_REG[2] == 0xFF) {
			this.MAPPER_REG[2] = this.MAPPER_REG[0];
			this.SetIRQ();
		} else
			this.MAPPER_REG[2]++;
	}
}

FC.prototype.Mapper24.prototype.CPUSync = function(clock) {
	if((this.MAPPER_REG[1] & 0x06) == 0x06) {
		if(this.MAPPER_REG[2] >= 0xFF) {
			this.MAPPER_REG[2] = this.MAPPER_REG[0];
			this.SetIRQ();
		} else
			this.MAPPER_REG[2] += clock;
	}
}

FC.prototype.Mapper24.prototype.OutEXSound = function(soundin) {
	return (soundin >> 1) + (this.Core.Out_VRC6() >> 1);
}

FC.prototype.Mapper24.prototype.EXSoundSync = function(clock) {
	this.Core.Count_VRC6(clock);
}


/**** Mapper25 ****/
FC.prototype.Mapper25 = function(core) {
	FC.prototype.MapperProto.apply(this, arguments);
	this.MAPPER_REG = new Array(16);
}

FC.prototype.Mapper25.prototype = Object.create(FC.prototype.MapperProto.prototype);

FC.prototype.Mapper25.prototype.Init = function() {
	var i;
	for(i=0; i<this.MAPPER_REG.length; i++)
		this.MAPPER_REG[i] = 0;

	this.Core.SetPrgRomPages8K(0, 1, this.Core.PrgRomPageCount * 2 - 2, this.Core.PrgRomPageCount * 2 - 1);

	if(this.Core.ChrRomPageCount != 0) {
		this.Core.SetChrRomPages1K(0, 1, 2, 3, 4, 5, 6, 7);
	}
	this.MAPPER_REG[9] = this.Core.PrgRomPageCount * 2 - 2;
}

FC.prototype.Mapper25.prototype.Write = function(address, data) {
	switch (address & 0xF000) {
		case 0x8000:
			if((this.MAPPER_REG[10] & 0x02) != 0) {
				this.MAPPER_REG[9] = data;
				this.Core.SetPrgRomPage8K(2, data);
			} else {
				this.MAPPER_REG[8] = data;
				this.Core.SetPrgRomPage8K(0, data);
			}
			break;

		case 0xA000:
			this.Core.SetPrgRomPage8K(1, data);
			break;
	}

	switch (address & 0xF00F) {
		case 0x9000:
			data &= 0x03;
			if(data == 0) {
				this.Core.SetMirror(false);
			} else if(data == 1) {
				this.Core.SetMirror(true);
			} else if(data == 2) {
				this.Core.SetMirrors(0, 0, 0, 0);
			} else {
				this.Core.SetMirrors(1, 1, 1, 1);
			}
			break;

		case 0x9001:
		case 0x9004:
			if((this.MAPPER_REG[10] & 0x02) != (data & 0x02)) {
				var swap = this.MAPPER_REG[8];
				this.MAPPER_REG[8] = this.MAPPER_REG[9];
				this.MAPPER_REG[9] = swap;
				this.Core.SetPrgRomPage8K(0, this.MAPPER_REG[8]);
				this.Core.SetPrgRomPage8K(2, this.MAPPER_REG[9]);
			}
			this.MAPPER_REG[10] = data;
			break;

		case 0xB000:
			this.MAPPER_REG[0] = (this.MAPPER_REG[0] & 0xF0) | (data & 0x0F);
			this.Core.SetChrRomPage1K(0, this.MAPPER_REG[0]);
			break;

		case 0xB001:
		case 0xB004:
			this.MAPPER_REG[1] = (this.MAPPER_REG[1] & 0xF0) | (data & 0x0F);
			this.Core.SetChrRomPage1K(1, this.MAPPER_REG[1]);
			break;

		case 0xB002:
		case 0xB008:
			this.MAPPER_REG[0] = (this.MAPPER_REG[0] & 0x0F) | ((data & 0x0F) << 4);
			this.Core.SetChrRomPage1K(0, this.MAPPER_REG[0]);
			break;

		case 0xB003:
		case 0xB00C:
			this.MAPPER_REG[1] = (this.MAPPER_REG[1] & 0x0F) | ((data & 0x0F) << 4);
			this.Core.SetChrRomPage1K(1, this.MAPPER_REG[1]);
			break;

		case 0xC000:
			this.MAPPER_REG[2] = (this.MAPPER_REG[2] & 0xF0) | (data & 0x0F);
			this.Core.SetChrRomPage1K(2, this.MAPPER_REG[2]);
			break;

		case 0xC001:
		case 0xC004:
			this.MAPPER_REG[3] = (this.MAPPER_REG[3] & 0xF0) | (data & 0x0F);
			this.Core.SetChrRomPage1K(3, this.MAPPER_REG[3]);
			break;

		case 0xC002:
		case 0xC008:
			this.MAPPER_REG[2] = (this.MAPPER_REG[2] & 0x0F) | ((data & 0x0F) << 4);
			this.Core.SetChrRomPage1K(2, this.MAPPER_REG[2]);
			break;

		case 0xC003:
		case 0xC00C:
			this.MAPPER_REG[3] = (this.MAPPER_REG[3] & 0x0F) | ((data & 0x0F) << 4);
			this.Core.SetChrRomPage1K(3, this.MAPPER_REG[3]);
			break;

		case 0xD000:
			this.MAPPER_REG[4] = (this.MAPPER_REG[4] & 0xF0) | (data & 0x0F);
			this.Core.SetChrRomPage1K(4, this.MAPPER_REG[4]);
			break;

		case 0xD001:
		case 0xD004:
			this.MAPPER_REG[5] = (this.MAPPER_REG[5] & 0xF0) | (data & 0x0F);
			this.Core.SetChrRomPage1K(5, this.MAPPER_REG[5]);
			break;

		case 0xD002:
		case 0xD008:
			this.MAPPER_REG[4] = (this.MAPPER_REG[4] & 0x0F) | ((data & 0x0F) << 4);
			this.Core.SetChrRomPage1K(4, this.MAPPER_REG[4]);
			break;

		case 0xD003:
		case 0xD00C:
			this.MAPPER_REG[5] = (this.MAPPER_REG[5] & 0x0F) | ((data & 0x0F) << 4);
			this.Core.SetChrRomPage1K(5, this.MAPPER_REG[5]);
			break;

		case 0xE000:
			this.MAPPER_REG[6] = (this.MAPPER_REG[6] & 0xF0) | (data & 0x0F);
			this.Core.SetChrRomPage1K(6, this.MAPPER_REG[6]);
			break;

		case 0xE001:
		case 0xE004:
			this.MAPPER_REG[7] = (this.MAPPER_REG[7] & 0xF0) | (data & 0x0F);
			this.Core.SetChrRomPage1K(7, this.MAPPER_REG[7]);
			break;

		case 0xE002:
		case 0xE008:
			this.MAPPER_REG[6] = (this.MAPPER_REG[6] & 0x0F) | ((data & 0x0F) << 4);
			this.Core.SetChrRomPage1K(6, this.MAPPER_REG[6]);
			break;

		case 0xE003:
		case 0xE00C:
			this.MAPPER_REG[7] = (this.MAPPER_REG[7] & 0x0F) | ((data & 0x0F) << 4);
			this.Core.SetChrRomPage1K(7, this.MAPPER_REG[7]);
			break;

		case 0xF000:
			this.MAPPER_REG[13] = (this.MAPPER_REG[13] & 0xF0) | (data & 0x0F);
			break;

		case 0xF001:
		case 0xF004:
			this.MAPPER_REG[11] = data & 0x07;
			if((this.MAPPER_REG[11] & 0x02) != 0) {
				this.MAPPER_REG[12] = this.MAPPER_REG[13];
			}
			break;

		case 0xF002:
		case 0xF008:
			this.MAPPER_REG[13] = (this.MAPPER_REG[13] & 0x0F) | ((data & 0x0F) << 4);
			break;

		case 0xF003:
		case 0xF00C:
			if((this.MAPPER_REG[11] & 0x01) != 0) {
				this.MAPPER_REG[11] |= 0x02;
			} else {
				this.MAPPER_REG[11] &= 0x01;
			}
			this.ClearIRQ();
			break;
	}
}

FC.prototype.Mapper25.prototype.HSync = function(y) {
	if((this.MAPPER_REG[11] & 0x06) == 0x02) {
		if(this.MAPPER_REG[12] == 0xFF) {
			this.MAPPER_REG[12] = this.MAPPER_REG[13];
			this.SetIRQ();
		} else
			this.MAPPER_REG[12]++;
	}
}

FC.prototype.Mapper25.prototype.CPUSync = function(clock) {
	if((this.MAPPER_REG[11] & 0x06) == 0x06) {
		if(this.MAPPER_REG[12] >= 0xFF) {
			this.MAPPER_REG[12] = this.MAPPER_REG[13];
			this.SetIRQ();
		} else
			this.MAPPER_REG[12] += clock;
	}
}


/**** Mapper26 ****/
FC.prototype.Mapper26 = function(core) {
	FC.prototype.MapperProto.apply(this, arguments);
	this.MAPPER_REG = new Array(3);
}

FC.prototype.Mapper26.prototype = Object.create(FC.prototype.MapperProto.prototype);

FC.prototype.Mapper26.prototype.Init = function() {
	this.MAPPER_REG[0] = 0x00;
	this.MAPPER_REG[1] = 0x00;
	this.MAPPER_REG[2] = 0x00;
	this.Core.SetPrgRomPages8K(0, 1, 2, this.Core.PrgRomPageCount * 2 - 1);
	this.Core.SetChrRomPages1K(0, 1, 2, 3, 4, 5, 6, 7);
}

FC.prototype.Mapper26.prototype.Write = function(address, data) {
	address = (address & 0xFFFC) | ((address & 0x0002) >> 1) | ((address & 0x0001) << 1);

	switch(address & 0xF003) {
		case 0x8000:
		case 0x8001:
		case 0x8002:
		case 0x8003:
			this.Core.SetPrgRomPage8K(0, data * 2);
			this.Core.SetPrgRomPage8K(1, data * 2 + 1);
			break;


		case 0x9000:
		case 0x9001:
		case 0x9002:
			this.Core.Write_VRC6_REG(address & 0x03, data);
			break;


		case 0xA000:
		case 0xA001:
		case 0xA002:
			this.Core.Write_VRC6_REG((address & 0x03) + 4, data);
			break;


		case 0xB000:
		case 0xB001:
		case 0xB002:
			this.Core.Write_VRC6_REG((address & 0x03) + 8, data);
			break;


		case 0xB003:
			data &= 0x0C;
			if(data == 0x00) {
				this.Core.SetMirror(false);
			} else if(data == 0x04) {
				this.Core.SetMirror(true);
			} else if(data == 0x08) {
				this.Core.SetMirrors(0, 0, 0, 0);
			} else {
				this.Core.SetMirrors(1, 1, 1, 1);
			}
			break;

		case 0xC000:
		case 0xC001:
		case 0xC002:
		case 0xC003:
			this.Core.SetPrgRomPage8K(2, data);
			break;

		case 0xD000:
		case 0xD001:
		case 0xD002:
		case 0xD003:
			this.Core.SetChrRomPage1K(address & 0x03, data);
			break;

		case 0xE000:
		case 0xE001:
		case 0xE002:
		case 0xE003:
			this.Core.SetChrRomPage1K((address & 0x03) + 4, data);
			break;

		case 0xF000:
			this.MAPPER_REG[0] = data;
			break;

		case 0xF001:
			this.MAPPER_REG[1] = data & 0x07;
			if((this.MAPPER_REG[1] & 0x02) != 0) {
				this.MAPPER_REG[2] = this.MAPPER_REG[0];
			}
			this.ClearIRQ();
			break;

		case 0xF002:
			if((this.MAPPER_REG[1] & 0x01) != 0) {
				this.MAPPER_REG[1] |= 0x02;
			} else {
				this.MAPPER_REG[1] &= 0x01;
			}
			break;
	}
}

FC.prototype.Mapper26.prototype.HSync = function(y) {
	if((this.MAPPER_REG[1] & 0x06) == 0x02) {
		if(this.MAPPER_REG[2] == 0xFF) {
			this.MAPPER_REG[2] = this.MAPPER_REG[0];
			this.SetIRQ();
		} else
			this.MAPPER_REG[2]++;
	}
}

FC.prototype.Mapper26.prototype.CPUSync = function(clock) {
	if((this.MAPPER_REG[1] & 0x06) == 0x06) {
		if(this.MAPPER_REG[2] >= 0xFF) {
			this.MAPPER_REG[2] = this.MAPPER_REG[0];
			this.SetIRQ();
		} else
			this.MAPPER_REG[2] += clock;
	}
}

FC.prototype.Mapper26.prototype.OutEXSound = function(soundin) {
	return (soundin >> 1) + (this.Core.Out_VRC6() >> 1);
}

FC.prototype.Mapper26.prototype.EXSoundSync = function(clock) {
	this.Core.Count_VRC6(clock);
}


/**** Mapper32 ****/
FC.prototype.Mapper32 = function(core) {
	FC.prototype.MapperProto.apply(this, arguments);
	this.MAPPER_REG = new Array(11);
}

FC.prototype.Mapper32.prototype = Object.create(FC.prototype.MapperProto.prototype);

FC.prototype.Mapper32.prototype.Init = function() {
	for(var i=0; i<this.MAPPER_REG.length; i++)
		this.MAPPER_REG[i] = 0;

	this.Core.SetPrgRomPages8K(0, 1, this.Core.PrgRomPageCount * 2 - 2, this.Core.PrgRomPageCount * 2 - 1);
	this.Core.SetChrRomPages1K(0, 1, 2, 3, 4, 5, 6, 7);
}

FC.prototype.Mapper32.prototype.Write = function(address, data) {
	switch (address & 0xF000) {
		case 0x8000:
			this.MAPPER_REG[8] = data;
			if((this.MAPPER_REG[10] & 0x02) == 0x00)
				this.Core.SetPrgRomPage8K(0, data);
			else
				this.Core.SetPrgRomPage8K(2, data);
			break;
		case 0x9000:
			this.MAPPER_REG[10] = data;
			if((data & 0x01) == 0x00)
				this.Core.SetMirror(false);
			else
				this.Core.SetMirror(true);

			if((data & 0x02) == 0x00) {
				this.Core.SetPrgRomPage8K(0, this.MAPPER_REG[8]);
				this.Core.SetPrgRomPage8K(2, (this.Core.PrgRomPageCount - 1) * 2);
			} else {
				this.Core.SetPrgRomPage8K(0, 0);
				this.Core.SetPrgRomPage8K(2, this.MAPPER_REG[8]);
			}
			break;
		case 0xA000:
			this.MAPPER_REG[9] = data;
			this.Core.SetPrgRomPage8K(1, data);
			break;
		case 0xB000:
			var tmp = address & 0x0007
			this.MAPPER_REG[tmp] = data;
			this.Core.SetChrRomPage1K(tmp, data);
			break;
	}
}


/**** Mapper33 ****/
FC.prototype.Mapper33 = function(core) {
	FC.prototype.MapperProto.apply(this, arguments);
}

FC.prototype.Mapper33.prototype = Object.create(FC.prototype.MapperProto.prototype);

FC.prototype.Mapper33.prototype.Init = function() {
	this.Core.SetPrgRomPages8K(0, 1, this.Core.PrgRomPageCount * 2 - 2, this.Core.PrgRomPageCount * 2 - 1);
	this.Core.SetChrRomPages1K(0, 1, 2, 3, 4, 5, 6, 7);
}

FC.prototype.Mapper33.prototype.Write = function(address, data) {
	switch (address & 0xA003) {
		case 0x8000:
			this.Core.SetPrgRomPage8K(0, data & 0x3F);
			if((data & 0x40) == 0x00)
				this.Core.SetMirror(false);
			else
				this.Core.SetMirror(true);
			break;
		case 0x8001:
			this.Core.SetPrgRomPage8K(1, data & 0x3F);
			break;
		case 0x8002:
			this.Core.SetChrRomPage1K(0, data << 1);
			this.Core.SetChrRomPage1K(1, (data << 1) + 1);
			break;
		case 0x8003:
			this.Core.SetChrRomPage1K(2, data << 1);
			this.Core.SetChrRomPage1K(3, (data << 1) + 1);
			break;
		case 0xA000:
			this.Core.SetChrRomPage1K(4, data);
			break;
		case 0xA001:
			this.Core.SetChrRomPage1K(5, data);
			break;
		case 0xA002:
			this.Core.SetChrRomPage1K(6, data);
			break;
		case 0xA003:
			this.Core.SetChrRomPage1K(7, data);
			break;
	}
}


/**** Mapper34 ****/
FC.prototype.Mapper34 = function(core) {
	FC.prototype.MapperProto.apply(this, arguments);
}

FC.prototype.Mapper34.prototype = Object.create(FC.prototype.MapperProto.prototype);

FC.prototype.Mapper34.prototype.Init = function() {
	this.Core.SetPrgRomPage(0, 0);
	this.Core.SetPrgRomPage(1, 1);
	this.Core.SetChrRomPage(0);
}

FC.prototype.Mapper34.prototype.Write = function(address, data) {
	var tmp = (data & 0x03) << 1;

	this.Core.SetPrgRomPage(0, tmp);
	this.Core.SetPrgRomPage(1, tmp + 1);
}


/**** Mapper48 ****/
FC.prototype.Mapper48 = function(core) {
	FC.prototype.MapperProto.apply(this, arguments);
	this.MAPPER_REG = new Array(3);
}

FC.prototype.Mapper48.prototype = Object.create(FC.prototype.MapperProto.prototype);

FC.prototype.Mapper48.prototype.Init = function() {
	for(var i=0; i<this.MAPPER_REG.length; i++)
		this.MAPPER_REG[i] = 0;

	this.Core.SetPrgRomPages8K(0, 1, this.Core.PrgRomPageCount * 2 - 2, this.Core.PrgRomPageCount * 2 - 1);
	this.Core.SetChrRomPages1K(0, 1, 2, 3, 4, 5, 6, 7);
}

FC.prototype.Mapper48.prototype.Write = function(address, data) {
	switch (address & 0xE003) {
		case 0x8000:
			this.Core.SetPrgRomPage8K(0, data);
			break;
		case 0x8001:
			this.Core.SetPrgRomPage8K(1, data);
			break;
		case 0x8002:
			this.Core.SetChrRomPage1K(0, data << 1);
			this.Core.SetChrRomPage1K(1, (data << 1) + 1);
			break;
		case 0x8003:
			this.Core.SetChrRomPage1K(2, data << 1);
			this.Core.SetChrRomPage1K(3, (data << 1) + 1);
			break;
		case 0xA000:
			this.Core.SetChrRomPage1K(4, data);
			break;
		case 0xA001:
			this.Core.SetChrRomPage1K(5, data);
			break;
		case 0xA002:
			this.Core.SetChrRomPage1K(6, data);
			break;
		case 0xA003:
			this.Core.SetChrRomPage1K(7, data);
			break;

		case 0xC000:
			this.MAPPER_REG[1] = data;
			this.MAPPER_REG[0] = 0;
			this.ClearIRQ();
			break;
		case 0xC001:
			this.MAPPER_REG[1] = data;
			this.MAPPER_REG[0] = 1;
			break;

		case 0xE000:
			if((data & 0x40) == 0x00)
				this.Core.SetMirror(false);
			else
				this.Core.SetMirror(true);
			break;
	}
}

FC.prototype.Mapper48.prototype.HSync = function(y) {
	if(this.MAPPER_REG[0] == 1 && y < 240 && (this.Core.IO1[0x01] & 0x08) == 0x08) {
		if(this.MAPPER_REG[1] == 0xFF) {
			this.SetIRQ();
			this.MAPPER_REG[0] = 0;
		}
		this.MAPPER_REG[1]++;
	}
}


/**** Mapper65 ****/
FC.prototype.Mapper65 = function(core) {
	FC.prototype.MapperProto.apply(this, arguments);
	this.IRQ_Counter = 0;
	this.IRQ_Value = 0;
	this.IRQ_Flag = false;
}

FC.prototype.Mapper65.prototype = Object.create(FC.prototype.MapperProto.prototype);

FC.prototype.Mapper65.prototype.Init = function() {
	this.Core.SetPrgRomPages8K(0, 1, this.Core.PrgRomPageCount * 2 - 2, this.Core.PrgRomPageCount * 2 - 1);
	this.Core.SetChrRomPages1K(0, 1, 2, 3, 4, 5, 6, 7);
	this.IRQ_Counter = 0;
}

FC.prototype.Mapper65.prototype.Write = function(address, data) {
	switch (address & 0xF000) {
		case 0x8000:
			this.Core.SetPrgRomPage8K(0, data);
			break;
		case 0x9000:
			switch(address) {
				case 0x9001:
					if((data & 0x80) == 0x00)
						this.Core.SetMirror(false);
					else
						this.Core.SetMirror(true);
					break;
				case 0x9003:
					this.IRQ_Flag = (data & 0x80) == 0x80;
					this.ClearIRQ();
					break;
				case 0x9004:
					this.IRQ_Counter = this.IRQ_Value;
					this.IRQ_Flag = true;
					this.ClearIRQ();
					break;
				case 0x9005:
					this.IRQ_Value = (data << 8) | (this.IRQ_Value & 0x00FF);
					break;
				case 0x9006:
					this.IRQ_Value = (this.IRQ_Value & 0xFF00) | data;
					break;
			}
			break;
		case 0xA000:
			this.Core.SetPrgRomPage8K(1, data);
			break;
		case 0xB000:
		case 0xB001:
		case 0xB002:
		case 0xB003:
		case 0xB004:
		case 0xB005:
		case 0xB006:
		case 0xB007:
			this.Core.SetChrRomPage1K(address & 0x0007, data);
			break;
		case 0xC000:
			this.Core.SetPrgRomPage8K(2, data);
			break;
	}
}

FC.prototype.Mapper65.prototype.CPUSync = function(clock) {
	if(this.IRQ_Flag) {
		if(this.IRQ_Counter != 0) {
			this.IRQ_Counter -= clock;
			if(this.IRQ_Counter <= 0) {
				this.IRQ_Counter = 0;
				this.IRQ_Flag = false;
				this.SetIRQ();
			}
		}
	}
}


/**** Mapper66 ****/
FC.prototype.Mapper66 = function(core) {
	FC.prototype.MapperProto.apply(this, arguments);
}

FC.prototype.Mapper66.prototype = Object.create(FC.prototype.MapperProto.prototype);

FC.prototype.Mapper66.prototype.Init = function() {
	this.Core.SetPrgRomPage(0, 0);
	this.Core.SetPrgRomPage(1, 1);
	this.Core.SetChrRomPage(0);
}

FC.prototype.Mapper66.prototype.Write = function(address, data) {
	var tmp = (data & 0x30) >> 3;
	this.Core.SetPrgRomPage(0, tmp);
	this.Core.SetPrgRomPage(1, tmp + 1);

	this.Core.SetChrRomPage(data & 0x03);
}


/**** Mapper67 ****/
FC.prototype.Mapper67 = function(core) {
	FC.prototype.MapperProto.apply(this, arguments);
	this.MAPPER_REG = new Array(8);
	this.IRQ_Toggle = 0x00;
}

FC.prototype.Mapper67.prototype = Object.create(FC.prototype.MapperProto.prototype);

FC.prototype.Mapper67.prototype.Init = function() {
	for(var i=0; i<this.MAPPER_REG.length; i++)
		this.MAPPER_REG[i] = 0;

	this.Core.SetPrgRomPages8K(0, 1, this.Core.PrgRomPageCount * 2 - 2, this.Core.PrgRomPageCount * 2 - 1);
	this.Core.SetChrRomPages1K(0, 1, 2, 3, this.Core.ChrRomPageCount * 8 - 4, this.Core.ChrRomPageCount * 8 - 3, this.Core.ChrRomPageCount * 8 - 2, this.Core.ChrRomPageCount * 8 - 1);

	this.IRQ_Toggle = 0x00;
}

FC.prototype.Mapper67.prototype.Write = function(address, data) {
	switch (address & 0xF800) {
		case 0x8800:
			this.MAPPER_REG[0] = data;
			this.Core.SetChrRomPage1K(0, data << 1);
			this.Core.SetChrRomPage1K(1, (data << 1) + 1);
			break;
		case 0x9800:
			this.MAPPER_REG[1] = data;
			this.Core.SetChrRomPage1K(2, data << 1);
			this.Core.SetChrRomPage1K(3, (data << 1) + 1);
			break;
		case 0xA800:
			this.MAPPER_REG[2] = data;
			this.Core.SetChrRomPage1K(4, data << 1);
			this.Core.SetChrRomPage1K(5, (data << 1) + 1);
			break;
		case 0xB800:
			this.MAPPER_REG[3] = data;
			this.Core.SetChrRomPage1K(6, data << 1);
			this.Core.SetChrRomPage1K(7, (data << 1) + 1);
			break;
		case 0xC800:
			if(this.IRQ_Toggle == 0x00)
				this.MAPPER_REG[4] = (this.MAPPER_REG[4] & 0x00FF) | (data << 8);
			else
				this.MAPPER_REG[4] = (this.MAPPER_REG[4] & 0xFF00) | data;
			this.IRQ_Toggle ^= 0x01;
			break;
		case 0xD800:
			this.MAPPER_REG[5] = data;
			this.IRQ_Toggle = 0x00;
			this.ClearIRQ();
			break;
		case 0xE800:
			this.MAPPER_REG[6] = data;
			data &= 0x03;
			if(data == 0) {
				this.Core.SetMirror(false);
			} else if(data == 1) {
				this.Core.SetMirror(true);
			} else if(data == 2) {
				this.Core.SetMirrors(0, 0, 0, 0);
			} else {
				this.Core.SetMirrors(1, 1, 1, 1);
			}
			break;
		case 0xF800:
			this.MAPPER_REG[7] = data;
			this.Core.SetPrgRomPage8K(0, data << 1);
			this.Core.SetPrgRomPage8K(1, (data << 1) + 1);
			break;
	}
}

FC.prototype.Mapper67.prototype.CPUSync = function(clock) {
	if((this.MAPPER_REG[5] & 0x10) == 0x10) {
		this.MAPPER_REG[4] -= clock;
		if(this.MAPPER_REG[4] < 0) {
			this.MAPPER_REG[4] = 0xFFFF;
			this.MAPPER_REG[5] &= 0xEF;
			this.SetIRQ();
		}
	}
}


/**** Mapper68 ****/
FC.prototype.Mapper68 = function(core) {
	FC.prototype.MapperProto.apply(this, arguments);
	this.MAPPER_REG = new Array(8);
}

FC.prototype.Mapper68.prototype = Object.create(FC.prototype.MapperProto.prototype);

FC.prototype.Mapper68.prototype.Init = function() {
	for(var i=0; i<this.MAPPER_REG.length; i++)
		this.MAPPER_REG[i] = 0;

	this.Core.SetPrgRomPages8K(0, 1, this.Core.PrgRomPageCount * 2 - 2, this.Core.PrgRomPageCount * 2 - 1);
	this.Core.SetChrRomPages1K(0, 1, 2, 3, 4, 5, 6, 7);
}

FC.prototype.Mapper68.prototype.Write = function(address, data) {
	switch (address & 0xF000) {
		case 0x8000:
			this.MAPPER_REG[0] = data;
			this.Core.SetChrRomPage1K(0, data << 1);
			this.Core.SetChrRomPage1K(1, (data << 1) + 1);
			break;
		case 0x9000:
			this.MAPPER_REG[1] = data;
			this.Core.SetChrRomPage1K(2, data << 1);
			this.Core.SetChrRomPage1K(3, (data << 1) + 1);
			break;
		case 0xA000:
			this.MAPPER_REG[2] = data;
			this.Core.SetChrRomPage1K(4, data << 1);
			this.Core.SetChrRomPage1K(5, (data << 1) + 1);
			break;
		case 0xB000:
			this.MAPPER_REG[3] = data;
			this.Core.SetChrRomPage1K(6, data << 1);
			this.Core.SetChrRomPage1K(7, (data << 1) + 1);
			break;
		case 0xC000:
			this.MAPPER_REG[4] = data;
			this.SetMirror();
			break;
		case 0xD000:
			this.MAPPER_REG[5] = data;
			this.SetMirror();
			break;
		case 0xE000:
			this.MAPPER_REG[6] = data;
			this.SetMirror();
			break;
		case 0xF000:
			this.MAPPER_REG[7] = data;
			this.Core.SetPrgRomPage8K(0, data << 1);
			this.Core.SetPrgRomPage8K(1, (data << 1) + 1);
			break;
	}
}

FC.prototype.Mapper68.prototype.SetMirror = function() {
	switch (this.MAPPER_REG[6] & 0x11) {
		case 0x00:
			this.Core.SetMirror(false);
			break;
		case 0x01:
			this.Core.SetMirror(true);
			break;
		case 0x10:
			this.Core.SetChrRomPage1K(8, this.MAPPER_REG[4] | 0x80);
			this.Core.SetChrRomPage1K(9, this.MAPPER_REG[5] | 0x80);
			this.Core.SetChrRomPage1K(10, this.MAPPER_REG[4] | 0x80);
			this.Core.SetChrRomPage1K(11, this.MAPPER_REG[5] | 0x80);
			break;
		case 0x11:
			this.Core.SetChrRomPage1K(8, this.MAPPER_REG[4] | 0x80);
			this.Core.SetChrRomPage1K(9, this.MAPPER_REG[4] | 0x80);
			this.Core.SetChrRomPage1K(10, this.MAPPER_REG[5] | 0x80);
			this.Core.SetChrRomPage1K(11, this.MAPPER_REG[5] | 0x80);
			break;
	}
}


/**** Mapper69 ****/
FC.prototype.Mapper69 = function(core) {
	FC.prototype.MapperProto.apply(this, arguments);
	this.MAPPER_REG = new Array(16);
	this.MAPPER_REG_Select = 0x00;
	this.R8_ROM = null;
	this.IRQ_Counter = 0;
}

FC.prototype.Mapper69.prototype = Object.create(FC.prototype.MapperProto.prototype);

FC.prototype.Mapper69.prototype.Init = function() {
	var i;
	for(i=0; i<this.MAPPER_REG.length; i++)
		this.MAPPER_REG[i] = 0;

	this.Core.SetPrgRomPages8K(0, 1, 2, this.Core.PrgRomPageCount * 2 - 1);
	this.Core.SetChrRomPages1K(0, 1, 2, 3, 4, 5, 6, 7);
}

FC.prototype.Mapper69.prototype.Write = function(address, data) {
	switch (address & 0xE000) {
		case 0x8000:
			this.MAPPER_REG_Select = data;
			break;
		case 0xA000:
			this.MAPPER_REG[this.MAPPER_REG_Select] = data;
			switch(this.MAPPER_REG_Select) {
				case 0x00:
				case 0x01:
				case 0x02:
				case 0x03:
				case 0x04:
				case 0x05:
				case 0x06:
				case 0x07:
					this.Core.SetChrRomPage1K(this.MAPPER_REG_Select, data);
					break;
				case 0x08:
					this.R8_ROM = this.Core.PRGROM_PAGES[(data & 0x3F) % (this.Core.PrgRomPageCount * 2)];
					break;
				case 0x09:
					this.Core.SetPrgRomPage8K(0, data);
					break;
				case 0x0A:
					this.Core.SetPrgRomPage8K(1, data);
					break;
				case 0x0B:
					this.Core.SetPrgRomPage8K(2, data);
					break;
				case 0x0C:
					data &= 0x03;
					if(data == 0) {
						this.Core.SetMirror(false);
					} else if(data == 1) {
						this.Core.SetMirror(true);
					} else if(data == 2) {
						this.Core.SetMirrors(0, 0, 0, 0);
					} else {
						this.Core.SetMirrors(1, 1, 1, 1);
					}
					break;
				case 0x0D:
					if((data & 0x01) == 0x00)
						this.ClearIRQ();
					break;
				case 0x0E:
					this.IRQ_Counter = (this.IRQ_Counter & 0xFF00) | data;
					break;
				case 0x0F:
					this.IRQ_Counter = (this.IRQ_Counter & 0x00FF) | (data << 8);
					break;
			}
			break;
		case 0xC000:
			this.Core.Select_AY_REG(data);
			break;
		case 0xE000:
			this.Core.Write_AY_REG(data);
			break;
	}
}

FC.prototype.Mapper69.prototype.ReadSRAM = function(address) {
	if((this.MAPPER_REG[0x08] & 0x40) == 0x00)
		return this.R8_ROM[address & 0x1FFF];
	else
		return this.Core.SRAM[address & 0x1FFF];
}

FC.prototype.Mapper69.prototype.WriteSRAM = function(address, data) {
	if((this.MAPPER_REG[0x08] & 0x40) == 0x40)
		this.Core.SRAM[address & 0x1FFF] = data;
}

FC.prototype.Mapper69.prototype.CPUSync = function(clock) {
	if((this.MAPPER_REG[0x0D] & 0x80) == 0x80) {
		this.IRQ_Counter -= clock;
		if(this.IRQ_Counter < 0) {
			this.IRQ_Counter = 0xFFFF;
			if((this.MAPPER_REG[0x0D] & 0x01) == 0x01)
				this.SetIRQ();
		}
	}
}

FC.prototype.Mapper69.prototype.OutEXSound = function(soundin) {
	return (soundin >> 1) + (this.Core.Out_AY() >> 1);
}

FC.prototype.Mapper69.prototype.EXSoundSync = function(clock) {
	this.Core.Count_AY(clock);
}


/**** Mapper70 ****/
FC.prototype.Mapper70 = function(core) {
	FC.prototype.MapperProto.apply(this, arguments);
}

FC.prototype.Mapper70.prototype = Object.create(FC.prototype.MapperProto.prototype);

FC.prototype.Mapper70.prototype.Init = function() {
	this.Core.SetPrgRomPage(0, 0);
	this.Core.SetPrgRomPage(1, this.Core.PrgRomPageCount - 1);
	this.Core.SetChrRomPage(0);
}

FC.prototype.Mapper70.prototype.Write = function(address, data) {
	this.Core.SetPrgRomPage(0, (data & 0x70)>> 4);
	this.Core.SetChrRomPage(data & 0x0F);

	if((data & 0x80) == 0x00)
		this.Core.SetMirrors(0,0,0,0);
	else
		this.Core.SetMirrors(1,1,1,1);
}


/**** Mapper72 ****/
FC.prototype.Mapper72 = function(core) {
	FC.prototype.MapperProto.apply(this, arguments);
	this.MAPPER_REG = new Array(1);
}

FC.prototype.Mapper72.prototype = Object.create(FC.prototype.MapperProto.prototype);

FC.prototype.Mapper72.prototype.Init = function() {
	this.MAPPER_REG[0] = 0;

	this.Core.SetPrgRomPages8K(0, 1, this.Core.PrgRomPageCount * 2 - 2, this.Core.PrgRomPageCount * 2 - 1);
	this.Core.SetChrRomPages1K(0, 1, 2, 3, 4, 5, 6, 7);
}

FC.prototype.Mapper72.prototype.Write = function(address, data) {
	if((this.MAPPER_REG[0] & 0xC0) == 0x00) {
		if((data & 0x80) == 0x80) {
			var tmp = (data & 0x07) * 2;
			this.Core.SetPrgRomPage8K(0, tmp);
			this.Core.SetPrgRomPage8K(1, tmp + 1);
		}
		if((data & 0x40) == 0x40) {
			var tmp = (data & 0x0F) * 8;
			this.Core.SetChrRomPages1K(tmp, tmp + 1, tmp + 2, tmp + 3, tmp + 4, tmp + 5, tmp + 6, tmp + 7);
		}
	}
	this.MAPPER_REG[0] = data;
}


/**** Mapper73 ****/
FC.prototype.Mapper73 = function(core) {
	FC.prototype.MapperProto.apply(this, arguments);
	this.MAPPER_REG = new Array(3);
}

FC.prototype.Mapper73.prototype = Object.create(FC.prototype.MapperProto.prototype);

FC.prototype.Mapper73.prototype.Init = function() {
	this.Core.SetPrgRomPages8K(0, 1, this.Core.PrgRomPageCount * 2 - 2, this.Core.PrgRomPageCount * 2 - 1);
	this.MAPPER_REG[0] = 0;
	this.MAPPER_REG[1] = 0;
	this.MAPPER_REG[2] = 0;
}

FC.prototype.Mapper73.prototype.Write = function(address, data) {
	switch (address) {
		case 0x8000:
			this.MAPPER_REG[0] = (this.MAPPER_REG[0] & 0xFFF0) | (data & 0x0F);
			this.MAPPER_REG[2] = this.MAPPER_REG[0];
			break;

		case 0x9000:
			this.MAPPER_REG[0] = (this.MAPPER_REG[0] & 0xFF0F) | ((data & 0x0F) << 4);
			this.MAPPER_REG[2] = this.MAPPER_REG[0];
			break;

		case 0xA000:
			this.MAPPER_REG[0] = (this.MAPPER_REG[0] & 0xF0FF) | ((data & 0x0F) << 8);
			this.MAPPER_REG[2] = this.MAPPER_REG[0];
			break;

		case 0xB000:
			this.MAPPER_REG[0] = (this.MAPPER_REG[0] & 0x0FFF) | ((data & 0x0F) << 12);
			this.MAPPER_REG[2] = this.MAPPER_REG[0];
			break;

		case 0xC000:
			this.MAPPER_REG[1] = data & 0x07;
			if((this.MAPPER_REG[1] & 0x02) != 0) {
				this.MAPPER_REG[2] = this.MAPPER_REG[0];
			}
			break;

		case 0xD000:
			if((this.MAPPER_REG[1] & 0x01) != 0) {
				this.MAPPER_REG[1] |= 0x02;
			} else {
				this.MAPPER_REG[1] &= 0x01;
			}
			this.ClearIRQ();
			break;

		case 0xF000:
			this.Core.SetPrgRomPage8K(0, data * 2);
			this.Core.SetPrgRomPage8K(1, data * 2 + 1);
			break;
	}
}

FC.prototype.Mapper73.prototype.CPUSync = function(clock) {
	if((this.MAPPER_REG[1] & 0x02) != 0) {
		if((this.MAPPER_REG[1] & 0x04) != 0) {
			this.MAPPER_REG[2] += clock;
			if(this.MAPPER_REG[2] > 0xFF) {
				this.MAPPER_REG[2] = this.MAPPER_REG[0];
				this.SetIRQ();
			}
		} else {
			this.MAPPER_REG[2] += clock;
			if(this.MAPPER_REG[2] > 0xFFFF) {
				this.MAPPER_REG[2] = this.MAPPER_REG[0];
				this.SetIRQ();
			}
		}
	}
}


/**** Mapper75 ****/
FC.prototype.Mapper75 = function(core) {
	FC.prototype.MapperProto.apply(this, arguments);
	this.MAPPER_REG = new Array(1);
}

FC.prototype.Mapper75.prototype = Object.create(FC.prototype.MapperProto.prototype);

FC.prototype.Mapper75.prototype.Init = function() {
	this.Core.SetPrgRomPages8K(0, 0, 0, this.Core.PrgRomPageCount * 2 - 1);
	this.Core.SetChrRomPages1K(0, 0, 0, 0, 0, 0, 0, 0);
	this.MAPPER_REG[0] = 0x00;
}

FC.prototype.Mapper75.prototype.Write = function(address, data) {
	switch (address) {
		case 0x8000:
			this.Core.SetPrgRomPage8K(0, data & 0x0F);
			break;

		case 0x9000:
			this.MAPPER_REG[0] = data;
			if((data & 0x01) == 0x00)
				this.Core.SetMirror(false);
			else
				this.Core.SetMirror(true);
			break;

		case 0xA000:
			this.Core.SetPrgRomPage8K(1, data & 0x0F);
			break;

		case 0xC000:
			this.Core.SetPrgRomPage8K(2, data & 0x0F);
			break;

		case 0xE000:
			var tmp = (((this.MAPPER_REG[0] & 0x02) << 3) | (data & 0x0F)) << 2;
			this.Core.SetChrRomPage1K(0, tmp);
			this.Core.SetChrRomPage1K(1, tmp + 1);
			this.Core.SetChrRomPage1K(2, tmp + 2);
			this.Core.SetChrRomPage1K(3, tmp + 3);
			break;

		case 0xF000:
			var tmp = (((this.MAPPER_REG[0] & 0x04) << 2) | (data & 0x0F)) << 2;
			this.Core.SetChrRomPage1K(4, tmp);
			this.Core.SetChrRomPage1K(5, tmp + 1);
			this.Core.SetChrRomPage1K(6, tmp + 2);
			this.Core.SetChrRomPage1K(7, tmp + 3);
			break;
	}
}


/**** Mapper76 ****/
FC.prototype.Mapper76 = function(core) {
	FC.prototype.MapperProto.apply(this, arguments);
	this.MAPPER_REG = new Array(1);
}

FC.prototype.Mapper76.prototype = Object.create(FC.prototype.MapperProto.prototype);

FC.prototype.Mapper76.prototype.Init = function() {
	this.Core.SetPrgRomPages8K(0, 0, this.Core.PrgRomPageCount * 2 - 2, this.Core.PrgRomPageCount * 2 - 1);
	this.Core.SetChrRomPages1K(0, 0, 0, 0, 0, 0, 0, 0);
	this.MAPPER_REG[0] = 0x00;
}

FC.prototype.Mapper76.prototype.Write = function(address, data) {
	if(address == 0x8000)
		this.MAPPER_REG[0] = data & 0x07;

	if(address == 0x8001) {
		switch(this.MAPPER_REG[0]) {
			case 0x02:
				this.Core.SetChrRomPage1K(0, (data & 0x3F) * 2);
				this.Core.SetChrRomPage1K(1, (data & 0x3F) * 2 + 1);
				break;
			case 0x03:
				this.Core.SetChrRomPage1K(2, (data & 0x3F) * 2);
				this.Core.SetChrRomPage1K(3, (data & 0x3F) * 2 + 1);
				break;
			case 0x04:
				this.Core.SetChrRomPage1K(4, (data & 0x3F) * 2);
				this.Core.SetChrRomPage1K(5, (data & 0x3F) * 2 + 1);
				break;
			case 0x05:
				this.Core.SetChrRomPage1K(6, (data & 0x3F) * 2);
				this.Core.SetChrRomPage1K(7, (data & 0x3F) * 2 + 1);
				break;
			case 0x06:
				this.Core.SetPrgRomPage8K(0, data & 0x0F);
				break;
			case 0x07:
				this.Core.SetPrgRomPage8K(1, data & 0x0F);
				break;
		}
	}
}


/**** Mapper77 ****/
FC.prototype.Mapper77 = function(core) {
	FC.prototype.MapperProto.apply(this, arguments);
}

FC.prototype.Mapper77.prototype = Object.create(FC.prototype.MapperProto.prototype);

FC.prototype.Mapper77.prototype.Init = function() {
	this.Core.SetPrgRomPage(0, 0);
	this.Core.SetPrgRomPage(1, 1);

	this.Core.SetChrRomPage1K(0, 0);
	this.Core.SetChrRomPage1K(1, 1);
	this.Core.SetChrRomPage1K(2, 2 + 0x0100);
	this.Core.SetChrRomPage1K(3, 3 + 0x0100);
	this.Core.SetChrRomPage1K(4, 4 + 0x0100);
	this.Core.SetChrRomPage1K(5, 5 + 0x0100);
	this.Core.SetChrRomPage1K(6, 6 + 0x0100);
	this.Core.SetChrRomPage1K(7, 7 + 0x0100);
}

FC.prototype.Mapper77.prototype.Write = function(address, data) {
	var tmp = (data & 0x0F) << 1;
	this.Core.SetPrgRomPage(0, tmp);
	this.Core.SetPrgRomPage(1, tmp + 1);

	tmp = (data & 0xF0) >> 3;
	this.Core.SetChrRomPage1K(0, tmp);
	this.Core.SetChrRomPage1K(1, tmp + 1);
}


/**** Mapper78 ****/
FC.prototype.Mapper78 = function(core) {
	FC.prototype.MapperProto.apply(this, arguments);
}

FC.prototype.Mapper78.prototype = Object.create(FC.prototype.MapperProto.prototype);

FC.prototype.Mapper78.prototype.Init = function() {
	this.Core.SetPrgRomPage(0, 0);
	this.Core.SetPrgRomPage(1, this.Core.PrgRomPageCount - 1);

	this.Core.SetChrRomPage(0);
}

FC.prototype.Mapper78.prototype.Write = function(address, data) {
	this.Core.SetPrgRomPage(0, data & 0x07);
	this.Core.SetChrRomPage(data >> 4);

	if((data & 0x08) == 0x08)
		this.Core.SetMirror(false);
	else
		this.Core.SetMirror(true);
}


/**** Mapper80 ****/
FC.prototype.Mapper80 = function(core) {
	FC.prototype.MapperProto.apply(this, arguments);
	this.MAPPER_REG = new Array(11);
	this.EX_RAM = new Array(128);
}

FC.prototype.Mapper80.prototype = Object.create(FC.prototype.MapperProto.prototype);

FC.prototype.Mapper80.prototype.Init = function() {
	for(var i=0; i<this.MAPPER_REG.length; i++)
		this.MAPPER_REG[i] = 0;

	for(var i=0; i<this.EX_RAM.length; i++) {
		this.EX_RAM[i] = 0x00;
	}

	this.Core.SetPrgRomPages8K(0, 1, 2, this.Core.PrgRomPageCount * 2 - 1);
	this.Core.SetChrRomPages1K(0, 1, 2, 3, 4, 5, 6, 7);
}

FC.prototype.Mapper80.prototype.ReadSRAM = function(address) {
	if(address >= 0x7F00 && address <= 0x7FFF)
		return this.EX_RAM[address & 0x007F];

	switch(address) {
		case 0x7EF0:
			return this.MAPPER_REG[0];
		case 0x7EF1:
			return this.MAPPER_REG[1];
		case 0x7EF2:
			return this.MAPPER_REG[2];
		case 0x7EF3:
			return this.MAPPER_REG[3];
		case 0x7EF4:
			return this.MAPPER_REG[4];
		case 0x7EF5:
			return this.MAPPER_REG[5];
		case 0x7EF6:
		case 0x7EF7:
			return this.MAPPER_REG[6];
		case 0x7EF8:
		case 0x7EF9:
			return this.MAPPER_REG[7];
		case 0x7EFA:
		case 0x7EFB:
			return this.MAPPER_REG[8];
		case 0x7EFC:
		case 0x7EFD:
			return this.MAPPER_REG[9];
		case 0x7EFE:
		case 0x7EFF:
			return this.MAPPER_REG[10];
	}

	return 0x00;
}

FC.prototype.Mapper80.prototype.WriteSRAM = function(address, data) {
	if(address >= 0x7F00 && address <= 0x7FFF) {
		this.EX_RAM[address & 0x007F] = data;
		return;
	}

	switch(address) {
		case 0x7EF0:
			this.MAPPER_REG[0] = data;
			this.Core.SetChrRomPage1K(0, data & 0xFE);
			this.Core.SetChrRomPage1K(1, (data & 0xFE) + 1);
			break;
		case 0x7EF1:
			this.MAPPER_REG[1] = data;
			this.Core.SetChrRomPage1K(2, data & 0xFE);
			this.Core.SetChrRomPage1K(3, (data & 0xFE) + 1);
			break;
		case 0x7EF2:
			this.MAPPER_REG[2] = data;
			this.Core.SetChrRomPage1K(4, data);
			break;
		case 0x7EF3:
			this.MAPPER_REG[3] = data;
			this.Core.SetChrRomPage1K(5, data);
			break;
		case 0x7EF4:
			this.MAPPER_REG[4] = data;
			this.Core.SetChrRomPage1K(6, data);
			break;
		case 0x7EF5:
			this.MAPPER_REG[5] = data;
			this.Core.SetChrRomPage1K(7, data);
			break;
		case 0x7EF6:
		case 0x7EF7:
			this.MAPPER_REG[6] = data;
			if((data & 0x01) == 0x01)
				this.Core.SetMirror(false);
			else
				this.Core.SetMirror(true);
			break;
		case 0x7EF8:
		case 0x7EF9:
			this.MAPPER_REG[7] = data;
			break;
		case 0x7EFA:
		case 0x7EFB:
			this.MAPPER_REG[8] = data;
			this.Core.SetPrgRomPage8K(0, data);
			break;
		case 0x7EFC:
		case 0x7EFD:
			this.MAPPER_REG[9] = data;
			this.Core.SetPrgRomPage8K(1, data);
			break;
		case 0x7EFE:
		case 0x7EFF:
			this.MAPPER_REG[10] = data;
			this.Core.SetPrgRomPage8K(2, data);
			break;
	}
}


/**** Mapper82 ****/
FC.prototype.Mapper82 = function(core) {
	FC.prototype.MapperProto.apply(this, arguments);
	this.MAPPER_REG = new Array(13);
	this.EX_RAM = new Array(0x1400);
}

FC.prototype.Mapper82.prototype = Object.create(FC.prototype.MapperProto.prototype);

FC.prototype.Mapper82.prototype.Init = function() {
	for(var i=0; i<this.MAPPER_REG.length; i++)
		this.MAPPER_REG[i] = 0;

	for(var i=0; i<this.EX_RAM.length; i++) {
		this.EX_RAM[i] = 0x00;
	}

	this.Core.SetPrgRomPages8K(0, 1, 2, this.Core.PrgRomPageCount * 2 - 1);
	this.Core.SetChrRomPages1K(0, 1, 2, 3, 4, 5, 6, 7);
}

FC.prototype.Mapper82.prototype.ReadSRAM = function(address) {
	if(address >= 0x6000 && address <= 0x73FF)
		return this.EX_RAM[address - 0x6000];

	if(address >= 0x7EF0 && address <= 0x7EFC)
		return this.MAPPER_REG[address - 0x7EF0];
}

FC.prototype.Mapper82.prototype.WriteSRAM = function(address, data) {
	if(address >= 0x6000 && address <= 0x73FF) {
		this.EX_RAM[address - 0x6000] = data;
		return;
	}

	switch(address) {
		case 0x7EF0:
			this.MAPPER_REG[0] = data;
			this.SetChr();
			break;
		case 0x7EF1:
			this.MAPPER_REG[1] = data;
			this.SetChr();
			break;
		case 0x7EF2:
			this.MAPPER_REG[2] = data;
			this.SetChr();
			break;
		case 0x7EF3:
			this.MAPPER_REG[3] = data;
			this.SetChr();
			break;
		case 0x7EF4:
			this.MAPPER_REG[4] = data;
			this.SetChr();
			break;
		case 0x7EF5:
			this.MAPPER_REG[5] = data;
			this.SetChr();
			break;
		case 0x7EF6:
			this.MAPPER_REG[6] = data;
			this.SetChr();
			if((data & 0x01) == 0x01)
				this.Core.SetMirror(false);
			else
				this.Core.SetMirror(true);
			break;
		case 0x7EF7:
			this.MAPPER_REG[7] = data;
			break;
		case 0x7EF8:
			this.MAPPER_REG[8] = data;
			break;
		case 0x7EF9:
			this.MAPPER_REG[9] = data;
			break;
		case 0x7EFA:
			this.MAPPER_REG[10] = data;
			this.Core.SetPrgRomPage8K(0, data >>> 2);
			break;
		case 0x7EFB:
			this.MAPPER_REG[11] = data;
			this.Core.SetPrgRomPage8K(1, data >>> 2);
			break;
		case 0x7EFC:
			this.MAPPER_REG[12] = data;
			this.Core.SetPrgRomPage8K(2, data >>> 2);
			break;
	}
}

FC.prototype.Mapper82.prototype.SetChr = function() {
	if((this.MAPPER_REG[6] & 0x02) == 0x00) {
		this.Core.SetChrRomPage1K(0, this.MAPPER_REG[0] & 0xFE);
		this.Core.SetChrRomPage1K(1, (this.MAPPER_REG[0] & 0xFE) + 1);
		this.Core.SetChrRomPage1K(2, this.MAPPER_REG[1] & 0xFE);
		this.Core.SetChrRomPage1K(3, (this.MAPPER_REG[1] & 0xFE) + 1);
		this.Core.SetChrRomPage1K(4, this.MAPPER_REG[2]);
		this.Core.SetChrRomPage1K(5, this.MAPPER_REG[3]);
		this.Core.SetChrRomPage1K(6, this.MAPPER_REG[4]);
		this.Core.SetChrRomPage1K(7, this.MAPPER_REG[5]);
	} else {
		this.Core.SetChrRomPage1K(4, this.MAPPER_REG[0] & 0xFE);
		this.Core.SetChrRomPage1K(5, (this.MAPPER_REG[0] & 0xFE) + 1);
		this.Core.SetChrRomPage1K(6, this.MAPPER_REG[1] & 0xFE);
		this.Core.SetChrRomPage1K(7, (this.MAPPER_REG[1] & 0xFE) + 1);
		this.Core.SetChrRomPage1K(0, this.MAPPER_REG[2]);
		this.Core.SetChrRomPage1K(1, this.MAPPER_REG[3]);
		this.Core.SetChrRomPage1K(2, this.MAPPER_REG[4]);
		this.Core.SetChrRomPage1K(3, this.MAPPER_REG[5]);
	}
}


/**** Mapper85 ****/
FC.prototype.Mapper85 = function(core) {
	FC.prototype.MapperProto.apply(this, arguments);
	this.MAPPER_REG = new Array(15);
	this.MAPPER_EXVRAM = new Array(8);
}

FC.prototype.Mapper85.prototype = Object.create(FC.prototype.MapperProto.prototype);

FC.prototype.Mapper85.prototype.Init = function() {
	for(var i=0; i<this.MAPPER_REG.length; i++)
		this.MAPPER_REG[i] = 0;

	for(var i=0; i<this.MAPPER_EXVRAM.length; i++) {
		this.MAPPER_EXVRAM[i] = new Array(1024);
		for(var j=0; j<this.MAPPER_EXVRAM[i].length; j++)
			this.MAPPER_EXVRAM[i][j] = 0x00;
	}

	this.Core.SetPrgRomPages8K(0, 1, 2, this.Core.PrgRomPageCount * 2 - 1);

	if(this.Core.ChrRomPageCount == 0) {
		this.Core.VRAM[0] = this.MAPPER_EXVRAM[0];
		this.Core.VRAM[1] = this.MAPPER_EXVRAM[0];
		this.Core.VRAM[2] = this.MAPPER_EXVRAM[0];
		this.Core.VRAM[3] = this.MAPPER_EXVRAM[0];
		this.Core.VRAM[4] = this.MAPPER_EXVRAM[0];
		this.Core.VRAM[5] = this.MAPPER_EXVRAM[0];
		this.Core.VRAM[6] = this.MAPPER_EXVRAM[0];
		this.Core.VRAM[7] = this.MAPPER_EXVRAM[0];
	} else
		this.Core.SetChrRomPages1K(0, 1, 2, 3, 4, 5, 6, 7);

}

FC.prototype.Mapper85.prototype.Write = function(address, data) {
	switch(address & 0xF038) {
		case 0x8000:
			this.MAPPER_REG[0] = data;
			this.Core.SetPrgRomPage8K(0, data);
			break;
		case 0x8008:
		case 0x8010:
			this.MAPPER_REG[1] = data;
			this.Core.SetPrgRomPage8K(1, data);
			break;
		case 0x9000:
			this.MAPPER_REG[2] = data;
			this.Core.SetPrgRomPage8K(2, data);
			break;

		case 0xA000:
			this.MAPPER_REG[3] = data;
			if(this.Core.ChrRomPageCount == 0)
				this.Core.VRAM[0] = this.MAPPER_EXVRAM[data];// & 0x07];
			else
				this.Core.SetChrRomPage1K(0, data);
			break;
		case 0xA008:
		case 0xA010:
			this.MAPPER_REG[4] = data;
			if(this.Core.ChrRomPageCount == 0)
				this.Core.VRAM[1] = this.MAPPER_EXVRAM[data];// & 0x07];
			else
				this.Core.SetChrRomPage1K(1, data);
			break;
		case 0xB000:
			this.MAPPER_REG[5] = data;
			if(this.Core.ChrRomPageCount == 0)
				this.Core.VRAM[2] = this.MAPPER_EXVRAM[data];// & 0x07];
			else
				this.Core.SetChrRomPage1K(2, data);
			break;
		case 0xB008:
		case 0xB010:
			this.MAPPER_REG[6] = data;
			if(this.Core.ChrRomPageCount == 0)
				this.Core.VRAM[3] = this.MAPPER_EXVRAM[data];// & 0x07];
			else
				this.Core.SetChrRomPage1K(3, data);
			break;
		case 0xC000:
			this.MAPPER_REG[7] = data;
			if(this.Core.ChrRomPageCount == 0)
				this.Core.VRAM[4] = this.MAPPER_EXVRAM[data];// & 0x07];
			else
				this.Core.SetChrRomPage1K(4, data);
			break;
		case 0xC008:
		case 0xC010:
			this.MAPPER_REG[8] = data;
			if(this.Core.ChrRomPageCount == 0)
				this.Core.VRAM[5] = this.MAPPER_EXVRAM[data];// & 0x07];
			else
				this.Core.SetChrRomPage1K(5, data);
			break;
		case 0xD000:
			this.MAPPER_REG[9] = data;
			if(this.Core.ChrRomPageCount == 0)
				this.Core.VRAM[6] = this.MAPPER_EXVRAM[data];// & 0x07];
			else
				this.Core.SetChrRomPage1K(6, data);
			break;
		case 0xD008:
		case 0xD010:
			this.MAPPER_REG[10] = data;
			if(this.Core.ChrRomPageCount == 0)
				this.Core.VRAM[7] = this.MAPPER_EXVRAM[data];// & 0x07];
			else
				this.Core.SetChrRomPage1K(7, data);
			break;

		case 0xE000:
			this.MAPPER_REG[14] = data;
			data &= 0x03;
			if(data == 0) {
				this.Core.SetMirror(false);
			} else if(data == 1) {
				this.Core.SetMirror(true);
			} else if(data == 2) {
				this.Core.SetMirrors(0, 0, 0, 0);
			} else {
				this.Core.SetMirrors(1, 1, 1, 1);
			}
			break;

		case 0xE008:
		case 0xE010:
			this.MAPPER_REG[13] = data;
			break;

		case 0xF000:
			this.MAPPER_REG[11] = data & 0x07;
			if((this.MAPPER_REG[11] & 0x02) != 0) {
				this.MAPPER_REG[12] = this.MAPPER_REG[13];
			}
			break;
		case 0xF008:
		case 0xF010:
			if((this.MAPPER_REG[11] & 0x01) != 0) {
				this.MAPPER_REG[11] |= 0x02;
			} else {
				this.MAPPER_REG[11] &= 0x01;
			}
			this.ClearIRQ();
			break;
	}
}

FC.prototype.Mapper85.prototype.HSync = function(y) {
	if((this.MAPPER_REG[11] & 0x06) == 0x02) {
		if(this.MAPPER_REG[12] == 0xFF) {
			this.MAPPER_REG[12] = this.MAPPER_REG[13];
			this.SetIRQ();
		} else
			this.MAPPER_REG[12]++;
	}
}

FC.prototype.Mapper85.prototype.CPUSync = function(clock) {
	if((this.MAPPER_REG[11] & 0x06) == 0x06) {
		if(this.MAPPER_REG[12] >= 0xFF) {
			this.MAPPER_REG[12] = this.MAPPER_REG[13];
			this.SetIRQ();
		} else
			this.MAPPER_REG[12] += clock;
	}
}


/**** Mapper86 ****/
FC.prototype.Mapper86 = function(core) {
	FC.prototype.MapperProto.apply(this, arguments);
}

FC.prototype.Mapper86.prototype = Object.create(FC.prototype.MapperProto.prototype);

FC.prototype.Mapper86.prototype.Init = function() {
	this.Core.SetPrgRomPages8K(this.Core.PrgRomPageCount * 2 - 4, this.Core.PrgRomPageCount * 2 - 3, this.Core.PrgRomPageCount * 2 - 2, this.Core.PrgRomPageCount * 2 - 1);
	this.Core.SetChrRomPages1K(0, 1, 2, 3, 4, 5, 6, 7);
}

FC.prototype.Mapper86.prototype.WriteSRAM = function(address, data) {
	if(address >= 0x6000 && address < 0x6FFF) {
		var prg = ((data & 0x30) >>> 4) << 2;
		var chr = (((data & 0x40) >>> 4) | (data & 0x03)) << 3;
		this.Core.SetPrgRomPages8K(prg, prg + 1, prg + 2, prg + 3);
		this.Core.SetChrRomPages1K(chr, chr + 1, chr + 2, chr + 3, chr + 4, chr + 5, chr + 6, chr + 7);
	}
}


/**** Mapper87 ****/
FC.prototype.Mapper87 = function(core) {
	FC.prototype.MapperProto.apply(this, arguments);
}

FC.prototype.Mapper87.prototype = Object.create(FC.prototype.MapperProto.prototype);

FC.prototype.Mapper87.prototype.Init = function() {
	this.Core.SetPrgRomPage(0, 0);
	this.Core.SetPrgRomPage(1, this.Core.PrgRomPageCount - 1);
	this.Core.SetChrRomPage(0);
}

FC.prototype.Mapper87.prototype.WriteSRAM = function(address, data) {
	var chr = ((data & 0x02) >>> 1) | ((data & 0x01) << 1);
	this.Core.SetChrRomPage(chr);
}


/**** Mapper88 ****/
FC.prototype.Mapper88 = function(core) {
	FC.prototype.MapperProto.apply(this, arguments);
	this.MAPPER_REG = new Array(1);
}

FC.prototype.Mapper88.prototype = Object.create(FC.prototype.MapperProto.prototype);

FC.prototype.Mapper88.prototype.Init = function() {
	this.Core.SetPrgRomPages8K(0, 0, this.Core.PrgRomPageCount * 2 - 2, this.Core.PrgRomPageCount * 2 - 1);
	this.Core.SetChrRomPages1K(0, 0, 0, 0, 0, 0, 0, 0);
	this.MAPPER_REG[0] = 0x00;
}

FC.prototype.Mapper88.prototype.Write = function(address, data) {
	if(address == 0x8000)
		this.MAPPER_REG[0] = data & 0x07;

	if(address == 0x8001) {
		switch(this.MAPPER_REG[0]) {
			case 0x00:
				this.Core.SetChrRomPage1K(0, data & 0x3E);
				this.Core.SetChrRomPage1K(1, (data & 0x3E) + 1);
				break;
			case 0x01:
				this.Core.SetChrRomPage1K(2, data & 0x3E);
				this.Core.SetChrRomPage1K(3, (data & 0x3E) + 1);
				break;
			case 0x02:
				this.Core.SetChrRomPage1K(4, (data & 0x3F) | 0x40);
				break;
			case 0x03:
				this.Core.SetChrRomPage1K(5, (data & 0x3F) | 0x40);
				break;
			case 0x04:
				this.Core.SetChrRomPage1K(6, (data & 0x3F) | 0x40);
				break;
			case 0x05:
				this.Core.SetChrRomPage1K(7, (data & 0x3F) | 0x40);
				break;
			case 0x06:
				this.Core.SetPrgRomPage8K(0, data & 0x0F);
				break;
			case 0x07:
				this.Core.SetPrgRomPage8K(1, data & 0x0F);
				break;
		}
	}
}


/**** Mapper89 ****/
FC.prototype.Mapper89 = function(core) {
	FC.prototype.MapperProto.apply(this, arguments);
}

FC.prototype.Mapper89.prototype = Object.create(FC.prototype.MapperProto.prototype);

FC.prototype.Mapper89.prototype.Init = function() {
	this.Core.SetPrgRomPage(0, 0);
	this.Core.SetPrgRomPage(1, this.Core.PrgRomPageCount - 1);

	this.Core.SetChrRomPage(0);
}

FC.prototype.Mapper89.prototype.Write = function(address, data) {
	this.Core.SetPrgRomPage(0, (data & 0x70) >> 4);
	this.Core.SetChrRomPage(((data & 0x80) >> 4) | (data & 0x07));

	if((data & 0x08) == 0x00)
		this.Core.SetMirrors(0, 0, 0, 0);
	else
		this.Core.SetMirrors(1, 1, 1, 1);
}


/**** Mapper92 ****/
FC.prototype.Mapper92 = function(core) {
	FC.prototype.MapperProto.apply(this, arguments);
}

FC.prototype.Mapper92.prototype = Object.create(FC.prototype.MapperProto.prototype);

FC.prototype.Mapper92.prototype.Init = function() {

	this.Core.SetPrgRomPages8K(0, 1, this.Core.PrgRomPageCount * 2 - 2, this.Core.PrgRomPageCount * 2 - 1);
	this.Core.SetChrRomPages1K(0, 1, 2, 3, 4, 5, 6, 7);
}

FC.prototype.Mapper92.prototype.Write = function(address, data) {
	var prg = (address & 0x0F) << 1;
	var chr = (address & 0x0F) << 3;
	if(address >= 0x9000) {
		if((address & 0xF0) == 0xD0) {
			this.Core.SetPrgRomPages8K(0, 1, prg, prg + 1);
		} else if((address & 0xF0) == 0xE0) {
			this.Core.SetChrRomPages1K(chr, chr + 1, chr + 2, chr + 3, chr + 4, chr + 5, chr + 6, chr + 7);
		}
	} else {
		if((address & 0xF0) == 0xB0) {
			this.Core.SetPrgRomPages8K(0, 1, prg, prg + 1);
		} else if((address & 0xF0) == 0x70) {
			this.Core.SetChrRomPages1K(chr, chr + 1, chr + 2, chr + 3, chr + 4, chr + 5, chr + 6, chr + 7);
		}
	}
}


/**** Mapper93 ****/
FC.prototype.Mapper93 = function(core) {
	FC.prototype.MapperProto.apply(this, arguments);
}

FC.prototype.Mapper93.prototype = Object.create(FC.prototype.MapperProto.prototype);

FC.prototype.Mapper93.prototype.Init = function() {
	this.Core.SetPrgRomPages8K(0, 1, this.Core.PrgRomPageCount * 2 - 2, this.Core.PrgRomPageCount * 2 - 1);
	this.Core.SetChrRomPages1K(0, 1, 2, 3, 4, 5, 6, 7);
}

FC.prototype.Mapper93.prototype.WriteSRAM = function(address, data) {
	if(address == 0x6000) {
		this.Core.SetPrgRomPage8K(0, data * 2);
		this.Core.SetPrgRomPage8K(1, data * 2 + 1);
	}
}


/**** Mapper94 ****/
FC.prototype.Mapper94 = function(core) {
	FC.prototype.MapperProto.apply(this, arguments);
}

FC.prototype.Mapper94.prototype = Object.create(FC.prototype.MapperProto.prototype);

FC.prototype.Mapper94.prototype.Init = function() {
	this.Core.SetPrgRomPage(0, 0);
	this.Core.SetPrgRomPage(1, this.Core.PrgRomPageCount - 1);
	this.Core.SetChrRomPage(0);
}

FC.prototype.Mapper94.prototype.Write = function(address, data) {
	this.Core.SetPrgRomPage(0, data >> 2);
}


/**** Mapper95 ****/
FC.prototype.Mapper95 = function(core) {
	FC.prototype.MapperProto.apply(this, arguments);
	this.MAPPER_REG = new Array(1);
}

FC.prototype.Mapper95.prototype = Object.create(FC.prototype.MapperProto.prototype);

FC.prototype.Mapper95.prototype.Init = function() {
	this.Core.SetPrgRomPages8K(0, 0, this.Core.PrgRomPageCount * 2 - 2, this.Core.PrgRomPageCount * 2 - 1);
	this.Core.SetChrRomPages1K(0, 0, 0, 0, 0, 0, 0, 0);
	this.MAPPER_REG[0] = 0x00;
}

FC.prototype.Mapper95.prototype.Write = function(address, data) {
	if((address & 0x0001) == 0x0000)
		this.MAPPER_REG[0] = data & 0x07;

	if((address & 0x0001) == 0x0001) {
		if(this.MAPPER_REG[0] <= 0x05) {
			if((data & 0x20) == 0x20)
				this.Core.SetMirrors(1, 1, 1, 1);
			else
				this.Core.SetMirrors(0, 0, 0, 0);
		}

		switch(this.MAPPER_REG[0]) {
			case 0x00:
				this.Core.SetChrRomPage1K(0, data & 0x1E);
				this.Core.SetChrRomPage1K(1, (data & 0x1E) + 1);
				break;
			case 0x01:
				this.Core.SetChrRomPage1K(2, data & 0x1E);
				this.Core.SetChrRomPage1K(3, (data & 0x1E) + 1);
				break;
			case 0x02:
				this.Core.SetChrRomPage1K(4, data & 0x1F);
				break;
			case 0x03:
				this.Core.SetChrRomPage1K(5, data & 0x1F);
				break;
			case 0x04:
				this.Core.SetChrRomPage1K(6, data & 0x1F);
				break;
			case 0x05:
				this.Core.SetChrRomPage1K(7, data & 0x1F);
				break;
			case 0x06:
				this.Core.SetPrgRomPage8K(0, data & 0x0F);
				break;
			case 0x07:
				this.Core.SetPrgRomPage8K(1, data & 0x0F);
				break;
		}
	}
}


/**** Mapper97 ****/
FC.prototype.Mapper97 = function(core) {
	FC.prototype.MapperProto.apply(this, arguments);
}

FC.prototype.Mapper97.prototype = Object.create(FC.prototype.MapperProto.prototype);

FC.prototype.Mapper97.prototype.Init = function() {
	this.Core.SetPrgRomPage(0, this.Core.PrgRomPageCount - 1);
	this.Core.SetPrgRomPage(1, 0);

	this.Core.SetChrRomPage(0);
}

FC.prototype.Mapper97.prototype.Write = function(address, data) {
	this.Core.SetPrgRomPage(1, data & 0x0F);

	switch(data & 0xC0) {
		case 0x00:
			this.Core.SetMirrors(0, 0, 0, 0);
			break;
		case 0x40:
			this.Core.SetMirror(true);
			break;
		case 0x80:
			this.Core.SetMirror(false);
			break;
		case 0xC0:
			this.Core.SetMirrors(1, 1, 1, 1);
			break;
	}
}


/**** Mapper101 ****/
FC.prototype.Mapper101 = function(core) {
	FC.prototype.MapperProto.apply(this, arguments);
}

FC.prototype.Mapper101.prototype = Object.create(FC.prototype.MapperProto.prototype);

FC.prototype.Mapper101.prototype.Init = function() {
	this.Core.SetPrgRomPage(0, 0);
	this.Core.SetPrgRomPage(1, this.Core.PrgRomPageCount - 1);
	this.Core.SetChrRomPage(0);
}

FC.prototype.Mapper101.prototype.WriteSRAM = function(address, data) {
	this.Core.SetChrRomPage(data & 0x03);
}


/**** Mapper118 ****/
FC.prototype.Mapper118 = function(core) {
	FC.prototype.MapperProto.apply(this, arguments);
	this.MAPPER_REG = new Array(20);
}

FC.prototype.Mapper118.prototype = Object.create(FC.prototype.MapperProto.prototype);

FC.prototype.Mapper118.prototype.Init = function() {
	var i;
	for(i=0; i<this.MAPPER_REG.length; i++)
		this.MAPPER_REG[i] = 0;

	this.MAPPER_REG[16] = 0;
	this.MAPPER_REG[17] = 1;
	this.MAPPER_REG[18] = (this.Core.PrgRomPageCount - 1) * 2;
	this.MAPPER_REG[19] = (this.Core.PrgRomPageCount - 1) * 2 + 1;
	this.Core.SetPrgRomPages8K(this.MAPPER_REG[16], this.MAPPER_REG[17], this.MAPPER_REG[18], this.MAPPER_REG[19]);

	this.MAPPER_REG[8] = 0;
	this.MAPPER_REG[9] = 1;
	this.MAPPER_REG[10] = 2;
	this.MAPPER_REG[11] = 3;
	this.MAPPER_REG[12] = 4;
	this.MAPPER_REG[13] = 5;
	this.MAPPER_REG[14] = 6;
	this.MAPPER_REG[15] = 7;
	this.Core.SetChrRomPages1K(this.MAPPER_REG[8], this.MAPPER_REG[9], this.MAPPER_REG[10], this.MAPPER_REG[11],
				this.MAPPER_REG[12], this.MAPPER_REG[13], this.MAPPER_REG[14], this.MAPPER_REG[15]);
}

FC.prototype.Mapper118.prototype.Write = function(address, data) {
	switch (address & 0xE001) {
		case 0x8000:
			this.MAPPER_REG[0] = data;
			if((data & 0x80) == 0x80) {
				this.Core.SetChrRomPages1K(this.MAPPER_REG[12], this.MAPPER_REG[13], this.MAPPER_REG[14], this.MAPPER_REG[15], 
							this.MAPPER_REG[8], this.MAPPER_REG[9], this.MAPPER_REG[10], this.MAPPER_REG[11]); 
			} else {
				this.Core.SetChrRomPages1K(this.MAPPER_REG[8], this.MAPPER_REG[9], this.MAPPER_REG[10], this.MAPPER_REG[11], 
							this.MAPPER_REG[12], this.MAPPER_REG[13], this.MAPPER_REG[14], this.MAPPER_REG[15]); 
			}

			if((data & 0x40) == 0x40) {
				this.Core.SetPrgRomPages8K(this.MAPPER_REG[18], this.MAPPER_REG[17], this.MAPPER_REG[16],this.MAPPER_REG[19]);
			} else {
				this.Core.SetPrgRomPages8K(this.MAPPER_REG[16], this.MAPPER_REG[17], this.MAPPER_REG[18],this.MAPPER_REG[19]);
			}
			break;
		case 0x8001:
			this.MAPPER_REG[1] = data;

			if((this.MAPPER_REG[0] & 0x80) == 0x80) {
				if((this.MAPPER_REG[0] & 0x07) == 0x02) {
					if((data & 0x80) == 0x80)
						this.Core.SetMirrors(0,0,0,0);
					else
						this.Core.SetMirrors(1,1,1,1);
				}
			} else {
				if((this.MAPPER_REG[0] & 0x07) == 0x00) {
					if((data & 0x80) == 0x80)
						this.Core.SetMirrors(0,0,0,0);
					else
						this.Core.SetMirrors(1,1,1,1);
				}
			}

			switch (this.MAPPER_REG[0] & 0x07) {
				case 0:
					data &= 0xFE;
					this.MAPPER_REG[8] = data;
					this.MAPPER_REG[9] = data + 1;
					break;
				case 1:
					data &= 0xFE;
					this.MAPPER_REG[10] = data;
					this.MAPPER_REG[11] = data + 1;
					break;
				case 2:
					this.MAPPER_REG[12] = data;
					break;
				case 3:
					this.MAPPER_REG[13] = data;
					break;
				case 4:
					this.MAPPER_REG[14] = data;
					break;
				case 5:
					this.MAPPER_REG[15] = data;
					break;
				case 6:
					this.MAPPER_REG[16] = data;
					break;
				case 7:
					this.MAPPER_REG[17] = data;
					break;
			}

			if((this.MAPPER_REG[0] & 0x80) == 0x80) {
				this.Core.SetChrRomPages1K(this.MAPPER_REG[12], this.MAPPER_REG[13], this.MAPPER_REG[14], this.MAPPER_REG[15], 
							this.MAPPER_REG[8], this.MAPPER_REG[9], this.MAPPER_REG[10], this.MAPPER_REG[11]); 
			} else {
				this.Core.SetChrRomPages1K(this.MAPPER_REG[8], this.MAPPER_REG[9], this.MAPPER_REG[10], this.MAPPER_REG[11], 
							this.MAPPER_REG[12], this.MAPPER_REG[13], this.MAPPER_REG[14], this.MAPPER_REG[15]); 
			}

			if((this.MAPPER_REG[0] & 0x40) == 0x40) {
				this.Core.SetPrgRomPages8K(this.MAPPER_REG[18], this.MAPPER_REG[17], this.MAPPER_REG[16],this.MAPPER_REG[19]);
			} else {
				this.Core.SetPrgRomPages8K(this.MAPPER_REG[16], this.MAPPER_REG[17], this.MAPPER_REG[18],this.MAPPER_REG[19]);
			}
			break;

		case 0xA000:
			this.MAPPER_REG[2] = data;
			break;
		case 0xA001:
			this.MAPPER_REG[3] = data;
			break;

		case 0xC000:
			this.MAPPER_REG[4] = data;
			break;
		case 0xC001:
			this.MAPPER_REG[5] = data;
			break;

		case 0xE000:
			this.MAPPER_REG[4] = this.MAPPER_REG[5];
			this.MAPPER_REG[7] = 0;
			this.ClearIRQ();
			break;
		case 0xE001:
			this.MAPPER_REG[7] = 1;
			break;
	}
}

FC.prototype.Mapper118.prototype.HSync = function(y) {
	if(this.MAPPER_REG[7] == 1 && y < 240 && (this.Core.IO1[0x01] & 0x08) == 0x08) {
		if(--this.MAPPER_REG[4] == 0)
			this.SetIRQ();
		this.MAPPER_REG[4] &= 0xFF;
	}
}


/**** Mapper119 ****/
FC.prototype.Mapper119 = function(core) {
	FC.prototype.MapperProto.apply(this, arguments);
	this.MAPPER_REG = new Array(20);
}

FC.prototype.Mapper119.prototype = Object.create(FC.prototype.MapperProto.prototype);

FC.prototype.Mapper119.prototype.Init = function() {
	var i;
	for(i=0; i<this.MAPPER_REG.length; i++)
		this.MAPPER_REG[i] = 0;

	this.MAPPER_REG[16] = 0;
	this.MAPPER_REG[17] = 1;
	this.MAPPER_REG[18] = (this.Core.PrgRomPageCount - 1) * 2;
	this.MAPPER_REG[19] = (this.Core.PrgRomPageCount - 1) * 2 + 1;
	this.Core.SetPrgRomPages8K(this.MAPPER_REG[16], this.MAPPER_REG[17], this.MAPPER_REG[18], this.MAPPER_REG[19]);

	this.MAPPER_REG[8] = 0;
	this.MAPPER_REG[9] = 1;
	this.MAPPER_REG[10] = 2;
	this.MAPPER_REG[11] = 3;
	this.MAPPER_REG[12] = 4;
	this.MAPPER_REG[13] = 5;
	this.MAPPER_REG[14] = 6;
	this.MAPPER_REG[15] = 7;
	this.Core.SetChrRomPages1K(this.MAPPER_REG[8], this.MAPPER_REG[9], this.MAPPER_REG[10], this.MAPPER_REG[11],
				this.MAPPER_REG[12], this.MAPPER_REG[13], this.MAPPER_REG[14], this.MAPPER_REG[15]);
}

FC.prototype.Mapper119.prototype.SetChrRomPages1K = function(page0, page1, page2, page3, page4, page5, page6, page7) {
	if((page0 & 0x40) == 0x00)
		this.Core.SetChrRomPage1K(0, page0 & 0x3F);
	else
		this.Core.VRAM[0] = this.Core.VRAMS[page0 & 0x07];

	if((page1 & 0x40) == 0x00)
		this.Core.SetChrRomPage1K(1, page1 & 0x3F);
	else
		this.Core.VRAM[1] = this.Core.VRAMS[page1 & 0x07];

	if((page2 & 0x40) == 0x00)
		this.Core.SetChrRomPage1K(2, page2 & 0x3F);
	else
		this.Core.VRAM[2] = this.Core.VRAMS[page2 & 0x07];

	if((page3 & 0x40) == 0x00)
		this.Core.SetChrRomPage1K(3, page3 & 0x3F);
	else
		this.Core.VRAM[3] = this.Core.VRAMS[page3 & 0x07];

	if((page4 & 0x40) == 0x00)
		this.Core.SetChrRomPage1K(4, page4 & 0x3F);
	else
		this.Core.VRAM[4] = this.Core.VRAMS[page4 & 0x07];

	if((page5 & 0x40) == 0x00)
		this.Core.SetChrRomPage1K(5, page5 & 0x3F);
	else
		this.Core.VRAM[5] = this.Core.VRAMS[page5 & 0x07];

	if((page6 & 0x40) == 0x00)
		this.Core.SetChrRomPage1K(6, page6 & 0x3F);
	else
		this.Core.VRAM[6] = this.Core.VRAMS[page6 & 0x07];

	if((page7 & 0x40) == 0x00)
		this.Core.SetChrRomPage1K(7, page7 & 0x3F);
	else
		this.Core.VRAM[7] = this.Core.VRAMS[page7 & 0x07];
}

FC.prototype.Mapper119.prototype.Write = function(address, data) {
	switch (address & 0xE001) {
		case 0x8000:
			this.MAPPER_REG[0] = data;
			if((data & 0x80) == 0x80) {
				this.SetChrRomPages1K(this.MAPPER_REG[12], this.MAPPER_REG[13], this.MAPPER_REG[14], this.MAPPER_REG[15], 
							this.MAPPER_REG[8], this.MAPPER_REG[9], this.MAPPER_REG[10], this.MAPPER_REG[11]); 
			} else {
				this.SetChrRomPages1K(this.MAPPER_REG[8], this.MAPPER_REG[9], this.MAPPER_REG[10], this.MAPPER_REG[11], 
							this.MAPPER_REG[12], this.MAPPER_REG[13], this.MAPPER_REG[14], this.MAPPER_REG[15]); 
			}

			if((data & 0x40) == 0x40) {
				this.Core.SetPrgRomPages8K(this.MAPPER_REG[18], this.MAPPER_REG[17], this.MAPPER_REG[16],this.MAPPER_REG[19]);
			} else {
				this.Core.SetPrgRomPages8K(this.MAPPER_REG[16], this.MAPPER_REG[17], this.MAPPER_REG[18],this.MAPPER_REG[19]);
			}
			break;
		case 0x8001:
			this.MAPPER_REG[1] = data;
			switch (this.MAPPER_REG[0] & 0x07) {
				case 0:
					data &= 0xFE;
					this.MAPPER_REG[8] = data;
					this.MAPPER_REG[9] = data + 1;
					break;
				case 1:
					data &= 0xFE;
					this.MAPPER_REG[10] = data;
					this.MAPPER_REG[11] = data + 1;
					break;
				case 2:
					this.MAPPER_REG[12] = data;
					break;
				case 3:
					this.MAPPER_REG[13] = data;
					break;
				case 4:
					this.MAPPER_REG[14] = data;
					break;
				case 5:
					this.MAPPER_REG[15] = data;
					break;
				case 6:
					this.MAPPER_REG[16] = data;
					break;
				case 7:
					this.MAPPER_REG[17] = data;
					break;
			}

			if((this.MAPPER_REG[0] & 0x80) == 0x80) {
				this.SetChrRomPages1K(this.MAPPER_REG[12], this.MAPPER_REG[13], this.MAPPER_REG[14], this.MAPPER_REG[15], 
							this.MAPPER_REG[8], this.MAPPER_REG[9], this.MAPPER_REG[10], this.MAPPER_REG[11]); 
			} else {
				this.SetChrRomPages1K(this.MAPPER_REG[8], this.MAPPER_REG[9], this.MAPPER_REG[10], this.MAPPER_REG[11], 
							this.MAPPER_REG[12], this.MAPPER_REG[13], this.MAPPER_REG[14], this.MAPPER_REG[15]); 
			}

			if((this.MAPPER_REG[0] & 0x40) == 0x40) {
				this.Core.SetPrgRomPages8K(this.MAPPER_REG[18], this.MAPPER_REG[17], this.MAPPER_REG[16],this.MAPPER_REG[19]);
			} else {
				this.Core.SetPrgRomPages8K(this.MAPPER_REG[16], this.MAPPER_REG[17], this.MAPPER_REG[18],this.MAPPER_REG[19]);
			}
			break;

		case 0xA000:
			if((data & 0x01) == 0x01)
				this.Core.SetMirror(true);
			else
				this.Core.SetMirror(false);
			this.MAPPER_REG[2] = data;
			break;
		case 0xA001:
			this.MAPPER_REG[3] = data;
			break;

		case 0xC000:
			this.MAPPER_REG[4] = data;
			break;
		case 0xC001:
			this.MAPPER_REG[5] = data;
			break;

		case 0xE000:
			this.MAPPER_REG[4] = this.MAPPER_REG[5];
			this.MAPPER_REG[7] = 0;
			this.ClearIRQ();
			break;
		case 0xE001:
			this.MAPPER_REG[7] = 1;
			break;
	}
}

FC.prototype.Mapper119.prototype.HSync = function(y) {
	if(this.MAPPER_REG[7] == 1 && y < 240 && (this.Core.IO1[0x01] & 0x08) == 0x08) {
		if(--this.MAPPER_REG[4] == 0)
			this.SetIRQ();
		this.MAPPER_REG[4] &= 0xFF;
	}
}


/**** Mapper140 ****/
FC.prototype.Mapper140 = function(core) {
	FC.prototype.MapperProto.apply(this, arguments);
}

FC.prototype.Mapper140.prototype = Object.create(FC.prototype.MapperProto.prototype);

FC.prototype.Mapper140.prototype.Init = function() {
	this.Core.SetPrgRomPage(0, 0);
	this.Core.SetPrgRomPage(1, 1);
	this.Core.SetChrRomPage(0);
}

FC.prototype.Mapper140.prototype.WriteSRAM = function(address, data) {
	var tmp = (data & 0x30) >> 3;
	this.Core.SetPrgRomPage(0, tmp);
	this.Core.SetPrgRomPage(1, tmp + 1);
	this.Core.SetChrRomPage(data & 0x0F);
}


/**** Mapper152 ****/
FC.prototype.Mapper152 = function(core) {
	FC.prototype.MapperProto.apply(this, arguments);
}

FC.prototype.Mapper152.prototype = Object.create(FC.prototype.MapperProto.prototype);

FC.prototype.Mapper152.prototype.Init = function() {
	this.Core.SetPrgRomPage(0, 0);
	this.Core.SetPrgRomPage(1, this.Core.PrgRomPageCount - 1);
	this.Core.SetChrRomPage(0);
}

FC.prototype.Mapper152.prototype.WriteSRAM = function(address, data) {
	this.Core.SetPrgRomPage(0, (data & 0x70) >> 4);
	this.Core.SetChrRomPage(data & 0x0F);

	if((data & 0x80) == 0x80)
		this.Core.SetMirrors(0, 0, 0, 0);
	else
		this.Core.SetMirrors(1, 1, 1, 1);
}


/**** Mapper180 ****/
FC.prototype.Mapper180 = function(core) {
	FC.prototype.MapperProto.apply(this, arguments);
}

FC.prototype.Mapper180.prototype = Object.create(FC.prototype.MapperProto.prototype);

FC.prototype.Mapper180.prototype.Init = function() {
	this.Core.SetPrgRomPage(0, 0);
	this.Core.SetPrgRomPage(1, this.Core.PrgRomPageCount - 1);
	this.Core.SetChrRomPage(0);
}

FC.prototype.Mapper180.prototype.Write = function(address, data) {
	this.Core.SetPrgRomPage(1, data);
}


/**** Mapper184 ****/
FC.prototype.Mapper184 = function(core) {
	FC.prototype.MapperProto.apply(this, arguments);
}

FC.prototype.Mapper184.prototype = Object.create(FC.prototype.MapperProto.prototype);

FC.prototype.Mapper184.prototype.Init = function() {
	this.Core.SetPrgRomPage(0, 0);
	this.Core.SetPrgRomPage(1, this.Core.PrgRomPageCount - 1);
}

FC.prototype.Mapper184.prototype.WriteSRAM = function(address, data) {
	var chrpage = this.Core.ChrRomPageCount * 2 - 1;
	var tmp;
	tmp = (data & chrpage) * 4;
	this.Core.SetChrRomPage1K(0, tmp);
	this.Core.SetChrRomPage1K(1, tmp + 1);
	this.Core.SetChrRomPage1K(2, tmp + 2);
	this.Core.SetChrRomPage1K(3, tmp + 3);

	tmp = ((data >>> 4) & chrpage) * 4;
	this.Core.SetChrRomPage1K(4, tmp);
	this.Core.SetChrRomPage1K(5, tmp + 1);
	this.Core.SetChrRomPage1K(6, tmp + 2);
	this.Core.SetChrRomPage1K(7, tmp + 3);
}


/**** Mapper185 ****/
FC.prototype.Mapper185 = function(core) {
	FC.prototype.MapperProto.apply(this, arguments);
	this.MAPPER_REG = 0;
	this.EX_ChrRom = new Array(0x0400);
}

FC.prototype.Mapper185.prototype = Object.create(FC.prototype.MapperProto.prototype);

FC.prototype.Mapper185.prototype.Init = function() {
	for(var i=0; i<this.EX_ChrRom.length; i++)
		this.EX_ChrRom[i] = 0xFF;
	this.MAPPER_REG = 0;

	this.Core.SetPrgRomPages8K(0, 1, 2, 3);
	this.Core.VRAM[0] = this.EX_ChrRom;
	this.Core.VRAM[1] = this.EX_ChrRom;
	this.Core.VRAM[2] = this.EX_ChrRom;
	this.Core.VRAM[3] = this.EX_ChrRom;
	this.Core.VRAM[4] = this.EX_ChrRom;
	this.Core.VRAM[5] = this.EX_ChrRom;
	this.Core.VRAM[6] = this.EX_ChrRom;
	this.Core.VRAM[7] = this.EX_ChrRom;
}

FC.prototype.Mapper185.prototype.Write = function(address, data) {
	this.MAPPER_REG = data;

	if((data & 0x03) != 0x00) {
		this.Core.SetChrRomPages1K(0, 1, 2, 3, 4, 5, 6, 7);
	} else {
		this.Core.VRAM[0] = this.EX_ChrRom;
		this.Core.VRAM[1] = this.EX_ChrRom;
		this.Core.VRAM[2] = this.EX_ChrRom;
		this.Core.VRAM[3] = this.EX_ChrRom;
		this.Core.VRAM[4] = this.EX_ChrRom;
		this.Core.VRAM[5] = this.EX_ChrRom;
		this.Core.VRAM[6] = this.EX_ChrRom;
		this.Core.VRAM[7] = this.EX_ChrRom;
	}
}


/**** Mapper207 ****/
FC.prototype.Mapper207 = function(core) {
	FC.prototype.MapperProto.apply(this, arguments);
	this.MAPPER_REG = new Array(11);
	this.EX_RAM = new Array(128);
}

FC.prototype.Mapper207.prototype = Object.create(FC.prototype.MapperProto.prototype);

FC.prototype.Mapper207.prototype.Init = function() {
	for(var i=0; i<this.MAPPER_REG.length; i++)
		this.MAPPER_REG[i] = 0;

	for(var i=0; i<this.EX_RAM.length; i++) {
		this.EX_RAM[i] = 0x00;
	}

	this.Core.SetPrgRomPages8K(0, 1, 2, this.Core.PrgRomPageCount * 2 - 1);
	this.Core.SetChrRomPages1K(0, 1, 2, 3, 4, 5, 6, 7);
}

FC.prototype.Mapper207.prototype.ReadSRAM = function(address) {
	if(address >= 0x7F00 && address <= 0x7FFF)
		return this.EX_RAM[address & 0x007F];

	switch(address) {
		case 0x7EF0:
			return this.MAPPER_REG[0];
		case 0x7EF1:
			return this.MAPPER_REG[1];
		case 0x7EF2:
			return this.MAPPER_REG[2];
		case 0x7EF3:
			return this.MAPPER_REG[3];
		case 0x7EF4:
			return this.MAPPER_REG[4];
		case 0x7EF5:
			return this.MAPPER_REG[5];
		case 0x7EF6:
		case 0x7EF7:
			return this.MAPPER_REG[6];
		case 0x7EF8:
		case 0x7EF9:
			return this.MAPPER_REG[7];
		case 0x7EFA:
		case 0x7EFB:
			return this.MAPPER_REG[8];
		case 0x7EFC:
		case 0x7EFD:
			return this.MAPPER_REG[9];
		case 0x7EFE:
		case 0x7EFF:
			return this.MAPPER_REG[10];
	}

	return 0x00;
}

FC.prototype.Mapper207.prototype.WriteSRAM = function(address, data) {
	if(address >= 0x7F00 && address <= 0x7FFF) {
		this.EX_RAM[address & 0x007F] = data;
		return;
	}

	switch(address) {
		case 0x7EF0:
			this.MAPPER_REG[0] = data;
			if((data & 0x80) == 0x00) {
				this.Core.VRAM[8] = this.Core.VRAMS[8];
				this.Core.VRAM[9] = this.Core.VRAMS[8];
			} else {
				this.Core.VRAM[8] = this.Core.VRAMS[9];
				this.Core.VRAM[9] = this.Core.VRAMS[9];
			}
			this.Core.SetChrRomPage1K(0, data & 0x7E);
			this.Core.SetChrRomPage1K(1, (data & 0x7E) + 1);
			break;
		case 0x7EF1:
			this.MAPPER_REG[1] = data;
			if((data & 0x80) == 0x00) {
				this.Core.SetChrRomPage1K(10, 8 + 0x0100);
				this.Core.SetChrRomPage1K(11, 8 + 0x0100);
			} else {
				this.Core.SetChrRomPage1K(10, 9 + 0x0100);
				this.Core.SetChrRomPage1K(11, 9 + 0x0100);
			}
			this.Core.SetChrRomPage1K(2, data & 0x7E);
			this.Core.SetChrRomPage1K(3, (data & 0x7E) + 1);
			break;
		case 0x7EF2:
			this.MAPPER_REG[2] = data;
			this.Core.SetChrRomPage1K(4, data);
			break;
		case 0x7EF3:
			this.MAPPER_REG[3] = data;
			this.Core.SetChrRomPage1K(5, data);
			break;
		case 0x7EF4:
			this.MAPPER_REG[4] = data;
			this.Core.SetChrRomPage1K(6, data);
			break;
		case 0x7EF5:
			this.MAPPER_REG[5] = data;
			this.Core.SetChrRomPage1K(7, data);
			break;
		case 0x7EF8:
		case 0x7EF9:
			this.MAPPER_REG[7] = data;
			break;
		case 0x7EFA:
		case 0x7EFB:
			this.MAPPER_REG[8] = data;
			this.Core.SetPrgRomPage8K(0, data);
			break;
		case 0x7EFC:
		case 0x7EFD:
			this.MAPPER_REG[9] = data;
			this.Core.SetPrgRomPage8K(1, data);
			break;
		case 0x7EFE:
		case 0x7EFF:
			this.MAPPER_REG[10] = data;
			this.Core.SetPrgRomPage8K(2, data);
			break;
	}
}


FC.prototype.MapperSelect = function () {
	switch(this.MapperNumber) {
		case 0:
			this.Mapper = new this.Mapper0(this);
			break;
		case 1:
			this.Mapper = new this.Mapper1(this);
			break;
		case 2:
			this.Mapper = new this.Mapper2(this);
			break;
		case 3:
			this.Mapper = new this.Mapper3(this);
			break;
		case 4:
			this.Mapper = new this.Mapper4(this);
			break;
		case 5:
			this.Mapper = new this.Mapper5(this);
			break;
		case 7:
			this.Mapper = new this.Mapper7(this);
			break;
		case 9:
			this.Mapper = new this.Mapper9(this);
			break;
		case 10:
			this.Mapper = new this.Mapper10(this);
			break;
		case 16:
			this.Mapper = new this.Mapper16(this);
			break;
		case 18:
			this.Mapper = new this.Mapper18(this);
			break;
		case 19:
			this.Mapper = new this.Mapper19(this);
			break;
		case 20:
			this.Mapper = new this.Mapper20(this);
			break;
		case 21:
			this.Mapper = new this.Mapper25(this);
			break;
		case 22:
			this.Mapper = new this.Mapper22(this);
			break;
		case 23:
			this.Mapper = new this.Mapper23(this);
			break;
		case 24:
			this.Mapper = new this.Mapper24(this);
			break;
		case 25:
			this.Mapper = new this.Mapper25(this);
			break;
		case 26:
			this.Mapper = new this.Mapper26(this);
			break;
		case 32:
			this.Mapper = new this.Mapper32(this);
			break;
		case 33:
			this.Mapper = new this.Mapper33(this);
			break;
		case 34:
			this.Mapper = new this.Mapper34(this);
			break;
		case 48:
			this.Mapper = new this.Mapper48(this);
			break;
		case 65:
			this.Mapper = new this.Mapper65(this);
			break;
		case 66:
			this.Mapper = new this.Mapper66(this);
			break;
		case 67:
			this.Mapper = new this.Mapper67(this);
			break;
		case 68:
			this.Mapper = new this.Mapper68(this);
			break;
		case 69:
			this.Mapper = new this.Mapper69(this);
			break;
		case 70:
			this.Mapper = new this.Mapper70(this);
			break;
		case 72:
			this.Mapper = new this.Mapper72(this);
			break;
		case 73:
			this.Mapper = new this.Mapper73(this);
			break;
		case 75:
			this.Mapper = new this.Mapper75(this);
			break;
		case 76:
			this.Mapper = new this.Mapper76(this);
			break;
		case 77:
			this.Mapper = new this.Mapper77(this);
			break;
		case 78:
			this.Mapper = new this.Mapper78(this);
			break;
		case 80:
			this.Mapper = new this.Mapper80(this);
			break;
		case 82:
			this.Mapper = new this.Mapper82(this);
			break;
		case 85:
			this.Mapper = new this.Mapper85(this);
			break;
		case 86:
			this.Mapper = new this.Mapper86(this);
			break;
		case 87:
			this.Mapper = new this.Mapper87(this);
			break;
		case 88:
			this.Mapper = new this.Mapper88(this);
			break;
		case 89:
			this.Mapper = new this.Mapper89(this);
			break;
		case 92:
			this.Mapper = new this.Mapper92(this);
			break;
		case 93:
			this.Mapper = new this.Mapper93(this);
			break;
		case 94:
			this.Mapper = new this.Mapper94(this);
			break;
		case 95:
			this.Mapper = new this.Mapper95(this);
			break;
		case 97:
			this.Mapper = new this.Mapper97(this);
			break;
		case 101:
			this.Mapper = new this.Mapper101(this);
			break;
		case 118:
			this.Mapper = new this.Mapper118(this);
			break;
		case 119:
			this.Mapper = new this.Mapper119(this);
			break;
		case 140:
			this.Mapper = new this.Mapper140(this);
			break;
		case 152:
			this.Mapper = new this.Mapper152(this);
			break;
		case 180:
			this.Mapper = new this.Mapper180(this);
			break;
		case 184:
			this.Mapper = new this.Mapper184(this);
			break;
		case 185:
			this.Mapper = new this.Mapper185(this);
			break;
		case 207:
			this.Mapper = new this.Mapper207(this);
			break;
		case 210:
			this.Mapper = new this.Mapper19(this);
			break;
		default:
			return false;
	}
	return true;
}

module.exports = FC;
