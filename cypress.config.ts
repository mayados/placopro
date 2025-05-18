import { defineConfig } from "cypress";
import dotenv from 'dotenv';
import { clerkSetup } from '@clerk/testing/cypress'


// Load environment variables of test
dotenv.config({ path: '.env.test' });

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:3000", 
    specPattern: "cypress/e2e/**/*.cy.{js,ts}",
    supportFile: "cypress/support/index.ts",
    env: {
      testUserEmail: process.env.TEST_USER_EMAIL,
      testUserPassword: process.env.TEST_USER_PASSWORD,
      // Add those variables for them to be available in the tests
      CYPRESS: 'true',
      NEXT_PUBLIC_CYPRESS: 'true',
    },
    setupNodeEvents(on, config) {
      // Transfert environment variables to clerk
      return clerkSetup({ config });
    },
  },
});