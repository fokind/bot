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

                this.getView().addStyleClass(
                    this.getOwnerComponent().getContentDensityClass()
                );
            },

            _onRouteMatched: function (oEvent) {
                var oView = this.getView();
                var sBacktestId = oEvent.getParameter("arguments").id;
                this._getDataPromise(sBacktestId).then(
                    function (oData) {
                        oView.setModel(new JSONModel(oData));
                        oView.bindElement({
                            path: "/",
                            events: {
                                change: function () {
                                    this.byId("candlestickChart").refresh();
                                    this.byId("balanceHistoryChart").refresh();
                                    var aIndicatorCharts = this.byId("indicatorCharts").getItems();
                                    console.log(aIndicatorCharts);
                                    console.log(oView.getModel().getData());
                                }.bind(this),
                            },
                        });
                    }.bind(this)
                );
            },

            _getDataPromise: function (sBacktestId) {
                var oModel = this.getView().getModel("data");
                var oContext = oModel.createBindingContext(
                    "/Backtests('" + sBacktestId + "')"
                );

                return oModel
                    .bindContext("", oContext, {
                        $expand: "Candles,BalanceHistory,Indicators",
                    })
                    .requestObject();
            },

            onClonePress: function () {
                this.getOwnerComponent()
                    .getRouter()
                    .navTo("backtestCreate", {
                        cloneId: this.getView()
                            .getBindingContext()
                            .getProperty("_id"),
                    });
            },

            onBackPress: function () {
                this.getOwnerComponent().getRouter().navTo("backtests");
            },
        });
    }
);
