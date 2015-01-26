var App = require('../app');
var InputCollection = require('./input-collection');
var ChooseScreen = require('./screen/choose');
var WaitingScreen = require('./screen/waiting');
var Button = require('./canvas/button');
var SpriteSheet = require('./canvas/spritesheet');
var Point = require('../../common/point')
var socket = io();

var CharacterChooser = {};

CharacterChooser.isRunning = false;
CharacterChooser.updateInterval = null;
CharacterChooser.screen = null;
CharacterChooser.activeButton = 0;
CharacterChooser.buttons = null;

CharacterChooser.resetUnactiveButton = function (index) {
	var button = CharacterChooser.buttons[index];
	if (button !== undefined) {
		var spriteSheet = button.getSpriteSheet();
		spriteSheet.setCurrentFrame(0);
	}
};

CharacterChooser.updateActiveButton = function () {
	var button = CharacterChooser.buttons[CharacterChooser.activeButton];
	if (button !== undefined) {
		var spriteSheet = button.getSpriteSheet();
		spriteSheet.update();
	}
};

CharacterChooser.choose = function (id) {
	socket.emit('ready', id);
	var screen = App.screen;
	screen.dispose();
	App.screen = new WaitingScreen();
	App.canvasObj.setGraphics(App.screen.graphics);
	CharacterChooser.stop();
};

CharacterChooser.handleControls = function () {
	var control = InputCollection;
	var oldActiveButton = CharacterChooser.activeButton;
	if (control.isPressed(39)) {
		CharacterChooser.activeButton++;
		if (CharacterChooser.activeButton + 1 > CharacterChooser.buttons.length) {
			CharacterChooser.activeButton = 0;
		}
	}
	else if (control.isPressed(37)) {
		CharacterChooser.activeButton--;
		if (CharacterChooser.activeButton < 0) {
			CharacterChooser.activeButton = CharacterChooser.buttons.length - 1;
		}
	} else if (control.isPressed(13)) {
		var button = CharacterChooser.buttons[CharacterChooser.activeButton];
		var id = button.getId();
		CharacterChooser.choose(id);
		return;
	}
	if (oldActiveButton !== CharacterChooser.activeButton) {
		CharacterChooser.resetUnactiveButton(oldActiveButton);
	}
};

CharacterChooser.createButtons = function (data) {
	var buttons = [];
	var startX = App.canvasObj.getWidth() * 0.15;
	var startY = App.canvasObj.getHeight() * 0.2;
	var width = 228;
	var height = 160;
	var shiftX = 0;
	var shiftY = 0;
	var buttonsInRow = 3;
	var currentButton = 1;

	for (var character in data) {
		var x = startX + shiftX;
		var y = startY + shiftY;
		var spriteImage = new Image();
		spriteImage.src = './img/' + data[character].spriteSheetIntroImage;
		var button = new Button({
			id: data[character].id,
			useSpriteSheet: true,
			spriteSheet: new SpriteSheet({
				image: spriteImage,
				data: data[character],
				useScale: true,
				scaleWidth: width,
				scaleHeight: height
			}),
			location: new Point(x, y)
		});

		buttons.push(button);

		shiftX += width;
		currentButton++;
		if (currentButton > buttonsInRow) {
			currentButton = 1;
			shiftX = 0;
			shiftY += height;
		}
	}
	return buttons;
};

CharacterChooser.createScreen = function (data) {
	var buttons = CharacterChooser.createButtons(data);
	App.screen.dispose();
	var screen = new ChooseScreen();
	screen.setButtons(buttons);
	CharacterChooser.screen = screen;
	CharacterChooser.buttons = screen.getButtons();
	App.screen = screen;
	App.canvasObj.setGraphics(screen.graphics);
};

CharacterChooser.update = function() {
	CharacterChooser.handleControls();
	if (CharacterChooser.isRunning) {
		CharacterChooser.updateActiveButton();
	}
};

CharacterChooser.stop = function() {
	CharacterChooser.isRunning = false;
	CharacterChooser.screen = null;
	CharacterChooser.activeButton = 0;
	CharacterChooser.buttons = null;
	clearInterval(CharacterChooser.updateInterval);
};

CharacterChooser.start = function() {
	CharacterChooser.isRunning = true;
	CharacterChooser.updateInterval = setInterval(function() {
		CharacterChooser.update();
	}, 1000 / 30);
};

module.exports = CharacterChooser;