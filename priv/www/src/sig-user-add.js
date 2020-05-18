<!--  vim: set ts=3:  -->
<link rel="import" href="polymer/polymer.html">
<link rel="import" href="i18n-msg/i18n-msg.html">
<link rel="import" href="i18n-msg/i18n-msg-behavior.html">
<link rel="import" href="iron-ajax/iron-ajax.html">
<link rel="import" href="paper-dialog/paper-dialog.html">
<link rel="import" href="paper-dropdown-menu/paper-dropdown-menu.html">
<link rel="import" href="paper-listbox/paper-listbox.html">
<link rel="import" href="paper-toolbar/paper-toolbar.html">
<link rel="import" href="paper-input/paper-input.html">
<link rel="import" href="paper-button/paper-button.html">
<link rel="import" href="paper-tooltip/paper-tooltip.html">
<link rel="import" href="paper-toggle-button/paper-toggle-button.html" >
<link rel="import" href="paper-toast/paper-toast.html">
<link rel="import" href="paper-styles/color.html">

<dom-module id="sig-user-add">
	<template>
		<style is="custom-style">
			paper-dialog {
				overflow: auto;
			}
			paper-item {
				padding-right: 10px;
			}
			paper-toolbar{
				margin-top: 0px;
				color: white;
				background-color: #bc5100;
			}
			.add-button {
				background-color: var(--paper-lime-a700);
				color: black;
				width: 8em;
			}
			.cancel-button {
				color: black;
			}
		</style>
		<paper-dialog id="addUserModal" modal>
			<paper-toolbar>
				<h2>[[i18n.AddUserTitle]]</h2>
			</paper-toolbar>
				<div>
					<paper-input
							id="addUserName"
							name="username"
							label="[[i18n.userName]]" required>
					</paper-input>
					<paper-tooltip>
						<i18n-msg msgid="userNameTooltip">
							Name of user
						</i18n-msg>
					</paper-tooltip>
				</div>
				<div>
					<paper-input
							id="addUserPassword"
							name="password"
							label="[[i18n.password]]">
					</paper-input>
					<paper-tooltip>
						<i18n-msg msgid="userPasswordTooltip">
							Name of user
						</i18n-msg>
					</paper-tooltip>
				</div>
				<div>
					<paper-dropdown-menu
							name="locale"
							label="[[i18n.language]]">
						<paper-listbox
								id="addUserLocale"
								slot="dropdown-content"
								class="dropdown-content"
								selected="0">
							<paper-item value="en">
								[[i18n.eng]]
							</paper-item>
							<paper-item value="es">
								[[i18n.spa]]
							</paper-item>
						</paper-listbox>
					</paper-dropdown-menu>
					<paper-tooltip>
						<i18n-msg msgid="userLangTooltip">
							Language of user
						</i18n-msg>
					</paper-tooltip>
				</div>
				<div class="buttons">
					<paper-button
							raised
							class="add-button"
							on-tap="_addUserSubmit">
						<i18n-msg msgid="submit">
							Submit
						</i18n-msg>
					</paper-button>
					<paper-button
							class="cancel-button"
							dialog-dismiss
							on-tap="cancelDialog">
						<i18n-msg msgid="cancel">
							Cancel
						</i18n-msg>
					</paper-button>
				</div>
			</form>
			<paper-toast
					id="addUserToastError">
			</paper-toast>
		</paper-dialog>
		<iron-ajax
			id="addUserAjax"
			url="/partyManagement/v1/individual"
			method = "post"
			content-type="application/json"
			on-loading-changed="_onLoadingChanged"
			on-response="_addUserResponse"
			on-error="_addUserError">
		</iron-ajax>
	</template>
	<script>
		Polymer ({
			is: 'sig-user-add',
			behaviors: [i18nMsgBehavior],
			 _addUserSubmit: function(event) {
				var user = new Object();
				user.id = this.$.addUserName.value;
				var username = new Object();
				username.name = "username";
				username.value = this.$.addUserName.value;
				var password = new Object();
				password.name = "password";
				password.value = this.$.addUserPassword.value;
				var language = new Object();
				language.name = "locale";
				if (this.$.addUserLocale.selected == 0) {
					language.value = "en";
				} else if (this.$.addUserLocale.selected == 1) {
					language.value = "es";
				}
				if(this.$.addUserName.value) {
					var characteristic = new Array();
					characteristic.push(username);
					characteristic.push(password);
					characteristic.push(language);
					user.characteristic = characteristic;
					this.$.addUserAjax.body = user;
					this.$.addUserAjax.generateRequest();
				} else {
					document.getElementById('addUserToastErrorForm').open();
				}
			},
			_addUserResponse: function(event) {
				this.$.addUserModal.close();
				this.$.addUserName.value = "";
				this.$.addUserPassword.value = "";
				document.getElementById('addUserToastSuccess').open();
				document.getElementById('userGrid').clearCache();
			},
			_addUserError: function(event) {
				this.$.addUserToastError.text = event.detail.request.xhr.statusText;
				this.$.addUserToastError.open();
			},
			cancelDialog: function() {
				this.$.addUserName.value = null;
				this.$.addUserPassword.value = null;
				this.$.addUserLocale.selected = null;
				this.$.addUserModal.close();
			},
			_onLoadingChanged: function(event) {
				if (this.$.addUserAjax.loading) {
					document.getElementById("progress").disabled = false;
				} else {
					document.getElementById("progress").disabled = true;
				}
			}
		});
	</script>
</dom-module>
