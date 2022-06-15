/*global location history */
sap.ui.define([
	"oe/leaveRequestApp/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"oe/leaveRequestApp/model/formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/MessageToast",
	"sap/m/library",
	"sap/m/Dialog",
	"sap/m/Button",
	"sap/m/Text"
], function(BaseController, JSONModel, formatter, Filter, FilterOperator, MessageToast, mobileLibrary, Dialog, Button, Text) {
	"use strict";
	var ButtonType = mobileLibrary.ButtonType;
	var DialogType = mobileLibrary.DialogType;

	return BaseController.extend("oe.leaveRequestApp.controller.Worklist", {

		formatter: formatter,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when the worklist controller is instantiated.
		 * @public
		 */

		onInit: function() {
			var oRequestList = new JSONModel([{
				nameSurname: "Onur Erten",
				startDate: new Date(2022, 4, 30),
				endDate: new Date(2022, 4, 31),
				days: 2,
				leaveType: "0",
				state: true
			}]);

			this.getView().setModel(oRequestList, "requestList");

			var oPanel = this.byId("idPanelForm");
			oPanel.setExpanded(!oPanel.getExpanded());
		},

		onSendRequest: function(oEvent) {
			var oResource = this.getView().getModel("i18n").getResourceBundle();

			var vStartDate = this.getView().byId("idStartDate").getDateValue();
			var vEndDate = this.getView().byId("idEndDate").getDateValue();
			var vNameSurname = this.getView().byId("idName").getValue();
			var vLeaveType = this.getView().byId("idLeaveType").getSelectedKey();

			var vError = false;

			if (vNameSurname.length < 1) {
				this.getView().byId("idName").setValueState("Error");
				vError = true;
			}

			if (vStartDate === null) {
				this.getView().byId("idStartDate").setValueState("Error");
				vError = true;
			}

			if (vEndDate === null) {
				this.getView().byId("idEndDate").setValueState("Error");
				vError = true;
			}

			if (vError === true) {
				MessageToast.show(oResource.getText("RequiredMessage"));
			} else if (vStartDate > vEndDate) {
				MessageToast.show(oResource.getText("DateControlMessage"));
			} else if ((vStartDate.getDay() === 0 || vStartDate.getDay() === 6) || (vEndDate.getDay() === 0 || vEndDate.getDay() === 6)) {
				MessageToast.show(oResource.getText("WeekendDateControlMessage"));
			} else {
				var aRequestData = this.getView().getModel("requestList").getData();
				var sRequestList = {
					nameSurname: vNameSurname,
					startDate: vStartDate,
					endDate: vEndDate,
					days: this.getDayDifference(vStartDate, vEndDate),
					leaveType: vLeaveType,
					state: false
				};
				aRequestData.push(sRequestList);
				this.getModel("requestList").setData(aRequestData);
				this.byId("leaveRequestTable").clearSelection();
				this.getView().byId("idName").setValue(null);
				this.getView().byId("idStartDate").setDateValue(null);
				this.getView().byId("idEndDate").setDateValue(null);
				this.getView().byId("idLeaveType").setSelectedKey("0");
				MessageToast.show(oResource.getText("RequestSentMessage"));
			}
		},

		getDayDifference: function(startDate, endDate) {
			var result = 0;
			var counter = 0;
			var currentDate = startDate;
			while (currentDate <= endDate) {
				var weekDay = currentDate.getDay();
				if (weekDay !== 0 && weekDay !== 6) {
					result++;
				}
				currentDate.setDate(currentDate.getDate() + 1);
				counter++;
			}
			currentDate.setDate(currentDate.getDate() - counter);
			return result;
		},

		getSelections: function() {
			return this.byId("leaveRequestTable").getSelectedIndices();
		},

		onDeleteLine: function(oEvent) {
			var oResource = this.getView().getModel("i18n").getResourceBundle();

			var aSelections = this.getSelections();
			var aRequestData = this.getView().getModel("requestList").getData();
			if (aSelections.length === 1) {
				if (!this.oApproveDialog) {
					this.oApproveDialog = new Dialog({
						type: DialogType.Message,
						title: oResource.getText("Confirm"),
						content: new Text({
							text: oResource.getText("ConfirmQuestion")
						}),
						beginButton: new Button({
							type: ButtonType.Emphasized,
							text: oResource.getText("Yes"),
							press: function() {
								aRequestData.splice(aSelections[0], 1);
								this.getModel("requestList").setData(aRequestData);
								this.byId("leaveRequestTable").clearSelection();
								MessageToast.show(oResource.getText("LineDeleted"));
								this.oApproveDialog.close();
							}.bind(this)
						}),
						endButton: new Button({
							text: oResource.getText("Cancel"),
							press: function() {
								this.oApproveDialog.close();
							}.bind(this)
						})
					});
				}
				this.oApproveDialog.open();
			} else {
				MessageToast.show(oResource.getText("SelectLine"));
			}
		},

		onPressShowAccepted: function(oEvent) {
			var oResource = this.getView().getModel("i18n").getResourceBundle();
			var aRequestData = this.getView().getModel("requestList").getData();
			var oApprovedList = new JSONModel([]);
			var aApprovedList = oApprovedList.getData();
			for (var i = 0; i < aRequestData.length; i++) {
				if (aRequestData[i].state === true) {
					var sApproved = {
						nameSurname: aRequestData[i].nameSurname,
						startDate: aRequestData[i].startDate,
						endDate: aRequestData[i].endDate,
						days: aRequestData[i].days,
						leaveType: aRequestData[i].leaveType
					};
					aApprovedList.push(sApproved);
				}
			}
			if (aApprovedList.length > 0) {
				this.getView().setModel(oApprovedList, "approvedRequestsList");
				this._getDialogShow("idShow", "oe.leaveRequestApp.fragment.DisplayApprovedRequests").open();
			} else {
				MessageToast.show(oResource.getText("NoApprovedMessage"));
			}
		},

		_getDialogShow: function(id, fragment) {
			if (!this._oDialog) {
				this._oDialog = sap.ui.xmlfragment(id, fragment, this);
				this.getView().addDependent(this._oDialog);
			}
			return this._oDialog;
		},

		dialogAftercloseShow: function(oEvent) {
			this._oDialog.destroy();
			this._oDialog = undefined;
		},

		onFragmentExitShow: function(oEvent) {
			this._getDialogShow().close();
		},

		_getDialogEdit: function(id, fragment) {
			if (!this._pDialog) {
				this._pDialog = sap.ui.xmlfragment(id, fragment, this);
				this.getView().addDependent(this._pDialog);
			}
			return this._pDialog;
		},

		dialogAftercloseEdit: function(oEvent) {
			this._pDialog.destroy();
			this._pDialog = undefined;
		},

		onFragmentExitEdit: function(oEvent) {
			this._getDialogEdit().close();
		},

		onEditLine: function(oEvent) {
			var oResource = this.getView().getModel("i18n").getResourceBundle();
			var aSelections = this.getSelections();
			var aRequestData = this.getView().getModel("requestList").getData();
			if (aSelections.length === 1) {
				var sRequestData = aRequestData[aSelections[0]];
				var oRequestEdit = new JSONModel({
					nameSurname: sRequestData.nameSurname,
					startDate: sRequestData.startDate,
					endDate: sRequestData.endDate,
					days: sRequestData.days,
					leaveType: sRequestData.leaveType,
					state: sRequestData.state
				});

				this.getView().setModel(oRequestEdit, "request");
				this._getDialogEdit("idEdit", "oe.leaveRequestApp.fragment.ChangeRequestLine").open();
				this._aSelections = aSelections;
			} else {
				MessageToast.show(oResource.getText("SelectLine"));
			}
		},

		onEditRequest: function(oEvent) {
			var oResource = this.getView().getModel("i18n").getResourceBundle();

			var vStartDate = sap.ui.core.Fragment.byId("idEdit", "idStartDateF").getDateValue();
			var vEndDate = sap.ui.core.Fragment.byId("idEdit", "idEndDateF").getDateValue();
			var vLeaveType = sap.ui.core.Fragment.byId("idEdit", "idLeaveTypeF").getSelectedKey();

			var vError = false;

			if (vStartDate === null) {
				sap.ui.core.Fragment.byId("idEdit", "idStartDateF").setValueState("Error");
				vError = true;
			}

			if (vEndDate === null) {
				sap.ui.core.Fragment.byId("idEdit", "idEndDateF").setValueState("Error");
				vError = true;
			}

			if (vError === true) {
				MessageToast.show(oResource.getText("RequiredMessage"));
			} else if (vStartDate > vEndDate) {
				MessageToast.show(oResource.getText("DateControlMessage"));
			} else if ((vStartDate.getDay() === 0 || vStartDate.getDay() === 6) || (vEndDate.getDay() === 0 || vEndDate.getDay() === 6)) {
				MessageToast.show(oResource.getText("WeekendDateControlMessage"));
			} else {
				var aRequestData = this.getView().getModel("requestList").getData();
				aRequestData[this._aSelections[0]].startDate = vStartDate;
				aRequestData[this._aSelections[0]].endDate = vEndDate;
				aRequestData[this._aSelections[0]].days = this.getDayDifference(vStartDate, vEndDate);
				aRequestData[this._aSelections[0]].leaveType = vLeaveType;
				aRequestData[this._aSelections[0]].state = false;
				this.getModel("requestList").setData(aRequestData);
				this.byId("leaveRequestTable").clearSelection();

				this.onFragmentExitEdit();
				MessageToast.show(oResource.getText("RequestUpdatedMessage"));
			}
		}

	});
});