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

<dom-module id="sig-product-list">
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
		<vaadin-grid id="productInventoryGrid" active-item="{{activeItem}}">
			<vaadin-grid-column width="15ex" flex-grow="5">
				<template class="header">
					<vaadin-grid-filter aria-label="[[i18n.prodId]]" path="id" value="[[_filterProId]]">
						<input placeholder="[[i18n.prodId]]" value="{{_filterProId::input}}" focus-target>
					</vaadin-grid-filter>
				</template>
				<template>[[item.id]]</template>
			</vaadin-grid-column>
			<vaadin-grid-column width="15ex" flex-grow="5">
				<template class="header">
					<vaadin-grid-filter aria-label="[[i18n.service]]" path="service" value="[[_filterIdentity]]">
						<input placeholder="[[i18n.service]]" value="{{_filterIdentity::input}}" focus-target>
					</vaadin-grid-filter>
				</template>
				<template>[[item.service]]</template>
			</vaadin-grid-column>
			<vaadin-grid-column-group>
				<template class="header">
					<div class="grouptitle">[[i18n.balance]]</div>
				</template>
				<vaadin-grid-column width="12ex" flex-grow="2">
					<template class="header">
						<i18n-msg msgid="cents">
							Cents
						</i18n-msg>
					</template>
					<template>
						<div class="cell numeric">[[item.cents]]</div>
					</template>
				</vaadin-grid-column>
				<vaadin-grid-column width="12ex" flex-grow="2">
					<template class="header">
						<i18n-msg msgid="bytes">
							Bytes
						</i18n-msg>
					</template>
					<template>
						<div class="cell numeric">[[item.bytes]]</div>
					</template>
				</vaadin-grid-column>
				<vaadin-grid-column width="12ex" flex-grow="2">
					<template class="header">
						<i18n-msg msgid="seconds">
							Seconds
						</i18n-msg>
					</template>
					<template>
						<div class="cell numeric">[[item.seconds]]</div>
					</template>
				</vaadin-grid-column>
				<vaadin-grid-column width="12ex" flex-grow="2">
					<template class="header">
						<i18n-msg msgid="messages">
							Messages
						</i18n-msg>
					</template>
					<template>
						<div class="cell numeric">[[item.messages]]</div>
					</template>
				</vaadin-grid-column>
			</vaadin-grid-column-group>
			<vaadin-grid-column width="15ex" flex-grow="5">
				<template class="header">
					<vaadin-grid-filter aria-label="[[i18n.offer]]" path="product" value="[[_filterOffer]]">
						<input placeholder="[[i18n.offer]]" value="{{_filterOffer::input}}" focus-target>
					</vaadin-grid-filter>
				</template>
				<template>[[item.product]]</template>
			</vaadin-grid-column>
		</vaadin-grid>
		<div class="add-button">
			<paper-fab
				icon="add"
				on-tap="showAddProductInven">
			</paper-fab>
		</div>
		<iron-ajax
			id="getProductInventory"
			url="/productInventoryManagement/v2/product/"
			rejectWithRequest>
		</iron-ajax>
	</template>
	<script>
		var cbProducts;
		var etag;
		var lastItem;
		Polymer ({
			is: 'sig-product-list',
			behaviors: [i18nMsgBehavior],
			properties: {
				activePage: {
					type: Boolean,
					value: false,
					observer: '_activePageChanged'
				},
				activeItem: {
					observer: '_activeItemChanged',
				},
				_filterProId: {
					observer: '_filterChangedProId'
				},
				_filterIdentity: {
					observer: 'filterChangedIdentity'
				},
				_filterOffer: {
					observer: 'filterChangedOffer'
				}
			},
			_activeItemChanged: function(item) {
				if(item != null) {
					var grid = this.$.productInventoryGrid;
					grid.selectedItems = item ? [item] : [];
					document.getElementById('deleteProductModal').open();
					document.getElementById('deleteProId').value = item.id;
				}
			},
			_activePageChanged: function(active) {
				if(active) {
					var grid = this.$.productInventoryGrid;
					grid.columns = [
						{
							name: "productId" 
						},
						{
							name: "identity"
						},
						{
							name: "offering"
						}
					];
					grid.dataProvider = this._getProduct;
				}
			},
			_filterChangedProId: function(filter) {
				this.etag = null;
				delete this.$.getProductInventory.headers['If-Range'];
				this.$.productInventoryGrid.size = 0;
			},
			filterChangedIdentity: function(filter) {
				this.etag = null;
				delete this.$.getProductInventory.headers['If-Range'];
				this.$.productInventoryGrid.size = 0;
			},
			filterChangedOffer: function(filter) {
				this.etag = null;
				delete this.$.getProductInventory.headers['If-Range'];
				this.$.productInventoryGrid.size = 0;
			},
			refreshProduct: function() {
				this.etag = null;
				delete this.$.getProductInventory.headers['If-Range'];
				delete this.$.getProductInventory.params['filter'];
				this._filterProId = null;
				this._filterIdentity = null;
				this._filterOffer = null;
			},
			_getProduct: function(params, callback) {
				var grid = document.getElementById('productInventoryGrid');
				var ajax = document.getElementById("getProductInventory");
				delete ajax.params['filter'];
				function checkHead(param) {
					return param.path == "id" || param.path == "product" || param.path == "service";
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
				var productList = document.getElementById('productList');
				var handleAjaxResponse = function(request) {
					if(request) {
						productList.etag = request.xhr.getResponseHeader('ETag');
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
							newRecord.id = request.response[index].id;
							newRecord.product = request.response[index].productOffering.name;
							for(var indexPro in request.response[index].balance) {
								if(request.response[index].balance[indexPro].totalBalance) {
									if(request.response[index].balance[indexPro]
												.totalBalance.units == "cents") {
										if(!request.response[index].balance[indexPro].totalBalance.amount)	{
											newRecord.cents = request.response[index].balance[indexPro].totalBalance.amount;
										} else {
											newRecord.cents = request.response[index].balance[indexPro].totalBalance.amount;
										}
									}
									if(request.response[index].balance[indexPro]
												.totalBalance.units == "seconds") {
										if(!request.response[index].balance[indexPro].totalBalance.amount) {
											newRecord.seconds = request.response[index].balance[indexPro].totalBalance.amount;
										} else {
											newRecord.seconds = request.response[index].balance[indexPro].totalBalance.amount;
										}
									}
									if(request.response[index].balance[indexPro]
												.totalBalance.units == "octets") {
										if(!request.response[index].balance[indexPro].totalBalance.amount) {
											newRecord.bytes = request.response[index].balance[indexPro].totalBalance.amount;
										} else {
											newRecord.bytes = request.response[index].balance[indexPro].totalBalance.amount;
										}
									}
									if(request.response[index].balance[indexPro]
												.totalBalance.units == "messages") {
										if(!request.response[index].balance[indexPro].totalBalance.amount) {
											newRecord.messages = request.response[index].balance[indexPro].totalBalance.amount;
										} else {
											newRecord.messages = request.response[index].balance[indexPro].totalBalance.amount;
										}
									}
								}
							}
							for(var indexSer in request.response[index].realizingService) {
								newRecord.service = request.response[index].realizingService[indexSer].id;
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
					productList.etag = null;
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
					if (productList.etag && params.page > 0) {
						ajax.headers['If-Range'] = productList.etag;
					} else {
						delete ajax.headers['If-Range'];
					}
						return ajax.generateRequest().completes;
					}, handleAjaxError).then(handleAjaxResponse, handleAjaxError);
				} else {
					var startRange = params.page * params.pageSize + 1;
					var endRange = startRange + params.pageSize - 1;
					ajax.headers['Range'] = "items=" + startRange + "-" + endRange;
					if (productList.etag && params.page > 0) {
						ajax.headers['If-Range'] = productList.etag;
					} else {
						delete ajax.headers['If-Range'];
					}
				ajax.generateRequest().completes.then(handleAjaxResponse, handleAjaxError);
				}
			},
			showAddProductInven: function(event) {
				document.getElementById("addProductInvenModal").open();
			}
		})
	</script>
</dom-module>
