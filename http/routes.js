module.exports = (express, app, args) => {
    var fungsi_bot = args.dependencies.modules('bot');
    const async = require('async');
    const moment = require('moment');
    const TelegramBot = require('node-telegram-bot-api');
    // replace the value below with the Telegram token you receive from @BotFather
    const token = process.env.TOKEN;
    // Create a bot that uses 'polling' to fetch new updates
    const bot = new TelegramBot(token, { polling: true });

    const { InlineKeyboard, ReplyKeyboard, ForceReply } = require('telegram-keyboard-wrapper');
    const ik = new InlineKeyboard();
    ik
        .addRow({ text: "Duta Pulsa", callback_data: "dutapulsa" }, { text: "XML Tronik", callback_data: "xmltronik" })
        .addRow({ text: "Andro Reload", callback_data: "androreload" }, { text: "Bukalapak", callback_data: "bukalapak" })
        .addRow({ text: "Payfazz", callback_data: "payfazz" }, { text: "Topindo", callback_data: "topindo" })
        .addRow({ text: "TMR", callback_data: "TMR" }, { text: "under construction", callback_data: "under_construction" })
        .addRow({ text: "Get Report", callback_data: "getreport" }, { text: "Get DB", callback_data: "db" }, { text: "Detail Report", callback_data: "detailreport" }, );

    app.get('/', (request, response) => {
        bot.sendMessage(235462443, 'Endpoint / telah di hit')
        return response.status(200).send({
            message: "It's Work"
        });
    });
    /*    app.post('/ipay', (req, res) => {
            var json = req.body;
            //console.log(json)

            fungsi_bot.createHargaIpay(json, args, (err, result) => {
                if (err) {
                    bot.sendMessage(235462443, 'Endpoint /ipay telah di hit dengan error ' + err)
                    res.json({ message: err })
                } else {
                    bot.sendMessage(235462443, 'Endpoint /ipay telah di hit SUKSES\n' + result)
                    res.json({ message: result })
                }

            })
        })*/
    app.get('/duta', (req, res) => {
        fungsi_bot.duta(args, (err, result) => {
            if (err) {
                bot.sendMessage(235462443, err)
                res.status(500).json(err)
            } else {
                bot.sendMessage(235462443, result)
                res.json(result)
            }
        });
    })

    app.get('/portalpulsa', (req, res) => {
        fungsi_bot.portal(args, (err, result) => {
            if (err) {
                bot.sendMessage(235462443, err)
                res.status(500).json(err)
            } else {
                bot.sendMessage(235462443, result)
                res.json(result)
            }
        });
    })

    app.get('/payfazz', (req, res) => {
        fungsi_bot.payfazz(args, (err, result) => {
            if (err) {
                bot.sendMessage(235462443, err)
                res.status(500).json(err)
            } else {
                bot.sendMessage(235462443, result)
                res.json(result)
            }
        });
    })

    app.get('/androreload', (req, res) => {
        fungsi_bot.andro(args, (err, result) => {
            if (err) {
                bot.sendMessage(235462443, err)
                res.status(500).json(err)
            } else {
                bot.sendMessage(235462443, result)
                res.json(result)
            }
        });
    })

    app.get('/bukalapak', (req, res) => {
        fungsi_bot.bukalapak(args, (err, result) => {
            if (err) {
                bot.sendMessage(235462443, err)
                res.status(500).json(err)
            } else {
                bot.sendMessage(235462443, result)
                res.json(result)
            }
        });
    })

    app.get('/topindo', (req, res) => {
        fungsi_bot.topindo(args, (err, result) => {
            if (err) {
                bot.sendMessage(235462443, err)
                res.status(500).json(err)
            } else {
                bot.sendMessage(235462443, result)
                res.json(result)
            }
        });
    })

    app.get('/xmltronik', (req, res) => {
        fungsi_bot.xmltronik(args, (err, result) => {
            if (err) {
                bot.sendMessage(235462443, err)
                res.status(500).json(err)
            } else {
                bot.sendMessage(235462443, result)
                res.json(result)
            }
        });
    })

    app.get('/tmr', (req, res) => {
        fungsi_bot.tmr(args, (err, result) => {
            if (err) {
                bot.sendMessage(235462443, err)
                res.status(500).json(err)
            } else {
                bot.sendMessage(235462443, result)
                res.json(result)
            }
        });
    })

    //===========================================
    //===================BOT QITA================
    //===========================================

    // transaksi nominal.hp OR nominal.hp.1 (offset 1)
    /*    bot.onText(/(^\d{1,3}?\.(\d{9,13})?\.(\d{1,1})$)|(^\d{1,3}?\.(\d{9,13})$)/g, (msg) => {
            const chatId = msg.chat.id;
            const fromId = msg.from.id;
            const unixtime = msg.date;
            const pesan = msg.text;

            if (fungsi_bot.filterSender(fromId)) {
                if (fungsi_bot.checkTime(unixtime)) { // check time
                    fungsi_bot.cekHarga(pesan, args, (err, result) => {
                        if (err) {
                            bot.sendMessage(chatId, 'Error Bos')
                            bot.sendMessage(chatId, err)
                        } else {
                            bot.sendMessage(chatId, result[1])
                            bot.sendMessage(chatId, result[0])
                            if (result.length == 3) bot.sendMessage(chatId, result[2])
                        }
                    })
                } else {
                    bot.sendMessage(chatId, 'Waktu sudah kadaluarsa, tidak akan di proses');
                }
            } else {
                bot.sendMessage(chatId, 'Hello stranger \u{1F64F}')
            }
        });*/

    bot.onText(/help/i, msg => {
        const chatId = msg.chat.id;
        const fromId = msg.from.id;
        const unixtime = msg.date;
        if (fungsi_bot.filterSender(fromId)) {
            if (fungsi_bot.checkTime(unixtime)) { //check time
                bot.sendMessage(chatId, "Silahkan pilih :", ik.export());
            } else {
                bot.sendMessage(chatId, 'Waktu sudah kadaluarsa, tidak akan di proses');
            }
        } else {
            bot.sendMessage(chatId, 'Hello stranger \u{1F64F}')
        }
    });

    bot.on("callback_query", query => {
        //console.log(query)
        const chatId = query.message.chat.id;
        if (query.data == 'dutapulsa') {
            bot.answerCallbackQuery(query.id, { text: "Silahkan tunggu!" })
                .then(function() {
                    // bot.sendMessage(query.from.id, "Proses pengambilan data Duta Pulsa");
                    fungsi_bot.duta(args, (err, result) => {
                        //fungsi_bot.tesduta(args, (err, result) => {
                        if (err) {
                            bot.sendMessage(chatId, 'GAGAL')
                            bot.sendMessage(chatId, err)
                        } else {
                            bot.sendMessage(chatId, result)
                        }
                    });
                });
        } else if (query.data == 'portalpulsa') {
            bot.answerCallbackQuery(query.id, { text: "Silahkan tunggu!" })
                .then(function() {
                    // bot.sendMessage(query.from.id, "Proses pengambilan data Portal Pulsa");
                    // fungsi_bot.portal(args, (err, result) => {
                    //     if (err) {
                    //         bot.sendMessage(chatId, 'GAGAL')
                    //         bot.sendMessage(chatId, err)
                    //     } else {
                    //         bot.sendMessage(chatId, result)
                    //     }
                    // });
                    bot.sendMessage(chatId, "DISABLE FITUR")
                });
        } else if (query.data == 'androreload') {
            bot.answerCallbackQuery(query.id, { text: "Silahkan tunggu!" })
                .then(function() {
                    // bot.sendMessage(query.from.id, "Proses pengambilan data Andro Reload");
                    fungsi_bot.andro(args, (err, result) => {
                        if (err) {
                            bot.sendMessage(chatId, 'GAGAL')
                            bot.sendMessage(chatId, err)
                        } else {
                            bot.sendMessage(chatId, result)
                        }
                    });
                });
        } else if (query.data == 'bukalapak') {
            bot.answerCallbackQuery(query.id, { text: "Silahkan tunggu!" })
                .then(function() {
                    // bot.sendMessage(query.from.id, "Proses pengambilan data Bukalapak");
                    // fungsi_bot.bukalapak(args, (err, result) => {
                    //     if (err) {
                    //         bot.sendMessage(chatId, 'GAGAL')
                    //         bot.sendMessage(chatId, err)
                    //     } else {
                    //         bot.sendMessage(chatId, result)
                    //     }
                    // });
                    bot.sendMessage(chatId, "DISABLE FITUR")
                });
        } else if (query.data == 'payfazz') {
            bot.answerCallbackQuery(query.id, { text: "Silahkan tunggu!" })
                .then(function() {
                    // bot.sendMessage(query.from.id, "Proses pengambilan data Payfazz");
                    fungsi_bot.payfazz(args, (err, result) => {
                        if (err) {
                            bot.sendMessage(chatId, 'GAGAL')
                            bot.sendMessage(chatId, err)
                        } else {
                            bot.sendMessage(chatId, result)
                        }
                    });
                });
        } else if (query.data == 'topindo') {
            bot.answerCallbackQuery(query.id, { text: "Silahkan tunggu!" })
                .then(function() {
                    // bot.sendMessage(query.from.id, "Proses pengambilan data Payfazz");
                    fungsi_bot.topindo(args, (err, result) => {
                        if (err) {
                            bot.sendMessage(chatId, 'GAGAL')
                            bot.sendMessage(chatId, err)
                        } else {
                            bot.sendMessage(chatId, result)
                        }
                    });
                });
        } else if (query.data == 'xmltronik') {
            bot.answerCallbackQuery(query.id, { text: "Silahkan tunggu!" })
                .then(function() {
                    // bot.sendMessage(query.from.id, "Proses pengambilan data XML Tronik");
                    fungsi_bot.xmltronik(args, (err, result) => {
                        if (err) {
                            bot.sendMessage(chatId, 'GAGAL')
                            bot.sendMessage(chatId, err)
                        } else {
                            bot.sendMessage(chatId, result)
                        }
                    });
                });
        } else if (query.data == 'db') {
            bot.answerCallbackQuery(query.id, { text: "Silahkan tunggu!" })
                .then(function() {
                    // bot.sendMessage(query.from.id, "Proses pengambilan data DB");
                    fungsi_bot.getPropertiesTable(args, (err, result) => {
                        if (err) {
                            bot.sendMessage(chatId, 'GAGAL')
                            bot.sendMessage(chatId, err)
                        } else {
                            bot.sendMessage(chatId, result)
                        }
                    })
                });
        } else if (query.data == 'TMR') {
            bot.answerCallbackQuery(query.id, { text: "Silahkan tunggu!" })
                .then(function() {
                    // bot.sendMessage(query.from.id, "Proses pengambilan data DB");
                    fungsi_bot.tmr(args, (err, result) => {
                        if (err) {
                            bot.sendMessage(chatId, 'GAGAL')
                            bot.sendMessage(chatId, err)
                        } else {
                            bot.sendMessage(chatId, result)
                        }
                    })
                });
        } else if (query.data == 'getreport') {
            bot.answerCallbackQuery(query.id, { text: "Silahkan tunggu!" })
                .then(function() {
                    // bot.sendMessage(query.from.id, "Proses pengambilan data DB");
                    fungsi_bot.getReport(args, (err, result) => {
                        if (err) {
                            bot.sendMessage(chatId, 'GAGAL')
                            bot.sendMessage(chatId, err)
                        } else {
                            bot.sendMessage(chatId, result)
                        }
                    })
                });
        } else if (query.data == 'detailreport') {
            bot.answerCallbackQuery(query.id, { text: "Silahkan tunggu!" })
                .then(function() {
                    // bot.sendMessage(query.from.id, "Proses pengambilan data DB");
                    fungsi_bot.detailReport(args, (err, result) => {
                        if (err) {
                            bot.sendMessage(chatId, 'GAGAL')
                            bot.sendMessage(chatId, err)
                        } else {
                            bot.sendMessage(chatId, result)
                        }
                    })
                });
        }
    });

    //transaksi harus upload contact format 10.1234 OR 10.1234.1 (offset 1) 
    bot.onText(/(^\d{1,3}?\.(1234)$)|(^\d{1,3}?\.(1234)?\.\d{1,1}$)/g, msg => {
        const chatId = msg.chat.id;
        const fromId = msg.from.id;
        const unixtime = msg.date;
        const pesan = msg.text.split(".");
        const opts = { parse_mode: 'HTML' };

        if (fungsi_bot.filterSender(fromId)) {
            if (fungsi_bot.checkTime(unixtime)) { //check time
                fungsi_bot.cekHargaByContact(msg, args, (err, result) => {
                    if (err) {
                        bot.sendMessage(chatId, `Error Bos\n==================================\n${err}`, opts)
                        // bot.sendMessage(chatId, err)
                    } else {
                        bot.sendMessage(chatId, result[1])
                        bot.sendMessage(chatId, result[0])
                        if (result.length == 3) bot.sendMessage(chatId, result[2])
                    }
                })
            } else {
                bot.sendMessage(chatId, 'Waktu sudah kadaluarsa, tidak akan di proses');
            }
        } else {
            bot.sendMessage(chatId, 'Hello stranger \u{1F64F}')
        }
    });

    //transaksi format 10.08993626069 akan di upload ke db 
    bot.onText(/^\d{1,3}?\.(\d{9,13})$/g, msg => {
        const chatId = msg.chat.id;
        const fromId = msg.from.id;
        const unixtime = msg.date;
        const pesan = msg.text.split(".");
        const opts = { parse_mode: 'HTML' };

        if (fungsi_bot.filterSender(fromId)) {
            if (fungsi_bot.checkTime(unixtime)) { //check time
                async.waterfall([
                    function(callback) {
                        fungsi_bot.simpanNomer(pesan[1], fromId, args, (err, result) => {
                            if (err) {
                                callback(err)
                            } else {
                                callback(null, result)
                            }
                        })
                    },
                    function(data, callback) {
                        fungsi_bot.cekHargaByContact(msg, args, (err, result) => {
                            if (err) {
                                callback(err)
                            } else {
                                callback(null, result)
                            }
                        })
                    },
                ], function(err, result) {
                    if (err) {
                        bot.sendMessage(chatId, `Error Bos\n==================================\n${err}`, opts)
                        // bot.sendMessage(chatId, err)
                    } else {
                        bot.sendMessage(chatId, result[1])
                        bot.sendMessage(chatId, result[0])
                        if (result.length == 3) bot.sendMessage(chatId, result[2])
                    }
                });
            } else {
                bot.sendMessage(chatId, 'Waktu sudah kadaluarsa, tidak akan di proses');
            }
        } else {
            bot.sendMessage(chatId, 'Hello stranger \u{1F64F}')
        }
    });

    //transaksi format 08993626069
    bot.onText(/^(\d{9,13})$|^([0-9-+]{9,15})$/g, msg => {
        const chatId = msg.chat.id;
        const fromId = msg.from.id;
        const unixtime = msg.date;
        const pesan = msg.text;
        const opts = { parse_mode: 'HTML' };

        if (fungsi_bot.filterSender(fromId)) {
            if (fungsi_bot.checkTime(unixtime)) { //check time
                fungsi_bot.simpanNomer(pesan, fromId, args, (err, result) => {
                    if (err) {
                        bot.sendMessage(chatId, `Error Bos\n==================================\n${err}`, opts);
                        // bot.sendMessage(chatId, err);
                    } else {
                        bot.sendMessage(chatId, result);
                    }
                })
            } else {
                bot.sendMessage(chatId, 'Waktu sudah kadaluarsa, tidak akan di proses');
            }
        } else {
            bot.sendMessage(chatId, 'Hello stranger \u{1F64F}')
        }
    });

    //transaksi via topindo langsung
    bot.onText(/(#tpd)$/g, msg => {
        const chatId = msg.chat.id;
        const fromId = msg.from.id;
        const opts = { parse_mode: 'HTML' };
        if (fungsi_bot.filterSender(fromId)) {
            fungsi_bot.topindoBeliPulsa(msg.text, args, (err, result) => {
                if (err) {
                    bot.sendMessage(chatId, `Error Bos\n==================================\n${err}`, opts)
                    // bot.sendMessage(chatId, err)
                } else {
                    bot.sendMessage(chatId, `Sukses\n==================================\n${result}`, opts)
                    // bot.sendMessage(chatId, result)
                }
            })
        } else {
            bot.sendMessage(chatId, 'Hello stranger \u{1F64F}')
        }
    });

    bot.onText(/format/, msg => {
        const chatId = msg.chat.id;
        const fromId = msg.from.id;
        const opts = { parse_mode: 'HTML' };
        if (fungsi_bot.filterSender(fromId)) {
            bot.sendMessage(chatId, `<b>FORMAT TRANSAKSI</b>\n\n1. nominal.nohp / nominal.nohp.offset\ncontoh :<pre>10.08993626069</pre> atau <pre>10.08993626069.1</pre>\n\n2. <b>upload contact terlebih dahulu atau ketik nomor HP</b> kemudian nominal.1234 / nominal.1234.offset\ncontoh :<pre>10.1234</pre> atau <pre>10.1234.1</pre>\n\n3. Untuk order <b>token PLN</b> via payfazz / bukalapak`, opts)
        } else {
            bot.sendMessage(chatId, 'Hello stranger \u{1F64F}')
        }
    });

    bot.on('contact', msg => {
        const chatId = msg.chat.id;
        const fromId = msg.from.id;
        const phone_number = msg.contact.phone_number;
        const unixtime = msg.date;
        const opts = { parse_mode: 'HTML' };

        if (fungsi_bot.filterSender(fromId) >= 0) {
            if (fungsi_bot.checkTime(unixtime)) {
                fungsi_bot.simpanNomer(phone_number, fromId, args, (err, result) => {
                    if (err) {
                        bot.sendMessage(chatId, `Error Bos\n==================================\n${err}`, opts);
                        // bot.sendMessage(chatId, err);
                    } else {
                        bot.sendMessage(chatId, result);
                    }
                })
            } else {
                bot.sendMessage(chatId, 'Waktu sudah kadaluarsa, tidak akan di proses');
            }
        } else {
            bot.sendMessage(chatId, 'Hello stranger \u{1F64F}')
        }
    })

    //Listen for any kind of message. There are different kinds of
    //messages.
    // bot.on('message', (msg) => {
    //     const chatId = msg.chat.id;
    //     const fromId = msg.from.id;
    //     const unixtime = msg.date
    //     const opts = { parse_mode: 'HTML' };

    //     if (fungsi_bot.filterSender(fromId) >= 0) {
    //         bot.sendMessage(chatId, 'Mohon maaf format tidak dikenali, silahkan ketik <b>format</b>', opts);
    //     } else {
    //         bot.sendMessage(chatId, 'Hello stranger \u{1F64F}')
    //     }

    // });

    bot.on('polling_error', err => {
        const opts = { parse_mode: 'HTML' };
        bot.sendMessage(235462443, `pooling error, silahkan cek fungsi yang anda buat :\ncode = ${err.code}\nmessage = ${err.message}`, opts);
    });

    bot.on('error', err => {
        const opts = { parse_mode: 'HTML' };
        bot.sendMessage(235462443, `ERROR KERAS GAN :\ncode = ${err.code}\nmessage = ${err.message}`, opts);
    });
    //===========================================
    //===================BOT QITA================
    //===========================================
};