const QUESTIONS = require('../quiz_questions/question')

function AddColon (words) {
    let output = ''
    for(i = 0, len = words.length; i < len; i ++) {
        output = (i === (words.length-1)) ? (output + words[i]) : (output + words[i]+'.')
     }
     return output;
}

module.exports = {
    supportsAPL: (handlerInput) => {
        const supportedInterfaces = handlerInput.requestEnvelope.context.System.device.supportedInterfaces;
        const aplInterface = supportedInterfaces['Alexa.Presentation.APL'];
        return aplInterface != null && aplInterface != undefined;
    },
    getUserAttributes: async() => {
        
    },
    createNewUser : async () => {
        
    },
    generatedRandomQuestion : async (questionAskedIds,questionType) => {
        let generatedRandomOutput = {}
        let questionBank = QUESTIONS[questionType];
        questionAskedIds.forEach((item) => {
            if (questionBank[item])
            {
                delete questionBank[item];
            }
        })
        if(Object.keys(questionBank).length === 0){
            questionType++;
            questionBank = QUESTIONS[questionType]
        }
        const obj_keys = Object.keys(questionBank)
        var ran_key = obj_keys[Math.floor(Math.random() *obj_keys.length)];
        questionAskedIds.push(ran_key)
        generatedRandomOutput.questionID = ran_key
        generatedRandomOutput.randomQuestion = questionBank[ran_key]
        generatedRandomOutput.questionAskedIds = questionAskedIds
        generatedRandomOutput.questionType = questionType
        return generatedRandomOutput;
    },

    dynamicValueUpdate : async (data) => {
        let optionSlotValues = 
            [
                {
                    "id": "1",
                    "name": {
                        "value": "option 1",
                        "synonyms":[AddColon(data[0][0]),'first','1st','1st option','first option','first one','choose first','one','option one']
                    }
                },
                {
                    "id": "2",
                    "name": {
                        "value": "option 2",
                        "synonyms": [AddColon(data[1][0]),'second','2nd','2nd option','second option','second one','choose second','two','option two'],
                    }
                },
                {
                    "id": "3",
                    "name": {
                        "value": "option 3",
                        "synonyms": [AddColon(data[2][0]),'third','3rd','3rd option','third option','third one','choose third','three','option three'],
                    }
                }
            ]
        let optionEntities = {
            type: "Dialog.UpdateDynamicEntities",
            updateBehavior: "REPLACE",
            types: [
                {
                    name: "option",
                    values: optionSlotValues
                }
            ]
        }; 
        return optionEntities
    },
    getStaticAndDynamicSlotValues : async (slots) => {
        const slotValues = {}
        for (let slot in slots) {
            slotValues[slot] = await getStaticAndDynamicSlotValuesFromSlot(slots[slot]);
        }
        return slotValues;
    },
    getStaticAndDynamicSlotValuesFromSlot : async (slot) => {
        const result = {
            name: slot.name,
            value: slot.value
        };  
        if (((slot.resolutions || {}).resolutionsPerAuthority || [])[0] || {}) {
            slot.resolutions.resolutionsPerAuthority.forEach((authority) => {
                const slotValue = {
                    authority: authority.authority,
                    statusCode: authority.status.code,
                    synonym: slot.value || undefined,
                    resolvedValues: slot.value
                };
                if (authority.values && authority.values.length > 0) {
                    slotValue.resolvedValues = [];
                    
                    authority.values.forEach((value) => {
                        slotValue.resolvedValues.push(value);
                    });
                    
                }
                if (authority.authority.includes('amzn1.er-authority.echo-sdk.dynamic')) {
                    result.dynamic = slotValue;
                } else {
                    result.static = slotValue;
                }
            });
        }
        return result;
    }
};


