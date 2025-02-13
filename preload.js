window.addEventListener('DOMContentLoaded', () => {
    const replaceText = (selector, text) => {
      const element = document.getElementById(selector)
      if (element) element.innerText = text
    }
  
    for (const dependency of ['chrome', 'node', 'electron']) {
      replaceText(`${dependency}-version`, process.versions[dependency])
    }
  })

  const { contextBridge } = require('electron');
const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');

contextBridge.exposeInMainWorld('fileModule', {
    saveRar: (files) => {
        const outputDir = path.join(__dirname, 'output');
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
    },
});