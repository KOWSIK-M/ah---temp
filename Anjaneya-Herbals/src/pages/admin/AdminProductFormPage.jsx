import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminLayout from "../../components/admin/AdminLayout";
import { adminApi, categoriesApi } from "../../services/api";
import {
  Upload,
  Image,
  Package,
  FileText,
  Tag,
  IndianRupee,
  Box,
  Percent,
  X,
  Save,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Loader2,
  Layers,
  TrendingDown,
  Camera,
  Star,
  Shield,
  Hash,
  Plus,
  Minus,
} from "lucide-react";

const AdminProductFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [additionalImages, setAdditionalImages] = useState([]);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    name: "",
    description: "",
    shortDescription: "",
    price: "",
    stock: "",
    categoryId: "",
    imageUrl: "",
    onSale: false,
    oldPrice: "",
    discountPercent: 0,
    weight: "",
    unit: "g",
    sku: "",
    featured: false,
    ingredients: "",
    benefits: "",
    usage: "",
  });

  useEffect(() => {
    fetchCategories();
    if (isEditing) {
      fetchProduct();
    }
    generateSKU();
  }, [id]);

  const fetchCategories = async () => {
    try {
      const data = await categoriesApi.getAll();
      setCategories(data);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
  };

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const product = await adminApi.getProductById(id);
      setForm({
        name: product.name || "",
        description: product.description || "",
        shortDescription: product.shortDescription || "",
        price: product.price || "",
        stock: product.stock || "",
        categoryId: product.categoryId || "",
        imageUrl: product.imageUrl || "",
        onSale: product.onSale || false,
        oldPrice: product.oldPrice || "",
        discountPercent: product.discountPercent || 0,
        weight: product.weight || "",
        unit: product.unit || "g",
        sku: product.sku || "",
        featured: product.featured || false,
        ingredients: product.ingredients || "",
        benefits: product.benefits || "",
        usage: product.usage || "",
      });
      setImagePreview(product.imageUrl);
      setAdditionalImages(product.additionalImages || []);
    } catch (err) {
      console.error("Failed to fetch product:", err);
    } finally {
      setLoading(false);
    }
  };

  const generateSKU = (force = false) => {
    if (force || (!isEditing && !form.sku)) {
      const timestamp = Date.now().toString(36);
      const random = Math.random().toString(36).substr(2, 5);
      const sku = `AH${timestamp}${random}`.toUpperCase();
      setForm((f) => ({ ...f, sku }));
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith("image/")) {
      setErrors({ ...errors, image: "Please select an image file" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors({ ...errors, image: "Image must be less than 5MB" });
      return;
    }

    setSelectedImage(file);

    // Preview
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);

    // Upload to server
    try {
      setUploading(true);
      setErrors({ ...errors, image: null });
      const url = await adminApi.uploadImage(file, "products");
      setForm((f) => ({ ...f, imageUrl: url }));
    } catch (err) {
      setErrors({ ...errors, image: "Failed to upload image" });
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleAdditionalImage = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length + additionalImages.length > 4) {
      alert("Maximum 4 additional images allowed");
      return;
    }

    for (const file of files) {
      try {
        const url = await adminApi.uploadImage(file, "products/additional");
        setAdditionalImages((prev) => [...prev, { url, file }]);
      } catch (err) {
        console.error("Failed to upload additional image:", err);
      }
    }
  };

  const removeAdditionalImage = (index) => {
    setAdditionalImages((prev) => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Product name is required";
    if (!form.description.trim())
      newErrors.description = "Description is required";
    if (!form.price || parseFloat(form.price) <= 0)
      newErrors.price = "Valid price is required";
    if (!form.stock || parseInt(form.stock) < 0)
      newErrors.stock = "Valid stock quantity is required";
    if (!form.categoryId) newErrors.categoryId = "Category is required";
    if (!form.imageUrl && !isEditing)
      newErrors.image = "Product image is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateDiscount = () => {
    if (form.oldPrice && form.price) {
      const old = parseFloat(form.oldPrice);
      const current = parseFloat(form.price);
      const discount = ((old - current) / old) * 100;
      return Math.round(discount);
    }
    return 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        shortDescription: form.shortDescription.trim(),
        price: parseFloat(form.price),
        stock: parseInt(form.stock),
        categoryId: parseInt(form.categoryId),
        imageUrl: form.imageUrl,
        onSale: form.onSale,
        oldPrice: form.oldPrice ? parseFloat(form.oldPrice) : null,
        discountPercent: calculateDiscount(),
        weight: form.weight,
        unit: form.unit,
        sku: form.sku.trim(),
        featured: form.featured,
        ingredients: form.ingredients.trim(),
        benefits: form.benefits.trim(),
        usage: form.usage.trim(),
        additionalImages: additionalImages.map((img) => img.url),
      };

      if (isEditing) {
        await adminApi.updateProduct(id, payload);
      } else {
        await adminApi.createProduct(payload);
      }

      navigate("/admin/products");
    } catch (err) {
      alert("Failed to save product");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditing) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto px-4 lg:px-0">
        {/* Header */}
        <div className="mb-6 lg:mb-8">
          <button
            onClick={() => navigate("/admin/products")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 lg:mb-6 px-1"
          >
            <ArrowLeft size={20} />
            <span className="text-sm font-medium">Back to Products</span>
          </button>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                {isEditing ? "Edit Product" : "Add New Product"}
              </h1>
              <p className="text-gray-600 mt-1 text-sm lg:text-base">
                {isEditing
                  ? "Update product details and inventory"
                  : "Create a new Ayurvedic product"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                  isEditing
                    ? "bg-blue-100 text-blue-800"
                    : "bg-green-100 text-green-800"
                }`}
              >
                {isEditing ? "Editing Mode" : "Create Mode"}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8">
          {/* Left Column - Form */}
          <div className="lg:col-span-2 space-y-4 lg:space-y-8">
            <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-8">
              {/* Basic Information Card */}
              <div className="bg-white rounded-xl lg:rounded-2xl shadow-sm border border-gray-200 p-4 lg:p-6">
                <div className="flex items-center gap-3 mb-4 lg:mb-6">
                  <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-green-100 to-yellow-100 rounded-lg lg:rounded-xl flex items-center justify-center">
                    <Package
                      size={18}
                      className="text-green-600 lg:w-5 lg:h-5"
                    />
                  </div>
                  <h2 className="text-lg lg:text-xl font-semibold text-gray-900">
                    Basic Information
                  </h2>
                </div>

                <div className="space-y-4 lg:space-y-6">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <span className="flex items-center gap-2">
                        <Tag size={14} className="lg:w-4 lg:h-4" />
                        Product Name *
                      </span>
                    </label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => {
                        setForm((f) => ({ ...f, name: e.target.value }));
                        setErrors({ ...errors, name: null });
                      }}
                      className={`w-full px-3 lg:px-4 py-2.5 lg:py-3 text-sm lg:text-base border rounded-lg lg:rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 ${
                        errors.name ? "border-red-300" : "border-gray-300"
                      }`}
                      placeholder="e.g., Organic Ashwagandha Powder"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle size={12} />
                        {errors.name}
                      </p>
                    )}
                  </div>

                  {/* SKU */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <span className="flex items-center gap-2">
                        <Hash size={14} className="lg:w-4 lg:h-4" />
                        SKU Code
                      </span>
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        value={form.sku}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, sku: e.target.value }))
                        }
                        className="flex-1 px-3 lg:px-4 py-2.5 lg:py-3 text-sm lg:text-base border border-gray-300 rounded-lg lg:rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50"
                        placeholder="Auto-generated"
                        readOnly
                      />
                      <button
                        type="button"
                        onClick={() => generateSKU(true)}
                        className="px-3 lg:px-4 py-2.5 lg:py-3 bg-gray-100 hover:bg-gray-200 rounded-lg lg:rounded-xl transition-colors text-sm font-medium whitespace-nowrap"
                      >
                        Regenerate
                      </button>
                    </div>
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <span className="flex items-center gap-2">
                        <Layers size={14} className="lg:w-4 lg:h-4" />
                        Category *
                      </span>
                    </label>
                    <select
                      value={form.categoryId}
                      onChange={(e) => {
                        setForm((f) => ({ ...f, categoryId: e.target.value }));
                        setErrors({ ...errors, categoryId: null });
                      }}
                      className={`w-full px-3 lg:px-4 py-2.5 lg:py-3 text-sm lg:text-base border rounded-lg lg:rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 ${
                        errors.categoryId ? "border-red-300" : "border-gray-300"
                      }`}
                    >
                      <option value="">Select Category</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                    {errors.categoryId && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle size={12} />
                        {errors.categoryId}
                      </p>
                    )}
                  </div>

                  {/* Featured */}
                  <div className="flex items-center justify-between p-3 lg:p-4 bg-gray-50 rounded-lg lg:rounded-xl">
                    <div className="flex items-center gap-2 lg:gap-3">
                      <Star
                        size={18}
                        className="text-yellow-500 lg:w-5 lg:h-5"
                      />
                      <div>
                        <p className="text-sm lg:text-base font-medium text-gray-900">
                          Featured Product
                        </p>
                        <p className="text-xs lg:text-sm text-gray-500">
                          Show on homepage
                        </p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.featured}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, featured: e.target.checked }))
                        }
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5 lg:w-12 lg:h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-5 lg:peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 lg:after:h-5 lg:after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                  </div>

                  {/* Short Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <span className="flex items-center gap-2">
                        <FileText size={14} className="lg:w-4 lg:h-4" />
                        Short Description
                      </span>
                    </label>
                    <textarea
                      value={form.shortDescription}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          shortDescription: e.target.value,
                        }))
                      }
                      className="w-full px-3 lg:px-4 py-2.5 lg:py-3 text-sm lg:text-base border border-gray-300 rounded-lg lg:rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                      rows={2}
                      placeholder="Brief product description for cards (max 150 chars)"
                      maxLength={150}
                    />
                    <div className="text-right text-xs text-gray-500 mt-1">
                      {form.shortDescription.length}/150 characters
                    </div>
                  </div>

                  {/* Full Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <span className="flex items-center gap-2">
                        <FileText size={14} className="lg:w-4 lg:h-4" />
                        Full Description *
                      </span>
                    </label>
                    <textarea
                      value={form.description}
                      onChange={(e) => {
                        setForm((f) => ({ ...f, description: e.target.value }));
                        setErrors({ ...errors, description: null });
                      }}
                      className={`w-full px-3 lg:px-4 py-2.5 lg:py-3 text-sm lg:text-base border rounded-lg lg:rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 ${
                        errors.description
                          ? "border-red-300"
                          : "border-gray-300"
                      }`}
                      rows={3}
                      placeholder="Detailed product description, benefits, usage..."
                    />
                    {errors.description && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle size={12} />
                        {errors.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Pricing & Inventory Card */}
              <div className="bg-white rounded-xl lg:rounded-2xl shadow-sm border border-gray-200 p-4 lg:p-6">
                <div className="flex items-center gap-3 mb-4 lg:mb-6">
                  <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-lg lg:rounded-xl flex items-center justify-center">
                    <IndianRupee
                      size={18}
                      className="text-blue-600 lg:w-5 lg:h-5"
                    />
                  </div>
                  <h2 className="text-lg lg:text-xl font-semibold text-gray-900">
                    Pricing & Inventory
                  </h2>
                </div>

                <div className="space-y-4 lg:space-y-6">
                  {/* Price Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Selling Price (₹) *
                      </label>
                      <div className="relative">
                        <IndianRupee
                          className="absolute left-3 lg:left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                          size={18}
                        />
                        <input
                          type="number"
                          value={form.price}
                          onChange={(e) => {
                            setForm((f) => ({ ...f, price: e.target.value }));
                            setErrors({ ...errors, price: null });
                          }}
                          className={`w-full pl-10 lg:pl-12 pr-3 lg:pr-4 py-2.5 lg:py-3 text-sm lg:text-base border rounded-lg lg:rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 ${
                            errors.price ? "border-red-300" : "border-gray-300"
                          }`}
                          placeholder="299"
                          min="0"
                          step="0.01"
                        />
                      </div>
                      {errors.price && (
                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle size={12} />
                          {errors.price}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Stock Quantity *
                      </label>
                      <div className="relative">
                        <Box
                          className="absolute left-3 lg:left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                          size={18}
                        />
                        <input
                          type="number"
                          value={form.stock}
                          onChange={(e) => {
                            setForm((f) => ({ ...f, stock: e.target.value }));
                            setErrors({ ...errors, stock: null });
                          }}
                          className={`w-full pl-10 lg:pl-12 pr-3 lg:pr-4 py-2.5 lg:py-3 text-sm lg:text-base border rounded-lg lg:rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 ${
                            errors.stock ? "border-red-300" : "border-gray-300"
                          }`}
                          placeholder="50"
                          min="0"
                        />
                      </div>
                      {errors.stock && (
                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle size={12} />
                          {errors.stock}
                        </p>
                      )}
                    </div>
                    <div className="sm:col-span-2 lg:col-span-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Weight
                      </label>
                      <div className="flex">
                        <input
                          type="number"
                          value={form.weight}
                          onChange={(e) =>
                            setForm((f) => ({ ...f, weight: e.target.value }))
                          }
                          className="flex-1 px-3 lg:px-4 py-2.5 lg:py-3 text-sm lg:text-base border border-gray-300 rounded-l-lg lg:rounded-l-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="100"
                          min="0"
                        />
                        <select
                          value={form.unit}
                          onChange={(e) =>
                            setForm((f) => ({ ...f, unit: e.target.value }))
                          }
                          className="px-2 lg:px-4 py-2.5 lg:py-3 text-sm lg:text-base border border-l-0 border-gray-300 rounded-r-lg lg:rounded-r-xl focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50"
                        >
                          <option value="g">g</option>
                          <option value="kg">kg</option>
                          <option value="ml">ml</option>
                          <option value="L">L</option>
                          <option value="pcs">pcs</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Sale Section */}
                  <div className="p-3 lg:p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg lg:rounded-xl border border-yellow-200">
                    <div className="flex items-center justify-between mb-3 lg:mb-4">
                      <div className="flex items-center gap-2 lg:gap-3">
                        <TrendingDown
                          size={18}
                          className="text-orange-500 lg:w-5 lg:h-5"
                        />
                        <div>
                          <p className="text-sm lg:text-base font-semibold text-gray-900">
                            Set Sale Price
                          </p>
                          <p className="text-xs lg:text-sm text-gray-600">
                            Offer discounts to customers
                          </p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          id="onSale"
                          checked={form.onSale}
                          onChange={(e) =>
                            setForm((f) => ({ ...f, onSale: e.target.checked }))
                          }
                          className="sr-only peer"
                        />
                        <div className="w-10 h-5 lg:w-12 lg:h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-5 lg:peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 lg:after:h-5 lg:after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                      </label>
                    </div>

                    {form.onSale && (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4 mt-3 lg:mt-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Original Price (₹)
                          </label>
                          <div className="relative">
                            <IndianRupee
                              className="absolute left-3 lg:left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                              size={18}
                            />
                            <input
                              type="number"
                              value={form.oldPrice}
                              onChange={(e) =>
                                setForm((f) => ({
                                  ...f,
                                  oldPrice: e.target.value,
                                }))
                              }
                              className="w-full pl-10 lg:pl-12 pr-3 lg:pr-4 py-2.5 lg:py-3 text-sm lg:text-base border border-gray-300 rounded-lg lg:rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                              placeholder="399"
                              min="0"
                              step="0.01"
                            />
                          </div>
                        </div>
                        <div className="bg-white p-3 lg:p-4 rounded-lg lg:rounded-xl border border-gray-200">
                          <p className="text-sm text-gray-600 mb-1">Discount</p>
                          <p className="text-xl lg:text-2xl font-bold text-green-600">
                            {calculateDiscount()}% OFF
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Customer saves ₹
                            {form.oldPrice && form.price
                              ? (
                                  parseFloat(form.oldPrice) -
                                  parseFloat(form.price)
                                ).toFixed(2)
                              : "0"}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Product Details Card */}
              <div className="bg-white rounded-xl lg:rounded-2xl shadow-sm border border-gray-200 p-4 lg:p-6">
                <div className="flex items-center gap-3 mb-4 lg:mb-6">
                  <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg lg:rounded-xl flex items-center justify-center">
                    <Shield
                      size={18}
                      className="text-purple-600 lg:w-5 lg:h-5"
                    />
                  </div>
                  <h2 className="text-lg lg:text-xl font-semibold text-gray-900">
                    Product Details
                  </h2>
                </div>

                <div className="space-y-4 lg:space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Key Ingredients
                    </label>
                    <textarea
                      value={form.ingredients}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, ingredients: e.target.value }))
                      }
                      className="w-full px-3 lg:px-4 py-2.5 lg:py-3 text-sm lg:text-base border border-gray-300 rounded-lg lg:rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                      rows={2}
                      placeholder="List key ingredients (comma separated)"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Health Benefits
                    </label>
                    <textarea
                      value={form.benefits}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, benefits: e.target.value }))
                      }
                      className="w-full px-3 lg:px-4 py-2.5 lg:py-3 text-sm lg:text-base border border-gray-300 rounded-lg lg:rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                      rows={2}
                      placeholder="List key health benefits"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Usage Instructions
                    </label>
                    <textarea
                      value={form.usage}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, usage: e.target.value }))
                      }
                      className="w-full px-3 lg:px-4 py-2.5 lg:py-3 text-sm lg:text-base border border-gray-300 rounded-lg lg:rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                      rows={2}
                      placeholder="How to use this product"
                    />
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Right Column - Image Upload & Actions */}
          <div className="space-y-4 lg:space-y-8">
            {/* Image Upload Card */}
            <div className="bg-white rounded-xl lg:rounded-2xl shadow-sm border border-gray-200 p-4 lg:p-6">
              <div className="flex items-center gap-3 mb-4 lg:mb-6">
                <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg lg:rounded-xl flex items-center justify-center">
                  <Camera size={18} className="text-green-600 lg:w-5 lg:h-5" />
                </div>
                <h2 className="text-lg lg:text-xl font-semibold text-gray-900">
                  Product Images
                </h2>
              </div>

              <div className="space-y-4 lg:space-y-6">
                {/* Main Image */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 lg:mb-3">
                    Main Image *
                  </label>
                  <div className="space-y-2 lg:space-y-4">
                    <div
                      className={`w-full h-40 lg:h-48 border-2 border-dashed rounded-xl lg:rounded-2xl flex flex-col items-center justify-center transition-all ${
                        errors.image
                          ? "border-red-300 bg-red-50"
                          : uploading
                          ? "border-green-300 bg-green-50"
                          : imagePreview
                          ? "border-gray-300"
                          : "border-gray-300 bg-gray-50"
                      }`}
                    >
                      {imagePreview ? (
                        <div className="relative w-full h-full">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-full h-full object-cover rounded-lg lg:rounded-xl"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setImagePreview(null);
                              setSelectedImage(null);
                              setForm((f) => ({ ...f, imageUrl: "" }));
                            }}
                            className="absolute top-1.5 right-1.5 lg:top-2 lg:right-2 w-6 h-6 lg:w-8 lg:h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                          >
                            <X size={12} className="lg:w-4 lg:h-4" />
                          </button>
                        </div>
                      ) : (
                        <>
                          {uploading ? (
                            <Loader2 className="w-6 h-6 lg:w-8 lg:h-8 text-green-500 animate-spin mb-2" />
                          ) : (
                            <Image
                              size={32}
                              className="text-gray-400 lg:w-10 lg:h-10 mb-2"
                            />
                          )}
                          <p className="text-xs lg:text-sm text-gray-500 mb-2 lg:mb-3 text-center px-2">
                            {uploading ? "Uploading..." : "Click to upload"}
                          </p>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                            id="main-image-upload"
                            disabled={uploading}
                          />
                          <label
                            htmlFor="main-image-upload"
                            className={`px-3 lg:px-4 py-1.5 lg:py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer text-sm ${
                              uploading ? "opacity-50 pointer-events-none" : ""
                            }`}
                          >
                            Choose File
                          </label>
                        </>
                      )}
                    </div>
                    {errors.image && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle size={12} />
                        {errors.image}
                      </p>
                    )}
                  </div>
                </div>

                {/* Additional Images */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 lg:mb-3">
                    Additional Images (Optional)
                  </label>
                  <div className="grid grid-cols-2 gap-2 lg:gap-3">
                    {additionalImages.map((img, index) => (
                      <div key={index} className="relative">
                        <img
                          src={img.url}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-20 lg:h-24 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeAdditionalImage(index)}
                          className="absolute -top-1 -right-1 lg:-top-2 lg:-right-2 w-5 h-5 lg:w-6 lg:h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                        >
                          <X size={10} className="lg:w-3 lg:h-3" />
                        </button>
                      </div>
                    ))}
                    {additionalImages.length < 4 && (
                      <label className="w-full h-20 lg:h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50">
                        <Upload
                          size={16}
                          className="text-gray-400 lg:w-5 lg:h-5 mb-1"
                        />
                        <span className="text-xs text-gray-500">Add More</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAdditionalImage}
                          className="hidden"
                          id="additional-images"
                          multiple
                        />
                      </label>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-2 lg:mt-3">
                    Upload up to 4 additional images (optional)
                  </p>
                </div>
              </div>
            </div>

            {/* Actions Card */}
            <div className="bg-white rounded-xl lg:rounded-2xl shadow-sm border border-gray-200 p-4 lg:p-6">
              <h3 className="font-semibold text-gray-900 mb-4 lg:mb-6">
                Actions
              </h3>
              <div className="space-y-3 lg:space-y-4">
                <button
                  type="submit"
                  onClick={handleSubmit}
                  disabled={loading || uploading}
                  className="w-full flex items-center justify-center gap-2 py-2.5 lg:py-3 text-sm lg:text-base bg-gradient-to-r from-green-500 to-yellow-500 text-white font-semibold rounded-lg lg:rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2
                        size={16}
                        className="lg:w-5 lg:h-5 animate-spin"
                      />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={16} className="lg:w-5 lg:h-5" />
                      {isEditing ? "Update Product" : "Create Product"}
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/admin/products")}
                  className="w-full py-2.5 lg:py-3 text-sm lg:text-base border border-gray-300 text-gray-700 font-medium rounded-lg lg:rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>

              {/* Form Status */}
              <div className="mt-4 lg:mt-6 pt-4 lg:pt-6 border-t border-gray-200">
                <h4 className="font-medium text-gray-900 mb-2 lg:mb-3">
                  Form Status
                </h4>
                <div className="space-y-1.5 lg:space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs lg:text-sm text-gray-600">
                      Basic Info
                    </span>
                    <CheckCircle
                      size={14}
                      className={
                        form.name && form.categoryId
                          ? "text-green-500"
                          : "text-gray-300"
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs lg:text-sm text-gray-600">
                      Pricing
                    </span>
                    <CheckCircle
                      size={14}
                      className={
                        form.price && form.stock
                          ? "text-green-500"
                          : "text-gray-300"
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs lg:text-sm text-gray-600">
                      Main Image
                    </span>
                    <CheckCircle
                      size={14}
                      className={
                        form.imageUrl ? "text-green-500" : "text-gray-300"
                      }
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Preview Card */}
            <div className="bg-white rounded-xl lg:rounded-2xl shadow-sm border border-gray-200 p-4 lg:p-6">
              <h3 className="font-semibold text-gray-900 mb-3 lg:mb-4">
                Quick Preview
              </h3>
              <div className="bg-gray-50 p-3 lg:p-4 rounded-lg lg:rounded-xl">
                <div className="aspect-square bg-gradient-to-br from-green-100 to-yellow-100 rounded-lg lg:rounded-xl mb-3 lg:mb-4 overflow-hidden">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Image
                        size={24}
                        className="text-gray-400 lg:w-10 lg:h-10"
                      />
                    </div>
                  )}
                </div>
                <h4 className="text-sm lg:text-base font-semibold text-gray-900 line-clamp-1">
                  {form.name || "Product Name"}
                </h4>
                <div className="flex items-center gap-2 mt-1 lg:mt-2">
                  <span className="text-sm lg:text-base font-bold text-gray-900">
                    {form.price ? `₹${form.price}` : "₹299"}
                  </span>
                  {form.onSale && form.oldPrice && (
                    <>
                      <span className="text-xs lg:text-sm text-gray-400 line-through">
                        ₹{form.oldPrice}
                      </span>
                      <span className="text-xs font-bold text-green-600">
                        {calculateDiscount()}% OFF
                      </span>
                    </>
                  )}
                </div>
                <p className="text-xs lg:text-sm text-gray-500 mt-2 line-clamp-2">
                  {form.shortDescription ||
                    "Product description will appear here..."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminProductFormPage;
