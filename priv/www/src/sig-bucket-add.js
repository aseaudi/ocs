<!--  vim: set ts=3:  -->
<link rel="import" href="polymer/polymer.html">
<link rel="import" href="i18n-msg/i18n-msg.html">
<link rel="import" href="i18n-msg/i18n-msg-behavior.html">
<link rel="import" href="paper-dialog/paper-dialog.html">
<link rel="import" href="paper-toolbar/paper-toolbar.html">
<link rel="import" href="paper-tabs/paper-tabs.html">
<link rel="import" href="paper-input/paper-input.html">
<link rel="import" href="paper-item/paper-icon-item.html">
<link rel="import" href="paper-item/paper-item-body.html">
<link rel="import" href="paper-tooltip/paper-tooltip.html">
<link rel="import" href="paper-button/paper-button.html">
<link rel="import" href="paper-toggle-button/paper-toggle-button.html" >
<link rel="import" href="paper-toast/paper-toast.html">
<link rel="import" href="paper-styles/color.html">
<link rel="import" href="iron-ajax/iron-ajax.html">
<link rel="import" href="iron-pages/iron-pages.html">
<link rel="import" href="paper-checkbox/paper-checkbox.html">
<link rel="import" href="iron-icons/iron-icons.html">
<link rel="import" href="iron-icons/communication-icons.html">

<dom-module id="sig-bucket-add">
	<template>
		<style is="custom-style">
			paper-dialog {
				overflow: auto;
			}
			paper-input {
				--paper-input-container-focus-color: var(--paper-yellow-900);
			}
			paper-toolbar {
				margin-top: 0px;
				color: white;
				background-color: #bc5100;
			}
			paper-item-body {
				--paper-item-body-secondary: {
					font-weight: bold;
					font-size: larger;
				}
			}
			paper-toast.error {
				background-color: var(--paper-red-a400);
			}
			paper-toggle-button {
				--paper-toggle-button-checked-bar-color: #ffb04c;
				--paper-toggle-button-checked-button-color: var(--paper-yellow-900);
			}
			paper-checkbox {
				--paper-checkbox-checked-color: #ffb04c;
				--paper-checkbox-checkmark-color: var(--paper-yellow-900);
			}
			.toggle {
				display:inline-block;
			}
			.generate {
				display: inline-block;
				width: 8em;
			}
			.identity {
				display: inline-block;
			}
			.password {
				display: inline-block;
			}
			.add-button {
				background-color: var(--paper-lime-a700);
				color: black;
				float: right;
				width: 8em;
			}
			.cancel-button {
				color: black;
			}
			.generated {
				padding: 10px;
				overflow: auto;
			}
			.close {
				background-color: var(--paper-lime-a700);
				color: black;
				float: right;
				width: 5em;
			}
		</style>
		<paper-dialog id="addBucketModal" modal>
			<paper-toolbar>
				<h2>Add Bucket</h2>
			</paper-toolbar>
			<div>
				<paper-input
					id="addProduct"
					name="product"
					label="[[i18n.prod]]">
				</paper-input>
				<paper-tooltip>
					Product Id
				</paper-tooltip>
			</div>
			<div>
				<paper-dropdown-menu
					label="[[i18n.unit]]">
						<paper-listbox
							id="addUnitsBucket"
							slot="dropdown-content"
							class="dropdown-content">
							<paper-item>
								<i18n-msg msgid="bytes">
									Bytes
								</i18n-msg>
							</paper-item>
							<paper-item>
								<i18n-msg msgid="cents">
									Cents
								</i18n-msg>
							</paper-item>
							<paper-item>
								<i18n-msg msgid="seconds">
									Seconds
								</i18n-msg>
							</paper-item>
						</paper-listbox>
					</paper-dropdown-menu>
					<paper-tooltip>
						bucket balance units.
					</paper-tooltip>
				</div>
			<div>
				<paper-input
					id="amount"
					name="amount"
					type="text"
					allowed-pattern="[0-9kmg]"
					pattern="^[0-9]+[kmg]?$"
					label="[[i18n.amount]]"
					auto-validate>
				</paper-input>
				<paper-tooltip>
					balance amount of bucket
				</paper-tooltip>
			</div>
			<div class="buttons">
				<paper-button dialog-confirm
					raised
					class="add-button"
					on-tap="_bucketAddSubmit">
					<i18n-msg msgid="submit">
						Submit
					</i18n-msg>
				</paper-button>
				<paper-button dialog-dismiss
					class="cancel-button"
					onclick="addBucketModal.close()">
					<i18n-msg msgid="cancel">
						Cancel
					</i18n-msg>
				</paper-button>
			</div>
		</paper-dialog>
		<iron-ajax
				id="addBucketAjax"
				method = "post"
				content-type="application/json"
				on-loading-changed="_onLoadingChanged"
				on-response="_addBucketResponse"
				on-error="_addBucketError">
		</iron-ajax>
	</template>
	<script>
		Polymer ({
			is: 'sig-bucket-add',
			behaviors: [i18nMsgBehavior],
			properties: {
				selected: {
					type: Number,
					value: 0
				},
				product: {
					type: String,
				}
			},
			_bucketAddSubmit: function(event) {
				var ajaxBucket = this.$.addBucketAjax;
				var bucketTop = {name: "channel"};
				var bucketUnits;
				var bucketAmount;
				if(document.getElementById("amount").value) {
					if(document.getElementById("addUnitsBucket").selected == 0) {
						bucketUnits = "octets";
					}
					else if(document.getElementById("addUnitsBucket").selected == 1) {
						bucketUnits = "cents";
					}
					else if(document.getElementById("addUnitsBucket").selected == 2) {
						bucketUnits = "seconds";
					} else {
						bucketUnits = "cents";
					}
					if(bucketUnits && document.getElementById("amount").value) {
						var size = document.getElementById("amount").value;
						var len = size.length;
						var m = size.charAt(len - 1);
						if(isNaN(parseInt(m))) {
							var s = size.slice(0, (len - 1));
						} else {
							var s = size;
						}
						if(bucketUnits == "octets") {
							if (m == "m") {
								bucketAmount = s + "000000b";
							} else if(m == "g") {
								bucketAmount = s + "000000000b";
							} else if(m == "k") {
								bucketAmount = s + "000b";
							} else {
								bucketAmount = s + "b";
							}
						} else if(bucketUnits == "cents") {
							bucketAmount = document.getElementById("amount").value;
						} else if(bucketUnits == "seconds") {
							var n = Number(s);
							if(m == "m") {
								n = n * 60;
								bucketAmount = n.toString() + "s";
							} else if(m == "h") {
								n = n * 3600;
								bucketAmount = n.toString() + "s";
							} else {
								bucketAmount = n.toString() + "s";
							}
						}
					bucketTop.amount = {units: bucketUnits, amount: bucketAmount};
					}
				}
				var proId = this.$.addProduct.value;
				bucketTop.product = {id: proId,
						href: "/productInventoryManagement/v2/product/" + proId};
				ajaxBucket.headers['Content-type'] = "application/json";
				ajaxBucket.body = bucketTop;
				ajaxBucket.url="/balanceManagement/v1/product/" + proId + "/balanceTopup";
				ajaxBucket.generateRequest();
				this.$.addBucketModal.close();
				document.getElementById("amount").value = null;
				this.$.addProduct.value = null;
				this.$.addUnitsBucket.value = null;
			},
			_addBucketResponse: function(event) {
				this.$.addBucketModal.close();
				document.getElementById("balanceBucketGrid").clearCache();
				document.getElementById("addSubscriberToastSuccess").open();
			},
			_addBucketError: function(event) {
				document.getElementById("addSubscriberToastError").text = event.detail.request.xhr.statusText;
				document.getElementById("addSubscriberToastError").open();
			},
			_onLoadingChanged: function(event) {
				if (this.$.addBucketAjax.loading) {
					document.getElementById("progress").disabled = false;
				} else {
					document.getElementById("progress").disabled = true;
				}
			}
		});
	</script>
</dom-module>
