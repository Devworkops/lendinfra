import { useAuth } from "../../hooks/useAuth";
import ManageUser from "../../components/settings/ManageUser";
import AddEditCompany from "../../components/company";

export default function SettingPage() {
  const { auth } = useAuth();

  return auth && auth.companyId ? (
    <ManageUser></ManageUser>
  ) : (
    <AddEditCompany></AddEditCompany>
  );
}
