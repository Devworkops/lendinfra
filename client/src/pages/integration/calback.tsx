import { useAuth } from "../../hooks/useAuth";
import IntegrationSetup from "../../components/integration/IntegrationSetup";
import { useRouter } from "next/router";
import useApi from "../../hooks/useApi";
import { useEffect } from "react";
import { useSnackbar } from 'notistack';
import AddCompany from "../../components/company/AddCompany";

export default function IntegrationCallbackPage() {
    const { auth } = useAuth();
    const { enqueueSnackbar } = useSnackbar();
    const [,callbackIntegrationApi] = useApi<any>();
    const router = useRouter();

    useEffect(() => {
        let path = router.asPath;
        if (path) {
            callbackIntegrationApi(`api/integration/callback`, {url:router.asPath}).then((response) => {
                if (response.data.errors) {
                    enqueueSnackbar(response.data.errors[0].message, {
                        variant: "error",
                    });
                } else {
                }
            });
        }
    }, []);

    return auth && auth.companyId ? (
        <IntegrationSetup></IntegrationSetup>
    ) : (
        <AddCompany></AddCompany>
    );
}
