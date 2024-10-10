import { useAuth } from "../../hooks/useAuth";
import IntegrationSetup from "../../components/integration/IntegrationSetup";
import AddCompany from "../../components/company/AddCompany";

export default function IntegrationSetupPage() {
  const { auth } = useAuth();

  return auth && auth.companyId ? (
    <IntegrationSetup></IntegrationSetup>
  ) : (
    <AddCompany></AddCompany>
  );
}