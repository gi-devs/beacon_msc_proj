const fixedUsers = [
  {
    id: 'cmdmdvby00000fd65z35q7fm5',
    email: 'geraldine@mail.com',
    createdAt: new Date('2025-07-28T00:42:13.175Z'),
    isEmailVerified: false,
    password: '$2b$10$ocSnSlsBsCoje4q138FD/.oIW4enZVJ1ZZ9FdsO0Xc5T7t3cGf0PK',
    updatedAt: new Date('2025-07-28T00:42:13.175Z'),
    username: 'gerri',
  },
  {
    id: 'cmdvz9f640002fdmsn07esoxl',
    email: 'test@mail.com',
    createdAt: new Date('2025-08-03T17:50:58.060Z'),
    isEmailVerified: false,
    password: '$2b$10$1wb5ra6nhWjCsNQQUSCD3uXpbjfUQt2JL62cHJx6aOWdB7jDzcCLi',
    updatedAt: new Date('2025-08-03T17:50:58.060Z'),
    username: 'Tester',
  },
  {
    id: 'cme3ht99f0000fdo16t5ydaq5',
    email: 'httpuser@mail.com',
    createdAt: new Date('2025-08-09T00:04:39.843Z'),
    isEmailVerified: false,
    password: '$2b$10$nFOchhb3S32M3Jithbp/GOiGcZ5zhOnHIu7lUoCh1EAE5Xw6bnzM.',
    updatedAt: new Date('2025-08-09T00:04:39.843Z'),
    username: 'HttpUser',
  },
];

const sharedPasswordHash =
  '$2b$10$ocSnSlsBsCoje4q138FD/.oIW4enZVJ1ZZ9FdsO0Xc5T7t3cGf0PK';

const dummyUserLocationSettings: Record<
  string,
  { geohash: string; radius: number }
> = {
  dummy7: { geohash: 'gcuvy7gh', radius: 500 },
  dummy6: { geohash: 'gcuvysvb', radius: 500 },
  dummy5: { geohash: 'gcuvyebj', radius: 500 },
  dummy4: { geohash: 'gcuvyss3', radius: 500 },
  dummy3: { geohash: 'gcuvy5wz', radius: 500 },
  dummy2: { geohash: 'gcuvyknr', radius: 500 },
  dummy1: { geohash: 'gcuvykzt', radius: 500 },
};

const dummyUsers = [
  { username: 'cohortunhappy' },
  { username: 'breakarray' },
  { username: 'politenessfloat' },
  { username: 'pinecone' },
  { username: 'lemonadeowl' },
  { username: 'beearomatic' },
  { username: 'happiestdays' },
];

const expiredConfigs = [
  {
    type: 'expired',
    expiresAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
  }, // -7 days
  {
    type: 'expired',
    expiresAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14),
  }, // -14 days
  {
    type: 'expired',
    expiresAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
  }, // -3 days
];

const activeConfigs = [
  {
    type: 'active',
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3),
  }, // +3 days
  {
    type: 'active',
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3),
  }, // +3 days
  {
    type: 'active',
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
  }, // +7 days
];

export {
  fixedUsers,
  sharedPasswordHash,
  dummyUsers,
  dummyUserLocationSettings,
  expiredConfigs,
  activeConfigs,
};
