
import { useAuth0 } from "@auth0/auth0-react";
import { useEffect } from "react";
import { storageService } from "@/services/storage";

export const Auth0TokenSync = () => {
    const { getAccessTokenSilently, user, isAuthenticated } = useAuth0();

    useEffect(() => {
        const syncAuth = async () => {
            if (isAuthenticated && user) {
                try {
                    const token = await getAccessTokenSilently();
                    console.log("🔐 [AuthSync] Token retrieved. Setting in Storage Service.");
                    storageService.setToken(token);

                    // Sync user profile to backend
                    if (user.sub && user.email) {
                        storageService.syncUser({
                            sub: user.sub,
                            email: user.email,
                            name: user.name || user.email,
                            picture: user.picture || "",
                        }).catch(err => console.error("User sync failed", err));
                    }
                } catch (error) {
                    console.error("🔐 [AuthSync] Failed to get token", error);
                }
            }
        };

        syncAuth();
    }, [isAuthenticated, user, getAccessTokenSilently]);

    return null;
};
