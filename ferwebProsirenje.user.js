// ==UserScript==
// @name          ferwebProsirenje
// @namespace     http://www.fer.unizg.hr/
// @description   Izmjena za ferweb tako da prosiri stranicu s kalendarom na punu sirinu browsera kako bi kalendar bio pregledniji.
//
// @include *www.fer.hr*
// @include *www.fer.unizg.hr*
// @run-at        document-end
// ==/UserScript==

//alert ('Using ferwebProsirenje.');

console.log ('loading prosirenje');

function jQuery_main () {
var version = 0.131;



var GM_getValue;
var GM_setValue;
var GM_deleteValue;

// workaround
if (!this.GM_getValue || (this.GM_getValue.toString && this.GM_getValue.toString().indexOf("not supported")>-1)) {
    GM_getValue=function (key,def) {
        return localStorage[key] || def;
    };
    GM_setValue=function (key,value) {
        return localStorage[key]=value;
    };
    GM_deleteValue=function (key) {
        return delete localStorage[key];
    };
}




var pluginSettings;
var recolor = JSON.parse (GM_getValue ('calendarRecolor', 'true'));
var resizePages = JSON.parse (GM_getValue ('resizePages', '["kalendar"]'))


// inicijalizacija postavki
pluginSettings = {
  resize              : resizePages,
  calendarRecolor     : recolor
}


console.log (pluginSettings);



var calendarRerender;
var calElem;

var pageUrl = document.URL;

var pageTypes = [
      'kalendar',
      'other'
      ];
var page = null;

if (pageUrl.indexOf('kalendar') != -1) {
  page = 0;
}
else {
  page = 1;
}




$().ready (function () {

  calElem = $('[id^=calevent_][id$=_calendar]');
  var calName = '#' + calElem.attr ('id');


  var get_event_sources = function () {
    var pattern = /event_sources\w*=\w*(\[[^\];]*\][^\]]*\])/;

    var c = $('script');

    //console.log ('mozda');
    var sources;

    c.each (function () {
        if (($(this).text().match(pattern))) {
            //console.log ('pogodak');
            sources = $(this).text().match (pattern)[1]
        }
    });

    return eval (sources);
  }



  var skripta_orig = function () {
    var event_sources = get_event_sources();
    //console.log (event_sources);

		var tmouts=[null, null];
		calOptions=$.extend(
      true,
      {
			  eventSources: event_sources,
			  height:700,

			  loading: function(a){
			  	  if(a) $(calName).css('cursor', 'progress');
			  	  else $(calName).css('cursor', 'default');
			  },

			  eventMouseover: function(ev, jsEv, view){
			  	var h='<span class="arrow"></span>'+
			  	    '<b>'+
			  	    ev.start.getHours()+':'+('0'+ev.start.getMinutes()).substr(-2)+' - '+
			  	    ev.end.getHours()+':'+('0'+ev.end.getMinutes()).substr(-2)+'</b><br />'+
			  	    ev.title;
			  	var p=$(this).offset();
			  	var left = p.left+$(this).width()+8;

			  	

			  	var _css={ left: (left), top: p.top};
			  	tmouts[0]=setTimeout(function(){
			  	    $(calName + '_balloon')
			  	        .css(_css)
			  	        .stop().fadeTo(300,1).html(h);
			  	}, 600);
			  },
			  eventMouseout: function(ev, jsEv, view){
			  	clearTimeout(tmouts[0]);
			  	tmouts[0]=null;
			  	if(tmouts[1]==null){
			  	  tmouts[1]=setTimeout(function(){
			  	    $(calName + '_balloon').fadeOut(50)
			  	    tmouts[1]=null;
			  		}, 300);
			  	}
			  },

        eventClick: function (event, jsev, view) {
          var patternDvorana = /\[([^\]]*)/;
          var dvorana =  event.title.match(patternDvorana)[1];
          displayRoom(dvorana);
        },

        eventRender: function (event, element, view) {
          //console.log (event);
          var curTime = new Date();

		      var color = {
                'border': '#3333DD',
                'predavanje': '#AAAAFF',
                'labos': '#338833',
                'auditorne': '#CA5000'}; //border, predavanje, labosi, auditorne
		      var id;
		
          if (event.title.indexOf ('edavanje') != -1) {
            element.addClass('event_predavanje');
			      id = 'predavanje';
		      }
          else if (event.title.indexOf ('aboratorijsk') != -1) {
            element.addClass ('event_labos');
            id = 'labos';
          }
          else if (event.title.indexOf ('uditorn') != -1) {
            element.addClass ('event_auditorne');
            id = 'auditorne';
          }

          // ---------------------

          if (pluginSettings.calendarRecolor) {
            element.find ('.fc-event-inner').css ({'background-color': color[id], 'border-color': color['border']});
            element.find ('.fc-event-head').css ({'background-color': color['border'], 'border-color': color['border']});
            element.find ('.fc-event-bg').css ({'opacity': 0});
          }

          /*
          var attr = element.attr('style');
          var x = attr.indexOf('background-color:');
          if (x == -1) {
            //attr = attr + 'background-color: ' + color[id] + '; ';
          }
          else {

            var y = attr.length - 1;
            y = attr.indexOf(';', x);
            attr = attr.substring(0, x) + 'background-color: ' + color[id] + '; ' + attr.substring(y);
          }

          x = attr.indexOf('border-color:');
          if (x == -1) {
            //attr = attr + 'border-color: ' + color['border'] + '; ';
          }
          else {
            var y = attr.length - 1;
            y = attr.indexOf(';', x);
            attr = attr.substring(0, x) + 'border-color: ' + color['border'] + '; ' + attr.substring(y);
          }

          element.attr('style', attr);
          // */

          // -------------------
		
          if (curTime > event.start && curTime < event.end) {
            element.find('.fc-event-time').append (" - <span style='color: red'><b>u tijeku</b></span>");

          }
        }
      },
			fullCalendarDefaultOptions
		);
	
		$(calName).fullCalendar(calOptions);

		$(calName + '_balloon').hover(
			function(){
				clearTimeout(tmouts[1]);
				clearTimeout(tmouts[0]);
			tmouts=[null,null];
			},
			function(){
				$(this).hide();
			}
	  );

    //console.log ($(calName));
  }


  var expandPage = function () {
    var frame = document.getElementById ('window_div');
    frame.style.width = '100%';
    frame.style.maxWidth = '100%';
  }

  calendarRerender = function () {
    calElem.fullCalendar('render');
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


  function displayRoom (soba) {
    hideAllRooms();
    sobaFrame = $('<iframe />', {
        'class': 'soba_mapa soba_mapa_' + soba,
        'src':   'http://www.fer.unizg.hr/lokacija/info.php?soba=' + soba
    });

    sobaFrame.css ({position: 'fixed', top: '20px', right: '20px', width: '620px', height: '400px', 'z-index': '1000', 'overflow': 'hidden'});
    $('body').append (sobaFrame);
    //sobaFrame.show(1500);
  }

  function hideRoom (soba) {
    var soba_o = $('.soba_' + soba + '_mapa');
    soba_o.hide(1500);
    soba_o.remove();
  }

  function hideAllRooms () {
    $('.soba_mapa').each (function () {
      //$(this).hide (1500);
      $(this).remove();
    })
  }

  function leftMenuToggle  () {
    $('.tdlijevistupac').toggle ();
  }

  function settingsMenuToggle () {
    $('#settingsMenu').toggle(200);
  }


  if (pluginSettings.resize.indexOf(pageTypes[page]) != -1) {
    expandPage();
  }

  if (page == 0) {
    calElem.text ('');
    skripta_orig();
    calendarRerender();
  }

  $('body').dblclick (function () {
    hideAllRooms();
  });

  $(document).keyup (function (e) {
    if (e.keyCode == 27) {
      hideAllRooms ();
    }
  });

  // Dodaje link za skrivanje/prikazivanje lijevog izbornika
  var navBoxUpper = $('.subheaderbox').find('tr');
  var hideMenuLink = $('<td/>', {
        'class': 'lokacijabox lokacijaboxLink'}).append ($('<a/>', {
          'href': '#',
          'class': 'hidemenu_link'}).append ('Sakrij/prikazi lijevi izbornik')).css ({'width': '150px'});

  navBoxUpper.prepend (hideMenuLink);


  $('.hidemenu_link').on ('click', function (e) {
    e.preventDefault();
    leftMenuToggle();

    if (page == 0) {
      calendarRerender ();
    }
  });

  
  // Dodaje "link" za postavke
  var settingsMenuLink = $('<a/>', {
        'class' : 'gornjilinkoviboxLink',
        'id'    : 'settingsMenuLink',
        'href'  : '#'}).append ('FerWeb prosirenje postavke');
  navBoxUpper.find ('td:last').prepend (settingsMenuLink);
  $('#settingsMenuLink').on ('click', function (e) {
    e.preventDefault();
    settingsMenuToggle();
  });

  updateCheck ();
});
};


var jQuery = document.createElement("script"),
    inject = document.createElement("script");

jQuery.setAttribute("type", "text/javascript");
jQuery.setAttribute("src", "http://code.jquery.com/jquery-latest.js");

inject.setAttribute("type", "text/javascript");
inject.appendChild(document.createTextNode("(" + jQuery_main + ")()"));

document.body.appendChild(jQuery);
document.body.appendChild(inject);




console.log ('done loading');
