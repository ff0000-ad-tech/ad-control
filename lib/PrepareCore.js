/**
	@class PrepareCore
	@desc
		Boilerplate logic that is attempted for all ad templates happens here. The build of an ad should not need to affect this scope. 
*/
import { Device as D } from 'ad-external'
import CM from './CssManager'
import ImageManager from './ImageManager'

class PrepareCore {
	constructor() {}
	
	// init
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
				const Device = new D()
				Device.init();
				Device.trace();

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

	finish(thing) {
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