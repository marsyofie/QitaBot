'use strict';
const validator = require('validator');
const async = require('async');
const request = require('request');
const moment = require('moment');

// #########################
//      START CONFIG HLR
// #########################
var operator = {
	indosat: process.env.INDOSAT.replace(" ", "").split(","),
	telkomsel: process.env.TELKOMSEL.replace(" ", "").split(","),
	xl: process.env.XL.replace(" ", "").split(","),
	axis: process.env.AXIS.replace(" ", "").split(","),
	three: process.env.THREE.replace(" ", "").split(",")
}

//config.operator;

//operator regional
var indosat = {
	jatim: process.env.HLR_INDOSAT_JATIM.replace(" ", "").split(",")
};
var telkomsel = {
	jatim: process.env.HLR_TELKOMSEL_JATIM.replace(" ", "").split(","),
	jabar: process.env.HLR_TELKOMSEL_JABAR.replace(" ", "").split(","),
	jabodetabek: process.env.HLR_TELKOMSEL_JABODETABEK.replace(" ", "").split(","),
	jateng: process.env.HLR_TELKOMSEL_JATENG.replace(" ", "").split(","),
	kalimantan: process.env.HLR_TELKOMSEL_KALIMANTAN.replace(" ", "").split(","),
	sumbagsel: process.env.HLR_TELKOMSEL_SUMBAGSEL.replace(" ", "").split(","),
	sumbagteng: process.env.HLR_TELKOMSEL_SUMBAGTENG.replace(" ", "").split(","),
	sumbagut: process.env.HLR_TELKOMSEL_SUMBAGUT.replace(" ", "").split(","),
	balinusra: process.env.HLR_TELKOMSEL_BALINUSRA.replace(" ", "").split(","),
};
var xl = {
	jatim: process.env.HLR_XL_JATIM.replace(" ", "").split(","),
	jabodetabek: process.env.HLR_XL_JABODETABEK.replace(" ", "").split(","),
};
//end operator regional
// #########################
//      END CONFIG HLR
// #########################

// #########################
//        FILTER HLR
// #########################
function filterHlr(hp, hlr_region) {
    return hlr_region.filter(function(item) {
        //console.log(item)
        return hp.indexOf(item) >= 0;
    })
}

function getHlrRegionDuta(no_hp) {
    var kode_operator = no_hp.substr(0, 4);

    if (filterHlr(kode_operator, operator.indosat).length > 0) { //Indosat
        if (filterHlr(no_hp, indosat.jatim).length > 0) { //Indosat Jatim
            return 16
        } else { //Indosat nasional
            return 2
        }
    } else if (filterHlr(kode_operator, operator.telkomsel).length > 0) { //Telkomsel
        if (filterHlr(no_hp, telkomsel.jatim).length > 0) { //jatim
            return 5
        } else if (filterHlr(no_hp, telkomsel.jabar).length > 0) { //jabar
            return 6
        } else if (filterHlr(no_hp, telkomsel.jabodetabek).length > 0) { //jabodetabek
            return 7
        } else if (filterHlr(no_hp, telkomsel.jateng).length > 0) { //jateng
            return 8
        } else if (filterHlr(no_hp, telkomsel.kalimantan).length > 0) { //kalimantan
            return 9
        } else if (filterHlr(no_hp, telkomsel.sumbagsel).length > 0) { //sumbagsel
            return 10
        } else if (filterHlr(no_hp, telkomsel.sumbagteng).length > 0) { //sumbagteng
            return 11
        } else if (filterHlr(no_hp, telkomsel.sumbagut).length > 0) { //sumbagut
            return 12
        } else if (filterHlr(no_hp, telkomsel.balinusra).length > 0) { //balinusra
            return 13
        } else { //nasional
            return 4
        }
    } else if (filterHlr(kode_operator, operator.xl).length > 0) { //XL
        if (filterHlr(no_hp, xl.jatim).length > 0) { //jatim
            return 14
        } else if (filterHlr(no_hp, xl.jabodetabek).length > 0) { //jabodetabek
            return 15
        } else { //nasional
            return 3
        }
    } else if (filterHlr(kode_operator, operator.three).length > 0) { //Three
        return 1
    } else if (filterHlr(kode_operator, operator.axis).length > 0) { //Three
        return 17
    } else {
        return false //not found on hlr
    }
}

function getHlrRegionIpay(no_hp) {
    var kode_operator = no_hp.substr(0, 4);

    if (filterHlr(kode_operator, operator.indosat).length > 0) { //Indosat
        return 2
    } else if (filterHlr(kode_operator, operator.telkomsel).length > 0) { //Telkomsel
        return 4
    } else if (filterHlr(kode_operator, operator.xl).length > 0) { //XL and axis same on ipay
        return 3
    } else if (filterHlr(kode_operator, operator.axis).length > 0) { //XL and axis same on ipay
        return 3
    } else if (filterHlr(kode_operator, operator.three).length > 0) { //Three
        return 1
    } else {
        return false //not found on hlr
    }
}

function getGeneralHlrRegion(no_hp) {
    var kode_operator = no_hp.substr(0, 4);

    if (filterHlr(kode_operator, operator.indosat).length > 0) { //Indosat
        return 2
    } else if (filterHlr(kode_operator, operator.telkomsel).length > 0) { //Telkomsel
        return 4
    } else if (filterHlr(kode_operator, operator.xl).length > 0) { //XL 
        return 3
    } else if (filterHlr(kode_operator, operator.axis).length > 0) { //AXIS
        return 17
    } else if (filterHlr(kode_operator, operator.three).length > 0) { //Three
        return 1
    } else {
        return false //not found on hlr
    }
}

function filterIndosatSMS(kode) {
    let indosat_SMS =  process.env.INDOSAT_SMS.replace(" ", "").split(",");
    if (indosat_SMS.indexOf(kode) >= 0) return false
    return true
}
// #########################
//      END FILTER HLR
// #########################

function scanHP(number) {
    if (!validator.isMobilePhone(number, ['id-ID']) || number.length < 9 || number.length > 13) {
        return false;
    }
    return true;
}

function replyFormat(penyedia_id, no_hp, kode, harga) {
    switch (penyedia_id) {
        case 1:
            return [`I.${kode}.${no_hp}.${process.env.PIN_DUTA}`, `DUTA PULSA : Rp. ${harga}`]
            break
        case 2:
            return [`${kode}.${no_hp}.${process.env.PIN_IPAY}`, `IPAY : Rp. ${harga}`]
            break
        case 3:
            return [`Transaksi Via PAYFAZZ dgn pin: ${process.env.PIN_PAYFAZZ}`, `PAYFAZZ : Rp. ${harga}`, no_hp]
            break
        case 4:
            return [`${kode}.${no_hp}.${process.env.PIN_PORTAL}`, `PORTAL PULSA : Rp. ${harga}`]
            break
        case 5:
            return [`${kode}.${no_hp}.${process.env.PIN_ANDRO}`, `ANDRO RELOAD : Rp. ${harga}`]
            break
        case 6:
            return [`Transaksi Via BUKALAPAK`, `BUKALAPAK : Rp. ${harga}`, no_hp]
            break
        case 7:
            //kode = kode.replace(/[a-zA-Z]/g, "");
            //return [`${kode}.${no_hp}.${process.env.PIN_TOPINDO}`, `TRX2009 : Rp. ${harga}`] // topindo
            return [`${kode}.${no_hp}.${process.env.PIN_TOPINDO}#tpd`, `QITA CELL : Rp. ${harga}`, 'LANGSUNG DI COPY DI SINI AE MA']
            break
        case 8:
            // return [`${kode}.${no_hp}.${process.env.PIN_XMLTRONIK}`, `centerxml0Bot : Rp. ${harga}`]
            return [`${kode}.${no_hp}.${process.env.PIN_XMLTRONIK}`, `center xml tronik : Rp. ${harga}`, 'DICOPY DI WA CENTER XML TRONIK']
            break
        default:
            return [`Mohon maaf anda belum mendefinisikan fungsi reply`, `Terima kasih`]
    }
}

module.exports = {
    checkTime: (unixtime) => {
        let datetime = moment.tz(moment.unix(unixtime).utc(), "Asia/Jakarta").format();
        let now = moment() //.tz(moment(), "Asia/Jakarta").format();

        if (now.diff(datetime, 'minutes') <= 2) { //2 minutes
            return true
        } else {
            return false
        }
    },

    filterSender: (id_sender) => {
        let whitelist = process.env.WHITELIST_ID;
        if (whitelist.indexOf(id_sender) >= 0) {
            return true
        } else {
            return false
        }
    },

    getPropertiesTable: (args, callback) => {
        let query = `SELECT table_schema as "db_name", SUM(data_length + index_length) / 1024 / 1024 as "size" FROM information_schema.tables WHERE table_schema = 'sql12250629' GROUP BY table_schema ORDER BY SUM(data_length + index_length) DESC ;`;
        args.sequelize.child.query(query).then(result => {
            let str = `Nama DB\t: ${result[0][0].db_name}\nSize\t: ${result[0][0].size} MB`
            callback(null, str);
        }).catch(err => {
            callback(err.message)
        })
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

    // format 5.0834567890 OR 5.083456789.1
    // Disable because terlalu susah
    // cekHarga: (pesan, args, callback) => {
    //     var str_split = pesan.split(".");

    //     if (str_split.length == 2 || str_split.length == 3) {
    //         var kode_translate = str_split[0];
    //         var no_hp = str_split[1].replace(/ /g, "").replace(/-/g, "").replace("+62", "0");

    //         if (scanHP(no_hp)) {
    //             var provider_id_duta = getHlrRegionDuta(no_hp);
    //             //var provider_id_ipay = getHlrRegionIpay(no_hp); //disable because i hate salesman 
    //             let provider_id_payfazz = getGeneralHlrRegion(no_hp)
    //             let provider_id_portal = getGeneralHlrRegion(no_hp)
    //             let provider_id_andro = getGeneralHlrRegion(no_hp)
    //             let provider_id_bukalapak = getGeneralHlrRegion(no_hp)

    //             //if (!provider_id_duta || !provider_id_ipay || !provider_id_payfazz) {
    //             if (!provider_id_duta || !provider_id_portal || !provider_id_payfazz || !provider_id_andro || !provider_id_bukalapak) {
    //                 callback('Tidak Ditemukan di HLR Kami (THREE, AXIS, INDOSAT, XL, TELKOMSEL)')
    //                 return
    //             } else {
    //                 const masterHarga = args.dependencies.models('masterHarga')(args.sequelize.parent, args.sequelize.child);
    //                 let query = {
    //                     //attributes: ['kode', 'harga'],
    //                     order: [
    //                         ['harga', 'ASC']
    //                     ], // Sorts by harga in ascending order
    //                     where: {
    //                         kode_translate: kode_translate,
    //                         $or: [
    //                             /*{provider_id: provider_id_ipay,penyedia_id: 2},*/
    //                             { provider_id: provider_id_duta, penyedia_id: 1 }, { provider_id: provider_id_payfazz, penyedia_id: 3 }, { provider_id: provider_id_portal, penyedia_id: 4 }, { provider_id: provider_id_andro, penyedia_id: 5 }, { provider_id: provider_id_bukalapak, penyedia_id: 6 }
    //                         ]
    //                     }
    //                 }
    //                 if (str_split.length == 3) {
    //                     query.offset = parseInt(str_split[2])
    //                 }
    //                 masterHarga.findOne(query).then(result => {
    //                     if (result) {
    //                         var kode = result.dataValues.kode;
    //                         var harga = result.dataValues.harga;
    //                         if (!filterIndosatSMS(kode)) {
    //                             callback('Mohon maaf sistem telah memilih pulsa SMS utk harga termurah dengan provider Indosat, Silahkan konfirmasi dengan ADMIN anda')
    //                             return
    //                         } else {
    //                             let reply = replyFormat(result.dataValues.penyedia_id, no_hp, kode, harga)
    //                             callback(null, reply);
    //                             return
    //                         }
    //                     } else {
    //                         callback('Tidak Bisa menemukan Data')
    //                         return
    //                     }
    //                 }).catch(err => {
    //                     //console.log(err)
    //                     callback(err.message)
    //                     return
    //                 })
    //             }
    //         } else {
    //             callback('No HP Salah')
    //             return
    //         }
    //     } else {
    //         callback('Input tidak valid, format : *nominal.phone_number*')
    //         return
    //     }
    // },

    simpanNomer: (no_hp, id_sender, args, callback) => {
        no_hp = no_hp.replace(/ /g, "").replace(/-/g, "").replace("+62", "0");

        if (scanHP(no_hp)) {
            let provider_id_duta = getHlrRegionDuta(no_hp);
            //let provider_id_ipay = getHlrRegionIpay(no_hp); //disable because i hate salesman 
            let provider_id_payfazz = getGeneralHlrRegion(no_hp)
            //let provider_id_portal = getGeneralHlrRegion(no_hp)
            let provider_id_andro = getGeneralHlrRegion(no_hp)
            //let provider_id_bukalapak = getGeneralHlrRegion(no_hp)
            let provider_id_topindo = getGeneralHlrRegion(no_hp)
            let provider_id_xmltronik = getHlrRegionIpay(no_hp)

            if (!provider_id_duta || !provider_id_payfazz || !provider_id_andro || !provider_id_topindo || !provider_id_xmltronik) { //
                callback('Tidak Ditemukan di HLR Kami (THREE, AXIS, INDOSAT, XL, TELKOMSEL)')
                return
            } else {
                const transaksi = args.dependencies.models('transaksi')(args.sequelize.parent, args.sequelize.child);

                transaksi.create({
                    no_hp: no_hp,
                    provider_duta: provider_id_duta,
                    //provider_ipay: provider_id_ipay, //disable because i hate salesman 
                    provider_payfazz: provider_id_payfazz,
                    //provider_portal: provider_id_portal,
                    provider_andro: provider_id_andro,
                    //provider_bukalapak: provider_id_bukalapak,
                    provider_topindo: provider_id_topindo,
                    provider_xmltronik: provider_id_xmltronik,
                    pengirim: id_sender,
                    created_at: moment.tz(moment(), "Asia/Jakarta").format()
                }).then(result => {
                    callback(null, 'Sukses simpan, selanjutnya ketik *nominal.1234*')
                    return
                }).catch(err => {
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
        let offset = '';

        switch (pesan.length) {
            case 2:
                offset = 0;
                break;
            case 3:
                offset = pesan[2]
                break
        }
        var qq = `call sp_transaksi('${moment.tz(moment(), "Asia/Jakarta").format()}',${pesan[0]},${fromId},${offset})`
        args.sequelize.child.query(qq).then(result => {
            if (result.length > 0) {
                if (result[0].code == '00') { //sukses
                    let no_hp = result[0].hp;
                    let kode = result[0].kode;
                    let harga = result[0].harga;
                    if (!filterIndosatSMS(kode)) {
                        callback('Mohon maaf sistem telah memilih pulsa SMS utk harga termurah dengan provider Indosat, Silahkan konfirmasi dengan ADMIN anda')
                    } else {
                        let reply = replyFormat(result[0].penyedia_id, no_hp, kode, harga)
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

        let data = {
            json: true,
            gzip: true,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36',
                'Referer': 'http://178.128.91.133:4049/'
            }
        }
        request.get(url, data, function(err, response, rows) {
            if (err) {
                callback('Endpoint /payfazz telah di hit dengan error 1 :\n' + err.message)
            } else {
                fungsi_payfazz.createHarga(rows, args, (err, result) => {
                    if (err) {
                        callback('Endpoint /payfazz telah di hit dengan error 2 :\n' + err)
                    } else {
                        callback(null, 'Endpoint /payfazz telah di hit SUKSES\n' + result)
                    }
                })
            }
        })
    },

    //======PORTAL PULSA
    portal: (args, callback) => {
        const scraper = args.dependencies.modules('table_scrapper');
        const fungsi_portal = args.dependencies.modules('penyedia/portalpulsa')
        let url = 'https://portalpulsa.com/pulsa-reguler-murah/';
        scraper
            .get(url)
            .then(rows => {
                fungsi_portal.createHarga(rows, args, (err, result) => {
                    if (err) {
                        callback('Endpoint /portalpulsa telah di hit dengan error 2 :\n' + err)
                    } else {
                        callback(null, 'Endpoint /portalpulsa telah di hit SUKSES\n' + result)
                    }
                })
            }).catch(err => {
                callback('Endpoint /portalpulsa telah di hit dengan error 1 :\n' + err.message)
            });
    },

    //====== DUTA PULSA
    duta: (args, callback) => {
        const scraper = args.dependencies.modules('table_scrapper');
        const fungsi_duta = args.dependencies.modules('penyedia/dutapulsa')
        let url = 'http://180.250.182.114:9999/rego/source.php';
        scraper
            .get(url)
            .then(rows => {
                //console.log(rows)
                fungsi_duta.createHarga(rows, args, (err, result) => {
                    if (err) {
                        callback('Endpoint /dutapulsa telah di hit dengan error 2 :\n' + err)
                    } else {
                        callback(null, 'Endpoint /dutapulsa telah di hit SUKSES\n' + result)
                    }
                })
            }).catch(err => {
                callback('Endpoint /dutapulsa telah di hit dengan error 1 :\n' + err.message)
            });
    },

    //====== ANDRO RELOAD
    andro: (args, callback) => {
        const scraper = args.dependencies.modules('table_scrapper');
        const fungsi_androreload = args.dependencies.modules('penyedia/androreload')
        let url = 'http://report.androreload.net/harga.js.php?cttn=REGULAR';
        scraper
            .get(url)
            .then(rows => {
                fungsi_androreload.createHarga(rows, args, (err, result) => {
                    if (err) {
                        callback('Endpoint /androreload telah di hit dengan error 2 :\n' + err)
                    } else {
                        callback(null, 'Endpoint /androreload telah di hit SUKSES\n' + result)
                    }
                })
            }).catch(err => {
                callback('Endpoint /androreload telah di hit dengan error 1 :\n' + err.message)
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
        var token = '';
        async.waterfall([
            function auth(callback) {
                let url = 'http://178.128.91.133:4049/auth/authenticate';
                let data = {
                    gzip: true,
                    json: true,
                    timeout: 120000,
                    form: {
                        "username": process.env.USERNAME_WEB_TOPINDO,
                        "password": process.env.PASSWORD_WEB_TOPINDO
                    },
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36',
                        'Referer': 'http://178.128.91.133:4049/'
                    }
                }
                request.post(url, data, function(err, response, rows) {
                    if (err) {
                        //callback(err.message)
                        callback('Endpoint /topindo telah di hit dengan error 1:\n' + err.message)
                    } else {
                        if (rows.success) {
                            token = rows.token;
                            callback(null, rows);
                        } else {
                            callback('Endpoint /topindo telah di hit dengan error 2:\n' + JSON.stringify(rows))
                        }
                    }
                })
            },
            function saveToken(data, callback) {
                let tokenDb = args.dependencies.models('tokenDb')(args.sequelize.parent, args.sequelize.child);
                let query = {
                    token: token,
                    updated_at: moment.tz(moment(), "Asia/Jakarta").format()
                }
                let where = {
                    where: { id_server: 'topindo' }
                }
                tokenDb.update(query, where).then(rows => {
                    callback(null, token)
                }).catch(err => {
                    callback(err.message)
                })
            },
            function getData(prev_data, callback) {
                let fungsi_topindo = args.dependencies.modules('penyedia/topindo')
                var now = Date.now();
                let url = `http://178.128.91.133:4049/api/pricelist?sEcho=1&iColumns=6&sColumns=%2C%2C%2C%2C%2C&iDisplayStart=0&iDisplayLength=-1&mDataProp_0=0&sSearch_0=&bRegex_0=false&bSearchable_0=true&bSortable_0=false&mDataProp_1=1&sSearch_1=&bRegex_1=false&bSearchable_1=true&bSortable_1=false&mDataProp_2=2&sSearch_2=&bRegex_2=false&bSearchable_2=true&bSortable_2=false&mDataProp_3=3&sSearch_3=&bRegex_3=false&bSearchable_3=true&bSortable_3=false&mDataProp_4=4&sSearch_4=&bRegex_4=false&bSearchable_4=true&bSortable_4=false&mDataProp_5=5&sSearch_5=&bRegex_5=false&bSearchable_5=true&bSortable_5=false&sSearch=&bRegex=false&iSortCol_0=0&sSortDir_0=asc&iSortingCols=1&_=${now}`;
                let data = {
                    gzip: true,
                    json: true,
                    timeout: 120000,
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36',
                        'Referer': 'http://178.128.91.133:4049/daftarharga',
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                }
                request.get(url, data, function(err, response, rows) {
                    if (err) {
                        callback('Endpoint /topindo telah di hit dengan error 3:\n' + err.message)
                    } else {
                        if (rows.success) {
                            fungsi_topindo.createHarga(rows, args, (err, result) => {
                                if (err) {
                                    callback('Endpoint /topindo telah di hit dengan error 5:\n' + err)
                                } else {
                                    //console.log(result)
                                    callback(null, 'Endpoint /topindo telah di hit SUKSES\n' + result)
                                }
                            })
                        } else {
                            callback('Endpoint /topindo telah di hit dengan error 4:\n' + JSON.stringify(rows))
                        }
                    }
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
        let url = 'http://reportsms.xmltronik.com/harga.js.php?lvl=MD&cttn=pulsa';

        scraper
            .get(url)
            .then(rows => {
                //console.log(rows)
                //callback(rows.length)
                fungsi_xmltronik.createHarga(rows, args, (err, result) => {
                    if (err) {
                        callback('Endpoint /xmltronik telah di hit dengan error 2 :\n' + err)
                    } else {
                        callback(null, 'Endpoint /xmltronik telah di hit SUKSES\n' + result)
                    }
                })
            }).catch(err => {
                callback('Endpoint /xmltronik telah di hit dengan error 1 :\n' + err.message)
            });
    },

    //====== mobile phone banking
    mpb: (args, callback) => {
        const scraper = args.dependencies.modules('table_scrapper');
        const fungsi_mpb = args.dependencies.modules('penyedia/mobilephonebanking')
        let url = 'http://mpb.cekreport.com/harga.js.php?type=&lvl=M&up=10&cttn=prepaid';

        scraper
            .get(url)
            .then(rows => {
                //console.log(rows)
                //callback(rows.length)
                fungsi_mpb.createHarga(rows, args, (err, result) => {
                    if (err) {
                        callback('Endpoint /mpb telah di hit dengan error 2 :\n' + err)
                    } else {
                        callback(null, 'Endpoint /mpb telah di hit SUKSES\n' + result)
                    }
                })
            }).catch(err => {
                callback('Endpoint /mpb telah di hit dengan error 1 :\n' + err.message)
            });
    },
};