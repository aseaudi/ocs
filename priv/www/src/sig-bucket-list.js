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

<dom-module id="sig-bucket-list">
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
				text-align: left;
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
		<vaadin-grid id="balanceBucketGrid" active-item="{{activeItem}}">
			<vaadin-grid-column width="15ex" flex-grow="5">
				<template class="header">
					<vaadin-grid-filter aria-label="[[i18n.bucketId]]" path="id" value="[[_filterBucId]]">
						<input placeholder="[[i18n.bucketId]]" value="{{_filterBucId::input}}" focus-target>
					</vaadin-grid-filter>
				</template>
				<template>[[item.id]]</template>
			</vaadin-grid-column>
			<vaadin-grid-column width="15ex" flex-grow="5">
				<template class="header">
					<vaadin-grid-filter aria-label="[[i18n.prodId]]" path="product" value="[[_filterProdId]]">
						<input placeholder="[[i18n.prodId]]" value="{{_filterProdId::input}}" focus-target>
					</vaadin-grid-filter>
				</template>
				<template>[[item.product]]</template>
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
						<div class="cell numeric">[[item.remainedAmount]]</div>
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
			</vaadin-grid-column-group>
		</vaadin-grid>
		<div class="add-button">
			<paper-fab
				icon="add"
				on-tap="showAddBucket">
			</paper-fab>
		</div>
		<iron-ajax
			id="getBucketBalance"
			url="/balanceManagement/v1/bucket/"
			rejectWithRequest>
		</iron-ajax>
	</template>
	<script>
		Polymer ({
			is: 'sig-bucket-list',
			behaviors: [i18nMsgBehavior],
			properties: {
				activePage: {
					type: Boolean,
					value: false,
					observer: '_activePageChanged'
				}
			},
			_activePageChanged: function(active) {
				if(active) {
					var grid = this.$.balanceBucketGrid;
					grid.columns = [
						{
							name: "id" 
						},
						{
							name: "product"
						},
						{
							name: "remainedAmount"
						},
						{
							name: "cents"
						},
						{
							name: "seconds"
						}
					];
					grid.dataProvider = this._getBuckets;
				}
			},
			_getBuckets: function(params, callback) {
				var grid = document.getElementById('balanceBucketGrid');
				var ajax = document.getElementById("getBucketBalance");
				delete ajax.params['filter'];
				function checkHead(param) {
					return param.path == "id" || param.path == "product";
				}
				params.filters.filter(checkHead).forEach(function(filter) {
					if (filter.value) {
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
				var bucketList = document.getElementById('bucketList');
				var handleAjaxResponse = function(request) {
					if(request) {
						bucketList.etag = request.xhr.getResponseHeader('ETag');
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
							if(request.response[index].product.id) {
								newRecord.product = request.response[index].product.id;
							}
							if(request.response[index].remainedAmount) {
								if(request.response[index].remainedAmount.units == "cents") {
									newRecord.cents = request.response[index].remainedAmount.amount;
								}
								if(request.response[index].remainedAmount.units == "seconds") {
									var Str = request.response[index].remainedAmount.amount;
									if(Str.includes("b")){
										var NewStrSec = Str.substring(0, Str.length - 1);
										newRecord.seconds = NewStrSec;
									}
								}
								if(request.response[index].remainedAmount.units == "octets") {
									var Str = request.response[index].remainedAmount.amount;
									if(Str.includes("b")){
										var NewStr = Str.substring(0, Str.length - 1);
										newRecord.remainedAmount = NewStr;
									}
								}
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
					bucketList.etag = null;
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
						if (bucketList.etag && params.page > 0) {
							ajax.headers['If-Range'] = bucketList.etag;
						} else {
							delete ajax.headers['If-Range'];
						}
						return ajax.generateRequest().completes;
					}, handleAjaxError).then(handleAjaxResponse, handleAjaxError);
				} else {
					var startRange = params.page * params.pageSize + 1;
					var endRange = startRange + params.pageSize - 1;
					ajax.headers['Range'] = "items=" + startRange + "-" + endRange;
					if (bucketList.etag && params.page > 0) {
						ajax.headers['If-Range'] = bucketList.etag;
					} else {
						delete ajax.headers['If-Range'];
					}
				ajax.generateRequest().completes.then(handleAjaxResponse, handleAjaxError);
				}
			},
			showAddBucket: function(event) {
				document.getElementById("addBucketModal").open();
			},
		});
	</script>
</dom-module>
