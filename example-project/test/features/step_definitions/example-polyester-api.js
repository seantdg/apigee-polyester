/* jslint node: true */
'use strict';

var apickli = require('apickli');
var apigeePolyester = require('apigee-polyester');
var sleep = require('sleep');

module.exports = function() {
	// cleanup before every scenario
	this.Before(function(scenario, callback) {
		this.apickli = new apickli.Apickli('http', '{host name}');
        this.policyTester = new apigeePolyester.PolicyTester('{org}', '{env}', '{proxy}', '{auth}');
		callback();
	});

	this.Given(/^I wait (\d+) seconds$/, function (secs, callback) {
        sleep.sleep(Number(secs));
        callback();
    });

};
