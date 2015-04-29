define(function () {
    var columns = {};

    return {
        getcolumns: function () { return columns; },
        setcolumns:function(api){
        	columns = api;
       }
    };
});