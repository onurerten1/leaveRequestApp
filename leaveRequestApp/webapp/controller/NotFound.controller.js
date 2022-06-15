sap.ui.define([
		"oe/leaveRequestApp/controller/BaseController"
	], function (BaseController) {
		"use strict";

		return BaseController.extend("oe.leaveRequestApp.controller.NotFound", {

			/**
			 * Navigates to the worklist when the link is pressed
			 * @public
			 */
			onLinkPressed : function () {
				this.getRouter().navTo("worklist");
			}

		});

	}
);