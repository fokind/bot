sap.ui.define(["sap/ui/core/mvc/Controller"], function(Controller) {
  "use strict";

  return Controller.extend("fokind.bot.controller.Sessions", {
    onInit: function() {
      var oComponent = this.getOwnerComponent();
      this.getView().addStyleClass(oComponent.getContentDensityClass());
    },

    onRowSelectionChange: function(oEvent) {
      this.getOwnerComponent()
        .getRouter()
        .navTo("session", {
          id: oEvent.getParameter("rowContext").getProperty("_id")
        });
    },

    onAddPress: function() {
      var oRouter = this.getOwnerComponent().getRouter();

      $.post({
        async: true,
        url: "/odata/Session",
        headers: {
          "Content-Type": "application/json"
        },
        data: {}
      }).then(function(oData) {
        oRouter.navTo("session", {
          id: oData._id
        });
      });
    }
  });
});
