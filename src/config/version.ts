
export const VERSION = {
  major: 1,
  minor: 0,
  patch: 0,
  build: 'latest',
  timestamp: new Date().toISOString(),
  features: [
    'Holobots Battle Arena',
    'User Authentication',
    'Training System',
    'Gacha System',
    'Marketplace',
    'Lovable Integration'
  ],
  environment: import.meta.env.MODE || 'development'
};

export const getVersionString = () => {
  return `v${VERSION.major}.${VERSION.minor}.${VERSION.patch}`;
};
