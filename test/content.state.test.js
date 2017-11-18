/**
 * Created by ellioe03 on 01/11/2017.
 */

//Task state made by content2



//State Changes()

// data set as yaml text
var fs = require('fs');
var sinon = require('sinon');
var chrome = require('sinon-chrome');
var jsdom = require ('jsdom/lib/old-api.js');
var assert = require('chai').assert;
var ChromeEvent = require('sinon-chrome/events');

sinon.assert.expose(assert);
global.assert = assert;
sinon.assert.expose(global.assert, {prefix: ''});

var spy = sinon.spy();
var ChromeEvent = require('sinon-chrome/events');
var fakePort = {
    onMessage: new ChromeEvent(),
    postMessage: spy
};
var port = fakePort;

describe('load a YAML page \n', function() {
    var window;
    var rawtext = fs.readFileSync('fixture/example.yml', 'utf-8');

    beforeEach(function(done) {
        jsdom.env({
            // generated background page
            file: "fixture/example.yml",
            src: [
                fs.readFileSync('WebContent/yamljs.js', 'utf-8'),
                fs.readFileSync('WebContent/content2.js', 'utf-8')
            ],
            created: function(errors, wnd) {
                //attach chrome to window
                wnd.chrome = chrome;
                wnd.console = console;
                //report errors
                if (errors) {
                    console.log(errors);
                    return done(true);
                }
            },
            done: function (errors,wnd) {
                if (errors) {
                    console.log(errors);
                    done(true);
                } else {
                    window = wnd;
                    done();

                }
            }
        });
        chrome.runtime.connect.returns(port);
        chrome.runtime.getURL.returns("jsonview-core.css");
    });

    afterEach(function() {
        chrome.reset();
        window.close();
    });

    it('Should load a yaml file', function() {
        //load url test
        var expected = "this: is\na:\n    - YAML\n    - example";
        assert.equal(window.document.getElementsByTagName("BODY")[0].innerHTML,expected);
        assert.equal(window.document.body.innerHTML,expected);
    });


    it('extractData should transform yaml to json text', function() {
        //test extractData
        var dataObject = window.extractData(rawtext);
        var text = fs.readFileSync('fixture/example.json', 'utf-8');
        assert.equal(dataObject.text,text);
    })


    it('should create toolbox page', function () {
        var theme = "";
        var html = "<title>This is a Test</title></title>"
        window.displayUI(theme,html);
        var expected = fs.readFileSync('fixture/body_toolbox.txt', 'utf-8');
        assert.equal(window.document.getElementsByTagName("BODY")[0].innerHTML,expected);
    });
});


describe('load a JSON page ', function() {

    var window;
    var yamlObject = { };
    var rawtext = fs.readFileSync('fixture/example.json', 'utf-8');

    beforeEach(function(done) {
        jsdom.env({
            // generated background page
            file: "fixture/example.json",
            src: [
                fs.readFileSync('WebContent/yamljs.js', 'utf-8'),
                fs.readFileSync('WebContent/content2.js', 'utf-8')
            ],
            created: function(errors, wnd) {
                //attach chrome to window
                wnd.chrome = chrome;
                wnd.console = console;
                //report errors
                if (errors) {
                    console.log(errors);
                    return done(true);
                }
            },
            done: function (errors,wnd) {
                if (errors) {
                    console.log(errors);
                    done(true);
                } else {
                    window = wnd;
                    done();
                }
            }
        });
        chrome.runtime.connect.returns(port);
    });

    afterEach(function() {
        chrome.reset();
        window.close();
    });

    it('Should load a JSON file \n', function() {
        assert.equal(window.document.getElementsByTagName("BODY")[0].innerHTML, rawtext);
    });


    it('extractData should exit if file not YAML', function() {
        //test extractData
        var dataObject = window.extractData(rawtext);
        var text = "{\n    \"this\": \"is\",\n    \"a\": [\n        \"YAML\",\n        \"example\"\n    ]\n}";
        assert.equal(dataObject, null);
    })
});



