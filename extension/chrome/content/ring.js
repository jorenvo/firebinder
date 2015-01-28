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

/* Based on the ring.el in GNU Emacs [1].
 * [1] https://www.gnu.org/software/emacs/manual/html_node/elisp/Rings.html
 */
firebinder.Ring = function (size) {
    var content = [];
    var length = 0;

    var ringIndex = function (index) {
	while (index < 0) {
	    index += length;
	}

	return index % length;
    };

    return {
	/* This returns the maximum capacity of the ring. */
	size: function () {
	    return size;
	},

	/* This returns the number of objects that ring currently
	 * contains. The value will never exceed that returned by
	 * size. */
	length: function () {
	    return length;
	},

	/* This returns the object in ring found at index index.
	 * index may be negative (-1 is oldest element) or greater
	 * than the ring length. */
	ref: function (index) {
	    return content[ringIndex(index)];
	},

	/* This inserts object into ring, making it the newest
	 * element, and returns object.  If the ring is full,
	 * insertion removes the oldest element to make room for the
	 * new element. */
	insert: function (object) {
	    content.unshift(object);
	    ++length;

	    if (length > size) {
		content.pop();
		--length;
	    }

	    return object;
	},

	/* Remove an object from ring, and return that object. The
	 * argument index specifies which item to remove; if it is
	 * undefined, that means to remove the oldest item. */
	remove: function (index) {
	    --length;

	    if (typeof(index) === "undefined") {
		return content.pop();
	    } else {
		return content.splice(ringIndex(index), 1)[0];
	    }
	}
    };
};
