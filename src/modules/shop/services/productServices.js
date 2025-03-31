import StockService from './stockService';
import ProductQueryService from './productQueryService';
import ProductBatchService from './productBatchService';

/**
 * Re-exportación de todas las funciones de los servicios
 * con nombres compatibles con el código anterior
 * para facilitar la migración progresiva
 */

// Exportaciones de StockService
export const getProductCurrentStock = StockService.getProductStock.bind(StockService);
export const getMultipleProductsStock = StockService.getMultipleProductsStock.bind(StockService);
export const validateItemsStock = StockService.validateItemsStock.bind(StockService);

// Exportaciones de ProductBatchService
export const getBatchProductStock = ProductBatchService.getBatchProductStock.bind(ProductBatchService);
export const verifyAndUpdateStockForOrder = ProductBatchService.verifyAndUpdateStockForOrder.bind(ProductBatchService);
export const updateProductStockBatch = ProductBatchService.updateProductStockBatch.bind(ProductBatchService);

// Exportaciones de ProductQueryService
export const getProductById = ProductQueryService.getProductById.bind(ProductQueryService);
export const getProductsByIds = ProductQueryService.getProductsByIds.bind(ProductQueryService);
export const searchProducts = ProductQueryService.searchProducts.bind(ProductQueryService);
export const getFeaturedProducts = ProductQueryService.getFeaturedProducts.bind(ProductQueryService);

// Exportación de servicios completos para usar en componentes nuevos
export const ProductServices = {
  Stock: StockService,
  Query: ProductQueryService,
  Batch: ProductBatchService
};

export default ProductServices;