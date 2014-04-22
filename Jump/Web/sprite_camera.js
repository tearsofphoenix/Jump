"@file sprite_camera.js";
(function() {
	"use strict";
	var Class = enchant.Class;
	var TimeLeap = osakana4242.namespace("TimeLeap");
	var Util = osakana4242.namespace("Util");
	var Sprite = osakana4242.namespace("Sprite");
	var Core = osakana4242.namespace("Core");
	
	var jump_hell = osakana4242.namespace("jump_hell");

	var Camera = Class.create(Sprite, {
		initialize: function(vw, vh) {
			Sprite.call(this);
			
			this.x = 0;
			this.y = 0;
			this.tx = 0;
			this.ty = 0;
			
			this.vw = vw;
			this.vh = vh;
			this.visible = false;
			
//			this.speedMax = Util.secDotToFrameDot(800);
//			this.speedMin = Util.secDotToFrameDot(10);
			
			this.speedMax = Util.secDotToFrameDot(1000);
			this.speedMin = Util.secDotToFrameDot(10);
			
			var sprite = new Sprite();
			sprite.width = this.vw - 2;
			sprite.height = this.vh - 2;
			sprite.backgroundColor = 'rgb(255, 255, 255)';
			sprite.opacity = 0.1;
			sprite.visible = false;
			this.cameraSprite = sprite;
			
			sprite = new Sprite();
			sprite.width = 16;
			sprite.height = 16;
			sprite.backgroundColor = 'rgb(255, 255, 255)';
			sprite.visible = false;
			this.cameraTargetSprite = sprite;
			
			// à⁄ìÆñ⁄ïWÇ∆ÇÃåªç›ÇÃãóó£.
			this.curTargetDistance = 0;
		},
		exec: function() {
			// ÉJÉÅÉâÅB
			var minX = this.vw / 2 - 16;
			var maxX = this.vw / 2 + 16;
			var tx = this.tx;
			var ty = this.ty;
			
			if (tx < minX) {
				//tx = minX;
			}
			else if (maxX < tx) {
				//tx = maxX;
			}
			
			
//			tx = this.vw / 2 - tx;
//			ty = this.vh / 2 - ty;
			
			var dx = tx - this.x;
			var dy = ty - this.y;
			
			
			var d = Math.sqrt(dx * dx + dy * dy);
			this.curTargetDistance = d;
			var nx = 0 < d ? dx / d : 0;
			var ny = 0 < d ? dy / d : 0;
			var distanceMax = 300.0;
			var speed = this.speedMin + (Math.min(distanceMax, d) / distanceMax) * (this.speedMax - this.speedMin);
			
			var mx = nx * speed;
			var my = ny * speed;
			if (dx * dx < mx * mx) {
				mx = dx;
			}
			if (dy * dy < my * my) {
				my = dy;
			}
			this.x += mx;
			this.y += my;
			
			
			this.cameraSprite.setCx(this.x);
			this.cameraSprite.setCy(this.y);
			this.cameraTargetSprite.setCx(this.tx);
			this.cameraTargetSprite.setCy(this.ty);
			
		},
		updateLayer: function(layer) {
		
			layer.x = this.vw / 2 - this.x;
			layer.y = this.vh / 2 - this.y;
		
		}
		
	});
	osakana4242.namespace("jump_hell.sprite").Camera = Camera;

}());
