/* ジャンプ地獄。
*/
"@file game.js";
(function() {
	"use strict";
		
	var Game = enchant.Game;
	var Sound = enchant.Sound;
	
	var jump_hell = osakana4242.jump_hell;
	var DF = osakana4242.jump_hell.DF;
	var Util = osakana4242.Util;
	var SoundList = osakana4242.SoundList;
	var Core = osakana4242.Core;
	var Anim = osakana4242.Anim;
	var AnimData = osakana4242.AnimData;
	var Input = osakana4242.core.Input;
	var FastRandom = osakana4242.core.FastRandom;
	var Logger = osakana4242.Logger;
	
	var appConfig = {
		resPath: html.resPath || "",
		cacheStr: "?v=" + DF.VERSION,
		isSoundLoad: html.isSoundLoad,
		isDebug: true,
	};
	
	// DBに保存.
	var user = {
		curStageId: 1,
		playType: 1,
	};
	
	var PlayProgress = Class.create(Scene, {
		initialize: function() {
			this.playType = html.playType;
			this.startStageId = html.startStageId;
			this.startRandomSeed = html.startRandomSeed;
			this.stageMap = {};
			this._curStageId = 0;
			this.curStageId = parseInt(html.startStageId);
		},
		
		curStageId: {
			get: function() {
				return this._curStageId;
			},
			set: function(v) {
				this._curStageId = v;
				this.stageMap[v] = {
					"score": 0
				}
			}
		},
		
		// スコアの合計を求める.
		calcTotalScore: function() {
			var score = 0;
			for(var key in this.stageMap) {
				var stage = this.stageMap[key];
				score += stage["score"];
			}
			return score;
		},
		
		getStageById: function(id) {
			var stages = osakana4242.jump_hell.STAGE_DATA["stages"];
			for (var stageI = 0, stageNum = stages.length; stageI < stageNum; ++stageI) {
				var stage = stages[stageI];
				if (stage["id"] === id) {
					return stage;
				}
			}
			return null;
		},
		
		isFinalStage: function() {
			if (this.playType === DF.PLAY_TYPE_ALL_STAGE) {
				var stage = this.getStageById(this.curStageId);
				if (stage["flg_last"] === 1) {
					return true;
				}
				var stageData = osakana4242.jump_hell.STAGE_DATA;
				if (this.curStageId === stageData["stages"].length) {
					return true;
				}
				return false;
			}
			else {
				return true;
			}
		},
		
		resetProgress: function() {
			this.stageMap = {};
			this.curStageId = this.startStageId;
		},
		
		incrementStage: function() {
			if (this.isFinalStage()) {
			}
			else {
				++this.curStageId;
			}
		}
	});
	var playProgress = new PlayProgress();
	
	
	
	Anim.DATA_LIST = {
		'stand_u': new AnimData(0.2, [0, 1]),
		'jump_u': new AnimData(0.1, [0]),
		'jump_lu': new AnimData(0.1, [8, 9]),
		'jump_ru': new AnimData(0.1, [16, 17]),
		'stand_d': new AnimData(0.2, [24]),
		'dead': new AnimData(0.2, [32]),
		
		'star_1': new AnimData(0.05, [ 0,  1,  2,  3]),
		'star_2': new AnimData(0.05, [ 8,  9, 10, 11]),
		'star_3': new AnimData(0.05, [16, 17, 18, 19]),
		'star_4': new AnimData(0.05, [24, 25, 26, 27]),
		
		'panel': new AnimData(0.1, [0, 1, 2, 3]),
		'panel_tap_effect': new AnimData(0.1, [0, 1, 2, 3]),
		
		'dummy': new AnimData(0.1, [])
	};
	
	var game = new Game(DF.SC_W, DF.SC_H);
	var core = new Core(appConfig, game);
	var isPc = html ? html.isPc : false;
	if (isPc) {
		game.fps = 60;
	} else {
		game.fps = DF.BASE_FPS;
	}
	core.randomMap["game"] = new FastRandom();
	core.randomMap["effect"] = new FastRandom();
	
	core.record = core.record || {};
	core.record.jump_hell = {
		"playProgress": playProgress
	};
	
	
	core.preload([
		'img/chara_01.png',
		'img/font.png',
		'img/buttons.png',
		'img/panel.png',
		'img/bg_02.png',
		'img/bg_03.png',
		'img/ground_01.png',
		'img/ground_02.png',
		'img/title.png',
		'img/start.png',
		'img/clear.png',
		'img/chain_gauge_frame.png',
		'img/effect.png',
		'img/panel_tap_effect.png',
		'img/game_over.png',
		'img/tutorial_01.png',
		'img/tutorial_02.png'
	]);
	
	if (appConfig.isSoundLoad) {
		core.preload([
			'snd/se_ok.mp3',
			'snd/se_panel.mp3',
			'snd/se_jump.mp3',
			'snd/jgl_game_over.mp3',
			'snd/jgl_game_clear.mp3',
			'snd/bgm_main_intro.mp3',
			'snd/bgm_main.mp3'
		]);
	}
	
	
	game.addEventListener('progress', function(e) {
		Logger.debug.log(Util.csv("loaded", e.loaded));
	});
	game.onload = function() {
		var core = Core.instance;
		core.sound.add('snd/se_ok.mp3',				0, false);
		core.sound.add('snd/se_panel.mp3', 			0, false);
		core.sound.add('snd/se_jump.mp3', 			0, false);
		core.sound.add('snd/jgl_game_over.mp3'	,	0, false);
		core.sound.add('snd/jgl_game_clear.mp3'	,	0, false);
		core.sound.add('snd/bgm_main_intro.mp3'	,	0, false);
		core.sound.add('snd/bgm_main.mp3'		,	27.472, true);
		var scene = new jump_hell.SceneLoad();
		game.replaceScene(scene);
	};	
	
	Sound.enabledInMobileSafari = false;
	Logger.debug.log("game.start");
	game.start();
}());



