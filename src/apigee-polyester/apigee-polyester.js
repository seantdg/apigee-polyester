/* jslint node: true */
'use strict';

var request = require('request');
var async = require('async');
var xpath = require('xpath'),
    dom = require('xmldom').DOMParser;

//var select = require('xpath.js');


function PolicyTester(org, env, proxy, auth) {
    this.org = org;
    this.env = env;
    this.proxy = proxy;
    this.auth = auth;
    this.rev = "";
    this.session = "default";
    this.transactionId = "";
    this.traceObject = {};
}


PolicyTester.prototype.startTraceSession = function(callback) {
    var self = this;
    //Async
    async.waterfall([function(callback) {
        if (!self.rev) {
            request.get({
                    url: "https://api.enterprise.apigee.com/v1/organizations/" + self.org + "/apis/" + self.proxy + "/deployments",
                    headers: {
                        "Authorization": "Basic " + self.auth
                    }
                },
                function(err, resp) {
                    if (err) {
                        return callback(err);
                    }

                    var deployments = JSON.parse(resp.body);

                    deployments.environment.forEach(function(env) {
                        if (env.name === self.env) {
                            self.rev = env.revision[0].name.trim();
                        }
                    });

                    if (!self.rev) {

                        return callback("No Revision Deployed")
                    } else {
                        return callback(null);
                    }
                });
        }
    }, function(callback) {
        request.del({
                url: "https://api.enterprise.apigee.com/v1/organizations/" + self.org + "/environments/" + self.env + "/apis/" + self.proxy +
                    "/revisions/" +
                    self.rev + "/debugsessions/" + self.session,
                headers: {
                    //'Content-Type': "application/x-www-url-form-encoded",
                    'Authorization': "Basic " + self.auth
                }
            },
            function(err, resp) {
                callback(null);
            });
    }, function(callback) {
        request.post({
                url: "https://api.enterprise.apigee.com/v1/organizations/" + self.org + "/environments/" + self.env + "/apis/" + self.proxy +
                    "/revisions/" +
                    self.rev + "/debugsessions?session=" + self.session + "&timeout=120",
                headers: {
                    'Content-Type': "application/x-www-url-form-encoded",
                    'Authorization': "Basic " + self.auth
                }
            },
            function(err, resp) {
                if (err) {
                    return callback(err);
                }

                self.startTraceResponse = resp;
                callback(null, resp);
            });

    }], function(err, result) {
        if (err) {
            callback(err);
        } else {
            callback();
        }
    });
};

var getTraceDataForTransaction = function(callback) {
    //Async
    //1
    request.get({
            url: "https://api.enterprise.apigee.com/v1/organizations/" + this.org + "/environments/" + this.env + "/apis/" + this.proxy +
                "/revisions/ " + this.rev + "/debugsessions/" + this.session + "/data",
            headers: {
                'Authorization': "Basic " + this.auth
            }
        },
        function(err, resp) {
            if (err) {
                return callback(err);
            }

            callback(null, resp);
        });


    //2
    request.get({
            url: "https://api.enterprise.apigee.com/v1/organizations/" + this.org + "/environments/" + this.env + "/apis/" + this.proxy + "/revisions/" +
                this.rev + "/debugsessions/" + this.session + "/data/" + tId,
            headers: {
                "Authorization": "Basic " + this.auth,
                "Accept": "application/xml"
            }
        },
        function(err, resp) {
            if (err) {
                return callback(err);
            }
            self.trace = JSON.parse(resp.body);
            callback(null, trace);
        });
};

PolicyTester.prototype.assertFromTrace = function(path, expectedValue, callback) {
    var self = this;

    async.waterfall([function(callback) {
        if (!self.trace) {
            request.get({
                    url: "https://api.enterprise.apigee.com/v1/organizations/" + self.org + "/environments/" + self.env + "/apis/" + self.proxy +
                        "/revisions/" + self.rev + "/debugsessions/" + self.session + "/data",
                    headers: {
                        'Authorization': "Basic " + self.auth
                    }
                },
                function(err, resp) {
                    if (err) {
                        return callback(err);
                    } else {
                        self.transactionId = JSON.parse(resp.body)[0];
                        callback(null);
                    }
                });
        } else {
            callback(null);
        }
    }, function(callback) {
        if (!self.trace) {
            request.get({
                    url: "https://api.enterprise.apigee.com/v1/organizations/" + self.org + "/environments/" + self.env + "/apis/" + self.proxy +
                        "/revisions/" +
                        self.rev + "/debugsessions/" + self.session + "/data/" + self.transactionId,
                    headers: {
                        "Authorization": "Basic " + self.auth,
                        "Accept": "application/xml"
                    }
                },
                function(err, resp) {
                    if (err) {
                        return callback(err);
                    }
                    self.trace = resp.body;
                    callback(null);
                });
        } else {
            callback(null);
        }
    }], function(err, result) {
        if (err) {
            callback(err);
        } else {
            //xpath
            var doc = new dom().parseFromString(self.trace);
            var result = xpath.select(path, doc).toString();

            if(result == expectedValue) {
                callback();
            }
            else {
                console.log("Result: " + result + " Expected: " + expectedValue);
                callback("Assertion failed");
            }

        }
    });


};
exports.PolicyTester = PolicyTester;
