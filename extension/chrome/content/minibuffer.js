/* Copyright (C) 2014 Joren Van Onder */

/* This program is free software; you can redistribute it and/or modify */
/* it under the terms of the GNU General Public License as published by */
/* the Free Software Foundation; either version 3 of the License, or */
/* (at your option) any later version. */

/* This program is distributed in the hope that it will be useful, */
/* but WITHOUT ANY WARRANTY; without even the implied warranty of */
/* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the */
/* GNU General Public License for more details. */

/* You should have received a copy of the GNU General Public License */
/* along with this program; if not, write to the Free Software Foundation, */
/* Inc., 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301  USA */

firebinder.minibuffer = function () {
    return {
	currentInteractive: null,
	allCompletions: [],
	possibleCompletions: [],
	match: null,

	prefixMatch: function (str, userInput) {
	    return str.startsWith(userInput);
	},

	handleCharacter: function (event) {
	    var minibufferInput = document.getElementById("minibuffer-input");
	    firebinder.hooks.run("minibuffer.inputCharacter");

	    if (event.key === "Enter") {
		if (this.allCompletions.length === 0) {
		    this.currentInteractive.onComplete(minibufferInput.value);
		    this.reset();
		} else if (this.possibleCompletions.length === 1) {
		    this.currentInteractive.onComplete(this.possibleCompletions[0]);
		    this.reset();
		} else {
		    this.showPossibleCompletions();
		}

		firebinder.hooks.run("minibuffer.inputCharacterEnter");
	    } else if (event.key === "Tab") {
		event.stopPropagation();
		event.preventDefault();

		var inputUpdated = this.completeToLongestCommonPrefix();

		if (! inputUpdated) {
		    this.showPossibleCompletions();
		} else {
		    this.handleInput();
		}

		firebinder.hooks.run("minibuffer.inputCharacterTab");
	    }
	},

	handleInput: function () {
	    var minibufferInput = document.getElementById("minibuffer-input");
	    var input = minibufferInput.value;

	    if (input.length >= 1) {
		minibufferInput.size = input.length;
	    } else {
		minibufferInput.size = 1;
	    }

	    this.updatePossibleCompletions();

	    firebinder.hooks.run("minibuffer.afterInput");
	},

	reset: function () {
	    firebinder.hooks.run("minibuffer.onReset");
	    this.hide();
	    this.currentInteractive = null;
	    this.allCompletions = [];
	    this.possibleCompletions = [];
	    this.match = this.prefixMatch;

	    this.setPrompt("");
	    document.getElementById("minibuffer-input").value = "";
	    document.getElementById("minibuffer-input").size = 1;
	    this.updatePossibleCompletions();
	    this.hidePossibleCompletions();
	    this.resetMinibufferExtra();
	},

	resetMinibufferExtra: function () {
	    var minibufferExtraBox = document.getElementById("minibuffer-extra");

	    while (minibufferExtraBox.hasChildNodes()) {
		minibufferExtraBox.removeChild(minibufferExtraBox.firstChild);
	    }
	},

	show: function () {
	    document.getElementById("minibuffer-box").hidden = false;
	    document.getElementById("minibuffer-input").focus();
	},

	hide: function () {
	    document.getElementById("minibuffer-box").hidden = true;
	},

	setPrompt: function (str) {
	    document.getElementById("minibuffer-prompt").value = str;
	},

	setInteractive: function (interactive) {
	    this.currentInteractive = interactive;
	},

	start: function () {
	    firebinder.hooks.run("minibuffer.start");
	    if (this.currentInteractive.getCompletions) {
		this.allCompletions = this.currentInteractive.getCompletions();
	    }

	    // default matching is prefix matching
	    if (! this.match) {
		this.match = this.prefixMatch;
	    }

	    this.updatePossibleCompletions();

	    this.setPrompt(this.currentInteractive.prompt);
	    this.show();
	},

	updatePossibleCompletions: function () {
	    var minibufferInput = document.getElementById("minibuffer-input").value;
	    var possibleCompletionsBox = document.getElementById("minibuffer-completions-box");

	    while (possibleCompletionsBox.hasChildNodes()) {
		possibleCompletionsBox.removeChild(possibleCompletionsBox.firstChild);
	    }

	    this.possibleCompletions = [];

	    this.allCompletions.forEach(function (element, index, array) {
		if (this.match(element.displayValue, minibufferInput)) {
		    var newLabel = firebinder.utils.createLabel(element.displayValue, "");
		    possibleCompletionsBox.appendChild(newLabel);

		    this.possibleCompletions.push(element);
		}
	    }, this);
	},

	showPossibleCompletions: function () {
	    var possibleCompletionsBox = document.getElementById("minibuffer-completions-box");

	    if (this.possibleCompletions.length > 0) {
		possibleCompletionsBox.hidden = false;
	    } else {
		possibleCompletionsBox.hidden = true;
	    }
	},

	hidePossibleCompletions: function () {
	    var possibleCompletionsBox = document.getElementById("minibuffer-completions-box");

	    possibleCompletionsBox.hidden = true;
	},

	completeToLongestCommonPrefix: function () {
	    if (this.possibleCompletions.length === 0) {
		return false;
	    } else if (this.possibleCompletions.length === 1) {
		return this.updateInputIfNecessary(this.possibleCompletions[0].displayValue);
	    } else {
		var prefixFound = false;
		var charIndex;

		for (charIndex = 0; charIndex < this.possibleCompletions[0].displayValue.length && ! prefixFound; ++charIndex) {
		    for (var possibleCompletionIndex = 1;
			 possibleCompletionIndex < this.possibleCompletions.length && ! prefixFound;
			 ++possibleCompletionIndex) {
			if (this.possibleCompletions[0].displayValue[charIndex] !== this.possibleCompletions[possibleCompletionIndex].displayValue[charIndex]) {
			    prefixFound = true;
			}
		    }
		}

		return this.updateInputIfNecessary(this.possibleCompletions[0].displayValue.substring(0, charIndex - 1));
	    }
	},

	updateInputIfNecessary: function (str) {
	    var minibufferInput = document.getElementById("minibuffer-input");

	    if (! str.startsWith(minibufferInput.value) || minibufferInput.value === str) {
		return false;
	    } else {
		minibufferInput.value = str;
		return true;
	    }
	}
    };
}();
