/**
 * DELETE /api/cart/clear
 * Clear the entire shopping cart
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function DELETE() {
  try {
    // 1. Authenticate user
    const supabaseClient = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 2. Get user's cart
    const { data: cart, error: cartError } = await supabaseClient
      .from('carts')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (cartError || !cart) {
      // Cart doesn't exist, but return success (idempotent)
      return NextResponse.json(
        {
          success: true,
          message: 'Cart cleared',
          cart_id: null,
        },
        { status: 200 }
      )
    }

    // 3. Delete all cart items
    const { error: deleteError } = await supabaseClient
      .from('cart_items')
      .delete()
      .eq('cart_id', cart.id)

    if (deleteError) {
      return NextResponse.json(
        { error: 'Failed to clear cart' },
        { status: 500 }
      )
    }

    // 4. Return success
    return NextResponse.json(
      {
        success: true,
        message: 'Cart cleared',
        cart_id: cart.id,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Clear cart error:', error)

    return NextResponse.json(
      {
        error: 'Failed to clear cart',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
