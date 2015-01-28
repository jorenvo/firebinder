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

firebinder.utils = function () {
    var dispatchFakeKeyEvent = function (code, isKeyCode, withCtrl, withAlt) {
	const Ci = Components.interfaces;
	let domWindowUtils = window.QueryInterface(Ci.nsIInterfaceRequestor)
		.getInterface(Ci.nsIDOMWindowUtils);

	let type = "keypress", additionalFlags = null; // domWindowUtils.KEY_FLAG_LOCATION_JOYSTICK
    	let modifiers = 0;

	if (withCtrl) {
    	    modifiers |= Ci.nsIDOMNSEvent.CONTROL_MASK;
    	}

    	if (withAlt) {
    	    modifiers |= Ci.nsIDOMNSEvent.ALT_MASK;
    	}

	// type, keyCode, charCode, modifiers, additionalFlags
	if (isKeyCode) {
    	    domWindowUtils.sendKeyEvent(type, code, 0, modifiers, additionalFlags);
	} else {
	    domWindowUtils.sendKeyEvent(type, 0, code, modifiers, additionalFlags);
	}
    };

    return {
	createXUL: function (element) {
	    const XUL_NS = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";
	    let item = document.createElementNS(XUL_NS, element);

	    return item;
	},

	createLabel: function (value, style) {
	    let label = this.createXUL("label");

	    label.setAttribute("value", value);
	    label.setAttribute("style", style);

	    return label;
	},

	dispatchKeyCode: function (keyCode, withCtrl, withAlt) {
	    dispatchFakeKeyEvent(keyCode, true, withCtrl, withAlt);
	},

	dispatchCharCode: function (charCode, withCtrl, withAlt) {
	    dispatchFakeKeyEvent(charCode, false, withCtrl, withAlt);
	},

	getCurrentTabCompletions: function (mruLast) {
	    return function () {
		var allOpenTabs = Array.filter(gBrowser.tabs, tab => ! tab.closing);
		var mruTabs = allOpenTabs.sort((tab1, tab2) => tab2.lastAccessed - tab1.lastAccessed);

		var tabNames = [];

		for (var i = 0, len = mruTabs.length; i < len; ++i) {
		    tabNames.push(firebinder.Completion(mruTabs[i].linkedBrowser.contentTitle + " " + mruTabs[i].linkedBrowser.currentURI.spec, mruTabs[i]));
		}

		// currently selected tab (and thus most recently used) needs to be at the end
		if (mruLast) {
		    tabNames.push(tabNames.shift());
		}

		return tabNames;
	    };
	},

	switchTab: function (selectedTab) {
	    console.info("switched to tab " + selectedTab.displayValue);
	    gBrowser.selectedTab = selectedTab.reference;
	},

	killTab: function (selectedTab) {
	    console.info("killed tab " + selectedTab.displayValue);
	    gBrowser.removeTab(selectedTab.reference);
	},

	putOnClipboard: function (string) {
	    const gClipboardHelper = Components.classes["@mozilla.org/widget/clipboardhelper;1"]
                      .getService(Components.interfaces.nsIClipboardHelper);
	    gClipboardHelper.copyString(string);
	},

	getFromClipboard: function () {
	    const Cc = Components.classes;
	    let trans = Cc["@mozilla.org/widget/transferable;1"].createInstance(Ci.nsITransferable);
	    trans.addDataFlavor("text/unicode");
	    Services.clipboard.getData(trans, Services.clipboard.kGlobalClipboard);
	    let str = {};
	    let strLength = {};
	    trans.getTransferData("text/unicode", str, strLength);

	    return str.value.QueryInterface(Ci.nsISupportsString).data;
	}
    };
}();
