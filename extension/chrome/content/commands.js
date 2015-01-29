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

firebinder.commands = function () {
    var incSearch = function (backward) {
	if (gFindBar.hidden) {
	    let originalScrollX = gBrowser.contentWindow.scrollX;
	    let originalScrollY = gBrowser.contentWindow.scrollY;

	    firebinder.keyboardShortcutMap.addOverride(firebinder.KeyboardShortcut(["C-g"], function () {
		gBrowser.contentWindow.scroll(originalScrollX, originalScrollY);
		gFindBar.close();
		gFindBar.toggleHighlight(false);
		firebinder.keyboardShortcutMap.removeOverrides();
	    }));

	    firebinder.keyboardShortcutMap.addOverride(firebinder.KeyboardShortcut(["Enter"], function () {
		gFindBar.close();
		gFindBar.toggleHighlight(false);
		firebinder.keyboardShortcutMap.removeOverrides();
	    }));

	    gFindBar.onFindCommand();
	    gFindBar.clear();
	    gFindBar.toggleHighlight(true);
	    gFindBar.getElement("highlight").setAttribute("checked", "true");
	} else {
	    gFindBar.onFindAgainCommand(backward);
	}
    };

    var moveAutoComplete = function (up) {
	var controller = Components.classes['@mozilla.org/autocomplete/controller;1'].getService(Components.interfaces.nsIAutoCompleteController);

	if (up) {
	    controller.handleKeyNavigation(KeyEvent.DOM_VK_UP);
	} else {
	    controller.handleKeyNavigation(KeyEvent.DOM_VK_DOWN);
	}
    };

    var insertClipboardInKillRing = function () {
	firebinder.variables.killRing.insert(firebinder.utils.getFromClipboard());
	firebinder.variables.killRingYankPointer = 0;
    };

    var clearSelection = function (e) {
	var target = e.originalTarget;

	/* Just using cmd_selectNone isn't very good because it
	 * complains about InvalidStateErrors a lot. Also it
	 * doesn't seem to set the cursor where you would expect
	 * it.
	 *
	 * example:
	 * some |words   [C-SPC] [M-f]
	 * some words|   [C-g]
	 * some |words
	 *
	 * In this example the cursor should have been be at the
	 * end of the sentence, after 'word'. So the following
	 * attempts to fix the cursor position manually before
	 * running cmd_selectNone. */
	if (typeof(target.selectionEnd) !== "undefined") {
	    if (target.selectionEnd > firebinder.variables.mark) {
		target.setSelectionRange(target.selectionEnd, target.selectionEnd);
	    } else {
		target.setSelectionRange(target.selectionStart, target.selectionStart);
	    }
	}

	firebinder.variables.markIsSet = false;
	firebinder.variables.mark = 0;

	goDoCommand("cmd_selectNone");
    };

    return {
	keyboardQuit: function (e) {
	    clearSelection(e);
	    firebinder.minibuffer.reset();
	},

	pageDown: function () {
	    goDoCommand("cmd_scrollPageDown");
	},

	pageUp: function () {
	    goDoCommand("cmd_scrollPageUp");
	},

	scrollTop: function () {
	    if (! firebinder.variables.markIsSet) {
		goDoCommand("cmd_scrollTop");
	    } else {
		goDoCommand("cmd_selectTop");
	    }
	},

	scrollBottom: function () {
	    if (! firebinder.variables.markIsSet) {
		goDoCommand("cmd_scrollBottom");
	    } else {
		goDoCommand("cmd_selectBottom");
	    }
	},

	selectAll: function () {
	    goDoCommand("cmd_selectAll");
	},

	scrollLineUp: function (e) {
	    if (! firebinder.variables.markIsSet) {
		if (e.target.id === "urlbar") {
		    moveAutoComplete(true);
		}

		goDoCommand("cmd_scrollLineUp");
		goDoCommand("cmd_linePrevious");
	    } else {
		goDoCommand("cmd_selectLinePrevious");
	    }
	},

	scrollLineDown: function (e) {
	    if (! firebinder.variables.markIsSet) {
		if (e.target.id === "urlbar") {
		    moveAutoComplete(false);
		}

		goDoCommand("cmd_scrollLineDown");
		goDoCommand("cmd_lineNext");
	    } else {
		goDoCommand("cmd_selectLineNext");
	    }
	},

	scrollLeft: function () {
	    if (! firebinder.variables.markIsSet) {
		goDoCommand("cmd_charPrevious");
		goDoCommand("cmd_scrollLeft");
	    } else {
		goDoCommand("cmd_selectCharPrevious");
	    }
	},

	scrollRight: function () {
	    if (! firebinder.variables.markIsSet) {
		goDoCommand("cmd_charNext");
		goDoCommand("cmd_scrollRight");
	    } else {
		goDoCommand("cmd_selectCharNext");
	    }
	},

	deleteWordBackward: function () {
	    goDoCommand("cmd_selectWordPrevious");
	    firebinder.commands.cut();
	},

	deleteWordForward: function () {
	    goDoCommand("cmd_selectWordNext");
	    firebinder.commands.cut();
	},

	deleteCharForward: function () {
	    goDoCommand("cmd_deleteCharForward");
	},

	killLine: function () {
	    goDoCommand("cmd_selectEndLine");
	    firebinder.commands.cut();
	},

	beginningOfLine: function () {
	    if (! firebinder.variables.markIsSet) {
		goDoCommand("cmd_beginLine");
	    } else {
		goDoCommand("cmd_selectBeginLine");
	    }
	},

	endOfLine: function () {
	    if (! firebinder.variables.markIsSet) {
		goDoCommand("cmd_endLine");
	    } else {
		goDoCommand("cmd_selectEndLine");
	    }
	},

	wordNext: function () {
	    if (! firebinder.variables.markIsSet) {
		goDoCommand("cmd_wordNext");
	    } else {
		goDoCommand("cmd_selectWordNext");
	    }
	},

	wordPrevious: function () {
	    if (! firebinder.variables.markIsSet) {
		goDoCommand("cmd_wordPrevious");
	    } else {
		goDoCommand("cmd_selectWordPrevious");
	    }
	},

	copy: function (e) {
	    goDoCommand("cmd_copy");
	    clearSelection(e);
	    insertClipboardInKillRing();
	},

	cut: function () {
	    goDoCommand("cmd_cut");
	    firebinder.variables.markIsSet = false;
	    firebinder.variables.mark = 0;
	    insertClipboardInKillRing();
	},

	yank: function () {
	    goDoCommand("cmd_paste");

	    /* Deal with copies from outside Firefox. When something
	     * is yanked that isn't in the killring it will be pasted
	     * and then inserted in the killring. This killring
	     * insertion is handled just as if the text is being
	     * copied in Firefox, so the killRingYankPointer is reset
	     * to 0. As far as I can tell this is what happens in GNU
	     * Emacs. */
	    if (firebinder.variables.killRing.ref(firebinder.variables.killRingYankPointer) !== firebinder.utils.getFromClipboard()) {
		insertClipboardInKillRing();
	    }
	},

	yankPop: function () {
	    if (firebinder.variables.commandHistory.ref(0) === firebinder.commands.yank ||
		firebinder.variables.commandHistory.ref(0) === firebinder.commands.yankPop) {
		for (var i = 0, llen = firebinder.utils.getFromClipboard().length; i < llen; ++i) {
		    goDoCommand("cmd_deleteCharBackward");
		}

		++firebinder.variables.killRingYankPointer;
		firebinder.utils.putOnClipboard(firebinder.variables.killRing.ref(firebinder.variables.killRingYankPointer));
		goDoCommand("cmd_paste");
	    } else {
		firebinder.display.inStatusPanel("Previous command was not a yank");
	    }
	},

	goBack: function () {
	    BrowserBack();
	},

	goForward: function () {
	    BrowserForward();
	},

	reloadTab: function () {
	    BrowserReload();
	},

	undoCloseTab: function () {
	    undoCloseTab();
	},

	findForward: function () {
	    incSearch(false);
	},

	findBackward: function () {
	    incSearch(true);
	},

	setMark: function (e) {
	    clearSelection(e);
	    firebinder.variables.markIsSet = true;
	    firebinder.variables.mark = e.originalTarget.selectionStart;
	},

	// interactive commands
	switchTabInteractive: firebinder.Interactive("switchTab", "tab:",
						     firebinder.utils.getCurrentTabCompletions(true),
						     firebinder.utils.switchTab),

	killTabInteractive: firebinder.Interactive("killTab", "tab:",
						   firebinder.utils.getCurrentTabCompletions(false),
						   firebinder.utils.killTab)
    };
}();
