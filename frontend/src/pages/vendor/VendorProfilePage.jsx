import UserProfileView from "../../components/common/UserProfileView";
import { VENDOR_NAV } from "../../config/navigation";

export default function VendorProfilePage() {
  return <UserProfileView navItems={VENDOR_NAV} roleLabel="Seller Portal" />;
}
