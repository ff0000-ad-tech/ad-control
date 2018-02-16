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
	
	constructor() {
		const E = this
		E._afterInitExpanded = true
		E._arg = undefined

		/* ---------------------------------------------------------------------------------------------------- */
		// PUBLIC PROPERTIES

		/**
			@memberOf Expandable
			@var {boolean} userHasInteracted
				Indicates if the ad has been interacted by the user
			@example
				console.log(Expandable.userHasInteracted)
		*/
		E.userHasInteracted = false
	}

	/* ---------------------------------------------------------------------------------------------------- */
	// PUBLIC METHODS
	/**
		@memberOf Expandable
		@method init
		@desc
			This method initializes the class, linking all callbacks and the target being set. This should 
			be called Control.postMarkup
		@example
			Expandable.init({
				target: View.expanded,
				expandStart: Control.handleExpandStart,
				expandComplete: Control.handleExpandComplete,
				collapseStart: Control.handleCollapseStart,
				collapseComplete: Control.handleCollapseFinish
			})

			// optionally you can add time alues for expanding/collapsing
			Expandable.init({
				target: View.expanded,
				expandStart: Control.handleExpandStart,
				expandComplete: Control.handleExpandComplete,
				collapseStart: Control.handleCollapseStart,
				collapseComplete: Control.handleCollapseFinish,

				expandTime: .3,
				collapseTime: .3
			})
	*/
	init = (arg) => {
		const E = this
		E._arg = arg || {}
		E._arg.expandTime = E._arg.expandTime || 0.5
		E._arg.collapseTime = E._arg.collapseTime || 0.5

		if (E._arg.extend) {
			console.log('Expandable extended with', E._arg.extend.toString())
		}
		// this is called so that an extended class will initialize as well
		E._init()

		if (adParams.expandable.expanded) {
			E._afterInitExpanded = false
			E.expand()
		} else {
			E.collapseStart(true)
		}
	}

	/**
		@memberOf Expandable
		@method collapse
		@desc
			Collapses the View.expand container.
		@example
			Expandable.collapse()
	*/
	collapse = (gestureEvent) => {
		GestureEvent.stop(gestureEvent)
		this._collapse(gestureEvent)
	}

	/**
		@memberOf Expandable
		@method expand
		@desc
			Expands the View.expand container.
		@example
			Expandable.expand()
	*/
	expand = (gestureEvent) => {
		GestureEvent.stop(gestureEvent)
		this._expand(gestureEvent)
	}

	/* ---------------------------------------------------------------------------------------------------- */
	// PROTECTED METHODS
	_init = () => {}

	_collapse = (gestureEvent) => {
		this._handleCollapseStart()
	}

	_expand = (gestureEvent) => {
		this._handleExpandStart()
	}

	_collapseComplete = () => {
		this._handleCollapseComplete()
	}

	_expandComplete = () => {
		this._handleExpandComplete()
	}

	/* ---------------------------------------------------------------------------------------------------- */
	// PRIVATE METHODS
	expandStart = () => {
		const E = this
		TweenLite.to(E._arg.target, E._arg.expandTime, {
			x: adParams.expandable.expandedX,
			y: adParams.expandable.expandedY,
			width: adParams.adWidth,
			height: adParams.adHeight,
			onComplete: E._expandComplete
		})
	}

	collapseStart = (isInit) => {
		const E = this
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

	fireCallback = (name) => {
		;(this._arg[name] || function(){}).call()
	}

	/* ---------------------------------------------------------------------------------------------------- */
	// EVENT HANDLERS
	_handleExpandStart = (event) => {
		this.fireCallback('expandStart')
		this.expandStart()
	}

	_handleExpandComplete = (event) => {
		const E = this
		E.fireCallback('expandComplete')
		E.userHasInteracted = E._afterInitExpanded
		E._afterInitExpanded = true
	}

	_handleCollapseStart = (event) => {
		const E = this
		E.collapseStart()
		E.fireCallback('collapseStart')
		E.userHasInteracted = true
	}

	_handleCollapseComplete = (event) => {
		this.fireCallback('collapseComplete')
		this.userHasInteracted = true
	}
}

export default new Expandable