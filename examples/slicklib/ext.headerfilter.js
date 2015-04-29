/**
 * @file   : ext.headerfilter.js
 * @usage  : handling the grid header events and filtering the data
 * @author : Bridge
 * @param {type} jQuery
 * @param {type} columns
 * @param {type} extheaderfilter
 * @param {type} _
 * @returns {undefined}
 * @date (created)  :
 * @date (modified)  :
 */

define([
    'jQuery',
     'columns',
     'ext.headerfilter',
     'underscore',
    'jQueryUI', 
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
    'slickGrid'
 ],function(jQuery,columns,extheaderfilter,_){


(function ($) {
    $.extend(true, window, {
        "Ext": {
            "Plugins": {
                "HeaderFilter": HeaderFilter
            }
        }
    });

    /*
    Based on SlickGrid Header Menu Plugin (https://github.com/mleibman/SlickGrid/blob/master/plugins/slick.headermenu.js)

    (Can't be used at the same time as the header menu plugin as it implements the dropdown in the same way)


    */

    function HeaderFilter(options) {
        var grid;
        var self = this;
        var handler = new Slick.EventHandler();
        var defaults = {
        	nosort      :"./slicklib/nosort.png",	
            buttonImage: "./slicklib/filterlight.png.png",
            filterImage: "./slicklib/filter.png",
            sortAscImage: "./slicklib/sort-asc.png",
            sortDescImage: "./slicklib/sort-desc.png"
        };
        var $menu;

        function init(g) {
            options = $.extend(true, {}, defaults, options);
            grid = g;
            handler.subscribe(grid.onHeaderCellRendered, handleHeaderCellRendered)
                   .subscribe(grid.onBeforeHeaderCellDestroy, handleBeforeHeaderCellDestroy)
                   .subscribe(grid.onClick, handleBodyMouseDown)
                   .subscribe(grid.onColumnsResized, columnsResized);

            grid.setColumns(grid.getColumns());

            $(document.body).bind("mousedown", handleBodyMouseDown);
        }

        function destroy() {
            handler.unsubscribeAll();
            $(document.body).unbind("mousedown", handleBodyMouseDown);
        }

        function handleBodyMouseDown(e) {
            if ($menu && $menu[0] != e.target && !$.contains($menu[0], e.target)) {
                //hideMenu();
            }
        }

        function hideMenu() {
            if ($menu) {
                $menu.remove();
                $menu = null;
            }
        }
        function sortit(e){ 
        	var $menuButton = $(this);
            var columnDef = $menuButton.data("column");
            var sortorder = $menuButton.attr("sort");
            var image = $menuButton.css("background-image").split("/");
           
            $(".leftchange").each(function(e,val){
                var image = $(val).css("background-image","url("+defaults.nosort+")"); 
             })
             
            if(sortorder==undefined || sortorder == "acs" ){
                var sort =  "sort-asc";
                $menuButton.attr("sort","desc");
                var image = $menuButton.css("background-image","url('./slicklib/sort-desc.png')");
          
            }
            else{
                var sort =  "sort-desc";
                $menuButton.attr("sort","acs");
                var image = $menuButton.css("background-image","url('./slicklib/sort-asc.png')");
            }

            self.onCommand.notify({
                "grid": grid,
                "column": columnDef,
                "command": sort
            }, e, self);

            e.preventDefault();
            e.stopPropagation();


        }
        function headerSortit(e){
			console.log('a');
            var $menuButton = $(this);
            var columnDef = $menuButton.data("column");
            var sortorder = $menuButton.attr("sort");
            var image = $menuButton.css("background-image").split("/");
           
            $(".leftchange").each(function(e,val){
                var image = $(val).css("background-image","url("+defaults.nosort+")"); 
             })
             
            if(sortorder==undefined || sortorder == "acs" ){
                var sort =  "sort-asc";
                $menuButton.attr("sort","desc");
               // var image = $menuButton.css("background-image","url('./slicklib/sort-desc.png')");
			
            }
            else{
                var sort =  "sort-desc";
                $menuButton.attr("sort","acs");
              // var image = $menuButton.css("background-image","url('./slicklib/sort-asc.png')");
            }
			console.log(columnDef);
			console.log(sortorder); 

            self.onCommand.notify({
                "grid": grid,
                "column": columnDef,
                "command": sort
            }, e, self);

            e.preventDefault();
            e.stopPropagation();


        }
       
  function handleHeaderCellRendered(e, args) {
            
            if(args.column.id=="_checkbox_selector")
                return true;
             if(args.column.tileline=="9")
                return true;

            var column = args.column;

            var $el = $("<div></div>")
                .addClass("slick-header-menubutton")
                .attr("id","gridReorder")
                .data("column", column);

            if (options.buttonImage) {
                $el.css("background-image", "url(" + options.buttonImage + ")");
            }
            $el.unbind('click');
         // unbind the click event first, for avoiding multiple click occur
            $el.unbind("click", showFilter).appendTo(args.node);
            $el.bind("click", showFilter).appendTo(args.node); 
            //$el.on("click", showFilter).appendTo(args.node);
            
            
            
            var $el = $("<div><span></span></div>")
                .addClass("slick-header-menubutton leftchange")
                .data("column", column);
             
            if (options.buttonImage) {
                $el.css("background-image", "url(" + options.nosort + ")");
            }
            $el.bind("click", sortit).appendTo(args.node);
            
            var $els = $("<span class='slick-column-sorting' style='background=none;'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>") 
                    .css("width",column.width-40)
                    .data("column", column); 
            $els.bind("click", headerSortit).appendTo(args.node); 
            
        }
        
        function handleBeforeHeaderCellDestroy(e, args) {
            $(args.node)
                .find(".slick-header-menubutton")
                .remove();
        }

        function addMenuItem(menu, columnDef, title, command, image) {
            var $item = $("<div class='slick-header-menuitem'>")
                         .data("command", command)
                         .data("column", columnDef)
                         .bind("click", handleMenuItemClick)
                         .appendTo(menu);

            var $icon = $("<div class='slick-header-menuicon'>")
                         .appendTo($item);

            if (image) {
                $icon.css("background-image", "url(" + image + ")");
            }

            $("<span class='slick-header-menucontent'>")
             .text(title)
             .appendTo($item);
        }
       

        function showFilter(e){  
            e.stopImmediatePropagation();
            var $menuButton = $(this);
            var columnDef = $menuButton.data("column"); 
            columnDef.filterValues = columnDef.filterValues || []; 
            // WorkingFilters is a copy of the filters to enable apply/cancel behaviour
            var workingFilters = columnDef.filterValues.slice(0); 
			console.log(workingFilters);
            var filterItems; 
            if (workingFilters.length === 0) { 
                // Filter based all available values 
                filterItems = getFilterValues(grid.getData(), columnDef); // get the filtered items from the column w.r.t the grid
				filterItems.clean(undefined); // clean the undefined values
            }
            else {
                // Filter based on current dataView subset
                //filterItems = getAllFilterValues(grid.getData().getItems(), columnDef);
                 filterItems = getFilterValues(grid.getData(), columnDef); 
				 filterItems.clean(undefined); // clean the undefined values
            }  
            if (!$menu) {
                $menu = $("<div class='slick-header-menu'>").appendTo(document.body);
            }else{
                 $menu.remove();
                $menu = null;
                return false;
            }  
				console.log(filterItems.length);
            // define where filter criteria passed in 
            for (var i = 0; i < filterItems.length; i++) { 
                var filtered = _.contains(workingFilters, filterItems[i]); 
                if(columnDef.tileline===9){
                    return "";
                }
                else if(columnDef.detected!=="date"){
                    var query  = (workingFilters[0]!==undefined && workingFilters[1]==='text')?workingFilters[0]:"";
                    var filterOptions = "<label><input type='checkbox' value='-1'  />(Markera Alla)</label>";
                }else{
					console.log(workingFilters);
                    var startdate  = (workingFilters[0]!==undefined && workingFilters[2]==='cal')?workingFilters[0]:"";
                    var enddate    = (workingFilters[1]!==undefined && workingFilters[2]==='cal')?workingFilters[1]:"";
                    var filterOptions = "<input type='text' placeholder='Från datum' name='calendar[]'  class='picker'  style='width:90px;' value='"+startdate+"'>&nbsp;<input class='picker' name='calendar[]'  style='width:90px;' type='text' value='"+enddate+"' placeholder='Till datum' "+workingFilters[1]+" ><label><input type='checkbox' value='-1' />(Select All)</label>";
                }
            }

            for (var i = 0; i < filterItems.length; i++){ 
                var filtered = _.contains(workingFilters, filterItems[i]);
                if(columnDef.tileline===9){
                    return "";
                }else if(columnDef.detected!=="date"){ 
                    var query  = (workingFilters[0]!==undefined && workingFilters[1]==='text')?workingFilters[0]:"";
                    if(filterItems.length >1){
                      var filterOptions = "<label><input type='checkbox' value='-1'  />(Markera Alla)</label>";  
                    }else{
                        var filterOptions = "<br>";
                    } 
                }else{
                    //var startdate  = (workingFilters[0]!==undefined && workingFilters[2]==='cal')?workingFilters[0]:"";
                    //var enddate    = (workingFilters[1]!==undefined && workingFilters[2]==='cal')?workingFilters[1]:"";
                    
					//var filterOptions = "<input type='text' placeholder='Från datum' name='calendar[]'  class='picker'  style='width:90px;' value='2013-01-01'>&nbsp;<input class='picker' name='calendar[]'  style='width:90px;' type='text' value='2013-01-01' placeholder='Till datum' "+workingFilters[1]+" ><label><input type='checkbox' value='-1' />(Select All)</label>";
					//console.log(filterOptions);
					//var startdate=
                }
            }    
			 

			console.log(workingFilters);
			for (var i = 0; i < filterItems.length; i++){
				console.log(filterItems[i]);
				var filtered = _.contains(workingFilters, filterItems[i]);  
                //var filtercounts = getAllFilterCounts(grid.getData().getItems(),columnDef,filterItems[i]);  
                filterOptions += "<label><input class='input_boxw' type='checkbox' value='" + i + "'"
                              + (filtered ? " checked='checked'" : "")
                              + "/>" + filterItems[i]  + "("+ 1 +")"+"</label>"; 
            } 
                var $filter = $("<div class='filter'>")
                               .append($(filterOptions))
                               .appendTo($menu);
                $(".filter span").prop('onclick',null);  
                $('<button>OK</button>')
                    .appendTo($menu)
                       .bind('click', function (ev) {  
					   console.log(workingFilters.length);
                        if(workingFilters.length === 0){
							console.log('Filter triggered');
						 
							
							columnDef.filterValues.length = 0;
                            columnDef.filterValues = undefined;
                            setButtonImage($menuButton, false);
                            handleApply(ev, columnDef);
                        }else{ 
                            columnDef.filterValues = workingFilters.splice(0,workingFilters.length); 
							console.log(columnDef.filterValues);
                            setButtonImage($menuButton, columnDef.filterValues.length > 0);
                            handleApply(ev, columnDef);
							console.log('Filter not triggered');
							setTimeout(function(){
					$('#clearFilter').fadeIn('slow');
					},500);
                    }
                    }); 
                $('<button>Rensa</button>')
                    .appendTo($menu)
                    .bind('click', function (ev) {
                        columnDef.filterValues.length = 0;
                        columnDef.filterValues = undefined;
                        setButtonImage($menuButton, false);
                        handleApply(ev, columnDef);
                    });

                $('<button>Avbryt</button>')
                    .appendTo($menu)
                    .bind('click', hideMenu);

                $(':checkbox', $filter).bind('click', function () {
                    workingFilters = changeWorkingFilter(filterItems, workingFilters, $(this));
                });
                $(':input', $filter).bind('keyup', function (ev) {
                    workingFilters = changeWorkingFilter(filterItems, workingFilters, $(this));
                    columnDef.filterValues = workingFilters;
                    setButtonImage($menuButton, columnDef.filterValues.length > 0);
                    handleApply(ev, columnDef,1);
                });
                
                $(':input.picker', $filter).bind('change', function () {
                    workingFilters = changeWorkingFilter(filterItems, workingFilters, $(this));
                });
                
                var offset = $(this).offset();
			 //console.log(columnDef.tileline);
			 if(columnDef.tileline != 2){
				// console.log('1');
				 var left = offset.left - $menu.width() + $(this).width() - 8;
						 $menu.css("top", offset.top + $(this).height() - 10)
                     .css("left", (left > 0 ? left : 0));
			 }else{
				 console.log('2');
				 console.log($menu.width());
				 console.log($(this).width());
				 var left = offset.left - $menu.width() + $(this).width() - 8;
					 $menu.css("top", offset.top + $(this).height() - 10)
                     .css("left", (left > 0 ? left : 0))
					 .css("width",128);
			 }
				 
                

               
                   
    }  
		/* 	
			prototype function for array clean : null/undefined etc.
			supported in IE lower versions
		*/
		Array.prototype.clean = function(deleteValue) {
			for (var i = 0; i < this.length; i++) {
				if (this[i] == deleteValue) {         
					this.splice(i, 1);
					i--;
				}
			}
			return this;
		};
		/*	
			browser checking : Internet Explorer versions
		*/
        function isIE(version, comparison){
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
        function columnsResized() {
            hideMenu();
        }
        function isInt(value) {
          return !isNaN(value) && 
                  parseInt(Number(value)) == value && 
                  (value + "").replace(/ /g,'') !== "";
        }
        
        function emptyElement(element) {
        	if (element ===undefined || element === null || element === '' || element === ""){
        		return false;}
        		else {return true;}
        	}
        function getAllFilterCounts(data,column,value){ 
        	 var count = 0;
            for (var i = 0; i < data.length; i++) {
                 if(data[i][column.field]==value){
                            
                          count++;
                    }
               }
               return count ;
        }
        function isInArray(value, array) {
        	  return array.indexOf(value) > -1;
        	}
        function changeWorkingFilter(filterItems, workingFilters, $checkbox) {
        	var value = $checkbox.val();
            var $filter = $checkbox.parent().parent();
            if($checkbox.attr('type')!="checkbox"){
              var workingFilters = [];
               if($checkbox.val()==""){
            	   columnDef.filterValues.length = 0;
                   setButtonImage($menuButton, false);
                   handleApply(ev, columnDef);
               }
               if(isInt($checkbox.val())){
                    workingFilters.push(parseInt($checkbox.val()));
                   // workingFilters.push("text");
                }else{
                	if($checkbox.hasClass('picker')){
                            var caldates  = $(".picker ").map( function( i, v ){
                                     workingFilters.push(v.value);
                             })
                             if(workingFilters.length>0)
                            workingFilters.push("cal");
                    }else{
                      workingFilters.push($checkbox.val());
                      if(workingFilters.length>0){}
                     // workingFilters.push("text");
                    }
        
                }   
             }else{
            	 if ($checkbox.val() < 0) {
                    // Select All
                    if ($checkbox.prop('checked')) {
                        $(':checkbox', $filter).prop('checked', true);
                        workingFilters = filterItems.slice(0);
                    } else {
                        $(':checkbox', $filter).prop('checked', false);
                         workingFilters.length = 0;
                    }
                }else {
                    var index = _.indexOf(workingFilters, filterItems[value]);
                    if ($checkbox.prop('checked') && index < 0) {
                        workingFilters.push(filterItems[value]);
                    }
                    else {
                    	if (index > -1) {
                            workingFilters.splice(index, 1);
                        }
                    }
                }
            }
             
            
            return workingFilters;
        }


        function setButtonImage($el, filtered) {
            var image = "url(" + (filtered ? options.filterImage : options.buttonImage) + ")";
            if(filtered)
            $el.parent('div').css({backgroundColor:'#a3999b'});
            else
        	$el.parent('div').css({backgroundColor:'#f6f6f6'});
            
            $el.css("background-image", image);
        }

        function handleApply(e, columnDef,hide) {
			console.log(columnDef);
            if(hide!=1)
            hideMenu();
            self.onFilterApplied.notify({ "grid": grid, "column": columnDef }, e, self);

            e.preventDefault();
            e.stopPropagation();
        }


        function getFilterValues(dataView, column) {
			
        	if(typeof dataView.getLength()!== undefined){
        	
            var seen = [];
			
            for (var i = 0; i < dataView.getLength() ; i++) {
                var value = dataView.getItem(i)[column.field];
                if (!_.contains(seen, value)) {
                    seen.push(value);
                }
            }
            return _.sortBy(seen, function (v) { return v; });
        	}
    	}

        function getAllFilterValues(data, column) {

            var seen = [];
            for (var i = 0; i < data.length; i++) {
                var value = data[i][column.field];

                if (!_.contains(seen, value)) {
                    seen.push(value);
                }
            }
            return _.sortBy(seen, function (v) { return v; });
        }

        function handleMenuItemClick(e) {

            var command = $(this).data("command");
            var columnDef = $(this).data("column");

            hideMenu();

            self.onCommand.notify({
                "grid": grid,
                "column": columnDef,
                "command": command
            }, e, self);

            e.preventDefault();
            e.stopPropagation();
        }

        $.extend(this, {
            "init": init,
            "destroy": destroy,
            "onFilterApplied": new Slick.Event(),
            "onCommand": new Slick.Event()
        });
    }
})(jQuery);

});