const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);
const defaultResolveRequest = config.resolver.resolveRequest;

// Fix tslib resolution issue where ESM imports of tslib fail in Metro
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === "tslib") {
    return {
      filePath: require.resolve("tslib"),
      type: "sourceFile",
    };
  }
  return defaultResolveRequest
    ? defaultResolveRequest(context, moduleName, platform)
    : context.resolveRequest(context, moduleName, platform);
};

// Ensure .mjs files are handled correctly
config.resolver.sourceExts.push("mjs");

// Ignore volatile Gradle folders to prevent watcher ENOENT on Windows.
config.resolver.blockList = [
  /[\\/]node_modules[\\/].*\.gradle[\\/].*/,
  /[\\/]\.gradle[\\/].*/,
  /[\\/]build[\\/].*\.gradle[\\/].*/,
];

module.exports = withNativeWind(config, { input: "./global.css" });
