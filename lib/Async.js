/** 
	@class Async
	@desc
		<a href="https://github.com/ff0000-ad-tech/ad-control">Github repo</a>
		<br><br>
		
		This is a utility to allow easy sequencing of multiple async functions. Increment tokens 
		by calling <code>wait()</code>, decrement by calling <code>done()</code>. Every time <code>done()</code> is called,
		it checks if there are any remaining tokens...if not, the callback is fired.
*/
var Async = function Async() {

	var A = this;
	A.tokens = [];
	A.callback;

	/**
		@memberOf Async
		@method wait
		@desc
			Adds a token to the Async queue. 
	*/
	A.wait = function() {
		A.tokens.push( 1 );
	}

	/**
		@memberOf Async
		@method done
		@desc
			Removes a token from the Async queue. 
	*/
	A.done = function() {
		A.tokens.pop();
		if( A.tokens.length == 0 )
			A.callback.call();
	}

	/**
		@memberOf Async
		@method onComplete
		@param {function} callback
		@desc
			Specifies a callback function, starts a setInterval if one is not currently running, and checks
			to run the callback. 
	*/	
	A.onComplete = function( callback ) {
		A.callback = callback;
	}


}

// @gc
export default Async
