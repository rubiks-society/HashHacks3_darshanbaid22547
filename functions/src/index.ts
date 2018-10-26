import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as i18n from '@sfeir/actions-on-google-i18n'

import { dialogflow, Suggestions, BasicCard, Image, DialogflowConversation } from 'actions-on-google';
admin.initializeApp();

const app = dialogflow({
    debug: true
});
i18n.use(app);

const CANT_SAY  = "-1";
const questions = {
    "q1": {
        "question-type": "image",
        "image-source": "https://www.colour-blindness.com/CBTests/ishihara/Plate1.gif",
        "plate-code": 1,
        "choices": ["12","24","CANT_SAY"],
        "scores": {
            "12": {
                "creepy": 0,
                "red-green": 0,
                "total": 0,
                "normal": 0
            },
            "default" : {
                "creepy": 0.5,
            }
        }
    },
    "q2": {
        "question-type": "image",
        "image-source": "https://www.colour-blindness.com/CBTests/ishihara/Plate2.gif",
        "plate-code": 2,
        "choices": ["8","3","CANT_SAY"],
        "scores": {
            "8": {
                "normal": 0.2
            },
            "3": {
                "red-green": 0.2,
                "total": 0.1,
                "normal": -0.1
            },
            CANT_SAY: {
                "total": 0.2,
                "normal": -0.1
            },
            "default" : {
                "creepy": 0.1,
            }
        }
    },
    "q3": {
        "question-type": "image",
        "image-source": "https://www.colour-blindness.com/CBTests/ishihara/Plate8.gif",
        "plate-code": 8,
        "choices": [6,9,3,CANT_SAY],
        "scores": {
            "6": {
                "normal": 0.2
            },
            CANT_SAY: {
                "total": 0.2,
                "red-green": 0.2,
                "normal": -0.1
            },
            "default" : {
                "total": 0.1,
                "red-green": 0.1
            }
        }
    },
    "q4": {
        "question-type": "image",
        "image-source": "https://www.colour-blindness.com/CBTests/ishihara/Plate2.gif",
        "plate-code": 2,
        "choices": [8,3,CANT_SAY],
        "scores": {
            "8": {
                "normal": 0.2
            },
            "3": {
                "red-green": 0.2,
                "total": 0.1,
                "normal": -0.1
            },
            CANT_SAY: {
                "total": 0.2,
                "normal": -0.1
            },
            "default" : {
                "creepy": 0.1,
            }
        }
    },
}

function randomChoice(s: string,conv, ex?: object) {
    const total = +conv.__(s+"-total");
    const ex2 = ex !== undefined ? ex : {};
    const disp = Math.floor(Math.random() * (+total - +1)) + +1;
    return conv.__(`${s}-${disp}`,ex2);
}

function askImage(q: string, conv) {
    conv.ask(new BasicCard({
        image: new Image({
            url: questions[q]['image-source'],
            alt: conv.__('img-alt'),          
        }),
    }), new Suggestions(questions[q]['choices']));
}
function askQuestion(conv) {
    // First check if it is the first question
    if (conv.user.storage['quiz']['last_question'] === undefined) {
        // It is the first question
        conv.contexts.set('image_question',5);
        conv.user.storage['quiz']['last_question'] = 'q1';
        conv.user.storage['quiz']['last_question_type'] = 'image';
        conv.user.storage['quiz']['score'] = {
            "creepy": 0,
            "red-green": 0,
            "total": 0
        };
        conv.user.storage['quiz']['total_questions'] = 1;
        conv.ask(randomChoice("WHATS_THIS_IMAGE", conv));
        askImage('q1',conv);
        
    }
}

function tellAnswer(conv, answer?) {
    const q = questions[conv.user.storage['quiz']['last_question']];
    let scores = {};
    if (q['question-type'] === 'image') {
        if (q['scores'][`${answer}`] !== undefined) {
            // such an answer exist
            scores = q['scores'][`${answer}`];

        } else {
            // default
            scores = q['scores']['default'];
        }
        conv.user.storage['quiz']['scores']['creepy'] += (scores['creepy'] | 0);
        conv.user.storage['quiz']['scores']['red-green'] += (scores['red-green'] | 0);
        conv.user.storage['quiz']['scores']['total'] += (scores['total'] | 0);
    }
    console.log(conv.user.storage['quiz']);
    if (conv.user.storage['quiz']['scores']['creepy'] > 0.5) {
        // The user is joking, lets end.
        conv.close(randomChoice("JOKE_ANYONE",conv),randomChoice("JOKE_BYE",conv));
        return;
    } else if (conv.user.storage['quiz']['scores']['red-green'] > 0.7) {
        // The user probably has red-green color blindness
        conv.close(randomChoice("YOU_HAVE_RED_GREEN", conv));
    } else if (conv.user.storage['quiz']['scores']['total'] > 0.7) {
        // The user probably has total color blindnesss
        conv.close(randomChoice("YOU_HAVE_TOTAL", conv));
    } else if (conv.user.storage['quiz']['scores']['normal'] > 0.7) {
        // The user probably is normal
        conv.close(randomChoice("YOU_ARE_NORMAL", conv));
    } else if (conv.user.storage['quiz']['red-green'] > conv.user.storage['quiz']['total']) {
        // Probablity of having red-green, so we'll ask a more specific question
        conv.contexts.set('image_question',5);
        conv.ask(randomChoice("WHATS_THIS_IMAGE", conv));
        askImage('q2',conv);
    } else if (conv.user.storage['quiz']['red-green'] > 0.3) {
        conv.contexts.set('image_question',5);
        conv.ask(randomChoice("WHATS_THIS_IMAGE", conv));
        askImage('q4',conv);
    } else {
        conv.contexts.set('image_question', 5);
        conv.ask(randomChoice("WHATS_THIS_IMAGE", conv));
        askImage('q4',conv);

    }
}


app.intent("Default Welcome Intent", (conv) => {
    let isNewUser = false;
    if (conv.user.storage === undefined || conv.user.storage['visit_count'] === undefined || conv.user.storage['visit_count'] === null) {
        // First time user
        conv.user.storage['visit_count'] = 1;
        conv.user.storage['quiz'] = {};
        isNewUser = true;
    } else {
        conv.user.storage['visit_count'] += 1;
        conv.user.storage['quiz'] = {};
        isNewUser = false;
    }
    conv.user.storage['quiz']['scores'] = {
        "creepy": 0,
        "red-green": 0,
        "total": 0,
        "normal": 0
    };

    if (isNewUser) {
        conv.ask(randomChoice("FIRST_WELCOME", conv));
    } else {
        conv.ask(randomChoice("WELCOME_BACK", conv));
    }
});

app.intent("Start Question", (conv) => {
    conv.ask(randomChoice("START_QUESTION", conv));
    askQuestion(conv);
});

app.intent("Image Question", (conv) => {
    const answer = +conv.parameters["number"];
    tellAnswer(conv, answer);
})
exports.googleAssistantAction = functions.https.onRequest(app);
