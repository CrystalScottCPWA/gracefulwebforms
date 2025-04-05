(function ($) {
  const GracefulWebForms = {
    init: function () {
      if (!$.fn.validate) {
        console.error("GracefulWebForms.js: jQuery Validation Plugin is not loaded.");
        return;
      }

      const forms = $("form[data-graceful-web-form]");
      console.log("[Graceful] Initializing on forms:", forms.length);

      forms.each(function () {
        const $form = $(this);

        $form.validate({
          errorClass: "gwf-error",
          errorElement: "div",
          onkeyup: false,
          onclick: false,
          onfocusout: false,

          showErrors: function (errorMap, errorList) {
            // Customize all required messages with label text
            for (let i = 0; i < errorList.length; i++) {
              const element = errorList[i].element;
              const $element = $(element);
              const id = $element.attr("id");

              // Get label text
              const label = $("label[for='" + id + "']").text().trim();

              // Only override if it's the generic message
              if (
                errorList[i].message === "This field is required." ||
                errorList[i].message === "Please fill out this field."
              ) {
                errorList[i].message = `Error: ${label} is required.`;
              }
            }

            // Now call the default handler
            this.defaultShowErrors();
          },

          errorPlacement: function (error, element) {
            const fieldId = element.attr("id");
            const describedById = fieldId + "-error";

            error.attr("id", describedById);
            error.attr("role", "alert");
            error.attr("aria-live", "polite");

            element.attr("aria-describedby", describedById);
            element.attr("aria-invalid", "true");

            error.insertAfter(element);
          },

          success: function (label, element) {
            $(element).removeAttr("aria-invalid");
            $(element).removeAttr("aria-describedby");
            label.remove();
          },

          invalidHandler: function (event, validator) {
            const errors = validator.numberOfInvalids();
            if (errors) {
              const firstInvalid = $(validator.errorList[0].element);
              firstInvalid.focus();
            }
          },
        });
      });
    },
  };

  // Wait until jQuery Validation is actually available
  function waitForValidator() {
    if ($.fn.validate) {
      GracefulWebForms.init();
    } else {
      console.log("[Graceful] Waiting for jQuery Validation Plugin...");
      setTimeout(waitForValidator, 100);
    }
  }

  waitForValidator();

  window.GracefulWebForms = GracefulWebForms;
})(jQuery);
