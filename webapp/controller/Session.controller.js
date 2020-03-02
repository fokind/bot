sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/EventBus"
  ],
  function(Controller, EventBus) {
    "use strict";

    return Controller.extend("fokind.bot.controller.Session", {
      onInit: function() {
        var oComponent = this.getOwnerComponent();
        oComponent
          .getRouter()
          .getRoute("session")
          .attachMatched(this._onRouteMatched, this);
        this.getView().addStyleClass(oComponent.getContentDensityClass());
      },

      _onRouteMatched: function(oEvent) {
        var oView = this.getView();
        var sSessionId = oEvent.getParameter("arguments").id;
        var sPath = "/Session('" + sSessionId + "')";
        this._sPath = sPath;

        var oLocalModel = this.getView().getModel("local"); // TODO перенести в model
        this.getView()
          .getModel("data")
          .bindContext(sPath, null, {
            $expand: "Ticker,Candles"
          })
          .requestObject()
          .then(
            function(oData) {
                oLocalModel.setData({
                    exchange: oData.exchange,
                    currency: oData.currency,
                    asset: oData.asset,
                    period: oData.period,
                    begin: oData.begin.slice(0, 10),
                    end: oData.end.slice(0, 10),
                    Ticker: oData.Ticker, // UNDONE проверить
                    Candles: oData.Candles // UNDONE проверить
              }); // TODO проверить как
            });
      },
      
      onBackPress: function() {
        this.getOwnerComponent()
          .getRouter()
          .navTo("sessions");
      },

      onStartPress: function() {
        $.post("/odata" + this._sPath + "/action.start");
      },

      onStopPress: function() {
        $.post("/odata" + this._sPath + "/action.stop");
      }
    });
  }
);