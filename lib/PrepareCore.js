/**
	@class PrepareCore
	@desc
		Boilerplate logic that is attempted for all ad templates happens here. The build of an ad should not need to affect this scope. 
*/
import { Device as D } from 'ad-external'
import CM from './CssManager'
import ImageManager from './ImageManager'

var PrepareCore = new function() {
	self = this;
	
	const Device = new D();
	const CssManager = new CM();

	var assetLoader = undefined;
	var jsonPending = false;

	var async;



	// init
	self.init = function( completeCallback, fbaLoader ) {
		trace( 'PrepareCore.init()' );
		// migration check
		if( typeof global.async == 'undefined' ) {
			throw new Error( 'Index migration required. To avoid migration, rollback core/js/control/PrepareCore.js' );
		}

		// async for threading any number of loads
		async = new Async();
		async.onComplete( completeCallback );
		async.wait();

		// fba payload
		if( fbaLoader )
			prepareFbaPayload( fbaLoader );

		// views
		prepareViews();

		// images
		queueRequestedImages();	

		// fonts
		loadFonts();

		// device
		Device.init();
		Device.trace();

		// css
		CssManager.init();

		async.done();
	}


	// prepare fba-payload
	function prepareFbaPayload( fbaLoader ) {
		trace( 'PrepareCore.prepareFbaPayload()' );
		ImageManager.addFbaImages( fbaLoader );
	}



	// views
	function prepareViews() {
		trace( 'PrepareCore.prepareViews()' );
		if( typeof views !== 'undefined' ) {
			var viewRequests = views.call();
			if( viewRequests.length ) {
				async.wait();
				
				global.Views = {};
				global.ViewStyles = {};

				new ViewLoader( viewRequests, {
					name: 'viewLoader',
					onComplete: function() {
						async.done();
					}
				}).load();
			}
		}
	}




	// queue index-requested images with ImageManager
	function queueRequestedImages() {
		// assets.images
		ImageManager.addLoader( new Loader( 
			assets.images, { 
				name: 'indexImages', 
				prepend: adParams.imagesPath 
		}));
		// assets.edgeImages
		ImageManager.addLoader( new Loader( 
			assets.edgeImages, { 
				name: 'edgeImages', 
				prepend: adParams.edgePath 
		}));
	}



	// preload fonts
	function loadFonts() {
		trace( 'PrepareCore.loadFonts()' );

		async.wait();
		var fontLoader = new Loader({ 
			name: 'fontLoader', 
			onComplete: loadFontsComplete,
			onFail: global.failAd, 
			scope: self
		});
		fontLoader.add( new Loader( assets.fonts, { name: 'fontSubLoader', prepend: adParams.fontsPath, fileType: 'ttf' }));
		fontLoader.add( new Loader( assets.edgeFonts, { name: 'fontEdgeSubLoader', prepend: adParams.fontsPath, fileType: 'ttf' }));
		fontLoader.load();
	}
	function loadFontsComplete() {
		async.done();
	}


}

export default PrepareCore