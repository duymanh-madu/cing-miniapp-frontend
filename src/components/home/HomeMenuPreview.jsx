import { useNavigate } from "react-router-dom";
import ProductCard from "@/features/menu/components/ProductCard";
import useFeaturedProducts from "@/features/menu/hooks/useFeaturedProducts";

export default function HomeMenuPreview() {
  const navigate = useNavigate();
  const products = useFeaturedProducts();

  if (!products || products.length === 0) {
    return (
      <section className="mt-2">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Best Seller</h2>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-48 rounded-2xl bg-gray-100 animate-pulse" />)}
        </div>
      </section>
    );
  }

  return (
    <section className="mt-2">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Best Seller</h2>
        <button onClick={() => navigate("/menu")} className="text-sm font-semibold text-orange-500">
          Xem tat ca
        </button>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {products.slice(0,4).map(p => <ProductCard key={p.id} product={p} />)}
      </div>
    </section>
  );
}
