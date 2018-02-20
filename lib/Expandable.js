/**
	@class Expandable
	@description
		<a href="https://github.com/ff0000-ad-tech/ad-control">Github repo</a>
		<br><br>
		
		This class controls the expanding and collapsing of expandable units. The animation relys on the properties
		set in the index. Therefore, the animation has be removed from the build file and handled internally. 
		This class can be extended with {@link ExpandableDcs} when units are used in DoubleClick.
 */

import { GestureEvent } from 'ad-events'

class Expandable {
	
	static _afterInitExpanded = true
	static _arg

	/* ---------------------------------------------------------------------------------------------------- */
	// PUBLIC PROPERTIES

	/**
		@memberOf Expandable
		@var {boolean} userHasInteracted
			Indicates if the ad has been interacted by the user
		@example
			console.log( Expandable.userHasInteracted )
	*/
	static userHasInteracted = false

	/* ---------------------------------------------------------------------------------------------------- */
	// PUBLIC METHODS
	/**
		@memberOf Expandable
		@method init
		@desc
			This method initializes the class, linking all callbacks and the target being set. This should 
			be called Control.postMarkup
		@example
			Expandable.init ({
				target : View.expanded,
				expandStart : Control.handleExpandStart,
				expandComplete : Control.handleExpandComplete,
				collapseStart : Control.handleCollapseStart,
				collapseComplete : Control.handleCollapseFinish
			});

			// optionally you can add time alues for expanding/collapsing
			Expandable.init ({
				target : View.expanded,
				expandStart : Control.handleExpandStart,
				expandComplete : Control.handleExpandComplete,
				collapseStart : Control.handleCollapseStart,
				collapseComplete : Control.handleCollapseFinish,

				expandTime : .3,
				collapseTime : .3
			});
	*/
	static init = (arg) => {
		const E = Expandable
		_arg = arg || {}
		_arg.expandTime = _arg.expandTime || 0.5
		_arg.collapseTime = _arg.collapseTime || 0.5

		if (_arg.extend) {
			console.log('Expandable extended with', _arg.extend.toString())
		}
		// this is called so that an extended class will initialize as well
		E._init()

		if (adParams.expandable.expanded) {
			_afterInitExpanded = false
			E.expand()
		} else {
			collapseStart(true)
		}
	}

	/**
		@memberOf Expandable
		@method collapse
		@desc
			Collapses the View.expand container.
		@example
			Expandable.collapse();
	*/
	static collapse = (gestureEvent) => {
		const E = Expandable
		GestureEvent.stop(gestureEvent)
		E._collapse(gestureEvent)
	}

	/**
		@memberOf Expandable
		@method expand
		@desc
			Expands the View.expand container.
		@example
			Expandable.expand();
	*/
	static expand = (gestureEvent) => {
		const E = Expandable
		GestureEvent.stop(gestureEvent)
		E._expand(gestureEvent)
	}

	/* ---------------------------------------------------------------------------------------------------- */
	// PROTECTED METHODS
	static _init = () => {}

	static _collapse = (gestureEvent) => {
		Expandable._handleCollapseStart()
	}

	static _expand = (gestureEvent) => {
		Expandable._handleExpandStart()
	}

	static _collapseComplete = () => {
		Expandable._handleCollapseComplete()
	}

	static _expandComplete = () => {
		Expandable._handleExpandComplete()
	}

	/* ---------------------------------------------------------------------------------------------------- */
	// PRIVATE METHODS
	static expandStart = () => {
		const E = Expandable
		TweenLite.to(E._arg.target, E._arg.expandTime, {
			x: adParams.expandable.expandedX,
			y: adParams.expandable.expandedY,
			width: adParams.adWidth,
			height: adParams.adHeight,
			onComplete: E._expandComplete
		})
	}

	static collapseStart = (isInit) => {
		const E = Expandable
		var time = isInit ? 0 : E._arg.collapseTime
		var param = adParams.expandable
		TweenLite.to(E._arg.target, time, {
			x: param.collapsedX,
			y: param.collapsedY,
			width: param.collapsedWidth,
			height: param.collapsedHeight,
			onComplete: isInit ? undefined : E._collapseComplete
		})
	}

	static fireCallback = (name) => {
		;(Expandable._arg[name] || function() {}).call()
	}

	/* ---------------------------------------------------------------------------------------------------- */
	// EVENT HANDLERS
	static _handleExpandStart = (event) => {
		const E = Expandable
		E.fireCallback('expandStart')
		E.expandStart()
	}

	static _handleExpandComplete = (event) => {
		const E = Expandable
		fireCallback('expandComplete')
		E.userHasInteracted = E._afterInitExpanded
		E._afterInitExpanded = true
	}

	static _handleCollapseStart = (event) => {
		const E = Expandable
		E.collapseStart()
		E.fireCallback('collapseStart')
		E.userHasInteracted = true
	}

	static _handleCollapseComplete = (event) => {
		const E = Expandable
		E.fireCallback('collapseComplete')
		E.userHasInteracted = true
	}
}

export default Expandable
