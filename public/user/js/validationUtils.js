// validationUtils.js

const validationUtils = (() => {
  // Function to show invalid feedback
  const showInvalidFeedback = (inputElement, message) => {
    inputElement.classList.add("is-invalid");
    inputElement.classList.remove("is-valid");
    if (inputElement.nextElementSibling) {
      inputElement.nextElementSibling.textContent = message;
    }
  };

  // Function to clear invalid feedback
  const clearInvalidFeedback = (inputElement) => {
    inputElement.classList.remove("is-invalid");
    inputElement.classList.add("is-valid");
    if (inputElement.nextElementSibling) {
      inputElement.nextElementSibling.textContent = "";
    }
  };

  // Validate if a field is empty
  const validateRequiredField = (
    inputElement,
    message = "This field is required."
  ) => {
    if (!inputElement.value.trim()) {
      showInvalidFeedback(inputElement, message);
      return false;
    }
    clearInvalidFeedback(inputElement);
    return true;
  };

  // Validate number
  const validateNumber = (
    numberElement,
    message = "Please enter a valid number greater than zero."
  ) => {
    const value = parseFloat(numberElement.value);
    if (isNaN(value) || value <= 0) {
      showInvalidFeedback(numberElement, message);
      return false;
    }
    clearInvalidFeedback(numberElement);
    return true;
  };

  // Validate date range (start date should be before end date)
  const validateDateRange = (
    startDateElement,
    endDateElement,
    message = "Start date cannot be later than end date."
  ) => {
    const startDateValue = startDateElement.value;
    const endDateValue = endDateElement.value;

    if (new Date(startDateValue) > new Date(endDateValue)) {
      showInvalidFeedback(startDateElement, message);
      showInvalidFeedback(endDateElement, message);
      return false;
    }
    clearInvalidFeedback(startDateElement);
    clearInvalidFeedback(endDateElement);
    return true;
  };

  // Validate email format using a regular expression
  const validateEmail = (
    emailElement,
    message = "Please enter a valid email address."
  ) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(emailElement.value)) {
      showInvalidFeedback(emailElement, message);
      return false;
    }
    clearInvalidFeedback(emailElement);
    return true;
  };

  // Validate select dropdown (ensure an option is selected)
  const validateSelect = (
    selectElement,
    message = "Please select an option."
  ) => {
    if (selectElement.value === "" || selectElement.value === "default") {
      showInvalidFeedback(selectElement, message);
      return false;
    }
    clearInvalidFeedback(selectElement);
    return true;
  };

  // Validate password length
  const validatePasswordLength = (
    passwordElement,
    minLength = 8,
    message = `Password must be at least ${minLength} characters.`
  ) => {
    if (passwordElement.value.length < minLength) {
      showInvalidFeedback(passwordElement, message);
      return false;
    }
    clearInvalidFeedback(passwordElement);
    return true;
  };

  const validateImageCount = (
    inputElement,
    minCount = 3,
    message = `Please upload at least ${minCount} images.`
  ) => {
    if (inputElement.files.length < minCount) {
      showInvalidFeedback(inputElement, message);
      return false;
    }
    clearInvalidFeedback(inputElement);
    return true;
  };

  // Generic form validator that accepts dynamic validation rules
  const validateForm = (formId, validationRules) => {
    const form = document.getElementById(formId);
    let isValid = true;

    validationRules.forEach((rule) => {
      const element = document.getElementById(rule.id);
      switch (rule.type) {
        case "required":
          if (!validateRequiredField(element, rule.message)) isValid = false;
          break;
        case "email":
          if (!validateEmail(element, rule.message)) isValid = false;
          break;
        case "passwordLength":
          if (!validatePasswordLength(element, rule.minLength, rule.message))
            isValid = false;
          break;
        case "select":
          if (!validateSelect(element, rule.message)) isValid = false;
          break;
        case "dateRange":
          const endElement = document.getElementById(rule.endId);
          if (!validateDateRange(element, endElement, rule.message))
            isValid = false;
          break;
        case "imageCount":
          if (!validateImageCount(element, rule.minCount, rule.message))
            isValid = false;
          break;
        default:
          console.warn("Unknown validation type");
      }
    });

    return isValid;
  };

  // Public API
  return {
    validateRequiredField,
    validateEmail,
    validatePasswordLength,
    validateDateRange,
    validateSelect,
    validateNumber,
    validateImageCount,
    validateForm,
  };
})();
export default validationUtils;
