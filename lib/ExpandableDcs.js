/**
	@class ExpandableDcs
	@description
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
var ExpandableDcs = new function(){

	this.toString = function(){
		return 'ExpandableDcs'
	}

	var E = Expandable;

	E._init = function(){
		Enabler.addEventListener ( studio.events.StudioEvent.EXPAND_START, E._handleExpandStart );
		Enabler.addEventListener ( studio.events.StudioEvent.EXPAND_FINISH, E._handleExpandComplete );
		Enabler.addEventListener ( studio.events.StudioEvent.COLLAPSE_START, E._handleCollapseStart );
		Enabler.addEventListener ( studio.events.StudioEvent.COLLAPSE_FINISH, E._handleCollapseComplete );

		if ( adParams.expandable.expanded ){
			Enabler.setStartExpanded(true);
		}
	}

	E._collapse = function( gestureEvent ){
		Enabler.requestCollapse();
		if( gestureEvent )
			Enabler.reportManualClose();
	}

	E._expand = function( gestureEvent ){
		Enabler.requestExpand();
	}

	E._collapseComplete = function(){
		Enabler.finishCollapse();
	}

	E._expandComplete = function(){
		Enabler.finishExpand();
	}	
}

export default ExpandableDcs