'use strict';
const async = require('async');
const moment = require('moment');

function getArray(kode_bl, list) {
	return list.map(function(item) { return [kode_bl + item['nominal'].toString().replace(/\d{3}$/g, ""), item['price'].toString()]; });
}

function getFinalJson(raw_json) {
	let json = {}
	for (let i = 0; i < raw_json.length; i++) {
		switch (raw_json[i].operator.toLowerCase()) {
			case 'telkomsel':
				json.tsel = getArray('BL_S', raw_json[i].items) //raw_json[i].operator
				break;
			case 'axis':
				json.axis = getArray('BL_AX', raw_json[i].items)
				break
			case 'indosat':
				json.indosat = getArray('BL_I', raw_json[i].items)
				break
			case 'xl':
				json.xl = getArray('BL_X', raw_json[i].items)
				break
			case 'tri':
				json.three = getArray('BL_T', raw_json[i].items)
				break
		}
	}
	return json;
}

module.exports = {
	createHarga: (json, args, callback) => {
		// get final json
		//let pulsa_array = json.phone_credits.map(el => { return el.items;  })
		json = getFinalJson(json.phone_credits);

		var array_json = new Array(5);
		var provider_id = '',
			penyedia_id = '6'; // BUKALAPAK
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
					kode_translate = kode.replace(/[a-zA-Z_]/g, "");

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
				console.log(err)
				callback(err.message)
			} else {
				callback(null, 'Sukses Simpan dari web API BUKALAPAK')
			}
		})
	},
};