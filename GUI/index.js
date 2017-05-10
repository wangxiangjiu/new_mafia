var express = require('express');
var app = express();
var cors = require('cors');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var najax = $ = require('najax');


app.use(cors());
app.use(express.static(__dirname));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/game.html');
});

// dummy dom




// setInterval(function(){
//   if (!dayLocked){
//     dayLocked = true;

//   }
// })

// app.use(function(req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//   next();
// });


// FOR A ROOM. 
// https://p7lrmho5n7.execute-api.us-east-1.amazonaws.com/prod/RecipeUpdate?TableName=mafia
//  


// get expected number of players

// GFAME STATE LINK 

// https://p7lrmho5n7.execute-api.us-east-1.amazonaws.com/prod/RecipeUpdate?TableName=Game_state 

// what data structures do i want to use?

var roles5 = ["Villager","Werewolf","Werewolf", "Seer", "Villager"];
var roles6 = ["Villager","Villager","Werewolf", "Seer", "Doctor", "Werewolf"];

var roles7 = ["Villager","Villager","Villager","Werewolf", "Seer", "Doctor", "Werewolf"];
var roles9 = ["Villager","Villager","Villager","Werewolf", "Seer", "Doctor", "Werewolf", "Villager", "Villager"];
var roles11 = ["Villager","Villager","Villager","Werewolf", "Seer", "Doctor", "Werewolf", "Werewolf", "Villager", "Villager", "Villager"];

var usernames = {};

var roomcounts = {};

var roomMax = {};

var roomroles = {};

var rooms = {};

io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
  socket.on('join room', function(data){
    // check if room is setup?
    var room = data["room"];
    var max = data["max"];
    var username = data.username;
    socket.join(socket.id);



    // hard coded, remove when role #'s dynamic;
    max = 6;
    
    socket.join(room);
    if (!rooms[room]){
      rooms[room] = {};
      rooms[room].pc = 1; 
      rooms[room].max = max;
      rooms[room].players = [];
      rooms[room].voteCount = 0; 
      rooms[room].votes = {};
      rooms[room].victim = -1;
      rooms[room].playersLeft = 6;
      // later add logic for deciding how many roles
      rooms[room].remainingRoles = roles6.slice();
    } else {
      rooms[room].pc +=1;
    }

    var pid = rooms[room].pc; 




    // role assignment
    if (rooms[room].pc <= rooms[room].max){
      var numRolesLeft = rooms[room].remainingRoles.length;
      var index = Math.floor(Math.random()*numRolesLeft)
      var role = rooms[room].remainingRoles[index];
      rooms[room].remainingRoles.splice(index ,1);
      console.log(role + "assigned to player");
      console.log(JSON.stringify(rooms[room].remainingRoles) + "roles left to assign");
    }
    var otherPlayers = rooms[room].players.slice();

    var player = {};
    player.username = username;
    player.role = role;
    player.pid = pid;

    rooms[room].players.push(player);

    var username = usernames[socket.id]
    io.in(socket.id).emit("welcome", "WELCOME TO ROOM: "+ room + " " + username);
    io.in(room).emit("roomcount" , "CURRENTLY " + rooms[room].pc +" IN ROOM " + room);
    // send data back for client to post

    var roleData = {};
    roleData["Role"] = role;
    roleData["GameId"] = room;
    roleData["Player"] = rooms[room].pc;
    roleData["pid"] = pid;
    
    io.in(socket.id).emit("assign role", roleData); // tell client what role they got..  
    // now roll the role?
    if (otherPlayers.length > 0){
      for(var j = 0; j < otherPlayers.length; j++){
        var updateData = {};
        updateData.other = otherPlayers[j];
        updateData.celf = role;
        io.in(socket.id).emit("update players", updateData);
      }  
    }
    
    var newPlayer = {};
    newPlayer.pid = pid;
    newPlayer.username = username;
    newPlayer.role = role;
    socket.to(room).emit("player joined", newPlayer)
    // socket.to(room).emit("WELCOME TO ROOM: " + room);
  });

  socket.on('add user', function(username){
    usernames[socket.id] = username;
  });

  socket.on('suggest kill', function(data){
    //broadcast to (not self) in room that you want to kill xyz
    socket.broadcast.to(data.room).emit("suggested kill", data);
  });


  socket.on('werewolf confirm', function(data){
    var room = data.room;
    rooms[room].victim = data.victim;
    socket.broadcast.to(room).emit("doctor message");  // allow doctor to do stuff..    
  });

  socket.on('doctor confirm', function(data){
    var room = data.room;
    var doctorSave = data.pid; 
    if (doctorSave == rooms[data.room].victim){
      rooms[room].victim *= -1;
    } 
    socket.broadcast.to(room).emit("seer message"); // allow seer to do stuff?
  });

  socket.on('seer confirm', function(data){
    var newData = {};
    newData.pid = data.pid;
    io.in(socket.id).emit("seer show", newData);
    var room = data.room 
    newData.victim = rooms[room].victim;
    // if dead -> YOU DIED SCREEN.. idk 
    if (rooms[room].victim > 0){
      rooms[room].playersLeft -=1;
    }
    rooms[room].voteCount = 0;
    io.in(room).emit('day phase', newData);

  });









  socket.on('lynch confirm', function(data){
    // if majority exists -> someone died
    // when all votes are in, determine lynch
    var room = data.room;
    if (rooms[room].votes[data.choice]){
      rooms[room].votes[data.choice] += 1;
    } else {
      rooms[room].votes[data.choice] = 1;
    }
    rooms[room].voteCount += 1;
    lynched = -1;
    if (rooms[room].voteCount == rooms[room].playersLeft){
      Object.keys(rooms[room].votes).forEach(function(key){
        if (rooms[room].votes[key] > (rooms[room].playersLeft/2)){
          lynched = key;
        }
      })
      rooms[room].votes = {};
      data.lynched = lynched;
      io.in(room).emit('night phase', data);
    }
  })
  var nightPhase = false;
});





http.listen(3000, function(){
  console.log('listening on *:3000');
});