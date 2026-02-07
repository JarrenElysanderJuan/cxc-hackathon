import { Auth0Provider } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";

type Auth0ProviderWithNavigateProps = {
    children: React.ReactNode;
};

export const Auth0ProviderWithNavigate = ({
    children,
}: Auth0ProviderWithNavigateProps) => {
    const navigate = useNavigate();

    const domain = import.meta.env.VITE_AUTH0_DOMAIN;
    const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;
    const redirectUri = window.location.origin;

    const onRedirectCallback = (appState: any) => {
        navigate(appState?.returnTo || window.location.pathname);
    };

    if (!(domain && clientId)) {
        console.warn("Auth0 domain or client ID not set in .env");
        return <>{children}</>;
    }

    return (
        <Auth0Provider
            domain={domain}
            clientId={clientId}
            authorizationParams={{
                redirect_uri: redirectUri,
            }}
            onRedirectCallback={onRedirectCallback}
        >
            {children}
        </Auth0Provider>
    );
};
