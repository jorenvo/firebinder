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

(function () {
    var loader = {
	eval: function () {
	    Components.utils.import("resource://gre/modules/osfile.jsm");

	    var initDir = this.getJsInitDir();

	    if (initDir) {
		let iterator = new OS.File.DirectoryIterator(initDir);
		let promise = iterator.forEach(
		    function onEntry (entry) {
			if (! entry.isDir) {
			    let promise = OS.File.read(entry.path);

			    console.log("firebinder: loading " + entry.name);
			    this.evalFile(promise);
			}
		    }.bind(this)
		);

		promise.then(
		    function onSuccess() {
			iterator.close();
		    },
		    function onFailure(reason) {
			iterator.close();
			throw reason;
		    }
		);
	    } else {
		console.error("init dir not set");
	    }
	},

	evalFile: function (promise) {
	    let decoder = new TextDecoder();

	    promise = promise.then(
		function onSuccess(array) {
		    var fileContent = decoder.decode(array);
		    try {
			let f = new Function(fileContent);
			f();
		    } catch (e) {
			console.error(e);
		    }
		}
	    );
	},

	getJsInitDir: function () {
	    var prefService = Components.classes["@mozilla.org/preferences-service;1"]
		    .getService(Components.interfaces.nsIPrefService)
		    .getBranch("extensions.firebinder.");

	    return prefService.getCharPref("jsInitDir");
	}
    };

    loader.eval();
}());
