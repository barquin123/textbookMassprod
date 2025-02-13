window.handleInput = (e) => {
    const inputFieldsContainer = document.getElementById('inputFields');
    const inputFields = inputFieldsContainer.querySelectorAll('input'); // Get all input tags inside inputFields
    let hasEmptyFields = false;

    inputFields.forEach(input => {
        if (!input.value.trim()) {
            hasEmptyFields = true;
        }
    });

    const submitButton = document.getElementById('submitFormButton');
    if (hasEmptyFields) {
      
    } else {
        submitButton.style.top = `50%`;
        submitButton.style.left = `50%`;
        submitButton.disabled = false;
    }

};


const dataModule = (function() {
    let parsedData = null;

    return {
        setParsedData: function(data) {
            parsedData = data;
        },
        getParsedData: function() {
            return parsedData;
        }
    };
})();


const editorValue = (function() {
    let editorContent = null;

    return {
        setEditorContent: function(content) {
            editorContent = content;
        },
        getEditorContent: function() {
            return editorContent;
        }
    };
})();


document.getElementById('csvFile').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const content = e.target.result;
            const parsedData = parseCSVData(content);
            dataModule.setParsedData(parsedData);

            // Display the parsed data in the output element
            // document.getElementById('output').innerText = JSON.stringify(parsedData, null, 2);

            // Log the split data
            processCSVData()
        };
        reader.readAsText(file);
    }
});




function processCSVData() {
    const csvData = dataModule.getParsedData();
    if (csvData) {
        const numberOfColumns = csvData[0].length;
        createFields(numberOfColumns,csvData);
    }
}


function createFields(numberOfColumns, parsedData) {
    const inputFieldsContainer = document.getElementById('inputFields');

    // Clear existing input fields (optional)
    inputFieldsContainer.innerHTML = '';
    // Create input fields based on the number of columns
    for (let i = 0; i < numberOfColumns; i++) {
        const inputField = document.createElement('input');
        inputField.setAttribute('type', 'text');
        inputField.setAttribute('required', 'required');
        inputField.setAttribute('name', `text${i}`);
        inputField.setAttribute('placeholder', parsedData[0][i]);
        inputField.setAttribute('oninput', 'handleInput(event)');
        inputFieldsContainer.appendChild(inputField);
        // Add a clearfix div after each input field (if needed)
        const clearFix = document.createElement('div');
        clearFix.classList.add('clearfix');
        inputFieldsContainer.appendChild(clearFix);
    }
}

//aro ko ni hunong testingan panig mo dagan bani jay frank
function substituteVariables(template, variableMapping) {
    return template.replace(/\${(.*?)}/g, (_, variableName) => {
        // Replace placeholders with corresponding values from the mapping
        return variableMapping[variableName] || `\${${variableName}}`;
    });
}

function handleVarInputes(entries, editContent, parseDataLength, index) {
    const inputFieldsContainer = document.getElementById('inputFields');
    const variableMapping = {};

    // Loop through all entries in the provided array
    entries.forEach((entry, i) => {
        // Construct the input name dynamically
        const inputName = `text${i}`;

        // Find the corresponding input element by name
        const inputField = inputFieldsContainer.querySelector(`input[name="${inputName}"]`);

        // Check if the input exists and get its value
        if (inputField) {
            const variableName = inputField.value.trim(); // User's input for variable name

            // Add the mapping if the variableName is valid
            if (variableName) {
                variableMapping[variableName] = entry; // Map the variable name to the corresponding entry
            }
        }
    });

    // Substitute all variables in the editor content using the complete mapping
    const result = substituteVariables(editContent, variableMapping);
    return result; // Return the substituted result
}




// Function to parse CSV data
function parseCSVData(csvData) {
    const lines = csvData.split(/\r?\n/); // Split into lines
    const result = [];
    let tempLine = '';

    for (const line of lines) {
        if (!line.trim()) continue; // Skip empty lines

        tempLine += (tempLine ? '\n' : '') + line;

        // Check if the line ends properly (even number of quotes)
        const quotesMatch = (tempLine.match(/"/g) || []).length % 2 === 0;

        if (quotesMatch) {
            // Parse the line into an array while retaining the contents inside cells
            const parsedLine = parseCSVLine(tempLine);
            result.push(parsedLine);
            tempLine = ''; // Reset tempLine for the next entry
        }
    }

    return result;
}

function parseCSVLine(line) {
    const cells = [];
    let cell = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"' && (i === 0 || line[i - 1] !== '\\')) {
            // Toggle the inQuotes flag when encountering a quote
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            // If not in quotes and a comma is found, push the current cell
            cells.push(cell.trim());
            cell = '';
        } else {
            // Add the character to the current cell, including newlines inside quotes
            cell += char;
        }
    }

    // Push the last cell
    if (cell) {
        cells.push(cell.trim());
    }

    return cells;
}
require.config({ paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@latest/min/vs' }});
require(['vs/editor/editor.main'], function () {
    const editor = monaco.editor.create(document.getElementById('container'), {
    value: '',
    language: 'html', // You can change the language based on your needs
    theme: 'vs-dark', // Set the editor theme
    automaticLayout: true, // Make editor resize automatically with the window
    });

    //change language
    function changeLanguage(newLanguage) {
        const model = editor.getModel();
        monaco.editor.setModelLanguage(model, newLanguage);
    }

   // Get reference to the parent UL
        const languageSelector = document.getElementById('languageSelector');

        // Set default language based on the active class
        const defaultActive = languageSelector.querySelector('.active');
        if (defaultActive) {
            changeLanguage(defaultActive.dataset.language);
        }

        // Add event listener to the UL
        languageSelector.addEventListener('click', function (event) {
            // Check if the clicked target is an LI element
            if (event.target && event.target.tagName === 'LI') {
                // Remove 'active' class from the currently active item
                const currentlyActive = languageSelector.querySelector('.active');
                if (currentlyActive) {
                    currentlyActive.classList.remove('active');
                }

                // Add 'active' class to the clicked LI
                event.target.classList.add('active');

                // Call the changeLanguage function with the selected language
                const selectedLanguage = event.target.dataset.language;
                if (selectedLanguage) {
                    changeLanguage(selectedLanguage);
                }
            }
        });


    editor.onDidChangeModelContent(function (event) {
        const editorVal = editor.getValue();
        editorValue.setEditorContent(editorVal); // Log or use the value as needed
    });
});

document.getElementById('selectFolder').addEventListener('click', async () => {
    const folder = await window.fileModule.selectFolder();
    if (folder) {
        document.getElementById('selectedFolder').innerText = folder;
    } else {
        document.getElementById('selectedFolder').innerText = 'No folder selected';
    }
});

// JavaScript to handle form submission
document.getElementById('appForm').onsubmit = async function(event) {
    // Prevent the default form submission behavior
    event.preventDefault();

    const editorContent = editorValue.getEditorContent();
    const parsedData = dataModule.getParsedData();
    const startingNumberInput = document.getElementById('startingNumber').value;
    const startingNumber = parseInt(startingNumberInput, 10);

    if (isNaN(startingNumber) || startingNumber < 1) {
        alert('Please enter a valid starting number.');
        return;
    }

    const files = [];
    parsedData.forEach((entry, index) => {
        const parseDataLength = entry.length;

        // Generate content for each entry
        const generatedContent = handleVarInputes(entry, editorContent, parseDataLength, index);

        // Add to the files array
        files.push({ 
            name: `${startingNumber + index}.html`, // Adjust filename using the starting number
            content: generatedContent 
        });
    });

    const outputDir = document.getElementById('selectedFolder').innerText;
    if (!outputDir || outputDir === 'No folder selected') {
        alert('Please select a valid folder to save the file.');
        return;
    }

    try {
        const outputPath = window.fileModule.saveRar(files, outputDir);
        alert(`Generated .rar file saved at: ${outputPath}`);

        // Open the folder in the system's file explorer
        const folderOpened = await window.fileModule.openFolder(outputDir);
        if (!folderOpened) {
            console.error('Failed to open folder.');
        }
    } catch (error) {
        console.error('Error during submission:', error);
        alert('An error occurred while saving the .rar file. Check the console for details.');
    }
};

document.getElementById('submitFormButton').addEventListener('mouseover', function () {
    const inputFieldsContainer = document.getElementById('inputFields');
    const inputFields = inputFieldsContainer.querySelectorAll('input'); // Get all input tags inside inputFields
    let hasEmptyFields = false;

    inputFields.forEach(input => {
        if (!input.value.trim()) {
            hasEmptyFields = true;
        }
    });

    const submitButton = document.getElementById('submitFormButton');
    if (hasEmptyFields) {
        // Generate random positions
      // Generate random positions for top and left
      const randomTop = Math.random() * 90; // Random number between 0 and 90%
      const randomLeft = Math.random() * 90; // Random number between 0 and 90%

      // Apply styles to move the button
      submitButton.disabled = true;
      submitButton.style.position = 'absolute';
      submitButton.style.top = `${randomTop}%`;
      submitButton.style.left = `${randomLeft}%`;
    } else {
        submitButton.style.top = `50%`;
        submitButton.style.left = `50%`;
        submitButton.disabled = false;
    }
});