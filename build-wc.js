const fs = require("fs-extra");
const concat = require("concat");
const path = require("path");

const build = async () => {
  const files = [
    "./dist/epub-player-wc/runtime.js",
    "./dist/epub-player-wc/polyfills.js",
    "./dist/epub-player-wc/scripts.js",
    "./dist/epub-player-wc/vendor.js",
    "./dist/epub-player-wc/main.js"
  ];

  const outputDir = "web-component/assets/epub-player";
  const packageJsonSource = "web-component/package.json";

  // Backup package.json if it exists, otherwise create default
  let packageJsonContent = null;
  if (await fs.pathExists(packageJsonSource)) {
    packageJsonContent = await fs.readJson(packageJsonSource);
  } else {
    // Default package.json content if none exists
    packageJsonContent = {
      "name": "@project-sunbird/sunbird-epub-player-web-component",
      "version": "1.5.0",
      "description": "The web component package for the sunbird epub player",
      "main": "assets/epub-player/sunbird-epub-player.js",
      "scripts": {
        "test": "echo \"Error: no test specified\" && exit 1"
      },
      "homepage": "https://github.com/Sunbird-Knowlg/sunbird-epub-player/blob/release-5.5.0/README.md",
      "repository": {
        "type": "git",
        "url": "https://github.com/Sunbird-Knowlg/sunbird-epub-player.git"
      },
      "keywords": [
        "sunbird",
        "epub",
        "player",
        "web-component"
      ],
      "author": "sunbird",
      "license": "MIT"
    };
  }

  // Clean and create directory
  await fs.remove("web-component");
  await fs.ensureDir(outputDir);

  // Copy all web component files to assets/epub-player/
  await concat(files, `${outputDir}/sunbird-epub-player.js`);
  await fs.copy("./dist/epub-player-wc/styles.css", `${outputDir}/styles.css`);

  // Copy assets contents to assets/epub-player/ (if exists)
  const assetsPath = "./dist/epub-player-wc/assets";
  if (await fs.pathExists(assetsPath)) {
    const assetFiles = await fs.readdir(assetsPath);
    // Only copy if there are actual files (not just .gitkeep)
    const hasRealAssets = assetFiles.some(file => file !== '.gitkeep');
    if (hasRealAssets) {
      await fs.copy(assetsPath, outputDir);
      console.log("✅ Assets copied to web-component/");
    }
  }

  // Write package.json to web-component root
  await fs.writeJson(packageJsonSource, packageJsonContent, { spaces: 2 });
  console.log("✅ package.json created at web-component/");

  // Also copy to demo folder with same structure
  const demoDir = "web-component-demo/assets/epub-player";
  await fs.remove("web-component-demo/assets");
  await fs.ensureDir(demoDir);
  await concat(files, `${demoDir}/sunbird-epub-player.js`);
  await fs.copy("./dist/epub-player-wc/styles.css", `${demoDir}/styles.css`);

  // Copy assets to demo (if exists)
  if (await fs.pathExists(assetsPath)) {
    const assetFiles = await fs.readdir(assetsPath);
    const hasRealAssets = assetFiles.some(file => file !== '.gitkeep');
    if (hasRealAssets) {
      await fs.copy(assetsPath, demoDir);
      console.log("✅ Assets copied to web-component-demo/");
    }
  }

  // Update demo index.html to use new paths
  const demoIndexPath = "web-component-demo/index.html";
  if (await fs.pathExists(demoIndexPath)) {
    let indexContent = await fs.readFile(demoIndexPath, 'utf8');
    // Update CSS path
    indexContent = indexContent.replace(
      /<link rel="stylesheet" href="\.\/styles\.css">/g,
      '<link rel="stylesheet" href="./assets/epub-player/styles.css">'
    );
    // Update JS path
    indexContent = indexContent.replace(
      /<script type="text\/javascript" src="\.\/sunbird-epub-player\.js">/g,
      '<script type="text/javascript" src="./assets/epub-player/sunbird-epub-player.js">'
    );
    await fs.writeFile(demoIndexPath, indexContent, 'utf8');
    console.log("✅ Demo index.html updated with new asset paths");
  }

  console.log("✅ Files organized successfully!");
  console.log(`📁 Output: ${outputDir}/`);
};
build();
