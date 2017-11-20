/**
 * Created by ellioe03 on 08/11/2017.
 */
/**
 * Created by ellioe03 on 06/11/2017.
 */

//Task behaviour and state changes made by background2

// Events

// data set as yaml text
var fs = require('fs');
var sinon = require('sinon');
var chrome = require('sinon-chrome');
var jsdom = require ('jsdom/lib/old-api.js');
var assert = require('chai').assert;

sinon.assert.expose(assert);
global.assert = assert;
sinon.assert.expose(global.assert, {prefix: ''});

describe('YAML page background events', function() {

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
            html: "<html><header></header><body></body></html>",
            src: [
                fs.readFileSync('WebContent/background2.js', 'utf-8')
            ],
            created: function(errors, wnd) {
                //attach chrome to window
                wnd.chrome = chrome;
                wnd.console = console;

                wnd.localStorage = {
                    options: false,
                    theme: ""
                };

                wnd.Worker = function Worker(scriptURL){
                    return scriptURL;
                };
                wnd.Worker.prototype.addEventListener = function(type,script,options){
                    return type;
                };

                wnd.Worker.prototype.postMessage = spy;

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

    it('should listen for events', function() {

        window.port = port;
        window.init();

        assert.called(chrome.runtime.onConnect.addListener);

    });


    it('should listen for init and broadcast oninit message ', function () {

        var localStorage = {
                    options: '{"addContextMenu":true}',
                    theme: ""
        };



        window.doinit(port);

        port.onMessage.trigger({
            init: true,
        });

        assert.called(port.postMessage.withArgs({
            oninit : true,
            options : localStorage.options ? JSON.parse(localStorage.options) : {}
        }));
    });

    it('should listen for copyPropertyPath and set path and value it  ', function () {

        window.doinit(port);

        port.onMessage.trigger({
            copyPropertyPath: true,
            path: "testpath",
            value: "test value"
        });

        assert.equal(window.path,"testpath");
        assert.equal(window.value,"test value");
    });

    it('should listen for jsonToHTML and broadcast json message as json linted ', function () {

        window.doinit(port);

        window.workerJSONLint;

        var localStorage = {
            options: '{"addContextMenu":true}',
            theme: ""
        };

        var jsonText = fs.readFileSync('fixture/example.json', 'utf-8');
        var fnName;

        port.onMessage.trigger({
            jsonToHTML: true,
            json : jsonText,
            fnName : fnName
        });

        assert.called(port.postMessage.withArgs({
            json : jsonText,
            fnName : fnName
        }));
    });




});



