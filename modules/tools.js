'use strict';
const validator = require('validator');
const moment = require('moment');

module.exports = {
	getPropertiesTable: (args, callback) => {
		let query = `SELECT table_schema as "db_name", SUM(data_length + index_length) / 1024 / 1024 as "size" FROM information_schema.tables WHERE table_schema = '${process.env.MYSQL_NAME}' GROUP BY table_schema ORDER BY SUM(data_length + index_length) DESC ;`;
		args.sequelize.child.query(query).then(result => {
			let str = `Nama DB\t: ${result[0][0].db_name}\nSize\t: ${result[0][0].size} MB`
			callback(null, str);
		}).catch(err => {
			callback(err.message)
		})
	},

	checkTime: (unixtime) => {
		let datetime = moment.tz(moment.unix(unixtime).utc(), "Asia/Jakarta").format();
		let now = moment() //.tz(moment(), "Asia/Jakarta").format();

		if (now.diff(datetime, 'minutes') <= 2) { //2 minutes
			return true
		} else {
			return false
		}
	},

	scanHP: (number) => {
		if (!validator.isMobilePhone(number, ['id-ID']) || number.length < 9 || number.length > 13) {
			return false;
		}
		return true;
	},

	replyFormat: (penyedia_id, no_hp, kode, harga) => {
		switch (penyedia_id) {
			case 1:
				return [`Transaksi Via PAYFAZZ dgn pin: ${process.env.PIN_PAYFAZZ}`, `PAYFAZZ : Rp. ${harga}`, no_hp]
				break
			case 2:
				return [`${kode}.${no_hp}.${process.env.PIN_TOPINDO}#tpd`, `QITA CELL : Rp. ${harga}`, 'LANGSUNG DI COPY DI SINI AE MA']
				break
			default:
				return [`Mohon maaf anda belum mendefinisikan fungsi reply`, `Terima kasih`]
		}
	}
};