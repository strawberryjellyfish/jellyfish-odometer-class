//============================================================================//
//  Animated Odometer class originally developed for use in my
//  Jellyfish Counter Widget for WordPress
//  http://strawberryjellyfish.com/wordpress-plugins/jellyfish-counter/
//  Version 1.9.1
//  Copyright (C) 2014 Robert Miller
//  http://strawberryjellyfish.com
//
//  Originally inspired on
//  Gavin Brock's CSS/JavaScript Animated Odometer (Odometer.js)
//  Copyright (C) 2008 Gavin Brock
//  http://gavcode.wordpress.com/2008/04/07/cssjavascript-animated-odometer/
//============================================================================//
//
//  This program is free software: you can redistribute it and/or modify
//  it under the terms of the GNU General Public License as published by
//  the Free Software Foundation, either version 3 of the License, or
//  (at your option) any later version.
//
//  This program is distributed in the hope that it will be useful,
//  but WITHOUT ANY WARRANTY; without even the implied warranty of
//  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//  GNU General Public License for more details.
//
//  You should have received a copy of the GNU General Public License
//  along with this program.  If not, see <http://www.gnu.org/licenses/>.
//============================================================================//

function JellyfishOdometer(container) {
	if (!container)
		throw "ERROR: JellyfishOdometer object must be passed a document element.";

	// set up some default values
	this.container = container;
	this.format = '';
	this.digits = 6;
	this.tenths = true;
	this.digitHeight = 40;
	this.digitPadding = 0;
	this.digitWidth = 30;
	this.bustedness = 2;
	this.digitStyle = '';
	this.alignment = 'center';
	this.currentValue = -1;
	this.flat = false;

	this.waitTime = 10;
	this.startValue = 0;
	this.currentValue = 0;
	this.direction = 'up';
	this.wholeNumber = 0;
	this.timestamp = false;
	this.interval = 1;
	this.tickMultiplier = 1;
	this.active = true;
	this.completedFunction = function(){};

	// get all instance specific configuration from container data attributes
	var opts = jQuery(this.container).data();
	for (var key in opts) {
		this[key] = opts[key];
	}

	this.currentValue = this.startValue * this.tickMultiplier;

	if (typeof(this.endValue) != 'undefined' && this.endValue != '' && this.currentValue > this.endValue) {
		this.currentValue = this.endValue;
	}

	// parse the format to allow for fancy counters!
	if (this.format) {
		this.digits = (this.format.match(/0/g) || []).length;
	} else {
		this.format = new Array(this.digits + 1).join('0');
	}

	// continuous counters don't have tenths because of... complications.
	if (this.timestamp)
		this.tenths = false;

	// set up styles based on config options,
	// these will override styles in jellyfish-counter.css
	this.style = {
		digits: "height:" + this.digitHeight + "px; width:" + this.digitWidth +
			"px; padding:" + this.digitPadding + "px; font-size:" +
			(this.digitHeight - (2 * this.digitPadding)) + "px; line-height:" +
			(this.digitHeight - (2 * this.digitPadding)) + "px; " + this.digitStyle,

		columns: "height:" + this.digitHeight + "px; width:" + this.digitWidth +
			"px;"
	};

	this.highlights = [
		"jcw-highlight-1 jcw-highlight",
		"jcw-highlight-2 jcw-highlight",
		"jcw-highlight-3 jcw-highlight",
		"jcw-highlight-4 jcw-sidehighlight",
		"jcw-highlight-5 jcw-sidelowlight",
		"jcw-highlight-6 jcw-lowlight",
		"jcw-highlight-7 jcw-lowlight",
		"jcw-highlight-8 jcw-lowlight"
	];

	this.digitInfo = new Array();

	// Initialise a counter
	this.init = function() {
		this.drawOdometer(this.container);
		if ((this.endValue != this.startValue) && this.active) {
			this.updateOdometer();
		}
	};

	this.setDigitValue = function(digit, val, frac) {
		var di = this.digitInfo[digit];
		var px = Math.floor(this.digitHeight * frac);
		px += di.offset;
		if (val != di.last_val) {
			var tmp = di.digitA;
			di.digitA = di.digitB;
			di.digitB = tmp;
			di.digitA.innerHTML = val;
			di.digitB.innerHTML = (1 + Number(val)) % 10;
			di.last_val = val;
			di.last_px = this.digitHeight;
		}
		if (px != di.last_px) {
			di.digitA.style.top = (0 - px) + "px";
			di.digitB.style.top = (0 - px + this.digitHeight) + "px";
			di.last_px = px;
		}
	};

	// add a digit div to the dom
	this.drawDigit = function(i) {
		var digitDivA = document.createElement("div");
		digitDivA.setAttribute("id", "odometer_digit_" + i + "a");
		digitDivA.className = "jcw-digit";
		digitDivA.style.cssText = this.style.digits;

		var digitDivB = document.createElement("div");
		digitDivB.setAttribute("id", "odometer_digit_" + i + "b");
		digitDivB.className = "jcw-digit";
		digitDivB.style.cssText = this.style.digits;

		var digitColDiv = document.createElement("div");
		digitColDiv.className = "jcw-digit-container";
		digitColDiv.style.cssText = this.style.columns;

		digitColDiv.appendChild(digitDivB);
		digitColDiv.appendChild(digitDivA);
		var offset = Math.floor(Math.random() * this.bustedness);
		this.digitInfo.push({
			digitA: digitDivA,
			digitB: digitDivB,
			last_val: -1,
			last_px: -1,
			offset: offset
		});
		return digitColDiv;
	};

	// add highlight/lowlight divs to the digit div
	// would probably be cleaner using transparent css gradients but this
	// produces a decent stylised effect with greater old browser support
	this.drawHighLights = function(digitColDiv) {
		if (!this.flat) {
			for (var j in this.highlights) {
				var hdiv = document.createElement("div");
				hdiv.innerHTML = "<p></p>"; // For Dumb IE
				hdiv.className = this.highlights[j];
				digitColDiv.appendChild(hdiv);
			}
		}
	};

	// render the complete odometer into the dom
	this.drawOdometer = function(container) {
		switch(this.alignment) {
    	case 'left':
        container.className += ' jcw-left';
        break;
    	case 'right':
        container.className += ' jcw-right';
        break;
    	case 'inline':
        container.className += ' jcw-inline';
        break;
    	default:
        container.className += ' jcw-center';
		}
		var odometerDiv = document.createElement("div");
		odometerDiv.className = "jcw-odometer-div";
		container.appendChild(odometerDiv);

		for (var i = 0; i < this.format.length; i++) {
			var character = this.format.charAt(i);
			if (character == '0') {
				var digitColDiv = this.drawDigit(i);
			} else {
				var separator = document.createElement("div");
				separator.innerHTML = character;
				separator.className = "jcw-digit";
				separator.style.cssText = this.style.digits;
				var digitColDiv = document.createElement("div");
				digitColDiv.className = "jcw-digit-container";
				digitColDiv.style.cssText = this.style.columns;
				digitColDiv.appendChild(separator);
			}
			this.drawHighLights(digitColDiv);
			odometerDiv.appendChild(digitColDiv);
		};

		if (this.tenths) {
			this.digitInfo[this.digits - 1].digitA.className = "jcw-tenth";
			this.digitInfo[this.digits - 1].digitB.className = "jcw-tenth";
		}

		if (this.currentValue >= 0) this.set(this.currentValue);
	};

	// Do the counting!
	// The maths isn't precise here as JavaScript execution speed varies
	// greatly depending on applications, devices and load...
	// Increment/Decrement values used here have been tweaked to work
	// reasonably in most situations which is good enough as this is
	// just supposed to be a visual effect not a scientific instrument!
	this.updateOdometer = function() {
		if (this.timestamp) {
			this.currentValue = (this.direction == 'down') ?
				this.currentValue - 0.15 : this.currentValue + 0.15;
			this.wholeNumber = this.wholeNumber + 0.15;
			if (this.wholeNumber >= this.tickMultiplier) {
				this.wholeNumber = 0;
				this.currentValue = Math.round(this.currentValue);
				this.waitTime = this.interval * 1000;
			} else {
				this.waitTime = 1;
			}
		} else {
			this.currentValue = (this.direction == 'down') ?
				this.currentValue - 0.01 : this.currentValue + 0.01;
		}
		if (this.active &&
				(this.direction != 'down' && ( ! this.endValue || (this.currentValue < this.endValue))) ||
				(this.direction == 'down' && (this.currentValue > this.endValue))
			) {
			this.set(this.currentValue);
			var that = this;
			window.setTimeout(function() {
				that.updateOdometer();
			}, this.waitTime);
		} else {
			this.active = false;
			this.completedFunction();
		}
	};

	// sets the current value of the counter
	// newValue must not be less than 0 but doesn't have to be an integer
	this.set = function(newValue) {
		if (newValue < 0)
			newValue = 0;
		this.currentValue = newValue;
		if (this.tenths)
			newValue = newValue * 10;
		var wholeNumber = Math.floor(newValue);
		var fraction = newValue - wholeNumber;
		wholeNumber = String(wholeNumber);
		for (var i = 0; i < this.digits; i++) {
			var digit = wholeNumber.substring(wholeNumber.length - i - 1, wholeNumber.length - i) || 0;
			this.setDigitValue(this.digits - i - 1, digit, fraction);
			if (digit != 9)
				fraction = 0;
		}
	};

	// returns the current value of the counter
	this.get = function() {
		return (this.currentValue);
	};

	// starts a counter if it still has some counting to do
	// if the counter has already finished you need to reset() first
	this.start = function() {
		this.active = true;
		this.updateOdometer();
	}

	// stops/pauses an active counter, can be resumed with start()
	this.stop = function() {
		this.active = false;
	}

	// resets a counter to it's initial (start) value,
	// continuous counters will reset to the value they had at page load
	this.reset = function() {
		this.currentValue = this.startValue;
		this.wholeNumber = 0;
	}

}