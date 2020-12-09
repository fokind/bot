sap.ui.define(
    ["sap/ui/core/mvc/Controller", "sap/ui/model/json/JSONModel"],
    function (Controller, JSONModel) {
        "use strict";

        return Controller.extend("fokind.bot.controller.Backtest", {
            onInit: function () {
                this.getOwnerComponent()
                    .getRouter()
                    .getRoute("backtest")
                    .attachMatched(this._onRouteMatched, this);

                var oView = this.getView();

                oView.addStyleClass(
                    this.getOwnerComponent().getContentDensityClass()
                );

                oView.setModel(new JSONModel());
                oView.setModel(new JSONModel(), "candles");
            },

            _onRouteMatched: function (oEvent) {
                var sBacktestId = oEvent.getParameter("arguments").id;
                this._getDataPromise(sBacktestId).then(
                    function () {
                        var oView = this.getView();
                        console.log(oView.getModel());
                        console.log(oView.getModel("candles"));

                        this.byId("candlestickChart").refresh();
                    }.bind(this)
                );
            },

            _getDataPromise: function (sBacktestId) {
                var oView = this.getView();
                var sBaseUrl = "/api/backtests/" + sBacktestId;

                return Promise.all([
                    oView.getModel().loadData(sBaseUrl),
                    oView.getModel("candles").loadData(sBaseUrl + "/candles"),
                ]);
            },

            onClonePress: function () {
                // this.getOwnerComponent()
                //     .getRouter()
                //     .navTo("backtestCreate", {
                //         cloneId: this.getView()
                //             .getBindingContext()
                //             .getProperty("_id"),
                //     });
            },

            onBackPress: function () {
                this.getOwnerComponent().getRouter().navTo("backtests");
            },
        });
    }
);
