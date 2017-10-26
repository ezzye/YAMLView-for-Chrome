/*
 * port is chrome runtime to enbale access to chrome functions
 * such as onMessage.addListener and postMessage.
 * A message can contain any valid JSON object.
 * runtime.connect opens a long lived connection.
 * Note jsonObject's scope.
 * see https://github.com/jeremyfa/yaml.js/blob/develop/src/Parser.coffee to convert yaml to javascript object
 */
var port = chrome.runtime.connect(), collapsers, options, jsonObject, nativeObject, yamlString ;

function displayError(error, loc, offset) {
	var link = document.createElement("link"), pre = document.body.firstChild.firstChild, text = pre.textContent.substring(offset), start = 0, ranges = [], idx = 0, end, range = document
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
	start = ranges[loc.first_line - 1] + loc.first_column + offset;
	end = ranges[loc.last_line - 1] + loc.last_column + offset;
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
 * 5. build display ui html
 * top right toolbox and
 * communicate ui interaction
 */
function displayUI(theme, html) {
	var statusElement, toolboxElement, expandElement, reduceElement, viewSourceElement, optionsElement, content = "";
	// stylesheets
	content += '<link rel="stylesheet" type="text/css" href="' + chrome.runtime.getURL("jsonview-core.css") + '">';
	content += "<style>" + theme + "</style>";
	// add converted json to html
	content += html;
	// add content so far to DOM
	document.body.innerHTML = content;
	// selects node list where id=json or class is collapsible
	collapsers = document.querySelectorAll("#json .collapsible .collapsible");
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
	// make view source link
	viewSourceElement = document.createElement("a");
	viewSourceElement.innerText = "View source";
	viewSourceElement.target = "_blank";
	viewSourceElement.href = "view-source:" + location.href;
	// make options icon
	optionsElement = document.createElement("img");
	optionsElement.title = "options";
	optionsElement.src = chrome.runtime.getURL("options.png");
	// add toolbox elements to page
	toolboxElement.appendChild(expandElement);
	toolboxElement.appendChild(reduceElement);
	toolboxElement.appendChild(viewSourceElement);
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
	//TODO: is this telling content script that page has been clicked?
	copyPathElement.addEventListener("click", function() {
		port.postMessage({
			copyPropertyPath : true,
			path : statusElement.innerText
		});
	}, false);
}


/*
 * 2. trim text
 * and test for starting with { or [ character
 * and return object containing json text
 */
//TODO test for YAML instead of JSON
function extractData(rawText) {
	var tokens, text = rawText.trim();

	function test(text) {
		return ((text.charAt(0) == "[" && text.charAt(text.length - 1) == "]") || (text.charAt(0) == "{" && text.charAt(text.length - 1) == "}"));
	}

	if (test(text))
		return {
			text : rawText,
			offset : 0
		};
	//TODO what is a token?
	tokens = text.match(/^([^\s\(]*)\s*\(([\s\S]*)\)\s*;?$/);
	if (tokens && tokens[1] && tokens[2]) {
		if (test(tokens[2].trim()))
			return {
				fnName : tokens[1],
				text : tokens[2],
				offset : rawText.indexOf(tokens[2])
			};
	}
}


/*
 * 4. Process text
 * check that page is being viewed
 * TODO what is options.safeMethod
 * else format to html by converting to JSON saved in jsonObject
 * and then sending message that jsonToHTML is true
 */
function processData(data) {
	var xhr, jsonText;
	
	function formatToHTML(fnName, offset) {
		if (!jsonText)
			return;	
		port.postMessage({
			jsonToHTML : true,
			json : jsonText,
			fnName : fnName,
			offset : offset
		});
		try {
			jsonObject = JSON.parse(jsonText);
		} catch (e) {
		}
	}

	if (window == top || options.injectInFrame)
		if (options.safeMethod) {
			xhr = new XMLHttpRequest();
			xhr.onreadystatechange = function() {
				if (this.readyState == 4) {
					data = extractData(this.responseText);
					if (data) {
						jsonText = data.text;
						formatToHTML(data.fnName, data.offset);
					}
				}
			};
			xhr.open("GET", document.location.href, true);
			xhr.send(null);
		} else if (data) {
			jsonText = data.text;
			formatToHTML(data.fnName, data.offset);
		}
}

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
 * 3. Uses loaded text data to init
 * uses observers pattern to listen to background msg
 * and then either process data or display json
 * also can respond to errors
 */
function init(data) {
	port.onMessage.addListener(function(msg) {
		if (msg.oninit) {
			options = msg.options;
			processData(data);
		}
		if (msg.onjsonToHTML)
			if (msg.html) {
				displayUI(msg.theme, msg.html);
			} else if (msg.json)
				port.postMessage({
					getError : true,
					json : json,
					fnName : fnName
				});
		if (msg.ongetError) {
			displayError(msg.error, msg.loc, msg.offset);
		}
	});
	port.postMessage({
		init : true
	});
}

/*
 * 1. loads json from page, or does nothing,
 * into child variable then
 * uses extracts the text into variable data
 * then starts init with this.
 */
function load() {
	var child, data;

	if (document.body && (document.body.childNodes[0] && document.body.childNodes[0].tagName == "PRE" || document.body.children.length == 0)) {
		child = document.body.children.length ? document.body.childNodes[0] : document.body;
		//runs if text is json data or stops
		data = extractData(child.innerText);
		if (data)
			init(data);
	}
}

load();
