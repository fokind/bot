sap.ui.define(
    ["sap/ui/core/mvc/Controller", "sap/ui/core/UIComponent"],
    function (Controller) {
        "use strict";

        return Controller.extend("fokind.bot.controller.IdealBacktests", {
            onInit: function () {
                this.getOwnerComponent()
                    .getRouter()
                    .getRoute("idealBacktests")
                    .attachMatched(this._onRouteMatched, this);

                this.getView().addStyleClass(
                    this.getOwnerComponent().getContentDensityClass()
                );
            },

            _onRouteMatched: function () {
                var oView = this.getView();
                oView.setModel(oView.getModel("data"));
            },

            onAddPress: function () {
                this.getOwnerComponent().getRouter().navTo("idealBacktestCreate");
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
