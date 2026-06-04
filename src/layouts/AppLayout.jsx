import { AppContainer } from "@/components/ui";
import BottomNavigation from "@/components/navigation/BottomNavigation";
import FloatingCart from "@/features/cart/FloatingCart";

function AppLayout({ children }) {
  return (
    <AppContainer>
      {children}
      <FloatingCart />
      <BottomNavigation />
    </AppContainer>
  );
}
export default AppLayout;
