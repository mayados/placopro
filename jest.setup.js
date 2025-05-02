// jest.setup.js
// Chargement des variables d'environnement depuis le fichier .env.test
// Chargement des variables d'environnement depuis .env.test
import dotenv from 'dotenv';
dotenv.config({ path: '.env.test' });
// Mock des appels fetch avec jest-fetch-mock
import fetchMock from 'jest-fetch-mock';

fetchMock.enableMocks(); // Activer le mock de fetch pour tous les tests

// Configuration supplémentaire si nécessaire (par exemple, mock de certaines fonctions globales)
beforeEach(() => {
  fetchMock.resetMocks(); // Réinitialiser les mocks avant chaque test pour éviter des interférences
});
