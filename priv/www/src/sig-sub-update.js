<!--  vim: set ts=3:  -->
<link rel="import" href="polymer/polymer.html">
<link rel="import" href="i18n-msg/i18n-msg.html">
<link rel="import" href="i18n-msg/i18n-msg-behavior.html">
<link rel="import" href="paper-dialog/paper-dialog.html">
<link rel="import" href="paper-toolbar/paper-toolbar.html">
<link rel="import" href="paper-tabs/paper-tabs.html">
<link rel="import" href="paper-tooltip/paper-tooltip.html">
<link rel="import" href="paper-button/paper-button.html">
<link rel="import" href="paper-input/paper-input.html">
<link rel="import" href="paper-styles/color.html">
<link rel="import" href="paper-toast/paper-toast.html">
<link rel="import" href="iron-pages/iron-pages.html">
<link rel="import" href="iron-selector/iron-selector.html">
<link rel="import" href="iron-ajax/iron-ajax.html">

<dom-module id="sig-sub-update">
	<template>
		<style is="custom-style">
			paper-dialog {
				overflow: auto;
			}
			paper-toolbar {
				margin-top: 0px;
				background-color: #bc5100;
			}
			paper-input {
				--paper-input-container-focus-color: var(--paper-yellow-900);
			}
			.toggle {
				display:inline-block;
			}
			.update-buttons {
				background: var(--paper-lime-a700);
				color: black;
			}
			.delete-buttons {
				background: #EF5350;
				color: black;
			}
			.cancel-btn {
				color: black;
			}
			paper-toggle-button {
				--paper-toggle-button-checked-bar-color: #ffb04c;
				--paper-toggle-button-checked-button-color: var(--paper-yellow-900);
			}
		</style>
		<paper-dialog id="updateSubscriberModal" modal>
			<paper-toolbar>
				<paper-tabs selected="{{selected}}">
					<paper-tab id="authen">
						<h2>[[i18n.AuthTitle]]</h2>
					</paper-tab>
					<paper-tab id="autho">
						<h2>[[i18n.AuthorTitle]]</h2>
					</paper-tab>
					<paper-tab id="credit-up">
						<h2>[[i18n.credit]]</h2>
					</paper-tab>
				</paper-tabs>
			</paper-toolbar>
			<paper-tooltip for="authen">
				<i18n-msg msgid="AuthTooltip">
						Credentials used to authenticate subscriber.
				</i18n-msg>
			</paper-tooltip>
			<paper-tooltip for="autho">
				<i18n-msg msgid="AuthorTooltip">
						Services authorized for subscriber.
				</i18n-msg>
			</paper-tooltip>
			<iron-pages selected="{{selected}}">
				<div id="edit-password" >
					<paper-input id="updateSubscriberId"
							name="id"
							label="[[i18n.identity]]"
							disabled>
					</paper-input>
					<paper-input id="updateSubscriberPassword"
							name="password"
							label="[[i18n.secret]]"
							disabled>
					</paper-input>
					<div>
						<paper-input id="updateSubscriberNewPassword"
								name="newpassword"
								label="[[i18n.newpass]]"
								required
								auto-validate
								error-message="[[i18n.newpassError]]">
						</paper-input>
						<paper-tooltip>
							<i18n-msg msgid="subPasswordTooltip">
									New password of subscriber.
							</i18n-msg>
						</paper-tooltip>
					</div>
					<div class="buttons">
						<paper-button
								onclick="updateSubscriberModal.close()"
								class="cancel-btn">
							<i18n-msg msgid="cancel">
									Cancel
							</i18n-msg>
						</paper-button>
						<paper-button dialog-confirm
								autofocus
								on-tap="updateSubscriberAuthentication"
								class="update-buttons">
							<i18n-msg msgid="update">
									Update
							</i18n-msg>
						</paper-button>
						<paper-button
								toggles
								raised
								on-tap="deleteSubscriber"
								class="delete-buttons">
							<i18n-msg msgid="delete">
									Delete
							</i18n-msg>
						</paper-button>
					</div>
				</div>
				<div id="edit-attributes">
					<div>
						<paper-input id="updateSubscriberTimeout"
								name="sessionTimeout"
								type="number"
								label="[[i18n.ses]]">
						</paper-input>
						<paper-tooltip>
							<i18n-msg msgid="sessionTimeoutTooltip">
									Time between authorization requests in an active session in seconds
							</i18n-msg>
						</paper-tooltip>
					</div>
					<div>
						<paper-input id="updateSubscriberInterval"
								name="acctSessionInterval"
								type="number"
								label="[[i18n.accInt]]">
						</paper-input>
						<paper-tooltip>
							<i18n-msg msgid="intervalTooltip">
									Time between accouting session updates in seconds.
							</i18n-msg>
						</paper-tooltip>
					</div>
					<div>
						<paper-input id="updateSubscriberClass"
								name="class"
								type="text"
								label="[[i18n.class]]">
						</paper-input>
					</div></br>
					<div>
						<i18n-msg msgid="enable">
								Enable
						</i18n-msg>
						<div style="display:inline-block;">
							<paper-toggle-button id="updateSubscriberEnabled">
							</paper-toggle-button>
							<paper-tooltip>
								<i18n-msg msgid="intervalTooltip">
									Enabled for service or temporarily disabled.
							</i18n-msg>
						</div>
						<i18n-msg msgid="multi">
							Multisession
						</i18n-msg>
						<div style="display:inline-block;">
							<paper-toggle-button id="updateSubscriberMulti">
							</paper-toggle-button>
							<paper-tooltip>
								<i18n-msg msgid="multiTool">
									Allow multiple simultaneous sessions.
								</i18n-msg>
							</paper-tooltip>
						</div>
					</div><br>
					<div class="buttons">
						<paper-button
								onclick="updateSubscriberModal.close()"
								class="cancel-btn">
							<i18n-msg msgid="cancel">
									Cancel
							</i18n-msg>
						</paper-button>
						<paper-button dialog-confirm
								autofocus
								on-tap="updateSubscriberAuthorization"
								class="update-buttons">
							<i18n-msg msgid="update">
									Update
							</i18n-msg>
						</paper-button>
						<paper-button
								toggles
								raised
								on-tap="deleteSub"
								class="delete-buttons">
							<i18n-msg msgid="delete">
									Delete
							</i18n-msg>
						</paper-button>
					</div>
				</div>
				<div id="edit-bal">
					<div>
						<paper-input id="updatePro"
								name="product"
								label="[[i18n.prod]]"
								disabled>
						</paper-input>
						<paper-tooltip>
							<i18n-msg msgid="updateSubProTooltip">
								Select and update the product.
							</i18n-msg>
						</paper-tooltip>
					</div>
					<div>
						<paper-input id="edit-amount"
								name="amount"
								type="number"
								label="[[i18n.amount]]">
						</paper-input>
						<paper-tooltip>
							<i18n-msg msgid="updateSubAmountTooltip">
								Update Subscriber balance amount.
							</i18n-msg>
						</paper-tooltip>
					</div>
					<div>
						<paper-dropdown-menu
								id="updateUni"
								label="[[i18n.unit]]">
							<paper-listbox
									id="updateUni1"
									slot="dropdown-content"
									class="dropdown-content"
									selected="0">
								<paper-item value="octets">
									<i18n-msg msgid="bytes">
											Bytes
									</i18n-msg>
								</paper-item>
								<paper-item value="cents">
									<i18n-msg msgid="cents">
										Cents
									</i18n-msg>
								</paper-item>
								<paper-item value="seconds">
									<i18n-msg msgid="seconds">
										Seconds
									</i18n-msg>
								</paper-item>
							</paper-listbox>
						</paper-dropdown-menu>
						<paper-tooltip>
							<i18n-msg msgid="updateSubUnitTooltip">
								update subscriber balance units.
							</i18n-msg>
						</paper-tooltip>
					</div>
					<div class="buttons">
						<paper-button dialog-dismiss
								onclick="updateSubscriberModal.close()"
								class="cancel-btn">
							<i18n-msg msgid="cancel">
									Cancel
							</i18n-msg>
						</paper-button>
						<paper-button dialog-confirm
								autofocus
								on-tap="updateSubscriberBalance"
								class="update-buttons">
							<i18n-msg msgid="add">
									Add
							</i18n-msg>
						</paper-button>
						<paper-button
								toggles
								raised
								on-tap="deleteSub"
								class="delete-buttons">
							<i18n-msg msgid="delete">
									Delete
							</i18n-msg>
						</paper-button>
					</div>
			</iron-pages>
			<paper-toast
					id="updateSubscriberToastError">
			</paper-toast>
		</paper-dialog>
		<iron-ajax id="updateSubscriberAuthenticationAjax"
				on-response="_updateSubscriberAuthenticationResponse"
				on-error="_updateSubscriberAuthenticationError">
		</iron-ajax>
		<iron-ajax id="updateSubscriberAuthorizationAjax"
				on-response="_updateSubscriberAuthorizationResponse"
				on-error="_updateSubscriberAuthorizationError">
		</iron-ajax>
		<iron-ajax id="deleteSubscriberAjax"
				on-response="_deleteSubscriberResponse"
				on-error="_deleteSubscriberError">
		</iron-ajax>
		<iron-ajax id="updateSubscriberBalance"
				content-type="application/json-patch+json"
				method="PATCH"
				on-response="_updateSubscriberBalanceResponse"
				on-error="_updateSubscriberBalanceError">
		</iron-ajax>
		<iron-ajax
				id="getServiceRespAjax"
				method = "GET"
				on-response="_getServiceResponse"
				on-error="_getServiceError">
		</iron-ajax>
		<iron-ajax
				id="updateSubscriberProductsAjax"
				url="/catalogManagement/v2/productOffering"
				method = "GET"
				on-response="_updateSubscriberProductsResponse"
				on-error="_updateSubscriberProductsError">
		</iron-ajax>
	</template>
	<script>
		Polymer ({
			is: 'sig-sub-update',
			behaviors: [i18nMsgBehavior],
			properties: {
				selected: {
					type: Number,
					value: 0
				},
				offers: {
					type: Array,
					value: function() {
						return [];
					}
				}
			},
			_updateSubscriberProductsResponse: function(event) {
				var results = event.detail.xhr.response;
				for (var index in results) {
					function checkExist(name) {
						return name == results[index].name;
					}
					if(!this.offers.some(checkExist)){
						this.push('offers', results[index].name);
					}
				}
			},
			_updateSubscriberProductsError: function (event) {
				this.$.updateSubscriberToastError.text = event.detail.request.xhr.statusText;
				this.$.updateSubscriberToastError.open();
			},
			updateSubscriberAuthentication: function(event) {
				var id = document.getElementById("updateSubscriberId").value;
				var getAjax = this.$.getServiceRespAjax; 
				var etag = getAjax.lastRequest.xhr.getResponseHeader('ETag');
				var results = getAjax.lastResponse;
				var editAjax =  this.$.updateSubscriberAuthenticationAjax;
				editAjax.method = "PATCH";
				editAjax.headers['If-Match'] = etag;
				editAjax.contentType = "application/json-patch+json";
				var id = document.getElementById("updateSubscriberId").value;
				editAjax.url = "/serviceInventoryManagement/v2/service/" + id;
				function checkPass(pass) {
					return pass.name == "servicePassword";
				}
				var index = results.serviceCharacteristic.findIndex(checkPass);
				var sub = new Object();
				sub.op = "replace";
				sub.path = "/serviceCharacteristic/" + index;
				var servicePass = new Object();
				servicePass.name = "servicePassword";
				servicePass.value = document.getElementById("updateSubscriberNewPassword").value;
				sub.value = servicePass;
				editAjax.body = JSON.stringify([sub]);;
				editAjax.generateRequest();
			},
			_updateSubscriberAuthenticationResponse: function (event) {
				document.getElementById("updateSubscriberToastSuccess").open();
				this.$.updateSubscriberNewPassword.value = "";
				document.getElementById("subscriberGrid").clearCache();
			},
			_updateSubscriberAuthenticationError: function(event) {
				this.$.updateSubscriberToastError.text = event.detail.request.xhr.statusText;
				this.$.updateSubscriberToastError.open();
			},
			updateSubscriberBalance: function(event) {
				var editAjax =  document.getElementById("updateSubscriberBalance");
				var id = this.$.updateSubscriberId.value;
				editAjax.url = "/ocs/v1/subscriber/" + id;
				var sub = new Object();
				sub.op = "add";
				sub.path = "/buckets/-";
				var totalBal;
				if(document.getElementById("updateUni1").selected == 0){
					totalBal = {"remainAmount":parseInt(document.getElementById("edit-amount").value)};
					totalBal.units = "octets";
				}
				if(document.getElementById("updateUni1").selected == 1){
					totalBal = {"remainAmount":document.getElementById("edit-amount").value};
					totalBal.units = "cents";
				}
				if(document.getElementById("updateUni1").selected == 2){
					totalBal = {"remainAmount":parseInt(document.getElementById("edit-amount").value)};
					totalBal.units = "seconds";
				}
				//totalBal.product = document.getElementById("updatePro").value;
				sub.value = totalBal;
				editAjax.body = JSON.stringify([sub]);
				editAjax.generateRequest();
			},
			_updateSubscriberBalanceResponse: function (event) {
				document.getElementById("updateSubscriberToastSuccess").open();
				document.getElementById("getSubscriberAjax").generateRequest();
			},
			_updateSubscriberBalanceError: function(event) {
				this.$.updateSubscriberToastError.text = event.detail.request.xhr.statusText;
				this.$.updateSubscriberToastError.open();
			},
			updateSubscriberAuthorization: function(event) {
				var getAjax = this.$.getServiceRespAjax;
				var results = getAjax.lastResponse;
				var editAjax =  this.$.updateSubscriberAuthorizationAjax;
				editAjax.method = "PATCH";
				editAjax.contentType = "application/json-patch+json";
				editAjax.url = "/serviceInventoryManagement/v2/service/" + this.$.updateSubscriberId.value;
				var patch = new Array();
				var ena = new Object();
				ena.op = "replace";
				ena.path = "/isServiceEnabled";
				ena.value = this.$.updateSubscriberEnabled.checked;
				patch.push(ena);
				if(this.$.updateSubscriberTimeout.value) {
					function checkTimeout(sessionTime) {
						return sessionTime.name == "sessionTimeout";
					}
					var indexSession = results.serviceCharacteristic.findIndex(checkTimeout);
					var sub = new Object();
					sub.op = "replace";
					sub.path = "/serviceCharacteristic/" + indexSession;
					var sessionTimeout = new Object();
					sessionTimeout.name = "sessionTimeout";
					sessionTimeout.value = parseInt(this.$.updateSubscriberTimeout.value);
					sub.value = sessionTimeout;
					patch.push(sub);
				} else {
					function checkTimeout(sessionTime) {
						return sessionTime.name == "sessionTimeout";
					}
					var indexSession = results.serviceCharacteristic.findIndex(checkTimeout);
					if(indexSession != -1) {
						var sub = new Object();
						sub.op = "replace";
						sub.path = "/serviceCharacteristic/" + indexSession;
						var sessionTimeout = new Object();
						sessionTimeout.name = "sessionTimeout";
						sessionTimeout.value = results.serviceCharacteristic[indexSession].value;
						sub.value = sessionTimeout;
						patch.push(sub);
					}
				}
				if(this.$.updateSubscriberInterval.value) {
					function checkSessionInt(sessionInterval) {
						return sessionInterval.name == "acctSessionInterval";
					}
					var indexSessionInt = results.serviceCharacteristic.findIndex(checkSessionInt);
					var sub1 = new Object();
					sub1.op = "replace";
					sub1.path = "/serviceCharacteristic/" + indexSessionInt;
					var acctSessionInterval = new Object();
					acctSessionInterval.name = "acctSessionInterval";
					acctSessionInterval.value = parseInt(this.$.updateSubscriberInterval.value);
					sub1.value = acctSessionInterval;
					patch.push(sub1);
				} else{
					function checkSessionInt(sessionInterval) {
						return sessionInterval.name == "acctSessionInterval";
					}
					var indexSessionInt = results.serviceCharacteristic.findIndex(checkSessionInt);
					if(indexSessionInt != -1) {
						var sub1 = new Object();
						sub1.op = "replace";
						sub1.path = "/serviceCharacteristic/" + indexSessionInt;
						var acctSessionInterval = new Object();
						acctSessionInterval.name = "acctSessionInterval";
						acctSessionInterval.value = results.serviceCharacteristic[indexSessionInt].value;
						sub1.value = acctSessionInterval;
						patch.push(sub1);
					}
				}
				function checkMulti(multiSess) {
					return multiSess.name == "multiSession";
				}
				var indexMulti = results.serviceCharacteristic.findIndex(checkMulti);
				var sub2 = new Object();
				sub2.op = "replace";
				sub2.path = "/serviceCharacteristic/" + indexMulti;
				var multi = new Object();
				multi.name = "multiSession";
				multi.value = this.$.updateSubscriberMulti.checked;
				sub2.value = multi;
				patch.push(sub2);
				editAjax.body = JSON.stringify(patch);
				editAjax.generateRequest();
			},
			_updateSubscriberAuthorizationResponse: function (event) {
				document.getElementById("updateSubscriberToastSuccess").open();
				document.getElementById("subscriberGrid").clearCache();
			},
			_updateSubscriberAuthorizationError: function(event) {
				this.$.updateSubscriberToastError.text = event.detail.request.xhr.statusText;
				this.$.updateSubscriberToastError.open();
			},
			deleteSubscriber: function(event) {
				this.$.deleteSubscriberAjax.method = "DELETE";
				this.$.deleteSubscriberAjax.url = "/serviceInventoryManagement/v2/service/"
						+ document.getElementById("subscriberGrid").selectedItems[0].id;
				this.$.deleteSubscriberAjax.generateRequest();
			},
			_deleteSubscriberResponse: function(event) {
				this.$.updateSubscriberModal.close();
				document.getElementById("deleteSubscriberToastSuccess").open();
				document.getElementById("subscriberGrid").clearCache();
			},
			_deleteSubscriberError: function(event) {
				this.$.updateSubscriberToastError.text = event.detail.request.xhr.statusText;
				this.$.updateSubscriberToastError.open();
			}
		});
	</script>
</dom-module>
