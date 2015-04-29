importScripts('http://cloud.github.com/downloads/kpozin/jquery-nodom/jquery.nodom.js');

function getNewrowsByWorker(startfrom){
 if( startfrom[2] == 1){
   var postparams =  { start : startfrom[0], count : startfrom[1],reload:Math.random()};
}else{
var postparams =  {  start : startfrom[0], count : startfrom[1]};
}

$.ajax({
      type: "GET",
   //   url: siteURL + "?readviewentries&outputformat=json",
    data : postparams,
      url: './fulljson',
       dataType:'json',
       success:function(newdata){
                postMessage(newdata);
            }
    });
}
this.onmessage  = function(event){
  getNewrowsByWorker(event.data);
}

