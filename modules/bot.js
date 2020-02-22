'use strict';

const async = require('async');
const request = require('axios');
const moment = require('moment');

module.exports = {

    filterSender: (id_sender) => {
        let whitelist = process.env.WHITELIST_ID;
        if (whitelist.indexOf(id_sender) >= 0) {
            return true
        } else {
            return false
        }
    },

    getReport: (args, callback) => {
        let now = moment().format('YYYY-MM-DD')
        let query = `SELECT penyedia_id, a.nama, COUNT(*) as total_perubahan  FROM master_harga LEFT JOIN penyedia a on a.id = master_harga.penyedia_id WHERE updated_at BETWEEN '${now} 00:00:00' and '${now} 23:59:59' GROUP BY penyedia_id;`
        args.sequelize.child.query(query).then(result => {
            let str = ""
            if (result[0].length > 0) {
                result[0].forEach(value => {
                    str += `${value.nama} : ${value.total_perubahan} data\n`
                })
            } else {
                str = 'Tidak ada perubahan'
            }
            callback(null, str);
        }).catch(err => {
            callback(err.message)
        })
    },

    detailReport: (args, callback) => {
        let now = moment().format('YYYY-MM-DD')
        let query = `select kode, a.nama, concat((case WHEN selisih < 0 THEN 'Turun' WHEN selisih = 0 THEN 'Tetap' ELSE 'Naik' END), ' : ',selisih) as ket from master_harga LEFT JOIN penyedia a on a.id = master_harga.penyedia_id where updated_at BETWEEN '${now} 00:00:00' and '${now} 23:59:59' ORDER BY selisih DESC;`
        args.sequelize.child.query(query).then(result => {
            let str = ""
            if (result[0].length > 0) {
                result[0].forEach(value => {
                    str += `${value.kode} : ${value.nama}=>${value.ket}\n`
                })
            } else {
                str = 'Tidak ada perubahan'
            }
            callback(null, str);
        }).catch(err => {
            callback(err.message)
        })
    },

    simpanNomer: (no_hp, id_sender, args, callback) => {
        let tools_bot = args.dependencies.modules('tools');
        let hlr_region = args.dependencies.modules('hlr');
        no_hp = no_hp.replace(/ /g, "").replace(/-/g, "").replace("+62", "0");

        if (tools_bot.scanHP(no_hp)) {
            let provider_id = hlr_region.getGeneralHlrRegion(no_hp);

            if (!provider_id) { //
                callback('Tidak Ditemukan di HLR Kami (THREE, AXIS, INDOSAT, XL, TELKOMSEL)')
                return
            } else {
                const transaksi = args.dependencies.models('transaksi')(args.sequelize.parent, args.sequelize.child);

                transaksi.create({
                    no_hp: no_hp,
                    provider_id: provider_id,
                    pengirim: id_sender,
                    created_at: moment.tz(moment(), "Asia/Jakarta").format()
                }).then(result => {
                    callback(null, 'Sukses simpan, selanjutnya ketik *nominal.1234*')
                    return
                }).catch(err => {
                    console.log(err)
                    callback(err.message)
                    return
                })
            }
        } else {
            callback('No HP Salah')
            return
        }
    },

    //must upload contact and format nominal.1234
    cekHargaByContact: (msg, args, callback) => {
        const pesan = msg.text.split(".");
        const fromId = msg.from.id;
        let hlr_region = args.dependencies.modules('hlr');
        let tools_bot = args.dependencies.modules('tools');
        let offset = '';

        switch (pesan.length) {
            case 2:
                offset = 0;
                break;
            case 3:
                offset = pesan[2]
                break
        }
        let qq = `call sp_transaksi('${moment.tz(moment(), "Asia/Jakarta").format()}',${pesan[0]},${fromId},${offset})`
        args.sequelize.child.query(qq).then(result => {
            if (result.length > 0) {
                if (result[0].code == '00') { //sukses
                    let no_hp = result[0].hp;
                    let kode = result[0].kode;
                    let harga = result[0].harga;
                    if (!hlr_region.filterIndosatSMS(kode)) {
                        callback('Mohon maaf sistem telah memilih pulsa SMS utk harga termurah dengan provider Indosat, Silahkan konfirmasi dengan ADMIN anda')
                    } else {
                        let reply = tools_bot.replyFormat(result[0].penyedia_id, no_hp, kode, harga)
                        callback(null, reply);
                    }
                } else {
                    callback(result[0].message);
                }
            } else {
                callback('Terjadi Error pada Query anda');
            }
        }).catch(err => {
            callback(err.message);
        })
    },

    //======PAYFAZZ
    payfazz: (args, callback) => {
        let url = 'https://api.payfazz.com/api/v1/recharge/operators/';
        const fungsi_payfazz = args.dependencies.modules('penyedia/payfazz')

        let config = {
            timeout: 120000, //120s
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36',
                'Referer': 'https://www.payfazz.com/'
            }
        }
        request.get(url, config)
            .then(res => {
                fungsi_payfazz.createHarga(res.data, args, (err, result) => {
                    if (err) {
                        callback('PAYFAZZ --> ERROR 2 :\n' + err)
                    } else {
                        callback(null, 'PAYFAZZ --> SUKSES' /*+ result*/ )
                    }
                })
            }).catch(err => {
                callback('PAYFAZZ --> ERROR 1:\n' + err.message)
            });
    },

    //====== testing BUKALAPAK
    bukalapak: (args, callback) => {
        const fungsi_bukalapak = args.dependencies.modules('penyedia/bukalapak')
        let url = 'https://api.bukalapak.com/v2/virtual_credits.json?agent=true';

        let data = {
            gzip: true,
            json: true,
            timeout: 120000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36',
                'Referer': 'https://api.bukalapak.com/',
            }
        }
        request.get(url, data, function(err, response, rows) {
            if (err) {
                callback(err)
                //callback('Endpoint /bukalapak telah di hit dengan error 1:\n' + err.message)
            } else {
                if (rows.status.toLowerCase() == 'ok') {
                    fungsi_bukalapak.createHarga(rows, args, (err, result) => {
                        if (err) {
                            callback('Endpoint /bukalapak telah di hit dengan error 2:\n' + err)
                        } else {
                            callback(null, 'Endpoint /bukalapak telah di hit SUKSES\n' + result)
                        }
                    })
                } else {
                    callback('Error api bukalapak gan')
                }
            }
        })
    },

    //====== TOPINDO
    topindo: (args, callback) => {
        var tokenAPK, tokenWEB;
        async.waterfall([
            function authWeb(callback) {
                let url = 'https://topindo-warehouse.id:9997/api/auth/login';

                let data = {
                    "username": process.env.USERNAME_WEB_TOPINDO,
                    "password": process.env.PASSWORD_WEB_TOPINDO
                }

                let config = {
                    timeout: 120000,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36',
                        'Referer': 'https://topindo-warehouse.id:9997/login',
                        'Accept-Encoding': 'gzip, deflate',
                        'Accept-Language': 'en,en-US;q=0.9,id;q=0.8,ms;q=0.7',
                        'Accept': '*/*',
                        'Origin': 'https://topindo-warehouse.id:9997',
                        'Sec-Fetch-Site': 'same-origin',
                        'Sec-Fetch-Mode': 'cors'
                    }
                }
                request.post(url, data, config)
                    .then(rows => {
                        if (rows.data.status == '200') {
                            tokenWEB = rows.data.values.token;
                            callback(null, rows);
                        } else {
                            callback('TOPINDO --> ERROR 2:\n' + JSON.stringify(rows.data))
                        }
                    })
                    .catch(err => {
                        callback('TOPINDO --> ERROR 1:\n' + err.message)
                    })
            },
            function authAPK(data_web, callback) {
                let url = 'https://topindo-warehouse.id:9997/api/apps/user/login';

                let data = {
                    "uuid": process.env.UUID_TOPINDO,
                    "phone": process.env.PHONE_TOPINDO
                }

                let config = {
                    timeout: 120000,
                    headers: {
                        'User-Agent': 'okhttp/3.12.1',
                        'topindosecret': process.env.TOPINDO_SECRET,
                        'Accept-Encoding': 'gzip, deflate'
                    }
                }
                request.post(url, data, config)
                    .then(rows => {
                        if (rows.data.status == '200') {
                            tokenAPK = rows.data.values.token;
                            callback(null, rows);
                        } else {
                            callback('TOPINDO --> ERROR APK 2:\n' + JSON.stringify(rows.data))
                        }
                    })
                    .catch(err => {
                        callback('TOPINDO --> ERROR APK 1:\n' + err.message)
                    })
            },
            function saveToken(data, callback) {
                let tokenDb = args.dependencies.models('tokenDb')(args.sequelize.parent, args.sequelize.child);
                let query = {
                    token: tokenAPK,
                    updated_at: moment.tz(moment(), "Asia/Jakarta").format()
                }
                let where = {
                    where: { id_server: 'topindo' }
                }
                tokenDb.update(query, where).then(rows => {
                    callback(null, rows)
                }).catch(err => {
                    console.log(err)
                    callback('TOPINDO --> ERROR 3:\n' + err.message)
                })
            },
            function getData(prev_data, callback) {
                let fungsi_topindo = args.dependencies.modules('penyedia/topindo')
                let url = `https://topindo-warehouse.id:9997/api/product`;
                let data = {
                    "date": moment().format('YYYY-MM-DD'),
                    "msisdn": ""
                }
                let config = {
                    timeout: 120000,
                    headers: {
                        'x-access-token': `${tokenWEB}`,
                        'Accept': '*/*',
                        'Origin': 'https://topindo-warehouse.id:9997',
                        'Sec-Fetch-Site': 'same-origin',
                        'Sec-Fetch-Mode': 'cors',
                        'Referer': 'https://topindo-warehouse.id:9997/price-list',
                        'Accept-Encoding': 'gzip, deflate',
                        'Accept-Language': 'en,en-US;q=0.9,id;q=0.8,ms;q=0.7',
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36',
                    }
                }
                request.post(url, data, config)
                    .then(rows => {
                        if (rows.status == '200' && rows.data.status == '200') {
                            fungsi_topindo.createHarga(rows.data.values, args, (err, result) => {
                                if (err) {
                                    callback('TOPINDO --> ERROR 5:\n' + err)
                                } else {
                                    //console.log(result)
                                    callback(null, 'TOPINDO --> SUKSES' /*+ result*/ )
                                }
                            })
                        } else {
                            callback('TOPINDO --> ERROR 6:\n' + JSON.stringify(rows))
                        }
                    }).catch(err => {
                        callback('TOPINDO --> ERROR 4:\n' + err.message)
                    })
            },
        ], function(err, result) {
            if (err) {
                callback(err)
            } else {
                callback(null, result)
            }
        });
    },

    topindoBeliPulsa: (msg, args, callback) => {
        var kode = '',
            no_hp = '',
            pin_topindo = '';
        async.waterfall([
            function(callback) {
                msg = msg.replace("#tpd", "").split(".");

                if (msg.length == 3) {
                    kode = msg[0];
                    no_hp = msg[1];
                    pin_topindo = msg[2];
                    callback(null, true)
                } else {
                    callback('silahkan periksa message anda')
                }
            },
            function(data, callback) {
                const fungsi_topindo = args.dependencies.modules('penyedia/topindo')

                fungsi_topindo.belipulsa(kode, no_hp, pin_topindo, args, (err, result) => {
                    if (err) {
                        callback(err)
                    } else {
                        callback(null, result)
                    }
                })
            },
        ], function(err, result) {
            if (err) {
                console.log(err)
                callback(err)
            } else {
                callback(null, result)
            }
        });
    },

    //====== XML Tronik
    xmltronik: (args, callback) => {
        const scraper = args.dependencies.modules('table_scrapper');
        const fungsi_xmltronik = args.dependencies.modules('penyedia/xmltronik')
        let url = 'http://reportsms.xmltronik.com/harga.js.php?id=b262b9778401ca67f5c64bdb7becbda8cb34a7298eeacbf589551d49ab6b4c535892ff22611f2e98d1b60bc3046cdf67f1cb-59';

        scraper
            .get(url)
            .then(rows => {
                //console.log(rows)
                //callback(rows.length)
                fungsi_xmltronik.createHarga(rows, args, (err, result) => {
                    if (err) {
                        callback('XMLTRONIK --> ERROR 2 :\n' + err)
                    } else {
                        callback(null, 'XMLTRONIK --> SUKSES' /*+ result*/ )
                    }
                })
            }).catch(err => {
                callback('XMLTRONIK --> ERROR 1 :\n' + err.message)
            });
    },

};