async function loadHeaderData(vRecipeId, vCSRFToken, v3DSpaceUrl)
{
	require(["DS/WAFData/WAFData", "DS/DBSApp/Utils/URLHandler", 'i18n!DS/DBSApp/assets/nls/DMSAppNLS', 'DS/PlatformAPI/PlatformAPI'], function (WAFData, URLHandler, NLS, PlatformAPI) {
		var vTopMenu = UWA.createElement('div',{'class':'topmenu'}).inject(widget.body);
		var vTopmenuChilds = UWA.createElement('div',{'class':'topmenuitems'}).inject(vTopMenu);
		//var vExportButton = UWA.createElement('div',{'class':'exportlist', html:'<div class="box" ><select onChange="exportPDF(this.value)"><option>Export</option><option>PDF - AS-IS</option><option>PDF - Simplified</option><option>Excel - Simplified</option><option>Export to ERP(iShift)</option></select>'});
		var vExportButton = UWA.createElement('div',{'class':'exportlist', html:'<div class="box" ><select id="exportselect" onChange="exportPDF(this.value)"><option>Export</option><option>PDF - AS-IS</option><option>PDF - Simplified</option><option>Excel - Simplified</option></select>'});
		vExportButton.inject(vTopmenuChilds);
		var vResetViewButton = UWA.createElement('div',{'class':'resetview', html:'<button class="btn-reset" id="reset-btn" onclick="resetSteps()">Reset</button>'});
		vResetViewButton.inject(vTopmenuChilds);
		var confirmPopup = UWA.createElement('div', {'class':'customPopup',id:'customPopup', html:[{tag:'div', 'class':'customPopupBG',html:[{tag:'p', html:'Do you want to refresh the current recipe?'},{tag:'button', id:'popupYesBtn', 'onClick':'refreshConfirm(\"yes\")', html:'Yes'},{tag:'button', id:'popupNoBtn', 'onClick':'refreshConfirm(\"no\")', html:'No'}]}]});
		confirmPopup.inject(widget.body);
		
		var vSecurityContextURI = v3DSpaceUrl+"/resources/pno/person/getsecuritycontext";
		var vGetHWPLDetailsURI = v3DSpaceUrl + "/resources/v1/collabServices/attributes/op/read?tenant=OnPremise";
		var vProcessExpandURI = v3DSpaceUrl + "/resources/v1/modeler/dsprcs/dsprcs:MfgProcess/";
        var vWAFData = '{"busIDs":["'+vRecipeId+'"]}';
		var vSecurityContext = widget.getValue("SecurityContext");
		var vCSRFToken = widget.getValue("CSRFToken");
		
		document.getElementById("loader").style.display = 'block';
		WAFData.authenticatedRequest(vGetHWPLDetailsURI,
		{
			method: 'POST',
			type: 'json',
			data: vWAFData,
			headers: 
				{
					'Accept': 'application/json',
					'Content-Type': 'application/json',
					'Accept-Language': widget.lang,
					'SecurityContext': vSecurityContext
				},
			timeout: 1000 * 60 * 15,
			onComplete: async function (hwplDetailsData)
			{
				var vRecipeBasicInfo = ((((hwplDetailsData.results)[0]).basicData))
				var vRecipeClassificationInfo = ((((hwplDetailsData.results)[0]).data))
				let vRecipeDetails = {};
				for(var i=0;i<vRecipeBasicInfo.length;i++)
				{
					vRecipeDetails[(vRecipeBasicInfo[i]).nls] = (vRecipeBasicInfo[i]).value[0];
				}
				for(var j=0;j<vRecipeClassificationInfo.length;j++)
				{
					if((vRecipeClassificationInfo[j]).hasOwnProperty("value"))
					{
						vRecipeDetails[(vRecipeClassificationInfo[j]).nls] = (vRecipeClassificationInfo[j]).value[0];
					}
					else
					{
						vRecipeDetails[(vRecipeClassificationInfo[j]).nls] = "";
					}
				}
				
				var date = new Date();
				date = date.toLocaleString('en-US', { timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone });						
				vCreationDate = new Date(Date.parse(vRecipeDetails["Creation Date"])).toLocaleString('en-US', { timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone });
				var vRecipeType = "";
				var vRecipeUsage = "";
				var vRecipeLevel = "";
				if(vRecipeDetails.hasOwnProperty('Recipe Type')){vRecipeType = vRecipeDetails["Recipe Type"];}
				if(vRecipeDetails.hasOwnProperty('Recipe Usage')){vRecipeUsage = vRecipeDetails["Recipe Usage"];}
				if(vRecipeDetails.hasOwnProperty('Recipe Level')){vRecipeLevel = vRecipeDetails["Recipe Level"];}

				var recipeInfoTable = new UWA.createElement('div', {'class': 'info-table', 'onClick':'openProperties(event)' ,id:vRecipeId ,html: '<table><tr><td colspan="2"><h4>Process Name</h4>'+vRecipeDetails["Title"]+'</td><td><h4>Process Revision</h4>'+vRecipeDetails["Revision"]+'</td><td colspan="2"><h4>Revision Comment</h4>'+vRecipeDetails["Revision Comment"]+'</td><td><h4>Maturity State</h4>'+vRecipeDetails["Maturity State"]+'</td></tr><tr><td><h4>Process Creation date</h4>'+vCreationDate+'</td><td><h4>Report generation date</h4>'+date+'</td><td><h4>Report Producer</h4>'+vRecipeDetails["Owner"]+'</td><td><h4>Recipe Type</h4>'+ vRecipeType +'</td><td><h4>Recipe Usage</h4>'+ vRecipeUsage +'</td><td><h4>Recipe Level</h4>'+ vRecipeLevel +'</td></tr></table>'});
				
				var newLineDiv = new UWA.createElement('div', {html: '&nbsp;'}).inject(widget.body);
				recipeInfoTable.inject(widget.body);
				var newLineDiv = new UWA.createElement('div', {html: '&nbsp;'}).inject(widget.body);
				var mainContentDiv = new UWA.createElement('div', {'class':'MainContent'}).inject(widget.body);

				var recipeHeaders = new UWA.createElement('div', {'class':'recipeHeader', styles:{'overflow':'hidden','position':'-webkit-sticky','position':'sticky','top':'0'}});
				
				recipeHeaders.setContent([{tag:'div','class':'divTable',html:[{tag:'div','class':'divTableRow',html:[{tag:'div','class':'divTableContent  divTableCell',html:'Step</br>(Workplan System)'},{tag:'div','class':'divTableCell'},{tag:'div','class':'divTable',html:[{tag:'div','class':'divTableRow',html:[{tag:'div','class':'divTableCell sep'},{tag:'div','class':'divTableContent  divTableCell',html:'<span class="caret caret-down" onclick="toggleGlobalExpandGenOP(this);">Operation<br>(Header Operation)</span>'},{tag:'div','class':'divTableCell'},{tag:'div','class':'divTable',html:[{tag:'div','class':'divTableRow',html:[{tag:'div','class':'divTableCell sep'},{tag:'div','class':'divTableContent  divTableCell',html:'<span class="caret caret-down" onclick="toggleGlobalExpandGenOP(this);">Task<br>(General Operation)</span>'},{tag:'div','class':'divTableCell'},{tag:'div','class':'divTable',html:[{tag:'div','class':'divTableRow',html:[{tag:'div','class':'divTableCell sep'},{tag:'div','class':'divTableContent  divTableCell',html:'<span class="caret caret-down" onclick="toggleGlobalExpandParameter(this);">Parameters<br>(Process & Equipment)</span>'},{tag:'div','class':'divTableCell'},{tag:'div','class':'divTable',html:[{tag:'div','class':'divTableRow',html:[{tag:'div','class':'divTableCell sep'},{tag:'div','class':'divTableContent  divTableCell',html:'<span class="caret caret-down" onclick="toggleGlobalExpandEquipment(this);">Equipments<br>(Primary & Secondary)</span>'},{tag:'div','class':'divTableCell'},{tag:'div','class':'divTable',html:[{tag:'div','class':'divTableRow',html:[{tag:'div','class':'divTableCell sep'},{tag:'div','class':'divTableContent  divTableCell',html:'<span class="caret caret-down" onclick="toggleGlobalExpandMaterial(this);">Materials</span>'}]}]}]}]}]}]}]}]}]}]}]}]}]);
				recipeHeaders.inject(mainContentDiv);
				var newLineDiv = new UWA.createElement('div', {html: '&nbsp;'}).inject(widget.body);
				var vProcessExpandURI = v3DSpaceUrl + "/resources/v1/modeler/dsprcs/dsprcs:MfgProcess/";
				var vWPLObjList = {};
				var vGetWPLDetailsURI = vProcessExpandURI + vRecipeId + "/expand";
				
				var vDimensionURL = v3DSpaceUrl + '/resources/dictionary/dimensions'
				WAFData.authenticatedRequest(vDimensionURL,
				{
					method: 'GET',type: 'json',	headers: {'Accept': 'application/json','Content-Type': 'application/json','Accept-Language': widget.lang,'SecurityContext': vSecurityContext},timeout: 1000 * 60 * 15,
					onComplete: async function (dimensionData)
					{
						widget.setValue("Dimensions", dimensionData.results);
					}
				});
				
				WAFData.authenticatedRequest(vGetWPLDetailsURI,
				{
					method: 'POST',type: 'json',data: '{"expandDepth":4,"withPath":false}',	headers: {'Accept': 'application/json','Content-Type': 'application/json','Accept-Language': widget.lang,'SecurityContext': vSecurityContext},timeout: 1000 * 60 * 15,
					onComplete: async function (hwpl_wplData)
					{
						var vHWPL_WPLObjList = ((hwpl_wplData.member));
						var vContentTable = new UWA.createElement('div', {'class':'content'});
						vContentTable.inject(mainContentDiv);
						var vWPLTable = new UWA.createElement('div', {'class':'divTable'}).inject(vContentTable);
						for(var wpl=1;wpl<vHWPL_WPLObjList.length;wpl++)
						{
							document.getElementById("loader").style.display = 'block';
							var vWPLDetails = vHWPL_WPLObjList[wpl];
								if(vWPLDetails.type == 'DELLmiWorkPlanSystemReference')
								{
									var vWPLName = vWPLDetails.title;
									var vWPLId = vWPLDetails.id;
									var vDivTableWPLRow = new UWA.createElement('div', {'class':'divTableRow WPL', title:vWPLName}).inject(vWPLTable);
									var vdivTableWPLCell = new UWA.createElement('div', {'class':'divTableCell label contentPlaceholder wpl', title:vWPLName,'onClick':'openProperties(event)', id:vWPLId, html:'<strong>'+vWPLName+'</strong>'}).inject(vDivTableWPLRow);
									var vWPLChild = new UWA.createElement('div',{'class':'divTableCell right'}).inject(vDivTableWPLRow);
									
									
									var vWPLResPrimURI = v3DSpaceUrl+'/resources/v1/modeler/dsprcs/dsprcs:MfgProcess/'+vWPLId+'/dsprcs:PrimaryCapableResource?$fields=dsprcs:program.getPrimaryCapableResource';
									
									var vWPLParamTable = new UWA.createElement('div', {'class':'divTable'}).inject(vWPLChild);
									var vWPLEQTable = new UWA.createElement('div', {'class':'divTable'}).inject(vWPLChild);
									var vWPLMATTable = new UWA.createElement('div', {'class':'divTable'}).inject(vWPLChild);
									var vWPLHOPTable = new UWA.createElement('div', {'class':'divTable'}).inject(vWPLChild)
									var vConnectedPrimResources = await loadResourceForProcess(WAFData, vWPLResPrimURI, vSecurityContext, vWPLEQTable, v3DSpaceUrl, 'Workplan', 0, vWPLId);
									var vConnectedSecResources = await loadSecResourceForProcess(WAFData, vSecurityContext, vWPLEQTable, v3DSpaceUrl, vCSRFToken, vWPLId, vWPLEQTable);

									var vConnectedResources = [];
									if(vConnectedPrimResources!= undefined && vConnectedPrimResources.length>0)
									{
										if(vConnectedSecResources!= undefined && vConnectedSecResources.length>0)
										{
											vConnectedResources = vConnectedPrimResources.concat(vConnectedSecResources);
										}
										else
										{
											vConnectedResources = vConnectedPrimResources;
										}
									}
									for (const vResource of vConnectedResources)
									{
										getAssociatedResourceParamList(WAFData, vSecurityContext, v3DSpaceUrl, vResource);
									}
									
									loadMaterialDataForProcessWPL(wpl, vHWPL_WPLObjList, vWPLMATTable, vSecurityContext, v3DSpaceUrl, vCSRFToken, WAFData, vWPLId, 0);
									loadParametersForProcessWPL(WAFData, vSecurityContext, vWPLEQTable, v3DSpaceUrl, vCSRFToken, vWPLId, vWPLParamTable);
									var vWPLMatInfo = await getMaterailInfomationforWPLChild(vWPLId, WAFData, vSecurityContext, v3DSpaceUrl);
									loadHOPforWPL(wpl, vHWPL_WPLObjList, vWPLHOPTable, vSecurityContext, v3DSpaceUrl, vCSRFToken, WAFData, vWPLId, vWPLMatInfo);
									{
										var newLineDiv = new UWA.createElement('div', {'class':'WPLLine', html:'&nbsp;'}).inject(vWPLTable);
									}  
								}
								if(wpl == vHWPL_WPLObjList.length-1)
								{
									document.getElementById("loader").style.display = 'none';
								}
						}
					},
					onFailure: function (faildata) 
					{
						console.log(faildata);
					}
				});
			},
			onFailure: function (faildata) 
			{
				console.log(faildata);
			}
		});
    })
}

async function getAssociatedResourceParamList(WAFData, vSecurityContext, v3DSpaceUrl,vResid)
{
	return new Promise((resolve,reject)=>{
	var vResExpandURI = v3DSpaceUrl+'/resources/v1/modeler/dsrsc/dsrsc:Resource/'+vResid+'/dsrsc:ApplicableResourceParamList';
	document.getElementById("loader").style.display = 'block';
	WAFData.authenticatedRequest(vResExpandURI,
	{
		method: 'GET',type: 'json', headers: {'Accept': 'application/json','Content-Type': 'application/json','Accept-Language': widget.lang,'SecurityContext': vSecurityContext},timeout: 1000 * 60 * 15,
		onComplete: async function (ResParamListData)
		{
			if(ResParamListData.hasOwnProperty('member'))
			{
				var vResParamListMember = (ResParamListData.member)[0]
				if(vResParamListMember.hasOwnProperty('applicableResourceParamList'))
				{
					if(vResParamListMember.applicableResourceParamList.length>0)
					{
						for await(const resParamList of vResParamListMember.applicableResourceParamList)
						{
							var vObjCount = 0;
							do
							{
								vObjCount = await getAssociatedResourceParams(WAFData, vSecurityContext, v3DSpaceUrl, resParamList.identifier, vObjCount);
							}
							while(vObjCount == 10);
						}
						resolve();
					}
					else
					{
						resolve();
					}
					document.getElementById("loader").style.display = 'none';
				}
				else
				{
					resolve();
					document.getElementById("loader").style.display = 'none';
				}
			}
		},
		onFailure: function (faildata) 
		{
			console.log(faildata);
			document.getElementById("loader").style.display = 'none';
		}
	});
	});
}
async function getAssociatedResourceParams(WAFData, vSecurityContext, v3DSpaceUrl, vResourceParamListID, vCount)
{
	return new Promise((resolve,reject)=>{
	var vResParamListExpandURI = v3DSpaceUrl+'/resources/v1/modeler/dsrsc/dsrsc:ResourceParameterList/'+vResourceParamListID+'/dsrsc:ResourceParameter?$skip='+vCount;
	document.getElementById("loader").style.display = 'block';
	WAFData.authenticatedRequest(vResParamListExpandURI,
	{
		method: 'GET',type: 'json', headers: {'Accept': 'application/json','Content-Type': 'application/json','Accept-Language': widget.lang,'SecurityContext': vSecurityContext},timeout: 1000 * 60 * 15,
		onComplete: async function (resParamData)
		{
			if(resParamData.hasOwnProperty('member'))
			{
				var vResourceParams = widget.getValue("ResourceParamaters");
				if(vResourceParams == undefined || vResourceParams.length == 0)
				{
					vResourceParams = resParamData.member;
				}
				else
				{
					for(const vRSCParam of resParamData.member)
					{
						if((vResourceParams.findIndex(item => item.id === vRSCParam.id) == -1))
						{
							vResourceParams.push(vRSCParam);
						}
					}
				}
				widget.setValue("ResourceParamaters", vResourceParams);
				document.getElementById("loader").style.display = 'none';
				resolve(resParamData.totalItems);
			}
			else
			{
				resolve(0);
				document.getElementById("loader").style.display = 'none';
			}
		},
		onFailure: function (faildata) 
		{
			console.log(faildata);
			resolve();
			document.getElementById("loader").style.display = 'none';
		}
	});
	});
}

async function getMaterailInfomationforWPLChild(vWPLId, WAFData, vSecurityContext, v3DSpaceUrl)
{
	return new Promise((resolve,reject)=>{
	var vWPLMatURI = v3DSpaceUrl+'/cvservlet/progressiveexpand/v2?output_format=cvjson&xrequestedwith=xmlhttprequest';
	document.getElementById("loader").style.display = 'block';
	WAFData.authenticatedRequest(vWPLMatURI,
	{
		method: 'POST',type: 'json',	data: '{"batch":{"expands":[{"root":{"physical_id":"'+vWPLId+'"},"filter":{"all":1},"graph":{"descending_condition_relation":{"uql":"(flattenedtaxonomies:reltypes/VPLMrel_47_PLMConnection_47_V_Owner)"}}}]},"outputs":{"select_object":["ds6w:label","physicalid","type","interface","pathsr"]}}',headers: {'Accept': 'application/json','Content-Type': 'application/json','Accept-Language': widget.lang,'SecurityContext': vSecurityContext},timeout: 1000 * 60 * 15,
		onComplete: async function (wpl_matData)
		{
			resolve(wpl_matData.results);
			document.getElementById("loader").style.display = 'none';
		},
		onFailure: function (faildata) 
		{
			console.log(faildata);
			document.getElementById("loader").style.display = 'none';
		}
	});
	});
}


async function loadParametersForProcessWPL(WAFData, vSecurityContext, vWPLEQTable, v3DSpaceUrl, vCSRFToken, vWPLId, vWPLParamTable)
{
	var  vProgExpand = v3DSpaceUrl + '/cvservlet/progressiveexpand/v2?output_format=cvjson&xrequestedwith=xmlhttprequest';
	document.getElementById("loader").style.display = 'block';
	WAFData.authenticatedRequest(vProgExpand,
	{
		method: 'POST',type: 'json',data: '{"batch":{"expands":[{"root":{"physical_id":"'+vWPLId+'"},"filter":{"prefix_filter":{"prefix_path":[{"physical_id_path":["'+vWPLId+'"]}]}},"graph":{"descending_condition_relation":{"uql":"(flattenedtaxonomies:reltypes/PLMCoreInstance)"}}}]},"outputs":{"format":"entity_relation_occurrence","select_object":["ds6w:label","physicalid","type","interface","pathsr"],"select_relation":["physicalid","type","interface","from.physicalid","to.physicalid","pathsr"]}}', headers: {'Accept': 'application/json','Content-Type': 'application/json','Accept-Language': widget.lang,'SecurityContext': vSecurityContext,'ENO_CSRF_TOKEN': vCSRFToken},timeout: 1000 * 60 * 15,
		onComplete: async function (wpl_Data)
		{
			for(var i=1;i<(wpl_Data.results).length;i++)
			{
				document.getElementById("loader").style.display = 'block';
				var vData = (wpl_Data.results)[i];
				if(vData.type == "DELWkiDataCollectPlanInstance" && vData.from == vWPLId)
				{
					await loadDataCollectPlanforWPL(vWPLParamTable, vSecurityContext, v3DSpaceUrl, vCSRFToken, WAFData, vData.to);
				}
				if(vData.type == "DELResourceParameterPlanInstance" && vData.from == vWPLId)
				{
					getConnectedResourceParameterRows(vData.to, vWPLParamTable, vSecurityContext, v3DSpaceUrl, vCSRFToken, WAFData, 'wpl', 0);
				}
				document.getElementById("loader").style.display = 'none';
			}
		},
		onFailure: function (faildata) 
		{
			console.log(faildata);
			document.getElementById("loader").style.display = 'none';
		}
	});
}
async function loadDataCollectPlanforWPL(vParamTable, vSecurityContext, v3DSpaceUrl, vCSRFToken, WAFData, vDCPId)
{
	return new Promise((resolve,reject)=>{
	var vGetDCPRowsDetailsURI 	= v3DSpaceUrl+'/resources/v1/modeler/dsprcs/dsprcs:DataCollectPlan/'+vDCPId+'/dsprcs:DataCollectRow?$fields=dsmveno:CustomerAttributes&$mask=dsprcs:DataCollectRowMask.Default&xrequestedwith=xmlhttprequest';
	document.getElementById("loader").style.display = 'block';
	WAFData.authenticatedRequest(vGetDCPRowsDetailsURI,
	{
		method: 'GET',type: 'json',headers: {'Accept': 'application/json','Content-Type': 'application/json','Accept-Language': widget.lang,'SecurityContext': vSecurityContext,'ENO_CSRF_TOKEN': vCSRFToken},timeout: 1000 * 60 * 15,
		onComplete: async function (dcp_paramData)
		{
			if(dcp_paramData.hasOwnProperty('member'))
			{
				var vParamRows = dcp_paramData.member;
				for(var k=0;k<vParamRows.length;k++)
				{
					document.getElementById("loader").style.display = 'block';
					var vParamDetails = vParamRows[k];	
					var vDivTableParamRow = new UWA.createElement('div', {'class':'divTableRow', html:[{tag:'div','class':'divTableCell wplparamspace'},{'class':'divTableCell sep',html:'&larr;'}]}).inject(vParamTable);					
					var vdivTableParamCell = new UWA.createElement('div', {'class':'divTableCell label contentPlaceholder param'}).inject(vDivTableParamRow);
					var vDivParamCaret = new UWA.createElement('div', {'class':'caret caret-down', style:{'word-break':'break-all'}}).inject(vdivTableParamCell);
					var vDivParamSpan = new UWA.createElement('span',{'onClick':'toggleExpand(this)',html:'<strong>'+vParamDetails['label']+'(Process)</strong>'}).inject(vDivParamCaret);
					var vNestedCell = "";
					
					if(widget.getValue("Display_Option") === "Details_Mode")
					{
						vNestedCell = new UWA.createElement('div',{'class':'parameter nested active', 'onclick':'openProperties(event)',id:vParamDetails.id}).inject(vDivParamCaret);
					}
					else
					{
						vNestedCell = new UWA.createElement('div',{'class':'parameter nested', 'onclick':'openProperties(event)',id:vParamDetails.id}).inject(vDivParamCaret);
					}
					
					if(vParamDetails.dcType == 1)
					{
						var vMagnitude = vParamDetails.maxValue.magnitude;
						var vUnitDisplay = vParamDetails.maxValue.displayUnit;	
						var vDimensions = widget.getValue("Dimensions");
						let vDimindex = vDimensions.findIndex(item => item.Name === vMagnitude);
						let vUnitDimension = (vDimensions[vDimindex])["Units"];
						let vUnitindex = vUnitDimension.findIndex(item => item.Name === vUnitDisplay);
						let vUnitLabel = vUnitDimension[vUnitindex].NLSName;
					
						//Failure Minimum Value
						if(vParamDetails.hasOwnProperty('eofMinLimit'))
						{
							if(vParamDetails.eofMinLimit != 'NotSet')
							{
								var vValue = '';
								if(vParamDetails.hasOwnProperty('eofMinValue'))
								{
									vValue = vParamDetails.eofMinValue.inputValue;
									if(vValue == '' || vValue == 'undefined');
									{
										vValue = await getConvertedValue(vSecurityContext, v3DSpaceUrl, vCSRFToken, WAFData, vParamDetails.eofMinValue);
									}
								}
								new UWA.createElement('div', {'class':'divParamValueRow',html:[{tag:'div','class':'paramlabel',html:'Failure Min'},{tag:'div','class':'paramvalue',html:vValue +'  '+ vUnitLabel}]}).inject(vNestedCell);
							}
							else
							{
								new UWA.createElement('div', {'class':'divParamValueRow',html:[{tag:'div','class':'paramlabel',html:'Failure Min'},{tag:'div','class':'paramvalue',html:''}]}).inject(vNestedCell);
							}
						}
						
						//Acceptable Minimum Value
						if(vParamDetails.hasOwnProperty('minLimit'))
						{
							if(vParamDetails.minLimit != 'NotSet')
							{
								var vValue = '';
								if(vParamDetails.hasOwnProperty('minValue'))
								{
									vValue = vParamDetails.minValue.inputValue;
									if(vValue == '' || vValue == 'undefined');
									{
										vValue = await getConvertedValue(vSecurityContext, v3DSpaceUrl, vCSRFToken, WAFData, vParamDetails.minValue);
									}
								}
								new UWA.createElement('div', {'class':'divParamValueRow',html:[{tag:'div','class':'paramlabel',html:'Acceptable Min'},{tag:'div','class':'paramvalue',html:vValue +'  '+ vUnitLabel}]}).inject(vNestedCell);
							}
							else
							{
								new UWA.createElement('div', {'class':'divParamValueRow',html:[{tag:'div','class':'paramlabel',html:'Acceptable Min'},{tag:'div','class':'paramvalue',html:''}]}).inject(vNestedCell);
							}
						}
						
						//Normal Minimum Value
						if(vParamDetails.hasOwnProperty('controlMinLimit'))
						{
							if(vParamDetails.controlMinLimit != 'NotSet')
							{
								var vValue = '';
								if(vParamDetails.hasOwnProperty('controlMinValue'))
								{
									vValue = vParamDetails.controlMinValue.inputValue;
									if(vValue == '' || vValue == 'undefined');
									{
										vValue = await getConvertedValue(vSecurityContext, v3DSpaceUrl, vCSRFToken, WAFData, vParamDetails.controlMinValue);
									}
								}
								new UWA.createElement('div', {'class':'divParamValueRow',html:[{tag:'div','class':'paramlabel',html:'Normal Min'},{tag:'div','class':'paramvalue',html:vValue +'  '+ vUnitLabel}]}).inject(vNestedCell);
							}
							else
							{
								new UWA.createElement('div', {'class':'divParamValueRow',html:[{tag:'div','class':'paramlabel',html:'Normal Min'},{tag:'div','class':'paramvalue',html:''}]}).inject(vNestedCell);
							}
						}
						
						//Nominal Value
						if(vParamDetails.hasOwnProperty('nominalValue'))
						{
							var vValue = '';
							if(vParamDetails.isValueSet != false)
							{
								vValue = vParamDetails.nominalValue.inputValue;
								if(vValue == '' || vValue == 'undefined');
								{
									vValue = await getConvertedValue(vSecurityContext, v3DSpaceUrl, vCSRFToken, WAFData, vParamDetails.nominalValue);
								}
							}
							new UWA.createElement('div', {'class':'divParamValueRow',html:[{tag:'div','class':'paramlabel',html:'Value(s)'},{tag:'div','class':'paramvalue',html:vValue +'  '+ vUnitLabel}]}).inject(vNestedCell);
						}
						
						//Normal Maximum Value
						if(vParamDetails.hasOwnProperty('controlMaxLimit'))
						{
							if(vParamDetails.controlMaxLimit != 'NotSet')
							{
								var vValue = '';
								if(vParamDetails.hasOwnProperty('controlMaxValue'))
								{
									vValue = vParamDetails.controlMaxValue.inputValue;
									if(vValue == '' || vValue == 'undefined');
									{
										vValue = await getConvertedValue(vSecurityContext, v3DSpaceUrl, vCSRFToken, WAFData, vParamDetails.controlMaxValue);
									}
								}
								new UWA.createElement('div', {'class':'divParamValueRow',html:[{tag:'div','class':'paramlabel',html:'Normal Max'},{tag:'div','class':'paramvalue',html:vValue +'  '+ vUnitLabel}]}).inject(vNestedCell);
							}
							else
							{
								new UWA.createElement('div', {'class':'divParamValueRow',html:[{tag:'div','class':'paramlabel',html:'Normal Max'},{tag:'div','class':'paramvalue',html:''}]}).inject(vNestedCell);
							}
						}
						
						//Acceptable Maximum Value
						if(vParamDetails.hasOwnProperty('maxLimit'))
						{
							if(vParamDetails.maxLimit != 'NotSet')
							{
								var vValue = '';
								if(vParamDetails.hasOwnProperty('maxValue'))
								{
									vValue = vParamDetails.maxValue.inputValue;
									if(vValue == '' || vValue == 'undefined');
									{
										vValue = await getConvertedValue(vSecurityContext, v3DSpaceUrl, vCSRFToken, WAFData, vParamDetails.maxValue);
									}
								}
								new UWA.createElement('div', {'class':'divParamValueRow',html:[{tag:'div','class':'paramlabel',html:'Acceptable Max'},{tag:'div','class':'paramvalue',html:vValue +'  '+ vUnitLabel}]}).inject(vNestedCell);
							}
							else
							{
								new UWA.createElement('div', {'class':'divParamValueRow',html:[{tag:'div','class':'paramlabel',html:'Acceptable Max'},{tag:'div','class':'paramvalue',html:''}]}).inject(vNestedCell);
							}
						}
						
						//Failure Maximum Value
						if(vParamDetails.hasOwnProperty('eofMaxLimit'))
						{
							if(vParamDetails.eofMaxLimit != 'NotSet')
							{
								var vValue = '';
								if(vParamDetails.hasOwnProperty('eofMaxValue'))
								{
									vValue = vParamDetails.eofMaxValue.inputValue;
									if(vValue == '' || vValue == 'undefined');
									{
										vValue = await getConvertedValue(vSecurityContext, v3DSpaceUrl, vCSRFToken, WAFData, vParamDetails.eofMaxValue);
									}
								}
								new UWA.createElement('div', {'class':'divParamValueRow',html:[{tag:'div','class':'paramlabel',html:'Failure Max'},{tag:'div','class':'paramvalue',html:vValue +'  '+ vUnitLabel}]}).inject(vNestedCell);
							}
							else
							{
								new UWA.createElement('div', {'class':'divParamValueRow',html:[{tag:'div','class':'paramlabel',html:'Failure Max'},{tag:'div','class':'paramvalue',html:''}]}).inject(vNestedCell);
							}
						}
					}
								
					
					if(vParamDetails.dcType == 2)
					{
						//Acceptable Minimum Value
						if(vParamDetails.hasOwnProperty('minLimit'))
						{
							if(vParamDetails.minLimit != 'NotSet')
							{
								var vValue = '';
								if(vParamDetails.hasOwnProperty('minValue'))
								{
									vValue = vParamDetails.minValue.value;
								}
								new UWA.createElement('div', {'class':'divParamValueRow',html:[{tag:'div','class':'paramlabel',html:'Acceptable Min'},{tag:'div','class':'paramvalue',html:vValue}]}).inject(vNestedCell);
							}
							else
							{
								new UWA.createElement('div', {'class':'divParamValueRow',html:[{tag:'div','class':'paramlabel',html:'Acceptable Min'},{tag:'div','class':'paramvalue',html:''}]}).inject(vNestedCell);
							}
						}
						
						//Normal Minimum Value
						if(vParamDetails.hasOwnProperty('controlMinLimit'))
						{
							if(vParamDetails.controlMinLimit != 'NotSet')
							{
								var vValue = '';
								if(vParamDetails.hasOwnProperty('controlMinValue'))
								{
									vValue = vParamDetails.controlMinValue.value;
								}
								new UWA.createElement('div', {'class':'divParamValueRow',html:[{tag:'div','class':'paramlabel',html:'Normal Min'},{tag:'div','class':'paramvalue',html:vValue}]}).inject(vNestedCell);
							}
							else
							{
								new UWA.createElement('div', {'class':'divParamValueRow',html:[{tag:'div','class':'paramlabel',html:'Normal Min'},{tag:'div','class':'paramvalue',html:''}]}).inject(vNestedCell);
							}
						}
						
						//Possible Values
						if(vParamDetails.hasOwnProperty('possibleValues'))
						{
							var vValue = '';
							if(vParamDetails.isValueSet != false)
							{
								vValue = (vParamDetails.possibleValues).toString();
							}
							new UWA.createElement('div', {'class':'divParamValueRow',html:[{tag:'div','class':'paramlabel',html:'Value(s)'},{tag:'div','class':'paramvalue',html:vValue}]}).inject(vNestedCell);
						}
						
						//Normal Maximum Value
						if(vParamDetails.hasOwnProperty('controlMaxLimit'))
						{
							if(vParamDetails.controlMaxLimit != 'NotSet')
							{
								var vValue = '';
								if(vParamDetails.hasOwnProperty('controlMaxValue'))
								{
									vValue = vParamDetails.controlMaxValue.value;
								}
								new UWA.createElement('div', {'class':'divParamValueRow',html:[{tag:'div','class':'paramlabel',html:'Normal Max'},{tag:'div','class':'paramvalue',html:vValue}]}).inject(vNestedCell);
							}
							else
							{
								new UWA.createElement('div', {'class':'divParamValueRow',html:[{tag:'div','class':'paramlabel',html:'Normal Max'},{tag:'div','class':'paramvalue',html:''}]}).inject(vNestedCell);
							}
						}
						
						//Acceptable Maximum Value
						if(vParamDetails.hasOwnProperty('maxLimit'))
						{
							if(vParamDetails.maxLimit != 'NotSet')
							{
								var vValue = '';
								if(vParamDetails.hasOwnProperty('maxValue'))
								{
									vValue = vParamDetails.maxValue.value;
								}
								new UWA.createElement('div', {'class':'divParamValueRow',html:[{tag:'div','class':'paramlabel',html:'Acceptable Max'},{tag:'div','class':'paramvalue',html:vValue}]}).inject(vNestedCell);
							}
							else
							{
								new UWA.createElement('div', {'class':'divParamValueRow',html:[{tag:'div','class':'paramlabel',html:'Acceptable Max'},{tag:'div','class':'paramvalue',html:''}]}).inject(vNestedCell);
							}
						}
					}
					
					if(vParamDetails.dcType == 3 || vParamDetails.dcType == 4)
					{
						//Possible Values
						if(vParamDetails.hasOwnProperty('possibleValues'))
						{
							var vValue = '';
							if(vParamDetails.isValueSet != false)
							{
								vValue = (vParamDetails.possibleValues).toString();
							}
							new UWA.createElement('div', {'class':'divParamValueRow',html:[{tag:'div','class':'paramlabel',html:'Value(s)'},{tag:'div','class':'paramvalue',html:vValue}]}).inject(vNestedCell);
						}
					}
					if(vParamDetails.dcType == 5)
					{
						//Possible Values
						var vValue = '';
						if(vParamDetails.hasOwnProperty('timestampFormat'))
						{
							vValue = (vParamDetails.timestampFormat).toString();										
						}
						new UWA.createElement('div', {'class':'divParamValueRow',html:[{tag:'div','class':'paramlabel',html:'Value'},{tag:'div','class':'paramvalue',html:vValue}]}).inject(vNestedCell);
					}
					
					if(vParamDetails.hasOwnProperty('customerAttributes'))
					{
						if((vParamDetails.customerAttributes).hasOwnProperty('SNFDataCollectCnxExtension'))
						{
							if(vParamDetails.customerAttributes.SNFDataCollectCnxExtension.hasOwnProperty('SNFCriticality'))
							{
								var vCriticality = vParamDetails.customerAttributes.SNFDataCollectCnxExtension.SNFCriticality;
								var vpayLoad = '[{"type":"SNFDataCollectCnxExtension","attributes":["SNFCriticality"]}]';
								var vProcessCriticality = await getCriticalityLabel(vSecurityContext, v3DSpaceUrl, vCSRFToken, WAFData,vpayLoad, vCriticality, "SNFCriticality");
								new UWA.createElement('div', {'class':'divParamValueRow',html:[{tag:'div','class':'paramlabel',html:'Process Criticality'},{tag:'div','class':'paramvalue',html:vProcessCriticality}]}).inject(vNestedCell);
							}
							if(vParamDetails.customerAttributes.SNFDataCollectCnxExtension.hasOwnProperty('SNFMaterialCriticatily'))
							{
								var vCriticality = vParamDetails.customerAttributes.SNFDataCollectCnxExtension.SNFMaterialCriticatily;
								var vpayLoad = '[{"type":"SNFDataCollectCnxExtension","attributes":["SNFMaterialCriticatily"]}]';
								var vProcessCriticality = await getCriticalityLabel(vSecurityContext, v3DSpaceUrl, vCSRFToken, WAFData,vpayLoad, vCriticality, "SNFMaterialCriticatily");
								new UWA.createElement('div', {'class':'divParamValueRow',html:[{tag:'div','class':'paramlabel',html:'Material Criticality'},{tag:'div','class':'paramvalue',html:vCriticality}]}).inject(vNestedCell);
							}
						}
						
					}
					new UWA.createElement('div',{'class':'divTableCell right'}).inject(vDivTableParamRow);
					
					new UWA.createElement('div',{'class':'divTableCell right'}).inject(vDivTableParamRow);
					new UWA.createElement('div', {html:'&nbsp;'}).inject(vParamTable);
					
					if(k == vParamRows.length-1)
					{
						resolve();
						document.getElementById("loader").style.display = 'none';
					}
					document.getElementById("loader").style.display = 'none';
				}
			}
			else
			{
				resolve();
				document.getElementById("loader").style.display = 'none';	
			}
		},
		onFailure: function (faildata) 
		{
			console.log(faildata);
			document.getElementById("loader").style.display = 'none';
		}
	});
	});
}
async function loadResourceForProcess(WAFData, vWPLResURI, vSecurityContext, vWPLChild, v3DSpaceUrl, Objtype, resultscount, vObjId)
{
	return new Promise((resolve,reject)=>{
	var vPrimResList = [];
	document.getElementById("loader").style.display = 'block';
	WAFData.authenticatedRequest(vWPLResURI,
	{
		method: 'GET',type: 'json',	headers: {'Accept': 'application/json','Content-Type': 'application/json','Accept-Language': widget.lang,'SecurityContext': vSecurityContext},timeout: 1000 * 60 * 15,
		onComplete: async function (wpl_resData)
		{
			if(wpl_resData.hasOwnProperty('member'))
			{
				var vWPLResList = wpl_resData.member;
				var vWPLResnum = 0;
				while(vWPLResnum<vWPLResList.length)
				{
					document.getElementById("loader").style.display = 'block';
					var vWPLRes = vWPLResList[vWPLResnum];
					if(vWPLRes.hasOwnProperty('resource'))
					{
						var vWPLItemURI = v3DSpaceUrl+((vWPLRes.resource).relativePath);
						var vWPLItemId = (vWPLRes.resource).identifier;
						
						document.getElementById("loader").style.display = 'block';
						WAFData.authenticatedRequest(vWPLItemURI,
						{
							method: 'GET',type: 'json',	headers: {'Accept': 'application/json','Content-Type': 'application/json','Accept-Language': widget.lang,'SecurityContext': vSecurityContext},timeout: 1000 * 60 * 15,
							onComplete: async function (wpl_ResDataInfo)
							{
								if(wpl_ResDataInfo.hasOwnProperty('member'))
								{
									var vResTitle = (wpl_ResDataInfo.member[0]).title;
									var vResid = (wpl_ResDataInfo.member[0]).id;
									var vDivTableWPLResRow;
									if(Objtype == 'Workplan')
									{
										vDivTableWPLResRow = new UWA.createElement('div', {'class':'divTableRow', html:[{tag:'div','class':'divTableCell resourcespace'},{tag:'div','class':'divTableCell sep',html:'&larr;'}]}).inject(vWPLChild);
									}
									else if(Objtype == 'HeaderOperation')
									{
										vDivTableWPLResRow = new UWA.createElement('div', {'class':'divTableRow', html:[{tag:'div','class':'divTableCell hopresourcespace'},{tag:'div','class':'divTableCell sep',html:'&larr;'}]}).inject(vWPLChild);
									}
									else if(Objtype == 'GeneralOperation')
									{
										vDivTableWPLResRow = new UWA.createElement('div', {'class':'divTableRow', html:[{tag:'div','class':'divTableCell gopresourcespace'},{tag:'div','class':'divTableCell sep',html:'&larr;'}]}).inject(vWPLChild);
									}
									if(widget.getValue("Display_Option") === "Details_Mode")
									{
										var vClassificationInfo = await getClassificationValue(WAFData,v3DSpaceUrl,vSecurityContext,vResid);
										var vdivTableWPLItemCell = new UWA.createElement('div', {'class':'divTableCell label contentPlaceholder resource', html:[{tag:'div','class':'caret caret-down',html:[{tag:'span','onClick':'toggleExpand(this)',html:'<strong>'+vResTitle+' (Primary)</strong>'},{tag:'div','class':'equipment nested active',id:vResid, 'onClick':'openProperties(event)',html:[{tag:'div', 'class':'divParamValueRow',html:[{tag:'div','class':'paramlabel',html:'Classification'},{tag:'div','class':'paramvalue',html:vClassificationInfo}]}]}]}]}).inject(vDivTableWPLResRow);
									}
									else
									{	var vClassificationInfo = await getClassificationValue(WAFData,v3DSpaceUrl,vSecurityContext,vResid);
										var vdivTableWPLItemCell = new UWA.createElement('div', {'class':'divTableCell label contentPlaceholder resource', html:[{tag:'div','class':'caret caret-down',html:[{tag:'span','onClick':'toggleExpand(this)',html:'<strong>'+vResTitle+' (Primary)</strong>'},{tag:'div','class':'equipment nested',id:vResid, 'onClick':'openProperties(event)',html:[{tag:'div', 'class':'divParamValueRow',html:[{tag:'div','class':'paramlabel',html:'Classification'},{tag:'div','class':'paramvalue',html:vClassificationInfo}]}]}]}]}).inject(vDivTableWPLResRow);										
									}
									var vResChild = new UWA.createElement('div',{'class':'divTableCell sep'}).inject(vDivTableWPLResRow);
									var vResChild = new UWA.createElement('div',{'class':'divTableCell right'}).inject(vDivTableWPLResRow);
									{
										var newLineDiv = new UWA.createElement('div', {html:'&nbsp;'}).inject(vWPLChild);
									}
								}
								document.getElementById("loader").style.display = 'none';
							},
							onFailure: function (faildata) 
							{
								console.log(faildata);
								document.getElementById("loader").style.display = 'none';
							}
						});
						vPrimResList.push(vWPLItemId);
					}
					vWPLResnum++;
					if(vWPLResList.length == 1 || vWPLResnum == vWPLResList.length-1)
					{
						resolve(vPrimResList);
						document.getElementById("loader").style.display = 'none';
					}
				}

				if(wpl_resData.totalItems == 10)
				{
					resultscount = resultscount + 10;
					var vWPLNewResURI = vWPLResURI + '?$skip=' + resultscount;
					loadResourceForProcess(WAFData, vWPLNewResURI, vSecurityContext, vWPLChild, v3DSpaceUrl, Objtype, resultscount, vObjId);			
				}
				else
				{
					resolve();
					document.getElementById("loader").style.display = 'none';
				}
			}
			else
			{
				resolve();
				document.getElementById("loader").style.display = 'none';				
			}
		},
		onFailure: function (faildata) 
		{
			console.log(faildata);
			document.getElementById("loader").style.display = 'none';
		}
	});
	});
	
}
function loadSecResourceForProcess(WAFData, vSecurityContext, vWPLChild, v3DSpaceUrl,vCSRFToken, vWPLId)
{
	return new Promise((resolve,reject)=>{
	var vSecItemsList = [];
	vWPLResURI = v3DSpaceUrl +'/cvservlet/progressiveexpand/v2?output_format=cvjson&xrequestedwith=xmlhttprequest';
	document.getElementById("loader").style.display = 'block';
	WAFData.authenticatedRequest(vWPLResURI,
	{
		method: 'POST',type: 'json', data:'{"batch":{"expands":[{"root":{"physical_id":"'+vWPLId+'"},"filter":{"prefix_filter":{"prefix_path":[{"physical_id_path":["'+vWPLId+'"]}]}},"graph":{"descending_condition_relation":{"uql":"((flattenedtaxonomies:reltypes/VPLMrel_47_PLMConnection_47_V_Owner))"}}}]},"outputs":{"select_object":["ds6w:label","physicalid","type","interface","pathsr"]}}', headers: {'Accept': 'application/json','Content-Type': 'application/json','Accept-Language': widget.lang,'SecurityContext': vSecurityContext,'ENO_CSRF_TOKEN': vCSRFToken},timeout: 1000 * 60 * 15,
		onComplete: function (wpl_resData)
		{
			if(wpl_resData.hasOwnProperty('results'))
			{
				var vWPLResList = wpl_resData.results;
				var vWPLResnum = 0;
				while(vWPLResnum<vWPLResList.length)
				{
					document.getElementById("loader").style.display = 'block';
					var vWPLRes = vWPLResList[vWPLResnum];
					if(vWPLRes.type == 'SecondaryCandidateResourceLink')
					{
						var vWPLSecItemLink = (vWPLRes.pathsr).split(" ");
						var vWPLSecItemID = vWPLSecItemLink[6];
						
						vWPLItemURI = v3DSpaceUrl + '/resources/v1/modeler/dsrsc/dsrsc:ResourceItem/'+vWPLSecItemID;
						document.getElementById("loader").style.display = 'block';
						WAFData.authenticatedRequest(vWPLItemURI,
						{
							method: 'GET',type: 'json',	headers: {'Accept': 'application/json','Content-Type': 'application/json','Accept-Language': widget.lang,'SecurityContext': vSecurityContext},timeout: 1000 * 60 * 15,
							onComplete: function (wpl_ResDataInfo)
							{
								if(wpl_ResDataInfo.hasOwnProperty('member'))
								{
									var vResTitle = (wpl_ResDataInfo.member[0]).title;
									var vResid = (wpl_ResDataInfo.member[0]).id;
									
									var vDivTableWPLResRow = new UWA.createElement('div', {'class':'divTableRow', html:[{tag:'div','class':'divTableCell resourcespace'},{tag:'div','class':'divTableCell sep',html:'&larr;'}]}).inject(vWPLChild);
									
									if(widget.getValue("Display_Option") === "Details_Mode")
									{
										var vdivTableWPLItemCell = new UWA.createElement('div', {'class':'divTableCell label contentPlaceholder resource', html:[{tag:'div','class':'caret caret-down',html:[{tag:'span','onClick':'toggleExpand(this)',html:'<strong>'+vResTitle+' (Secondary)</strong>'},{tag:'div','class':'equipment nested active','onClick':'openProperties(event)',id:vResid,html:[{tag:'div', 'class':'divParamValueRow',html:[{tag:'div','class':'paramlabel',html:'Classification'},{tag:'div','class':'paramvalue',html:''}]}]}]}]}).inject(vDivTableWPLResRow);
									}
									else
									{
										var vdivTableWPLItemCell = new UWA.createElement('div', {'class':'divTableCell label contentPlaceholder resource', html:[{tag:'div','class':'caret caret-down',html:[{tag:'span','onClick':'toggleExpand(this)',html:'<strong>'+vResTitle+' (Secondary)</strong>'},{tag:'div','class':'equipment nested','onClick':'openProperties(event)',id:vResid,html:[{tag:'div', 'class':'divParamValueRow',html:[{tag:'div','class':'paramlabel',html:'Classification'},{tag:'div','class':'paramvalue',html:''}]}]}]}]}).inject(vDivTableWPLResRow);
									}
									var vResChild = new UWA.createElement('div',{'class':'divTableCell right'}).inject(vDivTableWPLResRow);
									var newLineDiv = new UWA.createElement('div', {html:'&nbsp;'}).inject(vWPLChild);
								}
								document.getElementById("loader").style.display = 'none';
							},
							onFailure: function (faildata) 
							{
								vWPLItemURI = v3DSpaceUrl + '/resources/v1/modeler/dsrsc/dsrsc:OrganizationalResource/'+vWPLSecItemID;
								document.getElementById("loader").style.display = 'block';
								WAFData.authenticatedRequest(vWPLItemURI,
								{
									method: 'GET',type: 'json',	headers: {'Accept': 'application/json','Content-Type': 'application/json','Accept-Language': widget.lang,'SecurityContext': vSecurityContext},timeout: 1000 * 60 * 15,
									onComplete: function (wpl_ResDataInfo)
									{
										if(wpl_ResDataInfo.hasOwnProperty('member'))
										{
											var vResTitle = (wpl_ResDataInfo.member[0]).title;
											var vResid = (wpl_ResDataInfo.member[0]).id;
											
											var vDivTableWPLResRow = new UWA.createElement('div', {'class':'divTableRow', html:[{tag:'div','class':'divTableCell resourcespace'},{tag:'div','class':'divTableCell sep',html:'&larr;'}]}).inject(vWPLChild);
											
											if(widget.getValue("Display_Option") === "Details_Mode")
											{
												var vdivTableWPLItemCell = new UWA.createElement('div', {'class':'divTableCell label contentPlaceholder resource', html:[{tag:'div','class':'caret caret-down',html:[{tag:'span','onClick':'toggleExpand(this)',html:'<strong>'+vResTitle+' (Secondary)</strong>'},{tag:'div','class':'equipment nested active','onClick':'openProperties(event)',id:vResid,html:[{tag:'div', 'class':'divParamValueRow',html:[{tag:'div','class':'paramlabel',html:'Classification'},{tag:'div','class':'paramvalue',html:''}]}]}]}]}).inject(vDivTableWPLResRow);
											}
											else
											{
												var vdivTableWPLItemCell = new UWA.createElement('div', {'class':'divTableCell label contentPlaceholder resource', html:[{tag:'div','class':'caret caret-down',html:[{tag:'span','onClick':'toggleExpand(this)',html:'<strong>'+vResTitle+' (Secondary)</strong>'},{tag:'div','class':'equipment nested','onClick':'openProperties(event)',id:vResid,html:[{tag:'div', 'class':'divParamValueRow',html:[{tag:'div','class':'paramlabel',html:'Classification'},{tag:'div','class':'paramvalue',html:''}]}]}]}]}).inject(vDivTableWPLResRow);
											}
											var vResChild = new UWA.createElement('div',{'class':'divTableCell right'}).inject(vDivTableWPLResRow);
											var newLineDiv = new UWA.createElement('div', {html:'&nbsp;'}).inject(vWPLChild);
										}
										document.getElementById("loader").style.display = 'none';
									},
									onFailure: function (faildata) 
									{
										resolve();
										console.log(faildata);
										document.getElementById("loader").style.display = 'none';
									}
								});
							}
						});
						vSecItemsList.push(vWPLSecItemID);
					}
					vWPLResnum++;
					if(vWPLResList.length == 1 || vWPLResnum == vWPLResList.length-1)
					{
						document.getElementById("loader").style.display = 'none';
						resolve(vSecItemsList);
					}
				}
			}
		},
		onFailure: function (faildata) 
		{
			resolve();
			console.log(faildata);
			document.getElementById("loader").style.display = 'none';
		}
	});
	});
}
function loadMaterialDataForProcessWPL(wpl, vHWPL_WPLObjList, vWPLChild, vSecurityContext, v3DSpaceUrl, vCSRFToken, WAFData, vWPLId, resultscount)
{
	var vWPLMatURI = v3DSpaceUrl+'/resources/v1/modeler/dsprcs/dsprcs:MfgProcess/'+vWPLId+'/dsprcs:ItemSpecification';
	vWPLMatURI = vWPLMatURI + '?$skip=' + resultscount;
	document.getElementById("loader").style.display = 'block';
	WAFData.authenticatedRequest(vWPLMatURI,
	{
		method: 'GET',type: 'json',	headers: {'Accept': 'application/json','Content-Type': 'application/json','Accept-Language': widget.lang,'SecurityContext': vSecurityContext},timeout: 1000 * 60 * 15,
		onComplete: function (wpl_matData)
		{
			var vWPLItemsList = [];
			if(wpl_matData.hasOwnProperty('member'))
			{
				vWPLItemsList = wpl_matData.member;
			}
			var vWPLItemnum = 0;
			if(vWPLItemsList.length>0)
			{
				while(vWPLItemnum<vWPLItemsList.length)
				{
					document.getElementById("loader").style.display = 'block';
					var vWPLItem = vWPLItemsList[vWPLItemnum];
					if(vWPLItem.hasOwnProperty('itemRef'))
					{
						if((vWPLItem.itemRef).hasOwnProperty('relativePath'))
						{
							var vWPLItemURI = v3DSpaceUrl+((vWPLItem.itemRef).relativePath);
							WAFData.authenticatedRequest(vWPLItemURI,
							{
								method: 'GET',type: 'json',	headers: {'Accept': 'application/json','Content-Type': 'application/json','Accept-Language': widget.lang,'SecurityContext': vSecurityContext},timeout: 1000 * 60 * 15,
								onComplete: function (wpl_matDataInfo)
								{
									if(wpl_matDataInfo.hasOwnProperty('member'))
									{
										var vItemTitle = (wpl_matDataInfo.member[0]).title;
										var vItemid = (wpl_matDataInfo.member[0]).id;
										var vDivTableWPLItemRow = new UWA.createElement('div', {'class':'divTableRow', html:[{tag:'div','class':'divTableCell materialspace'},{tag:'div','class':'divTableCell sep',html:'&larr;'}]}).inject(vWPLChild);
										
										if(widget.getValue("Display_Option") === "Details_Mode")
										{
											var vdivTableWPLItemCell = new UWA.createElement('div', {'class':'divTableCell label contentPlaceholder material', html:[{tag:'div','class':'caret caret-down',html:[{tag:'span','onClick':'toggleExpand(this)',html:'<strong>'+vItemTitle+'</strong>'},{tag:'div','class':'materialitems nested active',id:vItemid, 'onClick':'openProperties(event)'}]}]}).inject(vDivTableWPLItemRow);
										}
										else
										{
											var vdivTableWPLItemCell = new UWA.createElement('div', {'class':'divTableCell label contentPlaceholder material', html:[{tag:'div','class':'caret caret-down',html:[{tag:'span','onClick':'toggleExpand(this)',html:'<strong>'+vItemTitle+'</strong>'},{tag:'div','class':'materialitems nested',id:vItemid, 'onClick':'openProperties(event)'}]}]}).inject(vDivTableWPLItemRow);
										}
										var newLineDiv = new UWA.createElement('div', {html:'&nbsp;'}).inject(vWPLChild);
									}
								},
								onFailure: function (faildata) 
								{
									console.log(faildata);
								}
							});
						}
					}
					vWPLItemnum++;
					if(vWPLItemnum == vWPLItemsList.length-1)
					{
						document.getElementById("loader").style.display = 'none';
					}
					document.getElementById("loader").style.display = 'block';
				}
			}
			if(wpl_matData.totalItems == 10)
			{
				resultscount = resultscount + 10;
				loadMaterialDataForProcessWPL(wpl, vHWPL_WPLObjList, vWPLChild, vSecurityContext, v3DSpaceUrl, vCSRFToken, WAFData, vWPLId, resultscount)
			}
			else
			{
				document.getElementById("loader").style.display = 'none';
			}
		},
		onFailure: function (faildata) 
		{
			console.log(faildata);
			document.getElementById("loader").style.display = 'none';
		}
	});
}
async function loadHOPforWPL(wpl, vHWPL_WPLObjList, vWPLChild, vSecurityContext, v3DSpaceUrl, vCSRFToken, WAFData, vWPLId, vWPLMatInfo)
{
	for(var hop=(wpl+1);hop<vHWPL_WPLObjList.length;hop++)
	{
		document.getElementById("loader").style.display = 'block';
		var vHOPDetails = vHWPL_WPLObjList[hop];
		
		if(vHOPDetails.type == 'DELLmiHeaderOperationReference')
		{
			var vHOPName = vHOPDetails.title;
			var vHOPId = vHOPDetails.id;
			
			var vHOPConnID = "";
			for(var conn=0;conn<vHWPL_WPLObjList.length;conn++)
			{
				var dataline = vHWPL_WPLObjList[conn];
				var dataType = dataline.type;
				var dataid = dataline.reference;
				var dataParent = dataline['parent'];
				if(dataType == 'DELLmiHeaderOperationInstance')
				{
					if(dataid == vHOPId && dataParent == vWPLId)
					{
						vHOPConnID = dataline.id;
					}
				}
			}
			var vHOPTable = new UWA.createElement('div', {'class':'divTable'}).inject(vWPLChild);
			var vDivTableHOPRow = new UWA.createElement('div', {'class':'divTableRow'}).inject(vHOPTable);
			var vDivTableHOPRowSep = new UWA.createElement('div', {'class':'divTableCell sep',html:'&rarr;'}).inject(vDivTableHOPRow);
			var vdivTableHOPCell = new UWA.createElement('div', {'class':'divTableCell label contentPlaceholder hop', 'onClick':'openProperties(event)', title:vHOPName, id:vHOPId, html:'<strong>'+vHOPName+'</strong><br>Estimated Time : <br>Estimated Time Unit :'}).inject(vDivTableHOPRow);
			var vHOPChild = new UWA.createElement('div',{'class':'divTableCell right'}).inject(vDivTableHOPRow);
			{
				var newLineDiv = new UWA.createElement('div', {html:'&nbsp;'}).inject(vHOPTable);
			}
			var vHOPResPrimURI = v3DSpaceUrl+'/resources/v1/modeler/dsprcs/dsprcs:MfgOperation/'+vHOPId+'/dsprcs:PrimaryCapableResource?$fields=dsprcs:program.getPrimaryCapableResource';
			var vHOPResSecURI = v3DSpaceUrl+'/resources/v1/modeler/dsprcs/dsprcs:MfgOperation/'+vHOPId+'/dsprcs:SecondaryCapableResource?$fields=dsprcs:program.getSecondaryCapableResource';
			var vHOPParamTable = new UWA.createElement('div', {'class':'divTable'}).inject(vHOPChild);
			var vHOPEQTable = new UWA.createElement('div', {'class':'divTable'}).inject(vHOPChild);
			var vHOPMATTable = new UWA.createElement('div', {'class':'divTable'}).inject(vHOPChild);
			var vHOPGOPTable = new UWA.createElement('div', {'class':'divTable'}).inject(vHOPChild);
			var vConnectedPrimResources = await loadResourceForProcess(WAFData, vHOPResPrimURI, vSecurityContext, vHOPEQTable, v3DSpaceUrl, 'HeaderOperation', vHOPId);
			var vConnectedSecResources = await loadResourceForProcess(WAFData, vHOPResSecURI, vSecurityContext, vHOPEQTable, v3DSpaceUrl, 'HeaderOperation', vHOPId);
							
			var vConnectedResources = [];
			if(vConnectedPrimResources!= undefined && vConnectedPrimResources.length>0)
			{
				if(vConnectedSecResources!= undefined && vConnectedSecResources.length>0)
				{
					vConnectedResources = vConnectedPrimResources.concat(vConnectedSecResources);
				}
				else
				{
					vConnectedResources = vConnectedPrimResources;
				}
			}
			for (const vResource of vConnectedResources)
			{
				getAssociatedResourceParamList(WAFData, vSecurityContext, v3DSpaceUrl, vResource);
			}

			loadMaterialDataForOperation(vWPLId, vHOPConnID,v3DSpaceUrl,vSecurityContext,vHOPMATTable, WAFData, 'HOP', 0);
			loadDataCollectPlanforHOPandGOP(hop, vHWPL_WPLObjList, vHOPParamTable, vSecurityContext, v3DSpaceUrl, vCSRFToken, WAFData, vHOPId, 'HOP');
			loadResouceParamPlanforHOPandGOP(vHOPParamTable, vSecurityContext, v3DSpaceUrl, vCSRFToken, WAFData, vHOPId, 'HOP');
			loadGOPforHOP(hop, vHWPL_WPLObjList, vHOPGOPTable, vSecurityContext, v3DSpaceUrl, vCSRFToken, WAFData, vWPLId, vHOPId, vWPLMatInfo);
		}
		if(hop == vHWPL_WPLObjList.length-1)
		{
			document.getElementById("loader").style.display = 'none';
		}
	}
}
function loadMaterialDataForOperation(vWPLId, vOPConnID,v3DSpaceUrl,vSecurityContext,vHOPChild, WAFData, objType, resultscount)
{
	var vWPLMatURI = v3DSpaceUrl+'/resources/v1/modeler/dsprcs/dsprcs:MfgProcess/'+vWPLId+'/dsprcs:ItemSpecification';
	var vWPLMatURI = vWPLMatURI + '?$skip=' + resultscount;
	document.getElementById("loader").style.display = 'block';
	WAFData.authenticatedRequest(vWPLMatURI,
	{
		method: 'GET',type: 'json',	headers: {'Accept': 'application/json','Content-Type': 'application/json','Accept-Language': widget.lang,'SecurityContext': vSecurityContext},timeout: 1000 * 60 * 15,
		onComplete: async function (wpl_matData)
		{
			var vWPLItemsList = [];
			if(wpl_matData.hasOwnProperty('member'))
			{
				vWPLItemsList = wpl_matData.member;
			}
			var vCountWPLItemsList = 0;
			for await(const mat of vWPLItemsList)
			{
				document.getElementById("loader").style.display = 'block';
				var vMatinfoList = mat;
				if(vMatinfoList.hasOwnProperty('operationOcc'))
				{
					var occCount = 0;
					for await(const occ of vMatinfoList.operationOcc)
					{
						if(occ.hasOwnProperty('instanceObject'))
						{
							var vOPInsObjId = (occ.instanceObject).identifier;
							if((objType == 'HOP' && (vMatinfoList.operationOcc).length == 1) || (objType == 'GOP'))
							{
								if(vOPInsObjId == vOPConnID)
								{
									if(vMatinfoList.hasOwnProperty('itemOcc') && (vMatinfoList.itemOcc[occCount]) != undefined && (vMatinfoList.itemOcc[occCount]).hasOwnProperty('instanceObject'))
									{
										var vMPPtemURI = ((vMatinfoList.itemOcc[occCount]).instanceObject).relativePath;
										var vImpLinkInfo = await loadimplementlinkQuantity(vMatinfoList.id, vSecurityContext, v3DSpaceUrl,WAFData);
										vMPPtemURI = v3DSpaceUrl + vMPPtemURI + '?$mask=dsmfg:MfgItemInstanceMask.Details';
										document.getElementById("loader").style.display = 'block';
										var vMaterialQuantityInfo = await getMaterialQuantityInfo(vMPPtemURI,WAFData,v3DSpaceUrl,vSecurityContext);
										var vDivTableHOPItemRow;
										if(objType == 'HOP')
										{
											vDivTableHOPItemRow = new UWA.createElement('div', {'class':'divTableRow', html:[{tag:'div','class':'divTableCell hopmaterialspace'},{tag:'div','class':'divTableCell sep',html:'&larr;'}]}).inject(vHOPChild);
										}
										else if(objType == 'GOP')
										{
											vDivTableHOPItemRow = new UWA.createElement('div', {'class':'divTableRow', html:[{tag:'div','class':'divTableCell gopmaterialspace'},{tag:'div','class':'divTableCell sep',html:'&larr;'}]}).inject(vHOPChild);
										}
										
										if(widget.getValue("Display_Option") === "Details_Mode")
										{
											//var vdivTableHOPItemCell = new UWA.createElement('div', {'class':'divTableCell label contentPlaceholder material', html:[{tag:'div','class':'caret caret-down',html:[{tag:'span','onClick':'toggleExpand(this)',html:'<strong>'+vMaterialQuantityInfo.MatName+'</strong>'},{tag:'div','class':'materialitems nested active',id:vMaterialQuantityInfo.MatId ,'onClick':'openProperties(event)',html:[{tag:'div','class':'divMatQuantityinfo',html:'Quantity : '+vMaterialQuantityInfo.Quantity},{tag:'div','class':'divMatQuantityinfo',html:'Implement link Quantity : '+vImpLinkInfo.Quantity},{tag:'div','class':'divMatQuantityinfo',html:'Unit : '+vMaterialQuantityInfo.Unit},{tag:'div','class':'divMatQuantityinfo',html:'Role : '+vImpLinkInfo.Usage}]}]}]}).inject(vDivTableHOPItemRow);
											
											var vdivTableHOPItemCell = new UWA.createElement('div', {'class':'divTableCell label contentPlaceholder material', html:[{tag:'div','class':'caret caret-down',html:[{tag:'span','onClick':'toggleExpand(this)',html:'<strong>'+vMaterialQuantityInfo.MatName+'</strong>'},{tag:'div','class':'materialitems nested active',id:vMaterialQuantityInfo.MatId ,'onClick':'openProperties(event)',html:[{tag:'div', 'class':'divParamValueRow',html:[{tag:'div','class':'paramlabel',html:'Quantity'},{tag:'div','class':'paramvalue',html:vMaterialQuantityInfo.Quantity}]},{tag:'div', 'class':'divParamValueRow',html:[{tag:'div','class':'paramlabel',html:'Implement link Quantity'},{tag:'div','class':'paramvalue',html:vImpLinkInfo.Quantity}]},{tag:'div', 'class':'divParamValueRow',html:[{tag:'div','class':'paramlabel',html:'Unit'},{tag:'div','class':'paramvalue',html:vMaterialQuantityInfo.Unit}]},{tag:'div', 'class':'divParamValueRow',html:[{tag:'div','class':'paramlabel',html:'Role'},{tag:'div','class':'paramvalue',html:vImpLinkInfo.Usage}]}]}]}]}).inject(vDivTableHOPItemRow);
											
										}
										else
										{
											var vdivTableHOPItemCell = new UWA.createElement('div', {'class':'divTableCell label contentPlaceholder material', html:[{tag:'div','class':'caret caret-down',html:[{tag:'span','onClick':'toggleExpand(this)',html:'<strong>'+vMaterialQuantityInfo.MatName+'</strong>'},{tag:'div','class':'materialitems nested',id:vMaterialQuantityInfo.MatId ,'onClick':'openProperties(event)',html:[{tag:'div', 'class':'divParamValueRow',html:[{tag:'div','class':'paramlabel',html:'Quantity'},{tag:'div','class':'paramvalue',html:vMaterialQuantityInfo.Quantity}]},{tag:'div', 'class':'divParamValueRow',html:[{tag:'div','class':'paramlabel',html:'Implement link Quantity'},{tag:'div','class':'paramvalue',html:vImpLinkInfo.Quantity}]},{tag:'div', 'class':'divParamValueRow',html:[{tag:'div','class':'paramlabel',html:'Unit'},{tag:'div','class':'paramvalue',html:vMaterialQuantityInfo.Unit}]},{tag:'div', 'class':'divParamValueRow',html:[{tag:'div','class':'paramlabel',html:'Role'},{tag:'div','class':'paramvalue',html:vImpLinkInfo.Usage}]}]}]}]}).inject(vDivTableHOPItemRow);
										}
										var newLineDiv = new UWA.createElement('div', {html:'&nbsp;'}).inject(vHOPChild);
									}
								}
							}
						}
						occCount = occCount + 1;
					}
				}
				vCountWPLItemsList = vCountWPLItemsList + 1;
				if(vCountWPLItemsList == vWPLItemsList.length-1)
				{
					document.getElementById("loader").style.display = 'none';
				}
			}
			if(wpl_matData.totalItems == 10)
			{
				resultscount = resultscount + 10;
				loadMaterialDataForOperation(vWPLId, vOPConnID,v3DSpaceUrl,vSecurityContext,vHOPChild, WAFData, objType, resultscount);
			}
			else
			{
				document.getElementById("loader").style.display = 'none';
			}
			document.getElementById("loader").style.display = 'none';
		},
		onFailure: function (faildata) 
		{
			console.log(faildata);
			document.getElementById("loader").style.display = 'none';
		}
	});
}

async function getMaterialQuantityInfo(vMPPtemURI,WAFData,v3DSpaceUrl,vSecurityContext){
	return new Promise((resolve,reject)=>{
		var vReturn = {'Quantity':'','Unit':'', 'Magnitude':'','MatName':'','MatId':''};
	WAFData.authenticatedRequest(vMPPtemURI,
	{
		method: 'GET',type: 'json',	headers: {'Accept': 'application/json','Content-Type': 'application/json','Accept-Language': widget.lang,'SecurityContext': vSecurityContext},timeout: 1000 * 60 * 15,
		onComplete: async function (matDataInfo)
		{
			if(matDataInfo.hasOwnProperty('member'))
			{
				var vMatQuantity = "";
				var vMatUnit = "";
				var vMatMagnitude = "";
				
				if((matDataInfo.member[0]).hasOwnProperty('quantity'))
				{
					vMatQuantity = ((matDataInfo.member[0]).quantity).value;
					vMatUnit = ((matDataInfo.member[0]).quantity).unit;
					vMatMagnitude = ((matDataInfo.member[0]).quantity).magnitude;
				}
				else if((matDataInfo.member[0]).hasOwnProperty('contQuantity'))
				{
					vMatQuantity = ((matDataInfo.member[0]).contQuantity);
				}
				
				var vReferenceMatURI = ((matDataInfo.member[0]).referencedObject).relativePath;
				vReferenceMatURI = v3DSpaceUrl + vReferenceMatURI;
				document.getElementById("loader").style.display = 'block';
				WAFData.authenticatedRequest(vReferenceMatURI,
				{
					method: 'GET',type: 'json',	headers: {'Accept': 'application/json','Content-Type': 'application/json','Accept-Language': widget.lang,'SecurityContext': vSecurityContext},timeout: 1000 * 60 * 15,
					onComplete: async function (matInfo)
					{
						if(matInfo.hasOwnProperty('member'))
						{
							var vMatName = (matInfo.member[0]).title;
							var vMatid = (matInfo.member[0]).id;
							
							vReturn['MatName'] = vMatName;
							vReturn['MatId'] = vMatid;
							if(vMatMagnitude!='undefined' && vMatMagnitude != '')
							{
								var vDimensions = widget.getValue("Dimensions");
								let vDimindex = vDimensions.findIndex(item => item.Name === vMatMagnitude);
								let vUnitDimension = (vDimensions[vDimindex])["Units"];
								let vUnitindex = vUnitDimension.findIndex(item => item.Name === vMatUnit);
								let vUnitLabel = vUnitDimension[vUnitindex].NLSName;																
								vMatUnit = vUnitLabel;
							}
							
						}
						vReturn['Quantity'] = vMatQuantity;
						vReturn['Unit'] = vMatUnit;
						vReturn['Magnitude'] = vMatMagnitude;
						
						resolve(vReturn);
					},
					onFailure: function (faildata) 
					{
						console.log(faildata);
					}
				});
			}
		},
		onFailure: function (faildata) 
		{
			console.log(faildata);
		}
	});
	});
}


async function loadimplementlinkQuantity(vMatinfoId, vSecurityContext, v3DSpaceUrl,WAFData)
{
	document.getElementById("loader").style.display = 'block';
	return new Promise((resolve,reject)=>{
		var vHisURI = v3DSpaceUrl + '/resources/v1/application/history?xrequestedwith=xmlhttprequest';
		var vReturn = {'Quantity':'', 'Usage':''};
		WAFData.authenticatedRequest(vHisURI,
		{
			method: 'POST',type: 'json',data:'{"phyIds":["'+vMatinfoId+'"]}', headers: {'Accept': 'application/json','Content-Type': 'application/json','Accept-Language': widget.lang,'SecurityContext': vSecurityContext},timeout: 1000 * 60 * 15,
			onComplete: function (matInfo)
			{
				var vHistory = ((matInfo[0])[vMatinfoId]).historyData;
				for(var i=0;i<vHistory.length;i++)
				{
					var vHistoryLine = vHistory[i];
					if(vHistoryLine.action == 'modifyAttribute' && vHistoryLine.attribute == 'PLMEntity.V_usage')
					{
						var vValue = ((vHistoryLine.modDesc).split(' '))[1];
						vReturn['Usage'] = vValue;
					}
					if(vHistoryLine.action == 'modifyAttribute' && vHistoryLine.attribute == 'DELFmiContQuantity_Mass.V_ContQuantity')
					{
						var vValue = ((vHistoryLine.modDesc).split(' '))[1];
						vReturn['Quantity'] = vValue;
					}
					//updated code as per 25x
					if(vHistoryLine.action == 'modifyAttribute' && vHistoryLine.modDesc.attribute == 'PLMEntity.V_usage')
					{
						var vValue = vHistoryLine.modDesc.tags.value;
						vReturn['Usage'] = vValue;
					}
					if(vHistoryLine.action == 'modifyAttribute' && vHistoryLine.modDesc.attribute == 'DELFmiContQuantity_Mass.V_ContQuantity')
					{
						var vValue = vHistoryLine.modDesc.tags.value;
						if(vValue != '')
						{
							vValue = vValue.split(' ')[0];
						}
						vReturn['Quantity'] = vValue;
					}
					if(vHistoryLine.action == 'modifyAttribute' && vHistoryLine.modDesc.attribute == 'DELFmiContQuantity_Length.V_ContQuantity')
					{
						var vValue = vHistoryLine.modDesc.tags.value;
						if(vValue != '')
						{
							vValue = vValue.split(' ')[0];
						}
						vReturn['Quantity'] = vValue;
					}
					if(vHistoryLine.action == 'modifyAttribute' && vHistoryLine.modDesc.attribute == 'DELFmiContQuantity_Area.V_ContQuantity')
					{
						var vValue = vHistoryLine.modDesc.tags.value;
						if(vValue != '')
						{
							vValue = vValue.split(' ')[0];
						}
						vReturn['Quantity'] = vValue;
					}
					if(vHistoryLine.action == 'modifyAttribute' && vHistoryLine.modDesc.attribute == 'DELFmiContQuantity_Volume.V_ContQuantity')
					{
						var vValue = vHistoryLine.modDesc.tags.value;
						if(vValue != '')
						{
							vValue = vValue.split(' ')[0];
						}
						vReturn['Quantity'] = vValue;
					}
				}				
				resolve(vReturn);
				document.getElementById("loader").style.display = 'none';
			},
			onFailure: function (faildata) 
			{
				console.log(faildata);
				document.getElementById("loader").style.display = 'none';
			}
		});
	});
}
async function loadGOPforHOP(hop, vHWPL_WPLObjList, vHOPChild, vSecurityContext, v3DSpaceUrl, vCSRFToken, WAFData, vWPLId, vHOPId, vWPLMatInfo)
{
	for(var gop=(hop+1);gop<vHWPL_WPLObjList.length;gop++)
	{
		document.getElementById("loader").style.display = 'block';
		var vGOPDetails = vHWPL_WPLObjList[gop];		
		if(vGOPDetails.type == 'DELLmiGeneralOperationReference')
		{
			var vGOPName = vGOPDetails.title;
			var vGOPId = vGOPDetails.id;
			var vDivTableGOPRow = new UWA.createElement('div', {'class':'divTableRow'}).inject(vHOPChild);
			var vDivTableGOPRowSep = new UWA.createElement('div', {'class':'divTableCell sep',html:'&rarr;'}).inject(vDivTableGOPRow);
			var vdivTableHOPCell = new UWA.createElement('div', {'class':'divTableCell label contentPlaceholder gop', 'onClick':'openProperties(event)', title:vGOPName, id:vGOPId, html:'<strong>'+vGOPName+'</strong><br>Estimated Time :<br>Estimated Time Unit :'}).inject(vDivTableGOPRow);
			var vGOPChild = new UWA.createElement('div',{'class':'divTableCell right'}).inject(vDivTableGOPRow);
			{
				var newLineDiv = new UWA.createElement('div', {html:'&nbsp;'}).inject(vHOPChild);
			}
			
			var vGOPConnID = "";
			for(var conn=0;conn<vHWPL_WPLObjList.length;conn++)
			{
				var dataline = vHWPL_WPLObjList[conn];
				var dataType = dataline.type;
				var dataid = dataline.reference;
				var dataParent = dataline['parent'];
				if(dataType == 'DELLmiGeneralOperationInstance')
				{
					if(dataid == vGOPId && dataParent == vHOPId)
					{
						vGOPConnID = dataline.id;
					}
				}
			}
			var vHOPResPrimURI = v3DSpaceUrl+'/resources/v1/modeler/dsprcs/dsprcs:MfgOperation/'+vGOPId+'/dsprcs:PrimaryCapableResource?$fields=dsprcs:program.getPrimaryCapableResource';
			
			var vGOPParamTable = new UWA.createElement('div', {'class':'divTable'}).inject(vGOPChild);
			var vGOPEQTable = new UWA.createElement('div', {'class':'divTable'}).inject(vGOPChild);
			var vGOPMATTable = new UWA.createElement('div', {'class':'divTable'}).inject(vGOPChild);
			await loadResourceForProcess(WAFData, vHOPResPrimURI, vSecurityContext, vGOPEQTable, v3DSpaceUrl, 'GeneralOperation', vGOPId);
			//loadMaterialDataForOperation(vWPLId, vGOPConnID,v3DSpaceUrl,vSecurityContext,vGOPMATTable, WAFData, 'GOP', 0);

			loadMaterialDataForGenOperation(vWPLId, vGOPConnID,v3DSpaceUrl,vSecurityContext,vGOPMATTable, WAFData, 'GOP', vWPLMatInfo);
			loadDataCollectPlanforHOPandGOP(gop, vHWPL_WPLObjList, vGOPParamTable, vSecurityContext, v3DSpaceUrl, vCSRFToken, WAFData, vGOPId, 'GOP');
			loadResouceParamPlanforHOPandGOP(vGOPParamTable, vSecurityContext, v3DSpaceUrl, vCSRFToken, WAFData, vGOPId, 'GOP');
		}
		else
		{
			break;
			if(gop == vHWPL_WPLObjList.length-1)
			{
				document.getElementById("loader").style.display = 'none';
			}
		}
	}
}

async function getMaterialInfoForGenOp(vMAtConnId, vSecurityContext, v3DSpaceUrl,WAFData,navigateToMain)
{
	document.getElementById("loader").style.display = 'block';
	return new Promise((resolve,reject)=>{
		var vMPPtemURI = v3DSpaceUrl + '/resources/v1/collabServices/attributes/op/read?xrequestedwith=xmlhttprequest';
		WAFData.authenticatedRequest(vMPPtemURI,
		{
			method: 'POST',type: 'json',data:'{"lIds":["'+vMAtConnId+'"],"navigateToMain":"'+navigateToMain+'"}', headers: {'Accept': 'application/json','Content-Type': 'application/json','Accept-Language': widget.lang,'SecurityContext': vSecurityContext},timeout: 1000 * 60 * 15,
			onComplete: async function (matDataInfo)
			{
				resolve(matDataInfo);
				document.getElementById("loader").style.display = 'none';
			},
			onFailure: function (faildata) 
			{
				console.log(faildata);
				document.getElementById("loader").style.display = 'none';
			}
		});
	});
}

async function loadMaterialDataForGenOperation(vWPLId, vGOPConnID,v3DSpaceUrl,vSecurityContext,vGOPChild, WAFData, objType, vWPLMatInfo)
{
	var vConnList = [];
	for(var i=0;i<vWPLMatInfo.length;i++)
	{
		document.getElementById("loader").style.display = 'block';
		var vMatItems = vWPLMatInfo[i];
		if(vMatItems.hasOwnProperty('pathsr'))
		{
			if(vMatItems.type == 'MfgProductionPlanning' && (vMatItems.pathsr).contains(vGOPConnID))
			{
				var vResourceID = vMatItems.resourceid;
				var vMatConnidsList = (vMatItems.pathsr).split('LT_REL PS ');
				var vMatConIdList = vMatConnidsList[2].split(" ");
				for(var j=0;j<vMatConIdList.length;j++)
				{
					document.getElementById("loader").style.display = 'block';
					var vMAtConnId = vMatConIdList[j];
					if(vMAtConnId != 'PE' && !vConnList.includes(vMAtConnId))
					{
						var matDataInfo = await getMaterialInfoForGenOp(vMAtConnId, vSecurityContext, v3DSpaceUrl,WAFData,"true")
						var matConnDataInfo = await getMaterialInfoForGenOp(vMAtConnId, vSecurityContext, v3DSpaceUrl,WAFData,"false")
						var vMatName = "";
						var vMatid = "";
						var vMatQuantity = "";
						var vMatUnit = "";		
						
						if(matDataInfo.hasOwnProperty('results'))
						{
							var vMatDataList = (matDataInfo.results[0]).data;
							let vLabelindex = vMatDataList.findIndex(item => item.name === "V_Name");
							if(vLabelindex != -1)
							{
								vMatName = (vMatDataList[vLabelindex].value).toString();
							}
							else
							{
								vMatName = (matDataInfo.results[0]).computed.label.value;
							}
							vMatid = (matDataInfo.results[0]).physicalID;
						}
						if(matConnDataInfo.hasOwnProperty('results'))
						{
							var vMatConnDataList = (matConnDataInfo.results[0]).data;
							let vQuantityindex = vMatConnDataList.findIndex(item => item.name === "V_ContQuantity");
							vMatQuantity = (vMatConnDataList[vQuantityindex].value).toString();
							vMatUnit = (vMatConnDataList[vQuantityindex].dimension).toString();
						}
						var vDivTableHOPItemRow = new UWA.createElement('div', {'class':'divTableRow', html:[{tag:'div','class':'divTableCell gopmaterialspace'},{tag:'div','class':'divTableCell sep',html:'&larr;'}]}).inject(vGOPChild);
						var newLineDiv = new UWA.createElement('div', {html:'&nbsp;'}).inject(vGOPChild);								

						var vImpLinkInfo = await loadimplementlinkQuantity(vResourceID, vSecurityContext, v3DSpaceUrl,WAFData);

						if(widget.getValue("Display_Option") === "Details_Mode")
						{
							var vdivTableHOPItemCell = new UWA.createElement('div', {'class':'divTableCell label contentPlaceholder material', html:[{tag:'div','class':'caret caret-down',html:[{tag:'span','onClick':'toggleExpand(this)',html:'<strong>'+vMatName+'</strong>'},{tag:'div','class':'materialitems nested active',id:vMatid ,'onClick':'openProperties(event)',html:[{tag:'div', 'class':'divParamValueRow',html:[{tag:'div','class':'paramlabel',html:'Quantity'},{tag:'div','class':'paramvalue',html:vMatQuantity}]},{tag:'div', 'class':'divParamValueRow',html:[{tag:'div','class':'paramlabel',html:'Implement link Quantity'},{tag:'div','class':'paramvalue',html:vImpLinkInfo.Quantity}]},{tag:'div', 'class':'divParamValueRow',html:[{tag:'div','class':'paramlabel',html:'Unit'},{tag:'div','class':'paramvalue',html:vMatUnit}]},{tag:'div', 'class':'divParamValueRow',html:[{tag:'div','class':'paramlabel',html:'Role'},{tag:'div','class':'paramvalue',html:vImpLinkInfo.Usage}]}]}]}]}).inject(vDivTableHOPItemRow);
						}
						else
						{
							var vdivTableHOPItemCell = new UWA.createElement('div', {'class':'divTableCell label contentPlaceholder material', html:[{tag:'div','class':'caret caret-down',html:[{tag:'span','onClick':'toggleExpand(this)',html:'<strong>'+vMatName+'</strong>'},{tag:'div','class':'materialitems nested',id:vMatid ,'onClick':'openProperties(event)',html:[{tag:'div', 'class':'divParamValueRow',html:[{tag:'div','class':'paramlabel',html:'Quantity'},{tag:'div','class':'paramvalue',html:vMatQuantity}]},{tag:'div', 'class':'divParamValueRow',html:[{tag:'div','class':'paramlabel',html:'Implement link Quantity'},{tag:'div','class':'paramvalue',html:vImpLinkInfo.Quantity}]},{tag:'div', 'class':'divParamValueRow',html:[{tag:'div','class':'paramlabel',html:'Unit'},{tag:'div','class':'paramvalue',html:vMatUnit}]},{tag:'div', 'class':'divParamValueRow',html:[{tag:'div','class':'paramlabel',html:'Role'},{tag:'div','class':'paramvalue',html:vImpLinkInfo.Usage}]}]}]}]}).inject(vDivTableHOPItemRow);
						}
					}
					document.getElementById("loader").style.display = 'none';
					vConnList.push(vMAtConnId);
				}
			}
		}
		document.getElementById("loader").style.display = 'none';
	}
}
async function loadDataCollectPlanforHOPandGOP(op, vHWPL_WPLObjList, vParamTable, vSecurityContext, v3DSpaceUrl, vCSRFToken, WAFData, vOPId, objType)
{
	for(var dcp=(op+1);dcp<vHWPL_WPLObjList.length;dcp++)
	{
		document.getElementById("loader").style.display = 'block';
		var vDCPDetails = vHWPL_WPLObjList[dcp];
		if(vDCPDetails.type == 'DELWkiDataCollectPlanInstance')
		{
			var vDCPId = vDCPDetails.reference;
			var vDCPPArentId = vDCPDetails['parent'];
			if(vDCPPArentId == vOPId)
			{
				var vGetDCPRowsDetailsURI 	= v3DSpaceUrl+'/resources/v1/modeler/dsprcs/dsprcs:DataCollectPlan/'+vDCPId+'/dsprcs:DataCollectRow?$fields=dsmveno:CustomerAttributes&$mask=dsprcs:DataCollectRowMask.Default&xrequestedwith=xmlhttprequest';
				document.getElementById("loader").style.display = 'block';
				WAFData.authenticatedRequest(vGetDCPRowsDetailsURI,
				{
					method: 'GET',type: 'json',headers: {'Accept': 'application/json','Content-Type': 'application/json','Accept-Language': widget.lang,'SecurityContext': vSecurityContext,'ENO_CSRF_TOKEN': vCSRFToken},timeout: 1000 * 60 * 15,
					onComplete: async function (dcp_paramData)
					{
						if(dcp_paramData.hasOwnProperty('member'))
						{
							var vParamRows = dcp_paramData.member;
							for(var k=0;k<vParamRows.length;k++)
							{
								var vParamDetails = vParamRows[k];	
								var vDivTableParamRow;
								if(objType == 'HOP')
								{
									var vDivTableParamRow = new UWA.createElement('div', {'class':'divTableRow', html:[{tag:'div','class':'divTableCell hopparamspace'},{'class':'divTableCell sep',html:'&larr;'}]}).inject(vParamTable);
								}
								else
								{
									var vDivTableParamRow = new UWA.createElement('div', {'class':'divTableRow', html:[{'class':'divTableCell sep',html:'&larr;'}]}).inject(vParamTable);
								}
								new UWA.createElement('div', {html:'&nbsp;'}).inject(vParamTable);
								
								var vdivTableParamCell = new UWA.createElement('div', {'class':'divTableCell label contentPlaceholder param'}).inject(vDivTableParamRow);
								var vDivParamCaret = new UWA.createElement('div', {'class':'caret caret-down', style:{'word-break':'break-all'}}).inject(vdivTableParamCell);
								var vDivParamSpan = new UWA.createElement('span',{'onClick':'toggleExpand(this)',html:'<strong>'+vParamDetails['label']+'(Process)</strong>'}).inject(vDivParamCaret);
								var vNestedCell = "";
								if(widget.getValue("Display_Option") === "Details_Mode")
								{
									vNestedCell = new UWA.createElement('div',{'class':'parameter nested active', 'onclick':'openProperties(event)',id:vParamDetails.id}).inject(vDivParamCaret);
								}
								else
								{

									vNestedCell = new UWA.createElement('div',{'class':'parameter nested', 'onclick':'openProperties(event)',id:vParamDetails.id}).inject(vDivParamCaret);
								}
								
								
								if(vParamDetails.dcType == 1)
								{
									var vMagnitude = vParamDetails.maxValue.magnitude;
									var vUnitDisplay = vParamDetails.maxValue.displayUnit;	
									var vDimensions = widget.getValue("Dimensions");
									let vDimindex = vDimensions.findIndex(item => item.Name === vMagnitude);
									let vUnitDimension = (vDimensions[vDimindex])["Units"];
									let vUnitindex = vUnitDimension.findIndex(item => item.Name === vUnitDisplay);
									let vUnitLabel = vUnitDimension[vUnitindex].NLSName;
									
									
									//Failure Minimum Value
									if(vParamDetails.hasOwnProperty('eofMinLimit'))
									{
										if(vParamDetails.eofMinLimit != 'NotSet')
										{
											var vValue = '';
											if(vParamDetails.hasOwnProperty('eofMinValue'))
											{
												vValue = vParamDetails.eofMinValue.inputValue;
												if(vValue == '' || vValue == 'undefined');
												{
													vValue = await getConvertedValue(vSecurityContext, v3DSpaceUrl, vCSRFToken, WAFData, vParamDetails.eofMinValue);
												}
											}
											new UWA.createElement('div', {'class':'divParamValueRow',html:[{tag:'div','class':'paramlabel',html:'Failure Min'},{tag:'div','class':'paramvalue',html:vValue +'  '+ vUnitLabel}]}).inject(vNestedCell);
										}
										else
										{
											new UWA.createElement('div', {'class':'divParamValueRow',html:[{tag:'div','class':'paramlabel',html:'Failure Min'},{tag:'div','class':'paramvalue',html:''}]}).inject(vNestedCell);
										}
									}
									
									//Acceptable Minimum Value
									if(vParamDetails.hasOwnProperty('minLimit'))
									{
										if(vParamDetails.minLimit != 'NotSet')
										{
											var vValue = '';
											if(vParamDetails.hasOwnProperty('minValue'))
											{
												vValue = vParamDetails.minValue.inputValue;
												if(vValue == '' || vValue == 'undefined');
												{
													vValue = await getConvertedValue(vSecurityContext, v3DSpaceUrl, vCSRFToken, WAFData, vParamDetails.minValue);
												}
											}
											new UWA.createElement('div', {'class':'divParamValueRow',html:[{tag:'div','class':'paramlabel',html:'Acceptable Min'},{tag:'div','class':'paramvalue',html:vValue +'  '+ vUnitLabel}]}).inject(vNestedCell);
										}
										else
										{
											new UWA.createElement('div', {'class':'divParamValueRow',html:[{tag:'div','class':'paramlabel',html:'Acceptable Min'},{tag:'div','class':'paramvalue',html:''}]}).inject(vNestedCell);
										}
									}
									
									//Normal Minimum Value
									if(vParamDetails.hasOwnProperty('controlMinLimit'))
									{
										if(vParamDetails.controlMinLimit != 'NotSet')
										{
											var vValue = '';
											if(vParamDetails.hasOwnProperty('controlMinValue'))
											{
												vValue = vParamDetails.controlMinValue.inputValue;
												if(vValue == '' || vValue == 'undefined');
												{
													vValue = await getConvertedValue(vSecurityContext, v3DSpaceUrl, vCSRFToken, WAFData, vParamDetails.controlMinValue);
												}
											}
											new UWA.createElement('div', {'class':'divParamValueRow',html:[{tag:'div','class':'paramlabel',html:'Normal Min'},{tag:'div','class':'paramvalue',html:vValue +'  '+ vUnitLabel}]}).inject(vNestedCell);
										}
										else
										{
											new UWA.createElement('div', {'class':'divParamValueRow',html:[{tag:'div','class':'paramlabel',html:'Normal Min'},{tag:'div','class':'paramvalue',html:''}]}).inject(vNestedCell);
										}
									}
									
									//Nominal Value
									if(vParamDetails.hasOwnProperty('nominalValue'))
									{
										var vValue = '';
										if(vParamDetails.isValueSet != false)
										{
											vValue = vParamDetails.nominalValue.inputValue;
											if(vValue == '' || vValue == 'undefined');
											{
												vValue = await getConvertedValue(vSecurityContext, v3DSpaceUrl, vCSRFToken, WAFData, vParamDetails.nominalValue);
											}
										}
										new UWA.createElement('div', {'class':'divParamValueRow',html:[{tag:'div','class':'paramlabel',html:'Value(s)'},{tag:'div','class':'paramvalue',html:vValue +'  '+ vUnitLabel}]}).inject(vNestedCell);
									}
									
									//Normal Maximum Value
									if(vParamDetails.hasOwnProperty('controlMaxLimit'))
									{
										if(vParamDetails.controlMaxLimit != 'NotSet')
										{
											var vValue = '';
											if(vParamDetails.hasOwnProperty('controlMaxValue'))
											{
												vValue = vParamDetails.controlMaxValue.inputValue;
												if(vValue == '' || vValue == 'undefined');
												{
													vValue = await getConvertedValue(vSecurityContext, v3DSpaceUrl, vCSRFToken, WAFData, vParamDetails.controlMaxValue);
												}
											}
											new UWA.createElement('div', {'class':'divParamValueRow',html:[{tag:'div','class':'paramlabel',html:'Normal Max'},{tag:'div','class':'paramvalue',html:vValue +'  '+ vUnitLabel}]}).inject(vNestedCell);
										}
										else
										{
											new UWA.createElement('div', {'class':'divParamValueRow',html:[{tag:'div','class':'paramlabel',html:'Normal Max'},{tag:'div','class':'paramvalue',html:''}]}).inject(vNestedCell);
										}
									}
									
									//Acceptable Maximum Value
									if(vParamDetails.hasOwnProperty('maxLimit'))
									{
										if(vParamDetails.maxLimit != 'NotSet')
										{
											var vValue = '';
											if(vParamDetails.hasOwnProperty('maxValue'))
											{
												vValue = vParamDetails.maxValue.inputValue;
												if(vValue == '' || vValue == 'undefined');
												{
													vValue = await getConvertedValue(vSecurityContext, v3DSpaceUrl, vCSRFToken, WAFData, vParamDetails.maxValue);
												}
											}
											new UWA.createElement('div', {'class':'divParamValueRow',html:[{tag:'div','class':'paramlabel',html:'Acceptable Max'},{tag:'div','class':'paramvalue',html:vValue +'  '+ vUnitLabel}]}).inject(vNestedCell);
										}
										else
										{
											new UWA.createElement('div', {'class':'divParamValueRow',html:[{tag:'div','class':'paramlabel',html:'Acceptable Max'},{tag:'div','class':'paramvalue',html:''}]}).inject(vNestedCell);
										}
									}
									
									//Failure Maximum Value
									if(vParamDetails.hasOwnProperty('eofMaxLimit'))
									{
										if(vParamDetails.eofMaxLimit != 'NotSet')
										{
											var vValue = '';
											if(vParamDetails.hasOwnProperty('eofMaxValue'))
											{
												vValue = vParamDetails.eofMaxValue.inputValue;
												if(vValue == '' || vValue == 'undefined');
												{
													vValue = await getConvertedValue(vSecurityContext, v3DSpaceUrl, vCSRFToken, WAFData, vParamDetails.eofMaxValue);
												}
											}
											new UWA.createElement('div', {'class':'divParamValueRow',html:[{tag:'div','class':'paramlabel',html:'Failure Max'},{tag:'div','class':'paramvalue',html:vValue +'  '+ vUnitLabel}]}).inject(vNestedCell);
										}
										else
										{
											new UWA.createElement('div', {'class':'divParamValueRow',html:[{tag:'div','class':'paramlabel',html:'Failure Max'},{tag:'div','class':'paramvalue',html:''}]}).inject(vNestedCell);
										}
									}
								}
								
								if(vParamDetails.dcType == 2)
								{
									//Acceptable Minimum Value
									if(vParamDetails.hasOwnProperty('minLimit'))
									{
										if(vParamDetails.minLimit != 'NotSet')
										{
											var vValue = '';
											if(vParamDetails.hasOwnProperty('minValue'))
											{
												vValue = vParamDetails.minValue.value;
											}
											new UWA.createElement('div', {'class':'divParamValueRow',html:[{tag:'div','class':'paramlabel',html:'Acceptable Min'},{tag:'div','class':'paramvalue',html:vValue}]}).inject(vNestedCell);
										}
										else
										{
											new UWA.createElement('div', {'class':'divParamValueRow',html:[{tag:'div','class':'paramlabel',html:'Acceptable Min'},{tag:'div','class':'paramvalue',html:''}]}).inject(vNestedCell);
										}
									}
									
									//Normal Minimum Value
									if(vParamDetails.hasOwnProperty('controlMinLimit'))
									{
										if(vParamDetails.controlMinLimit != 'NotSet')
										{
											var vValue = '';
											if(vParamDetails.hasOwnProperty('controlMinValue'))
											{
												vValue = vParamDetails.controlMinValue.value;
											}
											new UWA.createElement('div', {'class':'divParamValueRow',html:[{tag:'div','class':'paramlabel',html:'Normal Min'},{tag:'div','class':'paramvalue',html:vValue}]}).inject(vNestedCell);
										}
										else
										{
											new UWA.createElement('div', {'class':'divParamValueRow',html:[{tag:'div','class':'paramlabel',html:'Normal Min'},{tag:'div','class':'paramvalue',html:''}]}).inject(vNestedCell);
										}
									}
									
									//Possible Values
									if(vParamDetails.hasOwnProperty('possibleValues'))
									{
										var vValue = '';
										if(vParamDetails.isValueSet != false)
										{
											vValue = (vParamDetails.possibleValues).toString();
										}
										new UWA.createElement('div', {'class':'divParamValueRow',html:[{tag:'div','class':'paramlabel',html:'Value(s)'},{tag:'div','class':'paramvalue',html:vValue}]}).inject(vNestedCell);
									}
									
									//Normal Maximum Value
									if(vParamDetails.hasOwnProperty('controlMaxLimit'))
									{
										if(vParamDetails.controlMaxLimit != 'NotSet')
										{
											var vValue = '';
											if(vParamDetails.hasOwnProperty('controlMaxValue'))
											{
												vValue = vParamDetails.controlMaxValue.value;
											}
											new UWA.createElement('div', {'class':'divParamValueRow',html:[{tag:'div','class':'paramlabel',html:'Normal Max'},{tag:'div','class':'paramvalue',html:vValue}]}).inject(vNestedCell);
										}
										else
										{
											new UWA.createElement('div', {'class':'divParamValueRow',html:[{tag:'div','class':'paramlabel',html:'Normal Max'},{tag:'div','class':'paramvalue',html:''}]}).inject(vNestedCell);
										}
									}
									
									//Acceptable Maximum Value
									if(vParamDetails.hasOwnProperty('maxLimit'))
									{
										if(vParamDetails.maxLimit != 'NotSet')
										{
											var vValue = '';
											if(vParamDetails.hasOwnProperty('maxValue'))
											{
												vValue = vParamDetails.maxValue.value;
											}
											new UWA.createElement('div', {'class':'divParamValueRow',html:[{tag:'div','class':'paramlabel',html:'Acceptable Max'},{tag:'div','class':'paramvalue',html:vValue}]}).inject(vNestedCell);
										}
										else
										{
											new UWA.createElement('div', {'class':'divParamValueRow',html:[{tag:'div','class':'paramlabel',html:'Acceptable Max'},{tag:'div','class':'paramvalue',html:''}]}).inject(vNestedCell);
										}
									}
								}
								
								if(vParamDetails.dcType == 3 || vParamDetails.dcType == 4)
								{
									//Possible Values
									if(vParamDetails.hasOwnProperty('possibleValues'))
									{
										var vValue = '';
										if(vParamDetails.isValueSet != false)
										{
											vValue = (vParamDetails.possibleValues).toString();
										}
										new UWA.createElement('div', {'class':'divParamValueRow',html:[{tag:'div','class':'paramlabel',html:'Value(s)'},{tag:'div','class':'paramvalue',html:vValue}]}).inject(vNestedCell);
									}
								}
								if(vParamDetails.dcType == 5)
								{
									//Possible Values
									var vValue = '';
									if(vParamDetails.hasOwnProperty('timestampFormat'))
									{
										vValue = (vParamDetails.timestampFormat).toString();										
									}
									new UWA.createElement('div', {'class':'divParamValueRow',html:[{tag:'div','class':'paramlabel',html:'Value'},{tag:'div','class':'paramvalue',html:vValue}]}).inject(vNestedCell);
								}
								
								if(vParamDetails.hasOwnProperty('customerAttributes'))
								{
									if((vParamDetails.customerAttributes).hasOwnProperty('SNFDataCollectCnxExtension'))
									{
										if(vParamDetails.customerAttributes.SNFDataCollectCnxExtension.hasOwnProperty('SNFCriticality'))
										{
											var vCriticality = vParamDetails.customerAttributes.SNFDataCollectCnxExtension.SNFCriticality;
											var vpayLoad = '[{"type":"SNFDataCollectCnxExtension","attributes":["SNFCriticality"]}]';
											var vProcessCriticality = await getCriticalityLabel(vSecurityContext, v3DSpaceUrl, vCSRFToken, WAFData,vpayLoad, vCriticality, "SNFCriticality");
											new UWA.createElement('div', {'class':'divParamValueRow',html:[{tag:'div','class':'paramlabel',html:'Process Criticality'},{tag:'div','class':'paramvalue',html:vProcessCriticality}]}).inject(vNestedCell);
										}
										if(vParamDetails.customerAttributes.SNFDataCollectCnxExtension.hasOwnProperty('SNFMaterialCriticatily'))
										{
											var vCriticality = vParamDetails.customerAttributes.SNFDataCollectCnxExtension.SNFMaterialCriticatily;
											var vpayLoad = '[{"type":"SNFDataCollectCnxExtension","attributes":["SNFMaterialCriticatily"]}]';
											var vProcessCriticality = await getCriticalityLabel(vSecurityContext, v3DSpaceUrl, vCSRFToken, WAFData,vpayLoad, vCriticality, "SNFMaterialCriticatily");
											new UWA.createElement('div', {'class':'divParamValueRow',html:[{tag:'div','class':'paramlabel',html:'Material Criticality'},{tag:'div','class':'paramvalue',html:vCriticality}]}).inject(vNestedCell);
										}
									}
									
								}
								new UWA.createElement('div',{'class':'divTableCell right'}).inject(vDivTableParamRow);
							}
						}
						document.getElementById("loader").style.display = 'none';
					},
					onFailure: function (faildata) 
					{
						console.log(faildata);
						document.getElementById("loader").style.display = 'none';
					}
				});
			}
		}
		if(dcp == vHWPL_WPLObjList.length-1)
		{
			document.getElementById("loader").style.display = 'none';
		}
	}
}
async function getCriticalityLabel(vSecurityContext, v3DSpaceUrl, vCSRFToken, WAFData,vpayLoad, vRange, vAttrib)
{
	return new Promise((resolve,reject)=>{
	document.getElementById("loader").style.display = 'block';
	var vDictoURI = v3DSpaceUrl+'/resources/dictionary/properties?xrequestedwith=xmlhttprequest';
	WAFData.authenticatedRequest(vDictoURI,
	{
		method: 'POST',type: 'json',data:vpayLoad, headers: {'Accept': 'application/json','Content-Type': 'application/json','Accept-Language': widget.lang,'SecurityContext': vSecurityContext, 'ENO_CSRF_TOKEN': vCSRFToken},timeout: 1000 * 60 * 15,
		onComplete: function (prop_info)
		{		
			var vInfo = prop_info[0].info;
			var vAttribIndex = vInfo.findIndex(item => item.Name === vAttrib);
			var vAuthorizedValueIndex = (vInfo[vAttribIndex].AuthorizedValues).findIndex(item => item.Name === vRange);
			var vLabel = (vInfo[vAttribIndex].AuthorizedValues)[vAuthorizedValueIndex].NLS;
			resolve(vLabel);
		},
		onFailure: function (faildata) 
		{
			resolve(vRange);
			console.log(faildata);
			document.getElementById("loader").style.display = 'none';
		}
	});
	});
}

function loadResouceParamPlanforHOPandGOP(vParamTable, vSecurityContext, v3DSpaceUrl, vCSRFToken, WAFData, vOPId, objType)
{
	document.getElementById("loader").style.display = 'block';
	var vResPramURI = v3DSpaceUrl+'/resources/v1/modeler/dsprcs/dsprcs:MfgOperation/'+vOPId+'/dsprcs:ResourceParameterPlanInstance';
	WAFData.authenticatedRequest(vResPramURI,
	{
		method: 'GET',type: 'json',headers: {'Accept': 'application/json','Content-Type': 'application/json','Accept-Language': widget.lang,'SecurityContext': vSecurityContext},timeout: 1000 * 60 * 15,
		onComplete: function (op_RPPData)
		{		
			if(op_RPPData.hasOwnProperty('member'))
			{
				var vRPPData = op_RPPData.member;
				for(var rpp=0;rpp<vRPPData.length;rpp++)
				{
					var vRPPRows = vRPPData[rpp];
					if(vRPPRows.hasOwnProperty('reference'))
					{
						var vRPPId = vRPPRows.reference;
						getConnectedResourceParameterRows(vRPPId, vParamTable, vSecurityContext, v3DSpaceUrl, vCSRFToken, WAFData, objType, 0)
					}
				}
			}
			document.getElementById("loader").style.display = 'none';
		},
		onFailure: function (faildata) 
		{
			console.log(faildata);
			document.getElementById("loader").style.display = 'none';
		}
	});
}
async function getConnectedResourceParameterRows(vRPPId, vParamTable, vSecurityContext, v3DSpaceUrl, vCSRFToken, WAFData, objType, resultscount)
{
	var vRPPRowsDetailsURI = v3DSpaceUrl+'/resources/v1/modeler/dsprcs/dsprcs:ResourceParameterPlan/'+vRPPId+'/dsprcs:ResourceParameterRow';
	var vRPPRowsDetailsURI = vRPPRowsDetailsURI + '?$skip=' + resultscount;
	document.getElementById("loader").style.display = 'block';
	WAFData.authenticatedRequest(vRPPRowsDetailsURI,
	{
		method: 'GET',type: 'json',headers: {'Accept': 'application/json','Content-Type': 'application/json','Accept-Language': widget.lang,'SecurityContext': vSecurityContext,'ENO_CSRF_TOKEN': vCSRFToken},timeout: 1000 * 60 * 15,
		onComplete: async function (rpp_rowData)
		{
			if(rpp_rowData.hasOwnProperty('member'))
			{
				var vRPPParamRows = rpp_rowData.member;
				var vRSCParameters = widget.getValue("ResourceParamaters");
				for(var k=0;k<vRPPParamRows.length;k++)
				{
					document.getElementById("loader").style.display = 'block';
					
					var vParamDetails = vRPPParamRows[k];
					var vParamSymId = vParamDetails.symbolicResourceParamID;
					let vParindex = vRSCParameters.findIndex(item => item.symbolicResourceParamID === vParamSymId);
					var vRelatedParam = vRSCParameters[vParindex];
										
					var vDivTableParamRow;
					if(objType == 'wpl')
					{
						vDivTableParamRow = new UWA.createElement('div', {'class':'divTableRow', html:[{tag:'div','class':'divTableCell wplparamspace'},{'class':'divTableCell sep',html:'&larr;'}]}).inject(vParamTable);
					}
					else if(objType == 'HOP')
					{
						vDivTableParamRow = new UWA.createElement('div', {'class':'divTableRow', html:[{tag:'div','class':'divTableCell hopparamspace'},{'class':'divTableCell sep',html:'&larr;'}]}).inject(vParamTable);
					}
					else
					{
						vDivTableParamRow = new UWA.createElement('div', {'class':'divTableRow', html:[{'class':'divTableCell sep',html:'&larr;'}]}).inject(vParamTable);
					}
					new UWA.createElement('div', {html:'&nbsp;'}).inject(vParamTable);
					
					var vNestedCell;
					var vdivTableParamCell = new UWA.createElement('div', {'class':'divTableCell label contentPlaceholder param'}).inject(vDivTableParamRow);
					var vDivParamCaret = new UWA.createElement('div', {'class':'caret caret-down', styles:{'word-break':'break-all'}}).inject(vdivTableParamCell);
					
					
					var vDivParamSpan = new UWA.createElement('span',{'onClick':'toggleExpand(this)',html:'<strong>'+vRelatedParam.title+'(Equipment)</strong>'}).inject(vDivParamCaret);
					
					if(widget.getValue("Display_Option") === "Details_Mode")
					{
						vNestedCell = new UWA.createElement('div',{'class':'parameter nested active', 'onclick':'openProperties(event)',id:vParamDetails.id}).inject(vDivParamCaret);
					}
					else
					{
						vNestedCell = new UWA.createElement('div',{'class':'parameter nested', 'onclick':'openProperties(event)',id:vParamDetails.id}).inject(vDivParamCaret);
					}
					
					
					let vUnitLabel = "";
					if(vRelatedParam.paramType != 'Integer' && vRelatedParam.paramType != 'Text')
					{
						var vMagnitude = vParamDetails.maxValue.magnitude;
						var vUnitDisplay = vParamDetails.maxValue.displayUnit;	
						var vDimensions = widget.getValue("Dimensions");
						let vDimindex = vDimensions.findIndex(item => item.Name === vMagnitude);
						let vUnitDimension = (vDimensions[vDimindex])["Units"];
						let vUnitindex = vUnitDimension.findIndex(item => item.Name === vUnitDisplay);
						vUnitLabel = vUnitDimension[vUnitindex].NLSName;
					}
					
					if(vRelatedParam != undefined && vRelatedParam.hasOwnProperty('minValue'))
					{
						var vValue = await getConvertedValue(vSecurityContext, v3DSpaceUrl, vCSRFToken, WAFData, vRelatedParam.minValue);
						new UWA.createElement('div', {'class':'divParamValueRow',html:[{tag:'div','class':'paramlabel',html:'Resource Min'},{tag:'div','class':'paramvalue',html:vValue +'  '+ vUnitLabel}]}).inject(vNestedCell);
					}
					
					
					
					if(vParamDetails.paramType != 'Integer' && vParamDetails.paramType != 'Text')
					{
						//Failure Minimum Value
						if(vParamDetails.hasOwnProperty('eofMinLimit'))
						{
							if(vParamDetails.eofMinLimit != 'NotSet')
							{
								var vValue = '';
								if(vParamDetails.hasOwnProperty('eofMinValue'))
								{
									vValue = vParamDetails.eofMinValue.inputValue;
									if(vValue == '' || vValue == 'undefined');
									{
										vValue = await getConvertedValue(vSecurityContext, v3DSpaceUrl, vCSRFToken, WAFData, vParamDetails.eofMinValue);
									}
								}
								new UWA.createElement('div', {'class':'divParamValueRow',html:[{tag:'div','class':'paramlabel',html:'Failure Min'},{tag:'div','class':'paramvalue',html:vValue +'  '+ vUnitLabel}]}).inject(vNestedCell);
							}
							else
							{
								new UWA.createElement('div', {'class':'divParamValueRow',html:[{tag:'div','class':'paramlabel',html:'Failure Min'},{tag:'div','class':'paramvalue',html:''}]}).inject(vNestedCell);
							}
						}
						
						//Acceptable Minimum Value
						if(vParamDetails.hasOwnProperty('minLimit'))
						{
							if(vParamDetails.minLimit != 'NotSet')
							{
								var vValue = '';
								if(vParamDetails.hasOwnProperty('minValue'))
								{
									vValue = vParamDetails.minValue.inputValue;
									if(vValue == '' || vValue == 'undefined');
									{
										vValue = await getConvertedValue(vSecurityContext, v3DSpaceUrl, vCSRFToken, WAFData, vParamDetails.minValue);
									}
								}
								new UWA.createElement('div', {'class':'divParamValueRow',html:[{tag:'div','class':'paramlabel',html:'Acceptable Min'},{tag:'div','class':'paramvalue',html:vValue +'  '+ vUnitLabel}]}).inject(vNestedCell);
							}
							else
							{
								new UWA.createElement('div', {'class':'divParamValueRow',html:[{tag:'div','class':'paramlabel',html:'Acceptable Min'},{tag:'div','class':'paramvalue',html:''}]}).inject(vNestedCell);
							}
						}
						
						//Normal Minimum Value
						if(vParamDetails.hasOwnProperty('controlMinLimit'))
						{
							if(vParamDetails.controlMinLimit != 'NotSet')
							{
								var vValue = '';
								if(vParamDetails.hasOwnProperty('controlMinValue'))
								{
									vValue = vParamDetails.controlMinValue.inputValue;
									if(vValue == '' || vValue == 'undefined');
									{
										vValue = await getConvertedValue(vSecurityContext, v3DSpaceUrl, vCSRFToken, WAFData, vParamDetails.controlMinValue);
									}
								}
								new UWA.createElement('div', {'class':'divParamValueRow',html:[{tag:'div','class':'paramlabel',html:'Normal Min'},{tag:'div','class':'paramvalue',html:vValue +'  '+ vUnitLabel}]}).inject(vNestedCell);
							}
							else
							{
								new UWA.createElement('div', {'class':'divParamValueRow',html:[{tag:'div','class':'paramlabel',html:'Normal Min'},{tag:'div','class':'paramvalue',html:''}]}).inject(vNestedCell);
							}
						}
						
						//Nominal Value
						if(vParamDetails.hasOwnProperty('nominalValue'))
						{
							var vValue = '';
							if(vParamDetails.isValueSet != false)
							{
								vValue = vParamDetails.nominalValue.inputValue;
								if(vValue == '' || vValue == 'undefined');
								{
									vValue = await getConvertedValue(vSecurityContext, v3DSpaceUrl, vCSRFToken, WAFData, vParamDetails.nominalValue);
								}
							}
							new UWA.createElement('div', {'class':'divParamValueRow',html:[{tag:'div','class':'paramlabel',html:'Value(s)'},{tag:'div','class':'paramvalue',html:vValue +'  '+ vUnitLabel}]}).inject(vNestedCell);
						}
						
						//Normal Maximum Value
						if(vParamDetails.hasOwnProperty('controlMaxLimit'))
						{
							if(vParamDetails.controlMaxLimit != 'NotSet')
							{
								var vValue = '';
								if(vParamDetails.hasOwnProperty('controlMaxValue'))
								{
									vValue = vParamDetails.controlMaxValue.inputValue;
									if(vValue == '' || vValue == 'undefined');
									{
										vValue = await getConvertedValue(vSecurityContext, v3DSpaceUrl, vCSRFToken, WAFData, vParamDetails.controlMaxValue);
									}
								}
								new UWA.createElement('div', {'class':'divParamValueRow',html:[{tag:'div','class':'paramlabel',html:'Normal Max'},{tag:'div','class':'paramvalue',html:vValue +'  '+ vUnitLabel}]}).inject(vNestedCell);
							}
							else
							{
								new UWA.createElement('div', {'class':'divParamValueRow',html:[{tag:'div','class':'paramlabel',html:'Normal Max'},{tag:'div','class':'paramvalue',html:''}]}).inject(vNestedCell);
							}
						}
						
						//Acceptable Maximum Value
						if(vParamDetails.hasOwnProperty('maxLimit'))
						{
							if(vParamDetails.maxLimit != 'NotSet')
							{
								var vValue = '';
								if(vParamDetails.hasOwnProperty('maxValue'))
								{
									vValue = vParamDetails.maxValue.inputValue;
									if(vValue == '' || vValue == 'undefined');
									{
										vValue = await getConvertedValue(vSecurityContext, v3DSpaceUrl, vCSRFToken, WAFData, vParamDetails.maxValue);
									}
								}
								new UWA.createElement('div', {'class':'divParamValueRow',html:[{tag:'div','class':'paramlabel',html:'Acceptable Max'},{tag:'div','class':'paramvalue',html:vValue +'  '+ vUnitLabel}]}).inject(vNestedCell);
							}
							else
							{
								new UWA.createElement('div', {'class':'divParamValueRow',html:[{tag:'div','class':'paramlabel',html:'Acceptable Max'},{tag:'div','class':'paramvalue',html:''}]}).inject(vNestedCell);
							}
						}
						
						//Failure Maximum Value
						if(vParamDetails.hasOwnProperty('eofMaxLimit'))
						{
							if(vParamDetails.eofMaxLimit != 'NotSet')
							{
								var vValue = '';
								if(vParamDetails.hasOwnProperty('eofMaxValue'))
								{
									vValue = vParamDetails.eofMaxValue.inputValue;
									if(vValue == '' || vValue == 'undefined');
									{
										vValue = await getConvertedValue(vSecurityContext, v3DSpaceUrl, vCSRFToken, WAFData, vParamDetails.eofMaxValue);
									}
								}
								new UWA.createElement('div', {'class':'divParamValueRow',html:[{tag:'div','class':'paramlabel',html:'Failure Max'},{tag:'div','class':'paramvalue',html:vValue +'  '+ vUnitLabel}]}).inject(vNestedCell);
							}
							else
							{
								new UWA.createElement('div', {'class':'divParamValueRow',html:[{tag:'div','class':'paramlabel',html:'Failure Max'},{tag:'div','class':'paramvalue',html:''}]}).inject(vNestedCell);
							}
						}
					}
					
					if(vRelatedParam != undefined && vRelatedParam.hasOwnProperty('maxValue'))
					{
						var vValue = await getConvertedValue(vSecurityContext, v3DSpaceUrl, vCSRFToken, WAFData, vRelatedParam.maxValue);
						new UWA.createElement('div', {'class':'divParamValueRow',html:[{tag:'div','class':'paramlabel',html:'Resource Max'},{tag:'div','class':'paramvalue',html:vValue +'  '+ vUnitLabel}]}).inject(vNestedCell);
					}
					
					else if(vParamDetails.paramType == 'Integer')
					{
						//Acceptable Minimum Value
						if(vParamDetails.hasOwnProperty('minLimit'))
						{
							if(vParamDetails.minLimit != 'NotSet')
							{
								var vValue = '';
								if(vParamDetails.hasOwnProperty('minValue'))
								{
									vValue = vParamDetails.minValue.value;
								}
								new UWA.createElement('div', {'class':'divParamValueRow',html:[{tag:'div','class':'paramlabel',html:'Acceptable Min'},{tag:'div','class':'paramvalue',html:vValue}]}).inject(vNestedCell);
							}
							else
							{
								new UWA.createElement('div', {'class':'divParamValueRow',html:[{tag:'div','class':'paramlabel',html:'Acceptable Min'},{tag:'div','class':'paramvalue',html:''}]}).inject(vNestedCell);
							}
						}
						
						//Normal Minimum Value
						if(vParamDetails.hasOwnProperty('controlMinLimit'))
						{
							if(vParamDetails.controlMinLimit != 'NotSet')
							{
								var vValue = '';
								if(vParamDetails.hasOwnProperty('controlMinValue'))
								{
									vValue = vParamDetails.controlMinValue.value;
								}
								new UWA.createElement('div', {'class':'divParamValueRow',html:[{tag:'div','class':'paramlabel',html:'Normal Min'},{tag:'div','class':'paramvalue',html:vValue}]}).inject(vNestedCell);
							}
							else
							{
								new UWA.createElement('div', {'class':'divParamValueRow',html:[{tag:'div','class':'paramlabel',html:'Normal Min'},{tag:'div','class':'paramvalue',html:''}]}).inject(vNestedCell);
							}
						}
						
						//Possible Values
						if(vParamDetails.hasOwnProperty('possibleValues'))
						{
							var vValue = '';
							if(vParamDetails.isValueSet != false)
							{
								vValue = (vParamDetails.possibleValues).toString();
							}
							new UWA.createElement('div', {'class':'divParamValueRow',html:[{tag:'div','class':'paramlabel',html:'Value(s)'},{tag:'div','class':'paramvalue',html:vValue}]}).inject(vNestedCell);
						}
						else if(vParamDetails.hasOwnProperty('paramValue'))
						{
							var vValue = (vParamDetails.paramValue.value).toString();
							new UWA.createElement('div', {'class':'divParamValueRow',html:[{tag:'div','class':'paramlabel',html:'Value(s)'},{tag:'div','class':'paramvalue',html:vValue}]}).inject(vNestedCell);
						}
						
						//Normal Maximum Value
						if(vParamDetails.hasOwnProperty('controlMaxLimit'))
						{
							if(vParamDetails.controlMaxLimit != 'NotSet')
							{
								var vValue = '';
								if(vParamDetails.hasOwnProperty('controlMaxValue'))
								{
									vValue = vParamDetails.controlMaxValue.value;
								}
								new UWA.createElement('div', {'class':'divParamValueRow',html:[{tag:'div','class':'paramlabel',html:'Normal Max'},{tag:'div','class':'paramvalue',html:vValue}]}).inject(vNestedCell);
							}
							else
							{
								new UWA.createElement('div', {'class':'divParamValueRow',html:[{tag:'div','class':'paramlabel',html:'Normal Max'},{tag:'div','class':'paramvalue',html:''}]}).inject(vNestedCell);
							}
						}
						
						//Acceptable Maximum Value
						if(vParamDetails.hasOwnProperty('maxLimit'))
						{
							if(vParamDetails.maxLimit != 'NotSet')
							{
								var vValue = '';
								if(vParamDetails.hasOwnProperty('maxValue'))
								{
									vValue = vParamDetails.maxValue.value;
								}
								new UWA.createElement('div', {'class':'divParamValueRow',html:[{tag:'div','class':'paramlabel',html:'Acceptable Max'},{tag:'div','class':'paramvalue',html:vValue}]}).inject(vNestedCell);
							}
							else
							{
								new UWA.createElement('div', {'class':'divParamValueRow',html:[{tag:'div','class':'paramlabel',html:'Acceptable Max'},{tag:'div','class':'paramvalue',html:''}]}).inject(vNestedCell);
							}
						}
					}
					
					if(vParamDetails.paramType == 'Text')
					{
						//Possible Values
						if(vParamDetails.hasOwnProperty('possibleValues'))
						{
							var vValue = '';
							if(vParamDetails.isValueSet != false)
							{
								vValue = (vParamDetails.possibleValues).toString();
							}
							new UWA.createElement('div', {'class':'divParamValueRow',html:[{tag:'div','class':'paramlabel',html:'Value(s)'},{tag:'div','class':'paramvalue',html:vValue}]}).inject(vNestedCell);
						}
					}
					
					if(vParamDetails.type == 'DELResourcePrmPlanSET')
					{
						//new UWA.createElement('div', {'class':'divParamValueRow',html:'Mode : SET'}).inject(vNestedCell);
						new UWA.createElement('div', {'class':'divParamValueRow',html:[{tag:'div','class':'paramlabel',html:'Mode'},{tag:'div','class':'paramvalue',html:'SET'}]}).inject(vNestedCell);
					}
					if(vParamDetails.type == 'DELResourcePrmPlanGET')
					{
						//new UWA.createElement('div', {'class':'divParamValueRow',html:'Mode : GET'}).inject(vNestedCell);
						new UWA.createElement('div', {'class':'divParamValueRow',html:[{tag:'div','class':'paramlabel',html:'Mode'},{tag:'div','class':'paramvalue',html:'GET'}]}).inject(vNestedCell);
					}

					var vCriticalityValue = await getCriticalityValue(WAFData,v3DSpaceUrl,vSecurityContext,vParamDetails);
					//var vCriticality = new UWA.createElement('div', {'class':'divParamValueRow', html:'Criticality : '+vCriticalityValue}).inject(vNestedCell);
					new UWA.createElement('div', {'class':'divParamValueRow',html:[{tag:'div','class':'paramlabel',html:'Process Criticality'},{tag:'div','class':'paramvalue',html:vCriticalityValue}]}).inject(vNestedCell);
					
					
					new UWA.createElement('div',{'class':'divTableCell right'}).inject(vDivTableParamRow);
										
					document.getElementById("loader").style.display = 'none';
				}
				if(vRPPParamRows.length == 10)
				{
					resultscount = resultscount + 10;
					getConnectedResourceParameterRows(vRPPId, vParamTable, vSecurityContext, v3DSpaceUrl, vCSRFToken, WAFData, objType, resultscount)
				}
			}
			
		},
		onFailure: function (faildata) 
		{
			console.log(faildata);
			document.getElementById("loader").style.display = 'none';
		}
	});
	document.getElementById("loader").style.display = 'none';
}
async function getRPPIntValue(WAFData, vSecurityContext, v3DSpaceUrl, vRPPId, vObjId)
{
	return new Promise((resolve,reject)=>{
	var vRPPIntRowDetailsURI = 	v3DSpaceUrl+'/resources/v1/modeler/dsprcs/dsprcs:ResourceParameterPlan/'+vRPPId+'/dsprcs:ResourceParameterRow/'+vObjId;
	document.getElementById("loader").style.display = 'block';
	WAFData.authenticatedRequest(vRPPIntRowDetailsURI,
	{
		method: 'GET',type: 'json',headers: {'Accept': 'application/json','Content-Type': 'application/json','Accept-Language': widget.lang,'SecurityContext': vSecurityContext},timeout: 1000 * 60 * 15,
		onComplete: async function (rpp_introwData)
		{
			
			if(rpp_introwData.hasOwnProperty('member'))
			{
				var rowmember = rpp_introwData.member;
				if(rowmember[0].hasOwnProperty('paramValue'))
				{
					resolve((rowmember[0].paramValue).value);
				}
				else if(rowmember[0].hasOwnProperty('possibleValues'))
				{
					resolve((rowmember[0].possibleValues).toString());
				}
				else
				{
					resolve('');
				}
			}
			else
			{
				resolve();
			}
			document.getElementById("loader").style.display = 'none';
		},
		onFailure: function(faildata)
		{
			console.log(faildata);
			resolve();
			document.getElementById("loader").style.display = 'none';
		}
	});
	});
}
async function getCriticalityValue(WAFData,v3DSpaceUrl,vSecurityContext,vParamDetails)
{
	document.getElementById("loader").style.display = 'block';
	return new Promise((resolve,reject)=>{
	var vRPPRowPropURI = v3DSpaceUrl +'/resources/v1/collabServices/attributes/op/read?xrequestedwith=xmlhttprequest';
	WAFData.authenticatedRequest(vRPPRowPropURI,{
		method: 'POST',type: 'json', data:'{"busIDs":["'+vParamDetails.id+'"]}', headers: {'Accept': 'application/json','Content-Type': 'application/json','Accept-Language': widget.lang,'SecurityContext': vSecurityContext},timeout: 1000 * 60 * 15,
		onComplete: async function (propData)
		{
			if(propData.hasOwnProperty('results'))
			{
				if(((propData.results)[0]).hasOwnProperty('data'))
				{
					var vRPPRowData = (propData.results[0]).data;
					let vRowindex = vRPPRowData.findIndex(item => item.extension === 'SNFResourceParameterRowExtension');
					if(vRowindex != undefined && vRowindex>=0)
					{
						var vCriticalityValue = (vRPPRowData[vRowindex].value).toString();
						resolve(vCriticalityValue);
					}
					else
					{
						resolve("");
					}
				}
			}
			document.getElementById("loader").style.display = 'none';
		},
		onFailure: function (faildata) 
		{
			console.log(faildata);
			document.getElementById("loader").style.display = 'none';
		}
	});
	});
}
async function getClassificationValue(WAFData,v3DSpaceUrl,vSecurityContext,vObjId)
{
	document.getElementById("loader").style.display = 'block';
	return new Promise((resolve,reject)=>{
	var vRPPRowPropURI = v3DSpaceUrl +'/resources/v1/modeler/dslib/dslib:ClassifiedItem/'+vObjId+'?$mask=dslib:ReverseClassificationMask';
	WAFData.authenticatedRequest(vRPPRowPropURI,{
		method: 'GET',type: 'json', headers: {'Accept': 'application/json','Content-Type': 'application/json','Accept-Language': widget.lang,'SecurityContext': vSecurityContext},timeout: 1000 * 60 * 15,
		onComplete: async function (classData)
		{
			if(classData.hasOwnProperty('member'))
			{
				if((classData.member)[0].hasOwnProperty('ParentClassification'))
				{
					var vParentClassification = (classData.member)[0].ParentClassification;
					if(vParentClassification.hasOwnProperty('member'))
					{
						resolve(vParentClassification.member[0].title);
					}
					else
					{
						resolve("");
					}
				}
				else
				{
					resolve("");
				}
			}
			else
			{
				resolve("");
			}
			document.getElementById("loader").style.display = 'none';
		},
		onFailure: function (faildata) 
		{
			resolve("");
			console.log(faildata);
			document.getElementById("loader").style.display = 'none';
		}
	});
	});
}

async function getConvertedValue(vSecurityContext, v3DSpaceUrl, vCSRFToken, WAFData,  vParamDetails)
{
	return new Promise((resolve,reject)=>{
	document.getElementById("loader").style.display = 'block';
	var vGetDCPRowsCovertURI 	= v3DSpaceUrl+'/resources/dictionary/dimensions/convertValue';
	if(vParamDetails.unit != vParamDetails.displayUnit)
	{
		WAFData.authenticatedRequest(vGetDCPRowsCovertURI,
		{
			method: 'POST',type: 'json', data:'{"Dimension":"'+ vParamDetails.magnitude +'","UnitFrom":"'+ vParamDetails.unit +'","UnitTo":"'+ vParamDetails.displayUnit +'","Value":"'+ vParamDetails.value +'"}', headers: {'Accept': 'application/json','Content-Type': 'application/json','Accept-Language': widget.lang,'SecurityContext': vSecurityContext,'ENO_CSRF_TOKEN': vCSRFToken},timeout: 1000 * 60 * 15,
			onComplete: function (paramValues)
			{
				if(paramValues.hasOwnProperty('ConvertValue'))
				{
					if(paramValues.ValueToConvert != 0.0)
					{
						//vValueDiv.innerHTML =  vAttrib + ' : ' + parseFloat(paramValues.ConvertValue).toFixed(2);
						resolve(parseFloat(paramValues.ConvertValue));
					}
					else
					{
						//vValueDiv.innerHTML =  vAttrib + ' : ' + parseFloat(paramValues.ValueToConvert).toFixed(2);
						resolve(parseFloat(paramValues.ValueToConvert));
					}
				}
				
				document.getElementById("loader").style.display = 'none';
			},
			onFailure: function(faildata)
			{
				console.log(faildata);
				resolve();
				document.getElementById("loader").style.display = 'none';
			}
		});
	}
	else
	{
		document.getElementById("loader").style.display = 'none';
		resolve(vParamDetails.value);
	}
	});
} 
function refreshConfirm(response) 
{
	var refreshElement = document.getElementById("customPopup");
	var myHomePage = UWA.createElement('div', {'class': 'homepage',html: 'Drop Recipe'});
	if(response == "yes")
	{
		
		var vLoader = UWA.createElement('div', {'class':'loader', id:'loader'});
		//var vExportButton = UWA.createElement('div',{'class':'box', html:'<div class="box" ><select onChange="exportPDF(this.value)"><option>Export</option><option>PDF - AS-IS</option><option>PDF - Simplified</option><option>Excel - Simplified</option><option>Export to ERP(iShift)</option></select>'});
		var vExportButton = UWA.createElement('div',{'class':'box', html:'<div class="box" ><select onChange="exportPDF(this.value)"><option>Export</option><option>PDF - AS-IS</option><option>PDF - Simplified</option><option>Excel - Simplified</option></select>'});

		var vLastRecipeID = widget.getValue("Last_Used_Recipe");
		
		refreshElement.style.display = "none";
		if (vLastRecipeID != null && vLastRecipeID != "undefined") 
		{
			widget.body.empty();
			vLoader.inject(widget.body);
			require(["DS/DataDragAndDrop/DataDragAndDrop","DS/WAFData/WAFData",'DS/PlatformAPI/PlatformAPI'],function (DataDragAndDrop, WAFData, PlatformAPI)
			{
				var v3DSpaceUrl = PlatformAPI.getApplicationConfiguration('app.urls.myapps');
				var vCSRFTokenURI = v3DSpaceUrl+"/resources/v1/application/E6WFoundation/CSRF";
				WAFData.authenticatedRequest(vCSRFTokenURI,
				{
					method: 'GET',type: 'json',headers: {'Accept': 'application/json','Content-Type': 'application/json','Accept-Language': widget.lang},timeout: 1000 * 60 * 15,
					onComplete: function (csfrData)
					{
						loadHeaderData(vLastRecipeID, ((csfrData.csrf).value), v3DSpaceUrl);
					},
					onFailure: function (faildata) 
					{
						console.log(faildata);
					}
				});	
			});			
		}
		else 
		{
			widget.body.empty();
			myHomePage.inject(widget.body);
		}
	}
	else if(response == "no") 
	{
		refreshElement.style.display = "none";
		if(widget.getValue("Load_Last_used_Recipe") == false)
		{
			widget.body.empty();
			myHomePage.inject(widget.body);
			var confirmPopup = UWA.createElement('div', {'class':'customPopup',id:'customPopup', html:[{tag:'div', 'class':'customPopupBG',html:[{tag:'p', html:'Do you want to refresh the current recipe?'},{tag:'button', id:'popupYesBtn', 'onClick':'refreshConfirm(\"yes\")', html:'Yes'},{tag:'button', id:'popupNoBtn', 'onClick':'refreshConfirm(\"no\")', html:'No'}]}]});
			confirmPopup.inject(widget.body);
		}

	}	
}

var allNested = {};
allNested['materialitems nested'] = false;
allNested['parameter nested'] = false;
allNested['equipment nested'] = false;
allNested['generalOperation'] = false;

function toggleExpand(elem) {
    elem.parentNode.querySelector(".nested").classList.toggle("active");
    elem.parentNode.classList.toggle("caret-down");
	
}

function toggleGlobalExpandGenOP(elem, b = null) {
    if (b === null) {
        allNested['generalOperation'] = !allNested['generalOperation'];
    } else {
        allNested['generalOperation'] = b;
    }
    toggleGlobalExpand(elem, "parameter nested", allNested['generalOperation']);
    toggleGlobalExpand(elem, "materialitems nested", allNested['generalOperation']);
    toggleGlobalExpand(elem, "equipment nested", allNested['generalOperation']);
    return allNested['generalOperation'];
}

function toggleGlobalExpand(elem, className, b = null) {
    var matches = document.getElementsByClassName(className);
    if (b === null) {
        allNested[className] = !allNested[className];
    } else {
        allNested[className] = b;
    }
  elem.classList.toggle("caret-down");
    for (let i = 0; i < matches.length; i++) {
     matches.item(i).parentNode.classList.toggle("caret-down");
        if (allNested[className]) {
            matches.item(i).classList.remove("active");
        } else {
            matches[i].classList.add("active");
        }
    }
    return allNested[className];
}

function toggleGlobalExpandParameter(elem, b = null) {
    var matches = document.getElementsByClassName("parameter");
    if (b === null) {
        allNested["parameter"] = !allNested["parameter"];
    } else {
        allNested["parameter"] = b;
    }
    elem.classList.toggle("caret-down");
    for (let i = 0; i < matches.length; i++) {
        matches.item(i).parentNode.classList.toggle("caret-down");
        if (allNested["parameter"]) {
            matches.item(i).classList.remove("active");
        } else {
            matches[i].classList.add("active");
        }
    }
    return allNested["parameter"];
}

function toggleGlobalExpandEquipment(elem, b = null) {
    var matches = document.getElementsByClassName("equipment");
    if (b === null) {
        allNested["equipment"] = !allNested["equipment"];
    } else {
        allNested["equipment"] = b;
    }
    elem.classList.toggle("caret-down");
    for (let i = 0; i < matches.length; i++) {
        matches.item(i).parentNode.classList.toggle("caret-down");
        if (allNested["equipment"]) {
            matches.item(i).classList.remove("active");
        } else {
            matches[i].classList.add("active");
        }
    }
    return allNested["equipment"];
}

function toggleGlobalExpandMaterial(elem, b = null) {
    var matches = document.getElementsByClassName("materialitems");
    if (b === null) {
        allNested["materialitems"] = !allNested["materialitems"];
    } else {
        allNested["materialitems"] = b;
    }
    elem.classList.toggle("caret-down");
    for (let i = 0; i < matches.length; i++) {
        matches.item(i).parentNode.classList.toggle("caret-down");
        if (allNested["materialitems"]) {
            matches.item(i).classList.remove("active");
        } else {
            matches[i].classList.add("active");
        }
    }
    return allNested["materialitems"];
}
function closeProperties()
{
	var vPropDiv = document.getElementById('propContainer')
	if(vPropDiv)
	{
		vPropDiv.remove(widget.body);
	}
}
function openProperties(event) {
	var parentDiv = event.currentTarget;
	var vSecurityContext = widget.getValue("SecurityContext");
    require(["DS/WAFData/WAFData", 'DS/PlatformAPI/PlatformAPI'], function (WAFData, PlatformAPI) {
        var v3DSpaceUrl = PlatformAPI.getApplicationConfiguration('app.urls.myapps');
        var propertiesURL = v3DSpaceUrl + '/resources/v1/collabServices/attributes/op/read';
        var vObjectId = parentDiv.id;
		document.getElementById("loader").style.display = 'block';
        WAFData.authenticatedRequest(propertiesURL,{
			method: 'POST',type: 'json', data:'{"busIDs":["'+vObjectId+'"]}', headers: {'Accept': 'application/json','Content-Type': 'application/json','Accept-Language': widget.lang,'SecurityContext': vSecurityContext},timeout: 1000 * 60 * 15,
			onComplete: function (propData)
			{
				var vTypeIconLarge = propData.results[0].type_icon_large_url;
				var vTypeIconSmall = propData.results[0].type_icon_url;
				var vType = propData.results[0].type;
				var vPropBasicData = propData.results[0].basicData;
				var vPropData = propData.results[0].data;

				var vFinalProps = vPropBasicData.concat(vPropData);
				vFinalProps.sort((a, b) => (a.UIPosition > b.UIPosition ? 1 : -1));
				var strTitle;
				var strRevision;
				var strOwner ;
				var strModifiedDate;
				
				for(var v=0;v<vFinalProps.length;v++)
				{
					if(!vFinalProps[v].hasOwnProperty('extension'))
					{
						if(vFinalProps[v].hasOwnProperty('nls'))
						{
							var vNLSLabel = vFinalProps[v].nls;
							if(vNLSLabel == 'Title')
							{
								if(vType == 'PLMSpecifyHowToCollectDataCnx' || vType =="DELResourcePrmPlanSET" || vType =="DELResourcePrmPlanGET")
								{
									strTitle = parentDiv.previousSibling.textContent;
								}
								else
								{
									strTitle = (vFinalProps[v].value).toString();
								}
							}
							else if(vNLSLabel == 'Revision')
							{
								if(vFinalProps[v].hasOwnProperty('value'))
								{
									strRevision = (vFinalProps[v].value).toString();
								}
								else
								{
									strRevision = '';
								}
							}
							else if(vNLSLabel == 'Owner')
							{
								strOwner = (vFinalProps[v].value).toString();
							}
							else if(vNLSLabel == 'Modification Date')
							{
								strModifiedDate = (vFinalProps[v].value).toString();
							}
						}
					}
				}				
				
				strModifiedDate = new Date(Date.parse(strModifiedDate)).toLocaleString('en-US', { timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone });
				
				closeProperties();
				var vPropContainer = UWA.createElement('div',{'class':'propContainer',id:'propContainer',styles:{display:'block'}});
				var vPropWindowTopBar = UWA.createElement('div',{'class':'window-titlebar', html:[{tag:'div','class':'window-header-title',html:[{tag:'div','class':'window-placeholder', html:[{tag:'p',html:'Information'}]}]},{tag:'div','class':'window-header-buttons-div', html:[{tag:'button', type:'button','class':'window-header-close',onClick:'closeProperties()'}]}]});
				var vPropTitleContent = UWA.createElement('div',{'class':'window-maincontent',html:[{tag:'div','class':'window-content', html:[{tag:'div','class':'properties-container',id:'PROPERTIES', html:[{tag:'div','class':'ICTableContainer', html:[{tag:'div','class':'thumbnail', html:[{tag:'img', src:vTypeIconLarge}]},{tag:'div','class':'TitleAttributes', html:[{tag:'div', 'class':'ObjectHeaderTitle',html:[{tag:'div','class':'ObjectTitle', html:'<strong>'+strTitle+'</strong>'},{tag:'div','class':'ObjectRevision',html:'<strong>'+strRevision+'</strong>'}]},{tag:'div', 'class':'ObjectHeaderDetails',html:[{tag:'div','class':'ObjectOwner',html:'<strong>'+strOwner+'</strong>'},{tag:'div','class':'ObjectModification',html:'<strong>'+strModifiedDate+'</strong>'}]}]}]}]}]}]});
				
				var vPropAttribInformation = UWA.createElement('div',{'class':'window-attributes'});
				var vPropAttribInfoTable = UWA.createElement('div',{'class':'attribute-table'}).inject(vPropAttribInformation);
				var vPropAttribInfoTablelvl1 = UWA.createElement('div',{'class':'attribute-table-level1'}).inject(vPropAttribInfoTable);
				var vResizeHandler = UWA.createElement('div',{'class':'resizeHandler'}).inject(vPropAttribInfoTable);
				var vDataandValue = UWA.createElement('div',{'class':'formTable'}).inject(vPropAttribInfoTablelvl1);
				for(var i=0;i<vFinalProps.length;i++)
				{
					
					if(!vFinalProps[i].hasOwnProperty('extension'))
					{
						var vLabel;
						if(vFinalProps[i].hasOwnProperty('nls'))
						{
							vLabel = vFinalProps[i].nls;
							var vValue;
							if(vFinalProps[i].hasOwnProperty('value'))
							{
								vValue = (vFinalProps[i].value).toString();
								if(vFinalProps[i].hasOwnProperty('dimension'))
								{
									vValue = vValue + ' ' + vFinalProps[i].dimension;
								}
							}
							else
							{
								vValue = '';
							}
							
							
							if(vLabel == 'Title')
							{
								if(vType == 'PLMSpecifyHowToCollectDataCnx' || vType =="DELResourcePrmPlanSET" || vType =="DELResourcePrmPlanGET")
								{
									vValue = parentDiv.previousSibling.textContent;
								}
							}
							
							
							if(vValue!= '' && vLabel.includes('Date'))
							{
								vValue = new Date(Date.parse(vValue)).toLocaleString('en-US', { timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone });
							}
							if(vLabel == 'Type')
							{
								UWA.createElement('div',{'class':'datalabelandvalue', html:[{tag:'div','class':'datalabel',html:vLabel},{tag:'div','class':'datavalue',html:[{tag:'img', src:vTypeIconSmall, styles:{'margin-right':'5px','max-width':'20px','vertical-align':'middle','border':'0', 'object-fit':'contain'}},{tag:'div',html:vValue,styles:{'width':'100%'}}]}]}).inject(vDataandValue);
							}
							else
							{
								UWA.createElement('div',{'class':'datalabelandvalue', html:[{tag:'div','class':'datalabel',html:vLabel},{tag:'div','class':'datavalue',html:vValue}]}).inject(vDataandValue);
							}
						}
					}
				}
				if(vType == 'PLMSpecifyHowToCollectDataCnx' || vType =="DELResourcePrmPlanSET" || vType =="DELResourcePrmPlanGET")
				{
					//const vParamValues = Array.from(parentDiv.children, ({textContent}) => textContent.trim()).filter(Boolean);
					const vParamValues = Array.from(parentDiv.children);
					for(var p=0;p<vParamValues.length;p++)
					{
						var vLabel = vParamValues[p].childNodes[0].textContent;
						var vValue = vParamValues[p].childNodes[1].textContent;;
						//UWA.createElement('div',{'class':'datalabelandvalue', html:[{tag:'div','class':'datalabel',html:(vParamValues[p].split('  '))[0]},{tag:'div','class':'datavalue',html:(vParamValues[p].split('  '))[1]}]}).inject(vDataandValue);
						UWA.createElement('div',{'class':'datalabelandvalue', html:[{tag:'div','class':'datalabel',html:vLabel},{tag:'div','class':'datavalue',html:vValue}]}).inject(vDataandValue);
					}
				}
				vPropWindowTopBar.inject(vPropContainer);
				vPropTitleContent.inject(vPropContainer);
				vPropAttribInformation.inject(vPropContainer);
				vPropContainer.inject(widget.body);
				document.getElementById("loader").style.display = 'none';
			}
		});
    });
}
function hidePopup() {
    var popup = document.getElementById("popup");
    popup.style.display = "none"
}

function dragElement() {
    var elmnt = document.getElementById("mydiv");
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    if (document.getElementById(elmnt.id + "header")) {
        /* if present, the header is where you move the DIV from:*/
        document.getElementById(elmnt.id + "header").onmousedown = dragMouseDown;
    } else {
        /* otherwise, move the DIV from anywhere inside the DIV:*/
        elmnt.onmousedown = dragMouseDown;
    }

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        // get the mouse cursor position at startup:
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        // call a function whenever the cursor moves:
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        // calculate the new cursor position:
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        // set the element's new position:
        elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
        elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
        /* stop moving when mouse button is released:*/
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

function exportPDF(exporttype) 
{
	if(document.getElementById('loader').style.display == 'none')
	{
		var vDataForPDF = widget.body;
		var vElemLength = vDataForPDF.childNodes.length;
		var vExportData = ""
		if(exporttype == 'PDF - AS-IS')
		{
			vExportData = '<style>@media print { @page {size: A3 landscape;}} body {-webkit-print-color-adjust: exact;}.info-table {text-align: center;}table {width: 100%; border-collapse: collapse; background-color: #f2f2f2; color: black; text-align:center;}td {width: 16.6%; border:1px solid #dddddd; padding: 5px;}.divTable, .divTableRow, .divTableCell, .divTableHead, .divTableContent {border: 0px; padding: 0px; margin: 0px;}.divTable {display: table; width: 100%; border-style: solid; border-color:black; border-collapse: separate; border-spacing: 0px 0px;}.divTableRow {display: table-row; width: 100%; border-style: solid; border-color: white;}.divTableCell, .divTableHead {display: table-cell; border-style: solid; border-color:blue;}.divTableCell.contentPlaceholder {padding: 4px 4px 4px 4px; width: 13.68vw;}.divTableCell.contentPlaceholderEmpty {padding: 4px 4px 4px 4px; width: 13.68vw;}.divTableCell.label {vertical-align: middle; background-color: rgb(0, 86, 133);color: white;}.divTableCell.sep {vertical-align: middle; text-align: center; width: 2.40vw; }.divTableCell.materialspace {vertical-align: middle; text-align: center; width: 66.45vw; }.divTableCell.hopmaterialspace {vertical-align: middle; text-align: center; width: 50vw; }.divTableCell.gopmaterialspace {vertical-align: middle; text-align: center; width: 33.2vw; }.divTableCell.resourcespace {vertical-align: middle; text-align: center; width: 50vw; }.divTableCell.hopresourcespace {vertical-align: middle; text-align: center; width: 33.20vw; }.divTableCell.gopresourcespace {vertical-align: middle; text-align: center; width: 16.5vw; }.divTableCell.hopparamspace {vertical-align: middle; text-align: center; width: 16.5vw; }.divTableCell.wplparamspace {vertical-align: middle; text-align: center; width: 33.2vw; }.divTableCell.right {border-style: dashed; border-color:black;}.divTableBody {display: table-row-group; }.divTableContent {padding: 4px 4px 4px 4px; background-color: white ; width: 13.68vw; text-align: center;}.divParamValueRow {padding: 2px 2px 2px 2px; display:flex; border: 1px solid #ffffff;}.paramlabel {padding:2px 2px 2px 2px; flex-basis:50%}.paramvalue {padding:2px 2px 2px 2px; flex-basis:50%}.recipeHeader {padding: 10px; background-color: rgb(0, 86, 133); overflow: hidden; position: sticky; top: 0; z-index:999;}.content {padding: 10px; position:relative;}.nested {display: block; color: rgb(54, 142, 196); background-color: rgb(241, 241, 241); margin: 4px -4px -4px -4px; padding: 4px 4px 4px 4px;}</style>';
			vExportData = vExportData + vDataForPDF.innerHTML;
			vExportData = vExportData.replaceAll('<div class="exportlist"><div class="box"><select id="exportselect" onchange="exportPDF(this.value)"><option>Export</option><option>PDF - AS-IS</option><option>PDF - Simplified</option><option>Excel - Simplified</option></select></div></div>', '');
			vExportData = vExportData.replaceAll('<div class="customPopup" id="customPopup"><div class="customPopupBG"><p>Do you want to refresh the current recipe?</p><button id="popupYesBtn" onclick="refreshConfirm(&quot;yes&quot;)">Yes</button><button id="popupNoBtn" onclick="refreshConfirm(&quot;no&quot;)">No</button></div></div>', '');
			vExportData = vExportData.replaceAll('<div class="resetview"><button class="btn-reset" id="reset-btn" onclick="resetSteps()">Reset</button></div>', '');
			vExportData = vExportData.replaceAll('<div class="resetview"><button class="btn-reset" id="reset-btn" onclick="resetSteps()" style="display: block;">Reset</button></div>', '');
					
			var win = window.open();
			self.focus();
			win.document.open();
			win.document.write(vExportData);
			win.document.close();
			win.print({ saveAsPDF: true });
			win.close();
		}
		else if(exporttype == 'PDF - Simplified' || exporttype == 'Excel - Simplified')
		{
			var vExportDataStyleForPDF = "<style>@media print { @page {size: A3 landscape;}} @page { border-bottom: 1px solid black; @bottom-left {font-size:12px; content: 'Internal';} @bottom-right {font-size:12px; content: counter(page) ' of ' counter(pages); }} body {-webkit-print-color-adjust: exact;} table {font:Arial; width: 100%; border-collapse: collapse; color: black;}td,th {width: 16.6%; border:1px solid black;}th {background-color : #69c6e4;} tr{page-break-inside: avoid !important;}th {text-align:center;}td{padding:5px;}</style>";
		
			var vHTMLLoaded = vDataForPDF.innerHTML;
			vHTMLLoaded = vHTMLLoaded.replaceAll('div class="divTable">','');
			vHTMLLoaded = vHTMLLoaded.replaceAll('<div class="divTableRow">','');
			vHTMLLoaded = vHTMLLoaded.replaceAll('<div class="divTableCell sep">','');
			vHTMLLoaded = vHTMLLoaded.replaceAll('<div>&nbsp;','');
			vHTMLLoaded = vHTMLLoaded.replaceAll('<div class="divTableCell">','');
			vHTMLLoaded = vHTMLLoaded.replaceAll('<div class="divTableCell right">','');
			
			var vHTMLLines = vHTMLLoaded.split("</div>");
			
			for(var i=0;i<vHTMLLines.length;i++)
			{
				var vHTMLLine = vHTMLLines[i];
				if(vHTMLLine.contains('info-table'))
				{
					var vInfoTableArray = vHTMLLine.split('<table>');
					vExportData = vExportData + '<table style="text-align:center;>"' + vInfoTableArray[1] +'<br style="mso-data-placement:same-cell;" />';
				}
				if(vHTMLLine.contains('recipeHeader'))
				{
					vExportData = vExportData + '<table border: 1px black;><tr><th>Step<br style="mso-data-placement:same-cell;" />(WorkPlan System)</th><th>Operation<br style="mso-data-placement:same-cell;" />(Header Operation)</th><th>Task<br style="mso-data-placement:same-cell;" />(General Operation)</th><th>Parameter<br style="mso-data-placement:same-cell;" />(Process / Equipment)</th><th>Equipment<br style="mso-data-placement:same-cell;" />(Primary & Secondary)</th><th>Materials</th><tr>';
				}
				if(vHTMLLine.contains('divTableCell label contentPlaceholder wpl'))
				{
					var vWPLName = ((String((vHTMLLine.split("<strong>"))[1])).split("</strong>"))[0];
					vExportData = vExportData + '<tr><td><strong>'+vWPLName+'</strong></td><td></td><td></td><td></td><td></td><td></td></tr>'
				}
				if(vHTMLLine.contains('divTableCell label contentPlaceholder hop'))
				{
					var HOPName = ((String((vHTMLLine.split("<strong>"))[1])).split("</strong>"))[0];
					vExportData = vExportData + '<tr><td></td><td><strong>'+HOPName+'</strong></td><td></td><td></td><td></td><td></td></tr>'
				}
				if(vHTMLLine.contains('divTableCell label contentPlaceholder gop'))
				{
					var vGOPName = ((String((vHTMLLine.split("<strong>"))[1])).split("</strong>"))[0];
					vExportData = vExportData + '<tr><td></td><td></td><td><strong>'+vGOPName+'</strong></td><td></td><td></td><td></td></tr>'
				}
				if(vHTMLLine.contains('divTableCell label contentPlaceholder param'))
				{
					var vParamName = ((String((vHTMLLine.split("<strong>"))[1])).split("</strong>"))[0];
					var vParamValue = ((String((vHTMLLine.split("<strong>"))[1])).split("</strong>"))[1];

					vExportData = vExportData + '<tr><td></td><td></td><td></td><td><strong>'+vParamName+'</strong><br style="mso-data-placement:same-cell;" />';
					if((String(vParamValue)).contains('<div class="paramlabel">'))
					{
						for(var j=i;j<vHTMLLines.length;j++)
						{
							vHTMLLine2 = (String(vHTMLLines[j]));
							if(vHTMLLine2.contains('paramlabel') || vHTMLLine2.contains('paramvalue') || vHTMLLine2=="")
							{
								if(vHTMLLine2!="" && vHTMLLine2.contains('paramlabel'))
								{
									let vLabel = vHTMLLine2.split('<div class="paramlabel">')[1];
									let vValue = (String(vHTMLLines[j+1])).split('<div class="paramvalue">')[1];
									vExportData = vExportData + '<br style="mso-data-placement:same-cell;" />' + vLabel + "  :  "+vValue;
								}
							}
							else
							{
								break;
							}
						}
					}
					
					vExportData = vExportData + '</td><td></td><td></td></tr>'
				}
				if(vHTMLLine.contains('divTableCell label contentPlaceholder resource'))
				{
					var vResourceName = ((String((vHTMLLine.split("<strong>"))[1])).split("</strong>"))[0];
					vExportData = vExportData + '<tr><td></td><td></td><td></td><td></td><td><strong>'+vResourceName+'</strong><br style="mso-data-placement:same-cell;"/>';
					if((String(vParamValue)).contains('<div class="paramlabel">'))
					{
						for(var j=i;j<vHTMLLines.length;j++)
						{
							vHTMLLine2 = (String(vHTMLLines[j]));
							if(vHTMLLine2.contains('paramlabel') || vHTMLLine2.contains('paramvalue') || vHTMLLine2=="")
							{
								if(vHTMLLine2!="" && vHTMLLine2.contains('paramlabel'))
								{
									let vLabel = vHTMLLine2.split('<div class="paramlabel">')[1];
									let vValue = (String(vHTMLLines[j+1])).split('<div class="paramvalue">')[1];
									vExportData = vExportData + '<br style="mso-data-placement:same-cell;" />' + vLabel + "  :  "+vValue;
								}
							}
							else
							{
								break;
							}
						}
					}
					vExportData = vExportData + '</td><td></td></tr>';
				}
				if(vHTMLLine.contains('divTableCell label contentPlaceholder material'))
				{
					var vMatName = ((String((vHTMLLine.split("<strong>"))[1])).split("</strong>"))[0];
					var vMatQuantity = (((String((vHTMLLine.split("<strong>"))[1])).split("</strong>"))[1]);
					vExportData = vExportData + '<tr><td></td><td></td><td></td><td></td><td></td><td><strong>'+vMatName+'</strong><br style="mso-data-placement:same-cell;" />';
					
					if((String(vParamValue)).contains('<div class="paramlabel">'))
					{
						for(var j=i;j<vHTMLLines.length;j++)
						{
							vHTMLLine2 = (String(vHTMLLines[j]));
							if(vHTMLLine2.contains('paramlabel') || vHTMLLine2.contains('paramvalue') || vHTMLLine2=="")
							{
								if(vHTMLLine2!="" && vHTMLLine2.contains('paramlabel'))
								{
									let vLabel = vHTMLLine2.split('<div class="paramlabel">')[1];
									let vValue = (String(vHTMLLines[j+1])).split('<div class="paramvalue">')[1];
									vExportData = vExportData + '<br style="mso-data-placement:same-cell;" />' + vLabel + "  :  "+vValue;
								}
							}
							else
							{
								break;
							}
						}
					}
					vExportData = vExportData + '</td></tr>'
				}
				else
				{
					console.log()
				}
			}
			vExportData = vExportData + '</table>';
			if(exporttype == 'Excel - Simplified')
			{
				var style = '<style> table, th { border: 1px solid black; border-collapse: collapse;}td { border: 1px sloid black; border-collapse: collapse;}</style>';
				vExportData = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->' + style + '</head><body><table>'+ vExportData +'</table></body></html>';
				const date = new Date();
				let vTimestamp = date.toJSON();
				var result = 'data:application/vnd.ms-excel,' + escape(vExportData);
				var link = document.createElement("a");
				document.body.appendChild(link);
				link.download = "Recipe_Export_"+vTimestamp+".xls";
				link.href = result;
				link.click();
				
			}
			else if(exporttype == 'PDF - Simplified')
			{
				vExportData = vExportDataStyleForPDF + vExportData;
				var win = window.open();
				self.focus();
				win.document.open();
				win.document.write(vExportData);
				win.document.close();
				win.print({ saveAsPDF: true });
				win.close();
			}
			 
		}	
	}
	else
	{
		callTinyPopup("Data loading please wait.!");
	}
	document.getElementById('exportselect').selectedIndex = 0;
	
}
function resetSteps()
{
	var vStepList = document.getElementsByClassName("divTableRow WPL");
	var vLineList = document.getElementsByClassName("WPLLine");
	for(var i=0;i<vStepList.length;i++)
	{
		vStepList[i].style.display = "block";
		vLineList[i].style.display = "block";
	}
	var vResetBtn = document.getElementById("reset-btn");
	vResetBtn.style.display = "none";
}
function callTinyPopup(message)
{
	var tinyPopup = tinyPopup = UWA.createElement('div', {'class':'tinyPopup', id:'tinyPopup'}).inject(widget.body);
	tinyPopup.style.display = "block";
	tinyPopup.innerHTML = message;
	tinyPopup.style.borderLeft = "5px solid #f7933b";
	tinyPopup.style.backgroundColor = "#fcf4c7ab";
	setTimeout(function() { tinyPopup.style.display = "none"; tinyPopup.remove();}, 2000)
	
}
require(["DS/DataDragAndDrop/DataDragAndDrop","DS/WAFData/WAFData",'DS/PlatformAPI/PlatformAPI'],function (DataDragAndDrop, WAFData, PlatformAPI) 
{
	'use strict';
	var v3DSpaceUrl = PlatformAPI.getApplicationConfiguration('app.urls.myapps');
	var vCSRFTokenURI = v3DSpaceUrl+"/resources/v1/application/E6WFoundation/CSRF";
	
	var myHomePage = UWA.createElement('div', {'class': 'homepage',html: 'Drop Recipe'});
	var vLoader = UWA.createElement('div', {'class':'loader', id:'loader'});	
	var dropElement = widget.body;
	var myWidget =
	{
		onLoad: function () 
		{
			var vLoadLastUsed = widget.getValue("Load_Last_used_Recipe");
			var vLastRecipeID = widget.getValue("Last_Used_Recipe");
			var vDataLoadedinWidget = widget.body.innerHTML;
			widget.setValue("ResourceParamaters", new Array());
			DataDragAndDrop.droppable(dropElement,
			{
				drop: function (objData) 
				{
					var objectId = ((JSON.parse(objData)).data.items[0]).objectId;
					var objectType = ((JSON.parse(objData)).data.items[0]).objectType;
					widget.setValue("Last_Used_Recipe", objectId);
					var vSecurityContext = ((JSON.parse(objData)).data.items[0]).contextId;
					widget.body.empty();
					vLoader.inject(widget.body);
					if (objectType != "DELLmiHeaderWorkPlanReference") 
					{
						var htmlError = "<div class='container'>Please drop only Header Workplan</div>";
						widget.body.innerHTML = htmlError;
					}
					else 
					{
						WAFData.authenticatedRequest(vCSRFTokenURI,
						{
							method: 'GET',type: 'json',headers: {'Accept': 'application/json','Content-Type': 'application/json','Accept-Language': widget.lang},timeout: 1000 * 60 * 15,
							onComplete: function (csfrData)
							{
								loadHeaderData(objectId, ((csfrData.csrf).value), v3DSpaceUrl, vLoader);
								widget.setValue('CSRFToken', ((csfrData.csrf).value));
								widget.setValue('SecurityContext', vSecurityContext);
							},
							onFailure: function (faildata) 
							{
								console.log(faildata);
							}
						});
					}
				},
				enter: function () {
					widget.body.style = "border 5px solid orange;"
				},
				over: function () {

				},
				leave : function () {
				}
			});
			
			if (vLastRecipeID != null && vLastRecipeID != "undefined" && vLoadLastUsed == true) 
			{
				widget.body.empty();
				vLoader.inject(widget.body);
				WAFData.authenticatedRequest(vCSRFTokenURI,
				{
					method: 'GET',type: 'json',headers: {'Accept': 'application/json','Content-Type': 'application/json','Accept-Language': widget.lang},timeout: 1000 * 60 * 15,
					onComplete: function (csfrData)
					{
						loadHeaderData(vLastRecipeID, ((csfrData.csrf).value), v3DSpaceUrl);
						widget.setValue('CSRF Value', ((csfrData.csrf).value));
					},
					onFailure: function (faildata) 
					{
						console.log(faildata);
					}
				});			
			}
			else 
			{
				widget.body.empty();
				myHomePage.inject(widget.body);
				confirmPopup.inject(widget.body);
			}
			
			
		},
		onRefresh: function () 
		{
			widget.setValue("ResourceParamaters", new Array());
			var refreshElement = document.getElementById("customPopup");
			if(refreshElement)
			{
				refreshElement.style.display = "flex";
			}
		},
		onSearch: function (searchQuery) 
		{
			var vStepList = document.getElementsByClassName("divTableRow WPL");
			var vLineList = document.getElementsByClassName("WPLLine");
			var count =0;
			searchQuery = searchQuery.trim();
			for(var i=0;i<vStepList.length;i++)
			{
				if(((vStepList[i].title).toUpperCase()).includes(searchQuery.toUpperCase()))
				{
					count++;
				}
			}
			if(count>0)
			{
				for(var i=0;i<vStepList.length;i++)
				{
					if(((vStepList[i].title).toUpperCase()).includes(searchQuery.toUpperCase()))
					{
						vStepList[i].style.display = "block";
						vLineList[i].style.display = "block";
					}
					else
					{
						vStepList[i].style.display = "none";
						vLineList[i].style.display = "none";
					}
				}
				var vResetBtn = document.getElementById("reset-btn");
				vResetBtn.style.display = "block";
			}
			else
			{
				callTinyPopup("No Matching Steps Found.!");
			}
			
		}
	};
	widget.addEvent('onLoad', myWidget.onLoad);
	widget.addEvent('onRefresh', myWidget.onRefresh);
	widget.addEvent('onSearch', myWidget.onSearch);
});