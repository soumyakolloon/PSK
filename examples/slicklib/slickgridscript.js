var dataView;
var grid;
var data = [];
var i = 0;
var row = 0;
var columns = [];
var ajax = 0;
var options = {
    enableCellNavigation: true,
    showHeaderRow: true,
    headerRowHeight: 30,
    explicitInitialization: true,
    asyncEditorLoading:false
  };
var searchString = "";

var sortcol = "title";
var sortdir = 1;
var dataType = {};
var percentCompleteThreshold = 0;
var searchString = "";
var queued  = [];
var loopcount = 0;
if( window.Worker)
var primeWorker = new Worker('worker.js');

var columnFilters = {};

function percentCompleteSort(a, b) {
  return a["percentComplete"] - b["percentComplete"];
}

function comparer(a, b) {
  var x = a[sortcol], y = b[sortcol];
  return (x == y ? 0 : (x > y ? 1 : -1));
}

function getcolumn(){
  return $.ajax({
  type: "GET",
  //url: siteURL + "?readdesign&outputformat=json",
  url:'latestviewcolums.json',
  dataType:'json'
    });
}



function filter(item,args) 
{
  

if(typeof item !="object" ){
  
}else{
  
  
   var value   = true;
   var columns = grid.getColumns();
  var filterset = true;
  for (var i = 0; i < columns.length; i++) 
      {
       var col = columns[i];
        if(col.filterValues!=undefined){
          filterset = false;;
        }
                
      }

    
    if(filterset==true){
      value = true;
      return value;
    }
   for (var i = 0; i < columns.length; i++) 
      {
        var foundfalse = false;;
        var col = columns[i];
        var filterValues = col.filterValues;
        if (filterValues && filterValues.length > 0 && filterValues.indexOf("cal")!=-1 && item[col.field]!=undefined) 
        {
          console.log("p");
                  var ff = item[col.field].slice(0,-6);
                  var pp = ff.replace(/\-/g,'/');
                  if(comparedates(filterValues[0],filterValues[1],pp)){
                    //value = true;
                  }else{
                    value =false;
                    //continue;
                  }
        }
        else if((filterValues) && (filterValues.length > 0 )&& (filterValues.indexOf("text")!=-1 )&&(item[col.field]!=undefined) )
        {
          
            if((item[col.field].toLowerCase().indexOf(filterValues[0].toString().toLowerCase()) !=-1 )) {

            }
            else if((item[col.field]=="") )
            {
                //  value = false;
            }
            else{
              console.log(item[col.field]);
             // console.log("not");
              value = false;
            }
        }
        else if ((filterValues) && (filterValues.length > 0 )&& (filterValues.indexOf("text")==-1 )&&(item[col.field]!=undefined) ){
             if(filterValues!=undefined) 
                value = value & _.contains(filterValues, item[col.field]);
        } 
        else{
          if(filterValues!=undefined){
           //  value = value & _.contains(filterValues, item[col.field]);
           // return true;
          }

        }

        
    }
    
    return value;
  }
}



	function openMap() {
	  selectedIndexes = grid.getSelectedRows();
	  if(selectedIndexes.length>0){
	  if(selectedIndexes.length==1){
	      maparray          = {};
	      maparray['docid'] =  dataView.getItem(0)['unid'];
	      openGoogleMap(maparray);
	    }else{
	        maparray        = {};
	        maparray['docids']          = [];
	        for(index in selectedIndexes){
	          maparray['docids'][index] = dataView.getItem(index)['unid'];
	        }
	        openGoogleMap(maparray);
	    }
	 }else{
	    if(dataView.getLength()==1){
	        maparray          = {};
	        maparray['docid'] =  dataView.getItem(0)['unid'];
	        openGoogleMap(maparray);
	    }else{
	        maparray        = {};
	        maparray['docids']          = [];
	        for(var allrowcount=0;allrowcount<dataView.getLength();allrowcount++){
	          maparray['docids'][allrowcount] = dataView.getItem(allrowcount)['unid'];
	        }
	        openGoogleMap(maparray);
	    }
	 }
}
	
function formatter(row, cell, value, columnDef, dataContext){
        return value;
  }

	
function ordercolumns(unsortedcolumn){
	  var items = [];
	  var cols = unsortedcolumn['column'];
	  $.each( cols,function(index,col){
		  
		      columns.push(
	                        {
                            id: col['@columnnumber'], 
                            name:col['@title'], 
                            field: col['@name'],
                            cssClass: "cell-selection", 
                            width: (col['@width']*3)+25,
                            cannotTriggerInsert: true, 
                            resizable: false,
                            //selectable: true,
                            formatter: optionsFormatter,
                            listseparator:(col['@listseparator']=="none")?" ":col['@listseparator'],
                            //sortable: true,
                            //tileline is take 
                            tileline: (col['@tileline']==undefined)?0:col['@tileline'],
                            // formatter: Slick.Formatters.listseparator,
                            allset:col
	                      }
	            );
	         });
	    return columns;
	}

function comparedates(dateFrom,dateTo,dateCheck){

  // var dateFrom = "02/05/2013";
  // var dateTo = "02/09/2013";
  // var dateCheck = "02/07/2013";

  var d1 = dateFrom.split("-");
  var d2 = dateTo.split("-");
  var c = dateCheck.split("/");
  
 

  var from = new Date(d1[0], d1[1]-1, d1[2]);  // -1 because months are from 0 to 11
  var to   = new Date(d2[0], d2[1]-1, d2[2]);
  var check = new Date(c[0], c[1]-1, c[2]);

 


  if(check > from && check < to)
      return true;
    else
      return false;

}

function isArray(value) {
    if (value) {
        if (typeof value === 'object') {
            return (Object.prototype.toString.call(value) == '[object Array]')
        }
    }
    return false;
}

function optionsFormatter(row, cell, value, columnDef, dataContext){

  if(isArray(value)){
    return  value.join(columnDef['listseparator']);
  }

  if(value && typeof value!=='object'){
	  var out = value.match(/^\[(.*)\]/i);
    if(out!=null){
      return out['1'];
    } 
    return value;
  }
}

function formatDate(date,datetype){
	  var datearray         = datetype['allset']['datetimeformat']['@date'].match(/year|month|day/g);
	  var timearray         = datetype['allset']['datetimeformat']['@time'].match(/hour|minute/g);
	  dateandtime           = date.split('T');
	  var stplitdate        = {};
	  stplitdate['year']    = dateandtime[0].substring(0, 4);
	  stplitdate['month']   = parseInt(dateandtime[0].substring(4, 6)) - 1; 
	  stplitdate['day']     = dateandtime[0].substring(6, 8); 
	  stplitdate['hour']    = dateandtime[1].substring(0, 2);  
	  stplitdate['minute']  = dateandtime[1].substring(2, 4); ;
	  return stplitdate[datearray[0]]+"-"+stplitdate[datearray[1]]+"-"+stplitdate[datearray[2]]+" "+stplitdate[timearray[0]]+":"+stplitdate[timearray[1]];
 }

function foramtdata(cindcolum,excel){
	  for(var columncount=0;columncount<columns.length;columncount++){
	      if(columns[columncount]['field']==cindcolum['@name']){
	    	cindcolum['datetime'][0] =formatDate(cindcolum['datetime'][0],columns[columncount]);
	        return cindcolum;
	      }
	  }
	}


function getNewrows(startfrom, count){
if(typeof(Worker) != "undefined") {

   primeWorker.postMessage([startfrom,count]);
   primeWorker.onmessage = function(element) {
      var here = element.data;
       if(here['viewentry']!=="undefined"){
              if(typeof queued[loopcount]!=='undefined'){
                  getNewrows(queued[loopcount][0],queued[loopcount][1]);
                  loopcount++;
                  arrangeData(here['viewentry']);
                  updateslider(loopcount);
                 }else{
                  grid.init();
                  dataView.beginUpdate();
                  dataView.setItems(data);
                  dataView.setFilter(filter);
                 // dataView.setFilter(newfilter);
                  dataView.endUpdate();
                  updateslider(loopcount);
                 }
              }
    };
}else {
	ajax++;
    $.ajax({
      type: "GET",
    //  url: siteURL + "?readviewentries&outputformat=json",
    data : { start : startfrom, count : count },
      url: 'fulljson',
       dataType:'json',
       success:function(newdata){
    	 if(typeof queued[loopcount]!=='undefined'){
                getNewrows(queued[loopcount][0],queued[loopcount][1]);
                loopcount++;
                arrangeData(newdata['viewentry']);
                grid.setData(data);
                grid.render();
                updateslider(loopcount);
                }else{
                	grid.init();
                    dataView.beginUpdate();
                    dataView.setItems(data);
                    dataView.setFilter(filter);
                   // dataView.setFilter(newfilter);
                    dataView.endUpdate();
                    updateslider(loopcount);
                	
                }
            }
    });
  }
}




function getGridData(){
  return $.ajax({
    type: "GET",
    //url: siteURL + "?readviewentries&outputformat=json&count=3000",
    url: 'fulljson',
     dataType:'json',
     contentType: "application/json; charset=utf-8"
  });
}
function detectRowData(data){
	//console.log(cindcolum['text'][0]);
	//this data could be span with an onclick
	//mail to link
	//an href
	
	try{
	if($(data).is('span')==true){
		return "span";
	}
	else if($(data).is('a')==true){
		return "anchor";
	}
	else{
		return "";
	}
	}catch(err) {
	   
	}
} 

function arrangeData(unformatted){
   $.each(unformatted,function(index,rows){
           data[i] = {};
           row++;
           data[i]['unid']    = rows['@unid'];
           var columnnumber = 0;
           $.each(rows['entrydata'],function(index,cindcolum){
        	   try{
                if("text" in cindcolum){
                	var stripped = optionsFormatter("","",cindcolum['text']['0']);
                	if(columns[parseInt((cindcolum['@columnnumber']))+1]['detected']===undefined){
                		columns[parseInt((cindcolum['@columnnumber']))+1]['detected'] =detectRowData(stripped);
                	}
                	data[i]['id']               =  cindcolum['@columnnumber']+row+" "+i;
                    data[i][cindcolum['@name']] =  stripped;
                    keystatus = cindcolum['@name'] in dataType;
                    if(!keystatus){
                      dataType[cindcolum['@name']] ='text';
                    }
                  }
                 else if("textlist" in cindcolum){
                   var textListString = [];
                   for(textindex in cindcolum['textlist']['text']){
                      textListString.push(optionsFormatter("","",cindcolum['textlist']['text'][textindex][0]));
                   }

                	  //var stripped 					= optionsFormatter("","",textListString);
                    data[i]['id']               =  cindcolum['@columnnumber']+row+" "+i;
                    data[i][cindcolum['@name']] =  textListString;
                    keystatus = cindcolum['@name'] in dataType;
                    if(!keystatus){
                      dataType[cindcolum['@name']] ='textlist';
                    }
                  }else if("number" in cindcolum){
                    data[i]['id']               =  cindcolum['@columnnumber']+row+" "+i;

                    data[i][cindcolum['@name']] =  cindcolum['number'][0];
                    keystatus = cindcolum['@name'] in dataType;
                    if(!keystatus){
                      dataType[cindcolum['@name']] ='number';
                    }
                  }else if("datetime" in cindcolum){
                	//this is a date data, so in the column array we are pushing the setting to date
                	if( columns[parseInt((cindcolum['@columnnumber']))+1]['detected']==undefined)
                	  columns[parseInt((cindcolum['@columnnumber']))+1]['detected'] = 'date';
                	 
                    var cindcolum               =  foramtdata(cindcolum);
                    data[i]['id']               =  cindcolum['@columnnumber']+row+" "+i;
                    data[i][cindcolum['@name']] =  cindcolum['datetime'][0];
                    keystatus = cindcolum['@name'] in dataType;
                    if(!keystatus){
                      dataType[cindcolum['@name']] ='datetime';
                    }
                  }
              else{
            	  console.log(cindcolum);
                    alert('new format found!!! check console');
                    return false;
                 }
        	   }catch(e){
        		   
        		}
             });
            i++;
  });

}

 // function updateFilter() {
 //    dataView.setFilterArgs({
 //      searchString: searchString
 //    });
 //    dataView.refresh();
 //  }

 function updateslider(loopcount){
	  percentage = (loopcount+2)/totalrequest*100;
	  
	  progress.progressbar( "value", percentage);
	  if(percentage==100){
		  $( "#progressbar" ).fadeOut('slow');
	  }
	}




