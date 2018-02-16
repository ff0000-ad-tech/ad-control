/**
	@class ExpandableDcs
	@description
		<a href="https://github.com/ff0000-ad-tech/ad-control">Github repo</a>
		<br><br>
		
		This is and extension of {@link Expandable} when units are used in DoubleClick. The only difference in the 
		init() method is to pass in this class to the Expandable.init()
		<codeblock>
			Expandable.init ({
				target : View.expanded,
				expandStart : Control.handleExpandStart,
				expandComplete : Control.handleExpandComplete,
				collapseStart : Control.handleCollapseStart,
				collapseComplete : Control.handleCollapseFinish,

				extend : ExpandableDcs
			});
		</codeblock>
 */

import Expandable from './Expandable'

class ExpandableDcs extends Expandable {

	constructor() {
		super()
	}

	toString = () => {
		return 'ExpandableDcs'
	}

	_init = () => {
		const E = this
		Enabler.addEventListener(studio.events.StudioEvent.EXPAND_START, E._handleExpandStart)
		Enabler.addEventListener(studio.events.StudioEvent.EXPAND_FINISH, E._handleExpandComplete)
		Enabler.addEventListener(studio.events.StudioEvent.COLLAPSE_START, E._handleCollapseStart)
		Enabler.addEventListener(studio.events.StudioEvent.COLLAPSE_FINISH, E._handleCollapseComplete)

		if (adParams.expandable.expanded) {
			Enabler.setStartExpanded(true)
		}
	}

	_collapse = (gestureEvent) => {
		Enabler.requestCollapse()
		if (gestureEvent) Enabler.reportManualClose()
	}

	_expand = (gestureEvent) => {
		Enabler.requestExpand()
	}

	_collapseComplete = () => {
		Enabler.finishCollapse()
	}

	_expandComplete = () => {
		Enabler.finishExpand()
	}
}

export default new ExpandableDcs
