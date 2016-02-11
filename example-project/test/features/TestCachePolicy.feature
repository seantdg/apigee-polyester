Feature: Test that the Cache Policy is Executed correctly

Scenario: Invalidate the cache
    Given I trace the request
    When I GET /example-polyester/invalidate
    Then response code should be 200

Scenario: Check that the cache hit is false
	Given I wait 10 seconds
    And I trace the request
    When I GET /example-polyester/test
    Then property responsecache.ResponseCache.cachehit should be false

Scenario: Check that the cache hit is true
    Given I wait 10 seconds
    And I trace the request
    When I GET /example-polyester/test
    Then property responsecache.ResponseCache.cachehit should be true

Scenario: Check that a policy is getting a variable
	Given I trace the request
    When I GET /example-polyester/test
    And policy named ResponseCache should read the variable environment.name as test

Scenario: Check that a policy is correctly setting a variable
    Given I trace the request
    When I GET /example-polyester
    And policy named AssignStuff should set the variable myVar to something great
