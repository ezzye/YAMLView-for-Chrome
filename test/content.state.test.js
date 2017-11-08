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


describe('YAML page ', function() {

    var window;
    var rawtext = fs.readFileSync('fixture/example.yml', 'utf-8');

    beforeEach(function(done) {
        jsdom.env({
            // generated background page
            file: "fixture/example.yml",
            //TODO check url - js source
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
    });

    afterEach(function() {
        chrome.reset();
        window.close();
    });

    it('Should print out setup OK', function() {

        //load url test

        console.log("\n");
        console.log("Set up OK. This is the loaded document:");
        console.log(window.document.getElementsByTagName("BODY")[0].innerHTML);
        console.log("\n");
    });

    it('YAML function should create a yaml javascript object', function() {


        // test YAML function
        var yamlObject = window.YAML.parse(rawtext);

        console.log("This is yaml raw text:");
        console.log(rawtext);
        console.log("\n");
        console.log("This is yaml javascript object:");
        console.log(yamlObject );

        assert.equal(yamlObject.this,'is');
        assert.equal(yamlObject.a[0],'YAML');
        assert.equal(yamlObject.a[1],'example');

    });

    it('extractData should yamlObject', function() {

        //test extractData
        var dataObject = window.extractData(rawtext);


        console.log("\n");
        console.log("This is the rawtext:");
        console.log(rawtext);
        console.log("This is the loaded yamlobject: \n", dataObject);

        assert.equal(dataObject.yamlObject.this,'is');
        assert.equal(dataObject.yamlObject.a[0],'YAML');
        assert.equal(dataObject.yamlObject.a[1],'example');
    })


});



