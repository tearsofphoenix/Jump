"@file df.js";
(function() {
"use strict";
var jump_hell = osakana4242.namespace("jump_hell");

/** 定数。
*/
var DF = osakana4242.namespace("jump_hell.DF");
DF.VERSION = 21;
DF.FLG_FPS = false; // FPSの表示。
DF.SC_W = 320;
DF.SC_H = 480;
DF.SC_CX = DF.SC_W / 2;
DF.SC_CY = DF.SC_H / 2;
DF.BASE_FPS = 20; // 最大FPS.
DF.PANEL_SIZE = 48; // ブロックの大きさ。指で押すことを考えて、あまり小さくはできない。
DF.SCORE_MAX = 99999999;
DF.CHAIN_TIME = 1.0; // チェインとみなされる時間。
DF.PANEL_TIME = 3.0; // ブロックに乗っていられる時間。
DF.JUMP_TIME = 0.50; // ジャンプにかかる時間。
DF.JUMP_TIME_SLOW = 1.00; // ジャンプにかかる時間(遅い)。
DF.JUMP_TIME_FAST = 0.50;// ジャンプにかかる時間(速い)。
DF.PANEL_GROUP_W = 320; // ジャンプできる範囲。
DF.PANEL_GROUP_H = 240; // 
DF.LEVEL_PANEL_GROUP_NUM = 16; // 1レベル内の編隊数。
DF.LEVEL_MAX = 4;
DF.FONT_SIZE = 16;
DF.PANEL_SLIDE_TIME = 0.5; // ブロックがすべる時間。

DF.PANEL_TAP_RANK_A = 1; // タイルタップの正確さ.
DF.PANEL_TAP_RANK_B = 2;
DF.PANEL_TAP_RANK_C = 3;
DF.PANEL_TAP_RANK_D = 4;
DF.PANEL_TAP_RANK_E = 5;
DF.PANEL_TAP_RANK_NUM = 5;

/** 一時停止ボタン */
DF.BUTTON_FRAME_PAUSE = 10;
/** 再生ボタン */
DF.BUTTON_FRAME_PLAY = 11;

function makeRecordMap(labelList, rowList) {
	var map = {};
	for (var rowI = 0, rowNum = rowList.length; rowI < rowNum; ++rowI) {
		var row = rowList[rowI];
		var record = {};
		for (var labelI = 0, labelNum = labelList.length; labelI < labelNum; ++labelI) {
			var label = labelList[labelI];
			record[label] = row[labelI];
		}
		map[record["id"]] = record;
	}
	return map;
}

// ランクとそれに関わるデータのひも付け。
// score: スコア.
// name: 表示名.
// trim_distance: タイル着地時のタイル中心からの距離.
DF.PANEL_TAP_RANK_MAP = makeRecordMap(
	["id", "score", "name", "judge_distance", "trim_distance", "flg_chain"],
	[
		[1, 500, "PERFECT", 16,  0, 1],
		[2, 300, "GREAT",   24,  4, 1],
		[3, 100, "GOOD",    48,  8, 1],
		[4,  50, "BAD",     56, 12, 0],
		[5,  10, "BAD",     99, 16, 0],
	]
);
DF.PANEL_JUMP_TIME_MAP = makeRecordMap(
	["id", "score", "time", "flg_chain"], 
	[
		[ 1, 1000, 0.1, 1],
		[ 2,  500, 0.2, 1],
		[ 3,  400, 0.3, 1],
		[ 4,  300, 0.4, 1],
		[ 5,  200, 0.5, 1],
		[ 6,  100, 1.0, 1],
		[ 7,   50, 2.0, 0],
		[ 8,   40, 3.0, 0],
		[ 9,   30, 4.0, 0],
		[10,   20, 9.0, 0],
	]
);

DF.PANEL_JUMP_TIME_RANK_A = 1;
DF.PANEL_JUMP_TIME_RANK_B = 2;
DF.PANEL_JUMP_TIME_RANK_C = 3;
DF.PANEL_JUMP_TIME_RANK_D = 4;
DF.PANEL_JUMP_TIME_RANK_E = 5;
DF.PANEL_JUMP_TIME_RANK_F = 6;
DF.PANEL_JUMP_TIME_RANK_G = 7;
DF.PANEL_JUMP_TIME_RANK_H = 8;
DF.PANEL_JUMP_TIME_RANK_I = 9;
DF.PANEL_JUMP_TIME_RANK_J = 10;

DF.PANEL_JUMP_TIME_RANK_NUM = 10;



DF.CHAIN_CNT_MAX = 16;
DF.CHAIN_ANIM_LIST = [
	['star_1'],
	['star_1', 'star_2"'],
	['star_2'],
	['star_2', 'star_3'],
	['star_3'],
	['star_3', 'star_4'],
	['star_4']
];

DF.PLAY_TYPE_STAGE_SELECT = 1;
DF.PLAY_TYPE_ALL_STAGE = 2;

var ColorRGB = enchant.Class.create(enchant.Class, {
	initialize: function(r, g, b) {
		this.r = r;
		this.g = g;
		this.b = b;
	},
	makeStr: function() {
		return 'rgb(' + this.r + ',' + this.g + ',' + this.b + ')';
	}
});
jump_hell.ColorRGB = ColorRGB;

/** panel属性。とりあえず色だけ。
*/
var PanelAttr = enchant.Class.create(enchant.Class, {
	initialize: function(color) {
		// Class.call(this);
		this.color = color;
	}
});
PanelAttr.DEFAULT = new PanelAttr(new ColorRGB(255, 255, 255));
jump_hell.PanelAttr = PanelAttr;

}());




