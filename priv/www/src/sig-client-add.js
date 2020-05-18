<!--  vim: set ts=3:  -->
<link rel="import" href="polymer/polymer.html">
<link rel="import" href="i18n-msg/i18n-msg.html">
<link rel="import" href="i18n-msg/i18n-msg-behavior.html">
<link rel="import" href="iron-ajax/iron-ajax.html">
<link rel="import" href="iron-collapse/iron-collapse.html">
<link rel="import" href="paper-dialog/paper-dialog.html">
<link rel="import" href="paper-dropdown-menu/paper-dropdown-menu.html">
<link rel="import" href="paper-listbox/paper-listbox.html">
<link rel="import" href="paper-item/paper-item.html">
<link rel="import" href="paper-item/paper-icon-item.html">
<link rel="import" href="paper-item/paper-item-body.html">
<link rel="import" href="paper-toolbar/paper-toolbar.html">
<link rel="import" href="paper-input/paper-input.html">
<link rel="import" href="paper-button/paper-button.html">
<link rel="import" href="paper-tooltip/paper-tooltip.html">
<link rel="import" href="paper-toggle-button/paper-toggle-button.html" >
<link rel="import" href="paper-toast/paper-toast.html">
<link rel="import" href="paper-styles/color.html">
<link rel="import" href="paper-checkbox/paper-checkbox.html">
<link rel="import" href="iron-icons/iron-icons.html">
<link rel="import" href="iron-icons/communication-icons.html">

<dom-module id="sig-client-add">
	<template>
		<style is="custom-style">
			paper-dialog {
				overflow: auto;
			}
			paper-input {
				--paper-input-container-focus-color: var(--paper-yellow-900);
			}
			paper-toolbar{
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
			.generate {
				display: inline-block;
				width: 8em;
			}
			.passwordless {
				width: 8em;
				padding-left: 10px;
			}
			.secret {
				display: inline-block;
			}
			.add-button {
				background-color: var(--paper-lime-a700);
				color: black;
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
		<paper-dialog id="addClientModal" modal>
			<paper-toolbar>
				<h2>[[i18n.addClient]]</h2>
			</paper-toolbar>
			<div>
				<paper-input
					id="addClientAddress"
					name="address"
					label="[[i18n.ipAddress]]"
					allowed-pattern="[0-9\.]"
					required>
				</paper-input>
				<paper-tooltip >
					<i18n-msg msgid="ipTooltip">
						IP address of network access server, router or access point
					</i18n-msg>
				</paper-tooltip>
			</div>
			<div>
				<paper-dropdown-menu id="protoDrop"
						label="[[i18n.proto]]"
						on-selected-item-changed="checkProto">
					<paper-listbox id="addClientProtocol"
							slot="dropdown-content"
							class="dropdown-content"
							selected="0">
						<paper-item>
							<i18n-msg msgid="radius">
								RADIUS
							</i18n-msg>
						</paper-item>
						<paper-item>
							<i18n-msg msgid="diameter">
								DIAMETER
							</i18n-msg>
						</paper-item>
					</paper-listbox>
				</paper-dropdown-menu>
				<paper-tooltip>
					<i18n-msg msgid="addClientProtoTooltip">
						Select protocol from dropdown menu
					</i18n-msg>
				</paper-tooltip>
			</div>
			<iron-collapse id="addClientRadiusHide">
				<div>
					<paper-input
							id="addClientSecret"
							class="secret"
							name="secret"
							label="[[i18n.secret]]">
					</paper-input>
					<paper-tooltip>
						<i18n-msg msgid="secretTooltip">
							Secret shared with the network access server, router or access point.
						</i18n-msg>
					</paper-tooltip>
					<div class="generate">
						<paper-checkbox
							id="check"
							on-change="checkboxchanged">
							<i18n-msg msgid="gen">
								Generate
							</i18n-msg>
						</paper-checkbox>
					</div>
				</div>
				<div>
					<paper-input
						id="addClientPort"
						name="port"
						label="[[i18n.listen]]"
						type="number"
						value=3799>
					</paper-input>
					<paper-tooltip>
						<i18n-msg msgid="listenTooltip">
							Port network access server, router or access point listens on
						</i18n-msg>
					</paper-tooltip>
				</div>
				Passwordless
				<paper-checkbox
					class="passwordless"
					id="checkPass">
				</paper-checkbox>
			</iron-collapse>
			<div class="buttons">
				<paper-button dialog-confirm
						raised
						class="add-button"
						on-tap="_addClientSubmit">
					<i18n-msg msgid="submit">
							Submit
					</i18n-msg>
				</paper-button>
				<paper-button dialog-dismiss
						class="cancel-button"
						dialog-dismiss
						on-tap="cancelDialogClient">
					<i18n-msg msgid="cancel">
							Cancel
					</i18n-msg>
				</paper-button>
			</div>
			<paper-toast id="addClientToastSuccess" class="fit-bottom">
				<h2>[[i18n.clientAdded]]</h2>
			</paper-toast>
			<paper-toast
					id="addClientToastError" class="fit-bottom">
			</paper-toast>
		</paper-dialog>
		<paper-dialog id="addClientSecretModal" class="generated" modal>
			<paper-toolbar>
				<h2>[[i18n.serverGen]]</h2>
			</paper-toolbar>
			<paper-icon-item>
				<paper-item-body two-line>
					<div>
						<iron-icon icon="communication:vpn-key" item-icon></iron-icon>
						[[i18n.secret]]&#58;
					</div>
					<div secondary>
						[[secret]]
					</div>
				</paper-item-body>
			</paper-icon-item>
			<div class="close">
				<paper-button dialog-confirm autofocus>
					<i18n-msg msgid="close">
						Close
					</i18n-msg>
				</paper-button>
			</div>
		</paper-dialog>
		<iron-ajax
				id="addClientAjax"
				url="/ocs/v1/client"
				method = "post"
				content-type="application/json"
				on-loading-changed="_onLoadingChanged"
				on-response="_addClientResponse"
				on-error="_addClientError">
		</iron-ajax>
	</template>
	<script>
		Polymer ({
			is: 'sig-client-add',
			behaviors: [i18nMsgBehavior],
			properties: {
				secret: String
			},
			_addClientSubmit: function(event) {
				var client = new Object();
				client.id = this.$.addClientAddress.value;
				if (this.$.addClientProtocol.selected == 1) {
					client.protocol = "DIAMETER";
				} else {
					client.protocol = "RADIUS";
					client.port = parseInt(this.$.addClientPort.value);
					if (!this.$.addClientSecret.disabled) {
						client.secret = this.$.addClientSecret.value;
					}
					if (this.$.checkPass.checked) {
						client.passwordRequired = false;
					}
				}
				this.$.addClientAjax.body = client;
				if(this.$.addClientProtocol.selected == 0) {
					if (this.$.addClientSecret.value || this.$.check.checked) {
						this.$.addClientAjax.generateRequest();
					}
				} else if(this.$.addClientProtocol.selected == 1) {
					this.$.addClientAjax.generateRequest();
				}
			},
			checkProto: function(event) {
				if(this.$.addClientProtocol.selected == 0) {
					this.$.addClientRadiusHide.show();
				} else if(this.$.addClientProtocol.selected == 1) {
					this.$.addClientRadiusHide.hide();
				}
			},
			_onLoadingChanged: function(event) {
				if (this.$.addClientAjax.loading) {
					document.getElementById('progress').disabled = false;
				} else {
					document.getElementById('progress').disabled = true;
				}
			},
			checkboxchanged: function(event) {
				if (event.target.checked) {
					this.$.addClientSecret.disabled = true;
				} else {
					this.$.addClientSecret.disabled = false;
				}
			},
			_addClientResponse: function(event) {
				document.getElementById("addClientToastSuccess").open();
				this.$.addClientModal.close();
				if ((this.$.addClientAjax.body.secret == undefined)
						&& this.$.addClientAjax.lastResponse.secret) {
					this.secret = this.$.addClientAjax.lastResponse.secret;
					this.$.addClientSecretModal.open();
				}
				document.getElementById("clientGrid").clearCache();
			},
			cancelDialogClient: function() {
				this.$.addClientAddress.value = null;	
				this.$.addClientProtocol.selected = null;
				this.$.addClientSecret.value = null;
				this.$.addClientModal.close();
			},
			 _addClientError: function(event) {
				this.$.addClientToastError.text = event.detail.request.xhr.statusText;
				this.$.addClientToastError.open();
			},
		});
	</script>
</dom-module>
