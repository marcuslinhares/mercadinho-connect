import { test, expect } from '@playwright/test'

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'

test.describe('US-001: Offer Boost Feature', () => {
  test.beforeEach(async ({ page }) => {
    // Login or setup auth before each test
    await page.goto(`${BASE_URL}/login`)
    // Implement actual login based on your auth system
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'test-password')
    await page.click('button[type="submit"]')
    await page.waitForNavigation()
  })

  test.describe('Happy Path - Stripe', () => {
    test('User clicks Boost button and completes Stripe payment', async ({
      page,
    }) => {
      // 1. Navigate to offers page
      await page.goto(`${BASE_URL}/offers`)

      // 2. Click "Boost" button on first offer
      const boostButton = page.locator('[data-testid="boost-button"]').first()
      await boostButton.click()

      // 3. Modal opens with Boost options
      const modal = page.locator('[role="dialog"]')
      await expect(modal).toBeVisible()

      // 4. Verify boost price display
      await expect(modal.locator('text=0.01')).toBeVisible()

      // 5. Select Stripe as payment method
      await page.click('input[value="stripe"]')

      // 6. Click Confirm button
      await page.click('button:has-text("Confirm Boost")')

      // 7. Stripe modal appears or redirects to payment
      // (This depends on Stripe integration - could be redirect or embedded)
      await page.waitForTimeout(2000) // Wait for payment processing

      // 8. Complete payment with test card
      const stripeFrame = page.frameLocator('iframe[name*="stripe"]').first()
      await stripeFrame.locator('input[name="cardnumber"]').fill('4242424242424242')
      await stripeFrame.locator('input[name="exp-date"]').fill('12/25')
      await stripeFrame.locator('input[name="cvc"]').fill('123')

      // 9. Confirm payment
      await page.click('button:has-text("Pay")')

      // 10. Wait for webhook and redirect
      await page.waitForNavigation()

      // 11. Verify boost badge appears
      const boostedBadge = page.locator('[data-testid="boosted-badge"]').first()
      await expect(boostedBadge).toBeVisible()
      await expect(boostedBadge.locator('text=Destacado')).toBeVisible()
    })

    test('Boosted offer appears at top of list', async ({ page }) => {
      // 1. Navigate to offers
      await page.goto(`${BASE_URL}/offers`)

      // 2. Get list of offers before boost
      const offersBefore = await page.locator('[data-testid="offer-card"]').all()
      const firstOfferIdBefore = await offersBefore[0].getAttribute(
        'data-offer-id'
      )

      // 3. Boost the third offer
      const boostButton = page
        .locator('[data-testid="boost-button"]')
        .nth(2)
      const offerId = await boostButton.locator('..').getAttribute(
        'data-offer-id'
      )

      await boostButton.click()
      // ... complete payment flow (simplified)

      // 4. Refresh page or wait for real-time update
      await page.reload()

      // 5. Verify boosted offer is now first
      const offersAfter = await page.locator('[data-testid="offer-card"]').all()
      const firstOfferIdAfter = await offersAfter[0].getAttribute(
        'data-offer-id'
      )

      expect(firstOfferIdAfter).toBe(offerId)
      expect(firstOfferIdBefore).not.toBe(offerId)
    })

    test('Countdown shows days remaining on boosted badge', async ({
      page,
    }) => {
      // 1. Go to offers where we have a boosted offer
      await page.goto(`${BASE_URL}/offers`)

      // 2. Find boosted offer
      const boostedCard = page
        .locator('[data-testid="boosted-badge"]:has-text("Destacado")')
        .first()

      // 3. Verify countdown is visible
      const countdown = boostedCard.locator('[data-testid="boost-countdown"]')
      await expect(countdown).toBeVisible()

      // 4. Verify format (e.g., "5 dias restantes")
      const text = await countdown.textContent()
      expect(text).toMatch(/\d+ dias restantes/)
    })
  })

  test.describe('Happy Path - Mercado Pago', () => {
    test('User clicks Boost button and completes Mercado Pago payment', async ({
      page,
    }) => {
      // 1. Navigate to offers page
      await page.goto(`${BASE_URL}/offers`)

      // 2. Click Boost button
      const boostButton = page.locator('[data-testid="boost-button"]').first()
      await boostButton.click()

      // 3. Modal opens
      const modal = page.locator('[role="dialog"]')
      await expect(modal).toBeVisible()

      // 4. Select Mercado Pago
      await page.click('input[value="mercado_pago"]')

      // 5. Click Confirm
      await page.click('button:has-text("Confirm Boost")')

      // 6. Should redirect to Mercado Pago checkout
      await page.waitForURL(/mercadopago\.com/)

      // 7. Complete payment (would need sandbox credentials)
      // ... Mercado Pago payment flow ...

      // 8. Redirect back to app
      await page.goto(`${BASE_URL}/offers`)

      // 9. Verify boost badge
      const boostedBadge = page.locator('[data-testid="boosted-badge"]').first()
      await expect(boostedBadge).toBeVisible()
    })
  })

  test.describe('Error Scenarios', () => {
    test('Cancel payment closes modal without charge', async ({ page }) => {
      // 1. Navigate to offers
      await page.goto(`${BASE_URL}/offers`)

      // 2. Click Boost
      const boostButton = page.locator('[data-testid="boost-button"]').first()
      await boostButton.click()

      // 3. Modal opens
      const modal = page.locator('[role="dialog"]')
      await expect(modal).toBeVisible()

      // 4. Click Cancel
      await page.click('button:has-text("Cancel")')

      // 5. Modal closes
      await expect(modal).not.toBeVisible()

      // 6. No boost badge appears
      await page.reload()
      const boostedBadge = page
        .locator('[data-testid="boosted-badge"]')
        .first()
      await expect(boostedBadge).not.toBeVisible()
    })

    test('Payment failure shows error message', async ({ page }) => {
      // 1. Navigate to offers
      await page.goto(`${BASE_URL}/offers`)

      // 2. Click Boost
      const boostButton = page.locator('[data-testid="boost-button"]').first()
      await boostButton.click()

      // 3. Select payment method
      await page.click('input[value="stripe"]')
      await page.click('button:has-text("Confirm Boost")')

      // 4. Fill card with decline card (4000 0000 0000 0002)
      // ... fill Stripe fields with decline card ...

      // 5. Submit
      // ... complete payment attempt ...

      // 6. Error message appears
      const errorMessage = page.locator('[data-testid="error-message"]')
      await expect(errorMessage).toBeVisible()
      await expect(errorMessage.locator('text=Payment failed')).toBeVisible()
    })

    test('Unauthenticated user redirected to login', async ({ page }) => {
      // 1. Navigate directly to offers
      await page.goto(`${BASE_URL}/offers`)

      // 2. Clear auth (logout)
      await page.context().clearCookies()

      // 3. Click Boost button
      const boostButton = page.locator('[data-testid="boost-button"]').first()
      await boostButton.click()

      // 4. Should redirect to login
      await page.waitForURL(/login/)
      expect(page.url()).toContain('/login')
    })

    test('User cannot boost same offer twice', async ({ page }) => {
      // 1. Boost an offer (full flow)
      await page.goto(`${BASE_URL}/offers`)
      // ... complete boost payment ...

      // 2. Refresh and try to boost same offer again
      await page.reload()

      // 3. Find already-boosted offer
      const boostedCard = page
        .locator('[data-testid="boosted-badge"]')
        .first()
      const boostButton = boostedCard
        .locator('[data-testid="boost-button"]')
        .first()

      // 4. Boost button should be disabled or show different state
      await expect(boostButton).toBeDisabled()
    })
  })

  test.describe('Edge Cases', () => {
    test('Boost expires after 7 days (mocked time)', async ({ page }) => {
      // 1. Create a boost
      // ... complete boost creation ...

      // 2. Mock time to 7 days + 1 second later
      // (Would need to use Playwright's clock or server-side manipulation)
      await page.context().addInitScript(() => {
        window.currentTime = new Date(
          Date.now() + 7 * 24 * 60 * 60 * 1000 + 1000
        )
      })

      // 3. Refresh page
      await page.reload()

      // 4. Boost badge should no longer show or be marked as expired
      const boostedBadge = page
        .locator('[data-testid="boosted-badge"]')
        .first()
      await expect(boostedBadge).not.toBeVisible()
    })

    test('Multiple simultaneous boost attempts prevented', async ({
      page,
    }) => {
      // 1. Open boost modal
      await page.goto(`${BASE_URL}/offers`)
      const boostButton = page.locator('[data-testid="boost-button"]').first()
      await boostButton.click()

      // 2. Click Confirm button multiple times rapidly
      const confirmButton = page.locator('button:has-text("Confirm Boost")')
      await Promise.all([
        confirmButton.click(),
        confirmButton.click(),
        confirmButton.click(),
      ])

      // 3. Wait for API response
      await page.waitForTimeout(1000)

      // 4. Only one boost created (verify in DB or UI)
      // ... assertion based on implementation ...
    })
  })

  test.describe('Integration with Frontend Components', () => {
    test('Boost button state updates on component mount', async ({
      page,
    }) => {
      // 1. Navigate to offers
      await page.goto(`${BASE_URL}/offers`)

      // 2. Check if boost button is enabled/disabled based on:
      //    - User auth status
      //    - Whether offer already has active boost
      //    - User's available funds (if applicable)

      const boostButton = page.locator('[data-testid="boost-button"]').first()

      // If boost exists, should be disabled
      const hasBadge = await page
        .locator('[data-testid="boosted-badge"]')
        .first()
        .isVisible()

      if (hasBadge) {
        await expect(boostButton).toBeDisabled()
      } else {
        await expect(boostButton).toBeEnabled()
      }
    })

    test('List reordering happens in real-time or on refresh', async ({
      page,
    }) => {
      // 1. Record initial order
      const initialOrder = await page
        .locator('[data-testid="offer-card"]')
        .all()
        .then((cards) =>
          Promise.all(
            cards.map((card) => card.getAttribute('data-offer-id'))
          )
        )

      // 2. Boost middle offer
      const boostButton = page
        .locator('[data-testid="boost-button"]')
        .nth(Math.floor(initialOrder.length / 2))
      const targetId = await boostButton
        .locator('..')
        .getAttribute('data-offer-id')

      // ... complete boost payment ...

      // 3. Refresh page
      await page.reload()

      // 4. Verify target offer is now first
      const newOrder = await page
        .locator('[data-testid="offer-card"]')
        .all()
        .then((cards) =>
          Promise.all(
            cards.map((card) => card.getAttribute('data-offer-id'))
          )
        )

      expect(newOrder[0]).toBe(targetId)
    })
  })
})
