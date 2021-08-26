module.exports = {
  preset: '@vue/cli-plugin-unit-jest/presets/typescript-and-babel',
  transform: {
    '^.+\\.vue$': 'vue-jest'
  },
  bail:1,
  transformIgnorePatterns: ['/node_modules/(?!@ionic/vue|@ionic/vue-router)']
}
