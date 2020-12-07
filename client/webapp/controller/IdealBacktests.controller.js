sap.ui.define(
    ["sap/ui/core/mvc/Controller", "sap/ui/model/json/JSONModel"],
    function (Controller, JSONModel) {
        "use strict";

        return Controller.extend("fokind.bot.controller.IdealBacktests", {
            onInit: function () {
                this.getOwnerComponent()
                    .getRouter()
                    .getRoute("idealBacktests")
                    .attachMatched(this._onRouteMatched, this);

                var oView = this.getView();

                oView.addStyleClass(
                    this.getOwnerComponent().getContentDensityClass()
                );

                oView.setModel(new JSONModel());
            },

            _onRouteMatched: function () {
                var oModel = this.getView().getModel();

                oModel.loadData("/api/idealBacktests").then(function () {
                    console.log(oModel);
                });
            },

            onAddPress: function () {
                // this.getOwnerComponent().getRouter().navTo("backtestCreate");
            },

            onRowSelectionChange: function (oEvent) {
                this.getOwnerComponent()
                    .getRouter()
                    .navTo("idealBacktest", {
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
