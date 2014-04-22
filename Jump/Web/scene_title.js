/* タイトル兼チュートリアル。
*/
"@file scene_title.js";
(function() {
	"use strict";
	enchant();
	
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
	
	/** タイトル。
	*/	
	var SceneTitle = Class.create(Scene, {
		initialize: function() {
		
			var core = Core.instance;
			Scene.call(this);
			this.addEventListener(Event.ENTER_FRAME, this.exec);
			this.state = 0;
			this.tl = new TimeLeap();
			this.frameCnt = 0;
			
			var sprite;
			
			sprite = new Sprite();
			this.spriteBg = sprite; // BG
			this.addChild(sprite);
			sprite.image = core.assets('img/title.png');
			sprite.width = sprite.image.width;
			sprite.height = sprite.image.height;
			sprite.setCx(DF.SC_CX);
			sprite.setCy(DF.SC_CY);
			
			sprite = new Sprite();
			this.spriteText = sprite; // 状態表示用テキスト。
			this.addChild(sprite);
			sprite.setText('TAP TO NEXT');
			sprite.setCx(DF.SC_CX);
			sprite.setCy(250);
			
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
			
			sprite = new Sprite();
			this.buttons.push(sprite);
			sprite.name = "SEND_RESULT";
			sprite.image = core.assets('img/buttons.png');
			sprite.width = 240;
			sprite.height = 48;
			sprite.setCx(DF.SC_CX);
			sprite.setCy(280);
			sprite.frame = 1;
			sprite.visible = false;
			this.addChild(sprite);
			
			
			this.addEventListener(Event.TOUCH_END, this.onTouchEnd);
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
			var isTouchEnd = this.isTouchEnd;
			this.isTouchEnd = false;
			
			switch (this.state) {
			case 0:
				this.state += 1;
				break;
			case 1:
				this.state += 1;
				break;
			case 2:
				sprite = this.spriteText;
				sprite.visible = (game.frame % Util.secToFrame(1.0)) <= Util.secToFrame(0.75);
				if (isTouchEnd) {
					this.spriteText.y = 300;
					core.sound.play('se', 'snd/se_ok.mp3');
					this.setBg(0);
					this.state += 1;
				}
				this.tl.exec();
				break;
			case 3:
				sprite = this.spriteText;
				sprite.visible = (game.frame % Util.secToFrame(1.0)) <= Util.secToFrame(0.75);
				if (isTouchEnd) {
					core.sound.play('se', 'snd/se_ok.mp3');
					var nextIdx = this.tutorialIdx + 1;
					if (nextIdx < SceneTitle.TUTORIAL_LIST.length) {
						this.setBg(nextIdx);
						if (nextIdx == SceneTitle.TUTORIAL_LIST.length - 1) {
							// 最後のページになったら、テキスト変更。
							sprite = this.spriteText;
							sprite.setText("TAP TO START");
							sprite.setCx(DF.SC_CX);
						}
					}
					else {
						this.tl.resetCnt(0.5);
						this.state += 1;
					}
				}
				this.tl.exec();
				break;
			case 4:
				if (this.tl.isEnd()) {
					var scene = new jump_hell.SceneGame();
					game.replaceScene(scene);
				}
				this.tl.exec();
				break;
			case 5:
				break;
			}
			this.frameCnt += 1;
		},
		setBg: function(idx) {
			var core = Core.instance;
			this.tutorialIdx = idx;
			this.spriteBg.image = core.assets(SceneTitle.TUTORIAL_LIST[this.tutorialIdx]);
		}
	});
	SceneTitle.TUTORIAL_LIST = [
		'img/tutorial_01.png',
		'img/tutorial_02.png'
	];
	jump_hell.SceneTitle = SceneTitle;
}());



