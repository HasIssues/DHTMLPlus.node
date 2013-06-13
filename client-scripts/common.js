var pageTracker = null;
var toolBar = null;
var toolBarPopup = null;
try { var onLoadArray = []; } catch (e) { var onLoadArray = new Array(); }
//-- error handling
function winError(msg, url, linenumber, linechar) { try { window.status = "L:" + linenumber + "|M:" + msg + "C:" + linechar + "|URL:" + url; } catch (e) { } return true; }
window.onerror = winError;
//-- page onload
function pageLoad() {
    try { if (toolBar == null) { toolBar = document.getElementById("WebSiteContentToolBar"); toolBarPopup = document.getElementById("WebSiteContentPopup"); } } catch (e) { }
    try { if (toolBarPopup == null) { toolBarPopup = document.getElementById("WebSiteContentPopup"); } } catch (e) { }
    try { jQuery(document).ready(function() { siteLoad(); }); } catch (e) { siteLoad(); }
    try { pageTracker = _gat._getTracker(_uacct); pageTracker._trackPageview(); } catch (e) { }
}
function zIndexFix() {
    //-- reverse zindex to fix ie issues
    jQuery(function() { var zIndexNumber = 2000; jQuery('div').each(function() { jQuery(this).css('zIndex', zIndexNumber); zIndexNumber -= 1; }); });
}
function toggleFAQ(sAnswerDiv) {
    var skipIt = false;
    try { if (currentMode == "Navigation") { skipIt = false; } else { skipIt = true; } } catch (e) {}
    if (!skipIt) {
        var answerDiv = document.getElementById(sAnswerDiv);
        if (answerDiv.style.display == "none") {
            answerDiv.style.display = "";
        } else {
            answerDiv.style.display = "none";
        }
    }
}
//-- site search
function siteSearch(divID) {
    var searchInput = document.getElementById(divID);
    if (searchInput.value != "") {
        var userData = AJAX("GET", "/site.search.content?MODE=SITE-TEXT-SEARCH&DATA=" + searchInput.value, null, "text/plain");
        if (userData.length > 0) {
            showHideGradiant(true);
            var sHTM = "";
            toolBarPopup.style.top = (getTopScroll() + 50) + "px";
            toolBarPopup.style.left = "100px";
            toolBarPopup.style.width = ($.clientCoords().width - 200) + "px";
            toolBarPopup.style.height = "";
            sHTM += formPopupHeader("Search Results");
            sHTM += "<div class=\"popupContent\" style=\"overflow-y:scroll;height:" + ($.clientCoords().height - 200) + "px;\">";
            var sr = userData.split("||");
            for (var x = 0; x < sr.length; x++) {
                var srItem = sr[x].split("|");
                sHTM += "<div class=\"FPL\"><a href=\"" + srItem[0] + "\">" + srItem[1] + "</a></div>";
                sHTM += "<div class=\"FPT\">" + srItem[2] + "</div><br/>";
            }
            sHTM += "</div>";
            sHTM += formPopupFooter("<button onclick=\"cancelPopup();\">Close</button>");
            toolBarPopup.innerHTML = sHTM;
            toolBarPopup.style.visibility = "visible";
        } else { alert("No Results Found"); }
    }

}
//-- shared loaders
function headerLoadScriptString(jsText) {var e=document.createElement("script");e.type="text/javascript";e.innerHTML=jsText;document.getElementsByTagName("head")[0].appendChild(e);}
function headerLoadScript(url) {var e=document.createElement("script");e.src=url;e.type="text/javascript";document.getElementsByTagName("head")[0].appendChild(e);}
function headerLoadCSS(url) { var e = document.createElement("link"); e.href = url; e.type = "text/css"; e.rel = "stylesheet"; document.getElementsByTagName("head")[0].appendChild(e); }
//-- shared popup code
function showHideGradiant(showIt) { if (showIt) { document.getElementById("WebSiteGrad").style.height = (document.body.clientHeight + 100) + "px"; document.getElementById("WebSiteGrad").style.visibility = "visible"; } else { document.getElementById("WebSiteGrad").style.visibility = "hidden"; } }
function cancelHelp(pObj, sHelp) { document.getElementById("WebSiteHelp").style.visibility = "hidden"; }
function cancelPopup() {toolBarPopup.innerHTML = ""; toolBarPopup.style.visibility = "hidden"; showHideGradiant(false); }
//-- popup sections
function htmPopupTab(sContent) {
    var sHTM = "";
    sHTM += "<div style=\"display:block;background-color:transparent;margin:0px;padding:0px;height:37px;border-radius:15px;box-shadow:8px 8px 3px #CCCCCC;-webkit-border-radius:15px;-moz-border-radius:15px;\">";
    sHTM += "<div style=\"font-family:arial;font-size:12px;font-weight:bold;color:#B3D4F7;display:inline;float:right;background-image:url(/DHTMLPlusCM/mid-Popup-Tab.png);padding:10px 15px 12px 15px;\">" + sContent + "</div>";
    sHTM += "<img src=\"/DHTMLPlusCM/left-Popup-Tab.png\" alt=\"\" style=\"float:right;\"/>";
    sHTM += "</div>";
    return sHTM;
}
function htmPopupHeader(sContent, sCancel) {
    var sHTM = "";
    sHTM += "<div style=\"display:block;background-color:transparent;margin:0px;padding:0px;height:37px;\">";
    sHTM += "<img src=\"/DHTMLPlusCM/right-Popup-header.png\" alt=\"Cancel\" title=\"Cancel\" onclick=\"" + sCancel + "\" onmouseover=\"this.style.cursor='pointer';\" style=\"float:right;\"/>";
    sHTM += "<img src=\"/DHTMLPlusCM/left-Popup-header.png\" alt=\"\" style=\"float:left;\"/>";
    sHTM += "<div style=\"margin:0px 34px 0px 12px;height:30px;font-family:arial;font-size:12px;font-weight:bold;color:#B3D4F7;background-image:url(/DHTMLPlusCM/mid-Popup-header.png);padding:7px 0px 0px 0px;\">" + sContent + "</div>";
    sHTM += "</div>";
    return sHTM;
}
function formPopupHeader(sContent) {return "<div class=\"FPH\"><div class=\"FPHContent roundTop\">" + sContent + "</div><div style=\"padding:0px 10px 0px 10px;background-color:#E8F2FC;\"><div style=\"border-top:1px dashed #333333;\"></div></div></div>";}
function formPopupFooter(sContent) {return "<div style=\"clear:both;\"><div class=\"FPF\"><div class=\"FPFContent roundBottom\">" + sContent + "</div></div>";}
//-- field help popup
function loadHelp(pObj, sHelp) {
    var oHelp = document.getElementById("WebSiteHelp");
    oHelp.style.top = (jQuery(pObj).offset().top - jQuery(pObj).scrollTop() + 3) + "px";
    oHelp.style.left = (jQuery(pObj).offset().left - jQuery(pObj).scrollLeft() + jQuery(pObj).outerWidth(true) + 3) + "px";
    oHelp.innerHTML = sHelp; oHelp.style.visibility = "visible";
}
//-- ajax
function AJAX(postMethod, postToUrl, postQueryString, requestHeaderType) {
    var XMLHttpRequestVer = "Native";
    if (requestHeaderType == null) { requestHeaderType = "application/x-www-form-urlencoded"; }
    if (requestHeaderType == "") { requestHeaderType = "application/x-www-form-urlencoded"; }
    if (postQueryString == "") { postQueryString = null; }
    if (postToUrl != "") {
        try {
            if (window.XMLHttpRequest) {
                var request = new XMLHttpRequest();
            } else {
                var versions = ["Msxml2.XMLHTTP.7.0", "Msxml2.XMLHTTP.6.0", "Msxml2.XMLHTTP.5.0", "Msxml2.XMLHTTP.4.0", "MSXML2.XMLHTTP.3.0", "MSXML2.XMLHTTP", "Microsoft.XMLHTTP"];
                var n = versions.length;
                for (var i = 0; i < n; i++) { try { if (request = new ActiveXObject(versions[i])) { XMLHttpRequestVer = versions[i]; break; } } catch (e) { /* try next */ } }
            }
            request.open(postMethod, postToUrl, false);
            request.setRequestHeader("Content-Type", requestHeaderType);
            //request.setRequestHeader("Content-Encoding", "gzip");
            if (XMLHttpRequestVer == "Native") {
                //request.timeout = 30000;
                //request.ontimeout = AJAXtimeout;
            }
            request.send(postQueryString);
            //window.status = "XMLHttpRequest " + XMLHttpRequestVer;
            returSTR = request.responseText;
        } catch(e) {
            //window.status = "XMLHttpRequest " + XMLHttpRequestVer + " responseText[" + e.description + "]";
            returSTR = "";
        }
    } else {
        returSTR="";
    }
    return returSTR;
}
function AJAXtimeout() { alert("AJAX Data Request Timed Out.\nTry Refreshing This Page."); }
function login() {
    var user = jQuery("#loginUserName").val();
    var password = jQuery("#loginPassword").val();
    if (window.XMLHttpRequest) { var request = new XMLHttpRequest(); } else { var request = new ActiveXObject("MSXML2.XMLHTTP.3.0"); }
    request.open("GET", "/membership.aspx?U=" + user + "&P=" + password, false);
    request.setRequestHeader("Content-Type", "text/plain");
    request.send(null);
    var sResponse = request.responseText;
    if (sResponse.startsWith("OK")) {
        setCookie("membership", sResponse.substring(2));
        window.location.reload(true);
    } else {
        alert(sResponse);
    }
}
function logout() { setCookie("membership", ""); window.location.reload(true); }
function postComment() {
    var isOk = "";
    var postStars = document.getElementById("postStars").value;
    var postName = document.getElementById("postName").value;
    var postEmail = document.getElementById("postEmail").value;
    var postMessage = document.getElementById("postMessage").value;
    if (!isCommentMember) {
        if (postName == "") { isOk += "Name is required.\n"; }
        if (postEmail == "") { isOk += "Email is required. It is never display in your post.\n"; }
    }
    if (postMessage == "") { isOk += "Comments are required.\n"; }
    if (isOk != "") {
        alert(isOk);
    } else {
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
        request.send("MODE=POST-COMMENT&FIELD=COMMENT&postStars=" + postStars + "&postName=" + postName + "&postEmail=" + postEmail + "&postMessage=" + postMessage);
        var sResponse = request.responseText;
        if (sResponse != "OK") {
            alert(sResponse);
        } else {
            window.location.reload(true);
            alert("Post Complete.");
        }
    }
}
//-- creat multi-dim array from query string
function queryStringArray(sQS) { var qItems = sQS.split("&"); for (var x = 0; x < qItems.length; x++) { var qItem = qItems[x].split("="); qItems[x] = qItem; } return qItems; }
//-- other stuff
function getTopScroll() {return jQuery(document).scrollTop();}
function membershipTab() { var currentMode = document.getElementById("membershipData"); if (currentMode.style.display == "") { currentMode.style.display = "none"; } else { currentMode.style.display = ""; } }
function setCookie(name, value) { var date = new Date(); date.setTime(date.getTime() + (1 * 2 * 60 * 60 * 1000)); var expires = "; expires=" + date.toGMTString(); document.cookie = name + "=" + value + "; path=/"; }
function getCookie(name) { var nameEQ = name + "="; var ca = document.cookie.split(';'); for (var i = 0; i < ca.length; i++) { var c = ca[i]; while (c.charAt(0) == ' ') c = c.substring(1, c.length); if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length); } return ""; }
//window.find(searchWord, false, false, false, true, false, false);
String.prototype.endsWith = function(str) {return (this.match(str+"$")==str)}
String.prototype.startsWith = function(str) {return (this.match("^"+str)==str)}
String.prototype.trim = function() { return (this.replace(/^[\s\xA0]+/, "").replace(/[\s\xA0]+$/, "")) }
String.prototype.toProperCase = function() {return this.toLowerCase().replace(/^(.)|\s(.)/g,function($1) { return $1.toUpperCase(); });}
function init() {for(i=0;i<onLoadArray.length;i++){try{eval(onLoadArray[i]);} catch(e){}}}
function DHTMLPlusAddLoadEvent(func) { var aL = onLoadArray.length; onLoadArray[aL] = func; }
String.prototype.clientCoords = function () {
    var dimensions = { width: 0, height: 0 };
    if (window.innerWidth && window.innerHeight) {
        dimensions.width = window.innerWidth;
        dimensions.height = window.innerHeight;
    } else if (document.documentElement) {
        dimensions.width = document.documentElement.offsetWidth;
        dimensions.height = document.documentElement.offsetHeight;
    }
    return dimensions;
}
//-- defaults for all
//if (document.location.href.indexOf("tps://") > 0) {
//    DHTMLPlusAddLoadEvent("headerLoadScript('https://www.google-analytics.com/ga.js');");
//} else {
//    DHTMLPlusAddLoadEvent("headerLoadScript('http://www.google-analytics.com/ga.js');");
//}
DHTMLPlusAddLoadEvent("try{pageLoad();} catch(e) {}");
//DHTMLPlusAddLoadEvent("try { var pageTracker = _gat._getTracker(_uacct); pageTracker._initData(); pageTracker._trackPageview(); } catch (err) { window.status = 'Error GA-ID:' + _uacct; }");
//DHTMLPlusAddLoadEvent("try { var pageTracker = _gat._getTracker(_uacct);pageTracker._trackPageview(); } catch (err) { window.status = 'Error GA-ID:' + _uacct; }");
try { jQuery(document).ready(function() { init(); }); } catch (e) {document.onload = init();}
