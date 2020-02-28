sap.ui.define(["sap/ui/core/UIComponent", "sap/ui/core/ws/WebSocket", "sap/ui/Device"], function(
  UIComponent,
  WebSocket, Device
) {
  "use strict";

  return UIComponent.extend("fokind.bot.Component", {
    metadata: {
      manifest: "json"
    },

    init: function() {
      UIComponent.prototype.init.apply(this, arguments);
    //   var oRouter = this.getRouter();
    //           oRouter.initialize();
      var oModel = this.getModel();
      oModel.setData({
        messages: []
      });

      var ws = new WebSocket("/ws");
      ws.attachMessage(function(oEvent) {
        var aMessages = oModel.getProperty("/messages");
        var oMessage = JSON.parse(oEvent.getParameter("data"));
        switch (oMessage.name) {
            case "ticker":
                oModel.setProperty("/Ticker", oMessage.data);
                break;
            case "candles":
                var aCandles = oModel.getProperty("Candles");
                aCandles.push(oMessage.data);
                oModel.refresh();
        }
  });
    },
    
    getContentDensityClass: function() {
      if (!this._sContentDensityClass) {
        this._sContentDensityClass = Device.support.touch
          ? "sapUiSizeCozy"
          : "sapUiSizeCompact";
      }
      return this._sContentDensityClass;
    }
  });
});
