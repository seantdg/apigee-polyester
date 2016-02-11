/* jslint node: true */
'use strict';

module.exports = function() {

    this.Given(/^I trace the request$/, function(callback) {

        this.policyTester.startTraceSession(function(error, response) {
            if (error) {
                callback.fail(error);
            }
            callback();
        });
    });

    this.Then(/^property (.*) should be (.*)$/, function(property, value, callback) {
        this.policyTester.assertFromTrace("//Property[@name='" + property + "']/text()", value, function(error, response) {
            if (error) {
                callback.fail(error);
            }
            callback();
        });
    });
    this.Then(/^policy named (.*) should set the variable (.*) to (.*)$/, function(policy, variable, value, callback) {
        this.policyTester.assertFromTrace("string(//Property[@name='stepDefinition-displayName' and text()='" + policy +
            "']/../../../VariableAccess/Set[@name='" + variable + "']/@value)", value,
            function(error, response) {
                if (error) {
                    callback.fail(error);
                }
                callback();
            });
    });

    this.Then(/^policy named (.*) should read the variable (.*) as (.*)$/, function(policy, variable, value, callback) {
        this.policyTester.assertFromTrace("string(//Property[@name='stepDefinition-displayName' and text()='" + policy +
            "']/../../../VariableAccess/Get[@name='" + variable + "']/@value)", value,
            function(error, response) {
                if (error) {
                    callback.fail(error);
                }
                callback();
            });
    });

};
