<!--  vim: set ts=3:  -->
<link rel="import" href="polymer/polymer.html">
<link rel="import" href="i18n-msg/i18n-msg.html">
<link rel="import" href="i18n-msg/i18n-msg-behavior.html">
<link rel="import" href="iron-ajax/iron-ajax.html">
<link rel="import" href="iron-selector/iron-selector.html">
<link rel="import" href="iron-collapse/iron-collapse.html">
<link rel="import" href="paper-dialog/paper-dialog.html">
<link rel="import" href="paper-dropdown-menu/paper-dropdown-menu.html">
<link rel="import" href="paper-listbox/paper-listbox.html">
<link rel="import" href="paper-toolbar/paper-toolbar.html">
<link rel="import" href="paper-input/paper-input.html">
<link rel="import" href="paper-button/paper-button.html">
<link rel="import" href="paper-tabs/paper-tabs.html">
<link rel="import" href="paper-tooltip/paper-tooltip.html">
<link rel="import" href="paper-toggle-button/paper-toggle-button.html" >
<link rel="import" href="paper-toast/paper-toast.html">
<link rel="import" href="paper-checkbox/paper-checkbox.html">
<link rel="import" href="paper-styles/color.html">
<link rel="import" href="paper-time-picker/paper-time-picker.html">
<link rel="import" href="paper-icon-button/paper-icon-button.html">
<link rel="import" href="paper-date-picker/paper-date-picker.html">

<dom-module id="sig-offer-update">
	<template>
		<style is="custom-style">
			paper-dialog {
				overflow: auto;
			}
			paper-item {
				padding-right: 10px;
			}
			paper-checkbox {
				--paper-checkbox-checked-color: #ffb04c;
				--paper-checkbox-checkmark-color: var(--paper-yellow-900);
			}
			paper-toolbar{
				margin-top: 0px;
				background-color: #bc5100;
			}
			.add-button {
				background-color: var(--paper-lime-a700);
				color: black;
			}
			.update-buttons {
				background-color: var(--paper-lime-a700);
				color: black;
			}
			.cancel-button {
				color: black;
			}
			.delete-buttons {
				background: #EF5350;
				color: black;
			}
			.close {
				background-color: var(--paper-lime-a700);
				color: black;
				float: right;
				width: 5em;
			}
		</style>
		<paper-dialog id="updateProductModal" modal>
			<paper-toolbar>
				<paper-tabs selected="{{selected}}">
					<paper-tab id="offer-add">
						<h2>[[i18n.offer]]</h2>
					</paper-tab>
					<paper-tab id="price-add">
						<h2>[[i18n.prices]]</h2>
					</paper-tab>
					<paper-tab id="alt-add">
						<h2>[[i18n.alter]]</h2>
					</paper-tab>
				</paper-tabs>
			</paper-toolbar>
			<iron-pages selected="{{selected}}">
				<div id="addOff-tab">
					<div>
						<paper-input id="updateOffName"
								class="name"
								name="name"
								label="[[i18n.name]]"
								onfocus="updateProductEndDatePickUpdateOff.hide(); updateProductStartDatePickUpdateOff.hide();"
								disabled>
						</paper-input>
						<paper-tooltip>
							<i18n-msg msgid="offerNameTool">
								Product Offering name
							</i18n-msg>
						</paper-tooltip>
					</div>
					<div>
						<paper-input id="updateOffDesc"
								class="description"
								name="description"
								label="[[i18n.des]]"
								onfocus="updateProductEndDatePickUpdateOff.hide(); updateProductStartDatePickUpdateOff.hide();">
						</paper-input>
						<paper-tooltip>
							<i18n-msg msgid="offerDesTool">
								Product Offering description
							</i18n-msg>
						</paper-tooltip>
					</div>
					<div>
						<span>[[i18n.bundleProducts]]</span>
							<paper-icon-button
								id="onClickBundleUpdate"
								suffix
								icon="arrow-drop-down"
								on-click="_onClickBundleUpdate">
							</paper-icon-button>
					</div>
					<iron-collapse id="addBundleUpdate">
						<template is=dom-repeat items="{{offers}}">
							<div>
								<paper-checkbox class="bundleCheck" checked="{{item.checked}}">
									{{item.name}}
								</paper-checkbox>
							</div>
						</template>
					</iron-collapse>
					<div>
						<paper-input id="updateOffSpec"
								label="[[i18n.productSpec]]"
								disabled>
						</paper-input>
					</div>
					<div>
						<iron-collapse id="updateProductStartDatePickUpdateOff">
							<paper-date-picker id="startOff3" date="{{updateProductStartDateOfferPick}}">
							</paper-date-picker>
						</iron-collapse>
						<paper-input id="updateOffStart"
								value="[[updateProductStartDateOffer]]"
								name="updateProductStartDateOffer"
								label="[[i18n.start]]"
								onfocus="updateProductEndDatePickUpdateOff.hide(); updateProductStartDatePickUpdateOff.show();">
						</paper-input>
						<paper-tooltip>
							<i18n-msg msgid="offerStartTool">
								Product Offering start date
							</i18n-msg>
						</paper-tooltip>
					</div>
					<div>
						<iron-collapse id="updateProductEndDatePickUpdateOff">
							<paper-date-picker id="endOff3" date="{{updateProductEndDateOfferPick}}">
							</paper-date-picker>
						</iron-collapse>
						<paper-input id="updateOffEnd"
								value="[[updateProductEndDateOffer]]"
								name="updateProductEndDateOffer"
								label="[[i18n.end]]"
								onfocus="updateProductStartDatePickUpdateOff.hide(); updateProductEndDatePickUpdateOff.show();">
						</paper-input>
						<paper-tooltip>
							<i18n-msg msgid="offerEndTool">
								Product Offering end date
							</i18n-msg>
						</paper-tooltip>
					</div>
					<div>
						<span>[[i18n.characteristics]]</span>
						<paper-icon-button
								id="updateOnClickOfferChars"
								suffix
								icon="arrow-drop-down"
								on-click="_updateOnClickOfferChars">
						</paper-icon-button>
					</div>
					<iron-collapse id="updateAddPriceOfferChars">
						<div>
							<paper-input
									id="updateReserveSession"
									allowed-pattern="[0-9mh]"
									pattern="^[0-9]+[mh]?$"
									auto-validate
									label="[[i18n.resSession]]"
									value=0>
							</paper-input>
							<paper-tooltip>
								<i18n-msg msgid="resSessionTool">
									Access accept session time is reserved seconds
								</i18n-msg>
							</paper-tooltip>
						</div>
					</iron-collapse>
					<div class="buttons">
						<paper-button
								autofocus
								on-tap="updateProductOffer"
								class="update-buttons">
								<i18n-msg msgid="update">
									Update
								</i18n-msg>
						</paper-button>
						<paper-button
								dialog-dismiss
								class="cancel-button"
								on-tap="cancelDialog">
								<i18n-msg msgid="cancel">
									cancel
								</i18n-msg>
						</paper-button>
						<paper-button
								toggles
								raised
								on-tap="deleteProduct"
								class="delete-buttons">
								<i18n-msg msgid="delete">
									Delete
								</i18n-msg>
						</paper-button>
					</div>
				</div>
				<div id=updatePrice-tab>
					<div>
						<datalist id="updatePriceNames">
							<template is="dom-repeat" items="[[prices]]">
								<option value="{{item.name}}" />
							</template>
						</datalist>
						<paper-input id="updatePriceName" 
								list="updatePriceNames"
								label="[[i18n.name]]"
								on-value-changed="updatePriceDialog"
								onclick="updatePriceName.value=null"
								onfocus="updateProductEndDatePickPrice.hide(); updateProductStartDatePickPrice.hide(); updatePriceCharsTimeStart.hide(); updatePriceCharsTimeEnd.hide();">
						</paper-input>
						<paper-tooltip>
							<i18n-msg msgid="updatePriceNameTool">
								Product offering price name
							</i18n-msg>
						</paper-tooltip>
					</div>
					<div>
						<paper-input id="updatePriceDesc"
								class="description"
								name="description"
								label="[[i18n.des]]"
								onfocus="updateProductEndDatePickPrice.hide(); updateProductStartDatePickPrice.hide(); updatePriceCharsTimeStart.hide(); updatePriceCharsTimeEnd.hide();">
						</paper-input>
						<paper-tooltip>
							<i18n-msg msgid="priceDesTool">
								Product Offering price description
							</i18n-msg>
						</paper-tooltip>
					</div>
					<div>
						<iron-collapse id="updateProductStartDatePickPrice">
							<paper-date-picker id="addPriceStart" date="{{updateProductStartDatePricePick}}">
							</paper-date-picker>
						</iron-collapse>
						<paper-input id="updatePriceStartDate"
								value="[[updateProductStartDatePrice]]"
								name="updateProductStartDatePrice"
								label="[[i18n.start]]"
								onfocus="updateProductEndDatePickPrice.hide(); updateProductStartDatePickPrice.show(); updatePriceCharsTimeStart.hide(); updatePriceCharsTimeEnd.hide();">
						</paper-input>
						<paper-tooltip>
							<i18n-msg msgid="priceStartTool">
								Product Offering price start date
							</i18n-msg>
						</paper-tooltip>
					</div>
					<div>
						<iron-collapse id="updateProductEndDatePickPrice">
							<paper-date-picker id="addPriceEnd" date="{{updateProductEndDatePricePick}}">
							</paper-date-picker>
						</iron-collapse>
						<paper-input id="updatePriceEndDate"
								value="[[updateProductEndDatePrice]]"
								name="updateProductEndDatePrice"
								label="[[i18n.end]]"
								onfocus="updateProductStartDatePickPrice.hide(); updateProductEndDatePickPrice.show(); updatePriceCharsTimeStart.hide(); updatePriceCharsTimeEnd.hide();">
						</paper-input>
						<paper-tooltip>
							<i18n-msg msgid="priceEndTool">
								Product offering price end date
							</i18n-msg>
						</paper-tooltip>
					</div>
					<div>
						<paper-dropdown-menu id="updatePriceTypedrop"
								label="[[i18n.priceType]]"
								on-selected-item-changed="checkRecure"
								onfocus="updateProductEndDatePickPrice.hide(); updateProductStartDatePickPrice.hide(); updatePriceCharsTimeStart.hide(); updatePriceCharsTimeEnd.hide();">
							<paper-listbox
									id="updatePriceType"
									slot="dropdown-content"
									class="dropdown-content">
								<paper-item>
									Recurring
								</paper-item>
								<paper-item>
									One Time
								</paper-item>
								<paper-item>
									Usage
								</paper-item>
								<paper-item>
									Tariff
								</paper-item>
							</paper-listbox>
						</paper-dropdown-menu>
						<paper-tooltip>
							<i18n-msg msgid="priceTypeTool">
								Product offering type of price
							</i18n-msg>
						</paper-tooltip>
					</div>
					<div>
						<paper-input id="updatePriceSize"
								class="size"
								name="size"
								allowed-pattern="[0-9kmg]"
								pattern="^[0-9]+[kmg]?$"
								label="[[i18n.unitSize]]"
								auto-validate
								onfocus="updateProductEndDatePickPrice.hide(); updateProductStartDatePickPrice.hide(); updatePriceCharsTimeStart.hide(); updatePriceCharsTimeEnd.hide();">
						</paper-input>
						<paper-tooltip>
							<i18n-msg msgid="priceSizeTool">
								Product offering price unit size
							</i18n-msg>
						</paper-tooltip>
					</div>
					<div>
						<paper-dropdown-menu id="updatePriceUnitsdrop"
								label="[[i18n.unit]]"
								on-selected-item-changed="checkPattern"
								onfocus="updateProductEndDatePickPrice.hide(); updateProductStartDatePickPrice.hide(); updatePriceCharsTimeStart.hide(); updatePriceCharsTimeEnd.hide();">
							<paper-listbox
									id="updatePriceUnits"
									slot="dropdown-content"
									class="dropdown-content">
								<paper-item id="priceBytes">
									 <i18n-msg msgid="bytes">
										Bytes
									</i18n-msg>
								</paper-item>
								<paper-item id="priceCents">
									<i18n-msg msgid="cents">
										Cents
									</i18n-msg>
								</paper-item>
								<paper-item id="priceSeconds">
									<i18n-msg msgid="seconds">
										Seconds
									 </i18n-msg>
								</paper-item>
							</paper-listbox>
						</paper-dropdown-menu>
						<paper-tooltip>
							<i18n-msg msgid="priceUnitTool">
								Product offering price units
							</i18n-msg>
						</paper-tooltip>
					</div>
					<div>
						<paper-input id="updatePriceAmount"
								class="amount"
								name="amount"
								type="text"
								allowed-pattern="[0-9.]"
                        pattern="[0-9]+\.?[0-9]{0,6}$"
								auto-validate
								label="[[i18n.amount]]"
								value=0
								onfocus="updateProductEndDatePickPrice.hide(); updateProductStartDatePickPrice.hide(); updatePriceCharsTimeStart.hide(); updatePriceCharsTimeEnd.hide();">
						</paper-input>
						<paper-tooltip>
							<i18n-msg msgid="priceAmountTool">
								Product offering price amount
							</i18n-msg>
						</paper-tooltip>
					</div>
					<div>
						<paper-input id="updatePriceCurrency"
								class="currency"
								name="currency"
								label="[[i18n.currency]]"
								onfocus="updateProductEndDatePickPrice.hide(); updateProductStartDatePickPrice.hide(); updatePriceCharsTimeStart.hide(); updatePriceCharsTimeEnd.hide();">
						</paper-input>
						<paper-tooltip>
							<i18n-msg msgid="priceCurrencyTool">
								Product offering price currency
							</i18n-msg>
						</paper-tooltip>
					</div>
					<div>
						<paper-dropdown-menu id="updatePricePerioddrop"
								label="[[i18n.period]]"
								onfocus="updateProductEndDatePickPrice.hide(); updateProductStartDatePickPrice.hide(); updatePriceCharsTimeStart.hide(); updatePriceCharsTimeEnd.hide();">
							<paper-listbox
									id="updatePricePeriod"
									slot="dropdown-content"
									class="dropdown-content"
									selected="2">
								<paper-item>
									Hourly
								</paper-item>
								<paper-item>
									Daily
								</paper-item>
								<paper-item>
									Weekly
								</paper-item>
								<paper-item>
									Monthly
								</paper-item>
								<paper-item>
									Yearly
								</paper-item>
							</paper-listbox>
						</paper-dropdown-menu>
						<paper-tooltip>
							<i18n-msg msgid="pricePeriodTool">
								Product offering price period
							</i18n-msg>
						</paper-tooltip>
					</div>
					<div>
						<paper-dropdown-menu
								id="addUpdatePriceDrop"
								label="[[i18n.alter]]"
								onfocus="updateProductEndDatePickPrice.hide(); updateProductStartDatePickPrice.hide(); updatePriceCharsTimeStart.hide(); updatePriceCharsTimeEnd.hide();">
							<paper-listbox
									id="addUpdatePriceAlteration"
									slot="dropdown-content"
									class="dropdown-content">
									<template is="dom-repeat" items="[[alterations]]">
										<paper-item>
											{{item.name}}
										</paper-item>
									</template>
							</paper-listbox>
						</paper-dropdown-menu>
						<paper-tooltip>
							<i18n-msg msgid="priceAlterTool">
								add alteration to offering price
							</i18n-msg>
						</paper-tooltip>
					</div>
					<div>
						<span>[[i18n.characteristics]]</span>
						<paper-icon-button
								id="updateOnClickChars"
								suffix
								icon="arrow-drop-down"
								on-click="_updateOnClickChars">
						</paper-icon-button>
					</div>
					<iron-collapse id="updateAddPriceChars">
						<div>
							<span>[[i18n.timeDay]]</span>
							<paper-icon-button
								id="updateOnClickCharsTime"
								suffix
								icon="arrow-drop-down"
								on-click="_updateOnClickCharsTime">
							</paper-icon-button>
						</div>
						<iron-collapse id="updatePriceCharsTime">
							<div>
								<iron-collapse id="updatePriceCharsTimeStart">
									<paper-time-picker id="updateTimePickerStart" time="{{startTimeUpdate}}">
									</paper-time-picker>
								</iron-collapse>
								<paper-input
										id="updateTimeOfDayStart"
										value="[[startTimeUpdate]]"
										name="updateProductTimePriceStart"
										label="Start Time"
										onfocus="updatePriceCharsTimeStart.show(); updatePriceCharsTimeEnd.hide();">
								</paper-input>
								<paper-tooltip>
									<i18n-msg msgid="timeDayTool">
										Time of day range
									</i18n-msg>
								</paper-tooltip>
							</div>
							<div>
								<iron-collapse id="updatePriceCharsTimeEnd">
									<paper-time-picker id="updateTimePickerEnd" time="{{endTimeUpdate}}">
									</paper-time-picker>
								</iron-collapse>
								<paper-input
										id="updateTimeOfDayEnd"
										value="[[endTimeUpdate]]"
										name="updateProductTimePriceEnd"
										label="End Time"
										onfocus="updatePriceCharsTimeEnd.show(); updatePriceCharsTimeStart.hide();">
								</paper-input>
								<paper-tooltip>
									<i18n-msg msgid="timeDayTool">
										Time of day range
									</i18n-msg>
								</paper-tooltip>
							</div>
						</iron-collapse>
						<div>
							<span>[[i18n.callDirection]]</span>
							<paper-icon-button
								id="updateOnClickCall"
								suffix
								icon="arrow-drop-down"
								on-click="_updateOnClickCall">
							</paper-icon-button>
						</div>
						<iron-collapse id="updateAddCall">
							<div>
								<paper-checkbox id="updateCheckIn">
									<i18n-msg msgid="callIncome">
										Incoming
									</i18n-msg>
								</paper-checkbox>
								<paper-tooltip>
									<i18n-msg msgid="callIncomeUpdateTool">
										Update incoming call direction(answer)
									</i18n-msg>
								</paper-tooltip>
							</div>
							<div>
								<paper-checkbox id="updateCheckOut">
									<i18n-msg msgid="callOutgoing">
										Outgoing
									</i18n-msg>
								</paper-checkbox>
								<paper-tooltip>
									<i18n-msg msgid="callOutgoingUpdateTool">
										Update outgoing call direction(originate)
									</i18n-msg>
								</paper-tooltip>
							</div>
						</iron-collapse>
						<div>
							<paper-input
									id="updateAddPriceCharReserveTime"
									type="number"
									label="[[i18n.reserveTime]]"
									value=0
									onfocus="updatePriceCharsTimeStart.hide(); updatePriceCharsTimeEnd.hide();">
							</paper-input>
							<paper-tooltip>
								<i18n-msg msgid="priceReserveTimeTool">
									Amount of time to reserve on RADIUS initial/interim accounting request
								</i18n-msg>
							</paper-tooltip>
						</div>
						<div>
							<paper-input
									id="updateAddPriceCharReserveBytes"
									type="number"
									label="[[i18n.reserveBytes]]"
									value=0
									onfocus="updatePriceCharsTimeStart.hide(); updatePriceCharsTimeEnd.hide();">
							</paper-input>
							<paper-tooltip>
								<i18n-msg msgid="updatePriceReserveBytesTool">
									Amount of bytes to reserve on RADIUS initial/interim accounting request
								</i18n-msg>
							</paper-tooltip>
						</div>
						<div>
							<paper-input
									id="updateDestPrefixTariff"
									type="string"
									label="[[i18n.tariffTable]]">
							</paper-input>
							<paper-tooltip>
								<i18n-msg msgid="tariffTableTool">
									Prefix of Destination Tariff Table
								</i18n-msg>
							</paper-tooltip>
						</div>
					</iron-collapse>
					<div class="buttons">
						<paper-button
								autofocus
								id="updateProductPriceButton"
								on-tap="updateProductPrice"
								class="update-buttons"
								hidden>
								<i18n-msg msgid="update">
									Update
								</i18n-msg>
						</paper-button>
						<paper-button
								raised
								id="updateProductAddButton"
								class="add-button"
								on-tap="updateAddPrice">
								<i18n-msg msgid="add">
									Add
								</i18n-msg>
						</paper-button>
						<paper-button
								dialog-dismiss
								class="cancel-button"
								on-tap="cancelDialog">
								<i18n-msg msgid="cancel">
									Cancel
								</i18n-msg>
						</paper-button>
						<paper-button
								toggles
								raised
								on-tap="deletePrice"
								class="delete-buttons">
								<i18n-msg msgid="delete">
									Delete
								</i18n-msg>
						</paper-button>
					</div>
				</div>
				<div id="add-Alt-tab">
					<div>
						<datalist id="updateAltNames">
							<template is="dom-repeat" items="[[alterations]]">
								<option value="{{item.name}}"/>
							</template>
						</datalist>
						<paper-input id="updateAltName" 
								list="updateAltNames" 
								label="[[i18n.name]]" 
								on-value-changed="updateAddAltsDialog"
								onclick="updateAltName.value=null"
								onfocus="updateProductEndDatePickAlt.hide(); updateProductStartDatePickAlt.hide();">
						</paper-input>
						<paper-tooltip>
								offering alteration name
						</paper-tooltip>
					</div>
					<div>
						<paper-input id="updateAltDesc"
								class="description"
								name="description"
								label="[[i18n.des]]"
								onfocus="updateProductEndDatePickAlt.hide(); updateProductStartDatePickAlt.hide();">
						</paper-input>
						<paper-tooltip>
								offering alteration description
						</paper-tooltip>
					</div>
					<div>
						<iron-collapse id="updateProductStartDatePickAlt">
							<paper-date-picker id="startAlt3" date="{{updateProductStartDateAltPick}}">
							</paper-date-picker>
						</iron-collapse>
						<paper-input id="updateAltStartDate"
								value="[[updateProductStartDateAlt]]"
								name="updateProductStartDateAlt"
								label="[[i18n.start]]"
								onfocus="updateProductEndDatePickAlt.hide(); updateProductStartDatePickAlt.show();">
						</paper-input>
						<paper-tooltip>
								offering alteration start date
						</paper-tooltip>
					</div>
					<div>
						<iron-collapse id="updateProductEndDatePickAlt">
							<paper-date-picker id="endAlt3" date="{{updateProductEndDateAltPick}}">
							</paper-date-picker>
						</iron-collapse>
						<paper-input id="updateAltEndDate"
								value="[[updateProductEndDateAlt]]"
								name="updateProductEndDateAlt"
								label="[[i18n.end]]"
								onfocus="updateProductStartDatePickAlt.hide(); updateProductEndDatePickAlt.show();">
						</paper-input>
						<paper-tooltip>
								offering alteration end date
						</paper-tooltip>
					</div>
					<div>
						<paper-dropdown-menu
								id="updateAltTypedrop"
								label="[[i18n.priceType]]"
								on-selected-item-changed="checkRecureAlt"
								onfocus="updateProductEndDatePickAlt.hide(); updateProductStartDatePickAlt.hide();">
							<paper-listbox
									id="updateAltType"
									slot="dropdown-content"
									class="dropdown-content">
								<paper-item>
									Recurring
								</paper-item>
								<paper-item>
									One Time
								</paper-item>
								<paper-item>
									Usage
								</paper-item>
							</paper-listbox>
						</paper-dropdown-menu>
						<paper-tooltip>
								offering alteration price type
						</paper-tooltip>
					</div>
					<div>
						<paper-input id="updateAltSize"
								class="size"
								name="size"
								label="[[i18n.unitSize]]"
								type="text"
								allowed-pattern="[0-9kmg]"
								pattern="^[0-9]+[kmg]?$"
								auto-validate
								value=1
								onfocus="updateProductEndDatePickAlt.hide(); updateProductStartDatePickAlt.hide();">
						</paper-input>
						<paper-tooltip>
								offering alteration size
						</paper-tooltip>
					</div>
					<div>
						<paper-dropdown-menu
								label="[[i18n.unit]]">
							<paper-listbox
									id="updateUnitDrop"
									on-selected-item-changed="checkPatternAlt"
									slot="dropdown-content"
									class="dropdown-content">
									<paper-item id="altBytes">
										<i18n-msg msgid="bytes">
											Bytes
										</i18n-msg>
									</paper-item>
									<paper-item id="altCents">
										<i18n-msg msgid="cents">
											Cents
										</i18n-msg>
									</paper-item>
									<paper-item id="altSeconds">
										<i18n-msg msgid="seconds">
											Seconds
										</i18n-msg>
									</paper-item>
							</paper-listbox>
						</paper-dropdown-menu>
						<paper-tooltip>
								offering alteration units
						</paper-tooltip>
					</div>
					<div>
						<paper-input id="updateAltAmount"
								class="amount"
								name="amount"
								label="[[i18n.amount]]"
								type="text"
								allowed-pattern="[0-9.]"
                        pattern="[0-9]+\.?[0-9]{0,6}$"
								auto-validate
								value=0
								onfocus="updateProductEndDatePickAlt.hide(); updateProductStartDatePickAlt.hide();">
						</paper-input>
						<paper-tooltip>
								offering alteration amount
						</paper-tooltip>
					</div>
					<div>
						<paper-input id="updateAltCurr"
								class="currency"
								name="currency"
								label="[[i18n.currency]]"
								onfocus="updateProductEndDatePickAlt.hide(); updateProductStartDatePickAlt.hide();">
						</paper-input>
						<paper-tooltip>
								offering alteration currency
						</paper-tooltip>
					</div>
					<div>
						<paper-dropdown-menu id="addalt5drop"
								label="[[i18n.period]]"
								onfocus="updateProductEndDatePickAlt.hide(); updateProductStartDatePickAlt.hide();">
							<paper-listbox
									id="updateAltPeriod"
									slot="dropdown-content"
									class="dropdown-content"
									selected="2">
								<paper-item>
									Hourly
								</paper-item>
								<paper-item>
									Daily
								</paper-item>
								<paper-item>
									Weekly
								</paper-item>
								<paper-item>
									Monthly
								</paper-item>
								<paper-item>
									Yearly
								</paper-item>
							</paper-listbox>
						</paper-dropdown-menu>
						<paper-tooltip>
								offering alteration period
						</paper-tooltip>
					</div>
					<div class="buttons">
						<paper-button
								id="updateProductAlterationButton"
								autofocus
								on-tap="updateProductAlteration"
								class="update-buttons"
								hidden>
								<i18n-msg msgid="update">
									Update
								</i18n-msg>
						</paper-button>
						<paper-button
								raised
								id="updateAddAlterationButton"
								class="add-button"
								on-tap="updateAddAlteration">
								<i18n-msg msgid="add">
									Add
								<i18n-msg>
						</paper-button>
						<paper-button
								dialog-dismiss
								class="cancel-button"
								on-tap="cancelDialog">
								<i18n-msg msgid="cancel">
									cancel
								</i18n-msg>
						</paper-button>
						<paper-button
								toggles
								raised
								class="delete-buttons">
								<i18n-msg msgid="delete">
									Delete
								</i18n-msg>
						</paper-button>
					</div>
				</div>
			</iron-pages>
			<paper-toast
					id="updateProductToastError">
			</paper-toast>
		</paper-dialog>
		<iron-ajax
				id="updateAddProductAjax"
				url="/catalogManagement/v2/productOffering"
				method="POST"
				content-type="application/json"
				on-loading-changed="_onLoadingChanged"
				on-response="_addProductResponse"
				on-error="_addProductError">
		</iron-ajax>
		<iron-ajax
				id="updateProductOfferAjax"
				on-response="_updateProductOfferResponse"
				on-error="_updateProductOfferError">
		</iron-ajax>
		<iron-ajax
				id="updateProductPriceAjax"
				on-response="_updateProductPriceResponse"
				on-error="_updateProductPriceError">
		</iron-ajax>
		<iron-ajax
				id="deleteProductAjax"
				method="DELETE"
				on-response="_deleteProductResponse"
				on-error="_deleteProductError">
		</iron-ajax>
		<iron-ajax
				id="updateProductAlterationAjax"
				on-response="_updateProductAlterationResponse"
				on-error="_updateProductAlterationError">
		</iron-ajax>
		<iron-ajax
			id="getProductUpdateAjax"
			url="/catalogManagement/v2/productOffering"
			method="GET"
			on-response="_getProductUpdateResponse"
			on-error="_getProductsError">
		</iron-ajax>
	</template>
	<script>
		Polymer ({
			is: 'sig-offer-update',
			behaviors: [i18nMsgBehavior],
			properties: {
				alterations: {
					type: Array,
					value: function() {
						return [];
					}
				},
				prices: {
					type: Array,
					value: function() {
						return [];
					}
				},
				offers: {
					type: Array,
					value: function() {
						return [];
					}
				},
				characteristics: {
					type: Array,
				},
				selected: {
					type: Number,
					value: 0
				},
				updateProductStartDateOffer: {
					type: String,
					value: ""
				},
				updateProductEndDateOffer: {
					type: String,
					value: ""
				},
				updateProductStartDatePrice: {
					type: String,
					value: ""
				},
				updateProductEndDatePrice: {
					type: String,
					value: ""
				},
				updateProductStartDateAlt: {
					type: String,
					value: ""
				},
				updateProductEndDateAlt: {
					type: String,
					value: ""
				},
				updateProductStartDateOfferPick: {
					observer: '_updateProductStartDateOfferPick'
				},
				updateProductEndDateOfferPick: {
					observer: '_updateProductEndDateOfferPick'
				},
				updateProductStartDatePricePick: {
					observer: '_updateProductStartDatePricePick'
				},
				updateProductEndDatePricePick: {
					observer: '_updateProductEndDatePricePick'
				},
				updateProductStartDateAltPick: {
					observer: '_updateProductStartDateAltPick'
				},
				updateProductEndDateAltPick: {
					observer: '_updateProductEndDateAltPick'
				}
			},
			listeners: {
				'updateCheckIn.checked-changed': 'updateCheckInChanged',
				'updateCheckOut.checked-changed': 'updateCheckOutChanged'
			},
			initialize: function(item) {
				this.$.getProductUpdateAjax.generateRequest();
				this.$.updateProductModal.open();
				this.$.updateOffName.value = item.id;
				this.$.updateOffDesc.value = item.description;
				if(item.productSpecification && item.productSpecification.name) {
					this.$.updateOffSpec.value = item.productSpecification.name.replace("ProductSpec", "");
				}
				this.$.updateOffStart.value = item.startDate;
				this.$.updateOffEnd.value = item.endDate;
				this.characteristics = item.prodSpecCharValueUse;
				for (var indexCha in item.prodSpecCharValueUse) {
					if(item.prodSpecCharValueUse[indexCha].name == "radiusReserveSessionTime") {
						this.$.updateReserveSession.value = item.prodSpecCharValueUse[indexCha].productSpecCharacteristicValue[0].value;
					}
				}
				for(var index in item.prices) {
					var newPrice = new Object();
					newPrice.name = item.prices[index].name;
					newPrice.description = item.prices[index].description;
					if(item.prices[index].validFor) {
						newPrice.start = item.prices[index].validFor.startDateTime;
						newPrice.end = item.prices[index].validFor.endDateTime;
					}
					newPrice.priceType = item.prices[index].priceType;
					if (item.prices[index].unitOfMeasure) {
						var unitOfMeasure = item.prices[index].unitOfMeasure;
						switch(unitOfMeasure.charAt(unitOfMeasure.length - 1)) {
							case "b":
								var conv;
								conv = unitOfMeasure = parseInt(unitOfMeasure.slice(0, -1));
								newPrice.size = conv.toString();
								newPrice.unit = "b";
								break;
							case "s":
								var conv1;
								conv1 = parseInt(unitOfMeasure.slice(0, -1));
								newPrice.size = conv1.toString();
								newPrice.unit = "s";
								break;
						}
					}
					if(item.prices[index].price) {
						newPrice.currency = item.prices[index].price.currencyCode;
						newPrice.amount = item.prices[index].price.taxIncludedAmount;
					}
					var prodPrice = item.prices[index];
					if(prodPrice.prodSpecCharValueUse) {
						var specChar = new Array();
						for (var indexChar in prodPrice.prodSpecCharValueUse) {
							if(prodPrice.prodSpecCharValueUse[indexChar].name == "radiusReserveTime") {
								specChar[indexChar] = {name: "radiusReserveTime", value: prodPrice.prodSpecCharValueUse[indexChar].productSpecCharacteristicValue[0].value};
							}
							if(prodPrice.prodSpecCharValueUse[indexChar].name == "radiusReserveOctets") {
								specChar[indexChar] = {name: "radiusReserveOctets", value: prodPrice.prodSpecCharValueUse[indexChar].productSpecCharacteristicValue[0].value};
							}
							if(prodPrice.prodSpecCharValueUse[indexChar].name == "timeOfDayRange") {
								specChar[indexChar] = {name: "timeOfDayRange", value: prodPrice.prodSpecCharValueUse[indexChar].productSpecCharacteristicValue[0].value};
							}
							if(prodPrice.prodSpecCharValueUse[indexChar].name == "callDirection") {
								specChar[indexChar] = {name: "callDirection", value: prodPrice.prodSpecCharValueUse[indexChar].productSpecCharacteristicValue[0].value};
							}
							if(prodPrice.prodSpecCharValueUse[indexChar].name == "destPrefixTariffTable") {
								specChar[indexChar] = {name: "destPrefixTariffTable", value: prodPrice.prodSpecCharValueUse[indexChar].productSpecCharacteristicValue[0].value};
							}
						}
					}
					newPrice.prodSpecCharValueUse = specChar;
					newPrice.period = item.prices[index].recurringChargePeriod;
					if(item.prices[index].productOfferPriceAlteration) {
						var altName = item.prices[index].productOfferPriceAlteration.name;
						function checkAlt1(alt) {
							return alt.name == altName;
						}
						var altIndex = this.alterations.findIndex(checkAlt1);
						if(altIndex == -1) {
							var newAlt = new Object();
							newAlt.name = item.prices[index].productOfferPriceAlteration.name;
							newAlt.description = item.prices[index].productOfferPriceAlteration.description;
							if(item.prices[index].validFor) {
								newAlt.start = item.prices[index].productOfferPriceAlteration.validFor.startDateTime;
								newAlt.end = item.prices[index].productOfferPriceAlteration.validFor.endDateTime;
							}
							newAlt.priceType = item.prices[index].productOfferPriceAlteration.priceType;
							if (item.prices[index].productOfferPriceAlteration.unitOfMeasure) {
								var unitOfMeasure = item.prices[index].productOfferPriceAlteration.unitOfMeasure;
								switch(unitOfMeasure.charAt(unitOfMeasure.length - 1)) {
									case "b":
										newAlt.size = parseInt(unitOfMeasure.slice(0, -1));
										newAlt.unit = "b";
										break;
									case "s":
										newAlt.size = parseInt(unitOfMeasure.slice(0, -1));
										newAlt.unit = "s";
										break;
									default:
										newAlt.unit = "c";
								}
							}
							if(item.prices[index].productOfferPriceAlteration.price) {
								newAlt.currency = item.prices[index].productOfferPriceAlteration.price.currencyCode;
								newAlt.amount = item.prices[index].productOfferPriceAlteration.price.taxIncludedAmount;
							}
							newAlt.period = item.prices[index].productOfferPriceAlteration.recurringChargePeriod;
							this.push('alterations', newAlt);
							newPrice.alteration = newAlt.name;
						}
					}
					function checkExist(price) {
                  return price.name == item.prices[index].name;
               }
					if(!this.prices.some(checkExist)) {
						this.push('prices', newPrice);
					}
				} 
			},
			_getProductUpdateResponse: function(event) {
				var results = event.detail.xhr.response;
				function checkExist(spec) {
					return spec.name == results[index].name;
				}
				for (var index in results) {
					if(!this.offers.some(checkExist)) {
						var product = new Object();
						product.id = results[index].id;
						product.href = results[index].href;
						product.name = results[index].name;
						product.checked = false;
						this.push('offers', product);
					}
				}
				var bundle = document.getElementById("offerGrid").activeItem.bundledProductOffering;
				for(var indexBun in bundle) {
					function checkExist1(prod) {
						return prod.name == bundle[indexBun].name;
					}
					var ind = this.offers.findIndex(checkExist1);
					if (ind != -1) {
						this.offers[ind].checked = true;
					}
				}
			},
			_updateProductStartDateOfferPick: function(date) {
				if (this.$.updateProductStartDatePickUpdateOff.opened) {
					this.updateProductStartDateOffer = moment(date).format('YYYY-MM-DD');
				}
			},
			_updateProductEndDateOfferPick: function(date) {
				if (this.$.updateProductEndDatePickUpdateOff.opened) {
					this.updateProductEndDateOffer = moment(date).format('YYYY-MM-DD');
				}
			},
			_updateProductStartDatePricePick: function(date) {
				if (this.$.updateProductStartDatePickPrice.opened) {
					this.updateProductStartDatePrice = moment(date).format('YYYY-MM-DD');
				}
			},
			_updateProductEndDatePricePick: function(date) {
				if (this.$.updateProductEndDatePickPrice.opened) {
					this.updateProductEndDatePrice = moment(date).format('YYYY-MM-DD');
				}
			},
			_updateProductStartDateAltPick: function(date) {
				if (this.$.updateProductStartDatePickAlt.opened) {
					this.updateProductStartDateAlt = moment(date).format('YYYY-MM-DD');
				}
			},
			_updateProductEndDateAltPick: function(date) {
				if (this.$.updateProductEndDatePickAlt.opened) {
					this.updateProductEndDateAlt = moment(date).format('YYYY-MM-DD');
				}
			},
			_updateOnClickOfferChars: function() {
				if(this.$.updateAddPriceOfferChars.opened == false) {
					this.$.updateAddPriceOfferChars.show();
					this.$.updateOnClickOfferChars.icon="arrow-drop-up"
				} else {
					this.$.updateAddPriceOfferChars.hide();
					this.$.updateOnClickOfferChars.icon="arrow-drop-down"
				}
			},
			_updateOnClickChars: function() {
				if(this.$.updateAddPriceChars.opened == false) {
					this.$.updateAddPriceChars.show();
					this.$.updateOnClickChars.icon="arrow-drop-up"
				} else {
					this.$.updateAddPriceChars.hide();
					this.$.updateOnClickChars.icon="arrow-drop-down"
				}
			},
			_updateOnClickCharsTime: function() {
				if(this.$.updatePriceCharsTime.opened == false) {
					this.$.updatePriceCharsTime.show();
					this.$.updateOnClickCharsTime.icon="arrow-drop-up"
				} else {
					this.$.updatePriceCharsTime.hide();
					this.$.updateOnClickCharsTime.icon="arrow-drop-down"
				}
			},
			_updateOnClickCall: function() {
				if(this.$.updateAddCall.opened == false) {
					this.$.updateAddCall.show();
					this.$.updateOnClickCall.icon="arrow-drop-up"
				} else {
					this.$.updateAddCall.hide();
					this.$.updateOnClickCall.icon="arrow-drop-down"
				}
			},
			updateCheckInChanged: function(event) {
				if(event.detail.value) {
					this.$.updateCheckOut.checked = false;
				}
			},
			updateCheckOutChanged: function(event) {
				if(event.detail.value) {
					this.$.updateCheckIn.checked = false;
				}
			},
			_onClickBundleUpdate: function() {
				if(this.$.addBundleUpdate.opened == false) {
					this.$.addBundleUpdate.show();
					this.$.onClickBundleUpdate.icon="arrow-drop-up";
				} else {
					this.$.addBundleUpdate.hide();
					this.$.onClickBundleUpdate.icon="arrow-drop-down";
				}
			},
			updatePriceDialog: function() {
				function checkUpdatePriceName(updatePrice) {
					return updatePrice.name == document.getElementById("updatePriceName").value;
				}
				if(this.prices != undefined) {
					var indexUpdatePrice = this.prices.findIndex(checkUpdatePriceName);
					if(indexUpdatePrice != -1) {
						this.$.updateProductAddButton.hidden = true;
						this.$.updateProductPriceButton.hidden = false;
					} else {
						this.$.updateProductAddButton.hidden = false;
						this.$.updateProductPriceButton.hidden = true;
					}
					if (indexUpdatePrice == -1) {
						this.$.updatePriceDesc.value = null;
						this.$.updatePriceStartDate.value = null;
						this.$.updatePriceEndDate.value = null;
						this.$.updatePriceType.selected = null;
						this.$.updatePriceSize.value = null;
						this.$.updatePriceUnits.selected = null;
						this.$.updatePriceAmount.value = null;
						this.$.updatePriceCurrency.value = null;
						this.$.updatePricePeriod.selected = null;
						this.$.updateAddPriceCharReserveTime.value = null;
						this.$.updateAddPriceCharReserveBytes.value = null;
						this.$.updateDestPrefixTariff.value = null;
						this.$.updateReserveSession.value = null;
						this.$.updateDestPrefixTariff.value = null;
						this.$.updateTimeOfDayStart.value = null;
						this.$.updateTimeOfDayEnd.value = null;
						this.$.updateCheckIn.checked = false;
						this.$.updateCheckOut.checked = false;
						this.$.addUpdatePriceAlteration.selected = null;
					} else {
						this.$.updatePriceDesc.value = this.prices[indexUpdatePrice].description;
						if(this.prices[indexUpdatePrice].start || this.prices[indexUpdatePrice].end) {
							this.$.updatePriceStartDate.value = this.prices[indexUpdatePrice].start;
							this.$.updatePriceEndDate.value = this.prices[indexUpdatePrice].end;
						}
						switch(this.prices[indexUpdatePrice].priceType) {
							case "recurring":
								this.$.updatePriceType.selected = 0;
								break;
							case "one_time":
								this.$.updatePriceType.selected = 1;
								break;
							case "usage":
								this.$.updatePriceType.selected = 2;
								break;
							case "tariff":
								this.$.updatePriceType.selected = 3;
								break;
						}
						this.$.updatePriceSize.value = this.prices[indexUpdatePrice].size;
						switch(this.prices[indexUpdatePrice].unit) {
							case "b":
								this.$.updatePriceUnits.selected = 0;
								break;
							case "c":
								this.$.updatePriceUnits.selected = 1;
								break;
							case "s":
								this.$.updatePriceUnits.selected = 2;
								break;
						}
						if(this.prices[indexUpdatePrice].currency || this.prices[indexUpdatePrice].amount) {
							this.$.updatePriceCurrency.value = this.prices[indexUpdatePrice].currency;
							this.$.updatePriceAmount.value = this.prices[indexUpdatePrice].amount;
						}
						switch(this.prices[indexUpdatePrice].period) {
							case "hourly":
								this.$.updatePricePeriod.selected = 0;
								break;
							case "daily":
								this.$.updatePricePeriod.selected = 1;
								break;
							case "weekly":
								this.$.updatePricePeriod.selected = 2;
								break;
							case "monthly":
								this.$.updatePricePeriod.selected = 3;
								break;
							case "yearly":
								this.$.updatePricePeriod.selected = 4;
								break;
						}
						var Obj = this.prices[indexUpdatePrice].alteration;
						if(this.prices[indexUpdatePrice].alteration) {
							function checkAlt1(updatePriceNames) {
								return updatePriceNames.name == Obj; 
							}
							this.$.addUpdatePriceAlteration.selected = this.alterations.findIndex(checkAlt1);
						}
						var prodPriceUpdate = this.prices[indexUpdatePrice];
						if(prodPriceUpdate.prodSpecCharValueUse) {
							for (var indexCharVal in prodPriceUpdate.prodSpecCharValueUse) {
								if(prodPriceUpdate.prodSpecCharValueUse[indexCharVal].name == "destPrefixTariffTable") {
									this.$.updateDestPrefixTariff.value = prodPriceUpdate.prodSpecCharValueUse[indexCharVal].value;
								}
								if(prodPriceUpdate.prodSpecCharValueUse[indexCharVal].name == "radiusReserveTime") {
									this.$.updateAddPriceCharReserveTime.value = prodPriceUpdate.prodSpecCharValueUse[indexCharVal].value;
								}
								if(prodPriceUpdate.prodSpecCharValueUse[indexCharVal].name == "radiusReserveOctets") {
									this.$.updateAddPriceCharReserveBytes.value = prodPriceUpdate.prodSpecCharValueUse[indexCharVal].value;
								}
								if(prodPriceUpdate.prodSpecCharValueUse[indexCharVal].name == "timeOfDayRange") {
									this.$.updateTimeOfDayStart.value = prodPriceUpdate.prodSpecCharValueUse[indexCharVal].value.lowerValue.amount;
									this.$.updateTimeOfDayEnd.value = prodPriceUpdate.prodSpecCharValueUse[indexCharVal].value.upperValue.amount;
								}
								if(prodPriceUpdate.prodSpecCharValueUse[indexCharVal].name == "callDirection") {
									if(prodPriceUpdate.prodSpecCharValueUse[indexCharVal].value == "originate") {
										this.$.updateCheckOut.checked = prodPriceUpdate.prodSpecCharValueUse[indexCharVal].value;
									} else if(prodPriceUpdate.prodSpecCharValueUse[indexCharVal].value == "answer") {
										this.$.updateCheckIn.checked = prodPriceUpdate.prodSpecCharValueUse[indexCharVal].value;
									}
								}
							}
						}
					}
				}
			},
			updateAddAltsDialog: function() {
				if(this.alterations != undefined) {
					function checkUpdateAltName(updateAlts) {
						return updateAlts.name == document.getElementById("updateAltName").value;
					}
					var indexAlt = this.alterations.findIndex(checkUpdateAltName);
					if(indexAlt != -1) {
						this.$.updateAddAlterationButton.hidden = true;
						this.$.updateProductAlterationButton.hidden = false;
					} else {
						this.$.updateAddAlterationButton.hidden = false;
						this.$.updateProductAlterationButton.hidden = true;
					}
					if (indexAlt == -1) {
						this.$.updateAltDesc.value = null;
						this.$.updateAltStartDate.value = null;
						this.$.updateAltEndDate.value = null;
						this.$.updateAltType.selected = null;
						this.$.updateAltSize.value = null;
						this.$.updateUnitDrop.selected = null;
						this.$.updateAltAmount.value = null;
						this.$.updateAltCurr.value = null;
						this.$.updateAltPeriod.selected = null;
					} else {
						this.$.updateAltDesc.value = this.alterations[indexAlt].description;
						if(this.alterations[indexAlt].start || this.alterations[indexAlt].end) {
							this.$.updateAltStartDate.value = this.alterations[indexAlt].start;
							this.$.updateAltEndDate.value = this.alterations[indexAlt].end;
						}
						switch(this.alterations[indexAlt].priceType) {
							case "recurring":
								this.$.updateAltType.selected = 0;
								break;
							case "one_time":
								this.$.updateAltType.selected = 1;
								break;
							case "usage":
								this.$.updateAltType.selected = 2;
								break;
						}
						this.$.updateAltSize.value = this.alterations[indexAlt].size;
						switch(this.alterations[indexAlt].unit) {
							case "b":
								this.$.updateUnitDrop.selected = 0;
								break;
							case "c":
								this.$.updateUnitDrop.selected = 1;
								break;
							case "s":
								this.$.updateUnitDrop.selected = 2;
								break;
						}
						if(this.alterations[indexAlt].currency || this.alterations[indexAlt].amount) {
							this.$.updateAltCurr.value = this.alterations[indexAlt].currency;
							this.$.updateAltAmount.value = this.alterations[indexAlt].amount;
						}
						switch(this.alterations[indexAlt].period) {
							case "hourly":
								this.$.updateAltPeriod.selected = 0;
								break;
							case "daily":
								this.$.updateAltPeriod.selected = 1;
								break;
							case "weekly":
								this.$.updateAltPeriod.selected = 2;
								break;
							case "monthly":
								this.$.updateAltPeriod.selected = 3;
								break;
							case "yearly":
								this.$.updateAltPeriod.selected = 4;
								break;
						}
					}
				}
			},
			updateProductOffer: function(event) {
				var ajax =  this.$.updateProductOfferAjax;
				ajax.method = "PATCH";
				ajax.contentType = "application/json-patch+json";
				ajax.url = "/catalogManagement/v2/productOffering/" + this.$.updateOffName.value; 
				var offerNew = new Array();
				if(this.$.updateOffDesc.value) {
					var offerDesc = new Object();
					offerDesc.op = "add";
					offerDesc.path = "/description";
					offerDesc.value = this.$.updateOffDesc.value;
					offerNew.push(offerDesc);
				}
				if(this.$.updateOffStart.value) {
					var startDateTimeObject = new Object();
					startDateTimeObject.op = "add";
					startDateTimeObject.path = "/validFor/startDateTime";
					startDateTimeObject.value = this.$.updateOffStart.value;
					offerNew.push(startDateTimeObject);
				}
				if(this.$.updateOffEnd.value) {
					var endDateTimeObject = new Object();
					endDateTimeObject.op = "add";
					endDateTimeObject.path = "/validFor/endDateTime";
					endDateTimeObject.value = this.$.updateOffEnd.value;
					offerNew.push(endDateTimeObject);
				}
				if(this.$.updateReserveSession.value) {
					function checkName(char) {
						return char.name == "radiusReserveSessionTime";
					}
					var res = this.characteristics.findIndex(checkName);
					if(res == -1) {
						indexChar = "-";
						var reserveSession = new Object();
						reserveSession.op = "add";
						reserveSession.path = "/prodSpecCharValueUse/" + indexChar; 
						var session2Arr = new Array();
						var session2 = new Object();
						session2.default = true;
						session2.value = parseInt(this.$.updateReserveSession.value);
						session2Arr.push(session2);
						var session1 = new Object();
						session1.name = "radiusReserveSessionTime";
						session1.minCardinality = 0;
						session1.maxCardinality = 1;
						session1.productSpecCharacteristicValue = session2Arr;
						var session2 = new Object();
						session2.id = "1";
						session2.href = "/catalogManagement/v2/productSpecification/1";
						session1.productSpecification = session2;
						reserveSession.value = session1;
						offerNew.push(reserveSession);
					} else {
						indexChar = res.toString();
						var reserveSession = new Object();
						reserveSession.op = "add";
						reserveSession.path = "/prodSpecCharValueUse/" + indexChar + "/productSpecCharacteristicValue/0/value";
						reserveSession.value = parseInt(this.$.updateReserveSession.value);
						offerNew.push(reserveSession);
					}
				}
				ajax.body = JSON.stringify(offerNew);
				ajax.generateRequest();
			},
			_updateProductOfferResponse: function(event) {
				this.$.updateProductModal.close();
				document.getElementById("offerGrid").clearCache();
				var listOffer = document.getElementsByClassName("bundleCheck");
				Array.prototype.forEach.call(listOffer, function(ell) {
					if(ell.checked == true) {
						ell.checked = false;
					}
				});
			},
			_updateProductOfferError: function(event) {
				this.$.updateProductToastError.text = event.detail.request.xhr.statusText;
				this.$.updateProductToastError.open();
			},
			updateProductPrice: function(event) {
				var ajax =  this.$.updateProductPriceAjax;
				ajax.method = "PATCH";
				ajax.contentType = "application/json-patch+json";
				ajax.url = "/catalogManagement/v2/productOffering/" + this.$.updateOffName.value; 
				var updatePriceNew = new Array();
				function checkName(price) {
					return price.name == document.getElementById("updatePriceName").value;
				}
				var indexPrices = this.prices.findIndex(checkName);
				if(this.$.updatePriceDesc.value) {
					var priceDesc = new Object();
					priceDesc.op = "add";
					priceDesc.path = "/productOfferingPrice/" + indexPrices + "/description";
					priceDesc.value = this.$.updatePriceDesc.value;
					updatePriceNew.push(priceDesc);
				}
				if(this.$.updatePriceTypedrop.value) {
					var pricetype = new Object();
					pricetype.op = "add";
					pricetype.path = "/productOfferingPrice/" + indexPrices + "/priceType";
					switch(this.$.updatePriceType.selected) {
						case 0:
							pricetype.value = "recurring";
							break;
						case 1:
							pricetype.value = "one_time";
							break;
						case 2:
							pricetype.value = "usage";
							break;
						case 3:
							pricetype.value = "tariff";
							break;
					}
					updatePriceNew.push(pricetype);
				} 
				if(this.$.updatePriceSize.value) {
					var priceSize = new Object();
					priceSize.op = "add";
					priceSize.path = "/productOfferingPrice/" + indexPrices + "/unitOfMeasure";
					for(var indexUnit in this.prices) {
						if(this.$.updatePriceUnitsdrop.value == "Seconds") {
							this.prices[indexUnit].unit = "s";
						}
						if(this.$.updatePriceUnitsdrop.value == "Bytes") {
							this.prices[indexUnit].unit = "b";
						}
						var unitDrop = this.prices[indexUnit].unit;
						var sizeVal = this.$.updatePriceSize.value + unitDrop;
						if(unitDrop && sizeVal) {
							var len = sizeVal.length;
							var m = sizeVal.charAt(len - 1);
							if(isNaN(parseInt(m))) {
								var s = sizeVal.slice(0, (len - 1));
							} else {
								var s = sizeVal.size;
							}
							if(unitDrop == "b") {
								if (m == "m") {
									priceSize.value = s + "000000b";
								} else if(m == "g") {
									priceSize.value = s + "000000000b";
								} else if(m == "k") {
									priceSize.value = s + "000b";
								} else {
									priceSize.value = s + "b";
								}
							} else if(unitDrop == "s") {
								var n = Number(s);
								if(m == "m") {
									n = n * 60;
									priceSize.value = n.toString() + "s";
								} else if(m == "h") {
									n = n * 3600;
									priceSize.value = n.toString() + "s";
								} else {
									priceSize.value = n.toString() + "s";
								}
							}
						}
						updatePriceNew.push(priceSize);
					}
				}
				if(this.$.updatePriceAmount.value) {
					var priceAmount = new Object();
					priceAmount.op = "add";
					priceAmount.path = "/productOfferingPrice/" + indexPrices + "/price/taxIncludedAmount";
					priceAmount.value = this.$.updatePriceAmount.value;
					updatePriceNew.push(priceAmount);
				}
				if(this.$.updatePricePerioddrop.value && !this.$.updatePricePerioddrop.disabled) {
					var priceCharge = new Object();
					priceCharge.op = "add";
					priceCharge.path = "/productOfferingPrice/" + indexPrices + "/recurringChargePeriod";
					switch(this.$.updatePricePeriod.selected) {
						case 0:
							priceCharge.value = "hourly";
							break;
						case 1:
							priceCharge.value = "daily";
							break;
						case 2:
							priceCharge.value = "weekly";
							break;
						case 3:
							priceCharge.value = "monthly";
							break;
						case 4:
							priceCharge.value = "yearly";
					}
					updatePriceNew.push(priceCharge);
				} 
				if(this.$.updateAddPriceCharReserveTime.value) {
					function checkChar1(charVal) {
						return charVal.name == "radiusReserveTime";
					}
					var res = this.prices[indexPrices].prodSpecCharValueUse.findIndex(checkChar1);
					if(res == -1) {
						indexChar = "-";
						var charReserve = new Object();
						charReserve.op = "add";
						charReserve.path = "/productOfferingPrice/" + indexPrices + "/prodSpecCharValueUse/" + indexChar;
						var resTime1 = new Object();
						resTime1.name = "radiusReserveTime";
						resTime1.valueType = "Number";
						resTime1.minCardinality = 1;
						resTime1.maxCardinality = 1;
						var resTime2Arr = new Array();
						var resTime2 = new Object();
						resTime2.unitOfMeasure = "seconds";
						resTime2.default = true;
						resTime2.value = this.$.updateAddPriceCharReserveTime.value;
						resTime2Arr.push(resTime2);
						resTime1.productSpecCharacteristicValue = resTime2Arr;
						var resTime3 = new Object();
						resTime3.id = "4";
						resTime3.href = "/catalogManagement/v2/productSpecification/4";
						resTime1.productSpecification = resTime3;
						charReserve.value = resTime1;
						updatePriceNew.push(charReserve);
					} else {
						indexChar = res.toString();
						var charReserve = new Object();
						charReserve.op = "add";
						charReserve.path = "/productOfferingPrice/" + indexPrices + "/prodSpecCharValueUse/" + indexChar + "/productSpecCharacteristicValue/0/value";
						charReserve.value = this.$.updateAddPriceCharReserveTime.value;
						updatePriceNew.push(charReserve);
					}
				}
				if(this.$.updateDestPrefixTariff.value) {
					function checkName(char) {
						return char.name == "destPrefixTariffTable";
					}
					var res = this.prices[indexPrices].prodSpecCharValueUse.findIndex(checkName);
					if(res == -1) {
						indexCharPrices = "-";
						var destTariff = new Object();
						destTariff.op = "add";
						destTariff.path = "/productOfferingPrice/" + indexPrices + "/prodSpecCharValueUse/" + indexCharPrices;
						var tariff1 = new Object();
						tariff1.name = "destPrefixTariffTable";
						tariff1.minCardinality = 0;
						tariff1.maxCardinality = 1;
						var tariff2Arr = new Array();
						var tariff2 = new Object();
						tariff2.default = true;
						tariff2.value = this.$.updateDestPrefixTariff.value;
						tariff2Arr.push(tariff2);
						tariff1.productSpecCharacteristicValue = tariff2Arr;
						var tariff3 = new Object();
						tariff3.id = "3";
						tariff3.href = "/catalogManagement/v2/productSpecification/3";
						tariff1.productSpecification = tariff3;
						destTariff.value = tariff1;
						updatePriceNew.push(destTariff);
					} else {
						indexCharPrices = res.toString();
						var destTariff = new Object();
						destTariff.op = "add";
						destTariff.path = "/productOfferingPrice/" + indexPrices + "/prodSpecCharValueUse/" + indexCharPrices + "/productSpecCharacteristicValue/0/value";
						destTariff.value = this.$.updateDestPrefixTariff.value;
						updatePriceNew.push(destTariff);
					}
				}
				if(this.$.updateAddPriceCharReserveBytes.value) {
					function checkChar1(charVal) {
						return charVal.name == "radiusReserveOctets";
					}
					var res = this.prices[indexPrices].prodSpecCharValueUse.findIndex(checkChar1);
					if(res == -1) {
						indexChar1 = "-";
						var charResBytes = new Object();
						charResBytes.op = "add";
						charResBytes.path = "/productOfferingPrice/" + indexPrices + "/prodSpecCharValueUse/" + indexChar1;
						var resByte1 = new Object();
						resByte1.name = "radiusReserveOctets";
						resByte1.valueType = "Number";
						resByte1.minCardinality = 1;
						resByte1.maxCardinality = 1;
						var resByte2Arr = new Array();
						var resByte2 = new Object();
						resByte2.unitOfMeasure = "octets";
						resByte2.default = true;
						resByte2.value = this.$.updateAddPriceCharReserveBytes.value;
						resByte1.productSpecCharacteristicValue = resByte2Arr;
						var resByte3 = new Object();
						resByte3.id = "4";
						resByte3.href = "/catalogManagement/v2/productSpecification/4";
						resByte1.productSpecification = resByte3;
						resByte2Arr.push(resByte2);
						charResBytes.value = resByte1; 
						updatePriceNew.push(charResBytes);
					} else {
						indexChar1 = res.toString();
						var charResBytes = new Object();
						charResBytes.op = "add";
						charResBytes.path = "/productOfferingPrice/" + indexPrices + "/prodSpecCharValueUse/" + indexChar1 + "/productSpecCharacteristicValue/0/value";
						charResBytes.value = this.$.updateAddPriceCharReserveBytes.value;
						updatePriceNew.push(charResBytes);
					}
				}
				if(this.$.updateCheckIn.checked || this.$.updateCheckOut.checked) {
					function checkCall1(callVal) {
						return callVal.name == "callDirection";
					}
					var res = this.prices[indexPrices].prodSpecCharValueUse.findIndex(checkCall1);
					if(res == -1) {
						indexCall1 = "-";
						var call = new Object();
						call.op = "add";
						call.path = "/productOfferingPrice/" + indexPrices + "/prodSpecCharValueUse/" + indexCall1;
						var callDir1 = new Object();
						callDir1.name = "callDirection";
						callDir1.minCardinality = 1;
						callDir1.maxCardinality = 1;
						var callDir2Arr = new Array();
						var callDir2 = new Object();
						callDir2.default = true;
						if(this.$.updateCheckIn.checked) {
							callDir2.value = "answer";
						} else if(this.$.updateCheckOut.checked) {
							callDir2.value = "originate";
						}
						callDir2Arr.push(callDir2);
						callDir1.productSpecCharacteristicValue = callDir2Arr;
						var callDir3 = new Object();
						callDir3.id = "5";
						callDir3.href = "/catalogManagement/v2/productSpecification/5";
						callDir1.productSpecification = callDir3;
						call.value = callDir1;
						updatePriceNew.push(call);
					} else {
						indexCall1 = res.toString();
						var call = new Object();
						call.op = "add";
						call.path = "/productOfferingPrice/" + indexPrices + "/prodSpecCharValueUse/" + indexCall1 + "/productSpecCharacteristicValue/0/value";
						if(this.$.updateCheckIn.checked) {
							call.value = "answer";
						} else if(this.$.updateCheckOut.checked) {
							call.value = "originate";
						}
						updatePriceNew.push(call);
					}
				}
				if(this.$.updateTimeOfDayStart.value ||
						this.$.updateTimeOfDayEnd.value ||
						(this.$.updateTimeOfDayStart.value &&
						this.$.updateTimeOfDayEnd.value)) {
					function checkChar1(charVal) {
						return charVal.name == "timeOfDayRange";
					}
					var res = this.prices[indexPrices].prodSpecCharValueUse.findIndex(checkChar1);
					if(res == -1) {
						indexChar2 = "-";
						var timeDay = new Object();
						timeDay.op = "add";
						timeDay.path = "/productOfferingPrice/" + indexPrices + "/prodSpecCharValueUse/" + indexChar2;
						var timeRange1 = new Object();
						timeRange1.name = "timeOfDayRange";
						timeRange1.valueType = "Range";
						timeRange1.minCardinality = 0;
						timeRange1.maxCardinality = 1;
						var timeRangeArr = new Array();
						var timeRange2 = new Object();
						var timeRange3 = new Object();
						var timeRangeLower = new Object();
						timeRangeLower.amount = this.$.updateTimePickerStart.rawValue;
						timeRangeLower.units = "minutes";
						timeRange3.lowerValue = timeRangeLower;
						var timeRangeUpper = new Object();
						timeRangeUpper.amount = this.$.updateTimePickerEnd.rawValue;
						timeRangeUpper.units = "minutes";
						timeRange3.upperValue = timeRangeUpper;
						timeRange2.value = timeRange3;
						timeRange1.productSpecCharacteristicValue = timeRangeArr;
						timeRangeArr.push(timeRange2);
						timeDay.value = timeRange1;
						updatePriceNew.push(timeDay);
					} else {
						indexChar2 = res.toString();
						var timeDay1 = new Object();
						timeDay1.op = "add";
						timeDay1.path = "/productOfferingPrice/" + indexPrices + "/prodSpecCharValueUse/" + indexChar2 + "/productSpecCharacteristicValue/0/value/lowerValue/amount";
						timeDay1.value = this.$.updateTimePickerStart.rawValue;
						updatePriceNew.push(timeDay1);
						var timeDayEnd = new Object();
						timeDayEnd.op = "add";
						timeDayEnd.path = "/productOfferingPrice/" + indexPrices + "/prodSpecCharValueUse/" + indexChar2 + "/productSpecCharacteristicValue/0/value/upperValue/amount";
						timeDayEnd.value = this.$.updateTimePickerEnd.rawValue;
						updatePriceNew.push(timeDayEnd);
					}
				}
				ajax.body = JSON.stringify(updatePriceNew);
				ajax.generateRequest();
				this.$.updatePriceDesc.value = null;
				this.$.updatePriceSize.value = null;
				this.$.updatePriceTypedrop.value = null;
				this.$.updatePricePerioddrop.value = null;
				this.$.updateAddPriceCharReserveTime.value = null;
				this.$.updateDestPrefixTariff.value = null;
				this.$.updateAddPriceCharReserveBytes.value = null;
				this.$.updateCheckIn.checked = false;
				this.$.updateCheckOut.checked = false;
				this.$.updateTimeOfDayStart.value = null;
				this.$.updateTimeOfDayEnd.value = null;
				this.$.updatePriceAmount.value = null;
				this.$.updatePriceUnitsdrop.value = null;
			}, 
			_updateProductPriceResponse: function(event) {
				this.$.updateProductModal.close();
				document.getElementById("offerGrid").clearCache();
			},
			_updateProductPriceError: function(event) {
				this.$.updateProductToastError.text = event.detail.request.xhr.statusText;
				this.$.updateProductToastError.open();
			},
			updateProductAlteration: function(event) {
				var ajax =  this.$.updateProductAlterationAjax;
				ajax.method = "PATCH";
				ajax.contentType = "application/json-patch+json";
				ajax.url = "/catalogManagement/v2/productOffering/" + this.$.updateOffName.value; 
				var updateAlterationNew = new Array();
				function checkAlterationName(alts) {
					return alts.name == document.getElementById("updateAltName").value;
				}
				var indexAlt = this.alterations.findIndex(checkAlterationName);
				if(this.$.updateAltName.value != this.alterations[indexAlt].name) {
					var alterationName = new Object();
					alterationName.op = "add";
					alterationName.path = "/productOfferingPrice/" + indexAlt + "/productOfferPriceAlteration/name";
					alterationName.value = this.$.updateAltName.value;
					updateAlterationNew.push(alterationName);
				}
				if(this.$.updateAltDesc.value != this.alterations[indexAlt].description) {
					var alterationDesc = new Object();
					alterationDesc.op = "add";
					alterationDesc.path = "/productOfferingPrice/" + indexAlt + "/productOfferPriceAlteration/description";
					alterationDesc.value = this.$.updateAltDesc.value;
					updateAlterationNew.push(alterationDesc);
				}
				if(this.$.updateAltTypedrop.value != this.alterations[indexAlt].priceType) {
					var alterationType = new Object();
					alterationType.op = "add";
					alterationType.path = "/productOfferingPrice/" + indexAlt + "/productOfferPriceAlteration/priceType";
					switch(this.$.updateAltTypedrop.selected) {
						case 0:
							alterationType.value = "recurring";
							break;
						case 1:
							alterationType.value = "one_time";
							break;
						case 2:
							alterationType.value = "usage";
					}
					updateAlterationNew.push(alterationType);
				}
				if(this.$.updateAltSize.value != this.alterations[indexAlt].unitOfMeasure) {
					var alterationSize = new Object();
					alterationSize.op = "add";
					alterationSize.path = "/productOfferingPrice/" + indexAlt + "/productOfferPriceAlteration/unitOfMeasure";
					alterationSize.value = this.$.updateAltSize.value;
					updateAlterationNew.push(alterationSize);
				}
				ajax.body = JSON.stringify(updateAlterationNew);
				ajax.generateRequest();
			},
			_updateProductAlterationResponse: function(event) {
				this.$.updateProductModal.close();
				document.getElementById("offerGrid").clearCache();
			},
			_updateProductAlterationError: function(event) {
				this.$.updateProductToastError.text = event.detail.request.xhr.statusText;
				this.$.updateProductToastError.open();
			},
			checkPattern: function() {
				if(this.$.updatePriceUnits.selected == 0) {
					this.$.updatePriceSize.allowedPattern = "[0-9kmg]";
					this.$.updatePriceSize.pattern = "^[0-9]+[kmg]?$";
					this.$.updatePriceSize.disabled = false;
					this.$.updateAddPriceCharReserveBytes.disabled = false;
					this.$.updateAddPriceCharReserveTime.disabled = true;
				} else if(this.$.updatePriceUnits.selected == 1) {
					this.$.updatePriceSize.allowedPattern = "[0-9]";
					this.$.updatePriceSize.pattern = "^[0-9]+$";
					this.$.updatePriceSize.disabled = true;
				} else if(this.$.updatePriceUnits.selected == 2) {
					this.$.updatePriceSize.allowedPattern = "[0-9mh]";
					this.$.updatePriceSize.pattern = "^[0-9]+[mh]?$";
					this.$.updateAddPriceCharReserveTime.disabled = false;
					this.$.updateAddPriceCharReserveBytes.disabled = true;
					this.$.updatePriceSize.disabled = false;
				}
			},
			checkPatternAlt: function() {
				if(this.$.updateUnitDrop.selected == 0) {
					this.$.updateAltSize.allowedPattern = "[0-9kmg]";
					this.$.updateAltSize.pattern = "^[0-9]+[kmg]?$";
				} else if(this.$.updateUnitDrop.selected == 1) {
					this.$.updateAltSize.allowedPattern = "[0-9]";
					this.$.updateAltSize.pattern = "^[0-9]+$";
				} else if(this.$.updateUnitDrop.selected == 2) {
					this.$.updateAltSize.allowedPattern = "[0-9mh]";
					this.$.updateAltSize.pattern = "^[0-9]+[mh]?$";
				}
			},
			checkRecure: function() {
				if(this.$.updatePriceType.selected == 0) {
					this.$.updatePricePerioddrop.disabled = false;
					this.$.priceBytes.disabled = true;
					this.$.priceSeconds.disabled = true;
					this.$.priceCents.disabled = false;
					this.$.updateAddPriceCharReserveTime.disabled = true;
					this.$.updateAddPriceCharReserveBytes.disabled = true;
					this.$.updatePriceUnits.selected = 1;
					this.$.updatePriceAmount.disabled = false;
				} else if(this.$.updatePriceType.selected == 1) {
					this.$.updatePricePerioddrop.disabled = true;
					this.$.priceBytes.disabled = true;
					this.$.priceSeconds.disabled = true;
					this.$.priceCents.disabled = false;
					this.$.updateAddPriceCharReserveTime.disabled = true;
					this.$.updateAddPriceCharReserveBytes.disabled = true;
					this.$.updatePriceUnits.selected = 1;
					this.$.updatePriceAmount.disabled = false;
				} else if(this.$.updatePriceType.selected == 2) {
					this.$.updatePricePerioddrop.disabled = true;
					this.$.priceCents.disabled = true;
					this.$.priceBytes.disabled = false;
					this.$.priceSeconds.disabled = false;
					this.$.updatePriceUnits.selected = 0;
					this.$.updatePriceAmount.disabled = false;
				} else if(this.$.updatePriceType.selected == 3) {
					this.$.updatePricePerioddrop.disabled = true;
					this.$.priceCents.disabled = true;
					this.$.priceBytes.disabled = true;
					this.$.priceSeconds.disabled = false;
					this.$.updatePriceUnits.selected = 2;
					this.$.updatePriceAmount.disabled = true;
					this.$.updatePriceAmount.value = null;
				}
			},
			checkRecureAlt: function() {
				if(this.$.updateAltType.selected == 0) {
					this.$.addalt5drop.disabled = false;
					this.$.altBytes.disabled = false;
					this.$.altSeconds.disabled = false;
					this.$.altCents.disabled = false;
					this.$.updateUnitDrop.selected = 1;
				} else if(this.$.updateAltType.selected == 1) {
					this.$.addalt5drop.disabled = true;
					this.$.altBytes.disabled = false;
					this.$.altSeconds.disabled = false;
					this.$.altCents.disabled = false;
					this.$.updateUnitDrop.selected = 1;
				} else if(this.$.updateAltType.selected == 2) {
					this.$.addalt5drop.disabled = true;
					this.$.altBytes.disabled = false;
					this.$.altSeconds.disabled = false;
					this.$.altCents.disabled = true;
					this.$.updateUnitDrop.selected = 0;
				}
			},
			updateAddPrice: function(event) {
				function updateCheckPriceName(updatePrice) {
					return updatePrice.name == document.getElementById("updatePriceName").value;
				}
				var updateIndexPrice = this.prices.findIndex(updateCheckPriceName);
				if(updateIndexPrice == -1) {
					var updatePriceNew = new Object();
				} else {
					var updatePriceNew = this.prices[updateIndexPrice];
				}
				updatePriceNew.name = this.$.updatePriceName.value;
				updatePriceNew.description = this.$.updatePriceDesc.value;
				updatePriceNew.start = this.$.updatePriceStartDate.value;
				updatePriceNew.end = this.$.updatePriceEndDate.value;
				switch(this.$.updatePriceType.selected) {
					case 0:
						updatePriceNew.priceType = "recurring";
						break;
					case 1:
						updatePriceNew.priceType = "one_time";
						break;
					case 2:
						updatePriceNew.priceType = "usage";
						break;
					case 3:
						updatePriceNew.priceType = "tariff";
						break;
				}
				switch(this.$.updatePriceUnits.selected) {
					case 0:
						updatePriceNew.unit = "b";
						break;
					case 1:
						updatePriceNew.unit = "c";
						break;
					case 2:
						updatePriceNew.unit = "s";
						break;
				}
				updatePriceNew.amount = this.$.updatePriceAmount.value;
				updatePriceNew.size = this.$.updatePriceSize.value;
				updatePriceNew.currency = this.$.updatePriceCurrency.value;
				switch(this.$.updatePricePeriod.selected) {
					case 0:
						updatePriceNew.period = "hourly";
						break;
					case 1:
						updatePriceNew.period = "daily";
						break;
					case 2:
						updatePriceNew.period = "weekly";
						break;
					case 3:
						updatePriceNew.period = "monthly";
						break
					case 4:
						updatePriceNew.period = "yearly";
						break;
				}
				var charAddObj = new Object();
				charAddObj.priceCharReserveTime = this.$.updateAddPriceCharReserveTime.value;
				charAddObj.priceCharReserveBytes = this.$.updateAddPriceCharReserveBytes.value;
				charAddObj.timeOfDayStart = this.$.updateTimeOfDayStart.value;
				charAddObj.timeOfDayEnd = this.$.updateTimeOfDayEnd.value;
				updatePriceNew.prodSpecCharValueUse = charAddObj;
				if(this.$.addUpdatePriceDrop.value) {
					function checkAlt(alts) {
						return alts.name == this.addUpdatePriceDrop.value; 
					}
					updatePriceNew.alteration = this.alterations.findIndex(checkAlt);
				}
				if(updatePriceNew.name
						&& (updatePriceNew.amount || updatePriceNew.updatePriceType == "tariff") 
						&& updatePriceNew.priceType
						&& updatePriceNew.unit) {
					if(updateIndexPrice == -1) {
						this.push('prices', updatePriceNew);
					}
					var ajax =  this.$.updateProductPriceAjax;
					ajax.method = "PATCH";
					ajax.contentType = "application/json-patch+json";
					ajax.url = "/catalogManagement/v2/productOffering/" + this.$.updateOffName.value; 
					var updatePriceNew1 = new Array();
					function checkName(price) {
						return price.name == document.getElementById("updatePriceName").value;
					}
					var indexPrices = this.prices.findIndex(checkName);
					if(this.$.updatePriceName.value) {
						var priceNameUp = new Object();
						priceNameUp.op = "add";
						priceNameUp.path =  "/productOfferingPrice/" + "-" + "/name";
						priceNameUp.value = this.$.updatePriceName.value;
						updatePriceNew1.push(priceNameUp);
					}
					if(this.$.updatePriceDesc.value) {
						var priceDesc = new Object();
						priceDesc.op = "add";
						priceDesc.path = "/productOfferingPrice/" + "-" + "/description";
						priceDesc.value = this.$.updatePriceDesc.value;
						updatePriceNew1.push(priceDesc);
					} 
					if(this.$.updatePriceTypedrop.value) {
						var pricetype = new Object();
						pricetype.op = "add";
						pricetype.path = "/productOfferingPrice/" + "-" + "/priceType";
						switch(this.$.updatePriceType.selected) {
							case 0:
								pricetype.value = "recurring";
								break;
							case 1:
								pricetype.value = "one_time";
								break;
							case 2:
								pricetype.value = "usage";
								break;
							case 3:
								pricetype.value = "tariff";
								break;
						}
						updatePriceNew1.push(pricetype);
					} 
					if(this.$.updatePriceSize.value) {
						var priceSize = new Object();
						priceSize.op = "add";
						priceSize.path = "/productOfferingPrice/" + "-" + "/unitOfMeasure";
						priceSize.value = this.$.updatePriceSize.value;
						updatePriceNew1.push(priceSize);
					}
					if(this.$.updatePriceAmount.value) {
						var priceAmount = new Object();
						priceAmount.op = "add";
						priceAmount.path = "/productOfferingPrice/" + "-" + "/taxIncludedAmount";
						priceAmount.value = this.$.updatePriceAmount.value;
						updatePriceNew1.push(priceAmount);
					}
					if(this.$.updateAddPriceCharReserveTime.value) {
						var charReserve = new Object();
						charReserve.op = "add";
						charReserve.path = "/productOfferingPrice/" + indexPrices + "/radiusReserveTime";
						charReserve.value = this.$.updateAddPriceCharReserveTime.value;
						updatePriceNew.push(charReserve);
					}
					if(this.$.updateAddPriceCharReserveBytes.value) {
						var charResBytes = new Object();
						charResBytes.op = "add";
						charResBytes.path = "/productOfferingPrice/" + indexPrices + "/radiusReserveOctets";
						charResBytes.value = this.$.updateAddPriceCharReserveBytes.value;
						updatePriceNew.push(charResBytes);
					}
					if(this.$.updateTimeOfDayStart.value) {
						function checkChar1(charVal) {
							return charVal.name == "timeOfDayRange";
						}
						var indexChar2 = this.prices[indexPrices].prodSpecCharValueUse.findIndex(checkChar1);
						var timeDay = new Object();
						timeDay.op = "add";
						timeDay.path = "/productOfferingPrice/" + indexPrices + "/prodSpecCharValueUse/" + indexChar2 + "/productSpecCharacteristicValue/0/value";
						timeDay.value = this.$.updateTimePickerStart.rawValue;
						updatePriceNew.push(timeDay);
					}
					if(this.$.updateTimeOfDayEnd.value) {
						function checkChar1(charVal) {
							return charVal.name == "timeOfDayRange";
						}
						var indexChar2 = this.prices[indexPrices].prodSpecCharValueUse.findIndex(checkChar1);
						var timeDayEnd = new Object();
						timeDayEnd.op = "add";
						timeDayEnd.path = "/productOfferingPrice/" + indexPrices + "/prodSpecCharValueUse/" + indexChar2 + "/productSpecCharacteristicValue/0/value";
						timeDayEnd.value = this.$.updateTimePickerEnd.rawValue;
						updatePriceNew.push(timeDayEnd);
					}
					ajax.body = JSON.stringify(updatePriceNew1);
					ajax.generateRequest();
					this.$.updatePriceName.value = null;
					this.$.updatePriceDesc.value = null;
					this.$.updatePriceStartDate.value = null;
					this.$.updatePriceSize.value = null;
					this.$.updatePriceAmount.value = null;
					this.$.updatePriceUnits.value = null;
					this.$.updatePriceEndDate.value = null;
					this.$.updatePriceType.value = null;
					this.$.updatePriceCurrency.value = null;
					this.$.updatePricePeriod.value = null;
					this.$.updateAddPriceCharReserveTime.value = null;
					this.$.updateAddPriceCharReserveBytes.value = null;
					this.$.updateDestPrefixTariff.value = null;
					this.$.updateReserveSession.value = null;
					this.$.updateTimeOfDayStart.value = null;
					this.$.updateTimeOfDayEnd.value = null;
					this.$.updateCheckIn.checked = false;
					this.$.updateCheckOut.checked = false;
					this.$.addUpdatePriceAlteration.selected = null;
					document.getElementById("updateProductToastSuccess").open();
				} else {
					this.$.updateProductToastError.text = "Validation failed";
					this.$.updateProductToastError.open();
				}
			},
			updateAddAlteration: function() {
				function updateCheckAltName(updateAlts) {
					return updateAlts.name == document.getElementById("updateAltName").value;
				}
				var updateIndexAlt = this.alterations.findIndex(updateCheckAltName);
				if(updateIndexAlt == -1) {
					var updateAltNew = new Object();
				} else {
					var updateAltNew = this.alterations[updateIndexAlt];
				}
				updateAltNew.name = this.$.updateAltName.value;
				updateAltNew.description = this.$.updateAltDesc.value;
				updateAltNew.start = this.$.updateAltStartDate.value;
				updateAltNew.end = this.$.updateAltEndDate.value;
				switch(this.$.updateAltType.selected) {
					case 0:
						updateAltNew.priceType = "recurring";
						break;
					case 1:
						updateAltNew.priceType = "one_time";
						break;
					case 2:
						updateAltNew.priceType = "usage";
				}
				switch(this.$.updateUnitDrop.selected) {
					case 0:
						updateAltNew.unit = "b";
						break;
					case 1:
						updateAltNew.unit = "c";
						break
					case 2:
						updateAltNew.unit = "s";
				}
				updateAltNew.size = this.$.updateAltSize.value;
				switch(this.$.updateAltPeriod.selected) {
					case 0:
						updateAltNew.period = "hourly";
						break;
					case 1:
						updateAltNew.period = "daily";
						break;
					case 2:
						updateAltNew.period = "weekly";
						break;
					case 3:
						updateAltNew.period = "monthly";
						break
					case 4:
						updateAltNew.period = "yearly";
				}
				updateAltNew.currency = this.$.updateAltCurr.value;
				updateAltNew.amount= this.$.updateAltAmount.value;
				if(updateAltNew.name
						&& updateAltNew.priceType
						&& updateAltNew.unit
						&& (updateAltNew.amount || updateAltNew.amount == 0)) {
					if(updateIndexAlt == -1) {
						this.push('alterations', updateAltNew);
					}
					this.$.updateAltName.value = null
					this.$.updateAltDesc.value = null;
					this.$.updateAltStartDate.value = null;
					this.$.updateAltEndDate.value = null;
					this.$.updateAltType.value = null;
					this.$.updateAltSize.value = null;
					this.$.updateAltCurr.value = null;
					this.$.updateAltAmount.value = null;
				} else {
					this.$.updateProductToastError.text = "Validation failed";
					this.$.updateProductToastError.open();
				}
			},
			deleteProduct: function(event) {
				this.$.deleteProductAjax.url = "/catalogManagement/v2/productOffering/"
						+ this.$.updateOffName.value;
				this.$.deleteProductAjax.generateRequest();
			},
			deletePrice: function(event) {
				function checkDelPriceName(delPrice) {
					return delPrice.name == document.getElementById("updatePriceName").value;
				}
					var indexDelPrice = this.prices.findIndex(checkDelPriceName);
					if (indexDelPrice != -1) {
						this.$.deleteProductAjax.url = "/catalogManagement/v2/productOffering/"
							+ this.$.updatePriceName.value;
						this.$.deleteProductAjax.generateRequest();
				}
			},
			_deleteProductResponse: function(event) {
				this.$.updateProductModal.close();
				document.getElementById("offerGrid").clearCache();
			},
			_deleteProductError: function(event) {
				this.$.updateProductToastError.text = event.detail.request.xhr.statusText;
				this.$.updateProductToastError.open();
			},
			_onLoadingChanged: function(event) {
				if (this.$.updateProductAjax.loading) {
					document.getElementById("progress").disabled = false;
				} else {
					document.getElementById("progress").disabled = true;
				}
			},
			_addProductResponse: function(event) {
				this.$.updateProductModal.close();
				document.getElementById("updateProductToastSuccess").open();
				this.set('prices', []);
				this.set('alterations', []);
				document.getElementById("offerGrid").clearCache();
				this.cancelDialog();
			},
			cancelDialog: function() {
				this.set('prices', []);
				this.set('alterations', []);
				var list = document.getElementsByClassName("bundleCheck");
				Array.prototype.forEach.call(list, function(el) {
					if(el.checked == true) {
						el.checked = false;
					}
				});
				this.$.updateOffName.value = null;
				this.$.updateOffDesc.value = null;
				this.$.updateOffSpec.value = null;
				this.$.updateOffStart.value = null;
				this.$.updateOffEnd.value = null;
				this.$.updateProductStartDatePickUpdateOff.hide()
				this.$.updateProductEndDatePickUpdateOff.hide()
				this.$.updateProductStartDatePickPrice.hide();
				this.$.updateProductEndDatePickPrice.hide();
				this.$.updateProductStartDatePickAlt.hide();
				this.$.updateProductEndDatePickAlt.hide();
				this.$.updatePriceCharsTimeStart.hide();
				this.$.updatePriceCharsTimeEnd.hide();
				this.$.updateAddPriceChars.hide();
				this.$.addBundleUpdate.hide();
				this.$.updatePriceName.value = null;
				this.$.updatePriceDesc.value = null;
				this.$.updatePriceStartDate.value = null;
				this.$.updatePriceEndDate.value = null;
				this.$.updatePriceType.selected = null;
				this.$.updatePriceUnits.selected = null;
				this.$.updatePriceAmount.value = null;
				this.$.updatePriceSize.value = null;
				this.$.updatePriceCurrency.value = null;
				this.$.updatePricePeriod.selected = null;
				this.$.addUpdatePriceAlteration.selected = null;
				this.$.updateAltName.value = null;
				this.$.updateAltDesc.value = null;
				this.$.updateAltStartDate.value = null;
				this.$.updateAltEndDate.value = null;
				this.$.updateAltType.selected = null;
				this.$.updateAltSize.value = null;
				this.$.updateAltCurr.value = null;
				this.$.updateAltAmount.value = null;
				this.$.updateAltPeriod.selected = null;
				this.$.updateUnitDrop.selected = null;
				this.$.updateAddPriceCharReserveTime.value = null;
				this.$.updateAddPriceCharReserveBytes.value = null;
				this.$.updateDestPrefixTariff.value = null;
				this.$.updateReserveSession.value = null;
				this.$.updateTimeOfDayStart.value = null;
				this.$.updateTimeOfDayEnd.value = null;
				this.$.updateCheckIn.checked = null;
				this.$.updateCheckOut.checked = null;
				this.$.updateProductModal.close();
			}
		});
	</script>
</dom-module>
