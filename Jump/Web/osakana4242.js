/**
	個別のアプリに依存しなさそうな機能をまとめておく.
*/
"@file osakana4242.js";

var osakana4242 = osakana4242 || {};

(function() {
"use strict";

osakana4242.namespace = function(ns_string) {
	var parts = ns_string.split('.'),
	parent = osakana4242;
	
	if (parts[0] === "osakana4242") {
		parts = parts.slice(1);
	}
	
	for (var i = 0; i < parts.length; i += 1) {
		if (typeof parent[parts[i]] === "undefined") {
			parent[parts[i]] = {};
		}
		parent = parent[parts[i]];
	}
	return parent;
}
osakana4242.namespace("core");

// enchant();
var Class = enchant.Class;

var Vector2D = Class.create(Class, {
	initialize: function(x, y) {
		this.x = x || 0;
		this.y = y || 0;
	},
});
osakana4242.Vector2D = Vector2D;

/** 線形補間。
*/
osakana4242.TimeLeap = Class.create({
	initialize: function() {
		this.cnt = 0;
		this.cntMax = 0;
		this.resetCnt(0.0);
	},
	resetCnt: function(sec) {
		var game = Game.instance;
		this.cnt = 0;
		this.cntMax = Math.floor(game.fps * sec);
	},
	isEnd: function() {
		return this.cntMax <= this.cnt;
	},
	getRate: function() {
		return this.cnt / this.cntMax;
	},
	/** 時間経過を元に start..end の範囲の値を取得。
	*/
	getLerp: function(start, end, diff) {
		var ret;
		var rate = this.getRate();
		if (0 < diff) {
			rate = Math.sin((Math.PI / 2) * rate);
		}
		
		ret = start + (end - start) * rate;
		return ret;
	},
	getLerpForList: function(valueList, diff) {
		var ret;
		var rate = this.getRate();
		if (0 < diff) {
			rate = Math.sin((Math.PI / 2) * rate);
		}
		var num = valueList.length;
		if (num < 2) {
			error('iilegal args');
			return 0;
		}
		if (rate < 1.0) {
			var startI = Math.floor(rate * (num - 1));
			var endI = startI + 1;
			var startValue = valueList[startI];
			var endValue = valueList[endI];
			var subRateMax = 1.0 / (num - 1);
			var subRate = (rate - startI * subRateMax) / subRateMax;
			
			
			ret = startValue + (endValue - startValue) * subRate;
		}
		else {
			ret = valueList[num - 1];
		}
		return ret;
	},
	exec: function() {
		this.cnt += 1;
		if (this.cntMax < this.cnt) {
			this.cnt = this.cntMax;
		}
	},
});
var TimeLeap = osakana4242.TimeLeap;

/** 数字に関する便利関数.
*/
var NUtil = {
	/** 符号を求める。
	 */
	sign: function(v) {
		if (0 < v) {
			return 1;
		} else if (v < 0) {
			return -1;
		} else {
			return 0;
		}
	},
	trim: function(v, vMin, vMax) {
		if (v < vMin) {
			return vMin;
		}
		if (vMax < v) {
			return vMax;
		}
		return v;
	}
}
osakana4242.NUtil = NUtil;

/** 便利関数。
*/
var Util = {
	secToFrame: function(sec) {
		var game = Game.instance;
		return Math.floor(sec * game.fps);
	},
	frameToSec: function(frame) {
		var game = Game.instance;
		return frame / game.fps;
	},
	/** 秒速xxxドットを1フレームxxxドットに変換。
	*/
	secDotToFrameDot: function(secDot) {
		var game = Game.instance;
		return secDot / game.fps;
	},
	csv: function() {
		var text = "";
		for (var i = 0, size = arguments.length; i < size; ++i) {
			text += arguments[i] + ",";
		}
		return text;
	},
	/** vMin <= x <= vMax の範囲内の整数をランダムに取得。
	*/
	randomIntMinMax: function(vMin, vMax) {
		var len = vMax - vMin;
		var ret = vMin + Math.floor(Math.random() * (len + 1));
		return ret;
	},
	/** 配列をシャッフル。
		randomIntMinMax: function(min, max) -> [min..max]の範囲の整数をランダムに出力
	*/
	shuffleList: function(list, listLen, randomIntMinMax) {
		if (!randomIntMinMax) {
			randomIntMinMax = osakana4242.Util.randomIntMinMax;
		}
		for (var i = 0; i < listLen; i += 1) {
			var j = randomIntMinMax(0, listLen - 1);
			var tmp = list[i];
			list[i] = list[j];
			list[j] = tmp;
			
		}
	},
	arrayToString: function(arr, space) {
		var space = space || "";
		var str = "";
		str = space + "[\n";
		var prevIsArray = false;
		for(var i = 0, length = arr.length; i < length; i += 1) {
			if (0 < i) {
				str += ", ";
				if (prevIsArray) {
					str += "\n";
				}
			}
			var item = arr[i];
			if (item instanceof Array) {
				str += this.arrayToString(item, space + "\t");
				prevIsArray = true;
			}
			else {
				if (i == 0) {
					str += space + "\t";
				}
				str += item;
				prevIsArray = false;
			}
		}
		str += "\n";
		str += space + "]";
		return str;
	},
	
	/** p1 の中に p2 が収まっているか。
	*/
	isInside1D: function(p1, len1, p2, len2) {
		return (p1 <= p2) && (p2 + len2 <= p1 + len1);
	},
	
	/*
	 * (x1, y1, w1, h1) の中に (x2, y2, w2, h2) が収まっているか。
	 */
	isInside2D: function(x1, y1, w1, h1, x2, y2, w2, h2) {
		if (Util.isInside1D(x1, w1, x2, w2) === false) {
			return false;
		}
		return Util.isInside1D(y1, h1, y2, h2);
	},
	
	/*
	 * 当り判定を返します。 (p1, len1) と (p2, len2) が重なっていれば true そうでなければ false を返します。
	 */
	isHit1D: function(p1, len1, p2, len2) {
		return (0 < Math.min(p1 + len1, p2 + len2) - Math.max(p1, p2));
	},

	/*
	 * (x1, y1, w1, h1) と (x2, y2, w2, h2) の 当り判定を返します。
	 */
	isHit2D: function(x1, y1, w1, h1, x2, y2, w2, h2) {
		if (Util.isHit1D(x1, w1, x2, w2) === false) {
			return false;
		}
		return Util.isHit1D(y1, h1, y2, h2);
	},
	
	/* 線分と線分の衝突判定。
	*/
	isHitLineAndLine: function(asx, asy, aex, aey, bsx, bsy, bex, bey) {
		// 線分Aのベクトル。
		var vax = aex - asx;
		var vay = aey - asy;
		// vax, vay を時計回りに90度回転。
		var nx = - vay;
		var ny = vax;
		// 法線を正規化。
		var length = Math.sqrt((nx * nx) + (ny * ny));
		if (0 < length) {
			length = 1 / length;
		}
		nx *= length;
		ny *= length;
		
		// 線分Bのベクトル。
		var vbx = bex - bsx;
		var vby = bey - bsy;
		//
		var d = - (asx * nx + asy * ny);
		var bunbo = (nx * vbx + ny * vby);
		if (bunbo == 0) {
			return false;
		}
		var t = - (nx * bsx + ny * bsy + d) / bunbo;
		if (t <= 0 || 1 < t) {
			// 当たってない。
			return false;
		}
		// 線との交差点。
		var hitX = bsx + vbx * t;
		var hitY = bsy + vby * t;
		//
		var doc = ((asx - hitX) * (aex - hitX)) + ((asy - hitY) * (aey - hitY));
		if (doc < 0) {
			// 当たり。
			return true;
		}
		else {
			// 外れ。
			return false;
		}
	},
	/** 線分と矩形の衝突判定。
	*/
	isHitLineAndRect: function(lsx, lsy, lex, ley, rx, ry, rw, rh) {
		// まず線分を囲む矩形と矩形の衝突判定。
		var lrx = Math.min(lsx, lex);
		var lry = Math.min(lsy, ley);
		var lrw = Math.abs(lex - lsx) + 1;
		var lrh = Math.abs(ley - lsy) + 1;
	
		if (!Util.isHit2D(lrx, lry, lrw, lrh, rx, ry, rw, rh)) {
			return false;
		}
		if (Util.isInside2D(rx, ry, rw, rh, lrx, lry, lrw, lrh)) {
			// 線分が矩形の中にすっぽり収まってる。
			return true;
		}
		
		// 線分が矩形のいずれかの辺と交差しているか。
		var rx1 = rx;
		var ry1 = ry;
		var rx2 = rx + rw;
		var ry2 = ry + rh;
		
		if (	Util.isHitLineAndLine(lsx, lsy, lex, ley, rx1, ry1, rx2, ry1)
			||	Util.isHitLineAndLine(lsx, lsy, lex, ley, rx1, ry2, rx2, ry2)
			||	Util.isHitLineAndLine(lsx, lsy, lex, ley, rx1, ry1, rx1, ry2)
			||	Util.isHitLineAndLine(lsx, lsy, lex, ley, rx2, ry1, rx2, ry2)
		) {
			return true;
		}
		return false;
	},
	
	/* 線分と点の距離を求める。修正中。。。
	*/
	getLineToPointDistance: function(lsx, lsy, lex, ley, px, py) {
		// 線分のベクトル。
		var vax = lex - lsx;
		var vay = ley - lsy;
		// vax, vay を時計回りに90度回転。
		var nx = - vay;
		var ny = vax;
		// 法線を正規化。
		var length = Math.sqrt((nx * nx) + (ny * ny));
		if (0 < length) {
			length = 1 / length;
		}
		nx *= length;
		ny *= length;
		
		//
		var d = - (lsx * nx + lsy * ny);
		//var t = - (nx * px + ny * py + d) / (nx + ny);
		var t = - (nx * px + ny * py + d);
		
		// 直線との交差点。
		var hitX = px + nx * t;
		var hitY = py + ny * t;
		//
		var doc = ((lsx - hitX) * (lex - hitX)) + ((lsy - hitY) * (ley - hitY));
		var Util = osakana4242.Util;
		var dist = 0;
		if (doc < 0) {
			// 当たり。
			dist = Util.getPToPDistance(px, py, hitX, hitY);
		}
		else {
			// 外れ。
			var distA2 = Util.getPToPDistance2(px, py, hitX, hitY);
			var distB2 = Util.getPToPDistance2(px, py, hitX, hitY);
			dist = Math.min(distA2, distB2);
			dist = Math.sqrt(dist);
		}
		return dist;
	},
	/** 二点間の距離の二乗。
	*/
	getPToPDistance2: function(ax, ay, bx, by) {
		var vx = bx - ax;
		var vy = by - ay;
		return vx * vx + vy * vy;
	},
	/** 二点間の距離。
	*/
	getPToPDistance: function(ax, ay, bx, by) {
		var Util = osakana4242.Util;
		return Math.sqrt(Util.getPToPDistance2(ax, ay, bx, by));
	},
	/** スカラー。
	*/
	scalar2D: function(x, y) {
		var scalar = Math.sqrt(x * x + y * y); 
		return scalar;
	},
	/** 内積。
	*/
	inner2D: function(x1, y1, x2, y2) {
		var inner = (x1 * x2) + (y1 * y2); 
		return inner;
	}
};
osakana4242.Util = Util;

/** 描画で処理落ちしたときに、複数フレーム分の処理を行うためのもの。
*/
osakana4242.FpsCtrl = Class.create(Class, {
	initialize: function() {
		this.execTimer = 0;
		this.frameCnt = 0;
		this.elapsed = 0;
		this.fpsAve = 0;
	},
	exec: function(realElapsed, parent, fExec) {
		var game = Game.instance;
		var baseElapsed = 1000 / game.fps; // 理想の経過時間。
		this.execTimer += realElapsed;
		var execCnt = 0;
		while (baseElapsed <= this.execTimer) {
			fExec.call(parent);
			this.execTimer -= baseElapsed;
			execCnt += 1;
		}
		// var fps = Math.round(10000 / e.elapsed) / 10;
		this.frameCnt += 1;
		this.elapsed += realElapsed
		if (30 <= this.frameCnt) {
			this.fpsAve = Math.round(1000 * this.frameCnt / this.elapsed);
			this.frameCnt = 0;
			this.elapsed = 0;
		}
		
		var maxExecCnt = 8; // 最大フレームスキップ数。
		if (maxExecCnt < execCnt) {
			execCnt = maxExecCnt;
		}
		
		return execCnt;
	}
});


/** 音を再生するたびに clone するのがちょっと気持ち悪かった。。。
*/
osakana4242.Sound = Class.create(Class, {
	initialize: function(name, playTime, isLoop) {
		var core = Core.instance;
		var sound = core.assets(name)
		this.sounds = [sound];
		this.idx = 0;
		this.num = 1;
		this.playTime = playTime;
		this.isLoop = isLoop;
		this.isPlaying = false;
		this.timeoutId = null;
	},
	play: function() {
		this.isPlaying = true;
		this._play();
	},
	
	clearTimeout: function() {
		if (this.timeoutId != null) {
			window.clearTimeout(this.timeoutId);
			this.timeoutId = null;
		}
	},
	
	_play: function() {
		this.timeoutId = null;
		this.clearTimeout();
		this._stop();
		if (this.isPlaying) {
			this.sounds[this.idx].play();
			var sound = this;
			if (this.isLoop) {
				var time = Math.floor(this.playTime * 1000);
				this.timeoutId = window.setTimeout(function() { sound._play.call(sound); }, time);
			}
		}
		this.idx += 1;
		if (this.num <= this.idx) {
			this.idx = 0;
		}
	},
	
	_stop: function() {
		for (var i = 0; i < this.sounds.length; i += 1) {
			try {
				this.sounds[i].stop();
			} catch (e) {
				Logger.debug.log(Util.csv("sound", i, "stop", e));
				if (e.message == "DOM Exception: INVALID_STATE_ERR (11)") {
					// IE で発生するけど、無視してもだいじょぶそう。。。
				}
				else {
					throw e;
				}
			}
		}
	},
	
	stop: function() {
		this.isPlaying = false;
		this.clearTimeout();
		this._stop();
	}
});
var Sound = osakana4242.Sound;

osakana4242.SoundMgr = Class.create(Class, {
	initialize: function() {
		this.channels = {
			"bgm": {
				name: ""
			},
			"se": {
				name: ""
			}
		};
		
		this.soundList = {};
	},
	play: function(channelName, name) {
		if (!Core.instance.appConfig.isSoundLoad) {
			return;
		}
		
		this.stop(channelName);
		var channel = this.channels[channelName];
		channel.name = name;
		this.soundList[channel.name].play();
	},
	stop: function(channelName) {
		if (!Core.instance.appConfig.isSoundLoad) {
			return;
		}
		
		var channel = this.channels[channelName];
		if (channel.name != "") {
			this.soundList[channel.name].stop();
			channel.name = "";
		}
	},
	add: function(name, playTime, isLoop) {
		if (!Core.instance.appConfig.isSoundLoad) {
			return;
		}
		
		this.soundList[name] = new Sound(name, playTime, isLoop);
	},
	exec: function() {
	}
});
var SoundMgr = osakana4242.SoundMgr;


osakana4242.core.FastRandom = Class.create(Class, {

	initialize: function() {
		this._seed = 0;
		this._mulValue = 69069;
		this._addValue = 1;
	},
	
	seed: {
		get: function() {
			return this._seed;
		},
		set: function(value) {
			this._seed = Math.floor(value);
			Logger.debug.log(Util.csv("setSeed seed", this._seed));
		}
	},

	getInt: function() {
		this._seed = (this._seed * this._mulValue + this._addValue) & 0x7fffffff;
		return this._seed >> 16;
	},

	getIntN: function(num) {
		var ret = this.getInt() % num;
		return ret;
	},

	getIntMinMax: function(min, max) {
		var size = max - min + 1;
		return min + this.getIntN(size);
	}
});
var FastRandom = osakana4242.core.FastRandom;

var AnimData = Class.create(Class, {
	initialize: function(frameTime, frameList) {
		this.frameTime = frameTime; // 1フレームにかける時間。
		this.frameNum = frameList.length;
		this.frameList = frameList;
	}
});
osakana4242.AnimData = AnimData;

/** アニメ。
*/
var Anim = Class.create(Class, {
	initialize: function() {
		// Class.call(this);
		this.waitCnt = 0.0;
		this.speed = 1.0;
		
		
		this.frameIdx = 0;
		this.animData = null;
		this._animId = '';
	},
	setAnimId: function(animId) {
		this.animId = animId;
	},
	getAnimId: function() {
		return this.animId;
	},
	animId: {
		get: function() {
			return this._animId;
		},
		set: function(animId) {
			this._animId = animId;
			this.animData = Anim.DATA_LIST[this._animId];
			this.waitCnt = 0;
			this.frameIdx = 0;
			this.speed = 1.0;
		},
	},
	curFrame: {
		get: function() {
			if (this.animData != null) {
				return this.animData.frameList[this.frameIdx];
			}
			else {
				return 0;
			}
		},
	},
	getCurFrame: function() {
		return this.curFrame;
	},
	exec: function() {
		if (this.animData == null) {
			return;
		}
		
		this.waitCnt += 1;
		if (Util.secToFrame(this.animData.frameTime) / this.speed <= this.waitCnt) {
			this.frameIdx += 1;
			if (this.animData.frameNum <= this.frameIdx) {
				this.frameIdx = 0;
			}
			this.waitCnt = 0;
		}
	}
});
Anim.DATA_LIST = {};
osakana4242.Anim = Anim;

osakana4242.NineleapUtil = {
	sendScore: function(score, result) {
		if (location.hostname == 'r.jsgames.jp') {
			var id = location.pathname.match(/^\/games\/(\d+)/)[1]; 
			location.replace([
				'http://9leap.net/games/', id, '/result',
				'?score=', encodeURIComponent(score),
				'&result=', encodeURIComponent(result)
			].join(''));
		}
	}
};

var Input = Class.create(Class, {
	initialize: function() {
		this.pos = new Vector2D();
		this.isMove = false;
		this.isStart = false;
		this.isEnd = false;
	}
});
osakana4242.Input = Input;

var InputMgr = Class.create(Class, {
	initialize: function() {
		this.inputW = new Input();
		this.inputR = new Input();
	},
	setScene: function(scene) {
		var core = osakana4242.Core.instance;
		var input = this;
		scene.addEventListener(enchant.Event.TOUCH_START, function(e) { core.input.onTouchStart.call(input, e) });
		scene.addEventListener(enchant.Event.TOUCH_MOVE,  function(e) { core.input.onTouchMove.call(input, e) });
		scene.addEventListener(enchant.Event.TOUCH_END,  function(e) { core.input.onTouchEnd.call(input, e) });
	},
	onTouchStart: function(e) {
		this.inputW.isStart = true;
		this.inputW.pos.x = e.x;
		this.inputW.pos.y = e.y;
	},
	
	onTouchMove: function(e) {
		this.inputW.isMove = true;
		this.inputW.pos.x = e.x;
		this.inputW.pos.y = e.y;
	},
	
	onTouchEnd: function(e) {
		this.inputW.isEnd = true;
		this.inputW.pos.x = e.x;
		this.inputW.pos.y = e.y;
	},
	exec: function() {
		// 入力周り。後でキューを使用したものに変更しよう。取りこぼしが発生しちゃう。
		var input = this.inputR;
		input.pos.x = this.inputW.pos.x;
		input.pos.y = this.inputW.pos.y;
		input.isStart = this.inputW.isStart;
		this.inputW.isStart = false;
		input.isMove = this.inputW.isMove;
		this.inputW.isMove = false;
		input.isEnd = this.inputW.isEnd;
		this.inputW.isEnd = false;
	},
	getInput: function() {
		return this.inputR;
	}
});
osakana4242.InputMgr = InputMgr;

//	
//	var Queue = Class.create(Class, {
//		initialize: function(arr, arrNum) {
//			this.idxW = 0;
//			this.idxR = 0;
//			this.items = [];
//		}
//	});

var AppConfig = Class.create(Class, {
	initialize: function() {
		this.resPath = html.resPath || "";
		this.cacheStr = "?v=hoge";
	}
});

var Logger = {
	debug: console,
};

// ログを無効に.
Logger.debug = {log: function(){}};

osakana4242.Logger = Logger;

var Core = Class.create(Class, {
	initialize: function(appConfig, game) {
		if (Core.instance != null) {
			return;
		}
		this.appConfig = appConfig;
		this.sound = new SoundMgr();
		this.input = new InputMgr();
		this.fade = new Fader();
		this.randomMap = {};
		this.randomMap["core_default"] = new FastRandom();
		this.debug = {
			error: function(str) {
				var game = Game.instance;
				window.alert(str);
				game.stop();
			},
		};
		Core.instance = this;
	},
	
	exec: function() {
		this.input.exec();
		this.sound.exec();
		this.fade.exec();
	},
	
	assets: function(name) {
		var game = Game.instance;
		return game.assets[this.getResUrl(name)];
	},
	
	getResUrl: function(name) {
//		return this.appConfig.resPath + name;
		return this.appConfig.resPath + name + this.appConfig.cacheStr;
	},
	
	preload: function(fileNames) {
		var game = Game.instance;
		for (var i = 0, size = fileNames.length; i < size; ++i) {
			var url = this.getResUrl(fileNames[i]);
			game.preload(url);
		}
	}
	
	
});


/** フェードイン、フェードアウト。
*/
var Fader = Class.create(Class, {
	initialize: function() {
		var core = Core.instance;
		this.curValue = 1.0;
		this.startValue = 0.0;
		this.endValue = 0.0;
		
		this.tl = new TimeLeap();
	},
	
	attachLayer: function(group) {
		var sprite = new Sprite();
		group.addChild(sprite);
		sprite.x = 0;
		sprite.y = 0;
		sprite.width = 320;
		sprite.height = 320;
		sprite.backgroundColor = "rgb(0,0,0)";
		sprite.opacity = this.curValue;
		sprite.touchEnabled = false;
		this.sprite = sprite;
	},
	
	updateSprite: function(sprite) {
		sprite.opacity = this.curValue;
	},
	
	exec: function(e) {
		if (this.tl.isEnd()) {
			return;
		}
		this.tl.exec();
		this.curValue = this.tl.getLerp(this.startValue, this.endValue, 0.0);
		this.updateSprite(this.sprite);
	},
	fadeIn: function(sec) {
		this.endValue = 0.0;
		if (sec == 0) {
			this.curValue = this.endValue;
		}
		
		this.tl.resetCnt(sec);
		this.startValue = this.curValue;
	},
	fadeOut: function(sec) {
		this.endValue = 1.0;
		if (sec == 0) {
			this.curValue = this.endValue;
		}
	
		this.tl.resetCnt(sec);
		this.startValue = this.curValue;
	},
	isEnd: function() {
		return this.tl.isEnd();
	}
});
osakana4242.core.Fader = Fader;

osakana4242.Core = Core;
}());

