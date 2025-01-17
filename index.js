window.handleInput = (e) => {
  const value = e.target.value;
  console.log(value);
};


let globalContent = '';

document.getElementById('csvFile').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const content = e.target.result;
            globalContent = content;

            // Parse the CSV content into an array
            const parsedData = parseCSVData(globalContent);

            // Get the number of splits from the input field
            const splitCount = parseInt(document.getElementById('numberOfrows').value, 10);

            if (isNaN(splitCount) || splitCount < 1) {
                alert('Please enter a valid number of splits.');
                return;
            }

            // Split the data into the specified number of parts
            const splitData = splitArray(parsedData, splitCount);

            // Display the split result in the output element
            document.getElementById('output').innerText = JSON.stringify(splitData, null, 2);

            // Log the split data
            console.log(splitData);
        };
        reader.readAsText(file);
    }
});

// Function to parse CSV data
function parseCSVData(csvData) {
    const lines = csvData.split(/\r?\n/); // Split into lines
    const result = [];
    let tempLine = '';

    for (const line of lines) {
        if (!line.trim()) continue; // Skip empty lines

        tempLine += (tempLine ? '\n' : '') + line;

        // Check if the line ends properly
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
            fields.push(match[1]); // Quoted field
        } else if (match[2] !== undefined) {
            fields.push(match[2]); // Unquoted field
        }
    }

    return fields;
}

// Function to split an array into a specified number of chunks without nested arrays
function splitArray(array, chunks) {
    const result = [];
    const chunkSize = Math.ceil(array.length / chunks);

    for (let i = 0; i < chunks; i++) {
        const start = i * chunkSize;
        const end = start + chunkSize;
        result.push(...array.slice(start, end));
    }

    return result;
}


//wrapping text with tags

// function wrapTextWithTags(inputText) {
//     // Split the text by newlines (\n or \r\n)
//     const lines = inputText.split(/\r?\n/);
    
//     // Wrap each line with <p> tags and join them back into a string
//     const wrappedText = lines.map(line => `<p>${line}</p>`).join('');
    
//     return wrappedText;
// }


