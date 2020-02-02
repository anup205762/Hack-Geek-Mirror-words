const LaunchRequestHandler = require('./launchRequestHandler');
const PlayGameRequestHandler = require('./playGameRequestHandler');
const LeaderBoardRequestHandler = require('./leaderBoardRequestHandler');
const RulesRequestHandler = require('./rulesRequestHandler');
const SessionEndedRequestHandler = require('./sessionEndRequestHandler');
const CloseRequestHandler = require('./closeRequestHandler');
const FallBackRequestHandler = require('./fallBackRequestHandler')
const HelpRequestHandler = require('./helpRequestHandler')

module.exports = {
	LaunchRequestHandler,
	LeaderBoardRequestHandler,
	PlayGameRequestHandler,
	RulesRequestHandler,
	HelpRequestHandler,
	FallBackRequestHandler,
	SessionEndedRequestHandler,
	CloseRequestHandler
};
