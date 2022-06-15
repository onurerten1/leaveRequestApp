/*global QUnit*/

jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/test/Opa5",
	"oe/leaveRequestApp/test/integration/pages/Common",
	"sap/ui/test/opaQunit",
	"oe/leaveRequestApp/test/integration/pages/Worklist",
	"oe/leaveRequestApp/test/integration/pages/Object",
	"oe/leaveRequestApp/test/integration/pages/NotFound",
	"oe/leaveRequestApp/test/integration/pages/Browser",
	"oe/leaveRequestApp/test/integration/pages/App"
], function (Opa5, Common) {
	"use strict";
	Opa5.extendConfig({
		arrangements: new Common(),
		viewNamespace: "oe.leaveRequestApp.view."
	});

	sap.ui.require([
		"oe/leaveRequestApp/test/integration/WorklistJourney",
		"oe/leaveRequestApp/test/integration/ObjectJourney",
		"oe/leaveRequestApp/test/integration/NavigationJourney",
		"oe/leaveRequestApp/test/integration/NotFoundJourney"
	], function () {
		QUnit.start();
	});
});