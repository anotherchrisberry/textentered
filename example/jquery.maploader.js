 (function( $ ){

  var formatAddress = function(address) {
	  var result = '';
	  var components = address.address_components;
	  for (var x = 0; x < components.length; x++) {
		  var type = components[x].types[0];
		  var text = components[x].long_name;
		  if (type == "street_number") {
			  result += text + ' ';
		  }
		  if (type == 'route') {
			  result += text + '<br/>';
		  }
		  if (type == 'locality') {
			  result += text + ', ';
		  }
		  if (type == 'administrative_area_level_1') {
			  result += text + ' ';
		  }
		  if (type == 'postal_code') {
			  result += text;
		  }
	  }
	  return result;
  };
	 
  var methods = {
	 
	 loadImage : function() {
		var $this = $(this);
		var loc = $this.val();

		var data = $this.data('maploader');
		var size = data.size;
		var zoom = data.zoom;
		if (data.staticMap) {
			var newImageUrl = 'http://maps.googleapis.com/maps/api/staticmap?maptype=' + data.maptype + '&center=' + escape(loc) + '&zoom=' + zoom + '&size=' + size.x + 'x' + size.y + '&sensor=false';
			if (data.marker.enabled) {
				newImageUrl += '&markers=size:' + data.marker.size + '%7Ccolor:' + data.marker.color + '%7Clabel:' + data.marker.label + '%7C' + escape(loc);
			}
			//console.log('loading map image: ' + newImageUrl);
			data.backupImage = new Image();
			data.backupImage.src = newImageUrl;
		}
		$this.maploader('swapImage');
	 },
	 
	 swapImage : function() {
		 var $this = $(this);
		 var $data = $this.data('maploader');
		 if ($data.staticMap) {
			 $data.mapImg.css('opacity', 0.5);
			 if ($data.backupImage.height > 0) {
				 $data.mapImg.attr('src', $data.backupImage.src);
				 $data.mapImg.css('opacity', 1);
			 } else {
				 setTimeout(function() {$this.maploader('swapImage');}, 100);
			 }
		 } else {
			 $data.geocoder.geocode( { address: $this.val()}, function(results, status) {
				 //console.log(results);
				 //console.log(status);
			      if (status == google.maps.GeocoderStatus.OK) {
			          if ($data.marker) {
			        	  $data.marker.setPosition(results[0].geometry.location);
			          } else {
			        	  $data.marker = new google.maps.Marker({
				              map: $data.map,
				              position: results[0].geometry.location
				          });
			          }
		        	  $data.map.panTo(results[0].geometry.location);
		        	//  console.log(results[0]);
		        	  if ($data.infoOverlay) {
		        		  $data.infoOverlay.setContent(formatAddress(results[0]));
		        	  } else {
		        	   	  $data.infoOverlay = new google.maps.InfoWindow({
		        	   		  content: formatAddress(results[0])
		        	   	  });
		        	  }
		        	  //console.log(results[0]);
		        	  $data.infoOverlay.open($data.map, $data.marker);
		        	  
			      } else {
			    	  // do nothing, but, hey, it failed.
			      }
			 });
		 }
	 },
	 
     init : function( options ) {

    	 var defaults = {
    			 marker: {
	    			 enabled: true,
	    			 color: 'blue',
	    			 size: 'medium',
	    			 label: '-'
    			 },
    			 maptype: 'roadmap',
    			 zoom: 11,
    			 zoomSlider: '#zoom', // requires jQuery UI slider plugin
    			 staticMap: false
    	 };
    	 
    	 settings = $.extend({}, defaults, options);
    	 settings.marker = $.extend({}, defaults.marker, options.marker);
    	 
    	 return this.each(function() {
        	 var $this = $(this);
        	 var $data = $this.data('maploader');
        	 if (!$data) {
        		 $this.data('maploader', {});
        		 $data = $this.data('maploader');
        	 }
        	 $data.backupImage = new Image();
        	 $data.lastKeypress = new Date();
        	 $data.backupImageLoading = false;
        	 $data.lastValue = $this.val();
        	 $data.marker = settings.marker;
        	 $data.zoom = settings.zoom;
        	 $data.maptype = settings.maptype;
        	 $data.staticMap = settings.staticMap;
        	 $data.geocoder = new google.maps.Geocoder();
        	 
        	 var $mapContainer;
        	 if (settings.placeholder) {
        		 $mapContainer = $(options.placeholder);
        	 } else {
        		 $mapContainer = $('<div class="maploader-placeholder"></div>').after($this);
        	 }
        	 
        	 var size = settings.size;
        	 
        	 if (!size) {
        		 size = {};
        		 var mcHeight = $mapContainer.height();
        		 if (mcHeight > 0) {
        			 size.y = Math.min(640, mcHeight); // 640 is the max dimension Google will provide
        			 size.x = Math.min(640, $mapContainer.width());
        		 }
        	 }
        	 
        	 /* Full map */
        	 if (!settings.staticMap) {
        		 var mapOptions = {
        				 zoom: settings.zoom,
        				 center: new google.maps.LatLng(-34.397, 150.644),
        				 mapTypeId: google.maps.MapTypeId[$data.maptype.toUpperCase()]
        		 };
        		 $data.map = new google.maps.Map($mapContainer.get(0), mapOptions);
        		 $data.marker = null;
        	 } else {
        		 // static map
        		 var $mapImg = $('<img/>');
            	 $mapContainer.html($mapImg);
            	 
            	 $data.mapImg = $mapImg;
            	 
            	 if (settings.zoomField && settings.zoomField.length > 0) {
            		 $(settings.zoomField).bind('textentered.loc', function() {
            			 $this.maploader('loadImage');
            		 });
            	 }
        	 }
        	 
        	 $this.bind('textentered.loc', function() {
        		 $this.maploader('loadImage');
        	 });
        	 
        	 /* Slider (TODO: remove) */
        	 if (settings.zoomSlider) {
        		 $(settings.zoomSlider).slider({
        		    	min:1,
        		    	max:23,
        		    	value:14,
        		    	slide: function( event, ui ){
        		    		if ($data.zoom != ui.value) {
        		    			$data.zoom = ui.value;
        		    			$this.maploader('loadImage');
        		    		}
        		    	}
        		    });
        		 
        		 $data.zoomField = settings.zoomField;
        	 }
        	 
        	 $data.size = size;
        	 
           });
     }
  };

  $.fn.maploader = function( method ) {
    
    if ( methods[method] ) {
      return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
    } else if ( typeof method === 'object' || ! method ) {
      return methods.init.apply( this, arguments );
    } else {
      $.error( 'Method ' +  method + ' does not exist on jQuery.maploader' );
    }    
  
  };

})( jQuery );
