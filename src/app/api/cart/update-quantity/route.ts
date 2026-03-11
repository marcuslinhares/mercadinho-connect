/**
 * PUT /api/cart/update-quantity
 * Update the quantity of a product in the cart
 * 
 * Request body:
 * {
 *   "product_id": number,
 *   "quantity": number
 * }
 * 
 * If quantity is 0 or negative, the item is removed from the cart.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PUT(request: NextRequest) {
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
    const { product_id, quantity } = body

    if (!product_id || quantity === undefined) {
      return NextResponse.json(
        { error: 'Missing product_id or quantity' },
        { status: 400 }
      )
    }

    if (!Number.isInteger(quantity) || quantity < 0) {
      return NextResponse.json(
        { error: 'Quantity must be a non-negative integer' },
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
      return NextResponse.json(
        { error: 'Cart not found' },
        { status: 404 }
      )
    }

    // 4. Get existing cart item
    const { data: cartItem, error: itemError } = await supabaseClient
      .from('cart_items')
      .select('id')
      .eq('cart_id', cart.id)
      .eq('product_id', product_id)
      .single()

    if (itemError || !cartItem) {
      return NextResponse.json(
        { error: 'Item not found in cart' },
        { status: 404 }
      )
    }

    // 5. If quantity is 0, delete the item
    if (quantity === 0) {
      const { error: deleteError } = await supabaseClient
        .from('cart_items')
        .delete()
        .eq('id', cartItem.id)

      if (deleteError) {
        return NextResponse.json(
          { error: 'Failed to delete cart item' },
          { status: 500 }
        )
      }

      return NextResponse.json(
        {
          success: true,
          message: 'Item removed from cart',
          cart_item: {
            id: cartItem.id,
            product_id,
            quantity: 0,
          },
        },
        { status: 200 }
      )
    }

    // 6. Check product stock
    const { data: product, error: productError } = await supabaseClient
      .from('products')
      .select('stock')
      .eq('id', product_id)
      .single()

    if (productError || !product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    if (product.stock < quantity) {
      return NextResponse.json(
        {
          error: 'Insufficient stock',
          available: product.stock,
          requested: quantity,
        },
        { status: 409 }
      )
    }

    // 7. Update the quantity
    const { data: updatedItem, error: updateError } = await supabaseClient
      .from('cart_items')
      .update({ quantity })
      .eq('id', cartItem.id)
      .select()
      .single()

    if (updateError || !updatedItem) {
      return NextResponse.json(
        { error: 'Failed to update cart item quantity' },
        { status: 500 }
      )
    }

    // 8. Return response
    return NextResponse.json(
      {
        success: true,
        message: 'Quantity updated',
        cart_item: {
          id: updatedItem.id,
          product_id: updatedItem.product_id,
          quantity: updatedItem.quantity,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Update quantity error:', error)

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Invalid JSON body' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        error: 'Failed to update cart item quantity',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
