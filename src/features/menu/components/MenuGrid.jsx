import { useMenuProducts } from "../hooks/useMenuProducts";
import { useNavigate } from "react-router-dom";

const PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='180' viewBox='0 0 200 180'%3E%3Crect width='200' height='180' fill='%23f3f4f6'/%3E%3Ctext x='100' y='95' text-anchor='middle' font-size='40'%3E%F0%9F%A7%8B%3C/text%3E%3C/svg%3E";

function formatPrice(price) {
  if (!price) return "";
  return new Intl.NumberFormat("vi-VN").format(price) + "d";
}

function MenuGrid() {
  const { data = [], isLoading } = useMenuProducts();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="mt-4 px-4 grid grid-cols-2 gap-3">
        {[1,2,3,4,5,6].map(i => (
          <div key={i} className="rounded-2xl bg-gray-100 animate-pulse h-52" />
        ))}
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="mt-8 flex flex-col items-center justify-center py-12 text-gray-400">
        <span className="text-4xl mb-3">🧋</span>
        <p className="text-sm font-medium">Dang tai menu...</p>
      </div>
    );
  }

  return (
    <div className="mt-4 px-4 grid grid-cols-2 gap-3 pb-4">
      {data.map((item) => (
        <div
          key={item.id}
          className="bg-white rounded-2xl shadow-sm overflow-hidden active:scale-[0.97] transition-transform"
          onClick={() => {}}
        >
          {/* Product image */}
          <div className="relative h-[150px] bg-gray-50 overflow-hidden">
            <img
              src={item.image || PLACEHOLDER}
              alt={item.name}
              className="w-full h-full object-cover"
              onError={(e) => { e.target.src = PLACEHOLDER; }}
              loading="lazy"
            />
            {item.featured && (
              <span className="absolute top-2 left-2 bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                Hot
              </span>
            )}
            {!item.available && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <span className="text-white text-xs font-bold bg-black/60 px-2 py-1 rounded-full">
                  Het hang
                </span>
              </div>
            )}
          </div>

          {/* Product info */}
          <div className="p-3">
            <h3 className="text-xs font-bold text-gray-800 line-clamp-2 leading-tight min-h-[32px]">
              {item.name}
            </h3>
            <div className="mt-2 flex items-center justify-between">
              <p className="text-sm font-black text-orange-500">
                {formatPrice(item.price)}
              </p>
              <button
                className="w-7 h-7 rounded-full bg-orange-500 text-white flex items-center justify-center text-lg font-bold active:scale-90 transition-transform"
                onClick={(e) => { e.stopPropagation(); }}
              >
                +
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default MenuGrid;
