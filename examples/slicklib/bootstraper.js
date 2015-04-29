/**
 * @file   : bootstraper.js
 * @usage  : handling application process and events
 * @author : Bridge
 * @param {type} $
 * @param {type} columnsObj
 * @param {type} GridController
 * @returns {undefined}
 * @date (created)  :
 * @date (modified)  :
 */

// Core libraries initial defining
define([
    'jQuery',
    'columns',
    'ext.headerfilter',
    'extOverlays',
    'jQueryDrag',
    'jQueryDrop',
    'slick',
    'slickCheckboxselectcolumn',
    'slickAutotooltips',
    'slickCellrangedecorator',
    'slickCellrangedecorator',
    'slickCellrangeselector',
    'slickCellselectionmodel',
    'slickRowselectionmodel',
    'slickColumnpicker',
    'slickFormatters',
    'slickEditors',
    'slickPager',
    'slickCellrangeselector',
    'slickDataview',
    'onof',
    'slickGrid',
    'JSZip',
    'windowscope',
    'blockui',
    'GridController'
 ],
    function($,columnsObj){
        // Global variables 
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
	var sortcol = "title"; 
	var dataType = {};  
	var queued  = [];
	var loopcount = 0;
	if(window.Worker)
	var primeWorker = new Worker('./slicklib/worker.js'); 
	var columnFilters = {};
	
    var customdateformat = {};
        var img_src='/Psk-Theme1/examples/slicklib/images/tick';
    /*
     * General scripts including js/jquery/prototype/api calls etc.
     * 
     */
    // Top slide toggle - Jquery functionality
	$("#sliderswitch").click(function(){
           
            $(".settings_holder").slideToggle();
	}); 
	$("#clearallsearch").click(function(){
            try{
            for(index in columns){
                    columns[index].textsearch = undefined;
                    columns[index].filterValues  = undefined; 
            }
            }catch(ee){
                // catch the error/exception 
            }
            $(".slick-header-menubutton").css("background-image", 'url(./slicklib/nosort.png)');
            $(".textsearch").val("");
            dataView.refresh();
	});
     // Google map - Jquery functionality
    $("#mapopen").click(function(){
        selectedIndexes = grid.getSelectedRows();
		 
        if(selectedIndexes.length>0){
            if(selectedIndexes.length===1){
                maparray = {};
                maparray['docid'] = dataView.getItem(0)['unid'];
                openGoogleMap(maparray);
            }else{
                maparray = {};
                maparray['docids']= [];
                for(index in selectedIndexes){
                    maparray['docids'][index] = dataView.getItem(index)['unid'];
                }
                openGoogleMap(maparray);
            }
        }else{
            if(dataView.getLength()===1){
                maparray = {};
                maparray['docid'] = dataView.getItem(0)['unid'];
                openGoogleMap(maparray);
            }else{
                maparray = {};
                maparray['docids'] = [];
                for(var allrowcount=0;allrowcount<dataView.getLength();allrowcount++){
                  maparray['docids'][allrowcount] = dataView.getItem(allrowcount)['unid'];
                }
                openGoogleMap(maparray);
            }
        }
    });
    //prototype function for map
    if (!Array.prototype.map){
        Array.prototype.map = function (callback, thisArg){
            var T, A, k;
            if (this === null){
                throw new TypeError(" this is null or not defined");
            }
            var O = Object(this);
            var len = O.length >>> 0;
            if(typeof callback !== "function"){
                throw new TypeError(callback + " is not a function");
            }
            if (arguments.length > 1){
                T = thisArg;
            }
            A = new Array(len);
            k = 0;
            while(k < len){
                var kValue, mappedValue;
                if (k in O){
                    kValue = O[k];
                    mappedValue = callback.call(T, kValue, k, O);
                    A[k] = mappedValue;
                }
                k++;
            }
            return A;
        };
    }
    // Excel download - JQuery functionality
    $("#downloader").click(function(){
        $.growlUI('Notification', 'Please wait...!');
        require(['excel-builder', './BasicReport','download'], function (EB,BasicReport,downloader){
            var basicReport = new BasicReport();
            var artistWorkbook = EB.createWorkbook();
            var albumList = artistWorkbook.createWorksheet({name: 'Album List'});
            var  columns         = [];
            var gridcolumns      = columnsObj.getcolumns();
            var tmporiginalData = [];
            var  c = []; 
            for(index in gridcolumns){
                var toformat = getFormat(gridcolumns[index]);
                if(toformat !== false){
                    customdateformat[index] = artistWorkbook.getStyleSheet().createFormat({
                    format: toformat
                });
                }
                if((gridcolumns[index]['id'] !== "_checkbox_selector" ) && (gridcolumns[index] !== "" )){
                    c.push(gridcolumns[index]['name']);
                }
            } 
            tmporiginalData.push(c);  
            var exceldata = getExceldata(); 
            if(exceldata === false){
                return false;
            } 
            for(index in  exceldata ){
                tmporiginalData.push(exceldata[index]); 
            }
            albumList.setData(tmporiginalData); 
            artistWorkbook.addWorksheet(albumList); 
            if(!window.Worker){ 
                if(artistWorkbook['worksheets'][0]['data'].length>3000){
                    $.growlUI('Notification', 'To perform this action you need a modern Browser, Please upgrade your browser. We recommend <a href="https://www.google.com/chrome/browser/">Chrome</a>',7000);
                    return false;
                }else{
                    var data = EB.createFile(artistWorkbook);
                    downloader('Artist WB.xlsx', data);
                }
            }else{ 
                EB.createFileAsync(artistWorkbook, {
                    success: function (data){
                        downloader(''+ dataPage, data);  
                    }
                });
            }
        });
    });
    //
    var checker;
    if (!Array.prototype.indexOf){
        Array.prototype.indexOf = function(obj, start){
            for (var i = (start || 0), j = this.length; i < j; i++) {
                if (this[i] === obj) { return i; }
            }
            return -1;
        };
    }
    // grid sorter function
    var gridSorter = function(columnField, isAsc, grid, gridData){
    var sign = isAsc ? 1 : -1;
    var field = columnField;
    gridData.sort(function (dataRow1, dataRow2){
        var value1 = dataRow1[field], value2 = dataRow2[field];
        var result = (value1 === value2) ?  0 :
        ((value1 > value2 ? 1 : -1)) * sign;
        return result;
    });
    grid.invalidate();
    grid.render();
    };
	

    
    /*
     * General Functions
     * 
     */     
    /*
     *  Function for compare two values for sort order
     * @param {type} a
     * @param {type} b
     * @returns {Number}
     */ 
    function comparer(a, b) {
        var x = a[sortcol], y = b[sortcol];
	return (x === y ? 0 : (x > y ? 1 : -1));
    }
    /*
     * Function for getcolumn from json data (URL refrence)
     * @returns {jqXHR}
     */ 
    function getcolumn(){
	return $.ajax({
	type: "GET",
	//url: siteURL + "?readdesign&outputformat=json",
	url:'latestviewcolums.json', // test url json data file
	dataType:'json'
	});
    }  
    /*
     * Function for filter the data grid
     * @Desc (Filtering the grid according to the sorting key words)
     * @param {type} item
     * @param {type} args
     * @returns {Boolean}
     */    
    function filter(item,args)
    {
      
    if(typeof item !== "object" ){ 
    }else{ 
    var filterset  = false;
    var value   = true;
    if(typeof columns!=='undefined'){ 
        for (var i = 0; i < columns.length; i++)
        {
            var col = columns[i];
            if(col.filterValues!==undefined ||col.textsearch !==undefined ){
                filterset = true;
            }
        }
        if(filterset===true)
        { 
         
          if(columns[0]['id'] !== '_checkbox_selector')
          {
            
            columns.unshift(checker);
            // Change switch button status : Set search filter ON
            $("#settings").switchButton({
                checked: true
            });
            grid.setColumns(columns);
            for (var i = 0; i < columns.length; i++)
            {
                var col = columns[i];
                var filterValues = col.filterValues;
                var textsearch   = col.textsearch;
                 
            if(typeof textsearch!=="undefined"){
                $(".textsearch").eq(i-1).val(textsearch[0]);
                $(".textsearch").eq(i-1).focus();
            }
            }
          } 
        }else{
           
            if(columns[0]['id'] === '_checkbox_selector'){
                columnshecker = columns[0];
                columns.splice(0,1);
                grid.setColumns(columns);
            }
           /* Check the result object array set return false for filter
            * If result is return false, change the filter button status to OFF
           */
            $("#settings").switchButton({
                checked: false
            });
        }
    }
    
    // looping the column data - get grid data of the current sort
    for (var i = 0; i < columns.length; i++){ 
        
        var col = columns[i];
        var filterValues = col.filterValues;
        var textsearch   = col.textsearch; 
        if (filterValues && filterValues.length > 0 && filterValues.indexOf("cal")!== -1 && item[col.field]!== undefined){ 
            var ff = item[col.field].slice(0,-6);
            var pp = ff.replace(/\-/g,'/');
            if(comparedates(filterValues[0],filterValues[1],pp)){
            //value = true;
            }else{
            value =false; 
            }
            
        }else{ 
            
            if(filterValues!== undefined && filterValues.length>0)
                  
            	 if(filterValues!==undefined && filterValues.length>0){
                  
                     value = value & _.contains(filterValues, item[col.field]);
                     
                     if(!value){
                            value =true;
                            var col_val= item[col.field]; 
                            value = value & _.contains(filterValues,col_val); 
                        } 
            	 }
           
            if(textsearch !== undefined && typeof textsearch[0]!== "undefined" && value === true && item[col.field] !== undefined){
                    // console.log(filterValues);
                    
                    if(textsearch[0].indexOf("*")=== -1){
                   
                    var condition = "^(\s+)?"+textsearch[0]+"";
                    var regobj = new RegExp(condition,"ig");
                    if(typeof item[col.field] =="undefined"){
                        value = false; 
                    }else{ 
                        var found = item[col.field].match(regobj);
                    } 
                    if(found === undefined){
                        value = false; 
                    }else if(found === null){
                        value = false; 
                    } 
//					 console.log(grid.setSelectedRows([0,10]));
					
					  /* for(var i=0; i<grid.getDataLength(); i++){
		   console.log(dataView.getRowById(1));
		    console.log(dataView.getIdxById(1));
   //dataView.getRowById(i);
   //dataView.getIdxById(i);
}*/
                    
                }else{ 
                    
                starremoved   = textsearch[0].replace("*","");
                if((item[col.field].toLowerCase().indexOf(starremoved.toString().toLowerCase()) ===-1 )){
                    value = false;
                }
                }
            } 
            if(textsearch !== undefined && value === true && item[col.field] === undefined){
                value = false;
            }
        }
    } 
	
        return value;
    }
    }

    /*
     * Function for getting google map accroding to the data result
     * @param {type} options
     * @returns {undefined}
     */
     
    function openGoogleMap(options){
	 
        // modified to handle encoded values by checking for indexOf('%')
        var strFeatures=
		'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=yes';
        strFeatures+=', width=1000, height=760';
        var args=(typeof options.docid==='undefined' || options.docid==='') ? '' : '&docunid='+ ((options.docid.indexOf('%')>-1) ? options.docid : encodeURI(options.docid));
        args+=(typeof options.view==='undefined' || options.view==='') ? '' : '&view='+ ((options.view.indexOf('%')>-1) ? options.view : encodeURI(options.view));
        args+=(typeof options.category==='undefined' || options.category==='') ? '' : '&category='+ ((options.category.indexOf('%')>-1) ? options.category : encodeURI(options.category));
        args+=(typeof options.query==='undefined' || options.query==='') ? '' : '&query='+ ((options.query.indexOf('%')>-1) ? options.query : encodeURI(options.query));
        if(typeof options.docids!=='undefined' && options.docids.length>0){ 	
            setIDsArray(options.docids);
            args+='&getidscallback=getIdsArray&_='+new Date().getTime();	/* no-cache */
        }

	  var _account = {
     User: 'test',
     Pass: '***'
   };
   //converts to JSON string the Object Literal
   _account = JSON.stringify(_account);
   localStorage.setItem('_Account', _account);		
        var dbPath=(typeof options.dbpath==='undefined' || options.dbpath==='') ? '' : '/'+options.dbpath+'/';
        var w=window.open(dbPath+'GoogleMaps.html?openpage'+args, '', strFeatures);
        w.focus();
		
    } 
	var arrIds=[]; // Global array for the setIdsArray fn.
    // Function for set id's to the callback value of the google map 
    function setIDsArray(ids){
        arrIds.length=0;
        for (var i=0; i<ids.length; i++) {
                arrIds.push(ids[i]);
        }
    } 
   
    /*
     * Function for order columns - for default unsorted columns
     * @paramas unsortedcolumn
     * @return columns (sorted - ordered)
     */ 	
    function ordercolumns(unsortedcolumn){ 
        var cols = unsortedcolumn['column'];
        $.each( cols,function(index,col){ 
		//console.log(col['@width']);
            columns.push(
                {
                    id: col['@columnnumber'], 
                    name: (col['@title']!== undefined)?col['@title']:col['@hiddentitle'], 
                    field: col['@name'],
                    cssClass: "cell-selection "+ addColstyle(col,'cfont'),
                    headerCssClass:addColstyle(col,'hfont'),
                    width: (col['@width']*3)+25,
                    cannotTriggerInsert: true, 
                    resizable: false,
                    sortorder:col['@resortascending']?true:false, 
                   // selectable: true,
                    formatter: optionsFormatter ,
                    sortable: true,
                    //tileline is take 
                    tileline: (col['@tileline']=== undefined)?0:col['@tileline'], 
                    allset:col
                }
            );
        });
        columnsObj.setcolumns(columns);
        var style = $("<style>"+stylesString+"</style>");
        $('html > head').append(style);
        return columns;
    }
    /*
     * Function for compare dates
     * @params dateFrom - from date
     * @params dateTo - to date 
     * @return true/false
     * 
     */
    function comparedates(dateFrom,dateTo,dateCheck){ 
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
    /*
     * Function for grid formatter
     * @params value
     * @params Optionals
     */
   function optionsFormatter(row, cell, value, columnDef, dataContext){
        if(typeof value === "object"){
            return value['0'];
        }   
        if(value && typeof value!=='object'){ 
    	 if(typeof value=='number') {
             return value;
            }
	    var out = value.match(/^\[(.*)\]/i); 
	    if(out!== null){ 
                if(out['1'] !== undefined){ 
                	 var re = /(<img src)/i;
                	 var found = value.match(re);
					 if(found != null){
						return out[1];
					 }else{
							return $(out['1']).html();
					 } 
                }else{ 
                    return "";
                }  
	    }   
            return value;
	}
    }
    /*
     * Function for convert script date to excel date
     * @params inDate
     * @return excel date
     */
    
    function JSDateToExcelDate(inDate){
        var returnDateTime = 25569.0 + ((inDate.getTime() - (inDate.getTimezoneOffset() * 60 * 1000)) / (1000 * 60 * 60 * 24));
        return returnDateTime.toString().substr(0,20);
    }
    /*
     * Function for detect data (in checkbox selector with its key)
     * @param data
     * @param innerkeyref
     * @return data (re formatted)
     */ 
    function detectData(key,data,innerkeyref){ 
        if(data===undefined){
            return "";
        }
        innerkeyref = (columns[0]['id'] !== '_checkbox_selector')?innerkeyref:innerkeyref+1;
        if(columns[innerkeyref]['tileline']=== 9){
            return "";
        } 
        switch(columns[innerkeyref]['detected']){ 
            case "date": 
                var date = Number(JSDateToExcelDate(new Date(data))); // data field 
                if(Date.parse(data)){ 
                    var date = Number(JSDateToExcelDate(new Date(data)));
                    return {value:date, metadata: {style: customdateformat[innerkeyref].id}};
                }else{
                    if(typeof data!== "undefined"){ 
                    //this is specifically for IE,to remove the special characters  
                        var s = data.split(/-| |\:/).map( function( v ){
                            return v.replace( new RegExp('\u200E','g'),'')|0;
                        }); 
                        var dateObj = new Date( s[0], s[1] -1, s[2], s[3], s[4],3 ); 
                        if(!isNaN(dateObj)){ 
                            var date = JSDateToExcelDate(dateObj); 
                            return {value:parseFloat(date), metadata: {style: customdateformat[innerkeyref].id}};
                        }else{
                            return "";
                        }
                        return "";
                    }
                }
            break;
            case 'span': 
                if(data !== undefined){ 
                    return $(data).html();
                }else{
                    return "";
                } 
            break;
            case 'anchor':
                //for mailto links
                if(data !== undefined){
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
    /*
     * Function for get excel data
     * @param null
     * @return data
     */
    function getExceldata(){
        selectedIndexes = grid.getSelectedRows();
        var selectedData =[];
        var count = 0;
        if(!window.Worker){
            if(selectedIndexes.length>2000){
            $.growlUI('Notification', 'To perform this action you need a modern Browser, Please upgrade your browser. We recommend <a href="https://www.google.com/chrome/browser/">Chrome</a>',7000);
            return false;
            }
        }
        if(selectedIndexes.length>0){
			
            for(index in selectedIndexes){
                var innerkey = 0;
                formatedarray = [];
                for(key in dataView.getItem(index)){
                    for(columnkey in columns){    
                        if(columns[columnkey]['field'] === key){
                            var formateddata = detectData(key,data[index][key],innerkey); 
                            innerkey++;   
                            formatedarray.push(formateddata); 
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
    /*
     * Function for get column format of the data
     * @param column 
     * @return data format
     */ 
    function getFormat(column){ 
        switch(column['detected']){
            case "date":
            datesetting = {year:'YYYY',month:'mm',day:'dd',hour:'hh',minute:'mm'}; 
            var datearray = column['allset']['datetimeformat']['@date'].match(/year|month|day/g);
            var timearray = column['allset']['datetimeformat']['@time'].match(/hour|minute/g);
            return  datesetting[datearray[0]]+"-"+datesetting[datearray[1]]+'-'+datesetting[datearray[2]]+' '+datesetting[timearray[0]]+':'+datesetting[timearray[1]];
            break;
            default:
            return false;;
            break;
        }
    }
    /*
     * Function for formatting date for data view and further proceedings
     * @params date,datatype
     * @return formatted date
     * 
     */ 
	 
	 function formatDate(date,datetype){   
	    var datearray = datetype['allset']['datetimeformat']['@date'].match(/year|month|day/g);
        var timearray = datetype['allset']['datetimeformat']['@time'].match(/hour|minute/g);
	    var newVal=0;
        dateandtime = date.split('T'); 
        var stplitdate = {};  
		var length = ~~(Math.log(dateandtime[0].substring(4,8)) / Math.LN10 + 1);  // Check the integer
		stplitdate['year'] = dateandtime[0].substring(0, 4)?dateandtime[0].substring(0, 4):""; 
		stplitdate['month'] = dateandtime[0].toString().substring(4, 6)?dateandtime[0].toString().substring(4, 6):""; 
		stplitdate['day'] = dateandtime[0].toString().substring(6, 8)?dateandtime[0].toString().substring(6, 8):""; 	
//		console.log(stplitdate[timearray[0]]);
		
		if(stplitdate[datearray[0]] != undefined && stplitdate[datearray[1]] != undefined && stplitdate[datearray[2]] != undefined){
			return stplitdate[datearray[0]]+"-"+stplitdate[datearray[1]]+"-"+stplitdate[datearray[2]]+" ";		
		}else if(stplitdate[datearray[0]] != undefined && stplitdate[datearray[1]] != undefined){
			return stplitdate[datearray[0]]+"-"+stplitdate[datearray[1]]+" ";		
		}else if(stplitdate[datearray[0]] != undefined && stplitdate[datearray[2]] != undefined){
			return stplitdate[datearray[0]]+"-"+stplitdate[datearray[1]]+" ";	
		}else if(stplitdate[datearray[1]] != undefined && stplitdate[datearray[2]] != undefined){
			return stplitdate[datearray[1]]+"-"+stplitdate[datearray[2]]+" ";	 
		}else if(stplitdate[datearray[0]] != undefined){
			return stplitdate[datearray[1]]+"-"+stplitdate[datearray[2]]+" ";		
		}else if(stplitdate[datearray[1]] != undefined){
			return stplitdate[datearray[0]]+"-"+stplitdate[datearray[2]]+" ";	
		}else if(stplitdate[datearray[2]] != undefined){
			return stplitdate[datearray[0]]+"-"+stplitdate[datearray[1]]+" ";	
		}
			if(stplitdate[timearray[0]] != undefined && stplitdate[timearray[1]] != undefined){
				return stplitdate[datearray[0]]+"-"+stplitdate[datearray[1]]+"-"+stplitdate[datearray[2]]+" "+stplitdate[timearray[0]]+":"+stplitdate[timearray[1]];
			}else if(stplitdate[timearray[0]] != undefined && stplitdate[timearray[1]] == undefined ){
				return stplitdate[datearray[0]]+"-"+stplitdate[datearray[1]]+"-"+stplitdate[datearray[2]]+" "+stplitdate[timearray[0]]+":00";
			}else if(stplitdate[timearray[0]] != undefined && stplitdate[timearray[1]] == undefined ){
				return stplitdate[datearray[0]]+"-"+stplitdate[datearray[1]]+"-"+stplitdate[datearray[2]]+" "+":"+stplitdate[timearray[1]];
			}
	}
	 
	 
    function formatDatenjn(date,datetype){  
	console.log(date,datatype)
  //console.log(datetype); 
		var newVal=0;
	//var dateform=datetype['allset']['datetimeformat']['@date'];
	if(datetype == 'yearmonthday'){
 	 //console.log('Year,month and day');
		var datearray = datetype.match(/year|month|day/g);
        var timearray = datetype.match(/hour|minute/g);
		
		dateandtime = date.split('T');
		var stplitdate = {};  
        var length = ~~(Math.log(dateandtime[0].substring(4,8)) / Math.LN10 + 1);  // Check the integer
        stplitdate['year']    = dateandtime[0].substring(0, 4);   
		 //console.log(length);
        if (dateandtime[0].substring(4,5) >= 2 && dateandtime[0].substring(4,5) <= 9){ 
            stplitdate['month'] = "" + newVal + parseInt(dateandtime[0].substring(4,5));  
            stplitdate['day'] = "" + newVal + dateandtime[0].substring(6, 8);
        }else if(length === 3){
            stplitdate['month'] = "" + newVal + parseInt(dateandtime[0].substring(4,5)); 
            stplitdate['day'] = "" + newVal + dateandtime[0].substring(6, 8);
        }else{
            stplitdate['month'] = parseInt(dateandtime[0].substring(4, 6));  
            stplitdate['day'] = dateandtime[0].substring(6, 8);
        } 
		if(dateandtime[1] != undefined){
		stplitdate['hour'] = dateandtime[1].substring(0, 2);
        stplitdate['minute'] = dateandtime[1].substring(2, 4);
		return stplitdate[datearray[0]]+"-"+stplitdate[datearray[1]]+"-"+stplitdate[datearray[2]]+" "+stplitdate[timearray[0]]+":"+stplitdate[timearray[1]];
		}else{
		return stplitdate[datearray[0]]+"-"+stplitdate[datearray[1]]+"-"+stplitdate[datearray[2]]+" "+ "00"+":"+ "00";	
		} 
	}else if(datetype == 'yearmonth'){
		var datearray = datetype.match(/year|month/g);
        var timearray = datetype.match(/hour|minute/g);
		dateandtime = date.split('T');
		var stplitdate = {};  
        var length = ~~(Math.log(dateandtime[0].substring(4,8)) / Math.LN10 + 1);  // Check the integer
		  //console.log(date);
		 return 10;
	}else if(datetype == 'monthday'){
		var datearray = datetype.match(/year|month|day/g);
        var timearray = datetype.match(/hour|minute/g);
		// console.log('month and day');
		 return 1;
	}else{
		return 3;
		 console.log('No format');
	}
		//console.log(datetype['allset']['datetimeformat']['@date']);
       
       
		
        
        
		//console.log(stplitdate[datearray[2]]);
        //stplitdate['month']   = dateandtime[0].substring(4, 6) -1; //old code 
       
    }
    /*
     * Function for format excel column data
     * @params cindcolum,excel
     * @return cindcolum (formatted)
     */
    function foramtdata(cindcolum,excel){  
	/*
	    for(var columncount=0;columncount<columns.length;columncount++){ 
			if(columns[columncount]['detected'] == "date"){ 
				 if(cindcolum['@columnnumber'] == columns[columncount]['id']){ 
					var dateVal = columns[cindcolum['@columnnumber']]['allset']['datetimeformat']['@date'];
					cindcolum['datetime'][0] =formatDate(cindcolum['datetime'][0],dateVal);
					return cindcolum;
				 } 
			}
			*/
		  for(var columncount=0;columncount<columns.length;columncount++){ 	
			//console.log(columns[columncount]['field'],cindcolum['@name'])
			if(columns[columncount]['field'] === cindcolum['@name']){
                cindcolum['datetime'][0] =formatDate(cindcolum['datetime'][0],columns[columncount]);
				
			   return cindcolum;
           }
        }
		
    }
    /*
     * Function for get new rows (after processing like sorting,filtering etc.)
     * @params startfrom, count
     * @return reorderd data
     */ 
    function getNewrows(startfrom, count){
		
        if(typeof(Worker) !== "undefined") { 
//		console.log(count);
            primeWorker.postMessage([startfrom,count,dataPage,siteURL]);
            primeWorker.onmessage = function(element){
//                 console.log('Suc');
                var here = element.data;
                  
                if(here['viewentry']!=="undefined"){
                    if(typeof queued[loopcount]!=='undefined'){ 
                        getNewrows(queued[loopcount][0],queued[loopcount][1]);
                        loopcount++;
                        arrangeData(here['viewentry']);
                        updateslider(loopcount);
                        grid.init();
                        dataView.beginUpdate();
                        dataView.setItems(data);
                        dataView.setFilter(filter); 
                        dataView.endUpdate();
                        updateslider(loopcount);
                        reorder(); // calling reorder function
                    }else{
                        arrangeData(here['viewentry']);
                        updateslider(loopcount);	 
                        grid.init();
                        dataView.beginUpdate();
                        dataView.setItems(data);
                        dataView.setFilter(filter); 
                        dataView.endUpdate();
                        updateslider(loopcount);
                        reorder(); // calling reorder function
                    }
                    }else{
                        grid.init();
                        dataView.beginUpdate();
                        dataView.setItems(data);
                        dataView.setFilter(filter);
                        dataView.endUpdate(); 
                        reorder(); // calling reorder function
                    }
            };
             
        }else{
             
            ajax++;
            $.ajax({
            type: "GET",
             url: 'fulljson.json',
            //url: siteURL + "?readviewentries&outputformat=json",
            data : { start : startfrom, count : count },
            //  url: 'latestviewentries.json', // test json data URL
            dataType:'json',
            success:function(newdata){
            
                if(typeof queued[loopcount]!=='undefined'){
                    getNewrows(queued[loopcount][0],queued[loopcount][1]);
                    loopcount++;
                    arrangeData(newdata['viewentry']);
                    grid.setData(data);
                    grid.render();
                    updateslider(loopcount);
                    reorder();
                }else{
                    arrangeData(newdata['viewentry']);
                    updateslider(loopcount);	
                    grid.init();
                    dataView.beginUpdate();
                    dataView.setItems(data);
                    dataView.setFilter(filter);  
					console.log(dataView);
                    dataView.endUpdate();
                    updateslider(loopcount);
                    reorder();
                    }
                }
            });
        }
        reorder(); // calling reorder function
    }
    /*
     * Function for re order the data set
     * @param null 
     * @return re oredered data grid
     */
    function reorder(){
        gridSorter('SiteID', 1, grid, data);   
        for(index in columns){
            if(columns[index]['sortorder'] === true){ 
                break;
            }    
        }
    }
    /*
     * Function for get default grid data - Ajax-json URL processing
     * @returns {jqXHR}
     */
    function getGridData(){
        return $.ajax({
            type: "GET",
             url: 'fulljson.json',
            //url: siteURL + "?readviewentries&outputformat=json&count=3000"+"&tmp="+Math.random(),
            // url: 'latestviewentries.json', // test json data URL
            dataType:'json',
            contentType: "application/json; charset=utf-8"
        });
    }
    /*
     * Function for detect the row data from grid
     * @params data
     * @returns anchor/span/null elts
     */
    function detectRowData(data){  
        try{
        if($(data).is('span') === true){
            return "span";
        }
        else if($(data).is('a') === true){
            return "anchor";
        }
        else{
            return "";
        }
        }catch(err) { 
            // catch exceptions/errors
        }
    } 
    /**
     * Function for arrange the unformatted data to a formatted data
     * @param {type} unformatted
     * @returns {formatted data}
     */
    function arrangeData(unformatted){
		
        $.each(unformatted,function(index,rows){
				
            data[i] = {};
            row++;
            data[i]['unid'] = rows['@position'];
            lookUpTable[rows['@position']] = {}; 
            var columnnumber = 0;
            $.each(rows['entrydata'],function(index,cindcolum){
                try{ 
					//console.log(columns[index]);
					if(typeof columns[index]['allset'] !=='undefined'){  
							if(columns[index]['allset']['@icon'] == 'true'){ 
								var new_col=columns[index]['allset']['@columnnumber'];  
								console.log(new_col);
								var img_no=data[i][columns[index]['allset']['@name']];
					 		
								if(new_col != null){
									var img_tag='<img src="'+img_src+''+'.png" border="0" height="11" width="13" alt="Attachment Icon"/>';
								if(new_col != ''){
									data[i][columns[index]['allset']['@name']] = img_tag;
								}else{
									data[i][columns[index]['allset']['@name']] = "";
								}
								}   
							}
						} 
                    if("text" in cindcolum){ 
					
					//	console.log(detectRowData(cindcolum['text']['0']),cindcolum['text']['0']);
						columns[parseInt((cindcolum['@columnnumber']))+1]['detected_data'] =detectRowData(cindcolum['text']['0']);
						  var stripped = optionsFormatter("","",cindcolum['text']['0']);
                            if(columns[parseInt((cindcolum['@columnnumber']))+1]['detected']===undefined){ 	
                            }  
                        data[i]['id'] = cindcolum['@columnnumber']+row+" "+i;
                        data[i][cindcolum['@name']] = stripped;
                        lookUpTable[rows['@position']][cindcolum['@name']] = cindcolum['text']['0'];
                        keystatus = cindcolum['@name'] in dataType;
                        if(!keystatus){
                            dataType[cindcolum['@name']] ='text';
                        }
                    }else if("textlist" in cindcolum){
                        var textListString = [];
                        for(textindex in cindcolum['textlist']['text']){
                            textListString.push(optionsFormatter("","",cindcolum['textlist']['text'][textindex][0]));
                        } 
                        data[i]['id'] = cindcolum['@columnnumber']+row+" "+i;
                        data[i][cindcolum['@name']] =  textListString.join(',');
                        lookUpTable[rows['@position']][cindcolum['@name']] =  cindcolum['text']['0'];
                        keystatus = cindcolum['@name'] in dataType;
                        if(!keystatus){
                            dataType[cindcolum['@name']] ='textlist';
                        }
                    }else if("number" in cindcolum){ 
					//console.log(columns[index]);
					// for displaying icons w.r.to column "icon":"true" parameter
                    	/*if(typeof columns[index]['allset'] !=='undefined'){  
							if(columns[index]['allset']['@icon'] == 'true'){ 
								var new_col=columns[index]['allset']['@columnnumber'];  
								var img_no=data[i][columns[index]['allset']['@name']];
								var img_tag='<img src="'+img_src+''+'.png" border="0" height="11" width="13" alt="Attachment Icon"/>';
								if(img_no != 0){
									data[i][columns[index]['allset']['@name']] = img_tag;
								}else{
									data[i][columns[index]['allset']['@name']] = "";
								}  
							}
						} */
					
					//console.log(data[i]['id']);
                        data[i]['id'] = cindcolum['@columnnumber']+row+" "+i; 
                        data[i][cindcolum['@name']] =  cindcolum['number'][0] | 0;
                        keystatus = cindcolum['@name'] in dataType;
                        if(!keystatus){
                            dataType[cindcolum['@name']] ='number';
                        }
                    }else if("datetime" in cindcolum){
						
					//	console.log(cindcolum);
					//	console.log('Logged');
                    //this is a date data, so in the column array we are pushing the setting to date
                        if( columns[parseInt((cindcolum['@columnnumber']))+1]['detected']=== undefined)
                        columns[parseInt((cindcolum['@columnnumber']))+1]['detected'] = 'date'; 
						 var cindcolum = foramtdata(cindcolum);
						 data[i]['id'] = cindcolum['@columnnumber']+" "+i;
						//console.log(cindcolum['@columnnumber']);
                        data[i][cindcolum['@name']] =  cindcolum['datetime'][0];
						//console.log( data[i][cindcolum['@name']]);
                        keystatus = cindcolum['@name'] in dataType;
						
                        if(!keystatus){
                            dataType[cindcolum['@name']] ='datetime';
                        }
						/*
				/*for(var columncount=0;columncount<columns.length;columncount++){ 
				if(columns[columncount]['detected'] == "date"){ 
				//console.log(index);
				if(cindcolum['@columnnumber'] == columns[columncount]['id']){ 
					var dateVal = columns[cindcolum['@columnnumber']]['allset']['datetimeformat']['@date'];
					cindcolum['datetime'][0] =formatDate(cindcolum['datetime'][0],dateVal);
					 //return cindcolum;
					 //console.log(cindcolum['datetime'][0]);
					 //var cindcolum = cindcolum['datetime'][0];
					 //console.log(cindcolum['datetime'][0]);
							//console.log(cindcolum);
						  //var cindcolum = foramtdata(cindcolum);
                       //console.log(cindcolum);
//						 var cindcolum = cindcolum['datetime'][0];
					
                        data[i]['id'] = cindcolum['@columnnumber']+" "+i;
						console.log(cindcolum['@columnnumber']);
                        data[i][cindcolum['@name']] =  cindcolum['datetime'][0];
						console.log( data[i][cindcolum['@name']]);
                        //keystatus = cindcolum['@name'] in dataType;
						
                       /* if(!keystatus){
                            dataType[cindcolum['@name']] ='datetime';
                        }
				 } 
			}
						} */
						
						
                    }else{ 
                        alert('new format found!!! check console');
                        return false;
                    }
                }catch(e){
                    // catch the exceptions/errors   
                }
            });
            i++;
        }); 
		
	
    } 
    /**
     * Function for update the slider
     * @param {type} loopcount
     * @returns {undefined}
     */
    function updateslider(loopcount){
        percentage = (loopcount+2)/totalrequest*100; 
        progress.progressbar( "value", percentage);
        if(percentage === 100){
			//$(".container").hide();
			$(".top-loader").hide();
			
            $( "#progressbar" ).fadeOut('slow');
        }
    }
    
	   function isIE(version, comparison) {
        	var cc      = 'IE',
        	    b       = document.createElement('B'),
        	    docElem = document.documentElement,
        	    isIE;
        	    
        	if(version){
        		cc += ' ' + version;
        		if(comparison){ cc = comparison + ' ' + cc; }
        	}
        	
        	b.innerHTML = '<!--[if '+ cc +']><b id="iecctest"></b><![endif]-->';
        	docElem.appendChild(b);
        	isIE = !!document.getElementById('iecctest');
        	docElem.removeChild(b);
        	return isIE;
        }
		function create(htmlStr) {
    var frag = document.createDocumentFragment(),
        temp = document.createElement('div');
    temp.innerHTML = htmlStr;
    while (temp.firstChild) {
        frag.appendChild(temp.firstChild);
    }
    return frag;
}
	function empty(data)
{
  if(typeof(data) == 'number' || typeof(data) == 'boolean')
  {
    return false;
  }
  if(typeof(data) == 'undefined' || data === null)
  {
    return true;
  }
  if(typeof(data.length) != 'undefined')
  {
    return data.length == 0;
  }
  var count = 0;
  for(var i in data)
  {
    if(data.hasOwnProperty(i))
    {
      count ++;
    }
  }
  return count == 0;
}
	/**
     * Document ready for inital loading - JQuery funtion
     */
    $(document).ready(function(){	

	// var fragment = create('<div class="container"><button class="btn btn-lg btn-warning"><span class="glyphicon glyphicon-refresh glyphicon-refresh-animate"></span> Loading the grid.Please wait...</button></div>');
// You can use native DOM methods to insert the fragment:
		// document.body.insertBefore(fragment, document.body.childNodes[0]);
		$('.top-loader').show();
        $("body").on("click", ".picker", function(){
            $(this).datepicker({
                dateFormat:'yy-mm-dd'
            });
            $(this).datepicker("show");
        });
        var checkboxSelector = new Slick.CheckboxSelectColumn({
            cssClass:'slick-cell-checkboxsel'
        }); 
        var checkboxSelector = new Slick.CheckboxSelectColumn({
            cssClass:'slick-cell-checkboxsel'
        });
        $("#myGrid").on("mouseenter",".slick-row",function(){
            $(this).find("div").addClass("hoveredrow");
        });
        $("#myGrid").on("mouseleave",".slick-row",function(){
            $(this).find("div").removeClass("hoveredrow");
        });
       $("#settings").switchButton({
           on_label: 'ON',
            off_label: 'OFF'
        });
         //ON-OFF button
        /*$('.on-off span').click(function() {
             
            $(this).addClass('active');
            $(this).siblings('span').removeClass('active');
        });*/
        $("#settings").change(function(){
			
           var onidSts= $("#settings").find('#onid').length; 
           if(onidSts === 1){
               $("#settings").find('#onid').addClass('active');
               $("#settings").find('#offid').removeClass('active');
               $("#settings").find('#onid').removeAttr('id');
           }else{
                 $("#settings").find('.on').removeClass('active');
               $("#settings").find('.off').addClass('active');
                 $("#settings").find('.on').attr("id","onid"); 
           } 
        });
		 $("#settingdds").change(function(){
			
        if($(".demo .switch-button-label").eq(0).hasClass('on')){
            if(columns[0]['id'] !== '_checkbox_selector'){
                columns.unshift(checker);
                grid.setColumns(columns); 
            }
        }else{
            if(columns[0]['id'] === '_checkbox_selector'){ 
                checker = columns[0];
                columns.splice(0,1);
                grid.setColumns(columns);
            } 
        } 
        }); 
        columns.push(checkboxSelector.getColumnDefinition()); 
        columnajax = getcolumn();
        columnajax.done(function (allcolumns) {
        columns = ordercolumns(allcolumns);
        $( "#progressbar" ).hide();
        //set the progress bar initial value to 1o
        progress = $( "#progressbar" ).progressbar({
            value:10
        });
        $( "#progressbar" ).fadeIn();
        var datapromise = getGridData(); 
        datapromise.done(function(newdata){
        var toplevelentries = newdata['@toplevelentries'];
		
        var percount = newdata['viewentry'].length; 
		//console.log(percount);
        // New look up table for html/link column based structure
        lookUpTable={}; 
        totalrequest = Math.ceil(toplevelentries/percount);  
//		console.log(totalrequest);
			if(isIE(8)){
				// do nothing
			}else{
				arrangeData(newdata['viewentry']);  
			}
		for(index in columns){
			if(columns[index]['detected_data']=="span" || columns[index]['detected_data']=="anchor" ){
				columns[index]['cssClass']	+= " link";
			}	
		}
		dataView = new Slick.Data.DataView(); 
        grid = new Slick.Grid("#myGrid", dataView, columns, options);  
        // End of the functionality
        
		var _topentry = {
		toplevelEntry: toplevelentries
		};
		//converts to JSON string the Object Literal
		_topentry = JSON.stringify(_topentry);
		localStorage.setItem('_Topentry', _topentry);
	 
        grid.setSelectionModel(new Slick.RowSelectionModel({selectActiveRow:false}));
        grid.registerPlugin(checkboxSelector); 
        var pager = new Slick.Controls.Pager(dataView, grid, $("#pager")); // for getting the pager value
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
                    }else if (val < 100) {
                        return "0" + val;
                    }else{
                        return val;
                    }
                }; 
                // use numeric sort of % and lexicographic for everything else
                dataView.fastSort((sortcol === "percentComplete") ? percentCompleteValueFn : sortcol, args.sortAsc);
            }else{
                // using native sort with comparer
                // preferred method but can be very slow in IE with huge datasets
                dataView.sort(comparer, args.sortAsc);
            }
        }); 
        grid.onHeaderRowCellRendered.subscribe(function(e, args){
			
            $(args.node).empty(); 
            if(args.column.id === "_checkbox_selector"){
            return true;
            } 
           // console.log(args.column);
            if(args.column.name === "Icon"){ 
                $("<input type='text' style='display:none;' class='textsearch'/><span class=\"removesearch\"  style='position:absolute;right:6px;'><img src='./slicklib/jqxclose.png' style='display:none;'/></span>")
                .data("columnId", args.column.id)
                .val(columnFilters[args.column.id])
                .appendTo(args.node); 
                return true;  
            }else{
                $("<input type='text' id='ico' onFocus='return true;' onmouseup='return false;' placeholder='S&ouml;k' class='textsearch'/><span class=\"removesearch\"  style='position:absolute;right:6px;'><img src='./slicklib/jqxclose.png'/></span>")
                .data("columnId", args.column.id)
                .val(columnFilters[args.column.id])
                .appendTo(args.node);
            } 
        });
        checker = columns[0];
//		console.log(columns);
        columns.splice(0,1);
		
		
		//detectRowData(data) ;
		//columns[2]['cssClass'] += " link";
		//console.log(columns[4]['cssClass']);
        grid.setColumns(columns);
        $("#txtSearch,#txtSearch2").keyup(function (e) {
        Slick.GlobalEditorLock.cancelCurrentEdit();

        // clear on Esc
        if(e.which === 27) {
            this.value = "";    
        }
        searchString = this.value;
        updateFilter(); // calling update filter function
		
        });
        dataView.onPagingInfoChanged.subscribe(function (e, pagingInfo){
            var isLastPage = pagingInfo.pageNum === pagingInfo.totalPages - 1;   
            var enableAddRow = isLastPage || pagingInfo.pageSize === 0;
            var options = grid.getOptions(); 
            if (options.enableAddRow !== enableAddRow) {
                grid.setOptions({enableAddRow: enableAddRow});
            }
        }); 
        $(grid.getHeaderRow()).delegate(".removesearch", "click", function (e){ 
		
            var columnId = $(this).data("columnId");
            $(this).prev("input").val("");
            if(columns[0]['id'] !== '_checkbox_selector')
                columns[parseInt(columnId)]['textsearch'] = undefined; 
            else
                var col = columns[parseInt(columnId)+1]['textsearch']  =undefined; 
            dataView.refresh(); //reload the grid view
        }); 
      
        
         
        var timeout = undefined;  // set the initial time out value
        $(grid.getHeaderRow()).delegate(":input", "onChange keyup ", function (e){
			    var columnId = $(this).data("columnId"); 
				if (columnId !== null){  
                if(columns[0]['id'] !== '_checkbox_selector'){
					
                    columns[parseInt(columnId)]['textsearch'] = [];
                  
                    if($.trim($(this).val()) !== ""){ 
					 
                        var col = columns[parseInt(columnId)]['textsearch'].push($.trim($(this).val())) ; 
                    }else{
					 
                        var col = columns[parseInt(columnId)]['textsearch'] = undefined; 
                    }   
                }else{ 
				 
                    columns[parseInt(columnId)+1]['textsearch'] = [];
                    if($.trim($(this).val()) !== "")
                        columns[parseInt(columnId)+1]['textsearch'].push($.trim($(this).val()) );
                    else
                        columns[parseInt(columnId)+1]['textsearch'] = undefined;
                } 
            } 
			// set the time out for the grid loading w.r.t new search query
			if(timeout !== undefined) {
			clearTimeout(timeout);
			}
			// set the time out value for the data view
			timeout = setTimeout(function() {
            timeout = undefined;  
            dataView.refresh(); //reload the grid view 
			}, 800);
		});    
		reorder();  
		
	   
          /*  
     
       */ 
	
	 

          
        // move the filter panel defined in a hidden div into grid top panel
        $("#inlineFilterPanel")
            .appendTo(grid.getTopPanel())
            .show(); 
        dataView.onRowCountChanged.subscribe(function (e, args){
			
            grid.updateRowCount();
            grid.invalidateRows(args.rows);
            grid.render();
			
        });
        dataView.onRowsChanged.subscribe(function (e, args){
		if(empty(grid.getItem))
  {
    bar = 'default value';
	console.log(bar);
  }else{
	  console.log('dfgdsfgs');
  }
		if(grid.getItem == undefined){ 
		//do nothing
			console.log('dfg');
		}else if(grid.getItem == null){ 
			console.log('dfg-1');
			$('.top-loader').show();
		}else{
			console.log(grid.getItem.length);
		}
            grid.invalidateRows(args.rows);
            grid.render();
        });
		
        if(totalrequest === 1){
            progress = $( "#progressbar" ).progressbar({
              value: 100
            });
        $( "#progressbar" ).fadeOut('slow');
        }
        //===========get other set of data's===================
//		console.log(percount);
        for(k=1;k<totalrequest;k++){  
            if(k===1){
                var apirequest = getNewrows((k * percount) + 1, percount);
            }else{
                start = (k * percount) + 2;
                queued.push([start]);
            }
        } 
		
//		console.log(queued);
        
        grid.onClick.subscribe(function(e, args) {
           // var item = args.item;
        //console.log(columns[args.cell]['field']); 
            //console.log(lookUpTable,dataView.getItem(args.row)['unid']|0,[columns[args.cell]['field']]);
            var link =  lookUpTable[dataView.getItem(args.row)['unid']][columns[args.cell]['field']].match(/^\[(.*)\]/); 
            if(link !== null ){ 
                 if(link[1]){ 
                     if(typeof  $(link[1]).attr("onclick") !== "undefined"){ 
                          $(link[1]).click(); 
                     }else if(typeof  $(link[1]).attr("href") !== "undefined"){ 
                        window.location.href=$(link[1]).attr('href');
                    }
                 }
            }
           
             
             
          });
        //==============================  
        var filterPlugin = new Ext.Plugins.HeaderFilter({}); 
        // This event is fired when a filter is selected
        filterPlugin.onFilterApplied.subscribe(function (){
			
            dataView.refresh();
            grid.resetActiveCell(); 
            // Excel like status bar at the bottom
            var status; 
            if (dataView.getLength() === dataView.getItems().length){
                status = "";
            }else{
                status = dataView.getLength() + ' OF ' + dataView.getItems().length + ' RECORDS FOUND';
            }
            $('#status-label').text(status);
        }); 
        // Event fired when a menu option is selected
        filterPlugin.onCommand.subscribe(function (e, args){
	 		
            dataView.fastSort(args.column.field, args.command === "sort-asc");
        }); 
        grid.registerPlugin(filterPlugin); 
        var overlayPlugin = new Ext.Plugins.Overlays({});
        // Event fires when a range is selected
        overlayPlugin.onFillUpDown.subscribe(function (e, args){ 
            var column = grid.getColumns()[args.range.fromCell]; 
            // Ensure the column is editable
            if (!column.editor){
                return;
            } 
            // Find the initial value
            var value = dataView.getItem(args.range.fromRow)[column.field]; 
			
            dataView.beginUpdate(); 
            // Copy the value down
            for (var i = args.range.fromRow + 1; i <= args.range.toRow; i++){
                dataView.getItem(i)[column.field] = value;
                grid.invalidateRow(i);
            } 
            dataView.endUpdate();
            grid.render();
            reorder();
        }); 
        grid.registerPlugin(overlayPlugin);
        grid.init();
        dataView.beginUpdate();
        dataView.setItems(data);
        dataView.setFilter(filter);
        dataView.endUpdate();
        reorder();
        });
        });
    });
}); 