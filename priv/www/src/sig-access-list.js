<!--  vim: set ts=3:  -->
<link rel="import" href="polymer/polymer.html">
<link rel="import" href="i18n-msg/i18n-msg-behavior.html">
<link rel="import" href="vaadin-grid/vaadin-grid.html">
<link rel="import" href="vaadin-grid/vaadin-grid-filter.html">
<link rel="import" href="iron-ajax/iron-ajax.html">

<dom-module id="sig-access-list">
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
		<vaadin-grid id="accessGrid" >
			<vaadin-grid-column width="24ex">
				<template class="header">
					<vaadin-grid-filter
							aria-label="[[i18n.timeStamp]]"
							path="date"
							value="[[filterAccessTimeStamp]]">
						<input
								placeholder="[[i18n.timeStamp]]"
								value="{{filterAccessTimeStamp::input}}"
								focus-target>
						</vaadin-grid-filter>
				</template>
				<template>[[item.date]]</template>
			</vaadin-grid-column>
			<vaadin-grid-column width="10ex" flex-grow="1">
				<template class="header">
					<i18n-msg msgid="clientAddress">
						ClientAddress
					</i18n-msg>
				</template>
				<template>[[item.clientAddress]]</template>
			</vaadin-grid-column>
			<vaadin-grid-column width="1ex" flex-grow="3">
				<template class="header">
					<vaadin-grid-filter
							aria-label="[[i18n.clientIdentity]]"
							path="nasIdentifier"
							value="[[filterclientIdentity]]">
						<input
								placeholder="[[i18n.clientIdentity]]"
								value="{{filterclientIdentity::input}}"
								focus-target>
					</vaadin-grid-filter>
				</template>
				<template>[[item.nasIdentifier]]</template>
			</vaadin-grid-column>
			<vaadin-grid-column width="20ex">
				<template class="header">
					<vaadin-grid-filter
							aria-label="[[i18n.calledStation]]"
							path="calledStationId"
							value="[[filtercalledStation]]">
						<input
								placeholder="[[i18n.calledStation]]"
								value="{{filtercalledStation::input}}"
								focus-target>
						</vaadin-grid-filter>
				</template>
				<template>[[item.calledStationId]]</template>
			</vaadin-grid-column>
			<vaadin-grid-column width="10ex" flex-grow="4">
				<template class="header">
					<vaadin-grid-filter
							aria-label="[[i18n.userName]]"
							path="username"
							value="[[filterUserName]]">
						<input
								placeholder="[[i18n.userName]]"
								value="{{filterUserName::input}}"
								focus-target>
					</vaadin-grid-filter>
				</template>
				<template>[[item.username]]</template>
			</vaadin-grid-column>
			<vaadin-grid-column width="8ex" flex-grow="0">
				<template class="header">
					<vaadin-grid-filter
							aria-label="[[i18n.type]]"
							path="type"
							value="[[filterType]]">
						<input
								placeholder="[[i18n.type]]"
								value="{{filterType::input}}"
								focus-target>
					</vaadin-grid-filter>
				</template>
				<template>[[item.type]]</template>
			</vaadin-grid-column>
		</vaadin-grid>
		<paper-toast id="accessErrorToast" duration="0">
			<paper-button
					class="yellow-button"
					onclick="accessErrorToast.toggle()">
				Close
			</paper-button>
		</paper-toast>
		<iron-ajax id="getAccess"
				url="/usageManagement/v1/usage"
				rejectWithRequest>
		</iron-ajax>
	</template>
	<script>
		var etag;
		Polymer ({
			is: 'sig-access-list',
			behaviors: [i18nMsgBehavior],
			properties: {
				activePage: {
					type: Boolean,
					value: false,
					observer: '_activePageChanged'
				},
				filterAccessTimeStamp: {
					observer: '_filterAccessChangedTimeStamp'
				},
				filterClientAddress: {
					observer: '_filterClientAddress'
				},
				filterclientIdentity: {
					observer: '_filterclientIdentity'
				},
				filtercalledStation: {
					observer: '_filtercalledStation'
				},
				filterUserName: {
					observer: '_filterUserName'
				},
				filterType: {
					observer: '_filterType'
				}
			},
			_activePageChanged: function(active) {
				if (active) {
					var grid = this.$.accessGrid;
					grid.frozenColumns = 2;
					grid.columns = [
						{
							name: "date"
						},
						{
							name: "clientAddress"
						},
						{
							name: "nasIdentifier"
						},
						{
							name: "calledStationId"
						},
						{
							name: "username"
						},
						{
							name: "type"
						}
					];
					grid.dataProvider = this._getAccess;
				}
			},
			__filterAccessChangedTimeStamp: function(filter) {
				this.etag = null;
				delete this.$.getAccess.headers['If-Range'];
				this.$.accessGrid.size = 0;
			},
			_filterClientAddress:function(filter) {
				this.etag = null;
				delete this.$.getAccess.headers['If-Range'];
				this.$.accessGrid.size = 0;
			},
			_filterclientIdentity: function(filter) {
				this.etag = null;
				delete this.$.getAccess.headers['If-Range'];
				this.$.accessGrid.size = 0;
			},
			_filtercalledStation: function(filter) {
				this.etag = null;
				delete this.$.getAccess.headers['If-Range'];
				this.$.accessGrid.size = 0;
			},
			_filterUserName: function(filter) {
				this.etag = null;
				delete this.$.getAccess.headers['If-Range'];
				this.$.accessGrid.size = 0;
			},
			_filterType: function(filter) {
				this.etag = null;
				delete this.$.getAccess.headers['If-Range'];
				this.$.accessGrid.size = 0;
			},
			refreshAccess: function() {
				this.etag = null;
				delete this.$.getAccess.headers['If-Range'];
				delete this.$.getAccess.params['filter'];
				this.filterAccessTimeStamp = null;
				this.filterClientAddress = null;
				this.filterclientIdentity = null;
				this.filtercalledStation = null;
				this.filterUserName = null;
				this.filterType = null
			},
			_getAccess: function(params, callback) {
				var grid = document.getElementById('accessGrid');
				var ajax = document.getElementById('getAccess');
				delete ajax.params['date'];
				delete ajax.params['clientAddress'];
				delete ajax.params['nasIdentifier'];
				delete ajax.params['calledStationId'];
				delete ajax.params['filter'];
				ajax.params['type'] = "AAAAccessUsage";
				function checkHead(param) {
					return param.path == "date" || param.path == "type" || param.path == "status";
				}
				var head;
				params.filters.filter(checkHead).forEach(function(filter) {
					if (filter.value) {
						ajax.params[filter.path] = filter.value;
					}
				});
				function checkChar(param) {
					return param.path != "date" && param.path != "type" && param.path != "status";
				}
				params.filters.filter(checkChar).forEach(function(filter) {
					if (filter.value) {
						if (!ajax.params['filter']) {
							ajax.params['filter'] = "\"[{usageCharacteristic.contains=[";
						} else {
							ajax.params['filter'] += ",";
						}
							ajax.params['filter'] += "{name=" + filter.path + ",value.like=[" + filter.value + "%]}";
					}
				});
				if (ajax.params['filter']) {
					ajax.params['filter'] += "]}]\"";
				}
				var accessList = document.getElementById('accessList');
				var handleAjaxResponse = function(request) {
					if (request) {
						accessList.etag = request.xhr.getResponseHeader('ETag');
						var range = request.xhr.getResponseHeader('Content-Range');
						var range1 = range.split("/");
						var range2 = range1[0].split("-");
						if (range1[1] != "*") {
							grid.size = Number(range1[1]);
						} else {
							grid.size = Number(range2[1]) + grid.pageSize * 2;
						}
						var vaadinItems = new Array();
						function checkChar(characteristic){
                     return characteristic.name == "id";
                  }
						for (var index in request.response) {
							var newRecord = new Object();
							newRecord.date = request.response[index].date;
							function checkChar1(characteristic) {
								return characteristic.name == "clientAddress";
							}
							var index1 = request.response[index].usageCharacteristic.findIndex(checkChar1);
							if (index1 != -1) {
								newRecord.clientAddress = request.response[index].usageCharacteristic[index1].value;
							}
							function checkChar2(characteristic) {
								return characteristic.name == "nasIdentifier";
							}
							var index2 = request.response[index].usageCharacteristic.findIndex(checkChar2);
							if (index2 != -1) {
								newRecord.nasIdentifier = request.response[index].usageCharacteristic[index2].value;
							}
							function checkChar3(characteristic) {
								return characteristic.name == "calledStationId";
							}
							var index3 = request.response[index].usageCharacteristic.findIndex(checkChar3);
							if (index3 != -1) {
								newRecord.calledStationId = request.response[index].usageCharacteristic[index3].value;
							}
							function checkChar4(characteristic) {
								return characteristic.name == "username";
							}
							var username1 = request.response[index].usageCharacteristic.find(checkChar4);
							if (username1 != undefined) {
								newRecord.username = username1.value;
							}
							function checkChar5(characteristic) {
								return characteristic.name == "type";
							}
							var index5 = request.response[index].usageCharacteristic.findIndex(checkChar5);
							if (index5 != -1) {
								newRecord.type = request.response[index].usageCharacteristic[index5].value;
							}
						vaadinItems[index] = newRecord;
						}
						callback(vaadinItems);
					} else {
						grid.size = 0;
						callback([]);
					}
				};
				var handleAjaxError = function(error) {
					accessList.etag = null;
					var toast = document.getElementById('usageToastError');
					toast.text = error;
					toast.open();
					if(!grid.size) {
						grid.size = 0;
					}
					callback([]);
				}
				if (ajax.loading) {
					ajax.lastRequest.completes.then(function(request) {
					var startRange = params.page * params.pageSize + 1;
					var endRange = startRange + params.pageSize - 1;
					ajax.headers['Range'] = "items=" + startRange + "-" + endRange;
					if (accessList.etag && params.page > 0) {
						ajax.headers['If-Range'] = accessList.etag;
					} else {
						delete ajax.headers['If-Range'];
					}
						return ajax.generateRequest().completes;
					}, handleAjaxError).then(handleAjaxResponse, handleAjaxError);
				} else {
					var startRange = params.page * params.pageSize + 1;
					var endRange = startRange + params.pageSize - 1;
					ajax.headers['Range'] = "items=" + startRange + "-" + endRange;
					if (accessList.etag && params.page > 0) {
						ajax.headers['If-Range'] = accessList.etag;
					} else {
						delete ajax.headers['If-Range'];
					}
					ajax.generateRequest().completes.then(handleAjaxResponse, handleAjaxError);
				}
			}
		});
	</script>
</dom-module>
