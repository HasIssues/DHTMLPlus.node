///////////////////////////////////////////////////////////////////////////////
//
//  SlideshowCreate.js   			version 1.0
//
//  This file is provided by First Floor and implements parts of the Slideshow.
//
//  See also http://www.firstfloorsoftware.com/Slideshow.
// 
//  Copyright (c) 2007 First Floor. All rights reserved.
//
///////////////////////////////////////////////////////////////////////////////

function createSlideshow(parentId, settings){
    if (!parentId){
        alert("Missing required parentId parameter");
        return;
    }
    if (!settings)settings = {};
	var scene = new Slideshow.Scene();
	Silverlight.createObjectEx({
		source: 'Scene.xml',
		parentElement: document.getElementById(parentId),
		id: parentId + 'SilverlightPlugIn',
		properties: {
			width: settings.width == undefined ? '400' : settings.width,
			height: settings.height == undefined ? '388' : settings.height,
			background: settings.pageBackground == undefined ? "Transparent" : settings.pageBackground,
            isWindowless: 'false',
			version: '0.8'
		},
		events: {
		    onError: null,
			onLoad: Silverlight.createDelegate(scene, scene.handleLoad)
		},		
		context: settings 
	});
}

if (!window.Silverlight) 
	window.Silverlight = {};

Silverlight.createDelegate = function(instance, method) {
	return function() {
        return method.apply(instance, arguments);
    }
}