/**
	@npmpackage
	@class SheetManager
	@desc
		Import from <a href="https://github.com/ff0000-ad-tech/ad-control">ad-control</a>
		<br>
		<codeblock>
			// importing into an ES6 class
			import { SheetManager } from 'ad-control'
		</codeblock>
		<br><br>
		
		Class manages the creation of &lt;style> tags and the addition/removal of classes.
*/
import { Markup } from 'ad-view'

/**
	@memberOf SheetManager
	@method createGlobalNode
	@param {string} nodeId
		the id of the &lt;style> node written to the &lt;head>
	@param {string} styles
		selector/CSS string pair as separate parameters, following 'selector', 'css string' pattern,
		or a self-contained CSS style string including selectors, like '.myClass{ color: blue; }'
	@desc
		Create a new CSS node (class, tag, etc) DEFINITION with submitted styles with selector/CSS string
		pair or a self-contained CSS string including selectors. 

	@example
		// selector/CSS string pair
		SheetManager.createGlobalNode ( 'myFirstStyle', 
			'.class-a', 'position:absolute; width:inherit;'
		)

		// or add multiple class declarations to the same node
		SheetManager.createGlobalNode ( 'mySecondStyle', 
			'.class-b', 'position:absolute;',
			'.class-b-top', 'width:inherit; height:inherit;'
		)

		// or have mulitple classes share the same logic
		SheetManager.createGlobalNode ( 'myThirdStyle', 
			'.class-c, .class-d', 'position:absolute;'
		)

		// add style to a tag globally
		SheetManager.createGlobalNode ( 'myFourthStyle', 
			'h1', 'position:absolute;'
		)
		
		// self-contained CSS string
		var myCssString = '.myClass, h1 { color: blue; margin: 10px; }';
		SheetManager.createGlobalNode( 'myFifthStyle', myCssString );
*/
export function createGlobalNode(nodeId, styles) {
	if (document.getElementById(nodeId)) {
		return
	}

	var style = document.createElement('style')
	style.type = 'text/css'
	style.id = nodeId

	// if only two parameters, assuming styles is CSS string
	// else process as selector/style pair
	var str = arguments.length === 2 ? styles : ''

	if (arguments.length > 2) {
		for (var i = 0; i < arguments.length - 1; i += 2) {
			// strip out all the white space
			var names = arguments[i + 1].replace(/\s*/g, '')

			str += names
			str += ' { ' + (arguments[i + 2] || '') + ' }\n'
		}
	}

	style.innerHTML = str
	document.getElementsByTagName('head')[0].appendChild(style)
}

/**
	@memberOf SheetManager
	@method addClass
	@param {string|element} target
		id or element to which css style should be added
	@param {string} className
		css class association to be added to this target
	@desc
		Add a CSS class ASSOCIATION to the targeted element.
*/
export function addClass(target, className) {
	var element = Markup.getElement(target)

	// IE does not support multiple classes being added as arguments, so must loop
	for (var i = 0; i < arguments.length - 1; i++) {
		element.classList.add(arguments[i + 1])
	}
}

/**
	@memberOf SheetManager
	@method removeClass
	@param {string|element} target
		id or element from which css style should be removed
	@param {string} className
		css class association to be removed from this target
	@desc
		Removes a CSS class ASSOCIATION from the targeted element.
*/
export function removeClass(target, className) {
	var element = Markup.getElement(target)
	element.classList.remove(className)
}
