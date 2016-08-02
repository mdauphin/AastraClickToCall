/*
 Copyright (C) 2011 JC P.

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>
*/

var objClicktocallFunctions = {

	getBrowser: function() {

		var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
		var mainWindow = wm.getMostRecentWindow("navigator:browser");
		var browser =  mainWindow.getBrowser();
		return browser;
	},


	createDialURL: function(nr) {

		var url;
		url = objClicktocallPrefs.customUrl;
		url = objClicktocallFunctions.replaceRefs(url, 0, nr);
		for (var i=1; i<objClicktocallPrefs.nbCustomParams+1; i++) {
			url = objClicktocallFunctions.replaceRefs(url, i, objClicktocallPrefs.customParam[i]);
		}

		return url;
	},


	hrefAllow: "+0123456789",

	stripNumber: function(phoneNbr) {

		var newnr = "";
		for (var i=0; i<phoneNbr.length; i++) {
			var c = phoneNbr.charAt(i);
			if (this.hrefAllow.indexOf(c) >= 0) newnr += c;
		}
		return newnr.substr(0, objClicktocallPrefs.digitmax);
	},


	splitPhoneNbr: function(nr) {

		var index = -1;
		var maxlen = 0;
		var oldnr = nr;

		if (nr.charAt(0) != '+') return oldnr;

		for (var i=0; i<clicktocallTabCountryPrefix.length; i++) {
			if (nr.substr(0, clicktocallTabCountryPrefix[i][0].length) == clicktocallTabCountryPrefix[i][0]) {
				if (clicktocallTabCountryPrefix[i][0].length > maxlen) {
					index = i;
					maxlen = clicktocallTabCountryPrefix[i][0].length;
				}
			}
		}
		if (index >= 0) {
			var numPrefixPlus = clicktocallTabCountryPrefix[index][0];
			var numPrefixReplace = clicktocallTabCountryPrefix[index][1];
			return numPrefixReplace.concat(nr.substr(numPrefixPlus.length));
		}
		else return oldnr;
	},


	checkKey: function(event, allowed) {

		if (event.which < 32) return
		var key = String.fromCharCode(event.which)
		if (allowed.indexOf(key) >= 0) return;
		event.preventDefault();
	},


	getHost: function() {

		try {
			return content.document.location.host.toLowerCase();
		} catch (e) {
			return null;
		}
	},


	arrayRemove: function(a, v) {

		for (var i=0; i<a.length; i++) {
			if (a[i] == v) {
				a.splice(i, 1);
				i--;
			}
		}
	},


	replaceRefs: function(string, nr, param) {

		var index;
		while ((index = string.indexOf("$"+nr)) >= 0 && string.charAt(index-1) != '\\') {
			string = string.substr(0, index) + param + string.substr(index+2);
		}
		return string;
	},


	substArgs: function(text) {

		var newText = "";
		for (var i=1; i<arguments.length && i<10; i++) {
			for (var j=0; j<text.length; j++) {
				var c = text.charAt(j);
				if (c == '$') {
					c = text.charAt(j+1);
					if (c >= '1' && c <= '9') {
						var index = c - '0';
						if (index < arguments.length) newText += arguments[index];
						j++;
					} else {
						newText += c;
					}
				} else {
					newText += c;
				}
			}
		}
		return newText;
	},


	setIdAttr: function(name, value) {

		for (var i=2; i<arguments.length; i++) {
			var e = document.getElementById(arguments[i]);
			if (e) e.setAttribute(name, value);
		}
	},


	countDigits: function(text) {

		var count = 0;
		for (var i=0; i<text.length; i++) {
			var c = text.charAt(i);
			if (c >= '0' && c <= '9') count++;
		}
		return count;
	},


	isdigit: function(c) {

		return ("0123456789".indexOf(c) >= 0);
	}

};

