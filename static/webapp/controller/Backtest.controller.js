sap.ui.define(["sap/ui/core/mvc/Controller"], function (Controller) {
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
            oView.setModel(oView.getModel("data"));
            oView.bindElement({
                path: "/Backtests('" + sBacktestId + "')",
            });

            // использовать при редактировании
            // var oDataModel = oView.getModel("data");
            // var oContextBinding = oDataModel.bindContext("/Backtests('" + sBacktestId + "')");
            // oContextBinding.requestObject().then(function (oData) {
            // console.log(oData);
            // });
        },

        onBackPress: function () {
            this.getOwnerComponent().getRouter().navTo("backtests");
        },
    });
});