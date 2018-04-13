/**
	@npmpackage
	@class CssManager
	@desc
		Import from <a href="https://github.com/ff0000-ad-tech/ad-control">ad-control</a>
		<br>
		<codeblock>
			// importing into an ES6 class
			import { CssManager } from 'ad-control'
		</codeblock>
		<br><br>
		
		This is a css-interface class, which is intended to proxy all css applications. The goal is to accept css in any format( see below ), 
		standardize the keys, conform the values, and rapidly apply the style to the target, specific to the {@link Device} running the ad.<br><br> 

		Generally, you should not need to use this class directly. {@link Styles.setCss} will handle it for you.<br><br>

		However, if your css is not being correctly managed, the first step in debugging is to use {@link CssManager.setDebugFilter}. Pass the id, 
		as a string, of the misbehaving element to see the exact format of the css being applied to it. You can then locate the problem style, try 
		applying it in the browser inspector. Using this approach you should be able to determine what the correction/exception needs to be.<br><br>

		Additional debugging output can be switched on using {@link CssManager.setDebugLevel}. Pass a level( 0 is off, 1 is less, 2 is more ). There will be 
		a lot of output, but it is organized and consistent. You should be able to see exactly what is happening to your declarations. <br><br>

		<b>Types:</b><br>
		<table>
			<tr><td>CssObject</td>	<td>the literal "css" object that is passed to {@link Markup} as containerData.css on the creation of the element</td></tr>
			<tr><td>CssStyleString</td>	<td>a literal string of any number of css styles, passed to {@link Markup} as containerData.styles on the creation of the element</td></tr>
			<tr><td>CssDeclaration</td>	<td>either an object like "{ position: 'absolute' }" or a string like "background-color: #ff0000;"</td></tr>

			<tr><td>CssKey</td>	<td>ex: in "position: absolute;" the css-key would be "position"</td></tr>
			<tr><td>CssValue</td>	<td>ex: in "position: absolute;" the css-value would be "absolute"</td></tr>
			<tr><td>CssList</td>	<td>a standardized list of objects with Device-specific keys and corresponding values</td></tr>
		</table>
		<br>

		<b>Formats:</b><br>
		<table>
			<tr><td>Hyphen</td>	<td>ex: 'border-left', '-webkit-clip-path', '-moz-filter'</td></tr>
			<tr><td>Camel</td>	<td>ex: 'borderLeft', 'webkitClipPath', 'moxFilter'</td></tr>
			<tr><td>Alt</td>	<td>this is to handle arbitrary exceptions, like the "bgImage" key on container-data css objects</td></tr>
		</table>
		<br>

		<b>Key Prefixes:</b><br>
		<table>
			<tr><td>Browser</td>	<td>ex: "-webkit-clip-path" or "webkitClipPath"</td></tr>
			<tr><td>Standard</td>	<td>ex: "clip-path" or "clipPath"</td></tr>
		</table>
*/
import { Device } from 'ad-external'
import { Matrix2D } from 'ad-geom'

class CssManager {

	static debug_level1 = false
	static debug_level2 = false
	static filter = undefined
	static debug_element = undefined
	static debug_css_list = undefined

	/**
		@memberOf CssManager
		@method init
		@desc
			Called one time per life-cycle. Creates the browser key-dictionary. 
	*/
	static init = function() {
		console.log('CssManager.init()')
		this.generateBrowserKeyDictionary()
	}

	/* -- DEBUGGING -------------------------------------------------
	 *
	 *
	 */

	/**
		@memberOf CssManager
		@method setDebugLevel
		@param {number} level
			controls debug verbosity for all css processing, default is 0, max is 2
		@desc
			Use this to control the degree of logging that happens in this class. Debugging is off by default, or pass 0 or null to disable. 
	*/
	static setDebugLevel = function(level) {
		const C = this
		switch (parseInt(level)) {
			case 1:
				C.debug_level1 = true
				C.debug_level2 = false
				break
			case 2:
				C.debug_level1 = true
				C.debug_level2 = true
				break
			default:
				C.debug_level1 = false
				C.debug_level2 = false
				break
		}
	}

	/**
		@memberOf CssManager
		@method setDebugFilter
		@param {string} filter
			the filter string: An element.id, a css-key, or a css-value. For example, if you want to only see css being applied 
			to particular element, pass its id to this function. Conversely, if you only want to see css with a particular 
			key or value, pass that string.
		@desc
			Use this control to filter which <CssMananger>.apply() calls get output to the console. 
	*/
	static setDebugFilter = function(filter) {
		const C = this
		console.log('CssManager.setDebugFilter(),', filter)
		C.filter = filter
		C.debug_level1 = true
	}
	static ifDebug = function(debugLevel) {
		const C = this
		if (!C.filter) return C[debugLevel]
		else if (C.passDebugFilter() && C[debugLevel]) return true
	}
	static passDebugFilter = function() {
		const C = this
		if (C.debug_element) if (C.debug_element.id.indexOf(C.filter) > -1) return true
		if (C.debug_css_list)
			for (var i in C.debug_css_list) {
				if (i.indexOf(C.filter) > -1) return true
				else if (String(C.debug_css_list[i]).indexOf(C.filter) > -1) return true
			}
		return false
	}

	/* -- KEY DICTIONARY -------------------------------------------------
	 *
	 *		This is called once and prepares a dictionary with standard, 
	 *		browser-agnostic keys which map to device-specific keys.
	 */
	static generateBrowserKeyDictionary = function() {
		const C = this
		console.log('CssManager.generateBrowserKeyDictionary()')
		C.deviceKeyDict = {}

		var styles = document.createElement('div').style

		for (var key in styles) {
			// get prefix
			var prefix = C.getPrefix(key)

			// key without prefix
			var standardKey = C.standardizeKey(key)
			//console.log( 'Device.element.style:', key );
			//console.log( ' - standard key:', standardKey );

			// handle exceptions per browser
			switch (Device.browser) {
				case 'safari':
					// use "webkit" prefix, if that's what was returned
					if (prefix == 'webkit') {
						C.deviceKeyDict[standardKey] = C.prependPrefix('webkit', standardKey)
					} else {
						// standard
						// exclude keys that have a "webkit"-equivalent
						if (!(C.prependPrefix('webkit', standardKey) in styles)) {
							C.deviceKeyDict[standardKey] = standardKey
						}
					}
					break
				case 'firefox':
					var mozKey = C.prependPrefix('Moz', standardKey)
					var webkitKey = C.prependPrefix('Webkit', standardKey)

					// use the no-prefix version, if it exists
					if (standardKey in styles) {
						C.deviceKeyDict[standardKey] = standardKey
					} else if (prefix == 'moz') {
						// use "Moz" if a "webkit"-equivalent exists
						if (C.camelateKey('webkit-' + standardKey) in styles) {
							C.deviceKeyDict[standardKey] = mozKey
						}
					} else if (prefix == 'webkit') {
						// note: in FF, there seem to be equivalents for all "webkit" vs. "Webkit" properites, so we use "Webkit" to match "Moz" convention....yah, nevermind.
						// use "webkit" if no "Moz"-equivalent exists
						if (!(mozKey in styles)) {
							C.deviceKeyDict[standardKey] = webkitKey
						}
					}
					break
				case 'chrome':
				case 'ie':
				default:
					// use the no-prefix version, if it exists
					if (standardKey in styles) {
						C.deviceKeyDict[standardKey] = standardKey
					} else if (prefix) {
						// otherwise it's a "prefix"-only type of property
						C.deviceKeyDict[standardKey] = C.prependPrefix(prefix, standardKey)
					}
					break
			}
		}
		console.log(' KEY DICTIONARY:', C.deviceKeyDict)
	}

	/* -- APPLYING CSS -----------------------------------------------
	 *
	 *
	 */
	static apply = function(element, cssList) {
		const C = this
		C.debug_element = element
		C.debug_css_list = cssList
		if (C.ifDebug('debug_level1')) console.log('  CssManager.apply()', element.id)

		// creates a collection of only the transforms
		var transformList = {}

		for (var key in cssList) {
			// has a non-destructive transform update, as generated by keyFormatExceptions()
			if (key.match(/^transform\(/)) transformList[key] = cssList[key]
			else {
				// standard css-key
				if (C.ifDebug('debug_level1')) console.log('   ' + key + ': ' + cssList[key] + ';')
				element.style[C.getDeviceKey(key)] = cssList[key]
			}
		}

		// will apply all transforms at once for correct calculation
		C.applyTransforms(element, transformList)

		if (C.ifDebug('debug_level1')) console.log('\n\n')
		C.debug_element = null
		C.debug_css_list = null
	}

	/* -- CONFORMING CSS SYNTAX -----------------------------------------------
	 *
	 *		These are protected methods, meant to be called by Styles...although
	 *		they could certainly be utilized by other core modules.
	 */
	static conformCssObject = function(cssObject, debugElement) {
		const C = this
		C.debug_element = debugElement
		if (C.ifDebug('debug_level1')) console.log('CssManager.conformCssObject()', cssObject)
		var cssList = {}
		if (cssObject) {
			for (var key in cssObject) {
				if (C.ifDebug('debug_level2')) console.log('  PARSE( key: ' + key + ', value: ' + cssObject[key] + ' )')
				var declarations = C.conformKeyValue(key, cssObject[key])
				for (var i in declarations) {
					if (C.ifDebug('debug_level2')) console.log('    CONFORMED DECLARATION:', declarations[i])
					cssList[declarations[i][0]] = declarations[i][1]
				}
			}
		}
		C.debug_element = null
		return cssList
	}
	static conformCssString = function(cssString, debugElement) {
		const C = this
		C.debug_element = debugElement
		if (C.ifDebug('debug_level1')) console.log(' CssManager.conformCssString()')
		var cssList = {}
		if (cssString) {
			var declarations = cssString.split(/\s*;\s*/)
			for (var key in declarations) {
				if (declarations[key]) {
					var declarationParts = declarations[key].split(/:(.+)?/)
					if (C.ifDebug('debug_level2')) console.log('  PARSE( key: ' + declarationParts[0] + ', value: ' + declarationParts[1] + ' )')
					var conformedDeclarations = C.conformKeyValue(declarationParts[0], declarationParts[1])
					for (var i in conformedDeclarations) {
						if (C.ifDebug('debug_level2')) console.log('    CONFORMED DECLARATION:', conformedDeclarations[i])
						cssList[conformedDeclarations[i][0]] = conformedDeclarations[i][1]
					}
				}
			}
		}
		C.debug_element = null
		return cssList
	}
	static conformCssKeyValue = function(key, value) {
		const C = this
		if (C.ifDebug('debug_level1')) console.log(' CssManager.conformCssKeyValue()')
		var cssObject = {}
		cssObject[key] = value
		return C.conformCssObject(cssObject)
	}

	/* -- CSS TRANSFORMATIONS -----------------------------------------------
	 *
	 *
	 *
	 */
	static applyTransforms = function(element, value) {
		const C = this
		if (C.ifDebug('debug_level1')) console.log('    - CssManager.applyTransforms(), ', value)
		var matrix2D = new Matrix2D()

		// existing transform
		var existingTransform = element.style[C.getDeviceKey('transform')]
		var matrixMatch = existingTransform.match(/matrix[^\)]+\)/)
		if (matrixMatch) {
			matrix2D.setFromCss(matrixMatch[0])
			if (C.ifDebug('debug_level2')) console.log('       existing matrix:', matrix2D.data)
		}

		if ('transforms' in element) var transforms = element.transforms
		else {
			var transforms = {
				tx: 0,
				ty: 0,
				rz: 0,
				sx: 1,
				sy: 1
			}
		}

		var changed = {}
		for (var key in value) {
			var transformMethod = key.match(/\(\s([^\s]+)/)[1]
			changed[transformMethod] = value[key]
		}

		// Order matters: rotate, scale, translate

		// first translate the x and y back to zero
		if (changed.tx != undefined) {
			matrix2D.data[2] = 0
		}
		if (changed.ty != undefined) {
			matrix2D.data[5] = 0
		}
		if (changed.rz != undefined) {
			var reverse = -transforms.rz
			matrix2D.rotate(reverse * (Math.PI / 180))
			matrix2D.rotate(changed.rz * (Math.PI / 180))
			transforms.rz = changed.rz
		}
		if (changed.sx != undefined) {
			var reverse = 1 / transforms.sx
			matrix2D.scale(reverse, 1)
			matrix2D.scale(changed.sx, 1)
			transforms.sx = changed.sx
		}
		if (changed.sy != undefined) {
			var reverse = 1 / transforms.sy
			matrix2D.scale(1, reverse)
			matrix2D.scale(1, changed.sy)
			transforms.sy = changed.sy
		}

		if (changed.tx != undefined) {
			matrix2D.translate(changed.tx, 0)
			transforms.tx = changed.tx
		}
		if (changed.ty != undefined) {
			matrix2D.translate(0, changed.ty)
			transforms.ty = changed.ty
		}

		// store transforms
		element.transforms = transforms
		if (C.ifDebug('debug_level2')) console.log('       updated matrix:', matrix2D.data)

		// apply css matrix
		element.style[C.getDeviceKey('transform')] = matrix2D.getCss()
	}

	/* -- KEY MAPPING -----------------------------------------------
	 *
	 *
	 */
	static conformKeyValue = function(key, value) {
		const C = this
		key = String(key).trim()
		value = String(value).trim()
		var keyAsStandard = C.standardizeKey(key)
		return C.conformValue(keyAsStandard, value)
	}
	static hasPrefix = function(key) {
		const C = this
		return key.search(C.matchPrefixRegex()) > -1
	}
	static getPrefix = function(key) {
		const C = this
		var match = key.match(C.matchPrefixRegex())
		return match ? match[1].replace(/-/g, '').toLowerCase() : null
	}
	static stripPrefix = function(key) {
		const C = this
		var keyless = key.replace(C.matchPrefixRegex(), '')
		return keyless.charAt(0).toLowerCase() + keyless.slice(1)
	}
	static getDeviceKey = function(key) {
		const C = this
		return key in C.deviceKeyDict ? C.deviceKeyDict[key] : key
	}
	static prependPrefix = function(prefix, key) {
		return (
			prefix +
			key.replace(/^(.)/, function(str) {
				return str.charAt(0).toUpperCase()
			})
		)
	}

	// converts any syntax of css-key to a consistent camelCase format
	static standardizeKey = function(key) {
		const C = this
		key = C.stripPrefix(key)

		// check if key is an exception
		if (key in C.keyFormatExceptions()) key = C.keyFormatExceptions()[key]
		else
			// or procedurally convert to camel
			key = C.camelateKey(key)

		if (C.ifDebug('debug_level2')) console.log('    - result: "' + key + '"')
		return key
	}
	static camelateKey = function(key) {
		key = key.replace(/-(.)/g, function(str) {
			return str.charAt(1).toUpperCase()
		})
		return key
	}
	/* This dictionary handles INTERNAL differences between how css-keys are written in the build on the css-objects and how they must be written 
		as valid CSS. Primarily, these exceptions are the arguments of the transform function, translate(), rotate(), and scale(), which need to be further 
		handled during value conformation. The exceptions could also include any semantic differences that might ease production confusion.

		** Do not confuse this with browser-key differences!! ex: transform vs. -ms-transform. Browser-keys are handled by <CssManager>.generateBrowserKeyDictionary() */
	static keyFormatExceptions = function() {
		return {
			x: 'transform( tx )',
			translateX: 'transform( tx )',
			y: 'transform( ty )',
			translateY: 'transform( ty )',
			rotate: 'transform( rz )',
			rotation: 'transform( rz )',
			scaleX: 'transform( sx )',
			scaleY: 'transform( sy )',
			scale: 'transform( sx ),transform( sy )'
		}
	}

	/* -- VALUE PARSING -----------------------------------------------
	 *
	 *
	 */
	/* takes a single css param, arg or func, and conforms it to _adlib standard */
	static conformValue = function(key, value) {
		const C = this
		var conformedValues = []
		var conformedValue

		// look for numeric values
		var hasMultipleValues = value.match(/\s/)
		var numericValue = value.match(C.matchNumberRegex())
		if (!hasMultipleValues && numericValue) {
			if (C.ifDebug('debug_level2')) console.log('   conform value as number')
			conformedValue = Number(numericValue[0])
			/* get existing unit */
			var unitMatch = value.match(/[^0-9\.]+$/)
			if (unitMatch) conformedValue += unitMatch[0]
			else
				/* assume default unit */
				switch (key) {
					case 'top':
					case 'right':
					case 'bottom':
					case 'left':
					case 'width':
					case 'height':
					case 'fontSize':
					case 'lineHeight':
					case 'padding':
					case 'margin':
					case 'marginRight':
					case 'marginLeft':
					case 'marginTop':
					case 'marginBottom':
					case 'borderRadius':
					case 'borderWidth':
					case 'letterSpacing':
						conformedValue += 'px'
						break
				}
		} else if (key == 'backgroundImage') {
			// background images - allows for either a stand-alone URL, or proper css like 'url( "http://example.com/image.jpg" );'
			if (C.ifDebug('debug_level2')) console.log('   conform value as background image')
			value = value.replace(/^url\(\s*['"]*/, '').replace(/['"]*\s*\)$/, '')
			conformedValue = 'url( "' + value + '" )'
		} else if (key == 'transform') {
			// transform-functions - should be split apart so a single matrix function can be written
			//	faster to just specify the transform exactly via css-object keys: x, y, rotate, scaleX, scaleY
			// && Device.browser == 'ie') {
			if (C.ifDebug('debug_level2')) console.log('   convert "transform" functions to individual transforms')
			var functionRegex = /([a-z0-9]+)\(([^\)]+)\)/gi
			while ((params = functionRegex.exec(value))) {
				var args = params[2]
					.replace(/\s/g, '')
					.split(',')
					.map(function(value, index, array) {
						return Number(value.match(C.matchNumberRegex())[0])
					})
				switch (params[1]) {
					case 'translate':
						conformedValues.push(['transform( tx )', args[0]])
						conformedValues.push(['transform( ty )', args[1]])
						break
					case 'translateX':
						conformedValues.push(['transform( tx )', args[0]])
						break
					case 'translateY':
						conformedValues.push(['transform( ty )', args[0]])
						break
					case 'rotate':
						conformedValues.push(['transform( rz )', args[0]])
						break
					case 'scale':
						conformedValues.push(['transform( sx )', args[0]])
						conformedValues.push(['transform( sy )', args[1]])
						break
					case 'scaleX':
						conformedValues.push(['transform( sx )', args[0]])
						break
					case 'scaleY':
						conformedValues.push(['transform( sy )', args[0]])
						break
				}
			}
		} else {
			// pass through
			if (C.ifDebug('debug_level2')) console.log('   conform value as string')
			conformedValue = value
		}

		// create style pair
		if (conformedValue != undefined) {
			if (C.ifDebug('debug_level2')) console.log('    - result: "' + conformedValue + '"')

			// split the key will alyways have 1 value, except for scale which has to split to scaleX and scaleY
			var splitKeys = key.split(/\,/)

			for (var i = 0; i < splitKeys.length; i++) {
				conformedValues.push([splitKeys[i], conformedValue])
			}
		}

		return conformedValues
	}

	static matchNumberRegex = function() {
		return /^[+-]?[0-9]*\.?[0-9]+/
	}
	static matchPrefixRegex = function() {
		return /^-*(moz-*|webkit-*|ms-*|o-)/i
	}
}

export default CssManager
