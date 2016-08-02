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

var objClicktocallPrefs = {


	nbCustomParams: 2,

	telPrefs: null,
	blacklist: null,
	excludedHosts: null,
	highlight: null,
	excludedTags: null,
	fActive: null,
	digitmin: null,
	digitmax: null,
	customUrl: null,
	customParam: [],
	customOpenType: null,
	userLang: null,
	conversations: null,


	showConfigDialog: function() {

		window.openDialog("chrome://aastraclicktocall/content/config.xul", "dlgClicktocallConfig", "centerscreen,chrome,modal").focus;
	},


	showAboutDialog: function() {

		window.openDialog("chrome://aastraclicktocall/content/about.xul", "dlgClicktocallAbout", "centerscreen,chrome,modal").focus;
	},


	getClicktocallVersion: function() {
		
		this.initClicktocallPrefs();
		document.getElementById("idClicktocall_version_label").value = "AastraClickToCall version "+this.telPrefs.getCharPref("version");
	},


	getPrefObj: function() {

		var obj = Components.classes["@mozilla.org/preferences-service;1"];
		obj = obj.getService(Components.interfaces.nsIPrefService);
		obj = obj.getBranch("extensions.aastraclicktocall.settings.");
		obj.QueryInterface(Components.interfaces.nsIPrefBranch2);
		return obj;
	},


	getPrefs: function() {

		this.blacklist = this.telPrefs.getCharPref("blacklist");
		if (this.blacklist.length > 0) this.excludedHosts = this.blacklist.toLowerCase().split(",");
		else this.excludedHosts = new Array();
		this.highlight = this.telPrefs.getCharPref("highlight");
		var exclude = this.telPrefs.getCharPref("exclude");
		this.excludedTags = exclude.toLowerCase().split(",");
		this.digitmin = this.telPrefs.getIntPref("digitmin");
		this.digitmax = this.telPrefs.getIntPref("digitmax");
		this.fActive = this.telPrefs.getBoolPref("active");
		this.customUrl = this.telPrefs.getCharPref("customUrl");
		this.userLang = document.getElementById("ClicktocallstringBundle");
		for (var i=1; i<this.nbCustomParams+1; i++) {
			this.customParam[i] = this.telPrefs.getCharPref("customParam"+i);
		}
		this.customOpenType = this.telPrefs.getIntPref("customOpenType");

		this.conversations = this.telPrefs.getBoolPref("conversations");
	},


	prefObserver: {
		observe: function(subject, topic, data) {
			if (topic != "nsPref:changed") return;
			objClicktocallPrefs.getPrefs();
		}
	},


	initClicktocallPrefs: function() {

		objClicktocallPrefs.telPrefs = objClicktocallPrefs.getPrefObj();
		objClicktocallPrefs.telPrefs.addObserver("", objClicktocallPrefs.prefObserver, false);
		objClicktocallPrefs.getPrefs();
	}

};


