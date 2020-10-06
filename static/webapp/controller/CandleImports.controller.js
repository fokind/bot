sap.ui.define(
    [
        "sap/ui/core/mvc/Controller",
        "sap/ui/core/UIComponent",
        "sap/ui/core/Fragment",
        "sap/ui/model/json/JSONModel",
    ],
    function (Controller, UIComponent, Fragment, JSONModel) {
        "use strict";

        return Controller.extend("fokind.bot.controller.CandleImports", {
            onInit: function () {
                // UIComponent.getRouterFor(this)
                //     .getRoute("marketData")
                //     .attachPatternMatched(this.onRouteMatched, this);
            },

            onRouteMatched: function (oEvent) {
                // this.getView()
                //     .getModel("view")
                //     .setProperty("/tab", "marketData");
                // this.getView().getModel("view").setProperty("/Draft", {
                //     name: "", // UNDONE
                // });
            },

            _getCandleImportDialogPromise: function () {
                return new Promise(
                    function (resolve) {
                        var oView = this.getView();
                        console.log(1);

                        if (!this.byId("candleImportDialog")) {
                            Fragment.load({
                                id: oView.getId(),
                                name: "fokind.bot.fragment.CandleImportDialog",
                                controller: this,
                            }).then(function (oDialog) {
                                oView.addDependent(oDialog);
                                oDialog.setModel(new JSONModel());
                                resolve(oDialog);
                            });
                        } else {
                            resolve(this.byId("candleImportDialog"));
                        }
                    }.bind(this)
                );
            },

            onAddPress: function () {
                this._getCandleImportDialogPromise().then(function (oDialog) {
                    oDialog.getModel().setData({});
                    oDialog.open();
                });
            },

            onOkPress: function () {
                // дождаться выполнения
                this._getCandleImportDialogPromise().then(
                    function (oDialog) {
                        var oData = oDialog.getModel().getData();
                        oDialog.close();
                        var oTable = this.byId("candleImportsTable");
                        oTable
                            .getBinding("items")
                            .create({
                                currency: oData.currency,
                                asset: oData.asset,
                                period: oData.period,
                            })
                            .created()
                            .then(function () {
                                oTable.getBindingContext("data").refresh();
                            });
                    }.bind(this)
                );
            },

            onCancelPress: function () {
                this._getCandleImportDialogPromise().then(function (oDialog) {
                    oDialog.close();
                });
            },

            // onNavBack: function() {
            // 	window.history.go(-1);
            // }
        });
    }
);
