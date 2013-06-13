var mouseX = 0;var mouseY = 0;
var maxHeight = 0; var maxWidth = 0;
$(document).ready(function () { pageLoad(); });
$(window).resize(function () { setGridHeight(); });
$(document).ready(function () { $(document).mousemove(function (e) { mouseX = e.pageX; mouseY = e.pageY; }); })

function pageLoad() {
    setGridHeight();
}

function contextMenu(sTitle, sBody, sButtons) {
    $("#contextMenu").css("display", "block"); $("#contextMenuHeader").html(sTitle); $("#contextMenuBody").html(sBody); $("#contextMenuButtons").html(sButtons);
    var posX = mouseX; var posY = mouseY;
    if (mouseY > maxHeight - 150) { posY = mouseY - $("#contextMenu").height(); }
    $("#contextMenu").css("top", posY + "px"); 
    $("#contextMenu").css("left", posX + "px");
}
function closeContextMenu() { $("#contextMenuBody").html(""); $("#contextMenuHeader").html(""); $("#contextMenuButtons").html(""); $("#contextMenu").css("display", "none"); }
function brandWiz(sTitle, sBody, sButtons) { $("#wiz").css("display", "block"); $("#wizHeader").html(sTitle); $("#wizBody").html(sBody); $("#wizButtons").html(sButtons); }
function closeWiz() { $("#wizBody").html(""); $("#wizHeader").html(""); $("#wizButtons").html(""); $("#wiz").css("display", "none"); }
function wizReloadPage() { document.location.reload(); }
function brandMouseClick(clickedOBJ, sSKU, mouseButton) {if (mouseButton == 1) { brandMouseLEFT(clickedOBJ, sSKU); }if (mouseButton == 2) { brandMouseMIDDLE(clickedOBJ, sSKU); }if (mouseButton == 3) { brandMouseRIGHT(clickedOBJ, sSKU); }}
function priceListMouseClick(clickedOBJ, sSKU, mouseButton) { if (mouseButton == 1) { priceListMouseLEFT(clickedOBJ, sSKU); } if (mouseButton == 2) { priceListMouseMIDDLE(clickedOBJ, sSKU); } if (mouseButton == 3) { priceListMouseRIGHT(clickedOBJ, sSKU); } }
function customWiz(sTitle, sBody, sButtons, Width, height) {
    if (window.innerHeight == null) { maxHeight = document.documentElement.clientHeight; maxWidth = document.documentElement.clientWidth; } else { maxHeight = window.innerHeight; maxWidth = window.innerWidth; }
    maxHeight -= $("tbody.scrollContent").offset().top;

    $("#wizBody").css("height", (maxHeight - 20) + "px");
    $("#wiz").css("display", "block"); $("#wizHeader").html(sTitle); $("#wizBody").html(sBody); $("#wizButtons").html(sButtons);
}
function setGridHeight() {
    if (window.innerHeight == null) {maxHeight = document.documentElement.clientHeight; maxWidth = document.documentElement.clientWidth;} else {maxHeight = window.innerHeight; maxWidth = window.innerWidth;}
    maxHeight -= $("tbody.scrollContent").offset().top;
    $("tbody.scrollContent").css("height", (maxHeight - 25) + "px");
    $("tbody.scrollContent").css("max-height", (maxHeight - 25) + "px");
}
