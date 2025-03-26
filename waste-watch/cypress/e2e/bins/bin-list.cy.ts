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
        location: { latitude: 0, longitude: 0 },
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
});

// Test 2: Check if the Add Bin form is displayed when the button is clicked
it('should show add bin form when clicked', () => {
  cy.get('button.btn-add').click();
  cy.get('.bin-form-container').should('be.visible');
});

// Test 3: Check if the Add Bin form is submitted and bin is created
it('should submit add bin form successfully', () => {
  // Mock the POST request to create a bin without actually hitting the backend
  cy.intercept('POST', '/api/bins', {
    statusCode: 200,
    body: {
      id: 4,
      type: 'Recycling',
      capacity: 50,
      location: { latitude: 0, longitude: 0 },
      lastEmptied: '2025-03-24T12:00:00Z',
      fillLevel: 0,  // Add fill level for testing
      status: 0
    }
  }).as('postBin');

  // Open Add Bin form
  cy.get('button.btn-add').click();

  // Fill in the form with hardcoded data
  cy.get('input[name="capacity"]').type('50'); // Set capacity
  cy.get('select[name="type"]').select('Recycling'); // Select type

  // Submit the form
  cy.get('button[type="submit"]').click();

  // Wait for the POST request to be mocked
  cy.wait('@postBin');

});

