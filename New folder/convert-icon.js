const sharp = require('sharp');
const fs = require('fs');

async function convertToIco() {
  try {
    await sharp('BVC logo.png')
      .resize(256, 256)
      .toFile('src-tauri/icons/icon.ico');
    console.log('Icon converted successfully');
  } catch (error) {
    console.error('Error converting icon:', error);
  }
}

convertToIco();
