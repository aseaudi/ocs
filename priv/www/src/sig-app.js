<!--  vim: set ts=3:  -->
<link rel="import" href="polymer/polymer.html">
<link rel="import" href="app-layout/app-header-layout/app-header-layout.html">
<link rel="import" href="app-layout/app-header/app-header.html">
<link rel="import" href="app-layout/app-toolbar/app-toolbar.html">
<link rel="import" href="app-layout/app-drawer-layout/app-drawer-layout.html">
<link rel="import" href="app-layout/app-drawer/app-drawer.html">
<link rel="import" href="i18n-msg/i18n-msg.html">
<link rel="import" href="i18n-msg/i18n-msg-behavior.html">
<link rel="import" href="iron-pages/iron-pages.html">
<link rel="import" href="iron-selector/iron-selector.html">
<link rel="import" href="iron-ajax/iron-ajax.html">
<link rel="import" href="paper-dialog/paper-dialog.html">
<link rel="import" href="paper-button/paper-button.html">
<link rel="import" href="paper-menu/paper-menu.html"/>
<link rel="import" href="paper-menu/paper-submenu.html" />
<link rel="import" href="paper-item/paper-icon-item.html">
<link rel="import" href="paper-icon-button/paper-icon-button.html">
<link rel="import" href="paper-progress/paper-progress.html">
<link rel="import" href="paper-styles/typography.html">
<link rel="import" href="paper-styles/color.html">
<link rel="import" href="iron-icons/iron-icons.html">
<link rel="import" href="iron-icons/maps-icons.html">
<link rel="import" href="iron-icons/editor-icons.html">
<link rel="import" href="iron-icons/hardware-icons.html">
<link rel="import" href="iron-icons/device-icons.html">
<link rel="import" href="sig-help.html">
<link rel="import" href="sig-sub-list.html">
<link rel="import" href="sig-sub-add.html">
<link rel="import" href="sig-sub-update.html">
<link rel="import" href="sig-client-list.html">
<link rel="import" href="sig-client-add.html">
<link rel="import" href="sig-client-update.html">
<link rel="import" href="sig-ipdr-log-files-wlan.html">
<link rel="import" href="sig-ipdr-log-files-voip.html">
<link rel="import" href="sig-ipdr-list-wlan.html">
<link rel="import" href="sig-ipdr-list-voip.html">
<link rel="import" href="sig-access-list.html">
<link rel="import" href="sig-accounting-list.html">
<link rel="import" href="sig-http-list.html">
<link rel="import" href="sig-usage-list.html">
<link rel="import" href="sig-user-add.html">
<link rel="import" href="sig-user-list.html">
<link rel="import" href="sig-user-update.html">
<link rel="import" href="sig-offer-list.html">
<link rel="import" href="sig-offer-add.html">
<link rel="import" href="sig-offer-update.html">
<link rel="import" href="sig-prefix-list.html">
<link rel="import" href="sig-prefix-table-add.html">
<link rel="import" href="sig-prefix-add.html">
<link rel="import" href="sig-prefix-update.html">
<link rel="import" href="sig-balance-list.html">
<link rel="import" href="sig-product-list.html">
<link rel="import" href="sig-product-add.html">
<link rel="import" href="sig-bucket-list.html">
<link rel="import" href="sig-bucket-add.html">

<dom-module id="sig-app">
	<template>
		<style is="custom-style">
			:root {
				@apply(--paper-font-common-base);
			}
			app-header-layout {
			}
			app-header {
				color: #fff;
			}
			app-toolbar {
				background: var(--paper-yellow-900);
			}
			app-drawer {
				--app-drawer-content-container: {
					padding-top: 10px;
				};
				height: 100%;
				top: 64px;
			}
			paper-dialog {
				overflow: auto;
			}
			paper-toolbar{
				margin-top: 0px;
				color: white;
				background-color: #bc5100;
			}
			paper-progress {
				display: block;
				width: 100%;
				--paper-progress-active-color: var(--paper-lime-a700);
				--paper-progress-container-color: transparent;
			}
			iron-pages {
				height: 100%;
			}
			iron-icon {
				padding-right: 10px;
			}
			.icon-style {
				min-height: 10px;
			}
			.add-button{
				color: black;
			}
			.ok-button {
				background-color: var(--paper-lime-a700);
				color: black;
				width: 8em;
			}
			.cancel-button {
				color: black;
			}
			.delete-buttons {
				background: #EF5350;
				color: black;
			}
			.sublist paper-icon-item {
				padding-left: 30px;
			}
			.sublistipdr paper-icon-item {
				padding-left: 60px;
			}
		</style>
		<app-header-layout fullbleed>
			<app-header>
				<app-toolbar>
					<paper-icon-button
							icon="menu"
							onclick="drawer.toggle()">
					</paper-icon-button>
					<div main-title>
						<i18n-msg msgid="ocs">
							Online Charging System (OCS)
						</i18n-msg>
					</div>
					<paper-icon-button
							id="refresh"
							icon="refresh"
							on-tap="refresh">
					</paper-icon-button>
					<paper-progress
							id="progress"
							value="0"
							indeterminate
							bottom-item
							disabled="true">
					</paper-progress>
					<paper-icon-button
							icon="icons:more-vert"
							slot="dropdown-trigger"
							on-tap="help">
					</paper-icon-button>
				</app-toolbar>
			</app-header>
			<iron-pages
					id="loadPage"
					role="main"
					selected-attribute="active-page">
				<sig-offer-list id="offerList" offers="{{offers}}" tables="{{tables}}"></sig-offer-list>
				<sig-sub-list id="serviceList"></sig-sub-list>
				<sig-client-list id="clientList"></sig-client-list>
				<sig-user-list id="userList"></sig-user-list>
				<sig-access-list id="accessList"></sig-access-list>
				<sig-accounting-list id="accountingList"></sig-accounting-list>
				<sig-ipdr-list-wlan id="ipdrLogListWlan"></sig-ipdr-list-wlan>
				<sig-ipdr-list-voip id="ipdrLogListVoip"></sig-ipdr-list-voip>
				<sig-http-list></sig-http-list>
				<sig-prefix-list id="prefixList" table="{{table}}"></sig-prefix-list>
				<sig-balance-list id="balanceList"></sig-balance-list>
				<sig-product-list id="productList"></sig-product-list>
				<sig-bucket-list id="bucketList"></sig-bucket-list>
			</iron-pages>
			<app-drawer-layout>
				<app-drawer
						id="drawer"
						swipeOpen>
					<iron-selector
							id="pageSelection"
							class="drawer-list"
							role="navigation">
						<paper-menu id="menu">
							<paper-submenu>
								<paper-icon-item
										class="menu-trigger menuitem">
									<iron-icon icon ="icons:store" item-icon></iron-icon>
										<i18n-msg msgid="catalog">
											Catalog
										</i18n-msg>
								</paper-icon-item>
								<paper-menu id="offerMenu" class="menu-content sublist">
									<paper-icon-item
											id="pageOffer"
											onclick="drawer.toggle()"
											class="menuitem">
										<i18n-msg msgid="offering">
											Offerings
										</i18n-msg>
									<iron-icon icon ="maps:local-offer" item-icon></iron-icon>
									</paper-icon-item>
									<paper-icon-item
											id="pagePrices"
											onclick="drawer.toggle()"
											class="menuitem" hidden>
												Prices
									<iron-icon icon ="editor:monetization-on" item-icon></iron-icon>
									</paper-icon-item>
									<paper-submenu>
										<paper-icon-item
												on-tap="disTableList"
												class="menu-trigger menuitem">
											<iron-icon icon="icons:folder-open" item-icon></iron-icon>
												<i18n-msg msgid="table">
													Tables
												</i18n-msg>
										</paper-icon-item>
									</paper-submenu>
								</paper-menu>
							</paper-submenu>
							<paper-submenu>
								<paper-icon-item
										class="menu-trigger menuitem">
									<iron-icon icon="icons:card-membership" item-icon></iron-icon>
										<i18n-msg msgid="subs">
											Subscribers
										</i18n-msg>
								</paper-icon-item>
								<paper-menu id="serviceMenu" class="menu-content sublist">
									<paper-icon-item
											id="pageService"
											onclick="drawer.toggle()"
											class="menuitem">
										<iron-icon icon="device:devices" item-icon></iron-icon>
											<i18n-msg msgid="service">
												Services
											</i18n-msg>
									</paper-icon-item>
									<paper-icon-item
											id="pageProductInventory"
											onclick="drawer.toggle()"
											class="menuitem">
										<iron-icon icon="maps:local-offer" item-icon></iron-icon>
											<i18n-msg msgid="prod1">
												Products
											</i18n-msg>
									</paper-icon-item>
									<paper-icon-item
											id="pageBucketBalance"
											onclick="drawer.toggle()"
											class="menuitem">
										<iron-icon icon="icons:account-balance" item-icon></iron-icon>
											<i18n-msg msgid="bucketBal">
												Balance Buckets
											</i18n-msg>
									</paper-icon-item>
								</paper-menu>
							</paper-submenu>
							<paper-icon-item
									id="pageClients"
									onclick="drawer.toggle()"
									class="menuitem">
								<iron-icon icon="hardware:router" item-icon></iron-icon>
									<i18n-msg msgid="clients">
										Clients
									</i18n-msg>
							</paper-icon-item>
							<paper-icon-item
									id="pageUsers"
									onclick="drawer.toggle()"
									class="menuitem">
								<iron-icon icon ="icons:perm-identity" item-icon></iron-icon>
									<i18n-msg msgid="users">
										Users
									</i18n-msg>
							</paper-icon-item>
							<paper-submenu>
								<paper-icon-item
										class="menu-trigger menuitem">
									<iron-icon icon="icons:history" item-icon></iron-icon>
										<i18n-msg msgid="logs">
											Logs
										</i18n-msg>
								</paper-icon-item>
								<paper-menu id="logMenu" class="menu-content sublist">
									<paper-icon-item
											id="pageAccess"
											onclick="drawer.toggle()"
											class="menuitem">
										<iron-icon icon="device:data-usage" item-icon></iron-icon>
											<i18n-msg msgid="access">
												Access
											</i18n-msg>
									</paper-icon-item>
									<paper-icon-item
											id="pageAccounting"
											onclick="drawer.toggle()"
											class="menuitem">
										<iron-icon icon ="device:data-usage" item-icon></iron-icon>
											<i18n-msg msgid="accounting">
												Accounting
											</i18n-msg>
									</paper-icon-item>
									<paper-icon-item
											id="pageBalance"
											onclick="drawer.toggle()"
											class="menuitem">
										<iron-icon icon ="device:data-usage" item-icon></iron-icon>
											<i18n-msg msgid="balance">
												Balance
											</i18n-msg>
									</paper-icon-item>
									<paper-submenu>
									<paper-icon-item
											id="pageIPDR"
											class="menu-trigger menuitem">
										<iron-icon icon ="device:data-usage" item-icon></iron-icon>
											<i18n-msg msgid="ipdr">
												IPDR
											</i18n-msg>
									</paper-icon-item>
									<paper-menu id="ipdrMenu" class="menu-content sublistipdr">
										<paper-icon-item
												id="pageIPDRWlan"
												onclick="drawer.toggle()"
												class="menuitem">
											<iron-icon icon ="device:data-usage" item-icon></iron-icon>
												<i18n-msg msgid="wlan">
													WLAN
												</i18n-msg>
										</paper-icon-item>
										<paper-icon-item
												id="pageIPDRVoip"
												onclick="drawer.toggle()"
												class="menuitem">
											<iron-icon icon ="device:data-usage" item-icon></iron-icon>
												<i18n-msg msgid="voip">
													VoIP
												</i18n-msg>
										</paper-icon-item>
									</paper-menu>
									</paper-submenu>
									<paper-icon-item
											id="pageHTTP"
											onclick="drawer.toggle()"
											class="menuitem">
										<iron-icon icon ="device:data-usage" item-icon></iron-icon>
											<i18n-msg msgid="http">
												HTTP
											</i18n-msg>
									</paper-icon-item>
								</paper-menu>
							</paper-submenu>
						</paper-menu>
						<paper-dialog
								id="tableList">
							<paper-toolbar>
								<h2>[[i18n.listTable]]</h2>
							</paper-toolbar>
							<div role="listbox">
								<template id="tableList1" is="dom-repeat" items="[[tables]]">
									<paper-icon-item
											id="pagePrefix"
											class="menuitem"
											on-focused-changed="tableSelection">
										<iron-icon icon ="icons:view-list" item-icon></iron-icon>
											{{item.id}}
									</paper-icon-item>
								</template>
							</div>
							<div class="buttons">
								<paper-button
										raised
										id="tabOkButton"
										disabled
										onclick="drawer.toggle()"
										on-tap="tableOk"
										class="ok-button">
									<i18n-msg msgid="ok">
										Ok
									</i18n-msg>
								</paper-button>
								<paper-button
										dialog-dismiss
										class="cancel-button">
									<i18n-msg msgid="cancel">
										Cancel
									</i18n-msg>
								</paper-button>
								<paper-button
										raised
										on-tap="tableAdd"
										class="add-button">
									<i18n-msg msgid="add">
										Add
									</i18n-msg>
								</paper-button>
								<paper-button
										raised
										on-tap="tableDelete"
										class="delete-buttons">
									<i18n-msg msgid="delete">
										Delete
									</i18n-msg>
								</paper-button>
							</div>
						</paper-dialog>
					</iron-selector>
				</app-drawer>
			</app-drawer-layout>
		</app-header-layout>
		<!--Modal Definitions-->
		<sig-help></sig-help>
		<sig-offer-add id="addProduct"></sig-offer-add>
		<sig-sub-add id="subscriberAdd" offers="[[offers]]"></sig-sub-add>
		<sig-sub-update></sig-sub-update>
		<sig-client-add></sig-client-add>
		<sig-client-update></sig-client-update>
		<sig-user-add></sig-user-add>
		<sig-user-update></sig-user-update>
		<sig-offer-update id="updateProduct"></sig-offer-update>
		<sig-ipdr-log-files-wlan></sig-ipdr-log-files-wlan>
		<sig-ipdr-log-files-voip></sig-ipdr-log-files-voip>
		<sig-prefix-table-add></sig-prefix-table-add>
		<sig-prefix-add></sig-prefix-add>
		<sig-prefix-update></sig-prefix-update>
		<sig-bucket-add></sig-bucket-add>
		<sig-product-add offers="[[offers]]"></sig-product-add>
		<iron-ajax id="deleteTableAjax"
			on-response="_deleteTableResponse"
			on-error="_deleteTableError">
		</iron-ajax>
	</template>
	<script>
		document.addEventListener('HTMLImportsLoaded', function() {
			I18nMsg.lang = document.documentElement.lang || 'en';
			Platform.performMicrotaskCheckpoint();
		});
		Polymer ({
			is: 'sig-app',
			behaviors: [i18nMsgBehavior],
			listeners: {
				'pageSelection.iron-select': 'loadElement'
			},
			tableOk: function() {
				this.$.loadPage.selected = 9;
			},
			disTableList: function() {
				this.$.tableList.open();
				this.$.loadPage.selected = 0;
			},
			tableAdd: function() {
				document.getElementById("addPrefixTableModal").open();
				this.$.tableList.close();
			},
			tableSelection: function(e) {
				if(e.model.item && e.model.item.id) {
					this.$.prefixList.table = e.model.item.id;
					this.$.tabOkButton.disabled = false;
				} else {
					this.$.tabOkButton.disabled = true;
				}
			},
			tableDelete: function(event) {
				this.$.deleteTableAjax.method = "DELETE";
				this.$.deleteTableAjax.url = "/catalogManagement/v2/pla/" + this.$.prefixList.table;
				this.$.deleteTableAjax.generateRequest();
			},
			_deleteTableResponse: function(event) {
				this.$.tableList.close();
				document.getElementById('getTableAjax').generateRequest();
			},
			loadElement: function(event) {
				switch(event.detail.item.getAttribute('id')) {
					case 'pageOffer':
						this.$.loadPage.selected = 0;
						this.$.offerMenu.selected = null;
						this.$.serviceMenu.selected = null;
						this.$.logMenu.selected = null;
						this.$.ipdrMenu.selected = null;
						break;
					case 'pageService':
						this.$.loadPage.selected = 0;
						this.$.loadPage.selected = 1;
						this.$.offerMenu.selected = null;
						this.$.serviceMenu.selected = null;
						this.$.logMenu.selected = null;
						this.$.ipdrMenu.selected = null;
						break;
					case 'pageClients':
						this.$.loadPage.selected = 2;
						this.$.offerMenu.selected = null;
						this.$.serviceMenu.selected = null;
						this.$.logMenu.selected = null;
						this.$.ipdrMenu.selected = null;
						break;
					case 'pageUsers':
						this.$.loadPage.selected = 3;
						this.$.offerMenu.selected = null;
						this.$.serviceMenu.selected = null;
						this.$.logMenu.selected = null;
						this.$.ipdrMenu.selected = null;
						break;
					case 'pageAccess':
						this.$.loadPage.selected = 4;
						this.$.offerMenu.selected = null;
						this.$.serviceMenu.selected = null;
						this.$.logMenu.selected = null;
						this.$.ipdrMenu.selected = null;
						break;
					case 'pageAccounting':
						this.$.loadPage.selected = 5;
						this.$.offerMenu.selected = null;
						this.$.serviceMenu.selected = null;
						this.$.logMenu.selected = null;
						this.$.ipdrMenu.selected = null;
						break;
					case 'pageIPDRWlan':
						this.$.loadPage.selected = null;
						this.$.loadPage.selected = 6;
						this.$.offerMenu.selected = null;
						this.$.serviceMenu.selected = null;
						this.$.logMenu.selected = null;
						this.$.ipdrMenu.selected = null;
						break;
					case 'pageIPDRVoip':
						this.$.loadPage.selected = null;
						this.$.loadPage.selected = 7;
						this.$.offerMenu.selected = null;
						this.$.serviceMenu.selected = null;
						this.$.logMenu.selected = null;
						this.$.ipdrMenu.selected = null;
						break;
					case 'pageHTTP':
						this.$.loadPage.selected = 8;
						this.$.offerMenu.selected = null;
						this.$.serviceMenu.selected = null;
						this.$.logMenu.selected = null;
						this.$.ipdrMenu.selected = null;
						break;
					case 'pagePrefix':
						this.$.loadPage.selected = 9;
						this.$.offerMenu.selected = null;
						this.$.serviceMenu.selected = null;
						this.$.logMenu.selected = null;
						this.$.ipdrMenu.selected = null;
						break;
					case 'pageBalance':
						this.$.loadPage.selected = 10;
						this.$.offerMenu.selected = null;
						this.$.serviceMenu.selected = null;
						this.$.logMenu.selected = null;
						this.$.ipdrMenu.selected = null;
						break;
					case 'pageProductInventory':
						this.$.loadPage.selected = 0;
						this.$.loadPage.selected = 11;
						this.$.offerMenu.selected = null;
						this.$.serviceMenu.selected = null;
						this.$.logMenu.selected = null;
						this.$.ipdrMenu.selected = null;
						break;
					case 'pageBucketBalance':
						this.$.loadPage.selected = 12;
						this.$.offerMenu.selected = null;
						this.$.serviceMenu.selected = null;
						this.$.logMenu.selected = null;
						this.$.ipdrMenu.selected = null;
						break;
				}
			},
			help: function(element) {
				overflow = document.getElementById('helpDrop');
				overflow.positionTarget = element;
				overflow.open();
			},
			refresh: function() {
				switch(this.$.loadPage.selected) {
					case 0:
						document.getElementById('offerGrid').clearCache();
						break;
					case 1:
						document.getElementById('subscriberGrid').clearCache();
						this.$.serviceList.refreshSub();
						break;
					case 2:
						document.getElementById('clientGrid').clearCache();
						this.$.clientList.refreshClient();
						break;
					case 3:
						document.getElementById('userGrid').clearCache();
						break;
					case 4:
						document.getElementById('accessGrid').clearCache();
						this.$.accessList.refreshAccess();
						break;
					case 5:
						document.getElementById('accountingGrid').clearCache();
						this.$.accountingList.refreshAccounting();
						break;
					case 6:
						document.getElementById('ipdrGrid').clearCache();
						this.$.ipdrLogList.refreshIpdr();
						break;
					case 7:
						document.getElementById('ipdrGridVoip').clearCache();
						this.$.ipdrLogList.refreshIPDRVoip();
						break;
					case 8:
						document.getElementById('getHttp').generateRequest();
						break;
					case 9:
						document.getElementById('prefixGrid').clearCache();
						break;
					case 10:
						document.getElementById('balanceGrid').clearCache();
						break;
					case 11:
						document.getElementById('productInventoryGrid').clearCache();
						this.$.productList.refreshProduct();
						break;
					case 12:
						document.getElementById('balanceBucketGrid').clearCache();
						break;
				}
			}
		});
	</script>
</dom-module>
