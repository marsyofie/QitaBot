'use strict';
const async = require('async');
//const config = require('../../.env');
const moment = require('moment');
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
        harga = value.harga.replace(".", "");

        if (kode == 'TMA4') {
            // nothing happen
        } else {
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

    raw_json.pulsa.forEach(value => {

        if (value.nameoperator.includes('TELKOMSEL REGULER') || value.nameoperator.includes('TELKOMSEL SUPER PROMO')) {
            json.tsel = [...json.tsel, ...getHarga(value.data)];
        } else if (value.nameoperator.includes('05.INDOSAT') || value.nameoperator.includes('SUPER PROMO INDOSAT')) {
            json.indosat = [...json.indosat, ...getHarga(value.data)]
        } else if (value.nameoperator.includes('06.XL') || value.nameoperator.includes('SUPER PROMO XL')) {
            json.xl = [...json.xl, ...getHarga(value.data)]
        } else if (value.nameoperator.includes('07.AXIS') || value.nameoperator.includes('SUPER PROMO AXIS')) {
            json.axis = [...json.axis, ...getHarga(value.data)]
        } else if (value.nameoperator.includes('08.THREE')) {
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
            penyedia_id = '2'; // TOPINDO
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
                    console.log(err)
                    callback(err.message)
                })
            },
            function(token, callback) {
                const request = require('request');
                var options = {
                    'method': 'POST',
                    'url': 'https://topindo-warehouse.id:9997/api/apps/transaction/pay',
                    'headers': {
                        'Content-Type': 'application/json',
                        'x-access-token': token,
                        'topindosecret': process.env.TOPINDO_SECRET,
                        'User-Agent': 'okhttp/3.12.1',
                        'Accept-Encoding': 'gzip, deflate'
                    },
                    body: JSON.stringify({
                        "uuid": process.env.UUID_TOPINDO,
                        "productCode": kode,
                        "phone": no_hp,
                        "sendTo": "",
                        "type": "0",
                        "pin": pin,
                        "counter": ""
                    })
                };

                request(options, function(error, response) {
                    if (error) return callback(error);
                    if (response.body.status == '200') return callback(null, response.body.values.message)
                    callback(JSON.stringify(response.body));
                });
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