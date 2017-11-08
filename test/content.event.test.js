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

var ChromeEvent = require('sinon-chrome/events');
var fakePort = {
    onMessage: new ChromeEvent(),
    postMessage: sinon.spy()
};

var port = fakePort;

var yamlObject = { this: 'is', a: [ 'YAML', 'example' ] };


describe('YAML page ', function() {

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
    });

    afterEach(function() {
        chrome.reset();
        window.close();
    });


    it('should listen for oninit ----> post yamlToHTML with yamlObject', function () {
        // run you content script
        port.onMessage.trigger({oninit: 1});
        assert.calledOnce(port.postMessage.withArgs({
            yamlToHTML : true,
            yamlObject : yamlObject
        }));
    });


});


