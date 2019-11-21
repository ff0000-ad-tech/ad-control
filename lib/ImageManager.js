/**
 * @class ImageManager
 * @desc
 * This module is used to add/load/manage all Images.
 * <codeblock>
 * import { ImageManager } from 'ad-control'
 * </codeblock>
 */
import { ImageLoader, LoaderUtils } from 'ad-load'

let _pendingImages = []
let _pendingCanvasImages = []
let _pendingLoaders = []
let _nextLoadCallback = []
let _imageManagerLoader
let _dict = {}
let _isLoading = false
let _loaderCount = 0
let _onComplete = function() {}
let _onFail = function() {}

/* ------------------------------------------------------------------------------------------------------------- */
// PUBLIC METHODS

/**
 * @memberOf ImageManager
 * @method addToLoad
 * @param {string} file
 * 	A filename or path
 * @param {object} arg
 * 	Optional. Determines if the image should be loaded with a crossOrigin:'anonymous' for images used in a canvas. An object with one boolean key: forCanvas
 * @desc
 * 	Add an image file-path to be loaded.
 * @example
 * // Add an image from the "images/" folder
 * ImageManager.addToLoad(adParams.imagesPath + 'sample.png')
 *
 * // Add an image full path, and get the result key back
 * var sampleImageId = ImageManager.addToLoad('http://some/full/file/path/sample.png')
 *
 * // Add an image for use with CanvasDrawer, and get the result key back
 * // NOTE: The object must be there or images will error when used in Canvas
 * var sampleImageId = ImageManager.addToLoad('http://some/full/file/path/sample.png', { forCanvas:true })
 *
 * @returns {string}
 * 	An "imageId" which can be used to get an image by its id, see: {@link ImageManager.get}
 */
export function addToLoad(file, arg) {
	var id = LoaderUtils.getFileName(file)

	if (!available(id, true)) {
		var forCanvas = arg && arg.forCanvas == true
		//console.log( 'ImageManager.addToLoad(', id, ') forCanvas:', forCanvas )
		forCanvas ? _pendingCanvasImages.push(file) : _pendingImages.push(file)
	}

	return id
}

/**
 * @memberOf ImageManager
 * @method addLoader
 * @param {Loader} loader
 * 	A {@link Loader}.
 * @desc
 * 	Add a Loader to loaded along with any other queued image requests.
 * @example
 * ImageManager.addLoader(
 * 	new Loader(
 * 		assets.images, {
 * 			name: 'imageLocalLoader',
 * 			prepend: adParams.imagesPath
 * 		}
 * 	)
 * )
 */
export function addLoader(loader) {
	_pendingLoaders.push(loader)
}

/**
 * @memberOf ImageManager
 * @method get
 * @param {string} imageId
 * 	A String id of an Image
 * @returns {Image}
 * 	Returns the <<b></b>img> that was created when the requested image was loaded in.
 * @example
 * 	ImageManager.get('sample')
 */
export function get(imageId) {
	if (_dict[imageId]) return _dict[imageId]
	else throw new Error("ImageManager : No image named '" + imageId + "' has been loaded")
}

/**
 * @memberOf ImageManager
 * @method available
 * @param {string} imageId
 * 	A String id of an Image
 * @returns {boolean}
 * 	If an image by the given imageID has been loaded
 * @example
 * 	ImageManager.available('sample')
 */
export function available(imageId, internal) {
	var exists = _dict[imageId] != undefined

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
 * @memberOf ImageManager
 * @method load
 * @param {function} callback
 * 	Callback to execute when all images are loaded.
 * @param {function} onFail
 * 	Optional onFail callback - if not specified a failed load will cause the ad to failover.
 * @desc
 * 	Executes load queue, which, on success, will yield all of the requested images available with {@link ImageManager.get}
 */

export function load(callback, onFail) {
	_onFail = onFail || global.failAd

	if (_isLoading) {
		// set up a wait for the first one to finish
		_nextLoadCallback.push(callback)
	} else {
		_onComplete = [].concat(callback)
		_nextLoadCallback = []
		const currentPendingImages = _pendingImages.slice()
		_pendingImages = []

		const imgLoads = currentPendingImages.map(img => {
			return new Promise((resolve, reject) => {
				new ImageLoader(img, {
					onComplete: event => resolve(event.dataRaw),
					onFail: reject
				})
			})
		})

		const currentPendingCanvasImages = _pendingCanvasImages.slice()
		_pendingCanvasImages = []

		const canvasImgLoads = currentPendingCanvasImages.map(canvasImg => {
			return new Promise((resolve, reject) => {
				new ImageLoader(canvasImg, {
					onComplete: event => resolve(event.dataRaw),
					onFail: reject,
					crossOrigin: 'anonymous'
				})
			})
		})

		const addedLoaderPromises = _pendingLoaders.map(loader => {
			return new Promise((resolve, reject) => {
				loader.onComplete = function(event) {
					loader.onComplete && loader.onComplete(event)
					resolve(event.dataRaw)
				}
				loader.onFail = function(event) {
					loader.onFail && loader.onFail(event)
					reject(event)
				}
			})
		})

		_isLoading = true
		Promise.all(imgLoads.concat(canvasImgLoads).concat(addedLoaderPromises))
			.then(imgDataArr => {
				_isLoading = false
				addToDictionary(imgDataArr)
			})
			.catch(() => {
				_isLoading = false
				_onFail.call()
			})
	}
}

export function addFbaImages(target) {
	if (target) addToDictionary(target.getAllContentRaw())
}

/**
 * @memberOf ImageManager
 * @method addToDictionary
 * @desc
 * 	Allows images to be added to the ImageManager's dictionary from external classes. <b>This is not part of the load process, and can only add <i>loaded</i> image content.</b>
 */
export function addToDictionary(content) {
	for (var i = 0; i < content.length; i++) {
		if (content[i] instanceof Image || content[i] instanceof SVGElement) {
			var img = content[i]
			if (!available(content[i].id, true)) _dict[img.id] = img
		}
	}

	console.log('ImageManager:', _dict)

	for (var i = 0; i < _onComplete.length; i++) {
		_onComplete[i].call()
	}

	if (_nextLoadCallback.length > 0) {
		load(_nextLoadCallback)
	}
}
