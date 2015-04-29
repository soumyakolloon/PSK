/**
 * @file   :GridConroller.js
 * @usage  : handling the grid header events prompted from bootstrap file
 * @author : Bridge
 * @param {type} js/jquery 
 * @returns {undefined}
 * @date (created)  :
 * @date (modified)  :
 */
var stylesString = ""; 
/*
     * Function for get column format of the data
     * @param column 
     * @return data format
     */ 
//    function getFormat(column){ 
//        switch(column['detected']){
//            case "date":
//            datesetting = {year:'YYYY',month:'mm',day:'dd',hour:'hh',minute:'mm'}; 
//            var datearray = column['allset']['datetimeformat']['@date'].match(/year|month|day/g);
//            var timearray = column['allset']['datetimeformat']['@time'].match(/hour|minute/g);
//            return  datesetting[datearray[0]]+"-"+datesetting[datearray[1]]+'-'+datesetting[datearray[2]]+' '+datesetting[timearray[0]]+':'+datesetting[timearray[1]];
//            break;
//            default:
//            return false;;
//            break;
//        }
//    }
 /*
     * Function for adding column styles
     * @param col
     * @column section
     * @return class id
     */
    function addColstyle(col,section){
        styles = col[section];
        class_id = col['@columnnumber'];
        class_id = section+class_id.toString();
        font_codes = {"r":"normal",'b':"bold","i":"italics",'rb':" normal bold","ib":"italics bold","bi":"bold italics"};
        if (typeof col['@align'] === "undefined") col['@align'] = "0"; 
        align = {"1":"right",'2':"center",'0':'left'};
        style_string = '.'+class_id+'{ ';
        style_string+= 'color: '+styles['@color']+';';
        style_string+= 'text-align: '+align[col['@align'].toString()]+';';
        style_string+= 'font-face: '+styles['@face']+';'; 
        if (typeof font_codes[styles['@style']] === "undefined") font_codes[styles['@style']] = "normal";
        style_string+= 'font-style: '+font_codes[styles['@style']]+';'; 
        style_string+='}';
        stylesString = stylesString+style_string;
        return class_id;
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
                value = value & _.contains(filterValues, item[col.field]); 
            if(textsearch !== undefined && typeof textsearch[0]!== "undefined" && value === true && item[col.field] !== undefined){
                if(textsearch[0].indexOf("*")=== -1){
                    var condition = "^(\s+)?"+textsearch[0]+"";
                    var regobj = new RegExp(condition,"ig");
                    if($(item[col.field]).html()!== undefined){ 
                        var found = $(item[col.field]).html().match(regobj); 
                    }else{ 
                        var found = item[col.field].match(regobj);
                    } 
                    if(found === undefined){
                        value = false; 
                    }else if(found === null){
                        value = false; 
                    } 
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