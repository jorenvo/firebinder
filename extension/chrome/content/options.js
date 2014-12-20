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

firebinder.preferences = function () {
    let prefService = Components.classes["@mozilla.org/preferences-service;1"]
	.getService(Components.interfaces.nsIPrefService)
	.getBranch("extensions.firebinder.");

    let updateCurrentConfigLabel = function () {
	setTimeout(function () {
	    var configLabelPrefix = "current init dir: ";
	    var charPref = prefService.getCharPref("jsInitDir");

	    if (charPref) {
		document.getElementById("currentConfigLabel").innerHTML = configLabelPrefix + charPref;
	    } else {
		document.getElementById("currentConfigLabel").innerHTML = configLabelPrefix + "<not set>";
	    }
	}.bind(this), 100);
    };

    updateCurrentConfigLabel();

    return {
	openDirPicker: function () {
	    var nsIFilePicker = Components.interfaces.nsIFilePicker;
	    var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
	    fp.init(window, "Select an init dir", nsIFilePicker.modeGetFolder);

	    var res = fp.show();
	    if (res != nsIFilePicker.returnCancel) {
		var dir = fp.file.path;
		console.error("chose dir " + dir);

		prefService.setCharPref("jsInitDir", dir);

		updateCurrentConfigLabel();
	    }
	}
    };
}();
