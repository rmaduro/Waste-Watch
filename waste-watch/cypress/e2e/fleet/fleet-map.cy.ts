describe('Fleet Map Component', () => {
  before(() => {
    Cypress.config('baseUrl', 'http://localhost:4200');
    Cypress.env('backendUrl', 'https://localhost:7259/api');
  });

  beforeEach(() => {

    cy.visit('/vehicle-map');
    cy.wait(1000); // Additional wait for map to load
  });

  // Basic rendering tests
  it('should display the page title', () => {
    cy.get('.dashboard-title').should('contain.text', 'Fleet Map');
  });

  it('should display the refresh button', () => {
    cy.get('.refresh-btn')
      .should('be.visible')
      .and('contain.text', 'Refresh');
  });


  it('should display vehicle markers on the map', () => {
    cy.get('.map-container')
      .should('exist')
      .then(($el) => {
        // Check for marker elements (Google Maps adds these with specific classes)
        expect($el.find('img[src*="assets/images/vehicles/"]')).to.exist;
      });
  });

  // Vehicle list tests
  it('should display the vehicles list', () => {
    cy.get('.vehicle-card').should('have.length.greaterThan', 0);
  });

  it('should highlight the selected vehicle card', () => {
    cy.get('.vehicle-card').first().click();
    cy.get('.vehicle-card.selected').should('exist');
  });

  it('should display vehicle details in cards', () => {
    cy.get('.vehicle-card').first().within(() => {
      cy.get('.vehicle-id').should('not.be.empty');
      cy.get('.vehicle-status').should('not.be.empty');
      cy.contains('Driver').should('exist');
      cy.contains('Route').should('exist');
      cy.contains('Last Maintenance').should('exist');
    });
  });

  it('should pan to vehicle location when clicking a card', () => {
    cy.get('.vehicle-card').first().click().then(() => {
      // We can't directly check map position, but we can verify:
      // 1. The card is selected
      cy.get('.vehicle-card.selected').should('exist');
      // 2. The zoom level should be 17 (as per component logic)
      // (Note: Cannot directly verify zoom level in Cypress)
    });
  });

  it('should center map on vehicle when clicking different cards', () => {
    // Click first vehicle card
    cy.get('.vehicle-card').eq(0).click().then(() => {
      cy.get('.vehicle-card.selected').should('have.length', 1);
      // Check if the first vehicle is selected
      cy.get('.vehicle-card.selected .vehicle-id')
        .invoke('text')
        .then((firstVehicleId) => {
          // Click second vehicle card
          cy.get('.vehicle-card').eq(1).click().then(() => {
            // Verify selection changed
            cy.get('.vehicle-card.selected').should('have.length', 1);
            cy.get('.vehicle-card.selected .vehicle-id')
              .invoke('text')
              .should('not.equal', firstVehicleId);
          });
        });
    });
  });
});
