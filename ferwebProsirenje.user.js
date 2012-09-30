// ==UserScript==
// @name          ferwebProsirenje
// @namespace     http://www.fer.unizg.hr/
// @description   Izmjena za ferweb tako da prosiri stranicu s kalendarom na punu sirinu browsera kako bi kalendar bio pregledniji.
//
// @include *www.fer.hr/kalendar
// @include *www.fer.unizg.hr/kalendar
// ==/UserScript==


//alert ('Using ferwebProsirenje.');

var frame = document.getElementById ('window_div');
frame.style.width = '100%';
frame.style.maxWidth = '100%';
$('[id^=calevent_][id$=_calendar]').fullCalendar('render')
