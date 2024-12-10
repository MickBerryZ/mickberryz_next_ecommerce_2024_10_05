import { OAuthStrategy, createClient } from '@wix/sdk';
import { collections, products } from '@wix/stores';
import { orders } from '@wix/ecom';
import { cookies } from 'next/headers';
import { members } from '@wix/members';

export const wixClientServer = async () => {
  let refreshToken;

  try {
    const cookieStore = cookies();
    // refreshToken = cookieStore.get('refreshToken')?.value;
    const tokenString = cookieStore.get('refreshToken')?.value;

    if (tokenString) {
      refreshToken = JSON.parse(tokenString);
    }
    // If the refreshToken is not found, throw an error or set a fallback value
    if (!refreshToken) {
      throw new Error('Refresh token is missing. User may not be authenticated.');
    }
  } catch (e) {
    console.error('Error reading refresh token', e);
  }

  // Ensure refreshToken is a valid string. If not, throw an error.
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  const wixClient = createClient({
    modules: {
      products,
      collections,
      orders,
      members,
    },
    auth: OAuthStrategy({
      clientId: process.env.NEXT_PUBLIC_WIX_CLIENT_ID!,
      tokens: {
        refreshToken,
        accessToken: { value: '', expiresAt: 0 },
      },
    }),
  });

  return wixClient;
};
