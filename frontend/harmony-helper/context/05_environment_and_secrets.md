# Environment & Secrets

## Frontend (`frontend/harmony-helper/.env`)
Needs:
- `VITE_AUTH0_DOMAIN`
- `VITE_AUTH0_CLIENT_ID`
- `VITE_USE_MOCK_STORAGE` (Set to `false` for integration)
- `VITE_API_URL` (Set to `http://localhost:8000`)
- `VITE_ELEVENLABS_API_KEY` (Optional)

## Backend (`backend/.env`)
Needs:
- `SUPABASE_URL`: `https://oltcirbrnqzexgxnkemm.supabase.co`
- `SUPABASE_SERVICE_ROLE_KEY`: Provided by user (Do not log/save in documentation, just use from local `.env`).

*Note: The user has already populated these. Do not leak keys in shared markdown files.*
