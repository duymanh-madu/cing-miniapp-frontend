import { useMenuProducts } from "../hooks/useMenuProducts";

function formatPrice(price) {
  if (!price && price !== 0) return "";
  return new Intl.NumberFormat("vi-VN").format(price) + "d";
}

function ProductImage({ src, name }) {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className="w-full h-full object-cover"
        onError={(e) => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }}
        loading="lazy"
      />
    );
  }
  return null;
}

function PlaceholderImage() {
  return (
    <div
      className="w-full h-full flex items-center justify-center"
      style={{ background: "linear-gradient(135deg, #D4521A 0%, #E8703A 40%, #C94010 100%)" }}
    >
      <img
        src="/logo-cing.png"
        alt="Cing Hu Tang"
        className="w-16 h-16 object-contain opacity-90"
        style={{ filter: "brightness(0) invert(1)" }}
      />
    </div>
  );
}

function MenuGrid() {
  const { data = [], isLoading } = useMenuProducts();

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
    <div className="mt-4 px-4 grid grid-cols-2 gap-3">
      {data.map((item) => (
        <div
          key={item.id}
          className="bg-white rounded-2xl shadow-sm overflow-hidden active:scale-[0.97] transition-transform"
        >
          <div className="relative h-[150px] overflow-hidden bg-gray-50">
            {item.image ? (
              <>
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.parentNode.querySelector(".placeholder").style.display = "flex";
                  }}
                  loading="lazy"
                />
                <div className="placeholder hidden w-full h-full absolute inset-0 items-center justify-center"
                  style={{ background: "linear-gradient(135deg, #D4521A 0%, #E8703A 40%, #C94010 100%)" }}>
                  <img src="/logo-cing.png" alt="" className="w-14 h-14 object-contain"
                    style={{ filter: "brightness(0) invert(1)" }} />
                </div>
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #D4521A 0%, #E8703A 40%, #C94010 100%)" }}>
                <img src="/logo-cing.png" alt="" className="w-14 h-14 object-contain"
                  style={{ filter: "brightness(0) invert(1)" }} />
              </div>
            )}
            {item.featured && (
              <span className="absolute top-2 left-2 bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
                Hot
              </span>
            )}
            {!item.available && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="text-white text-xs font-bold bg-black/70 px-3 py-1 rounded-full">
                  Het hang
                </span>
              </div>
            )}
          </div>
          <div className="p-3">
            <h3 className="text-xs font-bold text-gray-800 line-clamp-2 leading-tight min-h-[32px]">
              {item.name}
            </h3>
            <div className="mt-2 flex items-center justify-between">
              <p className="text-sm font-black text-orange-500">
                {formatPrice(item.price)}
              </p>
              <button
                className="w-7 h-7 rounded-full bg-orange-500 text-white text-lg font-bold flex items-center justify-center active:scale-90 transition-transform shadow-sm"
                onClick={(e) => e.stopPropagation()}
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
