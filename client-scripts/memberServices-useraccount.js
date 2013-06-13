
function myAccount() {
    var userData = AJAX("GET", "/user.profile.content?MODE=GET-USER-PROFILE", null, "text/plain");
    var userDataArray = queryStringArray(userData);
    toolBarPopup.style.width = "600px";
    toolBarPopup.style.height = "";
    var sHTM = "";
    sHTM += formPopupHeader("My Account information");
    sHTM += "<div class=\"popupContent\">";
    sHTM += "<input id=\"userProfileKey\" type=\"hidden\" value=\"" + userDataArray[0][1] + "\"/>";
    sHTM += "<div class=\"FPL\">First Name: <input id=\"userProfileFirstName\" type=\"text\" value=\"" + userDataArray[1][1] + "\" class=\"textbox\" style=\"width:321px;\" onblur=\"javascript:cancelHelp();\" onclick=\"javascript:loadHelp(this,'Enter your first name');\"/></div>";
    sHTM += "<div class=\"FPL\">Last Name: <input id=\"userProfileLastName\" type=\"text\" value=\"" + userDataArray[2][1] + "\" class=\"textbox\" style=\"width:321px;\" onblur=\"javascript:cancelHelp();\" onclick=\"javascript:loadHelp(this,'Enter your last name');\"/></div>";
    sHTM += "<div class=\"FPL\">Email Address: <input id=\"userProfileEmail\" type=\"text\" value=\"" + userDataArray[3][1] + "\" class=\"textbox\" style=\"width:300px;\" onblur=\"javascript:cancelHelp();\" onclick=\"javascript:loadHelp(this,'Enter your email address');\"/></div>";
    if (userDataArray[4][1] != "NULL") {
        sHTM += "<div class=\"FPL\">Blog Profile</div>";
        sHTM += "<textarea id=\"userProfileBlogProfile\"  class=\"textbox\" style=\"width:580px;height:190px;\" onblur=\"javascript:cancelHelp();\" onclick=\"javascript:loadHelp(this,'Enter your profile to be displayed on your blog posts.');\">" + userDataArray[4][1] + "</textarea>";
    }
    sHTM += "</div>";
    sHTM += formPopupFooter("<button onclick=\"cancelPopup();\">Cancel</button><button onclick=\"myAccountSAVE();\">Save</button>");
    toolBarPopup.innerHTML = sHTM;
    toolBarPopup.style.visibility = "visible";
    toolBarPopup.style.top = "50px";
    toolBarPopup.style.left = "90px";
    showHideGradiant(true);


}

function myAccountSAVE() {
    var postString = "MODE=SAVE-USER-PROFILE";
    postString += "&key=" + document.getElementById("userProfileKey").value;
    postString += "&firstName=" + document.getElementById("userProfileFirstName").value;
    postString += "&lastName=" + document.getElementById("userProfileLastName").value;
    postString += "&email=" + document.getElementById("userProfileEmail").value;
    postString += "&blogProfile=" + document.getElementById("userProfileBlogProfile").value;
    var userData = AJAX("POST", "/user.profile.content", postString, "application/x-www-form-urlencoded");
    if (userData == "OK") {
        window.location.reload(true);
    } else {
        alert(userData);
    }
}
