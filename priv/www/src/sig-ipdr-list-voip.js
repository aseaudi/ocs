<!--  vim: set ts=3:  -->
<link rel="import" href="polymer/polymer.html">
<link rel="import" href="i18n-msg/i18n-msg-behavior.html">
<link rel="import" href="vaadin-grid/vaadin-grid.html">
<link rel="import" href="vaadin-grid/vaadin-grid-filter.html">

<dom-module id="sig-ipdr-list-voip">
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
		<vaadin-grid id="ipdrGridVoip">
			<vaadin-grid-column
					width="19ex"
					flex-grow="1">
				<template class="header">
					<vaadin-grid-filter
							aria-label="[[i18n.callCompletion]]"
							path="callCompletionCode"
							value="[[_filterCallCompletionCode]]">
						<input
								placeholder="[[i18n.callCompletion]]"
								value="{{_filterCallCompletionCode::input}}"
								focus-target>
					</vaadin-grid-filter>
				</template>
				<template>
						[[item.callCompletionCode]]
				</template>
			</vaadin-grid-column>
			<vaadin-grid-column
					width="15ex"
					flex-grow="3">
				<template class="header">
					<vaadin-grid-filter
							aria-label="[[i18n.hostName]]"
							path="hostName"
							value="[[_filterHostName]]">
						<input
								placeholder="[[i18n.hostName]]"
								value="{{_filterHostName::input}}"
								focus-target>
					</vaadin-grid-filter>
				</template>
				<template>
						[[item.hostName]]
				</template>
			</vaadin-grid-column>
			<vaadin-grid-column
					width="15ex"
					flex-grow="3">
				<template class="header">
					<vaadin-grid-filter
							aria-label="[[i18n.subscriberId]]"
							path="subscriberId"
							value="[[_filterSubscriberId]]">
						<input
								placeholder="[[i18n.subscriberId]]"
								value="{{_filterSubscriberId::input}}"
								focus-target>
					</vaadin-grid-filter>
				</template>
				<template>
						[[item.subscriberId]]
				</template>
			</vaadin-grid-column>
			<vaadin-grid-column
					width="15ex"
					flex-grow="5">
				<template class="header">
					<vaadin-grid-filter
							aria-label="[[i18n.uniqueCallID]]"
							path="uniqueCallID"
							value="[[_filterUniqueCallID]]">
						<input
								placeholder="[[i18n.uniqueCallID]]"
								value="{{_filterUniqueCallID::input}}"
								focus-target>
					</vaadin-grid-filter>
				</template>
				<template>
						[[item.uniqueCallID]]
				</template>
			</vaadin-grid-column>
			<vaadin-grid-column
					width="15ex"
					flex-grow="5">
				<template class="header">
					<vaadin-grid-filter
							aria-label="[[i18n.disconnectReason]]"
							path="disconnectReason"
							value="[[_filterDisconnectReason]]">
						<input
								placeholder="[[i18n.disconnectReason]]"
								value="{{_filterDisconnectReason:input}}"
								focus-target>
					</vaadin-grid-filter>
				</template>
				<template>
						[[item.disconnectReason]]
				</template>
			</vaadin-grid-column>
			<vaadin-grid-column
					width="15ex"
					flex-grow="5">
				<template class="header">
					<vaadin-grid-filter
							aria-label="[[i18n.destinationID]]"
							path="destinationID"
							value="[[_filterDestinationID]]">
						<input
								placeholder="[[i18n.destinationID]]"
								value="{{_filterDestinationID:input}}"
								focus-target>
					</vaadin-grid-filter>
				</template>
				<template>
						[[item.destinationID]]
				</template>
			</vaadin-grid-column>
		</vaadin-grid>
		<paper-toast
				id="usageToastErrorVoip">
		</paper-toast>
		<iron-ajax id="getIpdrVoip"
				rejectWithRequest>
		</iron-ajax>
	</template>
	<script>
		Polymer ({
			is: 'sig-ipdr-list-voip',
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
				if(active) {
					var voipAjax = document.getElementById("getLogsAjaxVoip");
					voipAjax.url = "/ocs/v1/log/ipdr/voip";
					voipAjax.generateRequest();
					document.getElementById("selectLogFileModalVoip").open();
				}
			},
			intializeGrid: function(event) {
				var grid = this.$.ipdrGridVoip;
				grid.size = 0;
				grid.columns = [
					{
						"name": "callCompletionCode"
					},
					{
						"name": "hostName"
					},
					{
						"name": "subscriberId"
					},
					{
						"name": "uniqueCallID"
					},
					{
						"name": "uniqueCallID"
					},
					{
						"name": "destinationID"
					}
				];
				var ajax = document.getElementById('getIpdrVoip');
				ajax.url = "/usageManagement/v1/usage/ipdr/voip/" + event.model.item;
				document.getElementById("selectLogFileModalVoip").close();
				grid.dataProvider = this.getLogContentResponseVoip;
			},
			refreshIPDRVoip: function() {
				this.etag = null;
				delete this.$.getIpdrVoip.params['date'];
				document.getElementById("getLogsAjaxVoip").generateRequest();
				document.getElementById("ipdrGridVoip").clearCache();
			},
			getLogContentResponseVoip: function(params, callback) {
				var grid = document.getElementById('ipdrGridVoip');
				var ajax = document.getElementById('getIpdrVoip');
				var ipdrLogListVoip = document.getElementById('ipdrLogListVoip');
				var handleAjaxResponse = function(request) {
					if (request) {
						ipdrLogListVoip.etag = request.xhr.getResponseHeader('ETag');
						var range = request.xhr.getResponseHeader('Content-Range');
						var range1 = range.split("/");
						var range2 = range1[0].split("-");
						if (range[1] != "*") {
							grid.size = Number(range1[1]);
						} else {
							grid.size = Number(range[1]) + grid.pageSize * 2;
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
				}
				var handleAjaxError = function(error) {
					ipdrLogListVoip.etag = null;
					var toast = document.getElementById('usageToastErrorVoip');
					toast.text = error;
					toast.open();
					callback([]);
				}
				if (ajax.loading) {
					ajax.lastRequest.completes.then(function(request) {
						var startRange = params.page * params.pageSize + 1;
						var endRange = startRange + params.pageSize - 1;
						ajax.headers['Range'] = "items=" + startRange + "-" + endRange;
						if (ipdrLogListVoip.etag && params.page > 0) {
							ajax.headers['If-Range'] = ipdrLogListVoip.etag;
						} else {
							delete ajax.headers['If-Range'];
						}
						return ajax.generateRequest().completes;
					},handleAjaxError).then(handleAjaxResponse, handleAjaxError);
				} else {
					var startRange = params.page * params.pageSize + 1;
					var endRange = startRange + params.pageSize - 1;
					ajax.headers['Range'] = "items=" + startRange + "-" + endRange;
					if (ipdrLogListVoip.etag && params.page > 0) {
						ajax.headers['If-Range'] = ipdrLogListVoip.etag;
					} else {
						delete ajax.headers['If-Range'];
					}
					ajax.generateRequest().completes.then(handleAjaxResponse, handleAjaxError);
				}
			}
		});
	</script>
</dom-module>
