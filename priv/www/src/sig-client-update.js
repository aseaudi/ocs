<!--  vim: set ts=3:  -->
<link rel="import" href="polymer/polymer.html">
<link rel="import" href="i18n-msg/i18n-msg.html">
<link rel="import" href="i18n-msg/i18n-msg-behavior.html">
<link rel="import" href="paper-dialog/paper-dialog.html">
<link rel="import" href="paper-toolbar/paper-toolbar.html">
<link rel="import" href="paper-tabs/paper-tabs.html">
<link rel="import" href="paper-input/paper-input.html">
<link rel="import" href="paper-button/paper-button.html">
<link rel="import" href="paper-dropdown-menu/paper-dropdown-menu.html">
<link rel="import" href="paper-listbox/paper-listbox.html">
<link rel="import" href="paper-tooltip/paper-tooltip.html">
<link rel="import" href="paper-styles/color.html">
<link rel="import" href="paper-checkbox/paper-checkbox.html">
<link rel="import" href="iron-pages/iron-pages.html">
<link rel="import" href="iron-selector/iron-selector.html">
<link rel="import" href="iron-input/iron-input.html">
<link rel="import" href="iron-ajax/iron-ajax.html">

<dom-module id="sig-client-update">
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
			paper-checkbox {
				--paper-checkbox-checked-color: #ffb04c;
				--paper-checkbox-checkmark-color: var(--paper-yellow-900);
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
		<paper-dialog
				id="updateClientModal"
				modal>
			<paper-toolbar>
				<paper-tabs selected="{{selected}}">
					<paper-tab id="authenticate-client">
						<h2>[[i18n.AuthTitle]]</h2>
					</paper-tab>
					 <paper-tab id="authorize-client">
						<h2>[[i18n.propTitle]]</h2>
					</paper-tab>
				</paper-tabs>
			</paper-toolbar>
			<paper-tooltip for="authenticate-client">
				<i18n-msg msgid="authClientTool">
					Credentials used to authenticate network access server, router or access point.
				</i18n-msg>
			</paper-tooltip>
			<paper-tooltip for="authorize-client">
				<i18n-msg msgid="authorClientTool">
					Properties of network access server, router or access pointor client.
				</i18n-msg>
			</paper-tooltip>
			<iron-pages
					selected="{{selected}}">
				<div>
					<paper-input
							id="updateClientId"
							name="id"
							label="[[i18n.address]]"
							disabled>
					</paper-input>
					<div>
						<paper-input
								id="updateClientPassword"
								name="password"
								label="[[i18n.secret]]"
								disabled
								hidden>
						</paper-input>
						<paper-tooltip>
							<i18n-msg msgid="secretTooltip">
								Secret shared with the network access server, router or access point.
							</i18n-msg>
						</paper-tooltip>
					</div>
					<div>
						<paper-input
								id="updateClientNewPassword"
								name="secret"
								label="[[i18n.newpass]]"
								hidden>
						</paper-input>
						<paper-tooltip>
							<i18n-msg msgid="secretTooltip">
								Secret shared with the network access server, router or access point.
							</i18n-msg>
						</paper-tooltip>
					</div>
					<iron-collapse id="passClientHide">
					<div>
						Passwordless
						<paper-checkbox
							id="checkPassUpdate">
						</paper-checkbox>
					</div>
					</iron-collapse>
					<div class="buttons">
						<paper-button
								dialog-dismiss
								onclick="updateClientModal.close()"
								class="cancel-btn">
							<i18n-msg msgid="cancel">
								Cancel
							</i18n-msg>
						</paper-button>
						<paper-button
								raised
								dialog-confirm
								autofocus
								on-tap="updateClientAuth"
								class="update-buttons">
							<i18n-msg msgid="update">
								Update
							</i18n-msg>
						</paper-button>
						<paper-button
								toggles
								raised
								on-tap="deleteClient"
								class="delete-buttons">
							<i18n-msg msgid="delete">
								Delete
							</i18n-msg>
						</paper-button>
					</div>
				</div>
				<div id="edit-client-attributes">
					<div>
						<paper-dropdown-menu
								id="updateClientProtocol"
								label="[[i18n.proto]]"
								type="number"
								selected-item-label="{{selectedItem}}"
								on-selected-item-changed="checkProto">
							<paper-listbox
									id="updateClientProtocolList"
									class="dropdown-content"
									selected="0">
								<paper-item>RADIUS</paper-item>
								<paper-item>DIAMETER</paper-item>
							</paper-listbox>
						</paper-dropdown-menu>
						<paper-tooltip>
							<i18n-msg msgid="protoTool">
								Protocol used by network access server, router or access point.
							</i18n-msg>
						</paper-tooltip>
					</div>
					<div>
						<paper-input
								id="updateClientDisconnectPort"
								name="port"
								label="[[i18n.listen]]"
								type="number">
						</paper-input>
						<paper-tooltip>
							<i18n-msg msgid="listenTooltip">
								Port network access server, router or access point listens on
							</i18n-msg>
						</paper-tooltip>
					</div>
					<div class="buttons">
						<paper-button
								dialog-dismiss
								onclick="updateClientModal.close()"
								class="cancel-btn">
							<i18n-msg msgid="cancel">
								Cancel
							</i18n-msg>
						</paper-button>
						<paper-button
								raised
								dialog-confirm
								autofocus
								on-tap="updateClientProperties"
								class="update-buttons">
							<i18n-msg msgid="update">
								Update
							</i18n-msg>
						</paper-button>
						<paper-button
								toggles
								raised
								on-tap="deleteClient"
								class="delete-buttons">
							<i18n-msg msgid="delete">
								Delete
							</i18n-msg>
						</paper-button>
					</div>
				</div>
			</iron-pages>
			<paper-toast id="getClientErrorToast" duration="0">
				<paper-button
						class="yellow-button"
						onclick="getClientErrorToast.toggle()">
					Close
				</paper-button>
			</paper-toast>
		</paper-dialog>
		<iron-ajax id="updateClientAuthAjax"
				on-response="_updateClientAuthResponse"
				on-error="_updateClientAuthError">
		</iron-ajax>
		<iron-ajax id="updateClientPropertiesAjax"
				on-response="_updateClientPropertiesResponse"
				on-error="_updateClientPropertiesError">
		</iron-ajax>
		<iron-ajax id="deleteClientAjax"
				on-response="_deleteClientResponse"
				on-error="_deleteClientError">
		</iron-ajax>
	</template>
	<script>
		Polymer ({
			is: 'sig-client-update',
			behaviors: [i18nMsgBehavior],
			properties: {
				selected: {
					type: Number,
					value: 0
				}
			},
			updateClientAuth: function(event) {
				var ajax = this.$.updateClientAuthAjax;
				ajax.method = "PATCH";
				ajax.contentType = "application/json-patch+json";
				ajax.url = "/ocs/v1/client/" + this.$.updateClientId.value;
				var clientPass = new Array();
				var clientSec = new Object();
				clientSec.op = "replace";
				clientSec.path = "/secret";
				clientSec.value = this.$.updateClientNewPassword.value;
				var passwordReq = new Object();
				passwordReq.op = "add";
				passwordReq.path = "/passwordRequired";
				if (this.$.checkPassUpdate.checked) {
					passwordReq.value = false;
				} else {
					passwordReq.value = true;
				}
				if (this.$.updateClientNewPassword.value == "") {
					clientPass.push(passwordReq);
				} else {
					clientPass.push(clientSec, passwordReq);
				}
				ajax.body = JSON.stringify(clientPass);
				ajax.generateRequest();
				this.$.checkPassUpdate.checked = null;
			},
			_updateClientAuthResponse: function(event) {
				document.getElementById("updateClientToastSuccess").open();
				document.getElementById("clientGrid").clearCache();
			},
			_updateClientAuthError: function(event) {
				this.$.getClientErrorToast.text = event.detail.request.xhr.statusText;
				this.$.getClientErrorToast.open();
			},
			updateClientProperties: function(event) {
				var editAjax =  this.$.updateClientPropertiesAjax;
				editAjax.method = "PATCH";
				editAjax.contentType = "application/json-patch+json";
				editAjax.url = "/ocs/v1/client/" + this.$.updateClientId.value;
				var clientArray = new Array();
				var clientPro = new Object();
				clientPro.op = "replace";
				clientPro.path = "/protocol";
				clientPro.value = this.$.updateClientProtocol.value;
				clientArray.push(clientPro);
				var clientPort = new Object();
				clientPort.op = "replace";
				clientPort.path = "/port"
				clientPort.value = parseInt(this.$.updateClientDisconnectPort.value);
				clientArray.push(clientPort);
				editAjax.body = JSON.stringify(clientArray);;
				editAjax.generateRequest();
			},
			_updateClientPropertiesResponse: function(event) {
				document.getElementById("updateClientToastSuccess").open();
				document.getElementById("clientGrid").clearCache();
			},
			_updateClientPropertiesError: function(event) {
				this.$.getClientErrorToast.text = event.detail.request.xhr.statusText;
				this.$.getClientErrorToast.open();
			},
			checkProto: function(event) {
				if(this.$.updateClientProtocolList.selected == 0) {
					this.$.updateClientDisconnectPort.disabled = false;
				} else if(this.$.updateClientProtocolList.selected == 1) {
					this.$.updateClientDisconnectPort.disabled = true;
				}
			},
			deleteClient: function(event) {
			this.$.deleteClientAjax.method = "DELETE";
				this.$.deleteClientAjax.url = "/ocs/v1/client/"
						+ document.getElementById("clientGrid").selectedItems[0].id;
				this.$.deleteClientAjax.generateRequest();
			},
			_deleteClientResponse: function(event) {
				this.$.updateClientModal.close();
				document.getElementById("deleteClientToastSuccess").open();
				document.getElementById("clientGrid").clearCache();
			},
			_deleteClientError: function(event) {
				this.$.deleteClientToastError.text = event.detail.request.xhr.statusText;
				this.$.deleteClientToastError.open();
			}
		});
	</script>
</dom-module>
