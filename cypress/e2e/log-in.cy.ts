describe('Connexion utilisateur', () => {
  it('se connecte avec des identifiants valides', () => {
    const email = Cypress.env('testUserEmail');
    const password = Cypress.env('testUserPassword');

    // Vérifications simples des variables d'environnement
    expect(email).to.be.a('string').and.not.be.empty;
    expect(password).to.be.a('string').and.not.be.empty;

    cy.visit('/access');
    cy.get('input[name="email"]').type(email);
    cy.get('input[name="password"]').type(password);
    cy.get('button[type="submit"]').click();

    // Vérifie que la redirection a eu lieu (URL ne doit plus contenir '/access')
    cy.url().should('not.include', '/access');

    // Tu peux aussi vérifier un élément spécifique à la page après login
    Exemple : cy.contains('Tableau de bord').should('exist');
  });
});
