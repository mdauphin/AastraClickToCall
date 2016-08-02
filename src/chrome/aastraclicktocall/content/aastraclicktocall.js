/*
 Copyright (C) 2011-2012 JC P.

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

var objClicktocall = {

	consoleService : Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService),
	debug : false,

	// special chars
	spaceChar: String.fromCharCode(0xa0),

	// chars which look like dashes
	dashChar:
		String.fromCharCode(0x2013) +
		String.fromCharCode(0x2014) +
		String.fromCharCode(0x2212),

	exclPatternList: [
		/^\d{2}\.\d{2} *(-|–) *\d{2}\.\d{2}$/,	// time range: 09.00 - 18.00
		/^\d{2}\/\d{2}\/\d{2}$/,	// shot date : 09/09/10
		/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,	// ip address
		/^[0-3]?[0-9]\.[0-3]?[0-9]\.(19|20)\d{2} *(-|–) *\d{2}\.\d{2}$/,	// date and time : 09.09.2010 - 16.03
		/^[0-3]?[0-9][\/\.-] *[0-3]?[0-9][\/\.-] *(19|20)\d{2}$/,	// long date : 09/09/2010, 09.09.2010, 09-09-2010
		/^[0-3]?[0-9]\.?[\/-][0-3]?[0-9]\. *[0-1]?[0-9]\. *(19|20)\d{2}$/,	// two days : 17/18.9.2010
		/^[0-3]?[0-9][\/\.-][0-3]?[0-9][\/\.-]\d{2} *(-|–) *[0-3]?[0-9][\/\.-][0-3]?[0-9][\/\.-]\d{2}$/,	// date range short
		/^[0-3]?[0-9][\/\.-][0-3]?[0-9][\/\.-] *(-|–) *[0-3]?[0-9][\/\.-][0-3]?[0-9][\/\.-](19|20)\d{2}$/,	// date range medium
		/^[0-3]?[0-9][\/\.-][0-3]?[0-9][\/\.-](19|20)\d{2} *(-|–) *[0-3]?[0-9][\/\.-][0-3]?[0-9][\/\.-](19|20)\d{2}$/,	// date range long
		/^[0-9]([ \.\,]000)+$/,	// a big number
		/^0+$/,	// all zeroes
		/^0\.\d+$/, // decimal: 0.12345678
	],

	//special phone number patterns
	inclLocalList: [
		[/^[1-9]\d{2}[\.-]\d{3}[\.-]\d{4}[^\d]*$/, "+1"],	// US
		[/^\([1-9]\d{2}\) \d{3}[\.-]\d{4}[^\d]*$/, "+1"],	// US
		[/^0[1-9][ \.]\d{2}[ \.]\d{2}[ \.]\d{2}[ \.]\d{2}[^\d]*$/, "+33"],	// France
		[/^0[ \.]800[ \.]\d{2}[ \.]\d{2}[ \.]\d{2}[^\d]*$/, "+33"],	// France

	],

	startCharTrigger: "+(0123456789",
	partChar: " -/()[].\r\n"
		+ String.fromCharCode(0xa0) // spaceChar
		+ String.fromCharCode(0x2013) + String.fromCharCode(0x2014) +	String.fromCharCode(0x2212), // dashChar
	startChar: "+(0",
	sepChar: " -/(.",
	noPostChar: ":-",
	noPrevChar: "-,",

	noPostString: [
		"km²", "Hz", "Uhr", "Bytes", "kB", "MB", "km/h"
	],


	setStatusIcon: function() {

		var statusicon = document.getElementById("idClicktocall_statusicon");
		if (objClicktocallPrefs.fActive) {
			statusicon.setAttribute("src", "chrome://aastraclicktocall/content/icon/icon18_active.png");
			var text = "AastraClickToCall " + objClicktocallPrefs.userLang.getString("actif");
		}
		else {
			statusicon.setAttribute("src", "chrome://aastraclicktocall/content/icon/icon18_inactive.png");
			var text = "AastraClickToCall " + objClicktocallPrefs.userLang.getString("inactif");			
		}
		statusicon.setAttribute("tooltiptext", text);
	},


	modifyBlacklist: function() {

		var host = objClicktocallFunctions.getHost();
		if (host == null) return;
		if (objClicktocallPrefs.excludedHosts.indexOf(host) >= 0) objClicktocallFunctions.arrayRemove(objClicktocallPrefs.excludedHosts, host);
		else objClicktocallPrefs.excludedHosts.push(host);

		objClicktocallPrefs.blacklist = objClicktocallPrefs.excludedHosts.join(",");
		objClicktocallPrefs.telPrefs.setCharPref("blacklist", objClicktocallPrefs.blacklist);
	},


	modifyActive: function() {

		objClicktocallPrefs.telPrefs.setBoolPref("active", !objClicktocallPrefs.fActive);
		this.setStatusIcon();
	},


	getSelectionNumber: function() {

		var sel = document.commandDispatcher.focusedWindow.getSelection().toString();
		sel = objClicktocallFunctions.stripNumber(sel);
		return sel;
	},


	dialNumber: function(nr) {

		var requ = new XMLHttpRequest();
		var url = objClicktocallFunctions.createDialURL(nr);

		if (objClicktocallPrefs.customOpenType == 1) {
			window.open(url, "_blank");
			return;
		}
		if (objClicktocallPrefs.customOpenType == 2) {
			var browser = top.document.getElementById("content");
			var tab = browser.addTab(url);
			return;
		}
		if (objClicktocallPrefs.customOpenType == 3) {
			var browser = top.document.getElementById("content");
			var tab = browser.addTab(url);
			browser.selectedTab = tab;
			return;
		}

		try {
			requ.open("GET", url, true);
			requ.send(null);
		} catch(e) {
			var text = objClicktocallPrefs.userLang.getString("errorDialNumber");
			alert(text);
			objClicktocallPrefs.showConfigDialog();
		}

	},


	modifyPopup: function(event) {

		var label, key;

		var selText = document.commandDispatcher.focusedWindow.getSelection().toString();

		if (document.popupNode && document.popupNode.getAttribute("class") == "clicktocall") {
			var nr = document.popupNode.getAttribute("nr");
			var nrmod = objClicktocallFunctions.splitPhoneNbr(nr);
			objClicktocall.modifyDialPopup(nrmod, "context");
			objClicktocallFunctions.setIdAttr("collapsed", false, "idClicktocall_menu_context");
		}
		else if (objClicktocallPrefs.fActive && selText.length > 0 && objClicktocallFunctions.countDigits(selText) > 1) {
			var nr = objClicktocall.getSelectionNumber();
			var nrmod = objClicktocallFunctions.splitPhoneNbr(nr);
			objClicktocall.modifyDialPopup(nrmod, "context");
			objClicktocallFunctions.setIdAttr("collapsed", false, "idClicktocall_menu_context");
		}
		else objClicktocallFunctions.setIdAttr("collapsed", true, "idClicktocall_menu_context");

		if (objClicktocallPrefs.fActive) label = "AastraClickToCall: " + objClicktocallPrefs.userLang.getString("turnoff");
		else label = "AastraClickToCall: " + objClicktocallPrefs.userLang.getString("turnon");

		objClicktocallFunctions.setIdAttr("label", label, "idClicktocall_menu_activity", "idClicktocall_status_activity");

		var host = objClicktocallFunctions.getHost();
		if (host) {
			objClicktocallFunctions.setIdAttr("disabled", !objClicktocallPrefs.fActive, "idClicktocall_menu_blacklist", "idClicktocall_status_blacklist");
			if (objClicktocallPrefs.excludedHosts.indexOf(host) >= 0) text = objClicktocallPrefs.userLang.getString("allow") + " $1";
			else text = objClicktocallPrefs.userLang.getString("disallow") + " $1";
			label = objClicktocallFunctions.substArgs(text, host);
			objClicktocallFunctions.setIdAttr("label", label, "idClicktocall_menu_blacklist", "idClicktocall_status_blacklist");
		}
		else {
			objClicktocallFunctions.setIdAttr("label", "Active", "idClicktocall_menu_blacklist", "idClicktocall_status_blacklist");
			objClicktocallFunctions.setIdAttr("disabled", true, "idClicktocall_menu_blacklist", "idClicktocall_status_blacklist");
		}
	},


	initNumberEdit: function() {

		document.getElementById("idClicktocallInputNr").value = window.arguments[0].nr;
	},


	setNumberEditReturnValue: function(isOk) {

		window.arguments[0].nr = document.getElementById("idClicktocallInputNr").value;
		window.arguments[0].dialOK = isOk;
	},


	showEditNumberDialog: function(nr) {

		var argObj = {nr: nr, dialOK: false};
		window.openDialog("chrome://aastraclicktocall/content/editNumber.xul", "dlgClicktocallEditNumber", "centerscreen,chrome,modal", argObj);
		if (argObj.dialOK) objClicktocall.dialNumber(argObj.nr);
	},


	modifyDialPopup: function(nr, id) {

		var item = document.getElementById("idClicktocall_"+id);
		var edit = document.getElementById("idClicktocall_edit_"+id);
		var numShown = 0;

		item.setAttribute("label", nr);
		item.setAttribute("tooltiptext", nr);
		item.removeAttribute("disabled");
		/* Replaced like reviewer Kris Maglione suggested
		item.setAttribute("oncommand", "objClicktocall.dialNumber('"+nr+"')");
		edit.setAttribute("oncommand", "objClicktocall.showEditNumberDialog('"+nr+"')");
		*/
                item.setAttribute("oncommand", "objClicktocall.dialNumber(this.getAttribute('label'))");
		edit.setAttribute("nr", nr);
		edit.setAttribute("oncommand", "objClicktocall.showEditNumberDialog(this.getAttribute('nr'))");
	},


	showDialPopup: function(target, nr) {

		var menu = document.getElementById("idClicktocall_popup_dial");
		this.modifyDialPopup(nr, "dial");
		menu.openPopup(target, "after_start", 0, 0, true, false);
	},


	onClick: function(event) {

		if (event.button != 0) return;
		var cssClass = event.target.getAttribute("class");
		if (cssClass != "clicktocall") return;
		event.preventDefault();
		var nr = event.target.getAttribute("nr");
		var nrmod = objClicktocallFunctions.splitPhoneNbr(nr);
		objClicktocall.showDialPopup(event.target, nrmod);
	},


	formatPhoneNbr: function(phoneNbr) {

		var substList = [
			["  ", " "],
			[this.spaceChar, " "],
			["+ ", "+"],
			["--", "-"],
			["(0)", " "],
			["[0]", " "],
			["-/", "/"],
			["/-", "/"],
			["( ", "("],
			[" )", ")"],
			["\r", " "],
			["\n", " "],
		];

		// replace dash-like chars with dashes
		for (var i=0; i<phoneNbr.length; i++) {
			var c = phoneNbr.charAt(i);
			if (this.dashChar.indexOf(c) >= 0) {
				phoneNbr = phoneNbr.substr(0, i) + "-" + phoneNbr.substr(i+1);
			}
		}

		const MAXLOOP = 100; // for safety 
		var nChanged;

		nChanged = 1;
		for (var j=0; nChanged > 0 && j < MAXLOOP; j++) {
			nChanged = 0;
			for (var i=0; i<substList.length; i++) {
				var index;
				while ((index = phoneNbr.indexOf(substList[i][0])) >= 0) {
					phoneNbr = phoneNbr.substr(0, index) + substList[i][1] + phoneNbr.substr(index+substList[i][0].length);
					nChanged++;
				}
			}
		}
		return phoneNbr;
	},


	// "-" like chars in Unicode (same as partChar)
	baseCharTab: [
		String.fromCharCode(0xa0) +
		String.fromCharCode(0x2013) +
		String.fromCharCode(0x2014) +
		String.fromCharCode(0x2212),
		" ---"
	],


	baseChar: function(c) {

		var index = this.baseCharTab[0].indexOf(c);
		if (index >= 0) c = this.baseCharTab[1].charAt(index);
		return c;
	},


	clicktocallTextNode: function(node) {

		if (node == null) return 0;
		var text = node.data;
		var len = text.length;
		if (len < objClicktocallPrefs.digitmin) return 0;

		for (var i=0; i<len; i++) {
			var c = text.charAt(i);

			if (this.startCharTrigger.indexOf(c) < 0) continue;

			c = this.baseChar(c);

			var pNum = "" + c;
			var strlen = 1;
			var lastChar = c;
			var ndigits = (objClicktocallFunctions.isdigit(c) ? 1 : 0);
			var index;

			//allowed chars
			while (strlen < len-i) {
				c = text.charAt(i+strlen);
				c = this.baseChar(c);
				if ((c == '+' && ndigits == 0) || (this.partChar.indexOf(c) >= 0)) {
					if (c == lastChar && c!=' ') break;
				}
				else {
					if (!objClicktocallFunctions.isdigit(c)) break;
					ndigits++;
				}
				pNum += c;
				strlen++;
				lastChar = c;
			}

			//check digit count min value
			if (ndigits < objClicktocallPrefs.digitmin) {
				i += strlen - 1; continue;
			}

			//check allowed prev char
			if (i > 0) {
				var prev_c = text.charAt(i-1);
				if (this.noPrevChar.indexOf(prev_c) >= 0) {
					i += strlen - 1; continue;
				}
				if ((prev_c >= 'a' && prev_c <= "z") || (prev_c >= 'A' && prev_c <= "Z")) {
					i += strlen - 1; continue;
				}
			}

			//check if phone number starts with country code
			var posscc = null;
			for (var j=0; j<clicktocallTabCountryPrefix.length; j++) {
				var cclen = clicktocallTabCountryPrefix[j][0].length;
				if (cclen < 2 || cclen > 4) continue;
				var pattern = clicktocallTabCountryPrefix[j][0].substr(1);
				var plen = pattern.length;
				if (pNum.substr(0, plen) != pattern) continue;
				var c = pNum.charAt(plen);
				if (this.sepChar.indexOf(c) < 0) continue;
				posscc = "+"+pattern;
				break;
			}

			//check special patterns
			var pattcc = null;
			for (var j=0; j<this.inclLocalList.length; j++) {
				var res = this.inclLocalList[j][0].exec(pNum);
				if (res) {pattcc = this.inclLocalList[j][1]; break;}
			}

			//check if phone number starts with allowed char
			if (pattcc == null && posscc == null && this.startChar.indexOf(pNum.charAt(0)) < 0) {
				i += strlen - 1; continue;
			}

			//check opening bracket
			index = -1;
			for (var j=strlen-1; j>=0; j--) {
				c = pNum.charAt(j);
				if (c == ')' || c == ']') break;
				if (c == '(' || c == '[') {index = j; break;}
			}
			if (index == 0) continue;
			if (index > 0) {
				pNum = pNum.substr(0, index);
				strlen = pNum.length;
			}

			//check count max value 
			if (objClicktocallFunctions.countDigits(pNum) > objClicktocallPrefs.digitmax) {
				i += strlen - 1; continue;
			}

			//remove non-digit chars at end of string
			while (pNum.length > 0) {
				c = pNum.charAt(pNum.length-1);
				if (!objClicktocallFunctions.isdigit(c)) {
					pNum = pNum.substr(0, pNum.length-1);
					strlen--;
				}
				else break;
			}

			//check for unallowed post char
			var post_c = text.charAt(i+strlen);
			if (post_c) {
				if (this.noPostChar.indexOf(post_c) >= 0) {
					i += strlen - 1; continue;
				}
				if ((post_c >= 'a' && post_c <= "z") || (post_c >= 'A' && post_c <= "Z")) {
					i += strlen - 1; continue;
				}
			}

			//check for unallowed post strings
			var post_s = null;
			for (var j=0; j<this.noPostString.length; j++) {
				var len = this.noPostString[j].length;
				if (text.substr(i+strlen+1, len) == this.noPostString[j]) {
					if (post_c == ' ' || post_c == spaceChar) {
						post_s = this.noPostString[j];
						break;
					}
				}
			}
			if (post_s) {
				i += strlen - 1; continue;
			}

			//check if this is just a number in braces
			if (pNum.substr(0, 1) == "(" && pNum.indexOf(")") < 0) {
				pNum = pNum.substr(1);
				i++;
				strlen--;
				//now check if it still starts with allowed token
				if (this.startChar.indexOf(pNum.charAt(0)) < 0) {
					i += strlen - 1; continue;
				}
			}

			//check blacklist patterns
			index = -1;
			for (var j=0; j<this.exclPatternList.length; j++) {
				var res = this.exclPatternList[j].exec(pNum);
				if (res) {index = j; break;}
			}
			if (index >= 0) {
				i += strlen - 1; 
				continue;
			}


			var phoneNum = this.formatPhoneNbr(pNum);
			var phoneNumHref = objClicktocallFunctions.stripNumber(phoneNum);

			//replace link into DOM
			if(!navigator.userAgent.match("rv:1\.9")) {	//Firefox 4>
				var node_prev = content.document.createTextNode(text.substr(0, i));
				var node_after = content.document.createTextNode(text.substr(i+strlen));			
			
				var node_anchor = content.document.createElement("a");		
				var style = "color:#000000; background-color:"+objClicktocallPrefs.highlight+";-moz-border-radius:3px";
				node_anchor.setAttribute("style", style);
				node_anchor.setAttribute("title", "AstraClickToCall");
				node_anchor.setAttribute("class", "clicktocall");
				node_anchor.setAttribute("nr", phoneNumHref);
				node_anchor.setAttribute("href", "#");
				var node_text_anchor = content.document.createTextNode(pNum);
				node_anchor.appendChild(node_text_anchor);

				var node_container = content.document.createElement("span");
				node_container.appendChild(node_prev);
				node_container.appendChild(node_anchor);
				node_container.appendChild(node_after);

				var parNode = node.parentNode;
				parNode.replaceChild(node_container, node);

				if (objClicktocall.debug) objClicktocall.consoleService.logStringMessage("AastraClickToCall: number '"+phoneNumHref+"' detected");			
			}
			else {	//Firefox 3 - TB3

				var node_prev = content.document.createTextNode(text.substr(0, i));
				var node_after = content.document.createTextNode(text.substr(i+strlen));

				var node_anchor = content.document.createElement("a");

				var style = "color:#000000; background-color:"+objClicktocallPrefs.highlight+";-moz-border-radius:3px";
				node_anchor.setAttribute("style", style);
				node_anchor.setAttribute("title", "AastraClickToCall");
				node_anchor.setAttribute("class", "clicktocall");
				node_anchor.setAttribute("nr", phoneNumHref);
				node_anchor.setAttribute("href", "#");

				var node_text = content.document.createTextNode(pNum);
				node_anchor.appendChild(node_text);

				var parentNode = node.parentNode;
				parentNode.replaceChild(node_after, node);
				parentNode.insertBefore(node_anchor, node_after);
				parentNode.insertBefore(node_prev, node_anchor);
			}
			return 1;
		}
		return 0;
	},


	recurseNode: function(node) {

		if (node == null) return 0; //safe
		if (node.nodeType == Node.TEXT_NODE) return this.clicktocallTextNode(node);
		else {
			var nChanged = 0;
			if (node.nodeType == Node.ELEMENT_NODE) {
				var tagName = node.tagName.toLowerCase();
				if (objClicktocallPrefs.excludedTags.indexOf(tagName) >= 0) return 0;
			}
			for (var i=0; i<node.childNodes.length; i++) {
				nChanged += this.recurseNode(node.childNodes[i]);
			}
			if (node.contentDocument) {
				nChanged += this.recurseNode(node.contentDocument.body);
				node.contentDocument.addEventListener("click", objClicktocall.onClick, false);
				node.contentDocument.addEventListener("DOMSubtreeModified", objClicktocall.onDOMModified, false);
			}
		}
		return nChanged;
	},


	onDOMModified: function(event) {

		content.document.modified++;
		if (content.document.modified > 1) return;
		window.setTimeout(
			function() {
				var duration = (new Date()).getTime();
				objClicktocall.recurseNode(content.document.body);
				content.document.modified = 0;
				duration = (new Date()).getTime() - duration;
				content.document.parsetime = duration;
				objClicktocall.setStatusIcon();
			}
			, Math.max(100, 2*content.document.parsetime));
	},


	onTabSelect: function(event) {

		objClicktocall.setStatusIcon();
	},


	parsePage: function(event) {

	if (objClicktocall.debug) objClicktocall.consoleService.logStringMessage("AastraClickToCall parsePage");

		if (!objClicktocallPrefs.fActive) return;
		if (event.target.body == null) return;
		if (event && event.eventPhase != 1) return;

		var host = objClicktocallFunctions.getHost();
		if (host && objClicktocallPrefs.excludedHosts.indexOf(host) >= 0) return;

		window.setTimeout(
			function() {
				var duration = (new Date()).getTime();
				objClicktocall.recurseNode(event.target.body);
				duration = (new Date()).getTime() - duration;
				event.target.parsetime = duration;
				objClicktocall.setStatusIcon();
				event.target.modified = 0;
				event.target.addEventListener("click", objClicktocall.onClick, false);
				event.target.addEventListener("DOMSubtreeModified", objClicktocall.onDOMModified, false);
			}
			,	100);
	},


	checkConversations: function() {
		
		try {
			Components.utils.import("resource://conversations/misc.js");
			objClicktocall.consoleService.logStringMessage("AastraClickToCall has detected Conversations module");

			alert(objClicktocallPrefs.userLang.getString("conversations"));
			objClicktocallPrefs.telPrefs.setBoolPref("conversations", false);
		} catch (e) {
			objClicktocall.consoleService.logStringMessage("AastraClickToCall has not detected Conversations module");
		}

	},


	init: function(event) {

		window.addEventListener('load', objClicktocall.init, false);
		objClicktocallPrefs.initClicktocallPrefs();
		objClicktocall.setStatusIcon();

		var application = Components.classes["@mozilla.org/xre/app-info;1"].getService(Components.interfaces.nsIXULAppInfo);
	
		if (application.ID == "{ec8030f7-c20a-464f-9b0e-13a3a9e97384}") {
			if (objClicktocall.debug) objClicktocall.consoleService.logStringMessage("AastraClickToCall for Firefox");	
			/***  Firefox  ***/
			getBrowser().addEventListener("load", objClicktocall.parsePage, true);
			getBrowser().tabContainer.addEventListener("TabSelect", objClicktocall.onTabSelect, true);
			document.getElementById("contentAreaContextMenu").addEventListener("popupshowing", objClicktocall.modifyPopup, false);
		}
		else {
			if (objClicktocall.debug) objClicktocall.consoleService.logStringMessage("AastraClickToCall for Thunderbird");
			/***  Thunderbird  ***/
			if (objClicktocallPrefs.conversations) objClicktocall.checkConversations();
			var messagepane = document.getElementById("messagepane");
			if (messagepane) {
				messagepane.addEventListener("load", objClicktocall.parsePage, true);
				document.getElementById("mailContext").addEventListener("popupshowing", objClicktocall.modifyPopup, false);
			}
			
			
		}

		
	}

};


window.addEventListener('load', objClicktocall.init, false);

