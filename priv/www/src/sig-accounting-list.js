<!--  vim: set ts=3:  -->
<link rel="import" href="polymer/polymer.html">
<link rel="import" href="i18n-msg/i18n-msg.html">
<link rel="import" href="vaadin-grid/vaadin-grid.html">
<link rel="import" href="vaadin-grid/vaadin-grid-filter.html">
<link rel="import" href="iron-ajax/iron-ajax.html">

<dom-module id="sig-accounting-list">
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
			vaadin-grid .grouptitle {
				text-align: center;
				border-bottom-style: solid;
				border-color: var(--paper-yellow-900);
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
		<vaadin-grid id="accountingGrid">
			<vaadin-grid-column width="24ex" flex-grow="2">
				<template class="header">
					<vaadin-grid-filter
							aria-label="[[i18n.timeStamp]]"
							path="date"
							value="[[filterTimeStamp]]">
						<input
								placeholder="[[i18n.timeStamp]]"
								value="{{filterTimeStamp::input}}"
								focus-target>
					</vaadin-grid-filter>
				</template>
				<template>[[item.date]]</template>
			</vaadin-grid-column>
			<vaadin-grid-column width="8ex" flex-grow="8">
				<template class="header">
					<vaadin-grid-filter
							aria-label="[[i18n.clientIdentity]]"
							path="nasIdentifier"
							value="[[filterclientIdentityAcc]]">
						<input
								placeholder="[[i18n.clientIdentity]]"
								value="{{filterclientIdentityAcc::input}}"
								focus-target>
					</vaadin-grid-filter>
				</template>
				<template>[[item.nasIdentifier]]</template>
			</vaadin-grid-column>
			<vaadin-grid-column-group>
				<template class="header">
					<div class="grouptitle">[[i18n.seconds]]</div>
				</template>
				<vaadin-grid-column width="15ex" flex-grow="1">
					<template class="header">
						<vaadin-grid-filter
								aria-label="[[i18n.sessionDur]]"
								path="acctSessiontime"
								value="[[filteracctSessiontime]]">
							<input
									placeholder="[[i18n.sessionDur]]"
									value="{{filteracctSessiontime::input}}"
									focus-target>
						</vaadin-grid-filter>
					</template>
					<template>[[item.acctSessiontime]]</template>
				</vaadin-grid-column>
			</vaadin-grid-column-group>
			<vaadin-grid-column-group>
				<template class="header">
					<div class="grouptitle">[[i18n.bytes]]</div>
				</template>
				<vaadin-grid-column width="10ex" flex-grow="1">
					<template class="header">
						<vaadin-grid-filter
								aria-label="[[i18n.out]]"
								path="acctOutputoctets"
								value="[[filterout]]">
							<input
									placeholder="[[i18n.out]]"
									value="{{filterout::input}}"
									focus-target>
						</vaadin-grid-filter>
					</template>
					<template>[[item.acctOutputoctets]]</template>
				</vaadin-grid-column>
				<vaadin-grid-column width="10ex" flex-grow="1">
					<template class="header">
						<vaadin-grid-filter
								aria-label="[[i18n.in]]"
								path="acctInputoctets"
								value="[[filterin]]">
							<input
									placeholder="[[i18n.in]]"
									value="{{filterin::input}}"
									focus-target>
						</vaadin-grid-filter>
					</template>
					<template>[[item.acctInputoctets]]</template>
				</vaadin-grid-column>
				<vaadin-grid-column width="10ex" flex-grow="1">
					<template class="header">
						<vaadin-grid-filter
								aria-label="[[i18n.totalo]]"
								path="acctTotaloctets"
								value="[[filtertotal]]">
							<input
									placeholder="[[i18n.totalo]]"
									value="{{filtertotal::input}}"
									focus-target>
						</vaadin-grid-filter>
					</template>
					<template>[[item.acctTotaloctets]]</template>
				</vaadin-grid-column>
			</vaadin-grid-column-group>
			<vaadin-grid-column width="12ex" flex-grow="1">
				<template class="header">
					<vaadin-grid-filter
							aria-label="[[i18n.price]]"
							path="prices"
							value="[[filterPrices]]">
						<input
								placeholder="[[i18n.price]]"
								value="{{filterPrices::input}}"
								focus-target>
					</vaadin-grid-filter>
				</template>
				<template>[[item.prices]]</template>
			</vaadin-grid-column>
			<vaadin-grid-column width="12ex" flex-grow="1">
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
			<vaadin-grid-column width="8ex" flex-grow="2">
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
		<paper-toast id="accountingErrorToast" duration="0">
			<paper-button
					class="yellow-button"
					onclick="accountingErrorToast.toggle()">
				Close
			</paper-button>
		</paper-toast>
		<iron-ajax id="getAccounting"
				url="/usageManagement/v1/usage"
				rejectWithRequest>
		</iron-ajax>
	</template>
	<script>
		Polymer ({
			is: 'sig-accounting-list',
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
				},
				filterTimeStamp: {
					observer: '_filterTimeStamp'
				},
				filterclientIdentityAcc: {
					observer: '_filterclientIdentityAcc'
				},
				filteracctSessiontime: {
					observer: '_filteracctSessiontime'
				},
				filterout: {
					observer: '_filterout'
				},
				filterin: {
					observer: '_filterin'
				},
				filtertotal: {
					observer: '_filterTotal'
				},
				filterUserName: {
					observer: '_filterUserName'
				},
				filterPrices: {
					observer: '_filterPrices'
				},
				filterType: {
					observer: '_filterType'
				}
			},
			_activePageChanged: function(active) {
				if (active) {
					var grid = this.$.accountingGrid;
					grid.frozenColumns = 2;
					grid.columns = [
						{
							name: "date"
						},
						{
							name: "nasIdentifier"
						},
						{
							name: "acctSessiontime"
						},
						{
							name: "acctOutputoctets"
						},
						{
							name: "acctInputoctets"
						},
						{
							name: "acctTotaloctets"
						},
						{
							name: "username"
						},
						{
							name: "prices"
						},
						{
							name: "type"
						}
					];
					grid.dataProvider = this._getAccounting;
				}
			},
			_filterTimeStamp: function(filter) {
				this.etag = null;
				delete this.$.getAccounting.headers['If-Range'];
				this.$.accountingGrid.size = 0;
			},
			_filterclientIdentityAcc: function(filter) {
				this.etag = null;
				delete this.$.getAccounting.headers['If-Range'];
				this.$.accountingGrid.size = 0;
			}, 
			_filteracctSessiontime: function(filter) {
				this.etag = null;
				delete this.$.getAccounting.headers['If-Range'];
				this.$.accountingGrid.size = 0;
			},
			_filterout: function(filter) {
				this.etag = null;
				delete this.$.getAccounting.headers['If-Range'];
				this.$.accountingGrid.size = 0;
			},
			_filterin: function(filter) {
				this.etag = null;
				delete this.$.getAccounting.headers['If-Range'];
				this.$.accountingGrid.size = 0;
			},
			_filtertotal: function(filter) {
				this.etag = null;
				delete this.$.getAccounting.headers['If-Range'];
				this.$.accountingGrid.size = 0;
			},
			_filterUserName: function(filter) {
				this.etag = null;
				delete this.$.getAccounting.headers['If-Range'];
				this.$.accountingGrid.size = 0;
			},
			_filterPrices: function(filter) {
				this.etag = null;
				delete this.$.getAccounting.headers['If-Range'];
				this.$.accountingGrid.size = 0;
			},
			_filterType: function(filter) {
				this.etag = null;
				delete this.$.getAccounting.headers['If-Range'];
				this.$.accountingGrid.size = 0;
			},
			refreshAccounting: function() {
				this.etag = null;
				delete this.$.getAccounting.headers['If-Range'];
				this.filterTimeStamp = null;
				this.filterclientIdentityAcc = null;
				this.filteracctSessiontime = null;
				this.filterout = null;
				this.filterin = null;
				this.filtertotal = null;
				this.filterUserName = null;
				this.filterPrices = null;
				this.filterType = null
			},
			_getAccounting: function(params, callback) {
				var grid = document.getElementById('accountingGrid');
				var ajax = document.getElementById('getAccounting');
				delete ajax.params['date'];
				delete ajax.params['nasIdentifier'];
				delete ajax.params['acctSessiontime'];
				delete ajax.params['acctOutputoctets'];
				delete ajax.params['acctInputoctets'];
				delete ajax.params['acctTotaloctets'];
				delete ajax.params['filter'];
				ajax.params['type'] = "AAAAccountingUsage";
				function checkHead(param) {
					return param.path == "date" || param.path == "status";
				}
				var head;
				params.filters.filter(checkHead).forEach(function(filter) {
					if (filter.value) {
						ajax.params[filter.path] = filter.value;
					}
				});
				function checkChar(param) {
					return param.path != "date" && param.path != "status";
				}
				params.filters.filter(checkChar).forEach(function(filter) {
					if (filter.value) {
						if (!ajax.params['filter']) {
							ajax.params['filter'] = "\"[{usageCharacteristic.contains=[";
						} else {
							ajax.params['filter'] += ",";
						}
							if(isNaN(filter.value)) {
								ajax.params['filter'] += "{name=" + filter.path + ",value.like=[" + filter.value + "%]}";
							} else {
								ajax.params['filter'] += "{name=" + filter.path + ",value.gte=" + filter.value + "%}";
							}
					}
				});
				if (ajax.params['filter']) {
					ajax.params['filter'] += "]}]\"";
				}
				var accountingList = document.getElementById('accountingList');
				var handleAjaxResponse = function(request) {
					if (request) {
						accountingList.etag = request.xhr.getResponseHeader('ETag');
						var range = request.xhr.getResponseHeader('Content-Range');
						var range1 = range.split("/");
						var range2 = range1[0].split("-");
						if (range1[1] != "*") {
							grid.size = Number(range1[1]);
						} else {
							grid.size = Number(range2[1]) + grid.pageSize * 2;
						}
						var vaadinItems = new Array();
						for (var index in request.response) {
							var newRecord = new Object();
							newRecord.date = request.response[index].date;
							function checkChar2(characteristic) {
								return characteristic.name == "nasIdentifier";
							}
							var index2 = request.response[index].usageCharacteristic.findIndex(checkChar2);
							if(index2 != -1) {
								newRecord.nasIdentifier = request.response[index].usageCharacteristic[index2].value;
							}
							function checkChar3(characteristic) {
								return characteristic.name == "acctSessionTime";
							}
							var index3 = request.response[index].usageCharacteristic.findIndex(checkChar3);
							if(index3 != -1) {
								newRecord.acctSessiontime = request.response[index].usageCharacteristic[index3].value;
							}
							function checkChar4(characteristic) {
								return characteristic.name == "outputOctets";
							}
							var index4 = request.response[index].usageCharacteristic.findIndex(checkChar4);
							if(index4 != -1) {
								newRecord.acctOutputoctets = request.response[index].usageCharacteristic[index4].value;
							}
							function checkChar5(characteristic) {
								return characteristic.name == "inputOctets";
							}
							var index5 = request.response[index].usageCharacteristic.findIndex(checkChar5);
							if(index5 != -1) {
								newRecord.acctInputoctets = request.response[index].usageCharacteristic[index5].value;
							}
							function checkChar6(characteristic) {
								return characteristic.name == "totalOctets";
							}
							var index6 = request.response[index].usageCharacteristic.findIndex(checkChar6);
							if(index6 != -1) {
								newRecord.acctTotaloctets = request.response[index].usageCharacteristic[index6].value;
							}
							function checkChar7(characteristic) {
								return characteristic.name == "username";
							}
							var username1 = request.response[index].usageCharacteristic.find(checkChar7);
							if (username1 != undefined) {
								newRecord.username = username1.value;
							}
							function checkChar8(characteristic) {
								return characteristic.name == "type";
							}
							var index8 = request.response[index].usageCharacteristic.findIndex(checkChar8);
							if (index8 != -1) {
								newRecord.type = request.response[index].usageCharacteristic[index8].value;
							}
							for(var indexTax in request.response[index].ratedProductUsage) {
								var taxObj = request.response[index].ratedProductUsage[indexTax].taxExcludedRatingAmount;
								if(taxObj) {
									newRecord.prices = taxObj;
								}
							}
						vaadinItems[index] = newRecord;
						}
						callback(vaadinItems);
					} else {
						grid.size = 0;
						callback([]);
					}
				}
				var handleAjaxError = function(error) {
					accountingList.etag = null;
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
					if (accountingList.etag && params.page > 0) {
						ajax.headers['If-Range'] = accountingList.etag;
					} else {
						delete ajax.headers['If-Range'];
					}
						return ajax.generateRequest().completes;
					}, handleAjaxError).then(handleAjaxResponse, handleAjaxError);
				} else {
					var startRange = params.page * params.pageSize + 1;
					var endRange = startRange + params.pageSize - 1;
					ajax.headers['Range'] = "items=" + startRange + "-" + endRange;
					if (accountingList.etag && params.page > 0) {
						ajax.headers['If-Range'] = accountingList.etag;
					} else {
						delete ajax.headers['If-Range'];
					}
					ajax.generateRequest().completes.then(handleAjaxResponse, handleAjaxError);
				}
			}
		});
	</script>
</dom-module>
