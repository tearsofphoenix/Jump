"@file enchant_patch.js";

(function() {
"use strict";

/**
 * urlパラメータの付いたパス対策を施したload.
 */
enchant.Game.prototype.load = function(src, callback) {
	if (callback == null) callback = function() {};
	
	var game = enchant.Game.instance;
	var ext = src
	// URL から ? 以降を取り除く.
	var qIdx = ext.indexOf('?');
	if (0 <= qIdx) {
		ext = ext.substring(0, qIdx);
	}
	var extG = ext.match(/\.(\w)+$/);
//	var extG = ext.match(/\.(\w|[0-9])+$/);
	ext = extG[0];
	
	if (ext) ext = ext.slice(1).toLowerCase();
	switch (ext) {
		case 'jpg':
		case 'gif':
		case 'png':
			game.assets[src] = enchant.Surface.load(src);
			game.assets[src].addEventListener('load', callback);
			break;
		case 'mp3':
		case 'aac':
		case 'm4a':
		case 'wav':
		case 'ogg':
			game.assets[src] = enchant.Sound.load(src, 'audio/' + ext);
			game.assets[src].addEventListener('load', callback);
			break;
		default:
			var req = new XMLHttpRequest();
			req.open('GET', src, true);
			req.onreadystatechange = function(e) {
				if (req.readyState == 4) {
					if (req.status != 200) {
						throw new Error('Cannot load an asset: ' + src);
					}

					var type = req.getResponseHeader('Content-Type') || '';
					if (type.match(/^image/)) {
						game.assets[src] = enchant.Surface.load(src);
						game.assets[src].addEventListener('load', callback);
					} else if (type.match(/^audio/)) {
						game.assets[src] = enchant.Sound.load(src, type);
						game.assets[src].addEventListener('load', callback);
					} else {
						game.assets[asset] = req.responseText;
						callback();
					}
				}
			};
			req.send(null);
	}
};	



var VENDER_PREFIX = (function() {
	var ua = navigator.userAgent;
	if (ua.indexOf('Opera') != -1) {
		return 'O';
	} else if (ua.indexOf('MSIE') != -1) {
		return 'ms';
	} else if (ua.indexOf('WebKit') != -1) {
		return 'webkit';
	} else if (navigator.product == 'Gecko') {
		return 'Moz';
	} else {
		return '';
	}
})();
var TOUCH_ENABLED = (function() {
	var div = document.createElement('div');
	div.setAttribute('ontouchstart', 'return');
	return typeof div.ontouchstart == 'function';
})();

/**
 * swf の パスを修正...
 */
enchant.Sound.load = function(src, type) {
	var game = enchant.Game.instance;
	if (type == null) {
		var ext = src.match(/\.\w+$/)[0];
		if (ext) {
			type = 'audio/' + ext.slice(1).toLowerCase();
		} else {
			type = '';
		}
	}
	type = type.replace('mp3', 'mpeg');

	var sound = Object.create(enchant.Sound.prototype);
	enchant.EventTarget.call(sound);
	var audio = new Audio();
	if (!enchant.Sound.enabledInMobileSafari &&
		VENDER_PREFIX == 'webkit' && TOUCH_ENABLED) {
		window.setTimeout(function() {
			sound.dispatchEvent(new enchant.Event('load'));
		}, 0);
	} else {
		if (audio.canPlayType(type)) {
			audio.src = src;
			audio.load();
			audio.autoplay = false;
			audio.onerror = function() {
				throw new Error('Cannot load an asset: ' + audio.src);
			};
			audio.addEventListener('canplaythrough', function() {
				sound.duration = audio.duration;
				sound.dispatchEvent(new enchant.Event('load'));
			}, false);
			sound._element = audio;
		} else if (type == 'audio/mpeg') {
			var embed = document.createElement('embed');
			var id = 'enchant-audio' + game._soundID++;
			embed.width = embed.height = 1;
			embed.name = id;
			embed.src = 'game/sound.swf?id=' + id + '&src=' + src;
			embed.allowscriptaccess = 'always';
			embed.style.position = 'absolute';
			embed.style.left = '-1px';
			sound.addEventListener('load', function() {
				Object.defineProperties(embed, {
					currentTime: {
						get: function() { return embed.getCurrentTime() },
						set: function(time) { embed.setCurrentTime(time) }
					},
					volume: {
						get: function() { return embed.getVolume() },
						set: function(volume) { embed.setVolume(volume) }
					}
				});
				sound._element = embed;
				sound.duration = embed.getDuration();
			});
			game._element.appendChild(embed);
			enchant.Sound[id] = sound;
		} else {
			window.setTimeout(function() {
				sound.dispatchEvent(new enchant.Event('load'));
			}, 0);
		}
	}
	return sound;
};

}());
