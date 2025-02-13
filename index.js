window.handleInput = (e) => {
  const value = e.target.value;
  console.log(value);
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
            console.log(JSON.stringify(content));

            // Display the parsed data in the output element
            document.getElementById('output').innerText = JSON.stringify(parsedData, null, 2);

            // Log the split data
            // console.log(parsedData);
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
        // console.log(csvData[0].length);
        // console.log(csvData[0]);
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

function handleVarInputes (entries,editContent,parseDataLength,index) {
    const inputFieldsContainer = document.getElementById('inputFields');
    const inputFields = inputFieldsContainer.querySelectorAll('input');
    const inputValues = [];
    const variableMapping = {};
    for (let i = 0; i < entries.length; i++) {
        // Construct the input name dynamically
        const inputName = `text${i}`;
        
        // Find the input element by name
        const inputField = inputFieldsContainer.querySelector(`input[name="${inputName}"]`);
        
        // Check if the input exists and get its value
        if (inputField) {
            const variableName = inputField.value.trim(); // User's input for variable name
            
            // Create the variable mapping if the input is not empty
            if (variableName) {
                variableMapping[variableName] = entries[i];
            }
        }
    }
    
    const result = substituteVariables(editContent, variableMapping);
    console.log('Variable Mappings:', variableMapping);
    console.log(result);
    return result;
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
            // Parse the line into an array
            const parsedLine = parseCSVLine(tempLine);
            result.push(parsedLine);
            tempLine = ''; // Reset tempLine for the next entry
        }
    }

    return result;
}

// Function to parse a single line
function parseCSVLine(line) {
    const regex = /"(.*?)"|([^,]+)/g; // Match quoted or unquoted fields
    const fields = [];
    let match;

    while ((match = regex.exec(line))) {
        if (match[1] !== undefined) {
            // Handle quoted fields
            const cleanedField = match[1]
                .replace(/""/g, '"');  // Replace double quotes (`""` => `"`)
            fields.push(cleanedField);
        } else if (match[2] !== undefined) {
            // Handle unquoted fields
            fields.push(match[2]);
        }
    }

    return fields.map(field => field.replace(/^"|"$/g, '')); // Remove surrounding quotes if present
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
        // console.log('Editor content:', editorValue);
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
    const files = [];
    for (let i = 0; i < parsedData.length; i++) {
        const entry = parsedData[i];
        console.log('Entry:', entry);
        var parseDataLength = parsedData[i].length;
        const generatedContent = handleVarInputes(entry,editorContent,parseDataLength,i);

        files.push({ name: `file_${i + 1}.html`, content: generatedContent });
    }

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

  