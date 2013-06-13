///////////////////////////////////////////////////////////////////////////////
//
//  Slide.js   			version 1.0
//
//  This file is provided by First Floor and implements parts of the Slideshow.
//
//  See also http://www.firstfloorsoftware.com/Slideshow.
// 
//  Copyright (c) 2007 First Floor. All rights reserved.
//
///////////////////////////////////////////////////////////////////////////////


var SLIDESTATE_LOADING = 0;
var SLIDESTATE_LOADED = 1;
var SLIDESTATE_SHOWING = 2;
var SLIDESTATE_SHOWED = 3;
var SLIDESTATE_HIDING = 4;
var SLIDESTATE_HIDDEN = 5;

var THEME_NONE = "none";
var THEME_STACK = "stack";
var THEME_RANDOM_STACK = "randomStack";
var THEME_RANDOM_SLIDE = "randomSlide";

var ANIMATION_NONE = "none";
var ANIMATION_RANDOM = "random";
var ANIMATION_FADE = "fade";
var ANIMATION_ZOOM = "zoom";
var ANIMATION_LEFT_TO_RIGHT = "leftToRight";
var ANIMATION_RIGHT_TO_LEFT = "rightToLeft";
var ANIMATION_TOP_TO_BOTTOM = "topToBottom";
var ANIMATION_BOTTOM_TO_TOP = "bottomToTop";
var ANIMATION_ZOOM_HORIZONTAL = "zoomHorizontal";
var ANIMATION_ZOOM_VERTICAL = "zoomVertical";

var animations = new Array(ANIMATION_FADE, ANIMATION_ZOOM, ANIMATION_LEFT_TO_RIGHT, ANIMATION_RIGHT_TO_LEFT,
    ANIMATION_TOP_TO_BOTTOM, ANIMATION_BOTTOM_TO_TOP, ANIMATION_ZOOM_HORIZONTAL, ANIMATION_ZOOM_VERTICAL);

SlideInfo = function(slideSettings, index, imageUrl, thumbnailUrl, caption){
    if (!slideSettings){return;}
    
    this.imageUrl = imageUrl;
    this.thumbnailUrl = thumbnailUrl;
    this.caption = caption;
    this.slide = null;
    
    this.speedRatio = slideSettings.speedRatio;
    this.duration = slideSettings.duration;
    this.endDelay = slideSettings.endDelay;
    this.animationBegin = slideSettings.animationBegin;
    this.animationEnd = slideSettings.animationEnd;
    this.centerX = slideSettings.centerX;
    this.centerY = slideSettings.centerY;
    this.scale = slideSettings.scale;
    this.rotateAngle = slideSettings.rotateAngle;
    this.borderVisible = slideSettings.borderVisible;
    this.borderColor = slideSettings.borderColor;
    this.borderWidth = slideSettings.borderWidth;
    this.borderRadius = slideSettings.borderRadius;

    if (slideSettings.theme == THEME_RANDOM_STACK || slideSettings.theme == THEME_RANDOM_SLIDE){
        this.duration = "0:0:3";
        this.endDelay = slideSettings.theme == THEME_RANDOM_STACK ? "0:0:17" : "0:0:0";
        this.centerX = Math.random() * .5 - .25;
        this.centerY = Math.random() * .5 - .25;
        this.scale = .5;
        this.rotateAngle = Math.random() * 20 - 10;
        this.borderVisible = true;
        this.borderColor = "White";
        this.borderWidth = 4;
        this.borderRadius = 4;
    }
    else if (slideSettings.theme == THEME_STACK){
        this.duration = "0:0:4";
        this.endDelay = "0:0:12";
        this.centerX = Math.random() * .12 - .06;
        this.centerY = Math.random() * .12 - .06;
        this.scale = .75;
        this.rotateAngle = Math.random() * 20 - 10;;
        this.borderVisible = true;
        this.borderColor = "White";
        this.borderWidth = 8;
        this.borderRadius = 4;
    }
}

SlideInfo.prototype = {
    getUrl: function(url){
        if (url){
            return this.baseUrl ? this.baseUrl + url : url;
        }
        return null;
    },
    
    getImageUrl: function(){
        return this.getUrl(this.imageUrl);
    },
    
    getThumbnailUrl: function(){
        return this.getUrl(this.thumbnailUrl);
    },
    
    getRandomAnimation: function(){
        return animations[Math.floor(Math.random() * animations.length)];
    }
}

Slide = function(control, slideInfo, width, height, warningImageUrl){
    this.warningImageUrl = warningImageUrl;
    this.slideInfo = slideInfo;
    
    // get xaml
    var xaml = this.getXaml(slideInfo);

    // create content
    this.content = control.content.createFromXaml(xaml, true);
    this.slide = this.content.findName("slide");
    this.slideBorder = this.content.findName("slideBorder");
    this.slideImage = this.content.findName("slideImage");
    this.slideImageLoader = this.content.findName("slideImageLoader");
    this.storyboard = this.content.findName("storyboard");
    this.storyboardEnd = this.content.findName("storyboardEnd");
    this.rotate = this.content.findName("rotate");
    this.scale = this.content.findName("scale");
    
    // apply speedratio to BeginTime of storyboardEnd
    var beginTime = this.storyboardEnd.beginTime.seconds;
    this.storyboardEnd.beginTime = this.getTimespan(beginTime / this.slideInfo.speedRatio);

    // attach event handlers
    this.slideImageLoader.addEventListener("DownloadProgressChanged", Silverlight.createDelegate(this, this.slide_downloadProgressChanged));
    this.slideImageLoader.addEventListener("ImageFailed", Silverlight.createDelegate(this, this.slide_imageFailed));
    this.storyboard.addEventListener("Completed", Silverlight.createDelegate(this, this.storyboard_Completed));
    this.storyboardEnd.addEventListener("Completed", Silverlight.createDelegate(this, this.storyboardEnd_Completed));

    this.stateChanged = null;
    this.state = SLIDESTATE_LOADING;
    this.paused = false;
    
    // resize
    this.resize(width, height);
}

Slide.prototype = {
    slide_downloadProgressChanged: function(sender, eventArgs){
        if (sender.downloadProgress == 1.0){
            if (sender.width == 0 || sender.height == 0){
                this.timerId = window.setTimeout(Silverlight.createDelegate(this, this.slide_ontimer), 50);
            }
            else{
                this.actualWidth = sender.width;
                this.actualHeight = sender.height;
                this.slideImage.source = this.slideImageLoader.source;
                this.onstateChanged(SLIDESTATE_LOADED);

                this.resize(this.width, this.height);
            }
        }
        else{
            this.onstateChanged(SLIDESTATE_LOADING, sender.downloadProgress);
        }
    },
    slide_ontimer: function(){
        window.clearTimeout(this.timerId);
        if (this.slideImageLoader){
            this.slide_downloadProgressChanged(this.slideImageLoader, null);
        }
    },
    
    slide_imageFailed: function(sender, eventArgs){
        if (!this.imageFailed){
            this.imageFailed = true;
            this.slideImageLoader.Source = this.warningImageUrl;
        }
        else{
            // failed to load warning image, just assume loaded state
            this.onstateChanged(SLIDESTATE_LOADED);
        }
    },
    
    storyboard_Completed: function(sender, eventArgs){
        this.onstateChanged(SLIDESTATE_SHOWED);
    },
    
    storyboardEnd_Completed: function(sender, eventArgs){
        this.onstateChanged(SLIDESTATE_HIDDEN);
    },
    
    onstateChanged: function(state, progress){
        this.state = state;
        if (this.stateChanged){
            this.stateChanged(this, state, progress);
        }
    },
    
    show: function(){
        if (this.state != SLIDESTATE_LOADING){
            this.slide.visibility = "Visible";
            this.storyboardEnd.stop();
            this.storyboard.begin();
            
            this.onstateChanged(SLIDESTATE_SHOWING);
        }
    },
    
    hide: function(immediately){
        this.storyboard.stop();
        if (immediately){
            this.storyboardEnd.stop();
            this.onstateChanged(SLIDESTATE_HIDDEN);
        }
        else{
            this.storyboardEnd.begin();
            this.onstateChanged(SLIDESTATE_HIDING);
        }
    },
    
    pause: function(){
        if (!this.paused){
            this.paused = true;
            this.storyboard.pause();
            this.storyboardEnd.pause();
        }
    },
    
    resume: function(){
        if (this.paused){
            this.paused = false;
            this.storyboard.resume();
            this.storyboardEnd.resume();
        }
    },
    
    unload: function(){
        // explicitly release all xaml references or memleak is upon us(?!)
        this.content = null;
        this.slide = null;
        this.slideBorder = null;
        this.slideImage = null;
        this.slideImageLoader = null;
        this.storyboard = null;
        this.storyboardEnd = null;
        this.scale = null;
        this.rotate = null;
    },

    resize: function(width, height){
        this.width = width;
        this.height = height;
        if (this.state == SLIDESTATE_LOADING){
            return;
        }

        this.slide.setValue("Canvas.Left", this.slideInfo.centerX * width);
        this.slide.setValue("Canvas.Top", this.slideInfo.centerY * height);
        this.slide.width = width;
        this.slide.height = height;
        
        var borderScale = 1/this.slideInfo.scale;
        var imageScale;
        
        // resize border to actual image size
        if (this.actualWidth / width < this.actualHeight / height) {
            imageScale = this.height / this.actualHeight;
            this.slideBorder.setValue("Canvas.Left", (this.width - this.actualWidth * imageScale) / 2 - this.slideInfo.borderWidth * borderScale);
            this.slideBorder.setValue("Canvas.Top", -this.slideInfo.borderWidth * borderScale);
        }
        else{
            imageScale = this.width / this.actualWidth;
            this.slideBorder.setValue("Canvas.Left", -this.slideInfo.borderWidth * borderScale);
            this.slideBorder.setValue("Canvas.Top", (this.height - this.actualHeight * imageScale) / 2 - this.slideInfo.borderWidth * borderScale);
        }
        
        this.slideBorder.height = (this.actualHeight * imageScale) + (2 * this.slideInfo.borderWidth * borderScale);
        this.slideBorder.width = (this.actualWidth * imageScale) + (2 * this.slideInfo.borderWidth * borderScale);
        if (this.imageFailed){
            // make sure error image is not scaled
            this.slideImage.width = this.imageFailed ? 48 * 1 / this.slideInfo.scale : width;
            this.slideImage.height = this.imageFailed ? 48 * 1 / this.slideInfo.scale : height;

            this.slideImage.setValue("Canvas.Left", (this.slide.width - this.slideImage.width) / 2);
            this.slideImage.setValue("Canvas.Top", (this.slide.height - this.slideImage.height) / 2);
        }
        else{
            this.slideImage.width = width;
            this.slideImage.height = height;
        }
        this.scale.scaleX = this.slideInfo.scale;
        this.scale.scaleY = this.slideInfo.scale;
        this.scale.centerX = this.slide.width / 2;
        this.scale.centerY = this.slide.height / 2;
        this.rotate.centerX = this.slide.width / 2;
        this.rotate.centerY = this.slide.height / 2;
        
        if (this.slideInfo.animationBegin == ANIMATION_LEFT_TO_RIGHT){
            this.resizeAnimation("beginTranslateX", "from", -width);
        }
        else if (this.slideInfo.animationBegin == ANIMATION_RIGHT_TO_LEFT){
            this.resizeAnimation("beginTranslateX", "from", width);
        }
        if (this.slideInfo.animationBegin == ANIMATION_TOP_TO_BOTTOM){
            this.resizeAnimation("beginTranslateY", "from", -height);
        }
        else if (this.slideInfo.animationBegin == ANIMATION_BOTTOM_TO_TOP){
            this.resizeAnimation("beginTranslateY", "from", height);
        }
        
        if (this.slideInfo.animationEnd == ANIMATION_LEFT_TO_RIGHT){
            this.resizeAnimation("endTranslateX", "to", width);
        }
        else if (this.slideInfo.animationEnd == ANIMATION_RIGHT_TO_LEFT){
            this.resizeAnimation("endTranslateX", "to", -width);
        }
        if (this.slideInfo.animationEnd == ANIMATION_TOP_TO_BOTTOM){
            this.resizeAnimation("endTranslateY", "to", height);
        }
        else if (this.slideInfo.animationEnd == ANIMATION_BOTTOM_TO_TOP){
            this.resizeAnimation("endTranslateY", "to", -height);
        }
    },
    
    resizeAnimation: function(name, property, value){
        var animation = this.content.findName(name);
        if (animation){
            animation.setValue(property, value);
        }
    },
    getTimespan: function(seconds){
    	var days = Math.floor(seconds / 86400);
        var hours = Math.floor(seconds / 3600) % 24;
        var minutes = Math.floor(seconds / 60) % 60;
        var msecStr = "" + (seconds - Math.floor(seconds))
    
        var result = days + "." + hours + ":" + minutes + ":" + Math.floor(seconds % 60) + "." + msecStr.substr(2,3);
        return result;
    },

    getXaml: function(slideInfo){
        var resources =
                '<Storyboard Name="storyboard" Duration="' + slideInfo.duration + '" SpeedRatio="' + slideInfo.speedRatio + '">';

        if (slideInfo.animationBegin == ANIMATION_FADE){
            resources +=
                '  <DoubleAnimation Storyboard.TargetName="slide" Storyboard.TargetProperty="Opacity" From="0.0" To="1.0" Duration="0:0:1"/>';
        }
        else if (slideInfo.animationBegin == ANIMATION_ZOOM){
            resources +=
                '  <DoubleAnimation Storyboard.TargetName="scale" Storyboard.TargetProperty="ScaleX" From="0.0" To="' + slideInfo.scale + '" Duration="0:0:1"/>' +
                '  <DoubleAnimation Storyboard.TargetName="scale" Storyboard.TargetProperty="ScaleY" From="0.0" To="' + slideInfo.scale + '" Duration="0:0:1"/>';
        }
        else if (slideInfo.animationBegin == ANIMATION_LEFT_TO_RIGHT ||
                slideInfo.animationBegin == ANIMATION_RIGHT_TO_LEFT ||
                slideInfo.animationBegin == ANIMATION_TOP_TO_BOTTOM ||
                slideInfo.animationBegin == ANIMATION_BOTTOM_TO_TOP){
            resources +=
                '  <DoubleAnimation Name="beginTranslateX" Storyboard.TargetName="translate" Storyboard.TargetProperty="X" Duration="0:0:1"/>' +
                '  <DoubleAnimation Name="beginTranslateY" Storyboard.TargetName="translate" Storyboard.TargetProperty="Y" Duration="0:0:1"/>';
        }
        else if (slideInfo.animationBegin == ANIMATION_ZOOM_HORIZONTAL){
            resources +=
                '  <DoubleAnimation Storyboard.TargetName="scale" Storyboard.TargetProperty="ScaleX" From="0.0" To="' + slideInfo.scale + '" Duration="0:0:1"/>';
        }
        else if (slideInfo.animationBegin == ANIMATION_ZOOM_VERTICAL){
            resources +=
                '  <DoubleAnimation Storyboard.TargetName="scale" Storyboard.TargetProperty="ScaleY" From="0.0" To="' + slideInfo.scale + '" Duration="0:0:1"/>';
        }
        
        resources +=
                '</Storyboard>' +
                '<Storyboard Name="storyboardEnd" BeginTime="' + slideInfo.endDelay + '" SpeedRatio="' + slideInfo.speedRatio + '">';

        if (slideInfo.animationEnd == ANIMATION_FADE){
            resources +=
                '  <DoubleAnimation Storyboard.TargetName="slide" Storyboard.TargetProperty="Opacity" To="0.0" Duration="0:0:1"/>';
        }
        else if (slideInfo.animationEnd == ANIMATION_ZOOM){
            resources +=
                '  <DoubleAnimation Storyboard.TargetName="scale" Storyboard.TargetProperty="ScaleX" To="0.0" Duration="0:0:1"/>' +
                '  <DoubleAnimation Storyboard.TargetName="scale" Storyboard.TargetProperty="ScaleY" To="0.0" Duration="0:0:1"/>';
        }
        else if (slideInfo.animationEnd == ANIMATION_LEFT_TO_RIGHT ||
                slideInfo.animationEnd == ANIMATION_RIGHT_TO_LEFT ||
                slideInfo.animationEnd == ANIMATION_TOP_TO_BOTTOM ||
                slideInfo.animationEnd == ANIMATION_BOTTOM_TO_TOP){
            resources +=
                '  <DoubleAnimation Name="endTranslateX" Storyboard.TargetName="translate" Storyboard.TargetProperty="X" Duration="0:0:1"/>' +
                '  <DoubleAnimation Name="endTranslateY" Storyboard.TargetName="translate" Storyboard.TargetProperty="Y" Duration="0:0:1"/>';
        }
        else if (slideInfo.animationEnd == ANIMATION_ZOOM_HORIZONTAL){
            resources +=
                '  <DoubleAnimation Storyboard.TargetName="scale" Storyboard.TargetProperty="ScaleX" From="' + slideInfo.scale + '" To="0.0" Duration="0:0:1"/>';
        }
        else if (slideInfo.animationEnd == ANIMATION_ZOOM_VERTICAL){
            resources +=
                '  <DoubleAnimation Storyboard.TargetName="scale" Storyboard.TargetProperty="ScaleY" From="' + slideInfo.scale + '" To="0.0" Duration="0:0:1"/>';
        }
        
        resources += '</Storyboard>';

        var borderScale = 1/this.slideInfo.scale;

        var xaml =
            '<Canvas Name="content">' +
            '  <Canvas Name="slide" Visibility="Collapsed">' +
            '    <Canvas.RenderTransform>' +
            '      <TransformGroup>' +
            '        <ScaleTransform Name="scale" ScaleX="' + slideInfo.scale + '" ScaleY="' + slideInfo.scale + '" />' +
            '        <RotateTransform Name="rotate" Angle="' + slideInfo.rotateAngle + '" />' +
            '        <TranslateTransform Name="translate" />' +
            '      </TransformGroup>' +
            '    </Canvas.RenderTransform>' +
            '    <Canvas.Resources>' + resources +
            '    </Canvas.Resources>' +
            '    <Rectangle Name="slideBorder" Visibility="' + (slideInfo.borderVisible ? "Visible" : "Collapsed") + '"' +
            '         Fill="' + slideInfo.borderColor + '" Stroke="Black" StrokeThickness="' + borderScale + '"' +
            '         RadiusX="' + (slideInfo.borderRadius * borderScale) + '" RadiusY="' + (slideInfo.borderRadius * borderScale) + '">' +
            '    </Rectangle>' +
            '    <Image Name="slideImage" Stretch="Uniform" />' +
            '  </Canvas>' +
            '  <Image Name="slideImageLoader" Canvas.Top="-10000" Source="' + slideInfo.getImageUrl() + '" />' +
            '</Canvas>';

        return xaml;
    }
}
