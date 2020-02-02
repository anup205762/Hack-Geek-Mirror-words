const COMMONS = require('../utils/commons');
const QUESTIONS = require('../quiz_questions/question')
const GameOn = require('../utils/gameOn')

function AddColon (words) {
  let output = ''
  for(i = 0, len = words.length; i < len; i ++) {
      output = (i === (words.length-1)) ? (output + words[i]) : (output + words[i]+'<break time="300ms"/>')
   }
   return output;
}

const PlayGameRequestHandler = {
  canHandle(handlerInput) {
    console.log("----PLAY GAME REQUEST HANDLER----")
    if(handlerInput.requestEnvelope.request.type === 'Alexa.Presentation.APL.UserEvent'){
      return (handlerInput.requestEnvelope.request.type === 'Alexa.Presentation.APL.UserEvent' &&
            handlerInput.requestEnvelope.request.arguments[0] === 'play' || handlerInput.requestEnvelope.request.arguments[0] === 'answer');
    }
      return handlerInput.requestEnvelope.request.type === 'IntentRequest' && 
           handlerInput.requestEnvelope.request.intent.name === 'PlayGameIntent' ||
           handlerInput.requestEnvelope.request.intent.name === 'AMAZON.ResumeIntent'
    
  },
  async handle(handlerInput) {
    console.log("APL INPUT")
    console.log(handlerInput.requestEnvelope.request.arguments)
    const { responseBuilder } = handlerInput;
    this.handlerInput = handlerInput;
    let attributes = this.getSessionAttributesManager;
    if(Object.keys(attributes).length === 0){
        attributes = await this.getPersistentAttributesManager;
        if(Object.keys(attributes).length === 0){
          const { requestEnvelope, serviceClientFactory } = handlerInput;
          let error = {
              message: Strings.NOTIFY_MISSING_PERMISSIONS,
              statusCode : 403,
              name: 'MissingPermissions'
          }
        
          const consentToken = requestEnvelope.context.System.apiAccessToken;
          if (!consentToken) {
              throw error;
          }
        
          try {
              let attributes = {};
              const client = serviceClientFactory.getUpsServiceClient();
              
              let name = await client.getProfileName();
              console.log('Successfully retrieved Name: ',name);
              if (name == null) {
                  error.message = Strings.NAME_MISSING;
                  error.name= 'MissingName';
                  throw error;
              } 
        
              let email = await client.getProfileEmail();
              console.log('Successfully retrieved Email: ',email);
              if (email == null) {
                  error.message = Strings.EMAIL_MISSING;
                  error.name= 'MissingEmail';
                  throw error;
              }         
              attributes.email = email;
              attributes.name = name;
              attributes.number = number;
              attributes.playedTimes = 0;
              this.setPersistentAttributes(attributes);
              await this.savePersistentAttributes();
              
          } catch (error) {
              throw error;
          }
        }
        let player = attributes.player;
        if(player === null || player === undefined){
          player = await GameOn.newPlayer(attributes.name);
          await GameOn.submitScore(player, 0);
        } else {
          player = await GameOn.refreshPlayerSession(player);
        }
        attributes.player = player;
        this.setPersistentAttributes(attributes);
        await this.savePersistentAttributes();
        attributes.questionAskedIds = [];
        attributes.score = 0;
        attributes.skillMode = "play";
        attributes.questionType = 3;
        attributes.questionID = null;
    }
    let speechOutput = '';
    let reprompt = '';
    let aplData =  null;
    let aplTemplate = require('../templates/commingSoonTemplate.json')

    if(attributes.skillMode === 'getanswer'){
        let optionId = null
        if(!handlerInput.requestEnvelope.request.intent.slots.value.resolutions){
          let playerScore = await GameOn.getPlayerScore(attributes.player)
          if(playerScore.score < attributes.score){
            await GameOn.submitScore(attributes.player,attributes.score)
          }
          playerScore = await GameOn.getPlayerScore(attributes.player)
          speechOutput = 'oops! Thats incorrect. <break time="1s"/>'+ 'You ranked is '+playerScore.rank+' with final score '+playerScore.score+'<break time="1s"/>  Please say, play to start again, or say stop to exit'
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
          if(COMMONS.supportsAPL(handlerInput)) {
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
        if(handlerInput.requestEnvelope.request.intent){
            const answerValue = await COMMONS.getStaticAndDynamicSlotValuesFromSlot(handlerInput.requestEnvelope.request.intent.slots.value)
            const slotType = (answerValue.static.statusCode === 'ER_SUCCESS_MATCH') ? 'static' : 'dynamic';
            if(slotType === 'dynamic'){
              optionId = answerValue.dynamic.resolvedValues[0].value.id;
              
            }else {
              optionId = answerValue.static.resolvedValues[0].value.id
            }
        }
        if(handlerInput.requestEnvelope.request.arguments){
          optionId = handlerInput.requestEnvelope.request.arguments[1]
        }
        const askedQustionJSON = QUESTIONS[attributes.questionType][attributes.questionID];
        const answer = askedQustionJSON.answer;
        if(!(optionId == answer)){
          let playerScore = await GameOn.getPlayerScore(attributes.player)
          if(playerScore.score < attributes.score){
            await GameOn.submitScore(attributes.player,attributes.score)
          }
          playerScore = await GameOn.getPlayerScore(attributes.player)
          speechOutput = 'oops! Thats incorrect. <break time="1s"/>'+ 'You ranked is '+playerScore.rank+' with final score '+playerScore.score+'<break time="1s"/>  Please say, play to start again, or say stop to exit '
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
          if(COMMONS.supportsAPL(handlerInput)) {
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
        attributes.score = attributes.score + 10
        speechOutput = '<audio src="soundbank://soundlibrary/explosions/fireballs/fireballs_01"/> Thats correct';
    }
  
    const {questionID , randomQuestion , questionAskedIds , questionType } = await COMMONS.generatedRandomQuestion(attributes.questionAskedIds,attributes.questionType) 
    attributes.questionID = questionID
    attributes.questionAskedIds = questionAskedIds
    attributes.questionType = questionType
    let slotEntities = await COMMONS.dynamicValueUpdate(randomQuestion.options)
    let questionNumber = null
    let delay = null;
    if(questionAskedIds.length === 1){
        delay = 4000
        questionNumber = 'first'
    }else{
        delay = 10000
        questionNumber = 'next'
    }  
    speechOutput = speechOutput + "<break time='500ms'/>Here is your "+questionNumber+" question: <break time='500ms'/> "+ randomQuestion.question +"<break time='300ms'/> option 1 <break time='300ms'/>"+ AddColon(randomQuestion.options[0][0])+"<break time='500ms'/> option 2 <break time='300ms'/>"+AddColon(randomQuestion.options[1][0])+"<break time='500ms'/> option 3 <break time='300ms'/>"+AddColon(randomQuestion.options[2][0]);     
    attributes.skillMode = 'getanswer'
    this.setSessionAttributes(attributes);
    if(COMMONS.supportsAPL(handlerInput)) {
      aplTemplate = require('../templates/questionsTemplate.json')
      aplData = {
        "container":{
            "question": randomQuestion.question,
            "option_1": randomQuestion.options[0][0],
            "option_2": randomQuestion.options[1][0],
            "option_3": randomQuestion.options[2][0],
            "questionNo" : "ǭ: "+questionAskedIds.length,
            "score" : "⭐: "+attributes.score,
            "delay": delay
        }
      }
      return responseBuilder
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
  },
};
module.exports = PlayGameRequestHandler;
