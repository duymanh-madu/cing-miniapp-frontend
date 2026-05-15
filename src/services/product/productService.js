import apiClient from "@/services/api/apiClient";

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
          "/products"
        );

      return (
        response?.data ||
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
          "/products/featured"
        );

      return (
        response?.data ||
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
   * SEARCH
   * =======================================================
   */

  async searchProducts(
    keyword = ""
  ) {

    try {

      const response =
        await apiClient.get(
          "/products/search",
          {
            params: {
              keyword,
            },
          }
        );

      return (
        response?.data ||
        []
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