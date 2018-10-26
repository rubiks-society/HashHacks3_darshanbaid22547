import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as i18n from '@sfeir/actions-on-google-i18n'

import { dialogflow, Suggestions, BasicCard, Image, DialogflowConversation } from 'actions-on-google';
admin.initializeApp();

const app = dialogflow({
    debug: true
});
i18n.use(app);

const CANT_SAY  = -1;
const questions = {
    "q1": {
        "question-type": "image",
        "image-source": "https://www.colour-blindness.com/CBTests/ishihara/Plate1.gif",
        "choices": [12,24,CANT_SAY],
        "scores": {
            "12": {
                "creepy": 0,
                "red-green": 0,
                "total": 0
            },
            "default" : {
                "creepy": 0.5,
            }
        }
    },
    "q2": {
        "question-type": "image",
        "image-source": "https://www.colour-blindness.com/CBTests/ishihara/Plate1.gif",
        "choices": [12,24,CANT_SAY],
        "correct_answer": 12
    },
    "q3": {
        "question-type": "image",
        "image-source": "https://www.colour-blindness.com/CBTests/ishihara/Plate1.gif",
        "choices": [12,24,CANT_SAY],
        "correct_answer": 12
    },
    "q4": {
        "question-type": "image",
        "image-source": "https://www.colour-blindness.com/CBTests/ishihara/Plate1.gif",
        "choices": [12,24,CANT_SAY],
        "correct_answer": 12
    }
}

function randomChoice(s: string,conv, ex?: object) {
    const total = +conv.__(s+"-total");
    const ex2 = ex !== undefined ? ex : {};
    const disp = Math.floor(Math.random() * (+total - +1)) + +1;
    return conv.__(`${s}-${disp}`,ex2);
}

function askImage(q: string, conv) {
    conv.ask(randomChoice("WHATS_THIS_IMAGE", conv),new BasicCard({
        image: new Image({
            url: questions[q]['image-source'],
            alt: conv.__('img-alt'),          
        }),
    }));
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
        askImage('q1',conv);
        
    }
}

function tellAnswer(conv, answer?) {
    const q = questions[conv.user.storage['quiz']['last_question']];
    if (q['question-type'] === 'image') {
        let scores = {};
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
    if (conv.user.storage['quiz']['scores']['creepy'] > 0.5) {
        // The user is joking, lets end.
        conv.close(randomChoice("JOKE_ANYONE",conv),randomChoice("JOKE_BYE",conv));
        return;
    } else if (conv.user.storage['quiz']['scores']['red-green'] > 0.7) {
        conv.close(randomChoice("YOU_HAVE_RED_GREEN", conv));
    } else {
        conv.ask("we'll pass");
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
        "total": 0
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
})
exports.googleAssistantAction = functions.https.onRequest(app);
