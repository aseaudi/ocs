<!--  vim: set ts=3:  -->
<link rel="import" href="polymer/polymer.html">
<link rel="import" href="i18n-msg/i18n-msg-behavior.html">
<link rel="import" href="vaadin-grid/vaadin-grid.html">
<link rel="import" href="vaadin-grid/vaadin-grid-filter.html">

<dom-module id="sig-ipdr-list-wlan">
	<template>
		<style>
			::-webkit-input-placeholder { /* Chrome/Opera/Safari */
				color: initial;
				font-weight: bold;
			}
			::-moz-placeholder { /* Firefox 19+ */
				color: initial;
				font-weight: bold;
			}
			:-ms-input-placeholder { /* IE 10+ */
				color: initial;
				font-weight: bold;
			}
			:-moz-placeholder { /* Firefox 18- */
				color: initial;
				font-weight: bold;
			}
			vaadin-grid {
				height: 100%;
				--vaadin-grid-header-cell: {
					background: #ffb04c;
				};
			}
			vaadin-grid input {
				font-size: inherit;
				background: #ffb04c;
				border-style: none;
			}
			.yellow-button {
				text-transform: none;
				color: #eeff41;
			}
		</style>
		<vaadin-grid id="ipdrGrid">
			<vaadin-grid-column width="19ex" flex-grow="1">
				<template class="header">
					<vaadin-grid-filter aria-label="[[i18n.creationTime]]" path="ipdrCreationTime" value="[[_filterIPDRCreationTime]]">
						<input placeholder="[[i18n.creationTime]]" value="{{_filterIPDRCreationTime::input}}" focus-target>
					</vaadin-grid-filter>
				</template>
				<template>[[item.ipdrCreationTime]]</template>
			</vaadin-grid-column>
			<vaadin-grid-column width="4ex">
				<template class="header">[[i18n.seq]]</template>
				<template>[[item.seqNum]]</template>
			</vaadin-grid-column>
			<vaadin-grid-column width="20ex" flex-grow="4">
				<template class="header">
					<vaadin-grid-filter aria-label="[[i18n.userName]]" path="username" value="[[_filterUserName]]">
						<input placeholder="[[i18n.userName]]" value="{{_filterUserName::input}}" focus-target>
					</vaadin-grid-filter>
				</template>
				<template>[[item.username]]</template>
			</vaadin-grid-column>
			<vaadin-grid-column width="12ex" flex-grow="0">
				<template class="header">
					<vaadin-grid-filter aria-label="[[i18n.acctSessionId]]" path="acctSessionId" value="[[_filterAcctSessionId]]">
						<input placeholder="[[i18n.acctSessionId]]" value="{{_filterAcctSessionId::input}}" focus-target>
					</vaadin-grid-filter>
				</template>
				<template>[[item.acctSessionId]]</template>
			</vaadin-grid-column>
			<vaadin-grid-column width="20ex" flex-grow="3">
				<template class="header">
					<vaadin-grid-filter aria-label="[[i18n.callingStationId]]" path="callingStationId" value="[[_filterCallingStationId]]">
						<input placeholder="[[i18n.callingStationId]]" value="{{_filterCallingStationId::input}}" focus-target>
					</vaadin-grid-filter>
				</template>
				<template>[[item.callingStationId]]</template>
			</vaadin-grid-column>
			<vaadin-grid-column width="28ex" flex-grow="3">
				<template class="header">
					<vaadin-grid-filter aria-label="[[i18n.calledStationId]]" path="calledStationId" value="[[_filterCalledStationId]]">
						<input placeholder="[[i18n.calledStationId]]" value="{{_filterCalledStationId::input}}" focus-target>
					</vaadin-grid-filter>
				</template>
				<template>[[item.calledStationId]]</template>
			</vaadin-grid-column>
			<vaadin-grid-column width="16ex" flex-grow="2">
				<template class="header">
					<vaadin-grid-filter aria-label="[[i18n.nasIpAddress]]" path="nasIpAddress" value="[[_filterNasIpAddress]]">
						<input placeholder="[[i18n.nasIpAddress]]" value="{{_filterNasIpAddress::input}}" focus-target>
					</vaadin-grid-filter>
				</template>
				<template>[[item.nasIpAddress]]</template>
			</vaadin-grid-column>
			<vaadin-grid-column width="12ex" flex-grow="4">
				<template class="header">
					<vaadin-grid-filter aria-label="[[i18n.nasID]]" path="nasId" value="[[_filterNasId]]">
						<input placeholder="[[i18n.nasID]]" value="{{_filterNasId::input}}" focus-target>
					</vaadin-grid-filter>
				</template>
				<template>[[item.nasId]]</template>
			</vaadin-grid-column>
			<vaadin-grid-column width="9ex" flex-grow="2">
				<template class="header">
					<i18n-msg msgid="sessionDur">
						SessionDuration
					</i18n-msg>
				</template>
				<template>[[item.sessionDuration]]</template>
			</vaadin-grid-column>
			<vaadin-grid-column width="12ex" flex-grow="2">
				<template class="header">
					<i18n-msg msgid="inputOctets">
						InputOctets
					</i18n-msg>
				</template>
				<template>[[item.inputOctets]]</template>
			</vaadin-grid-column>
			<vaadin-grid-column width="13ex" flex-grow="2">
				<template class="header">
					<i18n-msg msgid="outputOctets">
						OutputOctets
					</i18n-msg>
				</template>
				<template>[[item.outputOctets]]</template>
			</vaadin-grid-column>
			<vaadin-grid-column width="19ex" flex-grow="1">
				<template class="header">
					<vaadin-grid-filter aria-label="[[i18n.gmtSessionStartDateTime]]" path="gmtSessionStartDateTime" value="[[_filterGmtSessionStartDateTime]]">
						<input placeholder="[[i18n.gmtSessionStartDateTime]]" value="{{_filterGmtSessionStartDateTime::input}}" focus-target>
					</vaadin-grid-filter>
				</template>
				<template>[[item.gmtSessionStartDateTime]]</template>
			</vaadin-grid-column>
			<vaadin-grid-column width="19ex" flex-grow="1">
				<template class="header">
					<vaadin-grid-filter aria-label="[[i18n.gmtSessionendtime]]" path="gmtSessionEndDateTime" value="[[_filterGmtSessionEndDateTime]]">
						<input placeholder="[[i18n.gmtSessionendtime]]" value="{{_filterGmtSessionEndDateTime::input}}" focus-target>
					</vaadin-grid-filter>
				</template>
				<template>[[item.gmtSessionEndDateTime]]</template>
			</vaadin-grid-column>
			<vaadin-grid-column width="5ex">
				<template class="header">
					<vaadin-grid-filter aria-label="[[i18n.SessionTerminateCause]]" path="sessionTerminateCause" value="[[_filterSessionTerminateCause]]">
						<input Placeholder="[[i18n.SessionTerminateCause]]" value="{{_filterSessionTerminateCause::input}}" focus-target>
					</vaadin-grid-filter>
				</template>
				<template>[[item.sessionTerminateCause]]</template>
			</vaadin-grid-column>
		</vaadin-grid/>
		<paper-toast
			id="addLogToastError"
			text="Log error">
		</paper-toast>
		<paper-toast
			id="addLogContentToastError"
			text="Log content error">
		</paper-toast>
		<paper-toast
			id="usageToastError">
		</paper-toast>
		<paper-toast id="ipdrErrorToast" duration="0">
			<paper-button
					class="yellow-button"
					onclick="ipdrErrorToast.toggle()">
				Close
			</paper-button>
		</paper-toast>
		<iron-ajax id="getIpdr"
				rejectWithRequest>
		</iron-ajax>
	</template>
	<script>
		Polymer ({
			is: 'sig-ipdr-list-wlan',
			behaviors: [i18nMsgBehavior],
			properties: {
				activePage: {
					type: Boolean,
					value: false,
					observer: '_activePageChanged'
				},
				etag: {
					type: String,
					value: null
				}
			},
			_activePageChanged: function(active) {
				if (active) {
					var wlanAjax = document.getElementById("getLogsAjaxWlan");
					wlanAjax.url = "/ocs/v1/log/ipdr/wlan";
					wlanAjax.generateRequest();
					document.getElementById("selectLogFileModalWlan").open();
				}
			},
			intializeGrid: function(event) {
					var grid = this.$.ipdrGrid;
					grid.size = 0;
					grid.columns = [
						{
							"name": "ipdrCreationTime"
						},
						{
							"name": "seqNum"
						},
						{
							"name": "username"
						},
						{
							"name": "acctSessionId"
						},
						{
							"name": "callingStationId"
						},
						{
							"name": "calledStationId"
						},
						{
							"name": "nasIpAddress"
						},
						{
							"name": "nasId"
						},
						{
							"name": "sessionDuration"
						},
						{
							"name": "inputOctets"
						},
						{
							"name": "outputOctets"
						},
						{
							"name": "gmtSessionStartDateTime"
						},
						{
							"name": "gmtSessionEndDateTime"
						},
						{
							"name": "sessionTerminateCause"
						}
					];
					var ajax = document.getElementById('getIpdr');
					ajax.url = "/usageManagement/v1/usage/ipdr/wlan/" + event.model.item;
					document.getElementById("selectLogFileModalWlan").close();
					grid.dataProvider = this.getLogContentResponse;	
			},
			refreshIpdr: function() {
				this.etag = null;
				delete this.$.getIpdr.params['date'];
				document.getElementById("getLogsAjaxWlan").generateRequest();
				document.getElementById("ipdrGrid").clearCache();
			},
			getLogContentResponse: function(params, callback) {
				var grid = document.getElementById('ipdrGrid');
				var ajax = document.getElementById('getIpdr');
				ipdrLogListWlan = document.getElementById('ipdrLogListWlan');
				handleAjaxResponse = function(request) {
					if (request) {
						ipdrLogListWlan.etag = request.xhr.getResponseHeader('ETag');
						var range = request.xhr.getResponseHeader('Content-Range');
						var range1 = range.split("/");
						var range2 = range1[0].split("-");
						if (range1[1] != "*") {
							grid.size = Number(range1[1]);
						} else {
							grid.size = Number(range2[1]) + grid.pageSize * 2;
						}
						var vaadinItems = new Array();
						for(var index in request.response) {
							var newRecord = new Object();
							newRecord.date = request.response[index].date;
							newRecord.type = request.response[index].type;
							newRecord.usageSpecificationName = request.response[index].usageSpecification.name;
							request.response[index].usageCharacteristic.forEach(
								function(attrObj) {
									if(attrObj.value == "undefined") {
										attrObj.value = '';
										newRecord[attrObj.name] = attrObj.value;
									} else {
										newRecord[attrObj.name] = attrObj.value;
									}
								}
							);
						vaadinItems[index] = newRecord;
						}
					callback(vaadinItems);
					} else {
						grid.size = 0;
						callback([]);
					}
				},
				handleAjaxError = function(error) {
					ipdrLogListWlan.etag = null;
					var toast = document.getElementById('usageToastError');
					toast.text = error;
					toast.open();
					callback([]);
				}
				if (ajax.loading) {
					ajax.lastRequest.completes.then(function(request) {
						var startRange = params.page * params.pageSize + 1;
						var endRange = startRange + params.pageSize - 1;
						ajax.headers['Range'] = "items=" + startRange + "-" + endRange;
						if (ipdrLogListWlan.etag && params.page > 0) {
							ajax.headers['If-Range'] = ipdrLogListWlan.etag;
						} else {
							delete ajax.headers['If-Range'];
						}
						return ajax.generateRequest().completes;
					}, handleAjaxError).then(handleAjaxResponse, handleAjaxError);
				} else {
					var startRange = params.page * params.pageSize + 1;
					var endRange = startRange + params.pageSize - 1;
					ajax.headers['Range'] = "items=" + startRange + "-" + endRange;
					if (ipdrLogListWlan.etag && params.page > 0) {
						ajax.headers['If-Range'] = ipdrLogListWlan.etag;
					} else {
						delete ajax.headers['If-Range'];
					}
					ajax.generateRequest().completes.then(handleAjaxResponse, handleAjaxError);
				}
			}
		});
	</script>
</dom-module>
