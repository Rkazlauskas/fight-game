var App = require('../app');
var Config = require('./config');
var socket = io();

var Client = module.exports = function() {};

Client.inputs = [];
Client.serverData = [];
Client.inputCounter = 0;
Client.updateWorldInterval = null;
Client.isRunning = false;
Client.prediction = true;
Client.reconciliation = true;

Client.Key = {
  _pressed: {},

  LEFT: 37,
  UP: 38,
  RIGHT: 39,
  DOWN: 40,
  UP_LEFT: 41,
  UP_RIGHT: 42,
  DOWN_LEFT: 43,
  DOWN_RIGHT: 44,
  JUMP_KEY: 88,
  
  isDown: function(keyCode) {
    return this._pressed[keyCode];
  },
  
  onKeydown: function(event) {
    this._pressed[event.keyCode] = true;
  },
  
  onKeyup: function(event) {
    delete this._pressed[event.keyCode];
  }
};

Client.applyCoordinates = function(player, x, y, z) {
	var playerLocation = player.getLocation();
	playerLocation.setX(x);
	playerLocation.setY(y);
	player.setZ(z);
};

Client.applyInput = function(input) {

	if (input == null) {
		return;
	}

	var key = Client.Key;
	var screenWidth = App.canvasObj.getWidth();
	var screenHeight = App.canvasObj.getHeight();
	var player = App.player;
	var opponent = App.opponent;

	var x = player.getLocation().getX();
	var y = player.getLocation().getY();
	var z = player.getZ();

	var opx = opponent.getLocation().getX();
	var opy = opponent.getLocation().getY();
	var opz = opponent.getZ();
	
	var size = Config.playerSize;

	var data = {
		player: {
			x: x,
			y: y,
			z: z
		},
		opponent: {
			x: opx,
			y: opy,
			z: opz
		}
	};

	if (input.key == key.UP_RIGHT) {
		if (x < screenWidth - 30 && y > 0) {
			if(Client.checkRightCollision(data, size))
				x += Config.playerMoveSpeed;
			if(Client.checkUpCollision(data, size))
				y -= Config.playerMoveSpeed;
		}
	}
	else if (input.key == key.UP_LEFT) {
		if (x > 0 && y > 0) {
			if(Client.checkLeftCollision(data, size))
				x -= Config.playerMoveSpeed;
			if(Client.checkUpCollision(data, size))
				y -= Config.playerMoveSpeed;
		}
	}
	else if (input.key == key.DOWN_LEFT) {
		if (x > 0 && y < screenHeight - 30){
			if(Client.checkLeftCollision(data, size))
				x -= Config.playerMoveSpeed;
			if(Client.checkDownCollision(data, size))
				y += Config.playerMoveSpeed;
		}
	}
	else if (input.key == key.DOWN_RIGHT) {
		if (x < screenWidth - 30 && y < screenHeight - 30){
			if(Client.checkRightCollision(data, size))
				x += Config.playerMoveSpeed;
			if(Client.checkDownCollision(data, size))
				y += Config.playerMoveSpeed;
		}
	}
	else if (input.key == key.RIGHT) {
		if (x < screenWidth - 30){
			if(Client.checkRightCollision(data, size))
				x += Config.playerMoveSpeed;
		}
	}
	else if (input.key == key.LEFT) {
		if (x > 0){
			if(Client.checkLeftCollision(data, size))
				x -= Config.playerMoveSpeed;
		}
	}
	else if (input.key == key.UP) {
		if (y > 0) {
			if(Client.checkUpCollision(data, size))
				y -= Config.playerMoveSpeed;
		}
	}
	else if (input.key == key.DOWN) {
		if (y < screenHeight - 30) {
			if(Client.checkDownCollision(data, size))
				y += Config.playerMoveSpeed;
		}
	}

	Client.applyCoordinates(App.player, x, y, z);
};

Client.checkLeftCollision = function(data, size) {
	return (((data.opponent.x + size < data.player.x || data.player.x <= data.opponent.x) || (data.player.y - size/3 >= data.opponent.y ||
											data.player.y + size/3 <= data.opponent.y)) || (data.opponent.z - size/3 >= data.player.z));
}
Client.checkRightCollision = function(data, size) {
	return (((data.opponent.x - size > data.player.x || data.opponent.x <= data.player.x) || (data.player.y - size/3 >= data.opponent.y ||
											data.player.y + size/3 <= data.opponent.y)) || (data.opponent.z - size/3 >= data.player.z));
}
Client.checkUpCollision = function(data, size) {
	return (((data.player.y - size/3 > data.opponent.y || data.player.y <= data.opponent.y) || (data.player.x - size >= data.opponent.x ||
											data.player.x + size <= data.opponent.x)) || (data.opponent.z - size/3 >= data.player.z));
}
Client.checkDownCollision = function(data, size) {
	return (((data.player.y + size/3 < data.opponent.y || data.opponent.y <= data.player.y) || (data.player.x - size >= data.opponent.x ||
											data.player.x + size <= data.opponent.x)) || (data.opponent.z - size/3 >= data.player.z));
}

Client.storeInput = function(input) {
	Client.inputs.push(input);
};

Client.storeServerData = function(data) {
	Client.serverData.push(data);
};

Client.reconciliate = function(state) {
	var j = 0;
	while (j < Client.inputs.length) {
		var input = Client.inputs[j];
		console.log(input.id + ' ' + state.player.id);
		if (input.id <= state.player.id) {
			Client.inputs.splice(j, 1);
		} else {
			Client.applyInput(input);
			j++;
		}
	}
};

Client.processServerData = function() {
	var i;
    for (i = 0; i < Client.serverData.length; i++) {
    	var state = Client.serverData[i];

    	var x = state.player.x;
    	var y = state.player.y;
    	var z = state.player.z;
    	var ox = state.opponent.x;
    	var oy = state.opponent.y;
    	var oz = state.opponent.z;
    	Client.applyCoordinates(App.player, x, y, z);
    	Client.applyCoordinates(App.opponent, ox, oy, oz);

    	if (Client.prediction && Client.reconciliation) {
    		Client.reconciliate(state);
    	}
    }
    Client.serverData.splice(0, i + 1);
};

Client.processInputs = function() {
	var input = {
		id: Client.inputCounter,
		key: 0,
		jumpKey: false
	};

	var key = Client.Key;
	var test = Config.playerMoveSpeed;
	var screenWidth = App.canvasObj.getWidth();
	var screenHeight = App.canvasObj.getHeight();
	var player = App.player;
	var playerLocation = player.getLocation();
	var x = player.getLocation().getX();
	var y = player.getLocation().getY();
	var z = player.getZ();

	if (key.isDown(key.RIGHT) && key.isDown(key.UP)) {
		if (x < screenWidth - 30 && y > 0) {
			input.key = key.UP_RIGHT;
		}
	}
	else if (key.isDown(key.LEFT) && key.isDown(key.UP)) {
		if (x > 0 && y > 0) {
			input.key = key.UP_LEFT;
		}
	}
	else if (key.isDown(key.DOWN) && key.isDown(key.LEFT)) {
		if (x > 0 && y < screenHeight - 30){
			input.key = key.DOWN_LEFT;
		}
	}
	else if (key.isDown(key.DOWN) && key.isDown(key.RIGHT)) {
		if (x < screenWidth - 30 && y < screenHeight - 30){
			input.key = key.DOWN_RIGHT;
		}
	}
	else if (key.isDown(key.RIGHT)) {
		if (x < screenWidth - 30){
			input.key = key.RIGHT;
		}
	}
	else if (key.isDown(key.LEFT)) {
		if (x > 0){
			input.key = key.LEFT;
		}
	}
	else if (key.isDown(key.UP)) {
		if (y > 0) {
			input.key = key.UP;
		}
	}
	else if (key.isDown(key.DOWN)) {
		if (y < screenHeight - 30) {
			input.key = key.DOWN;
		}
	}
	if(key.isDown(key.JUMP_KEY)) {
		if(!App.player.isJumping()) {
			input.jumpKey = true;
			speedZ = Config.playerJumpSpeed;
			z -= speedZ;
			player.setSpeedZ(speedZ);
			player.setZ(z);
			player.setJumpState(1);
		}
	}
	if(input.key != 0 || input.jumpKey) {
		if (Client.prediction) {
			Client.applyInput(input);
			if (Client.reconciliation) {
				Client.storeInput(input);
			}
		}
		Client.inputCounter++;
		socket.emit('update', input);
	}
};

Client.jump = function() {
	var player = App.player;
	var opponent = App.opponent;
	var x = player.getLocation().getX();
	var y = player.getLocation().getY();
	var z = player.getZ();
	var opx = opponent.getLocation().getX();
	var opy = opponent.getLocation().getY();
	var opz = opponent.getZ();
	var speedZ = player.getSpeedZ();

	if(z <= 0){
		if(Math.abs(x - opx) < Config.playerSize && Math.abs(y - opy) < Config.playerSize / 3){
			speedZ -= Config.playerAcceleration;
			z -= speedZ;
			if(opz - z < Config.playerSize){
				z = Math.abs(y - opy) - Config.playerSize;
				speedZ = 0;
			}
		}
		else {
			speedZ -= Config.playerAcceleration;
			z -= speedZ;}
		if(z > 0){
			player.setJumpState(0);
			z = 0;
			speedZ = 0;
		}
		player.setZ(z);
		player.setSpeedZ(speedZ);
	}
};

Client.updatePhysics = function() {
	if(App.player.isJumping()) {
		console.log('do jump');
		Client.jump();
	}
};

Client.update = function() {
	Client.processServerData();
	Client.processInputs();
	Client.updatePhysics();
};

Client.stop = function() {
	Client.isRunning = false;
	clearInterval(Client.updateWorldInterval);
};

Client.start = function() {
	Client.isRunning = true;
	Client.updateWorldInterval = setInterval(function() {
		Client.update();
	}, 1000 / 30);
};