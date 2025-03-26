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
  });

  it('should display the sidebar navigation', () => {
    cy.get('app-side-nav').should('be.visible');
  });

  it('should display the refresh button and trigger data reload', () => {
    cy.get('.refresh-btn').should('be.visible').click();
    cy.intercept('GET', '/api/collection-history').as('fetchHistory');
    cy.wait('@fetchHistory');
  });

  it('should display the key stats correctly', () => {
    cy.get('.stat-card .stat-header h3').should('contain', 'In Maintenance Bins');
    cy.get('.stat-card .stat-value').should('not.be.empty');
  });

  it('should display collection history table', () => {
    cy.get('.table-section h4').should('contain', 'Collection History');
    cy.get('.bin-table thead tr th').should('have.length', 6);
    cy.get('.bin-table tbody tr').should('have.length.greaterThan', 0);
  });

  it('should display maintenance history table', () => {
    cy.get('.table-section h4').should('contain', 'Maintenance History');
    cy.get('.bin-table thead tr th').should('have.length', 6);
    cy.get('.bin-table tbody tr').should('have.length.greaterThan', 0);
  });

  it('should show message when no collection history is available', () => {
    cy.intercept('GET', '/api/collection-history', []).as('fetchEmptyHistory');
    cy.wait('@fetchEmptyHistory');
    cy.get('.bin-table tbody tr td').should('contain', 'No collection history data available.');
  });

  it('should show message when no maintenance history is available', () => {
    cy.intercept('GET', '/api/maintenance-history', []).as('fetchEmptyMaintenance');
    cy.wait('@fetchEmptyMaintenance');
    cy.get('.bin-table tbody tr td').should('contain', 'No maintenance history available.');
  });
});
