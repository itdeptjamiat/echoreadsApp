const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for PDF files
config.resolver.assetExts.push('pdf');

module.exports = config; 