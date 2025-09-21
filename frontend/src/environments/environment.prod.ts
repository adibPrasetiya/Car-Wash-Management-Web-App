export const environment = {
  production: true,
  mode: 'prod', // 'dev' | 'prod'
  activation: {
    useHardcodedDeviceId: false,
    hardcodedDeviceId: '' // Not used in production
  },
  api: {
    baseUrl: 'https://your-production-api.com'
  }
};