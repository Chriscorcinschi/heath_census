// Patient form elements
const patientForm = document.getElementById("patientForm");
const patientNameInput = document.getElementById("name");
const patientAgeInput = document.getElementById("age");
const patientConditionSelect = document.getElementById("condition");
const addPatientButton = document.getElementById("addPatient");
const reportDiv = document.getElementById("report");

/**
 * Array to store all patient records
 * Each patient object contains: { name, gender, age, condition }
 */
const patients = [];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Safely get the trimmed value of an input element by ID
 * @param {string} id - The ID of the input element
 * @returns {string} - The trimmed value of the input
 */
const getValue = (id) => {
	const element = document.getElementById(id);
	//compact if-else  ->
	return element ? element.value.trim() : "";
};

/**
 * Get the currently checked radio button by name
 * @param {string} name - The name attribute of the radio group
 * @returns {HTMLElement|null} - The checked radio button or null
 */
const getChecked = (name) => {
	return document.querySelector(`input[name="${name}"]:checked`);
};

/**
 * Display a toast notification message
 * @param {string} message - The message to display
 * @param {boolean} isError - Whether this is an error message (red) or success (green)
 */
const showToast = (message, isError = false) => {
	// Create toast element
	const toast = document.createElement("div");
	toast.className = `toast ${isError ? "error" : ""}`;
	toast.textContent = message;

	// Add to DOM (body page)
	document.body.appendChild(toast);

	// Auto-remove after 3 seconds with animation
	setTimeout(() => {
		toast.style.animation = "slideIn 0.3s ease reverse";
		setTimeout(() => toast.remove(), 300);
	}, 3000);
};

============================================================================
// PATIENT FORM MANAGEMENT
// ============================================================================

/**
 * Validate the patient form inputs
 * Checks: name, age (0-120), condition, and gender selection
 * @returns {boolean} - True if all fields are valid, false otherwise
 */
const validatePatientForm = () => {
	let isValid = true;
	const fields = ["name", "age", "condition"];

	// Validate text and select fields
	fields.forEach((field) => {
		const element = document.getElementById(field);
		const group = element.closest(".form-group");

		// Check if field is empty
		if (!element.value.trim()) {
			group.classList.add("error");
			isValid = false;
		}
		// Validation for age (must be between 0 and 120)
		else if (field === "age" && (element.value < 0 || element.value > 120)) {
			group.classList.add("error");
			isValid = false;
		}
		// Field is valid
		else {
			group.classList.remove("error");
		}
	});

	// Validate gender radio buttons
	const genderGroup = document.querySelector(".radio-group").closest(".form-group");
	//check if at least one radio button is selected
	if (!getChecked("gender")) {
		genderGroup.classList.add("error");
		isValid = false;
	} else {
		genderGroup.classList.remove("error");
	}
	return isValid;
};

/**
 * Reset the patient form to its initial state
 * Clears all inputs and removes error states
 */
const resetPatientForm = () => {
	// Clear text inputs
	patientNameInput.value = "";
	patientAgeInput.value = "";
	patientConditionSelect.value = "";

	// Uncheck gender radio buttons
	const checkedGender = getChecked("gender");
	if (checkedGender) {
		checkedGender.checked = false;
	}

	// Remove all error states
	document.querySelectorAll(".form-group").forEach((group) => {
		group.classList.remove("error");
	});
};

/**
 * Button ADD, Validates form, adds to patients array, generates report, and resets form
 * @param {Event} e - The form submit event
 */
const addPatient = (e) => {
	// Prevent default form submission (page reload)
	e.preventDefault();

	// Validate form before processing
	if (!validatePatientForm()) {
		showToast("Please fill in all fields correctly", true);
		return;
	}

	// Extract form values
	const name = getValue("name");
	const gender = getChecked("gender");
	const age = getValue("age");
	const condition = getValue("condition");

	// Create patient object and add to array
	const newPatient = {
		name,
		gender: gender.value,
		age,
		condition,
	};
	patients.push(newPatient);

	// Update UI
	resetPatientForm();
	generateReport();
	showToast("Patient added successfully! ✓");
};

/**
 * Initialize patient form event listeners
 */
const initializePatientFormListeners = () => {
	if (patientForm) {
		patientForm.addEventListener("submit", addPatient);
	}
};