var vault = null;

function compPageLoad() {
	loadVault();
	//makeItRound();
}
function loadVault() {
	preLoadImages();
	vault = new dhtmlXVaultObject();
	vault.setServerHandlers("/WebHandlers/UploadHandler.ashx", "/WebHandlers/GetInfoHandler.ashx", "/WebHandlers/GetIdHandler.ashx");
	vault.create("vault1");
}
function preLoadImages(){
	var imSrcAr = new Array("btn_add.gif","btn_clean.gif","btn_upload.gif","ico_file.png","ico_image.png","ico_sound.png","ico_video.png","ico_zip.png","pb_back.gif","pb_demoUload.gif","pb_empty.gif");
	var imAr = new Array(0);
	for(var i=0;i<imSrcAr.length;i++){
		imAr[imAr.length] = new Image();
		imAr[imAr.length-1].src = "/images/"+imSrcAr[i];
	}
}
function makeItRound() {
	try {
		if (!NiftyCheck()) {
			return;
		} else {
			Rounded("div#SlideUpload" ,"all","transparent","#7998B7","border #5C86AC");
			Rounded("div#slideToolbar","all","transparent","#7998B7","border #5C86AC");
			Rounded("div#slideView"   ,"all","transparent","#000000","smooth");
		}
	} catch(e) {}
	//loadThumbs();
}
function loadImg(sNewImg, sLabel, sPreview) {
	document.getElementById("preview").src = "/content/comps/" + sNewImg;
	if (sPreview == "") {
		document.getElementById("slideLabel").innerHTML = sLabel + "";
	} else {
		document.getElementById("slideLabel").innerHTML = sLabel + " [<a class=\"preview\" href=\"" + sPreview + "\" target=\"_blank\">Preview</a>]";
	}
}
function loadThumbs() {
	var nodeCount = -1;
	var thumbHtml = "";
	var xmlString = document.getElementById("slidesXML").innerHTML;
	if (document.implementation && document.implementation.createDocument) {
		var objDOMParser = new DOMParser();
		var doc = objDOMParser.parseFromString(xmlString, "text/xml");
		var slideNodes = doc.getElementsByTagName("slide");
		nodeCount = slideNodes.length;
	}
	else if (window.ActiveXObject) {
		var doc = new ActiveXObject("Msxml2.DOMDocument.3.0");
		doc.async = false;
		doc.loadXML(xmlString);
		var slidesNode = doc.selectNodes("//slide");
		alert(doc.selectNodes("//slide").length);
		var slideNodes = slidesNode.childNodes;
		alert(slideNodes.length);
		nodeCount = slideNodes.length;
	}
	for (i=0; i < nodeCount; i++)
	{
		var sNode = doc.getElementsByTagName("slide")[i];
		thumbHtml += "<a style=\"margin:3px;\" href=\"javascript:loadImg('" + sNode.getAttribute("imageurl") + "','" + sNode.getAttribute("caption") + "');\">";
		thumbHtml += "<img src=\"/content/comps/" + sNode.getAttribute("thumbnailurl") + "\" style=\"width:80px;height:100px;\" border=\"0\"/>";
		thumbHtml += "</a>";
	}
	document.getElementById("SlideThumbs").innerHTML = thumbHtml;
}
function showUpload() {
	document.getElementById("fileView").style.display = "none";
	document.getElementById("slideView").style.display = "none";
	document.getElementById("slideshow").style.display = "none";
	//document.getElementById("SlideUpload").style.display = "block";
}
function showSlideShow() {
	document.getElementById("fileView").style.display = "none";
	document.getElementById("slideView").style.display = "block";
	document.getElementById("slideshow").style.display = "block";
	//document.getElementById("SlideUpload").style.display = "none";
}
function showFiles() {
	document.getElementById("fileView").style.display = "block";
	document.getElementById("slideView").style.display = "none";
	document.getElementById("slideshow").style.display = "none";
	//document.getElementById("SlideUpload").style.display = "none";
}
