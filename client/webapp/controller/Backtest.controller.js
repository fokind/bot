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

                oView.setModel(
                    new JSONModel({
                        begin: "",
                        end: "",
                    }),
                    "view"
                );
                oView.setModel(new JSONModel());
                oView.setModel(new JSONModel(), "candles");
            },

            _onRouteMatched: function (oEvent) {
                var sBacktestId = oEvent.getParameter("arguments").id;
                this._getDataPromise(sBacktestId).then(
                    function () {
                        var oView = this.getView();
                        var oModel = oView.getModel();

                        console.log(oModel);
                        console.log(oView.getModel("candles"));

                        oView.getModel("view").setData({
                            begin: oModel.getProperty("/begin"),
                            end: oModel.getProperty("/end"),
                        });

                        this.byId("candlestickChart").refresh();
                        this.byId("cciozChart").refresh();
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

            onPress: function () {
                this.byId("candlestickChart").refresh();
                this.byId("cciozChart").refresh();
            },

            onBackPress: function () {
                this.getOwnerComponent().getRouter().navTo("backtests");
            },
        });
    }
);
