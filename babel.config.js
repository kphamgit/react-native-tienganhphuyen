module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'], // This keeps all the default Expo magic
    plugins: [
      // If you use Reanimated, it must be the LAST plugin in the list
      'react-native-reanimated/plugin',
    ],
  };
};