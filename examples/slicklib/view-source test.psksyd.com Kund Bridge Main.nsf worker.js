importScripts('jquery.nodom.js');

function getNewrowsByWorker(startfrom){
var dataPage = 'woFilterAllCopy';
//var siteURL='/Kund/Bridge/workorder.nsf' + '/' + dataPage;
var siteURL='/Kund/Bridge/workorder.nsf' + '/' + dataPage;
$.ajax({
      type: "GET",
      url: siteURL + "?readviewentries&outputformat=json",
    data : { start : startfrom[0], count : startfrom[1]},
   //   url: 'latestviewentries.json',
       dataType:'json',
       success:function(newdata){
                //console.log('got'+startfrom[0]);
                postMessage(newdata);
            }
    });
}



this.onmessage  = function(event){

getNewrowsByWorker(event.data);

}

