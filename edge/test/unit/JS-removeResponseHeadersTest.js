// Dependedncies declaration
var expect = require("chai").expect;
var sinon = require('sinon');

// Mocking context object
context = {
    getVariable: function(s) {},
    setVariable: function(s) {},
    removeVariable: function(s) {}
};

var contextGetVariable,contextSetVariable,contextRemoveVariable;
var jsFile = '../../apiproxy/resources/jsc/JS-removeResponseHeaders.js';


function requireUncached(module){
    console.log ('Loading js file', jsFile,  'to setup context and call remove headers');
    delete require.cache[require.resolve(module)];
    return require(module);
}

// we are stubbing all Apigee objects and the methods we need here
beforeEach(function () {
    contextGetVariable = sinon.stub(context, 'getVariable');
    contextSetVariable = sinon.stub(context, 'setVariable');
    contextRemoveVariable = sinon.stub(context, 'removeVariable');
});

// restore all stubbed methods back to their original implementation
afterEach(function() {
    contextGetVariable.restore();
    contextSetVariable.restore();
    contextRemoveVariable.restore();
});

// this is the response headers test feature here
describe('Test Cases', function() {

    it('Test-Case 1 : HTTP Response has no unwanted headers', function() {

        contextGetVariable.withArgs('sample').returns("from test case");
        contextGetVariable.withArgs('response.headers.names').returns([
            'Content-Length',
            'Date',
            'Access-Control-Allow-Headers',
            'Access-Control-Allow-Methods',
            'Access-Control-Allow-Origin',
            'Access-Control-Max-Age',
            'Access-Control-Allow-Credentials',
            'Content-Type'
        ]);
        var errorThrown = false;
        try {
            requireUncached(jsFile);
            console.log ('Loading js file', jsFile,  'completed ');
        } catch (e) {
            errorThrown = true;
            expect(errorThrown).to.equal(false, ' Errors Found when Unloading ' + jsFile );

        }
   //     expect(contextRemoveVariable.calledOnce).to.be.false;
        expect(contextRemoveVariable.calledOnce).to.be.equal(false, 'Did not find any unwanted Errors');
        console.log ("Test-Case 1: Test Case passed Successfully, Did not find any unwanted Errors ");
    });


    it('Test-Case 2 : HTTP Response has unwanted headers', function() {
        contextGetVariable.withArgs('response.headers.names').returns(["mimic","sample1","sample2","sample3"]);

        var errorThrown = false;
        try {
            requireUncached(jsFile);
            console.log ('Loading js file', jsFile,  'completed ');
        } catch (e) {
            errorThrown = true;
            expect(errorThrown).to.equal(false, 'Error unloading JS File ' + jsFile);
        }

        console.log ( 'Assert context.removeVaraible was called 4 times - Start');
        expect(contextRemoveVariable.args[0][0]).to.equal("response.header.mimic",  'Not Found bad header as expected . Header is response.header.mimic ');
        expect(contextRemoveVariable.args[1][0]).to.equal("response.header.sample1", 'Not Found bad header as expected . Header is response.header.sample1 ');
        expect(contextRemoveVariable.args[2][0]).to.equal("response.header.sample2", 'Not Found bad header as expected . Header is response.header.sample2 ');
        expect(contextRemoveVariable.args[3][0]).to.equal("response.header.sample3", 'Not Found bad header as expected . Header is response.header.sample3 ');
        console.log ( 'Assert context.removeVaraible was called 4 times - Completed');
    });

});

