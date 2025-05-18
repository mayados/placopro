import { config as dotenvConfig } from "dotenv";
import { loadEnvConfig } from '@next/env';

const isTest = process.env.CYPRESS === 'true' || process.env.IS_TEST_ENV === 'true';

// Load environments variables for tests
if (isTest) {
  dotenvConfig({ path: '.env.test' });
}

const nextConfig = {
};

export default nextConfig;
