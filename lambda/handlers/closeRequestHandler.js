const Images = require('../utils/images');
const Strings = require('../utils/strings');
const Commons = require('../utils/commons');
const GameOn = require('../utils/gameOn');


const CloseRequestHandler = {
    canHandle(handlerInput) {
     
      return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent' ||
      handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent') ||
      (handlerInput.requestEnvelope.request.type === 'Alexa.Presentation.APL.UserEvent' &&
       handlerInput.requestEnvelope.request.arguments[0] === 'cancel');
      
    },
    async handle(handlerInput) {
      const speechOutput = Strings.CLOSE;
      let aplData = null;
      let aplTemplate = require('../templates/closeTemplate.json');
      this.handlerInput = handlerInput;
      let attributes = this.getSessionAttributesManager;
      let playerScore = await GameOn.getPlayerScore(attributes.player)
      if(playerScore.score < attributes.score){
        await GameOn.submitScore(attributes.player,attributes.score)
      }
      playerScore = await GameOn.getPlayerScore(attributes.player)
      attributes.playedTimes = attributes.playedTimes+1;
      attributes.mode = null;
      this.savePersistentAttributes(attributes);

      if(Commons.supportsAPL(handlerInput)) {
        return handlerInput.responseBuilder
            .speak(speechOutput)
            .addDirective({
                type:'Alexa.Presentation.APL.RenderDocument',
                version:'1.0',
                datasources:aplData,
                document: aplTemplate,
            })
            .withShouldEndSession(true)
            .getResponse();
      }
      return handlerInput.responseBuilder
            .speak(speechOutput)
            .withShouldEndSession(true)
            .getResponse();
    }
  };
  
  module.exports = CloseRequestHandler;