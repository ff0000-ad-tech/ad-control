var ViewManager = new function() {
	var self = this;
	var _placeHolderIdSuffix = 0;

	self.DATA_FLAG = 'data';
	self.dataDict = {};

	self.getView = function( name ) {
		return Views[ name ];
	}

	self.getViewStyle = function( name ) {
		return ViewStyles[ name ];
	}

	/*
		{
			target: [target element],
			viewName: [name of view to render],
			viewContent: [content of a view to process],
			data: [data context], //optional
			simpleRender: false,
			idSuffix: [string to add after id] //optional
			callback: function
		}
	*/
	self.render = function( arg ) {
		if( !arg.target || ( !arg.viewName && !arg.viewContent )) {
			 throw new Error ( 'ViewManager: Please specify target and view name or view content.' );
		}
		// clear data dictionary 
		self.dataDict = {};

		if( arg.data ) {
			self.dataDict[ self.DATA_FLAG ] = arg.data;
			delete arg.data;
		}
		
		self._doRender( arg );
		return self;
	}

	self._doRender = function( arg ) {
		arg.placeHolderId = 'view_place_holder' + _placeHolderIdSuffix;
		_placeHolderIdSuffix++;

		var thread = new ViewManager.renderThread( arg );
		thread.start();
	}

	self.renderArray = function( arg ) {
		var arr = arg.arrayData;
		var i;
		for( i=0; i<arr.length; i++ ) {
			self.dataDict[ arg.dataName ] = arr[ i ];
			var itemArg = {
				target: arg.target,
				viewContent: arg.viewContent,
				idSuffix: i
			};
			self._doRender( itemArg );
		}
	}
}




ViewManager.renderThread = function( arg ) {
	var parent = ViewManager;
	var self = this;

	var targetEl = arg.target;
	var viewName = arg.viewName;
	var idSuffix = ( arg.idSuffix !== undefined ) ? arg.idSuffix : '';
	var callback = arg.callback || function() {};

	var toBeRemovedEl = [];
	var toBeReplacedEl = [];
	var componentElts = {};

	var placeHolder;

	self.start = function() {
		var tmpl = arg.viewContent || parent.getView( viewName );
		
		// if si
		if( arg.simpleRender ) {
			
			targetEl.insertAdjacentHTML( 'beforeend', tmpl );

		} else {
			placeHolder = createPlaceHolder({
				id: arg.placeHolderId,
				target: targetEl
			});
			placeHolder.innerHTML = tmpl;

			// check if there is at leaset one element
			var lastEl = placeHolder.lastElementChild;
			if( lastEl ) {
				//set a flag to check to know when the process is done
				lastEl.setAttribute( 'isLast', true );
				processView( placeHolder.children );
			} else {
				// no element to process, execute callback
				callback();
			}
		}

		// inject stylesheet for the associated view 
		if( viewName ) {
			Styles.injectStylesheet( 'ViewStyles_' + viewName, window.ViewStyles[ viewName ]);
		}
	}

	function processView( children ) {
		var i;
		var len = children.length;
		for( i=0; i<len; i++ ) {
			processViewChild( children[ i ]);
		}
	}

	function processViewChild( child ) {
		var isLast = child.getAttribute( 'isLast' );
		var callOnComplete = false;
		
		parseViewChild( child );
		
		if( isLast ) {
			child.removeAttribute( 'isLast' );
			processViewOnComplete();
		}
	}

	function parseViewChild( child ) {
		var id = child.id || '';
		var accessId = child.getAttribute( 'accessId' );
		var elToProcess = child;
		var elToAccess = child;

		// add suffix to id and access id 
		if( idSuffix !== '' ) {
			if( id ) {
				id = id + idSuffix;
				child.id = id;
			}

			if( accessId ) {
				accessId = accessId + idSuffix;
			}
		}

		// RED custom tag name flags
		switch( child.tagName ) {
			case 'RED-VIEW':
				var classnames = child.classList;
				
				var componentType = child.getAttribute( 'type' );
				var componentArg = getAssociatedData( child );
				componentArg.id = id;
				componentArg.target = placeHolder;

				var component = new window[ componentType ]( componentArg );

				// check if the component is a HTMLElement, if not, check if it has container or canvas property 
				var domEl = ( component instanceof HTMLElement ) ? component : ( component.container ? component.container : component.canvas );

				domEl.insertAdjacentHTML( 'beforeend', child.innerHTML );
				child.parentNode.replaceChild( domEl, child );

				elToProcess = domEl;
				elToAccess = component;

				//add the classnames back
				for( var i=0; i<classnames.length; i++ ) {
					elToProcess.classList.add( classnames[ i ]);
				}
			break;

			case 'RED-FOR-LOOP':
				var arrayDataName = child.getAttribute( 'iteration-data-name' );
				var arrayData = getAssociatedData( child );

				var arrPlaceHolder = createPlaceHolder({
					id: 'view_array_place_holder' + child.id,
					target: child.parentNode
				});
				child.parentNode.insertBefore( arrPlaceHolder, child );
				toBeReplacedEl.push( arrPlaceHolder );

				var data = {
					target: arrPlaceHolder,
					viewContent: child.innerHTML,
					arrayData: arrayData,
					dataName: arrayDataName
				};
				child.parentNode.removeChild( child );

				elToProcess = null;
				parent.renderArray( data );		
			break;

			case 'RED-IF-TRUE':
			case 'RED-IF-FALSE':
				var data = getAssociatedData( child )
				
				if( child.tagName === 'RED-IF-FALSE' ) {
					data = !data;
				}

				if( data ) {
					toBeReplacedEl.push( child );
				} else {
					toBeRemovedEl.push( child );
					elToProcess = null;
				}
			break;
		}
		
		if( elToProcess ) {
			if( elToProcess.children.length > 0 ) {
				processView( elToProcess.children );
			}
		}
		
		if( elToAccess && id ) {
			var elKey = camelCase( id );
			adData.elements[ elKey ] = elToAccess;
		}

		if( elToAccess && accessId ) {
			componentElts[ accessId ] = elToAccess;
		}
	}

	function processViewOnComplete() {
		//remove all elements
		var i;
		var len = toBeRemovedEl.length;
		for( i=0; i<len; i++ ) {
			var el = toBeRemovedEl[ i ];
			el.parentNode.removeChild( el );
		}

		len = toBeReplacedEl.length;
		for( i=0; i<len; i++ ) {
			var el = toBeReplacedEl[ i ];

			while ( el.firstChild ) {
				el.parentNode.insertBefore( el.firstChild, el );
			}
			el.parentNode.removeChild( el );
		}

		if( targetEl ) {
			while( placeHolder.firstChild ) {
				targetEl.appendChild( placeHolder.firstChild );
			}
		}

		placeHolder = null;

		callback( componentElts );
	}

	function getAssociatedData( el ) {

		var key = el.getAttribute( 'data' );
		if( key === null ) {
			key = '';
		}
		// try dataDict first
		var result = ObjectUtils.objectifier.get( key, parent.dataDict );
		// if not in dataDict, use window 
		if( result === undefined ) {
			result = ObjectUtils.objectifier.get( key, window );
		}
		return result;
	}

	function createPlaceHolder( arg ) {
		var placeHolder = document.createElement( 'div' );
		placeHolder.id = arg.id;

		return placeHolder;
	}

	function camelCase( str ) { 
	    return str.replace(/-(.)/g, function( match, chr ) {
	        return chr.toUpperCase();
	    });
	}
}

