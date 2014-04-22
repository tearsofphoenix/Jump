/* ゲーム。
*/
"@file scene_game.js";
(function() {
"use strict";

var Logger = osakana4242.Logger;

var Game = enchant.Game;
var Class = enchant.Class;
var Vector2D = osakana4242.Vector2D;
var TimeLeap = osakana4242.TimeLeap;
var Util = osakana4242.Util;
var NUtil = osakana4242.NUtil;
var FpsCtrl = osakana4242.FpsCtrl;
var Anim = osakana4242.Anim;
var AnimData = osakana4242.AnimData;
var Input = osakana4242.Input;
var Sprite = osakana4242.Sprite;
var Sprite3D = osakana4242.Sprite3D;
var Core = osakana4242.Core;

var jump_hell = osakana4242.jump_hell;
var PanelAttr = osakana4242.jump_hell.PanelAttr;
var ColorRGB = osakana4242.jump_hell.ColorRGB;
var DF = osakana4242.jump_hell.DF;
var Camera = osakana4242.jump_hell.sprite.Camera;

// コンテンツに依存した便利関数群.
var GameUtil = {
	/**  panel とタップ位置との距離に対応する評価用レコードの取得。
	*/
	distanceToPanelTapRank: function(tapDistance) {
		var idMax = DF.PANEL_TAP_RANK_NUM;
		var recordMap = DF.PANEL_TAP_RANK_MAP;
		for (var id = 1; id <= idMax; ++id) {
			var record = recordMap[id];
			if (tapDistance < record["judge_distance"]) {
				return record;
			}
		}
		return recordMap[idMax];
	},
	/** ジャンプ時間に対応する評価用レコードの取得。
	*/
	timeToJumpTimeRecord: function(time) {
		var idMax = DF.PANEL_JUMP_TIME_RANK_NUM;
		var recordMap = DF.PANEL_JUMP_TIME_MAP;
		for (var i = 1; i <= idMax; ++i) {
			var record = recordMap[i];
			if (time <= record["time"]) {
				return record;
			}
		}
		return recordMap[idMax];
	},
	
	/** 指定されたエフェクトのリストから仕事してないエフェクトの取得。
	*/
	getNeetEffect: function(effectList, priority) {
		var old = null;
		if (priority === undefined) {
			priority = 0;
		}
		for (var i = 0, len = effectList.length; i < len; ++i) {
			var effect = effectList[i];
			if (!effect.isUse) {
				effect.priority = priority;
				return effect;
			}
			if (effect.priority <= priority && (old == null || old.frameCnt < effect.frameCnt)) {
				old = effect;
			}
		}
		old.priority = priority;
		return old;
	},
};

/** ゲームのシーン。
*/	
var SceneGame = Class.create(Scene, {
	initialize: function() {
		var game = Game.instance;
		var core = Core.instance;
		
		this._isPause = false;
		
		var stageData = osakana4242.jump_hell.STAGE_DATA;
		var playProgress = core.record.jump_hell.playProgress;
		this.stage = stageData["stages"][playProgress.curStageId - 1];
		this.stageFormMap = this.stage["form_map"];
		this.stageZoneMap = this.stage["zone_map"];
		this.stagePanelAttrList = (function(colors) {
			// 色定義のリストから、PanelAttr のリストを作成。
			var list = [];
			for (var i = 0, iNum = colors.length; i < iNum; ++i) {
				var color = colors[i];
				var panelAttr = new PanelAttr(new ColorRGB(color["r"], color["g"], color["b"]));
				list.push(panelAttr);
			}
			return list;
		}(this.stage["colors"]));
		
		(function(scene) {
			// ステージデータが存在しないデータを参照してないか事前にチェック.
			for (var zoneKey in scene.stageZoneMap) {
				var zone = scene.stageZoneMap[zoneKey];
				for (var formI = 0, formNum = zone.length; formI < formNum; ++formI) {
					var formKey = zone[formI];
					var form = scene.stageFormMap[formKey];
					Logger.debug.log(Util.csv("zone", zoneKey, "form", formKey, form));
					if (form === undefined) {
						throw new Error("invalid stage data!");
					}
				}
			}
		}(this));
		/** プレイヤーがクリアするのに必要な form の数. */
		this.stageFormNum = (function(stage) {
			var formNum = 0;
			for (var areaI = 0, areaNum = stage["areas"].length; areaI < areaNum; ++areaI) {
				var area = stage["areas"][areaI];
				for (var zoneI = 0, zoneNum = area["zones"].length; zoneI < zoneNum; ++zoneI) {
					var zoneKey = area["zones"][zoneI];
					var forms = stage["zone_map"][zoneKey];
					formNum += forms.length;
				}
			}
			return formNum;
		}(this.stage));
		
		
		core.randomMap["game"].seed = playProgress.startRandomSeed;
		core.fade.fadeOut(0);
		Scene.call(this);
		this.initSprites();
		
		
		this.stageProgress = {
			areaIdx: 0,
			zoneIdx: 0,
			zoneList: [],
			formIdx: 0,
			playerLeftJump: 0
		};
		
		this.tl = new TimeLeap();
		this.score = playProgress.calcTotalScore();
		this.chainCnt = 0; // 連鎖回数。
		this.chainCntMaxRecord = 0; // 最大連鎖記録。
		
		/** 連鎖とみなす時間を減算カウント。*/
		this.chainTimeCnt = Util.secToFrame(DF.CHAIN_TIME);
		/** panel に乗っていられる時間を減算カウント。 */
		this.panelTimeCnt = Util.secToFrame(DF.PANEL_TIME);
		
		this.panelAttrList = new Array(128);
		this.panelAttrListLen = 0;
		/** panel属性取得用インデックス。 */
		this.panelAttrListIdxGet = 0;
		
		this.backgroundColor = this.stage["bg"]["background_color"];
		
		
		this.formAddCnt = 0; // フォームを追加した回数。
		
		//
		this.setScore(this.score);
		this.setChainCnt(0);
		
		//
		this.initArea();
		// はじめのいっぽ。
		this.addPanel(DF.SC_W / 2);
		this.player.setTargetPanel(this.panels[0]);
		//
		this.stateCnt = 0;
		this.state = SceneGame.STATE_IN_1;
		//
		this.fpsCtrl = new FpsCtrl();
		//
		this.chainTimeMax = Util.secToFrame(DF.CHAIN_TIME);
		this.panelTimeMax = Util.secToFrame(DF.PANEL_TIME) - this.chainTimeMax;
		//
		this.addEventListener(Event.TOUCH_START, this.onTouch);
		this.addEventListener(Event.ENTER_FRAME, this.exec);
		
		//
		/*
		game._element.style.backgroundImage = 'url(bg_01.png)';
		this.bg = {
			x: 0,
			y: 0
		};
		*/
	},
	
	/** 各種スプライトの追加、初期化。
	*/
	initSprites: function() {
		var game = Game.instance;
		var core = Core.instance;
		var sprite;
		
		// レイヤー。
		this.layerBg = new Group(); // 背景。
		this.addChild(this.layerBg);
		this.layerStage = new Group(); // ゲームキャラクターとかを配置するレイヤー。
		this.addChild(this.layerStage);
		this.layerSystem = new Group(); // スコアとかテキスト系のレイヤー。
		this.addChild(this.layerSystem);
		core.fade.attachLayer(this);
		
		// 動く背景。
		this.spriteBg = new SpriteBg();
		// 背景の流れるスピード.
		this.spriteBg.effectVx = Util.secDotToFrameDot(this.stage["bg"]["effect_vx"]);
		this.spriteBg.effectVy = Util.secDotToFrameDot(this.stage["bg"]["effect_vy"]);
		this.layerBg.addChild(this.spriteBg);
		
		// 地面1.
		sprite = new Sprite3D();
		this.spriteGround1 = sprite;
		this.layerStage.addChild(sprite);
		sprite.width = 640;
		sprite.height= 320;
		sprite.cx = DF.SC_W / 2;
		sprite.yz = 80;
		sprite.image = core.assets("img/ground_01.png");
		
		// 地面2.
		sprite = new Sprite3D();
		this.spriteGround2 = sprite;
		this.layerStage.addChild(sprite);
		sprite.width = 640;
		sprite.height= 320;
		sprite.cx = DF.SC_W / 2;
		sprite.yz = this.getPanelAddYFromGroupAddId(this.stageFormNum) - 64;
		sprite.image = core.assets("img/ground_02.png");
		
		//  panel 。
		this.panels = new Array(16);
		for (var i = 0; i < this.panels.length; i += 1) {
			var panel = new SpritePanel();
			this.layerStage.addChild(panel);
			this.panels[i] = panel;
			panel.visible = false;
		}
		
		//  panel エフェクト。
		this.panelEffects = new Array(8);
		for (var i = 0; i < this.panelEffects.length; i += 1) {
			var effect = new SpriteEffect();
			this.layerStage.addChild(effect);
			this.panelEffects[i] = effect;
		}
		
		// 影。
		sprite = new Sprite3D();
		this.layerStage.addChild(sprite);
		this.shadow = sprite;
		sprite.image = core.assets('img/chara_01.png');
		sprite.width = 32;
		sprite.height = 16;
		sprite.frame = 127;
		sprite.visible = false;
		
		// プレイヤー。
		this.player = new SpritePlayer();
		this.layerStage.addChild(this.player);
		this.player.cx = DF.SC_W / 2;
		this.player.cyz = DF.SC_H / 2;
		
		// カメラ。
		this.camera = new Camera(DF.SC_W, DF.SC_H);
		this.camera.x = this.player.cx;
		this.camera.y = this.player.cy + 160;
		this.layerStage.addChild(this.camera.cameraSprite);
		this.layerStage.addChild(this.camera.cameraTargetSprite);

		
		// チェインキラキラエフェクト。
		this.chainEffects = new Array(8);
		for (var i = 0; i < this.chainEffects.length; i += 1) {
			var effect = new SpriteEffect();
			this.layerStage.addChild(effect);
			this.chainEffects[i] = effect;
		}
		
		// スコア取得エフェクト。
		this.scoreEffects = new Array(8);
		for (var i = 0; i < this.scoreEffects.length; i += 1) {
			var effect = new SpriteEffect();
			this.layerSystem.addChild(effect);
			this.scoreEffects[i] = effect;
		}
		// this.scoreEffect = new SpriteEffect();
		// this.layerSystem.addChild(this.scoreEffect);
		// this.layerStage.addChild(this.scoreEffect);
		
		// ステータス周り。
		sprite = new Sprite();
		this.chainGaugeFrame = sprite;
		this.layerSystem.addChild(sprite);
		sprite.image = core.assets('img/chain_gauge_frame.png');
		sprite.width = 64;
		sprite.height = 8;
		sprite.touchEnabled = false;
		sprite.cx = DF.SC_CX;
		sprite.y = DF.SC_H - 12;
		
		sprite = new Sprite();
		this.chainGauge = sprite;
		this.layerSystem.addChild(sprite);
		sprite.width = 54;
		sprite.height = 2;
		sprite.touchEnabled = false;
		sprite.backgroundColor = "rgb(255, 255, 0)";
		sprite.x = this.chainGaugeFrame.x + 5;
		sprite.y = this.chainGaugeFrame.y + 3;
		sprite.setRate = function(rate) {
			if (1.0 < rate) {
				rate = rate - 1.0;
				this.backgroundColor = "rgb(255, 255, 0)";
			}
			else {
				this.backgroundColor = "rgb(255, 0, 0)";
			}
			this.width = 54 * rate;
		}
		
		sprite = new Sprite();
		this.labelScore = sprite;
		this.layerSystem.addChild(sprite);
		sprite.setText('SCORE');
		sprite.touchEnabled = false;
		sprite.x = 8;
		sprite.y = 8;
		
		sprite = new Sprite();
		this.labelScoreValue = sprite;
		this.layerSystem.addChild(sprite);
		sprite.setText('0       ');
		sprite.touchEnabled = false;
		sprite.x = 8 + DF.FONT_SIZE * 6;
		sprite.y = 8;
		
		sprite = new Sprite();
		this.labelChain = sprite;
		this.layerSystem.addChild(sprite);
		sprite.setText('CHAIN');
		sprite.touchEnabled = false;
		sprite.x = 8;
		sprite.y = 8 + DF.FONT_SIZE;
		
		sprite = new Sprite();
		this.labelChainValue = sprite;
		this.layerSystem.addChild(sprite);
		sprite.setText('0  ');
		sprite.touchEnabled = false;
		sprite.x = 8 + 16 * 6;
		sprite.y = 8 + DF.FONT_SIZE;
		
		if (DF.FLG_FPS) {
			sprite = new Sprite();
			this.labelFps = sprite;
			this.layerSystem.addChild(sprite);
			sprite.setText('FPS:00');
			sprite.touchEnabled = false;
			sprite.x = 8;
			sprite.y = 8 + DF.FONT_SIZE * 2;
		}
		
		// ポーズボタン。
		sprite = new Sprite();
		this.buttonPause = sprite;
		this.layerSystem.addChild(sprite);
		sprite.image = core.assets('img/buttons.png');
		sprite.width = 48;
		sprite.height = 48;
		sprite.frame = DF.BUTTON_FRAME_PAUSE;;
		sprite.x = 8;
		sprite.y = DF.SC_H - sprite.height - 8;
		
		// ポーズ.
		sprite = new Sprite();
		this.labelPause = sprite;
		this.layerSystem.addChild(sprite);
		sprite.setText('PAUSE');
		sprite.visible = false;
		sprite.cx = DF.SC_W / 2;
		sprite.cy = DF.SC_H / 2;
		
		// area 変更エフェクト。
		this.areaChangeEffect = new SpriteEffect();
		this.layerSystem.addChild(this.areaChangeEffect);
		
		// START.
		sprite = new Sprite();
		this.spriteStart = sprite;
		this.layerSystem.addChild(sprite);
		sprite.image = core.assets('img/start.png');
		sprite.width = sprite.image.width;
		sprite.height = sprite.image.height;
		sprite.visible = false;
		
		// stage name.
		sprite = new Sprite();
		this.spriteStageName = sprite;
		this.layerSystem.addChild(sprite);
		sprite.setText(this.stage["name"]);
		sprite.visible = false;
	},
	
	exec: function(e) {
		var execCnt = this.fpsCtrl.exec(e.elapsed, this, this.execSub);
		if (DF.FLG_FPS) {
			this.labelFps.setText("FPS:" + this.fpsCtrl.fpsAve);
		}
	},
	
	isPause: {
		get: function() {
			return this._isPause;
		},
		set: function(v) {
			Core.instance.sound.play('se', 'snd/se_ok.mp3');
			this._isPause = v;
			this.labelPause.visible = v;
			if (this.isPause) {
				this.buttonPause.frame = DF.BUTTON_FRAME_PLAY;
				// 不正対策のため、ポーズ中はステージを見せない.
				this.scene.removeChild(this.layerStage);
			} else {
				this.buttonPause.frame = DF.BUTTON_FRAME_PAUSE;
				this.scene.insertBefore(this.layerStage, this.layerSystem);
			}
		},
	},
	
	/* 各種タッチ判定。
		・ポーズボタン
		・ panel 
	*/
	onTouch: function(e) {
		var mouse = {
			x: e.x,
			y: e.y,
			width: 1,
			height: 1
		};
		
		// ポーズボタンのタッチ判定。
		if (this.buttonPause.intersect(mouse)) {
			// ポーズのスイッチング。
			this.isPause = !this.isPause;
			return;
		}
		
		
		// タップした位置に最も近い panel を、
		// プレイヤーのターゲットとする。
		var nearPanel = null;
		var nearDist2 = 0; // 距離の二乗。
		var relPos = {x: 0, yy: 0, yz: 0}; // ブロックの中心からタップ点への相対位置。
		for (var i = 0, iNum = this.panels.length; i < iNum; ++i) {
			var panel = this.panels[i];
			if (!this.player.isSelectablePanel(panel)) {
				continue;
			}
			var panelX = this.layerStage.x + panel.cx;
			var panelY = this.layerStage.y + panel.cy;
			var dx = panelX - e.x;
			var dy = panelY - e.y;
			
			var dist2 = dx * dx + dy * dy;
			if (nearPanel == null || dist2 < nearDist2) {
				nearPanel = panel;
				nearDist2 = dist2;
				relPos.x = - dx;
				relPos.yz = - dy;
			}
		}
		if (nearPanel != null) {
			var nearDist = Math.sqrt(nearDist2);
			this.player.setTargetPanel(nearPanel, relPos);
		}
	},
	
	execSprites: function(sprites, num) {
		for (var i = 0; i < num; i += 1) {
			sprites[i].exec();
		}
	},
	
	execSub: function() {
		var core = Core.instance;
		var game = Game.instance;
		var sprite = null;
		
		core.exec();
		if (this.isPause) {
			// ポーズ中。
			return;
		}
		this.spriteBg.exec();
		this.areaChangeEffect.exec();
		this.execSprites(this.scoreEffects, this.scoreEffects.length);
		this.execSprites(this.panels, this.panels.length);
		this.player.exec();
		this.execSprites(this.panelEffects, this.panelEffects.length);
		this.execSprites(this.chainEffects, this.chainEffects.length);
		
		// this.bg.x += Util.secDotToFrameDot(8);
		// this.bg.y += Util.secDotToFrameDot(2);
		//this._element.style.backgroundPosition = this.bg.x + 'px ' + this.bg.y + 'px';
		
		
		switch (this.state) {
		case SceneGame.STATE_IN_1:
			core.sound.play('bgm', 'snd/bgm_main_intro.mp3');
			sprite = this.spriteStageName;
			sprite.visible = true;
			sprite.cx = DF.SC_CX;
			sprite.cy = DF.SC_CY + 16;
			
			sprite = this.spriteStart;
			sprite.visible = true;
			sprite.cx = DF.SC_CX;
			sprite.cy = -140;
			this.tl.resetCnt(2.25);
			core.fade.fadeIn(0.3);
			this.state += 1;
			break;
		case SceneGame.STATE_IN_2:
			sprite = this.spriteStart;
			sprite.cy = this.tl.getLerp(-40, 140, 1.0);
			if (this.tl.isEnd()) {
				this.tl.resetCnt(1.0);
				this.state += 1;
			}
			this.tl.exec();
			break;
		case SceneGame.STATE_IN_3:
			sprite = this.spriteStart;
			if (this.tl.isEnd()) {
				sprite.visible = false;
				this.tl.resetCnt(0.25);
				this.state += 1;
			}
			this.tl.exec();
			break;
		case SceneGame.STATE_IN_4:
			sprite = this.spriteStart;
			sprite.visible = (game.frame & 0x1) == 0;
			this.spriteStageName.visible = sprite.visible;
			if (this.tl.isEnd()) {
				sprite.visible = false;
				this.spriteStageName.visible = false;
				core.sound.play('bgm', 'snd/bgm_main.mp3');
				this.state = SceneGame.STATE_MAIN;
			}
			this.tl.exec();
			break;
		case SceneGame.STATE_MAIN:
			
			if (this.player.state == SpritePlayer.STATE_WAIT_2) {
				// チェイン。
				--this.chainTimeCnt;
				if (this.chainTimeCnt < 0) {
					this.chainTimeCnt = 0;
					
					
					if (0 < this.chainCnt) {
						// チェイン継続条件に合わなくなったので、チェインリセット。
						this.setChainCnt(0);
					}
					
					
					//  panel 。
					--this.panelTimeCnt;
					if (this.panelTimeCnt < 0) {
						this.panelTimeCnt = 0;
						this.player.state = SpritePlayer.STATE_DEAD_1;
						this.player.isDead = true;
					}
				}
				
				
				this.chainGauge.setRate(this.chainTimeCnt / this.chainTimeMax + this.panelTimeCnt / this.panelTimeMax);
			}
			break;
		case SceneGame.STATE_OUT_1:
			this.tl.resetCnt(2.5);
			this.state += 1;
			break;
		case SceneGame.STATE_OUT_2:
			if (this.tl.isEnd()) {
				core.sound.stop('bgm');
				this.labelScore.visible = false;
				this.labelScoreValue.visible = false;
				this.labelChain.visible = false;
				this.labelChainValue.visible = false;
				
				// game.end(this.score, "SCORE:" + this.score + " MAX CHAIN:x" + this.chainCntMaxRecord);
				var playProgress = core.record.jump_hell.playProgress;
				var stageRecord = playProgress.stageMap[playProgress.curStageId];
				stageRecord.score = this.score;
				stageRecord.chainMax = this.chainCntMaxRecord;
				stageRecord.isGameClear = this.stageProgress.playerLeftJump <= 0;
				if (playProgress.isFinalStage() || !stageRecord.isGameClear) {
					game.pushScene(new jump_hell.SceneResult());
					this.state = SceneGame.STATE_RESULT_1;
				}
				else {
					core.fade.fadeOut(0.3);
					this.state += 1;
				}
			}
			this.tl.exec();
			break;
		case SceneGame.STATE_OUT_3:
			if (core.fade.isEnd()) {
				var playProgress = core.record.jump_hell.playProgress;
				playProgress.incrementStage();
				game.replaceScene(new jump_hell.SceneGame());
			}
			break;
		case SceneGame.STATE_RESULT_1:
			break;
		}
		// カメラの移動目標をプレイヤーのちょい上辺りに設定。
		this.camera.tx = this.player.cx;
		this.camera.ty = this.player.cyz - 112;
		this.camera.exec();
		this.camera.updateLayer(this.layerStage);
		
		
		// 背景.
		this.spriteBg.updatePos(this.layerStage.x / 4, this.layerStage.y / 4);
	},
	
	
	/** form を追加。
		form: panel の集まり。
	*/
	addPanel: function(baseX) {
		var form = this.popForm();
		if (form == null) {
			this.spriteGround2.cx = this.player.cx;
			// this.spriteGround2.cyz = this.player.cyz - DF.PANEL_GROUP_H * 2;
			return false;
		}
		var sp = this.stageProgress;
		var area = this.stage["areas"][sp.areaIdx];
		
		// 元の配置情報をランダムに上下左右反転させて、バリエーションを水増しする。
		var panelBaseList = form["panels"];
		var addNumMax = panelBaseList.length;
		var addNum = 0;
		var attr = null;
		var signX = 1;
		var signYZ = 1;
		switch (this.randomIntMinMax(0, 3)) {
		case 0:
			// 変形なし。
			signX = 1;
			signYZ = 1;
			break;
		case 1:
			// 左右反転。
			signX = -1;
			signYZ = 1;
			break;
		case 2:
			// 上下反転。
			signX = 1;
			signYZ = -1;
			break;
		case 3:
			// 上下左右反転。
			signX = -1;
			signYZ = -1;
			break;
		}
		
		//  panel 位置の基準になる YZ 座標。
		var panelAddYZ = this.getPanelAddYFromGroupAddId(this.formAddCnt);
		
		var attrMap = {};
		for(var i = 0, iNum = this.panels.length; i < iNum && addNum < addNumMax; ++i) {
			var panel = this.panels[i];
			if (!panel.visible) {
				var panelBase = panelBaseList[addNum];
				
				var colorId = panelBase["color_id"];
				var attr = attrMap[colorId];
				if (attr === undefined) {
					attr = this.popPanelAttr();
					attrMap[colorId] = attr;
				}
				
				panel.visible = true;
				panel.areaIdx = sp.areaIdx;
				panel.formAddId = this.formAddCnt;
				
				panel.cx = panelBase["x"] * signX + baseX;
				panel.cyz = panelBase["y"] * signYZ + panelAddYZ + DF.PANEL_GROUP_H / 2;
				
				panel.setAttr(attr, false);
				
				panel.targetX = DF.PANEL_GROUP_W / 2;
				panel.targetYZ = panelAddYZ;
				addNum += 1;
			}
		}
		this.formAddCnt += 1;
		return true;
	},
	
	getPanelAddYFromGroupAddId: function(formAddId) {
		return - (formAddId + 1) * DF.PANEL_GROUP_H;
	},
	
	randomIntMinMax: function(min, max) {
		return Core.instance.randomMap["game"].getIntMinMax(min, max);
	},
	
	/**  panel 属性を取得。
	*/
	popPanelAttr: function() {
		//  panel 属性参照キーの取得.
		var attrKey = this.panelAttrList[this.panelAttrListIdxGet];
		//  panel 属性の取得.
		var attr = this.stagePanelAttrList[attrKey];
		++this.panelAttrListIdxGet;
		if (this.panelAttrListLen <= this.panelAttrListIdxGet) {
			this.panelAttrListIdxGet = 0;
			Util.shuffleList(this.panelAttrList, this.panelAttrListLen, this.randomIntMinMax);
		}
		return attr;
	},
	
	
	/** area の適用.
	*/
	initArea: function() {
		var sp = this.stageProgress;
		var area = this.stage["areas"][sp.areaIdx];
		
		var colorKeyList = area["colors"];
		this.initPanelAttrList(colorKeyList);
		
		
		// zone のシャッフル.
		var zoneList = [];
		
		var zoneKeyList = area["zones"];
		for (var i = 0, size = zoneKeyList.length; i < size; ++i) {
			zoneList.push(this.stageZoneMap[zoneKeyList[i]]);
		}
		Util.shuffleList(zoneList, zoneList.length, this.randomIntMinMax);
		sp.zoneList = zoneList;
	},
	
	/** panel属性リストの適用.
	*/
	initPanelAttrList: function(attrKeyList) {
		this.panelAttrListLen = 0;
		this.panelAttrListIdxGet = 0;
		for (var i = 0, iNum = attrKeyList.length; i < iNum; ++i) {
			this.panelAttrList[i] = attrKeyList[i];
			++this.panelAttrListLen;
		}
		Util.shuffleList(this.panelAttrList, this.panelAttrListpanelAttrListLen, this.randomIntMinMax);
	},
	
	/** form の取得.
	*/
	getForm: function() {
		var sp = this.stageProgress;
		if (this.stage["areas"].length <= sp.areaIdx) {
			// ステージの終了.
			return null;
		}
		
		
		var formKey = sp.zoneList[sp.zoneIdx][sp.formIdx];
		var form = this.stageFormMap[formKey];
		
		return form;
	},
	
	/** form の取得 + stage を進める.
	*/
	popForm: function() {
		var form = this.getForm();
		var sp = this.stageProgress;
		++sp.formIdx;
		var formKeyList = sp.zoneList[sp.zoneIdx];
		if (formKeyList === undefined) {
			throw new Error("fromKeyList " + undefined);
		}
		if (formKeyList.length <= sp.formIdx) {
			sp.formIdx = 0;
			
			++sp.zoneIdx;
			if (sp.zoneList.length <= sp.zoneIdx) {
				sp.zoneIdx = 0;
				++sp.areaIdx;
				if (this.stage["areas"].length <= sp.areaIdx) {
					// ステージの終了.
				}
				else {
					this.initArea();
				}
				
			}
		}
		
		Logger.debug.log(Util.csv("popForm", sp.areaIdx, sp.zoneIdx, sp.formIdx, "form", form));
		if (form != null) {
			++sp.playerLeftJump;
		}
		else {
			Logger.debug.log(Util.csv("form empty", sp.areaIdx, sp.zoneIdx, sp.formIdx, "form", form, "formKey", formKeyList[sp.zoneIdx]));
		}
		return form;
	},
	
	/** チェイン継続か否かの判定.
	*/
	checkChainCnt: function() {
		if (0 < this.chainTimeCnt) {
			// チェイン更新。
			this.setChainCnt(Math.min(this.chainCnt + 1, DF.CHAIN_CNT_MAX));
		}
		else {
			this.setChainCnt(1);
		}
	}, 
	
	/** ゲーム続行なら false, 終了なら true
	*/
	catchPanelJumpEvent: function(oldPanel, panel, panelTapRank) {
		var core = Core.instance;
		core.sound.play('se', 'snd/se_panel.mp3');
		
		// ジャンプ成功。
		var baseScore = 0; // 倍率を描ける前のスコア.
		
		var jumpTimeSec = Util.frameToSec((this.chainTimeMax - this.chainTimeCnt) + (this.panelTimeMax - this.panelTimeCnt));
		var jumpTimeRecord = GameUtil.timeToJumpTimeRecord(jumpTimeSec);
		var panelTapRankRecord = DF.PANEL_TAP_RANK_MAP[panelTapRank];
		Logger.debug.log(Util.csv("jumpTime",
			jumpTimeRecord["id"],
			jumpTimeRecord["time"],
			jumpTimeSec,
			"tap",
			panelTapRankRecord["id"],
			panelTapRankRecord["judge_distance"]
		));
		
		baseScore += jumpTimeRecord["score"];
		baseScore += panelTapRankRecord["score"]; // タップの正確さもスコアに影響。
		
		this.chainTimeCnt = this.chainTimeMax;
		this.panelTimeCnt = this.panelTimeMax;
		// ゲージ復活.
		this.chainGauge.setRate(this.chainTimeCnt / this.chainTimeMax + this.panelTimeCnt / this.panelTimeMax);
		
		var scoreAdd = Math.floor(baseScore * this.chainCnt); // 加算するスコア。
		this.setScore(this.score + scoreAdd);
		this.labelScoreValue.text = this.score;
		
		var scoreEffect = this.getScoreEffect();
		var scoreX = this.layerStage.x + this.player.cx;
		var scoreY = this.layerStage.y + this.player.cy - 16;
		scoreEffect.startScoreUpEffect(scoreAdd, scoreX, scoreY);
		
		// ここで出すのはうざいのでやめる.
//		var rankEffect = this.getScoreEffect();
//		rankEffect.startPanelTapRankEffect(
//			scoreX,
//			scoreY + 16,
//			this.player.panelTapRank
//		);
		
		
		if (this.player.areaIdx !== panel.areaIdx && panel.areaIdx < this.stage["areas"].length) {
			// player の所属する area が変わった.
			this.player.areaIdx = panel.areaIdx;
			// area 変更エフェクト開始.
			var areaName = panel.areaIdx + 1;
			this.areaChangeEffect.startAreaChangeEffect(areaName);
		}
		
		var sp = this.stageProgress;
		--sp.playerLeftJump;
		
		if (sp.playerLeftJump <= 0) {
			// ステージクリア。
			this.scene.state = SceneGame.STATE_OUT_1;
			return true;
		}
		else {
			return false;
		}
	},
	
	setScore: function(score) {
		score = Math.floor(score);
		this.score = score;
		if (DF.SCORE_MAX < this.score) {
			this.score = DF.SCORE_MAX;
		}
		this.labelScoreValue.setText('' + score);
	},
	
	setChainCnt: function(chainCnt) {
		this.chainCnt = chainCnt;
		this.labelChain.visible = 2 <= chainCnt;
		this.labelChainValue.visible = 2 <= chainCnt;
		this.labelChainValue.setText('x' + chainCnt);
		if (this.chainCntMaxRecord < chainCnt) {
			// 記録更新。
			this.chainCntMaxRecord = chainCnt;
		}
	},
	
	/**  仕事してないエフェクトの取得。
	*/
	getPanelEffect: function() {
		var old = null;
		for (var i = 0, len = this.panelEffects.length; i < len; i += 1) {
			var effect = this.panelEffects[i];
			if (!effect.isUse) {
				return effect;
			}
			if (old == null || old.frameCnt < effect.frameCnt) {
				old = effect;
			}
		}
		return old;
	},
	
	/**  仕事してないエフェクトの取得。
	*/
	getChainEffect: function(priority) {
		return GameUtil.getNeetEffect(this.chainEffects, priority);
	},
	/**  スコア加算エフェクト取得。
	*/
	getScoreEffect: function() {
		return GameUtil.getNeetEffect(this.scoreEffects, 0);
	},
	/** ジャンプ先の panel がすべて画面内にあるか.
	*/
	canOpenFormColor: function(formAddId) {
		var cs = this.camera.cameraSprite;
		var panels = this.scene.panels;
		for(var i = 0, panelNum = panels.length; i < panelNum; ++i) {
			var panel = panels[i];
			if (formAddId === panel.formAddId) {
//					if (!Util.isInside2D(cs.x, cs.y, cs.width, cs.height, panel.x, panel.y, panel.width, panel.height)) {
//						// 画面内に収まっていない panel がある.
//						return false;
//					}
				if (!Util.isHit2D(cs.x, cs.y, cs.width, cs.height, panel.x, panel.y, panel.width, panel.height)) {
					// 画面内にヒットしていない panel がある.
					return false;
				}
			}
		}
		return true;
	}
});
SceneGame.STATE_IN_1 = 1;
SceneGame.STATE_IN_2 = 2;
SceneGame.STATE_IN_3 = 3;
SceneGame.STATE_IN_4 = 4;
SceneGame.STATE_MAIN = 5;
SceneGame.STATE_OUT_1 = 6;
SceneGame.STATE_OUT_2 = 7;
SceneGame.STATE_OUT_3 = 8;
SceneGame.STATE_RESULT_1 = 9;
jump_hell.SceneGame = SceneGame;

/** プレイヤー。
*/
var SpritePlayer = Class.create(Sprite3D, {
	initialize: function() {
		// 親のコンストラクタ。
		Sprite3D.call(this, 32, 32);
		//
		this.x = 0;
		// y座標を yy + yz で表す.
		this.yy = 0;
		this.yz = 0;
		
		this.footX = 16; // 足元への相対座標。
		this.footY = 32;
		
		this.startX = 0; // ジャンプ開始座標。
		this.startY = 0;
		
		this.targetPanelRelPos = {x:0, yy:0, yz:0};
		this.panelTapRank = DF.PANEL_TAP_RANK_A;
		this.curPanelRelPos = {x:0, yy:0, yz:0};
		
		this.targetPanel = null;
		this.curPanel = null;
		this.state = SpritePlayer.STATE_WAIT_2;
		this.pose = 0;
		this.anim = new Anim(this);
		this.anim.setAnimId('stand_u');
		
		this.isDead = false;
		
		this.tl = new TimeLeap();
		this.tlChainEffect = new TimeLeap();
		
		/** ランダムで属性を選択するための一時作業用リスト。 */
		this.tmpPanelAttrList = new Array(8);
		
		this.targetTapDistance = 0; // タッチの正確さ。0で完璧。
		
		var core = Core.instance;
		this.image = core.assets('img/chara_01.png');
		// this.addEventListener(Event.ENTER_FRAME, this.exec);
		this.touchEnabled = false;
		
		// 所属する area.
		this.areaIdx = -1;
		this.frameCnt = 0;
	},
	
	/** ジャンプ先の決定。
		relPos は  panel の中心からタップ点との相対位置。
	*/
	setTargetPanel: function(panel, relPos) {
		if (this.state === SpritePlayer.STATE_WAIT_2) {
			if (this.isSelectablePanel(panel)) {
				this.targetPanel = panel;
				if (relPos) {
					
					var distance = Math.sqrt(relPos.x * relPos.x + relPos.yz * relPos.yz);
					this.targetTapDistance = distance;
					
					var rankRecord = GameUtil.distanceToPanelTapRank(distance);
					this.panelTapRank = rankRecord["id"];
					
					//  panel からの相対位置を調整.
					var trimDistance = rankRecord["trim_distance"];
					this.targetPanelRelPos.x =  NUtil.trim(relPos.x, -trimDistance, trimDistance);
					this.targetPanelRelPos.yy = 0;
					this.targetPanelRelPos.yz = NUtil.trim(relPos.yz, -trimDistance, trimDistance);
				}
			}
		}
	},
	
	/** プレイヤーが踏める足場か。
	*/
	isSelectablePanel: function(panel) {
		if (!panel.visible) {
			return false;
		}
		if (this.curPanel === null ||
			panel.formAddId <= this.curPanel.formAddId + 1 && this.curPanel !== panel) {
			return true;
		}
		return false;
	},
	
	exec: function(e) {
		var core = Core.instance;
		this.frame = this.anim.getCurFrame();
		this.anim.exec();
		var nextAnimId = this.anim.getAnimId();
		
		switch (this.state) {
		case SpritePlayer.STATE_WAIT_1:
			if (this.scene.state == SceneGame.STATE_MAIN) {
				nextAnimId = 'stand_u';
			}
			this.execPanelFit();
			if (this.curPanel !== null) {
				if (this.scene.canOpenFormColor(this.curPanel.formAddId + 1)) {
					++this.state;
				}
			}
			else {
				++this.state;
			}
		break;
		case SpritePlayer.STATE_WAIT_2:
			if (this.scene.state == SceneGame.STATE_MAIN) {
				nextAnimId = 'stand_u';
				if (this.targetPanel != this.curPanel) {
					// チェイン判定。
					this.scene.checkChainCnt();
					// タップ箇所にエフェクトを出す。
					var effect = this.scene.getChainEffect(1);
					effect.startPanelTapEffect(
						this.targetPanel.cx + this.targetPanelRelPos.x,
						this.targetPanel.cyz + this.targetPanelRelPos.yz,
						this.panelTapRank
					);
					
//					effect = this.scene.getChainEffect();
//					effect.startPanelTapRankEffect(
//						this.targetPanel.cx,
//						this.targetPanel.cyz,
//						this.panelTapRank
//					);

					this.state = SpritePlayer.STATE_JUMP_1;
				}
			}
			this.execPanelFit();
			this.execChainEffect(0.1);
			
		break;
		case SpritePlayer.STATE_JUMP_1:
			this.scene.addPanel(this.targetPanel.cx); // 次のジャンプ候補作成。
			
			var dx = (this.targetPanel.cx + this.targetPanelRelPos.x)- (this.x + this.footX);
			var dy = (this.targetPanel.cyz + this.targetPanelRelPos.yz) - (this.yz + this.footY);
			if(dx < 0) {
				nextAnimId = 'jump_lu';
			}
			else if(0 < dx) {
				nextAnimId = 'jump_ru';
			}
			else {
				nextAnimId = 'jump_u';
			}
			
			
			
			var chainCnt = NUtil.trim(this.scene.chainCnt, 1, DF.CHAIN_CNT_MAX) - 1;
			var chainCntMax = DF.CHAIN_CNT_MAX - 1;
			var speedRate = (chainCntMax - chainCnt) / chainCntMax;
			var jumpTime = DF.JUMP_TIME_FAST + speedRate * (DF.JUMP_TIME_SLOW - DF.JUMP_TIME_FAST)
			
			this.tl.resetCnt(jumpTime);
			this.tlChainEffect.resetCnt(0);
			this.startX = this.x;
			this.startYZ = this.yz;
			this.yy = 0;
			
			core.sound.play('se', 'snd/se_jump.mp3');
			
			this.state += 1;
			break;
		case SpritePlayer.STATE_JUMP_2:
			this.x = this.tl.getLerp(this.startX, this.targetPanel.cx + this.targetPanelRelPos.x - this.footX, 1.0);
			this.yz = this.tl.getLerp(this.startYZ, this.targetPanel.cyz + this.targetPanelRelPos.yz - this.footY, 1.0);
			this.yy = this.tl.getLerpForList(SpritePlayer.JUMP_YY_LIST, 0.0);
			this.execChainEffect(0.05);
			if (this.tl.isEnd()) {
				if (this.curPanel == null || this.curPanel.attr == this.targetPanel.attr) {
					var oldPanel = this.curPanel;
					this.curPanel = this.targetPanel;
					this.curPanelRelPos.x = this.targetPanelRelPos.x;
					this.curPanelRelPos.yz = this.targetPanelRelPos.yz;
					// 不要な panel を消去。
					var formAddIdDel = this.curPanel.formAddId;
					for(var i = 0, length = this.scene.panels.length; i < length; i += 1) {
						var panel = this.scene.panels[i];
						if (this.curPanel != panel && panel.formAddId <= formAddIdDel && panel.visible) {
							panel.visible = false;
							this.scene.getPanelEffect().startPanelKillEffect(panel);
						}
					}
					//
					this.curPanel.setAttr(this.getNextPanelAttr(), true);
					this.scene.getPanelEffect().startPanelChangeEffect(this.curPanel);
					//
					var isEnd = this.scene.catchPanelJumpEvent(oldPanel, this.curPanel, this.panelTapRank);
					//
					if (isEnd) {
						this.state = SpritePlayer.STATE_CLEAR_1;
					}
					else {
						this.state = SpritePlayer.STATE_WAIT_1;
					}
				}
				else {
					// 失敗。連鎖リセット。
					this.scene.setChainCnt(0);
					// 戻る。
					//this.targetPanel = this.curPanel;
					//this.state = SpritePlayer.STATE_MISS_1;
					this.isDead = true;
					this.curPanel = this.targetPanel;
					this.state = SpritePlayer.STATE_DEAD_1;
				}
			}
			this.tl.exec();
			break;
		case SpritePlayer.STATE_MISS_1:
			this.tl.resetCnt(DF.JUMP_TIME);
			this.startX = this.x;
			this.startY = this.y;
			this.state += 1;
			break;
		case SpritePlayer.STATE_MISS_2:
			this.x = this.tl.getLerp(this.startX, this.targetPanel.cx - this.footX, 1.0);
			this.y = this.tl.getLerp(this.startY, this.targetPanel.cyz - this.footY, 1.0);
			if (this.tl.isEnd()) {
				this.curPanel = this.targetPanel;
				
//					this.curPanel.setAttr(this.getNextPanelAttr(), true);
//					this.scene.getPanelEffect().startPanelChangeEffect(this.curPanel);
				
				this.state = SpritePlayer.STATE_WAIT_1;
			}
			this.tl.exec();
			break;
		case SpritePlayer.STATE_DEAD_1:
			core.sound.play('bgm', 'snd/jgl_game_over.mp3');
			nextAnimId = 'dead';
			this.tl.resetCnt(1.0);
			this.startX = this.x;
			this.startY = this.y;
			
			this.curPanel.visible = false;
			this.scene.getPanelEffect().startPanelKillEffect(this.curPanel);
			this.curPanel = null;
			this.targetPanel = null;
			
			this.state += 1;
			break;
		case SpritePlayer.STATE_DEAD_2:
			// this.x = this.tl.getLerp(this.startX, this.targetPanel.cx - this.footX, 1.0);
			this.y = this.tl.getLerp(this.startY, this.startY + 32, 1.0);
			this.scaleX = this.tl.getLerp(1.0, 0.7, 1.0);
			this.scaleY = this.tl.getLerp(1.0, 0.7, 1.0);
			if ((this.frameCnt & 0x1) == 0) {
				this.visible = true;
			} else {
				this.visible = false;
			}
			// this.opacity = this.tl.getLerp(1.0, 0.0, -1.0);
			if (this.tl.isEnd()) {
				this.visible = false;
				this.state += 1;
				this.scene.state = SceneGame.STATE_OUT_1;
			}
			this.tl.exec();
			break;
		case SpritePlayer.STATE_DEAD_3:
			break;
		
		case SpritePlayer.STATE_CLEAR_1:
			core.sound.play('bgm', 'snd/jgl_game_clear.mp3');
			this.execPanelFit();
			nextAnimId = 'stand_d';
			this.state += 1;
			break;
		case SpritePlayer.STATE_CLEAR_2:
			this.execPanelFit();
			break;
		}
		if (nextAnimId != this.anim.getAnimId()) {
			this.anim.setAnimId(nextAnimId);
		}
//		if (0 < this.yy) {
//			Core.instance.debug.error("this.yy:" + this.yy);
//		}
		var shadow = this.scene.shadow;
		shadow.x = this.x;
		shadow.yz = this.yz + 16;
		if (this.curPanel) {
			shadow.yy = this.curPanel.yy;
		}
		shadow.visible = this.curPanel && this.curPanel.intersect(shadow) || this.targetPanel && this.targetPanel.intersect(shadow);
		this.frameCnt += 1;
	},
	/**  panel に吸着。
	*/
	execPanelFit: function() {
		if (this.curPanel !== null) {
			this.x = this.curPanel.cx - this.footX + this.curPanelRelPos.x;
			this.yz = this.curPanel.cyz - this.footY + this.curPanelRelPos.yz;
			this.yy = this.curPanel.yy;
		}
	},
	execChainEffect: function(interval) {
		if (this.scene.chainCnt < 2 || this.scene.chainTimeCnt <= 0) {
			return;
		}
		if (this.tlChainEffect.isEnd()) {
			var effect = this.scene.getChainEffect(0);
			effect.startChainEffect(this.cx + Util.randomIntMinMax(-8, 8), this.cy + Util.randomIntMinMax(-16, 16), this.scene.chainCnt);
			this.tlChainEffect.resetCnt(interval);
		}
		this.tlChainEffect.exec();
	},
	
	/**  次に選択可能な panel の中から panel属性 を選択する。
	*/
	getNextPanelAttr: function() {
		var attrNum = 0;
		var formAddId = this.curPanel.formAddId + 1;
		for(var i = 0, panelNum = this.scene.panels.length; i < panelNum && attrNum < this.tmpPanelAttrList.length; ++i) {
			var panel = this.scene.panels[i];
			if (formAddId === panel.formAddId) {
				this.tmpPanelAttrList[attrNum] = panel.attr;
				++attrNum;
			}
		}
		if (attrNum <= 0) {
			// 次の panel が存在しない。
			return PanelAttr.DEFAULT;
		}
		var attrI = this.scene.randomIntMinMax(0, attrNum - 1);
		return this.tmpPanelAttrList[attrI];
	},
});
SpritePlayer.STATE_WAIT_1 = 1;
SpritePlayer.STATE_WAIT_2 = 2;
SpritePlayer.STATE_JUMP_1 = 3;
SpritePlayer.STATE_JUMP_2 = 4;
SpritePlayer.STATE_MISS_1 = 5;
SpritePlayer.STATE_MISS_2 = 6;
SpritePlayer.STATE_DEAD_1 = 7;
SpritePlayer.STATE_DEAD_2 = 8;
SpritePlayer.STATE_DEAD_3 = 9;
SpritePlayer.STATE_CLEAR_1 = 10;
SpritePlayer.STATE_CLEAR_2 = 11;
SpritePlayer.JUMP_YY_LIST = [0, -24, -32, -24, 0]; // ジャンプ時の高さの変化。
jump_hell.SpritePlayer = SpritePlayer;


/**  panel 。
*/
var SpritePanel = Class.create(Sprite3D, {
	initialize: function() {
		var core = Core.instance;
		
		// 親のコンストラクタ。
		Sprite3D.call(this, DF.PANEL_SIZE, DF.PANEL_SIZE);
		//
		this.x = 32;
		this.y = 32;
		
		this.startX = this.x;
		this.startY = this.yz;
		
		// プレイヤーが乗っかったときに移動する位置。
		this.targetX = this.x;
		this.targetYZ = this.yz;
		
		// 所属area.
		this.areaIdx = 0;
		// 所属form.
		this.formAddId = 0;
		
		this.attr = PanelAttr.DEFAULT;
		this.image = core.assets('img/panel.png');
		this.tl = new TimeLeap();
		this.colorRGB = new ColorRGB(0, 0, 0);
		this.anim = new Anim(this);
		this.anim.setAnimId('panel');
		
		this.touchEnabled = false;
		
		// 色を表示するか.
		this.isOpenColor = false;
	},
	
	exec: function(e) {
		if (!this.visible) {
			return;
		}
		var player = this.scene.player;
		var camera = this.scene.camera;
		
		if (this === player.curPanel && 0 <= player.yy) {
			var dx = this.targetX - this.x;
			var dyz = this.targetYZ - this.yz;
			// this.x += dx / 8;
			// this.yz += dyz / 8;
			var moveY = this.tl.getLerp(this.startY, this.targetYZ, 1.0) - this.yz;
			this.yz += moveY;
			this.yy = - 0.5 * this.tl.getLerpForList(SpritePlayer.JUMP_YY_LIST, 0.0);
			this.tl.exec();
		}
		this.frame = this.anim.getCurFrame();
		this.anim.exec();
		if (!this.isOpenColor) {
			if (this.scene.canOpenFormColor(this.formAddId)) {
				Logger.debug.log(Util.csv("openColor", this.formAddId));
				this.backgroundColor = this.attr.color.makeStr();
				this.isOpenColor = true;
			}
		}
	},
	
	setAttr: function(attr, isOpenColor) {
		this.attr = attr;
		if (isOpenColor) {
			this.backgroundColor = this.attr.color.makeStr();
		}
		else {
			this.backgroundColor = 'rgb(64,64,64)';
		}
		this.isOpenColor = isOpenColor;
		
		this.tl.resetCnt(DF.PANEL_SLIDE_TIME);
		this.startX = this.x;
		this.startY = this.yz;
	},
	
	onTouch: function(e) {
		// this.scene.player.setTargetPanel(this);
	}
});
jump_hell.SpritePanel = SpritePanel;

/** 汎用エフェクト。
	一定時間、特定の動きをして、消失する、なにか。
*/
var SpriteEffect = Class.create(Sprite3D, {
	initialize: function() {
		// 親のコンストラクタ。
		Sprite3D.call(this);
		//
		//this.addEventListener(Event.ENTER_FRAME, this.exec);
		this.execEffect = null; // 各エフェクトごとのループ処理。
		this.tl = new TimeLeap();
		this.anim = new Anim(this);
		this.state = 0;
		this.startX = 0;
		this.startY = 0;
		this.touchEnabled = false;
		this.isUse = false;
		this.reset(null);
		this.unUse();
	},
	reset: function(funcExec) {
		this.backgroundColor = "transparent";
		this.scaleX = 1.0;
		this.scaleY = 1.0;
		this.startX = 0;
		this.startY = 0;
		this.rotation = 0;
		this.frameCnt = 0;
		this.state = 0;
		this.opacity = 1.0;
		this.execEffect = funcExec;
		this.isUse = funcExec !== null;
	},
	unUse: function() {
		this.isUse = false;
		this.visible = false;
	},
	
	exec: function(e) {
		if (!this.isUse) {
			return;
		}
		if (this.execEffect != null) {
			this.execEffect(this);
		}
		this.frameCnt += 1;
	},
	
	/** area 変更エフェクト。
	*/
	startAreaChangeEffect: function(areaName) {
		this.reset(this.execAreaChangeEffect);
		this.setText("AREA "+ areaName);
		this.cx = 0;
		this.cy = DF.SC_H - this.height;
		this.visible = true;
		this.tl.resetCnt(0.25);
	},
	execAreaChangeEffect: function(effect) {
		switch (effect.state) {
		case 0:
			// 左からすーっと入ってくる。
			if (!effect.tl.isEnd()) {
				//effect.opacity = effect.tl.getLerp(0.0, 1.0, 1.0);
				effect.visible = (this.frameCnt & 0x1) === 0;
				effect.x = effect.tl.getLerp(0, 160, 1.0);
			}
			else {
				effect.tl.resetCnt(2.0);
				effect.state += 1
			}
			break;
		case 1:
			// ゆっくりスライド。
			if (!effect.tl.isEnd()) {
				effect.x = effect.tl.getLerp(160, 170, 1.0);
			}
			else {
				effect.tl.resetCnt(0.25);
				effect.state += 1
			}
			break;
		case 2:
			// すーっとはけてく。
			if (!effect.tl.isEnd()) {
				//effect.opacity = effect.tl.getLerp(1.0, 0.0, 1.0);
				effect.visible = (this.frameCnt & 0x1) === 0;
				effect.x = effect.tl.getLerp(170, DF.SC_W + effect.width, 1.0);
			}
			else {
				effect.unUse();
				effect.state += 1;
			}
			break;
		case 3:
			break;
		}
		effect.tl.exec();
	},
	/** スコア加算エフェクト。
	*/
	startScoreUpEffect: function(score, startX, startY) {
		this.reset(this.execScoreUpEffect);
		this.setText("+" + score);
		this.cx = startX;
		this.cy = startY;
		this.visible = true;
		this.tl.resetCnt(0.75);
		this.startX = startX;
		this.startY = startY;
	},
	execScoreUpEffect: function(effect) {
		if (!effect.tl.isEnd()) {
			effect.y = effect.tl.getLerp(this.startY, this.startY - 48, 1.0);
		}
		else {
			effect.unUse();
		}
		effect.tl.exec();
	},
	/**  panel をタップしたとき評価エフェクト。
	*/
	startPanelTapRankEffect: function(startX, startY, panelTapRank) {
		this.reset(this.execPanelTapRankEffect);
		var core = Core.instance;
		//this.setText(DF.PANEL_TAP_RANK_MAP[panelTapRank]["name"]);
		this.width = 64;
		this.height = 64;
		this.image = core.assets("img/panel_tap_effect.png");
		this.frame = 0;
		this.cx = startX;
		this.cy = startY;
		this.visible = true;
		this.tl.resetCnt(0.5);
		this.state = 1;
		this.startX = startX;
		this.startY = startY;
	},
	execPanelTapRankEffect: function(effect) {
		switch (effect.state) {
		case 1:
			if (!effect.tl.isEnd()) {
			}
			else {
				this.tl.resetCnt(0.25);
				++effect.state;
			}
			break;
		case 2: 
			if (!effect.tl.isEnd()) {
				effect.visible = (this.frameCnt & 0x1) === 0;
			}
			else {
				effect.unUse();
			}
			break;
		}
		effect.tl.exec();
	},	
	/** チェイン発生中のキラキラエフェクト。
	*/
	startChainEffect: function(startX, startY, chainCnt) {
		this.reset(this.execChainEffect);
		var core = Core.instance;
		this.width = 16;
		this.height = 16;
		this.cx = startX;
		this.cy = startY;
		this.visible = true;
		this.tl.resetCnt(0.5);
		this.startX = startX;
		this.startY = startY;
		this.endX = startX + Util.randomIntMinMax(-10, 10);
		this.endY = startY + Util.randomIntMinMax(5, 15);
		
		this.image = core.assets('img/effect.png');
//		this.anim = new Anim(this);
		this.rotation = 0;
		
		var idx = 0;
		if (chainCnt < 5) {
			idx = 0;
		} else if (chainCnt < 10) {
			idx = 1;
		} else if (chainCnt < 15) {
			idx = 2;
		} else if (chainCnt < 20) {
			idx = 3;
		} else if (chainCnt < 25) {
			idx = 4;
		} else if (chainCnt < 30) {
			idx = 5;
		} else {
			idx = 6;
		}
		var frameList = DF.CHAIN_ANIM_LIST[idx];
		var animId = frameList[Util.randomIntMinMax(0, frameList.length - 1)];
		this.anim.setAnimId(animId);
		this.frame = this.anim.getCurFrame();
		
		//this.backgroundColor = 'rgb(255,255,0)';
	},
	execChainEffect: function(effect) {
		this.frame = this.anim.getCurFrame();
		this.anim.exec();
		
		if (!effect.tl.isEnd()) {
			if (false) {
				// cssアニメでやったら早いとか？.
				effect.rotation = effect.tl.getLerp(0, 360, 0.0);
			}
			effect.cx = effect.tl.getLerp(effect.startX, effect.endX, 0.0);
			effect.cy = effect.tl.getLerp(effect.startY, effect.endY, 0.0);
			// effect.opacity = effect.tl.getLerp(1.0, 0.0, -1.0);
		}
		else {
			effect.unUse();
		}
		effect.tl.exec();
	},
	/**  panel をタップしたときのエフェクト。
	*/
	startPanelTapEffect: function(startX, startY) {
		this.reset(this.execPanelTapEffect);
		var core = Core.instance;
		this.width = 32;
		this.height = 32;
		this.cx = startX;
		this.cy = startY - 16;
		this.visible = true;
		this.tl.resetCnt(0.5);
		this.startX = startX;
		this.startY = startY;
		this.image = core.assets('img/panel_tap_effect.png');
		this.rotation = 0;
		var animId = 'panel_tap_effect';
		this.anim.setAnimId(animId);
		this.frame = this.anim.getCurFrame();
	},
	execPanelTapEffect: function(effect) {
		this.frame = this.anim.getCurFrame();
		this.anim.exec();
		
		if (!effect.tl.isEnd()) {
		}
		else {
			effect.unUse();
		}
		effect.tl.exec();
	},

	
	/**  panel 消失エフェクト。
	*/
	startPanelKillEffect: function(panel) {
		this.reset(this.execPanelKillEffect);
		this.image = null;
		this.width = DF.PANEL_SIZE * 0.5;
		this.height = DF.PANEL_SIZE * 0.5;
		this.cx = panel.cx;
		this.cy = panel.cy;
		this.backgroundColor = panel.attr.color.makeStr();
		this.visible = true;
		this.tl.resetCnt(0.25);
	},
	execPanelKillEffect: function(effect) {
		if (!effect.tl.isEnd()) {
			var rate = effect.effectCnt / effect.effectCntMax;
			effect.visible = (this.frameCnt & 0x1) === 0;
			//effect.opacity = effect.tl.getLerp(1.0, 0.0, 0.0);
			// effect.rotation = effect.tl.getLerp(0, 180, 0.0);
			// effect.scaleX = effect.tl.getLerp(1.0, 0.0, 1.0);
			// effect.scaleY = effect.tl.getLerp(1.0, 0.0, 1.0);
		}
		else {
			effect.unUse();
		}
		effect.tl.exec();
	},
	
	/**  panel 色変更エフェクト。
	*/
	startPanelChangeEffect: function(panel) {
		this.reset(this.execPanelChangeEffect);
		this.image = null;
		this.width = DF.PANEL_SIZE * 1.5;
		this.height = DF.PANEL_SIZE * 1.5;
		this.cx = panel.cx;
		this.cy = panel.cy;
		this.backgroundColor = panel.attr.color.makeStr();
		this.opacity = 1.0;
		this.visible = true;
		this.effectCnt = 0;
		this.effectCntMax = 12;
		this.rotation = 0;
		this.tl.resetCnt(0.25);
	},
	execPanelChangeEffect: function(effect) {
		if (!effect.tl.isEnd()) {
			var rate = effect.effectCnt / effect.effectCntMax;
			effect.visible = (this.frameCnt & 0x1) === 0;

			// effect.opacity = effect.tl.getLerp(1.0, 0.0, 0.0);
			// effect.rotation = effect.tl.getLerp(0, 0, 0.0);
			if (false) {
				effect.rotation = effect.tl.getLerp(0, 360, 0.0);
			}
			// effect.scaleX = effect.tl.getLerp(1.0, 1.75, 1.0);
			// effect.scaleY = effect.tl.getLerp(1.0, 1.75, 1.0);
		}
		else {
			effect.unUse();
		}
		effect.tl.exec();
	}
	
});
jump_hell.SpriteEffect = SpriteEffect;


/**  裏で流れてる背景。
*/
var SpriteBg = Class.create(Group, {
	initialize: function() {
		var core = Core.instance;
		
		// 親のコンストラクタ。
		Group.call(this);
		//
		
		this.sprites = [];
		
		for(var i = 0; i < 4; ++i) {
			var sprite = null;
			sprite = new Sprite();
			sprite.width = 64;
			sprite.height = 64;
			sprite.image = core.assets('img/bg_02.png');
			sprite.frame = 0;
			this.addChild(sprite);
			
			this.sprites[i] = sprite;
		}
		
		// 背景の位置.
		this.bgX = 0;
		this.bgY = 0;
		
		// 背景演出の位置.
		this.effectX = 0;
		this.effectY = 0;
		
		// 背景演出の流れるスピード.
		this.effectVx = 0;
		this.effectVy = 0;
		
		this.updatePos(0, 0);
	},
	
	
	
	updatePos: function(x, y) {
		var game = Game.instance;
		this.bgX = x;
		this.bgY = y;
		
		x += this.effectX;
		y += this.effectY;
		if (0 <= x) {
			x = - Math.floor(DF.SC_W - x) % DF.SC_W + DF.SC_W;
		}
		if (0 <= y) {
			y = - Math.floor(DF.SC_H - y) % DF.SC_H + DF.SC_H;
		}
	
		x = Math.floor(x) % DF.SC_W - DF.SC_W;
		y = Math.floor(y) % DF.SC_H - DF.SC_H;
		for(var i = 0; i < this.sprites.length; i += 1) {
			var sprite = this.sprites[i];
			sprite.x = x + Math.floor(i % 2) * DF.SC_W;
			sprite.y = y + Math.floor(i / 2) * DF.SC_H;
			this.sprites[i] = sprite;
		}
		// game._element.style.backgroundPosition = x + 'px ' + y + 'px';
	},
	
	exec: function(e) {
		// 背景を流す.
		this.effectX += this.effectVx;
		this.effectY += this.effectVy;
	},
	
	
});
jump_hell.SpriteBg = SpriteBg;
		



}());



