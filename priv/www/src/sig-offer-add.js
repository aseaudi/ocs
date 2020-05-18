<!--  vim: set ts=3:  -->
<link rel="import" href="polymer/polymer.html">
<link rel="import" href="i18n-msg/i18n-msg.html">
<link rel="import" href="i18n-msg/i18n-msg-behavior.html">
<link rel="import" href="iron-ajax/iron-ajax.html">
<link rel="import" href="iron-collapse/iron-collapse.html">
<link rel="import" href="paper-dialog/paper-dialog.html">
<link rel="import" href="paper-dropdown-menu/paper-dropdown-menu.html">
<link rel="import" href="paper-listbox/paper-listbox.html">
<link rel="import" href="paper-toolbar/paper-toolbar.html">
<link rel="import" href="paper-input/paper-input.html">
<link rel="import" href="paper-button/paper-button.html">
<link rel="import" href="paper-tooltip/paper-tooltip.html">
<link rel="import" href="paper-toggle-button/paper-toggle-button.html" >
<link rel="import" href="paper-checkbox/paper-checkbox.html">
<link rel="import" href="paper-toast/paper-toast.html">
<link rel="import" href="paper-styles/color.html">
<link rel="import" href="paper-date-picker/paper-date-picker.html">
<link rel="import" href="paper-time-picker/paper-time-picker.html">
<link rel="import" href="paper-menu-button/paper-menu-button.html">
<link rel="import" href="paper-icon-button/paper-icon-button.html">
<link rel="import" href="iron-icon/iron-icon.html">
<link rel="import" href="iron-icons/iron-icons.html">

<dom-module id="sig-offer-add">
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
			paper-toast.error {
				background-color: var(--paper-red-a400);
			}
			paper-checkbox {
				--paper-checkbox-checked-color: #ffb04c;
				--paper-checkbox-checkmark-color: var(--paper-yellow-900);
			}
			.add-button {
				background-color: var(--paper-lime-a700);
				color: black;
				width: 8em;
			}
			.cancel-button {
				color: black;
			}
			.close {
				background-color: var(--paper-lime-a700);
				color: black;
				float: right;
				width: 5em;
			}
		</style>
		<paper-dialog id="addProductModal" modal>
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
						<paper-input id="addOffName"
								class="name"
								name="name"
								label="[[i18n.name]]"
								onfocus="addProductEndDatePickOff.hide(); addProductStartDatePickOff.hide();">
						</paper-input>
						<paper-tooltip>
							<i18n-msg msgid="offerNameTool">
								Product Offering name
							</i18n-msg>
						</paper-tooltip>
					</div>
					<div>
						<paper-input id="addOffDesc"
								class="description"
								name="description"
								label="[[i18n.des]]"
								onfocus="addProductEndDatePickOff.hide(); addProductStartDatePickOff.hide();">
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
								id="onClickBundle"
								suffix
								icon="arrow-drop-down"
								on-click="_onClickBundle">
						</paper-icon-button>
					</div>
					<iron-collapse id="addBundle">
						<template is=dom-repeat items="{{offers}}">
							<div>
								<paper-checkbox checked="{{item.checked}}"> 
										{{item.name}}
								</paper-checkbox>
							</div>
						</template>
					</iron-collapse>
					<div>
						<paper-dropdown-menu
								id="addOffProductSpecificationDrop"
								on-selected-item-changed="checkProductSpec"
								label="[[i18n.productSpec]]">
							<paper-listbox
									id="addOffProductSpecification"
									slot="dropdown-content"
									class="dropdown-content">
								<paper-item>
									<i18n-msg msgid="preData">
										Prepaid Data
									</i18n-msg>
								</paper-item>
								<paper-item>
									<i18n-msg msgid="preVoice">
										Prepaid Voice
									</i18n-msg>
								</paper-item>
								<paper-item>
									<i18n-msg msgid="preSMS">
										Prepaid SMS
									</i18n-msg>
								</paper-item>
							</paper-listbox>
						</paper-dropdown-menu>
					</div>
					<div>
						<iron-collapse id="addProductStartDatePickOff">
							<paper-date-picker id="startOff3" date="{{addProductStartDateOfferPick}}">
							</paper-date-picker>
						</iron-collapse>
						<paper-input id="addOffStart"
								value="[[addProductStartDateOffer]]"
								name="addProductStartDateOffer"
								label="[[i18n.start]]"
								onfocus="addProductEndDatePickOff.hide(); addProductStartDatePickOff.show();">
						</paper-input>
						<paper-tooltip>
							<i18n-msg msgid="offerStartTool">
								Product Offering start date
							</i18n-msg>
						</paper-tooltip>
					</div>
					<div>
						<iron-collapse id="addProductEndDatePickOff">
							<paper-date-picker id="endOff3" date="{{addProductEndDateOfferPick}}">
							</paper-date-picker>
						</iron-collapse>
						<paper-input id="addOffEnd"
								value="[[addProductEndDateOffer]]"
								name="addProductEndDateOffer"
								label="[[i18n.end]]"
								onfocus="addProductStartDatePickOff.hide(); addProductEndDatePickOff.show();">
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
								id="onClickOfferChars"
								suffix
								icon="arrow-drop-down"
								on-click="_onClickOfferChars">
						</paper-icon-button>
					</div>
					<iron-collapse id="addOfferChars">
						<div>
							<paper-input
									id="addOfferCharReserveSession"
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
								raised
								class="add-button"
								on-tap="addOffer">
								<i18n-msg msgid="submit">
									Submit
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
					</div>
				</div>
				<div id=addPrice-tab>
					<div>
						<datalist id="price">
							<template is="dom-repeat" items="[[prices]]">
								<option value="{{item.name}}" />
							</template>
						</datalist>
						<paper-input id="addPriceName"
								list="price"
								label="[[i18n.name]]"
								on-value-changed="addUpdatePriceDialog"
								onclick="addPriceName.value=null"
								onfocus="addProductEndDatePickPrice.hide(); addProductStartDatePickPrice.hide(); addPriceCharsTimeEnd.hide(); addPriceCharsTimeStart.hide();">
						</paper-input>
						<paper-tooltip>
							<i18n-msg msgid="addPriceNameTool">
								Product offering price name
							</i18n-msg>
						</paper-tooltip>
					</div>
					<div>
						<paper-input id="addPriceDesc"
								class="description"
								name="description"
								label="[[i18n.des]]"
								onfocus="addProductEndDatePickPrice.hide(); addProductStartDatePickPrice.hide(); addPriceCharsTimeEnd.hide(); addPriceCharsTimeStart.hide();">
						</paper-input>
						<paper-tooltip>
							<i18n-msg msgid="priceDesTool">
								Product Offering price description
							</i18n-msg>
						</paper-tooltip>
					</div>
					<div>
						<iron-collapse id="addProductStartDatePickPrice">
							<paper-date-picker id="addPriceStart" date="{{addProductStartDatePricePick}}" headingFormat="dd, MMM D">
							</paper-date-picker>
						</iron-collapse>
						<paper-input id="addPriceStartDate"
								value="[[addProductStartDatePrice]]"
								name="addProductStartDatePrice"
								label="[[i18n.start]]"
								onfocus="addProductEndDatePickPrice.hide(); addProductStartDatePickPrice.show(); addPriceCharsTimeEnd.hide(); addPriceCharsTimeStart.hide();">
						</paper-input>
						<paper-tooltip>
							<i18n-msg msgid="priceStartTool">
								Product Offering price start date
							</i18n-msg>
						</paper-tooltip>
					</div>
					<div>
						<iron-collapse id="addProductEndDatePickPrice">
							<paper-date-picker id="addPriceEnd" date="{{addProductEndDatePricePick}}">
							</paper-date-picker>
						</iron-collapse>
						<paper-input id="addPriceEndDate"
								value="[[addProductEndDatePrice]]"
								name="addProductEndDatePrice"
								label="[[i18n.end]]"
								onfocus="addProductStartDatePickPrice.hide(); addProductEndDatePickPrice.show(); addPriceCharsTimeEnd.hide(); addPriceCharsTimeStart.hide();">
						</paper-input>
						<paper-tooltip>
							<i18n-msg msgid="priceEndTool">
								Product offering price end date
							</i18n-msg>
						</paper-tooltip>
					</div>
					<div>
						<paper-dropdown-menu id="addPriceTypedrop"
								label="[[i18n.priceType]]"
								on-selected-item-changed="checkRecure"
								onfocus="addProductEndDatePickPrice.hide(); addProductStartDatePickPrice.hide(); addPriceCharsTimeEnd.hide(); addPriceCharsTimeStart.hide();">
							<paper-listbox
									id="addPriceType"
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
						<paper-input id="addPriceSize"
								class="size"
								name="size"
								type="text"
								allowed-pattern="[0-9kmg]"
								pattern="^[0-9]+[kmg]?$"
								label="[[i18n.unitSize]]"
								auto-validate
								onfocus="addProductEndDatePickPrice.hide(); addProductStartDatePickPrice.hide(); addPriceCharsTimeEnd.hide(); addPriceCharsTimeStart.hide();">
						</paper-input>
						<paper-tooltip>
							<i18n-msg msgid="priceSizeTool">
								Product offering price unit size
							</i18n-msg>
						</paper-tooltip>
					</div>
					<div>
						<paper-dropdown-menu id="addPriceUnitsdrop"
								label="[[i18n.unit]]"
								on-selected-item-changed="checkPattern"
								onfocus="addProductEndDatePickPrice.hide(); addProductStartDatePickPrice.hide(); addPriceCharsTimeEnd.hide(); addPriceCharsTimeStart.hide();">
							<paper-listbox
									id="addPriceUnits"
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
								<paper-item id="priceMessages">
									<i18n-msg msgid="messages">
										Messages
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
						<paper-input id="addPriceAmount"
								class="amount"
								name="amount"
								type="text"
								allowed-pattern="[0-9.]"
                        pattern="[0-9]+\.?[0-9]{0,6}$"
								auto-validate
								label="[[i18n.amount]]"
								value=0
								onfocus="addProductEndDatePickPrice.hide(); addProductStartDatePickPrice.hide(); addPriceCharsTimeEnd.hide(); addPriceCharsTimeStart.hide();">
						</paper-input>
						<paper-tooltip>
							<i18n-msg msgid="priceAmountTool">
								Product offering price amount
							</i18n-msg>
						</paper-tooltip>
					</div>
					<div>
						<paper-input id="addPriceCurrency"
								class="currency"
								name="currency"
								label="[[i18n.currency]]"
								onfocus="addProductEndDatePickPrice.hide(); addProductStartDatePickPrice.hide(); addPriceCharsTimeEnd.hide(); addPriceCharsTimeStart.hide();">
						</paper-input>
						<paper-tooltip>
							<i18n-msg msgid="priceCurrencyTool">
								Product offering price currency
							</i18n-msg>
						</paper-tooltip>
					</div>
					<div>
						<paper-dropdown-menu id="addPricePerioddrop"
								label="[[i18n.period]]"
								onfocus="addProductEndDatePickPrice.hide(); addProductStartDatePickPrice.hide(); addPriceCharsTimeEnd.hide(); addPriceCharsTimeStart.hide();">
							<paper-listbox
									id="addPricePeriod"
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
								id="addPriceDrop"
								label="[[i18n.alter]]"
								onfocus="addProductEndDatePickPrice.hide(); addProductStartDatePickPrice.hide(); addPriceCharsTimeEnd.hide(); addPriceCharsTimeStart.hide();">
							<paper-listbox
									id="addPriceAlteration"
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
								id="onClickPriceChars"
								suffix
								icon="arrow-drop-down"
								on-click="_onClickPriceChars">
						</paper-icon-button>
					</div>
					<iron-collapse id="addPriceChars">
						<div>
							<span>[[i18n.timeDay]]</span>
							<paper-icon-button
								id="onClickPriceCharsTime"
								suffix
								icon="arrow-drop-down"
								on-click="_onClickPriceCharsTime">
							</paper-icon-button>
						</div>
						<iron-collapse id="addPriceCharsTime">
							<div>
								<iron-collapse id="addPriceCharsTimeStart">
									<paper-time-picker id="addTimePickerStart" time="{{startTime}}">
									</paper-time-picker>
								</iron-collapse>
								<paper-input id="timeOfDayStart"
										value="[[startTime]]"
										name="addProductTimePriceStart"
										label="[[i18n.startTime]]"
										onfocus="addProductEndDatePickPrice.hide(); addProductStartDatePickPrice.hide(); addPriceCharsTimeEnd.hide(); addPriceCharsTimeStart.show();">
								</paper-input>
								<paper-tooltip>
									<i18n-msg msgid="timeDayTool">
										Range of the time day
									</i18n-msg>
								</paper-tooltip>
							</div>
							<div>
								<iron-collapse id="addPriceCharsTimeEnd">
									<paper-time-picker id="addTimePickerEnd" time="{{endTime}}">
									</paper-time-picker>
								</iron-collapse>
								<paper-input id="timeOfDayEnd"
										value="[[endTime]]"
										name="addProductTimePriceEnd"
										label="[[i18n.endTime]]"
										onfocus="addProductEndDatePickPrice.hide(); addProductStartDatePickPrice.hide(); addPriceCharsTimeEnd.show(); addPriceCharsTimeStart.hide();">
								</paper-input>
								<paper-tooltip>
									<i18n-msg msgid="timeDayTool">
										Range of the time day
									</i18n-msg>
								</paper-tooltip>
							</div>
						</iron-collapse>
						<div>
							<span>[[i18n.callDirection]]</span>
							<paper-icon-button
								id="onClickCall"
								suffix
								icon="arrow-drop-down"
								on-click="_onClickCall">
							</paper-icon-button>
						</div>
						<iron-collapse id="addCall">
							<div>
								<paper-checkbox id="checkIn"> 
									<i18n-msg msgid="callIncome">
										Incoming
									</i18n-msg>
								</paper-checkbox>
								<paper-tooltip>
									<i18n-msg msgid="callIncomeTool">
										Incoming call direction(answer)
									<i18n-msg>
								</paper-tooltip>
							</div>
							<div>
								<paper-checkbox id="checkOut"> 
									<i18n-msg msgid="callOutgoing">
										Outgoing
									</i18n-msg>
								</paper-checkbox>
								<paper-tooltip>
									<i18n-msg msgid="callOutgoingTool">
										Outgoing call direction(originate)
									</i18n-msg>
								</paper-tooltip>
							</div>
						</iron-collapse>
						<div>
							<paper-input
									id="addPriceCharReserveTime"
									allowed-pattern="[0-9mh]"
									pattern="^[0-9]+[mh]?$"
									auto-validate
									label="[[i18n.reserveTime]]"
									value=0
									onfocus="addProductEndDatePickPrice.hide(); addProductStartDatePickPrice.hide(); addPriceCharsTimeEnd.hide(); addPriceCharsTimeStart.hide();">
							</paper-input>
							<paper-tooltip>
								<i18n-msg msgid="priceReserveTimeTool">
									Amount of time to reserve on RADIUS initial/interim accounting request
								</i18n-msg>
							</paper-tooltip>
						</div>
						<div>
							<paper-input
									id="addPriceCharReserveBytes"
									allowed-pattern="[0-9kmg]"
									pattern="^[0-9]+[kmg]?$"
									auto-validate
									label="[[i18n.reserveBytes]]"
									value=0
									onfocus="addProductEndDatePickPrice.hide(); addProductStartDatePickPrice.hide(); addPriceCharsTimeEnd.hide(); addPriceCharsTimeStart.hide();">
							</paper-input>
							<paper-tooltip>
								<i18n-msg msgid="priceReserveBytesTool">
									Amount of bytes to reserve on RADIUS initial/interim accounting request
								</i18n-msg>
							</paper-tooltip>
						</div>
						<div>
							<paper-input
									id="destPrefixTariff"
									type="string"
									label="[[i18n.tariffTable]]">
							</paper-input>
							<paper-tooltip>
								<i18n-msg msgid="tariffTableTool">
									Prefix of Destination Tariff Table
								</i18n-msg>
							</paper-tooltip>
						</div>
						<div>
							<paper-input
									id="roamingTable"
									type="string"
									label="[[i18n.RomaingTab]]">
							</paper-input>
						</div>
					</iron-collapse>
					<div class="buttons">
						<paper-button
								raised
								class="add-button"
								on-tap="addPrice">
								<i18n-msg msgid="[[addOrUpdateButton]]">
									[[addOrUpdateButton]]
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
					</div>
				</div>
				<div id="add-Alt-tab">
					<div>
						<datalist id="alts">
							<template is="dom-repeat" items="[[alterations]]">
								<option value="{{item.name}}" />
							</template>
						</datalist>
						<paper-input id="addAltName"
								list="alts"
								label="[[i18n.name]]"
								onclick="addAltName.value=null"
								on-value-changed="updateAltsDialog">
						</paper-input>
						<paper-tooltip>
								offering alteration name
						</paper-tooltip>
					</div>
					<div>
						<paper-input id="addAltDesc"
								class="description"
								name="description"
								label="[[i18n.des]]"
								onfocus="addProductEndDatePickAlt.hide(); addProductStartDatePickAlt.hide();">
						</paper-input>
						<paper-tooltip>
								offering alteration description
						</paper-tooltip>
					</div>
					<div>
						<iron-collapse id="addProductStartDatePickAlt">
							<paper-date-picker id="startAlt3" date="{{addProductStartDateAltPick}}">
							</paper-date-picker>
						</iron-collapse>
						<paper-input id="addAltStartDate"
								value="[[addProductStartDateAlt]]"
								name="addProductStartDateAlt"
								label="[[i18n.start]]"
								onfocus="addProductEndDatePickAlt.hide(); addProductStartDatePickAlt.show();">
						</paper-input>
						<paper-tooltip>
								offering alteration start date
						</paper-tooltip>
					</div>
					<div>
						<iron-collapse id="addProductEndDatePickAlt">
							<paper-date-picker id="endAlt3" date="{{addProductEndDateAltPick}}">
							</paper-date-picker>
						</iron-collapse>
						<paper-input id="addAltEndDate"
								value="[[addProductEndDateAlt]]"
								name="addProductEndDateAlt"
								label="[[i18n.end]]"
								onfocus="addProductStartDatePickAlt.hide(); addProductEndDatePickAlt.show();">
						</paper-input>
						<paper-tooltip>
								offering alteration end date
						</paper-tooltip>
					</div>
					<div>
						<paper-dropdown-menu
								label="[[i18n.priceType]]"
								on-selected-item-changed="checkRecureAlt"
								onfocus="addProductEndDatePickAlt.hide(); addProductStartDatePickAlt.hide();">
							<paper-listbox
									id="addAltType"
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
						<paper-input id="addAltSize"
								class="size"
								name="size"
								label="[[i18n.unitSize]]"
								type="text"
								allowed-pattern="[0-9kmg]"
								pattern="^[0-9]+[kmg]?$"
								auto-validate
								onfocus="addProductEndDatePickAlt.hide(); addProductStartDatePickAlt.hide();">
						</paper-input>
						<paper-tooltip>
								offering alteration size
						</paper-tooltip>
					</div>
					<div>
						<paper-dropdown-menu
								label="[[i18n.unit]]">
							<paper-listbox
									id="addAltUnitDrop"
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
									<paper-item id="altMessages">
										<i18n-msg msgid="messages">
											Messages
										</i18n-msg>
									</paper-item>
							</paper-listbox>
						</paper-dropdown-menu>
						<paper-tooltip>
								offering alteration units
						</paper-tooltip>
					</div>
					<div>
						<paper-input id="addAltAmount"
								class="amount"
								name="amount"
								label="[[i18n.amount]]"
								type="text"
								allowed-pattern="[0-9.]"
                        pattern="[0-9]+\.?[0-9]{0,6}$"
								auto-validate
								value=0
								onfocus="addProductEndDatePickAlt.hide(); addProductStartDatePickAlt.hide();">
						</paper-input>
						<paper-tooltip>
								offering alteration amount
						</paper-tooltip>
					</div>
					<div>
						<paper-input id="addAltCurrency"
								class="currency"
								name="currency"
								label="[[i18n.currency]]"
								onfocus="addProductEndDatePickAlt.hide(); addProductStartDatePickAlt.hide();">
						</paper-input>
						<paper-tooltip>
								offering alteration currency
						</paper-tooltip>
					</div>
					<div>
						<paper-dropdown-menu id="addalt5drop"
								label="[[i18n.period]]"
								onfocus="addProductEndDatePickAlt.hide(); addProductStartDatePickAlt.hide();">
							<paper-listbox
									id="addAltPeriod"
									slot="dropdown-content"
									class="dropdown-content">
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
								raised
								class="add-button"
								on-tap="addAlteration">
								<i18n-msg msgid="[[addOrUpdateButton]]">
									[[addOrUpdateButton]]
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
					</div>
				</div>
			</iron-pages>
			<paper-toast
					id="addProductToastError">
			</paper-toast>
		</paper-dialog>
		<iron-ajax
				id="addProductAjax"
				url="/catalogManagement/v2/productOffering"
				method = "POST"
				content-type="application/json"
				on-loading-changed="_onLoadingChanged"
				on-response="_addProductResponse"
				on-error="_addProductError">
		</iron-ajax>
		<iron-ajax
			id="getProductsAjax"
			url="/catalogManagement/v2/productOffering"
			method="GET"
			on-response="_getProductsResponse"
			on-error="_getProductsError">
		</iron-ajax>
	</template>
	<script>
		Polymer ({
			is: 'sig-offer-add',
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
				selected: {
					type: Number,
					value: 0
				},
				addProductStartDateOffer: {
					type: String,
					value: ""
				},
				addProductEndDateOffer: {
					type: String,
					value: ""
				},
				addProductStartDatePrice: {
					type: String,
					value: ""
				},
				addProductEndDatePrice: {
					type: String,
					value: ""
				},
				addProductStartDateAlt: {
					type: String,
					value: ""
				},
				addProductEndDateAlt: {
					type: String,
					value: ""
				},
				addProductStartDateOfferPick: {
					observer: '_addProductStartDateOfferPick'
				},
				addProductEndDateOfferPick: {
					observer: '_addProductEndDateOfferPick'
				},
				addProductStartDatePricePick: {
					observer: '_addProductStartDatePricePick'
				},
				addProductEndDatePricePick: {
					observer: '_addProductEndDatePricePick'
				},
				addProductStartDateAltPick: {
					observer: '_addProductStartDateAltPick'
				},
				addProductEndDateAltPick: {
					observer: '_addProductEndDateAltPick'
				},
				addOrUpdateButton: {
					type: String,
					value: "add"
				}
			},
			listeners: {
				'checkIn.checked-changed': 'checkInChanged',
				'checkOut.checked-changed': 'checkOutChanged'
			}, 
			observers: [
				'_bundleCheckboxChanged(offers.*)'
			],
			_addProductStartDateOfferPick: function(date) {
				if (this.$.addProductStartDatePickOff.opened) {
					this.addProductStartDateOffer = moment(date).format('YYYY-MM-DD');
				}
			},
			_addProductEndDateOfferPick: function(date) {
				if (this.$.addProductEndDatePickOff.opened) {
					this.addProductEndDateOffer = moment(date).format('YYYY-MM-DD');
				}
			},
			_addProductStartDatePricePick: function(date) {
				if (this.$.addProductStartDatePickPrice.opened) {
					this.addProductStartDatePrice = moment(date).format('YYYY-MM-DD');
				}
			},
			_addProductEndDatePricePick: function(date) {
				if (this.$.addProductEndDatePickPrice.opened) {
					this.addProductEndDatePrice = moment(date).format('YYYY-MM-DD');
				}
			},
			_addProductStartDateAltPick: function(date) {
				if (this.$.addProductStartDatePickAlt.opened) {
					this.addProductStartDateAlt = moment(date).format('YYYY-MM-DD');
				}
			},
			_addProductEndDateAltPick: function(date) {
				if (this.$.addProductEndDatePickAlt.opened) {
					this.addProductEndDateAlt = moment(date).format('YYYY-MM-DD');
				}
			},
			_getProductsResponse: function(event) {
				var results = event.detail.xhr.response;
				for (var index in results) {
					function checkExist(spec) {
						return spec.name == results[index].name;
					}
					if(!this.offers.some(checkExist)) {
						var product = new Object();
						product.id = results[index].id;
						product.href = results[index].href;
						product.name = results[index].name;
						product.checked = false;
						this.push('offers', product);
					}
				}
			},
			_getProductsError: function(event) {
				this.$.addProductToastError.text = event.detail.request.xhr.statusText;
				this.$.addProductToastError.open();
			},
			addUpdatePriceDialog: function() {
				function checkPriceUpdateName(price) {
					return price.name == document.getElementById("addPriceName").value;
				}
				if(this.prices != undefined) {
					var indexPrice = this.prices.findIndex(checkPriceUpdateName);
					if (indexPrice == -1) {
						this.addOrUpdateButton = "add";
						this.$.addPriceDesc.value = null;
						this.$.addPriceStartDate.value = null;
						this.$.addPriceEndDate.value = null;
						this.$.addPriceType.selected = null;
						this.$.addPriceSize.value = null;
						this.$.addPriceUnits.selected = null;
						this.$.addPriceAmount.value = null;
						this.$.addPriceCurrency.value = null;
						this.$.addPricePeriod.selected = null;
						this.$.addPriceAlteration.selected = null;
						this.$.addPriceCharReserveTime.value = null;
						this.$.addPriceCharReserveBytes.value = null;
						this.$.timeOfDayStart.value = null;
						this.$.timeOfDayEnd.value = null;
					} else {
						this.addOrUpdateButton = "update";
						this.$.addPriceDesc.value = this.prices[indexPrice].description;
						this.$.addPriceStartDate.value = this.prices[indexPrice].start;
						this.$.addPriceEndDate.value = this.prices[indexPrice].end;
						switch(this.prices[indexPrice].type) {
							case "recurring":
								this.$.addPriceType.selected = 0;
								break;
							case "one_time":
								this.$.addPriceType.selected = 1;
								break;
							case "usage":
								this.$.addPriceType.selected = 2;
								break;
							case "tariff":
								this.$.addPriceType.selected = 3;
						}
						this.$.addPriceSize.value = this.prices[indexPrice].size;
						switch(this.prices[indexPrice].unit) {
							case "b":
								this.$.addPriceUnits.selected = 0;
								break;
							case "c":
								this.$.addPriceUnits.selected = 1;
								break;
							case "s":
								this.$.addPriceUnits.selected = 2;
								break;
							case "msg":
								this.$.addPriceUnits.selected = 3;
								break;
						}
						this.$.addPriceCurrency.value = this.prices[indexPrice].currency;
						this.$.addPriceAmount.value = this.prices[indexPrice].amount;
						switch(this.prices[indexPrice].period) {
							case "hourly":
								this.$.addPricePeriod.selected = 0;
								break;
							case "daily":
								this.$.addPricePeriod.selected = 1;
								break;
							case "weekly":
								this.$.addPricePeriod.selected = 2;
								break;
							case "monthly":
								this.$.addPricePeriod.selected = 3;
								break;
							case "yearly":
								this.$.addPricePeriod.selected = 4;
								break;
						}
						if(this.prices[indexPrice].alterations &&
								this.prices[indexPrice].alterations.name) {
							var altPriceNew = this.prices[indexPrice].alterations.name;
							function checkAltName(alt) {
								return alt.name == altPriceNew;
							}
							this.$.addPriceAlteration.selected = this.alterations.findIndex(checkAltName);
						}
						this.$.addPriceCharReserveTime.value = this.prices[indexPrice].reserveTime;
						this.$.addPriceCharReserveBytes.value = this.prices[indexPrice].reserveBytes;
						this.$.timeOfDayStart.value = this.prices[indexPrice].timeOfDayRange;
						this.$.timeOfDayEnd.value = this.prices[indexPrice].timeOfDayRange;
						this.$.checkIn.value = this.prices[indexPrice].callDirection;
						this.$.checkOut.value = this.prices[indexPrice].callDirection;
						this.$.destPrefixTariff.value = this.prices[indexPrice].prefixTariff;
						this.$.roamingTable.value = this.prices[indexPrice].roamingTable;
					}
				}
			},
			updateAltsDialog: function() {
				function checkName(alts) {
					return alts.name == document.getElementById("addAltName").value;
				}
				if(this.alterations != undefined) {
					var index = this.alterations.findIndex(checkName);
					if (index == -1) {
						this.addOrUpdateButton = "add";
						this.$.addAltDesc.value = null;
						this.$.addAltStartDate.value = null;
						this.$.addAltEndDate.value = null;
						this.$.addAltType.selected = null;
						this.$.addAltSize.value = null;
						this.$.addAltUnitDrop.selected = null;
						this.$.addAltAmount.value = null;
						this.$.addAltCurrency.value = null;
						this.$.addAltPeriod.selected = null;
					} else {
						this.addOrUpdateButton = "update";
						this.$.addAltDesc.value = this.alterations[index].description;
						this.$.addAltStartDate.value = this.alterations[index].startdate;
						this.$.addAltEndDate.value = this.alterations[index].terminationDate;
						switch(this.alterations[index].type) {
							case "recurring":
								this.$.addAltType.selected = 0;
								break;
							case "one_time":
								this.$.addAltType.selected = 1;
								break;
							case "usage":
								this.$.addAltType.selected = 2;
								break;
						}
						this.$.addAltSize.value = this.alterations[index].size;
						switch(this.alterations[index].unit) {
							case "b":
								this.$.addAltUnitDrop.selected = 0;
								break;
							case "c":
								this.$.addAltUnitDrop.selected = 1;
								break;
							case "s":
								this.$.addAltUnitDrop.selected = 2;
								break;
							case "msg":
								this.$.addAltUnitDrop.selected = 3;
								break;
						}
						this.$.addAltCurrency.value = this.alterations[index].currency;
						this.$.addAltAmount.value = this.alterations[index].amount;
						switch(this.alterations[index].period) {
							case "hourly":
								this.$.addAltPeriod.selected = 0;
								break;
							case "daily":
								this.$.addAltPeriod.selected = 1;
								break;
							case "weekly":
								this.$.addAltPeriod.selected = 2;
								break;
							case "monthly":
								this.$.addAltPeriod.selected = 3;
								break;
							case "yearly":
								this.$.addAltPeriod.selected = 4;
								break;
						}
					}
				}
			},
			_bundleCheckboxChanged: function() {
				function check(item) {
					return item.checked;
				}
				if(this.offers.some(check)) {
					this.$.addOffProductSpecificationDrop.disabled = true;
					this.$.addOfferCharReserveSession.disabled = true;
				} else {
					this.$.addOffProductSpecificationDrop.disabled = false;
					this.$.addOfferCharReserveSession.disabled = false;
				}
			},
			_onClickBundle: function(event) {
				if(this.$.addBundle.opened == false) {
					this.$.addBundle.show();
					this.$.onClickBundle.icon="arrow-drop-up";
				} else {
					this.$.addBundle.hide();
					this.$.onClickBundle.icon="arrow-drop-down"
				}
			},
			_onClickOfferChars: function() {
				if(this.$.addOfferChars.opened == false) {
					this.$.addOfferChars.show();
					this.$.onClickOfferChars.icon="arrow-drop-up"
				} else {
					this.$.addOfferChars.hide();
					this.$.onClickOfferChars.icon="arrow-drop-down"
				}
			},
			addOffer: function() {
				var offerNew = new Object();
				if(this.$.addOffName.value) {
					offerNew.name = this.$.addOffName.value;
				}
				if(this.$.addOffDesc.value) {
					offerNew.description = this.$.addOffDesc.value;
				}
				if(this.$.addBundle) {
					var bundled = new Array();
					for(var index in this.offers) {
						if(this.offers[index].checked == true) {
							var bundleOffer = new Object();
							bundleOffer.numberRelOfferLowerLimit = 0;
							bundleOffer.numberRelOfferUpperLimit = 1;
							bundleOffer.numberRelOfferDefault = 1;
							var bundleObj = new Object();
							bundleObj.id = this.offers[index].id;
							bundleObj.href = this.offers[index].href;
							bundleObj.name = this.offers[index].name;
							bundleObj.bundledProductOfferingOption = bundleOffer;
							bundled.push(bundleObj);
						}
					}
					offerNew.bundledProductOffering = bundled;
				}
				var specIndex = this.$.addOffProductSpecification.selected;
				if(specIndex == 0) {
					var prodSpecData = new Object();
					prodSpecData.id = "8";
					prodSpecData.href = "/catalogManagement/v2/productSpecification/8";
					offerNew.productSpecification = prodSpecData;
				} else if(specIndex == 1) {
					var prodSpecVoice = new Object();
					prodSpecVoice.id = "9";
					prodSpecVoice.href = "/catalogManagement/v2/productSpecification/9";
					offerNew.productSpecification = prodSpecVoice;
				} else if(specIndex == 2) {
					var prodSpecSms = new Object();
					prodSpecSms.id = "11";
					prodSpecSms.href = "/catalogManagement/v2/productSpecification/11";
					offerNew.productSpecification = prodSpecSms;
				}
				var startDateTime;
				var endDateTime;
				if(this.$.addOffStart.value) {
					startDateTime = this.$.addOffStart.value;
				}
				if(this.$.addOffEnd.value) {
					endDateTime = this.$.addOffEnd.value;
				}
				if(startDateTime && endDateTime) {
					offerNew.validFor = {startDateTime, endDateTime};
				} else if(startDateTime && !endDateTime) {
					offerNew.validFor = {startDateTime};
				} else if(!startDateTime && endDateTime) {
					offerNew.validFor = {endDateTime};
				}
				var prodSpecCharValueUse = new Array();
				if (this.$.addOfferCharReserveSession.value && this.$.addOfferCharReserveSession.value.length > 0) {
					var charValueUse = new Object();
					charValueUse.name = "radiusReserveSessionTime";
					charValueUse.minCardinality = 0;
					charValueUse.maxCardinality = 1;
					var charValue = new Object();
					charValue.default = true;
					charValue.value = parseInt(this.$.addOfferCharReserveSession.value);
					var charValues = new Array();
					charValues.push(charValue);
					charValueUse.productSpecCharacteristicValue = charValues;
					var prodSpec = new Object();
					prodSpec.id = "1";
					prodSpec.href = "/catalogManagement/v2/productSpecification/1";
					charValueUse.productSpecification = prodSpec;
					prodSpecCharValueUse.push(charValueUse);
				}
				if (prodSpecCharValueUse.length > 0) {
					offerNew.prodSpecCharValueUse = prodSpecCharValueUse;
				}
				function mapPrice(item) {
					var out = new Object();
					if(item.name) {
						out.name = item.name;
					}
					if(item.description) {
						out.description = item.description;
					}
					var startDateTime;
					var endDateTime;
					if(item.start) {
						startDateTime = item.start;
					}
					if(item.end) {
						endDateTime = item.end;
					}
					if(startDateTime && endDateTime) {
						out.validFor = {startDateTime, endDateTime};
					} else if(startDateTime && !endDateTime) {
						out.validFor = {startDateTime};
					} else if(!startDateTime  && endDateTime) {
						out.validFor = {endDateTime};
					}
					if(item.type) {
						out.priceType = item.type;
					}
					if(item.unit && item.size) {
						var len = item.size.length;
						var m = item.size.charAt(len - 1);
						if(isNaN(parseInt(m))) {
							var s = item.size.slice(0, (len - 1));
						} else {
							var s = item.size;
						}
						if(item.unit == "b") {
							if (m == "m") {
								out.unitOfMeasure = s + "000000b";
							} else if(m == "g") {
								out.unitOfMeasure = s + "000000000b";
							} else if(m == "k") {
								out.unitOfMeasure = s + "000b";
							} else {
								out.unitOfMeasure = s + "b";
							}
						} else if(item.unit == "s") {
							var n = Number(s);
							if(m == "m") {
								n = n * 60;
								out.unitOfMeasure = n.toString() + "s";
							} else if(m == "h") {
								n = n * 3600;
								out.unitOfMeasure = n.toString() + "s";
							} else {
								out.unitOfMeasure = n.toString() + "s";
							}
						} else if(item.unit == "msg") {
							out.unitOfMeasure = s + "msg";
						}
					}
					var taxIncludedAmount;
					var currencyCode;
					if(item.amount) {
						taxIncludedAmount = item.amount;
					}
					if(item.currency) {
						currencyCode = item.currency;
					}
					if(item.amount && item.currency) {
						out.price = {taxIncludedAmount, currencyCode};
					} else if (item.amount && !item.currency) {
						out.price = {taxIncludedAmount};
					} else if (!item.amount && item.currency) {
						out.price = {currencyCode};
					}
					if(item.period) {
						out.recurringChargePeriod = item.period;
					}
					if(item.alterations) {
						out.productOfferPriceAlteration = new Object();
						if(item.alterations.name) {
							out.productOfferPriceAlteration.name = item.alterations.name;
						}
						if (item.alterations.description) {
							out.productOfferPriceAlteration.description = item.alterations.description;
						}
						var startDateTime;
						var endDateTime;
						if (item.alterations.startdate) {
							startDateTime = item.alterations.startdate;
						}
						if (item.alterations.terminationDate) {
							endDateTime = item.alterations.terminationDate;
						}
						if (startDateTime && endDateTime) {
							out.productOfferPriceAlteration.validFor = {startDateTime, endDateTime}
						} else if(startDateTime && !endDateTime) {
							out.productOfferPriceAlteration.validFor = {startDateTime};
						} else if(!startDateTime && endDateTime) {
							out.productOfferPriceAlteration.validFor = {endDateTime};
						}
						if (item.alterations.type) {
							out.productOfferPriceAlteration.priceType = item.alterations.type;
						}
						if (item.alterations.unit && item.alterations.size) {
							var len1 = item.alterations.size.length;
							var m1 = item.alterations.size.charAt(len1 - 1);
							if(isNaN(parseInt(m1))) {
								var s1 = item.alterations.size.slice(0, (len1 - 1));
							} else {
								var s1 = item.alterations.size;
							}
							if(item.alterations.unit == "b") {
								if (m1 == "m") {
									out.productOfferPriceAlteration.unitOfMeasure = s1 + "000000b";
								} else if(m1 == "g") {
									out.productOfferPriceAlteration.unitOfMeasure = s1 + "000000000b";
								} else if(m1 == "k") {
									out.productOfferPriceAlteration.unitOfMeasure = s1 + "000b";
								} else {
									out.productOfferPriceAlteration.unitOfMeasure = s1 + "b";
								}
							} else if(item.alterations.unit == "s") {
								var n1 = Number(s1);
								if(m1 == "m") {
									n1 = n1 * 60;
									out.productOfferPriceAlteration.unitOfMeasure = n1.toString() + "s";
								} else if(m1 == "h") {
									n1 = n1 * 3600;
									out.productOfferPriceAlteration.unitOfMeasure = n1.toString() + "s";
								} else {
									out.productOfferPriceAlteration.unitOfMeasure = n1.toString() + "s"; 
								}
							}
						}
						var taxIncludedAmount;
						var currencyCode
						if (item.alterations.amount || item.alterations.amount == 0) {
							taxIncludedAmount = item.alterations.amount;
						}
						if (item.alterations.currency) {
							currencyCode = item.alterations.currency;
						}
						if((taxIncludedAmount >= 0) && currencyCode) {
							out.productOfferPriceAlteration.price = {taxIncludedAmount, currencyCode};
						} else if ((taxIncludedAmount >= 0) && !currencyCode) {
							out.productOfferPriceAlteration.price = {taxIncludedAmount};
						} else if (!(taxIncludedAmount >= 0) && currencyCode) {
							out.productOfferPriceAlteration.price = {currencyCode};
						}
						if (item.alterations.period) {
							out.productOfferPriceAlteration.recurringChargePeriod = item.alterations.period;
						}
					}
					var prodSpecCharValueUse = new Array();
					if (item.prefixTariff) {
						var charValue = new Object();
						var charValueUse = new Object();
						charValueUse.name = "destPrefixTariffTable";
						charValueUse.minCardinality = 0;
						charValueUse.maxCardinality = 1;
						charValue.default = true;
						charValue.value = item.prefixTariff;
						var charValues = new Array();
						charValues.push(charValue);
						charValueUse.productSpecCharacteristicValue = charValues;
						var prodSpec = new Object();
						prodSpec.id = "3";
						prodSpec.href = "/catalogManagement/v2/productSpecification/3";
						charValueUse.productSpecification = prodSpec;
						prodSpecCharValueUse.push(charValueUse);
					}
					if (item.roamingTable) {
						var charValue = new Object();
						var charValueUse = new Object();
						charValueUse.name = "roamingTable";
						charValueUse.minCardinality = 0;
						charValueUse.maxCardinality = 1;
						charValue.default = true;
						charValue.value = item.roamingTable;
						var charValues = new Array();
						charValues.push(charValue);
						charValueUse.productSpecCharacteristicValue = charValues;
						var prodSpec = new Object();
						prodSpec.id = "3";
						prodSpec.href = "/catalogManagement/v2/productSpecification/3";
						charValueUse.productSpecification = prodSpec;
						prodSpecCharValueUse.push(charValueUse);
					}
					if (item.reserveTime) {
						var charValue = new Object();
						charValue.unitOfMeasure = "seconds";
						var charLength = item.reserveTime.length;
						var lastChar = item.reserveTime.charAt(charLength - 1); //gets last character
						if(isNaN(parseInt(lastChar))) {
							var s = item.reserveTime.slice(0, (charLength -1));
						} else {
							var s = item.reserveTime;
						}
						if(charValue.unitOfMeasure == "seconds") {
							var n = Number(s);
							if(lastChar == "m") {
								charValue.value = n * 60;
							}
							else if(lastChar == "h") {
								charValue.value = n * 3600;
							} else {
								charValue.value = n;
							}
						}
						var charValueUse = new Object();
						charValueUse.name = "radiusReserveTime";
						charValueUse.valueType = "Number";
						charValueUse.minCardinality = 1;
						charValueUse.maxCardinality = 1;
						charValue.default = true;
						var charValues = new Array();
						charValues.push(charValue);
						charValueUse.productSpecCharacteristicValue = charValues;
						var prodSpec = new Object();
						prodSpec.id = "4";
						prodSpec.href = "/catalogManagement/v2/productSpecification/4";
						charValueUse.productSpecification = prodSpec;
						prodSpecCharValueUse.push(charValueUse);
					}
					if (item.reserveBytes) {
						var charValue = new Object();
						charValue.unitOfMeasure = "octets";
						var charLength = item.reserveBytes.length;
						var lastChar = item.reserveBytes.charAt(charLength - 1); //gets last character
						if(isNaN(parseInt(lastChar))) {
							var s = item.reserveBytes.slice(0, (charLength -1));
						} else {
							var s = item.reserveBytes;
						}
						if(charValue.unitOfMeasure == "octets") {
							var n = Number(s);
							if(lastChar == "g") {
								charValue.value = n * 1000000000;
							}
							else if(lastChar == "m") {
								charValue.value = n * 1000000;
							}
							else if(lastChar == "k") {
								charValue.value = n * 1000;
							} else {
								charValue.value = n;
							}
						}
						var charValueUse = new Object();
						charValueUse.name = "radiusReserveOctets";
						charValueUse.valueType = "Number";
						charValueUse.minCardinality = 1;
						charValueUse.maxCardinality = 1;
						charValue.default = true;
						var charValuesByte = new Array();
						charValuesByte.push(charValue);
						charValueUse.productSpecCharacteristicValue = charValuesByte;
						var prodSpec = new Object();
						prodSpec.id = "4";
						prodSpec.href = "/catalogManagement/v2/productSpecification/4";
						charValueUse.productSpecification = prodSpec;
						prodSpecCharValueUse.push(charValueUse);
					}
					if (item.timeOfDayRange) {
						if (item.timeOfDayRange.length > 0) {
							var charValueUse = new Object();
							charValueUse.name = "timeOfDayRange";
							charValueUse.valueType = "Range";
							charValueUse.minCardinality = 0;
							charValueUse.maxCardinality = 1;
							var charValue1 = new Object();
							var charValue = new Object();
							var charValueLower = new Object();
							charValueLower.amount = this.addTimePickerStart.rawValue;
							charValueLower.units = "minutes";
							charValue.lowerValue = charValueLower;
							var charValueUpper = new Object();
							charValueUpper.amount = this.addTimePickerEnd.rawValue;
							charValueUpper.units = "minutes";
							charValue.upperValue = charValueUpper;
							charValue1.value = charValue;
							var charValues = new Array();
							charValues.push(charValue1);
							charValueUse.productSpecCharacteristicValue = charValues;
							prodSpecCharValueUse.push(charValueUse);
						}
					}
					if (item.callDirection) {
						var charValue = new Object();
						var charValueUse = new Object();
						charValueUse.name = "callDirection";
						charValueUse.minCardinality = 1;
						charValueUse.maxCardinality = 1;
						charValue.default = true;
						charValue.value = item.callDirection; 
						var charValuesByte = new Array();
						charValuesByte.push(charValue);
						charValueUse.productSpecCharacteristicValue = charValuesByte;
						var prodSpec = new Object();
						prodSpec.id = "5";
						prodSpec.href = "/catalogManagement/v2/productSpecification/5";
						charValueUse.productSpecification = prodSpec;
						prodSpecCharValueUse.push(charValueUse);
					}
					if (prodSpecCharValueUse.length > 0) {
						out.prodSpecCharValueUse = prodSpecCharValueUse;
					}
					return out;
				}
				offerNew.productOfferingPrice = this.prices.map(mapPrice);
				if(offerNew.name) {
					var ajax = this.$.addProductAjax;
					ajax.body = offerNew;
					ajax.generateRequest();
					this.$.addBundle.hide();
				} else {
					document.getElementById("addProductToastError").open();
				}
			},
			checkProductSpec: function() {
				if(this.$.addOffProductSpecification.selected == 0) {
					this.$.destPrefixTariff.disabled = true;
				} else if(this.$.addOffProductSpecification.selected == 1) {
					this.$.destPrefixTariff.disabled = false;
				} else if(this.$.addOffProductSpecification.selected == 2) {
					this.$.destPrefixTariff.disabled = false;
				}
			},
			checkPattern: function() {
				if(this.$.addPriceUnits.selected == 0) {
					this.$.addPriceSize.allowedPattern = "[0-9kmg]";
					this.$.addPriceSize.pattern = "^[0-9]+[kmg]?$";
					this.$.addPriceSize.disabled = false;
					this.$.addPriceCharReserveBytes.allowedPattern = "[0-9kmg]";
					this.$.addPriceCharReserveBytes.pattern = "^[0-9]+[kmg]?$";
					this.$.addPriceCharReserveBytes.disabled = false;
					this.$.addPriceCharReserveTime.disabled = true;
				} else if(this.$.addPriceUnits.selected == 1) {
					this.$.addPriceSize.allowedPattern = "[0-9]";
					this.$.addPriceSize.pattern = "^[0-9]+$";
					this.$.addPriceSize.disabled = true;
				} else if(this.$.addPriceUnits.selected == 2) {
					this.$.addPriceSize.allowedPattern = "[0-9mh]";
					this.$.addPriceSize.pattern = "^[0-9]+[mh]?$";
					this.$.addPriceSize.disabled = false;
					this.$.addPriceCharReserveTime.allowedPattern = "[0-9mh]";
					this.$.addPriceCharReserveTime.pattern = "^[0-9]+[mh]?$";
					this.$.addPriceCharReserveTime.disabled = false;
					this.$.addPriceCharReserveBytes.disabled = true;
				} else if(this.$.addPriceUnits.selected == 3) {
					this.$.addPriceSize.allowedPattern = "[0-9]";
					this.$.addPriceSize.pattern = "^[0-9]+$";
					this.$.addPriceSize.disabled = false;
				}
			},
			checkPatternAlt: function() {
				if(this.$.addAltUnitDrop.selected == 0) {
					this.$.addAltSize.allowedPattern = "[0-9kmg]";
					this.$.addAltSize.pattern = "^[0-9]+[kmg]?$";
					this.$.addAltSize.disabled= false;
				} else if(this.$.addAltUnitDrop.selected == 1) {
					this.$.addAltSize.allowedPattern = "[0-9]";
					this.$.addAltSize.pattern = "^[0-9]+$";
					this.$.addAltSize.disabled= true;
				} else if(this.$.addAltUnitDrop.selected == 2) {
					this.$.addAltSize.allowedPattern = "[0-9mh]";
					this.$.addAltSize.pattern = "^[0-9]+[mh]?$";
					this.$.addAltSize.disabled = false;
				} else if(this.$.addAltUnitDrop.selected == 3) {
					this.$.addAltSize.allowedPattern = "[0-9]";
					this.$.addAltSize.pattern = "^[0-9]+$";
					this.$.addAltSize.disabled= false;
				}
			},
			checkRecure: function() {
				if(this.$.addPriceType.selected == 0) {
					this.$.addPricePerioddrop.disabled = false;
					this.$.priceBytes.disabled = true;
					this.$.priceSeconds.disabled = true;
					this.$.priceMessages.disabled = true;
					this.$.priceCents.disabled = false;
					this.$.addPriceCharReserveTime.disabled = true;
					this.$.addPriceCharReserveBytes.disabled = true;
					this.$.addPriceUnits.selected = 1;
					this.$.addPriceAmount.false= false;
				} else if(this.$.addPriceType.selected == 1) {
					this.$.addPricePerioddrop.disabled = true;
					this.$.priceBytes.disabled = true;
					this.$.priceSeconds.disabled = true;
					this.$.priceMessages.disabled = true;
					this.$.priceCents.disabled = false;
					this.$.addPriceCharReserveTime.disabled = true;
					this.$.addPriceCharReserveBytes.disabled = true;
					this.$.addPriceUnits.selected = 1;
					this.$.addPriceAmount.disabled = false;
				} else if(this.$.addPriceType.selected == 2) {
					this.$.addPricePerioddrop.disabled = true;
					this.$.priceCents.disabled = true;
					this.$.priceMessages.disabled = false;
					this.$.priceBytes.disabled = false;
					this.$.priceSeconds.disabled = false;
					this.$.addPriceUnits.selected = 0;
					this.$.addPriceAmount.disabled = false;
				} else if(this.$.addPriceType.selected == 3) {
					this.$.addPricePerioddrop.disabled = true;
					this.$.priceCents.disabled = true;
					this.$.priceBytes.disabled = true;
					this.$.priceMessages.disabled = false;
					this.$.priceSeconds.disabled = false;
					this.$.addPriceUnits.selected = 2;
					this.$.addPriceAmount.disabled = true;
					this.$.addPriceAmount.value = null;
				}
			},
			checkRecureAlt: function() {
				if(this.$.addAltType.selected == 0) {
					this.$.addalt5drop.disabled = false;
					this.$.altBytes.disabled = false;
					this.$.altSeconds.disabled = false;
					this.$.altCents.disabled = false;
					this.$.altMessages.disabled = false;
					this.$.addAltUnitDrop.selected = 1;
				} else if(this.$.addAltType.selected == 1) {
					this.$.addalt5drop.disabled = true;
					this.$.altBytes.disabled = false;
					this.$.altSeconds.disabled = false;
					this.$.altCents.disabled = false;
					this.$.altMessages.disabled = false;
					this.$.addAltUnitDrop.selected = 1;
				} else if(this.$.addAltType.selected == 2) {
					this.$.addalt5drop.disabled = true;
					this.$.altBytes.disabled = false;
					this.$.altSeconds.disabled = false;
					this.$.altCents.disabled = true;
					this.$.altMessages.disabled = false;
				}
			},
			addPrice: function(event) {
				function checkPriceName(price) {
					return price.name == document.getElementById("addPriceName").value;
				}
				var indexPrice = this.prices.findIndex(checkPriceName);
				if (indexPrice == -1) {
					var priceNew = new Object();
				} else {
					var priceNew = this.prices[indexPrice];
				}
				priceNew.name = this.$.addPriceName.value;
				priceNew.description = this.$.addPriceDesc.value;
				priceNew.start = this.$.addPriceStartDate.value;
				priceNew.end = this.$.addPriceEndDate.value;
				switch(this.$.addPriceType.selected) {
					case 0:
						priceNew.type = "recurring";
						break;
					case 1:
						priceNew.type = "one_time";
						break;
					case 2:
						priceNew.type = "usage";
						break;
					case 3:
						priceNew.type = "tariff";
				}
				switch(this.$.addPriceUnits.selected) {
					case 0:
						priceNew.unit = "b";
						break;
					case 1:
						priceNew.unit = "c";
						break;
					case 2:
						priceNew.unit = "s";
						break;
					case 3:
						priceNew.unit = "msg";
						break;
				}
				if (this.$.addPriceAmount.value) {
					priceNew.amount = this.$.addPriceAmount.value;
				}
				priceNew.size = this.$.addPriceSize.value;
				priceNew.currency = this.$.addPriceCurrency.value;
				switch(this.$.addPricePeriod.selected) {
					case 0:
						priceNew.period = "hourly";
						break
					case 1:
						priceNew.period = "daily";
						break;
					case 2:
						priceNew.period = "weekly";
						break;
					case 3:
						priceNew.period = "monthly";
						break
					case 4:
						priceNew.period = "yearly";
				}
				if(this.$.addPriceDrop.value) {
					function checkAlt(alts) {
						return alts.name == document.getElementById("addPriceDrop").value;
					}
					var altIndex = this.alterations.findIndex(checkAlt);
					priceNew.alterations = this.alterations[altIndex];
				}
				priceNew.reserveTime = this.$.addPriceCharReserveTime.value;
				priceNew.reserveBytes = this.$.addPriceCharReserveBytes.value;
				priceNew.timeOfDayRange = this.$.timeOfDayStart.value;
				priceNew.timeOfDayRange = this.$.timeOfDayEnd.value;
				if(this.$.checkIn.checked == true) {
					priceNew.callDirection = "answer";
				} else if(this.$.checkOut.checked == true) {
					priceNew.callDirection = "originate";
				}
				priceNew.prefixTariff = this.$.destPrefixTariff.value;
				priceNew.roamingTable = this.$.roamingTable.value;
				if(priceNew.name
						&& priceNew.type
						&& priceNew.unit
						&& (priceNew.size || priceNew.unit == "c")
						&& (priceNew.amount || priceNew.type == "tariff")) {
					if (indexPrice == -1) {
						this.push('prices', priceNew);
					} else {
						this.splice('prices', indexPrice, 1, priceNew);
						this.addOrUpdateButton = "add";
					}
					this.$.addPriceName.value = null;
					this.$.addPriceDesc.value = null;
					this.$.addPriceStartDate.value = null;
					this.$.addPriceEndDate.value = null;
					this.$.addPriceType.selected = null;
					this.$.addPriceSize.value = null;
					this.$.addPriceUnits.selected = null;
					this.$.addPriceAmount.value = null;
					this.$.addPriceCurrency.value = null;
					this.$.addPricePeriod.selected = null;
					this.$.addPriceAlteration.selected = null;
					this.$.addPriceCharReserveTime.value = null;
					this.$.addPriceCharReserveBytes.value = null;
					this.$.destPrefixTariff.value = null;
					this.$.roamingTable.value = null;
					this.$.timeOfDayStart.value = null;
					this.$.timeOfDayEnd.value = null;
					document.getElementById("addProductPriceToastSuccess").open();
				} else {
					document.getElementById("addProductToastError").open();
				}
			},
			_onClickPriceChars: function() {
				if(this.$.addPriceChars.opened == false) {
					this.$.addPriceChars.show();
					this.$.onClickPriceChars.icon="arrow-drop-up"
				} else {
					this.$.addPriceChars.hide();
					this.$.onClickPriceChars.icon="arrow-drop-down"
				}
			},
			_onClickPriceCharsTime: function() {
				if(this.$.addPriceCharsTime.opened == false) {
					this.$.addPriceCharsTime.show();
					this.$.onClickPriceCharsTime.icon="arrow-drop-up"
				} else {
					this.$.addPriceCharsTime.hide();
					this.$.onClickPriceChars.icon="arrow-drop-down"
				}
			},
			_onClickCall: function() {
				if(this.$.addCall.opened == false) {
					this.$.addCall.show();
					this.$.onClickCall.icon="arrow-drop-up";
				} else {
					this.$.addCall.hide();
					this.$.onClickCall.icon="arrow-drop-down"
				}
			},
			checkInChanged: function(event) {
				if(event.detail.value) {
					this.$.checkOut.checked = false;
				}
			},
			checkOutChanged: function(event) {
				if(event.detail.value) {
					this.$.checkIn.checked = false;
				}
			},
			addAlteration: function() {
				function checkAltName(alt) {
					return alt.name == document.getElementById("addAltName").value;
				}
				var indexAlt = this.alterations.findIndex(checkAltName);
				if (indexAlt == -1) {
					var altNew = new Object();
				} else {
					var altNew = this.prices[indexAlt];
				}
				var altNew = new Object();
				altNew.name = this.$.addAltName.value;
				altNew.description = this.$.addAltDesc.value;
				altNew.startdate = this.$.addAltStartDate.value;
				altNew.terminationDate = this.$.addAltEndDate.value;
				switch(this.$.addAltType.selected) {
					case 0:
						altNew.type = "recurring";
						break;
					case 1:
						altNew.type = "one_time";
						break;
					case 2:
						altNew.type = "usage";
				}
				altNew.size = this.$.addAltSize.value;
				if(this.$.addAltAmount.value) {
					altNew.amount= this.$.addAltAmount.value;
				}
				altNew.currency = this.$.addAltCurrency.value;
				switch(this.$.addAltPeriod.selected) {
					case 0:
						altNew.period = "hourly";
						break
					case 1:
						altNew.period = "daily";
						break;
					case 2:
						altNew.period = "weekly";
						break;
					case 3:
						altNew.period = "monthly";
						break
					case 4:
						altNew.period = "yearly";
				}
				switch(this.$.addAltUnitDrop.selected) {
					case 0:
						altNew.unit = "b";
						break;
					case 1:
						altNew.unit = "c";
						break
					case 2:
						altNew.unit = "s";
						break
					case 3:
						altNew.unit = "msg";
						break
				}
				if(altNew.name
						&& altNew.type
						&& altNew.unit
						&& (altNew.size || altNew.unit == "c")
						&& (altNew.amount || altNew.amount == 0)) {
					if (indexAlt == -1) {
						this.push('alterations', altNew);
					} else {
						this.splice('alterations', indexAlt, 1, altNew);
						this.addOrUpdateButton = "add";
					}
					this.$.addAltName.value = null
					this.$.addAltDesc.value = null;
					this.$.addAltStartDate.value = null;
					this.$.addAltEndDate.value = null;
					this.$.addAltType.selected = null;
					this.$.addAltSize.value = null;
					this.$.addAltUnitDrop.selected = null;
					this.$.addAltAmount.value = null;
					this.$.addAltCurrency.value = null;
					this.$.addAltPeriod.selected = null;
					document.getElementById("addProductAlterationToastSuccess").open();
				} else {
					document.getElementById("addProductToastError").open();
				}
			},
			_onLoadingChanged: function(event) {
				if (this.$.addProductAjax.loading) {
					document.getElementById("progress").disabled = false;
				} else {
					document.getElementById("progress").disabled = true;
				}
			},
			_addProductResponse: function(event) {
				this.$.addProductModal.close();
				document.getElementById("addProductToastSuccess").open();
				this.$.addOffName.value = null;
				this.$.addOffDesc.value = null;
				this.set('prices', []);
				this.set('alterations', []);
				document.getElementById("offerGrid").clearCache();
				this.cancelDialog();
			},
			_addProductError: function(event) {
				document.getElementById("addProductToastError").open();
			},
			cancelDialog: function() {
				this.set('prices', []);
				this.set('alterations', []);
				this.set('offers', []);
				this.addOrUpdateButton = "add";
				this.$.addOffName.value = null;
				this.$.addOffDesc.value = null;
				this.$.addOffProductSpecification.selected = null;
				this.$.addOffStart.value = null;
				this.$.addOffEnd.value = null;
				this.$.addOfferChars.hide();
				this.$.addBundle.hide();
				this.$.destPrefixTariff.value = null;
				this.$.roamingTable.value = null;
				this.$.addOfferCharReserveSession.value = null;
				this.$.addProductStartDatePickOff.hide()
				this.$.addProductEndDatePickOff.hide()
				this.$.addProductStartDatePickPrice.hide();
				this.$.addProductEndDatePickPrice.hide();
				this.$.addProductStartDatePickAlt.hide();
				this.$.addProductEndDatePickAlt.hide();
				this.$.addPriceName.value = null;
				this.$.addPriceDesc.value = null;
				this.$.addPriceStartDate.value = null;
				this.$.addPriceEndDate.value = null;
				this.$.addPriceType.selected = null;
				this.$.addPriceSize.value = null;
				this.$.addPriceUnits.selected = null;
				this.$.addPriceAmount.value = null;
				this.$.addPriceCurrency.value = null;
				this.$.addPricePeriod.selected = null;
				this.$.addPriceCharReserveTime.value = null;
				this.$.addPriceCharReserveBytes.value = null;
				this.$.addAltName.value = null
				this.$.addAltDesc.value = null;
				this.$.addAltStartDate.value = null;
				this.$.addAltEndDate.value = null;
				this.$.addAltType.selected = null;
				this.$.addAltSize.value = null;
				this.$.addAltUnitDrop.selected = null;
				this.$.addAltAmount.value = null;
				this.$.addAltCurrency.value = null;
				this.$.addAltPeriod.selected = null;
				this.$.timeOfDayStart.value = null;
				this.$.timeOfDayEnd.value = null;
				this.$.addProductModal.close();
			}
		});
	</script>
</dom-module>
