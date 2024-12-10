import { create } from 'zustand';
import { currentCart } from '@wix/ecom';
import { WixClient } from '@/context/wixContext';

type CartState = {
  cart: currentCart.Cart;
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
  getCart: async (wixClient) => {
    const wixAccessToken = wixClient.auth.getTokens().accessToken.value;
    try {
      // Check if user is authenticated
      //   if (!wixClient.auth.tokens.accessToken.value) {
      //     throw new Error('User is not authenticated.');
      //   }
      if (!wixAccessToken) throw new Error('User is not authenticated.');
      const cart = await wixClient.currentCart.getCurrentCart();
      set({
        cart: cart || [],
        isLoading: false,
        counter: cart?.lineItems?.length || 0,
      });
    } catch (err) {
      console.error('Error fetching cart:', err);
      set((prev) => ({ ...prev, isLoading: false }));
      //         if (err.message.includes("OWNER_CART_NOT_FOUND")) {
      //             console.warn("No Cart found for this user.")
      //             set({ cart: [], isLoading: false, counter: 0 });
      //         } else if (err.message.includes("System error occurred")) {
      //   console.warn('System error occurred:', err);
      // } else {
      //   console.error('Error fetching cart:', err);
      // }
      // set({ isLoading: false });
    }
  },
  addItem: async (wixClient, productId, variantId, quantity) => {
    set((state) => ({ ...state, isLoading: true }));
    const response = await wixClient.currentCart.addToCurrentCart({
      lineItems: [
        {
          catalogReference: {
            appId: process.env.NEXT_PUBLIC_WIX_APP_ID!,
            catalogItemId: productId,
            ...(variantId && {
              options: {
                variantId,
              },
            }),
          },
          quantity: quantity,
        },
      ],
    });

    set({
      cart: response.cart,
      counter: response.cart?.lineItems.length,
      isLoading: false,
    });
  },
  removeItem: async (wixClient, itemId) => {
    set((state) => ({ ...state, isLoading: true }));
    const response = await wixClient.currentCart.removeLineItemsFromCurrentCart([itemId]);

    set({
      cart: response.cart,
      counter: response.cart?.lineItems.length,
      isLoading: false,
    });
  },
}));
