describe('Création de devis', () => {
    beforeEach(() => {
        const email = Cypress.env('testUserEmail');
        const password = Cypress.env('testUserPassword');

        assert.isString(email, 'Email doit être une chaîne');
        assert.isNotEmpty(email, 'Email ne doit pas être vide');
        assert.isString(password, 'Mot de passe doit être une chaîne');
        assert.isNotEmpty(password, 'Mot de passe ne doit pas être vide');

        // Clerk authentication
        cy.visit('/access');
        cy.get('input[name="email"]').type(email);
        cy.get('input[name="password"]').type(password);
        cy.get('button[type="submit"]').click();

        // waiting for redirect after login
        cy.wait(1000);
        cy.url().should('not.include', '/access');
    


        // Access to creation page
        cy.visit('/intranet/common-intranet/quotes/create');

    });

    it('remplit le formulaire et soumet en brouillon', () => {
        // Client
        cy.get('input[name="client"]').type('Guereira');
        cy.request({
            method: 'GET',
            url: '/api/clients/search?q=Guereira',
            failOnStatusCode: false,
        }).then((response) => {
            console.log('API clients/search:', response.status, response.body);
        });
        // Wainting for suggestion
        cy.contains('li', 'Guereira').click();

        cy.get('input[name="workSite"]').clear().type('Gue');
        cy.wait(800);
        cy.get('[data-cy="workSite-suggestion"]').first().click({ force: true });
        cy.get('input[name="workSite"]').should('not.have.value', '');

        // Nature des travaux
        cy.get('input[name="natureOfWork"]').type('Peinture intérieure');

        // Description
        cy.get('textarea[name="description"]').type('Peinture des murs du salon.');

        // Dates
        cy.get('input[name="workStartDate"]').type('2025-06-01');
        cy.get('input[name="estimatedWorkEndDate"]').type('2025-06-10');

        cy.get('input[name="estimatedWorkDuration"]').clear().type('10');
        cy.get('input[name="depositAmount"]').clear().type('1000');

        cy.get('button').contains('Ajouter un service').click();
        cy.get('input[name="label"]').first().type('Peinture murale');
        cy.get('input[name="detailsService"]').first().type('Peinture latex blanc');
        cy.get('input[name="unitPriceHT"]').first().clear().type('25');
        cy.get('select[name="type"]').first().select('plâtrerie');
        cy.get('input[name="quantity"]').first().clear().type('40');
        cy.get('select[name="unit"]').first().select('m2');
        cy.get('select[name="vatRate"]').first().select('20');

        cy.get('input[name="validityEndDate"]').type('2025-06-15');
        cy.get('input[name="discountAmount"]').clear().type('50');
        cy.get('select[name="discountReason"]').select('Fidelité');

        cy.get('textarea[name="paymentTerms"]').clear().type('Paiement sous 30 jours.');
        cy.get('input[name="paymentDelay"]').clear().type('30');
        cy.get('input[name="latePaymentPenalities"]').clear().type('15');
        cy.get('input[name="travelCosts"]').clear().type('100');
        cy.get('select[name="travelCostsType"]').select('Forfait unique');
        cy.get('input[name="recoveryFees"]').clear().type('20');
        cy.get('[data-cy="radio-Oui"]').click();

        cy.get('[data-cy="radio-Oui"]').should('have.attr', 'aria-checked', 'true');
        cy.get('input[name="withdrawalPeriod"]').clear().type('14');

        cy.get('button').contains('Finaliser le devis').click()
        // 2) Vérifie que la modale est bien visible
        cy.get('[aria-labelledby="quote-final-title"]')
            .should('be.visible')

        cy.contains('button', 'Enregistrer en version finale')
            .click()
        cy.wait(800);

        cy.contains('Devis créé avec succès', { matchCase: false }).should('exist');

    });
});
