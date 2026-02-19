document.addEventListener('DOMContentLoaded', function () {
    const dateInput = document.getElementById('dateInput');
    const datePickerInput = document.getElementById('datePickerInput');
    const calendarBtn = document.getElementById('calendarBtn');
    const closeBtn = document.getElementById('closeBtn');
    const errorMessage = document.getElementById('errorMessage');
    const resultsTable = document.getElementById('resultsTable');
    const monthDayYearCell = document.getElementById('monthDayYearDate');
    const simpleDateCell = document.getElementById('simpleDate');
    const humanizeDateCell = document.getElementById('humanizeDate');
    const dashDateCell = document.getElementById('dashDate');
    const paddedDashDateCell = document.getElementById('paddedDashDate');
    const monthDayDateCell = document.getElementById('monthDayDate');
    const capitalizeCheckbox = document.getElementById('capitalizeCheckbox');
    const abbrDaysCheckbox = document.getElementById('abbrDaysCheckbox');
    const abbrMonthsCheckbox = document.getElementById('abbrMonthsCheckbox');

    // Abbreviation maps
    const abbreviatedMonths = {
        'January': 'Jan.', 'February': 'Feb.', 'March': 'March', 'April': 'April',
        'May': 'May', 'June': 'June', 'July': 'July', 'August': 'Aug.',
        'September': 'Sept.', 'October': 'Oct.', 'November': 'Nov.', 'December': 'Dec.'
    };
    const abbreviatedDays = {
        'Sunday': 'Sun.', 'Monday': 'Mon.', 'Tuesday': 'Tues.', 'Wednesday': 'Wed.',
        'Thursday': 'Thurs.', 'Friday': 'Fri.', 'Saturday': 'Sat.'
    };

    // Close button functionality
    closeBtn.addEventListener('click', function () {
        window.close();
    });

    // Calendar button functionality - opens the hidden date picker
    calendarBtn.addEventListener('click', function () {
        datePickerInput.showPicker();
    });

    // When a date is selected from the date picker, populate the text input
    datePickerInput.addEventListener('change', function () {
        if (datePickerInput.value) {
            // Convert YYYY-MM-DD to a more readable format
            const [year, month, day] = datePickerInput.value.split('-');
            dateInput.value = `${parseInt(month)}/${parseInt(day)}/${year}`;

            // Trigger the input event to process the date
            const event = new Event('input', {
                bubbles: true,
                cancelable: true,
            });
            dateInput.dispatchEvent(event);
        }
    });

    // Re-process helper for checkbox changes
    function reprocessCurrentInput() {
        const inputValue = dateInput.value.trim();
        if (inputValue) {
            try {
                const convertedDates = convertDate(inputValue);
                if (convertedDates) {
                    showResults(convertedDates);
                }
            } catch (error) {
                // Ignore errors during re-processing
            }
        }
    }

    // Capitalize checkbox functionality
    capitalizeCheckbox.addEventListener('change', function () {
        saveOptionPreferences();
        reprocessCurrentInput();
    });

    // Abbreviate days checkbox
    abbrDaysCheckbox.addEventListener('change', function () {
        saveOptionPreferences();
        reprocessCurrentInput();
    });

    // Abbreviate months checkbox
    abbrMonthsCheckbox.addEventListener('change', function () {
        saveOptionPreferences();
        reprocessCurrentInput();
    });

    // Date input event listener
    dateInput.addEventListener('input', function () {
        const inputValue = dateInput.value.trim();

        // Save the current input to storage
        saveLastDate(inputValue);

        if (!inputValue) {
            hideResults();
            return;
        }

        try {
            const convertedDates = convertDate(inputValue);
            if (convertedDates) {
                showResults(convertedDates);
                clearError();
            } else {
                hideResults();
                showError('Invalid date format. Try: 1-22-2026, 1/22/2026, January 22, 2026, etc.');
            }
        } catch (error) {
            hideResults();
            showError('Invalid date format. Try: 1-22-2026, 1/22/2026, January 22, 2026, etc.');
        }
    });

    function parseMultipleFormats(inputDate) {
        // Remove extra whitespace and normalize
        const cleanInput = inputDate.replace(/\s+/g, ' ').trim();

        // Try different parsing strategies
        let date = null;

        // 1. Try M-D-Y format (original format)
        date = tryMDYDashFormat(cleanInput);
        if (date) return date;

        // 2. Try M/D/Y and MM/DD/YYYY formats
        date = tryMDYSlashFormat(cleanInput);
        if (date) return date;

        // 3. Try ISO format YYYY-MM-DD
        date = tryISOFormat(cleanInput);
        if (date) return date;

        // 4. Try natural language parsing with JavaScript Date constructor
        date = tryNaturalLanguage(cleanInput);
        if (date) return date;

        return null;
    }

    function tryMDYDashFormat(input) {
        const dashPattern = /^(\d{1,2})-(\d{1,2})-(\d{4})$/;
        const match = input.match(dashPattern);

        if (match) {
            const month = parseInt(match[1], 10);
            const day = parseInt(match[2], 10);
            const year = parseInt(match[3], 10);

            if (month >= 1 && month <= 12 && day >= 1 && day <= 31 && year >= 1000 && year <= 9999) {
                const date = new Date(year, month - 1, day);
                if (date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day) {
                    return date;
                }
            }
        }
        return null;
    }

    function tryMDYSlashFormat(input) {
        const slashPattern = /^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/;
        const match = input.match(slashPattern);

        if (match) {
            const month = parseInt(match[1], 10);
            const day = parseInt(match[2], 10);
            let year = parseInt(match[3], 10);

            // Handle 2-digit years (assume 2000s if < 50, 1900s if >= 50)
            if (year < 100) {
                year += (year < 50) ? 2000 : 1900;
            }

            if (month >= 1 && month <= 12 && day >= 1 && day <= 31 && year >= 1000 && year <= 9999) {
                const date = new Date(year, month - 1, day);
                if (date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day) {
                    return date;
                }
            }
        }
        return null;
    }

    function tryISOFormat(input) {
        const isoPattern = /^(\d{4})-(\d{1,2})-(\d{1,2})$/;
        const match = input.match(isoPattern);

        if (match) {
            const year = parseInt(match[1], 10);
            const month = parseInt(match[2], 10);
            const day = parseInt(match[3], 10);

            if (month >= 1 && month <= 12 && day >= 1 && day <= 31 && year >= 1000 && year <= 9999) {
                const date = new Date(year, month - 1, day);
                if (date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day) {
                    return date;
                }
            }
        }
        return null;
    }

    function tryNaturalLanguage(input) {
        try {
            // Try JavaScript's built-in Date parsing for natural language
            const date = new Date(input);

            // Check if the parsing was successful and resulted in a valid date
            if (!isNaN(date) && date.getFullYear() >= 1000 && date.getFullYear() <= 9999) {
                // Additional validation to avoid dates like "Invalid Date" or overly permissive parsing
                const dateString = date.toDateString();
                if (dateString !== "Invalid Date") {
                    // If the year is 2001, it likely means no year was provided.
                    // Default to the current year instead.
                    if (date.getFullYear() === 2001) {
                        const currentYear = new Date().getFullYear();
                        date.setFullYear(currentYear);
                    }
                    return date;
                }
            }
        } catch (error) {
            // Ignore parsing errors
        }
        return null;
    }

    function convertDate(inputDate) {
        const date = parseMultipleFormats(inputDate.trim());

        if (!date || isNaN(date)) {
            return null;
        }

        // Extract date components from the parsed date object
        const year = date.getFullYear();
        const month = date.getMonth() + 1; // getMonth() returns 0-11, so add 1
        const day = date.getDate();

        // Check option states
        const shouldCapitalize = capitalizeCheckbox.checked;
        const shouldAbbrDays = abbrDaysCheckbox.checked;
        const shouldAbbrMonths = abbrMonthsCheckbox.checked;

        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

        // Helper to apply abbreviation and capitalization to month names
        function formatMonth(idx) {
            let name = monthNames[idx];
            if (shouldAbbrMonths) name = abbreviatedMonths[name];
            if (shouldCapitalize) name = name.toUpperCase();
            return name;
        }

        // Helper to apply abbreviation and capitalization to day names
        function formatDay(idx) {
            let name = dayNames[idx];
            if (shouldAbbrDays) name = abbreviatedDays[name];
            if (shouldCapitalize) name = name.toUpperCase();
            return name;
        }

        // Format Month Day Year: January 22, 2026
        const monthDayYear = `${formatMonth(date.getMonth())} ${day}, ${year}`;

        // Format Simple Date: Month/Day
        const simpleDate = `${month}/${day}`;

        // Format Humanize Date: Day of Week, Month Day, Year
        const humanizeDate = `${formatDay(date.getDay())}, ${formatMonth(date.getMonth())} ${day}, ${year}`;

        // Format Dash Date: M-D-YYYY
        const dashDate = `${month}-${day}-${year}`;

        // Format Padded Dash Date: MM-DD-YYYY
        const paddedMonth = String(month).padStart(2, '0');
        const paddedDay = String(day).padStart(2, '0');
        const paddedDashDate = `${paddedMonth}-${paddedDay}-${year}`;

        // Format Month Day: March 4
        const monthDay = `${formatMonth(date.getMonth())} ${day}`;

        return {
            monthDayYear: monthDayYear,
            simple: simpleDate,
            humanize: humanizeDate,
            dash: dashDate,
            paddedDash: paddedDashDate,
            monthDay: monthDay
        };
    }

    function showResults(dates) {
        monthDayYearCell.textContent = dates.monthDayYear;
        simpleDateCell.textContent = dates.simple;
        humanizeDateCell.textContent = dates.humanize;
        dashDateCell.textContent = dates.dash;
        paddedDashDateCell.textContent = dates.paddedDash;
        monthDayDateCell.textContent = dates.monthDay;
        resultsTable.style.display = 'table';

        // Add click listeners for clipboard functionality
        addClickListener(monthDayYearCell, dates.monthDayYear);
        addClickListener(simpleDateCell, dates.simple);
        addClickListener(humanizeDateCell, dates.humanize);
        addClickListener(dashDateCell, dates.dash);
        addClickListener(paddedDashDateCell, dates.paddedDash);
        addClickListener(monthDayDateCell, dates.monthDay);
    }

    function hideResults() {
        resultsTable.style.display = 'none';
        monthDayYearCell.textContent = '-';
        simpleDateCell.textContent = '-';
        humanizeDateCell.textContent = '-';
        dashDateCell.textContent = '-';
        paddedDashDateCell.textContent = '-';
        monthDayDateCell.textContent = '-';
    }

    function showError(message) {
        errorMessage.textContent = message;
    }

    function clearError() {
        errorMessage.textContent = '';
    }

    // Clipboard functionality
    function addClickListener(element, text) {
        // Remove any existing click listeners
        element.onclick = null;

        element.onclick = function () {
            copyToClipboard(text, element);
        };
    }

    function copyToClipboard(text, element) {
        navigator.clipboard.writeText(text).then(function () {
            // Show success feedback
            element.classList.add('copied');

            // Remove the feedback after 2 seconds
            setTimeout(function () {
                element.classList.remove('copied');
            }, 2000);
        }).catch(function (error) {
            console.error('Failed to copy text: ', error);
            // Fallback for older browsers
            fallbackCopyTextToClipboard(text, element);
        });
    }

    function fallbackCopyTextToClipboard(text, element) {
        const textArea = document.createElement("textarea");
        textArea.value = text;

        // Avoid scrolling to bottom
        textArea.style.top = "0";
        textArea.style.left = "0";
        textArea.style.position = "fixed";

        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
            const successful = document.execCommand('copy');
            if (successful) {
                element.classList.add('copied');
                setTimeout(function () {
                    element.classList.remove('copied');
                }, 2000);
            }
        } catch (err) {
            console.error('Fallback: Oops, unable to copy', err);
        }

        document.body.removeChild(textArea);
    }

    // Storage functionality
    function saveLastDate(dateString) {
        chrome.storage.local.set({ 'lastDate': dateString });
    }

    function saveOptionPreferences() {
        chrome.storage.local.set({
            'capitalizeEnabled': capitalizeCheckbox.checked,
            'abbrDaysEnabled': abbrDaysCheckbox.checked,
            'abbrMonthsEnabled': abbrMonthsCheckbox.checked
        });
    }

    function loadLastDate() {
        chrome.storage.local.get(['lastDate', 'capitalizeEnabled', 'abbrDaysEnabled', 'abbrMonthsEnabled'], function (result) {
            // Load all option preferences
            if (result.capitalizeEnabled !== undefined) {
                capitalizeCheckbox.checked = result.capitalizeEnabled;
            }
            if (result.abbrDaysEnabled !== undefined) {
                abbrDaysCheckbox.checked = result.abbrDaysEnabled;
            }
            if (result.abbrMonthsEnabled !== undefined) {
                abbrMonthsCheckbox.checked = result.abbrMonthsEnabled;
            }

            // Then load and process the date (if any)
            if (result.lastDate) {
                dateInput.value = result.lastDate;

                // Trigger the input event to process the loaded date
                const event = new Event('input', {
                    bubbles: true,
                    cancelable: true,
                });
                dateInput.dispatchEvent(event);
            }
        });
    }

    // Prevent popup from closing when clicking outside (stays open forever unless X is clicked)
    document.addEventListener('click', function (event) {
        event.stopPropagation();
    });

    // Load last date and capitalize preference when popup opens
    loadLastDate();

    // Focus on input when popup opens (after a short delay to allow date loading)
    setTimeout(function () {
        dateInput.focus();
        // Place cursor at the end of the input
        dateInput.setSelectionRange(dateInput.value.length, dateInput.value.length);
    }, 100);
});