/**
	@class LiveScoring
	@desc
		<a href="https://github.com/ff0000-ad-tech/ad-control">Github repo</a>
		<br><br>
		
		This class manages the polling of the ESPN SCORES API via an Edgecast proxy. In order to build an ad that responds to live scoring, 
		you need to start with the "ad-manager-espn-live-scoring" template. You will notice there is a "liveScoring" settings object
		in the index. Then, in the build is where you will find the event-handlers that will be necessary to thread into your build routines.
		<br><br>

		<b>Setup:</b><br>
			The piece that must be coded is the connection of game-ids from {@link AdManager} to {@link LiveScoring}. The json from AdManager 
			(accessible on {@link AdData.adDataRaw} contains a list of events, the first of which is the next live event. There should be a
			"game_id" property somewhere in that json. For the ESPN API is a 9-digit number. You need to create a property in {@link AdData} 
			for this id, and pass that to {@link LiveScoring}, like:
			<br>

			<codeblock>
				adData.liveScoring = new LiveScoring();
				adData.liveScoring.prepare( adData.currentGameId );
			</codeblock>
			<br><br>

			The following is a summary of what happens in the build.
			<ol>
			 <li>Instantiate {@link LiveScoring}</li>
			 <li>Pass current-game-id to {@link LiveScoring}
			 <li>Setup listeners to handle 
			  <ul>
				<li>State Change, ie, a match goes from upcoming-to-live or live-to-past...which necessitates a rebuild of the view</li>
				<li>Match Update, ie, the score, clock, or period of the currently live game changes/li>
				<li>All Matches Complete, ie, in a doubleheader, both matches are finished and the next {@link AdData} from {@link AdManager} needs to be loaded.</li>
			  </ul>
			 <li>Indicate pathes to local, debug json, which can be used to spoof live-data</li>
			 <li>Start polling.</li>
			</ol>

		<b>Debug:</b><br>
			When running the ad locally, the ad will load the debug live-scoring-json, as specified in the build: <br>
			
			<codeblock>
				adParams.commonPath + 'debug/'
			</codeblock>
			<br><br>

			Because live-events often are double-headers (two games per event) that need to actively cycle through each game there are 
			four debug jsons. These represent two events( "live_data1" and "live_data2" ), with two games( "game1" and "game2" ) per event. 
			If you are only advertising a single game, then you'd be able to test using only the first set "live_data1".<br><br>

			The way to change the "state" of the ad is to find the "state" property in these debug jsons and switch them to one of
			the following three modes:<br>
			<ol>
				<li><code>pre</code></li>
				<li><code>in</code></li>
				<li><code>post</code></li>
			</ol>

			From there any other properties display depends on how your ad is coded.<br><br>

		<b>Notes:</b><br>
			The challenge of live-scoring is building your ad in a way that it can be rebuilt and updated dynamically. For example,
			it needs to be able to build itself in either Doubleheader, Singleheader, or Live modes.<br><br>

			One example of how this can be achieved is detailed below. This code assumes that you have built different endframe "modules"
			which all have a common interface method called "buildMarkup()".<br><br>

	@example
		this.rebuildEndframe = function() {
			adData.elements.endframeModule = function() {
				// LIVE MODE
				if( adData.liveScoring.areLiveMatches() ) {
					console.log( ' - LIVE MODE' );
					return new LiveScoring_300x250();
				}

				// UPCOMING MODE
				else {
					console.log( ' - UPCOMING MODE' );
					// json is double-header
					if( adData.game_type == 'Doubleheader' ) {
						// both matches are upcoming
						if( !adData.getIsMatchup1Past() ) {
							console.log( '    ( doubleheader )' );
							return new DoubleHeader_300x250();
						}
						// first match is finished
						else {
							console.log( '    ( singleheader )' );
							return new SingleHeader_300x250();
						}
					}

					// json is single-header
					else {
						console.log( '    ( singleheader )' );
						return new SingleHeader_300x250();
					}
				}
			}
			adData.elements.endframeModule.buildMarkup();
		}
*/
import { NetUtils } from 'ad-utils'
import { AdManager } from 'ad-external'
import Loader from 'ad-load'
import LiveScoringData from './LiveScoringData'

function LiveScoring() {
	console.log('LiveScoring()')

	var self = this

	/* -----------------------------------------------------------------------------------------
	 *
	 *	CONTROL
	 *
	 */
	var apiProxyUrl = adParams.liveScoring.apiProxyUrl
	var pollFrequency = adParams.liveScoring.pollFrequency
	var expirationOffsetMinutes = adParams.liveScoring.expirationOffset

	/**
		@memberOf LiveScoring
		@method prepare
		@param {string|array} currentGameId
			Required. Either a string or an array. This comes from AdManager.json, the next upcoming event. In the past
			that property could be found at `adData.adDataRaw.matchup[ 0 ].game.game_id`, however you may need to 
			acquire from another property.
		@desc
			This class creates a list of matchups, based on game-ids which came from AdManager's current {@link AdData}. 
			If it's a single-header, there one game-id. If it is a double-header, then there will be two game-ids. 
	*/
	self.prepare = function(currentGameIds) {
		console.log('LiveScoring.prepare()')
		if (!currentGameIds) {
			console.log(' ~ GAME-IDs from AdManager json are required!!!')
			return
		} else console.log(' - currentGameIds:', currentGameIds)

		if (typeof currentGameIds == 'string') currentGameIds = [currentGameIds]
		for (var i in currentGameIds) {
			addMatchupFor(currentGameIds[i])
		}
	}

	/**
		@memberOf LiveScoring
		@method addEventCallBack
		@param {string} _type
			corresponds to the <LiveScoringEvent> constant
		@param {function} _callback
			is the function that should be called on the firing of the event.
		@desc
			This adds a callback for any of the events dispatched by this class.
	*/
	self.addEventCallBack = function(_type, _callback) {
		events.push({
			type: _type,
			callback: _callback
		})
	}

	/**
		@memberOf LiveScoring
		@method startPolling
		@desc
			Begins making requests to the API for scoring data. 
	*/
	self.startPolling = function() {
		console.log('LiveScoring.startPolling()')
		intervalId = setInterval(poll, self.isDebugMode() ? 10000 : 1000 * pollFrequency)
		poll()
	}

	/**
		@memberOf LiveScoring
		@method cleanup
		@desc
			Stops polling and resets the list of game-ids.
	*/
	self.cleanup = function() {
		console.log('LiveScoring.cleanup()')
		stopPolling()
		matchups = []
	}

	/**
		@memberOf LiveScoring
		@method setDebugPathsFor
		@param {string|number} _indexOrGameId 
			Optional, if this is an integer less than the number of matches, then it is handled
			as a matchup index. Otherwise, this corresponds to the {@link AdData.game_id}.
		@param {string} _debugPaths
			a relative or http path( or paths )pointing at json resources which match the expected format
		@desc
			This is a utility for specifying specific, non-live data that can be easily tweaked for the sake of testing.
	*/
	self.setDebugPathsFor = function(_indexOrGameId, _debugPaths) {
		console.log('LiveScoring.setDebugPathsFor()')
		var matchup = getMatchupBy(_indexOrGameId)
		if (matchup) {
			console.log(' - gameId: ' + matchup.gameId + ', debugPaths: ' + _debugPaths)
			if (_debugPaths instanceof Array) matchup.debugPaths = matchup.debugPaths.concat(_debugPaths)
			else matchup.debugPaths.push(_debugPaths)
		}
	}

	/**
		@memberOf LiveScoring
		@method isDebugMode
		@desc
			Centralizes the logic for debug mode.<br><br>

			AdManager preview locations will automatically try to load debug json. There are also two query-string parameters 
			for controlling debug mode:<br><br>
			<ul>
			 <li>"?liveScoringDebug=true" to force debug-mode</li>
			 <li>"?liveScoringDebug=false" to force live-mode</li>
			</ul>
	*/
	self.isDebugMode = function() {
		var liveScoringDebug = NetUtils.getQueryParameterBy('liveScoringDebug')
		return (AdManager.isPreviewLocation() || liveScoringDebug == 'true') && liveScoringDebug != 'false'
	}

	/* -----------------------------------------------------------------------------------------
	 *
	 *	MATCHUP STATUS
	 *
	 */
	/**
		@memberOf LiveScoring
		@method data
		@param {string|number} _indexOrGameId
			Optional. If this is an integer less than the number of matches, then it is handled
			as a matchup index. Otherwise, this corresponds to the {@link AdData.game_id}. If no argument is
			passed, then the first non-null, {@link LiveScoringData} is returned.
		@returns {LiveScoringData}
			Returns the {@link LiveScoringData} class for the requested game-id. 
	*/
	self.data = function(_indexOrGameId) {
		if (_indexOrGameId) return getMatchupBy(_indexOrGameId).liveScoringData
		else {
			for (var i = 0; i < matchups.length; i++) {
				if (matchups[i].liveScoringData) if (!matchups[i].liveScoringData.getIsPast()) return matchups[i].liveScoringData
			}
		}
		return null
	}

	/**
		@memberOf LiveScoring
		@method areLiveMatches
		@returns {boolean}
			Returns true if any matchups in the current {@link AdData} are live. 
	*/
	self.areLiveMatches = function() {
		for (var i = 0; i < matchups.length; i++) {
			if (matchups[i].liveScoringData) {
				if (matchups[i].liveScoringData.getIsLive()) return true
			}
		}
		return false
	}

	/**
		@memberOf LiveScoring
		@method isMatchupLive
		@param {string|number} _indexOrGameId
			If this is an integer less than the number of matches, then it is handled
			as a matchup index. Otherwise, this corresponds to the {@link AdData.game_id}.
		@returns {boolean}
		@desc
			Returns true if the requested matchup is live.
	*/
	self.isMatchupLive = function(_indexOrGameId) {
		var matchup = getMatchupBy(_indexOrGameId)
		if (matchup) return matchup.liveScoringData.getIsLive()
		else return false
	}

	/**
		@memberOf LiveScoring
		@method allMatchesArePast
		@returns {boolean}
		@desc
			Returns true if all matchups in the current {@link AdData} are past. 
	*/
	self.allMatchesArePast = function() {
		for (var i = 0; i < matchups.length; i++) {
			if (matchups[i].liveScoringData) {
				if (!matchups[i].liveScoringData.getIsPast()) return false
			}
		}
		return true
	}

	/**
		@memberOf LiveScoring
		@method isMatchupPast
		@param {string|number} _indexOrGameId
			If this is an integer less than the number of matches, then it is handled
			as a matchup index. Otherwise, this corresponds to the <AdData>.game_id.
		@returns {boolean}
			Returns true if the requested matchup is live.
	*/
	self.isMatchupPast = function(_indexOrGameId) {
		var matchup = getMatchupBy(_indexOrGameId)
		if (matchup) return matchup.liveScoringData.getIsPast()
		else return false
	}

	/* -----------------------------------------------------------------------------------------
	 *
	 *	INTERNAL
	 *
	 */
	var matchups = []
	var intervalId
	var events = []
	var pollCount
	var debugPathIndex = 0

	function addMatchupFor(_gameId) {
		console.log('LiveScoring.addMatchupFor() ' + _gameId)
		var _matchup = {
			gameId: _gameId,
			loader: null,
			liveScoringData: null,
			stateChanged: false,
			debugPaths: []
		}
		matchups.push(_matchup)
	}
	function getMatchupBy(_indexOrGameId) {
		if (_indexOrGameId === parseInt(_indexOrGameId) && parseInt(_indexOrGameId) < matchups.length) return matchups[_indexOrGameId]
		else {
			for (var i = 0; i < matchups.length; i++) {
				if (matchups[i].gameId == _indexOrGameId) return matchups[i]
			}
		}
		return null
	}
	function matchesChangedState() {
		for (var i = 0; i < matchups.length; i++) {
			if (matchups[i].stateChanged) return true
		}
		return false
	}

	function poll() {
		console.log('LiveScoring.poll()')
		pollCount = matchups.length
		for (var i = 0; i < matchups.length; i++) {
			var jsonPath = apiProxyUrl + matchups[i].gameId
			if (self.isDebugMode()) {
				if (matchups[i].debugPaths.length > debugPathIndex) jsonPath = matchups[i].debugPaths[debugPathIndex]
			}
			matchups[i].loader = new Loader(jsonPath, {
				name: 'liveScoringLoader_' + matchups[i].gameId,
				fileType: 'json',
				onComplete: handlePollComplete,
				onFail: handlePollFail,
				scope: self,
				cacheBuster: true
			})
			matchups[i].loader.load()
		}
	}
	function stopPolling() {
		console.log('LiveScoring.stopPolling()')
		clearInterval(intervalId)
	}

	function handlePollFail() {
		console.log('LiveScoring.handlePollFail()')
		dispatchEventCallBack(LiveScoringEvent.POLL_FAIL)
	}
	function handlePollComplete(loader) {
		var matchup = getMatchupBy(loader.name.split('_')[1])
		var rawData = loader.content[0].dataRaw
		// debug json data gets written to the head as an object-literal because it's the only way to load local json
		// Therefore, to avoid error, the json must be valid JS, so it is set to a var, which must be removed to parse as valid JSON
		if (typeof rawData != 'string') rawData = JSON.stringify(rawData)
		rawData = JSON.parse(rawData.replace(/^[^\{]+/, ''))
		var liveScoringData = new LiveScoringData(rawData)

		// determine if status has changed
		matchup.stateChanged = false
		if (!matchup.liveScoringData) {
			matchup.stateChanged = true
		} else if (matchup.liveScoringData.getStatus().state !== liveScoringData.getStatus().state) {
			console.log(
				'    matchup.liveScoringData has changed from "' +
					matchup.liveScoringData.getStatus().state +
					'" to "' +
					liveScoringData.getStatus().state +
					'"'
			)
			matchup.stateChanged = true
		}
		matchup.liveScoringData = liveScoringData

		pollCount--
		if (pollCount == 0) handleAllLoadScoresComplete()
	}
	function handleAllLoadScoresComplete() {
		console.log('LiveScoring.handleAllLoadScoresComplete()')
		if (self.allMatchesArePast()) {
			if (self.isDebugMode()) incrementDebugIndex()
			handleAllMatchesComplete()
		} else if (matchesChangedState()) {
			dispatchEventCallBack(LiveScoringEvent.MATCH_STATUS_CHANGE)
		} else if (self.areLiveMatches()) dispatchEventCallBack(LiveScoringEvent.MATCH_UPDATE)
	}
	function handleAllMatchesComplete() {
		console.log('LiveScoring.handleAllMatchesComplete()')
		if (!self.isDebugMode()) {
			self.cleanup()
			AdManager.completeCallback = Control.prepareLiveScoring
			AdManager.getNextAdData()
		}
	}

	// this simulates the advance of <AdManager>'s <AdData> to the next non-expired event.
	function incrementDebugIndex() {
		console.log('LiveScoring.incrementDebugIndex()')
		var hasDebugPathes = true
		for (var i = 0; i < matchups.length; i++) {
			if (debugPathIndex >= matchups[i].debugPaths.length - 1) {
				hasDebugPathes = false
				break
			}
		}
		if (hasDebugPathes) {
			console.log(' - ADVANCING TO NEXT SET OF DEBUG JSON - this simulates a loading a new AdData with new gameIds')
			debugPathIndex++
			poll()
		} else {
			console.log(' - NO MORE DEBUG JSON - ending LiveScoring')
			stopPolling()
			dispatchEventCallBack(LiveScoringEvent.MATCH_STATUS_CHANGE)
		}
	}

	function dispatchEventCallBack(_type) {
		for (var i = 0; i < events.length; i++) {
			if (events[i].type == _type) {
				events[i].callback()
			}
		}
	}
}

/**
	@class LiveScoringEvent
	@desc
		The constants used by {@link LiveScoring}
*/
var LiveScoringEvent = new function() {
	return {
		MATCH_UPDATE: 'event_matchUpdate',
		MATCH_STATUS_CHANGE: 'event_matchStatusChange',
		POLL_FAIL: 'event_pollFail'
	}
}()

export default LiveScoring
