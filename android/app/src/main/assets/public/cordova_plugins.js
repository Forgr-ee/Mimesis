
  cordova.define('cordova/plugin_list', function(require, exports, module) {
    module.exports = [
      {
          "id": "cordova-plugin-purchase.InAppBillingPlugin",
          "file": "plugins/cordova-plugin-purchase/www/store-android.js",
          "pluginId": "cordova-plugin-purchase",
        "clobbers": [
          "store"
        ]
        }
    ];
    module.exports.metadata =
    // TOP OF METADATA
    {
      "cordova-plugin-purchase": "10.6.1"
    };
    // BOTTOM OF METADATA
    });
    