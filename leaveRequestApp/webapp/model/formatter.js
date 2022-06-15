sap.ui.define([], function() {
	"use strict";

	return {

		/**
		 * Rounds the number unit value to 2 digits
		 * @public
		 * @param {string} sValue the number string to be rounded
		 * @returns {string} sValue with 2 digits rounded
		 */
		numberUnit: function(sValue) {
			if (!sValue) {
				return "";
			}
			return parseFloat(sValue).toFixed(2);
		},

		getLeaveType: function(sLeave) {
			var oResource = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			switch (sLeave) {
				case "0":
					return oResource.getText("PaidLeave");
				case "1":
					return oResource.getText("UnpaidLeave");
				case "2":
					return oResource.getText("MaternalLeave");
				case "3":
					return oResource.getText("PaternalLeave");
				case "4":
					return oResource.getText("IllnessLeave");
				case "5":
					return oResource.getText("MoveLeave");
				default:
					return " ";
			}
		}

	};

});