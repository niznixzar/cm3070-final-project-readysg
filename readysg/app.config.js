module.exports = {
  expo: {
    name: 'ReadySG',
    slug: 'readysg',
    scheme: 'readysg',
    version: '1.0.0',
    orientation: 'portrait',
    userInterfaceStyle: 'automatic', // to follow the phone's light/dark setting
    ios: { bundleIdentifier: 'sg.readysg.app', supportsTablet: false },
    android: { package: 'sg.readysg.app' },
    plugins: [
      'expo-router',
      'expo-font',
      'expo-status-bar',
      'expo-splash-screen',
      [
        'expo-location',
        {
          locationWhenInUsePermission:
            'ReadySG uses your location to show nearby emergency resources and alerts for your area.',
        },
      ],
    ],
  },
};