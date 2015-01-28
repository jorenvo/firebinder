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

// https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent.key#Key_values_on_Linux_%28GTK%29
firebinder.Key = function (key, ctrl, alt) {
    var _key = key || "";
    var _ctrl = ctrl || false;
    var _alt = alt || false;
    var _stopped = false;

    return {
	key: _key,
	ctrl: _ctrl,
	alt: _alt,
	stopped: _stopped,

	convertFromString: function (keyString) {
	    if (keyString.startsWith("C")) {
		this.key = keyString.substring(2);
		this.ctrl = true;
	    } else if (keyString.startsWith("M")) {
		this.key = keyString.substring(2);
		this.alt = true;
	    } else {
		this.key = keyString;
	    }
	},

	convertFromEvent: function (keyEvent) {
	    if (keyEvent.key && keyEvent.key !== "Unidentified") {
		this.key = keyEvent.key;
	    } else if (keyEvent.charCode) { // events resent with sendKeyEvent do not set the key attribute
		this.key = String.fromCharCode(keyEvent.charCode);
	    } else { // both key and charcode are not set, probably something like an arrow key
		return false;
	    }

	    this.ctrl = keyEvent.ctrlKey;
	    this.alt = keyEvent.altKey;

	    return true;
	},

	convertToString: function () {
	    var string = "";

	    if (this.ctrl) {
		string += "C-";
	    }

	    if (this.alt) {
		if (! string) {
		    string += "M-";
		} else {
		    string += "-M-";
		}
	    }

	    string += this.key;

	    return string;
	},

	equals: function (otherKey) {
	    if (this.key == otherKey.key &&
		this.ctrl == otherKey.ctrl &&
		this.alt == otherKey.alt) {
		return true;
	    } else {
		return false;
	    }
	}
    };
};

firebinder.AbstractKeyList = function (s) {
    var sequence = s || [];

    return {
	sequence: sequence,

	convertFromString: function (keyArray) {
	    keyArray.forEach(function (element, index, array) {
		var key = firebinder.Key();

		key.convertFromString(element);
		sequence.push(key);
	    });
	},

	convertToString: function () {
	    var string = "";

	    sequence.forEach(function (element, index, array) {
		string += element.convertToString();

		if (index != array.length - 1) {
		    string += " ";
		}
	    });

	    return string;
	},

	addKeyFromEvent: function (keyEvent) {
	    var key = firebinder.Key();

	    if(! key.convertFromEvent(keyEvent)) {
		return false;
	    } else {
		sequence.push(key);
		return true;
	    }
	},

	stoppedLastKey: function () {
	    sequence[sequence.length - 1].stopped = true;
	},

	getLastKey: function () {
	    return sequence[sequence.length - 1];
	},

	getStopped: function () {
	    var stopped = [];

	    for (var i = 0, llen = sequence.length; i < llen; ++i) {
		if (sequence[i].stopped) {
		    stopped.push(sequence[i]);
		}
	    }

	    return stopped;
	},

	matches: function () {
	    console.error("matches() not implemented");
	},

	cleanupStopped: function () {
	    console.error("cleanupStopped() not implemented");
	}
    };
};

firebinder.KeySequence = function (s) {
    var abstractKeyList = firebinder.AbstractKeyList(s);

    abstractKeyList.matches = function (otherKeySequence, partial) {
	if (otherKeySequence.sequence.length > abstractKeyList.sequence.length) {
	    return false;
	}

	for (var i = 0, llen = otherKeySequence.sequence.length; i < llen; ++i) {
	    if (! otherKeySequence.sequence[i].equals(abstractKeyList.sequence[i])) {
		return false;
	    }
	}

	if (otherKeySequence.sequence.length === abstractKeyList.sequence.length) { // full match
	    return true;
	} else { // partial match
	    if (partial) {
		return true;
	    } else {
		return false;
	    }
	}
    };

    abstractKeyList.cleanupStopped = function () {
    }; // stopped KeySequences are not redispatched

    return abstractKeyList;
};

firebinder.KeyChord = function (s) {
    var abstractKeyList = firebinder.AbstractKeyList(s);

    abstractKeyList.matches = function (otherKeyChord, partial) {
	if (otherKeyChord.sequence.length > abstractKeyList.sequence.length) {
	    return false;
	}

	var amountOfMatchingKeys = 0;
	var sequenceCopy = abstractKeyList.sequence.slice(0); // copy array (important: copied array references same objects)

	for (var i = 0, llenOther = otherKeyChord.sequence.length; i < llenOther; ++i) {
	    var matchFound = false;
	    for (var j = 0; j < sequenceCopy.length; ++j) {
		if (otherKeyChord.sequence[i].equals(sequenceCopy[j])) {
		    matchFound = true;
		    ++amountOfMatchingKeys;
		    sequenceCopy.splice(j, 1);
		    break;
		}
	    }

	    if (! matchFound) {
		return false;
	    }
	}

	if (amountOfMatchingKeys === abstractKeyList.sequence.length) { // full match
	    return true;
	} else if (partial && amountOfMatchingKeys > 0) { // partial match
	    return true;
	} else {
	    return false;
	}
    };

    abstractKeyList.isSingle = function () {
	var multipleKeys = false;

	for (var i = 1, llen = abstractKeyList.sequence.length; i < llen && ! multipleKeys; ++i) {
	    if (! abstractKeyList.sequence[0].equals(abstractKeyList.sequence[i])) {
		multipleKeys = true;
	    }
	}

	return ! multipleKeys;
    };

    // redispatch the keys in the KeyChord that were stopped
    abstractKeyList.cleanupStopped = function () {
	this.sequence.forEach(function (element, index, array) {
	    if (element.stopped) {
		firebinder.utils.dispatchCharCode(element.key.charCodeAt(), element.ctrl, element.alt);
	    }
	});
    };

    return abstractKeyList;
};

firebinder.KeyboardShortcut = function (keyboardShortcut, callback) {
    var abstractKeyList = null;
    var command = callback;

    if (keyboardShortcut[0].startsWith("C-") || keyboardShortcut[0].startsWith("M-")) {
	abstractKeyList = firebinder.KeySequence();
    } else {
	abstractKeyList = firebinder.KeyChord();
    }

    abstractKeyList.convertFromString(keyboardShortcut);

    return {
	abstractKeyList: abstractKeyList,
	command: command,

	matches: function (keySequence, partial) {
	    return this.abstractKeyList.matches(keySequence, partial);
	}
    };
};

firebinder.KeyboardShortcutMapSearchResult = function () {
    return {
	match: null,
	partialMatches: [],

	containsSingleKeyChord: function () {
	    for (var i = 0, llen = this.partialMatches.length; i < llen; ++i) {
		if (this.partialMatches[i].abstractKeyList.isSingle()) {
		    return true;
		}
	    }

	    return false;
	}
    };
};

firebinder.keyboardShortcutMap = function () {
    var map = [];
    var overridden = [];

    return {
	add: function (k) {
	    map.push(k);
	},

	remove: function (k) {
	    var spliced = false;

	    for(var i = 0, len = map.length; i < len && ! spliced; ++i) {
		if (map[i].matches(k.abstractKeyList, false)) {
		    map.splice(i, 1);
		    spliced = true;
		}
	    }
	},

	addOverride: function (k) {
	    var defaultBinding = this.search(k.abstractKeyList);

	    if (defaultBinding.match) {
		this.remove(defaultBinding.match);
		overridden.push(defaultBinding.match);
	    } else {
		k.fakeOverride = true;
		overridden.push(k);
	    }
	    this.add(k);
	},

	removeOverrides: function () {
	    for(var i = 0, len = overridden.length; i < len; ++i) {
		this.remove(overridden[i]); // remove the current binding from map

		if (! overridden[i].fakeOverride) {
		    this.add(overridden[i]); // add the old one
		}
	    }

	    overridden = [];
	},

	search: function (k) {
	    var searchResult = firebinder.KeyboardShortcutMapSearchResult();
	    var lastMatchedIndex = 0;

	    for (var i = 0, llen = map.length; i < llen; ++i) {
		if (map[i].matches(k, true)) {
		    searchResult.partialMatches.push(map[i]);
		    lastMatchedIndex = i;
		}
	    }

	    if (searchResult.partialMatches.length === 1) {
		if (map[lastMatchedIndex].matches(k, false)) {
		    searchResult.match = map[lastMatchedIndex];
		}
	    }

	    return searchResult;
	}
    };
}();

firebinder.keyPressHandler = function () {
    var keyList = null;
    var redispatchedKeys = [];
    var keyChordDelayTimeout = null;
    var currentSearchResult = null;

    var setup = function (e) {
	if (e.ctrlKey || e.altKey) {
	    keyList = firebinder.KeySequence();
	} else {
	    keyList = firebinder.KeyChord();
	    initKeyChordDelayTimeout();
	}
    };

    var reset = function () {
	keyList = null;
    };

    var stopEvent = function (e) {
	e.stopPropagation();
	e.preventDefault();
	keyList.stoppedLastKey();
    };

    var handledKeyAlready = function (currentKey) {
	var handledKeyIndex = -1;

	for (var i = 0, llen = redispatchedKeys.length; i < llen && handledKeyIndex === -1; ++i) {
	    if (redispatchedKeys[i].equals(currentKey)) {
		handledKeyIndex = i;
	    }
	}

	return handledKeyIndex;
    };

    var initKeyChordDelayTimeout = function () {
	keyChordDelayTimeout = setTimeout(function () {
	    if (! currentSearchResult.containsSingleKeyChord()) {
		cleanupKeyChord();
	    } else {
		keyChordDelayTimeout = setTimeout(function () {
		    cleanupKeyChord();
		}, 100);
	    }
	}, 100);
    };

    var clearKeyChordDelayTimeout = function () {
	clearTimeout(keyChordDelayTimeout);
	keyChordDelayTimeout = null;
    };

    var cleanupKeyChord = function () {
	redispatchedKeys = keyList.getStopped();
	keyList.cleanupStopped();
	reset();
    };

    return {
	listener: function (e) {
	    if (! keyList) {
		setup(e);
	    }

	    if (! keyList.addKeyFromEvent(e)) {
		clearKeyChordDelayTimeout();
		reset();
		return;
	    }

	    var handledKeyIndex = handledKeyAlready(keyList.getLastKey());
	    if (handledKeyIndex > -1) {
		redispatchedKeys.splice(handledKeyIndex, 1);
		clearKeyChordDelayTimeout();
		reset();
		return;
	    }

	    currentSearchResult = firebinder.keyboardShortcutMap.search(keyList);

	    if (currentSearchResult.match) {
		firebinder.display.inStatusPanel(keyList.convertToString());
		clearKeyChordDelayTimeout();

		currentSearchResult.match.command(e);
		firebinder.variables.commandHistory.insert(currentSearchResult.match.command);
		stopEvent(e);
		reset();
	    } else if (currentSearchResult.partialMatches.length > 0) {
		firebinder.display.inStatusPanel(keyList.convertToString());

		stopEvent(e);
	    } else { /* no future matches possible */
		clearKeyChordDelayTimeout();
		cleanupKeyChord();
	    }
	},

	start: function () {
	    window.addEventListener("keypress",
				    firebinder.keyPressHandler.listener,
				    true);
	},

	stop: function () {
	    window.removeEventListener("keypress",
				       firebinder.keyPressHandler.listener,
				       true);
	}
    };
}();

(function () {
    firebinder.keyPressHandler.start();
})();
