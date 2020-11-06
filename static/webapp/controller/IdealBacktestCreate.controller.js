/* global moment */

sap.ui.define(
    [
        "sap/ui/core/mvc/Controller",
        "sap/ui/model/json/JSONModel",
        "../thirdparty/moment-with-locales",
    ],
    function (Controller, JSONModel) {
        "use strict";

        return Controller.extend("fokind.bot.controller.IdealBacktestCreate", {
            onInit: function () {
                this.getOwnerComponent()
                    .getRouter()
                    .getRoute("idealBacktestCreate")
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
                        "/IdealBacktests('" + sBacktestId + "')"
                    );
                    oPromise = oContextBinding.requestObject().then(
                        function (oData) {
                            return {
                                exchange: oData.exchange,
                                currency: oData.currency,
                                asset: oData.asset,
                                period: "" + oData.period,
                                begin: moment
                                    .utc(oData.begin)
                                    .format("YYYY-MM-DD"),
                                end: moment.utc(oData.end).format("YYYY-MM-DD"),
                                fee: "" + oData.fee,
                                initialBalance: "" + oData.initialBalance,
                            };
                        }.bind(this)
                    );
                } else {
                    oPromise = Promise.resolve({
                        exchange: "hitbtc", // FIXME
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
                    fee: +oBindingContext.getProperty("fee"),
                    initialBalance: +oBindingContext.getProperty(
                        "initialBalance"
                    ),
                };
            },

            onRunPress: function () {
                var oDataModel = this.getView().getModel("data");
                var oListBinding = oDataModel.bindList("/IdealBacktests");
                var oContext = oListBinding.create(this._getData());
                oContext.created().then(
                    function () {
                        this.getOwnerComponent()
                            .getRouter()
                            .navTo("idealBacktest", {
                                id: oContext.getProperty("_id"),
                            });
                    }.bind(this)
                );
            },

            onBackPress: function () {
                this.getOwnerComponent().getRouter().navTo("idealBacktests");
            },
        });
    }
);
