import { create } from 'zustand';
import { currentCart } from '@wix/ecom';
import { WixClient } from '@/context/wixContext';

type CartState = {
  cart: currentCart.Cart | [];
  isLoading: boolean;
  counter: number;
  getCart: (wixClient: WixClient) => void;
  addItem: (wixClient: WixClient, productId: string, variantId: string, quantity: number) => void;
  removeItem: (wixClient: WixClient, itemId: string) => void;
};

export const useCartStore = create<CartState>((set) => ({
  cart: [],
  isLoading: true,
  counter: 0,

  // Fetch the cart only if the user is authenticated
  getCart: async (wixClient) => {
    try {
      const wixAccessToken = wixClient.auth.getTokens().accessToken.value;
      console.log('Access Token:', wixAccessToken);

      if (!wixAccessToken) throw new Error('User is not authenticated.');

      const cart = await wixClient.currentCart.getCurrentCart();
      set({
        cart: cart || [],
        isLoading: false,
        counter: cart?.lineItems?.length || 0,
      });
    } catch (err) {
      if (err instanceof Error) {
        console.error('Error fetching cart:', err.message);

        if (err.message.includes('OWNER_CART_NOT_FOUND')) {
          console.warn('No cart found for this user.');
          set({ cart: [], isLoading: false, counter: 0 });
        } else {
          set((prev) => ({ ...prev, isLoading: false }));
        }
      } else {
        console.error('Unknow error fetching cart:', err);
        set((prev) => ({ ...prev, isLoading: false }));
      }
    }
  },
  addItem: async (wixClient, productId, variantId, quantity) => {
    try {
      set((state) => ({ ...state, isLoading: true }));
      const response = await wixClient.currentCart.addToCurrentCart({
        lineItems: [
          {
            catalogReference: {
              appId: process.env.NEXT_PUBLIC_WIX_APP_ID!,
              catalogItemId: productId,
              ...(variantId && { options: { variantId } }),
            },
            quantity: quantity,
          },
        ],
      });

      if (!response || !response.cart) throw new Error('Failed to update cart.');

      set({
        cart: response.cart,
        counter: response.cart?.lineItems.length || 0,
        isLoading: false,
      });
    } catch (err) {
      if (err instanceof Error) {
        console.error('Error adding item to cart:', err.message);
      } else {
        console.error('Unknow error adding item to cart:', JSON.stringify(err));
      }
      set({ isLoading: false });
    }
  },
  removeItem: async (wixClient, itemId) => {
    try {
      set((state) => ({ ...state, isLoading: true }));
      const response = await wixClient.currentCart.removeLineItemsFromCurrentCart([itemId]);

      if (!response || !response.cart) throw new Error('Failed to update cart.');

      set({
        cart: response.cart,
        counter: response.cart?.lineItems.length || 0,
        isLoading: false,
      });
    } catch (err) {
      if (err instanceof Error) {
        console.error('Error removing item from cart:', err.message);
      } else {
        console.error('Unknown error removing item from cart:', JSON.stringify(err));
      }
      set({ isLoading: false });
    }
  },
}));
