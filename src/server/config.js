var BaseConfig = require('../common/base-config');

var Config = {};

Config.port = global.env === 'prod' ? 80 : 3000;
Config.playerMoveSpeed = BaseConfig.playerMoveSpeed;
Config.playerAcceleration = BaseConfig.playerAcceleration;
Config.playerJumpSpeed = BaseConfig.playerJumpSpeed;
Config.playerSize = BaseConfig.playerSize;
Config.keyBindings = BaseConfig.keyBindings;
Config.screenWidth = 900;
Config.playerDefenceMultiplier = 0.2;
Config.playerEnergyIncrement = 0.1;

Config.firstSpawnLocation = {
	x: 590,
	z: 0
};
Config.secondSpawnLocation = {
	x: 1090,
	z: 0
};
Config.charactersPath = 'src/server/characters_data/';
Config.soundsDataFile = 'src/server/common-sound-data.json';

module.exports = Config;
