sap.ui.define(
    ["sap/ui/core/mvc/Controller", "sap/ui/model/json/JSONModel"],
    function (Controller, JSONModel) {
        "use strict";

        return Controller.extend("fokind.bot.controller.IdealBacktest", {
            onInit: function () {
                this.getOwnerComponent()
                    .getRouter()
                    .getRoute("idealBacktest")
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
                                }.bind(this),
                            },
                        });
                    }.bind(this)
                );
            },

            _getDataPromise: function (sBacktestId) {
                var oModel = this.getView().getModel("data");
                var oContext = oModel.createBindingContext(
                    "/IdealBacktests('" + sBacktestId + "')"
                );

                return oModel
                    .bindContext("", oContext, {
                        $expand: "Candles,BalanceHistory",
                    })
                    .requestObject();
            },

            onClonePress: function () {
                this.getOwnerComponent()
                    .getRouter()
                    .navTo("idealBacktestCreate", {
                        cloneId: this.getView()
                            .getBindingContext()
                            .getProperty("_id"),
                    });
            },

            onBackPress: function () {
                this.getOwnerComponent().getRouter().navTo("idealBacktests");
            },
        });
    }
);
