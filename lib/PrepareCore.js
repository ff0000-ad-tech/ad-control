/**
	@class PrepareCore
	@desc
		<a href="https://github.com/ff0000-ad-tech/ad-control">Github repo</a>
		<br><br>
		
		Boilerplate logic that is attempted for all ad templates happens here. The build of an ad should not need to affect this scope. 
*/
import { Device } from 'ad-external'
import CssManager from './CssManager'
import ImageManager from './ImageManager'

class PrepareCore {
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
	static init = function(fbaContent) {
		console.log('PrepareCore.init()')
		const P = this

		return new Promise((resolve, reject) => {
			// device
			Device.init()

			// css
			CssManager.init()

			// fba payload
			if (fbaContent) {
				P.prepareFbaPayload(fbaContent)
			}

			// images
			P.queueRequestedImages()

			// fonts
			P.loadFonts()
				.then(() => {
					resolve()
				})
				.catch(err => {
					reject(err)
				})
		})
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
	static finish = function() {
		console.log('PrepareCore.finish()')
		return new Promise((resolve, reject) => {
			console.log('\t PrepareCore load Image Queue')
			ImageManager.load(resolve, global.failAd)
		})
	}

	// prepare fba-payload
	static prepareFbaPayload = function(fbaContent) {
		console.log('PrepareCore.prepareFbaPayload()')
		ImageManager.addFbaImages(fbaContent)
	}

	// queue index-requested images with ImageManager
	static queueRequestedImages = function() {
		// assets.images
		ImageManager.addLoader(
			new Loader(assets.images, {
				name: 'indexImages',
				prepend: adParams.imagesPath
			})
		)
	}

	// preload fonts
	static loadFonts = function() {
		console.log('PrepareCore.loadFonts()')
		return new Promise((resolve, reject) => {
			let fontLoader = new Loader({
				name: 'fontLoader',
				onComplete: resolve,
				onFail: global.failAd
			})
			fontLoader.add(
				new Loader(assets.fonts, {
					name: 'fontSubLoader',
					prepend: adParams.fontsPath,
					fileType: 'ttf'
				})
			)
			fontLoader.load()
		})
	}
}

export default PrepareCore
