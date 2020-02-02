const Commons = require('../utils/commons');

const HelpRequestHandler = {
  canHandle(handlerInput) {
    console.log("----HELP REQUEST HANDLER----")
    if(handlerInput.requestEnvelope.request.type === 'Alexa.Presentation.APL.UserEvent' ){
      return (handlerInput.requestEnvelope.request.type === 'Alexa.Presentation.APL.UserEvent' &&
           handlerInput.requestEnvelope.request.arguments[0] === 'rules');
    }
    return handlerInput.requestEnvelope.request.type === 'IntentRequest' && 
           handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent'   
       
  },
  async handle(handlerInput) {
    const { responseBuilder } = handlerInput;
    this.handlerInput = handlerInput;
    let attributes = this.getSessionAttributesManager;
    let speechOutput = null;
    let reprompt = null;
    let aplData = null;
    let aplTemplate = null;
    if(attributes.skillMode === 'getanswer'){
      const askedQustionJSON = QUESTIONS[attributes.questionType][attributes.questionID];
      let slotEntities = await Commons.dynamicValueUpdate(askedQustionJSON.options)
      let aplData = null;
      speechOutput = 'You need to identify the '+ "Animal's"+' correct spelling which would be spelled in reverse order <break time="1s"/> Please complete the given question <break time="1s"/> '+ askedQustionJSON.question +", option 1 is "+AddColon(askedQustionJSON.options[0][0])+", option 2 is "+AddColon(askedQustionJSON.options[1][0])+", option 3 is "+AddColon(askedQustionJSON.options[2][0]);     
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
              "score" : "⭐: "+attributes.score,
              "delay" : 14000
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
    speechOutput = 'I will help you, To continue playing , just say Alexa, and then say play <break time="1s"/> For Rules just say Alexa, and then say rules'
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
  },
};
module.exports = HelpRequestHandler;
