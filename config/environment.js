const ENV = {
  development: {
    apiUrl: 'https://api.echoreads.online/api/v1',
    environment: 'development',
    enableLogging: true,
    enableAnalytics: false,
  },
  staging: {
    apiUrl: 'https://api.echoreads.online/api/v1',
    environment: 'staging',
    enableLogging: true,
    enableAnalytics: true,
  },
  production: {
    apiUrl: 'https://api.echoreads.online/api/v1',
    environment: 'production',
    enableLogging: false,
    enableAnalytics: true,
  },
};

import LOCAL_CONFIG from './local';

const getEnvironmentConfig = () => {
  const env = process.env.NODE_ENV || 'development';
  
  // For local development, always use local config
  if (env === 'development' || env === 'local') {
    return LOCAL_CONFIG;
  }
  
  return ENV[env] || ENV.development;
};

export default getEnvironmentConfig(); 