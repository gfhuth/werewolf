const { withAndroidManifest } = require("@expo/config-plugins");

function addAttributesToApplication(androidManifest, attributes) {
    const { manifest } = androidManifest;

    if (!Array.isArray(manifest.application)) {
        console.warn("withAndroidMainActivityAttributes: No application array in manifest?");
        return androidManifest;
    }

    const application = manifest.application.find((item) => item.$["android:name"] === ".MainApplication");
    if (!application) {
        console.warn("withAndroidMainActivityAttributes: No .MainApplication?");
        return androidManifest;
    }

    application.$ = { ...application.$, ...attributes }

    return androidManifest;
}

module.exports = function withAndroidApplicationAttributes(config, attributes) {
    return withAndroidManifest(config, (config) => {
        config.modResults = addAttributesToApplication(config.modResults, attributes);
        return config;
    });
};
