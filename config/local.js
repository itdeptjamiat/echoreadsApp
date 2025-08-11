// Local development configuration
const LOCAL_CONFIG = {
  apiUrl: 'https://api.echoreads.online/api/v1',
  environment: 'local',
  enableLogging: true,
  enableAnalytics: false,
  enableErrorReporting: false,
  // Local development overrides
  features: {
    offlineMode: true,
    debugMode: true,
    mockData: false
  }
};

export default LOCAL_CONFIG; 