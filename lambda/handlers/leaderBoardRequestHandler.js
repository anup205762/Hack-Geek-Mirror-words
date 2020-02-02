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

const LeaderBoardRequestHandler = {
  canHandle(handlerInput) {
    console.log("----LEADER BOARD REQUEST HANDLER----")
    if(handlerInput.requestEnvelope.request.type === 'Alexa.Presentation.APL.UserEvent'){
      return (handlerInput.requestEnvelope.request.type === 'Alexa.Presentation.APL.UserEvent' &&
              handlerInput.requestEnvelope.request.arguments[1] === 'leader board');
    }
      return handlerInput.requestEnvelope.request.type === 'IntentRequest' && 
           handlerInput.requestEnvelope.request.intent.name === 'LeaderBoardIntent'
    
  },
  async handle(handlerInput) {
    this.handlerInput = handlerInput;
    let attributes = this.getSessionAttributesManager;
    let player = null;
    let speechOutput = null;
    let reprompt = null;
    if(Object.keys(attributes).length === 0){
      attributes = await this.getPersistentAttributesManager
      if(Object.keys(attributes).length === 0){
        speechOutput = "You have not started the game, Please say start to start the game"
        return handlerInput.responseBuilder
              .speak(speechOutput)
              .reprompt(reprompt)
              .getResponse();
      }
      if(attributes.player === null || attributes.player === undefined){
            speechOutput = "You have not started the game, Please say start to start the game"
            return handlerInput.responseBuilder
                  .speak(speechOutput)
                  .reprompt(reprompt)
                  .getResponse();
      } else {
            player = await GameOn.refreshPlayerSession(attributes.player);
      }
      attributes.player = player;
      this.setPersistentAttributes(attributes);
      await this.savePersistentAttributes();
    }
    if(attributes.skillMode === 'getanswer'){
      const askedQustionJSON = QUESTIONS[attributes.questionType][attributes.questionID];
      let slotEntities = await Commons.dynamicValueUpdate(askedQustionJSON.options)
      let aplData = null;
      let aplTemplate = require('../templates/commingSoonTemplate.json');
      speechOutput = 'Please complete the given question to see the leaderboard <break time="2s"/> '+"Here is your question, "+ askedQustionJSON.question +", option 1 is "+AddColon(askedQustionJSON.options[0][0])+", option 2 is "+AddColon(askedQustionJSON.options[1][0])+", option 3 is "+AddColon(askedQustionJSON.options[2][0]);     
      this.setSessionAttributes(attributes);
      if(Commons.supportsAPL(handlerInput)) {
        aplTemplate = require('../templates/questionsTemplate.json')
        aplData = {
          "container":{
              "question": askedQustionJSON.question,
              "option_1": askedQustionJSON.options[0][0],
              "option_2": askedQustionJSON.options[1][0],
              "option_3": askedQustionJSON.options[2][0],
              "questionNo" : "ǭ: "+questionAskedIds.length,
              "score" : "⭐: "+attributes.score
          }
        }
        return handlerInput.responseBuilder
            .speak(speechOutput)
            .reprompt(reprompt)
            .addDirective(slotEntities)
            .addDirective({
                type:'Alexa.Presentation.APL.RenderDocument',
                version:'1.0',
                datasources:aplData,
                document: aplTemplate,
            })
            .getResponse();
        }
        return responseBuilder
            .speak(speechOutput)
            .reprompt(reprompt)
            .addDirective(slotEntities)
            .getResponse();
    }
    let leaderboardDirective = null;    
    let playerScore = null;
    
    leaderboardDirective = await GameOn.getLeaderboard( attributes.player,attributes.name);
    playerScore = await GameOn.getPlayerScore( attributes.player );
    speechOutput = `Your current rank is <break time=".1s"/> ${playerScore.rank}. To continue playing , just say Alexa, and then say play.`;
    reprompt = speechOutput;
    if(Commons.supportsAPL(handlerInput)) {
      return handlerInput.responseBuilder
      .speak(speechOutput)
      .reprompt(reprompt)
      .addDirective(leaderboardDirective)
      .getResponse();      
    }
    return handlerInput.responseBuilder
      .speak(speechOutput)
      .reprompt(reprompt)
      .getResponse();
  },
};

module.exports = LeaderBoardRequestHandler;
