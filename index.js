const async = require('async');
const express = require('express');
const Sequelize = require('sequelize');
const path = require('path');
const bodyParser = require('body-parser')
const methodOverride = require('method-override');
const dependencies = require('./dependencies');
const request = require('request');
const moment = require('moment');
const app = express();
const routes = dependencies.routes();
require('dotenv/config')

//Sequelize MYSQL
const Op = Sequelize.Op,
    sequelize = new Sequelize(process.env.MYSQL_NAME, process.env.MYSQL_USER, process.env.MYSQL_PASS, {
        host: process.env.MYSQL_HOST,
        dialect: process.env.MYSQL_DIALECT,
        // dialectOptions: {
        //   useUTC: false //for reading from database
        // },
        //logging: false,
        timezone: '+07:00',
        multipleStatements: true,
        pool: {
            max: process.env.MYSQL_POOL_MAX, //testing
            min: process.env.MYSQL_POOL_MIN,
            idle: 20000,
            acquire: 20000 //testing
        },
        operatorsAliases: {
            $and: Op.and,
            $or: Op.or,
            $eq: Op.eq,
            $gt: Op.gt,
            $lt: Op.lt,
            $lte: Op.lte,
            $like: Op.like
        }
    });
//end Sequelize MYSQL

app.use(express.static(path.join(__dirname, 'public')))
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(methodOverride());
//.set('views', path.join(__dirname, 'views'))
//.set('view engine', 'ejs')

// Main logical service processes.
routes(express, app, {
    dependencies: dependencies,
    sequelize: {
        parent: Sequelize,
        child: sequelize
    }
});

app.listen(process.env.SERVER_PORT, () => {
    let now = moment.tz(moment(), "Asia/Jakarta").format("HH")
    if (now < 17 && now > 7) {
        console.log("BOLEH")
    } else {
        console.log("TIdak BOLEH")
    }
    console.log(process.env.MYSQL_NAME, process.env.MYSQL_USER, process.env.MYSQL_PASS)
    console.log(`Listening on ${process.env.SERVER_PORT}`)
})

//auto hit endpoint /
setInterval(function() {
    let data = { json: true, gzip: true, }
    request.get(process.env.URL_HEROKU, data, function(err, response, rows) {
        if (err) {
            console.log(err)
        } else {
            console.log(rows)
        }
    });
}, parseInt(process.env.TIME_RECONNECT));

//auto hit endpoint /duta
setInterval(function() {
    let data = { json: true, gzip: true, }
    request.get(process.env.URL_HEROKU + 'duta', data, function(err, response, rows) {
        if (err) {
            console.log(err)
        } else {
            console.log(rows)
        }
    });
}, parseInt(process.env.TIME_RECONNECT_ENDPOINT) + 120000);

// //auto hit endpoint /portalpulsa
// // setInterval(function() {
// //     let data = { gzip: true, }
// //     request.get(process.env.URL_HEROKU + 'portalpulsa', data, function(err, response, rows) {
// //         if (err) {
// //             console.log(err)
// //         } else {
// //             console.log(rows)
// //         }
// //     });
// // }, parseInt(process.env.TIME_RECONNECT_ENDPOINT) - 7200000);

//auto hit endpoint /androreload
setInterval(function() {
    let data = { gzip: true, }
    request.get(process.env.URL_HEROKU + 'androreload', data, function(err, response, rows) {
        if (err) {
            console.log(err)
        } else {
            console.log(rows)
        }
    });
}, parseInt(process.env.TIME_RECONNECT_ENDPOINT) - 7400000);

// //auto hit endpoint /payfazz
setInterval(function() {
    let data = { json: true, gzip: true, }
    request.get(process.env.URL_HEROKU + 'payfazz', data, function(err, response, rows) {
        if (err) {
            console.log(err)
        } else {
            console.log(rows)
        }
    });
}, parseInt(process.env.TIME_RECONNECT_ENDPOINT));

// //auto hit endpoint /bukalapak
// // setInterval(function() {
// //     let data = { json: true, gzip: true, }
// //     request.get(process.env.URL_HEROKU + 'bukalapak', data, function(err, response, rows) {
// //         if (err) {
// //             console.log(err)
// //         } else {
// //             console.log(rows)
// //         }
// //     });
// // }, parseInt(process.env.TIME_RECONNECT_ENDPOINT));

// //auto hit endpoint /topindo
setInterval(function() {
    let data = { json: true, gzip: true, }
    request.get(process.env.URL_HEROKU + 'topindo', data, function(err, response, rows) {
        if (err) {
            console.log(err)
        } else {
            console.log(rows)
        }
    });
}, parseInt(process.env.TIME_RECONNECT_ENDPOINT));

// //auto hit endpoint /xmltronik
setInterval(function() {
    let data = { json: true, gzip: true, }
    request.get(url + 'xmltronik', data, function(err, response, rows) {
        if (err) {
            console.log(err)
        } else {
            console.log(rows)
        }
    });
}, parseInt(process.env.TIME_RECONNECT_ENDPOINT));