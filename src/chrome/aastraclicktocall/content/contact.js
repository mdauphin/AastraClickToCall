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

var objContact = {

	consoleService : Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService),
	debug : false,

	tel1: "",
	tel2: "",
	tel3: "",


	modifyDialPopup: function(nbr) {
		var item = document.getElementById("numberToDial");
		var edit = document.getElementById("numberToEdit");
		var numShown = 0;

		var label = nbr;
		item.setAttribute("label", label);
		item.setAttribute("tooltiptext", label);
		//item.setAttribute("image", "chrome://aastraclicktocall/content/icon/call.png");
		item.removeAttribute("disabled");
                item.setAttribute("oncommand", "objClicktocall.dialNumber(this.getAttribute('label'))");
		edit.setAttribute("nr", nbr);
		edit.setAttribute("oncommand", "objClicktocall.showEditNumberDialog(this.getAttribute('nr'))");
	},


	showDialPopup: function(target, nbr) {
		var menu = document.getElementById("dialPopup");
		this.modifyDialPopup(nbr);
		menu.openPopup(target, "after_start", 0, 0, true, false); //target = event.target
	},


	onClickNum: function(event) {
		
		var field = "";
		var elemId = event.target.getAttribute("id");

		if (elemId == "cvPhWork") field = "WorkPhone";
		if (elemId == "cvPhHome") field = "HomePhone";
		if (elemId == "cvPhCellular") field = "CellularNumber";

		var str= "";
		var phoneNum = "erreur";
		var cards = GetSelectedAbCards();
		var realCard = cards[0];
		var nameFL, nameLF;
		var accessor;

		// Deal with differences between TB2 and TB3>
		try {
			nameFL = realCard.generateName(2);
			nameLF = realCard.generateName(1);
			accessor = (function (prop) { return realCard.getProperty(prop, ""); } );
		} catch (e) {
			nameFL = gAddrbookSession.generateNameFromCard(realCard, 2);
			nameLF = gAddrbookSession.generateNameFromCard(realCard, 1);
			accessor = (function (prop) { return realCard.getCardValue(prop) || ""; } );
		}

		var card = { 
			getProperty : accessor,
			primaryEmail : realCard.primaryEmail,
			displayName : realCard.displayName,
			isMailList : realCard.isMailList,
			mailListURI : realCard.mailListURI
		};
	
				
		
		str = card.getProperty(field);
		phoneNum = objClicktocall.formatPhoneNbr(str);
		var phoneNumFormat = objClicktocallFunctions.stripNumber(phoneNum);
		var phoneNumDisplay = objClicktocallFunctions.splitPhoneNbr(phoneNumFormat);

		objContact.showDialPopup(event.target, phoneNumDisplay);

	},
		

	parseCard: function(event) {	
	
		this.tel1 = document.getElementById("cvPhWork");
		this.tel2 = document.getElementById("cvPhHome");
		this.tel3 = document.getElementById("cvPhCellular");

		this.tel1.setAttribute("class", "CardViewText phoneNumber");
		this.tel2.setAttribute("class", "CardViewText phoneNumber");
		this.tel3.setAttribute("class", "CardViewText phoneNumber");

		this.tel1.addEventListener("click", objContact.onClickNum, false);
		this.tel2.addEventListener("click", objContact.onClickNum, false);
		this.tel3.addEventListener("click", objContact.onClickNum, false);


		this.tel1.setAttribute("tooltiptext", "AastraClickToCall");
		this.tel2.setAttribute("tooltiptext", "AastraClickToCall");
		this.tel3.setAttribute("tooltiptext", "AastraClickToCall");

		if (objContact.debug) objContact.consoleService.logStringMessage("AastraClickToCall - Contacts : parseCard");
	},


	init: function(event) {

		if (objContact.debug) objContact.consoleService.logStringMessage("AastraClickToCall for Thunderbird - Contacts");

		var elems = document.getElementsByTagName("description");
	
		// From extension Select Address Book Text : https://addons.mozilla.org/fr/thunderbird/addon/select-address-book-text 
		for (var i=0; i<elems.length; i++) {
			var elem = elems[i];
			if (elem.className == "CardViewText" || elem.className == "CardViewLink") {

				for (var j=0; j<elem.childNodes.length; j++) {
					var c = elem.childNodes[j];
					if (c.nodeName == "#text" && c.textContent.match(/^\s*$/)) {
					    c.textContent = "";
					}
				}

				t = document.createTextNode("\n");
				if (elem.nextSibling) elem.parentNode.insertBefore(t, elem.nextSibling);
				else elem.parentNode.appendChild(t);
			}
		}
	
		objContact.parseCard();	
	}
};


window.addEventListener('load', objContact.init, false);

