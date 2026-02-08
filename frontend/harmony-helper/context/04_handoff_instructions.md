## How to Proceed
1. **Toggle Backend/Mock**:
   - Update `frontend/harmony-helper/.env`:
     - Toggle `VITE_USE_MOCK_STORAGE` (`true` for local mock, `false` for Supabase).
     - See `project_docs/08_storage_toggling.md` for details.
2. **Start Backend**:
   - In a terminal: `cd backend && .\venv\Scripts\python.exe main.py`.
3. **Verify Full Flow**:
   - Login -> Practice -> Analyze -> **Save**.
   - Check if the session appears in the `/history` page (this will now hit the real API).
4. **Polish**:
   - Fix the `@apply` lint error in `frontend/harmony-helper/src/index.css` (Tailwind Unknown at-rule).
   - Ensure the `ApiStorageService` correctly handles the `audioBlob` -> `audioBase64` conversion or let the backend handle the upload as currently scaffolded.

## Critical Paths
- **Audio Upload**: `main.py` currently expects base64 and simulates an upload to public sub-storage. Ensure a bucket named `recordings` exists in Supabase and is public if testing real uploads.
- **Auth Sync**: `Auth0TokenSync` calls `storageService.syncUser`. Ensure the backend upserts the user correctly into the `users` table.
- **RSL Policies**: If RLS is ON in Supabase, make sure the `sub` from Auth0 matches what the policies expect.
