/* 結果。
*/
"@file scene_result.js";
(function() {
	"use strict";
	var Game = enchant.Game;
	
	var Logger = osakana4242.Logger;
	
	var jump_hell = osakana4242.namespace("jump_hell");
	var DF = osakana4242.namespace("jump_hell.DF");
	var Vector2D = osakana4242.namespace("Vector2D");
	var NineleapUtil = osakana4242.namespace("NineleapUtil");
	var TimeLeap = osakana4242.namespace("TimeLeap");
	var Util = osakana4242.namespace("Util");
	var FpsCtrl = osakana4242.namespace("FpsCtrl");
	var Core = osakana4242.namespace("Core");
	var Sprite = osakana4242.namespace("Sprite");
	
	var SceneResult = Class.create(Scene, {
		initialize: function() {
			var game = Game.instance;
			var core = Core.instance;
			Scene.call(this);
			this.addEventListener(Event.ENTER_FRAME, this.exec);
			this.state = 0;
			this.tl = new TimeLeap();
			this.frameCnt = 0;
			var playProgress = core.record.jump_hell.playProgress;
			this.stageRecord = playProgress.stageMap[playProgress.curStageId];
			
			var sprite;
			
			sprite = new Sprite();
			this.spriteResult = sprite;
			this.addChild(sprite);
			if (this.stageRecord["isGameClear"]) {
				sprite.image = core.assets('img/clear.png');
			}
			else {
				sprite.image = core.assets('img/game_over.png');
			}
			sprite.width = sprite.image.width;
			sprite.height = sprite.image.height;
			sprite.setCx(DF.SC_CX);
			sprite.setCy(-50);
			
			sprite = new Sprite();
			this.spriteText = sprite; // 状態表示用テキスト。
			this.addChild(sprite);
			sprite.visible = false;
			sprite.setCx(DF.SC_CX);
			sprite.setCy(240);
			
			
			sprite = new Sprite();
			this.labelChainCntRecord = sprite;
			this.addChild(sprite);
			
			sprite = new Sprite();
			this.labelResultScore = sprite;
			this.addChild(sprite);
			
			// ボタン。
			this.buttons = [];
			this.buttonPush = null; // 決定されたボタン。
			
			sprite = new Sprite();
			this.buttons.push(sprite);
			sprite.name = "RETRY";
			sprite.image = core.assets('img/buttons.png');
			sprite.width = 240;
			sprite.height = 48;
			sprite.setCx(DF.SC_CX);
			sprite.setCy(216);
			sprite.frame = 0;
			sprite.visible = false;
			this.addChild(sprite);
			
//			sprite = new Sprite();
//			this.buttons.push(sprite);
//			sprite.name = "SEND_RESULT";
//			sprite.image = core.assets('img/buttons.png');
//			sprite.width = 240;
//			sprite.height = 48;
//			sprite.setCx(DF.SC_CX);
//			sprite.setCy(280);
//			sprite.frame = 1;
//			sprite.visible = false;
//			this.addChild(sprite);
			
			this.addEventListener(Event.TOUCH_END, this.onTouchEnd);
			core.input.setScene(this);
			this.isTouchEnd = false;
			this.tutorialIdx = 0;
		},
		
		onTouchEnd: function(event) {
			this.isTouchEnd = true;
		},
		
		exec: function() {
			var sprite;
			var game = Game.instance;
			var core = Core.instance;
			core.exec();
			
			var input = core.input.getInput();
			
			var isTouchEnd = this.isTouchEnd;
			this.isTouchEnd = false;
			
			switch (this.state) {
			case 0:
				var sprite;
				
				sprite = this.labelResultScore;
				sprite.setText("SCORE " + this.stageRecord.score);
				sprite.visible = true;
				sprite.setCx(DF.SC_W * 1.5);
				sprite.y = 140;
				
				sprite = this.labelChainCntRecord;
				sprite.setText("MAX CHAIN x" + this.stageRecord.chainMax);
				sprite.visible = false;
				sprite.setCx(- DF.SC_W * 1.5);
				sprite.y = 140 + DF.FONT_SIZE * 1;
				
				this.tl.resetCnt(0.25);
				this.state += 1;
				break;
			case 1:
			
				var sprite;
				sprite = this.spriteResult;
				sprite.setCy(this.tl.getLerp(- 50, 80, 1.0));
				sprite = this.labelResultScore;
				sprite.setCx(this.tl.getLerp(DF.SC_W * 1.5, DF.SC_W / 2, 1.0));
				sprite = this.labelChainCntRecord;
				sprite.setCx(this.tl.getLerp(- DF.SC_W * 1.5, DF.SC_W / 2, 1.0));
			
				sprite = this.spriteText;
				sprite.visible = (game.frame % Util.secToFrame(1.0)) <= Util.secToFrame(0.75);
				if (this.tl.isEnd()) {
					for (var i = 0; i < this.buttons.length; i += 1) {
						sprite = this.buttons[i];
						sprite.visible = true;
					}
					this.state += 1;
				}
				this.tl.exec();
				break;
			case 2:
				// テキストを点滅。
				sprite = this.spriteText;
				sprite.visible = (game.frame % Util.secToFrame(1)) < Util.secToFrame(0.75);
				//
				if (input.isEnd) {
					for (var i = 0; i < this.buttons.length; i += 1) {
						sprite = this.buttons[i];
						if (Util.isHit2D(sprite.x, sprite.y, sprite.width, sprite.height, input.pos.x, input.pos.y, 1, 1)) {
							this.buttonPush = sprite;
							break;
						}
					}
				}
				if (this.buttonPush != null) {
					// 決定。
					core.sound.play('se', 'snd/se_ok.mp3');
					this.tl.resetCnt(0.5);
					this.state += 1;
				}
				break;
			case 3:
				this.buttonPush.visible = (game.frame & 0x1) == 0;
				if (this.tl.isEnd()) {
					for (var i = 0; i < this.buttons.length; i += 1) {
						sprite = this.buttons[i];
						sprite.visible = false;
					}
					this.state += 1;
				}
				this.tl.exec();
				break;
			case 4:
				switch (this.buttonPush.name) {
				case 'RETRY':
					core.record.jump_hell.playProgress.resetProgress();
					if (html.urlRetry) {
						// 勝手アプリ.
						location.href = html.urlRetry;
					}
					else {
						game.popScene();
						game.replaceScene(new jump_hell.SceneGame());
					}
					break;
				case 'SEND_RESULT':
					sprite = this.spriteText;
					sprite.visible = true;
					sprite.setText("SENDING RESULT...");
					sprite.setCx(DF.SC_CX);
					sprite.y = 240;
					
					var jsonObj = {
						replayData: {
							randomSeed: core.record.jump_hell.playProgress.startRandomSeed,
							input: [0,0,0,0,0],
						},
					};
					var jsonStr = JSON.stringify(jsonObj);
						
					if (html.sendScore) {
						// 勝手アプリ.
						html.sendScore(this.stageRecord.score, "SCORE:" + this.stageRecord.score, jsonStr);
					}
					else {
						// 9leap.
						NineleapUtil.sendScore(this.stageRecord.score, "SCORE:" + this.stageRecord.score);
					}
					
					this.state += 1;
					break;
				}
				// ボタン選択解除。
				this.buttonPush = null;
				break;
			case 5:
				// テキストを点滅。
				sprite = this.spriteText;
				sprite.visible = (game.frame % Util.secToFrame(1)) < Util.secToFrame(0.75);
				break;
			}
			this.frameCnt += 1;
		}
	});
	jump_hell.SceneResult = SceneResult;
}());



