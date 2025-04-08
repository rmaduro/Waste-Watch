describe('Fleet Map Component', () => {
  before(() => {
    Cypress.config('baseUrl', 'http://localhost:4200'); // Make sure this is correct
    Cypress.env('backendUrl', 'https://localhost:7259/api');
  });

  beforeEach(() => {
    cy.visit('/vehicle-map');
  });

  it('should display the page title', () => {
    cy.get('.dashboard-title').should('contain.text', 'Fleet Map');
    cy.wait(2000)

  });

  it('should display the map container', () => {
    cy.get('.map-container').should('be.visible');
    cy.wait(2000)

  });

  it('should display the vehicles list', () => {
    cy.get('.vehicle-card').should('have.length.greaterThan', 0); // Checks if at least one vehicle is displayed
    cy.wait(2000)

  });

  it('should highlight the selected vehicle card', () => {
    cy.get('.vehicle-card').first().click(); // Click on the first vehicle card
    cy.get('.vehicle-card.selected').should('exist'); // Check if the selected vehicle card is highlighted
    cy.wait(2000)

  });

 });
