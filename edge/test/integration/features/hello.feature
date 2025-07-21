Feature: Include description based on API service/endpoint/path.
	You can have mutliple feature files for each endpoint/path if desired for organization.
	You can also rename said file(s).

	Scenario:  I GET /json and get a valid json response with 200 status code
		Given standard oauth tokens are set
		When I GET /json
		Then response code should be 200
		Then response body should contain Hello

	Scenario:  I get an error when I do not pass oauth tokens to GET /json
		When I GET /json
		Then response code should be 401
		Then response body should contain Unauthorized

	Scenario:  I get an error when I pass an invalid token to GET /json
		And I set Authorization header to Bearer Y6CG6826A71UqrcXFJN8jnxm1HFl1
		When I GET /json
		Then response code should be 401
		Then response body should contain Unauthorized

	Scenario:  I get an error when I access a endpoint uri that does not exist
		Given standard oauth tokens are set
		When I GET /does-not-exist
		Then response code should be 404
		Then response body should contain Resource Not Found
