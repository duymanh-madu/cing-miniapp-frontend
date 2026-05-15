class RoutePreloader {

  preload() {

    import(
      "@/pages/menu/MenuPage"
    );

    import(
      "@/pages/game/GamePage"
    );

    import(
      "@/pages/voucher/VoucherPage"
    );

  }

}

const routePreloader =
  new RoutePreloader();

export default routePreloader;