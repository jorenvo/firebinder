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

firebinder.Completion = function (displayValue, reference) {
    return {
	displayValue,
	reference
    };
};

firebinder.Interactive = function (name, prompt, getCompletions, onComplete) {
    return {
	name,
	prompt,
	getCompletions,
	onComplete,

	execute: function () {
	    firebinder.minibuffer.setInteractive(this);
	    firebinder.minibuffer.start();
	}
    };
};
