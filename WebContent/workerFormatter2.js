// Web worker back end observer.

/*
 * 1. Functions to convert yaml object into html
 */

/**
 * Adapted the code in to order to run in a web worker.
 *
 * Original author: Benjamin Hollis
 *
 * This code converts object into html
 */

function htmlEncode(t) {
    return t != null ? t.toString().replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;") : '';
}

function decorateWithSpan(value, className) {
    return '<span class="' + className + '">' + htmlEncode(value) + '</span>';
}

function valueToHTML(value) {
    var valueType = typeof value, output = "";
    if (value == null)
        output += decorateWithSpan("null", "type-null");
    else if (value && value.constructor == Array)
        output += arrayToHTML(value);
    else if (valueType == "object")
        output += objectToHTML(value);
    else if (valueType == "number")
        output += decorateWithSpan(value, "type-number");
    else if (valueType == "string")
        if (/^(http|https):\/\/[^\s]+$/.test(value))
            output += decorateWithSpan('"', "type-string") + '<a href="' + value + '">' + htmlEncode(value) + '</a>' + decorateWithSpan('"', "type-string");
        else
            output += decorateWithSpan('"' + value + '"', "type-string");
    else if (valueType == "boolean")
        output += decorateWithSpan(value, "type-boolean");

    return output;
}

function arrayToHTML(yaml) {
    var i, length, output = '<div class="collapser"></div>[<span class="ellipsis"></span><ul class="array collapsible">', hasContents = false;
    for (i = 0, length = yaml.length; i < length; i++) {
        hasContents = true;
        output += '<li><div class="hoverable">';
        output += valueToHTML(yaml[i]);
        if (i < length - 1)
            output += ',';
        output += '</div></li>';
    }
    output += '</ul>]';
    if (!hasContents)
        output = "[ ]";
    return output;
}

function objectToHTML(yaml) {
    var i, key, length, keys = Object.keys(yaml), output = '<div class="collapser"></div>{<span class="ellipsis"></span><ul class="obj collapsible">', hasContents = false;
    for (i = 0, length = keys.length; i < length; i++) {
        key = keys[i];
        hasContents = true;
        output += '<li><div class="hoverable">';
        output += '<span class="property">' + htmlEncode(key) + '</span>: ';
        output += valueToHTML(yaml[key]);
        if (i < length - 1)
            output += ',';
        output += '</div></li>';
    }
    output += '</ul>}';
    if (!hasContents)
        output = "{ }";
    return output;
}

function yamlToHTML(yaml, fnName) {
    var output = '';
    if (fnName)
        output += '<div class="callback-function">' + fnName + '(</div>';
    output += '<div id="yaml">';
    output += valueToHTML(yaml);
    output += '</div>';
    if (fnName)
        output += '<div class="callback-function">)</div>';
    return output;
}

addEventListener("message", function(event) {
    var object;
    try {
        object = JSON.parse(event.data.yaml);
    } catch (e) {
        postMessage({
            error : true
        });
        return;
    }
    postMessage({
        onyamlToHTML : true,
        html : yamlToHTML(object, event.data.fnName)
    });
}, false);
