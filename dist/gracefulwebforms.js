(function ($) {
  const GracefulWebForms = {
    init: function () {
      if (!$.fn.validate) {
        console.error("GracefulWebForms.js: jQuery Validation Plugin is not loaded.");
        return;
      }

      // ✅ Custom rule to validate at least one checked box/radio in a group
      $.validator.addMethod("requireFromGroup", function (value, element) {
        const $group = $(element).closest("fieldset").find("input[name='" + element.name + "']");
        return $group.filter(":checked").length > 0;
      });

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

          errorPlacement: function (error, element) {
            const fieldId = element.attr("id");
            const fieldType = element.attr("type");
            const describedById = fieldId + "-error";

            let labelText = "";

            if (fieldType === "checkbox" || fieldType === "radio") {
              const legend = element.closest("fieldset").find("legend").first();
              if (legend.length) {
                labelText = legend.text().trim();
              }
            } else {
              const label = $("label[for='" + fieldId + "']");
              if (label.length) {
                labelText = label.text().trim();
              }
            }

            if (labelText) {
              error.text(`Error: ${labelText} is required.`);
            }

            // Add ⚠️ icon visually
            const icon = $('<span aria-hidden="true" style="margin-right: 0.4rem;">⚠️</span>');
            error.prepend(icon);

            error.attr("id", describedById);
            element.attr("aria-invalid", "true");
            element.attr("aria-describedby", describedById);

            if (fieldType === "checkbox" || fieldType === "radio") {
              const fieldset = element.closest("fieldset");
              const legend = fieldset.find("legend").first();
              if (legend.length) {
                error.insertAfter(legend);
              } else {
                error.insertAfter(element);
              }
            } else {
              const label = $("label[for='" + fieldId + "']");
              if (label.length) {
                error.insertAfter(label);
              } else {
                error.insertAfter(element);
              }
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

        // ✅ Automatically add the requireFromGroup rule to radios/checkboxes
        $form.find("input[type='radio'][required], input[type='checkbox'][required]").each(function () {
          $(this).rules("add", {
            requireFromGroup: true,
            messages: {
              requireFromGroup: undefined // ensures custom message via errorPlacement
            }
          });
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
