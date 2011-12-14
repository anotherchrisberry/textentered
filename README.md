textentered.js
--------------

This plugin is simple. It allows your jquery code to listen for a new event: textentered. This event fires whenever a user pauses in typing.

Simple Usage
============

The API is fairly simple. To use the plugin out of the box, include the script on your page, then listen for a `textentered` event:

    <script type="text/javascript" src="jquery.textentered.js"></script>  
    <script type="text/javascript">  
        $('#filterField').bind('textentered', function() { ...//do stuff });  
    </script>

To override the default behavior, pass in a set of parameters:

    $('#filterField').textentered({
       trimValue: false, // ignore whitespace when deciding when event is triggered? Default: true  
       idleDelay: 200, // how long to wait between keystrokes before firing; default: 490  
       minLengthToTrigger: 5 // how many characters need to be there before firing; default: 0  
    }).bind('textentered', function() { filterResults(); });

Advanced Usage
==============

The API provides a few customizations:

    idleDelay: 490, // how long to wait before firing the event  
    pasteDelay: 10, // because paste events in Firefox do not register the pasted value immediately, we have to delay it a tiny bit.  
    eventsToTrap: 'keyup paste blur change', // events that cause the event to fire  
    minLengthToTrigger: 0, // if the length of the entered text is less than this, do not fire the event. Set to 0 to always fire.  
    trimValue: true // trim the value for comparison - will prevent firing if user types the space key, but does not actually change the value of the field