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

var objClicktocallConfig = {


	setConfigValues: function() {

		if (document.getElementById("idClicktocallPref_url_input").value.indexOf("$0") < 0) {
			alert("Warning! \n You don't have '$0' in URL for Phone Number.");
			objClicktocallPrefs.showConfigDialog();
		}
		else {
			objClicktocallPrefs.telPrefs.setCharPref("highlight", document.getElementById("idClicktocallPref_highlight").value);
			objClicktocallPrefs.telPrefs.setCharPref("customUrl", document.getElementById("idClicktocallPref_url_input").value);
			objClicktocallPrefs.telPrefs.setIntPref("digitmin", document.getElementById("idClicktocallPref_digitmin").value);
			objClicktocallPrefs.telPrefs.setIntPref("digitmax", document.getElementById("idClicktocallPref_digitmax").value);
			for (var i=1; i<objClicktocallPrefs.nbCustomParams+1; i++) {
				objClicktocallPrefs.telPrefs.setCharPref("customParam"+i, document.getElementById("idClicktocallPref_param"+i+"_value").value);
			}
			objClicktocallPrefs.telPrefs.setIntPref("customOpenType", document.getElementById("idClicktocallPref_opentype").value);
		}
	},


	onAccept: function() {

		this.setConfigValues();
		return true;
	},


	getTemplateParam: function(nr) {

		if (nr == 0) return "phoneNbr";
		var param = document.getElementById("idClicktocallPref_param"+nr+"_value").value;
		var label = document.getElementById("idClicktocallPref_param"+nr+"_caption").value;
		if (label.value == "") param = "";
		return param;
	},


	createResultDOM: function(node)	{

		if (node == null) return 0;
		if (node.nodeType == Node.TEXT_NODE) {
			var text = node.data;
			var len = text.length;
			var escape = 0;
			for (var i=0; i<len-1; i++) {
				if (escape == 1) {escape = 0; continue;}
				var c = text.charAt(i);
				if (c == '\\') {escape = 1; continue}
				if (c != '$') continue;
				c = text.charAt(i+1);
				var nr = "0123456789".indexOf(c);
				if (nr < 0 || nr > objClicktocallPrefs.nbCustomParams) continue;
				var prev_node = document.createTextNode(text.substr(0, i));
				var next_node = document.createTextNode(text.substr(i+2));
				var hilite_node = document.createElement("span");
				hilite_node.setAttribute("class", (nr == 0 ? "numberUrl" : "paramUrl"));
				var param_node = document.createTextNode(this.getTemplateParam(nr));
				hilite_node.appendChild(param_node);
				var parentNode = node.parentNode;
				parentNode.replaceChild(next_node, node);
				parentNode.insertBefore(hilite_node, next_node);
				parentNode.insertBefore(prev_node, hilite_node);
				break;
			}
		} else {
			for (var i=0; i<node.childNodes.length; i++) {
				this.createResultDOM(node.childNodes[i]);
			}
		}
	},


	urlChanged: function() {

		var url = document.getElementById("idClicktocallPref_url_input").value;
		var result = document.getElementById("idClicktocallPref_url_result");
		while (result.childNodes[0]) result.removeChild(result.childNodes[0]);
		if (url == "") {
			var item = document.createElement("span");
			item.appendChild("URL");
			item.setAttribute("class", "emptyUrl");
			result.appendChild(item);
		} else {
			var item = document.createTextNode(url);
			result.appendChild(item);
			this.createResultDOM(result);
		}
	},


	paramChanged: function(nr, value) {

		this.urlChanged();
	},


	initConfig: function() {

		objClicktocallPrefs.initClicktocallPrefs();

		document.getElementById("idClicktocallPref_highlight").value = objClicktocallPrefs.highlight;
		document.getElementById("idClicktocallPref_url_input").value = objClicktocallPrefs.customUrl;
		document.getElementById("idClicktocallPref_digitmin").value = objClicktocallPrefs.digitmin;
		document.getElementById("idClicktocallPref_digitmax").value = objClicktocallPrefs.digitmax;	
		for (var i=1; i<objClicktocallPrefs.nbCustomParams+1; i++) {
			document.getElementById("idClicktocallPref_param"+i+"_value").value = objClicktocallPrefs.customParam[i];
		}
		document.getElementById("idClicktocallPref_opentype").value = objClicktocallPrefs.customOpenType;
	}
};

