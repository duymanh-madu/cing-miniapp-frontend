import { useLocation } from "react-router-dom";
import { AppContainer } from "@/components/ui";
import BottomNavigation from "@/components/navigation/BottomNavigation";
import FloatingCart from "@/features/cart/FloatingCart";

function AppLayout({ children }) {
  const location = useLocation();
  const isShipperPortal = location.pathname.startsWith("/shipper/");

  return (
    <AppContainer>
      {children}

      {!isShipperPortal && <FloatingCart />}
      {!isShipperPortal && <BottomNavigation />}
    </AppContainer>
  );
}

export default AppLayout;
