const Commons = require('../utils/commons');
const GameOn = require('../utils/gameOn');
const Strings = require('../utils/strings');
const QUESTIONS  = require('../quiz_questions/question')

function AddColon (words) {
  let output = ''
  for(i = 0, len = words.length; i < len; i ++) {
      output = (i === (words.length-1)) ? (output + words[i]) : (output + words[i]+'<break time="1s"/>')
   }
   return output;
}

const FallBackRequestHandler = {
    canHandle(handlerInput) {
      return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.FallbackIntent')
    },
  
    async handle(handlerInput) {
        const { responseBuilder } = handlerInput;
        this.handlerInput = handlerInput;
        const attributes = this.getSessionAttributesManager;
        let speechOutput = null;
        let reprompt = null;

        if(attributes.skillMode === 'getanswer'){
          let playerScore = await GameOn.getPlayerScore(attributes.player)
          if(playerScore.score < attributes.score){
            await GameOn.submitScore(attributes.player,attributes.score)
          }
          playerScore = await GameOn.getPlayerScore(attributes.player)
          speechOutput = 'oops! Thats incorrect. <break time="1s"/>'+ 'You ranked is '+playerScore.rank+' with final score '+playerScore.score+'<break time=1s"/>  Please say, play to start again, or say stop to exit'
          leaderboardDirective = await GameOn.getLeaderboard(attributes.player,attributes.name);
          attributes.questionAskedIds = [];
          attributes.score = 0;
          attributes.skillMode = "play";
          attributes.questionType = 3;
          attributes.questionID = null;
          attributes.playedTimes = attributes.playedTimes+1;
          this.setPersistentAttributes(attributes);
          await this.savePersistentAttributes(); 
          this.setSessionAttributes(attributes);
          if(Commons.supportsAPL(handlerInput)) {
            return responseBuilder
                .speak(speechOutput)
                .reprompt(reprompt)
                .addDirective(leaderboardDirective)
                .getResponse();
            }
            return responseBuilder
                .speak(speechOutput)
                .reprompt(reprompt)
                .getResponse();
        }


      speechOutput = 'Sorry i didnt get that, just say Alexa, and then say play <break time="1s"/> For Rules just say Alexa, and then say rules'
      reprompt = speechOutput;
      aplData = {
            "containor":{
                "body" : "To continue playing , just say Alexa, and then say play  For Rules just say Alexa, and then say rules ",
                "header" : "HELP"
            }
        };
      aplTemplate = require('../templates/helpTemplate.json');  
      if(Commons.supportsAPL(handlerInput)) {
        return handlerInput.responseBuilder
            .speak(speechOutput)
            .reprompt(reprompt)
            .addDirective({
                type:'Alexa.Presentation.APL.RenderDocument',
                version:'1.0',
                datasources: aplData,
                document: aplTemplate,
            })
            .getResponse();
      }
      return handlerInput.responseBuilder
          .speak(speechOutput)
          .reprompt(reprompt)
          .getResponse();
  }
}
  
module.exports = FallBackRequestHandler;