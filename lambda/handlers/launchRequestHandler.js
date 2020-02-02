const Images = require('../utils/images');
const Strings = require('../utils/strings');
const Commons = require('../utils/commons');
const GameOn = require('../utils/gameOn');

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    console.log("----LAUNCH REQUEST HANDLER----")
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  async handle(handlerInput) {
    const { responseBuilder } = handlerInput;
    this.handlerInput = handlerInput;
    let attributes = this.getSessionAttributesManager;
    let speechOutput = null;
    let reprompt = null;
    let aplData =  null
    if(Object.keys(attributes).length === 0){
        attributes = await this.getPersistentAttributesManager
        console.log(attributes)
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
              attributes.playedTimes = 0;
              attributes.email = email;
              attributes.name = name;
              speechOutput = 'Welcome '+attributes.name +', to Mirror Words. <audio src="soundbank://soundlibrary/video_tunes/video_tunes_10"/> Rules are very simple. You need to identify the Animal\'s correct spelling which would be spelled in reverse order. ';
          } catch (error) {
              throw error;
          }
        }else{
          speechOutput = 'Welcome back '+attributes.name +', to Mirror Words. <audio src="soundbank://soundlibrary/video_tunes/video_tunes_10"/> Rules seems too easy but not the game. ';
        }
        console.log(attributes)
        let player = attributes.player;
        if(player === null || player === undefined){
           player = await GameOn.newPlayer(attributes.name);
           await GameOn.submitScore(player, 0);
            aplData = {
              "container":{
                  "name": attributes.name,
                  "score" : "Rules are very simple",
                  "played": "You need to identify the Animal's correct spelling which would be spelled in reverse order.",
                  "rank" : "",
                  "welcome" : "Welcome",
                  "allignment" : "16%"
                }
              }
              speechOutput = speechOutput+" To get started, say 'Play' to start the game'"
          } else {
            player = await GameOn.refreshPlayerSession(player);
            const playerScore = await GameOn.getPlayerScore(player)
            // speechOutput = speechOutput + 'You have played '+attributes.playedTimes+' times and your rank is '+playerScore.rank+' with '+playerScore.score+' points , Can you beat yourself ?, To start the quiz say play'
            speechOutput = speechOutput + 'You have played '+attributes.playedTimes+' times with highest score of '+playerScore.score+',  <break time="1s"/> Can you beat yourself?  To get started, say "Play" to start the game'
            aplData = {
                "container":{
                    "name": attributes.name,
                    "score" : "Highest 🌟 - "+playerScore.score,
                    "played": "Played  🎌 - "+attributes.playedTimes,
                    "rank" : "Rank   🏆 - "+playerScore.rank,
                    "welcome": "Welcome Back",
                    "allignment" : "32%"
                  }
              }
          }
        attributes.player = player;
        this.setPersistentAttributes(attributes);
        await this.savePersistentAttributes();       
    }
    attributes.questionAskedIds = [];
    attributes.score = 0;
    attributes.skillMode = "launch";
    attributes.questionType = 3;
    attributes.questionID = null;   
    this.setSessionAttributes(attributes);
    if(Commons.supportsAPL(handlerInput)) {
      aplTemplate = require('../templates/launchRequestTemplate.json')
      return responseBuilder
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
    return responseBuilder
            .speak(speechOutput)
            .reprompt(reprompt)
            .getResponse();
  },
};

module.exports = LaunchRequestHandler;


