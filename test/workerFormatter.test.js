/**
 * Created by ellioe03 on 18/11/2017.
 */

//workerFormatter Tests


// data set as yaml text
var fs = require('fs');
var sinon = require('sinon');
var chrome = require('sinon-chrome');
var jsdom = require ('jsdom/lib/old-api.js');
var assert = require('chai').assert;

sinon.assert.expose(assert);
global.assert = assert;
sinon.assert.expose(global.assert, {prefix: ''});

describe('WebWorker that formats html', function() {

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
                fs.readFileSync('WebContent/workerFormatter2.js', 'utf-8')
            ],
            created: function(errors, wnd) {
                //attach chrome to window
                wnd.chrome = chrome;
                wnd.console = console;

                // wnd.localStorage = {
                //     options: false,
                //     theme: ""
                // };

                // wnd.Worker = function Worker(scriptURL){
                //     return scriptURL;
                // };
                // wnd.Worker.prototype.addEventListener = function(type,script,options){
                //     return type;
                // };

                // wnd.Worker.prototype.postMessage = spy;

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

    it('should translate json into html', function() {
        var jsonObject = JSON.parse(fs.readFileSync('fixture/example.json', 'utf-8'));
        var fnName;
        var jsonDivStart = "<div id=\"json\"><span class=\"type-string\">";
        var jsonDivEnd = "</span></div>";
        var html =
                "<div id=\"json\">" +
                    "<div class=\"collapser\"></div>" +
                    "[" +
                        "<span class=\"ellipsis\"></span>" +
                        "<ul class=\"obj collapsible\">" +
                            "<li>" +
                                "<div class=\"hoverable\"><span class=\"property\">this</span>: <span class=\"type-string\">\"is\"</span>,</div>" +
                                    "</li>" +
                                    "<li>" +
                                    "<div class=\"hoverable\"><span class=\"property\">a</span>: " +
                                    "<div class=\"collapser\"></div>" +
                                    "[" +
                                        "<span class=\"ellipsis\"></span>" +
                                        "<ul class=\"obj collapsible\">" +
                                            "<li>" +
                                                "<div class=\"hoverable\"><span class=\"property\">0</span>: <span class=\"type-string\">\"YAML\"</span>," +
                                                "</div>" +
                                            "</li>" +
                                            "<li>" +
                                                "<div class=\"hoverable\"><span class=\"property\">1</span>: <span " +
                                                "class=\"type-string\">\"example\"</span></div>" +
                                            "</li>" +
                                        "</ul>" +
                                    "]" +
                                "</div>" +
                            "</li>" +
                        "</ul>" +
                    "]" +
                "</div>"

        var actualHtml  = window.jsonToHTML(jsonObject, fnName).replace(/(&quot\;)/g,"\"").replace(/({)/g,"[").replace(/(})/g,"]");

        assert.equal(html, actualHtml);
    });


    it('Should catagorise input and transform to html as appropriate', function() {
        var jsonObject = JSON.parse(fs.readFileSync('fixture/example.json', 'utf-8'));
        var html =
            "<div class=\"collapser\"></div>" +
            "[" +
                "<span class=\"ellipsis\"></span>" +
                "<ul class=\"obj collapsible\">" +
                    "<li>" +
                        "<div class=\"hoverable\"><span class=\"property\">this</span>: <span class=\"type-string\">\"is\"</span>,</div>" +
                        "</li>" +
                        "<li>" +
                        "<div class=\"hoverable\"><span class=\"property\">a</span>: " +
                        "<div class=\"collapser\"></div>" +
                        "[" +
                            "<span class=\"ellipsis\"></span>" +
                            "<ul class=\"obj collapsible\">" +
                                "<li>" +
                                    "<div class=\"hoverable\"><span class=\"property\">0</span>: <span class=\"type-string\">\"YAML\"</span>," +
                                    "</div>" +
                                "</li>" +
                                "<li>" +
                                    "<div class=\"hoverable\"><span class=\"property\">1</span>: <span " +
                                    "class=\"type-string\">\"example\"</span></div>" +
                                "</li>" +
                            "</ul>" +
                        "]" +
                        "</div>" +
                    "</li>" +
                "</ul>" +
            "]";

        var actualHtml  = window.valueToHTML(jsonObject).replace(/(&quot\;)/g,"\"").replace(/({)/g,"[").replace(/(})/g,"]");

        assert.equal(html, actualHtml);

    });

    it('Should translate Array objects', function() {
        var jsonArray = JSON.parse("[\"testElement1\", \"testElement2\"]");
        var htmlArray =
        "<div class=\"collapser\"></div>" +
        "[" +
            "<span class=\"ellipsis\"></span>" +
            "<ul class=\"obj collapsible\">" +
                "<li>" +
                    "<div class=\"hoverable\">" +
                        "<span class=\"property\">0</span>: " +
                        "<span class=\"type-string\">\"testElement1\"</span>," +
                    "</div>" +
                "</li>" +
                "<li>" +
                    "<div class=\"hoverable\">" +
                        "<span class=\"property\">1</span>: " +
                        "<span class=\"type-string\">\"testElement2\"</span>" +
                    "</div>" +
                "</li>" +
            "</ul>" +
        "]"

        var actualHtml  = window.valueToHTML(jsonArray).replace(/(&quot\;)/g,"\"").replace(/({)/g,"[").replace(/(})/g,"]");

        assert.equal(htmlArray, actualHtml);
    });

    // it('Should translate JSON Object objects', function() {
    //     var jsonObject = JSON.parse("{\"testKey\": \"testValue\"}");
    //
    //     var htmlObject =
    //         "<div class=\"collapser\"></div>" +
    //         "{" +
    //             "<span class=\"ellipsis\"></span>" +
    //             "<ul class=\"obj collapsible\">" +
    //                 "<li>" +
    //                     "<div class=\"hoverable\">" +
    //                         "<span class=\"property\">testKey</span>: " +
    //                         "<span class=\"type-string\">\"testValue\"</span>" +
    //                     "</div>" +
    //                 "</li>" +
    //             "</ul>" +
    //         "}"
    //
    //     var actualHtml  = window.valueToHTML(jsonObject).replace(/(&quot\;)/g,"\"");
    //
    //     assert.equal(htmlObject, actualHtml);
    // });

    it('Should translate JSON Object objects to YAML Objects', function() {
        var jsonObject = JSON.parse("{\"testKey\": \"testValue\"}");

        var htmlObject =
            "<div class=\"collapser\"></div>" +
            "<span class=\"ellipsis\"></span>" +
            "<ul class=\"obj collapsible\">" +
            "<li>" +
            "<div class=\"hoverable\">" +
            "<span class=\"property\">testKey</span>: " +
            "<span class=\"type-string\">\"testValue\"</span>" +
            "</div>" +
            "</li>" +
            "</ul>"

        var actualHtml  = window.valueToHTML(jsonObject).replace(/(&quot\;)/g,"\"");

        assert.equal(htmlObject, actualHtml);
    });

    it('Should decorate numbers with span', function() {
        var value = 5;

        var htmlNumber = "<span class=\"type-number\">5</span>";

        // var actualHtml  = window.decorateWithSpan(value, "type-number").replace(/(&quot\;)/g,"\"");

        var actualHtml  = window.valueToHTML(value).replace(/(&quot\;)/g,"\"").replace(/({)/g,"[").replace(/(})/g,"]");

        assert.equal(htmlNumber, actualHtml);
    });

    it('Should decorate nulls with span', function() {
        var value;

        var htmlNumber = "<span class=\"type-null\"></span>";


        var actualHtml  = window.valueToHTML(value).replace(/(&quot\;)/g,"\"").replace(/({)/g,"[").replace(/(})/g,"]");

        assert.equal(htmlNumber, actualHtml);
    });

    it('Should decorate strings with span', function() {
        var value = "test";

        var htmlString = "<span class=\"type-string\">\"test\"</span>";

        var actualHtml  = window.valueToHTML(value).replace(/(&quot\;)/g,"\"").replace(/({)/g,"[").replace(/(})/g,"]");

        assert.equal(htmlString, actualHtml);
    });

    it('Should decorate links with span', function() {
        var value = "http://www.test.com/index.html";

        var htmlLink =
            "<span class=\"type-string\">\"</span>" +
            "<a href=\"http://www.test.com/index.html\">http://www.test.com/index.html</a>" +
            "<span class=\"type-string\">\"</span>";

        var actualHtml  = window.valueToHTML(value).replace(/(&quot\;)/g,"\"").replace(/({)/g,"[").replace(/(})/g,"]");

        assert.equal(htmlLink, actualHtml);
    });


    it('Should replace quote characters in output', function() {
        var t = '\"test\"';

        var htmlString = "&quot;test&quot;";

        var actualHtml  = window.htmlEncode(t);

        assert.equal(htmlString, actualHtml);
    });




});




