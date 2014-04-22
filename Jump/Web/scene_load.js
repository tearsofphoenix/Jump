/* ロード。
*/
"@file scene_load.js";
(function() {
	"use strict";
	enchant();
	
	var Logger = osakana4242.Logger;
	var jump_hell = osakana4242.jump_hell;
	var DF = osakana4242.jump_hell.DF;
	var Vector2D = osakana4242.Vector2D;
	var TimeLeap = osakana4242.TimeLeap;
	var core = osakana4242.core;
	var Sprite = osakana4242.Sprite;
	
	/** 準備シーン。
		サウンドの準備。
	*/	
	var SceneLoad = Class.create(Scene, {
		initialize: function() {
			var game = Game.instance;
			Scene.call(this);
			this.addEventListener(Event.ENTER_FRAME, this.exec);
			this.state = 0;
			this.tl = new TimeLeap();
			this.frameCnt = 0;
			
			var sprite;
			sprite = new Sprite();
			this.spriteText = sprite; // 状態表示用テキスト。
			sprite.x = 8;
			sprite.y = 8;
			this.addChild(sprite);
		},
		exec: function() {
			var game = Game.instance;
			switch (this.state) {
			case 0:
				this.state += 1;
				break;
			case 1:
				this.state += 1;
				break;
			case 2:
				if (this.tl.isEnd()) {
					var scene = new jump_hell.SceneTitle();
					game.replaceScene(scene);
				}
				this.tl.exec();
				break;
			}
			this.frameCnt += 1;
		}
	});
	jump_hell.SceneLoad = SceneLoad;
}());



