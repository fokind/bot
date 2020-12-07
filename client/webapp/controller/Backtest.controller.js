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
            },

            _onRouteMatched: function (oEvent) {
                var oModel = this.getView().getModel()
                var sBacktestId = oEvent.getParameter("arguments").id;
                this._getDataPromise(sBacktestId).then(function() {
                    console.log(oModel);
                });
            },

            _getDataPromise: function (sBacktestId) {
                return this.getView().getModel().loadData("/api/backtests/" + sBacktestId);
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
