const sdk = require('@alexa-games/skills-gameon-sdk');
const settings = require('./gameOnSettings.js');
const defaultClient = new sdk.SkillsGameOnApiClient();

async function generatorFunction (name){ 
    return sdk.PlayerProfileGeneratorBuilder.getGenerator({
        locale: 'en-US',
        avatarBaseUrl: settings.gameAvatarBaseUrl,
        numberOfUniqueAvatars: settings.numberOfUniqueAvatars,
        name:[name]
    });
}

async function newPlayer(name, client = defaultClient) {
    const generator = await generatorFunction(name)
    let alexaPlayer = await client.initializeNewAugmentedPlayer({
        gameApiKey: settings.gameOnApiKey,
        appBuildType: settings.appBuildType,
        playerProfileGenerator: generator
    });
    const tournamentId = settings.tournamentId
    await client.enterTournamentForPlayer({
        tournamentId: tournamentId,
        player: alexaPlayer
    });
    return alexaPlayer;
}

async function lookupPlayerProfile(externalPlayerId,name) {
    const generator = await generatorFunction(name)
    const profile = generator.getPlayerProfileFromId(externalPlayerId);
    return profile;
}

async function enterMatch(alexaPlayer, client = defaultClient) {
    const matchId = settings.matchId 
    return await client.enterMatchForPlayer({
        matchId: matchId,
        player: alexaPlayer
    });
}

async function submitScore(alexaPlayer, score,client = defaultClient) {
    const matchId = settings.matchId
    await client.submitScoreForPlayer({
        matchId: matchId,
        submitScoreRequest: { score },
        player: alexaPlayer,
        ensureMatchEntered: true
    });
    return alexaPlayer;
}

async function getPlayerScore(alexaPlayer, client = defaultClient) {
    const matchId = settings.matchId 
    return await client.getPlayerScore(
        matchId,
        alexaPlayer);
}

async function refreshPlayerSession(alexaPlayer, client = defaultClient) {
    alexaPlayer = await client.refreshPlayerSession({
        gameApiKey: settings.gameOnApiKey,
        appBuildType: settings.appBuildType,
        player: alexaPlayer
    });
    return alexaPlayer;
}

async function getLeaderboard(alexaPlayer, name,  client = defaultClient) {
    const matchId = settings.matchId
    const leaderboard = await client.getCombinationLeaderboards({
        matchId: matchId,
        topScoresLimit: settings.topNleaderboardItemCount,
        playerNeighborsLimit: settings.playerNeighborsCount,
        player: alexaPlayer
    });
    const currentScore = await client.getPlayerScore(
        matchId,
        alexaPlayer);
    alexaPlayer.score.ordinalRank = currentScore.ordinalRank;
    alexaPlayer.score.rank = currentScore.rank;
    alexaPlayer.score.score = currentScore.score;
    const renderOptions = { 
        backgroundImageUrl: settings.leaderboardBackgroundImageUrl ,
        trophyUrl: settings.trophyUrl, 
        logoImageUrl: settings.logoImageUrl,
    };
    const generator = await generatorFunction(name)
    return sdk.renderLeaderboard(alexaPlayer, leaderboard, renderOptions, generator);
}
module.exports = {
    newPlayer,
    lookupPlayerProfile,
    submitScore,
    getPlayerScore,
    enterMatch,
    getLeaderboard,
    refreshPlayerSession
};