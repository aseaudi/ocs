<!--  vim: set ts=3:  -->
<link rel="import" href="polymer/polymer.html">
<link rel="import" href="vaadin-grid/vaadin-grid.html">
<link rel="import" href="vaadin-grid/vaadin-grid-filter.html">
<link rel="import" href="vaadin-grid/vaadin-grid-column-group.html">
<link rel="import" href="i18n-msg/i18n-msg-behavior.html">
<link rel="import" href="iron-ajax/iron-ajax.html">
<link rel="import" href="paper-fab/paper-fab.html" >
<link rel="import" href="paper-toast/paper-toast.html">
<link rel="import" href="paper-styles/color.html">
<link rel="import" href="sig-sub-add.html">

<dom-module id="sig-sub-list">
	<template>
		<style is="custom-style">
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
				--vaadin-grid-header-cell: {
					background: #ffb04c;
				};
			}
			vaadin-grid .grouptitle {
				text-align: center;
				border-bottom-style: solid;
				border-color: var(--paper-yellow-900);
			}
			vaadin-grid .cell.numeric{
				text-align: right;
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
		<vaadin-grid id="subscriberGrid" active-item="{{activeItem}}">
			<vaadin-grid-column width="15ex" flex-grow="5">
				<template class="header">
					<vaadin-grid-filter aria-label="[[i18n.identity]]" path="id" value="[[_filterIdentity]]">
						<input placeholder="[[i18n.identity]]" value="{{_filterIdentity::input}}" focus-target>
					</vaadin-grid-filter>
				</template>
				<template>[[item.id]]</template>
			</vaadin-grid-column>
			<vaadin-grid-column width="14ex">
				<template class="header">
					<i18n-msg msgid="password">
						Password
					</i18n-msg>
				</template>
				<template>[[item.password]]</template>
			</vaadin-grid-column>
			<vaadin-grid-column width="8ex" flex-grow="5">
				<template class="header">
					<vaadin-grid-filter aria-label="[[i18n.prod]]" path="product" value="[[_filterBalance]]">
						<input placeholder="[[i18n.prod]]" value="{{_filterBalance::input}}" focus-target>
					</vaadin-grid-filter>
				</template>
			<template>[[item.product]]</template>
			</vaadin-grid-column>
			<vaadin-grid-column width="8ex" flex-grow="1">
				<template class="header">
					<i18n-msg msgid="enable">
						Enabled
					</i18n-msg>
				</template>
				<template>[[item.enabled]]</template>
			</vaadin-grid-column>
			<vaadin-grid-column width="8ex" flex-grow="1">
				<template class="header">
					<i18n-msg msgid="multi">
						Multisession
					</i18n-msg>
				</template>
				<template>[[item.multisession]]</template>
			</vaadin-grid-column>
		</vaadin-grid>
		<div class="add-button">
			<paper-fab
					icon="add"
					on-tap="showAddModal">
			</paper-fab>
		</div>
		<paper-toast
				id="addSubscriberToastSuccess"
				text="[[i18n.subscriberAdded]]">
		</paper-toast>
		<paper-toast
				id="updateSubscriberToastSuccess"
				text="[[i18n.subscriberUpdated]]">
		</paper-toast>
		<paper-toast
				id="deleteSubscriberToastSuccess"
				text="[[i18n.subscriberDeleted]]">
		</paper-toast>
		<paper-toast
				id="addSubscriberProductToastError"
				text="[[i18n.toastErrorSubPro]]">
		</paper-toast>
		<paper-toast id="getSubscriberErrorToast" duration="0">
			<paper-button
					class="yellow-button"
					onclick="getSubscriberErrorToast.toggle()">
				Close
			</paper-button>
		</paper-toast>
		<iron-ajax
			id="getSubscriberAjax"
			url="/serviceInventoryManagement/v2/service"
			rejectWithRequest>
		</iron-ajax>
		<iron-ajax
			id="getProductInventoryAjax"
			on-response="_getProductResponse"
			on-error="_getProductError">
		</iron-ajax>
	</template>
	<script>
		var cbSubscriber;
		var etag;
		var lastItem;
		Polymer ({
			is: 'sig-sub-list',
			behaviors: [i18nMsgBehavior],
			properties: {
				activePage: {
					type: Boolean,
					value: false,
					observer: '_activePageChanged'
				},
				activeItem: {
					observer:'_activeItemChanged'
				},
				_filterIdentity: {
					observer: '_filterChangedId'
				},
				_filterBalance: {
					observer: '_filterChangedProduct'
				}
			},
			_activePageChanged: function(active) {
				if (active) {
					var grid = this.$.subscriberGrid;
					grid.columns = [
						{
							name: "id"
						},
						{
							name: "password"
						},
						{
							name: "product"
						},
						{
							name: "totalBalance"
						},
						{
							name: "cents"
						},
						{
							name: "seconds"
						},
						{
							name: "ascendDataRate"
						},
						{
							name: "ascendXmitRate"
						},
						{
							name: "sessionTimeout"
						},
						{
							name: "acctInterimInterval"
						},
						{
							name: "class"
						},
						{
							name: "enabled"
						},
						{
							name: "multisession"
						}
					];
					grid.dataProvider = this._getSubscriberResponse;
				}
			},
			_filterChangedId: function(filter) {
				this.etag = null;
				delete this.$.getSubscriberAjax.headers['If-Range'];
				this.$.subscriberGrid.size = 0;
			},
			_filterChangedProduct: function(filter) {
				this.etag = null;
				delete this.$.getSubscriberAjax.headers['If-Range'];
				this.$.subscriberGrid.size = 0;
			},
			_activeItemChanged: function(item) {
				if (item != null){
					var ajaxCh = document.getElementById("getServiceRespAjax");
					ajaxCh.url = "/serviceInventoryManagement/v2/service/" + item.id;
					ajaxCh.generateRequest();
					document.getElementById("updateSubscriberProductsAjax").generateRequest();
					this.$.subscriberGrid.selectedItems = item ? [item] : [];
					document.getElementById("updateSubscriberModal").open();
					document.getElementById("updateSubscriberId").value = item.id;
					document.getElementById("updateSubscriberPassword").value = item.password;
					document.getElementById("updatePro").value = item.product;
					document.getElementById("updateSubscriberTimeout").value = item.sessionTimeout;
					document.getElementById("updateSubscriberInterval").value = item.acctInterimInterval;
					document.getElementById("updateSubscriberClass").value =  item.class;
					document.getElementById("updateSubscriberEnabled").checked =  item.enabled;
					document.getElementById("updateSubscriberMulti").checked =  item.multisession;
				}
			},
			refreshSub: function() {
				this.etag = null;
				delete this.$.getSubscriberAjax.headers['If-Range'];
				delete this.$.getSubscriberAjax.params['filter'];
				this._filterIdentity = null;
				this._filterBalance = null;
			},
			_getSubscriberResponse: function(params, callback) {
				var grid = document.getElementById('subscriberGrid');
				var ajax = document.getElementById('getSubscriberAjax'); 
				delete ajax.params['filter'];
				function checkHead(param) {
					return param.path == "id" || param.path == "product";
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
				var serviceList = document.getElementById('serviceList');
				var handleAjaxResponse = function(request) {
					if (request) {
						serviceList.etag = request.xhr.getResponseHeader('ETag');
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
							if(request.response[index].product) {
								newRecord.product = request.response[index].product;
							} else {
								newRecord.product = document.getElementById("subscriberAdd").productId;
							}
							if(request.response[index].attributes) {
								request.response[index].attributes.forEach(
									function(attrObj) {
										newRecord[attrObj.name] = attrObj.value;
									}
								);
							}
							function checkPassword(pass) {
								return pass.name == "servicePassword";
							}
							var indexPass = request.response[index].serviceCharacteristic.findIndex(checkPassword);
							if(indexPass != -1) {
								newRecord.password = request.response[index].serviceCharacteristic[indexPass].value;
							}
							newRecord.enabled = request.response[index].isServiceEnabled;
							function checkMultisession(multi) {
								return multi.name == "multiSession";
							}
							var indexMulti = request.response[index].serviceCharacteristic.findIndex(checkMultisession);
							if(indexMulti != -1) {
								newRecord.multisession = request.response[index].serviceCharacteristic[indexMulti].value;
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
					serviceList.etag = null;
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
						if (serviceList.etag && params.page > 0) {
							ajax.headers['If-Range'] = serviceList.etag;
						} else {
							delete ajax.headers['If-Range'];
						}
						return ajax.generateRequest().completes;
					}, handleAjaxError).then(handleAjaxResponse, handleAjaxError);
				} else {
					var startRange = params.page * params.pageSize + 1;
					var endRange = startRange + params.pageSize - 1;
					ajax.headers['Range'] = "items=" + startRange + "-" + endRange;
					if (serviceList.etag && params.page > 0) {
						ajax.headers['If-Range'] = serviceList.etag;
					} else {
						delete ajax.headers['If-Range'];
					}
					ajax.generateRequest().completes.then(handleAjaxResponse, handleAjaxError);
				}
			},
			showAddModal: function(event) {
				document.getElementById("addServiceModal").open();
			}
		});
	</script>
</dom-module>
