import UserProfileView from "../../components/common/UserProfileView";
import { ADMIN_NAV } from "../../config/navigation";

export default function AdminProfilePage() {
  return <UserProfileView navItems={ADMIN_NAV} roleLabel="Admin Portal" />;
}
