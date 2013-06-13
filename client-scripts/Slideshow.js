///////////////////////////////////////////////////////////////////////////////
//
//  Slideshow.js   			version 1.0
//
//  This file is provided by First Floor and implements parts of the Slideshow.
//
//  See also http://www.firstfloorsoftware.com/Slideshow.
// 
//  Copyright (c) 2007 First Floor. All rights reserved.
//
///////////////////////////////////////////////////////////////////////////////
if (!window.Slideshow)
	window.Slideshow = {};


Slideshow.Scene = function() 
{
}

var STATE_RUNNING = 0;
var STATE_PAUSED = 1;
var STATE_STOPPED = 2;

var BUTTON_NONE = 0;
var BUTTON_PLAYPAUSE = 1;
var BUTTON_PREVNEXT = 2;
var BUTTON_PREVNEXTPAGE = 4;
var BUTTON_FULLSCREEN = 8;
var BUTTON_SAVE = 16;
var BUTTON_ALL = 31;

var MAX_SLIDES = 250000;

Slideshow.Scene.prototype = {
	handleLoad: function(control, userContext, rootElement){
		this.control = control;
		this.control.content.onResize = Silverlight.createDelegate(this, this.onResized);
        this.control.content.onFullScreenChange = Silverlight.createDelegate(this, this.onResized);
        
        this.rootElement = rootElement;
        this.background = rootElement.findName("background");
        this.content = rootElement.findName("content");
        this.contentClip = rootElement.findName("contentClip");
        this.captionPane = rootElement.findName("captionPane");
        this.captionStoryboard = rootElement.findName("captionStoryboard");
        this.captionAnimation = rootElement.findName("captionAnimation");
        this.captionPaneClip = rootElement.findName("captionPaneClip");
        this.caption = rootElement.findName("caption");
        this.thumbnails = rootElement.findName("thumbnails");
        this.trackerPane = rootElement.findName("trackerPane");
        this.tracker = rootElement.findName("tracker");
        this.buttonPane = rootElement.findName("buttonPane");
        this.errorPane = rootElement.findName("errorPane");
        this.progressPane = rootElement.findName("progressPane");
        this.progress = rootElement.findName("progress");
        this.progressIn = rootElement.findName("progressIn");
        this.progressOut = rootElement.findName("progressOut");

        this.buttonPrevPage = rootElement.findName("buttonPrevPage");
        this.buttonPrev = rootElement.findName("buttonPrev");
        this.buttonPause = rootElement.findName("buttonPause");
        this.buttonPlay = rootElement.findName("buttonPlay");
        this.playStoryboard = rootElement.findName("playStoryboard");
        this.buttonNext = rootElement.findName("buttonNext");
        this.buttonNextPage = rootElement.findName("buttonNextPage");
        this.buttonFullScreen = rootElement.findName("buttonFullScreen");
        this.buttonResize = rootElement.findName("buttonResize");
        this.buttonSave = rootElement.findName("buttonSave");
        
        this.imageFolder = this.getValue(userContext, "imageFolder", "/comps/");
        
        this.buttonPrevPage.addEventListener("MouseLeftButtonDown", Silverlight.createDelegate(this, this.buttonPrevPage_MouseLeftButtonDown));
        this.buttonPrev.addEventListener("MouseLeftButtonDown", Silverlight.createDelegate(this, this.buttonPrev_MouseLeftButtonDown));
        this.buttonPause.addEventListener("MouseLeftButtonDown", Silverlight.createDelegate(this, this.buttonPause_MouseLeftButtonDown));
        this.buttonPlay.addEventListener("MouseLeftButtonDown", Silverlight.createDelegate(this, this.buttonPlay_MouseLeftButtonDown));
        this.buttonNext.addEventListener("MouseLeftButtonDown", Silverlight.createDelegate(this, this.buttonNext_MouseLeftButtonDown));
        this.buttonNextPage.addEventListener("MouseLeftButtonDown", Silverlight.createDelegate(this, this.buttonNextPage_MouseLeftButtonDown));
        this.buttonFullScreen.addEventListener("MouseLeftButtonDown", Silverlight.createDelegate(this, this.buttonFullScreen_MouseLeftButtonDown));
        this.buttonResize.addEventListener("MouseLeftButtonDown", Silverlight.createDelegate(this, this.buttonResize_MouseLeftButtonDown));
        this.buttonSave.addEventListener("MouseLeftButtonDown", Silverlight.createDelegate(this, this.buttonSave_MouseLeftButtonDown));

        this.slideSettings = {total:0};
        this.selectedThumbnailBorderColor = "Yellow";
        this.slideIndex = -1;
        this.slideInfos = new Array();
        this.pages = new Array();
        this.buttonOptions = BUTTON_NONE;
        this.autoPlay = true;
        this.padding = 8;

        this.stop(STATE_STOPPED);
        this.showProgress(0);
        
        Spy.trace("Creating slideshow");
        // create slideshow        
        this.createSlideshow(userContext);
	},
	
	onResized: function(sender, eventArgs){
	    var width = this.control.content.actualWidth;
	    var height = this.control.content.actualHeight;

        this.updateLayout(width, height);
	},
	
	updateLayout: function(width, height){
	    Spy.trace("updateLayout(" + width + ", " + height + ")")
	    width = Math.max(width, 116);
	    height = Math.max(height, 116);

	    this.background.width = width;
	    this.background.height = height;
	    
	    var contentHeight = height - 2 * this.padding;
	    var buttonTop = height - this.padding;
  	    if (this.buttonOptions > 0 || this.trackerPane.visibility == "Visible"){
	        contentHeight -= (20 + this.padding);
	        buttonTop -= 20;
	    }

	    if (this.thumbnails.visibility == "Visible"){
	        contentHeight -= (48 + this.padding);
	    }
	    
	    this.content.setValue("Canvas.Left", this.padding);
	    this.content.setValue("Canvas.Top", this.padding);
	    this.content.width = width - 2 * this.padding;
	    this.content.height = contentHeight;
	    this.contentClip.rect = "0,0," + this.content.width + "," + this.content.height;

        this.progressPane.setValue("Canvas.Top", this.content.height / 2);
        this.progressPane.setValue("Canvas.Left", Math.floor(width / 2 - this.progressPane.width / 2));
        this.errorPane.setValue("Canvas.Left", (this.content.width - this.errorPane.width) / 2);

        this.errorPane.setValue("Canvas.Top", (this.content.height - this.errorPane.height) / 2);
        this.errorPane.setValue("Canvas.Left", (this.content.width - this.errorPane.width) / 2);
	    this.trackerPane.setValue("Canvas.Top", height - 20 - this.padding);

	    this.buttonPane.setValue("Canvas.Left", Math.floor(width / 2));
        this.buttonPane.setValue("Canvas.Top", buttonTop);
	    this.thumbnails.setValue("Canvas.Top", buttonTop - 48 - this.padding);
	    
	    this.captionPane.width = width - 2 * this.padding;
	    this.caption.width = width - 2 * this.padding;
	    this.caption.text = this.caption.text;
	    
	    this.updateCaptionLayout();

        var infos = this.getLoadedSlideInfos();
        for(var i = 0; i < infos.length; i++){
            var captionHeight = this.getCaptionHeight(infos[i]);
            infos[i].slide.resize(this.content.width, this.content.height - captionHeight);
        }
	    
	    this.updateThumbnails(true)
	    Spy.trace("end of updateLayout(" + width + ", " + height + ")")
    },
    
    updateCaptionLayout: function(){
        var captionBottom = this.content.height;
        var captionHeight = this.captionVisible && this.caption.text ? this.caption.actualHeight + 4 : 0;
        var captionWidth = this.captionVisible && this.caption.text ? this.caption.actualWidth : 0;
        
        this.captionPane.height = captionHeight;
        this.captionPaneClip.rect = "0,0," + this.captionPane.width + "," + captionHeight;
        this.caption.height = captionHeight > 0 ? captionHeight - 4 : 0;

        this.caption.setValue("Canvas.Left", (this.content.width - captionWidth) / 2)
   	    this.captionPane.setValue("Canvas.Top", captionBottom - captionHeight);
    },
   
    updateThumbnails: function(force){
        if (this.thumbnails.visibility == "Collapsed"){
            return;
        }
        
        var thumbnailCount = Math.floor((this.content.width + 8) / 56);
        var startIndex = Math.floor(this.slideIndex / thumbnailCount) * thumbnailCount;
        
        if (this.slideIndex == -1){
            startIndex = 0;
        }

        if (force || this.getThumbnail(startIndex) == null){
            this.thumbnails.children.clear();
        }
        var x = 0;
        var dummySlideInfo = new SlideInfo();
        for(var i = startIndex; i < Math.min(startIndex + thumbnailCount, this.slideSettings.total); i++){
            var slideInfo = this.slideInfos[i];
            if (!slideInfo){
                // another page is needed
                this.loadSlidesForIndex(i);

                // for now use dummy slideinfo
                slideInfo = dummySlideInfo;
            }
            var url = slideInfo.getThumbnailUrl();
            var thumbnailName = this.getThumbnailName(i);
            var thumbnailImageName = this.getThumbnailImageName(i);
            
            var thumbnail = this.getThumbnail(i);
            if (thumbnail == null){
                var xaml =  '<Canvas>' +
                            '  <Rectangle Canvas.Left="' + x + '" Width="48" Height="48" RadiusX="4" RadiusY="4" Fill="Black"/>' +
                            '  <Rectangle Name="' + thumbnailName + '" Canvas.Left="' + (x - 1) + '" Canvas.Top="-1" Width="50" Height="50" Opacity="0" RadiusX="4" RadiusY="4" Stroke="#00000000" StrokeThickness="2" Cursor="Hand">' +
                            '    <Rectangle.Resources>' +
                            '      <Storyboard Name="story' + thumbnailImageName + '">' +
                            '        <DoubleAnimation ' +
                            '          Storyboard.TargetName="' + thumbnailName + '" ' +
                            '          Storyboard.TargetProperty="Opacity" ' +
                            '          Duration="0:0:0.5" ' +
                            '          To="0.5"/>' +
                            '      </Storyboard>' +
                            '    </Rectangle.Resources>' +
                            '    <Rectangle.Fill>' +
                            '      <ImageBrush Name="' + thumbnailImageName + '" Stretch="UniformToFill" ';
                if (url){
                    xaml += '        ImageSource="' + url + '"';
                }
                xaml +=     ' /> </Rectangle.Fill>' +
                            '  </Rectangle></Canvas>';
                
                this.thumbnails.children.add(this.control.content.createFromXaml(xaml));
                thumbnail = this.getThumbnail(i);
                
                thumbnail.addEventListener("MouseEnter", Silverlight.createDelegate(this, this.thumbnail_MouseEnter));
                thumbnail.addEventListener("MouseLeave", Silverlight.createDelegate(this, this.thumbnail_MouseLeave));
                thumbnail.addEventListener("MouseLeftButtonDown", Silverlight.createDelegate(this, this.thumbnail_MouseLeftButtonDown));
                thumbnail.fill.addEventListener("ImageFailed", Silverlight.createDelegate(this, this.thumbnail_ImageFailed));
                thumbnail.fill.addEventListener("DownloadProgressChanged", Silverlight.createDelegate(this, this.thumbnail_DownloadProgressChanged));
            }
            else if (!thumbnail.fill.imageSource){
                thumbnail.fill.imageSource = url;
            }
            
            if (thumbnail.fill.downloadProgress == 1.0){
                this.thumbnail_DownloadProgressChanged(thumbnail.fill, null);
            }

            if (i == this.slideIndex){
                thumbnail.stroke = this.selectedThumbnailBorderColor;
            }

            x += 56
        }
    },
    
    selectThumbnail: function(index, select){
        if (this.thumbnails.visibility == "Collapsed"){
            return;
        }

        var thumbnail = this.getThumbnail(index);
        if (thumbnail){
            thumbnail.stroke = select ? this.selectedThumbnailBorderColor : "#00000000";
        }
        else if (select){
            this.updateThumbnails(false);
        }
    },
    
    showProgress: function(progress){
        this.progress.width = progress * 100;
        if (progress < 1){
            this.progressIn.begin();
        }
        else{
            this.progressOut.begin();
        }
    },
    
    getPrevSlideIndex: function(){
        var index = this.slideIndex - 1;
        if (index < 0){
            index = this.slideSettings.total - 1;
        }
        return index;
    },
    
    getNextSlideIndex: function(){
        var index = this.slideIndex + 1;
        if (index >= this.slideSettings.total){
            index = 0;
        }
        return index
    },

    loadSlide: function(slideInfo){
        if (!slideInfo.slide){
            var captionHeight = this.getCaptionHeight(slideInfo);
            slideInfo.slide = new Slide(this.control, slideInfo, this.content.width, this.content.height - captionHeight, this.getImageUrl('warning.png'));
            slideInfo.slide.stateChanged = Silverlight.createDelegate(this, this.slide_stateChanged);
            
            this.content.children.add(slideInfo.slide.content);
        }
    },
    
    unloadSlide: function(slideInfo){
        this.content.children.remove(slideInfo.slide.content);

        slideInfo.slide.unload();
        slideInfo.slide.stateChanged = null;
        slideInfo.slide = null;
    },

    showSlide: function(index, repaint){
        if (index != this.slideIndex || repaint){
            // unselect current thumbnail
            this.selectThumbnail(this.slideIndex, false);
        }
    
        var slideInfo = this.getSlideInfo(index);
        if (slideInfo){
            if (index != this.slideIndex || repaint){
                if (this.state != STATE_STOPPED){
                    var currentSlideInfo = this.getSlideInfo(this.slideIndex);
                    if (currentSlideInfo && currentSlideInfo.slide){
                        currentSlideInfo.slide.hide(false);
                    }
                }

                this.slideIndex = index;

                // select new slide
                if (slideInfo.slide){
                    slideInfo.slide.show();
                }
                else{
                    this.showProgress(0);
                    this.loadSlide(slideInfo);
                }
            }
        }
        else{
            this.slideIndex = index;
            this.loadSlidesForIndex(index);
        }
        
        this.selectThumbnail(this.slideIndex, true);
        var msg = "No slides found";
        if (this.slideSettings.total > 0){
            msg = "Slide " + (this.slideIndex + 1) + " of " + this.slideSettings.total;
        }
        this.tracker.Text = msg;
    },
    
    slide_stateChanged: function(sender, slideState, progress){
        //Spy.trace("slide_stateChanged(" + sender.slideInfo.imageUrl + ", " + slideState + ", " + progress + ")");
        var currentSlideInfo = this.getSlideInfo(this.slideIndex);
        var isCurrent = currentSlideInfo == sender.slideInfo;
        
        if (slideState == SLIDESTATE_LOADING){
            if (isCurrent){
                this.showProgress(progress);
            }
        }
        else if (slideState == SLIDESTATE_LOADED){
            if (isCurrent){
                this.showProgress(1);
                sender.show();
            }
        }
        else if (slideState == SLIDESTATE_SHOWING){
            if (this.state == STATE_RUNNING){
                // preload next slide
                var nextIndex = this.getNextSlideIndex();
                Spy.trace("preloading(" + nextIndex + ")");
                var nextSlideInfo = this.getSlideInfo(nextIndex);
                if (nextSlideInfo){
                    this.loadSlide(nextSlideInfo);
                }
            }
            
            this.caption.text = currentSlideInfo.caption;
            this.updateCaptionLayout();
            
            this.captionStoryboard.begin();
        }
        else if (slideState == SLIDESTATE_SHOWED){
            if (isCurrent && this.state == STATE_RUNNING){
                var index = this.getNextSlideIndex();
                if (index != this.slideIndex){
                    this.showSlide(index);
                }
            }
        }
        else if (slideState == SLIDESTATE_HIDDEN){
            this.unloadSlide(sender.slideInfo);
            
            Spy.trace("Slides left: " + this.content.children.count);
        }
    },

    thumbnail_MouseEnter: function(sender, eventArgs){
        sender.opacity = 1
    },

    thumbnail_MouseLeave: function(sender, eventArgs){
       sender.opacity = 0.5
    },

    thumbnail_MouseLeftButtonDown: function(sender, eventArgs){
        var index = this.getIndexFromName(sender.name);
        if (index != this.slideIndex){
            this.stop(STATE_STOPPED);
            this.showSlide(index);
        }
    },

    thumbnail_DownloadProgressChanged: function(sender, eventArgs){
        if (sender.downloadProgress == 1.0){
            var storyboard = this.content.FindName("story" + sender.name);
            if (storyboard){
                storyboard.begin();
            }
        }
    },
    
    thumbnail_ImageFailed: function(sender, eventArgs){
        if (sender.stretch != "None"){
            sender.stretch = "None";
            sender.ImageSource = this.getImageUrl('warning.png');
        }
    },

    buttonPrevPage_MouseLeftButtonDown: function(sender, eventArgs){
        if (this.slideSettings.total < 2){ return; }
        this.stop(STATE_STOPPED);

        var thumbnailCount = Math.floor((this.content.width + 8) / 56);
        var index = Math.floor((this.slideIndex - thumbnailCount) / thumbnailCount) * thumbnailCount;

        if (index < 0){
            var offset = this.slideSettings.total % thumbnailCount;
            if (offset == 0){
                offset = thumbnailCount;
            }
            index = this.slideSettings.total - offset;
        }

        this.showSlide(index);
    },
    
    buttonPrev_MouseLeftButtonDown: function(sender, eventArgs){
        if (this.slideSettings.total < 2){ return; }
        this.stop(STATE_STOPPED);
        this.showSlide(this.getPrevSlideIndex());
    },

    buttonPause_MouseLeftButtonDown: function(sender, eventArgs){
        if (this.slideSettings.total == 0){ return; }
        this.stop(STATE_PAUSED);
    },

    buttonPlay_MouseLeftButtonDown: function(sender, eventArgs){
        if (this.slideSettings.total == 0){ return; }
        this.play();
    },
   
    buttonNext_MouseLeftButtonDown: function(sender, eventArgs){
        if (this.slideSettings.total < 2){ return; }
        this.stop(STATE_STOPPED);

        this.showSlide(this.getNextSlideIndex());
    },
    
    buttonNextPage_MouseLeftButtonDown: function(sender, eventArgs){
        if (this.slideSettings.total < 2){ return; }
        this.stop(STATE_STOPPED);
        
        var thumbnailCount = Math.floor((this.content.width + 8) / 56);
        var index = Math.floor((this.slideIndex + thumbnailCount) / thumbnailCount) * thumbnailCount;

        if (index >= this.slideSettings.total){
            index = 0;
        }

        this.showSlide(index);
    },
    
    buttonFullScreen_MouseLeftButtonDown: function(sender, eventArgs){
        this.buttonResize.visibility = "Visible";
        this.buttonFullScreen.visibility = "Collapsed";
        this.buttonSave.visibility = "Collapsed";
        this.control.content.fullScreen = true;
        
        button_MouseLeave(sender, eventArgs);   // enforce mouse leave repaint
    },
    
    buttonResize_MouseLeftButtonDown: function(sender, eventArgs){
        this.buttonFullScreen.visibility = "Visible";
        if ((this.buttonOptions & BUTTON_SAVE) > 0){
            this.buttonSave.visibility = "Visible";
        }
        this.buttonResize.visibility = "Collapsed";
        this.control.content.fullScreen = false;
        
        button_MouseLeave(sender, eventArgs);   // enforce mouse leave repaint
    },
    
    buttonSave_MouseLeftButtonDown: function(sender, eventArgs){
        var slideInfo = this.getSlideInfo(this.slideIndex);
        if (slideInfo){
            window.open(slideInfo.getImageUrl());
        }
    },
    
    stop: function(stopState){
        this.state = stopState;
        this.buttonPlay.visibility = "Visible";
        this.playStoryboard.begin();
        this.buttonPause.visibility = "Collapsed";
        
        button_MouseLeave(this.buttonPlay, null);   // enforce mouse leave repaint
        
        var infos = this.getLoadedSlideInfos();
        for(var i = 0; i < infos.length; i++){
            if (stopState == STATE_PAUSED){
                infos[i].slide.pause();
            }
            else{
                infos[i].slide.hide(true);
            }
        }
    },
    
    play: function(){
        if (this.state != STATE_RUNNING){
            if ((this.buttonOptions & BUTTON_PLAYPAUSE) > 0){
                this.buttonPause.visibility = "Visible";
            }
            this.buttonPlay.visibility = "Collapsed";
            this.playStoryboard.stop();

            var infos = this.getLoadedSlideInfos();
            for(var i = 0; i < infos.length; i++){
                infos[i].slide.resume();
            }

            var stopped = this.state == STATE_STOPPED;
            
            this.state = STATE_RUNNING;

            if (stopped){
                this.showSlide(this.getNextSlideIndex());
            }
        }
    },
    setButtonColors: function(btn, backColor, foreColor, borderColor){
        var rect = btn.children.getItem(0);
        rect.fill = backColor;
        rect.stroke = borderColor;
        
        for(var i = 1; i < btn.children.count; i++){
            var shape = btn.children.getItem(i);
            if (shape.fill) shape.fill = foreColor;
            if (shape.stroke) shape.stroke = foreColor;
        }
    },
    getIndexFromName: function(name){
        var i = name.lastIndexOf('.');
        if (i != -1){
            return parseInt(name.substr(i+1));
        }
        return -1;
    },
    
    getLoadedSlideInfos: function(){
        var infos = new Array();
        for(var i = 0; i < this.slideSettings.total; i++){
	        var slideInfo = this.slideInfos[i];
	        if (slideInfo && slideInfo.slide){
	            infos.push(slideInfo);
	        }
	    }

        return infos;
    },
    
    getSlideInfo: function(index){
        if (index >= 0 && index < this.slideInfos.length){
            return this.slideInfos[index];
        }
        return null;
    },

    getThumbnailName: function(index){
        return "thumbnail." + index;
    },

    getThumbnailImageName: function(index){
        return "thumbnailImage." + index;
    },
    
    getThumbnail: function(index){
        var thumbnailName = this.getThumbnailName(index);
        return this.content.FindName(thumbnailName);
    },
    getImageUrl: function(image){
        return this.imageFolder + image;
    },
    loadSlides: function(url, page){
        if (url.substr(0,1) == "#"){
            // inline xml
            var id = url.substr(1);
            var element = document.getElementById(id);
            if (element){
                this.pages[1] = true;
                this.addSlides(this.createDocument(element.innerHTML));
            }
            else{
                throw "Element " + id + " not found";
            }
        }
        else{
            if (page){
                url += (url.indexOf("?") == -1) ? "?" : "&";
                url += "page=" + page;
            }
            else{
                page = 1;
            }
            
            Spy.trace('----' + this.pages[page]);
            if (!this.pages[page]){
                Spy.trace("load slide page " + page);
                this.pages[page] = true;
                this.loadXml(url, Silverlight.createDelegate(this, this.onloadSlides));
            }
        }
    },

    loadSlidesForIndex: function(slideIndex){
        if (slideIndex >= 0 && slideIndex < this.slideSettings.total && this.slidesSource){
            var page = Math.floor(slideIndex / this.slideSettings.pageSize) + 1;
            
            this.loadSlides(this.slidesSource, page);
        }
    },    
    
    createSlideshow: function(settings){
        try{
            this.rootElement.visibility = "Visible";
            
            // apply slideshow settings
            this.thumbnails.visibility = this.getValue(settings, "thumbnailsVisible", true) ? "Visible" : "Collapsed";
            this.trackerPane.visibility = this.getValue(settings, "trackerVisible", true) ? "Visible" : "Collapsed";
            this.tracker.foreground = this.getValue(settings, "trackerForeground", "Silver");
            this.tracker.fontFamily = this.getValue(settings, "trackerFontFamily", "Verdana");
            this.tracker.fontSize = this.getValue(settings, "trackerFontSize", 11);
            this.tracker.fontStyle = this.getValue(settings, "trackerFontStyle", "Normal");
            this.tracker.fontWeight = this.getValue(settings, "trackerFontWeight", "Normal");
            this.selectedThumbnailBorderColor = this.getValue(settings, "selectedThumbnailBorderColor", this.selectedThumbnailBorderColor);
            this.background.fill = this.getValue(settings, "background", "#202020");
            this.captionVisible = this.getValue(settings, "captionVisible", true);
            this.captionPane.background = this.getValue(settings, "captionBackground", "Black");
            this.caption.foreground = this.getValue(settings, "captionForeground", "White");
            this.caption.fontFamily = this.getValue(settings, "captionFontFamily", "Verdana");
            this.caption.fontSize = this.getValue(settings, "captionFontSize", 11);
            this.caption.fontStyle = this.getValue(settings, "captionFontStyle", "Normal");
            this.caption.fontWeight = this.getValue(settings, "captionFontWeight", "Normal");
            this.defaultCaptionHeight = this.caption.fontSize + 4;
            this.captionAnimation.to = this.getValue(settings, "captionOpacity", .7);
            var borderRadius = this.getValue(settings, "borderRadius", 8);
            this.background.radiusX = borderRadius;
            this.background.radiusY = borderRadius;
            this.contentClip.radiusX = borderRadius;
            this.contentClip.radiusY = borderRadius;
            this.content.background = this.getValue(settings, "contentBackground", "Black");
            this.buttonOptions = this.getValue(settings, "buttonOptions", BUTTON_ALL);
            this.buttonPane.visibility = (this.buttonOptions > 0) ? "Visible" : "Collapsed";
            this.padding = this.getValue(settings, "padding", 8);
            this.autoPlay = this.getValue(settings, "autoPlay", true);
            
            var btnBackground = this.getValue(settings, "buttonBackground", "Black");
            var btnForeground = this.getValue(settings, "buttonForeground", "White");
            var btnPlayForeground = this.getValue(settings, "buttonPlayForeground", "LightGreen");
            var btnBorder = this.getValue(settings, "buttonBorderColor", "White");
            
            this.setButtonColors(this.buttonPrevPage, btnBackground, btnForeground, btnBorder);
            this.setButtonColors(this.buttonPrev, btnBackground, btnForeground, btnBorder);
            this.setButtonColors(this.buttonPause, btnBackground, btnForeground, btnBorder);
            this.setButtonColors(this.buttonPlay, btnBackground, btnPlayForeground, btnBorder);
            this.setButtonColors(this.buttonNext, btnBackground, btnForeground, btnBorder);
            this.setButtonColors(this.buttonNextPage, btnBackground, btnForeground, btnBorder);
            this.setButtonColors(this.buttonFullScreen, btnBackground, btnForeground, btnBorder);
            this.setButtonColors(this.buttonResize, btnBackground, btnForeground, btnBorder);
            this.setButtonColors(this.buttonSave, btnBackground, btnForeground, btnBorder);
            
            if ((this.buttonOptions & BUTTON_PLAYPAUSE) == 0){
                this.buttonPlay.visibility = "Collapsed";
                this.buttonPause.visibility = "Collapsed";
            }
            if ((this.buttonOptions & BUTTON_PREVNEXT) == 0){
                this.buttonPrev.visibility = "Collapsed";
                this.buttonNext.visibility = "Collapsed";
            }
            if ((this.buttonOptions & BUTTON_PREVNEXTPAGE) == 0){
                this.buttonPrevPage.visibility = "Collapsed";
                this.buttonNextPage.visibility = "Collapsed";
            }
            if ((this.buttonOptions & BUTTON_FULLSCREEN) == 0){
                this.buttonFullScreen.visibility = "Collapsed";
            }
            if ((this.buttonOptions & BUTTON_SAVE) == 0){
                this.buttonSave.visibility = "Collapsed";
            }
            this.onResized();
            
            if (!settings.slideSettings){settings.slideSettings = {}};

            this.slideSettings = {
                total: 0,
                theme: this.getValue(settings.slideSettings, "theme", THEME_NONE),
                speedRatio: this.getValue(settings.slideSettings, "speedRatio", 1),
                duration: this.getValue(settings.slideSettings, "duration", "0:0:5"),
                endDelay: this.getValue(settings.slideSettings, "endDelay", "0:0:0"),
                animationBegin: this.getValue(settings.slideSettings, "animationBegin", ANIMATION_FADE),
                animationEnd: this.getValue(settings.slideSettings, "animationEnd", ANIMATION_FADE),
                centerX: this.getValue(settings.slideSettings, "centerX", 0),
                centerY: this.getValue(settings.slideSettings, "centerY", 0),
                scale: this.getValue(settings.slideSettings, "scale", 1),
                rotateAngle: this.getValue(settings.slideSettings, "rotateAngle", 0),
                borderVisible: this.getValue(settings.slideSettings, "borderVisible", false),
                borderColor: this.getValue(settings.slideSettings, "borderColor", "Black"),
                borderWidth: this.getValue(settings.slideSettings, "borderWidth", 4),
                borderRadius: this.getValue(settings.slideSettings, "borderRadius", 4)
            };
            this.slidesSource = this.getValue(settings, "slidesSource", "slides.xml");
            Spy.trace('About to load ' + this.slidesSource);
            this.loadSlides(this.slidesSource);
        }
        catch(e){
            var details = e.description;
            if (!details){
                details = e.toString();
            }
            this.showError("Slideshow settings not valid\n\n" + details);
        }
    },
    
    onloadSlides: function(sender, eventArgs){
    Spy.trace('onloadslides');
        try{
            this.addSlides(this.createDocument(sender.responseText));
        }
        catch(e){
            var details = e.description;
            if (!details){
                details = e.toString();
            }
            this.showError("Slideshow data not valid\n\n" + details);
        }
    },
    
    addSlides: function(doc){
        try{
            var slidesNode = doc.getElementsByTagName("slides")[0];
            var slideNodes = doc.getElementsByTagName("slide");
            
            var total = Math.min(MAX_SLIDES, this.getIntAttribute(slidesNode, "total", slideNodes.length));
            var page = this.getIntAttribute(slidesNode, "page", 1);
            var pageSize = this.getIntAttribute(slidesNode, "pageSize", total);
            
            this.slideSettings.total = total;
            this.slideSettings.pageSize = pageSize;
            var startIndex = (page - 1) * pageSize;
            
            for(var i = 0; i < slideNodes.length; i++){
                node = slideNodes[i];

                var imageUrl = node.getAttribute("imageUrl");
                var thumbnailUrl = node.getAttribute("thumbnailUrl");
                var caption = node.getAttribute("caption");
                
                var info = new SlideInfo(this.slideSettings, i, imageUrl, thumbnailUrl, caption);
                this.applyAttribute(slidesNode, info, "baseUrl");
                this.applyAttribute(node, info, "duration");
                this.applyAttribute(node, info, "endDelay");
                this.applyAttribute(node, info, "animationBegin");
                this.applyAttribute(node, info, "animationEnd");
                this.applyAttribute(node, info, "centerX");
                this.applyAttribute(node, info, "centerY");
                this.applyAttribute(node, info, "scale");
                this.applyAttribute(node, info, "rotateAngle");
                this.applyAttribute(node, info, "borderVisible", true);
                this.applyAttribute(node, info, "borderColor");
                this.applyAttribute(node, info, "borderWidth");
                this.applyAttribute(node, info, "borderRadius");

                if (info.animationBegin == ANIMATION_RANDOM){
                    info.animationBegin = info.getRandomAnimation();
                }
                if (info.animationEnd == ANIMATION_RANDOM){
                    info.animationEnd = info.getRandomAnimation();
                }

                this.slideInfos[startIndex + i] = info;
            }

            if (this.slideIndex == -1 && this.autoPlay){
                this.play();
            }
            else if (this.slideIndex >= startIndex && this.slideIndex < startIndex + pageSize){
                this.showSlide(this.slideIndex, true);
                this.updateThumbnails(false);
            }
            else{
                this.updateThumbnails(false);
            }
        }
        catch(e){
            var details = e.description;
            if (!details){
                details = e.toString();
            }
            this.showError("Failed to process loaded slides\n\n" + details);
        }
    },
    
    applyAttribute: function(node, info, name, isBool){
        var value = node.getAttribute(name);
        if (value){
            if (isBool){
                info[name] = (value.toLowerCase() == "true");
            }
            else{
                info[name] = value;
            }
        }
    },
    
    getCaptionHeight: function(slideInfo){
        return this.captionVisible && slideInfo.caption ? this.defaultCaptionHeight : 0;
    },
    
    getAttribute: function(node, name, defaultValue){
        var value = node.getAttribute(name);
        if (value){
            return value;
        }
        return defaultValue;
    },
    
   
    getIntAttribute: function(node, name, defaultValue){
        var value = node.getAttribute(name);
        if (value){
            return parseInt(value);
        }
        return defaultValue;
    },
    
    getValue: function(o, name, defaultValue){
        if (o[name] == undefined){
            return defaultValue;
        }
        return o[name];
    },
    
    loadXml: function(url, handler){
        Spy.trace("loadXml(" + url + ")");
        this.showProgress(0);
        var downloader = this.control.createObject("downloader");

        downloader.addEventListener("downloadProgressChanged", Silverlight.createDelegate(this, this.downloader_downloadProgressChanged));
        downloader.addEventListener("downloadFailed", Silverlight.createDelegate(this, this.downloader_downloadFailed));
        downloader.addEventListener("completed", handler);
        
        downloader.open("GET", url);
        downloader.send();
    },
    
    downloader_downloadProgressChanged: function(sender, eventArgs){
        this.showProgress(sender.downloadProgress);
    },
    
    downloader_downloadFailed: function(sender, eventArgs){
        this.showProgress(1);
        this.showError("Failed to load " + sender.uri + "\n\nHTTP status: " + sender.status + " " + sender.statusText);
    },

    createDocument: function(xml){
        xml = xml.replace(/^\s+|\s+$/g, '');        //trim
        if (window.ActiveXObject) {
            var doc = new ActiveXObject("Microsoft.XMLDOM");
            if (!doc.loadXML(xml)){
                throw doc.parseError.reason;
            }
            return doc;
        }
        else{
            var parser = new DOMParser();
            return parser.parseFromString(xml, "text/xml");
        }
    },
    
    showError: function(msg){
        var xaml =
            '<Canvas>' + 
            '  <Image Source="' + this.getImageUrl('error.png') + '" />' + 
            '  <TextBlock Name="textError" Canvas.Left="50" TextWrapping="Wrap" FontFamily="Verdana" FontSize="10" Foreground="Silver"></TextBlock>' +
            '</Canvas>';

        var canvas = this.control.content.createFromXaml(xaml, true);
        var textError = canvas.findName("textError");

        textError.text = msg;
        this.rootElement.visibility = "Visible";
        this.errorPane.width = Math.max(this.control.content.actualWidth - 20, 100);
        textError.width = this.errorPane.width - 50;
        this.errorPane.setValue("Canvas.Left", (this.control.content.actualWidth - this.errorPane.width) / 2);
        this.errorPane.children.add(canvas);
    }
}

function button_MouseEnter(sender, eventArgs){
    sender.opacity = 1
}

function button_MouseLeave(sender, eventArgs){
    sender.opacity = 0.5
}
