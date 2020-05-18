<!--  vim: set ts=3:  -->
<link rel="import" href="polymer/polymer.html">
<link rel="import" href="vaadin-grid/vaadin-grid.html">
<link rel="import" href="vaadin-grid/vaadin-grid-filter.html">
<link rel="import" href="i18n-msg/i18n-msg-behavior.html">
<link rel="import" href="iron-ajax/iron-ajax.html">
<link rel="import" href="paper-fab/paper-fab.html" >
<link rel="import" href="paper-toast/paper-toast.html">
<link rel="import" href="paper-styles/color.html">
<link rel="import" href="sig-client-add.html">

<dom-module id="sig-client-list">
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
			.add-button {
				right: 2%;
				position: fixed;
				bottom: 5%;
				z-index: 100;
			}
			paper-fab {
				background: var(--paper-lime-a700);
				color: black;
			}
			vaadin-grid {
				height: 100%;
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
			.yellow-button {
				text-transform: none;
				color: #eeff41;
			}
		</style>
		<vaadin-grid
				id="clientGrid"
				active-item="{{activeItem}}">
			<vaadin-grid-column width="15ex" flex-grow="1">
				<template class="header">
					<vaadin-grid-filter aria-label="[[i18n.address]]" path="id" value="[[_filterAddress]]">
						<input placeholder="[[i18n.address]]" value="{{_filterAddress::input}}" focus-target>
					</vaadin-grid-filter>
				</template>
				<template>[[item.id]]</template>
			</vaadin-grid-column>
			<vaadin-grid-column width="4ex" flex-grow="1">
				<template class="header">
					<vaadin-grid-filter aria-label="[[i18n.listen]]" path="port" value="[[_filterPort]]">
						<input placeholder="[[i18n.listen]]" value="{{_filterPort::input}}" focus-target>
					</vaadin-grid-filter>
				</template>
				<template>[[item.port]]</template>
			</vaadin-grid-column>
			<vaadin-grid-column width="20ex" flex-grow="2">
				<template class="header">
					<vaadin-grid-filter aria-label="[[i18n.identify]]" path="identifier" value="[[_filterIdentifier]]">
						<input placeholder="[[i18n.identify]]" value="{{_filterIdentifier::input}}" focus-target>
					</vaadin-grid-filter>
				</template>
				<template>[[item.identifier]]</template>
			</vaadin-grid-column>
			<vaadin-grid-column width="15ex" flex-grow="3">
				<template class="header">
					<vaadin-grid-filter aria-label="[[i18n.secret]]" path="secret" value="[[_filterSecret]]">
						<input placeholder="[[i18n.secret]]" value="{{_filterSecret::input}}" focus-target>
					</vaadin-grid-filter>
				</template>
				<template>[[item.secret]]</template>
			</vaadin-grid-column>
			<vaadin-grid-column width="8ex" flex-grow="1">
				<template class="header">
					<vaadin-grid-filter aria-label="[[i18n.proto]]" path="protocol" value="[[_filterProtocol]]">
						<input placeholder="[[i18n.proto]]" value="{{_filterProtocol::input}}" focus-target>
					</vaadin-grid-filter>
				</template>
				<template>[[item.protocol]]</template>
			</vaadin-grid-column>
		</vaadin-grid>
		<div class="add-button">
			<paper-fab
					icon="add"
					on-tap = "showAddClientModal">
			</paper-fab>
		</div>
		<paper-toast
				id="addClientToastSuccess"
				text="[[i18n.clientAdded]]">
		</paper-toast>
		<paper-toast
				id="updateClientToastSuccess"
				text="[[i18n.clientUpdated]]">
		</paper-toast>
		<paper-toast
				id="deleteClientToastSuccess"
				text="[[i18n.clientDeleted]]">
		</paper-toast>
		<paper-toast id="getClientErrorToast" duration="0">
			<paper-button
					class="yellow-button"
					onclick="getClientErrorToast.toggle()">
				Close
			</paper-button>
		</paper-toast>
		<paper-toast id="clientErrorToast" duration="0">
			<paper-button
					class="yellow-button"
					onclick="clientErrorToast.toggle()">
				Close
			</paper-button>
		</paper-toast>
		<iron-ajax
				id="getClientAjax"
				url="/ocs/v1/client"
				rejectWithRequest>
		</iron-ajax>
	</template>
	<script>
		var cbClient;
		var etag;
		var lastItem;
		Polymer ({
			is: 'sig-client-list',
			behaviors: [i18nMsgBehavior],
			properties: {
				activePage: {
					type: Boolean,
					value: false,
					observer: '_activePageChanged'
				},
				activeItem: {
					observer: '_activeItemChanged'
				},
				_filterAddress: {
					observer: '_filterChangedAddress'
				},
				_filterPort: {
					observer: ' _filterChangedPort'
				}
			},
			_activePageChanged: function(active) {
				if (active) {
					var grid = this.$.clientGrid;
					grid.columns = [
						{
							name: "id",
						},
						{
							name: "port"
						},
						{
							name: "identifier"
						},
						{
							name: "secret"
						},
						{
							name: "protocol"
						}
					];
					grid.dataProvider = this.clientResponse;
				}
			},
			_filterChangedAddress: function(filter) {
				this.etag = null;
				delete this.$.getClientAjax.headers['If-Range'];
				this.$.clientGrid.size = 0;
			},
			_filterChangedPort: function(filter) {
				this.etag = null;
				delete this.$.getClientAjax.headers['If-Range'];
				this.$.clientGrid.size = 0;
			},
			_activeItemChanged: function(item) {
				if (item != null){
					var grid = this.$.clientGrid;
					grid.selectedItems = item ? [item] : [];
					document.getElementById("updateClientModal").open();
					document.getElementById("updateClientId").value = item.id;
					document.getElementById("updateClientPassword").value = item.secret;
					if (item.passwordRequired == false) {
						document.getElementById("checkPassUpdate").checked = true;
					}
					document.getElementById("updateClientDisconnectPort").value = item.port;
					if (item.protocol == "RADIUS") {
						document.getElementById("updateClientProtocolList").selected = 0;
						document.getElementById("updateClientPassword").hidden = false;
						document.getElementById("updateClientNewPassword").hidden = false;
						document.getElementById("passClientHide").show();
					} else if (item.protocol == "DIAMETER") {
						document.getElementById("updateClientProtocolList").selected = 1;
						document.getElementById("updateClientPassword").hidden = true;
						document.getElementById("updateClientNewPassword").hidden = true;
						document.getElementById("passClientHide").hide();
					}
				}
			},
			refreshClient: function() {
				this.etag = null;
				delete this.$.getClientAjax.headers['If-Range'];
				delete this.$.getClientAjax.params['filter'];
				this._filterAddress = null;
				this._filterPort = null;
			},
			clientResponse: function(params, callback) {
				var grid = document.getElementById('clientGrid');
				var ajax = document.getElementById('getClientAjax');
				delete ajax.params['filter'];
				function checkHead(param) {
					return param.path == "id" || param.path == "port" 
				}
				params.filters.filter(checkHead).forEach(function(filter) {
					if(filter.value) {
						if(ajax.params['filter']) {
							ajax.params['filter'] += "]," + filter.path + ".like=[" + filter.value + "%";
						} else {
							ajax.params['filter'] = "\"[{" + filter.path + ".like=[" + filter.value + "%";
						}
					}
				});
				if (ajax.params['filter']) {
					ajax.params['filter'] += "]}]\"";
				}
				var clientList = document.getElementById('clientList');
				var handleAjaxResponse = function(request) {
					if(request) {
						clientList.etag = request.xhr.getResponseHeader('ETag');
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
							return characteristic.name == "id"
						}
						for (var index in request.response) {
							var newRecord = new Object();
							newRecord.id = request.response[index].id;
							newRecord.identifier = request.response[index].identifier;
							newRecord.secret = request.response[index].secret;
							newRecord.passwordRequired = request.response[index].passwordRequired;
							newRecord.port = request.response[index].port;
							newRecord.protocol = request.response[index].protocol;
							vaadinItems[index] = newRecord;
						}
						callback(vaadinItems);
					} else {
						grid.size = 0;
						callback([]);
					}
				};
				var handleAjaxError = function(error) {
					clientList.etag = null;
					var toast = document.getElementById('userToastError');
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
						if (clientList.etag && params.page > 0) {
							ajax.headers['If-Range'] = clientList.etag;
						} else {
							delete ajax.headers['If-Range'];
						}
						return ajax.generateRequest().completes;
					}, handleAjaxError).then(handleAjaxResponse, handleAjaxError);
				} else {
					var startRange = params.page * params.pageSize + 1;
					var endRange = startRange + params.pageSize - 1;
					ajax.headers['Range'] = "items=" + startRange + "-" + endRange;
					if (clientList.etag && params.page > 0) {
						ajax.headers['If-Range'] = clientList.etag;
					} else {
						delete ajax.headers['If-Range'];
					}
					ajax.generateRequest().completes.then(handleAjaxResponse, handleAjaxError);
				}
			},
			showAddClientModal: function(event) {
				document.getElementById("addClientModal").open();
			}
		});
	</script>
</dom-module>
