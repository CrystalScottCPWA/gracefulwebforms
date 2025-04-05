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

        // Insert the live region once per form
        if ($form.find("#gwf-error-summary").length === 0) {
          $form.prepend('<div id="gwf-error-summary" class="sr-only" aria-live="polite" aria-atomic="true"></div>');
        }

        $form.validate({
          errorClass: "gwf-error",
          errorElement: "div",
          onkeyup: false,
          onclick: false,
          onfocusout: false,

          showErrors: function (errorMap, errorList) {
            // Inject accessible error summary for screen readers
            const $summary = $form.find("#gwf-error-summary");
            if (errorList.length > 0) {
              $summary.text(`There ${errorList.length === 1 ? "is" : "are"} ${errorList.length} required field${errorList.length === 1 ? "" : "s"} that need to be corrected.`);
            } else {
              $summary.text(""); // Clear if no errors
            }

            // Customize all required messages with label text
            for (let i = 0; i < errorList.length; i++) {
              const element = errorList[i].element;
              const $element = $(element);
              const id = $element.attr("id");
              const label = $("label[for='" + id + "']").text().trim();

              if (
                errorList[i].message === "This field is required." ||
                errorList[i].message === "Please fill out this field."
              ) {
                errorList[i].message = `Error: ${label} is required.`;
              }
            }

            this.defaultShowErrors();
          },

          errorPlacement: function (error, element) {
            const fieldId = element.attr("id");
            const describedById = fieldId + "-error";

            // Add decorative icon, visually only
            const icon = $('<span aria-hidden="true" style="margin-right: 0.4rem;">⚠️</span>');
            error.prepend(icon);

            error.attr("id", describedById);
            element.attr("aria-describedby", describedById);
            element.attr("aria-invalid", "true");

            error.insertAfter(element);
          },

          success: function (label, element) {
            $(element).removeAttr("aria-invalid");
            $(element).removeAttr("aria-describedby");
            label.remove();

            // Clear the live region if all errors are fixed
            if ($form.find(".gwf-error").length === 0) {
              $form.find("#gwf-error-summary").text("");
            }
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
