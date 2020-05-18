<!--  vim: set ts=3:  -->
<link rel="import" href="polymer/polymer.html">
<link rel="import" href="vaadin-grid/vaadin-grid.html">
<link rel="import" href="vaadin-grid/vaadin-grid-filter.html">
<link rel="import" href="i18n-msg/i18n-msg-behavior.html">
<link rel="import" href="iron-ajax/iron-ajax.html">
<link rel="import" href="paper-fab/paper-fab.html" >
<link rel="import" href="paper-toast/paper-toast.html">
<link rel="import" href="paper-styles/color.html">

<dom-module id="sig-offer-list">
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
		<vaadin-grid id="offerGrid" active-item="{{activeItem}}">
			<vaadin-grid-column width="15ex" flex-grow="5">
				<template class="header">
					<vaadin-grid-filter aria-label="[[i18n.name]]" path="id" value="[[_filterName]]">
						<input placeholder="[[i18n.name]]" value="{{_filterName::input}}" focus-target>
					</vaadin-grid-filter>
				</template>
				<template>[[item.id]]</template>
			</vaadin-grid-column>
			<vaadin-grid-column width="15ex" flex-grow="13">
				<template class="header">
					<vaadin-grid-filter aria-label="[[i18n.des]]" path="description" value="[[_filterDes]]">
						<input placeholder="[[i18n.des]]" value="{{_filterDes::input}}" focus-target>
					</vaadin-grid-filter>
				</template>
				<template>[[item.description]]</template>
			</vaadin-grid-column>
			<vaadin-grid-column width="15ex" flex-grow="10">
				<template class="header">
					<vaadin-grid-filter aria-label="[[i18n.start]]" path="startDate" value="[[_filterStart]]">
						<input placeholder="[[i18n.start]]" value="{{_filterStart::input}}" focus-target>
					</vaadin-grid-filter>
				</template>
				<template>[[item.startDate]]</template>
			</vaadin-grid-column>
			<vaadin-grid-column width="15ex" flex-grow="10">
				<template class="header">
					<vaadin-grid-filter aria-label="[[i18n.end]]" path="endDate" value="[[_filterEnd]]">
						<input placeholder="[[i18n.end]]" value="{{_filterEnd::input}}" focus-target>
					</vaadin-grid-filter>
				</template>
				<template>[[item.endDate]]</template>
			</vaadin-grid-column>
			<vaadin-grid-column width="15ex" flex-grow="7">
				<template class="header">
					<vaadin-grid-filter aria-label="[[i18n.status]]" path="status" value="[[_filterStatus]]">
						<input placeholder="[[i18n.status]]" value="{{_filterStatus::input}}" focus-target>
					</vaadin-grid-filter>
				</template>
				<template>[[item.status]]</template>
			</vaadin-grid-column>
			<vaadin-grid-column width="15ex" flex-grow="8">
				<template class="header">
					<vaadin-grid-filter aria-label="[[i18n.prices]]" path="price" value="[[_filterPrice]]">
						<input placeholder="[[i18n.prices]]" value="{{_filterPrice::input}}" focus-target>
					</vaadin-grid-filter>
				</template>
				<template>[[item.price]]</template>
			</vaadin-grid-column>
		</vaadin-grid>
		<div class="add-button">
			<paper-fab
					icon="add"
					on-tap="showAddProductModal">
			</paper-fab>
		</div>
		<paper-toast
				id="addProductToastSuccess"
				text="[[i18n.productAdded]]">
		</paper-toast>
		<paper-toast
				id="addProductPriceToastSuccess"
				text="[[i18n.productPriceAdded]]">
		</paper-toast>
		<paper-toast
				id="addProductAlterationToastSuccess"
				text="[[i18n.productAlterationAdded]]">
		</paper-toast>
		<paper-toast
				id="updateProductToastSuccess"
				text="[[i18n.productUpdated]]">
		</paper-toast>
		<paper-toast
				id="deleteProductToastSuccess"
				text="[[i18n.productDeleted]]">
		</paper-toast>
		<paper-toast
				id="addProductToastError"
				text="[[i18n.validateToastError]]">
		</paper-toast>
		<paper-toast id="getProductErrorToast" duration="0">
			<paper-button
					class="yellow-button"
					onclick="getProductErrorToast.toggle()">
				Close
			</paper-button>
		</paper-toast>
		<iron-ajax id="getProductAjax"
			url="/catalogManagement/v2/productOffering"
			rejectWithRequest>
		</iron-ajax>
		<iron-ajax id="getTableAjax"
			on-response="_getTableResponse"
			on-error="_getTableError">
		</iron-ajax>
	</template>
	<script>
		var etag;
		var cbProduct;
		var lastItem;
		Polymer ({
			is: 'sig-offer-list',
			behaviors: [i18nMsgBehavior],
			properties: {
				offers: {
					type: Array,
					readOnly: true,
					notify: true,
					value: function() {
						return []
					}
				},
				tables: {
					type: Array,
					readOnly: true,
					notify: true,
					value: function() {
						return []
					}
				},
				activePage: {
					type: Boolean,
					value: false,
					observer: '_activePageChanged'
				},
				activeItem: {
					observer: '_activeItemChanged'
				}
			},
			_activePageChanged: function(active) {
				if (active) {
					var grid = this.$.offerGrid;
					grid.columns = [
						{
							name: "name"
						},
						{
							name: "description"
						},
						{
							name: "startDate"
						},
						{
							name: "endDate"
						},
						{
							name: "status"
						},
						{
							name: "price"
						}
					];
					var ajax1 = document.getElementById('getTableAjax');
					ajax1.url = "/catalogManagement/v2/pla";
					ajax1.generateRequest();
					grid.dataProvider = this._getOffers;
				}
			},
			_getOffers: function(params, callback) {
				var grid = document.getElementById('offerGrid');
				var ajax = document.getElementById("getProductAjax");
				delete ajax.params['filter'];
				function checkHead(param) {
					return param.path == "id";
				}
				params.filters.filter(checkHead).forEach(function(filter) {
					if (filter.value) {
						ajax.params['filter'] = "\"[{id.like=[" + filter.value + "%";
					}
				});
				function checkChar(param) {
					return param.path != "id";
				}
				params.filters.filter(checkChar).forEach(function(filter) {
					if (filter.value) {
						if (!ajax.params['filter']) {
							ajax.params['filter'] = "\"[{";
						} else {
							ajax.params['filter'] += "],";
						}
						ajax.params['filter'] += "characteristic.contains=[{name=language" + ",value.like=[" + filter.value + "%]}";
					}
				});
				if (ajax.params['filter']) {
					ajax.params['filter'] += "]}]\"";
				}
				var offerList = document.getElementById('offerList');
				var handleAjaxResponse = function(request) {
					if (request) {
						offerList.etag = request.xhr.getResponseHeader('ETag');
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
							function checkExist(name) {
								return name == request.response[index].name;
							}
							if(!offerList.offers.some(checkExist)) {
								document.getElementById("offerList").push('offers', request.response[index].name);
							}
							newRecord.id = request.response[index].name;
							newRecord.description = request.response[index].description;
							newRecord.productSpecification = request.response[index].productSpecification;
							if(request.response[index].validFor && request.response[index].validFor != "") {
								if(request.response[index].validFor.startDateTime
										&& request.response[index].validFor.startDateTime != ""){
									newRecord.startDate = request.response[index].validFor.startDateTime.split("T")[0];
								}
								if(request.response[index].validFor.endDateTime
										&& request.response[index].validFor.endDateTime != ""){
									newRecord.endDate = request.response[index].validFor.endDateTime.split("T")[0];
								}
							}
							newRecord.lifecycleStatus = request.response[index].status;
							if(request.response[index].productOfferingPrice && request.response[index].productOfferingPrice != ""){
								function getNames(price) {
									return price.name;
								}
								newRecord.price = request.response[index].productOfferingPrice.map(getNames).join(", ");
								newRecord.prices = request.response[index].productOfferingPrice;
							}
							newRecord.bundledProductOffering = request.response[index].bundledProductOffering;
							newRecord.prodSpecCharValueUse = request.response[index].prodSpecCharValueUse;
							vaadinItems[index] = newRecord;
						}
						callback(vaadinItems);
					} else {
						grid.size = 0;
						callback([]);
					}
				};
				var handleAjaxError = function(error) {
					offerList.etag = null;
					var toast = document.getElementById('userToastError');
					toast.text = error;
					toast.open();
					if(!grid.size) {
						grid.size = 0;
					}
					callback([]);
				}
				if(ajax.loading) {
					ajax.lastRequest.completes.then(function(request) {
						var startRange = params.page * params.pageSize + 1;
						var endRange = startRange + params.pageSize - 1;
						ajax.headers['Range'] = "items=" + startRange + "-" + endRange;
						if (offerList.etag && params.page > 0) {
							ajax.headers['If-Range'] = offerList.etag;
						} else {
							delete ajax.headers['If-Range'];
						}
						return ajax.generateRequest().completes;
					}, handleAjaxError).then(handleAjaxResponse, handleAjaxError);
				} else {
					var startRange = params.page * params.pageSize + 1;
					var endRange = startRange + params.pageSize - 1;
					ajax.headers['Range'] = "items=" + startRange + "-" + endRange;
					if (offerList.etag && params.page > 0) {
						ajax.headers['If-Range'] = offerList.etag;
					} else {
						delete ajax.headers['If-Range'];
					}
					ajax.generateRequest().completes.then(handleAjaxResponse, handleAjaxError);
				}
			},
			_activeItemChanged: function(item) {
				if(item != null) {
					this.$.offerGrid.selectedItems = item ? [item] : [];
					document.getElementById("updateProduct").initialize(item);
				}
			},
			_getTableResponse: function(event) {
				var grid = this.$.offerGrid;
				var results = event.detail.xhr.response;
				this.splice("tables", 0, this.tables.length)
				for (var indexTable in results) {
					var tableRecord = new Object();
					tableRecord.id = results[indexTable].id;
					tableRecord.href = results[indexTable].href;
					tableRecord.description = results[indexTable].description;
					tableRecord.plaSpecId = results[indexTable].plaSpecId;
					this.push('tables', tableRecord);
				}
			},
			_getTableError: function(event) {
				this.$.offerGrid.size = 0;
				cbProduct([]);
				if (!lastItem && event.detail.request.xhr.status != 416) {
					this.$.getProductErrorToast.text = event.detail.request.xhr.statusText;
					this.$.getProductErrorToast.open();
				}
			},
			showAddProductModal: function(event) {
				document.getElementById("getProductsAjax").generateRequest();
				document.getElementById("addProduct").selected = 0;
				document.getElementById("addProductModal").open();
			}
		});
	</script>
</dom-module>
