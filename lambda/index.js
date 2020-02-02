const Alexa = require('ask-sdk-core');
const Strings = require('./utils/strings');
const Commons = require('./utils/commons');
const Images = require('./utils/images');
const GameOn = require('./utils/gameOn');

const {DynamoDbPersistenceAdapter} = require('ask-sdk-dynamodb-persistence-adapter');
const persistenceAdapter = new DynamoDbPersistenceAdapter({
  tableName: 'Reverse-words-quiz',
  createTable: true,
});

const {
  LaunchRequestHandler,
  LeaderBoardRequestHandler,
  PlayGameRequestHandler,
  RulesRequestHandler,
  HelpRequestHandler,
  FallBackRequestHandler,
  SessionEndedRequestHandler,
  CloseRequestHandler
} = require('./handlers');

const RequestLog = {
    process(handlerInput) {
      console.log(`REQUEST:\n ${JSON.stringify(handlerInput.requestEnvelope)}`);
      return;
    }
};

const ResponseLog = {
  process(handlerInput) {
    console.log(`RESPONSE:\n ${JSON.stringify(handlerInput.responseBuilder.getResponse())}`);
  },
};


const ErrorHandler = {
  canHandle() {
    return true;
  },
  async handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);
    if (error.name === 'MissingName' || error.name === 'MissingEmail' || error.name === 'MissingPermissions') {
      return handlerInput.responseBuilder
        .speak(error.message)
        .withAskForPermissionsConsentCard(Strings.PERMISSIONS)
        .getResponse();
    }
    //need to remove
    if (error.statusCode === 403) {
      return handlerInput.responseBuilder
        .speak(Strings.NOTIFY_MISSING_PERMISSIONS)
        .withAskForPermissionsConsentCard(Strings.PERMISSIONS)
        .getResponse();
    }
    let speechOutput = Strings.ERROR;
    let reprompt  = speechOutput
    let aplData = {
      "containor":{
          "body" : " Please try again later ! !",
      }
    };
    let aplTemplate =  require('./templates/messageTemplate.json');    
    if(Commons.supportsAPL(handlerInput)) {
      return handlerInput.responseBuilder
          .speak(speechOutput)
          .reprompt(reprompt)
          .addDirective({
              type:'Alexa.Presentation.APL.RenderDocument',
              version:'1.0',
              datasources:aplData,
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

let EventHandlerInput = {
  get requestType() {
    return this.request.type;
  },
  get intent() {
    return this.request.intent || {};
  },
  get slots() {
    return this.intent.slots;
  },
  get intentName() {
    return this.intent.name;
  },
  get input() {
    return this.handlerInput || {};
  },
  get envelope() {
    return this.handlerInput.requestEnvelope || {};
  },
  get request() {
    return this.envelope.request || {};
  },
  get getSessionAttributesManager() {
    return this.handlerInput.attributesManager.getSessionAttributes() || {};
  },
  get getPersistentAttributesManager() {
    return this.input.attributesManager.getPersistentAttributes() || {};
  },
  setSessionAttributes: async function setSessionAttributesManager(attributes) {
    await this.input.attributesManager.setSessionAttributes(attributes);
  },
  setPersistentAttributes: async function setPersistentAttributesManager(player) {
    await this.input.attributesManager.setPersistentAttributes(player);
  },
  savePersistentAttributes: async function setPersistentAttributesManager() {
    await this.input.attributesManager.savePersistentAttributes();
  }
};

Object.setPrototypeOf(LaunchRequestHandler, EventHandlerInput);
Object.setPrototypeOf(LeaderBoardRequestHandler, EventHandlerInput);
Object.setPrototypeOf(PlayGameRequestHandler, EventHandlerInput);
Object.setPrototypeOf(RulesRequestHandler, EventHandlerInput);
Object.setPrototypeOf(HelpRequestHandler, EventHandlerInput);
Object.setPrototypeOf(FallBackRequestHandler, EventHandlerInput)
Object.setPrototypeOf(SessionEndedRequestHandler,EventHandlerInput);
Object.setPrototypeOf(CloseRequestHandler, EventHandlerInput);

exports.handler = Alexa.SkillBuilders.custom()
  .withPersistenceAdapter(persistenceAdapter)
  .addRequestHandlers(
    LaunchRequestHandler,
    LeaderBoardRequestHandler,
    PlayGameRequestHandler,
    RulesRequestHandler,
    HelpRequestHandler,
    FallBackRequestHandler,
    SessionEndedRequestHandler,
	  CloseRequestHandler
  )
  .withApiClient(new Alexa.DefaultApiClient())
  .withCustomUserAgent('cookbook/customer-profile/v1')
  .addErrorHandlers(ErrorHandler)
  .addRequestInterceptors(RequestLog)
  .addResponseInterceptors(ResponseLog)
  .lambda();