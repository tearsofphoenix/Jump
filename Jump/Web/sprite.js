"@file sprite.js";
(function() {
"use strict";
var Core = osakana4242.namespace("Core");
var Class = enchant.Class;

/**  Sprite 拡張。
*/
osakana4242.Sprite = Class.create(enchant.Sprite, {
	initialize: function(width, height) {
		enchant.Sprite.call(this, width, height);
	},
	cx: {
		get: function() {
			return this.x + this.width / 2;
		},
		set: function(cx) {
			this.x = cx - this.width / 2;
		}
	},
	cy: {
		get: function() {
			return this.y + this.height / 2;
		},
		set: function(cy) {
			this.y = cy - this.height / 2;
		}
	},
	
	getCx: function() {
		return this.cx;
	},
	getCy: function() {
		return this.cy;
	},
	setCx: function(cx) {
		this.cx = cx;
	},
	setCy: function(cy) {
		this.cy = cy;
	},
	setText: function(txt) {
		var fontSize = 16;
		var widthItemNum = 16;
		this.width = txt.length * fontSize;
		this.height = fontSize;
		if (this.image === null || this.image.width != this.width || this.image.height != this.height) {
			this.image = new Surface(fontSize * txt.length, fontSize);
		}
		this.drawText(txt, fontSize, widthItemNum, this.image);
	},
	drawText: function(txt, fontSize, widthItemNum, destImage) {
		var x, y, wNum, charCode, charPos;
		var core = Core.instance;
		destImage.clear();
		for(var i = 0, txtLength = txt.length; i < txtLength; i++) {
			charCode = txt.charCodeAt(i);
			if (charCode >= 32 && charCode <= 127) {
				charPos = charCode - 32;
			} else {
				charPos = 0;
			}
			x = charPos % widthItemNum;
			y = Math.floor(charPos / widthItemNum);
			// drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh)
			destImage.draw(core.assets('img/font.png'), 
				x * fontSize, y * fontSize, fontSize, fontSize,
				i * fontSize, 0, fontSize, fontSize);
		}
	}
	
});

/**  Sprite 拡張。
*/
osakana4242.Sprite3D = Class.create(osakana4242.Sprite, {
	initialize: function(width, height) {
		osakana4242.Sprite.call(this, width, height);
		this.yy = 0;
		this.yz = 0;
		
	},
	
	yy: {
		set: function(v) {
			this._yy = v;
			this.y = this._yy + this._yz;
		},
		get: function() {
			return this._yy;
		}
	},

	yz: {
		set: function(v) {
			this._yz = v;
			this.y = this._yy + this._yz;
		},
		get: function() {
			return this._yz;
		}
	},

	cyy: {
		get: function() {
			return this.yy + this.height / 2;
		},
		set: function(v) {
			this.yy = v - this.height / 2;
		}
	},
	cyz: {
		get: function() {
			return this.yz + this.height / 2;
		},
		set: function(v) {
			this.yz = v - this.height / 2;
		}
	}
	
});
}());

