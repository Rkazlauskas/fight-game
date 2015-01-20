var App;
var BasePlayer = require('../../common/base-player');

function Player(params) {
	App = require('../app');
	this.location = params.location;
	this.spritesheet = params.spriteSheet;
	this.lifeBar = params.lifeBar;
	this.energyBar = params.energyBar;
	this.depth = 0;
};

Player.prototype = new BasePlayer();

Player.prototype.getSpriteSheet = function() {
	return this.spritesheet;
};

Player.prototype.setSpriteSheet = function(spritesheet) {
	this.spritesheet = spritesheet;
};

Player.prototype.setDepth = function (depth) {
	if (depth <= 1 && depth >= 0) {
		this.depth = depth;
	}
};

Player.prototype.getDepth = function() {
	return this.depth;
};

Player.prototype.getLifeBar = function() {
	return this.lifeBar;
};

Player.prototype.getEnergyBar = function() {
	return this.energyBar;
}

Player.prototype.setLifeBar = function(lifeBar) {
	this.lifeBar = lifeBar;
};

Player.prototype.setEnergyBar = function(energyBar) {
	this.energyBar = energyBar;
};

Player.prototype.update = function() {
	this.spritesheet.update();
	this.lifeBar.update();
	this.energyBar.update();
};

Player.prototype.draw = function() {
	this.spritesheet.draw(this.location.getX(), this.location.getY() + this.getZ());
};

module.exports = Player;