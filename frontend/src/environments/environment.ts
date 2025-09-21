export const environment = {
  production: false,
  mode: 'dev', // 'dev' | 'prod'
  activation: {
    useHardcodedDeviceId: true,
    hardcodedDeviceId: 'ABC123XYZ' // For testing with sample signature
  },
  api: {
    baseUrl: 'http://localhost:3000'
  }
};