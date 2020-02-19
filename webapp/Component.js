sap.ui.define(["sap/ui/core/UIComponent"], function (UIComponent) {
	"use strict";

	return UIComponent.extend("fokind.bot.Component", {
		metadata: {
			manifest: "json"
		},

		init: function () {
			UIComponent.prototype.init.apply(this, arguments);
			var oModel = this.getModel();
			oModel.setData({
			    messages: []
			});
			
			var ws = new WebSocket(""); // UNDONE здесь должен быть адрес
			ws.attachMessage(function(oEvent) {
			    var aMessages = oModel.getProperty("/messages");
			    var sMessage = oEvent.getParameter("data");
			    aMessages.push({
			        message: sMessage
			    });
			    oModel.refresh();
			});
		}
	});
});