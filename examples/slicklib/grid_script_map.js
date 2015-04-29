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