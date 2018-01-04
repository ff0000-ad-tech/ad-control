/**
	@class ImageManager
	@desc
		This module is used to add/load/manage all Images.
		
*/
import Loader, { LoaderUtils } from 'ad-load'

class ImageManager {
	constructor() {
		var I = this
		I._pendingImages = []
		I._pendingCanvasImages = []
		I._pendingLoaders = []
		I._nextLoadCallback = []
		I._imageManagerLoader
		I._dict = {}
		I._isLoading = false
		I._loaderCount = 0
		I._onComplete = function() {}
		I._onFail
	}

	/* ------------------------------------------------------------------------------------------------------------- */
	// PUBLIC METHODS

	/**
		@memberOf ImageManager
		@method addToLoad
		@param {string} file
			A filename or path
		@param {object} arg
			Optional. Determines if the image should be loaded with a crossOrigin:'anonymous' for images used in a canvas. An object with one boolean key: forCanvas 
		@desc
			Add an image file-path to be loaded.

		@example
			// Add an image from the "images/" folder
			ImageManager.addToLoad( adParams.imagesPath + 'sample.png' );

			// Add an image full path, and get the result key back
			var sampleImageId = ImageManager.addToLoad( 'http://some/full/file/path/sample.png' );

			// Add an image for use with CanvasDrawer, and get the result key back
			// NOTE: The object must be there or images will error when used in Canvas
			var sampleImageId = ImageManager.addToLoad( 'http://some/full/file/path/sample.png', { forCanvas:true });

		@returns
			An "imageId" which can be used to get an image by its id, see: {@link ImageManager.get}
	*/
	addToLoad(file, arg) {
		const I = this
		var id = LoaderUtils.getFileName(file)

		if (!I.available(id, true)) {
			var forCanvas = arg && arg.forCanvas == true
			//console.log( 'ImageManager.addToLoad(', id, ') forCanvas:', forCanvas )
			forCanvas ? I._pendingCanvasImages.push(file) : I._pendingImages.push(file)
		}

		return id
	}

	/**
		@memberOf ImageManager
		@method addLoader
		@param {Loader} loader
			A {@link Loader}.
		@desc
			Add a Loader to loaded along with any other queued image requests.

		@example
			ImageManager.addLoader( new Loader( 
				assets.images, { 
					name: 'imageLocalLoader', 
					prepend: adParams.imagesPath 
			}));
	*/
	addLoader(loader) {
		this._pendingLoaders.push(loader)
	}

	/**
		@memberOf ImageManager
		@method get
		@param {string} imageId
			A String id of an Image
		@desc
			Returns the <<b></b>img> that was created when the requested image was loaded in.

		@example
			ImageManager.get( 'sample' );
	*/
	get(imageId) {
		const I = this
		if (I._dict[imageId]) return I._dict[imageId]
		else throw new Error("ImageManager : No image named '" + imageId + "' has been loaded")
	}

	/**
		@memberOf ImageManager
		@method available
		@param {string} imageId
			A String id of an Image
		@desc
			Returns a boolean stating if an image by the given imageID has been loaded

		@example
			ImageManager.available( 'sample' );
	*/
	available(imageId, internal) {
		var exists = this._dict[imageId] != undefined

		// if the image we are trying to load already exists
		if (exists) {
			// if this is an internal use - as in, called from I.addToLoad() or addToDictionary()
			if (internal)
				console.log(
					'ImageManager.available() -->',
					true,
					': Duplicate Image Id "' + imageId + '". One or more images loading in have the same name. Each Image needs a unique file name.'
				)
		} else {
			// if the image doesn't already exist, we only want to know that if it is not from an internal ImageManager method
			// for example: checking to see if an image exists from build.js
			if (!internal) console.log('ImageManager.available() -->', false, ": No image named '" + imageId + "' has been loaded")
		}

		return exists
	}

	/**
		@memberOf ImageManager
		@method load
		@param {function} callback
			Callback to execute when all images are loaded.
		@param {function} onFail
			Optional onFail callback - if not specified a failed load will cause the ad to failover.

		@desc
			Executes load queue, which, on success, will yield all of the requested images available with {@link ImageManager.get}
	*/

	load(callback, onFail) {
		const I = this
		I._onFail = onFail || global.failAd

		if (I._isLoading) {
			// set up a wait for the first one to finish
			I._nextLoadCallback.push(callback)
		} else {
			I._imageManagerLoader = new Loader({
				name: 'imageManagerLoader',
				onComplete: function(event) {
					I._isLoading = false
					I._addToDictionary(event.getAllContentRaw())
				},
				onFail: function(event) {
					I._isLoading = false
					I._onFail.call()
				},
				scope: I
			})

			I._onComplete = [].concat(callback)
			I._nextLoadCallback = []

			// extract out the images getting loaded, leaving I._pendingImages able to take more while loading
			var currentPendingImages = I._pendingImages.slice()
			I._pendingImages = []
			I._imageManagerLoader.add(
				new Loader(currentPendingImages, {
					name: 'dynamicImages-' + I._loaderCount++,
					fileType: 'jpg'
				})
			)

			var currentPendingCanvasImages = I._pendingCanvasImages.slice()
			I._pendingCanvasImages = []
			I._imageManagerLoader.add(
				new Loader(currentPendingCanvasImages, {
					name: 'dynamicCanvasImages-' + I._loaderCount++,
					fileType: 'jpg',
					crossOrigin: 'anonymous'
				})
			)

			var currentPendingLoaders = I._pendingLoaders.slice()
			I._pendingLoaders = []
			for (var i = 0; i < currentPendingLoaders.length; i++) {
				I._imageManagerLoader.add(currentPendingLoaders[i])
			}

			I._isLoading = true
			I._imageManagerLoader.load()
		}
	}

	addFbaImages(target) {
		if (target) this._addToDictionary(target.getAllContentRaw())
	}

	/* ------------------------------------------------------------------------------------------------------------- */
	// PRIVATE METHODS
	_addToDictionary(content) {
		const I = this
		for (var i = 0; i < content.length; i++) {
			if (content[i] instanceof Image || content[i] instanceof SVGElement) {
				var img = content[i]
				if (!I.available(content[i].id, true)) I._dict[img.id] = img
			}
		}

		console.log('ImageManager:', I._dict)

		for (var i = 0; i < I._onComplete.length; i++) {
			I._onComplete[i].call()
		}

		if (I._nextLoadCallback.length > 0) {
			I.load(I._nextLoadCallback)
		}
	}
}

export default new ImageManager()
