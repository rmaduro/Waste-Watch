describe('Bin Map Page', () => {
  before(() => {
    Cypress.config('baseUrl', 'http://localhost:4200');
    Cypress.env('backendUrl', 'https://localhost:7259/api');
  });

  beforeEach(() => {
    cy.visit('/bin-map');
  });

  it('should display the page title', () => {
    cy.get('.dashboard-title').should('contain.text', 'Bin Map');
    cy.wait(2000)
  });

  it('should trigger refresh when clicking the refresh button', () => {
    cy.get('.refresh-btn').click();
    cy.wait(2000)

  });


  it('should list available bins', () => {
    const bins = [
      { id: 1, type: 'organic', capacity: 100, status: 'available' },
      { id: 2, type: 'plastic', capacity: 50, status: 'full' },
    ];

    cy.intercept('GET', `${Cypress.env('backendUrl')}/bins`, { body: bins }).as('getBins');

    cy.visit('/bin-map');

    cy.get('.bin-card').should('have.length', bins.length);

    bins.forEach((bin) => {
      cy.get('.bin-card')
        .contains(`#${bin.id}`)
        .should('exist');
    });
    cy.wait(2000)

  });


});
