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

            _onRouteMatched: function (oEvent) {
                var sCloneId = oEvent.getParameter("arguments").cloneId;
                var oView = this.getView();
                this._initDataPromise(sCloneId).then(function (oData) {
                    oView.setModel(new JSONModel(oData));
                    oView.bindElement({
                        path: "/",
                    });
                });
            },

            _initDataPromise: function (sBacktestId) {
                var oPromise;
                if (sBacktestId) {
                    var oDataModel = this.getView().getModel("data");
                    var oContextBinding = oDataModel.bindContext(
                        "/Backtests('" + sBacktestId + "')"
                    );
                    oPromise = oContextBinding.requestObject().then(
                        function (oData) {
                            console.log(oData);
                            return {
                                exchange: oData.exchange,
                                currency: oData.currency,
                                asset: oData.asset,
                                period: "" + oData.period,
                                begin: moment
                                    .utc(oData.begin)
                                    .format("YYYY-MM-DD"),
                                end: moment.utc(oData.end).format("YYYY-MM-DD"),
                                strategyName: oData.strategyName,
                                strategyWarmup: "" + oData.strategyWarmup,
                                strategyCode: oData.strategyCode,
                                strategyIndicatorInputs:
                                    oData.strategyIndicatorInputs,
                                stoplossLevel: "" + oData.stoplossLevel,
                                fee: "" + oData.fee,
                                initialBalance: "" + oData.initialBalance,
                            };
                        }.bind(this)
                    );
                } else {
                    oPromise = Promise.resolve({
                        exchange: "hitbtc",
                    });
                }
                return oPromise;
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
