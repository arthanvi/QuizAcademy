/*
WICK: Web Input Completion Kit
http://wick.sourceforge.net/
Copyright (c) 2004, Christopher T. Holland
All rights reserved.

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
Neither the name of the Christopher T. Holland, nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.
THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

*/
/* start dhtml building blocks */
//var onlyTest = "not set";
function freezeEvent(e) {
if (e.preventDefault) e.preventDefault();
e.returnValue = false;
e.cancelBubble = true;
if (e.stopPropagation) e.stopPropagation();
return false;
}//freezeEvent

function isWithinNode(e,i,c,t,obj) {
answer = false;
te = e;
while(te && !answer) {
  if	((te.id && (te.id == i)) || (te.className && (te.className == i+"Class"))
			|| (!t && c && te.className && (te.className == c))
			|| (!t && c && te.className && (te.className.indexOf(c) != -1))
			|| (t && te.tagName && (te.tagName.toLowerCase() == t))
			|| (obj && (te == obj))
		) {
		answer = te;
	} else {
		te = te.parentNode;
	}
}
return te;
}//isWithinNode

function getEvent(event) {
return (event ? event : window.event);
}//getEvent()

function getEventElement(e) {
return (e.srcElement ? e.srcElement: (e.target ? e.target : e.currentTarget));
}//getEventElement()

function findElementPosX(obj) {
	curleft = 0;
	if (obj.offsetParent) {
		while (obj.offsetParent) {
			curleft += obj.offsetLeft;
			obj = obj.offsetParent;
		}
	}//if offsetParent exists
	else if (obj.x)
		curleft += obj.x
	return curleft;
}//findElementPosX

function findElementPosY(obj) {
	curtop = 0;
	if (obj.offsetParent) {
		while (obj.offsetParent) {
			curtop += obj.offsetTop;
			obj = obj.offsetParent;
		}
	}//if offsetParent exists
	else if (obj.y)
		curtop += obj.y
	return curtop;
}//findElementPosY

/* end dhtml building blocks */

function handleKeyPress(event) {
e = getEvent(event);
eL = getEventElement(e);
/*
//convarea.many_words_text
xx=e.layerX;
yy=e.layerY;
alert("X=" + xx + " Y=" + yy);
*/ //this gives cursor pointer location not he blinking cursor location
upEl = isWithinNode(eL,null,"wickEnabled",null,null);
//alert(siw.inputBox.name); //for testing
kc = e["keyCode"];
if (siw && ((kc == 13) || (kc == 9))) {
	siw.selectingSomething = true;
	if (siw.isSafari) siw.inputBox.blur();   //hack to "wake up" safari
	siw.inputBox.focus();
	//alert(siw.inputBox.value); ////testing result - has added charectors with autocomplete.
	siw.inputBox.value = siw.inputBox.value.replace(/[ \r\n\t\f\s]+$/gi,' ');
	//alert(siw.inputBox.value); ////testing
	//add logic  - done
	//useOnlyHindi(); //this is to return only hindi part on selection from smart input
	hideSmartInputFloater();
} else if (upEl && (kc != 38) && (kc != 40) && (kc != 37) && (kc != 39) && (kc != 13) && (kc != 27)) {
	if (!siw || (siw && !siw.selectingSomething)) {
		processSmartInput(upEl);
	}
} else if (siw && siw.inputBox) {
	siw.inputBox.focus(); //kinda part of the hack.
}
//below is for specifying the inputbox/text area from where to convert in hindi. function is in index/main html file so for each page this could be usable.
//convert4FinalDestination(siw.inputBox.name); 
print_many_words(); ////method added for english to hindi conversion
}//handleKeyPress()

//handles various key event for selecting or deselecting the item form the auto-complete list. This should also have code for backspace (TB Added).
function handleKeyDown(event) {
e = getEvent(event);
eL = getEventElement(e);
if (siw && (kc = e["keyCode"])) {
	if (kc == 40) {							////down arrow
		siw.selectingSomething = true;
		freezeEvent(e);
		if (siw.isGecko) siw.inputBox.blur(); /* Gecko hack */
		selectNextSmartInputMatchItem();
	} else if (kc == 38) {					////up arrow
		siw.selectingSomething = true;
		freezeEvent(e);
		if (siw.isGecko) siw.inputBox.blur();
		selectPreviousSmartInputMatchItem();
	} else if ((kc == 13) || (kc == 9)) {	////for enter and tab keys
		siw.selectingSomething = true;
        //alert("hey U");
		activateCurrentSmartInputMatch();
		freezeEvent(e);
	} else if (kc == 27)  {					////escape key
		hideSmartInputFloater();
		freezeEvent(e);
	} else {
		siw.selectingSomething = false;
	}
}

}//handleKeyDown()

function handleFocus(event) {
	e = getEvent(event);
	eL = getEventElement(e);
	//convert4FinalDestination(siw.inputBox.name);
	print_many_words(); //added for on focus hindi translation.
	if (focEl = isWithinNode(eL,null,"wickEnabled",null,null)) {
	if (!siw || (siw && !siw.selectingSomething)) processSmartInput(focEl);
	}
}//handleFocus()

function handleBlur(event) {
	e = getEvent(event);
	eL = getEventElement(e);
	if (blurEl = isWithinNode(eL,null,"wickEnabled",null,null)) {
		if (siw && !siw.selectingSomething) hideSmartInputFloater();
	}
}//handleBlur()

function handleClick(event) {
	e2 = getEvent(event);
	eL2 = getEventElement(e2);
	if (siw && siw.selectingSomething) {
		selectFromMouseClick();
	}
}//handleClick()

function handleMouseOver(event) {
	e = getEvent(event);
	eL = getEventElement(e);
	if (siw && (mEl = isWithinNode(eL,null,"matchedSmartInputItem",null,null))) {
		siw.selectingSomething = true;
		selectFromMouseOver(mEl);
	} else if (isWithinNode(eL,null,"siwCredit",null,null)) {
		siw.selectingSomething = true;
	}else if (siw) {
		siw.selectingSomething = false;
	}
}//handleMouseOver

function showSmartInputFloater() {
if (!siw.floater.style.display || (siw.floater.style.display=="none")) {
	if (!siw.customFloater && x==0 && y==0) {
		x = findElementPosX(siw.inputBox);
		y = findElementPosY(siw.inputBox) + siw.inputBox.offsetHeight;
		//hack: browser-specific adjustments.
		if (!siw.isGecko && !siw.isWinIE) x += 8;
		if (!siw.isGecko && !siw.isWinIE) y += 10;
		siw.floater.style.left = x;
		siw.floater.style.top = y;
		
	} else {
		siw.floater.style.left = x;
		siw.floater.style.top = y;
	//you may
	//do additional things for your custom floater
	//beyond setting display and visibility
	}
	siw.floater.style.display="block";
	siw.floater.style.visibility="visible";
}
}//showSmartInputFloater()

function hideSmartInputFloater() {
if (siw) {
siw.floater.style.display="none";
siw.floater.style.visibility="hidden";
siw = null;
}//siw exists
}//hideSmartInputFloater

function processSmartInput(inputBox) {
if (!siw) siw = new smartInputWindow();
siw.inputBox = inputBox;

classData = inputBox.className.split(" ");
siwDirectives = null;
for (i=0;(!siwDirectives && classData[i]);i++) {
	if (classData[i].indexOf("wickEnabled") != -1)
		siwDirectives = classData[i];
}

if (siwDirectives && (siwDirectives.indexOf(":") != -1)) {
siw.customFloater = true;
newFloaterId = siwDirectives.split(":")[1];
siw.floater = document.getElementById(newFloaterId);
siw.floaterContent = siw.floater.getElementsByTagName("div")[0];
}


setSmartInputData();
if (siw.matchCollection && (siw.matchCollection.length > 0)) selectSmartInputMatchItem(0);
content = getSmartInputBoxContent();
if (content) {
	modifySmartInputBoxContent(content);
	showSmartInputFloater();
} else hideSmartInputFloater();
}//processSmartInput()

function smartInputMatch(cleanValue, value) {
	this.cleanValue = cleanValue;
	this.value = value;
	this.isSelected = false;
}//smartInputMatch

function simplify(s) {
return s./*toLowerCase().*/replace(/^[ \s\f\t\n\r]+/,'').replace(/[ \s\f\t\n\r]+$/,''); ///commented toLowerCase here -arvind
//.replace(/[Ž,,,‘,\u00E9,\u00E8,\u00EA,\u00EB]/gi,"e").replace(/[ˆ,‰,\u00E0,\u00E2]/gi,"a").
}//simplify

function getUserInputToMatch(s) {
a = s;
//alert('new - '+ s); ////testing
fields = s.split(" "); //// original - fields = s.split(",");
//alert(fields); ////testing
if (fields.length > 0) a = fields[fields.length - 1];
return a;
}//getUserInputToMatch

function getUserInputBase() {
//alert(siw.inputBox.value); ////testing
s = siw.inputBox.value;
a = s;
if (!s.lastIndexOf("\n") || (s.lastIndexOf(" ") > s.lastIndexOf("\n"))){ //added condition
if ((lastComma = s.lastIndexOf(" ")) != -1) { //// original - if ((lastComma = s.lastIndexOf(","))
	//a = a.replace(/^(.*\,[ \r\n\t\f\s]*).*$/i,'$1'); ////problem is lying here only arvind
	a = a.slice(0, lastComma+1);
	////pending - check if word is start of new line than add a new line carriage at the end.
}
} ////added
else if ((lastNewLine = s.lastIndexOf("\n")) != -1) { ////added
	a = a.slice(0, lastNewLine+1); ////added
} ////added

else
	a = "";

//alert('str - ' + a); ////testing
return a;

}//getUserInputBase()

function runMatchingLogic(userInput, standalone) {
	userInput = simplify(userInput);
	uifc = userInput.charAt(0).toLowerCase();
	if (uifc == '"') uifc = (n = userInput.charAt(1)) ? n.toLowerCase() : "z";
	if (standalone) userInput = uifc;
	if (siw) siw.matchCollection = new Array();
	pointerToCollectionToUse = collection;
	if (siw && siw.revisedCollection && (siw.revisedCollection.length > 0) && siw.lastUserInput && (userInput.indexOf(siw.lastUserInput) == 0)) {
		pointerToCollectionToUse = siw.revisedCollection;
	} else if (collectionIndex[userInput] && (collectionIndex[userInput].length > 0)) {
		pointerToCollectionToUse = collectionIndex[userInput];
	} else if (collectionIndex[uifc] && (collectionIndex[uifc].length > 0)) {
		pointerToCollectionToUse = collectionIndex[uifc];
	} else if (siw && (userInput.length == 1) && (!collectionIndex[uifc])) {
		siw.buildIndex = true;
	} else if (siw) {
		siw.buildIndex = false;
	}
	
	tempCollection = new Array();

	re1m = new RegExp("^([ \"\>\<\-]*)("+userInput+")","i");
	re2m = new RegExp("([ \"\>\<\-]+)("+userInput+")","i");
	re1 = new RegExp("^([ \"\}\{\-]*)("+userInput+")","gi");
	re2 = new RegExp("([ \"\}\{\-]+)("+userInput+")","gi");
	
	for (i=0,j=0;(i<pointerToCollectionToUse.length);i++) {
		displayMatches = ((!standalone) && (j < siw.MAX_MATCHES));
		entry = pointerToCollectionToUse[i];
		mEntry = simplify(entry);
		if (!standalone && (mEntry.indexOf(userInput) != -1)) {
			userInput = userInput.replace(/\>/gi,'\\}').replace(/\< ?/gi,'\\{');
			re = new RegExp("(" + userInput + ")","i");
			if (displayMatches) {
				siw.matchCollection[j] = new smartInputMatch(entry, mEntry.replace(/\>/gi,'}').replace(/\< ?/gi,'{').replace(re,"<b>$1</b>"));
			}
			tempCollection[j] = entry;
			j++;		
		} else if (mEntry.match(re1m) || mEntry.match(re2m)) {
			if (!standalone && displayMatches) {
				siw.matchCollection[j] = new smartInputMatch(entry, mEntry.replace(/\>/gi,'}').replace(/\</gi,'{').replace(re1,"$1<b>$2</b>").replace(re2,"$1<b>$2</b>"));
			}
			tempCollection[j] = entry;
			j++;
		}
	}//loop thru collection
	if (siw) {
		siw.lastUserInput = userInput;
		siw.revisedCollection = tempCollection.join(",").split(",");
		collectionIndex[userInput] = tempCollection.join(",").split(",");
	}
	if (standalone || siw.buildIndex) {
		collectionIndex[uifc] = tempCollection.join(",").split(",");
		if (siw) siw.buildIndex = false;
	}
}//runMatchingLogic

function setSmartInputData() {
if (siw) {
orgUserInput = siw.inputBox.value;
//orgUserInput = convert2unicode(siw.inputBox.value); //to convert in hindi even before matching it with collection.
//alert('orgUserInput - ' + orgUserInput);
orgUserInput = getUserInputToMatch(orgUserInput);
userInput = orgUserInput./*toLowerCase().*/replace(/[\r\n\t\f\s]+/gi,' ').replace(/^ +/gi,'').replace(/ +$/gi,'').replace(/ +/gi,' ').replace(/\\/gi,'').replace(/\[/gi,'').replace(/\(/gi,'').replace(/\./gi,'\.').replace(/\?/gi,'');
if (userInput && (userInput != "") && (userInput != '"')) {
	hUserInput = convert2unicode(userInput); //to convert in hindi only for matching string. - working better.
	runMatchingLogic(hUserInput);
	//runMatchingLogic(userInput);
}//if userinput not blank and is meaningful
else {
siw.matchCollection = null;
}
}//siw exists ... uhmkaaayyyyy
}//setSmartInputData

function getSmartInputBoxContent() {
a = null;
if (siw && siw.matchCollection && (siw.matchCollection.length > 0)) {
a = '';
for (i = 0;i < siw.matchCollection.length; i++) {
b = '';
selectedString = siw.matchCollection[i].isSelected ? ' selectedSmartInputItem' : '';
//alert('select String - ' + selectedString);
b = '<p class="matchedSmartInputItem' + selectedString + '">' + siw.matchCollection[i].value.replace(/\{ */gi,"&lt;").replace(/\} */gi,"&gt;") + '</p>';
//// start : add code to convert the text in unicode/hindi charector
/*logic added for hindi autocomplete*/
newArray = b.split('b>');
b0 = newArray[0].substr(0, newArray[0].length-1); 
b1 = newArray[1].substr(0, newArray[1].length-2); 
b2 = newArray[2].substr(0, newArray[2].length-4); 
b12c = b1+b2;//convert2unicode(b1+b2);
bc = b0  + b12c + '</p>'; //alert(' bc - ' + bc );
/*hindi conversion of a row is completed*/

a += bc
}//
}//siw exists
return a;
}//getSmartInputBoxContent

function modifySmartInputBoxContent(content) {
//todo: remove credits 'cuz no one gives a shit ;] - done
siw.floaterContent.innerHTML = '<div id="smartInputResults">' + content + (siw.showCredit ? ('<p class="siwCredit">Powered By: <a target="PhrawgBlog" href="http://chrisholland.blogspot.com/?from=smartinput&ref='+escape(location.href)+'">Chris Holland</a></p>') : '') +'</div>';
siw.matchListDisplay = document.getElementById("smartInputResults");
}//modifySmartInputBoxContent()

function selectFromMouseOver(o) {
currentIndex = getCurrentlySelectedSmartInputItem();
if (currentIndex != null) deSelectSmartInputMatchItem(currentIndex);
newIndex = getIndexFromElement(o);
selectSmartInputMatchItem(newIndex);
modifySmartInputBoxContent(getSmartInputBoxContent());
}//selectFromMouseOver

function selectFromMouseClick() {
activateCurrentSmartInputMatch();
siw.inputBox.focus();
hideSmartInputFloater();
}//selectFromMouseClick

function getIndexFromElement(o) {
index = 0;
while(o = o.previousSibling) {
index++;
}//
return index;
}//getIndexFromElement

function getCurrentlySelectedSmartInputItem() {
answer = null;
for (i = 0; ((i < siw.matchCollection.length) && !answer) ; i++) {
	if (siw.matchCollection[i].isSelected)
		answer = i;
}//
return answer;
}//getCurrentlySelectedSmartInputItem

function selectSmartInputMatchItem(index) {
	siw.matchCollection[index].isSelected = true;
}//selectSmartInputMatchItem()

function deSelectSmartInputMatchItem(index) {
	siw.matchCollection[index].isSelected = false;
}//deSelectSmartInputMatchItem()

function selectNextSmartInputMatchItem() {
currentIndex = getCurrentlySelectedSmartInputItem();
if (currentIndex != null) {
	deSelectSmartInputMatchItem(currentIndex);
	if ((currentIndex + 1) < siw.matchCollection.length)
 		selectSmartInputMatchItem(currentIndex + 1);
	else
		selectSmartInputMatchItem(0);
} else {
	selectSmartInputMatchItem(0);
}
modifySmartInputBoxContent(getSmartInputBoxContent());
}//selectNextSmartInputMatchItem

function selectPreviousSmartInputMatchItem() {
currentIndex = getCurrentlySelectedSmartInputItem();
if (currentIndex != null) {
	deSelectSmartInputMatchItem(currentIndex);
	if ((currentIndex - 1) >= 0)
 		selectSmartInputMatchItem(currentIndex - 1);
	else
		selectSmartInputMatchItem(siw.matchCollection.length - 1);
} else {
	selectSmartInputMatchItem(siw.matchCollection.length - 1);
}
modifySmartInputBoxContent(getSmartInputBoxContent());
}//selectPreviousSmartInputMatchItem

function activateCurrentSmartInputMatch() {
	baseValue = getUserInputBase();
	if ((selIndex = getCurrentlySelectedSmartInputItem()) != null) {
		addedValue = siw.matchCollection[selIndex].cleanValue;
        lastSelectedSmartInput = addedValue; //this will rememeber last selection from smart input box.
		theString = (baseValue ? baseValue : "") + addedValue + " "; //// original - theString = (baseValue ? baseValue : "") + addedValue + ", ";
		siw.inputBox.value = theString;
		//add logic - done
		useOnlyHindi(); //this is to return only hindi part on selection from smart input
		runMatchingLogic(addedValue, true);
	}
}//activateCurrentSmartInputMatch

function smartInputWindow () {
	this.customFloater = false;
	this.floater = document.getElementById("smartInputFloater");
	this.floaterContent = document.getElementById("smartInputFloaterContent");
	this.selectedSmartInputItem = null;
	this.MAX_MATCHES = 15;
	this.isGecko = (navigator.userAgent.indexOf("Gecko/200") != -1);
	this.isSafari = (navigator.userAgent.indexOf("Safari") != -1);
	this.isWinIE = ((navigator.userAgent.indexOf("Win") != -1 ) && (navigator.userAgent.indexOf("MSIE") != -1 ));
	this.showCredit = false;
}//smartInputWindow Object

////at - function run at onload
function registerSmartInputListeners() {
inputs = document.getElementsByTagName("input");
texts = document.getElementsByTagName("textarea");
allinputs = new Array();
z = 0;
y = 0;
while(inputs[z]) {
allinputs[z] = inputs[z];
z++;
}//
while(texts[y]) {
allinputs[z] = texts[y];
z++;
y++;
}//

//at - function run at onload
for (i=0; i < allinputs.length;i++) {
	if ((c = allinputs[i].className) && (c == "wickEnabled")) {
		allinputs[i].setAttribute("autocomplete","OFF");
		allinputs[i].onfocus = handleFocus;
		allinputs[i].onblur = handleBlur;
		allinputs[i].onkeydown = handleKeyDown;
		allinputs[i].onkeyup = handleKeyPress;
	}
}//loop thru inputs
}//registerSmartInputListeners

siw = null;

//at - function run at onload
if (document.addEventListener) {
	document.addEventListener("keydown", handleKeyDown, false);
	document.addEventListener("keyup", handleKeyPress, false); ////this included backspace too
	//document.addEventListener("keypress", handleKeyPress, false); ////added
	document.addEventListener("mouseup", handleClick, false);
	document.addEventListener("mouseover", handleMouseOver, false);
} else {
	document.onkeydown = handleKeyDown;
	document.onkeyup = handleKeyPress; ////this blocks backspace too
	//document.onkeypress = handleKeyPress; ///added
	document.onmouseup = handleClick;
	document.onmouseover = handleMouseOver;
}

//at - function run at onload
registerSmartInputListeners();

/*document.write (
'<table id="smartInputFloater" class="floater" style="FONT-SIZE: 14px; WIDTH: 20%;" cellpadding="0" cellspacing="0"><tr><td id="smartInputFloaterContent" nowrap="nowrap">'
+'<\/td><\/tr><\/table>'
);*/

//note: instruct users to the fact that no commas should be present in entries.
//it would make things insanely messy.
//this is why i'm filtering commas here:
for (x=0;x<collection.length;x++) {
collection[x] = collection[x].replace(/\,/gi,'');
}//

collectionIndex = new Array();

ds = "";
function debug(s) {
ds += ( s + "\n");
}

x = 0;
y = 0;

//-----for hindi dictionary updates---------
var lastSelectedSmartInput = "new var";

function useOnlyHindi()
{
	document.getElementById('label_english_meaning').value = lastSelectedSmartInput; //siw.inputBox.value;
    //following code it to split hindi and english (post selection) from the collection database
    var splitIndex = siw.inputBox.value.indexOf("(");
    if(splitIndex != -1)
    {
        siw.inputBox.value = siw.inputBox.value.substr(0, splitIndex);
        //alert(siw.inputBox.value); ////testing
    }   
}
