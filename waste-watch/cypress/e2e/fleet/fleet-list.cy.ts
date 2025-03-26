describe('Bin List Component', () => {
  let newBinId: string = ''; // Explicitly type the newBinId as a string

  before(() => {
    Cypress.config('baseUrl', 'http://localhost:4200');
    Cypress.env('backendUrl', 'https://localhost:7259/api');
  });

  beforeEach(() => {
    cy.visit('/bin-list');
  });

  it('should load the bin list and display bins from the database', () => {
    cy.request('GET', '/api/bins').then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.length.greaterThan(0);
      cy.get('.bin-table tbody tr').should('have.length.greaterThan', 0);
    });
  });

  it('should open the add bin form and add a new bin', () => {
    cy.get('.btn-add').click(); // Click the add bin button
    cy.get('.bin-form-container').should('be.visible'); // Ensure the form is visible

    // Fill in the bin form
    cy.get('#capacity').type('200');
    cy.get('#type').select('General');

    // Intercept the POST request to /api/bins
    cy.intercept('POST', '/api/bins').as('addBin');

    cy.get('.btn-submit').click(); // Submit the form

    // Wait for the POST request to complete
    cy.wait('@addBin').then((interception) => {
      if (interception.response && interception.response.body) {
        newBinId = interception.response.body.id; // Capture the new bin ID

        // Store the new bin ID in localStorage for future use
        window.localStorage.setItem('newBinId', newBinId);
        cy.log(`Stored bin ID in localStorage: ${newBinId}`);
      } else {
        cy.log('Error: POST request response is invalid or missing.');
      }
    });

    // Ensure the bin form is closed after submission
    cy.get('.bin-form-container').should('not.exist');
  });

  it('should search and select a bin dynamically by ID', function () {
    // Retrieve the bin ID from localStorage
    const binId = window.localStorage.getItem('newBinId');
    if (!binId) {
      throw new Error('Bin ID is not available in localStorage');
    }

    // Ensure we are typing the correct bin ID into the search field
    cy.get('.search-input').type(binId);
    cy.get('.bin-table tbody tr').contains(binId).should('be.visible'); // Verify the bin is visible in the table
  });

  it('should delete the selected bin', function () {
    // Retrieve the bin ID from localStorage
    const binId = window.localStorage.getItem('newBinId');
    if (!binId) {
      throw new Error('Bin ID is not available in localStorage');
    }

    // Search for the bin by ID
    cy.get('.search-input').type(binId);
    cy.get('.bin-table tbody tr').contains(binId).click(); // Click the row containing the bin ID

    // Click the remove button
    cy.get('.btn-remove').click();
    cy.get('.delete-confirmation-container').should('be.visible'); // Ensure the delete confirmation is visible

    // Confirm the deletion
    cy.get('.btn-delete').click();

    // Verify the bin is removed from the database
    cy.request('DELETE', `/api/bins/${binId}`).then((response) => {
      expect(response.status).to.eq(200); // Ensure the DELETE request was successful
      cy.log(`Bin with ID ${binId} deleted from the database`);
    });

    // Verify the bin is removed from the table by searching again
    cy.get('.search-input').clear().type(binId); // Clear the search input
    cy.get('.bin-table tbody tr').should('have.length', 0); // The bin should no longer exist
  });
});
