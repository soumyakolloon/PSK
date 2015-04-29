var checker;
if (!Array.prototype.indexOf) {
	Array.prototype.indexOf = function(obj, start) {
		for (var i = (start || 0), j = this.length; i < j; i++) {
			if (this[i] === obj) { return i; }
		}
		return -1;
	}
}
function removeSearchFilter(element){
    $(element).prev("input").val("");
	 dataView.refresh();
}

$(document).ready(function(){	

       
      
	var checkboxSelector = new Slick.CheckboxSelectColumn({
		cssClass:'slick-cell-checkboxsel'
	});
	
	var checkboxSelector = new Slick.CheckboxSelectColumn({
		cssClass:'slick-cell-checkboxsel'
	});

  //highlight the current hovered row
	$("#myGrid").on("mouseenter",".slick-row",function(){
		$(this).find("div").addClass("hoveredrow");
	})
	$("#myGrid").on("mouseleave",".slick-row",function(){
		$(this).find("div").removeClass("hoveredrow");
	})
	
  //Settings wwitch
	$("#settings").switchButton({
		  on_label: 'ON',
		  off_label: 'OFF'
		});
	
	$("#settings").change(function(){
		if($(".demo .switch-button-label").eq(0).hasClass('on')){
			if(columns[0]['id'] != '_checkbox_selector'){
				columns.unshift(checker);
				grid.setColumns(columns);
				
			}
		}else{
			if(columns[0]['id'] == '_checkbox_selector'){
				
				 checker = columns[0];
				columns.splice(0,1);
				grid.setColumns(columns);
			}

		}
		
	})
	 columns.push(checkboxSelector.getColumnDefinition());
	
	
	
	columnajax = getcolumn();
    columnajax.done(function (allcolumns) {
    columns =  ordercolumns(allcolumns);
    
    $( "#progressbar" ).hide();
    //set the progress bar initial value to 1o
    progress = $( "#progressbar" ).progressbar({
        value:10
      });
    $( "#progressbar" ).fadeIn();
    var datapromise = getGridData();
    datapromise.done(function(newdata){
    var toplevelentries = newdata['@toplevelentries'];
    var percount        = newdata['viewentry'].length;
    totalrequest = Math.ceil(toplevelentries/percount); 
        

    arrangeData(newdata['viewentry']);

    dataView = new Slick.Data.DataView();
    grid = new Slick.Grid("#myGrid", dataView, columns, options);
    grid.setSelectionModel(new Slick.RowSelectionModel({selectActiveRow:false}));
    grid.registerPlugin(checkboxSelector);
    var columnpicker = new Slick.Controls.ColumnPicker(columns,grid,options);
  var pager = new Slick.Controls.Pager(dataView, grid, $("#pager"));
    
    grid.onSort.subscribe(function (e, args) {
    sortdir = args.sortAsc ? 1 : -1;
    sortcol = args.sortCol.field;


    if ($.browser.msie && $.browser.version <= 8) {
      // using temporary Object.prototype.toString override
      // more limited and does lexicographic sort only by default, but can be much faster




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
    	
        $("<input type='text'/><span class='removesearch' style='position:absolute;right:6px;'><img src='./jqxclose.png'/></span>")
           .data("columnId", args.column.id)
           .val(columnFilters[args.column.id])
           .appendTo(args.node);
    });
    checker = columns[0];
	columns.splice(0,1);
	grid.setColumns(columns);

  dataView.onPagingInfoChanged.subscribe(function (e, pagingInfo) {
	    var isLastPage = pagingInfo.pageNum == pagingInfo.totalPages - 1;
	    var enableAddRow = isLastPage || pagingInfo.pageSize == 0;
	    var options = grid.getOptions();


	    if (options.enableAddRow != enableAddRow) {
	      grid.setOptions({enableAddRow: enableAddRow});
	    }
	  });


    $(grid.getHeaderRow()).delegate(".removesearch", "click", function (e) {
      var columnId = $(this).data("columnId");
      if (columnId != null) {
       if($.trim($(this).val())!="") 
         if(columns[0]['id'] != '_checkbox_selector'){
          var col = columns[parseInt(columnId)]['filterValues'] =[$.trim($(this).val()),'text'] ;
         }else{
           var col = columns[parseInt(columnId)+1]['filterValues'] =[$.trim($(this).val()),'text'] ;
         }
       else{
           dataView.refresh();
        }
      }
    });


    $(grid.getHeaderRow()).delegate(":input", "onChange keyup ", function (e) {
      var columnId = $(this).data("columnId");
      if (columnId != null) {

    	 if($.trim($(this).val())!="") 
       {
         if(columns[0]['id'] != '_checkbox_selector'){
    			 var col = columns[parseInt(columnId)]['filterValues'] =[$.trim($(this).val()),'text'] ;
    		 }else{
    			 var col = columns[parseInt(columnId)+1]['filterValues'] =[$.trim($(this).val()),'text'] ;
    		 }
        }
    	 else{
  		    if(columns[0]['id'] != '_checkbox_selector'){
           var col = columns[parseInt(columnId)]['filterValues'] ="" ;
         }else{
           var col = columns[parseInt(columnId)+1]['filterValues'] ="";
         }
         columns[parseInt(columnId)+1]['filterValues']= "";
         
       }
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
  
       
     //============================== 
         
         var filterPlugin = new Ext.Plugins.HeaderFilter({});

              // This event is fired when a filter is selected
              filterPlugin.onFilterApplied.subscribe(function () {
                  dataView.refresh();
                  grid.resetActiveCell();

                  // Excel like status bar at the bottom
                  var status;

                  if (dataView.getLength() === dataView.getItems().length) {
                      status = "";
                  } else {
                      status = dataView.getLength() + ' OF ' + dataView.getItems().length + ' RECORDS FOUND';
                  }
                  $('#status-label').text(status);
              });

              // Event fired when a menu option is selected
              filterPlugin.onCommand.subscribe(function (e, args) {
                  dataView.fastSort(args.column.field, args.command === "sort-asc");
              });

              grid.registerPlugin(filterPlugin);

              var overlayPlugin = new Ext.Plugins.Overlays({});

              // Event fires when a range is selected
              overlayPlugin.onFillUpDown.subscribe(function (e, args) {


                  var column = grid.getColumns()[args.range.fromCell];

                  // Ensure the column is editable
                  if (!column.editor) {
                      return;
                  }

                  // Find the initial value
                  var value = dataView.getItem(args.range.fromRow)[column.field];

                  dataView.beginUpdate();

                  // Copy the value down
                  for (var i = args.range.fromRow + 1; i <= args.range.toRow; i++) {
                      dataView.getItem(i)[column.field] = value;
                      grid.invalidateRow(i);
                  }

                  dataView.endUpdate();
                  grid.render();
              });

        grid.registerPlugin(overlayPlugin);
      grid.init();
      dataView.beginUpdate();
      dataView.setItems(data);
      dataView.setFilter(filter);
      dataView.endUpdate();

    })
  })

})
var customdateformat = {};
if (!Array.prototype.map) {
    Array.prototype.map = function (callback, thisArg) {
      var T, A, k;
      if (this == null) {
        throw new TypeError(" this is null or not defined");
      }
      var O = Object(this);
      var len = O.length >>> 0;
      if (typeof callback !== "function") {
        throw new TypeError(callback + " is not a function");
      }
      if (arguments.length > 1) {
        T = thisArg;
      }
      A = new Array(len);
      k = 0;
      while (k < len) {
        var kValue, mappedValue;
        if (k in O) {
          kValue = O[k];
          mappedValue = callback.call(T, kValue, k, O);
          A[k] = mappedValue;
        }
        k++;
      }
      return A;
    };
  }



function JSDateToExcelDate(inDate) {
  var returnDateTime = 25569.0 + ((inDate.getTime() - (inDate.getTimezoneOffset() * 60 * 1000)) / (1000 * 60 * 60 * 24));
  return returnDateTime.toString().substr(0,20);
}
//setting the requirejs configerations
require.config({
                text: 'text.js',
                baseUrl: './slicklib',

                paths: {
                    JSZip: './Excel/jszip'
                },
                shim: {
                    'JSZip': {
                        exports: 'JSZip'
                    }
                }
            });
function detectData(key,data,innerkeyref){
  
   if(data===undefined){
    return "";
   }
   innerkeyref = (columns[0]['id'] != '_checkbox_selector')?innerkeyref:innerkeyref+1;
  if(columns[innerkeyref]['tileline']==9){
    return "";
  } 
  switch(columns[innerkeyref]['detected']) {
  
    case "date":
      //this is a date field. 
      var date = Number(JSDateToExcelDate(new Date(data)));
     
      if(Date.parse(data)){
      //  console.log( customdateformat[innerkey+1],"69");
            var date = Number(JSDateToExcelDate(new Date(data)));
             return {value:date, metadata: {style: customdateformat[innerkeyref].id}}
          }else{
            if(typeof data!="undefined"){
            //  console.log(s);
              //this is specifically for IE,to remove the special characters 
               
               
              var s = data.split(/-| |\:/).map( function( v ){
                return v.replace( new RegExp('\u200E','g'),'')|0;
              });
              
                var dateObj = new Date( s[0], s[1] -1, s[2], s[3], s[4],3 );
            //  return false;
              if(!isNaN(dateObj)){
                
                var date = JSDateToExcelDate(dateObj);
                //console.log(data.split(dateObj));
                //console.log( customdateformat[innerkey+1],typeof date);
                
                 return {value:parseFloat(date), metadata: {style: customdateformat[innerkeyref].id}}
              }else{
                return "";
              }
              return "";
            }
          }
    break;
    case 'span':
    //for links in the 
    //eg <span class="link" nr="8383" onclick="javascript:openAnlaggning('XX=1');">Högdalsgången 10</span>  
    // returns Högdalsgången  
      //if()
      
      if(data!=undefined){
        
        return $(data).html();
      }else{
        return "";
      }
    
    break;
    case 'anchor':
      //for mailto links
      if(data!=undefined){
         return $(data).html();
           }else{
             return "";
           } 
    break;
    case '9':
      //this column is ignored
      return "";
    break;

    default:
      //for every other return data.
      return data ;
    break;

  }
}

function getExceldata() {
    selectedIndexes = grid.getSelectedRows();
    var selectedData =[];
    var count = 0;
    if(!window.Worker){
      if(selectedIndexes.length>2000){
         $.growlUI('Notification', 'To perform this action you need a modern Browser, Please upgrade your browser. We recommend <a href="https://www.google.com/chrome/browser/">Chrome</a>',7000);
        return false;
      }
    }
    if(selectedIndexes.length>0)
    {
      for(index in selectedIndexes){
          var innerkey = 0;
          formatedarray = [];
          for(key in dataView.getItem(index)){
            for(columnkey in columns){    
                    if(columns[columnkey]['field']==key){
                         var formateddata = detectData(key,data[index][key],innerkey); 
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
    if(!window.Worker){
        if(dataView.getLength()>2000){
           $.growlUI('Notification', 'To perform this action you need a modern Browser, Please upgrade your browser. We recommend <a href="https://www.google.com/chrome/browser/">Chrome</a>',7000);
           return false;
        }
        
      }
    for(var allrowcount=0;allrowcount<dataView.getLength();allrowcount++){
        formatedarray = [];
        var innerkey = 0;
         for(key in dataView.getItem(allrowcount)){
          
          if(key!=='unid' && key!=='id'){
            
             var formateddata = detectData(key,data[allrowcount][key],innerkey);  
             innerkey++;  
               
               formatedarray.push(formateddata);
            }
             }
       selectedData.push(formatedarray);
    }
  }
return selectedData;
      }

function getFormat(column){
  //if(columnDef.detected!="date"){
  switch(column['detected']){
      case "date":
        datesetting = {year:'YYYY',month:'mm',day:'dd',hour:'hh',minute:'mm'};
        
        var datearray         = column['allset']['datetimeformat']['@date'].match(/year|month|day/g);
        var timearray         = column['allset']['datetimeformat']['@time'].match(/hour|minute/g);
        return  datesetting[datearray[0]]+"-"+datesetting[datearray[1]]+'-'+datesetting[datearray[2]]+' '+datesetting[timearray[0]]+':'+datesetting[timearray[1]];

      break;
      default:
      return false;;
      break;
    }
  }

function createData(){
    $.growlUI('Notification', 'Please wait...!');
    require(['excel-builder','gridfeeder', 'BasicReport','download'], function (EB, gridfeeder,BasicReport,downloader) {
      var basicReport = new BasicReport();
          var artistWorkbook = EB.createWorkbook();
          var albumList = artistWorkbook.createWorksheet({name: 'Album List'});
          var  columns         = [];
          var gridcolumns      = gridfeeder.getColumns();
          var tmporiginalData = [];
          var  c = [];
          for(index in gridcolumns){
              var toformat = getFormat(gridcolumns[index]);
              if(toformat !=false){
                customdateformat[index] = artistWorkbook.getStyleSheet().createFormat({
                  format: toformat
                });
              }
            if((gridcolumns[index]['id']!=="_checkbox_selector" ) && (gridcolumns[index]!="" )){
               c.push(gridcolumns[index]['name']);
            }
           }
          
          tmporiginalData.push(c); 
          
          var exceldata = getExceldata();
          
          if(exceldata==false){
            return false;
          }
            
          for(index in  exceldata ){
            tmporiginalData.push(exceldata[index]);
            
          }
          albumList.setData(tmporiginalData);
          
          artistWorkbook.addWorksheet(albumList);
          
          
         // console.log(data.length);
          if(!window.Worker){
            
          if(artistWorkbook['worksheets'][0]['data'].length>3000){
            $.growlUI('Notification', 'To perform this action you need a modern Browser, Please upgrade your browser. We recommend <a href="https://www.google.com/chrome/browser/">Chrome</a>',7000);
            return false;
          }else{
            var data = EB.createFile(artistWorkbook);
             downloader('Artist WB.xlsx', data);
           }
          }else{
     
//          var data = EB.createFile(artistWorkbook);
//          downloader('Artist WB.xlsx', data);
          
          EB.createFileAsync(artistWorkbook, {
            
              success: function (data) {
                  downloader('Event WB.xlsx', data);
                 // stopSpin();
              }
          });
          
          
          }
          
          
      });
  }