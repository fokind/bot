/* global moment */

sap.ui.define(
    [
        "sap/ui/core/mvc/Controller",
        "sap/ui/model/json/JSONModel",
        "../thirdparty/moment-with-locales",
    ],
    function (Controller, JSONModel) {
        "use strict";

        return Controller.extend("fokind.bot.controller.BacktestCreate", {
            onInit: function () {
                this.getOwnerComponent()
                    .getRouter()
                    .getRoute("backtestCreate")
                    .attachMatched(this._onRouteMatched, this);

                this.getView().addStyleClass(
                    this.getOwnerComponent().getContentDensityClass()
                );
            },

            _onRouteMatched: function () {
                var oView = this.getView();
                oView.setModel(
                    new JSONModel({
                        exchange: "hitbtc",
                    })
                );
                oView.bindElement({
                    path: "/",
                });
            },

            _getData: function () {
                var oBindingContext = this.getView().getBindingContext();
                return {
                    exchange: oBindingContext.getProperty("exchange"),
                    currency: oBindingContext.getProperty("currency"),
                    asset: oBindingContext.getProperty("asset"),
                    period: +oBindingContext.getProperty("period"), // сделать через тип
                    begin: moment
                        .utc(oBindingContext.getProperty("begin"))
                        .startOf("day")
                        .toISOString(),
                    end: moment
                        .utc(oBindingContext.getProperty("end"))
                        .endOf("day")
                        .toISOString(),
                    strategyName: oBindingContext.getProperty("strategyName"),
                    strategyWarmup: +oBindingContext.getProperty(
                        "strategyWarmup"
                    ),
                    strategyCode: oBindingContext.getProperty("strategyCode"),
                    strategyIndicatorInputs: oBindingContext.getProperty(
                        "strategyIndicatorInputs"
                    ),
                    stoplossLevel: +oBindingContext.getProperty(
                        "stoplossLevel"
                    ),
                    fee: +oBindingContext.getProperty("fee"),
                    initialBalance: +oBindingContext.getProperty(
                        "initialBalance"
                    ),
                };
            },

            onRunPress: function () {
                var oDataModel = this.getView().getModel("data");
                var oListBinding = oDataModel.bindList("/Backtests");
                var oContext = oListBinding.create(this._getData());
                oContext.created().then(
                    function () {
                        this.getOwnerComponent()
                            .getRouter()
                            .navTo("backtest", {
                                id: oContext.getProperty("_id"),
                            });
                    }.bind(this)
                );
            },

            onBackPress: function () {
                this.getOwnerComponent().getRouter().navTo("backtests");
            },
        });
    }
);
