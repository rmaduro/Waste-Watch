describe('Bin Management Dashboard', () => {
  before(() => {
    Cypress.config('baseUrl', 'http://localhost:4200');
    Cypress.env('backendUrl', 'https://localhost:7259/api');
  });
  beforeEach(() => {
    cy.visit('/bin-dashboard');
  });

  it('should display the dashboard title', () => {
    cy.get('.dashboard-title').should('contain', 'Bin Management Dashboard');
    cy.wait(2000);
  });

  it('should display the sidebar navigation', () => {
    cy.get('app-side-nav').should('be.visible');
    cy.wait(2000);

  });

  it('should display the key stats correctly', () => {
    cy.get('.stat-card .stat-header h3').should('contain', 'In Maintenance Bins');
    cy.get('.stat-card .stat-value').should('not.be.empty');
    cy.wait(2000);

  });

  });
