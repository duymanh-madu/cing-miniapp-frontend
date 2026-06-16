import { useLocation } from "react-router-dom";
import { AppContainer } from "@/components/ui";
import BottomNavigation from "@/components/navigation/BottomNavigation";
import FloatingCart from "@/features/cart/FloatingCart";

function AppLayout({ children }) {
  const location = useLocation();

  const isUtilityRoute =
    location.pathname.startsWith("/shipper/") ||
    location.pathname.startsWith("/admin");

  return (
    <AppContainer>
      {children}

      {!isUtilityRoute && <FloatingCart />}
      {!isUtilityRoute && <BottomNavigation />}
    </AppContainer>
  );
}

export default AppLayout;
