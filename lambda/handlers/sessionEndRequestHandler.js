const Commons = require('../utils/commons');
const GameOn = require('../utils/gameOn')

const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
      return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
    },
   async handle(handlerInput) {
      console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);
      console.log("Error in request "  + JSON.stringify(handlerInput.requestEnvelope.request));
      this.handlerInput = handlerInput;
      let attributes = Commons.getUserAttributes(this);
      let playerScore = await GameOn.getPlayerScore(attributes.player)
      if(playerScore.score < attributes.score){
            await GameOn.submitScore(attributes.player,attributes.score)
          }
      playerScore = await GameOn.getPlayerScore(attributes.player)
      attributes.playedTimes = attributes.playedTimes+1;
      attributes.mode = null;
      this.savePersistentAttributes(attributes);

      return handlerInput.responseBuilder.getResponse();
    }
  };
  
  module.exports = SessionEndedRequestHandler;