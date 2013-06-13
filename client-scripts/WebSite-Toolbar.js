var activeWYSIWYG = null;
var toolBarClick = false;
var activeWYSIWYG_BG = "";
var activeWYSIWYG_FG = "";
var activeWYSIWYG_Content = "";
var selectedRange = null;
var selectedRangeOffset = 0;
var emoticonHTML = "";

$(document).ready(function () { pageValidate(); });

function launchPageDefect() {
	try { hideAllMenus(); } catch (e) { }
	showHideGradiant(true);
	var currentURL = document.location.href;
	var subEnd = currentURL.indexOf(".");
	currentURL = "www" + currentURL.substring(subEnd);
	var sHTM = "";
	sHTM += formPopupHeader("Report an Issue");
	sHTM += "<div class=\"popupContent\">";
	sHTM += "<div class=\"FPL\">Type of Issue (Select all that apply):</div>";
	sHTM += "<div class=\"FPL\"><input id=\"isDataIssue\" type=\"checkbox\" /> This is a Data Issue</div>";
	sHTM += "<div class=\"FPL\"><input id=\"isBrowserIssue\" type=\"checkbox\" /> This is a Browser Specific Issue</div>";
	sHTM += "<div class=\"FPL\"><input id=\"isContentIssue\" type=\"checkbox\" /> This is a Content Issue</div>";
	sHTM += "<div class=\"FPL\"><input id=\"isLayoutIssue\" type=\"checkbox\" /> This is a Layout/Visual Issue</div>";
	sHTM += "<div class=\"FPL\">Explain the Issue</div>";
	sHTM += "<textarea id=\"issue\" class=\"textbox\" style=\"height:150px;\" onblur=\"javascript:cancelHelp();\" onclick=\"javascript:loadHelp(this,'Enter details about this issue.');\"></textarea>";
	sHTM += "<div class=\"FPL\">Page:  <input id=\"issuePage\" type=\"text\" value=\"" + document.location.href + "\" style=\"width:380px;\" /></div>";
	sHTM += "<div class=\"FPL\">Referer:  <input id=\"issueReferer\" type=\"text\" value=\"" + document.referrer + "\" style=\"width:365px;\" /></div>";
	sHTM += "<div class=\"FPL\">Browser:  <input id=\"issueBrowser\" type=\"text\" value=\"" + getBrowserName() + "\" style=\"width:360px;\" /></div>";
	sHTM += "<div class=\"FPL\">Version:  <input id=\"issuebrowserVer\" type=\"text\" value=\"" + $.browser.version + "\" style=\"width:365px;\" /></div>";
	sHTM += "<div class=\"FPL\">Agent:  <input id=\"issueAgent\" type=\"text\" value=\"" + navigator.userAgent + "\" style=\"width:373px;\" /></div>";
	sHTM += "<div style=\"height:10px;\"></div>";
	sHTM += "</div>";
	sHTM += formPopupFooter("<button onclick=\"cancelPopup();\">cancel</button><button onclick=\"submitDEFECT();\">submit</button>");
	toolBarPopup.style.top = (getTopScroll() + 50) + "px";
	toolBarPopup.style.left = "50px";
	toolBarPopup.style.width = "450px";
	toolBarPopup.style.height = "360px";
	toolBarPopup.innerHTML = sHTM;
	toolBarPopup.style.visibility = "visible";
}

function submitDEFECT() {
	var currentURL = document.location.href;
	var slash = currentURL.split("/");
	if (currentURL.endsWith("/") && currentURL.indexOf("/blog/") > 0) {
		currentURL += "blog.htm";
	}
	else if (slash.length == 4 && !currentURL.endsWith(".htm")) {
		currentURL += "home.htm";
	}
	else if (currentURL.endsWith("/")) {
		subURL = currentURL.substring(7);
		subURL = subURL.split("/");
		currentURL += subURL[1] + ".htm";
	}
	//-- bundle form data
	var sData = "";
	sData += "issue|" + $("#issue").val() + "^";
	sData += "isDataIssue|" + ($("#isDataIssue").is(":checked") ? "true" : "false") + "^";
	sData += "isBrowserIssue|" + ($("#isBrowserIssue").is(":checked") ? "true" : "false") + "^";
	sData += "isContentIssue|" + ($("#isContentIssue").is(":checked") ? "true" : "false") + "^";
	sData += "isLayoutIssue|" + ($("#isLayoutIssue").is(":checked") ? "true" : "false") + "^";
	sData += "issuePage|" + $("#issuePage").val() + "^";
	sData += "issueReferer|" + $("#issueReferer").val() + "^";
	sData += "issueBrowser|" + $("#issueBrowser").val() + "^";
	sData += "issuebrowserVer|" + $("#issuebrowserVer").val() + "^";
	sData += "issueAgent|" + $("#issueAgent").val();
	sData = escape(sData.replace(/\+/g, "&#43;"));
	//-- submit
	if (window.XMLHttpRequest) { var request = new XMLHttpRequest(); } else { var request = new ActiveXObject("MSXML2.XMLHTTP.3.0"); }
	request.open("POST", currentURL.replace(".htm", ".htm.content"), false);
	request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	request.send("MODE=ADD-ISSUE&FIELD=NEW&DATA=" + sData);
	var sResponse = request.responseText;
	if (sResponse != "OK") { alert(sResponse); } else { cancelPopup(); }
}

function getBrowserName() {
	var returnSTR = "";
	jQuery.each(jQuery.browser, function (i, val) {
		if (i != "version") { returnSTR += i; }
	});
	return returnSTR;
}

function pageValidate() {
    var fixHTML = "";
    if (document.title == "") { fixHTML += "[ Missing SEO Page Title <a href=\"javascript:metadataPopup();\">( FIX IT ? )</a> ] "; }
    if ($("meta[name=description]").attr("content") == "") { fixHTML += "[ Missing SEO Page Description <a href=\"javascript:metadataPopup();\">( FIX IT ? )</a> ] "; }
    if ($("meta[name=keywords]").attr("content") == "") { fixHTML += "[ Missing SEO Page Keywords <a href=\"javascript:metadataPopup();\">( FIX IT ? )</a> ] "; }
    if (fixHTML != "") {
        $("body").prepend("<div id=\"WebSiteToolBarFixIt\" >" + fixHTML + "</div>");
    }
}

function startButtonHover(btn,sMode) {
    if (sMode == "ON") {
        btn.src = "/images/start-button-hover.png";
        btn.onerror = "javascript:this.src='/DHTMLPlusCM/start-button-hover.png'";
    } else {
        btn.src = "/images/start-button.png";
        btn.onerror = "javascript:this.src='/DHTMLPlusCM/start-button.png'";
    }
}
function activateWYSIWYG(obj) {
    try { closeMainMenu(); } catch (e) { }
    if (activeWYSIWYG == null) {
        activeWYSIWYG = obj;
        setToolBar(activeWYSIWYG.nodeName);
        activeWYSIWYG_Content = activeWYSIWYG.innerHTML;
        activeWYSIWYG_BG = activeWYSIWYG.style.backgroundColor;
        activeWYSIWYG_FG = activeWYSIWYG.style.color;
        activeWYSIWYG.style.backgroundColor = "#FDF4B1";
        activeWYSIWYG.style.color = "#333333";
        toolBar.style.visibility = "visible";
        toolBar.style.top = ($(activeWYSIWYG).offset().top - 75) + "px";
        toolBar.style.left = ($(activeWYSIWYG).offset().left) + "px";
        if (activeWYSIWYG.offsetWidth <= 550) { toolBar.style.width = "550px"; } else { toolBar.style.width = activeWYSIWYG.offsetWidth + "px"; }
        toolBarPopup.style.top = ($(activeWYSIWYG).offset().top) + "px";
        toolBarPopup.style.left = ($(activeWYSIWYG).offset().left) + "px";
    } else {
        deactivateWYSIWYG();
    }
    cancelPopup();
    activeWYSIWYG.focus();
}
function activateWYSIWYG2(obj) {alert("Content editing is not supported by your browser.\nUse FireFox 3 or Later.");}
function keyWYSIWYG(e) {
    var keynum, keychar, alt, ctrl, shift;
    var returnValue = true;
    if (window.event) {
        keynum = e.keyCode;
    } else {
        keynum = e.which;
    }
    alt = e.altKey;
    ctrl = e.ctrlKey;
    shift = e.shiftKey;
    returnValue = keynum;
    keychar = String.fromCharCode(keynum);
    parentTag = getTagName();
    if (parentTag != "LI" && shift == false && keynum == 13) {
        alert("Use Shift+Enter for a New Line.");
        returnValue = false;
    }
    //-- Ctrl+V
    if (ctrl == true && keynum == 118) {
        returnValue = false;
        pastePOPUP();
    }
    return returnValue;
}
function getTagName() { var node = getRangeNode(); return node.nodeName; }
function getRangeNode() {
    var node = null;
    if (window.getSelection) {
        node = window.getSelection().anchorNode;
    } else if (document.selection) {
        var range = document.selection.createRange();
        if (range) { node = range.parentElement(); }
    }
    if (node.nodeName.indexOf("#") >= 0) { node = node.parentNode; }
    return node;
}
function deactivateWYSIWYG() { }
function cancelWYSIWYG() {
    activeWYSIWYG.innerHTML = activeWYSIWYG_Content;
    activeWYSIWYG.style.backgroundColor = activeWYSIWYG_BG;
    activeWYSIWYG.style.color = activeWYSIWYG_FG;
    activeWYSIWYG = null;
    activeWYSIWYG_Content = "";
    hideToolbar();
    cancelPopup();
}
function setToolBar(elementType) {
    var sHTM = "";
    sHTM += "<a href=\"javascript:templateDELETE();\" style=\"margin-right:5px;\" title=\"Delete Control\"><img src=\"/DHTMLPlusCM/delete.png\" alt=\"delete\"/></a>";
    sHTM += "<a href=\"javascript:templateINSERT('Above');\" style=\"margin-right:5px;\" title=\"Insert Above\"><img src=\"/DHTMLPlusCM/insert-above.png\" alt=\"Insert Above\"/></a>";
    sHTM += "<a href=\"javascript:templateINSERT('Below');\" style=\"margin-right:15px;\" title=\"Insert Below\"><img src=\"/DHTMLPlusCM/insert-below.png\" alt=\"Insert Below\"/></a>";
    sHTM += "<a href=\"javascript:wysiwygCMD('bold');\" style=\"margin-right:5px;\" title=\"Bold\"><img src=\"/DHTMLPlusCM/bold.png\" alt=\"Bold\"/></a>";
    sHTM += "<a href=\"javascript:wysiwygCMD('italic');\" style=\"margin-right:5px;\" title=\"Italic\"><img src=\"/DHTMLPlusCM/italic.png\" alt=\"Italic\"/></a>";
    sHTM += "<a href=\"javascript:wysiwygCMD('underline');\" style=\"margin-right:5px;\" title=\"Underline\"><img src=\"/DHTMLPlusCM/underline.png\" alt=\"Underline\"/></a>";
    if (elementType != "A") {
        sHTM += "<a href=\"javascript:wysiwygCMD('CreateLink');\" style=\"margin-right:5px;\" title=\"Add Hyperlink\"><img src=\"/DHTMLPlusCM/hyperlinkdialog.png\" alt=\"Hyperlink\"/></a>";
        //sHTM += "<a href=\"javascript:wysiwygCMD('InsertImage');\" style=\"margin-right:5px;\" title=\"Add Image\"><img src=\"/DHTMLPlusCM/gallery.png\"/></a>";
    }
    sHTM += "<a href=\"javascript:emoticonPOPUP();\" style=\"margin-right:15px;\" title=\"Emoticons\"><img src=\"/DHTMLPlusCM/emoticon.png\" alt=\"Emoticon\"/></a>";
    sHTM += "<a href=\"javascript:pastePOPUP();\" style=\"margin-right:5px;\" title=\"Content Cleaner\"><img src=\"/DHTMLPlusCM/paste.png\" alt=\"Paste\"/></a>";
    sHTM += "<a href=\"javascript:propertiesWYSIWYG();\" style=\"margin-right:5px;\" title=\"Properties\"><img src=\"/DHTMLPlusCM/properties.png\" alt=\"Properties\"/></a>";
    sHTM += "<a href=\"javascript:htmlPOPUP();\" style=\"margin-right:15px;\" title=\"HTML Edit\"><img src=\"/DHTMLPlusCM/html.png\" alt=\"HTML Edit\"/></a>";
    sHTM += "<a href=\"javascript:saveWYSIWYG();\" title=\"Save\"><img src=\"/DHTMLPlusCM/save.png\" alt=\"Save\"/></a>";
    sHTM = htmPopupHeader(sHTM, "cancelWYSIWYG();");
    toolBar.innerHTML = htmPopupTab("Last Updated:  User:") + sHTM;
}
function emoticonPOPUP() {
    if (emoticonHTML == "") {
        if (window.XMLHttpRequest) { var request = new XMLHttpRequest(); } else { var request = new ActiveXObject("MSXML2.XMLHTTP.3.0"); }
        request.open("GET", "/websitecontrol/Emoticons/emoticon.htm", false);
        request.setRequestHeader("Content-Type", "text/plain");
        request.send(null);
        emoticonHTML = request.responseText;
    }
    toolBarPopup.style.width = "600px";
    toolBarPopup.style.height = "";
    var sHTM = "";
    sHTM += formPopupHeader("Emoticions");
    sHTM += "<div class=\"popupContent\">";
    sHTM += emoticonHTML;
    sHTM += "</div>";
    sHTM += formPopupFooter("<button onclick=\"cancelPopup();\">Cancel</button>");
    toolBarPopup.innerHTML = sHTM;
    toolBarPopup.style.visibility = "visible";
    showHideGradiant(true);
}
function htmlPOPUP() {
    toolBarPopup.style.width = "700px";
    toolBarPopup.style.height = "";
    var sHTM = "";
    sHTM += formPopupHeader("HTML Edit");
    sHTM += "<div class=\"popupContent\">";
    sHTM += "<div class=\"FPL\">Use the HTML Edit with caution. This is for Advanced users.</div>";
    sHTM += "<textarea id=\"htmlEditArea\" style=\"width:685px;height:210px;border:2px solid #888888;\">" + activeWYSIWYG.innerHTML + "</textarea>";
    sHTM += "</div>";
    sHTM += formPopupFooter("<button onclick=\"cancelPopup();\">Cancel</button><button onclick=\"updateHTML();\">Update</button>");
    toolBarPopup.innerHTML = sHTM;
    toolBarPopup.style.visibility = "visible";
    showHideGradiant(true);
    try { document.getElementById("pasteThis").focus(); } catch (e) { }
}
function updateHTML() {activeWYSIWYG.innerHTML = document.getElementById("htmlEditArea").value;toolBarPopup.innerHTML = "";cancelPopup();activeWYSIWYG.focus();}
function pastePOPUP() {
    activeWYSIWYG.focus();
    if (typeof document.selection != 'undefined') {
        selectedRange = document.selection.createRange();
        activeWYSIWYG.blur();
        document.body.focus();
        alert("Click Ok to load the Content Cleaner.");
    } else if (typeof window.getSelection != 'undefined') {
        selectedRange = window.getSelection(); selectedRangeOffset = selectedRange.anchorOffset;
    }
    toolBarPopup.style.width = "600px";
    toolBarPopup.style.height = "";
    var sHTM = "";
    sHTM += formPopupHeader("Content Cleaner");
    sHTM += "<div class=\"popupContent\">";
    sHTM += "<div class=\"FPL\">Paste you content to be cleaned below.</div>";
    sHTM += "<textarea id=\"pasteThis\" style=\"width:585px;height:210px;border:2px solid #888888;\"></textarea>";
    sHTM += "</div>";
    sHTM += formPopupFooter("<button onclick=\"cancelPopup();\">Cancel</button><button onclick=\"pasteSAVE();\">Paste</button>");
    toolBarPopup.innerHTML = sHTM;
    toolBarPopup.style.visibility = "visible";
    showHideGradiant(true);
    try { document.getElementById("pasteThis").focus(); } catch (e) { }
}
function pasteSAVE() {
    var unCleanText = document.getElementById("pasteThis").value;
    var cleanText = unCleanText.replace(/(<([^>]+)>)/ig, " ");
    cleanText = cleanText.trim();
    cleanText = cleanText.replace("\n", "<br />");
    toolBarPopup.innerHTML = "";
    cancelPopup();
    activeWYSIWYG.focus();
    if (typeof document.selection != 'undefined') {
        selectedRange.pasteHTML(cleanText);
    }
    else if (typeof window.getSelection != 'undefined') {
        var currentText = activeWYSIWYG.innerHTML;
        activeWYSIWYG.innerHTML = currentText.substring(0, selectedRangeOffset) + cleanText + currentText.substring(selectedRangeOffset);
    }
}
function propertiesWYSIWYG() {
    showHideGradiant(true);
    var pObject = getRangeNode();
    toolBarPopup.style.width = "400px";
    toolBarPopup.style.height = "";
    var sHTM = "";
    sHTM += formPopupHeader("Properties");
    sHTM += "<div class=\"popupContent\">";
    sHTM += "<div class=\"FPL\">Type: <span>" + pObject.nodeName + "</span></div>";
    sHTM += "<div class=\"FPL\">Node ID: <span>" + pObject.id + "</span></div>";
    sHTM += "<div class=\"FPL\">CSS Class Name: <span>" + pObject.className + "</span></div>";
    //sHTM += "<div class=\"FPL\">In-line Style: <span>"+pObject.getAttribute("style")+"</span></div>";
    sHTM += "</div>";
    sHTM += formPopupFooter("<button onclick=\"cancelPopup();\">Close</button>");
    toolBarPopup.innerHTML = sHTM;
    toolBarPopup.style.visibility = "visible";
}
function saveWYSIWYG() {
    var currentURL = document.location.href;
    var slash = currentURL.split("/");
    if (currentURL.endsWith("/") && currentURL.indexOf("/blog/") > 0) {
        currentURL += "blog.htm";
    }
    else if (slash.length == 4 && !currentURL.endsWith(".htm")) {
        currentURL += "home.htm";
    }
    else if (currentURL.endsWith("/")) {
        subURL = currentURL.substring(7);
        subURL = subURL.split("/");
        currentURL += subURL[1] + ".htm";
    }
    var sData = escape(activeWYSIWYG.innerHTML);
    sData = escape(sData.replace(/\+/g, "&#43;"));
    if (window.XMLHttpRequest) { var request = new XMLHttpRequest(); } else { var request = new ActiveXObject("MSXML2.XMLHTTP.3.0"); }
    request.open("POST", currentURL.replace(".htm", ".htm.content"), false);
    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    request.send("MODE=CONTENT-UPDATE&FIELD=" + activeWYSIWYG.id + "&DATA=" + sData);
    var sResponse = request.responseText;
    if (sResponse == "OK") {
        activeWYSIWYG.style.backgroundColor = activeWYSIWYG_BG;
        activeWYSIWYG.style.color = activeWYSIWYG_FG;
        activeWYSIWYG = null;
        activeWYSIWYG_Content = "";
        hideToolbar();
    } else {
        alert(sResponse);
    }
}
function wysiwygCMD(cmd) {
    activeWYSIWYG.focus();
    var selectText = null;
    if (typeof document.selection != 'undefined') {
        selectedRange = document.selection.createRange();
        selectedText = selectedRange.text;
    }
    else if (typeof window.getSelection != 'undefined') {
        selectedRange = window.getSelection();
        selectedText = selectedRange.getRangeAt(0);
    }
    if (cmd == "CreateLink") { hyperlink_ADD(selectedText); }
    else if (cmd == "InsertImage") { image_ADD(selectedText); }
    else { document.execCommand(cmd, null, null); }
}

function hyperlink_ADD(selectedText) {
    if (selectedText != "") {
        var url = prompt("Enter the url for this hyperlink", "");
        if (url != null && url != "") { document.execCommand("CreateLink", false, url); }
    } else { alert("No text selected"); }
}

function hyperlink_ADD2(selectedText) {
    //-- not used, use hyperlink_ADD
    if (selectedText != "") {
        showHideGradiant(true);
        var sHTM = "";
        sHTM += formPopupHeader("Add Image");
        sHTM += "<div class=\"popupContent\">";
        sHTM += "<div class=\"FPL\">Enter the url for this hyperlink<br/></div>";
        sHTM += "<input id=\"newURL\" type=\"text\" class=\"textbox\" style=\"width:425px;\" value=\"\" onblur=\"javascript:cancelHelp();\" onclick=\"javascript:loadHelp(this,'Avoid use of special charaters and spaces.');\"/>";
        sHTM += "</div>";
        sHTM += formPopupFooter("<button onclick=\"cancelPopup();\">Cancel</button><button onclick=\"hyperlink_INSERT(document.getElementById('newURL').value);\">Add Link</button>");
        toolBarPopup.innerHTML = sHTM;
        toolBarPopup.style.top = (getTopScroll() + 50) + "px";
        toolBarPopup.style.width = "450px";
        toolBarPopup.style.height = "";
        toolBarPopup.style.visibility = "visible";
    } else { alert("No text selected"); }
}
function hyperlink_INSERT(url) {
    //-- called from hyperlink_ADD2
    if (url != null && url != "") {
        activeWYSIWYG.focus();
        alert(selectedRange.select());
        selectedRange.select();
        document.execCommand("CreateLink", false, url);
        cancelPopup();
    } else { alert("URL is blank"); }
}
function image_ADD(selectedText) {
    if (selectedText == "") {
        showHideGradiant(true);
        var currentURL = document.location.href;
        if (currentURL.endsWith("/")) { currentURL += "home.htm"; }
        if (window.XMLHttpRequest) { var request = new XMLHttpRequest(); } else { var request = new ActiveXObject("MSXML2.XMLHTTP.3.0"); }
        var postUrl = currentURL.replace(".htm", ".htm.content") + "?MODE=GET-IMAGE-PREVIEW";
        request.open("GET", postUrl, false);
        request.setRequestHeader("Content-Type", "text/plain");
        request.send(null);
        var sResponse = request.responseText;
        toolBarPopup.style.width = "450px";
        toolBarPopup.style.height = "";
        var sHTM = "";
        sHTM += formPopupHeader("Add Image");
        sHTM += "<div class=\"popupContent\">";
        sHTM += "<div style=\"overflow-x:scroll;width:428px;\"><table><tr>";
        sHTM += sResponse;
        sHTM += "</tr></table></div>";
        sHTM += "</div>";
        sHTM += formPopupFooter("<button onclick=\"cancelPopup();\">Cancel</button>");
        toolBarPopup.innerHTML = sHTM;
        toolBarPopup.style.visibility = "visible";
    } else { alert("Unselect text"); }
}
function image_INSERT(imageName) { document.execCommand("InsertImage", false, "/images/" + imageName); cancelPopup(); }
function hideToolbar() { toolBar.innerHTML = ""; toolBar.style.visibility = "hidden"; }

function templateDELETE() {
    if (confirm("Are you sure you want to DELETE this content area from this template?\nNOTE: This will apply to all other pages that use this template.")) {
        var currentURL = document.location.href;
        if (currentURL.endsWith("/")) { currentURL += "home.htm"; }
        if (window.XMLHttpRequest) { var request = new XMLHttpRequest(); } else { var request = new ActiveXObject("MSXML2.XMLHTTP.3.0"); }
        var postUrl = currentURL.replace(".htm", ".htm.content") + "?MODE=DELETE-CONTENT-AREA&FIELD=" + activeWYSIWYG.id;
        request.open("GET", postUrl, false);
        request.setRequestHeader("Content-Type", "text/plain");
        request.send(null);
        var sResponse = request.responseText;
        if (sResponse == "OK") {
            window.location.reload(true);
        } else {
            alert(sResponse);
        }
    }
}
function deactivateTEMPLATE() { }
function cancelTEMPLATE() {
    activeWYSIWYG.style.backgroundColor = activeWYSIWYG_BG;
    activeWYSIWYG.style.color = activeWYSIWYG_FG;
    activeWYSIWYG = null;
    toolBar.style.visibility = "hidden";
    toolBarPopup.style.visibility = "hidden";
    toolBar.innerHTML = "";
}
function templateSTYLE() {
    toolBarPopup.style.width = "400px";
    toolBarPopup.style.height = "";
    var sHTM = "";
    sHTM += "Class: " + activeWYSIWYG.className;

    sHTM += "<div style=\"margin:10px 0px 0px 20px;\"><button onclick=\"cancelPopup();\">Cancel</button><button onclick=\"applyTemplateSTYLE();\">Apply</button></div>";
    toolBarPopup.innerHTML = sHTM;
    toolBarPopup.style.visibility = "visible";
}
function templateINSERT(insertPosition) {
    var sHTM = "";
    sHTM += formPopupHeader("Insert " + insertPosition);
    sHTM += "<div class=\"popupContent\">";
    sHTM += "<form id=\"templateInsertForm\" name=\"templateInsertForm\" method=\"get\" action=\"\" onsubmit=\"return false;\">";
    sHTM += "<input type=\"hidden\" id=\"insertPosition\" name=\"insertPosition\" value=\"" + insertPosition + "\"/>";
    sHTM += "<div class=\"FPL\"><span>To add a new content area " + insertPosition + " this item. Complete the following form and click apply.</span></div>";
    sHTM += "<div class=\"FPL\">Content ID: ";
    //sHTM += "<input type=\"text\" id=\"newFieldId\" name=\"newFieldId\" value=\"\" class=\"textbox\" style=\"width:250px;\" onblur=\"javascript:cancelHelp();\" onclick=\"javascript:loadHelp(this,'Each area on the page needs a unique id. Don not use space, -, or quotes in the name.');\"/></div>";
    sHTM += "<div class=\"FPL\">Select a Content Area style.</div>";
    if (window.XMLHttpRequest) { var request = new XMLHttpRequest(); } else { var request = new ActiveXObject("MSXML2.XMLHTTP.3.0"); }
    request.open("GET", "/ContentAreaTypes.content?MODE=GET-CONTENT-AREA-TYPES", false);
    request.setRequestHeader("Content-Type", "text/plain");
    request.send(null);
    sHTM += request.responseText;
    sHTM += "</form></div></div>";
    sHTM += formPopupFooter("<button onclick=\"cancelPopup();\">Cancel</button><button onclick=\"applyTemplateINSERT();\">Apply</button>");
    toolBarPopup.innerHTML = sHTM;
    toolBarPopup.style.width = "450px";
    toolBarPopup.style.height = "";
    toolBarPopup.style.visibility = "visible";
    showHideGradiant(true);
}
function applyTemplateINSERT() {
    //var sNewField = document.templateInsertForm.newFieldId.value;
    var sInsertPosition = document.templateInsertForm.insertPosition.value;
    var selectedValue = getRadioValue(document.templateInsertForm.templateInsert);
    if (selectedValue != "") {
        var currentURL = document.location.href;
        if (currentURL.endsWith("/")) { currentURL += "home.htm"; }
        if (window.XMLHttpRequest) { var request = new XMLHttpRequest(); } else { var request = new ActiveXObject("MSXML2.XMLHTTP.3.0"); }
        var postUrl = currentURL.replace(".htm", ".htm.content") + "?MODE=ADD-CONTENT-AREA&NEWFIELDTYPE=" + selectedValue + "&FIELD=" + activeWYSIWYG.id + "&INSERT=" + sInsertPosition;
        request.open("GET", postUrl, false);
        request.setRequestHeader("Content-Type", "text/plain");
        request.send(null);
        var sResponse = request.responseText;
        if (sResponse == "OK") { window.location.reload(true); } else { alert(sResponse); }
    } else { alert("Missing required information."); }
}
//-- other stuff
function getRadioValue(radioObj) { if (!radioObj) { return ""; } var radioLength = radioObj.length; if (radioLength == undefined) { if (radioObj.checked) { return radioObj.value; } else { return ""; } } for (var i = 0; i < radioLength; i++) { if (radioObj[i].checked) { return radioObj[i].value; } } return ""; } 
function metadataPopup() {
    try { hideAllMenus(); } catch (e) { }
    showHideGradiant(true);
    var currentURL = document.location.href;
    var subEnd = currentURL.indexOf(".");
    currentURL = "www" + currentURL.substring(subEnd);
    var sHTM = "";
    sHTM += formPopupHeader("Page Metadata");
    sHTM += "<div class=\"popupContent\">";
    sHTM += "<div class=\"FPL\">Page Title</div>";
    sHTM += "<input id=\"metadataPageTitle\" type=\"text\" class=\"textbox\" style=\"width:425px;\" value=\"" + getMETADATA("pageTitle") + "\" onblur=\"javascript:cancelHelp();\" onclick=\"javascript:loadHelp(this,'Enter the title for this page. Avoid use of special charaters. Use words that also apear in you page for SEO boost.');\"/>";
    sHTM += "<div class=\"FPL\">Page Meta Keywords</div>";
    sHTM += "<textarea id=\"metadataKeywords\" class=\"textbox\" style=\"height:40px;\" onblur=\"javascript:cancelHelp();\" onclick=\"javascript:loadHelp(this,'Enter keyworks seperated by , to help search engines index this page. Use words that apply to the content on this page.');\">" + getMETADATA("keywords") + "</textarea>";
    sHTM += "<div class=\"FPL\">Page Meta Description</div>";
    sHTM += "<textarea id=\"metadataDescription\" class=\"textbox\" style=\"height:80px;\" onblur=\"javascript:cancelHelp();\" onclick=\"javascript:loadHelp(this,'Enter a description for this page. This is used by the search engine when displaying this page in search results.');\">" + getMETADATA("description") + "</textarea>";
    var oLinks = document.getElementsByTagName("a"); iLinkCount = 0;
    for (var i in oLinks) { try { if (oLinks[i].href.toLowerCase().startsWith("javascript") == false) { iLinkCount++; } } catch (e) { } }
    sHTM += "<div style=\"float:right;\">";
    sHTM += "<div style=\"background-image:url(/DHTMLPlusCM/link-count.png);width:119px;height:24px;text-align:center;padding-top:33px;\">" + iLinkCount + "</div>";
    //sHTM += "<a id=\"Khrido_Link_147531BE\" href=\"http://tools.khrido.com/\" target=\"_blank\" title=\"Check PageRank\"><img src=\"http://www.khrido.com/plugins/img/pr/checkpr.gif\" alt=\"Check PageRank\" border=\"0\" /></a><script type=\"text/javascript\">Khrido_PR_Type = \"1\";</script><script src=\"http://www.khrido.com/plugins/js/pagerank.js\" type=\"text/javascript\"></script>";
    sHTM += "</div>";
    sHTM += "<div class=\"FPL\"><input id=\"metadataNoFollow\" type=\"checkbox\"";
    var tmpStr = getMETADATA("noFollow"); if (tmpStr == "true") { sHTM += " checked=\"true\""; }
    sHTM += "/> Add \"no Follow\" for this page</div>";
    sHTM += "<div class=\"FPL\"><input id=\"metadataSitemap\" type=\"checkbox\"";
    var tmpStr = getMETADATA("sitemap"); if (tmpStr == "true") { sHTM += " checked=\"true\""; }
    sHTM += "/> Include this page in sitemap.</div>";
    sHTM += "<div style=\"height:30px;\"></div>";
    sHTM += "</div>";
    sHTM += formPopupFooter("<button onclick=\"cancelPopup();\">cancel</button><button onclick=\"applyMETADATA();\">save</button>");
    toolBarPopup.style.top = (getTopScroll() + 50) + "px";
    toolBarPopup.style.left = "50px";
    toolBarPopup.style.width = "450px";
    toolBarPopup.style.height = "360px";
    toolBarPopup.innerHTML = sHTM;
    toolBarPopup.style.visibility = "visible";
}
function getMETADATA(getField) {
    var currentURL = document.location.href;
    var slash = currentURL.split("/");
    if (currentURL.endsWith("/") && currentURL.indexOf("/blog/") > 0) {
        currentURL += "blog.htm";
    }
    else if (slash.length == 4 && !currentURL.endsWith(".htm")) {
        currentURL += "home.htm";
    }
    else if (currentURL.endsWith("/")) {
        subURL = currentURL.substring(7);
        subURL = subURL.split("/");
        currentURL += subURL[1] + ".htm";
    }
    if (window.XMLHttpRequest) { var request = new XMLHttpRequest(); } else { var request = new ActiveXObject("MSXML2.XMLHTTP.3.0"); }
    request.open("GET", currentURL.replace(".htm", ".htm.content") + "?MODE=GET-METADATA&FIELD=" + getField, false);
    request.setRequestHeader("Content-Type", "text/plain");
    request.send(null);
    return request.responseText;
}
function applyMETADATA() {
    var saveErrors = "";
    saveErrors += saveMETADATA("text", "metadataPageTitle", "pageTitle", "Page Title");
    saveErrors += saveMETADATA("text", "metadataKeywords", "keywords", "Keywords");
    saveErrors += saveMETADATA("text", "metadataDescription", "description", "Description");
    saveErrors += saveMETADATA("check", "metadataNoFollow", "noFollow", "No Follow");
    saveErrors += saveMETADATA("check", "metadataSitemap", "sitemap", "Sitemap");
    if (saveErrors == "") { window.location.reload(true); } else { alert(saveErrors); }
}
function saveMETADATA(sType, formField, saveField, errorTag) {
    var sData;
    var oField = document.getElementById(formField);
    if (sType == "check") { sData = oField.checked; } else { sData = oField.value; sData = escape(sData.replace(/\+/g, "&#43;")); }
    var currentURL = document.location.href;
    var slash = currentURL.split("/");
    if (currentURL.endsWith("/") && currentURL.indexOf("/blog/") > 0) {
        currentURL += "blog.htm";
    }
    else if (slash.length == 4 && !currentURL.endsWith(".htm")) {
        currentURL += "home.htm";
    }
    else if (currentURL.endsWith("/")) {
        subURL = currentURL.substring(7);
        subURL = subURL.split("/");
        currentURL += subURL[1] + ".htm";
    }
    if (window.XMLHttpRequest) { var request = new XMLHttpRequest(); } else { var request = new ActiveXObject("MSXML2.XMLHTTP.3.0"); }
    request.open("POST", currentURL.replace(".htm", ".htm.content"), false);
    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    request.send("MODE=SAVE-METADATA&FIELD=" + saveField + "&DATA=" + sData);
    var sResponse = request.responseText;
    if (sResponse != "OK") { return errorTag + ": " + sResponse + "\n"; } else { return ""; }
}
function robotsPopup() {
    try { hideAllMenus(); } catch (e) { }
    showHideGradiant(true);
    if (window.XMLHttpRequest) { var request = new XMLHttpRequest(); } else { var request = new ActiveXObject("MSXML2.XMLHTTP.3.0"); }
    request.open("GET", "/robots.content?MODE=GET-ROBOTS", false);
    request.setRequestHeader("Content-Type", "text/plain");
    request.send(null);
    var sResponse = request.responseText;
    var sHTM = "";
    sHTM += formPopupHeader("Site Robots File");
    sHTM += "<div class=\"popupContent\">";
    sHTM += "<textarea id=\"robotsTXT\" class=\"textbox\" style=\"height:280px;\" onblur=\"javascript:cancelHelp();\" onclick=\"javascript:loadHelp(this,'Enter your robots.text data.');\">" + sResponse + "</textarea>";
    sHTM += "</div>";
    sHTM += formPopupFooter("<button onclick=\"cancelPopup();\">Cancel</button><button onclick=\"applyROBOTS();\">Save</button>");
    toolBarPopup.style.top = (getTopScroll() + 50) + "px";
    toolBarPopup.style.left = "50px";
    toolBarPopup.style.width = "450px";
    toolBarPopup.style.height = "360px";
    toolBarPopup.innerHTML = sHTM;
    toolBarPopup.style.visibility = "visible";
}
function applyROBOTS() {
    var sData = document.getElementById("robotsTXT").value;
    sData = escape(sData.replace(/\+/g, "&#43;"));
    if (window.XMLHttpRequest) { var request = new XMLHttpRequest(); } else { var request = new ActiveXObject("MSXML2.XMLHTTP.3.0"); }
    request.open("POST", "/robots.content", false);
    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    request.send("MODE=SAVE-ROBOTS&DATA=" + sData);
    var sResponse = request.responseText;
    if (sResponse == "OK") { cancelPopup(); alert("Changes Saved."); } else { alert(sResponse); }
}

function brokenLinkPopup() {
    var currentURL = document.location.href;
    try { hideAllMenus(); } catch (e) { }
    showHideGradiant(true);
    var sHTM = "";
    sHTM += formPopupHeader("Broken Link Checker");
    sHTM += "<div class=\"popupContent\">";
    if (window.XMLHttpRequest) { var request = new XMLHttpRequest(); } else { var request = new ActiveXObject("MSXML2.XMLHTTP.3.0"); }
    request.open("GET", "/PHP/broken_link_checker.php?url=" + currentURL, false);
    request.setRequestHeader("Content-Type", "text/plain");
    request.send(null);
    var sResponse = request.responseText;
    sHTM += "<div class=\"FPL\">" + sResponse + "</div>";
    sHTM += "</div>";
    sHTM += formPopupFooter("<button onclick=\"cancelPopup();\">Close</button>");
    toolBarPopup.style.top = (getTopScroll() + 50) + "px";
    toolBarPopup.style.left = "50px";
    toolBarPopup.style.width = "450px";
    toolBarPopup.style.height = "360px";
    toolBarPopup.innerHTML = sHTM;
    toolBarPopup.style.visibility = "visible";
}
function memberService(menuSelect) {
    if (menuSelect == "page.navigation") { setCookie("mode", "Navigation"); window.location.reload(true); }
    else if (menuSelect == "page.content") { setCookie("mode", "Content"); window.location.reload(true); }
    else if (menuSelect == "page.template") { setCookie("mode", "Template"); window.location.reload(true); }
    else { alert("Feature not Available."); }
}
function publishPage() {
    try { hideAllMenus(); } catch (e) { }
    showHideGradiant(true);
    var sHTM = "";
    sHTM += formPopupHeader("Page Publish");
    sHTM += "<div class=\"popupContent\">";
    var currentURL = document.location.href;
    var subDomains = currentURL.split(".");
    subDomains[0] = subDomains[0].toLowerCase().replace("http://", "");
    subDomains[2] = subDomains[2].replace("/", "").replace("?", "");
    if (subDomains[0] == "preview") {
        sHTM += "<div class=\"FPL\">Select The Items you want to publish.<br/></div>";
        sHTM += "<div class=\"FPL\"><input id=\"publishTemplate\" type=\"checkbox\" checked=\"true\" onblur=\"javascript:cancelHelp();\" onclick=\"javascript:loadHelp(this,'Check this box if you wish to publish this page template');\"/> Publish Template</div>";
        sHTM += "<div class=\"FPL\"><input id=\"publishContent\"  type=\"checkbox\" checked=\"true\" onblur=\"javascript:cancelHelp();\" onclick=\"javascript:loadHelp(this,'Check this box if you wish to publish the content on this page');\"/> Publish Content</div>";
        sHTM += "<div class=\"FPL\"><input id=\"publishMaster\"  type=\"checkbox\" checked=\"true\" onblur=\"javascript:cancelHelp();\" onclick=\"javascript:loadHelp(this,'Publish the Master Page for this Page');\"/> Publish Master Page</div>";
        sHTM += "<div class=\"FPL\"><input id=\"publishCSS\"  type=\"checkbox\" checked=\"true\" onblur=\"javascript:cancelHelp();\" onclick=\"javascript:loadHelp(this,'Publish the Style Sheets for this Page');\"/> Publish CSS (Style Sheet)</div>";
        sHTM += "<div class=\"FPL\"><input id=\"publishImages\"  type=\"checkbox\" checked=\"true\" onblur=\"javascript:cancelHelp();\" onclick=\"javascript:loadHelp(this,'Publish the Images for this Page');\"/> Publish Images</div>";
        sHTM += "</div>";
        sHTM += formPopupFooter("<button onclick=\"cancelPopup();\">Cancel</button><button onclick=\"publishSingle();\">Publish Page</button>");
    } else {
        sHTM += "<div class=\"FPL\">Publish is only available from preview." + subDomains[1] + "." + subDomains[2] + "</div><br/><br/>";
        sHTM += "</div>";
        sHTM += formPopupFooter("<button onclick=\"cancelPopup();\">Close</button>");
    }
    toolBarPopup.style.top = (getTopScroll() + 50) + "px";
    toolBarPopup.style.left = "50px";
    toolBarPopup.style.width = "450px";
    toolBarPopup.style.height = "360px";
    toolBarPopup.innerHTML = sHTM;
    toolBarPopup.style.visibility = "visible";
}
function publishSingle() {
    var sContent;
    var sTemplate;
    sContent = document.getElementById("publishContent").checked;
    sTemplate = document.getElementById("publishTemplate").checked;
    var currentURL = document.location.href;
    if (currentURL.endsWith("/")) { currentURL += "home.htm"; }
    if (window.XMLHttpRequest) { var request = new XMLHttpRequest(); } else { var request = new ActiveXObject("MSXML2.XMLHTTP.3.0"); }
    request.open("POST", currentURL.replace(".htm", ".htm.content"), false);
    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    request.send("MODE=PUBLISH-SINGLE-PAGE&FIELD=" + sTemplate + "&DATA=" + sContent);
    var sResponse = request.responseText;
    if (sResponse == "OK") { cancelPopup(); alert("Publish Complete."); } else { alert(sResponse); }
}
function copyPage() {
    try { hideAllMenus(); } catch (e) { }
    showHideGradiant(true);
    var sHTM = "";
    sHTM += formPopupHeader("Copy This Page");
    sHTM += "<div class=\"popupContent\">";
    var currentURL = document.location.href;
    var subDomains = currentURL.split(".");
    subDomains[0] = subDomains[0].toLowerCase().replace("http://", "");
    subDomains[2] = subDomains[2].replace("/", "").replace("?", "");
    if (subDomains[0] == "preview") {
        sHTM += "<div class=\"FPL\">This feature allows you to copy the current page to a new page.<br/></div>";
        sHTM += "<div class=\"FPL\">";
        sHTM += "<input id=\"copyTemplate\" type=\"checkbox\" checked=\"true\" onblur=\"javascript:cancelHelp();\" onclick=\"javascript:loadHelp(this,'Check this box if you wish to copy this page template');\"/> Publish<br/>";
        sHTM += "<input id=\"copyContent\"  type=\"checkbox\" checked=\"true\" onblur=\"javascript:cancelHelp();\" onclick=\"javascript:loadHelp(this,'Check this box if you wish to copy the content on this page');\"/> Publish Content";
        sHTM += "</div>";
        sHTM += "<div class=\"FPL\">Enter new Url name.<br/></div>";
        sHTM += "<div class=\"FPL\"><input id=\"newURL\" type=\"text\" value=\"/\" class=\"textbox\" style=\"width:425px;\" onblur=\"javascript:cancelHelp();\" onclick=\"javascript:loadHelp(this,'Check this box if you wish to copy the content on this page');\"/></div>";
        sHTM += "<br/><div class=\"FPL\">Example: /info/product/new/<br/>";
        sHTM += "This will create a template called <i style=\"color:red;\">info</i> and a content page called <i style=\"color:red;\">product-new</i>.<br/>The first parameter is required and is used for the template name.";
        sHTM += "</div>";
        sHTM += "</div>";
        sHTM += formPopupFooter("<button onclick=\"cancelPopup();\">Cancel</button><button onclick=\"copySingle();\">Copy Page</button>");
    } else {
        sHTM += "<div class=\"FPL\">Page Copy is only available from preview." + subDomains[1] + "." + subDomains[2] + "</div><br/><br/>";
        sHTM += "</div>";
        sHTM += formPopupFooter("<button onclick=\"cancelPopup();\">Close</button>");
    }
    toolBarPopup.style.top = (getTopScroll() + 50) + "px";
    toolBarPopup.style.left = "50px";
    toolBarPopup.style.width = "450px";
    toolBarPopup.style.height = "360px";
    toolBarPopup.innerHTML = sHTM;
    toolBarPopup.style.visibility = "visible";
}
function copySingle() {
    var sContent;
    var sTemplate;
    var sUrl;
    sContent = $("copyContent").checked;
    sTemplate = $("copyTemplate").checked;
    sUrl = $("newURL").value;
    var currentURL = document.location.href;
    if (currentURL.endsWith("/")) { currentURL += "home.htm"; }
    if (window.XMLHttpRequest) { var request = new XMLHttpRequest(); } else { var request = new ActiveXObject("MSXML2.XMLHTTP.3.0"); }
    request.open("POST", currentURL.replace(".htm", ".htm.content"), false);
    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    request.send("MODE=COPY-SINGLE-PAGE&FIELD=" + sTemplate + "&DATA=" + sContent + "&NEWURL=" + sUrl);
    var sResponse = request.responseText;
    if (sResponse == "OK") { cancelPopup(); alert("Copy Complete."); document.location.href = sUrl; } else { alert(sResponse); }
}
function uploadImages() {
    headerLoadScript("/scripts/dhtmlXVault.js");
    headerLoadCSS("/scripts/dhtmlXVault.css");
    try { hideAllMenus(); } catch (e) { }
    showHideGradiant(true);
    var sHTM = "";
    sHTM += formPopupHeader("Upload Images");
    sHTM += "<div class=\"popupContent\">";
    sHTM += "<div id=\"vaultDiv\">--</div>";
    sHTM += "<script>vault=new dhtmlXVaultObject();vault.setImagePath(\"/scripts/imgs/\");";
    sHTM += "vault.setServerHandlers(\"aspx/UploadHandler.ashx\",\"aspx/GetInfoHandler.ashx\",\"aspx/GetIdHandler.ashx\");";
    sHTM += "vault.create(\"vaultDiv\");";
    sHTM += "</script>";
    sHTM += "</div>";
    sHTM += formPopupFooter("<button onclick=\"cancelPopup();\">Close</button>");
    toolBarPopup.style.top = (getTopScroll() + 50) + "px";
    toolBarPopup.style.left = "50px";
    toolBarPopup.style.width = "450px";
    toolBarPopup.style.height = "360px";
    toolBarPopup.innerHTML = sHTM;
    toolBarPopup.style.visibility = "visible";
    headerLoadScriptString("var vault=new dhtmlXVaultObject();\nvault.setImagePath(\"/scripts/imgs/\");\nvault.setServerHandlers(\"aspx/UploadHandler.ashx\",\"aspx/GetInfoHandler.ashx\",\"aspx/GetIdHandler.ashx\");\nvault.create(\"vaultDiv\");");
}
function siteMenus() {alert("feature not available");}
function siteMap() {
    try { hideAllMenus(); } catch (e) { }
    showHideGradiant(true);
    var sHTM = "";
    sHTM += formPopupHeader("Manage Sitemap");
    sHTM += "<div class=\"popupContent\">";
    sHTM += "<iframe src=\"/site-admin/siteMapEdit.aspx\" style=\"height:410px;width:800px;border:0px;background-color:transparent;\"></iframe>";
    sHTM += "</div>";
    sHTM += formPopupFooter("<button onclick=\"cancelPopup();\">Close</button>");
    toolBarPopup.style.top = (getTopScroll() + 50) + "px";
    toolBarPopup.style.left = "50px";
    toolBarPopup.style.width = "814px";
    toolBarPopup.style.height = "525px";
    toolBarPopup.innerHTML = sHTM;
    toolBarPopup.style.visibility = "visible";
    headerLoadScriptString("var vault=new dhtmlXVaultObject();\nvault.setImagePath(\"/scripts/imgs/\");\nvault.setServerHandlers(\"aspx/UploadHandler.ashx\",\"aspx/GetInfoHandler.ashx\",\"aspx/GetIdHandler.ashx\");\nvault.create(\"vaultDiv\");");
}
function siteLogs() {alert("feature not available");}
function loadSubMenu(aLinkId, subDivId, clearMenus) {
    hideSubMenus(clearMenus);
    var oSubMenu = document.getElementById(subDivId);
    oSubMenu.style.top = ($("#" + aLinkId).offset().top - $("#" + aLinkId).scrollTop() + 3) + "px";
    oSubMenu.style.left = ($("#" + aLinkId).offset().left - $("#" + aLinkId).scrollLeft() + $("#" + aLinkId).outerWidth(true) - 2) + "px";
    oSubMenu.style.display = "";
}
function hideSubMenus(clearLevel) {
    if (clearLevel) {
        try { $(".WebSiteLevel3Menu").css("display", "none"); } catch (e) { }
    }
    try { $(".WebSiteLevel2Menu").css("display","none"); } catch (e) { }
}
function loadMainMenu() {
    try { cancelWYSIWYG(); } catch (e) { }
    var tmpObj = document.getElementById("WebSiteToolBarMenu");
    if (tmpObj.style.display == "") { closeMainMenu(); } else { tmpObj.style.display = ""; }
}
function hideAllMenus() {
    try { document.getElementById("WebSiteToolBarMenu").style.display = "none"; } catch (e) { }
    hideSubMenus(true);
}
function closeMainMenu() { document.getElementById("WebSiteToolBarMenu").style.display = "none"; hideSubMenus(true); }
function launchDashboard() { hideAllMenus(); window.open("/dashboard/", "WebSiteDashboard"); }
function launchProducts() { hideAllMenus(); window.open("/products.aspx", "ProductDashboard"); }
function launchLuceneBuild() { hideAllMenus(); window.open("/lucene.aspx", "LuceneBuild"); }
function launchProductBrands() { hideAllMenus(); window.open("/products-brand.aspx", "BrandDashboard"); }
function launchPriceList() { hideAllMenus(); window.open("/products-price-list.aspx", "PriceDashboard"); }
function loadURL(sURL, sTarget) { if (sTarget == "") { document.location.href = sURL; } else { hideAllMenus(); window.open(sURL, sTarget); } }
function blogPopup(sMode) {
    try { hideAllMenus(); } catch (e) { }
    showHideGradiant(true);
    //-- get blog data
    var pageTitle = "";
    var blogTags = "";
    var keywords = "";
    var description = "";
    var noFollow = "";
    var sitemap = "";
    if (sMode == "edit") {
        var sResponse = AJAX("POST", "blog.htm.content", "MODE=GET-BLOG-METADATA", "application/x-www-form-urlencoded");
        var qItems = sResponse.split("&");
        for (var x = 0; x < qItems.length; x++) {
            var qItem = qItems[x].split("=");
            if (qItem[0] == "pageTitle") { pageTitle = qItem[1]; }
            if (qItem[0] == "blogTags") { blogTags = qItem[1]; }
            if (qItem[0] == "keywords") { keywords = qItem[1]; }
            if (qItem[0] == "description") { description = qItem[1]; }
            if (qItem[0] == "noFollow") { noFollow = qItem[1]; }
            if (qItem[0] == "sitemap") { sitemap = qItem[1]; }
        }
    }
    //-- load blog form
    var sHTM = "";
    sHTM += formPopupHeader("Blog Post Information");
    sHTM += "<div class=\"popupContent\">";
    sHTM += "<div class=\"FPL\">Post Title</div>";
    if (sMode == "edit") {
        sHTM += "<input id=\"blogTitle\" type=\"text\" class=\"textbox\" style=\"width:425px;\" readonly=\"true\" value=\"" + pageTitle + "\" onblur=\"javascript:cancelHelp();\" onclick=\"javascript:loadHelp(this,'Title is Read-Only. This is for SEO consistency.');\"/>";
    } else {
        sHTM += "<input id=\"blogTitle\" type=\"text\" class=\"textbox\" style=\"width:425px;\" value=\"" + pageTitle + "\" onblur=\"javascript:cancelHelp();\" onclick=\"javascript:loadHelp(this,'Enter a title for your post. Avoid use of special charaters');\"/>";
    }
    sHTM += "<div class=\"FPL\">Assign to Blog(s)</div>";
    sHTM += "<div class=\"textbox\" style=\"background-color:white;width:425px;height:100px;overflow-y:scroll;overflow-x:hidden;\" onblur=\"javascript:cancelHelp();\" onclick=\"javascript:loadHelp(this,'Select Blogs from list. Administrator can add additional Blogs.');\">" + loadBlogTags() + "</div>"
    sHTM += "<div class=\"FPL\">Meta Keywords for Search Engines</div>";
    sHTM += "<textarea id=\"blogMetadataKeywords\" class=\"textbox\" style=\"height:40px;\" onblur=\"javascript:cancelHelp();\" onclick=\"javascript:loadHelp(this,'Enter keywords seperated by , to help search engines index your blog');\">" + keywords + "</textarea>";
    sHTM += "<div class=\"FPL\">Excerpt / Meta Description for Search Engines</div>";
    sHTM += "<textarea id=\"blogMetadataDescription\" class=\"textbox\" style=\"height:40px;\" onblur=\"javascript:cancelHelp();\" onclick=\"javascript:loadHelp(this,'Enter a short description to help search engines index your blog');\">" + description + "</textarea>";
    sHTM += "<div class=\"FPL\"><input id=\"blogMetadataNoIndex\" type=\"checkbox\" style=\"border:none;\" onblur=\"javascript:cancelHelp();\" onclick=\"javascript:loadHelp(this,'Check this box to tell search engines not to index this blog');\"/> Add \"No Follow\" for this page.</div>";
    sHTM += "<div class=\"FPL\"><input id=\"blogSitemap\" type=\"checkbox\" checked=\"true\" style=\"border:none;\" onblur=\"javascript:cancelHelp();\" onclick=\"javascript:loadHelp(this,'Check this box to include this blog in the sitemap');\"/> Include this post in sitemap.</div>";
    sHTM += "</div>";
    if (sMode == "edit") {
        sHTM += formPopupFooter("<button onclick=\"cancelPopup();\">Cancel</button><button onclick=\"saveBLOG();\">Save</button>");
    } else {
        sHTM += formPopupFooter("<button onclick=\"cancelPopup();\">Cancel</button><button onclick=\"newBLOG();\">Save</button>");
    }
    toolBarPopup.style.top = (getTopScroll() + 50) + "px";
    toolBarPopup.style.left = "50px";
    toolBarPopup.style.width = "474px";
    toolBarPopup.style.height = "390px";
    toolBarPopup.innerHTML = sHTM;
    toolBarPopup.style.visibility = "visible";
}
function saveBLOG() {
    var isOK = true;
    var sTitle = document.getElementById("blogTitle").value;
    var sTags = getCheckedTags();
    var sMetadataKeywords = document.getElementById("blogMetadataKeywords").value;
    var sMetadataDescription = document.getElementById("blogMetadataDescription").value;
    var sMetadataNoIndex = document.getElementById("blogMetadataNoIndex").checked;
    var sSitemap = document.getElementById("blogSitemap").checked;
    if (sTitle == "") { isOK = false; }
    if (isOK) {
        sTitle = escape(sTitle.replace(/\+/g, "&#43;"));
        sTags = escape(sTags.replace(/\+/g, "&#43;"));
        sMetadataKeywords = escape(sMetadataKeywords.replace(/\+/g, "&#43;"));
        sMetadataDescription = escape(sMetadataDescription.replace(/\+/g, "&#43;"));
        var postQueryString = "MODE=SAVE-BLOG&FIELD=" + sTitle + "&TAGS=" + sTags + "&METADATAKEYWORDS=" + sMetadataKeywords + "&METAGATADESCRIPTION=" + sMetadataDescription + "&METADATANOINDEX=" + sMetadataNoIndex + "&SITEMAP=" + sSitemap;
        var sResponse = AJAX("POST", "blog.htm.content", postQueryString, "application/x-www-form-urlencoded");
        document.location.href = sResponse;
    } else { alert("Missing Required Fields.\nTitle and Date are required."); }
}
function newBLOG() {
    var isOK = true;
    var currentTime = new Date();
    var blogDate = currentTime.getMonth() + "/" + currentTime.getDate() + "/" + currentTime.getFullYear();
    var blogTime = "";
    if (currentTime.getHours() > 11) {
        blogTime += (currentTime.getHours() - 12) + ":" + currentTime.getMinutes() + " PM";
    } else {
        blogTime += currentTime.getHours() + ":" + currentTime.getMinutes() + " AM";
    }
    var sTitle = document.getElementById("blogTitle").value;
    var sTags = getCheckedTags();
    var sMetadataKeywords = document.getElementById("blogMetadataKeywords").value;
    var sMetadataDescription = document.getElementById("blogMetadataDescription").value;
    var sMetadataNoIndex = document.getElementById("blogMetadataNoIndex").checked;
    var sSitemap = document.getElementById("blogSitemap").checked;
    if (sTitle == "") { isOK = false; }
    if (isOK) {
        sTitle = escape(sTitle.replace(/\+/g, "&#43;"));
        sTags = escape(sTags.replace(/\+/g, "&#43;"));
        sMetadataKeywords = escape(sMetadataKeywords.replace(/\+/g, "&#43;"));
        sMetadataDescription = escape(sMetadataDescription.replace(/\+/g, "&#43;"));
        if (window.XMLHttpRequest) { var request = new XMLHttpRequest(); } else { var request = new ActiveXObject("MSXML2.XMLHTTP.3.0"); }
        request.open("POST", "blog.htm.content", false);
        request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        request.send("MODE=NEW-BLOG&FIELD=" + sTitle + "&DATE=" + blogDate + "&TIME=" + blogTime + "&TAGS=" + sTags + "&METADATAKEYWORDS=" + sMetadataKeywords + "&METAGATADESCRIPTION=" + sMetadataDescription + "&METADATANOINDEX=" + sMetadataNoIndex + "&SITEMAP=" + sSitemap);
        var sResponse = request.responseText;
        document.location.href = sResponse;
    } else { alert("Missing Required Fields.\nTitle and Date are required."); }
}
function getCheckedTags() {
    var tagStr = "";
    try {
        for (var xx = 1; xx < 1000; xx++) {
            var cBox = document.getElementById("blogTagId" + xx)
            if (cBox.checked == true) { tagStr += cBox.value + ","; }
        }
    } catch (e) { }
    if (tagStr.length > 0) { tagStr = tagStr.substring(0, tagStr.length - 1); }
    return tagStr;
}
function loadBlogTags() {
    if (window.XMLHttpRequest) { var request = new XMLHttpRequest(); } else { var request = new ActiveXObject("MSXML2.XMLHTTP.3.0"); }
    request.open("POST", "blog.htm.content", false);
    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    request.send("MODE=GET-BLOG-TAGS");
    var tags = request.responseText.split("||");
    var tagHTML = "";
    for (var x = 0; x < tags.length; x++) {
        var tag = tags[x].split("|");
        tagHTML += "<div><input type=\"checkbox\" id=\"blogTagId" + tag[0] + "\"";
        if (tag[1] == "true") { tagHTML += " checked=\"checked\""; }
        tagHTML += " value=\"" + tag[2] + "\"><span class=\"FPL\">" + tag[2] + "</span></input></div>";
    }
    return tagHTML;
}
function blogDelete() {
    if (confirm("Do you want to delete this post?")) {
        var sResponse = AJAX("POST", "blog.htm.content", "MODE=DELETE-BLOG", "application/x-www-form-urlencoded");
        if (sResponse == "OK") {
            document.location.href = "/";
        } else {
            alert(sResponse);
        }
    }
}
function blogCommentReview() {
    alert("Feature not available");
}
function blogEditProfile() {
    try { hideAllMenus(); } catch (e) { }
    showHideGradiant(true);
    if (toolBarPopup == null) { toolBarPopup = document.getElementById("WebSiteContentPopup"); }
    var ProfileImage = "";
    var profileDetails = "";
    if (window.XMLHttpRequest) { var request = new XMLHttpRequest(); } else { var request = new ActiveXObject("MSXML2.XMLHTTP.3.0"); }
    request.open("POST", "blog.htm.content", false);
    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    request.send("MODE=GET-BLOG-AUTHOR-PROFILE");
    var sResponse = request.responseText;
    var sHTM = "";
    sHTM += formPopupHeader("Edit Blog Profile");
    sHTM += "<div class=\"popupContent\">";
    sHTM += "<div class=\"FPL\">Your Profile</div>";
    sHTM += "<textarea id=\"profileDetails\" class=\"textbox\" style=\"height:200px;\" onblur=\"javascript:cancelHelp();\" onclick=\"javascript:loadHelp(this,'Enter a short profile');\">" + sResponse + "</textarea>";
    sHTM += "<div style=\"clear:both;\"></div>";
    sHTM += "</div>";
    sHTM += formPopupFooter("<button onclick=\"cancelPopup();\">Cancel</button><button onclick=\"uploadBlogProfileImage();\">Upload Image</button><button onclick=\"saveBlogProfile();\">Save</button>");
    toolBarPopup.style.top = (getTopScroll() + 50) + "px";
    toolBarPopup.style.left = "50px";
    toolBarPopup.style.width = "448px";
    toolBarPopup.style.height = "390px";
    toolBarPopup.innerHTML = sHTM;
    toolBarPopup.style.visibility = "visible";
}
function uploadBlogProfileImage() {
    alert("Feature not available");
}

