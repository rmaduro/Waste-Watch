describe('Vehicle List Component', () => {
  let vehicleId: string;  // Explicitly define the type as string

  before(() => {
    Cypress.config('baseUrl', 'http://localhost:4200');
    Cypress.env('backendUrl', 'https://localhost:7259/api');
  });

  beforeEach(() => {
    cy.visit('/vehicle-list');
  });

  it('should display a "No vehicles found" message if no vehicles exist', () => {
    cy.intercept('GET', '/api/vehicles', { body: [] });  // Mock empty vehicle list response
    cy.visit('/vehicle-list');  // Visit the page again to refresh the vehicle list
    cy.contains('No vehicles found').should('be.visible');  // Verify the message is visible
    cy.wait(2000);

  });


  it('should load the page and display the vehicle list', () => {
    cy.get('.vehicle-list-container').should('exist');
    cy.get('.title').contains('Vehicle List').should('be.visible');
    cy.get('.vehicle-table').should('exist');
    cy.wait(2000);

  });

  it('should add a new vehicle and capture its ID', () => {
    // Open the Add Vehicle form
    cy.get('.btn-add').click();

    // Fill the form with vehicle data
    cy.get('input[name="licensePlate"]').type('ABC123');
    cy.get('select[name="routeType"]').select('Commercial');
    cy.get('select[name="maxCapacity"]').select('1000kg');
    cy.get('input[name="lastMaintenance"]').type('2025-03-23');

    cy.get('select[name="driverSelect"]').should('not.have.attr', 'disabled');
    cy.get('select[name="driverSelect"] option').should('have.length.greaterThan', 1);
    cy.get('select[name="driverSelect"]').select(1); // Select first driver

    // Submit the form
    cy.get('.btn-submit').click();

    // Capture the ID of the added vehicle (Assuming the ID is shown or available in the response)
    cy.get('.vehicle-table tbody tr').last().find('td:first').invoke('text').then((text) => {
      vehicleId = text.trim();  // Capture the ID from the first column
    });

    // Ensure the new vehicle appears in the list
    cy.get('.vehicle-table tbody tr').should('have.length.greaterThan', 0);
    cy.contains('ABC123').should('be.visible');
    cy.wait(2000);
  });


  it('should search vehicles by ID (dynamically)', () => {
    // Assuming the ID of the newly added vehicle is stored in 'vehicleId'
    cy.get('input.search-input').type(vehicleId);  // Use the dynamically captured ID

    cy.wait(500);

    // Verify that the row with the added vehicle is visible
    cy.get('tbody tr').contains(vehicleId).should('be.visible');
    cy.wait(2000);

  });

  it('should filter vehicles by route type', () => {
    cy.get('select[name="routes"]').select('Commercial'); // Route type filter

    cy.wait(500);

    cy.get('tbody tr').each(($tr) => {
      cy.wrap($tr).contains('Commercial'); // Ensure each row has Commercial route type
    });
    cy.wait(2000);

  });

  it('should filter vehicles by capacity', () => {
    cy.get('select[name="capacities"]').select('1000kg'); // Capacity filter

    cy.wait(500);

    cy.get('tbody tr').each(($tr) => {
      cy.wrap($tr).contains('1000kg'); // Ensure each row has 1000kg capacity
    });
    cy.wait(2000);

  });

  it('should delete the selected vehicle', () => {
    // Select the row of the added vehicle dynamically
    cy.get('tbody tr').contains(vehicleId).click();

    cy.get('.btn-remove').click();
    cy.get('.delete-confirmation-container').should('be.visible');
    cy.contains('Confirm Deletion').should('be.visible');

    cy.get('.btn-delete').click();

    // Verify that the vehicle is deleted and no longer in the list
    cy.contains('No vehicles found').should('be.visible');

  });

});
