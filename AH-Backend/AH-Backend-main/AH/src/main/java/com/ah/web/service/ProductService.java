package com.ah.web.service;

import com.ah.web.dto.request.ProductCreateRequest;
import com.ah.web.dto.request.ProductUpdateRequest;
import com.ah.web.dto.response.ProductResponse;
import com.ah.web.entity.Category;
import com.ah.web.entity.Product;
import com.ah.web.exception.ResourceNotFoundException;
import com.ah.web.repository.CategoryRepository;
import com.ah.web.repository.ProductRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    // Optional — if pgvector/VectorStore is unavailable, indexing silently skips
    private ProductEmbeddingService productEmbeddingService;

    public ProductService(ProductRepository productRepository,
                          CategoryRepository categoryRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
    }

    @org.springframework.beans.factory.annotation.Autowired(required = false)
    public void setProductEmbeddingService(ProductEmbeddingService productEmbeddingService) {
        this.productEmbeddingService = productEmbeddingService;
    }

    @Transactional(readOnly = true)
    public Page<ProductResponse> getAllProducts(Long categoryId, String search, String stockStatus, Pageable pageable) {
        return productRepository.findWithFilters(categoryId, search, stockStatus, pageable)
                .map(ProductResponse::fromEntity);
    }

    @Transactional(readOnly = true)
    public Page<ProductResponse> getAllProductsFiltered(Long categoryId, String search, 
            BigDecimal minPrice, BigDecimal maxPrice, 
            Double minRating, Boolean inStockOnly, Boolean onSaleOnly, Pageable pageable) {
        // Create unsorted pageable since native query has its own ORDER BY
        Pageable unsortedPageable = org.springframework.data.domain.PageRequest.of(
                pageable.getPageNumber(), pageable.getPageSize());
        return productRepository.findWithAdvancedFilters(categoryId, search, minPrice, maxPrice, 
                minRating, inStockOnly, onSaleOnly, unsortedPageable)
                .map(ProductResponse::fromEntity);
    }

    @Transactional(readOnly = true)
    public ProductResponse getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
        return ProductResponse.fromEntity(product);
    }

    @Transactional
    public ProductResponse createProduct(ProductCreateRequest request) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.getCategoryId()));

        Product product = Product.builder()
                .name(request.getName())
                .sku(request.getSku())
                .description(request.getDescription())
                .shortDescription(request.getShortDescription())
                .price(request.getPrice())
                .oldPrice(request.getOldPrice())
                .stock(request.getStock())
                .weight(request.getWeight())
                .unit(request.getUnit())
                .imageUrl(request.getImageUrl())
                .additionalImages(request.getAdditionalImages())
                .category(category)
                .ingredients(request.getIngredients())
                .benefits(request.getBenefits())
                .usage(request.getUsage())
                .featured(request.getFeatured() != null ? request.getFeatured() : false)
                .onSale(request.getOnSale() != null ? request.getOnSale() : false)
                .rating(0.0)
                .reviewCount(0)
                .build();

        Product saved = productRepository.save(product);
        if (productEmbeddingService != null) productEmbeddingService.indexProduct(saved);
        return ProductResponse.fromEntity(saved);
    }

    @Transactional
    public ProductResponse updateProduct(Long id, ProductUpdateRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));

        if (request.getName() != null) product.setName(request.getName());
        if (request.getSku() != null) product.setSku(request.getSku());
        if (request.getDescription() != null) product.setDescription(request.getDescription());
        if (request.getShortDescription() != null) product.setShortDescription(request.getShortDescription());
        if (request.getPrice() != null) product.setPrice(request.getPrice());
        if (request.getOldPrice() != null) product.setOldPrice(request.getOldPrice());
        if (request.getStock() != null) product.setStock(request.getStock());
        if (request.getWeight() != null) product.setWeight(request.getWeight());
        if (request.getUnit() != null) product.setUnit(request.getUnit());
        if (request.getImageUrl() != null) product.setImageUrl(request.getImageUrl());
        if (request.getAdditionalImages() != null) product.setAdditionalImages(request.getAdditionalImages());
        if (request.getIngredients() != null) product.setIngredients(request.getIngredients());
        if (request.getBenefits() != null) product.setBenefits(request.getBenefits());
        if (request.getUsage() != null) product.setUsage(request.getUsage());
        if (request.getFeatured() != null) product.setFeatured(request.getFeatured());
        if (request.getOnSale() != null) product.setOnSale(request.getOnSale());
        
        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.getCategoryId()));
            product.setCategory(category);
        }

        Product saved = productRepository.save(product);
        if (productEmbeddingService != null) productEmbeddingService.indexProduct(saved);
        return ProductResponse.fromEntity(saved);
    }

    @Transactional
    public void deleteProduct(Long id) {
        if (!productRepository.existsById(id)) {
            throw new ResourceNotFoundException("Product", "id", id);
        }
        if (productEmbeddingService != null) productEmbeddingService.removeProduct(id);
        productRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> getNewArrivals() {
        return productRepository.findTop8ByOrderByCreatedAtDesc().stream()
                .map(ProductResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> getBestSellers() {
        return productRepository.findRandomBestSellers().stream()
                .map(ProductResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public long getTotalProductCount() {
        return productRepository.count();
    }

    public long getLowStockCount() {
        return productRepository.countByStockLessThanEqual(10);
    }

    public long getOutOfStockCount() {
        return productRepository.countByStock(0);
    }

    public List<ProductResponse> getLowStockProducts(int threshold) {
        return productRepository.findTop5ByStockLessThanEqualOrderByStockAsc(threshold)
                .stream()
                .map(ProductResponse::fromEntity)
                .collect(java.util.stream.Collectors.toList());
    }
}
