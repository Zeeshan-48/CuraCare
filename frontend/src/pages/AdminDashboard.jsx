import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Package,
  Layers,
  ShoppingBag,
  Edit2,
  Trash2,
  Plus,
  MessageSquare,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from 'recharts';

import { useQueryClient } from '@tanstack/react-query';
import {
  getProductsApi,
  createProductApi,
  updateProductApi,
  deleteProductApi,
  getCategoriesApi,
  createCategoryApi,
  updateCategoryApi,
  deleteCategoryApi,
  getAllOrdersApi,
  updateOrderStatusApi,
  updateOrderPrescriptionStatusApi,
  uploadImageApi,
  getErrorMessage,
  getMessagesApi,
} from '../utils/api.js';
import { useToast } from '../components/ui/Toast.jsx';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import Modal from '../components/ui/Modal.jsx';
import { useFormPersist } from '../utils/useFormPersist.js';



const AdminDashboard = () => {
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  // Navigation Panel State: 'dashboard' | 'products' | 'categories' | 'orders'
  const [isProductSubmitting, setIsProductSubmitting] = useState(false);
  const [activePanel, setActivePanel] = useState('dashboard');
  const [selectedOrderStatusTab, setSelectedOrderStatusTab] = useState('pending');

  const productForm = useFormPersist('add_product_form');
  const categoryForm = useFormPersist('add_category_form');

  // local lists
  const [productList, setProductList] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [orderList, setOrderList] = useState([]);
  const [messageList, setMessageList] = useState([]);

  // CRUD Modal states
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  // Load lists from database API
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const prodData = await getProductsApi({ limit: 100 });
        setProductList(prodData.products || []);

        const catData = await getCategoriesApi();
        setCategoryList(catData || []);

        const orderData = await getAllOrdersApi();
        setOrderList(orderData || []);

        const msgData = await getMessagesApi();
        setMessageList(msgData.messages || []);
      } catch (error) {
        console.error('Failed to load admin dashboard data:', error);
      }
    };
    
    loadDashboardData();
  }, []);

  // ----------------------------------------------------
  // Product CRUD Handlers
  // ----------------------------------------------------
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod) => {
    setEditingProduct(prod);
    setProductModalOpen(true);
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    const imageFile = e.target.image?.files?.[0];

    setIsProductSubmitting(true);
    let imageUrl = editingProduct?.images?.[0] || 'https://images.unsplash.com/photo-1550572017-edd951b55104?auto=format&fit=crop&q=80&w=600';

    try {
      // If a file was chosen, upload it to Cloudinary
      if (imageFile) {
        showToast('Uploading image to Cloudinary...', 'info');
        const uploadResponse = await uploadImageApi(imageFile);
        imageUrl = uploadResponse.url;
      }

      const prodDetails = {
        name: data.get('name'),
        genericName: data.get('genericName'),
        brand: data.get('brand'),
        category: data.get('category'),
        description: data.get('description'),
        uses: data.get('uses'),
        sideEffects: data.get('sideEffects'),
        dosage: data.get('dosage'),
        price: parseFloat(data.get('price')),
        stock: parseInt(data.get('stock')),
        discount: parseInt(data.get('discount') || '0'),
        prescriptionRequired: data.get('prescriptionRequired') === 'true',
        expiryDate: data.get('expiryDate') || null,
        batchNumber: data.get('batchNumber') || '',
        images: [imageUrl],
      };

      if (editingProduct) {
        // Edit
        const updated = await updateProductApi(editingProduct._id, prodDetails);
        setProductList(productList.map((p) => (p._id === editingProduct._id ? { ...p, ...updated } : p)));
        showToast('Product updated successfully.', 'success');
      } else {
        // Add
        const newProduct = await createProductApi(prodDetails);
        setProductList([newProduct, ...productList]);
        showToast('Product added successfully.', 'success');
        productForm.clearPersistedData();
      }

      // Invalidate queries to refresh the application dynamically (Home, Products lists)
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });

      setProductModalOpen(false);
    } catch (error) {
      showToast(getErrorMessage(error), 'error');
    } finally {
      setIsProductSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this medicine from the inventory? This action cannot be undone.')) {
      return;
    }
    try {
      await deleteProductApi(id);
      setProductList(productList.filter((p) => p._id !== id));
      showToast('Product deleted.', 'success');
    } catch (error) {
      showToast(getErrorMessage(error), 'error');
    }
  };

  // ----------------------------------------------------
  // Category CRUD Handlers
  // ----------------------------------------------------
  const handleOpenAddCategory = () => {
    setEditingCategory(null);
    setCategoryModalOpen(true);
  };

  const handleOpenEditCategory = (cat) => {
    setEditingCategory(cat);
    setCategoryModalOpen(true);
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    const catDetails = {
      name: data.get('name'),
      description: data.get('description'),
    };

    try {
      if (editingCategory) {
        const updated = await updateCategoryApi(editingCategory._id, catDetails);
        setCategoryList(categoryList.map((c) => (c._id === editingCategory._id ? updated : c)));
        showToast('Category updated successfully.', 'success');
      } else {
        const newCat = await createCategoryApi(catDetails);
        setCategoryList([...categoryList, newCat]);
        showToast('Category added.', 'success');
        categoryForm.clearPersistedData();
      }
      
      // Invalidate queries to refresh the application dynamically (Home, Products lists)
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    } catch (error) {
      showToast(getErrorMessage(error), 'error');
    }
    setCategoryModalOpen(false);
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this category? All products assigned to this category will remain, but their relational category link will be removed.')) {
      return;
    }
    try {
      await deleteCategoryApi(id);
      setCategoryList(categoryList.filter((c) => c._id !== id));
      showToast('Category deleted successfully.', 'success');
      
      // Refresh the application queries dynamically
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    } catch (error) {
      showToast(getErrorMessage(error), 'error');
    }
  };

  // ----------------------------------------------------
  // Order Status Update Handler
  // ----------------------------------------------------
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const updated = await updateOrderStatusApi(orderId, newStatus);
      setOrderList(orderList.map((o) => (o._id === orderId ? { ...o, orderStatus: updated.orderStatus } : o)));
      showToast(`Order status updated to ${newStatus}.`, 'success');
    } catch (error) {
      showToast(getErrorMessage(error), 'error');
    }
  };

  const handleUpdatePrescriptionStatus = async (orderId, status) => {
    try {
      const updated = await updateOrderPrescriptionStatusApi(orderId, status);
      setOrderList(orderList.map((o) => (o._id === orderId ? { ...o, prescriptionStatus: updated.prescriptionStatus } : o)));
      showToast(`Prescription status updated to ${status}.`, 'success');
    } catch (error) {
      showToast(getErrorMessage(error), 'error');
    }
  };

  // ----------------------------------------------------
  // Calculations for Dashboard Stats
  // ----------------------------------------------------
  const totalRevenue = orderList
    .filter((o) => o.orderStatus !== 'cancelled')
    .reduce((sum, o) => sum + (o.totalAmount || o.totals?.total || 0), 0);

  const lowStockProducts = productList.filter((p) => p.stock < 10);

  // Recharts Chart Data
  const salesChartData = [
    { name: 'Feb', sales: 4200 },
    { name: 'Mar', sales: 5100 },
    { name: 'Apr', sales: 4800 },
    { name: 'May', sales: 6300 },
    { name: 'Jun', sales: 7400 },
    { name: 'Jul', sales: totalRevenue },
  ];

  const categoryChartData = categoryList.map((c) => ({
    name: c.name,
    count: productList.filter((p) => (p.category?.name || p.category) === c.name).length || 1,
  }));

  const COLORS = ['#14b8a6', '#10b981', '#6366f1', '#f59e0b', '#ef4444'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-left">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        {/* Sidebar Nav */}
        <div className="lg:col-span-1 glass-panel p-6 rounded-3xl space-y-2">
          <h2 className="font-display font-extrabold text-lg text-txt-title mb-6 px-3">
            Admin Suite
          </h2>
          <button
            onClick={() => setActivePanel('dashboard')}
            className={`w-full text-left px-4 py-3 rounded-xl font-display text-sm font-semibold transition-colors flex items-center gap-3 cursor-pointer ${
              activePanel === 'dashboard'
                ? 'bg-primary-500 text-white'
                : 'text-txt-main hover:bg-primary-50 dark:hover:bg-dark-900/60'
            }`}
          >
            <TrendingUp size={16} />
            Dashboard
          </button>
          <button
            onClick={() => setActivePanel('products')}
            className={`w-full text-left px-4 py-3 rounded-xl font-display text-sm font-semibold transition-colors flex items-center gap-3 cursor-pointer ${
              activePanel === 'products'
                ? 'bg-primary-500 text-white'
                : 'text-txt-main hover:bg-primary-50 dark:hover:bg-dark-900/60'
            }`}
          >
            <Package size={16} />
            Products
          </button>
          <button
            onClick={() => setActivePanel('categories')}
            className={`w-full text-left px-4 py-3 rounded-xl font-display text-sm font-semibold transition-colors flex items-center gap-3 cursor-pointer ${
              activePanel === 'categories'
                ? 'bg-primary-500 text-white'
                : 'text-txt-main hover:bg-primary-50 dark:hover:bg-dark-900/60'
            }`}
          >
            <Layers size={16} />
            Categories
          </button>
          <button
            onClick={() => setActivePanel('orders')}
            className={`w-full text-left px-4 py-3 rounded-xl font-display text-sm font-semibold transition-colors flex items-center gap-3 cursor-pointer ${
              activePanel === 'orders'
                ? 'bg-primary-500 text-white'
                : 'text-txt-main hover:bg-primary-50 dark:hover:bg-dark-900/60'
            }`}
          >
            <ShoppingBag size={16} />
            Orders Queue
          </button>
          <button
            onClick={() => setActivePanel('messages')}
            className={`w-full text-left px-4 py-3 rounded-xl font-display text-sm font-semibold transition-colors flex items-center gap-3 cursor-pointer ${
              activePanel === 'messages'
                ? 'bg-primary-500 text-white'
                : 'text-txt-main hover:bg-primary-50 dark:hover:bg-dark-900/60'
            }`}
          >
            <MessageSquare size={16} />
            Customer Messages
          </button>
        </div>

        {/* Dashboard Panels */}
        <div className="lg:col-span-4 space-y-8">
          {/* A. DASHBOARD PANEL */}
          {activePanel === 'dashboard' && (
            <div className="space-y-8">
              {/* Stat Cards Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="glass-panel p-5 rounded-2xl">
                  <span className="text-[10px] font-bold text-dark-400 uppercase tracking-wider block">
                    TOTAL REVENUE
                  </span>
                  <p className="text-2xl font-extrabold text-txt-title mt-1.5 font-display">
                    ${totalRevenue.toFixed(2)}
                  </p>
                </div>
                <div className="glass-panel p-5 rounded-2xl">
                  <span className="text-[10px] font-bold text-dark-400 uppercase tracking-wider block">
                    ORDERS PLACED
                  </span>
                  <p className="text-2xl font-extrabold text-txt-title mt-1.5 font-display">
                    {orderList.length}
                  </p>
                </div>
                <div className="glass-panel p-5 rounded-2xl">
                  <span className="text-[10px] font-bold text-dark-400 uppercase tracking-wider block">
                    INVENTORY ITEMS
                  </span>
                  <p className="text-2xl font-extrabold text-txt-title mt-1.5 font-display">
                    {productList.length}
                  </p>
                </div>
                <div className="glass-panel p-5 rounded-2xl">
                  <span className="text-[10px] font-bold text-dark-400 uppercase tracking-wider block">
                    REGISTERED PATIENTS
                  </span>
                  <p className="text-2xl font-extrabold text-txt-title mt-1.5 font-display">
                    242
                  </p>
                </div>
              </div>

              {/* Low Stock Alerts */}
              {lowStockProducts.length > 0 && (
                <div className="glass-panel p-6 rounded-3xl border border-red-500/20 bg-red-500/5">
                  <div className="flex items-center gap-2 text-red-500 font-display font-bold text-sm uppercase tracking-wider mb-4">
                    <span className="animate-pulse w-2.5 h-2.5 rounded-full bg-red-500"></span>
                    ⚠️ Low Stock Alerts
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {lowStockProducts.map((prod) => (
                      <div key={prod._id} className="p-4 bg-bg-panel border border-bdr-main rounded-xl flex justify-between items-center text-xs">
                        <div>
                          <p className="font-semibold text-txt-title">{prod.name}</p>
                          <p className="text-[10px] text-txt-muted">{prod.genericName}</p>
                        </div>
                        <span className="px-2.5 py-1 bg-red-100 text-red-700 font-bold rounded-lg shrink-0">
                          {prod.stock} left
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Graphical Charts Section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Line Chart */}
                <div className="glass-panel p-6 rounded-3xl md:col-span-2 space-y-4">
                  <h3 className="font-display font-bold text-sm text-txt-title uppercase tracking-wider">
                    Sales Revenue Chart
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={salesChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                        <Tooltip />
                        <Area type="monotone" dataKey="sales" stroke="#14b8a6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSales)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Bar Chart Categories */}
                <div className="glass-panel p-6 rounded-3xl md:col-span-1 space-y-4">
                  <h3 className="font-display font-bold text-sm text-txt-title uppercase tracking-wider">
                    Category Ratios
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={categoryChartData} margin={{ top: 10, right: 10, left: -30, bottom: 0 }}>
                        <XAxis dataKey="name" fontSize={8} stroke="#94a3b8" tickLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                        <Tooltip />
                        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                          {categoryChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* B. PRODUCT CRUD PANEL */}
          {activePanel === 'products' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="font-display font-bold text-lg text-txt-title">
                  Inventory Management
                </h3>
                <Button variant="primary" size="sm" onClick={handleOpenAddProduct} className="gap-1.5">
                  <Plus size={16} />
                  Add Medicine
                </Button>
              </div>

              {/* Products Table */}
              <div className="glass-panel rounded-2xl overflow-hidden border border-dark-100 dark:border-dark-850">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-bdr-light/40 font-semibold text-txt-muted">
                      <tr>
                        <th className="p-4">Name</th>
                        <th className="p-4">Brand</th>
                        <th className="p-4">Category</th>
                        <th className="p-4">Batch</th>
                        <th className="p-4">Expiry Date</th>
                        <th className="p-4">Price</th>
                        <th className="p-4">Stock</th>
                        <th className="p-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-dark-100 dark:divide-dark-850 text-dark-850 dark:text-dark-250">
                      {productList.map((prod) => {
                        const isExpired = prod.expiryDate && new Date(prod.expiryDate) < new Date();
                        const isExpiringSoon = prod.expiryDate && !isExpired && new Date(prod.expiryDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
                        return (
                          <tr key={prod._id} className="hover:bg-dark-50/50">
                            <td className="p-4 font-semibold">{prod.name}</td>
                            <td className="p-4">{prod.brand}</td>
                            <td className="p-4">{prod.category?.name || prod.category}</td>
                            <td className="p-4 font-mono text-xs">{prod.batchNumber || 'N/A'}</td>
                            <td className={`p-4 text-xs font-semibold ${isExpired ? 'text-red-500' : isExpiringSoon ? 'text-amber-500' : ''}`}>
                              {prod.expiryDate ? new Date(prod.expiryDate).toLocaleDateString() : 'N/A'}
                              {isExpired && ' (Expired)'}
                              {isExpiringSoon && ' (Expiring Soon)'}
                            </td>
                            <td className="p-4">${prod.price.toFixed(2)}</td>
                            <td className={`p-4 font-bold ${prod.stock < 10 ? 'text-red-500' : ''}`}>{prod.stock}</td>
                          <td className="p-4 flex gap-2">
                            <button
                              onClick={() => handleOpenEditProduct(prod)}
                              className="p-2 text-primary-500 hover:bg-primary-50 dark:hover:bg-dark-800 rounded-lg cursor-pointer"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(prod._id)}
                              className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg cursor-pointer"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* C. CATEGORY CRUD PANEL */}
          {activePanel === 'categories' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="font-display font-bold text-lg text-txt-title">
                  Categories Directory
                </h3>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleOpenAddCategory}
                  className="gap-1.5"
                >
                  <Plus size={16} />
                  Add Category
                </Button>
              </div>

              {/* Categories Table */}
              <div className="glass-panel rounded-2xl overflow-hidden border border-dark-100 dark:border-dark-850">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-bdr-light/40 font-semibold text-txt-muted">
                      <tr>
                        <th className="p-4">Name</th>
                        <th className="p-4">Slug</th>
                        <th className="p-4">Description</th>
                        <th className="p-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-dark-100 dark:divide-dark-850 text-dark-850 dark:text-dark-250">
                      {categoryList.map((cat) => (
                        <tr key={cat._id} className="hover:bg-dark-50/50">
                          <td className="p-4 font-semibold">{cat.name}</td>
                          <td className="p-4 text-xs font-mono">{cat.slug}</td>
                          <td className="p-4 text-xs max-w-xs truncate">{cat.description}</td>
                          <td className="p-4 flex gap-2">
                            <button
                              onClick={() => handleOpenEditCategory(cat)}
                              className="p-2 text-primary-500 hover:bg-primary-50 dark:hover:bg-dark-800 rounded-lg cursor-pointer"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(cat._id)}
                              className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg cursor-pointer"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* D. ORDER MANAGEMENT QUEUE */}
          {activePanel === 'orders' && (() => {
            const countPending = orderList.filter((o) => o.orderStatus === 'pending').length;
            const countProcessing = orderList.filter((o) => o.orderStatus === 'processing').length;
            const countShipped = orderList.filter((o) => o.orderStatus === 'shipped').length;
            const countDelivered = orderList.filter((o) => o.orderStatus === 'delivered').length;
            const countCancelled = orderList.filter((o) => o.orderStatus === 'cancelled').length;

            const filteredOrders = orderList.filter((o) => o.orderStatus === selectedOrderStatusTab);

            return (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="font-display font-bold text-lg text-txt-title">
                    Orders Dispatch Queue
                  </h3>
                  <span className="text-xs text-txt-muted font-semibold">
                    Viewing {selectedOrderStatusTab} orders
                  </span>
                </div>

                {/* Status Tabs Sub-Navigation */}
                <div className="flex flex-wrap gap-2 border-b border-dark-100 dark:border-dark-850 pb-4">
                  {[
                    { id: 'pending', label: 'Pending', count: countPending, color: 'bg-amber-500/10 text-amber-500' },
                    { id: 'processing', label: 'Processing', count: countProcessing, color: 'bg-blue-500/10 text-blue-500' },
                    { id: 'shipped', label: 'Shipped', count: countShipped, color: 'bg-indigo-500/10 text-indigo-500' },
                    { id: 'delivered', label: 'Delivered', count: countDelivered, color: 'bg-emerald-500/10 text-emerald-500' },
                    { id: 'cancelled', label: 'Cancelled', count: countCancelled, color: 'bg-red-500/10 text-red-500' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setSelectedOrderStatusTab(tab.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border ${
                        selectedOrderStatusTab === tab.id
                          ? 'bg-primary-500 border-primary-500 text-white shadow-md shadow-primary-500/10'
                          : 'bg-bg-panel border-bdr-main/60 hover:bg-bdr-light hover:border-bdr-main text-txt-main'
                      }`}
                    >
                      <span>{tab.label}</span>
                      <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-extrabold ${
                        selectedOrderStatusTab === tab.id
                          ? 'bg-white/20 text-white'
                          : tab.color
                      }`}>
                        {tab.count}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="space-y-4">
                  {filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => (
                      <div
                        key={order._id}
                        className="glass-panel p-6 rounded-2xl border border-dark-100 dark:border-dark-850 space-y-4 text-xs"
                      >
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <p className="font-bold text-txt-title">
                              TRACKING: {order.trackingNumber}
                            </p>
                            {order.userId && (
                              <p className="text-primary-500 font-semibold mt-1">
                                Customer: {order.userId.name} ({order.userId.email})
                              </p>
                            )}
                            <p className="text-dark-450 mt-0.5">
                              Address: {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}, {order.shippingAddress.country}
                            </p>
                            <p className="text-dark-450 mt-0.5">
                              Phone: {order.shippingAddress.phone}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-dark-500 uppercase">Status:</span>
                            <select
                              value={order.orderStatus}
                              onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                              className="px-2 py-1 bg-bg-panel border border-bdr-main rounded-lg font-semibold text-txt-title"
                            >
                              <option value="pending">Pending</option>
                              <option value="processing">Processing</option>
                              <option value="shipped">Shipped</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </div>
                        </div>

                        {/* Prescription approval details */}
                        {order.prescriptionImage && order.prescriptionStatus && order.prescriptionStatus !== 'none' && (
                          <div className="p-4 bg-bdr-light/20 border border-bdr-main rounded-xl space-y-2 mt-2 w-full text-left">
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-semibold text-dark-500">📄 Prescription status:</span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                order.prescriptionStatus === 'approved'
                                  ? 'bg-emerald-100 text-emerald-600'
                                  : order.prescriptionStatus === 'rejected'
                                  ? 'bg-red-100 text-red-650'
                                  : 'bg-amber-100 text-amber-600'
                              }`}>
                                {order.prescriptionStatus}
                              </span>
                            </div>
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs">
                              <a
                                href={order.prescriptionImage}
                                target="_blank"
                                rel="noreferrer"
                                className="text-primary-500 hover:text-primary-600 underline font-semibold flex items-center gap-1"
                              >
                                View Uploaded Prescription Document
                              </a>
                              {order.prescriptionStatus === 'pending' && (
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleUpdatePrescriptionStatus(order._id, 'approved')}
                                    className="px-3 py-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-bold cursor-pointer transition-colors"
                                  >
                                    Approve Rx
                                  </button>
                                  <button
                                    onClick={() => handleUpdatePrescriptionStatus(order._id, 'rejected')}
                                    className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg font-bold cursor-pointer transition-colors"
                                  >
                                    Reject Rx
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Transaction ID if paid by card */}
                        {order.paymentMethod === 'razorpay' && (
                          <div className="text-[10px] text-dark-450 mt-1 text-left">
                            📱 Payment Method: <span className="font-semibold text-txt-title">Razorpay</span> 
                            {order.transactionId && <span> (TxID: <span className="font-mono">{order.transactionId}</span>)</span>}
                          </div>
                        )}

                        <div className="pt-3 border-t border-dark-50 dark:border-dark-850 flex justify-between items-center text-dark-500">
                          <div>
                            {order.items.map((it, idx) => (
                              <span key={idx} className="mr-3">
                                {it.name} (x{it.quantity})
                              </span>
                            ))}
                          </div>
                          <span className="font-bold text-primary-500 text-sm">
                            Total: ${(order.totalAmount || order.totals?.total || order.totals?.subtotal || 0).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="glass-panel py-20 text-center text-txt-muted text-sm font-semibold">
                      No orders are currently in "{selectedOrderStatusTab}" state.
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {/* E. CUSTOMER MESSAGES PANEL */}
          {activePanel === 'messages' && (
            <div className="glass-panel p-8 rounded-3xl space-y-6">
              <div className="flex justify-between items-center border-b border-dark-100 dark:border-dark-850 pb-4">
                <div>
                  <h2 className="font-display font-extrabold text-2xl text-txt-title">
                    Customer Messages
                  </h2>
                  <p className="text-sm text-txt-muted mt-1">
                    Manage and review contact inquiries raised by patients.
                  </p>
                </div>
                <span className="px-3 py-1 bg-primary-100 dark:bg-primary-950/20 text-primary-500 font-bold text-xs rounded-full">
                  {messageList.length} inquiries
                </span>
              </div>

              {messageList.length > 0 ? (
                <div className="divide-y divide-dark-100 dark:divide-dark-850">
                  {messageList.map((msg) => (
                    <div key={msg._id} className="py-6 first:pt-0 last:pb-0 flex flex-col gap-3 text-left">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <span className="text-xs font-bold text-primary-500 uppercase tracking-wider block">
                            Subject: {msg.subject}
                          </span>
                          <h4 className="font-display font-bold text-base text-txt-title mt-0.5">
                            {msg.name}
                          </h4>
                          <a href={`mailto:${msg.email}`} className="text-xs text-primary-400 hover:underline">
                            {msg.email}
                          </a>
                        </div>
                        <span className="text-xs text-dark-400 font-mono">
                          {new Date(msg.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <div className="p-4 bg-bdr-light/30 border border-bdr-main/40 rounded-2xl text-sm text-txt-main whitespace-pre-line leading-relaxed">
                        {msg.message}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 text-txt-muted text-sm font-semibold">
                  No contact messages have been received yet.
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* 1. CRUD Modal Product */}
      <Modal
        isOpen={productModalOpen}
        onClose={() => setProductModalOpen(false)}
        title={editingProduct ? 'Edit Medicine details' : 'Add New Medicine'}
      >
        <form onSubmit={handleProductSubmit} onChange={productForm.handleFormChange} className="space-y-4 text-left">
          <Input
            label="Product Name"
            name="name"
            defaultValue={editingProduct ? (editingProduct.name || '') : (productForm.formData.name || '')}
            required
          />
          <Input
            label="Generic Name (Formula)"
            name="genericName"
            defaultValue={editingProduct ? (editingProduct.genericName || '') : (productForm.formData.genericName || '')}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Brand" 
              name="brand" 
              defaultValue={editingProduct ? (editingProduct.brand || '') : (productForm.formData.brand || '')} 
              required 
            />
            <div className="text-left">
              <label className="block text-sm font-medium text-txt-main mb-1.5 font-display">
                Category
              </label>
              <select
                name="category"
                defaultValue={editingProduct ? (editingProduct.category?._id || editingProduct.category || '') : (productForm.formData.category || '')}
                className="form-input text-sm outline-none"
                required
              >
                <option value="" disabled>Select Category</option>
                {categoryList.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Price ($)"
              name="price"
              type="number"
              step="0.01"
              defaultValue={editingProduct ? (editingProduct.price || '') : (productForm.formData.price || '')}
              required
            />
            <Input
              label="Stock"
              name="stock"
              type="number"
              defaultValue={editingProduct ? (editingProduct.stock || '') : (productForm.formData.stock || '')}
              required
            />
            <Input
              label="Discount (%)"
              name="discount"
              type="number"
              defaultValue={editingProduct ? (editingProduct.discount || '0') : (productForm.formData.discount || '0')}
            />
          </div>

          <div className="text-left">
            <label className="block text-sm font-medium text-txt-main mb-1.5 font-display">
              Prescription Required?
            </label>
            <select
              name="prescriptionRequired"
              defaultValue={editingProduct ? (editingProduct.prescriptionRequired ? 'true' : 'false') : (productForm.formData.prescriptionRequired || 'false')}
              className="form-input text-sm"
            >
              <option value="false">Over-The-Counter (OTC)</option>
              <option value="true">Prescription (Rx) Required</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4 text-left">
            <Input
              label="Batch Number"
              name="batchNumber"
              defaultValue={editingProduct ? (editingProduct.batchNumber || '') : (productForm.formData.batchNumber || '')}
            />
            <div>
              <label className="block text-sm font-medium text-txt-main mb-1.5 font-display">
                Expiry Date
              </label>
              <input
                type="date"
                name="expiryDate"
                defaultValue={editingProduct && editingProduct.expiryDate ? new Date(editingProduct.expiryDate).toISOString().split('T')[0] : (productForm.formData.expiryDate || '')}
                className="form-input text-sm outline-none w-full"
              />
            </div>
          </div>

          <div className="text-left">
            <label className="block text-sm font-medium text-txt-main mb-1.5 font-display">
              Medicine Image (Optional)
            </label>
            <input
              type="file"
              name="image"
              accept="image/*"
              className="w-full text-xs text-dark-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 dark:file:bg-primary-950 dark:file:text-primary-400 cursor-pointer"
            />
            {editingProduct?.images?.[0] && (
              <span className="text-[10px] text-dark-400 mt-1 block">
                Current: <a href={editingProduct.images[0]} target="_blank" rel="noopener noreferrer" className="text-primary-500 underline font-mono truncate max-w-xs inline-block align-middle">{editingProduct.images[0]}</a>
              </span>
            )}
          </div>

          <div className="text-left">
            <label className="block text-sm font-medium text-txt-main mb-1.5 font-display">
              Description
            </label>
            <textarea
              name="description"
              rows="3"
              defaultValue={editingProduct ? (editingProduct.description || '') : (productForm.formData.description || '')}
              className="form-input text-sm resize-none"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-dark-500 uppercase mb-1">Uses</label>
              <textarea
                name="uses"
                rows="2"
                defaultValue={editingProduct ? (editingProduct.uses || '') : (productForm.formData.uses || '')}
                className="form-input text-xs resize-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-dark-500 uppercase mb-1">Side Effects</label>
              <textarea
                name="sideEffects"
                rows="2"
                defaultValue={editingProduct ? (editingProduct.sideEffects || '') : (productForm.formData.sideEffects || '')}
                className="form-input text-xs resize-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-dark-500 uppercase mb-1">Dosage</label>
              <textarea
                name="dosage"
                rows="2"
                defaultValue={editingProduct ? (editingProduct.dosage || '') : (productForm.formData.dosage || '')}
                className="form-input text-xs resize-none"
                required
              />
            </div>
          </div>

          <div className="text-right pt-4 flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setProductModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isProductSubmitting}>
              {editingProduct ? 'Update Product' : 'Save Product'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* 2. CRUD Modal Category */}
      <Modal
        isOpen={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        title={editingCategory ? 'Edit Category' : 'Add New Category'}
      >
        <form onSubmit={handleCategorySubmit} onChange={categoryForm.handleFormChange} className="space-y-4 text-left">
          <Input
            label="Category Name"
            name="name"
            defaultValue={editingCategory ? (editingCategory.name || '') : (categoryForm.formData.name || '')}
            required
          />
          <div className="text-left">
            <label className="block text-sm font-medium text-txt-main mb-1.5 font-display">
              Description
            </label>
            <textarea
              name="description"
              rows="3"
              defaultValue={editingCategory ? (editingCategory.description || '') : (categoryForm.formData.description || '')}
              className="form-input text-sm resize-none"
              required
            />
          </div>

          <div className="text-right pt-4 flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setCategoryModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Category
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminDashboard;
