const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');
const path = require('path');

const defaultConfig = getDefaultConfig(__dirname);
const assetRegistryPath = require.resolve('@react-native/assets-registry/registry');

const config = {
  transformer: {
    assetRegistryPath: '@react-native/assets-registry/registry',
  },
  resolver: {
    extraNodeModules: {
      'react-native/asset-registry': assetRegistryPath,
      'react-native/Libraries/Image/AssetRegistry': assetRegistryPath,
    },
    resolveRequest: (context, moduleName, platform) => {
      if (
        moduleName === 'react-native/asset-registry' ||
        moduleName === 'react-native/Libraries/Image/AssetRegistry' ||
        moduleName.endsWith('asset-registry')
      ) {
        return {
          filePath: assetRegistryPath,
          type: 'sourceFile',
        };
      }
      return context.resolveRequest(context, moduleName, platform);
    },
  },
};

module.exports = mergeConfig(defaultConfig, config);
