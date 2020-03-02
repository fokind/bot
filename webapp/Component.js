sap.ui.define(
  ["sap/ui/core/UIComponent", "sap/ui/core/ws/WebSocket", "sap/ui/Device",
    "sap/ui/core/EventBus"],
  function(UIComponent, WebSocket, Device, EventBus) {
    "use strict";

    return UIComponent.extend("fokind.bot.Component", {
      metadata: {
        manifest: "json"
      },

      init: function() {
        UIComponent.prototype.init.apply(this, arguments);
        
        var oModel = this.getModel("local");
        oModel.setData({
            Ticker: {},
          Candles: []
        });
        
        // TODO перенести в model

        var ws = new WebSocket("/ws");
        ws.attachMessage(function(oEvent) {
          var oMessage = JSON.parse(oEvent.getParameter("data"));
          switch (oMessage.name) {
            case "ticker":
              oModel.setProperty("/Ticker", oMessage.data);
              break;
            case "candle":
              var aCandles = oModel.getProperty("/Candles");
              var iLength = aCandles.length;
              var oData = oMessage.data;
              var oCandle = aCandles.filter(function(e) {
                return e.time === oData.time;
              })[0];
              if (oCandle) {
                var iIndex = aCandles.indexOf(oCandle);
                oModel.setProperty("/Candles/" + iIndex, oData);
              } else {
                oModel.setProperty("/Candles/" + iLength++, oData);
              }
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
  }
);
