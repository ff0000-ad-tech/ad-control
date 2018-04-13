/**
	@npmpackage
	@class Core
	@desc
		Import from <a href="https://github.com/ff0000-ad-tech/ad-control">ad-control</a>
		<br>
		<codeblock>
			// importing into an ES6 class
			import { Core } from 'ad-control'
		</codeblock>
		<br><br>
		
		Boilerplate logic that is attempted for all ad templates happens here. The build of an ad should not need to affect this scope. 
*/
import { Device } from 'ad-external'
import CssManager from './CssManager'
import * as ImageManager from './ImageManager'

/** 
	@memberOf Core
	@method init
	@param {Loader} fbaLoader
		Optionally passed in Loader when compiled
	@desc
		This is the first step in the build file. The init() returns a Promise, which allows for chaining of .then() methods.
		For synchronous actions, such as declaring AdData or FtData, simply wrap it in an anonymous function. For asynchronous
		actions, such a inititalizing something with a created callback, this will need to be wrapped in a returned callback.
		This will ensure that the chain will wait for the previous .then() to be fulfilled before moving on. 

	@example
		Core.init(fbaContent)
			.then(function() {
				global.adData = new AdData();
			})
			.then(function() {
				return new Promise((resolve, reject) => {
					// pass the resolve as the completed callback
					SomeCustomClass.init(resolve)
				})
			})
			.then(Core.loadDynamic)
			.then(Control.prepareBuild)
*/
export function init(fbaContent) {
	console.log('Core.init()')
	return new Promise((resolve, reject) => {
		let promises = []

		// device
		Device.init()

		// css
		CssManager.init()

		// fba payload
		ImageManager.addFbaImages(fbaContent)

		// async
		Promise.all(promises)
			.then(() => {
				resolve()
			})
			.catch(err => {
				reject(err)
			})
	})
}

/** 
	@memberOf Core
	@method loadDynamic
	@desc
		This is the last step before preparing the build. The loadDynamic() loads all of the images that have been added
		to the ImageLoader. After this method is called from the .then() promise chain, Control.prepareBuild can be 
		called as the entire prepare process is now complete when its Promise is fulfilled.

	@example
		Core.init(fbaContent)
			.then(function() {
				global.adData = new AdData();
			})
			.then(Core.loadDynamic)
			.then(Control.prepareBuild)
*/
export function loadDynamic() {
	console.log('Core.loadDynamic()')
	return new Promise((resolve, reject) => {
		console.log('\t Core load Image Queue')
		ImageManager.load(resolve, global.failAd)
	})
}
