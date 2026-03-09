import { test, expect } from '@playwright/test'

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'

test.describe('US-001: Offer Boost Feature', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL)
  })

  test.describe('Happy Path - Stripe', () => {
    test('User clicks Boost button and completes Stripe payment', async ({ page }) => {
      await page.route('**/api/offers/*/boost', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            boostId: 'mock-boost-id',
            clientSecret: 'mock_client_secret',
            paymentMethod: 'stripe',
            amount: 0.01,
            currency: 'usd',
            boostDuration: 7
          })
        });
      });

      const boostButton = page.locator('[data-testid="boost-button"]').first()
      await boostButton.click()

      await expect(page.locator('text=⭐ Destacar Oferta')).toBeVisible()

      await page.locator('button:has-text("Cartão Stripe")').click()
      await page.locator('button:has-text("Confirmar Boost")').click()

      await page.waitForURL(/payment-confirmation\?client_secret=mock_client_secret/)
      expect(page.url()).toContain('client_secret=mock_client_secret')
    })
  })

  test.describe('Happy Path - Mercado Pago', () => {
    test('User clicks Boost button and completes Mercado Pago payment', async ({ page }) => {
      await page.route('**/api/offers/*/boost', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            boostId: 'mock-boost-id',
            redirectUrl: 'https://www.mercadopago.com.br/mock-checkout',
            paymentMethod: 'mercado_pago',
            amount: 0.01,
            currency: 'usd',
            boostDuration: 7
          })
        });
      });

      const boostButton = page.locator('[data-testid="boost-button"]').first()
      await boostButton.click()

      await page.locator('button:has-text("Mercado Pago")').click()
      await page.locator('button:has-text("Confirmar Boost")').click()

      await page.waitForURL(/mercadopago\.com/)
      expect(page.url()).toContain('mercadopago.com.br/mock-checkout')
    })
  })

  test.describe('Error Scenarios', () => {
    test('Cancel payment closes modal without charge', async ({ page }) => {
      const boostButton = page.locator('[data-testid="boost-button"]').first()
      await boostButton.click()

      await page.locator('button:has-text("Cancelar")').click()

      await expect(page.locator('text=⭐ Destacar Oferta')).not.toBeVisible()
    })

    test('Payment failure shows error message', async ({ page }) => {
      await page.route('**/api/offers/*/boost', async route => {
        await route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({
            error: 'Payment failed due to insufficient funds'
          })
        });
      });

      const boostButton = page.locator('[data-testid="boost-button"]').first()
      await boostButton.click()

      await page.locator('button:has-text("Confirmar Boost")').click()

      const errorMessage = page.locator('[data-testid="error-message"]')
      await expect(errorMessage).toBeVisible()
      await expect(errorMessage).toContainText('Payment failed due to insufficient funds')
    })
  })
})