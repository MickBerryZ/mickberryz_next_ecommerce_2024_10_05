import { OAuthStrategy, createClient } from '@wix/sdk';
import { collections, products } from '@wix/stores';
import { orders } from '@wix/ecom';
import { cookies } from 'next/headers';
import { members } from '@wix/members';

export const wixClientServer = async () => {
  let refreshToken;

  try {
    // Step 1: Retrieve the token string from cookies
    const cookieStore = cookies();
    const tokenString = cookieStore.get('refreshToken')?.value;

    if (tokenString) {
      try {
        // Step 2: Parse the token
        refreshToken = JSON.parse(tokenString);

        // Step 3: Validate the structure of the refresh token
        // if (!refreshToken?.value) throw new Error('Token value is missing');
        if (!refreshToken.value || typeof refreshToken.value !== 'string') {
          throw new Error('Invalid refresh token structure.');
        }
      } catch (parseError) {
        console.error('Error parsing token', parseError);
        throw new Error('Failed to parse the refresh token.');
      }
    } else {
      throw new Error('Refresh token is missing. User may not be authenticated.');
    }
  } catch (readError) {
    // console.error('Error reading refresh token', readError);
    console.error('Error reading refresh token', readError);
    throw new Error('Failed to retrieve or validate the refresh token.');
  }

  // Ensure refreshToken is available
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  try {
    // Step 4: Initialize the Wix client
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
  } catch (clientError) {
    console.error('Error initializing Wix client:', clientError);
    throw new Error('Failed to initialize Wix client.');
  }
};
