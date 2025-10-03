// Patient form elements
const patientForm = document.getElementById("patientForm");
const patientNameInput = document.getElementById("name");
const patientAgeInput = document.getElementById("age");
const patientConditionSelect = document.getElementById("condition");
const addPatientButton = document.getElementById("addPatient");
const reportDiv = document.getElementById("report");

// Search elements
const searchButton = document.getElementById("btnSearch");
const searchResultDiv = document.getElementById("result");
const conditionInput = document.getElementById("conditionInput");

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

//============================================================================
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

// ============================================================================
// REPORT GENERATION
// ============================================================================
/* Generate and display the patient analysis report
 * Shows: total patients, condition breakdown chart, and gender-based statistics
 */

const generateReport = () => {
	const numPatients = patients.length;

	// Show empty state if no patients exist
	if (numPatients === 0) {
		reportDiv.innerHTML = `
			<div class="empty-state">
				<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
						d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
				</svg>
				<p>No data available. Add your first patient!</p>
			</div>
		`;
		return;
	}

	// Define available conditions and genders
	const conditions = ["Diabetes", "Thyroid", "High Blood Pressure"];
	const genders = ["Male", "Female"];

	// Initialize counters for conditions
	const conditionsCount = {};
	conditions.forEach((condition) => {
		conditionsCount[condition] = 0;
	});

	// Initialize counters for gender-based conditions
	const genderConditionsCount = {};
	genders.forEach((gender) => {
		genderConditionsCount[gender] = {};
		conditions.forEach((condition) => {
			genderConditionsCount[gender][condition] = 0;
		});
	});

	// Count occurrences of each condition and gender-condition combination
	patients.forEach(({ gender, condition }) => {
		conditionsCount[condition]++;
		genderConditionsCount[gender][condition]++;
	});

	// Find maximum count for chart scaling
	const conditionValues = Object.values(conditionsCount);
	const maxCount = Math.max.apply(Math, conditionValues);

	// Generate HTML for the report
	reportDiv.innerHTML = `
		<p><strong>Number of patients:</strong> <span class="stat-badge">${numPatients}</span></p>
		
		<!-- Conditions Breakdown Chart -->
		<div class="chart-container">
			<h3>📈 Conditions Breakdown</h3>
			${conditions
				.map((condition) => {
					const count = conditionsCount[condition];
					const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;

					return `
						<div class="chart-bar">
							<div class="chart-label">${condition}</div>
							<div class="chart-bar-container">
								<div class="chart-bar-fill" style="width: ${percentage}%">
									${count}
								</div>
							</div>
						</div>
					`;
				})
				.join("")}
		</div>

		<!-- Gender-Based Statistics -->
		<h3>👥 Gender-Based Conditions</h3>
		${genders
			.map((gender) => {
				return `
					<div style="margin-bottom: 1.5rem;">
						<strong style="color: var(--primary);">${gender}:</strong>
						<div style="margin-left: 1rem; margin-top: 0.5rem;">
							${conditions
								.map((condition) => {
									const count = genderConditionsCount[gender][condition];
									return `
										<div style="margin-bottom: 0.5rem;">
											${condition}: <strong>${count}</strong>
										</div>
									`;
								})
								.join("")}
						</div>
					</div>
				`;
			})
			.join("")}
	`;
};

// ============================================================================
// SEARCH FUNCTIONALITY
// ============================================================================
/**
 * Fetches data from JSON file and displays condition details
 */

const searchCondition = async () => {
	// Get search input value
	const searchQuery = getValue("conditionInput").toLowerCase();

	// Validate search input
	if (!searchQuery) {
		showToast("Please enter a condition to search", true);
		return;
	}

	// Show loading state
	searchResultDiv.innerHTML = `
		<div style="text-align: center; padding: 2rem;">
			<div class="loading"></div>
			<p style="margin-top: 1rem;">Loading...</p>
		</div>
	`;

	try {
		// Fetch condition data from JSON file
		const response = await fetch("health_analysis.json");

		// Check if request was successful
		if (!response.ok) {
			throw new Error("Error loading data");
		}

		// Parse JSON response
		const data = await response.json();

		// Find matching condition (case-insensitive)
		const condition = data.conditions.find((item) => item.name.toLowerCase() === searchQuery);

		// Handle condition not found
		if (!condition) {
			searchResultDiv.innerHTML = `
				<div class="empty-state">
					<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
							d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
					<p>Condition not found. Try: diabetes, thyroid, high blood pressure</p>
				</div>
			`;
			return;
		}

		// Extract condition details
		const { name, symptoms, prevention, treatment, imagesrc } = condition;

		// Display condition information
		searchResultDiv.innerHTML = `
			<h3>${name}</h3>
			${imagesrc ? `<img src="${imagesrc}" alt="${name}" onerror="this.style.display='none'">` : ""}
			
			<div class="info-section">
				<strong>🩺 Symptoms:</strong>
				<p>${symptoms.join(", ")}</p>
			</div>
			
			<div class="info-section">
				<strong>🛡️ Prevention:</strong>
				<p>${prevention.join(", ")}</p>
			</div>
			
			<div class="info-section">
				<strong>💊 Treatment:</strong>
				<p>${treatment}</p>
			</div>
		`;
	} catch (error) {
		// Handle fetch errors
		console.error("Error fetching condition data:", error);

		searchResultDiv.innerHTML = `
			<div class="empty-state">
				<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
						d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
				</svg>
				<p style="color: var(--danger);">Error loading data. Please check that the JSON file exists.</p>
			</div>
		`;

		showToast("Error loading data", true);
	}
};

/**
 * Initialize search functionality event listeners
 */
const initializeSearchListeners = () => {
	// Search button click
	if (searchButton) {
		searchButton.addEventListener("click", searchCondition);
	}

	// Search on Enter key press
	if (conditionInput) {
		conditionInput.addEventListener("keypress", (e) => {
			if (e.key === "Enter") {
				searchCondition();
			}
		});
	}
};
