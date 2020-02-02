'use strict';

const strings = {
    PERMISSIONS: ['alexa::profile:name:read', 'alexa::profile:email:read', 'alexa::profile:mobile_number:read'],
    NOTIFY_MISSING_PERMISSIONS: 'Please enable Customer Profile permissions in the Amazon Alexa app. ',
    NAME_MISSING: 'You can set your name either in the Alexa app under calling and messaging, or you can set it at Amazon.com, under log-in and security. ',
    EMAIL_MISSING: 'You can set your email at Amazon.com, under log-in and security. ',
    NUMBER_MISSING: 'You can set your phone number at Amazon.com, under log-in and security. ',
    ERROR: 'Uh Oh. Looks like something went wrong. Please try again later ',
    CLOSE: 'Thank you for playing the game. Have a great day. GoodBye. ',

    DISPLAY : {
        CLOSE: '',
    }
};

module.exports =  Object.freeze(strings);