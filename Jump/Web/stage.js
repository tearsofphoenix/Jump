osakana4242.jump_hell.STAGE_DATA = {
	"stages" : [
		{
			"id" : 1,
			"name" : "STAGE 1",
			"flg_last" : 0,
			"bg" : {
				"background_color" : "rgb(52, 45, 83)",
				"effect_vx" : 16,
				"effect_vy" : 4
			},
			"colors" : [
				{
					"r" : 255,
					"g" : 0,
					"b" : 0
				},
				{
					"r" : 50,
					"g" : 50,
					"b" : 255
				},
				{
					"r" : 0,
					"g" : 200,
					"b" : 0
				},
				{
					"r" : 230,
					"g" : 230,
					"b" : 0
				}
			],
			"form_map" : {
				"1_1" : {
					"colors" : [
						0,
						1
					],
					"panels" : [
						{
							"x" : -40,
							"y" : -24,
							"color_id" : 0
						}
					]
				},
				"2_1" : {
					"panels" : [
						{
							"x" : -120,
							"y" : 0,
							"color_id" : 0
						},
						{
							"x" : 120,
							"y" : 0,
							"color_id" : 1
						}
					]
				},
				"2_2" : {
					"panels" : [
						{
							"x" : -88,
							"y" : -8,
							"color_id" : 0
						},
						{
							"x" : 88,
							"y" : 8,
							"color_id" : 1
						}
					]
				},
				"2_3" : {
					"panels" : [
						{
							"x" : 0,
							"y" : -40,
							"color_id" : 0
						},
						{
							"x" : 0,
							"y" : 32,
							"color_id" : 1
						}
					]
				},
				"3_1" : {
					"panels" : [
						{
							"x" : -120,
							"y" : -40,
							"color_id" : 0
						},
						{
							"x" : 120,
							"y" : -40,
							"color_id" : 1
						},
						{
							"x" : 0,
							"y" : 40,
							"color_id" : 2
						}
					]
				},
				"3_2" : {
					"panels" : [
						{
							"x" : 40,
							"y" : -56,
							"color_id" : 0
						},
						{
							"x" : 24,
							"y" : 32,
							"color_id" : 1
						},
						{
							"x" : 120,
							"y" : -8,
							"color_id" : 2
						}
					]
				},
				"4_1" : {
					"panels" : [
						{
							"x" : 16,
							"y" : -40,
							"color_id" : 0
						},
						{
							"x" : 16,
							"y" : 72,
							"color_id" : 1
						},
						{
							"x" : -72,
							"y" : -8,
							"color_id" : 2
						},
						{
							"x" : 96,
							"y" : -8,
							"color_id" : 3
						}
					]
				},
				"5_1" : {
					"panels" : [
						{
							"x" : -88,
							"y" : -72,
							"color_id" : 0
						},
						{
							"x" : 112,
							"y" : -72,
							"color_id" : 1
						},
						{
							"x" : 16,
							"y" : 0,
							"color_id" : 2
						},
						{
							"x" : -88,
							"y" : 64,
							"color_id" : 3
						},
						{
							"x" : 112,
							"y" : 64,
							"color_id" : 4
						}
					]
				},
				"6_1" : {
					"panels" : [
						{
							"x" : -40,
							"y" : -56,
							"color_id" : 0
						},
						{
							"x" : -40,
							"y" : 8,
							"color_id" : 0
						},
						{
							"x" : -40,
							"y" : 72,
							"color_id" : 0
						},
						{
							"x" : 64,
							"y" : -56,
							"color_id" : 1
						},
						{
							"x" : 64,
							"y" : 72,
							"color_id" : 1
						},
						{
							"x" : 64,
							"y" : 8,
							"color_id" : 1
						}
					]
				}
			},
			"zone_map" : {
				"zone_1" : [
					"2_1",
					"2_2",
					"2_1",
					"2_3",
					"2_1",
					"2_2",
					"2_1",
					"2_3",
					"2_1",
					"2_2",
					"2_1",
					"2_3",
					"2_1",
					"2_2",
					"2_1",
					"2_3",
					"2_1",
					"2_2",
					"2_1",
					"3_1",
					"3_1",
					"3_1",
					"3_1",
					"3_1",
					"3_2",
					"3_2",
					"3_2",
					"3_2"
				],
				"zone_2" : [
					"3_1",
					"3_1",
					"3_1",
					"3_1",
					"3_1",
					"3_2",
					"3_2",
					"3_2",
					"3_2",
					"3_2",
					"4_1",
					"4_1",
					"4_1",
					"4_1",
					"4_1",
					"4_1",
					"4_1",
					"4_1",
					"4_1"
				],
				"zone_3" : [
					"4_1",
					"4_1",
					"4_1",
					"4_1",
					"4_1",
					"4_1",
					"4_1",
					"4_1",
					"4_1",
					"4_1",
					"5_1",
					"5_1",
					"5_1",
					"5_1",
					"5_1",
					"5_1",
					"5_1"
				]
			},
			"areas" : [
				{
					"colors" : [
						0,
						1
					],
					"zones" : [
						"zone_1"
					]
				},
				{
					"colors" : [
						0,
						1,
						2
					],
					"zones" : [
						"zone_2"
					]
				},
				{
					"colors" : [
						0,
						1,
						2,
						3
					],
					"zones" : [
						"zone_3"
					]
				}
			]
		},
		{
			"id" : 2,
			"name" : "STAGE 2",
			"flg_last" : 0,
			"bg" : {
				"background_color" : "rgb(52, 45, 83)",
				"effect_vx" : 128,
				"effect_vy" : 32
			},
			"colors" : [
				{
					"r" : 240,
					"g" : 240,
					"b" : 150
				},
				{
					"r" : 240,
					"g" : 120,
					"b" : 240
				},
				{
					"r" : 100,
					"g" : 255,
					"b" : 255
				},
				{
					"r" : 255,
					"g" : 130,
					"b" : 130
				}
			],
			"form_map" : {
				"1_1" : {
					"panels" : [
						{
							"x" : -64,
							"y" : -40,
							"color_id" : 0
						}
					]
				},
				"2_1" : {
					"panels" : [
						{
							"x" : 48,
							"y" : -48,
							"color_id" : 0
						},
						{
							"x" : 120,
							"y" : 0,
							"color_id" : 1
						}
					]
				},
				"2_2" : {
					"panels" : [
						{
							"x" : -112,
							"y" : -56,
							"color_id" : 0
						},
						{
							"x" : 112,
							"y" : 24,
							"color_id" : 1
						}
					]
				},
				"3_1" : {
					"panels" : [
						{
							"x" : -56,
							"y" : 48,
							"color_id" : 0
						},
						{
							"x" : 48,
							"y" : -56,
							"color_id" : 0
						},
						{
							"x" : -8,
							"y" : -8,
							"color_id" : 1
						}
					]
				},
				"3_2" : {
					"panels" : [
						{
							"x" : -72,
							"y" : 56,
							"color_id" : 0
						},
						{
							"x" : 104,
							"y" : 16,
							"color_id" : 1
						},
						{
							"x" : -8,
							"y" : -64,
							"color_id" : 2
						}
					]
				},
				"4_1" : {
					"panels" : [
						{
							"x" : -80,
							"y" : -40,
							"color_id" : 0
						},
						{
							"x" : 80,
							"y" : -40,
							"color_id" : 1
						},
						{
							"x" : -72,
							"y" : 48,
							"color_id" : 2
						},
						{
							"x" : 72,
							"y" : 48,
							"color_id" : 3
						}
					]
				},
				"4_2" : {
					"panels" : [
						{
							"x" : -96,
							"y" : -40,
							"color_id" : 0
						},
						{
							"x" : 40,
							"y" : -72,
							"color_id" : 1
						},
						{
							"x" : -24,
							"y" : 32,
							"color_id" : 2
						},
						{
							"x" : 96,
							"y" : 48,
							"color_id" : 3
						}
					]
				},
				"5_1" : {
					"panels" : [
						{
							"x" : -88,
							"y" : -40,
							"color_id" : 0
						},
						{
							"x" : 88,
							"y" : -40,
							"color_id" : 1
						},
						{
							"x" : 0,
							"y" : 0,
							"color_id" : 2
						},
						{
							"x" : -88,
							"y" : 40,
							"color_id" : 3
						},
						{
							"x" : 88,
							"y" : 40,
							"color_id" : 4
						}
					]
				}
			},
			"zone_map" : {
				"zone_1" : [
					"1_1",
					"2_1",
					"3_1",
					"4_1"
				],
				"zone_2" : [
					"2_1",
					"4_2",
					"2_2",
					"5_1"
				],
				"zone_speed" : [
					"1_1",
					"2_1",
					"3_1",
					"4_1",
					"1_1",
					"1_1",
					"1_1",
					"1_1",
					"1_1",
					"1_1",
					"1_1",
					"1_1"
				],
				"zone_3" : [
					"3_1",
					"2_1",
					"3_2",
					"2_1"
				]
			},
			"areas" : [
				{
					"colors" : [
						0,
						1
					],
					"zones" : [
						"zone_1",
						"zone_1",
						"zone_2",
						"zone_2"
					]
				},
				{
					"colors" : [
						0,
						1
					],
					"zones" : [
						"zone_speed"
					]
				},
				{
					"colors" : [
						0,
						1,
						2
					],
					"zones" : [
						"zone_2",
						"zone_2",
						"zone_3",
						"zone_speed"
					]
				},
				{
					"colors" : [
						0,
						1,
						2,
						3
					],
					"zones" : [
						"zone_2",
						"zone_2",
						"zone_3",
						"zone_3"
					]
				},
				{
					"colors" : [
						0,
						1,
						2,
						3
					],
					"zones" : [
						"zone_speed"
					]
				}
			]
		},
		{
			"id" : 3,
			"name" : "STAGE 3",
			"flg_last" : 1,
			"bg" : {
				"background_color" : "rgb(83, 45, 52)",
				"effect_vx" : 16,
				"effect_vy" : 4
			},
			"colors" : [
				{
					"r" : 255,
					"g" : 10,
					"b" : 10
				},
				{
					"r" : 0,
					"g" : 200,
					"b" : 0
				},
				{
					"r" : 128,
					"g" : 96,
					"b" : 255
				},
				{
					"r" : 224,
					"g" : 0,
					"b" : 224
				},
				{
					"r" : 0,
					"g" : 224,
					"b" : 224
				},
				{
					"r" : 224,
					"g" : 224,
					"b" : 0
				}
			],
			"form_map" : {
				"1_1" : {
					"panels" : [
						{
							"x" : -64,
							"y" : -40,
							"color_id" : 0
						}
					]
				},
				"2_1" : {
					"panels" : [
						{
							"x" : 48,
							"y" : -48,
							"color_id" : 0
						},
						{
							"x" : 120,
							"y" : 48,
							"color_id" : 1
						}
					]
				},
				"3_1" : {
					"panels" : [
						{
							"x" : -72,
							"y" : 40,
							"color_id" : 0
						},
						{
							"x" : 56,
							"y" : -56,
							"color_id" : 1
						},
						{
							"x" : -8,
							"y" : -8,
							"color_id" : 2
						}
					]
				},
				"4_1" : {
					"panels" : [
						{
							"x" : -80,
							"y" : -32,
							"color_id" : 0
						},
						{
							"x" : 104,
							"y" : -72,
							"color_id" : 1
						},
						{
							"x" : -112,
							"y" : 64,
							"color_id" : 2
						},
						{
							"x" : 8,
							"y" : 56,
							"color_id" : 3
						}
					]
				},
				"4_2" : {
					"panels" : [
						{
							"x" : 0,
							"y" : -80,
							"color_id" : 0
						},
						{
							"x" : 56,
							"y" : -64,
							"color_id" : 1
						},
						{
							"x" : -88,
							"y" : 32,
							"color_id" : 2
						},
						{
							"x" : 64,
							"y" : 72,
							"color_id" : 3
						}
					]
				},
				"5_1" : {
					"panels" : [
						{
							"x" : -88,
							"y" : -40,
							"color_id" : 0
						},
						{
							"x" : 24,
							"y" : -56,
							"color_id" : 1
						},
						{
							"x" : -32,
							"y" : -72,
							"color_id" : 2
						},
						{
							"x" : -104,
							"y" : 16,
							"color_id" : 3
						},
						{
							"x" : 80,
							"y" : -16,
							"color_id" : 4
						}
					]
				},
				"5_2" : {
					"panels" : [
						{
							"x" : -72,
							"y" : -96,
							"color_id" : 0
						},
						{
							"x" : 56,
							"y" : -48,
							"color_id" : 1
						},
						{
							"x" : -16,
							"y" : -24,
							"color_id" : 2
						},
						{
							"x" : -104,
							"y" : 0,
							"color_id" : 3
						},
						{
							"x" : 8,
							"y" : 64,
							"color_id" : 4
						}
					]
				},
				"6_1" : {
					"panels" : [
						{
							"x" : -112,
							"y" : -88,
							"color_id" : 0
						},
						{
							"x" : -112,
							"y" : 8,
							"color_id" : 1
						},
						{
							"x" : -64,
							"y" : 56,
							"color_id" : 2
						},
						{
							"x" : -16,
							"y" : 8,
							"color_id" : 3
						},
						{
							"x" : 32,
							"y" : -40,
							"color_id" : 4
						},
						{
							"x" : 80,
							"y" : 8,
							"color_id" : 5
						}
					]
				},
				"6_2" : {
					"panels" : [
						{
							"x" : -32,
							"y" : -88,
							"color_id" : 0
						},
						{
							"x" : 48,
							"y" : -72,
							"color_id" : 1
						},
						{
							"x" : -96,
							"y" : -32,
							"color_id" : 2
						},
						{
							"x" : 96,
							"y" : 0,
							"color_id" : 3
						},
						{
							"x" : -80,
							"y" : 40,
							"color_id" : 4
						},
						{
							"x" : 24,
							"y" : 80,
							"color_id" : 5
						}
					]
				},
				"7_1" : {
					"panels" : [
						{
							"x" : -88,
							"y" : -40,
							"color_id" : 0
						},
						{
							"x" : 88,
							"y" : -40,
							"color_id" : 1
						},
						{
							"x" : 0,
							"y" : 0,
							"color_id" : 2
						},
						{
							"x" : -88,
							"y" : 40,
							"color_id" : 3
						},
						{
							"x" : 88,
							"y" : 40,
							"color_id" : 4
						},
						{
							"x" : 0,
							"y" : -80,
							"color_id" : 5
						},
						{
							"x" : 0,
							"y" : 80,
							"color_id" : 6
						}
					]
				},
				"7_2" : {
					"panels" : [
						{
							"x" : -96,
							"y" : -72,
							"color_id" : 0
						},
						{
							"x" : -40,
							"y" : -56,
							"color_id" : 1
						},
						{
							"x" : 16,
							"y" : -32,
							"color_id" : 2
						},
						{
							"x" : -112,
							"y" : -8,
							"color_id" : 3
						},
						{
							"x" : -48,
							"y" : 8,
							"color_id" : 4
						},
						{
							"x" : 16,
							"y" : 32,
							"color_id" : 5
						},
						{
							"x" : 80,
							"y" : 48,
							"color_id" : 6
						}
					]
				},
				"8_1" : {
					"panels" : [
						{
							"x" : -88,
							"y" : -88,
							"color_id" : 0
						},
						{
							"x" : -32,
							"y" : -80,
							"color_id" : 1
						},
						{
							"x" : 24,
							"y" : -72,
							"color_id" : 2
						},
						{
							"x" : 80,
							"y" : -64,
							"color_id" : 3
						},
						{
							"x" : 72,
							"y" : -8,
							"color_id" : 4
						},
						{
							"x" : 16,
							"y" : 0,
							"color_id" : 5
						},
						{
							"x" : -40,
							"y" : 8,
							"color_id" : 6
						},
						{
							"x" : -96,
							"y" : 16,
							"color_id" : 7
						}
					]
				},
				"8_2" : {
					"panels" : [
						{
							"x" : -56,
							"y" : -88,
							"color_id" : 0
						},
						{
							"x" : -24,
							"y" : -32,
							"color_id" : 1
						},
						{
							"x" : 16,
							"y" : 24,
							"color_id" : 2
						},
						{
							"x" : 128,
							"y" : -40,
							"color_id" : 3
						},
						{
							"x" : 48,
							"y" : 88,
							"color_id" : 4
						},
						{
							"x" : 72,
							"y" : 0,
							"color_id" : 5
						},
						{
							"x" : -32,
							"y" : 72,
							"color_id" : 6
						},
						{
							"x" : -88,
							"y" : 88,
							"color_id" : 7
						}
					]
				}
			},
			"zone_map" : {
				"zone_10" : [
					"8_1",
					"2_1",
					"2_1",
					"2_1",
					"3_1",
					"3_1",
					"3_1",
					"3_1",
					"3_1",
					"3_1"
				],
				"zone_20" : [
					"4_1",
					"4_1",
					"4_1",
					"5_1",
					"5_1",
					"5_1",
					"5_1",
					"5_1",
					"5_1",
					"5_1",
					"5_1",
					"5_1"
				],
				"zone_30" : [
					"3_1",
					"3_1",
					"3_1",
					"5_1",
					"5_1",
					"5_1",
					"5_1",
					"5_2",
					"5_2",
					"5_2",
					"5_2",
					"5_2",
					"6_1",
					"6_1",
					"6_1",
					"6_1",
					"6_1",
					"6_1",
					"6_1",
					"6_1",
					"6_1",
					"6_1",
					"6_1",
					"6_1",
					"7_1",
					"7_1"
				],
				"zone_31" : [
					"3_1",
					"3_1",
					"7_1",
					"3_1",
					"7_2",
					"7_2"
				],
				"zone_40" : [
					"7_2",
					"7_1",
					"7_1",
					"8_1",
					"8_2"
				],
				"zone_41" : [
					"7_1",
					"7_2",
					"8_1",
					"8_2",
					"8_1"
				]
			},
			"areas" : [
				{
					"colors" : [
						0,
						1,
						2
					],
					"zones" : [
						"zone_10"
					]
				},
				{
					"colors" : [
						3,
						4,
						5
					],
					"zones" : [
						"zone_20"
					]
				},
				{
					"colors" : [
						1,
						2,
						3,
						4
					],
					"zones" : [
						"zone_30",
						"zone_31"
					]
				},
				{
					"colors" : [
						0,
						1,
						2,
						3,
						4,
						5
					],
					"zones" : [
						"zone_40",
						"zone_41"
					]
				}
			]
		},
		{
			"id" : 4,
			"name" : "TEST STAGE",
			"flg_last" : 1,
			"bg" : {
				"background_color" : "rgb(52, 45, 83)",
				"effect_vx" : 100,
				"effect_vy" : 20
			},
			"colors" : [
				{
					"r" : 255,
					"g" : 0,
					"b" : 0
				},
				{
					"r" : 50,
					"g" : 50,
					"b" : 255
				},
				{
					"r" : 0,
					"g" : 200,
					"b" : 0
				},
				{
					"r" : 230,
					"g" : 230,
					"b" : 0
				}
			],
			"form_map" : {
				"1_1" : {
					"colors" : [
						0,
						1
					],
					"panels" : [
						{
							"x" : -40,
							"y" : -24,
							"color_id" : 0
						}
					]
				}
			},
			"zone_map" : {
				"zone_1" : [
					"1_1",
					"1_1",
					"1_1",
					"1_1"
				]
			},
			"areas" : [
				{
					"colors" : [
						0,
						1
					],
					"zones" : [
						"zone_1"
					]
				}
			]
		}
	]
};