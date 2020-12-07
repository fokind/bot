sap.ui.define(
    [
        "sap/ui/core/mvc/Controller",
        "sap/ui/core/Fragment",
        "sap/ui/model/json/JSONModel",
    ],
    function (Controller, Fragment, JSONModel) {
        "use strict";

        return Controller.extend("fokind.bot.controller.CandleImports", {
            onInit: function () {
                this.getOwnerComponent()
                    .getRouter()
                    .getRoute("candleImports")
                    .attachMatched(this._onRouteMatched, this);

                var oView = this.getView();

                oView.addStyleClass(
                    this.getOwnerComponent().getContentDensityClass()
                );

                oView.setModel(new JSONModel());
            },

            _onRouteMatched: function () {
                var oModel = this.getView().getModel();

                oModel.loadData("/api/candleImports").then(function () {
                    console.log(oModel);
                });
            },

            _getCandleImportDialogPromise: function () {
                return new Promise(
                    function (resolve) {
                        var oView = this.getView();
                        if (!this.byId("candleImportDialog")) {
                            Fragment.load({
                                id: oView.getId(),
                                name: "fokind.bot.fragment.CandleImportDialog",
                                controller: this,
                            }).then(function (oDialog) {
                                oDialog.setModel(
                                    new JSONModel({
                                        exchange: "hitbtc", // FIXME зменить
                                        currency: "",
                                        asset: "",
                                        period: "",
                                        begin: "",
                                        end: "",
                                    })
                                );
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
                    oDialog.open();
                });
            },

            onOkPress: function () {
                this._getCandleImportDialogPromise().then(
                    function (oDialog) {
                        // var oModel = oDialog.getModel();
                        oDialog.close();
                        // var oTable = this.byId("candleImportsTable");
                        // oTable
                        //     .getBinding("rows")
                        //     .create({
                        //         exchange: oModel.getProperty("/exchange"),
                        //         currency: oModel.getProperty("/currency"),
                        //         asset: oModel.getProperty("/asset"),
                        //         period: +oModel.getProperty("/period"),
                        //         begin: oModel.getProperty("/begin"),
                        //         end: oModel.getProperty("/end"),
                        //     })
                        //     .created()
                        //     .then(function () {
                        //         oTable.getBindingContext("data").refresh();
                        //     });
                    }.bind(this)
                );
            },

            onCancelPress: function () {
                this._getCandleImportDialogPromise().then(function (oDialog) {
                    oDialog.close();
                });
            },

            onBackPress: function () {
                this.getOwnerComponent().getRouter().navTo("main");
            },
        });
    }
);
