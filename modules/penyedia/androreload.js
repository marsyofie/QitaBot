'use strict';
const async = require('async');
const moment = require('moment');

function getArray(raw_json) {
	let arr_push = []
	for (let j = 2; j < raw_json.length; j++) {
		let kode = raw_json[j]['0']
		let harga = raw_json[j]['2'].replace(/\./g, "")

		//arr_push = [...arr_push, [kode, harga]]
		arr_push.push([kode, harga])
	}
	return arr_push;
}

function getFinalJson(raw_json) {
	let json = {};
	json.tsel = [];

	for (let i = 0; i < raw_json.length; i++) {

		let provider = raw_json[i][0]['0'];

		switch (provider.toUpperCase()) {
			case 'INDOSAT':
				json.indosat = getArray(raw_json[i]);
				break;
			case 'TREE REGULAR':
				json.three = getArray(raw_json[i]);
				break;
			case 'AXIS REGULAR':
				json.axis = getArray(raw_json[i]);
				break;
			case 'TELKOMSEL PROMO':
			case 'TELKOMSEL REGULAR':
			case 'TELKOMSEL MKIOS':
				json.tsel = [...json.tsel, ...getArray(raw_json[i])]
				break;
			case 'XL REGULAR':
				json.xl = getArray(raw_json[i]);
				break;
		}
	}
	return json;
}

module.exports = {
	createHarga: (json, args, callback) => {
		// get final json
		json = getFinalJson(json);

		var array_json = new Array(5);
		var provider_id = '',
			penyedia_id = '5'; // ANDRO RELOAD
		async.forEachOf(array_json, function(nilai, iterasi, callback) {
			var operator = [];
			switch (iterasi) {
				case 0:
					operator = json.indosat
					provider_id = 2;
					break
				case 1:
					operator = json.three
					provider_id = 1;
					break;
				case 2:
					operator = json.tsel
					provider_id = 4;
					break;
				case 3:
					operator = json.xl
					provider_id = 3;
					break;
				case 4:
					operator = json.axis
					provider_id = 17;
					break;
			}

			async.forEachOf(operator, function(value, key, callback) {
				//sequelize.quey().then().catch()
				var kode = value[0],
					harga = parseInt(value[1]),
					kode_translate = kode.replace(/[a-zA-Z]/g, "");

				args.sequelize.child.query(`call sp_master_harga('${kode}','${harga}',${provider_id},${penyedia_id},${kode_translate},'${moment.tz(moment(), "Asia/Jakarta").format()}')`).then(result => {
					callback(null, true)
				}).catch(err => {
					callback(err)
				})
			}, function(err) {
				if (err) {
					callback(err)
				} else {
					callback(null, true)
				}
			})
		}, function(err) {
			if (err) {
				callback(err.message)
			} else {
				callback(null, 'Sukses Simpan dari web Report AndroReload')
			}
		})
	},
};