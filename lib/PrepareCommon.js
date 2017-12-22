/**
	@class PrepareCommon
	@desc
		This is the central launch point for all ad-sizes in this creative. Resources that are shared among
		all the sizes should be prepared here.
		<br><br>

		There are two phases to {@link PrepareCommon}:

		<b>Phase 1:</b><br>
		This is where boilerplate-components specific to these sizes, like {@link AdManager}, {@link DateUtils}, 
		{@link Analytics}, Monet, Flashtalking, GDC, etc, etc can be prepared, asyncronously before {@link AdData} 
		is instantiated.
		<br><br>

		USER-DEFINED code can be added here if it is synchronous. Async operations need 
		to be threaded with {@link Async}, to insure that everything completes before the callback
		is fired.
		<br><br>

		<b>Phase 2:</b><br>
		See {@PrepareCommon.initComplete} for more information.
		<br><br>

		<b>Note:</b><br>
		Your PrepareCommon may have many methods that are not documented here. These are optional 
		modules that were added procedurally during the Build Source creation. You would need to use Ad App's 
		Diff Tool in order to see what code would be added here for a given Build-source Option.
*/
import AdData from 'AdData'
import Async from './Async'
import ImageManager from './ImageManager'

var PrepareCommon = new function() {
	var id = 'PrepareCommon';
	var self = this;
	
	var async;
	self.completeCallback


	/**
		@memberof PrepareCommon
		@method init
		@param {function} completeCallback
			The callback to be fired after both phases of async preparation are complete.
		@desc
			Generally, this function is reserved for the addition of boilerplate modules. If you need 
			to add USER-DEFINED code here, make sure to thread it with {@Async} if it is not synchronous.
			<br><br>

			More likely, you will want to use or do something with the modules that get prepared here. The 
			point where it is safe to do that is {@link PrepareCommon.initComplete}.
	*/	
	self.init = function( completeCallback ) {
		trace( id + '.init()' );

		self.completeCallback = completeCallback;

		// async for threading any number of async processes
		async = new Async();
		async.onComplete( self.initComplete );
		async.wait();

		/*-- Red.Component.preparecommon_init.start --*/ 
		/*-- Red.Component.preparecommon_init.end --*/

		async.done();
	}

	/*-- Red.Component.preparecommon_misc_functions.start --*/
	/*-- Red.Component.preparecommon_misc_functions.end --*/





	/**
		@memberof PrepareCommon
		@method initComplete
		@desc
			The opening init() async-routines are complete. This begins the second phase of preparation.

			Now, we prepare {@link AdData}, any USER-DEFINED code, and load all the images.
			Once all of these processes are complete, {@link PrepareCommon.completeCallback} will fire.

			Any processes that are async should be threaded with {@Async}.
	*/
	self.initComplete = function() {
		trace( id + '.initComplete()' );
		async = new Async();
		async.onComplete( self.completeCallback );
		async.wait();

		self.prepareAdData();
		self.loadImageQueue();

		async.done();
	}


	/**
		@memberof PrepareCommon
		@method prepareAdData
		@desc
			Custom, hand-coded code, needed for all ad-sizes should go here. 
	*/
	self.prepareAdData = function() {
		trace( id + '.prepareAdData()' );
		/*-- Red.Component.prepare_ad_data.start --*/
		/*-- Red.Component.prepare_ad_data.end --*/

		global.adData = new AdData();

		/* ---- USER-DEFINED PrepareCommon -------------------------------------------------------
		 *
		 *		This is BEFORE the image-queue is loaded...
		 */
		 // -->
	} 




	/**
		@memberof PrepareCommon
		@method loadImageQueue
		@desc
			This executes the {@link ImageManager} load queue. The load queue at this point includes all images 
			from global.assets, and any dynamic images added here previously or in {@link AdData}. */
	self.loadImageQueue = function() {
		trace( id + '.loadImageQueue()' );
		async.wait();
		ImageManager.load( 
			self.loadImageQueueComplete,
			self.loadImageQueueFail
		);
	}
	self.loadImageQueueFail = function() {
		/*-- Red.Component.load_image_queue_fail.start --*/
		global.failAd();

		/*-- Red.Component.load_image_queue_fail.end --*/
	}



	/**
		@memberof PrepareCommon
		@method loadImageQueueComplete
		@desc
			When this method is called, your ad's data and assets are ready. Use this 
			function to prepare any elements or logic that will be shared across all
			of your ad sizes. 
	*/
	self.loadImageQueueComplete = function() {
		trace( id + '.loadImageQueueComplete()');
		/*-- Red.Component.load_image_queue_complete.start --*/
		/*-- Red.Component.load_image_queue_complete.end --*/

		/* ---- USER-DEFINED PrepareCommon -------------------------------------------------------
		 *
		 *		This is AFTER the image-queue is loaded...
		 */
		 // -->


		// launches the build, assuming there are no other async events
		async.done();	
	}

}

export default PrepareCommon