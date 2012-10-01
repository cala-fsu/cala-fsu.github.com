
function WriteSwfObject(strSwfFile, nWidth, nHeight, strScale, strAlign, strQuality, strBgColor, strFlashVars)
{
	var strHtml = "";
	
	if (strScale == "show all")
	{
		nWidth = "100%";
		nHeight = "100%";
	}
	
	var strLocProtocol = location.protocol;
	
	if (strLocProtocol.indexOf("file") >= 0)
	{
		strLocProtocol = "http:";
	}

	strHtml += "<object classid='clsid:d27cdb6e-ae6d-11cf-96b8-444553540000' codebase='" + strLocProtocol + "//fpdownload.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=6,0,79,0' width='" + nWidth + "' height='" + nHeight + "' align='" + strAlign + "' id='player'>";
	strHtml += "<param name='scale' value='" + strScale + "' />";
	strHtml += "<param name='movie' value='" + strSwfFile + "' />";
	strHtml += "<param name='quality' value='" + strQuality + "' />";
	strHtml += "<param name='bgcolor' value='" + strBgColor + "' />";
	strHtml += "<param name='flashvars' value='" + strFlashVars + "' />";
	strHtml += "<embed name='player' src='" + strSwfFile +"' flashvars='" + strFlashVars + "' scale='" + strScale + "' quality='" + strQuality + "' bgcolor='" + strBgColor + "' width='" + nWidth + "' height='" + nHeight + "' align='" + strAlign + "' swLiveConnect='true' type='application/x-shockwave-flash' pluginspage='" + strLocProtocol + "//www.macromedia.com/go/getflashplayer' />";
	strHtml += "</object>";

	document.write(strHtml);
}