function Text(canvasObj, text, size) {
	this.canvasObj = canvasObj;
	this.text = text;
	this.size = size;
	this.location = location;
	this.fontType = 'Arial';
	this.color = '#000000';
	this.isVisible = true;
}

Text.prototype.location = function() {
	return this.location;
}

Text.prototype.fontType = function() {
	return this.fontType;
}

Text.prototype.color = function() {
	return this.color;
}

Text.prototype.size = function() {
	return this.size;
}

Text.prototype.text = function() {
	return this.text;
}

Text.prototype.textWidth = function() {
	return this.canvasObj.canvas.measureText(this.text).width;
}

Text.prototype.isVisible = function() {
	return this.isVisible;
}

Text.prototype.draw = function() {
	if (this.isVisible) {
		this.canvasObj.canvas.fillStyle = this.color;
		this.canvasObj.canvas.font =  this.size + 'px ' + this.fontType;
		this.canvasObj.canvas.fillText(this.text, this.location().x, this.location().y);
	}
}

module.exports = Text;