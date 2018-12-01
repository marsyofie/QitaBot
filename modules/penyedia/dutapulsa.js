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

function getFinalJson(raw_json) {
	let arrayToMap = [],
		copy = [];
	let i = 1;
	for (let value of raw_json) {
		if (value['1'].toUpperCase() == 'KODEVOC') { //
			//break;
		} else {
			//delete value['2']
			if (value['2'] == undefined) {
				//i -= 1
				value['2'] = i;
				copy.push(value)
			} else {
				arrayToMap.push(value);
				i += 1
			}
		}
	}

	let mappedArray = arrayToMap.map(function(item) { return [item['1'], item['3'].replace(".", "")]; });

	let indosat = [],
		indosat_jatim = [],
		axis = [],
		xl = [],
		xl_jatim = [],
		xl_jabotabek = [],
		three = [],
		tsel = [],
		tsel_jatim = [],
		tsel_jabar = [],
		tsel_jabotabek = [],
		tsel_jateng = [],
		tsel_kalimantan = [],
		tsel_sumbagsel = [],
		tsel_sumbagteng = [],
		tsel_sumbagut = [],
		tsel_balinusra = [];

	for (let i = 0; i < copy.length - 1; i++) {
		let regional = copy[i]['1'];
		let start_array = parseInt(copy[i]['2']) - 1;
		let end_array = parseInt(copy[i + 1]['2']) - 1
		if (regional == 'IM3' || regional == 'ISATPROMO') {
			indosat.push(mappedArray.slice(start_array, end_array))
		} else if (regional == 'ISATSDA') {
			indosat_jatim.push(mappedArray.slice(start_array, end_array))
		} else if (regional == 'XLSDA' || regional == 'XLJATIM') {
			xl_jatim.push(mappedArray.slice(start_array, end_array))
		} else if (regional == 'XLJABOTABEK') {
			xl_jabotabek.push(mappedArray.slice(start_array, end_array))
		} else if (regional == 'XLBEBAS') {
			xl.push(mappedArray.slice(start_array, end_array))
		} else if (regional == 'TSELSIDOARJO' || regional == 'TSELJATIM') {
			tsel_jatim.push(mappedArray.slice(start_array, end_array))
		} else if (regional == 'TSELJABAR') {
			tsel_jabar.push(mappedArray.slice(start_array, end_array))
		} else if (regional == 'TSELJABOTABEK') {
			tsel_jabotabek.push(mappedArray.slice(start_array, end_array))
		} else if (regional == 'TSELJATENG') {
			tsel_jateng.push(mappedArray.slice(start_array, end_array))
		} else if (regional == 'TSELKALIMANTAN') {
			tsel_kalimantan.push(mappedArray.slice(start_array, end_array))
		} else if (regional == 'TSELSUMBAGSEL') {
			tsel_sumbagsel.push(mappedArray.slice(start_array, end_array))
		} else if (regional == 'TSELSUMBAGTENG') {
			tsel_sumbagteng.push(mappedArray.slice(start_array, end_array))
		} else if (regional == 'TSELSUMBAGUT') {
			tsel_sumbagut.push(mappedArray.slice(start_array, end_array))
		} else if (regional == 'TSELBALINUSRA') {
			tsel_balinusra.push(mappedArray.slice(start_array, end_array))
		} else if (regional == 'SIMPATI') {
			tsel.push(mappedArray.slice(start_array, end_array))
		} else if (regional == 'THREE' || regional == 'THREEAND') {
			three.push(mappedArray.slice(start_array, end_array))
		} else if (regional == 'AXIS') {
			axis.push(mappedArray.slice(start_array, end_array))
		}
	}
	let final_json = {
		indosat: fix_array(indosat),
		indosat_jatim: fix_array(indosat_jatim),
		xl: fix_array(xl),
		xl_jatim: fix_array(xl_jatim),
		xl_jabotabek: fix_array(xl_jabotabek),
		three: fix_array(three),
		tsel: fix_array(tsel),
		tsel_jatim: fix_array(tsel_jatim),
		tsel_jabar: fix_array(tsel_jabar),
		tsel_jabotabek: fix_array(tsel_jabotabek),
		tsel_jateng: fix_array(tsel_jateng),
		tsel_kalimantan: fix_array(tsel_kalimantan),
		tsel_sumbagsel: fix_array(tsel_sumbagsel),
		tsel_sumbagteng: fix_array(tsel_sumbagteng),
		tsel_sumbagut: fix_array(tsel_sumbagut),
		tsel_balinusra: fix_array(tsel_balinusra),
		axis: fix_array(axis)
	}
	return final_json;
}

module.exports = {
	createHarga: (raw_json, args, callback) => {
		let json = getFinalJson(raw_json[0]);
		// end generate data final json

		let array_json = new Array(17);
		let provider_id = '',
			penyedia_id = '1'; //Duta
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
					operator = json.tsel_jatim
					provider_id = 5
					break
				case 5:
					operator = json.tsel_jabar
					provider_id = 6
					break
				case 6:
					operator = json.tsel_jabotabek
					provider_id = 7
					break
				case 7:
					operator = json.tsel_jateng
					provider_id = 8
					break
				case 8:
					operator = json.tsel_kalimantan
					provider_id = 9
					break
				case 9:
					operator = json.tsel_sumbagsel
					provider_id = 10
					break
				case 10:
					operator = json.tsel_sumbagteng
					provider_id = 11
					break
				case 11:
					operator = json.tsel_sumbagut
					provider_id = 12
					break
				case 12:
					operator = json.tsel_balinusra
					provider_id = 13
					break
				case 13:
					operator = json.xl_jatim
					provider_id = 14
					break
				case 14:
					operator = json.xl_jabotabek
					provider_id = 15
					break
				case 15:
					operator = json.indosat_jatim
					provider_id = 16
					break
				case 16:
					operator = json.axis
					provider_id = 17
					break
			}
			async.forEachOf(operator, function(value, key, callback) {
				//sequelize.quey().then().catch()
				let kode = value[0],
					harga = parseInt(value[1]),
					kode_translate = kode.replace(/[a-zA-Z]/g, "");

				const masterHarga = args.dependencies.models('masterHarga')(args.sequelize.parent, args.sequelize.child);
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
				callback(null, 'Sukses Grab dr web DUTA Pulsa')
			}
		})
	},

};