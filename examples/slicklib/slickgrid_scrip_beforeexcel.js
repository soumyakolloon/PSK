var dataView;
var grid;
var data = [];
var i = 0;
var row = 0;
var columns = [];
var ajax = 0;
var options = {
    enableCellNavigation: true,
   // showHeaderRow: true,
   // headerRowHeight: 30,
    explicitInitialization: true,
    asyncEditorLoading:false
  };
var searchString = "";
var customdateformat = {};
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
  url: siteURL + "?readdesign&outputformat=json",
  //url:'latestviewcolums.json',
  dataType:'json'
    });
}

function filter(item,args) {
for (var columnId in columnFilters) {
      if (columnId !== undefined && columnFilters[columnId] !== "") {
        var c = grid.getColumns()[grid.getColumnIndex(columnId)];
        if (item[c.field].toLowerCase().indexOf(columnFilters[columnId].toLowerCase()) == -1) {
          return false;
        }
      }
    }
    return true;
  }

function printexcel() {
	  selectedIndexes = grid.getSelectedRows();
	  var selectedData =[];
	  var count = 0;
	  if(selectedIndexes.length>0){
	  for(index in selectedIndexes){
	      formatedarray = {};
	      for(key in dataView.getItem(index)){
	        for(columnkey in columns){
	                if(columns[columnkey]['field']==key){
	                    formatedarray[columns[columnkey]['name'].replace(/[^a-zA-Z]/g, "")] = data[index][key];
	                }
	              }
	      }
	     selectedData[count]  = formatedarray;
	      count++;
	  }
	}else{
	  for(var allrowcount=0;allrowcount<dataView.getLength();allrowcount++){
	      formatedarray = {};
	      for(key in dataView.getItem(allrowcount)){
	          for(columnkey in columns){
	                if(columns[columnkey]['field']==key){
	                    formatedarray[columns[columnkey]['name'].replace(/[^a-zA-Z]/g, "")] = data[allrowcount][key];
	                }
	           }
	      }
	     selectedData[count]  = formatedarray;
	      count++;
	  }
	}
	  makeexecl(selectedData);
	}


	function openmap() {
	  
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
	//=============================================
	
	
	

	function checkValidDate(data){
		var date =  Date.parse(data);
		if(isNaN(date)){
//			data = data.split(/[\s,\-,\:]+/);
//			testdate = new  Date(Date.UTC(data[0], data[1], data[2], data[3], data[4], data[5]));
			
			return testdate;
		}else{
			return new Date(data);
			
		}
	}
	 
	function JSDateToExcelDate(inDate) {
		
	var returnDateTime = 25569.0 + ((inDate.getTime() - (inDate.getTimezoneOffset() * 60 * 1000)) / (1000 * 60 * 60 * 24));
	return returnDateTime.toString().substr(0,20);

	}


	require.config({
	                text: 'text.js',
	                paths: {
	                    JSZip: '//cdnjs.cloudflare.com/ajax/libs/jszip/2.0.0/jszip'
	                },
	                shim: {
	                    'JSZip': {
	                        exports: 'JSZip'
	                    }
	                }
	            });


	function detectdata(key,data,innerkey){
		
		switch(columns[innerkey+1]['tileline']) {
	    case "3":
	      var date = Number(JSDateToExcelDate(new Date(data)));
	      if(Date.parse(data)){
	            var date = Number(JSDateToExcelDate(new Date(data)));
	             return {value:date, metadata: {style: customdateformat[innerkey+1].id}}

	          }else{
	            var s = data.split(/-| |\:/).map( function( v ){
	               return v.replace( new RegExp('\u200E','g'),'')|0;
	            });
	            var dateObj = new Date( s[0], s[1] -1, s[2], s[3], s[4], s[5] );
	            if(!isNaN(dateObj)){
	              var date = JSDateToExcelDate(dateObj);
	               return {value:date, metadata: {style: customdateformat[innerkey+1].id}}
	            }else{
	              return "";
	            }
	            return "";
	            
	          }
	    break;
	    
	    case '5':
	      var out = data.match(/^\[(.*)\]/i);
	      if(out!=null){
	         return $(out['1']).html();
	      }
	    break;
	    case '4':
	    	 var out = data.match(/^\[(.*)\]/i);
	           if(out!=null){
	              return $(out['1']).html();
	           }else{
	        	   return "";
	           } 
	    break;	
	    case '6':
	    
	    return "";
	    break;
	    default:
	    
	    return data ;
	    break;


		}
	}

	function getExceldata() {
        selectedIndexes = grid.getSelectedRows();
        var selectedData =[];
        var count = 0;
       
        if(selectedIndexes.length>0)
        {
        for(index in selectedIndexes){
            var innerkey = 0;
            formatedarray = [];
            for(key in dataView.getItem(index)){
              for(columnkey in columns){    
                      if(columns[columnkey]['field']==key){
                           var formateddata = detectdata(key,data[index][key],innerkey); 
                           innerkey++;   
                            formatedarray.push(formateddata);
                         // formatedarray.push(data[index][key]);
                      }
                    }
            }
           selectedData[count]  = formatedarray;
            count++;
        }
      }else{
        for(var allrowcount=0;allrowcount<dataView.getLength();allrowcount++){
            formatedarray = [];
            var innerkey = 0;
            for(key in dataView.getItem(allrowcount)){
                if(key!=='unid' && key!=='id'){
                 var formateddata = detectdata(key,data[allrowcount][key],innerkey);  
                 innerkey++;  
                   
                   formatedarray.push(formateddata);
                }
                 }
           selectedData.push(formatedarray);
        }
      }
    return selectedData;
	      }
	
	function getformat(column){
  switch(column['tileline']){
      case "3":
        datesetting = {year:'YYYY',month:'mm',day:'dd',hour:'hh',minute:'mm'};
        var datearray         = column['settings']['@date'].match(/year|month|day/g);
        var timearray         = column['settings']['@time'].match(/hour|minute/g);
        return  datesetting[datearray[0]]+"-"+datesetting[datearray[1]]+'-'+datesetting[datearray[2]]+' '+datesetting[timearray[0]]+':'+datesetting[timearray[1]];

      break;
      default:




      return false;;
      break;
    }
  }
	
	function createdata(){
		  $.growlUI('Notification', 'Please wait...!');
		  
		  require(['excel-builder','gridfeeder', 'BasicReport','download'], function (EB, gridfeeder,BasicReport,downloader) {
			  var basicReport = new BasicReport();
	          var artistWorkbook = EB.createWorkbook();
	          var albumList = artistWorkbook.createWorksheet({name: 'Album List'});
	          var  columns         = [];
	          var gridcolumns      = gridfeeder.getColumns();
	          var tmporiginalData = [];
	          columnnames = [];
	          for(index in gridcolumns){
	            if(gridcolumns[index]['tileline']>0){
	              var toformat = getformat(gridcolumns[index]);
	              if(toformat !=false){
	                customdateformat[index] = artistWorkbook.getStyleSheet().createFormat({
	                  format: toformat
	                });
	              }
	            }
	            if(gridcolumns[index]['id']!=="_checkbox_selector"  ){
	               columnnames.push(gridcolumns[index]['name']);
	            }
	           }
	       
	          tmporiginalData.push(columnnames); 
	          var exceldata = getExceldata();
	            
	          for(index in  exceldata ){
	            tmporiginalData.push(exceldata[index]);
	            
	          }
	          albumList.setData(tmporiginalData);
	          artistWorkbook.addWorksheet(albumList);
	     
	          var data = EB.createFile(artistWorkbook);
	          downloader('Artist WB.xlsx', data);
		    });
		}
	//===============================================

function getDataformatter(data){
    switch(data['@tileline']){
      case "3":
        return data['datetimeformat']; 
      break;
      case "4":
      return "mailto";
      break;
      case "5":
    	return "link";  
       break;
      
      
      default:
        return "";
      break;
    }
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
	                            width: col['@width']*3,
	                            cannotTriggerInsert: true, 
	                            resizable: false,
	                            selectable: true,
	                            formatter: optionsFormatter ,
	                            sortable: true,
	                            tileline: (col['@tileline']==undefined)?0:col['@tileline'],
	                            settings: getDataformatter(col)
	                      }
	            );
	         });
	    return columns;
	}

function optionsFormatter(row, cell, value, columnDef, dataContext){
  // console.log(value);
  // if(typeof value=="object"){
  //   return value['0'];
  // }
  if(value && typeof value!=='object'){
	  
    var out = value.match(/^\[(.*)\]/i);
    if(out!=null){
      return out['1'];
    } 
    return value;
  }

}
function formatDate(date,datetype){
	
	  var datearray         = datetype['settings']['@date'].match(/year|month|day/g);
	  var timearray         = datetype['settings']['@time'].match(/hour|minute/g);
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
if(typeof(Worker) !== "undefined") {
   primeWorker.postMessage([startfrom,count]);
   primeWorker.onmessage = function(element) {
      var here = element.data;
       if(here['viewentry']!=="undefined"){
              if(typeof queued[loopcount]!=='undefined'){
                  getNewrows(queued[loopcount][0],queued[loopcount][1]);
                  loopcount++;
                  arrageData(here['viewentry']);
                  updateslider(loopcount);
                 }else{
                  grid.init();
                  dataView.beginUpdate();
                  dataView.setItems(data);
                  dataView.setFilter(filter);
                  dataView.endUpdate();
                  updateslider(loopcount);
                 }
              }
    };
}else {
    ajax++;
    $.ajax({
      type: "GET",
      url: siteURL + "?readviewentries&outputformat=json",
    data : { start : startfrom, count : count },
    //  url: 'latestviewentries.json',
       dataType:'json',
       success:function(newdata){
              if(queued[loopcount]){
                getNewrows(queued[loopcount][0],queued[loopcount][1]);
                loopcount++;
                arrageData(newdata['viewentry']);
                grid.setData(data);
                grid.render();
                updateslider(loopcount);
                }
            }
    });
  }
}




function getgriddata(){
  return $.ajax({
    type: "GET",
    url: siteURL + "?readviewentries&outputformat=json&count=3000",
   // url: 'latestviewentries.json',
     dataType:'json'
  });
}


function arrageData(unfromated){
   $.each(unfromated,function(index,rows){
	   data[i] = {};
       row++;
       data[i]['unid']    = rows['@unid'];
       $.each(rows['entrydata'],function(index,cindcolum){
            if("text" in cindcolum){
                data[i]['id']               =  cindcolum['@columnnumber']+row+" "+i;
                data[i][cindcolum['@name']] =  cindcolum['text']['0'];
                keystatus = cindcolum['@name'] in dataType;
                if(!keystatus){
                  dataType[cindcolum['@name']] ='text';
                }
              }
             else if("textlist" in cindcolum){
                data[i]['id']               =  cindcolum['@columnnumber']+row+" "+i;
                data[i][cindcolum['@name']] =  cindcolum['textlist']['text'][0];
               
                  dataType[cindcolum['@name']] ='textlist';
               
              }else if("number" in cindcolum){
                data[i]['id']               =  cindcolum['@columnnumber']+row+" "+i;
                data[i][cindcolum['@name']] =  cindcolum['number'][0];
                keystatus = cindcolum['@name'] in dataType;
                if(!keystatus){
                  dataType[cindcolum['@name']] ='number';
                }
              }else if("datetime" in cindcolum){
            	  console.log(cindcolum);
            	var cindcolum               =  foramtdata(cindcolum);
                
                data[i]['id']               =  cindcolum['@columnnumber']+row+" "+i;
                data[i][cindcolum['@name']] =  cindcolum['datetime'][0];
                keystatus = cindcolum['@name'] in dataType;
                if(!keystatus){
                  dataType[cindcolum['@name']] ='datetime';
                }
              }
          else{
                alert('new format found!!! check console');
                return false;
             }
         });
       
             i++

           });
//var unfromated = undefined;
}

 function updateFilter() {
    dataView.setFilterArgs({
      searchString: searchString
    });
    dataView.refresh();
  }

 function updateslider(loopcount){
	  percentage = (loopcount+2)/totalrequest*100;
	  
	  progress.progressbar( "value", percentage);
	  if(percentage==100){
		  $( "#progressbar" ).fadeOut('slow');
	  }
	}


$(document).ready(function(){	
	var checkboxSelector = new Slick.CheckboxSelectColumn({
		cssClass:'slick-cell-checkboxsel'
	});
	columns.push(checkboxSelector.getColumnDefinition());
	
    columnajax = getcolumn();
    columnajax.done(function (allcolumns) {
    columns =  ordercolumns(allcolumns);
    $( "#progressbar" ).hide();
    
    progress = $( "#progressbar" ).progressbar({
        value:10
      });
    $( "#progressbar" ).fadeIn();
    datapromise = getgriddata();
    datapromise.done(function(newdata){
    var toplevelentries = newdata['@toplevelentries'];
    var percount        = newdata['viewentry'].length;
    totalrequest = Math.ceil(toplevelentries/percount); 
        

    arrageData(newdata['viewentry']);

    dataView = new Slick.Data.DataView();
    grid = new Slick.Grid("#myGrid", dataView, columns, options);
    grid.setSelectionModel(new Slick.RowSelectionModel({selectActiveRow:false}));
    grid.registerPlugin(checkboxSelector);
    //var columnpicker = new Slick.Controls.ColumnPicker(columns,grid,options);
  var pager = new Slick.Controls.Pager(dataView, grid, $("#pager"));
    
    grid.onSort.subscribe(function (e, args) {
    sortdir = args.sortAsc ? 1 : -1;
    sortcol = args.sortCol.field;


    if ($.browser.msie && $.browser.version <= 8) {
      // using temporary Object.prototype.toString override
      // more limited and does lexicographic sort only by default, but can be much faster


      var percentCompleteValueFn = function () {
        var val = this["percentComplete"];
        if (val < 10) {
          return "00" + val;
        } else if (val < 100) {
          return "0" + val;
        } else {
          return val;
        }
      };


      // use numeric sort of % and lexicographic for everything else
      dataView.fastSort((sortcol == "percentComplete") ? percentCompleteValueFn : sortcol, args.sortAsc);
    } else {
      // using native sort with comparer
      // preferred method but can be very slow in IE with huge datasets
      dataView.sort(comparer, args.sortAsc);
    }
  });

    grid.onHeaderRowCellRendered.subscribe(function(e, args) {
    	$(args.node).empty();
    	
    	if(args.column.id=="_checkbox_selector"){
    		return true;
    	}
    	if(args.column.name=="Icon"){
    		return true;
    		
    	}
    	
        $("<input type='text'/>")
           .data("columnId", args.column.id)
           .val(columnFilters[args.column.id])
           .appendTo(args.node);
    });

  $("#txtSearch,#txtSearch2").keyup(function (e) {
    Slick.GlobalEditorLock.cancelCurrentEdit();

    // clear on Esc
    if (e.which == 27) {
      this.value = "";
    }
    searchString = this.value;
    updateFilter();
  });
  dataView.onPagingInfoChanged.subscribe(function (e, pagingInfo) {
	    var isLastPage = pagingInfo.pageNum == pagingInfo.totalPages - 1;
	    var enableAddRow = isLastPage || pagingInfo.pageSize == 0;
	    var options = grid.getOptions();


	    if (options.enableAddRow != enableAddRow) {
	      grid.setOptions({enableAddRow: enableAddRow});
	    }
	  });


 
    $(grid.getHeaderRow()).delegate(":input", "change keyup", function (e) {
      var columnId = $(this).data("columnId");
      if (columnId != null) {
        columnFilters[columnId] = $.trim($(this).val());
        dataView.refresh();
      }
    });      

     // move the filter panel defined in a hidden div into grid top panel
  $("#inlineFilterPanel")
      .appendTo(grid.getTopPanel())
      .show();

    dataView.onRowCountChanged.subscribe(function (e, args) {
        grid.updateRowCount();
         grid.invalidateRows(args.rows);
        grid.render();
      });
    dataView.onRowsChanged.subscribe(function (e, args) {
        grid.invalidateRows(args.rows);
        grid.render();
      });
   if(totalrequest==1){
	   progress = $( "#progressbar" ).progressbar({
		      value: 100
		    });
	   $( "#progressbar" ).fadeOut('slow');
   }
    //===========get other set of data's===================
     for(k=1;k<totalrequest;k++){ 
       if(k==1)
       var apirequest = getNewrows((k * percount) + 1, percount);
        else{
            start = (k * percount) + 1;
            queued.push([start,percount]);
        }
      }
   //    ============================== 
       
      grid.init();
      dataView.beginUpdate();
      dataView.setItems(data);
      dataView.setFilter(filter);
      dataView.endUpdate();

    })
  })

})


