'use strict';
console.log('Loading function');

//const doc = require('dynamodb-doc');

//const dynamo = new doc.DynamoDB();


var Alexa = require("alexa-sdk");
var appId = 'amzn1.ask.skill.fc1040ab-fb4d-498e-80da-c762ff72c0ec';
//var recipeTable;
//dynamo.scan({TableName: "mafia"}, onScan);
//var recipeArray = "dummy text";
//var recipeList = "";
var room_number = Math.floor(random(1, 1000));
// function toLower(x) {
//     return x.toLowerCase();
// }

// function onScan(err, data) {
//     if (err) {
//         console.error("failed")
//         this.emit(':tell', "something went wrong");
//     } else {
//         console.log("success");
//         recipeTable = data;
//         recipeArray = [];
//         recipeTable.Items.forEach(function (recipe) {
//             recipeArray.push(recipe.Player);
//         });
//         recipeArray = recipeArray.map(toLower);
//         recipeList = JSON.stringify(recipeArray);
//     }
// }

function random (low, high) {
    return Math.random() * (high - low) + low;
}

exports.handler = function (event, context, callback) {
    var alexa = Alexa.handler(event, context);
    alexa.APP_ID = appId;
    //alexa.dynamoDBTableName = 'mafia';
    // change necessary handlers names
    alexa.registerHandlers(newSessionHandlers, mainHandlers);
    alexa.execute();
};

var states = {
    MAINMODE: '_MAINMODE'
};

var newSessionHandlers = {
    // 'LaunchRequest': function () {
    //     // if (Object.keys(this.attributes).length === 0) {
    //     //     this.attributes['currentRecipe'] = "";
    //     // }
    //     //this.handler.state = states.MAINMODE;
    //     //this.emit(':ask', recipeArray);
    //     this.emit(':ask', 'Werewolf game here. The game requires 6 players. Two werewolves, a doctor, a sear, and' +
    //         'two villegers. To join the game, please enter the url. Please enter the room in on the webpage. The room number is ' + room_number);
    // },
    'NewSession': function () {
        // if (Object.keys(this.attributes).length === 0) {
        //     this.attributes['currentRecipe'] = "";
        // }
        this.handler.state = states.MAINMODE;
        //this.emit(':ask', recipeArray);
        this.emit(':ask', 'Werewolf game here. The game requires 6 players. Two werewolves, a doctor, a seer, and' +
            'two villegers. To join the game, please enter the url. Please enter the room on the webpage. The room number is' + room_number + ". say ready to begin the game.");
    },
    "AMAZON.StopIntent": function () {
        this.emit(':tell', "Goodbye!");
    },
    "AMAZON.CancelIntent": function () {
        this.emit(':tell', "Goodbye!");
    },
    'SessionEndedRequest': function () {
        console.log('session ended!');
        //this.attributes['endedSessionCount'] += 1;
        this.emit(":tell", "Goodbye!");
    }
};

var start_prompt = 'Werewolf game started. It is night time. Everyone please close your eyes.'
var werewolf_open = 'Werewolves, open your eyes and recognize each other. Tap a villeger on the phone to kill.'
var werewolf_finish = 'Ok, Werewolves, close your eyes. Now, Doctor, open your eyes. Tap on any role on the phone to heal.'
var doctor_finish = 'Doctor, close your eyes. Seer, Open your eyes. Tap on the phone to see the role of another player.'
var seer_finish = 'Seer, close your eyes. Say now confirm to continue.'
var time_string = "<break time='10s' /><break time='10s' /><break time='10s' /><break time='10s' /><break time='10s' /><break time='10s' />"

var day_string = 'Now everybody open your eyes. It is daytime. The player killed is displayed on your phone. Now, please introduce yourself in order. Dead player may not speak. You have 1 minute to speak. Starting now.' + time_string + "Stop Now. Say now confirm to continue.";

var mainHandlers = Alexa.CreateStateHandler(states.MAINMODE, {
    'NewSession': function () {
        this.emit('NewSession'); // Uses the handler in newSessionHandlers
    },
    'MainIntent': function () {
        var user_res = this.event.request.intent.slots.item.value;
        console.log('user chose: ' + user_res);
        if (user_res === "ready") {
            this.emit(':ask', 'Great, to start the game, say werewolf game begin.');
        } else if (user_res === "werewolf game begin") {
            this.attributes['state'] = "begin";
            this.emit(':ask', start_prompt + "<break time='2s' />" + werewolf_open + "<break time='5s' />" +
            werewolf_finish +  "<break time='5s' />" + doctor_finish + "<break time='5s' />" + seer_finish);
        } else if (user_res === "now confirm" && this.attributes['state'] === "begin" ) {
            this.attributes['state'] = "day";
            this.emit(':ask', day_string);
        } else if (user_res === "now confirm" && this.attributes['state'] === "day") {
            this.attributes['state'] = "lynch";
            this.emit(':ask', 'Everyone alive taps on the phone to lynch someone. Say now confirm to continue');
        } else if (user_res === "now confirm" && this.attributes['state'] === "lynch") {
            this.attributes['state'] = "night";
            this.emit(':ask', 'person lynched is shown on the phone. If there is not a majority vote, no one died. Say now confirm to move on.')
        } else if (user_res === "now confirm" && this.attributes['state'] === "night") {
            this.attributes['state'] = "begin";
            this.emit(':ask', "It is night time. Everyone please close your eyes." + "<break time='10s' />" + werewolf_open + "<break time='10s' />" +
            werewolf_finish +  "<break time='10s' />" + doctor_finish + "<break time='10s' />" + seer_finish + "<break time='10s' />" );
        } else {
            this.emit(':ask', 'sorry, room is not filled yet. Please make sure everyone has entered the room.')
        };
    },

    'AMAZON.HelpIntent': function () {
        this.emit(':ask', 'you can say ready, and then werewolf game begin.');
    },
    "AMAZON.StopIntent": function () {
        console.log("STOPINTENT");
        this.emit(':tell', "Goodbye!");
    },
    "AMAZON.CancelIntent": function () {
        console.log("CANCELINTENT");
        this.emit(':tell', "Goodbye!");
    },
    'SessionEndedRequest': function () {
        console.log("SESSIONENDEDREQUEST");
        //this.attributes['endedSessionCount'] += 1;
        this.emit(':tell', "Goodbye!");
    },
    'Unhandled': function () {
        console.log("UNHANDLED");
        var message = 'We do not have this recipe, please say one of' + recipeList;
        this.emit(':ask', message, message);
    }
});
