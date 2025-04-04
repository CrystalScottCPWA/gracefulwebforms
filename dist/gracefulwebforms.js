// GracefulWebForms.js
(function ($) {
  const GracefulWebForms = {
    init: function () {
      const forms = $("form[data-graceful-web-form]");

      forms.each(function () {
        const $form = $(this);

        // Setup validation
        $form.validate({
          errorClass: "gwf-error", // Custom error class
          errorElement: "div",
          onkeyup: false,
          onclick: false,
          onfocusout: false,

          errorPlacement: function (error, element) {
            const describedById = element.attr("id") + "-error";
            error.attr("id", describedById);
            error.attr("role", "alert");
            error.attr("aria-live", "polite");
            error.insertAfter(element);

            element.attr("aria-describedby", describedById);
            element.attr("aria-invalid", "true");
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

  // Expose globally
  window.GracefulWebForms = GracefulWebForms;
})(jQuery);
