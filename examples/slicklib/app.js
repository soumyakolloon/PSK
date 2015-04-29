requirejs.config({
    //By default load any module IDs from slicklib
    baseUrl: 'slicklib',
    //  enforceDefine: true,
    urlArgs: "open&timestamp=" + (new Date()).getTime(),
    waitSeconds: 200,
    
      paths: {
        jQuery: 'jquery',
        jQueryUI:'http://code.jquery.com/ui/1.11.0/jquery-ui',
        jQueryDrag:'jquery.event.drag-2.2',
        jQueryDrop:'jquery.event.drop-2.2',
        slick:'slick.core',
        slickCheckboxselectcolumn:'slick.checkboxselectcolumn',
        slickAutotooltips:"slick.autotooltips",
        slickCellrangedecorator:"slick.cellrangedecorator",
        slickCellrangeselector:"slick.cellrangeselector",
        slickCellselectionmodel:"slick.cellselectionmodel",
        slickRowselectionmodel:"slick.rowselectionmodel",
        slickColumnpicker:"slick.columnpicker",
        slickFormatters:"slick.formatters",
        slickEditors:"slick.editors",
        slickPager:"slick.pager",
        slickCellrangeselector:"slick.cellrangeselector",
        slickDataview:"slick.dataview",
        onof:"onof",
        slickGrid:"slick.grid",
        extHeaderfilter:'ext.headerfilter',
        extOverlays:'ext.overlays',
        view:'view',
        underscore:'underscore',
        json:'json2.js',
        excelbuilder:'excelbuilder',
        JSZip:'./Excel/jszip',
       
        GridController:'GridController'
    },
    
    shim:{
    	 
        jQuery:{
            exports:'jQuery'
        },
        underscore:{
            exports:'underscore'
        },
        jQueryUI:{
            deps: ['jQuery'],
        },
        
        jQueryDrag:{
            deps: ['jQueryUI','jQuery']
        },
        jQueryDrop:{
             deps: ['jQueryUI','jQuery']
        },
        slick:{
              deps: ['jQuery','jQueryUI','jQueryDrag','jQueryDrop'],
        },
        slickCellrangedecorator:{
              deps: ['jQuery','jQueryUI','jQueryDrag','jQueryDrop'],  
        },
        slickCellrangeselector:{
            deps: ['jQuery','jQueryUI','jQueryDrag','jQueryDrop'], 
        },
        slickCellselectionmodel:{
            deps: ['jQuery','jQueryUI','jQueryDrag','jQueryDrop'], 
        },
        slickRowselectionmodel:{
            deps: ['jQuery','jQueryUI','jQueryDrag','jQueryDrop'], 
        },
        slickColumnpicker:{
            deps: ['jQuery','jQueryUI','jQueryDrag','jQueryDrop'], 
        },
        slickFormatters:{
            deps: ['jQuery','jQueryUI','jQueryDrag','jQueryDrop'], 
        },
        slickEditors:{
            deps: ['jQuery','jQueryUI','jQueryDrag','jQueryDrop'], 
        },
        slickPager:{
            deps: ['jQuery','jQueryUI','jQueryDrag','jQueryDrop'], 
        },
        slickCellrangeselector:{
            deps: ['jQuery','jQueryUI','jQueryDrag','jQueryDrop'], 
        },
        slickDataview:{
            deps: ['jQuery','jQueryUI','jQueryDrag','jQueryDrop'], 
        },
        onof:{
            deps: ['jQuery','jQueryUI','jQueryDrag','jQueryDrop'], 
        },
        slickGrid:{
            deps: ['jQuery','jQueryUI','jQueryDrag','jQueryDrop'], 
        },
        extHeaderfilter:{
            deps: ['jQuery','jQueryUI','jQueryDrag','jQueryDrop'], 
        },
        extOverlays:{
            deps: ['jQuery','jQueryUI','jQueryDrag','jQueryDrop'], 
        },
        view:{
            deps: ['jQuery','jQueryUI','jQueryDrag','jQueryDrop'], 
        },
        JSZip: {
            exports: 'JSZip'
        },
        underscore:{
        	
            deps: ['jQuery','jQueryUI','jQueryDrag','jQueryDrop'], 
        },
        json:{
            deps: ['jQuery','jQueryUI','jQueryDrag','jQueryDrop'], 
        },
        excelbuilder:{
            deps: ['jQuery','jQueryUI','jQueryDrag','jQueryDrop'], 
        },
        GridController:{
        	 exports:'GridController',
             deps:['jQuery']
        }
 },
    deps:['bootstraper']

});

