/********************************************************/
// Engage.js
/********************************************************/

// Browser Sniffing
var IE5 = ((document.all)&&(navigator.appVersion.indexOf("MSIE 5.")!=-1)) ? true : false;
var IE6 = ((document.all)&&(navigator.appVersion.indexOf("MSIE 6.")!=-1)) ? true : false;
var IE7 = ((document.all)&&(navigator.appVersion.indexOf("MSIE 7.")!=-1)) ? true : false;
var FF1 = (navigator.userAgent.indexOf("Firefox\/1")!=-1) ? true : false;
var Opera = (navigator.userAgent.indexOf("Opera")!=-1) ? true : false;
var IESP2 = ((window.navigator.userAgent.indexOf("MSIE")) && window.navigator.userAgent.indexOf("SV1") > window.navigator.userAgent.indexOf("MSIE"));


var NS6plus = (parseFloat(navigator.appVersion) >= 5 && navigator.appName.indexOf("Netscape")>=0 )? true: false;
var NS7_2Plus = false;
var Mozilla1_7Plus = false;

var g_bLMSPresent = false;
var g_strPlayer = "engage";

// Messeage delimitors
var g_strDelim = "|~|";
var g_strInteractionDelim = "|#|";

// Find the version of NS or Mozilla
if (NS6plus)
{
	var nPos = 0;
	var strUserAgent = navigator.userAgent;
	var nReleaseDate = 0;
	
	strUserAgent = strUserAgent.toLowerCase();
	nPos = strUserAgent.indexOf("gecko/");

	if(nPos >= 0)
	{
		var strTemp = strUserAgent.substr(nPos + 6);
		nReleaseDate = parseFloat(strTemp);
	}

	if (strUserAgent.indexOf("netscape") >= 0)
	{
		if (nReleaseDate >= 20040804)
		{
			NS7_2Plus = true;
		} 
	}
	else
	{
		if (nReleaseDate >= 20040616)
		{
			Mozilla1_7Plus = true;
		} 		
	}
}

// Operating System Detection
var isLinux = (navigator.userAgent.indexOf("Linux") != -1);
var isWindows = (!isMac && !isLinux)
var isMac = (navigator.appVersion.indexOf("Mac")!=-1) ? true : false;

var g_bUseFSCommand = (!Opera && !isLinux && !isMac);

// LMS Support
if (g_bLMS)
{
	document.write("<SCR" + "IPT LANGUAGE='JavaScript1.2' SRC='lms/lms.js' TYPE='text/javascript'><\/SCR" + "IPT>");
}

if (g_bAOSupport)
{
	document.write("<SCR" + "IPT LANGUAGE='JavaScript1.2' SRC='" + g_strContentFolder + "/AOComm.js' TYPE='text/javascript'><\/SCR" + "IPT>");
}

function WriteSwfObject(strSwfFile, nWidth, nHeight, strScale, strAlign, strQuality, strBgColor, strFlashVars)
{
	var strHtml = "";

	// Lets the player know the html container is there
	if (strFlashVars == "")
	{
		strFlashVars += "vHtmlContainer=true";
	}
	else
	{
		strFlashVars += "&vHtmlContainer=true";
	}
		
	// Does the browser support FSCommand
	strFlashVars += "&vUseFSCommand=" + g_bUseFSCommand;
	
	// Whether or not we are loaded by an LMS
	strFlashVars += "&vLMSPresent=" + g_bLMSPresent;
	
	// Whether or not we are loaded by AO
	strFlashVars += "&vAOSupport=" + g_bAOSupport;
	
	// The saved resume data
	if (g_bLMSPresent)
	{
		var strResumeData = lmsAPI.GetDataChunk();
		strFlashVars += "&vResumeData=" + escape(strResumeData);
	}
	
	var strLocProtocol = location.protocol;
	
	if (strLocProtocol.indexOf("file") >= 0)
	{
		strLocProtocol = "http:";
	}

	strHtml += "<object classid='clsid:d27cdb6e-ae6d-11cf-96b8-444553540000' codebase='" + strLocProtocol + "//fpdownload.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=6,0,79,0' width='" + nWidth + "' height='" + nHeight + "' align='" + strAlign + "' id='player'>";
	strHtml += "<param name='allowScriptAccess' value='sameDomain' />";
	strHtml += "<param name='scale' value='" + strScale + "' />";
	strHtml += "<param name='movie' value='" + strSwfFile + "' />";
	strHtml += "<param name='quality' value='" + strQuality + "' />";
	strHtml += "<param name='bgcolor' value='" + strBgColor + "' />";
	strHtml += "<param name='flashvars' value='" + strFlashVars + "' />";
	strHtml += "<embed name='player' src='" + strSwfFile +"' flashvars='" + strFlashVars + "' scale='" + strScale + "' quality='" + strQuality + "' bgcolor='" + strBgColor + "' width='" + nWidth + "' height='" + nHeight + "' align='" + strAlign + "' allowscriptaccess='sameDomain' type='application/x-shockwave-flash' pluginspage='" + strLocProtocol + "//www.macromedia.com/go/getflashplayer' />";
	strHtml += "</object>";

	document.write(strHtml);
}

function player_DoFSCommand(command, args) 
{
	args = String(args);
	command = String(command);
	
	var arrArgs = args.split(g_strDelim);
	
	switch (command)
	{
		case "ART_DebugLms":
			if (lmsAPI)
			{
				lmsAPI.ShowDebugWindow();
			}
			break;
		case "RR_SetInteractionDelim":
			g_strInteractionDelim = args;
			break;
			
		case "RR_SetDelim":
			g_strDelim = args;
			break;
		case "QM_ZoomImage":
			PopZoomImage(arrArgs[0], arrArgs[1], arrArgs[2]);
			break;
		case "RR_PopVideo":
			PopVideo(arrArgs[0], arrArgs[1], arrArgs[2], arrArgs[3], arrArgs[4], arrArgs[5], arrArgs[6], arrArgs[7], arrArgs[8]);
			break;
	}

	if (g_bLMS)
	{
		lms_DoFSCommand(command, args);
	}
	
	if (g_bAOSupport)
	{
		AO_DoFSCommand(command, args)
	}
}


////////////////////////////////////////////////////////////////////////////////
// Gets the base path
////////////////////////////////////////////////////////////////////////////////

function GetBasePath()
{
	var strFullPath = document.location.href;
	var nPos1 = -1;
	var nPos2 = -1;

	nPos1 = strFullPath.lastIndexOf("\\");
	nPos2 = strFullPath.lastIndexOf("/");

	if (nPos2 > nPos1)
	{
		nPos1 = nPos2;
	}

	if (nPos1 >= 0)
	{
		strFullPath = strFullPath.substring(0, nPos1 + 1);
	}

	return(strFullPath);
}

////////////////////////////////////////////////////////////////////////////////
// Zoom code
////////////////////////////////////////////////////////////////////////////////

var g_oZoomInfo = new Object();
var g_wndZoom;

function PopVideo(strVidSwf, strWndWidth, strWndHeight, strVidWidth, strVidHeight, strDuration, strPlaybar, strAutoplay)
{
	var nWndWidth = parseInt(strWndWidth);
	var nWndHeight = parseInt(strWndHeight);
	var strSearch = "vVidSwf=" + strVidSwf + 
					"&vWndWidth=" + strWndWidth + 
					"&vWndHeight=" + strWndHeight + 
					"&vVidWidth=" + strVidWidth + 
					"&vVidHeight=" + strVidHeight + 
					"&vDuration=" + strDuration + 
					"&vPlaybar=" + strPlaybar + 
					"&vAutoplay=" + strAutoplay;

	if (nWndWidth > screen.availWidth)
	{
		nWndWidth = screen.availWidth;
	}

	if (nWndHeight > screen.availHeight)
	{
		nWndHeight = screen.availHeight;
	}


	var strOptions = "width=" + nWndWidth +",height=" + nWndHeight + ", status=0, toolbar=0, location=0, menubar=0, scrollbars=0";

	if (g_wndZoom)
	{
		try
		{
			g_wndZoom.close()
		}
		catch (e)
		{
		}
	}

	g_wndZoom = window.open(GetBasePath() + g_strContentFolder + "/VidLoader.html?" + strSearch, "Video", strOptions);
}

function PopZoomImage(strFileName, nWidth, nHeight)
{
	var strScroll = "0";

	
	var nWndWidth = parseInt(nWidth);
	var nWndHeight = parseInt(nHeight);
	var strSearch = "";

	if (nWndWidth > screen.availWidth)
	{
		nWndWidth = screen.availWidth;
		strScroll = "1";
	}

	if (nWndHeight > screen.availHeight)
	{
		nWndHeight = screen.availHeight;
		strScroll = "1";
	}
		
	strSearch = "vFileName=" + strFileName + 
				"&vWndWidth=" + nWndWidth + 
				"&vWndHeight=" + nWndHeight


	var strOptions = "width=" + nWndWidth +",height=" + nWndHeight + ", status=0, toolbar=0, location=0, menubar=0, scrollbars=" + strScroll;

	if (g_wndZoom)
	{
		try
		{
			g_wndZoom.close()
		}
		catch (e)
		{
		}
	}

	g_wndZoom = window.open(GetBasePath() + g_strContentFolder + "/zoom.html?" + strSearch, "Zoom", strOptions);
}