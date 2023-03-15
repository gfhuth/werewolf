module.exports = (api) => {
    api.cache(true);
    return {
        presets: ["babel-preset-expo"],
        plugin: [
            'module:react-native-dotenv',
            {
                moduleName: '@env',
                path: '.env',
                whitelist: ['API_BASE_URL'],
                safe: false,
                allowUndefined: true
            }
        ]
    };
};
