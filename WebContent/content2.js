/**
 * Created by ellioe03 on 26/10/2017.
 */

var port = chrome.runtime.connect(),collapsers, options, yamlObject ;


/*
 * 6. Display web page error page
 * with location of error
 */
function displayError(error, loc) {
    var link = document.createElement("link"), pre = document.body.firstChild.firstChild, text = pre.textContent, start = 0, ranges = [], idx = 0, end, range = document
        .createRange(), imgError = document.createElement("img"), content = document.createElement("div"), errorPosition = document.createElement("span"), container = document
        .createElement("div"), closeButton = document.createElement("div");
    link.rel = "stylesheet";
    link.type = "text/css";
    link.href = chrome.runtime.getURL("content_error.css");
    document.head.appendChild(link);
    while (idx != -1) {
        idx = text.indexOf("\n", start);
        ranges.push(start);
        start = idx + 1;
    }
    start = ranges[loc.first_line - 1] + loc.first_column;
    end = ranges[loc.last_line - 1] + loc.last_column;
    range.setStart(pre, start);
    if (start == end - 1)
        range.setEnd(pre, start);
    else
        range.setEnd(pre, end);
    errorPosition.className = "error-position";
    errorPosition.id = "error-position";
    range.surroundContents(errorPosition);
    imgError.src = chrome.runtime.getURL("error.gif");
    errorPosition.insertBefore(imgError, errorPosition.firstChild);
    content.className = "content";
    closeButton.className = "close-error";
    closeButton.onclick = function() {
        content.parentElement.removeChild(content);
    };
    content.textContent = error;
    content.appendChild(closeButton);
    container.className = "container";
    container.appendChild(content);
    errorPosition.parentNode.insertBefore(container, errorPosition.nextSibling);
    location.hash = "error-position";
    history.replaceState({}, "", "#");
}


/*
 * 5. Display web page with yaml as html
 * by adding object with div elements
 */
function displayUI(theme, html) {
    var statusElement, toolboxElement, expandElement, reduceElement, viewSourceElement, optionsElement, content = "";
    // stylesheets
    content += '<link rel="stylesheet" type="text/css" href="' + chrome.runtime.getURL("yamlview-core.css") + '">';
    content += "<style>" + theme + "</style>";
    // add converted json to html
    content += html;
    // add content so far to DOM
    document.body.innerHTML = content;
    // selects node list where id=yaml or class is collapsible
    collapsers = document.querySelectorAll("#yaml .collapsible .collapsible");
    // make status element
    statusElement = document.createElement("div");
    statusElement.className = "status";
    // make copy-path element
    copyPathElement = document.createElement("div");
    copyPathElement.className = "copy-path";
    // add copy-path element to status element then add to body
    statusElement.appendChild(copyPathElement);
    document.body.appendChild(statusElement);
    // make toolbox element
    toolboxElement = document.createElement("div");
    toolboxElement.className = "toolbox";
    // make + sign expand all and - sign reduce all tool
    expandElement = document.createElement("span");
    expandElement.title = "expand all";
    expandElement.innerText = "+";
    reduceElement = document.createElement("span");
    reduceElement.title = "reduce all";
    reduceElement.innerText = "-";
    // make options icon
    optionsElement = document.createElement("img");
    optionsElement.title = "options";
    optionsElement.src = chrome.runtime.getURL("options.png");
    // add toolbox elements to page
    toolboxElement.appendChild(expandElement);
    toolboxElement.appendChild(reduceElement);
    toolboxElement.appendChild(optionsElement);
    document.body.appendChild(toolboxElement);
    // add action functions for clicks and mouse overs
    document.body.addEventListener('click', ontoggle, false);
    document.body.addEventListener('mouseover', onmouseMove, false);
    document.body.addEventListener('click', onmouseClick, false);
    document.body.addEventListener('contextmenu', onContextMenu, false);
    // change how nodes displayed
    expandElement.addEventListener('click', onexpand, false);
    reduceElement.addEventListener('click', onreduce, false);
    // open options page
    optionsElement.addEventListener("click", function() {
        window.open(chrome.runtime.getURL("options.html"));
    }, false);
    // broadcast copy path
    copyPathElement.addEventListener("click", function() {
        port.postMessage({
            copyPropertyPath : true,
            path : statusElement.innerText
        });
    }, false);
}




/*
 * 2. Extract extracts yaml from text;
 * then tests text using yaml parser,
 * if it is yaml save yaml object to global variable,
 * if not return nothing
 */
function extractData(rawText) {
    var text = rawText.trim();

    function test(text) {
        try {
            yamljson = YAML.parse(text);
        } catch(e) {
            return false;
        }
        return true;
    }

    if (test(text))
        return {
            yamlObject : yamljson,
        };
}


/*
 * 4. Process data
 * Notifies backend to convert yaml object to html
 */
function processData(data) {
    var yamlObject;
    function formatToHTML() {
        if (!yamlObject)
            return;
        console.log("you are here--> in process")
        console.log(data);
        port.postMessage({
            yamlToHTML : true,
            yamlObject : yamlObject
        });
    }

    if (window == top || options.injectInFrame)
        if (data) {
        yamlObject = data.yamlObject;
            formatToHTML(yamlObject);
        }
}


/*
 * 4. GUI functions
 */
function ontoggle(event) {
    var collapsed, target = event.target;
    if (event.target.className == 'collapser') {
        collapsed = target.parentNode.getElementsByClassName('collapsible')[0];
        if (collapsed.parentNode.classList.contains("collapsed"))
            collapsed.parentNode.classList.remove("collapsed");
        else
            collapsed.parentNode.classList.add("collapsed");
    }
}

function onexpand() {
    Array.prototype.forEach.call(collapsers, function(collapsed) {
        if (collapsed.parentNode.classList.contains("collapsed"))
            collapsed.parentNode.classList.remove("collapsed");
    });
}

function onreduce() {
    Array.prototype.forEach.call(collapsers, function(collapsed) {
        if (!collapsed.parentNode.classList.contains("collapsed"))
            collapsed.parentNode.classList.add("collapsed");
    });
}

function getParentLI(element) {
    if (element.tagName != "LI")
        while (element && element.tagName != "LI")
            element = element.parentNode;
    if (element && element.tagName == "LI")
        return element;
}

var onmouseMove = (function() {
    var hoveredLI;

    function onmouseOut() {
        var statusElement = document.querySelector(".status");
        if (hoveredLI) {
            hoveredLI.firstChild.classList.remove("hovered");
            hoveredLI = null;
            statusElement.innerText = "";
        }
    }

    return function(event) {
        var str = "", statusElement = document.querySelector(".status");
        element = getParentLI(event.target);
        if (element) {
            if (hoveredLI)
                hoveredLI.firstChild.classList.remove("hovered");
            hoveredLI = element;
            element.firstChild.classList.add("hovered");
            do {
                if (element.parentNode.classList.contains("array")) {
                    var index = [].indexOf.call(element.parentNode.children, element);
                    str = "[" + index + "]" + str;
                }
                if (element.parentNode.classList.contains("obj")) {
                    str = "." + element.firstChild.firstChild.innerText + str;
                }
                element = element.parentNode.parentNode.parentNode;
            } while (element.tagName == "LI");
            if (str.charAt(0) == '.')
                str = str.substring(1);
            statusElement.innerText = str;
            return;
        }
        onmouseOut();
    };
})();

var selectedLI;

function onmouseClick() {
    if (selectedLI)
        selectedLI.firstChild.classList.remove("selected");
    selectedLI = getParentLI(event.target);
    if (selectedLI) {
        selectedLI.firstChild.classList.add("selected");
    }
}

function onContextMenu() {
    var currentLI, statusElement, selection = "", i, value;
    currentLI = getParentLI(event.target);
    statusElement = document.querySelector(".status");
    if (currentLI) {
        if (Array.isArray(jsonObject))
            value = eval("(jsonObject" + statusElement.innerText + ")");
        else
            value = eval("(jsonObject." + statusElement.innerText + ")");
        port.postMessage({
            copyPropertyPath : true,
            path : statusElement.innerText,
            value : typeof value == "object" ? JSON.stringify(value) : value
        });
    }
}



/*
 * 3. Init listens to notifications from background and webworkers
 * three main notifications:
 *  onInit -  it processes data to html object by calling process data method;
 *  onyamlToHTML - displays page with yaml, if no html it displays error;
 *  ongetError - displays an error.
 * Then notifies backend that init done
 */
function init(data) {
    port.onMessage.addListener(function(msg) {
        console.log("********** YOU ARE HERE ******************");
        if (msg.oninit) {
            console.log(msg);
            console.log("Just being initalised");
            options = msg.options;
            processData(data);
        }
        if (msg.onjsonToHTML)
            if (msg.html) {
                displayUI(msg.theme, msg.html);
            } else if (msg.yaml)
                port.postMessage({
                    getError : true,
                    yaml : yaml
                });
        if (msg.ongetError) {
            displayError(msg.error, msg.loc);
        }
        console.log("-----------No Message----------")
    console.log(msg);
});
console.log("-----------Post Message----------")
console.log(data);
port.postMessage({
    init : true
});
}

/*
 * 1. Load content from page
 * test if yaml, if not do nothing.
 * extract yaml into yamlobject
 * then pass this data object to init()
 */
function load() {
    var child, data;

    if (document.body && (document.body.childNodes[0] && document.body.childNodes[0].tagName == "PRE" || document.body.children.length == 0)) {
        child = document.body.children.length ? document.body.childNodes[0] : document.body;
        //runs if text is yaml or stops
        data = extractData(child.innerHTML);
        if (data)
            init(data);
    }
}

load();
