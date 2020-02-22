'use strict';
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

module.exports = {
	filterHlr: (hp, hlr_region) => {
		return hlr_region.filter(function(item) {
			//console.log(item)
			return hp.indexOf(item) >= 0;
		})
	},

	getHlrRegionDuta: (no_hp) => {
		var kode_operator = no_hp.substr(0, 4);

		if (module.exports.module.exports.filterHlr(kode_operator, operator.indosat).length > 0) { //Indosat
			if (module.exports.filterHlr(no_hp, indosat.jatim).length > 0) { //Indosat Jatim
				return 16
			} else { //Indosat nasional
				return 2
			}
		} else if (module.exports.filterHlr(kode_operator, operator.telkomsel).length > 0) { //Telkomsel
			if (module.exports.filterHlr(no_hp, telkomsel.jatim).length > 0) { //jatim
				return 5
			} else if (module.exports.filterHlr(no_hp, telkomsel.jabar).length > 0) { //jabar
				return 6
			} else if (module.exports.filterHlr(no_hp, telkomsel.jabodetabek).length > 0) { //jabodetabek
				return 7
			} else if (module.exports.filterHlr(no_hp, telkomsel.jateng).length > 0) { //jateng
				return 8
			} else if (module.exports.filterHlr(no_hp, telkomsel.kalimantan).length > 0) { //kalimantan
				return 9
			} else if (module.exports.filterHlr(no_hp, telkomsel.sumbagsel).length > 0) { //sumbagsel
				return 10
			} else if (module.exports.filterHlr(no_hp, telkomsel.sumbagteng).length > 0) { //sumbagteng
				return 11
			} else if (module.exports.filterHlr(no_hp, telkomsel.sumbagut).length > 0) { //sumbagut
				return 12
			} else if (module.exports.filterHlr(no_hp, telkomsel.balinusra).length > 0) { //balinusra
				return 13
			} else { //nasional
				return 4
			}
		} else if (module.exports.filterHlr(kode_operator, operator.xl).length > 0) { //XL
			if (module.exports.filterHlr(no_hp, xl.jatim).length > 0) { //jatim
				return 14
			} else if (module.exports.filterHlr(no_hp, xl.jabodetabek).length > 0) { //jabodetabek
				return 15
			} else { //nasional
				return 3
			}
		} else if (module.exports.filterHlr(kode_operator, operator.three).length > 0) { //Three
			return 1
		} else if (module.exports.filterHlr(kode_operator, operator.axis).length > 0) { //Three
			return 17
		} else {
			return false //not found on hlr
		}
	},

	getGeneralHlrRegion: (no_hp) => {
		var kode_operator = no_hp.substr(0, 4);

		if (module.exports.filterHlr(kode_operator, operator.indosat).length > 0) { //Indosat
			return 2
		} else if (module.exports.filterHlr(kode_operator, operator.telkomsel).length > 0) { //Telkomsel
			return 4
		} else if (module.exports.filterHlr(kode_operator, operator.xl).length > 0) { //XL 
			return 3
		} else if (module.exports.filterHlr(kode_operator, operator.axis).length > 0) { //AXIS
			return 17
		} else if (module.exports.filterHlr(kode_operator, operator.three).length > 0) { //Three
			return 1
		} else {
			return false //not found on hlr
		}
	},

	filterIndosatSMS: (kode) => {
		let indosat_SMS = process.env.INDOSAT_SMS.replace(" ", "").split(",");
		if (indosat_SMS.indexOf(kode) >= 0) return false
		return true
	},

};