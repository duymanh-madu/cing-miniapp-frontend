import { AppContainer } from "@/components/ui";
import BottomNavigation from "@/components/navigation/BottomNavigation";
import FloatingCart from "@/features/cart/FloatingCart";
import NotificationBell from "@/features/notification/components/NotificationBell";

function AppLayout({ children }) {
  return (
    <AppContainer>
      {children}
      <FloatingCart />
      <BottomNavigation />
      <NotificationBell />
    </AppContainer>
  );
}
export default AppLayout;
