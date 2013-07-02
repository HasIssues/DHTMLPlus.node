var activeWYSIWYG = null;
var toolBarClick = false;
var activeWYSIWYG_BG = "";
var activeWYSIWYG_FG = "";
var activeWYSIWYG_Content = "";
var selectedRange = null;
var selectedRangeOffset = 0;
var emoticonHTML = "";
var pageTracker = null;
var toolBar = null;
var toolBarPopup = null;

$(document).ready(function () {
	$("*[contentEditable=true]").bind("click", function() { initWYSIWYG(this); });
	$("*[contentEditable=true]").attr("contenteditable","false");
	$("body").append("<div id=\"toolBarPopup\" style=\"display:none;\">toolBarPopup</div>");
	toolBarPopup = $("div#toolBarPopup");
	$("body").append("<div id=\"toolBar\" style=\"position:absolute;background-color:gray;\">toolBar</div>");
	toolBar = $("div#toolBar");
});

var initWYSIWYG = function(obj) {
	//try { closeMainMenu(); } catch (e) { }
	if (activeWYSIWYG == null) {
		activeWYSIWYG = obj;
		activeWYSIWYG_Content = $(activeWYSIWYG).html();
		activeWYSIWYG_BG = activeWYSIWYG.style.backgroundColor;
		activeWYSIWYG_FG = activeWYSIWYG.style.color;
		activeWYSIWYG.style.backgroundColor = "#FDF4B1";
		activeWYSIWYG.style.color = "#333333";
		$(activeWYSIWYG).attr("contenteditable","true");
		setToolBar(activeWYSIWYG.nodeName, activeWYSIWYG);
	} else {
		deactivateWYSIWYG();
	}
	cancelPopup();
	activeWYSIWYG.focus();
};

var setToolBar = function (elementType, activeWYSIWYG) {
	var sHTM = "";
	sHTM += "<a href=\"javascript:templateDELETE();\" style=\"margin-right:5px;\" title=\"Delete Control\"><img src=\"/preview/delete.png\" alt=\"delete\"/></a>";
	sHTM += "<a href=\"javascript:templateINSERT('Above');\" style=\"margin-right:5px;\" title=\"Insert Above\"><img src=\"/preview/insert-above.png\" alt=\"Insert Above\"/></a>";
	sHTM += "<a href=\"javascript:templateINSERT('Below');\" style=\"margin-right:15px;\" title=\"Insert Below\"><img src=\"/preview/insert-below.png\" alt=\"Insert Below\"/></a>";
	sHTM += "<a href=\"javascript:wysiwygCMD('bold');\" style=\"margin-right:5px;\" title=\"Bold\"><img src=\"/preview/bold.png\" alt=\"Bold\"/></a>";
	sHTM += "<a href=\"javascript:wysiwygCMD('italic');\" style=\"margin-right:5px;\" title=\"Italic\"><img src=\"/preview/italic.png\" alt=\"Italic\"/></a>";
	sHTM += "<a href=\"javascript:wysiwygCMD('underline');\" style=\"margin-right:5px;\" title=\"Underline\"><img src=\"/preview/underline.png\" alt=\"Underline\"/></a>";
	if (elementType != "A") {
		sHTM += "<a href=\"javascript:wysiwygCMD('CreateLink');\" style=\"margin-right:5px;\" title=\"Add Hyperlink\"><img src=\"/preview/hyperlinkdialog.png\" alt=\"Hyperlink\"/></a>";
		//sHTM += "<a href=\"javascript:wysiwygCMD('InsertImage');\" style=\"margin-right:5px;\" title=\"Add Image\"><img src=\"/preview/gallery.png\"/></a>";
	}
	sHTM += "<a href=\"javascript:emoticonPOPUP();\" style=\"margin-right:15px;\" title=\"Emoticons\"><img src=\"/preview/emoticon.png\" alt=\"Emoticon\"/></a>";
	sHTM += "<a href=\"javascript:pastePOPUP();\" style=\"margin-right:5px;\" title=\"Content Cleaner\"><img src=\"/preview/paste.png\" alt=\"Paste\"/></a>";
	sHTM += "<a href=\"javascript:propertiesWYSIWYG();\" style=\"margin-right:5px;\" title=\"Properties\"><img src=\"/preview/properties.png\" alt=\"Properties\"/></a>";
	sHTM += "<a href=\"javascript:htmlPOPUP();\" style=\"margin-right:15px;\" title=\"HTML Edit\"><img src=\"/preview/html.png\" alt=\"HTML Edit\"/></a>";
	sHTM += "<a href=\"javascript:saveWYSIWYG();\" title=\"Save\"><img src=\"/preview/save.png\" alt=\"Save\"/></a>";
	sHTM = htmPopupHeader(sHTM, "cancelWYSIWYG();");
	/*$(toolBar).html(htmPopupTab("Last Updated:  User:") + sHTM);*/
	$(toolBar).html(sHTM);
	$(toolBar).css("visibility", "visible");
	$(toolBar).css("top", ($(activeWYSIWYG).offset().top - 38) + "px");
	$(toolBar).css("left", ($(activeWYSIWYG).offset().left) + "px");
	if (activeWYSIWYG.offsetWidth <= 550) { $(toolBar).css("width", "550px"); } else { $(toolBar).css("width", activeWYSIWYG.offsetWidth + "px"); }
	//toolBarPopup.style.top = ($(activeWYSIWYG).offset().top) + "px";
	//toolBarPopup.style.left = ($(activeWYSIWYG).offset().left) + "px";
};
var htmPopupHeader = function (sContent, sCancel) {
	var sHTM = "";
	sHTM += "<div style=\"display:block;background-color:transparent;margin:0px;padding:0px;height:37px;\">";
	sHTM += "<img src=\"/preview/pm-cancel.png\" alt=\"Cancel\" title=\"Cancel\" onclick=\"" + sCancel + "\" onmouseover=\"this.style.cursor='pointer';\" style=\"float:right;\"/>";
	sHTM += "<div style=\"margin:0px 34px 0px 12px;height:30px;font-family:arial;font-size:12px;font-weight:bold;color:#B3D4F7;padding:7px 0px 0px 0px;\">" + sContent + "</div>";
	sHTM += "</div>";
	return sHTM;
};
var htmPopupTab = function (sContent) {
	var sHTM = "";
	sHTM += "<div style=\"display:block;background-color:transparent;margin:0px;padding:0px;height:37px;border-radius:15px;box-shadow:8px 8px 3px #CCCCCC;-webkit-border-radius:15px;-moz-border-radius:15px;\">";
	sHTM += "<div style=\"font-family:arial;font-size:12px;font-weight:bold;color:#B3D4F7;display:inline;float:right;padding:10px 15px 12px 15px;\">" + sContent + "</div>";
	sHTM += "</div>";
	return sHTM;
};
var wysiwygCMD = function (cmd) {
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
};
var cancelWYSIWYG = function () {
	activeWYSIWYG.innerHTML = activeWYSIWYG_Content;
	activeWYSIWYG.style.backgroundColor = activeWYSIWYG_BG;
	activeWYSIWYG.style.color = activeWYSIWYG_FG;
	activeWYSIWYG = null;
	activeWYSIWYG_Content = "";
	hideToolbar();
	cancelPopup();
};
var hideToolbar = function () { $(toolBar).html(""); $(toolBar).css("visibility", "hidden"); }
var saveWYSIWYG = function () {
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
};


