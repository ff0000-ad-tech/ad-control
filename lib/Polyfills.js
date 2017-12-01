/* ----------------------------------------------------------------------------------------------------------------------------------------------------------
	!!! DEPRECATED VERSION !!!
	Polyfills need to be available inline, before any of the JS-dependencies are loaded.
	Therefore, they have been moved to ad-html/build_sources/, and are written into the 
	"body_js_polyfills" hook at the bottom of the index.

	This change was done on 10/28/16.

	This file needs to be kept here until index-migrations have become a necessity. Once removed,
	the code in Ad App's js_compiler can also be simplified.
	---------------------------------------------------------------------------------------------------------------------------------------------------------- */
Polyfills = new function() {
	trace ( 'Polyfills:' )

	/* Method: CustomEvent() */
	try {
		new CustomEvent('test');
	} catch(e) {
		trace( ' -> CustomEvent')
		function CustomEvent2 ( event, params ) {
			params = params || { bubbles: false, cancelable: false, detail: undefined };
			var evt = document.createEvent( 'CustomEvent' );
			evt.initCustomEvent( event, params.bubbles, params.cancelable, params.detail );
			return evt;
		}
		CustomEvent2.prototype = window.Event.prototype;
		window.CustomEvent = CustomEvent2;
	}	
	
}
