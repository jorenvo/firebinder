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

    return {
	keyboardQuit: function () {
	    goDoCommand("cmd_selectNone");
	    firebinder.minibuffer.reset();
	},

	pageDown: function () {
	    goDoCommand("cmd_scrollPageDown");
	},

	pageUp: function () {
	    goDoCommand("cmd_scrollPageUp");
	},

	scrollTop: function () {
	    goDoCommand("cmd_scrollTop");
	},

	scrollBottom: function () {
	    goDoCommand("cmd_scrollBottom");
	},

	selectAll: function () {
	    goDoCommand("cmd_selectAll");
	},

	scrollLineUp: function (e) {
	    if (e.target.id === "urlbar") {
		moveAutoComplete(true);
	    }

	    goDoCommand("cmd_scrollLineUp");
	    goDoCommand("cmd_linePrevious");
	},

	scrollLineDown: function (e) {
	    if (e.target.id === "urlbar") {
		moveAutoComplete(false);
	    }

	    goDoCommand("cmd_scrollLineDown");
	    goDoCommand("cmd_lineNext");
	},

	scrollLeft: function () {
	    goDoCommand("cmd_scrollLeft");
	    goDoCommand("cmd_charPrevious");
	},

	scrollRight: function () {
	    goDoCommand("cmd_scrollRight");
	    goDoCommand("cmd_charNext");
	},

	deleteWordBackward: function () {
	    goDoCommand("cmd_deleteWordBackward");
	},

	deleteCharForward: function () {
	    goDoCommand("cmd_deleteCharForward");
	},

	deleteWordForward: function () {
	    goDoCommand("cmd_deleteWordForward");
	},

	killLine: function () {
	    goDoCommand("cmd_deleteToEndOfLine");
	},

	wordPrevious: function () {
	    goDoCommand("cmd_wordPrevious");
	},

	beginningOfLine: function () {
	    goDoCommand("cmd_beginLine");
	},

	endOfLine: function () {
	    goDoCommand("cmd_endLine");
	},

	wordNext: function () {
	    goDoCommand("cmd_wordNext");
	},

	copy: function () {
	    goDoCommand("cmd_copy");
	},

	cut: function () {
	    goDoCommand("cmd_cut");
	},

	paste: function () {
	    goDoCommand("cmd_paste");
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

	// interactive commands
	switchTabInteractive: firebinder.Interactive("switchTab", "tab:",
						     firebinder.utils.getCurrentTabCompletions(true),
						     firebinder.utils.switchTab),

	killTabInteractive: firebinder.Interactive("killTab", "tab:",
						   firebinder.utils.getCurrentTabCompletions(false),
						   firebinder.utils.killTab)
    };
}();
