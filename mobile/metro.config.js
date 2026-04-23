const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Fix tslib resolution issue where ESM imports of tslib fail in Metro
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'tslib') {
    return {
      filePath: require.resolve('tslib'),
      type: 'sourceFile',
    };
  }
  return context.resolveRequest(context, moduleName, platform);
};

// Ensure .mjs files are handled correctly
config.resolver.sourceExts.push('mjs');

module.exports = withNativeWind(config, { input: './global.css' });
