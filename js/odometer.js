//============================================================================//
//  Animated Odometer class for use in Jellyfish Counter Widget for WordPress
//  Version 1.6
//  Copyright (C) 2014 Robert Miller
//  http://strawberryjellyfish.com
//
//  Originally based on
//  Gavin Brock's CSS/JavaScript Animated Odometer
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

function Odometer(container) {
	if (!container) throw "ERROR: Odometer object must be passed a document element.";

	this.container = container;
	this.format = '';
	this.digits = 6;
	this.tenths = true;
	this.digitHeight = 40;
	this.digitPadding = 0;
	this.digitWidth = 30;
	this.bustedness = 2;
	this.fontStyle =
		"font-family: Courier New, Courier, monospace; font-weight: 900;";
	this.value = 0;
	this.disableHighlights = false;

	this.waitTime = 10;
	this.startValue = 0;
	this.endValue = 100;
	this.currentValue = 0;
	this.direction = 'up';
	this.wholeNumber = 0;
	this.persist = false;
	this.persistInterval = 1;
	var opts = jQuery(this.container).data();
	console.log(opts);
	for (var key in opts) {
		console.log(key + " " +opts[key]);
		this[key] = opts[key];
	}

	this.currentValue = this.startValue;
	// format allows for non counting characters in the counter,
	// e.g a prefix or separator character
	// if defined we'll override the number of digits to the number
	// of 0 found in the format string.
	// if we don't have a format string, define one based on number of digits
	if (this.format) {
		this.digits = (this.format.match(/0/g) || []).length;
	} else {
		this.format = new Array(this.digits + 1).join('0');
	}

	this.style = {
		digits: "position:absolute; height:" + this.digitHeight + "px; width:" + (
			this.digitWidth - (2 * this.digitPadding)) + "px; " +
			"padding:" + this.digitPadding + "px; font-size:" + (this.digitHeight - (2 *
				this.digitPadding)) + "px; " +
			"line-height:" + this.digitHeight + "px; " +
			"background:black; color:white; text-align:center; " + this.fontStyle,
		columns: "position:relative; float:left; overflow:hidden;" +
			"height:" + this.digitHeight + "px; width:" + this.digitWidth + "px;",
		highlight: "position:absolute; background:white; opacity:0.25; filter:alpha(opacity=25); width:100%; left:0px;",
		lowlight: "position:absolute; background:black; opacity:0.25; filter:alpha(opacity=25); width:100%; left:0px;",
		sidehighlight: "position:absolute; background:white; opacity:0.50; filter:alpha(opacity=50); height:100%; top:0px;",
		sidelowlight: "position:absolute; background:black; opacity:0.50; filter:alpha(opacity=50); height:100%; top:0px;"
	};

	this.highlights = [
		"top:20%;   height:32%;" + this.style.highlight,
		"top:27.5%; height:16%;" + this.style.highlight,
		"top:32.5%; height:6%;" + this.style.highlight,
		"right:0%;  width:6%;" + this.style.sidelowlight,
		"left:0%;   width:4%;" + this.style.sidehighlight,
		"top:0%;    height:14%;" + this.style.lowlight,
		"bottom:0%; height:25%;" + this.style.lowlight,
		"bottom:0%; height:8%;" + this.style.lowlight
	];

	this.digitInfo = new Array();

	this.setDigitValue = function(digit, val, frac) {
		var di = this.digitInfo[digit];
		var px = Math.floor(this.digitHeight * frac);
		px = px + di.offset;
		if (val != di.last_val) {
			var tmp = di.digitA;
			di.digitA = di.digitB;
			di.digitB = tmp;
			di.digitA.innerHTML = val;
			di.digitB.innerHTML = (1 + Number(val)) % 10;
			di.last_val = val;
		}
		if (px != di.last_px) {
			di.digitA.style.top = (0 - px) + "px";
			di.digitB.style.top = (0 - px + this.digitHeight) + "px";
			di.last_px = px;
		}
	};

	this.set = function(inVal) {
		if (inVal < 0) throw "ERROR: Odometer value cannot be negative.";
		this.value = inVal;
		if (this.tenths) inVal = inVal * 10;
		var numb = Math.floor(inVal);
		var frac = inVal - numb;
		numb = String(numb);
		for (var i = 0; i < this.digits; i++) {
			var num = numb.substring(numb.length - i - 1, numb.length - i) || 0;
			this.setDigitValue(this.digits - i - 1, num, frac);
			if (num != 9) frac = 0;
		}
	};

	this.get = function() {
		return (this.value);
	};

	this.drawDigit = function(i) {
		var digitDivA = document.createElement("div");
		digitDivA.setAttribute("id", "odometer_digit_" + i + "a");
		digitDivA.style.cssText = this.style.digits;

		var digitDivB = document.createElement("div");
		digitDivB.setAttribute("id", "odometer_digit_" + i + "b");
		digitDivB.style.cssText = this.style.digits;

		var digitColDiv = document.createElement("div");
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

	this.drawHighLights = function(digitColDiv) {
		if (!this.disableHighlights) {
			for (var j in this.highlights) {
				var hdiv = document.createElement("div");
				hdiv.innerHTML = "<p></p>"; // For Dumb IE
				hdiv.style.cssText = this.highlights[j];
				digitColDiv.appendChild(hdiv);
			}
		}
	};

	this.drawOdometer = function(container) {
		var odometerDiv = document.createElement("div")
		odometerDiv.style.cssText = "text-align: left; width:" + (this.digitWidth * (
		this.format.length)) + "px; height:" + this.digitHeight + "px";
		container.appendChild(odometerDiv);

		for (var i = 0; i < this.format.length; i++) {
			var character = this.format.charAt(i);
			if (character == '0') {
				var digitColDiv = this.drawDigit(i);
			} else {
				var separator = document.createElement("div");
				separator.innerHTML = character;
				separator.style.cssText = this.style.digits;
				var digitColDiv = document.createElement("div");
				digitColDiv.style.cssText = this.style.columns;
				digitColDiv.appendChild(separator);
			}
        	this.drawHighLights(digitColDiv);
        	odometerDiv.appendChild(digitColDiv);
		};

		if (this.tenths) {
			this.digitInfo[this.digits - 1].digitA.style.background = "#cccccc";
			this.digitInfo[this.digits - 1].digitB.style.background = "#cccccc";
			this.digitInfo[this.digits - 1].digitA.style.color = "#000000";
			this.digitInfo[this.digits - 1].digitB.style.color = "#000000";
		}

		if (this.value >= 0) this.set(this.value);
	};

	this.updateOdometer = function() {
		if (this.persist) {
			if (this.direction == 'down') {
				this.currentValue = this.currentValue - 0.15;
			} else {
				this.currentValue = this.currentValue + 0.15;
			}
			this.wholeNumber = this.wholeNumber + 0.15;
			if (this.wholeNumber >= 1) {
				this.wholeNumber = 0;
				this.currentValue = Math.round(this.currentValue);
				this.waitTime = this.persistInterval * 1000;
			} else {
				this.waitTime = 1;
			}
		} else {
			if (this.direction == 'down') {
				this.currentValue = this.currentValue - 0.01;
			} else {
				this.currentValue = this.currentValue + 0.01;
			}
		}
		if (( this.direction != 'down' && (this.currentValue < this.endValue)) ||
		    (this.direction == 'down' && (this.currentValue > this.endValue))) {
			this.set(this.currentValue);
			var that = this;
			window.setTimeout(function() {
				that.updateOdometer();
			}, this.waitTime);
		}
	};

	this.init = function(paused) {
		this.drawOdometer(this.container);
		if ( this.endValue != this.startValue) {
			this.set(this.startValue);
			if (!paused)
				this.updateOdometer();
		} else {
			this.set(this.startValue);
		}
	};
}