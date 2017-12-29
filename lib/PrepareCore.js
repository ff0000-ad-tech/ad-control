/**
	@class PrepareCore
	@desc
		Boilerplate logic that is attempted for all ad templates happens here. The build of an ad should not need to affect this scope. 
*/
import { Device } from 'ad-external'
import CM from './CssManager'
import ImageManager from './ImageManager'

class PrepareCore {
	constructor() {}
	
	/** 
		@memberOf PrepareCore
		@method init
		@param {Loader} fbaLoader
			Optionally passed in Loader when compiled
		@desc
			This is the first step in the build file. The init() returns a Promise, which allows for chaining of .then() methods.
			For synchronous actions, such as declaring AdData or FtData, simply wrap it in an anonymous function. For asynchronous
			actions, such a inititalizing something with a created callback, this will need to be wrapped in a returned callback.
			This will ensure that the chain will wait for the previous .then() to be fulfilled before moving on. 

		@example
			PrepareCore.init(fbaContent)
				.then(function() {
					global.adData = new AdData();
				})
				.then(function() {
					return new Promise((resolve, reject) => {
						// pass the resolve as the completed callback
						SomeCustomClass.init(resolve)
					})
				})
				.then(PrepareCore.finish)
				.then(Control.prepareBuild)
	*/
	init(fbaLoader) {
		trace('PrepareCore.init()');
		// migration check
		if (typeof global.async == 'undefined') {
			throw new Error( 'Index migration required. To avoid migration, rollback core/js/control/PrepareCore.js' );
		}

		const P = this

		let promises = [
			new Promise((resolve, reject) => {
				// fba payload
				if (fbaLoader) 
					P.prepareFbaPayload(fbaLoader);

				// images
				P.queueRequestedImages();

				// device
				Device.init();

				// css
				const CssManager = new CM()
				CssManager.init();

				resolve()	
			}).catch(reason => {
				trace('promise rejected:', reason)
			})
		]

		// fonts
		promises.push(P.loadFonts())
		
		return Promise.all(promises)
	}

	/** 
		@memberOf PrepareCore
		@method finish
		@desc
			This is the last step before preparing the build. The finish() loads all of the images that have been added
			to the ImageLoader. After this method is called from the .then() promise chain, Control.prepareBuild can be 
			called as the entire prepare process is now complete when its Promise is fulfilled.

		@example
			PrepareCore.init(fbaContent)
				.then(function() {
					global.adData = new AdData();
				})
				.then(PrepareCore.finish)
				.then(Control.prepareBuild)
	*/
	finish() {
		trace('PrepareCore.finish()')
		return new Promise((resolve, reject) => {
			trace('\t PrepareCore load Image Queue')
			ImageManager.load(resolve, global.failAd);
		})
	}

	// prepare fba-payload
	prepareFbaPayload(fbaLoader) {
		trace( 'PrepareCore.prepareFbaPayload()' );
		ImageManager.addFbaImages(fbaLoader);
	}

	// queue index-requested images with ImageManager
	queueRequestedImages() {
		// assets.images
		ImageManager.addLoader(new Loader( 
			assets.images, { 
				name: 'indexImages', 
				prepend: adParams.imagesPath 
		}));
		// assets.edgeImages
		ImageManager.addLoader(new Loader( 
			assets.edgeImages, { 
				name: 'edgeImages', 
				prepend: adParams.edgePath 
		}));
	}

	// preload fonts
	loadFonts() {
		trace( 'PrepareCore.loadFonts()' );
		return new Promise((resolve, reject) => {
			let fontLoader = new Loader({ 
				name: 'fontLoader', 
				onComplete: resolve,
				onFail: global.failAd
			});
			fontLoader.add(new Loader(
				assets.fonts, { 
					name:'fontSubLoader', 
					prepend:adParams.fontsPath, 
					fileType:'ttf' 
			}));
			fontLoader.add(new Loader(
				assets.edgeFonts, { 
					name:'fontEdgeSubLoader', 
					prepend:adParams.fontsPath, 
					fileType:'ttf' 
			}));
			fontLoader.load();
		})
	}
	
}

export default new PrepareCore