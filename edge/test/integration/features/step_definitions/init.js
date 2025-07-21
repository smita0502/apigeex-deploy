module.exports = require('apickli/apickli-gherkin');
var apickli = require('apickli');
var Promise = require('bluebird');
var {Before, BeforeAll, Given, Then, When} = require('cucumber');

var config = require('../../test-config.json');
var auth = require('../../auth-server.json');
var apps = require('../../devAppKeys.json');
var domains = config['domains'];

global.token = null;

var environment = config['sidgs-api-helloworld-apigeex'].env;

var creds = {};

var schemeSplit = function(string){
    var stringTokens = string.split('://');
    return stringTokens;
}

function getCreds(appName, productName){
    for(var app in apps){
        if(apps[app].name === appName){
            var credentials = apps[app].credentials;
            for(var credential in credentials){
                var products = credentials[credential].apiProducts;
                for(var product in products){
                    if(products[product].apiproduct === productName){
                        creds.consumerKey = credentials[credential].consumerKey;
                        creds.consumerSecret = credentials[credential].consumerSecret;
                    }
                }
            }
        }
    }
}

function getToken(){
    return new Promise(function(resolve,reject){
        var request = require('apickli');
        var tokens = schemeSplit(auth.domain);
        request= new request.Apickli(tokens[0],
            tokens[1] + auth.basepath,
            './test/integration/features/fixtures/');
        request.setRequestHeader("Authorization",'Basic '+Buffer.from(creds.consumerKey+':'+creds.consumerSecret).toString('base64'));
        request.setRequestHeader("Content-Type",'application/x-www-form-urlencoded');
        request.setRequestBody('grant_type=client_credentials&expires_in=3600');
        request.post('/token', function(error,response){
            if(response){
                token=JSON.parse(response.body).access_token;
                resolve();
            }
        });
    });
}

console.log('&$sidgs-api-helloworld-apigeex api: [' +  domains[environment] + ', ' + config['sidgs-api-helloworld-apigeex'].basepath + ']');

BeforeAll("BeforeFeatures", function(next) {
    if (apps[0].name) {
        console.log ("Getting Creds from DevAppsKeys.json");
        getCreds(config['sidgs-api-helloworld-apigeex'].app, config['sidgs-api-helloworld-apigeex'].product);
    } else
    {
        console.log ("Getting Creds from creds.json");
        var credentials =require('../../creds.json');
        console.log("Creds: ", credentials);
        creds.consumerKey = credentials['key'];
        creds.consumerSecret = credentials ['secret'];
    }
    getToken().then(function(){
        return next();
    });
});

Before(function(scenario, callback) {
    var tokens = schemeSplit(domains[environment]);

    this.apickli = new apickli.Apickli(tokens[0],
        tokens[1]+ config['sidgs-api-helloworld-apigeex'].basepath,
        './test/integration/features/fixtures/');
    callback();
});

Given(/^standard oauth tokens are set$/, function (callback) {
    this.apickli.setRequestHeader("Authorization",'Bearer '+token);
    callback();
});
