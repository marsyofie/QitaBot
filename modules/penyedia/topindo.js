'use strict';
const async = require('async');
//const config = require('../../.env');
const moment = require('moment');
const request = require('request');
const margin = parseInt(process.env.MARGIN_TOPINDO);

function sortArray(list) {
    return list.sort((a, b) => { return a[1] - b[1] })
}

function getHarga(data) {
    let kode,
        harga;
    var hasil = [];

    data.forEach(value => {
        kode = value.kodeproduk;
        harga = value.harga;

        if(kode == 'TMA4'){
        	// nothing happen
        }else{
        	hasil = [...hasil, [kode, harga]]
        }
    })

    return hasil;
}

function getFinalJson(raw_json) {
    //console.log(raw_json.aaData)
    let json = {};
    json.tsel = [];
    json.indosat = [];
    json.axis = [];
    json.xl = [];
    json.three = [];

    /*raw_json.aaData.forEach(value => {
    	let kode = value[2],
    		harga = parseInt(value[3]) + margin;

    	if (value[0].includes('03.TELKOMSEL REGULER') || value[0].includes('02.TELKOMSEL PROMO') || value[0].includes('01.TELKOMSEL SUPER PROMO')) { //|| value[0].includes('02.TELKOMSEL PROMO') || value[0].includes('01.TELKOMSEL SUPER PROMO')
    		json.tsel = [...json.tsel, [kode, harga]]
    	} else if (value[0].includes('05.INDOSAT')) {
    		json.indosat = [...json.indosat, [kode, harga]]
    	} else if (value[0].includes('06.XL')) {
    		json.xl = [...json.xl, [kode, harga]]
    	} else if (value[0].includes('07.AXIS')) {
    		json.axis = [...json.axis, [kode, harga]]
    	} else if (value[0].includes('08.THREE')) {
    		if (!value[2].includes('TMA')) {
    			json.three = [...json.three, [kode, harga]]
    		}
    	}
    })*/

    raw_json.pulsa.forEach(value => {


        if (value.namaoperator.includes('03.TELKOMSEL REGULER') || value.namaoperator.includes('02.TELKOMSEL PROMO') || value.namaoperator.includes('01.TELKOMSEL SUPER PROMO')) { //|| value[0].includes('02.TELKOMSEL PROMO') || value[0].includes('01.TELKOMSEL SUPER PROMO')
            json.tsel = [...json.tsel, ...getHarga(value.data)];
        } else if (value.namaoperator.includes('05.INDOSAT')) {
            json.indosat = [...json.indosat, ...getHarga(value.data)]
        } else if (value.namaoperator.includes('06.XL')) {
            json.xl = [...json.xl, ...getHarga(value.data)]
        } else if (value.namaoperator.includes('07.AXIS')) {
            json.axis = [...json.axis, ...getHarga(value.data)]
        } else if (value.namaoperator.includes('08.THREE')) {
            json.three = [...json.three, ...getHarga(value.data)]
        }
    })

    json.tsel = sortArray(json.tsel)
    json.indosat = sortArray(json.indosat)
    json.axis = sortArray(json.axis)
    json.xl = sortArray(json.xl)
    json.three = sortArray(json.three)

    return json;
}

module.exports = {
    createHarga: (json, args, callback) => {
        // get final json
        json = getFinalJson(json);

        var array_json = new Array(5);
        var provider_id = '',
            penyedia_id = '7'; // TOPINDO
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
                callback(null, 'Sukses Simpan dari web Report TOPINDO Pulsa')
            }
        })
    },

    belipulsa: (kode, no_hp, pin, args, callback) => {
        //var token = '';
        async.waterfall([
            function(callback) {
                const tokenDb = args.dependencies.models('tokenDb')(args.sequelize.parent, args.sequelize.child);
                let query = {
                    where: { id_server: 'topindo' }
                }
                tokenDb.findOne(query).then(result => {
                    if (result) {
                        result = result.toJSON();
                        callback(null, result.token)
                    } else {
                        callback('Token tidak ditemukan')
                    }
                }).catch(err => {
                    callback(err.message)
                })
            },
            function(token, callback) {
                let url = 'http://178.128.91.133:4049/apps/v8/transactions/pay';
                let data = {
                    gzip: true,
                    json: true,
                    timeout: 120000,
                    body: {
                        uuid: process.env.UUID_TOPINDO,
                        kodeproduk: kode,
                        tujuan: no_hp,
                        pin: pin,
                        jenis: "0"
                    },
                    headers: {
                        'authorization': `Bearer ${token}`,
                        'irsauth': process.env.IRS_AUTH_TOPINDO,
                        'User-Agent': 'okhttp/3.10.0',
                    }
                }

                request.post(url, data, function(err, response, rows) {
                    if (err) {
                        switch (err.code) {
                            case 'ESOCKETTIMEOUT':
                                callback(null, 'Transaksi sedang diproses, silahkan tunggu bos.')
                                break;
                            default:
                                callback('Error saat transaksi:\n' + err.message)
                        }
                    } else {
                        if (rows.success) {
                            callback(null, JSON.stringify(rows));
                        } else {
                            callback(JSON.stringify(rows))
                        }
                    }
                })
            },
        ], function(err, result) {
            if (err) {
                callback(`${no_hp}\n${err}`)
            } else {
                callback(null, result)
            }
        });
    },
};