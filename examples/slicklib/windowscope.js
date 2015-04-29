define([], function() {
    window.openAnlaggning = function (sUrl) {
		console.log('clicked');
    	//var w=window.open(sUrl, 'Anlaggning', 'channelmode=no, directories=yes, fullscreen=no, height=900, left=200, location=no, menubar=yes, resizable=yes, scrollbars=yes, status=no, titlebar=yes, toolbar=no, top=25, width=900', false);
    	//w.focus();
    	open_new_tab(sUrl);
    }
    window.open_new_tab =function (sUrl, sName) {
    	var w;
    	if (sName) {
    		w=window.open(sUrl, sName);
    	} else {
    		w=window.open(sUrl, '_blank');
    	}
    	w.focus();
    }
});