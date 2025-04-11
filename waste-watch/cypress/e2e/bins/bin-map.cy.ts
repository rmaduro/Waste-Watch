describe('Simple Bin Map Page Tests', () => {
  before(() => {
    Cypress.config('baseUrl', 'http://localhost:4200');
    Cypress.env('backendUrl', 'https://localhost:7259/api');
  });

  beforeEach(() => {
    cy.visit('/bin-map');
  });

  it('should display the page title', () => {
    cy.get('.dashboard-title').should('contain.text', 'Bin Map');
  });
  // Bin list tests
  it('should display the bins list', () => {
    cy.get('.bin-card').should('have.length.greaterThan', 0);
  });

  it('should display bin details in cards', () => {
    cy.get('.bin-card').first().within(() => {
      cy.get('.bin-id').should('not.be.empty');
      cy.get('.bin-status').should('not.be.empty');
      cy.contains('Type').should('exist');
      cy.contains('Capacity').should('exist');
    });
  });

  // Status badge tests
  it('should show correct status badge colors', () => {
    cy.get('.bin-card').each(($card) => {
      cy.wrap($card).within(() => {
        const status = $card.find('.bin-status').text().trim();
        const statusClass = $card.find('.bin-status').attr('class');

        if (status === 'Empty') {
          expect(statusClass).to.include('status-empty');
        } else if (status === 'Partial') {
          expect(statusClass).to.include('status-partial');
        } else if (status === 'Almost Full') {
          expect(statusClass).to.include('status-full');
        } else if (status === 'Full') {
          expect(statusClass).to.include('status-overflow');
        } else if (status === 'Damaged') {
          expect(statusClass).to.include('Damaged');
        }
      });
    });
  });});
