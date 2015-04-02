/********************************
 *	textentered.js
 *	version 1.0.4
 *
 *	Copyright 2011 by Chris Berry
 *	@cb_rry
 *
 *	Licensed under the MIT license:
 *	http://www.opensource.org/licenses/mit-license.php
 */


(function( $ ){

	var globalSettings = {
		live: true, // set to false if you do not want the method attached lazily to input and textarea fields
		eventNamespace: 'textentered' // under the hood, we bind to a handful of events using this namespace
	};

	var defaults = {
		idleDelay: 490, // how long to wait before firing the event
		pasteDelay: 10, // because paste events in Firefox do not register the pasted value immediately, we have to delay it a tiny bit.
		eventsToTrap: 'input propertychange keyup paste blur change', // events that cause the event to fire
		minLengthToTrigger: 0, // if the length of the entered text is less than this, do not fire the event. Set to 0 to always fire.
		trimValue: true // trim the value for comparison - will prevent firing if user types the space key, but does not actually change the value of the field
	};

	var methods = {
		detectIdle : function(eventVersion) {
			var $this = $(this);
			var $data = $this.data('textentered');
			if ($data && $data.eventVersion == eventVersion) {
				$data.lastValue = $data.trimValue ? $.trim($this.val()) : $this.val();
				if ($data.lastValue.length >= $data.minLengthToTrigger) {
					$this.trigger('textentered');
				}
			}

		},

		fieldValueChange : function(eventVersion) {
			var $this = $(this);
			var $data = $this.data('textentered');
			var fieldValue = $data.trimValue ? $.trim($this.val()) : $this.val();
			if (fieldValue != $data.lastValue) {
				setTimeout(
					function() {
						$this.textentered('detectIdle', eventVersion);
					},
					$data.idleDelay);
			}
		},

		init : function( options ) {
			var settings = $.extend({}, defaults, options);
			/* Update events to trap with namespace */
			var eventArray = settings.eventsToTrap.split(' ');
			var nsEvents = '';
			for (var x = 0; x < eventArray.length; x++) {
				nsEvents += eventArray[x] + '.' + globalSettings.eventNamespace + ' ';
			}
			nsEvents = nsEvents.substring(0, nsEvents.length - 1); // trim that extra space from the end
			settings.eventsToTrap = nsEvents;

			return this.each(function() {
				var $this = $(this);
				var $data = {};

				$data.lastValue = $this.val();
				$data.eventVersion = 0;
				$data.idleDelay = settings.idleDelay;
				$data.pasteDelay = settings.pasteDelay;
				$data.trimValue = settings.trimValue;
				$data.minLengthToTrigger = settings.minLengthToTrigger;
				$this.data('textentered', $data);
				if (!globalSettings.live) {
					$this.unbind('textentered');
					$this.bind(settings.eventsToTrap, function() {
						$data.eventVersion++;
						setTimeout(function() {$this.textentered('fieldValueChange', $this.data('textentered').eventVersion);}, $data.pasteDelay);
					});
				}
			});
		}
	};

	$.fn.textentered = function( method ) {
		if (!globalSettings.eventNamespace || globalSettings.eventNamespace.length === 0) {
			$.error( 'globalSettings.eventNamespace cannot be blank on jQuery.textentered' );
		}

		if ( methods[method] ) {
			return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
		} else if ( typeof method === 'object' || ! method ) {
			return methods.init.apply( this, arguments );
		} else {
			$.error( 'Method ' + method + ' does not exist on jQuery.textentered' );
		}
	};

	$(document).ready( function() {
		if (globalSettings.live) {
			$('body').bind(defaults.eventsToTrap, function(eventObject) {
				var $this = $(eventObject.target);
				if (!$this.data('textentered')) {
					$this.textentered();
				}
				$this.data('textentered').eventVersion++;
				$this.textentered('fieldValueChange', $this.data('textentered').eventVersion);
			});
		}
	});

})( jQuery );
