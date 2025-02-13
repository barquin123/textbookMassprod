window.addEventListener('DOMContentLoaded', () => {
    const replaceText = (selector, text) => {
      const element = document.getElementById(selector)
      if (element) element.innerText = text
    }
  
    for (const dependency of ['chrome', 'node', 'electron']) {
      replaceText(`${dependency}-version`, process.versions[dependency])
    }
  })
  
  const { contextBridge, ipcRenderer, shell } = require('electron');
  const fs = require('fs');
  const path = require('path');
  const AdmZip = require('adm-zip');
  
  contextBridge.exposeInMainWorld('fileModule', {
    selectFolder: async () => {
        try {
            const folder = await ipcRenderer.invoke('dialog:selectFolder');
            return folder || null; // Return the folder path or null if no folder was selected
        } catch (error) {
            console.error('Error selecting folder:', error);
            return null;
        }
    },
    saveRar: (files, outputDir) => {
        try {
            const fs = require('fs');
            const path = require('path');
            const AdmZip = require('adm-zip');

            if (!fs.existsSync(outputDir)) {
                fs.mkdirSync(outputDir, { recursive: true });
            }

            const zip = new AdmZip();
            files.forEach(file => {
                zip.addFile(file.name, Buffer.from(file.content, 'utf8'));
            });

            const outputPath = path.join(outputDir, 'generated_files.rar');
            zip.writeZip(outputPath);

            return outputPath;
        } catch (error) {
            console.error('Error saving .rar file:', error);
            throw new Error('Failed to save the .rar file.');
        }
    },
    openFolder: async (folderPath) => {
        try {
            const result = await shell.openPath(folderPath);
            return result === ''; // `shell.openPath` returns an empty string on success
        } catch (error) {
            console.error('Error opening folder:', error);
            return false;
        }
    },
});