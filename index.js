import PrepareCore from './lib/PrepareCore.js'
import PrepareCommon from './lib/PrepareCommon.js'
import Async from './lib/Async.js'
import CssManager from './lib/CssManager.js'
import ImageManager from './lib/ImageManager.js'
import Expandable from './lib/Expandable.js'
import ExpandableDcs from './lib/ExpandableDcs.js'

// expose the lib packages as modules
// TODO: Is there a better way to do this ????

// expose this prepare hook to the payloader in the index script
// TODO: is there also a better way of doing this?
window.prepareCoreCommonAndBuild = function(fbaContent) {
	function prepareCore() {
		trace('\n\n\n -- Payloader.prepareCore() --')
		PrepareCore.init(prepareCommon, fbaContent)
	}
	function prepareCommon() {
		trace('\n\n\n -- Payloader.prepareCommon() --')
		PrepareCommon.init(prepareBuild)
	}	
	function prepareBuild() {
		trace('\n\n\n -- Payloader.prepareBuild() --')
		Control.prepareBuild()
	}
	prepareCore();
}

export {
	PrepareCore,
	PrepareCommon,
	Async,
	CssManager,
	ImageManager,
	Expandable,
	ExpandableDcs,
}