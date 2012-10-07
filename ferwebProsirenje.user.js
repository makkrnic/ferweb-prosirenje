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

console.log ('loading prosirenje');





function jQuery_main () {
$().ready (function () {
  var version = 0.03;
  var calElem = $('[id^=calevent_][id$=_calendar]');
  var calName = '#' + calElem.attr ('id');

  var imenujSkriptu_orig = function () {
    
    var pogodak = function () {
        var pattern = /_calendar'\).fullCalendar\(calOptions\);/
        
        var c = $('script');
        
        if (c[17].text.match(pattern)) {
            console.log ('da');
            var ab = c[16].text;
    
            return ab;
        }
        else {
            console.log ('mozda');
            var sadrzajSkripte;
            
            c.each (function () {
                if (($(this).text().match(pattern))) {
                    console.log ('pogodak');
                    sadrzajSkripte = $(this).text();
                }
            });
            return sadrzajSkripte;
        }
    }
    
    var skripta = pogodak();
    
    
    var pattern_jqClear = /\s*(\$)(\()/;
    
    console.log (skripta.match (pattern_jqClear));
    var skriptaEdited1 = skripta.replace (pattern_jqClear, "$2");
   

    var clickevent = ' eventClick: function (event, jsEv, view) {'+
    "\n//    alert (event.title);"+

//    " var patternDvorana = /\[([^\]]*)/; " +
//    " var dvorana =  event.title.match(patternDvorana)[1]; "+
//    " displayRoom(dvorana); "+

    "\n },";
    
    var pattern_mouseEvents = /(eventMouseover:)/
    console.log (skriptaEdited1.match(pattern_mouseEvents));
    skriptaEdited2 = skriptaEdited1.replace (pattern_mouseEvents, clickevent + " $1");


    
    var skripta_origTmp = 'var skripta_orig = ' + skriptaEdited2;
    
    skripta4 = document.createElement ('script');
    skripta4.type = 'text/javascript';
    skripta4.innerHTML = skripta_origTmp;
    $('body').append (skripta4);
  }

  var get_event_sources = function () {

    var pattern = /event_sources\w*=\w*(\[[^\];]*\][^\]]*\])/;

    var c = $('script');
    
    if (c[17].text.match(pattern)) {
        console.log ('da');
        var sources = c[16].text;
    
    }
    else {
        console.log ('mozda');
        var sources;
        
        c.each (function () {
            if (($(this).text().match(pattern))) {
                console.log ('pogodak');
                sources = $(this).text().match (pattern)[1]
            }
        });
    }
    
    return eval (sources);
  }



  var skripta_orig = function () {
    var event_sources = get_event_sources();
    
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
  }


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

  expandCalendar ();
  //imenujSkriptu_orig();

  calElem.text ('');
  skripta_orig();


  $('body').dblclick (function () {
    hideAllRooms();
  })
  
  
  updateCheck ();
});
}

var jQuery = document.createElement("script"),
    inject = document.createElement("script");

jQuery.setAttribute("type", "text/javascript");
jQuery.setAttribute("src", "http://code.jquery.com/jquery-latest.js");

inject.setAttribute("type", "text/javascript");
inject.appendChild(document.createTextNode("(" + jQuery_main + ")()"));

document.body.appendChild(jQuery);
document.body.appendChild(inject);



console.log ('done loading');
