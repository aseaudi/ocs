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
<link rel="import" href="paper-styles/color.html">
<link rel="import" href="paper-menu-button/paper-menu-button.html" />
<link rel="import" href="paper-icon-button/paper-icon-button.html">
<link rel="import" href="paper-date-picker/paper-date-picker.html">
<link rel="import" href="iron-icon/iron-icon.html">
<link rel="import" href="iron-icons/iron-icons.html">

<dom-module id="sig-prefix-table-add">
	<style>
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
		.add-button {
			background-color: var(--paper-lime-a700);
			color: black;
			width: 8em;
		}
		.cancel-button {
			color: black;
		}
	</style>
	<template>
		<paper-dialog id="addPrefixTableModal" modal>
			<paper-toolbar>
				<h2>[[i18n.addTable]]</h2>
			</paper-toolbar>
			<div>
				<paper-input
						id="addTableName"
						name="name"
						label="[[i18n.name]]"
						onfocus="tableTimeStart.hide(); tableTimeEnd.hide();">
				</paper-input>
			</div>
			<div>
				<paper-input
						id="addTableDesc"
						name="description"
						label="[[i18n.des]]"
						onfocus="tableTimeStart.hide(); tableTimeEnd.hide();">
				</paper-input>
			</div>
			<div>
				<iron-collapse id="tableTimeStart">
					<paper-date-picker id="addTablePickerStart" date="{{startTableTime}}">
					</paper-date-picker>
				</iron-collapse>
				<paper-input
						id="addTableStart"
						value="[[startTableTimePick]]"
						name="startDate"
						label="[[i18n.start]]"
						onfocus="tableTimeStart.show(); tableTimeEnd.hide();">
				</paper-input>
			</div>
			<div>
				<iron-collapse id="tableTimeEnd">
					<paper-date-picker id="addTablePickerEnd" date="{{endTableTime}}">
					</paper-date-picker>
				</iron-collapse>
				<paper-input
						id="addTableEnd"
						value="[[endTableTimePick]]"
						name="endDate"
						label="[[i18n.end]]"
						onfocus="tableTimeEnd.show(); tableTimeStart.hide();">
				</paper-input>
			</div>
			<div class="buttons">
				<paper-button
						dialog-confirm
						raised
						on-tap="_tableAdd"
						class="add-button">
					<i18n-msg msgid="submit">
						Submit
					</i18n-msg>
				</paper-button>
				<paper-button
						dialog-dismiss
						on-tap="_cancel"
						class="cancel-button">
					<i18n-msg msgid="cancel">
						Cancel
					<i18n-msg>
				</paper-button>
			</div>
		</paper-dialog>
		<paper-toast
			id="addTableToastError">
		</paper-toast>
		<iron-ajax
			id="addTableAjax"
			url="/catalogManagement/v2/pla"
			method = "POST"
			content-type="application/json"
			on-loading-changed="_onLoadingChanged"
			on-response="_addTableResponse"
			on-error="_addTableError">
		</iron-ajax>
	</template>
	<script>
		Polymer ({
			is: 'sig-prefix-table-add',
			behaviors: [i18nMsgBehavior],
			properties: {
				startTableTimePick: {
					type: String,
					value: ""
				},
				endTableTimePick: {
					type: String,
					value: ""
				},
				startTableTime: {
					observer: '_startTableTime'
				},
				endTableTime: {
					observer: '_endTableTime'
				},
			},
			_startTableTime: function(date) {
				if(this.$.tableTimeStart.opened){
					this.startTableTimePick = moment(date).format('YYYY-MM-DD');
				}
			},
			_endTableTime: function(date) {
				if(this.$.tableTimeEnd.opened) {
					this.endTableTimePick = moment(date).format('YYYY-MM-DD');
				}
			},
			_tableAdd: function(event) {
				var tabName = new Object();
				if(this.$.addTableName.value) {
					tabName.name = this.$.addTableName.value;
				}
				if(this.$.addTableDesc.value) {
					tabName.description = this.$.addTableDesc.value;
				}
				if(this.$.addTableStart.value) {
					var startDateTime = this.$.addTableStart.value
				}
				if(this.$.addTableEnd.value) {
					var endDateTime = this.$.addTableEnd.value;
				}
				if(endDateTime < startDateTime) {
					this.$.addTableToastError.text = event.detail.request.xhr.statusText;
					this.$.addTableToastError.open();
				} else if(startDateTime && endDateTime) {
					tabName.validFor = {startDateTime, endDateTime};
				} else if(startDateTime && !endDateTime) {
					tabName.validFor = {startDateTime};
				} else if(!startDateTime && !endDateTime) {
					tabName.validFor = {endDateTime};
				}
				if(tabName.name) {
					var ajax = this.$.addTableAjax;
					ajax.body = tabName;
					ajax.generateRequest();
				}
				this.$.addTableName.value = null;
				this.$.addTableDesc.value = null;
				this.$.addTableStart.value = null;
				this.$.addTableEnd.value = null;
			},
			_addTableResponse: function(event) {
				var results = event.detail.response;
				var tableRecord = new Object();
				tableRecord.id = results.id;
				tableRecord.href = results.href;
				tableRecord.plaSpecId = results.plaSpecId;
					document.getElementById("offerList").push('tables', tableRecord);
				this.$.addPrefixTableModal.close();
			},
			_addTableError: function(event) {
				this.$.addTableToastError.text = event.detail.request.xhr.statusText;
				this.$.addTableToastError.open();
			},
			_cancel: function() {
				this.$.addTableName.value = null;
				this.$.addTableDesc.value = null;
				this.$.addTableStart.value = null;
				this.$.addTableEnd.value = null;
			},
			_onLoadingChanged: function(event) {
				if (this.$.addTableAjax.loading) {
					document.getElementById("progress").disabled = false;
				} else {
					document.getElementById("progress").disabled = true;
				}
			}
		});
	</script>
</dom-module>
