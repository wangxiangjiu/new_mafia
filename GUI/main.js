// AWS.config.update({
//   region:
//   endpoint:
//   accessKeyId:
//   secretAccessKey: 
// });

// var dynamodb = new AWS.DyanomDB();
// var docClient = new AWS.DyanomDB.DocumentClient();


$(function() {
  var FADE_TIME = 150; // ms
  var TYPING_TIMER_LENGTH = 400; // ms

  var $window = $(window);
  var $usernameInput = $('.usernameInput'); // Input for username
  var $roomInput = $('.roomInput');
  var $loginPage = $('.login.page');
  var $lobbyPage = $('.lobby.page');
  var $gamePage = $('.game.page');
  var $gameMessage = $('.game.message');
  var $gameBroadcast = $('.game.broadcast');
  var $playerArea = $(".users");
  var $confirmButton = $(".confirm");
  var skullPlayer;


  var dead = false;

  // doctor night voting
  var healed = false;
  var playerToHeal; 
  var playerToCheck;

  // werewolf night voting
  var killed = false;
  var suggested;

  // seer night voting
  var checked = 0;

  var voted = false;
  // phases
  var doctorPhase = false;
  var seerPhase = false;





  var nightPhase = true;
  var pRoom;
  var nightUpdated = false;
  var dayUpdated = false;

  var otherPlayerPID = [];
  var player = {};

  var players = {};

  var username = false;
  var connected = false;
  var $currentInput = $usernameInput.focus();

  var socket = io();

  socket.on("welcome", function(message){
    $("div.welcome").text(message);
    // set something to some message.
  })

  socket.on("suggested kill", function(data){
    var pid = data.pid;
    suggested = pid;
    if (player.role == "Werewolf"){
      if (skullPlayer){
        $(skullPlayer).find("img").attr('src', 'img/question.png');
      }
      skullPlayer = "div[pid*='"+pid+"']";
      $("div[pid*='"+pid+"']").find("img").attr('src', 'img/wskull.png');

      $gameMessage.text(data.username + " wants to kill " + data.victim + " click the confirm button to agree");
      $confirmButton.show();
      // setup kill metadata? 
    }
  })


  socket.on("roomcount", function(message){
    $("div.broadcast").text(message);
  })

  socket.on("assign role", function(roleData){
    var url = "https://d8iqr83w63.execute-api.us-east-1.amazonaws.com/prod/MafiaRequest";
    $.post(url, JSON.stringify({
      "type":"POST",
      "Access-Control-Allow-Origin": "*",
      "data": {
        "TableName" : "mafia",
        "Item":{
          "Player": roleData["Player"],
          "Role": roleData["Role"]}}})
    , function(data, status){
      // alert(status);
      player.role = roleData["Role"];
      player.pid = roleData["pid"];
      // if (player.role == )
      var html = getRoleHTML(player.role, "You", player.pid);
      $playerArea.append(html);


    });

  })

  function getRoleHTML(role, username, pID){
    var text;
    if (role == "Werewolf"){
      text = "<a href='#'><span><div pid='"+ pID +"' class='circle werewolf role'><img pid='"+ pID +"' class='role' src='img/wolf.png'/></div><span class='username'>"+username+"</span></span></a>"
    } else if (role == "Villager") {
      text = "<a href='#'><span><div pid='"+ pID +"' class='circle villager role'><img pid='"+ pID +"' class='role' src='img/villager.png'/></div><span class='username'>"+username+"</span></span></a>"
    } else if (role == "Doctor") {
      text = "<a href='#'><span><div pid='"+ pID +"' class='circle doctor role'><img pid='"+ pID +"' class='role' src='img/doctor.png'/></div><span class='username'>"+username+"</span></span></a>"
    } else if (role == "Seer"){
      text = "<a href='#'><span><div pid='"+ pID +"' class='circle seer role'><img pid='"+ pID +"' class='role' src='img/seer.png'/></div><span class='username'>"+username+"</span></span></a>"
    } else if (role == "unknown"){
      text ="<a href='#'><span><div pid='"+ pID +"' class='circle question role'><img pid='"+ pID +"' class='role' src='img/question.png'/></div><span class='username'>Player "+username+"</span></span></a>"
    }
    return text;
  }


  socket.on('seer show', function(data){
    var pid = data.pid;
    if (players[pid].role == "Werewolf"){
      $("div[pid*='"+pid+"']").find("img").attr('src', "img/wolf.png")     
    } else if (players[pid].role == "Villager"){
      $("div[pid*='"+pid+"']").find("img").attr('src', "img/villager.png")     
    } else if (playersp[pid].role == "Doctor"){
      $("div[pid*='"+pid+"']").find("img").attr('src', "img/doctor.png")     
    }
  })

  socket.on("player joined", function (newPlayer){
    npName = newPlayer.username;
    npID = newPlayer.pid;
    // APPEND CIRCLE THING 
    players[npID] = newPlayer; 

    if (player.role === "Werewolf"){
      if (newPlayer.role === "Werewolf"){
        var html = getRoleHTML("Werewolf", npName, npID);
        $playerArea.append(html);
      } else {
        var html = getRoleHTML("unknown", npName, npID);
        $playerArea.append(html);   
      }
    } else {
      var html = getRoleHTML("unknown", npName, npID);
      $playerArea.append(html);
    }
  });

  function setUsername () {
    username = cleanInput($usernameInput.val().trim());
    // $loginPage.fadeOut();
    // $lobbyPage.show();

    // If the username is valid
    if (username) {
      $loginPage.fadeOut();
      $lobbyPage.show();
      $roomInput.focus();

      socket.emit('add user', username);
    //   // $loginPage.off('click');
    //   // $currentInput = $inputMessage.focus();

    //   // Tell the server your username
    //   // socket.emit('add user', username);
    }
  }

  socket.on("update players", function(updateData){
    var username = updateData.other.username;
    var role = updateData.other.role;
    var pid = updateData.other.pid;
    // var pid = udpate
    var playerRole = updateData.celf;
    var html;

    players[pid] = updateData.other;

    // players['pid'] = updateData.other; // i want the role, etc. 

    if (playerRole == "Werewolf"){
      if (role == "Werewolf"){
        html = getRoleHTML(role, username, pid);
      } else {
        html = getRoleHTML("unknown", username, pid);
      }
    } else {
      html = getRoleHTML("unknown", username, pid);
    }
     $playerArea.append(html);
  });




  socket.on("day phase", function(data){
    $gameMessage.text("day phase blah blah blah");
    $gamePage.css('background-color', '#b7dbe8');

    // set css to white or other color
    var pid = data.victim;

    console.log(data.victim);
    console.log(player.role);
    if (data.victim > 0){
      $("div[pid*='"+pid+"']").find("img").attr('src', "img/wskull.png")     
    } else {
      if (player.role != "Seer" && player.pid != pid*-1){
        console.log("i made it");
        pid *= -1;
        $("div[pid*='"+pid+"']").find("img").attr('src', "img/question.png")     

      }
    }
    if (player.pid == data.victim){
      dead = true;
    }
    skullPlayer = null;
    nightPhase = false;
    voted = false;

  });

  socket.on("night phase", function(data){
    $gamePage.css('background-color', '#3e3e4f');
    $gameMessage.text("night phase");
    // if player is a werewolf, show message saying they can vote
    if (player.role == "Werewolf"){
      $gameMessage.text("choose a player to kill");
    }

    if (skullPlayer){
      $(skullPlayer).find("img").attr('src', 'img/question.png');
    }
    skullPlayer = null;


    if (data.lynched > 0){
      var pid = data.lynched;
      $("div[pid*='"+pid+"']").find("img").attr('src', "img/wskull.png")     
    } 



    // initialize night vars
    nightPhase = true;
    killed = false;
    checked = 0;
    healed = false;
    doctorPhase = false;
    seerPhase = false;
    playerToCheck = -1;
    playerToHeal = -1;
  })

  socket.on("doctor message", function(data){
    doctorPhase = true;
    if (player.role == "Doctor"){
      $gameMessage.text("choose a player to save");
    }
  })

  socket.on("seer message", function(data){
    seerPhase = true;
    if (player.role == "Seer"){
      $gameMessage.text("choose a player to check");
    }
  })




  function joinRoom () {
    room = cleanInput($roomInput.val().trim());
    if (room) {
      $lobbyPage.fadeOut();
      $gamePage.show();
      $.get("https://d8iqr83w63.execute-api.us-east-1.amazonaws.com/prod/MafiaRequest?TableName=Game_state", function(data) {
        // if room does not exist, tell player to reprompt alexa i think.
        entries = data["Items"];
        var data = false;
        data = validRoom(entries);
        if (data){
          socket.emit("join room", data);
          pRoom = room;
        } else {
          // place message on the actual screen
          console.log("invalid room!");
        }
      });
    }
  }

  function cleanInput (input) {
    return $('<div/>').text(input).text();
  }

  function validRoom (items) {
    var data = {};
    for (var i=0; i<items.length; i++ ){
      var entry = items[i];
      if (entry["RoomId"]==room){
        data["room"] = entry["RoomId"];
        data["max"] = entry["Num_people"];
        data.username = username;
        return data;
      }
    }
    return false;
  }

  $window.keydown(function (event) {
    // Auto-focus the current input when a key is typed
    // if (!(event.ctrlKey || event.metaKey || event.altKey)) {
    //   $currentInput.focus();
    // }
    // When the client hits ENTER on their keyboard
    if (event.which === 13) {
      if (username){
        joinRoom();
      } else {
  	    setUsername();      
      }
    }
  });

  $(document).on('click', ".confirm", function(event){
    $confirmButton.hide();
    $gameMessage.text("");
    var data = {};
    data.room = pRoom;
    if (!dead){
      if (nightPhase){
      // power confirmation
        if (player.role == "Werewolf"){
          console.log(suggested);
          data.victim = suggested; 
          socket.emit('werewolf confirm', data); 
          killed = true; // idk if these are necessary
        } else if (player.role == "Doctor"){
          data.pid = playerToHeal;
          socket.emit('doctor confirm', data);
        } else if (player.role == "Seer"){
          data.room = pRoom;
          data.pid = playerToCheck;
          socket.emit('seer confirm', data);
        }


      } else { // its day phase, vote on who you want to kill
        data.room = pRoom;
        data.choice = voteChoice;
        socket.emit('lynch confirm', data);
        // vote confirmation

      }
    }
    // depending on phase, player role, do something
  });

  // might need to change the circle/img thing.. 
  $(document).on('click', ".role", function(event){
    if (!dead){
      if (nightPhase){
        var pid = $(event.target).attr('pid');
        var targetedPlayer = players[pid] 
        if (player.role == "Werewolf"){
          if (!killed){
            if (targetedPlayer.role != "Werewolf"){

              // gurantees only 1 skull choice appears
              if (skullPlayer){
                $(skullPlayer).find("img").attr('src', 'img/question.png');
              }
              skullPlayer = this;
              $(this).find("img").attr('src', 'img/wskull.png');

              $confirmButton.hide();
              $gameMessage.text("");
              
              // send data to other werewolf
              var data = {};
              data.username = username;
              data.room = pRoom;
              data.victim = targetedPlayer.username;
              data.pid = pid;
              socket.emit("suggest kill", data);
              player.choice = pid;
            }
          }
          
        } else if (player.role == "Seer" && seerPhase){
          if (!checked){
            if ($(this).find('img').attr('src') == 'img/question.png'){
   
              checked = true;
              playerToCheck = pid;
              $confirmButton.show();                      
            }
            // tell game to go to day phase!

            // and then what? 
            // if the circle is unchecked.. 
            // ok store a bit more information somewhere.. maybe id idk.
          }
        } else if (player.role == "Doctor" && doctorPhase){
          if (!healed){
            // once i clicked the circle, just have a confirmation...
            $gameMessage.text("Heal player " + targetedPlayer.username + "?");
            playerToHeal = pid;
            $confirmButton.show();
            // post data to dynamo, saying i healed X... 
          }
        }
      } else {
        var pid = $(event.target).attr('pid');
        var targetedPlayer = players[pid] 
        if (pid != player.pid && !voted){ // don't allow to vote for myself
          if (skullPlayer){
            // seer checks annoying.
            $(skullPlayer).find("img").attr('src', 'img/question.png');
          } 
          skullPlayer = this;
          voteChoice = pid;
          $(this).find("img").attr('src', 'img/wskull.png');
          $confirmButton.show();
        }
      }
    }
  });

  // socket.on('unconfirm vote', function(data){

  // })

});

// setInterval(function(){
//   if (!nightPhase){
//     checkNight();
//   }
// }, 2000); //notify baed on xyz. 



// function checkNight(){
//   // url = ""
//   // $.get(url, function(data) {
//   //   // if room does not exist, tell player to reprompt alexa i think.
//   //   //
//   //   var phase = data;
//   //   if (phase == "night"){
//   //     //set all vars
//   //     healed = false;
//   //     killed = false;
//   //     checked = false;
//   //     nightPhase = true;
//   //     dayPhase = false;
//   //   }
//   // });

// }

/// aaaaaaahhhh ill make a decision later.... 









