const async = require('async');
const express = require('express');
const Sequelize = require('sequelize');
const path = require('path');
const bodyParser = require('body-parser')
const methodOverride = require('method-override');
const dependencies = require('./dependencies');
const request = require('axios');
const moment = require('moment');
const app = express();
const routes = dependencies.routes();
require('dotenv/config')

const PORT = process.env.PORT || process.env.SERVER_PORT;
const time_reconnect = 1200000;
const time_reconnect_endpoint = 2 * 60 * 60 * 1000; // 2jam

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

// Main logical service processes.
routes(express, app, {
    dependencies: dependencies,
    sequelize: {
        parent: Sequelize,
        child: sequelize
    }
});

app.listen(PORT, () => {
    let now = moment.tz(moment(), "Asia/Jakarta").format("HH")
    if (now < 17 && now > 7) {
        console.log("BOLEH")
    } else {
        console.log("TIdak BOLEH")
    }
    //console.log(time_reconnect_endpoint)
    console.log(`Listening on ${PORT}`)
})

//auto hit endpoint /
setInterval(function() {
    let config = { timeout: 120000 }
    request.get(process.env.URL_HEROKU, config)
        .then(rows => {
            console.log(rows)
        }).catch(err => {
            console.log(err)
        });
}, time_reconnect);

// //auto hit endpoint /payfazz
setInterval(function() {
    let config = { timeout: 120000 }
    request.get(process.env.URL_HEROKU + 'payfazz', config)
        .then(rows => {
            console.log(rows)
        }).catch(err => {
            console.log(err)
        });
}, time_reconnect_endpoint);

/*
//auto hit endpoint /bukalapak
setInterval(function() {
    let config = { timeout: 120000 }
    request.get(process.env.URL_HEROKU + 'bukalapak', config)
        .then(rows => {
            console.log(rows)
        }).catch(err => {
            console.log(err)
        });
}, time_reconnect_endpoint);*/

/*
//auto hit endpoint /topindo
setInterval(function() {
    let config = { timeout: 120000 }
    request.get(process.env.URL_HEROKU + 'topindo', config)
        .then(rows => {
            console.log(rows)
        }).catch(err => {
            console.log(err)
        });
}, time_reconnect_endpoint - 3800000);

//auto hit endpoint /xmltronik
setInterval(function() {
    let config = { timeout: 120000 }
    request.get(process.env.URL_HEROKU + 'xmltronik', config)
        .then(rows => {
            console.log(rows)
        }).catch(err => {
            console.log(err)
        });
}, time_reconnect_endpoint - 2000000);*/