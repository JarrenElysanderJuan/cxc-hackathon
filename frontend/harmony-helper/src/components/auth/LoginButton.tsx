import { useAuth0 } from "@auth0/auth0-react";
import { Button, ButtonProps } from "@/components/ui/button";

const LoginButton = (props: ButtonProps) => {
    const { loginWithRedirect } = useAuth0();

    return (
        <Button onClick={() => loginWithRedirect()} variant="secondary" size="sm" {...props}>
            {props.children || "Log In"}
        </Button>
    );
};

export default LoginButton;
