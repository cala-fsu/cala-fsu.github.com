/*********************************************************************
--- flashcommand : fscommand handler functions ---
version 5.0.0
This is the general fscommand handler for ALL output formats
*********************************************************************/

///////////////////////////////////////////////////////////////////////////
// Global Vars
///////////////////////////////////////////////////////////////////////////
var g_strPlayer = "stealthray";
var DATA_PATH = "data/swf/";
var FLASH_WND_WIDTH = 40;
var FLASH_WND_HEIGHT = 30;

var SWF_BASE_WIDTH		= 980;	
var SWF_BASE_HEIGHT		= 640;
var WEBOBJ_LEFT			= 254;
var WEBOBJ_TOP			= 36;

if (FF1 || NS6plus)
{
	WEBOBJ_LEFT = 253;
	WEBOBJ_TOP = 34;
}

if (!g_bScaleSwf)
{
	WEBOBJ_LEFT -= 8;
	WEBOBJ_TOP -= 4;
	strSwfWidth = 992;
	strSwfHeight = 652;
}

var WEBOBJ_DISPLAY3_XPOS_ADJUST	= 150;
var WEBOBJ_DISPLAY3_YPOS_ADJUST	= 20;

var WEBOBJ_DISPLAY2_XPOS_ADJUST	= 119;

// Browser Resize
var g_ResizeTimeout;
var g_strQMPath = "";

///////////////////////////////////////////////////////////////////////////
// Utility Functions
///////////////////////////////////////////////////////////////////////////

function Click()
{
	// alert("Test");
}

function WriteSwfObject(strFileName, strSwfWidth, strSwfHeight, strFlashVars, bWebObject, strTransparent, strScale)
{
	var strLocProtocol = location.protocol;
	
	if (strLocProtocol.indexOf("file") >= 0)
	{
		strLocProtocol = "http:";
	}


	document.write("<OBJECT classid='clsid:D27CDB6E-AE6D-11cf-96B8-444553540000' ");
	document.write("codebase='" + strLocProtocol + "//download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=6,0,79,0' ");
	document.write("WIDTH='" + strSwfWidth + "' HEIGHT='" + strSwfHeight + "' ID='player' ALIGN=''> ");
	document.write("<PARAM NAME=movie VALUE='" + strFileName + "'> ");
	document.write("<PARAM NAME=quality VALUE='best'> ");
	if (bWebObject)
	{
		document.write("<PARAM NAME=WMODE VALUE='transparent'> ");
	}
	document.write("<PARAM NAME=scale VALUE='" + strScale + "'> ");
	document.write("<PARAM NAME=menu VALUE='false'>");
	document.write("<PARAM NAME=FlashVars VALUE='" + strFlashVars + "'>");
	document.write("<EM"+"BED WIDTH='"+ strSwfWidth +"' HEIGHT='"+ strSwfHeight +"' src='" + strFileName + "' NAME='player' quality='best' " + strTransparent + " scale='" + strScale + "'  ALIGN='' ");
	document.write("FlashVars='" + strFlashVars + "'");
	document.write(" TYPE='application/x-shockwave-flash' PLUGINSPAGE='" + strLocProtocol + "//www.macromedia.com/go/getflashplayer' swLiveConnect='true' menu='false'></EM"+"BED>");
	document.write("</OBJECT>");
}


function CreateBookmark(args, bSlide)
{
	if (!Opera7plus && IE4plus)
	{
		var nSlideNum = args.substring(0,args.indexOf("|"));
		var strTitle = args.substring((args.indexOf("|")+1),args.length);

		var _proto 	= document.location.protocol;
		var _host 	= document.location.host;
		var _pathname	= document.location.pathname;
		var _search = document.location.search;
		var newpath  = "";
		var newUrl  = "";
		var nPos = 0;

		nPos = _pathname.lastIndexOf("/");

		if (nPos <= 0) 
		{
			nPos = _pathname.lastIndexOf("\\"); 
		}
		if ( nPos < _pathname.length) 
		{    
			// if / is not the last char grab the trailing "/"
			nPos++;
		}
		
		if (_search.indexOf("akpDocumentID",0) < 0) 
		{
			newpath = _pathname.substr(0, nPos) + "player.html";
			newUrl = _proto + "//" + _host + newpath +"?slide=" + nSlideNum;
		} 
		else 
		{
			did = _search.substring((_search.lastIndexOf("akpDocumentID") + ("akpDocumentID").length+1), _search.length);
			newpath = "/Portal/Storage/DownloadDocument.aspx?DocumentID=" + did;
			newUrl = _proto+"//"+ _host + newpath + "?slide="+ nSlideNum;
		}

		if (bSlide)
		{
			strTitle = strTitle + " - Powered by Articulate ";
		}
		else
		{
			strTitle = strTitle + " Slide "+ nSlideNum +" - Powered by Articulate ";
		}

		try
		{
			window.external.AddFavorite(newUrl, strTitle);
		}
		catch (e)
		{
			var strErr = "Your browser does not support automatic bookmarking when run locally.\nTo bookmark this presentation, please create a bookmark \non the web page that launched this window.";
			alert(strErr);
		}
	}
	else
	{
		var strErr = "Your browser does not support automatic bookmarking.\nTo bookmark this presentation, please create a bookmark \non the web page that launched this window.";
		alert(strErr);
	}
}


function OpenFlashObjectWnd(args)
{
	str = args;
	params = str.split("|");

	var strContainerType = params[0];	// Unused
	var strFilename = params[1];
	var nXPos = parseInt(params[2]);	// Unused
	var nYPos = parseInt(params[3]);	// Unused
	var nWidth = parseInt(params[4]);
	var nHeight = parseInt(params[5]);
	var strBrowserOptions = params[6];

	var  re = /width=0/gi;
	ww = strBrowserOptions.search(re);
	re = /height=0/gi;
	wh = strBrowserOptions.search(re);

	// If the width and height are 0 set to Full screen
	if ((ww >= 0 && wh >= 0) || (nWidth ==0 && nHeight==0))
	{
		nWidth = window.screen.availWidth;
		nHeight = window.screen.availHeight;
	}
	
	PopFlashObj(DATA_PATH + strFilename, nWidth, nHeight)
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

function PopFlashObj(strFileName, nWidth, nHeight)
{
	var strScroll = "0";

	g_oZoomInfo.strFileName = GetBasePath() + strFileName;
	g_oZoomInfo.nWidth = parseInt(nWidth);
	g_oZoomInfo.nHeight = parseInt(nHeight);

	if (g_oZoomInfo.nWidth > screen.availWidth)
	{
		g_oZoomInfo.nWidth = screen.availWidth;
		strScroll = "1";
	}

	if (g_oZoomInfo.nHeight > screen.availHeight)
	{
		g_oZoomInfo.nHeight = screen.availHeight;
		strScroll = "1";
	}


	var strOptions = "width=" + g_oZoomInfo.nWidth +",height=" + g_oZoomInfo.nHeight + ", status=0, toolbar=0, location=0, menubar=0, scrollbars=" + strScroll;

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

	g_wndZoom = window.open("player/zoom.html", "", strOptions);
}

////////////////////////////////////////////////////////////////////////////////
// End Zoom code
////////////////////////////////////////////////////////////////////////////////

function OpenWebObjectWnd(args)
{
	str = args;
	params = str.split("|");

	var strContainerType = params[0]; 	// Unused
	var strObjectType = params[1];		// Unused
	var nXPos = params[2];			// Unused
	var nYPos = params[3];			// Unused
	var nWidth = params[4];
	var nHeight = params[5];
	var strBrowserOptions = params[6];
	var strMode = params[7];  		// Unused
	var strUrl = params[8];
	var bDefaultControls = false;
	
	if (strBrowserOptions == "")
	{
		bDefaultControls = true;
	}
	
	//Check for repository:
	if (strUrl.toLowerCase().indexOf("repository://") == 0) 
	{
		strUrl = "/Portal/Storage/Viewers/ArtPlayer/FollowLink.aspx?file=" + strUrl;
	}

	if (nWidth == -1 && nHeight == -1)
	{
		nWidth = document.body.clientWidth;
		nHeight = document.body.clientHeight;
	}
	
	// If the width and height are 0 set to Full screen
	if (nWidth ==0 && nHeight==0)
	{
		nWidth = window.screen.availWidth;
		nHeight = window.screen.availHeight;
		strBrowserOptions += ",width="+nWidth+",height="+nHeight+",left=0,top=0,screenX=0,screenY=0";
	}
	else 
	{
		strBrowserOptions += ",width=" + nWidth + ",height=" +nHeight;
	}
	
	if (FF)
	{
		var arrBrowserOptions = strBrowserOptions.split(",");
		var bToolbar = false;
		var nTBIndex = -1;
		var bLocation = false;
		var nLocIndex = -1;
		
		for (var i = 0; i < arrBrowserOptions.length; i++)
		{
			var arrTemp = arrBrowserOptions[i].split("=");
			
			switch(arrTemp[0])
			{
				case "toolbar":
					bToolbar = (arrTemp[1] == "yes") ? true : false;
					nTBIndex = i
					break;
				case "location":
					bLocation = (arrTemp[1] == "yes") ? true : false;
					nLocIndex = i;
					break;
			}
		}
		
		if (!bLocation)
		{
			arrBrowserOptions[nTBIndex] = "toolbar=no";
		}
		
		strBrowserOptions = arrBrowserOptions.join(",");
	}
	
	  
	//--Setup the Window.open Target Url to popup and populate:
	var wndWebObj;
	var bSuccess = true;
	
	if (bDefaultControls)
	{
		try
		{
			wndWebObj = window.open(strUrl, "mediaobjectwin");

			wndWebObj.resizeTo(nWidth, nHeight);
		}
		catch (e)
		{
			if (e.number == -2147024891)
			{
				alert("The page you are linking to is in a different security zone then the presentation.  If running locally, adding the mark of the web to the local page may address this problem.")
				bSuccess = false;
			}
		}
	}
	else
	{
		try
		{
			wndWebObj = window.open(strUrl, "mediaobjectwin", strBrowserOptions);
		}
		catch (e)
		{
			if (e.number == -2147024891)
			{
				alert("The page you are linking to is in a different security zone then the presentation.  If running locally, adding the mark of the web to the local page may address this problem.")
				bSuccess = false;
			}
		}
	}
	
	if (bSuccess)
	{
		wndWebObj.focus();
	}
}

function ShowWebObjectDiv(args)
{
	str = args;
	params = str.split("|");
	var strContainerType = params[0]; 	// Unused
	var strObjectType = params[1];		// Unused
	var nXPos = parseInt(params[2]);
	var nYPos = parseInt(params[3]);
	var nWidth = parseInt(params[4]);
	var nHeight = parseInt(params[5]);
	var strBrowserOptions = params[6];
	var strMode = params[7]; 		// scale modes
	var strUrl = params[8];

	//Check for repository:// string//
	if (strUrl.toLowerCase().indexOf("repository://") == 0)
	{
		strUrl = "/Portal/Storage/Viewers/ArtPlayer/FollowLink.aspx?file=" + strUrl;
	}

	//- (iframe) -//
	if (g_bWebObject) 
	{
		// Set the global values
		g_bWebObjDisplay = true;
		g_nWebXPos = nXPos;
		g_nWebYPos = nYPos;
		g_nWebWidth = nWidth;
		g_nWebHeight = nHeight;
		g_strWebMode = strMode;

		// Set the URL
		var myIFrame = document.getElementById("eIFContent");
		myIFrame.src = strUrl;

		// Adjust the Size and position
		ResizeWebObject();

	} 
	else 
	{
		//alert("Can't find a media layer. Opening in a new window instead.");
		window.open(strUrl,   "webobjectwin",   "width=700,height=500,"+strBrowserOptions);
	}

}

function HideWebObjectDiv(args)
{
	//clear the iframe
	if (g_bWebObject) 
	{
		g_bWebObjDisplay = false;

		// Make the WebObject Small for Firefox
		g_nWebWidth = 5;
		g_nWebHeight = 5;

		ResizeWebObject();

		// Set the layer to be invisible
		var layerWebObject = document.getElementById("eLayer1");
		layerWebObject.style.visibility = 'hidden';

		// Fill with blank page
		var myIFrame = document.getElementById("eIFContent");
		myIFrame.src = "player/blank.html";

	}
}

function SetDisplayMode(args)
{
	var params = args.split("|");

	currentDisplayMode = params[0];

	if (g_bWebObjDisplay)
	{
		ResizeWebObject();
	}
}

function ShowMediaObject(args)
{
	//rightclick insert webobject, display in new window//
	str = args;
	params = str.split("|");
	var _url = params[0];
	var _options = params[1];

	//--Launch a new window with the specifed parameters and content:
	window.open(_url,   "mediaobjectwin",   _options);
}

function SendQuiz()  
{
	g_strQuizResults = g_strQuizResults.replace(/'/g,"&#39;");

	var sHTML = "";
	sHTML += '<FORM id="formQuiz" method="POST" action="mailto:' + g_strEmail + '?subject=' + g_strSubject + '" enctype="text/plain">';
	sHTML += '<INPUT TYPE="hidden" NAME="Quiz Results" VALUE=\'' + g_strQuizResults.replace(/\\n/g,"\n") + '\'>';
	sHTML += '<br><input type="submit"><br>';
	sHTML += '</FORM>';
	document.getElementById("divQuiz").innerHTML = sHTML;
	document.getElementById("formQuiz").submit();
}

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


///////////////////////////////////////////////////////////////////////////
// Resize Event
///////////////////////////////////////////////////////////////////////////

var g_resizeTimer;
var g_nWebXPos = 0;
var g_nWebYPos = 0;
var g_nWebWidth = 0;
var g_nWebHeight = 0;
var g_bWebObjDisplay = false;
var g_strWebMode = "scaleall";

function ResizeWebObject()
{
	var layerWebObject = document.getElementById("eLayer1");
	var myIFrame = document.getElementById("eIFContent");

	var nWidth = g_nWebWidth;
	var nHeight = g_nWebHeight;
	var nXPos = g_nWebXPos;
	var nYPos = g_nWebYPos;

	// Calculate the Ratio and Offsets
	var swfMovie = thisMovie('player');

	if (!swfMovie.clientHeight)
	{
		swfMovie = document.getElementById("player");
	}

	var nSwfXPos = swfMovie.offsetLeft;
	var nSwfYPos = swfMovie.offsetTop;
	var nSwfHeight = swfMovie.clientHeight;
	var nSwfWidth = swfMovie.clientWidth;

	if (isMac && IE5)
	{
		nSwfWidth = swfMovie.width;
		if (swfMovie.width == "100%")
		{
			nSwfWidth = document.body.clientWidth;
			
		}
		
		nSwfHeight = swfMovie.height;
		if (swfMovie.height == "100%")
		{
			nSwfHeight = document.body.clientHeight;
		}
	}

	var nWRatio = nSwfWidth / SWF_BASE_WIDTH;
	var nHRatio = nSwfHeight / SWF_BASE_HEIGHT;
	var nRatio = 1;
	var nLeftOffset = 0;
	var nTopOffset = 0;

	// Adjust the Width and the height for firefox
	if (FF1 || NS6plus)
	{
		nWidth -= 5;
		nHeight -= 5;
	}

	//Handle special Mode 2 and 3 cases:
	if (currentDisplayMode == 3) 
	{
		nXPos -= WEBOBJ_DISPLAY3_XPOS_ADJUST;
		nYPos -= WEBOBJ_DISPLAY3_YPOS_ADJUST;
		nXPos *= 1.13;
		nYPos *= 1.13;
		nWidth *= 1.13;
		nHeight *= 1.13;
	}
	else if (currentDisplayMode == 2) 
	{
		nXPos -= WEBOBJ_DISPLAY2_XPOS_ADJUST;

	}

	if (nHRatio < nWRatio)
	{
		nRatio = nHRatio;
		nLeftOffset = (nSwfWidth - (SWF_BASE_WIDTH * nRatio)) / 2;
	}
	else
	{
		nRatio = nWRatio;
		nTopOffset = (nSwfHeight - (SWF_BASE_HEIGHT * nRatio)) / 2;
	}

	strMode = "scaleall";

	if ((g_strWebMode == "") || (g_strWebMode == "scaleall")) 
	{
		factorSize = nRatio;  
		factorPosition = nRatio;
	}
	if (g_strWebMode =="scaleposition")
	{
		factorSize = 1;  
		factorPosition = nRatio;
	}
	if (g_strWebMode == "scalesize")  
	{
		factorSize = nRatio;  
		factorPosition = 1;
	}
	if (g_strWebMode == "absolute") 
	{
		factorSize = 1;  
		factorPosition = 1;
	}

		
	iLeft = (WEBOBJ_LEFT + nXPos) * factorPosition + nLeftOffset;
	iTop = (WEBOBJ_TOP + nYPos) * factorPosition + nTopOffset;
	iWidth = nWidth * factorSize;
	iHeight = nHeight * factorSize;

	//Resize the layer
	layerWebObject.style.left = nSwfXPos + iLeft;
	layerWebObject.style.top = nSwfYPos + iTop;
	layerWebObject.style.width = iWidth;
	layerWebObject.style.height = iHeight;
	layerWebObject.style.visibility = 'visible';

	// Resize the IFrame
	myIFrame.style.width = iWidth;
	myIFrame.style.height = iHeight;

}

function WindowResize()
{
	// Notify the swf that we have resized.  This is for 
	// text that does not scale properly
	if (g_bScaleSwf)
	{
		// Make sure that we don't send 100 resize messages in a row
		clearTimeout(g_ResizeTimeout);
		g_ResizeTimeout = setTimeout("NotifySwfResize()", 200);
		
	}

	// Resize the Web Object
	if (g_bWebObjDisplay)
	{
		ResizeWebObject();
	}
}

function NotifySwfResize()
{
	var swfMovie = thisMovie('player');
	swfMovie.SetVariable("g_Resize.Trigger", "1");
}

function SetBgColor(strColor)
{
	var strTemp = "";

	if (IE4 && !Opera && !isMac)
	{
		strTemp = "0x" + strColor;
		document.bgColor = parseInt(strTemp);
	}
	else
	{
		strTemp = "#" + strColor;
		document.bgColor = strTemp;
	}	
}

window.onresize = WindowResize;

var g_strAttachment = "";

function OpenAttachment()
{
	if (IESP2 || IE7Above)
	{
		try
		{
			window.open('player/attach.html?' + GetBasePath() + g_strAttachment,"attach")
		}
		catch (e)
		{
			if (e.number == -2147024891)
			{
				alert("For viewing attachments when presentation is not playing from a website, view the Knowledge Base article located at http://kb.articulate.com/kb/000669.php")
			}
		}
	}
	else
	{
		window.open(GetBasePath() + g_strAttachment);
	}
}

////////////////////////////////////////////////////////////////////////////////
// Results Screen Code
////////////////////////////////////////////////////////////////////////////////

function QuestionResult(nQuestionNum, strQuestion, strResult, strCorrectResponse, strStudentResponse, nPoints, strInteractionId, strObjectiveId, strType, strLatency)
{
	if (nPoints < 0)
	{
		nPoints = 0;
	}
	if (strCorrectResponse == "")
	{
		strCorrectResponse = "&nbsp;";
	}

	this.nQuestionNum = nQuestionNum
	this.strQuestion = strQuestion;
	this.strCorrectResponse = strCorrectResponse;
	this.strStudentResponse = strStudentResponse;
	this.strResult = strResult;
	this.nPoints = nPoints;
	this.bFound = false;
	this.dtmFinished = new Date();
	this.strInteractionId = strInteractionId;
	this.strObjectiveId = strObjectiveId;
	this.strType = strType;
	this.strLatency = strLatency;
}

function StoreResult(args)
{
	args = args.replace(/\|\$s\$\|/g,";")
	var arrParams = args.split("|$:$|");
	var oQuestionResult = new QuestionResult(parseInt(arrParams[0]) + 1, arrParams[1], arrParams[2], arrParams[3], arrParams[4] ,arrParams[5]);
	var nIndex = g_arrResults.length;

	// Lets see if we have answered the question before

	for (var i = 0; i < g_arrResults.length; i++)
	{
		if (g_arrResults[i].nQuestionNum == oQuestionResult.nQuestionNum)
		{
			nIndex = i;
			break;
		}
	}

	g_arrResults[nIndex] = oQuestionResult;

}

function StoreQuestionResult(nQuestionNum, strQuestion, strResult, strCorrectResponse, strStudentResponse, nPoints, strInteractionId, strObjectiveId, strType, strLatency)
{

	var oQuestionResult = new QuestionResult(nQuestionNum, strQuestion, strResult, strCorrectResponse, strStudentResponse, nPoints, strInteractionId, strObjectiveId, strType, strLatency);
	var nIndex = g_arrResults.length;

	// Lets see if we have answered the question before

	for (var i = 0; i < g_arrResults.length; i++)
	{
		if (g_arrResults[i].nQuestionNum == oQuestionResult.nQuestionNum)
		{
			nIndex = i;
			break;
		}
	}

	g_arrResults[nIndex] = oQuestionResult;

}

function StoreQuizResult(args)
{
	var arrParams = args.split("|$:$|");

	g_oQuizResults.dtmFinished = new Date();
	g_oQuizResults.strResult = arrParams[0];
	g_oQuizResults.strScore = arrParams[1];
	g_oQuizResults.strPassingScore = arrParams[2];
}

function ShowResult(args)
{
	var arrData = args.split("|$s$|");
	
	if (!g_oQuizResults.oOptions)
	{
		g_oQuizResults.oOptions = new Object();
	}

	g_oQuizResults.oOptions.bShowUserScore = (arrData[0] == "1");
	g_oQuizResults.oOptions.bShowPassingScore = (arrData[1] == "1");
	g_oQuizResults.oOptions.bShowShowPassFail = (arrData[2] == "1");
	g_oQuizResults.oOptions.bShowQuizReview = (arrData[3] == "1");
	g_oQuizResults.oOptions.strResult = arrData[4];
	g_oQuizResults.oOptions.strName = arrData[5];

	window.open(GetBasePath() + g_strQMPath + "report.html", "Reports")
}

////////////////////////////////////////////////////////////////////////////////
// Zoom code
////////////////////////////////////////////////////////////////////////////////

var g_oZoomInfo = new Object();
var g_wndZoom;

function PopZoomImage(strFileName, nWidth, nHeight, strZoomPath)
{	
	var strScroll = "0";
	g_oZoomInfo.strFileName = strFileName;
	g_oZoomInfo.nWidth = parseInt(nWidth);
	g_oZoomInfo.nHeight = parseInt(nHeight);

	if (g_oZoomInfo.nWidth > screen.availWidth)
	{
		g_oZoomInfo.nWidth = screen.availWidth;
		strScroll = "1";
	}

	if (g_oZoomInfo.nHeight > screen.availHeight)
	{
		g_oZoomInfo.nHeight = screen.availHeight;
		strScroll = "1";
	}


	var strOptions = "width=" + g_oZoomInfo.nWidth +",height=" + g_oZoomInfo.nHeight + ", status=0, toolbar=0, location=0, menubar=0, scrollbars=" + strScroll;

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

	var strRelPath = g_strQMPath;
	if (strZoomPath != "" && strZoomPath != undefined && strZoomPath != null)
	{
		strRelPath = strZoomPath;
	}

	var strZoom = "zoom.html?" + "vFileName=" + strFileName + "&vWndWidth=" + nWidth + "&vWndHeight=" + nHeight;
	var strBase = GetBasePath().split("%20").join(" ");
	
	if (strRelPath.indexOf(strBase) < 0)
	{
		strRelPath = strBase + strRelPath;
	}
	
	g_wndZoom = window.open(strRelPath + strZoom, "Zoom", strOptions);
}

////////////////////////////////////////////////////////////////////////////////
// Video
////////////////////////////////////////////////////////////////////////////////
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


function OpenVideo(strUrl, strWndWidth, strWndHeight, strVidWidth, strVidHeight, strDuration, strPlaybar, strAutoPlay,
						   strStatus, strToolbar, strLocation, strMenubar, strScrollbars, strResizable, strPlayerPath, strContentPath)
{
	var nWndWidth = parseInt(strWndWidth);
	var nWndHeight = parseInt(strWndHeight);
	
	var strSearch = "exUrl=" + strContentPath + strUrl + 
					"&exWndWidth=" + strWndWidth +
					"&exWndHeight=" + strWndHeight +
					"&exWidth=" + strVidWidth + 
					"&exHeight=" + strVidHeight + 
					"&exDuration=" + strDuration + 
					"&exPlaybar=" + strPlaybar + 
					"&exAutoPlay=" + strAutoPlay;

	if (nWndWidth > screen.availWidth)
	{
		nWndWidth = screen.availWidth;
	}

	if (nWndHeight > screen.availHeight)
	{
		nWndHeight = screen.availHeight;
	}


	var strOptions = "";
	strOptions += "width=" + nWndWidth;
	strOptions += ", height=" + nWndHeight;
	strOptions += ", status=" + ((strStatus.toLowerCase() == "true") ? 1 : 0);
	strOptions += ", toolbar=" + ((strToolbar.toLowerCase() == "true") ? 1 : 0);
	strOptions += ", location=" + ((strLocation.toLowerCase() == "true") ? 1 : 0);
	strOptions += ", menubar=" + ((strMenubar.toLowerCase() == "true") ? 1 : 0);
	strOptions += ", scrollbars=" + ((strScrollbars.toLowerCase() == "true") ? 1 : 0);
	strOptions += ", resizable=" + ((strResizable.toLowerCase() == "true") ? 1 : 0);

	var nXPos = 0;
	var nYPos = 0;
	var nWidth = screen.availWidth;
	var nHeight = screen.availHeight;
	
	if (window.screenX != undefined) 
	{
		nXPos = window.screenX;
		nYPos = window.screenY;
		nWidth = window.innerWidth;
		nHeight = window.innerHeight;
	}
	else if (window.screenLeft != undefined)
	{
		nXPos = window.screenLeft;
		nYPos = window.screenTop;
		nWidth = document.body.offsetWidth;
		nHeight = document.body.offsetHeight;
	}
	
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
	
	strOptions += ", left=" + (nXPos + (nWidth - nWndWidth)/2);
	strOptions += ", screenX=" + (nXPos + (nWidth - nWndWidth)/2);
	strOptions += ", top=" + (nYPos + (nHeight - nWndHeight)/2);
	strOptions += ", screenY=" + (nYPos + (nHeight - nWndHeight)/2);

	g_wndZoom = window.open(strPlayerPath + "VideoPlayer.html?" + strSearch, "Video", strOptions);
}

////////////////////////////////////////////////////////////////////////////////
// Get Time
////////////////////////////////////////////////////////////////////////////////
function GetTime(dtmDate)
{
	var strResult = "";
	var nHours = dtmDate.getHours();
	var strAM = "am";
	var nMinutes = dtmDate.getMinutes();
	var strMinutes = "" + nMinutes;
	var nSeconds = dtmDate.getSeconds();
	var strSeconds = "" + nSeconds;

	if (nMinutes < 10)
	{
		strMinutes = "0" + nMinutes;
	}
	
	if (nSeconds < 10)
	{
		strSeconds = "0" + nSeconds;
	}
	

	strResult = nHours + ":" + strMinutes + ":" + strSeconds;

	return strResult;
}

function GetDate(dtmDate)
{
	var strResult = "";


	strResult = dtmDate.getMonth() + "/" + dtmDate.getDate() + "/" + dtmDate.getFullYear();

	return strResult;
}

////////////////////////////////////////////////////////////////////////////////
// Email Results
////////////////////////////////////////////////////////////////////////////////

function EmailResults(strAddress)
{
	var g_strSubject = "Quiz Results: " + g_oQuizResults.strTitle;
	var strQuizResults = "";
	var strMainHeader = " " + g_oQuizResults.strTitle + "\nStatus, Raw Score, Passing Score, Max Score, Min Score, Time\n";
	var strLineHeader = "\n\nDate, Time, Score, Interaction ID, Objective Id, Interaction Type, Student Response, Result, Weight, Latency\n";
	var strMainData = "\n";
	var strLineData = "\n";
		
	// Status
	strMainData += g_oQuizResults.strResult + ",";
	
	// Score
	// strMainData += g_oQuizResults.strScore + ",";
	
	// Raw Score
	strMainData += g_oQuizResults.strPtScore + ",";
	
	// Passing Score
	strMainData += Math.round((g_oQuizResults.strPassingScore/100) * g_oQuizResults.strPtMax) + ",";
	
	// Max Score
	strMainData += g_oQuizResults.strPtMax + ",";
	
	// Min Score
	strMainData += 0 + ",";
	
	// Time
	strMainData += GetTime(g_oQuizResults.dtmFinished);
		
	for (var i = 0; i < g_arrResults.length; i++)
	{
		//Date
		strLineData += GetDate(g_arrResults[i].dtmFinished) + ",";
		
		// Time
		strLineData += GetTime(g_arrResults[i].dtmFinished) + ",";
		
		// Score
		strLineData += g_arrResults[i].nPoints + ",";
		
		// Interaction Id
		strLineData += g_arrResults[i].strInteractionId + ",";
		
		// Objective Id
		strLineData += g_arrResults[i].strObjectiveId + ",";

		// Interaction Type
		strLineData += g_arrResults[i].strType + ",";

		// Student Response
		strLineData += g_arrResults[i].strStudentResponse + ",";
		
		// Result
		strLineData += g_arrResults[i].strResult + ",";
		
		// Weight
		strLineData += "1,";
		
		// Latency
		strLineData += g_arrResults[i].strLatency;
		
		strLineData += "\n";
	}
	
	strQuizResults = strMainHeader + strMainData + strLineHeader + strLineData;

	var sHTML = "";
	sHTML += '<FORM id="formQuiz" method="POST" action="mailto:' + strAddress + '?subject=' + g_strSubject + '" enctype="text/plain">';
	sHTML += '<INPUT TYPE="hidden" NAME="Quiz Results" VALUE=\'' + strQuizResults + '\'>';
	sHTML += '<br><input type="submit"><br>';
	sHTML += '</FORM>';
	document.getElementById("divQuiz").innerHTML = sHTML;
	document.getElementById("formQuiz").submit();

}

///////////////////////////////////////////////////////////////////////////
// Flash Command Handler
///////////////////////////////////////////////////////////////////////////
var g_strDelim = "|~|";
var g_strInteractionDelim = "|#|";

function player_DoJSCommand(command, args)
{
	var strCommand = command;
	var strArgs = ReplaceAll(args, "|$|", "%");
	
	player_DoFSCommand(strCommand, strArgs) 
}

function ReplaceAll(strTarget, strChar, strNew)
{
	var arrRemoved = strTarget.split(strChar);
	
	return arrRemoved.join(strNew);
}

function player_DoFSCommand(command, args) 
{
	if (command.substr(0, 3) == "CC_")
	{
		player_DoChicoCommand(command, args);
	}

	args = String(args);

	args = args.replace(/%_q_%/g,"\"")
	args = args.replace(/;/g,"|$s$|")
	args = args.replace(/%_s_%/g,";")

	switch (command)
	{
		case "current_slide_index":
			g_nCurrentSlideIndex = Number(args);
			break;
		case "bookmark_presentation":
			CreateBookmark(args, false);
			break;

		case "bookmark_slide":
			CreateBookmark(args, true);
			break;

		case "hyper_flashobject":
			OpenFlashObjectWnd(args);
			break;

		case "hyper_webobject_newwindow":
			OpenWebObjectWnd(args);
			break;

		case "hyper_webobject_inplayer":
			ShowWebObjectDiv(args);
			break;

		case "hyper_webobject_inplayer_hide":
			HideWebObjectDiv(args);
			break;

		case "ART_displaymode":
			SetDisplayMode(args);
			break;

		case "hyper_mediaobject":
			ShowMediaObject(args);
			break;

		case "ART_CloseAndExit":
			if (!g_bLMS || g_bAOSupport)
			{
				top.window.close();
	 		}
			break;
		case "ART_SetBgBolor":
				SetBgColor(args);
			break;

		case "ART_Attachment":
			g_strAttachment = args;
			if (IESP2)
			{
				OpenAttachment()
			}
			else
			{
				setTimeout("OpenAttachment()", 100)
			}
			break;
		
		case "RR_PopVideo":
			var arrArgs = args.split("|~|");
			OpenVideo(arrArgs[0], Number(arrArgs[1]) + 5, Number(arrArgs[2]) + 12, arrArgs[3], arrArgs[4], arrArgs[5], arrArgs[6], arrArgs[7],
					  "false", "false", "false", "false", "false", "false", "player/", "");
			break;
		case "AP_OpenVideo":
			var arrArgs = args.split("|");
			OpenVideo(arrArgs[0], arrArgs[1], arrArgs[2], arrArgs[3], arrArgs[4], arrArgs[5], arrArgs[6], arrArgs[7], 
					  arrArgs[8], arrArgs[9], arrArgs[10], arrArgs[11], arrArgs[12], arrArgs[13], "player/", "../data/swf/");
			break;

		// Email Handlers
		case "emailEmail":
			g_strEmail = args;
			break;

		case "QuizResults":
		case "Quiz Results":
			var strTemp = args.replace(/\|\$s\$\|/g,";");
			g_strQuizResults = strTemp;
			break;

		case "emailSubject":
			g_strSubject = args;
			break;

		case "emailSubmit":
			SendQuiz();
			break;

		// QM Handlers
		case "SetQMPath":
			g_strQMPath = args;
			break;

		case "StoreQuestionResult":
			StoreResult(args);
			break;

		case "StoreQuizResult":
			StoreQuizResult(args);
			break;

		case "DisplayPrintScreen":
			ShowResult(args);
			break;

		case "ART_QMAttachment":
			g_strAttachment = g_strQMPath + args;

			if (IESP2)
			{
				OpenAttachment()
			}
			else
			{
				setTimeout("OpenAttachment()", 100)
			}

			break;

		case "QM_ZoomImage":
			var arrData = args.split("|~|");
			PopZoomImage(arrData[0], arrData[1], arrData[2], arrData[3]);
			break;

	}

	if (g_bLMS)
	{
		customFScommandHandler(command, args);   //found in Lms.js
	}
	
	if (g_bAOSupport)
	{
		AO_DoFSCommand(command, args);
	}
}

function CloseWindow()
{
	top.window.close();
}

function player_DoChicoCommand(command, args)
{
	args = String(args);
	command = String(command);

	var arrArgs = args.split(g_strDelim);

	switch (command)
	{
		case "CC_SetInteractionDelim":
			g_strInteractionDelim = args;
			break;
			
		case "CC_SetDelim":
			ResetPrintData();
			g_strDelim = args;
			break;
			
		case "CC_ZoomImage":
			PopZoomImage(arrArgs[0], arrArgs[1], arrArgs[2], arrArgs[9]);
			break;
			
		case "CC_OpenVideo":
			OpenVideo(arrArgs[0], arrArgs[1], arrArgs[2], arrArgs[3], arrArgs[4], arrArgs[5], arrArgs[6], arrArgs[7], 
					  arrArgs[8], arrArgs[9], arrArgs[10], arrArgs[11], arrArgs[12], arrArgs[13], arrArgs[14], "");
			break;
			
		case "CC_StoreQuestionResult":		
			StoreQuestionResult(parseFloat(arrArgs[0]) + 1, arrArgs[1], arrArgs[2], arrArgs[3], arrArgs[4] ,arrArgs[5], arrArgs[6], arrArgs[7], arrArgs[8], arrArgs[9]);
			break;
			
		case "CC_StoreQuizResult":		
			g_oQuizResults.dtmFinished = new Date();
			g_oQuizResults.strResult = arrArgs[0];
			g_oQuizResults.strScore = arrArgs[1];
			g_oQuizResults.strPassingScore = arrArgs[2];
			g_oQuizResults.strMinScore = arrArgs[3];
			g_oQuizResults.strMaxScore = arrArgs[4];
			g_oQuizResults.strPtScore = arrArgs[5];
			g_oQuizResults.strPtMax = arrArgs[6];
			g_oQuizResults.strTitle = arrArgs[7];
			break;
			
		case "CC_PrintResults":
			g_oQuizResults.oOptions.bShowUserScore = (arrArgs[0] == "true");
			g_oQuizResults.oOptions.bShowPassingScore = (arrArgs[1] == "true");
			g_oQuizResults.oOptions.bShowShowPassFail = (arrArgs[2] == "true");
			g_oQuizResults.oOptions.bShowQuizReview = (arrArgs[3] == "true");
			g_oQuizResults.oOptions.strResult = arrArgs[4];
			g_oQuizResults.oOptions.strName = arrArgs[5];
			window.open(arrArgs[6] + "report.html", "Reports")
			break;
			
		case "CC_EmailResults":
			g_oQuizResults.oOptions.bShowUserScore = (arrArgs[0] == "true");
			g_oQuizResults.oOptions.bShowPassingScore = (arrArgs[1] == "true");
			g_oQuizResults.oOptions.bShowShowPassFail = (arrArgs[2] == "true");
			g_oQuizResults.oOptions.bShowQuizReview = (arrArgs[3] == "true");
			g_oQuizResults.oOptions.strResult = arrArgs[4];
			g_oQuizResults.oOptions.strName = arrArgs[5];

			EmailResults(arrArgs[6]);
			break;
			
		case "CC_OpenUrl":
			OpenUrl(arrArgs[0], arrArgs[1], arrArgs[2], arrArgs[3], arrArgs[4], arrArgs[5], arrArgs[6], arrArgs[7], 
					  arrArgs[8], arrArgs[9], arrArgs[10], arrArgs[11], arrArgs[12], arrArgs[13]);
			break;
			
		case "CC_ClosePlayer":
			if (!g_bLMS || g_bAOSupport)
			{
				if (FF)
				{
					setTimeout("CloseWindow()", 100);
				}
				else
				{
					CloseWindow();
				}
			}
			break;
		default:
			break;
	}
	
	if (g_bLMS)
	{
		lms_DoFSCommand(command, args);
	}
}

function ResetPrintData()
{
	g_arrResults = new Array();
	g_oQuizResults = new Object();
	g_oQuizResults.oOptions = new Object();
}

////////////////////////////////////////////////////////////////////////////////
// Open Url
////////////////////////////////////////////////////////////////////////////////
function OpenUrl(strUrl, strWindow, strWindowSize, strWidth, strHeight, strUseDefaultControls, strStatus, strToolbar, strLocation, strMenubar, strScrollbars, strResizable)
{

	var nWndWidth = parseInt(strWidth);
	var nWndHeight = parseInt(strHeight);
	var bUseDefaultSize = (strWindowSize.toLowerCase() == "default");
	var bUseDefaultControls = (strUseDefaultControls.toLowerCase() == "true");
	var bFullScreen = (strWindowSize.toLowerCase() == "fullscreen");

	if (bFullScreen)
	{
		nWndWidth = screen.availWidth;
		nWndHeight = screen.availHeight;
	}
	else
	{
		if (nWndWidth > screen.availWidth)
		{
			nWndWidth = screen.availWidth;
		}

		if (nWndHeight > screen.availHeight)
		{
			nWndHeight = screen.availHeight;
		}
	}


	var strOptions = "";
	if (!bUseDefaultControls)
	{
		if (!bUseDefaultSize)
		{
			strOptions += "width=" + nWndWidth + ", ";
			strOptions += "height=" + nWndHeight + ", ";
		}

		strOptions += "status=" + ((strStatus.toLowerCase() == "true") ? 1 : 0);
		strOptions += ", toolbar=" + ((strToolbar.toLowerCase() == "true") ? 1 : 0);
		strOptions += ", location=" + ((strLocation.toLowerCase() == "true") ? 1 : 0);
		strOptions += ", menubar=" + ((strMenubar.toLowerCase() == "true") ? 1 : 0);
		strOptions += ", scrollbars=" + ((strScrollbars.toLowerCase() == "true") ? 1 : 0);
		strOptions += ", resizable=" + ((strResizable.toLowerCase() == "true") ? 1 : 0);
	}


	var oNewWnd;
	
	if (bUseDefaultSize && bUseDefaultControls)
	{
		window.open(strUrl, strWindow);
	}
	else if (bUseDefaultControls)
	{
		if (IE)
		{
			oNewWnd = window.open("player/blank.html", strWindow);
			
			if (bFullScreen)
			{
				oNewWnd.moveTo(0, 0);
			}
			
			oNewWnd.resizeTo(nWndWidth, nWndHeight);
			oNewWnd.document.location = strUrl;
		}
		else
		{
			oNewWnd = window.open(strUrl, strWindow);
			oNewWnd.resizeTo(nWndWidth, nWndHeight);
		}
	}
	else
	{
		oNewWnd = window.open(strUrl, strWindow, strOptions);
	}
	
	if (bFullScreen && !(bUseDefaultControls && IE))
	{
		oNewWnd.moveTo(0, 0);
	}
	
}
