import apiClient from "@/infra/api/apiClient";

import loggerService from "@/services/logger/loggerService";

/**
 * =========================================================
 * PRODUCT SERVICE
 * =========================================================
 */

class ProductService {

  /**
   * =======================================================
   * FETCH PRODUCTS
   * =======================================================
   */

  async fetchProducts() {

    try {

      const response =
        await apiClient.get(
          "/menu"
        );

      return (
        response?.data?.items ||
        []
      );

    } catch (error) {

      loggerService.error(
        "PRODUCT_FETCH_ERROR",
        error
      );

      return [];

    }

  }

  /**
   * =======================================================
   * FETCH FEATURED
   * =======================================================
   */

  async fetchFeaturedProducts() {

    try {

      const response =
        await apiClient.get(
          "/menu"
        );

      return (
        response?.data?.items ||
        []
      );

    } catch (error) {

      loggerService.error(
        "FEATURED_PRODUCTS_ERROR",
        error
      );

      return [];

    }

  }

  /**
   * =======================================================
   * SEARCH PRODUCTS
   * =======================================================
   */

  async searchProducts(
    keyword = ""
  ) {

    try {

      const response =
        await apiClient.get(
          "/menu"
        );

      const items =
        response?.data?.items ||
        [];

      return items.filter(
        (item) =>
          item?.name
            ?.toLowerCase()
            ?.includes(
              keyword.toLowerCase()
            )
      );

    } catch (error) {

      loggerService.error(
        "PRODUCT_SEARCH_ERROR",
        error
      );

      return [];

    }

  }

}

const productService =
  new ProductService();

export const fetchProducts =
  productService.fetchProducts.bind(
    productService
  );

export const fetchFeaturedProducts =
  productService.fetchFeaturedProducts.bind(
    productService
  );

export const searchProducts =
  productService.searchProducts.bind(
    productService
  );

export default
  productService;