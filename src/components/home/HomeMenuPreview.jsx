import ProductCard from "@/features/menu/components/ProductCard";
import useFeaturedProducts from "@/features/menu/hooks/useFeaturedProducts";
import { useNavigate } from "react-router-dom";

export default function HomeMenuPreview() {
  const navigate = useNavigate();
  const raw = useFeaturedProducts();
  const products = Array.isArray(raw) ? raw : (raw && raw.data ? raw.data : []);
  const isLoading = raw && raw.isLoading;

  if (isLoading) {
    return (
      <section className="mt-2">
        <h2 className="text-xl font-bold">Best Seller</h2>
        <div className="mt-4 grid grid-cols-2 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-48 rounded-2xl bg-gray-100 animate-pulse" />)}
        </div>
      </section>
    );
  }

  if (!products || !products.length) return null;

  return (
    <section className="mt-2">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Best Seller</h2>
        <button onClick={() => navigate("/menu")} className="text-sm font-medium text-orange-500">Xem tat ca</button>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-4">
        {products.slice(0, 4).map(p => <ProductCard key={p.id} product={p} />)}
      </div>
    </section>
  );
}
