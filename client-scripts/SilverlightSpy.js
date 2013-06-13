///////////////////////////////////////////////////////////////////////////////
//
//  SilverlightSpy.js   			version 1.0
//
//  This file is provided by First Floor as a debugging helper file to be used
//  in conjunction with First Floor Silverlight Spy.
//
//  See also http://www.firstfloorsoftware.com/SilverlightSpy.
// 
//  Copyright (c) 2007 First Floor. All rights reserved.
//
///////////////////////////////////////////////////////////////////////////////

if (!window.Spy){
    window.Spy = {}
}

if (window.external.toString && window.external.toString() == "FirstFloor.SilverlightSpy.External"){
    Spy.trace = function(message){window.external.Trace(message);}
}
else{
    Spy.trace = function(message){}
}

