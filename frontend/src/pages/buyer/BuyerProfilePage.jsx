import UserProfileView from "../../components/common/UserProfileView";
import { BUYER_NAV } from "../../config/navigation";

export default function BuyerProfilePage() {
  return <UserProfileView navItems={BUYER_NAV} roleLabel="Buyer Portal" />;
}
