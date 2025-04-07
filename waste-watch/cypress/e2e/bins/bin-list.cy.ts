before(() => {
  // Configuration
  Cypress.config('baseUrl', 'http://localhost:4200');
  Cypress.env('backendUrl', 'https://localhost:7259/api');

  // Mock the API response for bin list
  cy.intercept('GET', '/api/bins', {
    statusCode: 200,
    body: [
      {
        id: 1,
        type: 'Recycling',
        capacity: 50,
        location: { latitude: '38.33093' ,longitude: 8.51333 },
        lastEmptied: '2025-03-24T12:00:00Z',
        fillLevel: 80,
        status: 1
      }
    ]
  }).as('getBins');

  // Mock the current user API to avoid 401 errors
  cy.intercept('GET', '/api/auth/current-user', {
    statusCode: 200,
    body: { id: 1, name: 'Test User' }
  }).as('getUser');
});

beforeEach(() => {
  cy.visit('/bin-list'); // Visit the page containing the BinListComponent
});

// Test 1: Check if the bin list loads successfully and displays bins
it('should load and display bins', () => {
  cy.wait('@getBins'); // Wait for the bins to be fetched
  cy.get('.bin-table tbody tr').should('have.length', 1); // There should be 1 bin
  cy.get('.bin-table thead th').contains('ID');
  cy.get('.bin-table thead th').contains('Type');
  cy.get('.bin-table thead th').contains('Location');
  cy.get('.bin-table thead th').contains('Fill Level');  // Verify Fill Level column
  cy.get('.bin-table thead th').contains('Status');
  cy.get('.bin-table thead th').contains('Max Capacity');
  cy.get('.bin-table thead th').contains('Last Emptied');
  cy.wait(2000);
});

// Test 2: Check if the Add Bin form is displayed when the button is clicked
it('should show add bin form when clicked', () => {
  cy.get('button.btn-add').click();
  cy.get('.bin-form-container').should('be.visible');
});

