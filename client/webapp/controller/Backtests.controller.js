sap.ui.define(
    ["sap/ui/core/mvc/Controller", "sap/ui/model/json/JSONModel"],
    function (Controller, JSONModel) {
        "use strict";

        return Controller.extend("fokind.bot.controller.Backtests", {
            onInit: function () {
                this.getOwnerComponent()
                    .getRouter()
                    .getRoute("backtests")
                    .attachMatched(this._onRouteMatched, this);

                var oView = this.getView();

                oView.addStyleClass(
                    this.getOwnerComponent().getContentDensityClass()
                );

                oView.setModel(new JSONModel());
            },

            _onRouteMatched: function () {
                var oModel = this.getView().getModel();

                oModel.loadData("/api/backtests").then(function () {
                    console.log(oModel);
                });
            },

            onAddPress: function () {
                // this.getOwnerComponent().getRouter().navTo("backtestCreate");
            },

            onRowSelectionChange: function (oEvent) {
                this.getOwnerComponent()
                    .getRouter()
                    .navTo("backtest", {
                        id: oEvent
                            .getParameter("rowContext")
                            .getProperty("_id"),
                    });
            },

            onBackPress: function () {
                this.getOwnerComponent().getRouter().navTo("main");
            },
        });
    }
);
