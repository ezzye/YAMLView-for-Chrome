/**
 * Created by ellioe03 on 06/11/2017.
 */

//Task behaviour and state changes made by content2


// Events


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

describe('YAML page ready to make html', function() {
    var window;
    var spy = sinon.spy();
    var ChromeEvent = require('sinon-chrome/events');
    var fakePort = {
        onMessage: new ChromeEvent(),
        postMessage: spy
    };
    var port = fakePort;

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

                chrome.runtime.getURL.returns("jsonview-core.css");
                chrome.runtime.connect.returns(port);
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
    });
    afterEach(function() {
        chrome.reset();
        spy.reset();
        window.close();
    });

    it('should listen for onjsonToHTML and  html----> do displayUI', function () {
        // run you content script
        var html = "<title>This is a Test</title></title>"
        var theme = "";

        // See state test
        var expected = fs.readFileSync('fixture/body_toolbox.txt', 'utf-8');

        port.onMessage.trigger({
            onjsonToHTML: 1,
            html: html,
            theme: theme
        });

        console.log(window.document.getElementsByTagName("BODY")[0].innerHTML);
        assert.equal(window.document.getElementsByTagName("BODY")[0].innerHTML, expected);
    });
});


describe('YAML page ready for json', function() {

    var window;
    var spy = sinon.spy();
    var ChromeEvent = require('sinon-chrome/events');
    var fakePort = {
        onMessage: new ChromeEvent(),
        postMessage: spy
    };
    var port = fakePort;

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
                chrome.runtime.getURL.returns("jsonview-core.css");
                chrome.runtime.connect.returns(port);
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
    });

    afterEach(function() {
        chrome.reset();
        spy.reset();
        window.close();
    });


    it('should listen for oninit ----> post jsonToHTML with jsontext to process data', function () {
        // run you content script
        var jsonText = fs.readFileSync('fixture/example.json', 'utf-8');
        var fnName;
        var offset = 0;
        var localStorage = {};

        port.onMessage.trigger({
            oninit: 1,
            options : localStorage.options ? JSON.parse(localStorage.options) : {}
        });
        // console.log(jsonText);
        assert.calledOnce(port.postMessage.withArgs({
            jsonToHTML : true,
            json : jsonText,
            fnName : fnName,
            offset : offset
        }));
    });
});

describe('YAML page json htm mismatch', function() {
    var window;
    var spy = sinon.spy();
    var ChromeEvent = require('sinon-chrome/events');
    var fakePort = {
        onMessage: new ChromeEvent(),
        postMessage: spy
    };
    var port = fakePort;

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
                chrome.runtime.getURL.returns("jsonview-core.css");
                chrome.runtime.connect.returns(port);
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
    });

    afterEach(function() {
        chrome.reset();
        spy.reset();
        window.close();
    });

    it('should listen for onjsonToHTML and  json----> post getError with json', function () {
        // run you content script
        var jsonText = fs.readFileSync('fixture/example.json', 'utf-8');
        var fnName;

        port.onMessage.trigger({
            onjsonToHTML: 1,
            json: jsonText
        });
        assert.calledOnce(port.postMessage.withArgs({
            getError : true,
            json : jsonText,
            fnName : fnName
        }));
    });
});

describe('YAML page ready init done', function() {
    var window;
    var spy = sinon.spy();
    var ChromeEvent = require('sinon-chrome/events');
    var fakePort = {
        onMessage: new ChromeEvent(),
        postMessage: spy
    };
    var port = fakePort;

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
                chrome.runtime.getURL.returns("jsonview-core.css");
                chrome.runtime.connect.returns(port);
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
    });

    afterEach(function() {
        chrome.reset();
        spy.reset();
        window.close();
    });

    it('should init data ----> post init to initialise page', function () {
        assert.calledOnce(port.postMessage.withArgs({
            init : true
        }));
    });
});



