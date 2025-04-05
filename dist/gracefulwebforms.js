(function ($) {
  const GracefulWebForms = {
    init: function () {
      if (!$.fn.validate) {
        console.error("GracefulWebForms.js: jQuery Validation Plugin is not loaded.");
        return;
      }

      // Custom rule for checkbox/radio groups
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

          // ✅ Intercept error reuse and fix the text/icon
          showErrors: function (errorMap, errorList) {
            this.defaultShowErrors();

            for (let i = 0; i < errorList.length; i++) {
              const element = errorList[i].element;
              const $element = $(element);
              const fieldId = $element.attr("id");
              const type = $element.attr("type");
              let labelText = "";

              if (type === "checkbox" || type === "radio") {
                const legend = $element.closest("fieldset").find("legend").first();
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
                const errorId = fieldId + "-error";
                const $error = $("#" + errorId);
                if ($error.length) {
                  $error.html(`<span aria-hidden="true" style="margin-right: 0.4rem;">⚠️</span>Error: ${labelText} is required.`);
                }
              }
            }
          },

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

        // ✅ Automatically attach group validation with null message override
        $form.find("input[type='radio'][required], input[type='checkbox'][required]").each(function () {
          $(this).rules("add", {
            requireFromGroup: true,
            messages: {
              requireFromGroup: undefined
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
