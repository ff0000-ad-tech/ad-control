/**
	@class LiveScoringData
	@param {object} liveScoringDataRaw	
		raw, live-data json object
	@desc
		<a href="https://github.com/ff0000-ad-tech/ad-control">Github repo</a>
		<br><br>
		
		This class is instantiated dynamically by {@link LiveScoring}.
*/
var LiveScoringData = function(liveScoringDataRaw) {
	this.liveScoringDataRaw = liveScoringDataRaw

	/* -- JSON GETTERS ----------------------------------------------------------
		 *
		 *
		 */
	this.getCompetition = function() {
		return this.liveScoringDataRaw.sports[0].leagues[0].events[0].competitions[0]
	}
	this.getStatus = function() {
		return this.getCompetition().status
	}
	this.getPeriod = function() {
		return this.getCompetition().period
	}
	this.getClock = function() {
		return this.getCompetition().clock
	}
	this.getAwayTeam = function() {
		var awayIndex = this.getCompetition().competitors[0].homeAway == 'away' ? 0 : 1
		return this.getCompetition().competitors[awayIndex]
	}
	this.getHomeTeam = function() {
		var homeIndex = this.getCompetition().competitors[0].homeAway == 'home' ? 0 : 1
		return this.getCompetition().competitors[homeIndex]
	}

	/* -- CORE LOGIC ----------------------------------------------------------
		 *
		 *
		 */
	this.getIsUpcoming = function() {
		return this.getStatus().state.indexOf('pre') > -1
	}
	this.getIsLive = function() {
		return this.getStatus().state.indexOf('in') > -1
	}
	this.getIsOvertime = function() {
		return this.getStatus().description.indexOf('OVERTIME') > -1
	}
	this.getIsPast = function() {
		return this.getStatus().state.indexOf('post') > -1
	}

	/* -- MATCHUP DATA ----------------------------------------------------------
		 *
		 *
		 */
	this.tuneInMessaging = function() {
		if (this.isCloseGame()) return "<span id='close_game'>CLOSE GAME:</span> WATCH LIVE NOW"
		else return 'WATCH LIVE NOW'
	}

	this.getScoreAway = function() {
		return this.getAwayTeam().score
	}
	this.getScoreHome = function() {
		return this.getHomeTeam().score
	}
	this.isCloseGame = function() {
		if (this.getPeriod() >= 4) {
			if (Math.abs(this.getScoreHome() - this.getScoreAway()) <= 10) return true
		} else return false
	}

	this.getGamePeriodAndTime = function() {
		var period = this.getPeriodLabel()
		var clock = this.getClock()
		if (clock == '0:00') return 'END OF ' + period
		else return period + ' ' + clock
	}
	this.getPeriodLabel = function() {
		var periodLabels = ['1ST', '2ND', '3RD', '4TH', 'OT', 'OT2', 'OT3']
		return periodLabels[this.getPeriod() - 1]
	}
}

export default LiveScoringData
