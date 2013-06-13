var map = null;
var propertyaddress = null;
var markersmgr = null;
var MarkersCount = null;	    	    
var AddressCount = null;
var ShowMarkersCount = null;
var LatArray = new Array();
var LongArray = new Array();

function LoadMapByAddressGroup(addressListString) {
	//-- use for multi-point mapping
	if (addressListString == "") {
		alert("Map not available for the properties on this page.");
	} else {
		if (GBrowserIsCompatible())
		{
			var mapPopup = document.getElementById("mapPopup");
			if (mapPopup) {scroll(0,0);mapPopup.className = "mapPopupON";}
			map = new GMap2(document.getElementById("map"));
			map.setCenter(new GLatLng(37.4419, -122.1419), 0);
			map.setMapType(G_HYBRID_MAP);
			map.addControl(new GMapTypeControl());
			var overviewmap = new GOverviewMapControl();
			map.addControl(overviewmap);
			map.addControl(new GScaleControl());
			map.addControl(new GLargeMapControl ());
			map.enableScrollWheelZoom();
			var geocoder = new GClientGeocoder();
			map.clearOverlays();	            			
			var addressList = addressListString.split("|");
			var mgrOptions = { borderPadding: 0, maxZoom:19, trackMarkers:false };
			markersmgr = new MarkerManager(map, mgrOptions);        
			MarkersCount = 0;
			ShowMarkersCount = 0;
			AddressCount = addressList.length;		
			for (x=0; x < addressList.length; x++) {if (addressList[x]=="") {AddressCount--;}}	
			for (x=0; x < addressList.length; x++) {propertyaddress=addressList[x];if (propertyaddress != "") {geocoder.getLocations(propertyaddress,CheckPoint);}}
		}
		else
		{
			alert("Browser isn't compatibility with Google Maps.");
		}
	}
}

function CheckPoint(response) {
	//-- used by LoadMapByAddressGroup
    MarkersCount++;    
    if (!response || response.Status.code != 200) {
        //alert("Location Not Found.");
    } else {        
        place = response.Placemark[0];
        point = new GLatLng(place.Point.coordinates[1], place.Point.coordinates[0]);
        LatArray[ShowMarkersCount] = place.Point.coordinates[1];
        LongArray[ShowMarkersCount] = place.Point.coordinates[0];        
        var marker = new GMarker(point);                
        ShowMarkersCount++;
        var stringInfo = '<br /><span style="color:Gray;">Placement on map is approximate</span><br />';        
        if (typeof(place.AddressDetails.Country.AdministrativeArea.SubAdministrativeArea) != 'undefined')
        {
            if (typeof(place.AddressDetails.Country.AdministrativeArea.SubAdministrativeArea.Locality) != 'undefined')
            { stringInfo = stringInfo + place.AddressDetails.Country.AdministrativeArea.SubAdministrativeArea.Locality.LocalityName + ', '; }
        }
        else
        {
            if (typeof(place.AddressDetails.Country.AdministrativeArea.Locality) != 'undefined')
            { stringInfo = stringInfo + place.AddressDetails.Country.AdministrativeArea.Locality.LocalityName + ', '; }
        }
        stringInfo = stringInfo + place.AddressDetails.Country.AdministrativeArea.AdministrativeAreaName + ', ' +
        place.AddressDetails.Country.CountryNameCode;                
        markersmgr.addMarker(marker, 0);        
        marker.bindInfoWindowHtml(stringInfo);
     }
        if (MarkersCount == AddressCount)
        {     
            map.setZoom(0);               
            markersmgr.refresh();                        
            var minx = 90;
            var maxx = -90;
            var miny = 180;
            var maxy = -180;
            for (k=0; k < LatArray.length; k++)
            {
                if (LatArray[k] < minx) { minx = LatArray[k]; }
                if (LatArray[k] > maxx) { maxx = LatArray[k]; }
                if (LongArray[k] < miny) { miny = LongArray[k]; }
                if (LongArray[k] > maxy) { maxy = LongArray[k]; }                        
            }
            var centerLat = (minx + maxx)/2;
            var centerLong = 0;
            var alterLong = 0;
            switch (ShowMarkersCount) {
                case 0:
                    map.setCenter(new GLatLng(37.4419, -122.1419), 0);
                    return;
                break;
                case 1:
                    map.setZoom(10);
                    return;
                break;
                case 2:
                    if ((Math.abs(maxy-miny)) <= 180)
                    {
                        centerLong = (miny + maxy)/2;
                    }
                    else
                    {
                        alterLong = (miny + maxy)/2;
                        if (alterLong >= 0)
                        {
                            centerLong = alterLong - 180;
                        }
                        else
                        {
                            centerLong = alterLong + 180;
                        }
                    }
                break;
                default:
                    var Dist = 0;
                    var CurDist = 180;
                    var findex, lindex;
                    findex = 0;
                    lindex = ShowMarkersCount-1;
                    var fy = LongArray[findex];
                    var ly = LongArray[lindex];                                                            
                    if (fy >= ly)
                    {
                        Dist = Math.abs(fy-ly);                        
                    }
                    else
                    {
                        Dist = Math.abs(ly-fy);
                    }
                    if (Dist > 180)
                    {
                        Dist = 360 - Dist;
                    }                    
                    for (k=0; k < LongArray.length-1; k++)
                    {                           
                        fy = LongArray[k];
                        ly = LongArray[k+1];                                        
                        if (fy >= ly)
                        {
                            CurDist = Math.abs(fy-ly);                        
                        }
                        else
                        {
                            CurDist = Math.abs(ly-fy);
                        }
                        if (CurDist > 180)
                        {
                            CurDist = 360 - CurDist;
                        }                        
                        if (CurDist > Dist) 
                        { 
                            Dist = CurDist; 
                            findex = k;
                            lindex = k+1;
                        }
                    }
                    if (LongArray[findex] > LongArray[lindex])
                    {
                        miny = LongArray[lindex];
                        maxy = LongArray[findex];
                    }
                    else
                    {
                        miny = LongArray[findex];
                        maxy = LongArray[lindex];
                    }
                    if ((Math.abs(maxy-miny)) <= 180)
                    {
                        centerLong = (miny + maxy)/2;
                    }
                    else
                    {
                        alterLong = (miny + maxy)/2;
                        if (alterLong >= 0)
                        {
                            centerLong = alterLong - 180;
                        }
                        else
                        {
                            centerLong = alterLong + 180;
                        }
                    }
                break;                
            }                                   
            var CenteredMap = new GLatLng(centerLat, centerLong);
            map.setCenter(CenteredMap, 19);
            var bounds = map.getBounds();
            var southWest = bounds.getSouthWest();
            var northEast = bounds.getNorthEast();
            while ((southWest.lat() > minx) || (northEast.lat() < maxx))
            {
                
                map.zoomOut();
                bounds = map.getBounds();
                southWest = bounds.getSouthWest();
                northEast = bounds.getNorthEast();
            }
            if(((miny*maxy)<0)&&((Math.abs(miny) + Math.abs(maxy)) > 180 ))            
            {
                while ((northEast.lng() < miny) || (southWest.lng() > maxy))
                {
                
                    map.zoomOut();
                    bounds = map.getBounds();
                    southWest = bounds.getSouthWest();
                    northEast = bounds.getNorthEast();
                }
            }
            else
            {
                while ((southWest.lng() > miny) || (northEast.lng() < maxy))
                {
                
                    map.zoomOut();
                    bounds = map.getBounds();
                    southWest = bounds.getSouthWest();
                    northEast = bounds.getNorthEast();
                }
            }
            //alert(map.getZoom());
            //map.zoomOut();
        }
}

function LoadMapByAddress(address) {
	//-- use for single point mapping
    if (GBrowserIsCompatible()) 
    {
        propertyaddress = address;
        map = new GMap2(document.getElementById("map"));
        map.setCenter(new GLatLng(37.4419, -122.1419), 13);
        map.setMapType(G_HYBRID_MAP);
        map.addControl(new GMapTypeControl());
        var overviewmap = new GOverviewMapControl();
        map.addControl(overviewmap);
        map.addControl(new GScaleControl());
        map.addControl(new GLargeMapControl());
        map.enableScrollWheelZoom();
        var geocoder = new GClientGeocoder();
        map.clearOverlays();
        geocoder.getLocations(propertyaddress, singlePoint);
    }
    else
    {
        alert("Browser isn't compatibility with Google Maps.");
    }
}

function singlePoint(response) {
	//-- used by LoadMapByAddress
    if (!response || response.Status.code != 200) {
        //alert("Location Not Found.");
    } else {
        place = response.Placemark[0];
        point = new GLatLng(place.Point.coordinates[1], place.Point.coordinates[0]);
        map.setCenter(point, 13);
        var marker = new GMarker(point);
        map.addOverlay(marker);
        var stringInfo = '<br /><span style="color:Gray;">Placement on map is approximate</span><br />';        
        if (typeof(place.AddressDetails.Country.AdministrativeArea.SubAdministrativeArea) != 'undefined')
        {
            if (typeof(place.AddressDetails.Country.AdministrativeArea.SubAdministrativeArea.Locality) != 'undefined')
            { stringInfo = stringInfo + place.AddressDetails.Country.AdministrativeArea.SubAdministrativeArea.Locality.LocalityName + ', '; }
        }
        else
        {
            if (typeof(place.AddressDetails.Country.AdministrativeArea.Locality) != 'undefined')
            { stringInfo = stringInfo + place.AddressDetails.Country.AdministrativeArea.Locality.LocalityName + ', '; }
        }
        stringInfo = stringInfo + place.AddressDetails.Country.AdministrativeArea.AdministrativeAreaName + ', ' +
        place.AddressDetails.Country.CountryNameCode;                
        marker.openInfoWindowHtml(stringInfo);        
    }
}

function addEvent(sEvent,fpNotify){
    if(window.attachEvent)
    {
        sEvent='on'+sEvent;window.attachEvent(sEvent,fpNotify);
    }
    else
    {
        if(window.addEventListener) {window.addEventListener(sEvent,fpNotify,false);}
    }   
}

function geoCodePlace(latitude, longitude) {
    if (GBrowserIsCompatible()) 
    {
        if (!map)
        {                       
            map = new GMap2(document.getElementById("map"));
            map.setCenter(new GLatLng(37.4419, -122.1419), 10);
            map.setMapType(G_HYBRID_MAP);
            map.addControl(new GMapTypeControl());
            var overviewmap = new GOverviewMapControl();
            map.addControl(overviewmap);
            map.addControl(new GScaleControl());
            map.addControl(new GLargeMapControl());
            map.enableScrollWheelZoom();
        }
        map.clearOverlays();
        if (markersmgr)
        {
            markersmgr.clearMarkers();
        }
        var point = new GLatLng(latitude, longitude);        
        var marker = new GMarker(point);
        map.addOverlay(marker);
        map.setCenter(new GLatLng(latitude, longitude), 10);
    }
    else
    {
        alert("Browser isn't compatibility with Google Maps.");
    }
}