'use strict';
const async = require('async');
const moment = require('moment');
const cashback = parseInt(process.env.CB_PAYFAZZ);

function getArray(list) {
	// let arr_result = [];
	// for (let j = 0; j < list.length; j++) {
	// 	arr_result.push([list[j].operatorPlanCode, list[j].sellPrice])
	// }
	// return arr_result;
	return list.map(function(item) { return [item['operatorPlanCode'], item['sellPrice']-cashback]; });
}

function getFinalJson(raw_json) {
	let final_json = {}
	for (let i = 0; i < raw_json.mobile.length; i++) {
		let operator = raw_json.mobile[i].operatorId;
		let list = raw_json.mobile[i].plans;

		switch (operator) {
			case 1: //telkomsel
				final_json.tsel = getArray(list)
				break;
			case 2: //indosat
				final_json.indosat = getArray(list)
				break;
			case 3: //xl
				final_json.xl = getArray(list)
				break;
			case 4: //three
				final_json.three = getArray(list)
				break
			case 11: //axis
				final_json.axis = getArray(list)
				break
		}
	}
	return final_json;
}

module.exports = {
	createHarga: (result_json, args, callback) => {
		var json = getFinalJson(result_json);

		let array_json = new Array(5);
		let provider_id = '',
			penyedia_id = '3'; // PAYFAZZ
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
					break
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
				callback(null, 'Sukses Grab dr web PAYFAZZ')
			}
			// return 'Sukses Grab dr web Ipay'
		})
	},
};