var five = require('johnny-five');
var pixel = require('./../node_modules/node-pixel/lib/pixel.js');
var staircaseModel = require('./models/staircase');

var opts = {};
opts.port = process.argv[2] || '';

function StaircaseLighting(options) {
  if (!options) {
    options = {};
  }

  this.stairs = staircaseModel.stairs;
  this.color = options.color || '#ffffff';
  this.workMode = options.workMode || staircaseModel.workModes[0];
  this.animationMode = options.animationMode || staircaseModel.animationModes[0];
  this._initBoard();

}

StaircaseLighting.getModel = function(){
  return staircaseModel;
};

StaircaseLighting.prototype.getAnimationMode = function () {
  return this.animationMode;
};

StaircaseLighting.prototype.getAnimationModes = function () {
  return staircaseModel.animationModes;
};

StaircaseLighting.prototype.getColor = function () {
  return this.color;
};

StaircaseLighting.prototype.getWorkMode = function () {
  return this.workMode;
};

StaircaseLighting.prototype.getWorkModes = function () {
  return staircaseModel.workModes;
};

StaircaseLighting.prototype.setAnimationMode = function (animationMode) {
  if (typeof animationMode !== 'string') {
    console.error('"animationMode" should be string');
    return;
  }

  this.animationMode = animationMode;

  return this;
};

StaircaseLighting.prototype.setColor = function (color) {
  if (typeof color !== 'string') {
    console.error('"color" should be string');
    return;
  }

  this.color = color;

  return this;
};

StaircaseLighting.prototype.setWorkMode = function (workMode) {
  if (typeof workMode !== 'string') {
    console.error('"workMode" should be string');
    return;
  }

  this.workMode = workMode;

  return this;
};

// Work modes

StaircaseLighting.prototype.on = function () {
  if (this.getAnimationMode() === 'none') {
    this.strip.color(this.getColor());
    this.strip.show();
  } else {
    this.runAnimation();
  }
};

StaircaseLighting.prototype.off = function () {
  var that = this;
  setTimeout(function () {
    that.strip.color('#000000');
    that.strip.show();
  }, 100); // TODO check why the strip need this delay
};

// Animation modes

StaircaseLighting.prototype.stairByStair = function () {
  var that = this;
  var stairs = this.stairs;
  var stairsPromises = [];

  // TODO refactor this hell :D
  stairs.forEach(function (stair, index) {
    var stairPromise = new Promise(function (resolve, reject) {
      setTimeout(function (stair) {
        for (var j = 0; j < stair.length; j++) {
          that.strip.pixel(stair.from + j).color(that.color);
        }
        that.strip.show();

        console.log(stair._position);
        resolve(stair);
      }, 1000 * index, stairs[index]);
    });

    stairsPromises.push(stairPromise);
  });

  // TODO return
  Promise.all(stairsPromises).then(function (values) {
    console.log(values);
    that.off();
  });
};

// Methods

StaircaseLighting.prototype.runAnimation = function () {
  this[this.getAnimationMode()]();
};

StaircaseLighting.prototype.start = function () {
  this.strip.off();

  console.log('this.getWorkMode()', this.getWorkMode());
  this[this.getWorkMode()]();
};

StaircaseLighting.prototype._initBoard = function () {
  var that = this;
  this.board = new five.Board(opts);

  this.board.on('ready', function () {
    console.log('Board ready, lets add light');
    that._initStrip();
  });

  this.board.on('exit', function () {
    // TODO ???
    that.strip.off();
  });
};

StaircaseLighting.prototype._initStrip = function () {
  var that = this;

  this.strip = new pixel.Strip({
    data: 6,
    length: 30, // TODO
    color_order: pixel.COLOR_ORDER.BRG,
    board: that.board,
    controller: 'FIRMATA'
  });

  this.strip.on('ready', function () {
    this.color('#000000');
    this.show();
    console.log('Strip ready, let\'s go');
  });
};

module.exports = StaircaseLighting;
