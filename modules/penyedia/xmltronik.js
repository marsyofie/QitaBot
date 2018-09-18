'use strict';
const async = require('async');
const moment = require('moment');

function fix_array(arr) {
	let arr_result = []
	for (let i = 0; i < arr.length; i++) {
		arr[i].forEach((value) => { arr_result.push(value); })
	}
	return arr_result;
}

function getArray(raw_json) {
	let arr_push = []
	for (let j = 2; j < raw_json.length; j++) {
		let kode = raw_json[j]['0']
		let harga = raw_json[j]['2'].replace(".", "")

		//arr_push = [...arr_push, [kode, harga]]
		arr_push.push([kode, harga])
	}
	return arr_push;
}

function getFinalJson(raw_json) {
	let json = {}
	let three = [],
		three2 = [],
		three3 = [];

	for (let i = 0; i < raw_json.length; i++) {

		let provider = raw_json[i][0]['0'];

		switch (provider.toUpperCase()) {
			case 'ISAT RETAIL NAS':
				json.indosat = getArray(raw_json[i]);
				break;
			case 'THREE RETAIL NASIONAL':
				three = getArray(raw_json[i]);
				break;
			case 'THREE':
				three2 = getArray(raw_json[i]);
				break;
			case 'THREE PROMO':
				three3 = getArray(raw_json[i]);
				break;
			case 'TSEL NAS':
				json.tsel = getArray(raw_json[i]);
				break;
			case 'XL RETAIL NASIONAL':
				json.xl = getArray(raw_json[i]);
				break;

		}
	}
	json.three = fix_array([three2, three3, three])

	return json;
}

module.exports = {
	createHarga: (json, args, callback) => {
		// get final json
		json = getFinalJson(json);

		var array_json = new Array(4);
		var provider_id = '',
			penyedia_id = '8'; // XML Tronik
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
				callback(null, 'Sukses Simpan dari web XML Tronik')
			}
		})
	},
};