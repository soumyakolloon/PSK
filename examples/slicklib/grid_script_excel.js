
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


	function createdata(){
		  $.growlUI('Notification', 'Please wait...!');
		  
		  require(['slicklib/excel-builder','slicklib/gridfeeder', 'slicklib/BasicReport','slicklib/download'], function (EB, gridfeeder,BasicReport,downloader) {
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