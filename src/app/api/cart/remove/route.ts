/**
 * POST /api/cart/remove
 * Remove a product from the user's cart
 * 
 * Request body:
 * {
 *   "product_id": number
 * }
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
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

    // 2. Parse request body
    const body = await request.json()
    const { product_id } = body

    if (!product_id) {
      return NextResponse.json(
        { error: 'Missing product_id' },
        { status: 400 }
      )
    }

    // 3. Get user's cart
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
          message: 'Product removed from cart',
          cart_id: null,
        },
        { status: 200 }
      )
    }

    // 4. Delete the cart item (if it exists)
    const { error: deleteError } = await supabaseClient
      .from('cart_items')
      .delete()
      .eq('cart_id', cart.id)
      .eq('product_id', product_id)

    if (deleteError) {
      // If item doesn't exist, still return success (idempotent)
      console.warn('Delete cart item warning:', deleteError)
    }

    // 5. Return success
    return NextResponse.json(
      {
        success: true,
        message: 'Product removed from cart',
        cart_id: cart.id,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Remove from cart error:', error)

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Invalid JSON body' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        error: 'Failed to remove product from cart',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
