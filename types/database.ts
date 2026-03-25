export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: string
          name: string
          flavor: string
          presentation: string
          stock: number
          min_stock: number
          cost_price: number
          sale_price: number
          image_url: string | null
          active: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['products']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['products']['Insert']>
      }
      orders: {
        Row: {
          id: string
          created_at: string
          customer_id: string | null
          customer_name: string
          customer_phone: string
          customer_email: string | null
          customer_address: string | null
          items: Json
          total: number
          status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
          notes: string | null
        }
        Insert: Omit<Database['public']['Tables']['orders']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['orders']['Insert']>
      }
      customers: {
        Row: {
          id: string
          name: string
          phone: string | null
          email: string | null
          address: string | null
          tags: string[]
          notes: string | null
          created_at: string
          total_spent: number
          order_count: number
        }
        Insert: Omit<Database['public']['Tables']['customers']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['customers']['Insert']>
      }
      leads: {
        Row: {
          id: string
          name: string
          phone: string | null
          email: string | null
          channel: string
          interest: string | null
          status: 'new' | 'contacted' | 'interested' | 'converted' | 'discarded'
          notes: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['leads']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['leads']['Insert']>
      }
      stock_movements: {
        Row: {
          id: string
          product_id: string
          type: 'in' | 'out' | 'adjustment'
          quantity: number
          cost: number | null
          supplier: string | null
          date: string
          notes: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['stock_movements']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['stock_movements']['Insert']>
      }
      expenses: {
        Row: {
          id: string
          category: string
          amount: number
          date: string
          notes: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['expenses']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['expenses']['Insert']>
      }
      campaigns: {
        Row: {
          id: string
          name: string
          platform: string
          start_date: string
          end_date: string | null
          budget: number
          reach: number | null
          clicks: number | null
          conversions: number | null
          attributed_sales: number | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['campaigns']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['campaigns']['Insert']>
      }
      site_content: {
        Row: {
          id: string
          key: string
          value: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['site_content']['Row'], 'id' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['site_content']['Insert']>
      }
      faq: {
        Row: {
          id: string
          question: string
          answer: string
          order: number
          active: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['faq']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['faq']['Insert']>
      }
      pickup_points: {
        Row: {
          id: string
          name: string
          address: string
          schedule: string | null
          active: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['pickup_points']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['pickup_points']['Insert']>
      }
      abandoned_carts: {
        Row: {
          id: string
          email: string
          customer_name: string
          items: Json
          total: number
          recovered: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['abandoned_carts']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['abandoned_carts']['Insert']>
      }
    }
  }
}

// Convenience types
export type Product = Database['public']['Tables']['products']['Row']
export type Order = Database['public']['Tables']['orders']['Row']
export type Customer = Database['public']['Tables']['customers']['Row']
export type Lead = Database['public']['Tables']['leads']['Row']
export type StockMovement = Database['public']['Tables']['stock_movements']['Row']
export type Expense = Database['public']['Tables']['expenses']['Row']
export type Campaign = Database['public']['Tables']['campaigns']['Row']
export type SiteContent = Database['public']['Tables']['site_content']['Row']
export type FAQ = Database['public']['Tables']['faq']['Row']
export type PickupPoint = Database['public']['Tables']['pickup_points']['Row']
export type AbandonedCart = Database['public']['Tables']['abandoned_carts']['Row']

/** One flavor's contribution inside a mixed pack */
export interface FlavorChoice {
  flavorName: string
  imageUrl: string | null
  count: number
}

/** A pack (x3/x6/x12/x24) with a custom flavor mix in the cart */
export interface PackCartItem {
  cartId: string        // unique id per cart entry
  packSize: number      // 3 | 6 | 12 | 24
  packLabel: string     // "Pack x3"
  price: number         // total price for ONE pack
  quantity: number      // how many of this pack
  flavors: FlavorChoice[]
}

/** @deprecated kept for type compatibility — replaced by PackCartItem */
export interface CartItem {
  product: Product
  quantity: number
}
