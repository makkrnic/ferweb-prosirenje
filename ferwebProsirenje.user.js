// ==UserScript==
// @name          ferwebProsirenje
// @namespace     http://www.fer.unizg.hr/
// @description   Izmjena za ferweb tako da prosiri stranicu s kalendarom na punu sirinu browsera kako bi kalendar bio pregledniji.
//
// @include *www.fer.hr/kalendar
// @include *www.fer.unizg.hr/kalendar
// @run-at        document-end
// ==/UserScript==


//alert ('Using ferwebProsirenje.');





function jQuery_enable () {
  var version = 0.03;

  function expandCalendar () {
    var frame = document.getElementById ('window_div');
    frame.style.width = '100%';
    frame.style.maxWidth = '100%';
    $('[id^=calevent_][id$=_calendar]').fullCalendar('render');
  }
  
  
  function writeUpdateMessage (newVersion) {
    var adminStrip = $('.admin_strip_left');
    adminStrip.css ({'color': 'white', 'font-size': '11px'});
    
    var getUrl = 'http://fly.srk.fer.hr/~mak/gm/fwProsirenje/api.php?callback=?';
    $.getJSON (getUrl,
              {option: 'getlink', version: newVersion},
              function (returnLink) {
                adminStrip.html ("<a href='" + returnLink + "'>Postoji nova verzija (" + newVersion + ")</a>");
              });
  }
  
  function updateCheck () {
    //alert ('update check');
    var getUrl = 'http://fly.srk.fer.hr/~mak/gm/fwProsirenje/api.php?callback=?';
    $.getJSON (getUrl,
            {option: 'versionCheck'},
            function (data) {
              //alert ("Data: " + data);
              //console.log ('LogData: ' + data);
              if (version < data) {
                writeUpdateMessage (data);
              }
            });
  }

  expandCalendar ();
  updateCheck ();
}

var jQuery = document.createElement("script"),
    inject = document.createElement("script");

jQuery.setAttribute("type", "text/javascript");
jQuery.setAttribute("src", "http://code.jquery.com/jquery-latest.js");

inject.setAttribute("type", "text/javascript");
inject.appendChild(document.createTextNode("(" + jQuery_enable + ")()"));

document.body.appendChild(jQuery);
document.body.appendChild(inject);
