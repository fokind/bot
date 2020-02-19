sap.ui.define(["sap/ui/core/UIComponent", "sap/ui/core/ws/WebSocket"], function(
  UIComponent,
  WebSocket
) {
  "use strict";

  return UIComponent.extend("fokind.bot.Component", {
    metadata: {
      manifest: "json"
    },

    init: function() {
      UIComponent.prototype.init.apply(this, arguments);
      var oModel = this.getModel();
      oModel.setData({
        messages: []
      });

      var ws = new WebSocket("/ws"); // UNDONE здесь должен быть адрес
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
