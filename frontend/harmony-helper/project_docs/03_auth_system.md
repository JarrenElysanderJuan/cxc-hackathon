# Authentication System (Auth0)

## Overview
The application uses **Auth0** for user authentication. The integration is handled via the `@auth0/auth0-react` library.

## Key Components

### 1. `Auth0ProviderWithNavigate`
- **Location**: `src/components/auth/Auth0ProviderWithNavigate.tsx`
- **Purpose**: Wraps the application root capabilities.
- **Functionality**:
    - Initializes Auth0 with `domain` and `clientId` from `.env`.
    - Handles the `onRedirectCallback` to navigate the user back to the requested page after login.

### 2. Global Auth Store (`useAuthStore`)
- **Location**: `src/store/useAuthStore.ts`
- **State**:
    - `user`: The Auth0 user profile object (name, email, picture).
    - `isAuthenticated`: Boolean flag.
    - `token`: The raw access token (if requested).
- **Usage**: Components subscribe to this store to check login status, though direct usage of `useAuth0()` hook is also common for initiating login/logout.

### 3. UI Components
- **`LoginButton`**: Calls `loginWithRedirect()`.
- **`LogoutButton`**: Calls `logout()`.
- **`HomePage`**: Displays user avatar and name if authenticated.

## Environment Variables
Required in `.env`:
```env
VITE_AUTH0_DOMAIN=your-auth0-domain
VITE_AUTH0_CLIENT_ID=your-client-id
```

## Future Work
- Implement "Silent Token Refresh" if needed for long sessions.
- Pass the Auth Token in the `Authorization` header of API calls (currently API is mocked).
