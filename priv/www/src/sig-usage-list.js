<!--  vim: set ts=3:  -->
<link rel="import" href="polymer/polymer.html">
<link rel="import" href="vaadin-grid/vaadin-grid.html">
<link rel="import" href="vaadin-grid/vaadin-grid-filter.html">
<link rel="import" href="i18n-msg/i18n-msg-behavior.html">
<link rel="import" href="iron-ajax/iron-ajax.html">
<link rel="import" href="paper-toast/paper-toast.html">
<link rel="import" href="paper-styles/color.html">

<dom-module id="sig-usage-list">
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
			height: 100vh;
			font-size: inherit;
			--vaadin-grid-header-cell: {
				background: #ffb04c;
			};
		}
		vaadin-grid input {
			font-size: inherit;
			background: #ffb04c;
			border-style: none;
		}
	</style>
	<template>
		<vaadin-grid id="usageGrid">
			<vaadin-grid-column width="15ex" flex-grow="5">
				<template class="header">
					<vaadin-grid-filter
							aria-label="[[i18n.dateTime]]"
							path="date"
							value="{{filterDate}}">
						<input
								placeholder="[[i18n.dateTime]]"
								value="{{filterDate::input}}"
								focus-target>
					</vaadin-grid-filter>
				</template>
				<template>[[item.date]]</template>
			</vaadin-grid-column>
			<vaadin-grid-column width="15ex" flex-grow="5">
				<template class="header">
					<vaadin-grid-filter
							aria-label="[[i18n.userName]]"
							path="username"
							value="{{filterUsername}}">
						<input
								placeholder="[[i18n.userName]]"
								value="{{filterUsername::input}}"
								focus-target>
					</vaadin-grid-filter>
				</template>
				<template>[[item.username]]</template>
			</vaadin-grid-column>
		</vaadin-grid>
		<paper-toast
				id="usageToastError">
		</paper-toast>
		<iron-ajax
				id="getUsageAjax"
				url="/usageManagement/v1/usage"
				rejectWithRequest>
		</iron-ajax>
	</template>
	<script>
		Polymer ({
			is: 'sig-usage-list',
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
				filterDate: {
					observer: '_filterChangedDate'
				},
				filterUsername: {
					observer: '_filterChangedUsername'
				}
			},
			_activePageChanged: function(active) {
				if (active) {
					var grid = this.$.usageGrid;
					grid.size = 0;
					grid.columns = [
						{
							name: "date"
						},
						{
							name: "username"
						}
					];
					grid.dataProvider = this._getUsage;
				}
			},
			_filterChangedDate: function(filter) {
				this.etag = null;
				delete this.$.getUsageAjax.headers['If-Range'];
				this.$.usageGrid.size = 0;
			},
			_filterChangedUsername: function(filter) {
				this.etag = null;
				delete this.$.getUsageAjax.headers['If-Range'];
				this.$.usageGrid.size = 0;
			},
			refresh: function() {
				this.etag = null;
				delete this.$.getUsageAjax.headers['If-Range'];
				this.$.usageGrid.size = 0;
				delete this.$.getUsageAjax.params['filter'];
				delete this.$.getUsageAjax.params['date'];
				this.filterDate = null;
				this.filterUsername= null;
				//	this.$.usageGrid.clearCache();
			},
			_getUsage: function(params, callback) {
				var grid = document.getElementById('usageGrid');
				var ajax = document.getElementById('getUsageAjax');
				delete ajax.params['date'];
				delete ajax.params['status'];
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
				var usageList = document.getElementById('usageList');
				var handleAjaxResponse = function(request) {
					if (request) {
						usageList.etag = request.xhr.getResponseHeader('ETag');
						var range = request.xhr.getResponseHeader('Content-Range');
						var range1 = range.split("/");
						var range2 = range1[0].split("-");
						if (range1[1] != "*") {
							grid.size = Number(range1[1]);
						} else {
							grid.size = Number(range2[1]) + grid.pageSize * 2;
						}
						var vaadinItems = new Array();
						function checkChar(characteristic) {
							return characteristic.name == "username";
						}
						for (var index in request.response) {
							var newRecord = new Object();
							newRecord.id = request.response[index].id;
							newRecord.date = request.response[index].date;
							var usernameChar = request.response[index].usageCharacteristic.find(checkChar);
							if (usernameChar != undefined) {
								newRecord.username = usernameChar.value;
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
					usageList.etag = null;
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
						if (usageList.etag && params.page > 0) {
							ajax.headers['If-Range'] = usageList.etag;
						} else {
							delete ajax.headers['If-Range'];
						}
						return ajax.generateRequest().completes;
					}, handleAjaxError).then(handleAjaxResponse, handleAjaxError);
				} else {
					var startRange = params.page * params.pageSize + 1;
					var endRange = startRange + params.pageSize - 1;
					ajax.headers['Range'] = "items=" + startRange + "-" + endRange;
					if (usageList.etag && params.page > 0) {
						ajax.headers['If-Range'] = usageList.etag;
					} else {
						delete ajax.headers['If-Range'];
					}
					ajax.generateRequest().completes.then(handleAjaxResponse, handleAjaxError);
				}
			}
		});
	</script>
</dom-module>
