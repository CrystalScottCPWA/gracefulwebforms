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
			  for (let i = 0; i < errorList.length; i++) {
			    const element = errorList[i].element;
			    const $element = $(element);
			    const id = $element.attr("id");
			    const label = $("label[for='" + id + "']").text().trim();
			
			    // Customize the message
			    if (
			      errorList[i].message === "This field is required." ||
			      errorList[i].message === "Please fill out this field."
			    ) {
			      errorList[i].message = `Error: ${label} is required.`;
			    }
			
			    // Inject icon into existing error message if missing
			    const errorContainer = $("#" + id + "-error");
			    if (errorContainer.length && errorContainer.find("span[aria-hidden='true']").length === 0) {
			      const icon = $('<span aria-hidden="true" style="margin-right: 0.4rem;">⚠️</span>');
			      errorContainer.prepend(icon);
			    }
			  }
			
			  // Call the default rendering
			  this.defaultShowErrors();
			},


          errorPlacement: function (error, element) {
            const fieldId = element.attr("id");
            const describedById = fieldId + "-error";

            const icon = $('<span aria-hidden="true" style="margin-right: 0.4rem;">⚠️</span>');
            error.prepend(icon);

            error.attr("id", describedById);
            element.attr("aria-describedby", describedById);
            element.attr("aria-invalid", "true");

            const label = $("label[for='" + fieldId + "']");
            if (label.length) {
              error.insertAfter(label);
            } else {
              error.insertAfter(element); // fallback
            }
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
