'use strict';
const async = require('async');
//const config = require('../../.env');
const moment = require('moment');
const request = require('request');

function sortArray(list) {
	return list.sort((a, b) => { return a[1] - b[1] })
}

function getFinalJson(raw_json) {
	//console.log(raw_json.aaData)
	let json = {};
	json.tsel = [];
	json.indosat = [];
	json.axis = [];
	json.xl = [];
	json.three = [];

	// let dd = [] raw_json.length
	// for (let i = 0; i < 1; i++) {
	// 	let provider = raw_json[i]['0']['0'].toLowerCase();

	// 	//console.log(provider)

	// 	console.log(raw_json[i][4])
	// 	// if(provider == 'axis'){
	// 	// 	//console.log('DIEKSEKUSI')
	// 	// 	for (let j = 2; j <= raw_json[i].length; i++) {
	// 	// 		console.log(raw_json[i]['2'])
	// 	// 	}
	// 	// 	//console.log(raw_json[i])
	// 	// }
		

	// }
	raw_json.forEach(value => {
		//let hasil = value.map(el => { return [el['0'], el['2']] })

		//dd.push(hasil)
		console.log(value)
		//if (value.toLowerCase() == 'axis') {

			//console.log(value)
			// for (let i = 0; i <= value.length; i++) {
			// 	//if (value[i]['0'].toLowerCase() == 'axis') {
			// 		console.log(value[i])
			// 	//}
			// }
		//}

				// if (value[0].includes('03.TELKOMSEL REGULER') || value[0].includes('02.TELKOMSEL PROMO') || value[0].includes('01.TELKOMSEL SUPER PROMO')) { //|| value[0].includes('02.TELKOMSEL PROMO') || value[0].includes('01.TELKOMSEL SUPER PROMO')
				// 	json.tsel = [...json.tsel, [kode, harga]]
				// } else if (value[0].includes('05.INDOSAT')) {
				// 	json.indosat = [...json.indosat, [kode, harga]]
				// } else if (value[0].includes('06.XL')) {
				// 	json.xl = [...json.xl, [kode, harga]]
				// } else if (value[0].includes('07.AXIS')) {
				// 	json.axis = [...json.axis, [kode, harga]]
				// } else if (value[0].includes('08.THREE')) {
				// 	if (!value[2].includes('TMA')) {
				// 		json.three = [...json.three, [kode, harga]]
				// 	}
				// }
	})
	//console.log(dd)
	// json.tsel = sortArray(json.tsel)
	// json.indosat = sortArray(json.indosat)
	// json.axis = sortArray(json.axis)
	// json.xl = sortArray(json.xl)
	// json.three = sortArray(json.three)

	return json;
}

module.exports = {
	createHarga: (json, args, callback) => {
		// get final json
		json = getFinalJson(json);

		//console.log(json)
		callback(null, 'WKWK')
		var array_json = new Array(5);
		var provider_id = '',
			penyedia_id = '7'; // TOPINDO
		/*async.forEachOf(array_json, function(nilai, iterasi, callback) {
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
				callback(null, 'Sukses Simpan dari web Report TOPINDO Pulsa')
			}
		})*/
	},
};