(function ($) {
  const GracefulWebForms = {
    init: function () {
      if (!$.fn.validate) {
        console.error("GracefulWebForms.js: jQuery Validation Plugin is not loaded.");
        return;
      }

      // ✅ Correct global override using .defaultMessage (not .defaults.messages)
      $.validator.prototype.defaultMessage = function (element, rule) {
        if (rule === "required") {
          const $element = $(element);
          const id = $element.attr("id");
          const type = $element.attr("type");
          let label = "";

          if (type === "checkbox" || type === "radio") {
            const legend = $element.closest("fieldset").find("legend").first();
            if (legend.length) {
              label = legend.text().trim();
            }
          } else {
            const labelEl = $("label[for='" + id + "']");
            if (labelEl.length) {
              label = labelEl.text().trim();
            }
          }

          return label ? `Error: ${label} is required.` : "This field is required.";
        }

        return $.validator.messages[rule] || "This field is required.";
      };

      // ✅ Custom rule for checkbox/radio groups
      $.validator.addMethod("requireFromGroup", function (value, element) {
        const $group = $(element).closest("fieldset").find("input[name='" + element.name + "']");
        return $group.filter(":checked").length > 0;
      }, $.validator.prototype.defaultMessage);

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
            const type = element.attr("type");
            const fieldId = element.attr("id");
            const describedById = fieldId + "-error";

            // Add icon if not present
            const icon = $('<span aria-hidden="true" style="margin-right: 0.4rem;">⚠️</span>');
            error.prepend(icon);

            error.attr("id", describedById);
            element.attr("aria-invalid", "true");

            if (type === "checkbox" || type === "radio") {
              const fieldset = element.closest("fieldset");
              const legend = fieldset.find("legend").first();
              const legendId = legend.attr("id") || fieldId + "-legend";
              if (!legend.attr("id")) legend.attr("id", legendId);
              fieldset.find("input").attr("aria-describedby", describedById);
              error.insertAfter(legend);
            } else {
              element.attr("aria-describedby", describedById);
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

        // ✅ Automatically apply group validation to radios/checkboxes
        $form.find("input[type='radio'][required], input[type='checkbox'][required]").each(function () {
          $(this).rules("add", {
            requireFromGroup: true
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
