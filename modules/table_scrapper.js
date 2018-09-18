//copyright to table-scrapper module
'use strict';
var request = require('request');
var xray = require('x-ray')();
var cheerio = require('cheerio');

// temporary...revert if PR to handle duplicate column headers is accepted
//var tabletojson = require('./tabletojson');

function convert(html) {
    var jsonResponse = [];
    var $ = cheerio.load(html);

    $('table').each(function(i, table) {
        var tableAsJson = [];
        // Get column headings
        var columnHeadings = [];
        var alreadySeen = {};
        $(table).find('tr').each(function(i, row) {
            $(row).find('th').each(function(j, cell) {
                var value = $(cell).text().trim();
                var seen = alreadySeen[value];
                if (seen) {
                    suffix = ++alreadySeen[value];
                    columnHeadings[j] = value + '_' + suffix;
                } else {
                    columnHeadings[j] = value;
                    alreadySeen[value] = 1;
                }
            });
        });

        // Fetch each row
        $(table).find('tr').each(function(i, row) {
            var rowAsJson = {};
            $(row).find('td').each(function(j, cell) {
                if (columnHeadings[j]) {
                    rowAsJson[columnHeadings[j]] = $(cell).text().trim();
                } else {
                    rowAsJson[j] = $(cell).text().trim();
                }
            });

            // Skip blank rows
            if (JSON.stringify(rowAsJson) != '{}')
                tableAsJson.push(rowAsJson);
        });

        // Add the table to the response
        if (tableAsJson.length != 0)
            jsonResponse.push(tableAsJson);
    });
    return jsonResponse;
}

module.exports.get = function get(url) {
    return new Promise(function(resolve, reject) {
        request.get(url, function(err, response, body) {
            if (err) {
                return reject(err);
            }
            if (response.statusCode >= 400) {
                return reject(new Error('The website requested returned an error!'));
            }
            xray(body, ['table@html'])(function(conversionError, tableHtmlList) {
                if (conversionError) {
                    return reject(conversionError);
                }
                resolve(tableHtmlList.map(function(table) {
                    // xray returns the html inside each table tag, and tabletojson
                    // expects a valid html table, so we need to re-wrap the table.
                    // Returning the first element in the converted array because
                    // we should only ever be parsing one table at a time within this map.
                    //return tabletojson.convert('<table>' + table + '</table>')[0];
                    return convert('<table>' + table + '</table>')[0];
                }));
            });
        })
    });
};

