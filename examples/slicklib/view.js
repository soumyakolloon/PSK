function exportToExcel(evt) {
	var strExportURL=document.getElementById('exporturl').value;
	//alert(strExportURL);
	if (strExportURL!='') {
		if (evt) {
			var el=evt.target || evt.srcElement;	// get srcElement if target is falsy (IE)
			//alert('event: '+evt+'\ntarget: '+el);
			if (el.tagName!=='A') {
				el=el.parentNode;
			}
			if (el.getAttribute('requestsent')=='true') {
				if (!confirm(translateWord('resubmit-exportrequest'))) return false;
			} else {
				addClass(el, 'link-disabled')
				el.setAttribute('requestsent','true');
			}
		}
		document.location.replace(strExportURL);
		alert(translateWord('export-excel-pleasebepatient'));
		//alert("Notera att det f\u00F6r vissa vyer kan ta ganska l\u00E5ng tid (upp till ett par minuter) att h\u00E4mta ut denna information.");
	}
}
function showAnimate() {
	$('#master_view').hide();
	$('#imgWaiting').show();
}
function fixNoDocsTag(){ /** anv\u00E4nds i urvalsvyer **/
	var noDocumentsFound;
	var tagH2, textH2;
	if (document.getElementsByTagName) {
		noDocumentsFound = document.getElementsByTagName("H2");
	} else if (document.body.all) {
		noDocumentsFound = document.body.all.tags("H2");
	}
	for (var i = 0; i < noDocumentsFound.length; i++) {
		tagH2 = noDocumentsFound[i];
		if (document.getElementsByTagName) {
			textH2 = tagH2.innerHTML;
		} else if (document.body.all) {
			textH2 = tagH2.innerText;
		} 
		if (textH2.toLowerCase() == "no documents found") {
			tagH2.innerHTML = '<br /><font size="2" face="Arial" color ="red">Inga tr\u00E4ffar med aktuellt urval. Var v\u00E4nlig \u00E4ndra urvalskriterierna.</font>';
		} 
		tagH2.style.display = "block";
	}
}
function nodocsfound() {
	if (document.all) {
		for(i = 0; i < document.all.length; i++){
   			if (document.all(i).innerHTML == 'No documents found') {
				document.all(i).innerHTML='Uppgifter saknas';
			}
		}
	}
		else {
	top_e = document.documentElement;
		hs = top_e.getElementsByTagName('h2');
            for (var i = 0; i < hs.length; i++) { 
                if (hs[i].innerHTML== 'No documents found'){
                    hs[i].innerHTML= 'Saknas';
                }
		}
	}
}
function open_new_tab(sUrl, sName) {
	var w;
	if (sName) {
		w=window.open(sUrl, sName);
	} else {
		w=window.open(sUrl, '_blank');
	}
	w.focus();
}
function openAtt(sUrl) {
	//window.open(sUrl, 'attW', 'channelmode=no, directories=yes, fullscreen=no, height=600, left=200, location=no, menubar=yes, resizable=yes, scrollbars=no, status=no, titlebar=yes, toolbar=no, top=25, width=800', false);
	open_new_tab(sUrl);
}
function openCustomWindow(sUrl, sType){
		var sFeatures='channelmode=no, directories=yes, fullscreen=no, location=no, menubar=yes, resizable=yes, scrollbars=no, status=no, titlebar=yes, toolbar=no';
		var sTitle='';
		switch (sType){
		case 'attachment':
			sTitle='attW';
			sFeatures+=', top=25, left=200, width=800, height=600';
			break;
		case 'Fotoalbum':
			sTitle='Fotoalbum';
			sFeatures+=', width=1150, height=600';
			break;
		default:
			sFeatures+=', top=25, left=200, width=800, height=600';
		}
		var w=window.open(sUrl, sTitle, sFeatures, false);
		w.focus();
}
/** [Module Main] **/
function openAnlaggning(sUrl) {
	//var w=window.open(sUrl, 'Anlaggning', 'channelmode=no, directories=yes, fullscreen=no, height=900, left=200, location=no, menubar=yes, resizable=yes, scrollbars=yes, status=no, titlebar=yes, toolbar=no, top=25, width=900', false);
	//w.focus();
	open_new_tab(sUrl);
}
/** ------------------ **/

/** [Module Document] **/
function openDoc(sUrl) {
	open_new_tab(sUrl);
}
//Visar Milj\u00F6rapport i eget f\u00F6nster
function openMiljorapport(sUrl) {
	//window.open(sUrl, 'Miljorapport', 'channelmode=no, directories=yes, fullscreen=no, height=900, left=400, location=no, menubar=yes, resizable=yes, scrollbars=yes, status=no, titlebar=yes, toolbar=no, top=25, width=870', false);
	open_new_tab(sUrl);
}
/** ------------------ **/

/** [Module Drawings] **/
function openUnderlag(sUrl) {
	//window.open(sUrl, 'attW', 'channelmode=no, directories=yes, fullscreen=no, height=750, left=200, location=no, menubar=yes, resizable=yes, scrollbars=yes, status=no, titlebar=yes, toolbar=no, top=25, width=800', false);
	open_new_tab(sUrl);
}
/** ------------------ **/

/** [Module Equipment] **/
function openMatare(sUrl) {
	//window.open(sUrl, 'Matare', 'channelmode=no, directories=yes, fullscreen=no, height=1000, left=200, location=no, menubar=yes, resizable=yes, scrollbars=yes, status=no, titlebar=yes, toolbar=no, top=25, width=720', false);
	open_new_tab(sUrl);
}
/** ------------------ **/

/** [Module Workorder] **/
function openArbetsorder(sUrl) {
	console.log('clicked');
	//window.open(sUrl, 'Arbetord', 'channelmode=no, directories=yes, fullscreen=no, height=960, left=600, location=no, menubar=yes, resizable=yes, scrollbars=yes, status=no, titlebar=yes, toolbar=no, top=25, width=690', false);
	open_new_tab(sUrl);
}
function openArbetsorderHistorik(sUrl) {
	//window.open(sUrl, 'attW', 'channelmode=no, directories=yes, fullscreen=no, height=900, left=200, location=no, menubar=yes, resizable=yes, scrollbars=yes, status=no, titlebar=yes, toolbar=no, top=25, width=1200', false);
	open_new_tab(sUrl, 'Historik');
}
function openFelanmalan(sUrl) {
	//window.open(sUrl, 'felAnmalan', 'channelmode=no, directories=yes, fullscreen=no, height=960, left=200, location=no, menubar=yes, resizable=yes, scrollbars=yes, status=no, titlebar=yes, toolbar=no, top=25, width=690', false);
	//open_new_tab(sUrl);
	
	/** Validate configuration for current site */
	var sArgs=sUrl.slice((sUrl.indexOf('?')+1)-sUrl.length);
	//alert(sArgs);
	var arrArgs=sArgs.split('&');
	var sSiteID;
	for (var i=0; i<arrArgs.length; i++) {
		if (arrArgs[i].split('=')[0].toLowerCase()==='siteid') {
			sSiteID=arrArgs[i].split('=')[1];
			if (sSiteID==='' | typeof(sSiteID)==='undefined') {
				alert('Invalid siteid \''+sSiteID+'\'');
				return false;
			} else {
				break;
			}
		}
	}
	if (typeof(sSiteID)==='undefined') {
		alert('Required argumet \'siteid\' missing!');
	} else {
		//alert(sSiteID);
		open_new_tab(sUrl);
		/*
		$.ajax({
			url: '/'+webdbname+'/getInfo.json?openAgent&module=main&doctype=site&key='+sSiteID+'&action=validate-config',
			success: function(data) {
				//alert(JSON.stringify(data));
				//alert(data);
				var oResp=eval('('+data+')');
				if (oResp.status==='ok') {
					//alert(oResp.ownercompany);
					open_new_tab(sUrl);
				} else if (oResp.status==='failed') {
					alert(oResp.message);
				} else if (oResp.error) {
					var e=oResp.error;
					alert('RPC: '+e.agent+'\nMethod: '+e.method+'\nError: '+e.errorcode+'\nLine: '+e.line+'\nMessage: '+e.message);
				}
			}
		});
		*/
	}
}
/** ------------------ **/
/*
function search(dbPath, viewAlias, restrictToCategory, strQuery) {
	alert('Observera att s\u00F6kningen inte tar h\u00E4nsyn till de urval du har gjort.');
	//var url=dbPath+'/SearchForm?OpenForm&amp;vAlias='+escape(viewAlias)+'&amp;RestrictToCategory='+escape(restrictToCategory)+'&amp;Query='+escape(strQuery)
	var hh="Hela landet AND CODO";
	var strQuery2=hh;
	var vCat=(restrictToCategory=='' ? '': '&RestrictToCategory='+escape(restrictToCategory));
	//var vCat=(restrictToCategory=='' ? '': '&RestrictToCategory='+escape(restrictToCategory));
	alert(dbPath+'/'+viewAlias+'?SearchView'+vCat+'&Query='+escape(strQuery)+'&valias='+viewAlias);
	var url=dbPath+'/'+viewAlias+'?SearchView'+vCat+'&Query='+escape(strQuery)+'&valias='+viewAlias;
	url+='&SearchMax=0';
	url+='&SearchWV=FALSE';
	url+='&SearchOrder=1';
	url+='&Seq=1';
	url+='&Start=1';
	url+='&Count=100';
	url+='&SearchOrder=1';
	url+='&SearchFuzzy=FALSE';

	// these params messes with the search result in odd ways.... 
	// &amp; in stead of & was used initially but no difference so it was removed
//	url+='&SearchOrder=1';
//	url+='&SearchMax=0';
//	url+='&SearchWV=FALSE';
//	url+='&SearchFuzzy=FALSE';
	
	//alert(url);
	//alert('db: '+dbPath+'\nview: '+viewAlias+'\ncat: '+restrictToCategory+'\nquery: '+strQuery+'\nurl: '+url);
	
	document.location.href=url;
//	"&SearchOrder="+@Text(Sort)+ "&SearchMax=0&SearchWV="+@If(SearchWV="";"FALSE";"TRUE") + "&SearchFuzzy="+@If(UseSearchFuzzy="";"FALSE";"TRUE") + "&Start=" + @Text(Start) + "&Count=100

}
*/