'use strict';
const async = require('async');
const moment = require('moment');
const request = require('request');

function sortAndGetArray(list, provider) {
    let sorting = list.sort((a, b) => { return a[1] - b[1] })
    let result = [];

    switch (provider) {
        case 'INDOSAT':
        case 'AXIS':
        case 'XL REGULER':
            for (let i = 0; i < 2; i++) {
                result.push(sorting[i]);
            }
            break;
        case 'TELKOMSEL':
            for (let i = 0; i < 5; i++) {
                result.push(sorting[i]);
            }
            break;
        case 'THREE':
            for (let i = 0; i < 7; i++) {
                result.push(sorting[i]);
            }
            break;
    }


    return result;
}

function getHarga(list) {
    return list.map(el => { return [el.kodeproduk, el.harga] })
}

function getFinalJson(raw_json) {
    //console.log(raw_json.aaData)
    let json = {};
    json.tsel = [];
    json.indosat = [];
    json.axis = [];
    json.xl = [];
    json.three = [];

    raw_json.pulsa.forEach(value => {
        // let kode = value.data.kodeproduk,
        // 	harga = parseInt(value.data.harga);

        // console.log(value.namaoperator)
        switch (value.namaoperator.toUpperCase()) {
            case 'AXIS':
                json.axis = getHarga(value.data)
                break;
            case 'INDOSAT':
                json.indosat = getHarga(value.data);
                break;
            case 'TELKOMSEL':
                json.tsel = getHarga(value.data);
                break;
            case 'THREE':
                json.three = getHarga(value.data);
                break;
            case 'XL REGULER':
                json.xl = getHarga(value.data);
                break;
        }
    })
    json.tsel = sortAndGetArray(json.tsel, 'TELKOMSEL')
    json.indosat = sortAndGetArray(json.indosat, 'INDOSAT')
    json.axis = sortAndGetArray(json.axis, 'AXIS')
    json.xl = sortAndGetArray(json.xl, 'XL REGULER')
    json.three = sortAndGetArray(json.three, 'THREE')

    return json;
}

module.exports = {
    createHarga: (json, args, callback) => {
        // get final json
        json = getFinalJson(json);

        var array_json = new Array(5);
        var provider_id = '',
            penyedia_id = '9'; // TMR
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
        		callback(null, 'Sukses Simpan dari web Report TMR')
        	}
        })
    },
};