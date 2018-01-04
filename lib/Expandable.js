/**
	@class Expandable
	@description
		This class controls the expanding and collapsing of expandable units. The animation relys on the properties
		set in the index. Therefore, the animation has be removed from the build file and handled internally. 
		This class can be extended with {@link ExpandableDcs} when units are used in DoubleClick.
 */

import { GestureEvent } from 'ad-events'

var E
var Expandable = function() {
	if (E) return E
	E = this

	var _afterInitExpanded = true
	var _arg

	/* ---------------------------------------------------------------------------------------------------- */
	// PUBLIC PROPERTIES

	/**
		@memberOf Expandable
		@var {boolean} userHasInteracted
			Indicates if the ad has been interacted by the user
		@example
			console.log( Expandable.userHasInteracted )
	*/
	E.userHasInteracted = false

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
	E.init = function(arg) {
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
	E.collapse = function(gestureEvent) {
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
	E.expand = function(gestureEvent) {
		GestureEvent.stop(gestureEvent)
		E._expand(gestureEvent)
	}

	/* ---------------------------------------------------------------------------------------------------- */
	// PROTECTED METHODS
	E._init = function() {}

	E._collapse = function(gestureEvent) {
		E._handleCollapseStart()
	}

	E._expand = function(gestureEvent) {
		E._handleExpandStart()
	}

	E._collapseComplete = function() {
		E._handleCollapseComplete()
	}

	E._expandComplete = function() {
		E._handleExpandComplete()
	}

	/* ---------------------------------------------------------------------------------------------------- */
	// PRIVATE METHODS
	function expandStart() {
		TweenLite.to(_arg.target, _arg.expandTime, {
			x: adParams.expandable.expandedX,
			y: adParams.expandable.expandedY,
			width: adParams.adWidth,
			height: adParams.adHeight,
			onComplete: E._expandComplete
		})
	}

	function collapseStart(isInit) {
		var time = isInit ? 0 : _arg.collapseTime
		var param = adParams.expandable
		TweenLite.to(_arg.target, time, {
			x: param.collapsedX,
			y: param.collapsedY,
			width: param.collapsedWidth,
			height: param.collapsedHeight,
			onComplete: isInit ? undefined : E._collapseComplete
		})
	}

	function fireCallback(name) {
		;(_arg[name] || function() {}).call()
	}

	/* ---------------------------------------------------------------------------------------------------- */
	// EVENT HANDLERS
	E._handleExpandStart = function(event) {
		fireCallback('expandStart')
		expandStart()
	}

	E._handleExpandComplete = function(event) {
		fireCallback('expandComplete')
		E.userHasInteracted = _afterInitExpanded
		_afterInitExpanded = true
	}

	E._handleCollapseStart = function(event) {
		collapseStart()
		fireCallback('collapseStart')
		E.userHasInteracted = true
	}

	E._handleCollapseComplete = function(event) {
		fireCallback('collapseComplete')
		E.userHasInteracted = true
	}
}

export default Expandable
