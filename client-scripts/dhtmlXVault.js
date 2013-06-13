dhtmlXVaultObject = function()
{
    this.isUploadFile = "false";
    this.isUploadFileAll = "false";
    this.countRows = null;
    this.idRowSelected = null;
    this.sessionId = null;

    //server handlers
    this.pathUploadHandler = null;
    this.pathGetInfoHandler = null;
    this.pathGetIdHandler = null;

    //demo
    this.isDemo = true;
    this.progressDemo = null;

    //from PHP
    this.MAX_FILE_SIZE = null;
    this.UPLOAD_IDENTIFIER = null;
}

dhtmlXVaultObject.prototype.setServerHandlers = function(uploadHandler, getInfoHandler, getIdHandler)
{
    this.pathUploadHandler = uploadHandler;
    this.pathGetInfoHandler = getInfoHandler;
    this.pathGetIdHandler = getIdHandler;

}

dhtmlXVaultObject.prototype.create = function(htmlObject)
{

    this.parentObject = document.getElementById(htmlObject);

    this.parentObject.style.position = "relative";
    this.parentObject.innerHTML = "<iframe src='about:blank' id='dhtmlxVaultUploadFrame' name='dhtmlxVaultUploadFrame' style='display:none'></iframe>";

    this.containerDiv = document.createElement("div");
    this.containerDiv.style.cssText = "position:absolute;overflow-x:hidden;overflow-y:auto;height:190px;background-color:#FFFFFF;border:1px solid #878E95;top:10px;left:10px;z-index:10;width:410px;";
    this.parentObject.appendChild(this.containerDiv);

    this.container = document.createElement("div");
    this.container.style.position = "relative";
    this.container.style.width = "480px";

    var str = "<table class=\"dhtmlXVault\" border=\"0\">" +
              "<tr><td style='width:420px' colspan=3 align='center' id = 'cellContainer' >" +
              "<div style='height:200px;'></div>" +
              "</td></tr>" +
              "<tr><td style=';width: 80px; height: 32px;' align='left'></td>" +
              "<td style='width: 200px; height: 32px;' align='left'>" +
              "<img _onclick='UploadControl.prototype.uploadAllItems()' _ID='ImageButton3'  src='/images/btn_upload.gif' style='cursor:pointer'/></td>" +
              "<td style='width: 140px; height: 32px;' align='right'>" +
              "<img _onclick='return UploadControl.prototype.removeAllItems()' _ID='ImageButton3'  src='/images/btn_clean.gif' style='cursor:pointer;margin-right:20px'/></td></tr></table>" +

              "<div _id='fileContainer' style='width:84px;overflow:hidden;height:32px;left:0px;direction:rtl;position:absolute;top:211px'>" +
              "<img style='z-index:2' src='/images/btn_add.gif'/>" +
              "<input type='file' id='file1'  name='file1' value='' class='hidden' style='cursor:pointer;z-index:3;left:7px;position:absolute;height:25px;top:0px'/></div>";

    this.container.innerHTML = str;

    var self = this;
    this.container.childNodes[0].rows[1].cells[1].childNodes[0].onclick = function() {
        self.uploadAllItems()
    };
    this.container.childNodes[0].rows[1].cells[2].childNodes[0].onclick = function() {
        self.removeAllItems()
    };
    this.fileContainer = this.container.childNodes[1];
    this.fileContainer.childNodes[1].onchange = function() {
        self.addFile()
    };

    this.uploadForm = document.createElement("form");

    this.uploadForm.method = "post";
    this.uploadForm.encoding = "multipart/form-data";
    this.uploadForm.target = "dhtmlxVaultUploadFrame";
    this.container.appendChild(this.uploadForm);

    //from PHP
    this.MAX_FILE_SIZE = document.createElement("input");
    this.MAX_FILE_SIZE.type = "hidden";
    this.MAX_FILE_SIZE.name = "MAX_FILE_SIZE";
    this.MAX_FILE_SIZE.value = '200000000';
    this.uploadForm.appendChild(this.MAX_FILE_SIZE);

    this.UPLOAD_IDENTIFIER = document.createElement("input");
    this.UPLOAD_IDENTIFIER.type = "hidden";
    this.UPLOAD_IDENTIFIER.name = "UPLOAD_IDENTIFIER";
    this.uploadForm.appendChild(this.UPLOAD_IDENTIFIER);

    this.parentObject.appendChild(this.container);
    this.tblListFiles = null;

    this.currentFile = this.fileContainer.childNodes[1];

    //if demo
    if (this.isDemo)
    {
        this.progressDemo = this.createProgressDemo();
    }

}

dhtmlXVaultObject.prototype.createXMLHttpRequest = function()
{
    var xmlHttp = null;
    if (window.ActiveXObject)
    {
        xmlHttp = new ActiveXObject("Microsoft.XMLHTTP");
    }

    else if (window.XMLHttpRequest)
    {
        xmlHttp = new XMLHttpRequest();
    }
    return xmlHttp
}

//get file name
dhtmlXVaultObject.prototype.getFileName = function(path)
{
    var arr = path.split("\\");
    return arr[arr.length - 1];
}

dhtmlXVaultObject.prototype.selectItemInExplorer = function(currentId)
{
    var currentRow = this.getCurrentRowListFiles(currentId);

    if (this.idRowSelected)
    {
        var row = this.getCurrentRowListFiles(this.idRowSelected);
        if (row)
        {
            if (row.id != currentRow.id)
            {
                currentRow.style.background = "#F3F3F3";
                this.idRowSelected = currentId;
                row.style.background = "#FFFFFF";
            }
            else
            {
                currentRow.style.background = "#FFFFFF";
                this.idRowSelected = "";
            }
        }
        else
        {
            currentRow.style.background = "#F3F3F3";
            this.idRowSelected = currentId;
        }

    } else
    {
        currentRow.style.background = "#F3F3F3";
        this.idRowSelected = currentId;
    }

}

dhtmlXVaultObject.prototype.selectItemInMozilla = function(currentId)
{

    var currentRow = this.getCurrentRowListFiles(currentId);

    if (this.idRowSelected)
    {
        var row = this.getCurrentRowListFiles(this.idRowSelected);
        if (row)
        {
            if (row.id != currentRow.id)
            {
                currentRow.style.background = "#F3F3F3";
                this.idRowSelected = currentId;
                row.style.background = "#FFFFFF";
            }
            else
            {
                currentRow.style.background = "#FFFFFF";
                this.idRowSelected = "";
            }
        }
        else
        {
            currentRow.style.background = "#F3F3F3";
            this.idRowSelected = currentId;
        }

    } else
    {
        currentRow.style.background = "#F3F3F3";
        this.idRowSelected = currentId;
    }

}

// add item in "upload control"
dhtmlXVaultObject.prototype.addFile = function()
{
    var currentId = this.createId();

    var file = this.currentFile;
    file.disabled = true;
    file.style.display = "none";
    this.uploadForm.appendChild(file);

    var newInputFile = document.createElement("input");
    newInputFile.type = "file";
    newInputFile.className = "hidden";
    newInputFile.style.cssText = "cursor:pointer;z-index:3;left:7px;position:absolute;height:30px";
    newInputFile.id = "file" + (currentId + 1);
    newInputFile.name = "file" + (currentId + 1);
    this.currentFile = newInputFile;
    var self = this;
    newInputFile.onchange = function() {
        return self.addFile()
    };
    this.fileContainer.appendChild(newInputFile);

    var fileName = this.getFileName(file.value);
    var imgFile = this.getImgFile(fileName);

    //create table ListFiles
    var containerData = this.containerDiv;
    if (this.tblListFiles == null)
    {
        this.tblListFiles = this.createTblListFiles();
        containerData.appendChild(this.tblListFiles);
    }
    var rowListFiles = this.tblListFiles.insertRow(this.tblListFiles.rows.length);
    rowListFiles.setAttribute("fileItemId", currentId);
    rowListFiles.setAttribute("id", "rowListFiles" + currentId);
    rowListFiles.setAttribute("isUpload", "false");

    if (navigator.appName.indexOf("Explorer") != -1)
    {
        rowListFiles.onclick = function() {
            self.selectItemInExplorer(currentId)
        }

    } else
    {
        rowListFiles.onclick = function(event) {
            self.selectItemInMozilla(currentId)
        }
    }

    var cellListFiles = document.createElement("td");
    cellListFiles.align = "center";
    rowListFiles.appendChild(cellListFiles);


    //create table "content"
    var tblContent = document.createElement("table");
    cellListFiles.appendChild(tblContent);
    tblContent.style.cssText = ";border-bottom: 1px solid #E2E2E2;width:410px;";
    tblContent.cellPadding = "0px";
    tblContent.cellSpacing = "0px";
    tblContent.border = "0px";
    tblContent.id = "tblContent" + currentId;

    var rowList = tblContent.insertRow(tblContent.rows.length);

    var cellList = document.createElement("td");
    cellList.rowSpan = 2;
    cellList.align = "center";
    if (navigator.appName.indexOf("Explorer") != -1)
    {
        var span = document.createElement("span");
        span.style.cssText = "width: 40px; height: 40px; display: inline-block; filter:progid:DXImageTransform.Microsoft.AlphaImageLoader (src='" + imgFile + " ')";
        cellList.appendChild(span);
    }
    else
    {
        cellList.innerHTML = "<img  src='" + imgFile + "'  />";
    }
    cellList.style.cssText = ";width:60px;";
    rowList.appendChild(cellList);

    //add name of file
    cellList = document.createElement("td");
    cellList.align = "left";
    cellList.vAlign = "bottom";
    cellList.style.cssText = ";width:300px;height:30px;";
    cellList.innerHTML = "<div style='overflow: hidden;height: 12px;width:280px;'><div class='fileName' style='height: 12px;width:280px;'>" + fileName + "</div></div> ";
    cellList.className = "filenName";
    rowList.appendChild(cellList);

    // add link Remove
    cellList = document.createElement("td");
    cellList.style.cssText = ";width:140px;height:30px";
    cellList.innerHTML = "<a href='#remove' class='link'>Remove</a>";
    cellList.firstChild.onclick = function() {
        self.removeItem(currentId)
    };
    cellList.vAlign = "bottom";
    cellList.align = "center";
    rowList.appendChild(cellList);
    rowList = tblContent.insertRow(tblContent.rows.length);

    //  progress bar
    cellList = document.createElement("td");
    cellList.align = "left";
    cellList.style.cssText = ";width:300px;height:30px;";
    //cellList.appendChild(tblProgressBar);
    rowList.appendChild(cellList);

    // add link Upload
    cellList = document.createElement("td");
    cellList.style.cssText = ";width:140px;height:30px;";
    cellList.innerHTML = "<a href='#upload' class='link'>Upload</a>";
    cellList.firstChild.onclick = function() {
        self.uploadFile(currentId)
    };
    cellList.vAlign = "middle";
    cellList.align = "center";
    rowList.appendChild(cellList);

}

//get image src
dhtmlXVaultObject.prototype.getImgFile = function(fileName)
{
    //-------------------------------------------
    var srcImgPic = "/images/ico_image.png";
    var srcImgVideo = "/images/ico_video.png";
    var srcImgSound = "images/ico_sound.png";
    var srcImgArchives = "/images/ico_zip.png";
    var srcImgFile = "/images/ico_file.png";

    var valueImgPic = "jpg,jpeg,gif,png,bmp,tiff";
    var valueImgVideo = "avi,mpg,mpeg,rm,move";
    var valueImgSound = "wav,mp3,ogg";
    var valueImgArchives = "zip,rar,tar,tgz,arj";
    //------------------------------------------


    var ext = "_";
    var ext0 = fileName.split(".");
    if (ext0.length > 1) ext = ext0[ext0.length - 1].toLowerCase();

    if (valueImgPic.indexOf(ext) != -1)
    {
        return srcImgPic;
    }

    if (valueImgVideo.indexOf(ext) != -1)
    {
        return srcImgVideo;
    }

    if (valueImgSound.indexOf(ext) != -1)
    {
        return srcImgSound;
    }

    if (valueImgArchives.indexOf(ext) != -1)
    {
        return srcImgArchives;
    }

    return srcImgFile;
}

//create id for item control
dhtmlXVaultObject.prototype.createId = function()
{
    var count = this.countRows;
    if (!count)
    {
        count = 0;
    }
    this.countRows = parseInt(count) + 1;
    return this.countRows;
}

dhtmlXVaultObject.prototype.createTblListFiles = function()
{

    var tblListFiles = document.createElement("table");
    tblListFiles.id = "tblListFiles";
    tblListFiles.style.cssText = "background-color:#FFFFFF;width:382px;padding:0px;margin:0px;";
    tblListFiles.cellPadding = "0";
    tblListFiles.cellSpacing = "0";
    tblListFiles.border = "0";

    return tblListFiles;
}

//remove current item in control
dhtmlXVaultObject.prototype.removeItem = function(id)
{
    this.getCurrentRowListFiles(id).parentNode.removeChild(this.getCurrentRowListFiles(id));
}

//remove all items in control
dhtmlXVaultObject.prototype.removeAllItems = function()
{
    if (this.isUploadFile == "false")
    {

        if (this.tblListFiles != null)
        {

            var count = this.tblListFiles.rows.length;
            if (count > 0)
            {
                for (var i = 0; i < count; i++)
                {
                    this.tblListFiles.deleteRow(0);
                }
            }

        }
    }
}

//upload all items
dhtmlXVaultObject.prototype.uploadAllItems = function()
{
    var flag = -1;

    if (this.tblListFiles != null)
    {
        if (this.tblListFiles.rows.length > 0)
        {
            for (var i = 0; i < this.tblListFiles.rows.length; i++)
            {

                if (this.tblListFiles.rows[i].attributes["isUpload"].value == "false")
                {
                    flag = i;
                    break;
                }

            }

            if (flag != -1)
            {
                this.isUploadFileAll = "true";
                var fileItemId = this.tblListFiles.rows[i].attributes["fileItemId"].value;
                this.uploadFile(fileItemId);
            }
            else
            {
                this.isUploadFileAll = "false";
            }

        }

    }
}

dhtmlXVaultObject.prototype.createProgressDemo = function ()
{
    var srcImgProgress = "/images/pb_demoUload.gif";

    var tblProgress = document.createElement("table");
    tblProgress.cellPadding = "0";
    tblProgress.cellSpacing = "0";
    tblProgress.border = "0";
    tblProgress.style.cssText = "height:10px;width:153px;display:none;";
    tblProgress.id = "progress";

    var row = tblProgress.insertRow(tblProgress.rows.length);
    var cell1 = document.createElement("td");
    cell1.style.cssText = "font-size: 1px;border: 1px solid #A9AEB3;"
    cell1.innerHTML = "<img src=" + srcImgProgress + " style = 'width:150px;height:8px;'/>";
    row.appendChild(cell1);

    return tblProgress;

}

//creation progress bar panel
dhtmlXVaultObject.prototype.createProgressBar = function ()
{

}

//creation percent panel
dhtmlXVaultObject.prototype.createPercentPanel = function ()
{

}

dhtmlXVaultObject.prototype.endLoading = function (id)
{
    this.isUploadFile = "false";

    if (!this.isDemo)
    {

    }
    else
    {
        this.progressDemo.style.display = "none";
        this.container.appendChild(this.progressDemo);
    }

    this.getCurrentInputFile(id).parentNode.removeChild(this.getCurrentInputFile(id));

}

//receipt of id
dhtmlXVaultObject.prototype.startRequest = function(id) {
	try {
		var xmlHttp = this.createXMLHttpRequest();
		xmlHttp.open("POST", this.pathGetIdHandler, false);
		xmlHttp.send("a=0");
		if (xmlHttp.status == 200) {
			if(!xmlHttp.responseText) {
				throw "error";
			}
			this.sessionId = xmlHttp.responseText;
			this.UPLOAD_IDENTIFIER = xmlHttp.responseText;
			} else {
				throw "error";
			}
	} catch(e) {
		throw e;
		return;
	}
}


dhtmlXVaultObject.prototype.sendIdSession = function (id)
{
//debugger;
try{
    var xmlHttp = this.createXMLHttpRequest();
        xmlHttp.open("post", this.pathGetInfoHandler , false);
        xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
        xmlHttp.send("sessionId="+this.sessionId);

        if (xmlHttp.status == 200)
        {
            if (xmlHttp.responseText)
            {
                      //debugger;
                      //alert(parseInt(xmlHttp.responseText));
                      if(isNaN(parseInt(xmlHttp.responseText)))
                      {
                           throw "error";

                      }

                     if (parseInt(xmlHttp.responseText) != -1)
                        {
                            var self=this;

                            if(!this.isDemo)
                            {
                            }
                            try
                            {
                              window.setTimeout( function () {self.sendIdSession(id)} , 500);

                            }catch(e)
                            {

                            }

                        } else if (parseInt(xmlHttp.responseText) == -1)
                        {
                            this.endLoading(id);

                            var tblContent = this.getCurrentTblContent(id);
                            tblContent.rows[1].cells[0].innerHTML += "<font class='text' >Done</font>";
                            tblContent.rows[1].cells[0].vAlign = "top";

                            if (this.isUploadFileAll == "true")
                            {
                                this.uploadAllItems();
                            }
                        }
            }
        }else
        {
            throw "error";
        }
     }
     catch(e)
     {
          this.endLoading(id);
          this.isUploadFileAll = "false";
          var tblContent = this.getCurrentTblContent(id);
          tblContent.rows[1].cells[0].innerHTML += "<font class='text' >ERROR</font>";
          tblContent.rows[1].cells[0].vAlign = "top";

         return;
     }

}

dhtmlXVaultObject.prototype.getCurrentRowListFiles = function(id)
{
    for (var i = 0; i < this.tblListFiles.rows.length; i++)
    {
        if (this.tblListFiles.rows[i].id == "rowListFiles" + id)
        {
            return this.tblListFiles.rows[i];
        }
    }
}

dhtmlXVaultObject.prototype.getCurrentTblContent = function(id)
{
    for (var i = 0; i < this.tblListFiles.rows.length; i++)
    {
        if (this.tblListFiles.rows[i].cells[0].firstChild.id == "tblContent" + id)
        {
            return this.tblListFiles.rows[i].cells[0].firstChild;
        }
    }
}

dhtmlXVaultObject.prototype.getCurrentInputFile = function(id)
{

    var collInputs = this.uploadForm.getElementsByTagName("input");

    for (var i = 0; i < collInputs.length; i++)
    {
        if (collInputs[i].id == "file" + id)
        {
            return collInputs[i];
        }
    }

}

dhtmlXVaultObject.prototype.uploadFile = function (id)
{
    //debugger;
    if ( this.isUploadFile == "false" )
    {
            //debugger;
            if (navigator.appName.indexOf("Explorer") != -1)
            {
                   this.selectItemInExplorer(id);
            }else
            {
                   this.selectItemInMozilla(id);
            }

            var tblContent = this.getCurrentTblContent(id);
                tblContent.rows[0].cells[2].removeChild(tblContent.rows[0].cells[2].firstChild)
                tblContent.rows[1].cells[1].removeChild(tblContent.rows[1].cells[1].firstChild)
                tblContent.parentNode.parentNode.attributes["isUpload"].value = "true";

            //
            this.isUploadFile = "true";

            //
            this.getCurrentInputFile(id).disabled = false;
            //debugger;
            if(!this.isDemo)
            {
            }
            else
            {
                this.progressDemo.style.display = "inline";
                this.getCurrentRowListFiles(id).cells[0].firstChild.rows[1].cells[0].appendChild(this.progressDemo);
            }

            try
            {
          //get id
            this.startRequest(id);
          //get info
            this.sendIdSession(id);

            }catch(e)
            {
               this.endLoading(id);
               this.isUploadFileAll = "false";
               var tblContent = this.getCurrentTblContent(id);
               tblContent.rows[1].cells[0].innerHTML += "<font class='text' >ERROR</font>";
               tblContent.rows[1].cells[0].vAlign = "top";

               return;
            }

            this.uploadForm.action = this.pathUploadHandler + "?baseVirtual=" + baseVirtual + "&sessionId=" + this.sessionId + "&fileName=" + this.getFileName(this.getCurrentInputFile(id).value)+"&userfile="+this.getCurrentInputFile(id).id;
            this.uploadForm.submit();

    }
}

