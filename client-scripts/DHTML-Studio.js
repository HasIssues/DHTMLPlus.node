var swfu1 = null;
var swfu2 = null;
var swfu3 = null;
var originalCode = "";
var activeFile = "";
var editor;
//window.onerror = winError;
function winError(msg, url, linenumber) {
    alert("Compatibility Error.\nPlease use FireFox3 or IE8\n\nLine:" + linenumber + "\nMessage:" + msg + "\nURL:" + url);
    return true;
}
function pageLoad() {
    var sCodeArea = document.getElementById('codeArea');
    sCodeArea.style.width = "800px";
    sCodeArea.style.height = "500px";
    editor = CodeMirror.fromTextArea("codeArea", {
        height: "350px",
        stylesheet: ["/codemirror/css/xmlcolors.css", "/codemirror/css/jscolors.css", "/codemirror/css/csscolors.css"],
        parserfile: ["parsexml.js", "parsecss.js", "tokenizejavascript.js", "parsejavascript.js", "parsehtmlmixed.js"],
        path: "/codemirror/js/",
        continuousScanning: 500
    });
    $("a.tree-file").bind("contextmenu", function(e) {
        loadContextMenu(this);
        return false;
    });
    $("a.tree-img").bind("contextmenu", function(e) {
        loadFileContextMenu(this);
        return false;
    });
    sizeToPage();
}
function loadContextMenu(thisLink) {
    var oMenu = document.getElementById("contextmenu");
    oMenu.style.top = ($(thisLink).offset().top - $(thisLink).scrollTop() + 3) + "px";
    oMenu.style.left = ($(thisLink).offset().left - $(thisLink).scrollLeft() + $(thisLink).outerWidth(true) - 8) + "px";
    oMenu.style.visibility = "visible";
    var sHTM = ""; 
    sHTM += "<a href=\"javascript:loadFile('" + thisLink.title + "');\">Edit " + thisLink.title + "</a>";
    sHTM += "<a href=\"javascript:renameFile('" + thisLink.title + "');\">Rename " + thisLink.title + "</a>";
    sHTM += "<a href=\"javascript:deleteFile('" + thisLink.title + "');\">Delete " + thisLink.title + "</a>";
    sHTM += "<a href=\"javascript:hideContextMenu();\">Cancel</a>";
    oMenu.innerHTML = sHTM;
}
function loadFileContextMenu(thisLink) {
    var oMenu = document.getElementById("contextmenu");
    oMenu.style.top = ($(thisLink).offset().top - $(thisLink).scrollTop() + 3) + "px";
    oMenu.style.left = ($(thisLink).offset().left - $(thisLink).scrollLeft() + $(thisLink).outerWidth(true) - 8) + "px";
    oMenu.style.visibility = "visible";
    var sHTM = "";
    sHTM += "<a href=\"javascript:loadImgPreview('" + thisLink.title + "');\">Preview " + thisLink.title + "</a>";
    sHTM += "<a href=\"javascript:renameFile('" + thisLink.title + "');\">Rename " + thisLink.title + "</a>";
    sHTM += "<a href=\"javascript:deleteFile('" + thisLink.title + "');\">Delete " + thisLink.title + "</a>";
    sHTM += "<a href=\"javascript:hideContextMenu();\">Cancel</a>";
    oMenu.innerHTML = sHTM;
}
function hideContextMenu() {
    var oMenu = document.getElementById("contextmenu");
    oMenu.style.visibility = "hidden";
} 
function newFile() {
    document.getElementById("newFilePopup").style.visibility = "visible";
}
function newFileCancel() {
    document.getElementById("newFilePopup").style.visibility = "hidden";
    return false;
}
function newFileSave() {
    var saveForm = document.forms["newFileForm"];
    var error = "";
    newTemplateName = saveForm.newTemplateName.value;
    newFileType = saveForm.newFileType.value;
    newMasterPage = saveForm.newMasterPage.value;
    if (saveForm.newTemplateName.value == "") { error = "Template Name Required.\n"; }
    if (error == "") {
        if (window.XMLHttpRequest) { var request = new XMLHttpRequest(); } else { var request = new ActiveXObject("MSXML2.XMLHTTP.3.0"); }
        var postUrl = "sourcecode.htm.content?MODE=NEW-TEMPLATE&FILE=" + newTemplateName + "&FILETYPE=" + newFileType + "&MASTERPAGE=" + newMasterPage;
        request.open("GET", postUrl, false);
        request.setRequestHeader("Content-Type", "text/plain");
        request.send(null);
        var sResponse = request.responseText;
        if (sResponse.indexOf("ERROR:") >= 0) {
            alert(sResponse);
        } else {
            document.location.reload(true);
        }
    } else {
        alert(error);
    }
    return false;
}
function uploadImages() {
    document.getElementById("uploadImagePopup").style.visibility = "visible";
    if (swfu1 == null) {
        swfu1 = new SWFUpload({
            // Backend Settings
            upload_url: "./file-upload.aspx", // Relative to the SWF file or absolute
            //post_params: {"PHPSESSID": "<?php echo session_id(); ?>"},

            // File Upload Settings
            file_size_limit: "5 MB", // 2MB
            file_types: "*.jpg;*.jpeg;*.gif;*.png",
            file_types_description: "Web Image Files",
            file_upload_limit: "0",

            // Event Handler Settings - these functions as defined in Handlers.js
            //  The handlers are not part of SWFUpload but are part of my website and control how
            //  my website reacts to the SWFUpload events.
            file_queue_error_handler: fileQueueError,
            file_dialog_complete_handler: fileDialogComplete,
            upload_progress_handler: uploadProgress,
            upload_error_handler: uploadError,
            upload_success_handler: uploadSuccess,
            upload_complete_handler: uploadComplete,

            // Button Settings
            button_image_url: "/SWFUpload/images/SmallSpyGlassWithTransperancy_17x18.png",
            button_placeholder_id: "spanImageButtonPlaceholder",
            button_width: 180,
            button_height: 18,
            button_text: '<span class="button">Click Here to Select Files(s)</span>',
            button_text_style: '.button { font-family: Helvetica, Arial, sans-serif; font-size: 12pt; } .buttonSmall { font-size: 10pt; }',
            button_text_top_padding: 0,
            button_text_left_padding: 18,
            button_window_mode: SWFUpload.WINDOW_MODE.TRANSPARENT,
            button_cursor: SWFUpload.CURSOR.HAND,

            // Flash Settings
            flash_url: "/SWFUpload/flash/swfupload.swf",

            custom_settings: {
                upload_target: "divImageProgressContainer"
            },

            // Debug Settings
            debug: false
        });
    }
}
function uploadImageCancel() {document.getElementById("uploadImagePopup").style.visibility = "hidden";return false;}
function uploadFlash() {
    document.getElementById("uploadFlashPopup").style.visibility = "visible";
    if (swfu3 == null) {
        swfu3 = new SWFUpload({
            // Backend Settings
            upload_url: "/file-upload.aspx", // Relative to the SWF file or absolute
            //post_params: {"PHPSESSID": "<?php echo session_id(); ?>"},

            // File Upload Settings
            file_size_limit: "30 MB", // 2MB
            file_types: "*.swf",
            file_types_description: "Flash Files",
            file_upload_limit: "0",

            // Event Handler Settings - these functions as defined in Handlers.js
            //  The handlers are not part of SWFUpload but are part of my website and control how
            //  my website reacts to the SWFUpload events.
            file_queue_error_handler: fileQueueError,
            file_dialog_complete_handler: fileDialogComplete,
            upload_progress_handler: uploadProgress,
            upload_error_handler: uploadError,
            upload_success_handler: uploadSuccess,
            upload_complete_handler: uploadComplete,

            // Button Settings
            button_image_url: "/SWFUpload/images/SmallSpyGlassWithTransperancy_17x18.png",
            button_placeholder_id: "spanFlashButtonPlaceholder",
            button_width: 180,
            button_height: 18,
            button_text: '<span class="button">Click Here to Select File(s)</span>',
            button_text_style: '.button { font-family: Helvetica, Arial, sans-serif; font-size: 12pt; } .buttonSmall { font-size: 10pt; }',
            button_text_top_padding: 0,
            button_text_left_padding: 18,
            button_window_mode: SWFUpload.WINDOW_MODE.TRANSPARENT,
            button_cursor: SWFUpload.CURSOR.HAND,

            // Flash Settings
            flash_url: "/SWFUpload/flash/swfupload.swf",

            custom_settings: {
                upload_target: "divFlashProgressContainer"
            },

            // Debug Settings
            debug: false
        });
    }
}
function uploadFlashCancel() { document.getElementById("uploadFlashPopup").style.visibility = "hidden"; return false; }
function uploadPDF() {
    document.getElementById("uploadPdfPopup").style.visibility = "visible";
    if (swfu2 == null) {
        swfu2 = new SWFUpload({
            // Backend Settings
            upload_url: "/file-upload.aspx", // Relative to the SWF file or absolute
            //post_params: {"PHPSESSID": "<?php echo session_id(); ?>"},

            // File Upload Settings
            file_size_limit: "30 MB", // 2MB
            file_types: "*.pdf;*.doc;*;ppt",
            file_types_description: "Docs Files",
            file_upload_limit: "0",

            // Event Handler Settings - these functions as defined in Handlers.js
            //  The handlers are not part of SWFUpload but are part of my website and control how
            //  my website reacts to the SWFUpload events.
            file_queue_error_handler: fileQueueError,
            file_dialog_complete_handler: fileDialogComplete,
            upload_progress_handler: uploadProgress,
            upload_error_handler: uploadError,
            upload_success_handler: uploadSuccess,
            upload_complete_handler: uploadComplete,

            // Button Settings
            button_image_url: "/SWFUpload/images/SmallSpyGlassWithTransperancy_17x18.png",
            button_placeholder_id: "spanPdfButtonPlaceholder",
            button_width: 180,
            button_height: 18,
            button_text: '<span class="button">Click Here to Select File(s)</span>',
            button_text_style: '.button { font-family: Helvetica, Arial, sans-serif; font-size: 12pt; } .buttonSmall { font-size: 10pt; }',
            button_text_top_padding: 0,
            button_text_left_padding: 18,
            button_window_mode: SWFUpload.WINDOW_MODE.TRANSPARENT,
            button_cursor: SWFUpload.CURSOR.HAND,

            // Flash Settings
            flash_url: "/SWFUpload/flash/swfupload.swf",

            custom_settings: {
                upload_target: "divPdfProgressContainer"
            },

            // Debug Settings
            debug: false
        });
    }
}
function uploadPdfCancel() { document.getElementById("uploadPdfPopup").style.visibility = "hidden"; return false; }

function loadEditor(sCode, sType) {
    if (sType == "JS") {
        editor.options.stylesheet = "/codemirror/css/jscolors.css";
        editor.options.parserfile = ["tokenizejavascript.js", "parsejavascript.js"];
    }
    if (sType == "CSS") {
        editor.options.stylesheet = "/codemirror/css/csscolors.css";
        editor.options.parserfile = "parsecss.js";
    }
    if (sType == "HTM") {
        editor.options.stylesheet = "/codemirror/css/xmlcolors.css";
        editor.options.parserfile = ["parsexml.js", "parsecss.js", "tokenizejavascript.js", "parsejavascript.js", "parsehtmlmixed.js"];
    }
    if (sType == "XML") {
        editor.options.stylesheet = "/codemirror/css/xmlcolors.css";
        editor.options.parserfile = "parsexml.js";
    }
    editor.setCode(sCode);
    sizeToPage();
}
function loadFile(sFilePath) {
    hideContextMenu();
    var okToLoad = false;
    var sData = editor.getCode();
    if (sData.trim() != originalCode.trim()) {
        if (confirm("Change to " + activeFile + " will be lost. Continue?")) {
            okToLoad = true;
        } else {
            okToLoad = false;
        }
    } else {
        okToLoad = true;
    }
    if (okToLoad) {
        if (window.XMLHttpRequest) { var request = new XMLHttpRequest(); } else { var request = new ActiveXObject("MSXML2.XMLHTTP.3.0"); }
        var postUrl = "sourcecode.htm.content?MODE=GET-CODE&FILE=" + sFilePath;
        request.open("GET", postUrl, false);
        request.setRequestHeader("Content-Type", "text/plain");
        request.send(null);
        var sResponse = request.responseText;
        originalCode = sResponse;
        document.getElementById("fileName").innerHTML = sFilePath;
        activeFile = sFilePath;
        //-- set editor params for new file
        if (sFilePath.endsWith(".js")) { loadEditor(sResponse, "JS") }
        if (sFilePath.endsWith(".css")) { loadEditor(sResponse, "CSS") }
        if (sFilePath.endsWith(".htm")) { loadEditor(sResponse, "HTM") }
        if (sFilePath.endsWith(".xml")) { loadEditor(sResponse, "XML") }
    }
}
function renameFile(fileName) {
    hideContextMenu();
    var newName = prompt("Rename file", fileName);
    if (newName != null && newName != "") {
        if (window.XMLHttpRequest) { var request = new XMLHttpRequest(); } else { var request = new ActiveXObject("MSXML2.XMLHTTP.3.0"); }
        var postUrl = "sourcecode.htm.content?MODE=RENAME-FILE&FILE=" + fileName + "&NEWFILE=" + newName;
        request.open("GET", postUrl, false);
        request.setRequestHeader("Content-Type", "text/plain");
        request.send(null);
        var sResponse = request.responseText;
        if (sResponse.indexOf("ERROR:") >= 0) {
            alert(sResponse);
        } else {
            document.location.reload(true);
        }
    }
}
function deleteFile(fileName) {
    hideContextMenu();
    if (confirm("delete " + fileName + " ?")) {
        if (window.XMLHttpRequest) { var request = new XMLHttpRequest(); } else { var request = new ActiveXObject("MSXML2.XMLHTTP.3.0"); }
        var postUrl = "sourcecode.htm.content?MODE=DELETE-FILE&FILE=" + fileName;
        request.open("GET", postUrl, false);
        request.setRequestHeader("Content-Type", "text/plain");
        request.send(null);
        var sResponse = request.responseText;
        alert(sResponse);
        document.location.reload(true);
    }
}
function saveFile() {
    if (activeFile != "") {
        var sData = editor.getCode();
        sData = escape(sData.replace(/\+/g, "&#43;"));
        if (window.XMLHttpRequest) { var request = new XMLHttpRequest(); } else { var request = new ActiveXObject("MSXML2.XMLHTTP.3.0"); }
        var postUrl = "sourcecode.htm.content?MODE=SAVE-CODE&FILE=" + activeFile + "&DATA=" + sData;
        request.open("POST", "sourcecode.htm.content", false);
        request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        request.send("MODE=SAVE-CODE&FILE=" + activeFile + "&DATA=" + sData);
        var sResponse = request.responseText;
        if (sResponse == "OK") {
            alert(activeFile + " saved.");
        } else {
            alert(sResponse);
        }
    } else { alert("No file selected."); }
}
function loadImgPreview(imgFile) {
    hideContextMenu();
    $("#imgPreviewBox").css("visibility", "visible");
    $("#imgPreview").attr("src", imgFile);
}
function imgPreviewCancel() {
    $("#imgPreviewBox").css("visibility", "hidden");
    $("#imgPreview").attr("src", "");
}
function sizeToPage() {
    var maxWidth = 0, maxHeight = 0, winHeight = 0, winWidth = 0;
    var sCodeArea = document.getElementsByTagName("iframe")[0];
    var sTextArea = document.getElementById("codeArea_cp");
    var sFileArea = document.getElementById("projectTree");
    if (typeof (window.innerWidth) == 'number') {
        //Non-IE
        winWidth = window.innerWidth;
        winHeight = window.innerHeight;
    } else if (document.documentElement && (document.documentElement.clientWidth || document.documentElement.clientHeight)) {
        //IE 6+ in 'standards compliant mode'
        winWidth = document.documentElement.clientWidth;
        winHeight = document.documentElement.clientHeight;
    } else if (document.body && (document.body.clientWidth || document.body.clientHeight)) {
        //IE 4 compatible
        winWidth = document.body.clientWidth;
        winHeight = document.body.clientHeight;
    }
    //-- size stuff to fit
    maxWidth = winWidth - sFileArea.offsetWidth;
    maxHeight = winHeight - 65;
    sFileArea.style.height = maxHeight + "px";
    sCodeArea.style.height = (maxHeight + 10) + "px";
    sCodeArea.style.width = (maxWidth - 35) + "px";
}
function toggleDir(sDivId) {
    var oDiv = document.getElementById(sDivId);
    if (oDiv.style.display == "none") { oDiv.style.display = ""; } else { oDiv.style.display = "none"; }
}
String.prototype.endsWith = function(str) { return (this.match(str + "$") == str) }
String.prototype.startsWith = function(str) { return (this.match("^" + str) == str) }
String.prototype.trim = function() { return (this.replace(/^[\s\xA0]+/, "").replace(/[\s\xA0]+$/, "")) }
