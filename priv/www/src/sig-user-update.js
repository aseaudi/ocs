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
<link rel="import" href="paper-checkbox/paper-checkbox.html">

<dom-module id="sig-user-update">
	<template>
		<style is="custom-style">
			paper-dialog {
				overflow: auto;
			}
			paper-toolbar {
				margin-top: 0px;
				color: white;
				background-color: #bc5100;
			}
			paper-input {
	         --paper-input-container-focus-color: var(--paper-yellow-900);
	      }
			paper-item {
				padding-right: 10px;
			}
			.add-button {
				background-color: var(--paper-lime-a700);
				color: black;
				width: 8em;
			}
			.delete-buttons {
	         background: #EF5350;
	         color: black;
	      }
			.cancel-button {
				color: black;
			}
		</style>
		<paper-dialog id="updateUserModal" modal>
			<paper-toolbar>
				<h2>[[i18n.updateUserTitle]]</h2>
			</paper-toolbar>
				<paper-input
						id="updateUserName"
						name="username"
						label="[[i18n.userName]]"
						disabled>
				</paper-input>
				<div>
				<paper-input
						id="updateUserPassword"
						name="password"
						label="[[i18n.password]]">
				</paper-input>
					<paper-tooltip>
						<i18n-msg msgid="userUpdatePasswordTooltip">
							"New password of user"
						</i18n-msg>
					</paper-tooltip>
				</div>
				<div>
				<paper-dropdown-menu
						id="updateUserLocale"
						name="locale"
						label="[[i18n.language]]">
					<paper-listbox
							id="updateUserLocaleList"
							slot="dropdown-content"
							class="dropdown-content"
							selected="0">
						<paper-item value="en">
							<i18n-msg msgid="eng">
								English
							<i18n-msg>
						</paper-item>
						<paper-item value="es">
							<i18n-msg msgid="spa">
								Spanish
							<i18n-msg>
						</paper-item>
					</paper-listbox>
				</paper-dropdown-menu>
					<paper-tooltip>
						<i18n-msg msgid="userUpdateLangTooltip">
							"Update the language of user"
						</i18n-msg>
					</paper-tooltip>
				</div>
				<div class="buttons">
					<paper-button
							raised
							class="add-button"
							on-tap="_updateUserSubmit">
							<i18n-msg msgid="update">
								Update
							<i18n-msg>
					</paper-button>
					<paper-button
							class="cancel-button"
							dialog-dismiss
							autofocus
							onclick="updateUserModal.close()">
							<i18n-msg msgid="cancel">
								Cancel
							<i18n-msg>
					</paper-button>
					<paper-button
							toggles
							raised
							on-tap="_deleteUserSubmit"
							class="delete-buttons">
							<i18n-msg msgid="delete">
								Delete
							<i18n-msg>
					</paper-button>
				</div>
			<paper-toast
					id="updateUserToastError">
			</paper-toast>
		</paper-dialog>
		<iron-ajax
				id="updateUserAjax"
				method="PATCH"
				content-type="application/json-patch+json"
				on-response="_updateUserResponse"
				on-error="_updateUserError"
				handle-as="json">
		</iron-ajax>
		<iron-ajax id="deleteUserAjax"
				on-response="_deleteUserResponse"
				on-error="_updateUserError">
		</iron-ajax>
	</template>
	<script>
		Polymer ({
			is: 'sig-user-update',
			behaviors: [i18nMsgBehavior],
			_updateUserSubmit: function(event) {
				this.$.updateUserAjax.url = "/partyManagement/v1/individual/"
						+ this.$.updateUserName.value;
				var patch = new Array();
				var language;
				if (this.$.updateUserLocaleList.selected == 0) {
					language = "en";
				} else if (this.$.updateUserLocaleList.selected == 1) {
					language = "es";
				}
				var characteristic = document.getElementById("userGrid").selectedItems[0].characteristic;
				for (i = 0; i < characteristic.length; i++) {
					if (characteristic[i].name == "locale") {
						if (characteristic[i].value != language) {
							op0 = new Object();
							op0.op = "replace";
							op0.path = "/characteristic/" + i.toString();
							op0.value = new Object();
							op0.value.name = "locale";
							op0.value.value = language;
							patch.push(op0);
						}
					}
				}
				if (this.$.updateUserPassword.value) {
					op1 = new Object();
					op1.op = "add";
					op1.path = "/characteristic/-";
					op1.value = new Object();
					op1.value.name = "password";
					op1.value.value = this.$.updateUserPassword.value;
					patch.push(op1);
				}
				this.$.updateUserAjax.body = JSON.stringify(patch);
				this.$.updateUserAjax.generateRequest();
			},
			_updateUserResponse: function(event) {
				this.$.updateUserModal.close();
				document.getElementById("updateUserToastSuccess").open();
				document.getElementById("userGrid").clearCache();
			},
			_updateUserError: function(event) {
				this.$.updateUserToastError.text = event.detail.request.xhr.statusText;
				this.$.updateUserToastError.open();
			},
			_deleteUserSubmit: function(event) {
				this.$.deleteUserAjax.method = "DELETE";
				this.$.deleteUserAjax.url = "/partyManagement/v1/individual/"
						+ document.getElementById("userGrid").selectedItems[0].id;
				this.$.deleteUserAjax.generateRequest();
			},
			_deleteUserResponse: function(event) {
				this.$.updateUserModal.close();
				document.getElementById("deleteUserToastSuccess").open();
				document.getElementById("userGrid").clearCache();
			}
		});
	</script>
</dom-module>
