/**
 * GET /api/cart
 * Fetch user's shopping cart with all items and totals
 * 
 * POST /api/cart
 * Add a product to the user's shopping cart
 * 
 * Request body (POST):
 * {
 *   "product_id": number,
 *   "quantity": number (default: 1)
 * }
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type Product = {
  id: number
  name: string
  price: number
  image_url: string
  stock: number
}

type Cart = {
  id: number
}

type CartItem = {
  id: number
  product_id: number
  quantity: number
  products: Product
}

type CartItemBasic = {
  id: number
  quantity: number
}

type CartItemFromDB = {
  id: number
  product_id: number
  quantity: number
  products: Product[] | Product
}

export async function GET() {
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
      .select('id, created_at, updated_at')
      .eq('user_id', user.id)
      .single()

    // If cart doesn't exist, return empty cart response
    if (cartError && cartError.code === 'PGRST116') {
      return NextResponse.json(
        {
          success: true,
          cart: {
            id: null,
            user_id: user.id,
            items: [],
            totals: {
              subtotal: 0,
              tax: 0,
              shipping: 0,
              total: 0,
            },
          },
        },
        { status: 200 }
      )
    }

    if (cartError || !cart) {
      return NextResponse.json(
        { error: 'Failed to fetch cart' },
        { status: 500 }
      )
    }

    // 3. Get cart items with product details
    const { data: cartItems, error: itemsError } = await supabaseClient
      .from('cart_items')
      .select(
        `
        id,
        product_id,
        quantity,
        products:product_id(id, name, price, image_url, stock)
        `
      )
      .eq('cart_id', cart.id)

    if (itemsError) {
      return NextResponse.json(
        { error: 'Failed to fetch cart items' },
        { status: 500 }
      )
    }

    // 4. Calculate totals
    const items = ((cartItems as unknown) as CartItemFromDB[]).map((item) => {
      const product = Array.isArray(item.products) ? item.products[0] : item.products
      return {
        id: item.id,
        product_id: item.product_id,
        quantity: item.quantity,
        product,
      }
    })

    const subtotal = items.reduce(
      (sum: number, item) => sum + item.product.price * item.quantity,
      0
    )

    // Constants for tax and shipping
    const TAX_RATE = 0.1 // 10%
    const SHIPPING_COST = 5.0 // $5 flat rate
    const FREE_SHIPPING_THRESHOLD = 50.0 // Free shipping over $50

    const tax = subtotal * TAX_RATE
    const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST
    const total = subtotal + tax + shipping

    // 5. Return response
    return NextResponse.json(
      {
        success: true,
        cart: {
          id: cart.id,
          user_id: user.id,
          items,
          totals: {
            subtotal: Math.round(subtotal * 100) / 100,
            tax: Math.round(tax * 100) / 100,
            shipping,
            total: Math.round(total * 100) / 100,
          },
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Get cart error:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch cart',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

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
    const { product_id, quantity = 1 } = body

    if (!product_id || quantity <= 0) {
      return NextResponse.json(
        { error: 'Invalid product_id or quantity' },
        { status: 400 }
      )
    }

    // 3. Verify product exists and has stock
    const { data: product, error: productError } = await supabaseClient
      .from('products')
      .select('id, name, price, image_url, stock')
      .eq('id', product_id)
      .single() as { data: Product | null; error: unknown }

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
        },
        { status: 409 }
      )
    }

    // 4. Get or create user's cart
    const cartResult = await supabaseClient
      .from('carts')
      .select('id')
      .eq('user_id', user.id)
      .single() as { data: Cart | null; error: unknown }

    let cart: Cart | null = cartResult.data

    if (cartResult.error) {
      // Cart doesn't exist, create it
      const { data: newCart, error: createError } = await supabaseClient
        .from('carts')
        .insert({ user_id: user.id })
        .select('id')
        .single() as { data: Cart | null; error: unknown }

      if (createError || !newCart) {
        return NextResponse.json(
          { error: 'Failed to create cart' },
          { status: 500 }
        )
      }

      cart = newCart
    }

    if (!cart) {
      return NextResponse.json(
        { error: 'Failed to get or create cart' },
        { status: 500 }
      )
    }

    const cartId = cart.id

    // 5. Add or update cart item
    const { data: existingItem } = await supabaseClient
      .from('cart_items')
      .select('id, quantity')
      .eq('cart_id', cartId)
      .eq('product_id', product_id)
      .single() as { data: CartItemBasic | null; error: unknown }

    let cartItem: CartItem | null = null

    if (existingItem) {
      // Update existing item quantity
      const newQuantity = existingItem.quantity + quantity

      if (product.stock < newQuantity) {
        return NextResponse.json(
          {
            error: 'Insufficient stock for requested quantity',
            available: product.stock,
            current: existingItem.quantity,
          },
          { status: 409 }
        )
      }

      const { data: updatedItem, error: updateError } = await supabaseClient
        .from('cart_items')
        .update({ quantity: newQuantity })
        .eq('id', existingItem.id)
        .select()
        .single() as { data: CartItem | null; error: unknown }

      if (updateError) {
        return NextResponse.json(
          { error: 'Failed to update cart item' },
          { status: 500 }
        )
      }

      cartItem = updatedItem
    } else {
      // Insert new item
      const { data: newItem, error: insertError } = await supabaseClient
        .from('cart_items')
        .insert({
          cart_id: cartId,
          product_id,
          quantity,
        })
        .select()
        .single() as { data: CartItem | null; error: unknown }

      if (insertError) {
        return NextResponse.json(
          { error: 'Failed to add item to cart' },
          { status: 500 }
        )
      }

      cartItem = newItem
    }

    if (!cartItem) {
      return NextResponse.json(
        { error: 'Failed to process cart item' },
        { status: 500 }
      )
    }

    // 6. Return response
    return NextResponse.json(
      {
        success: true,
        message: 'Product added to cart',
        cart_item: {
          id: cartItem.id,
          cart_id: cartId,
          product_id: cartItem.product_id,
          quantity: cartItem.quantity,
          product: {
            id: product.id,
            name: product.name,
            price: product.price,
            image_url: product.image_url,
            stock: product.stock,
          },
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Add to cart error:', error)

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Invalid JSON body' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        error: 'Failed to add product to cart',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
