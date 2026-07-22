import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { ShoppingBag, Calendar, MapPin, Truck, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { getMyOrdersApi, cancelOrderApi, getErrorMessage } from '../utils/api.js';
import { useToast } from '../components/ui/Toast.jsx';
import Button from '../components/ui/Button.jsx';

const Orders = () => {
  const { showToast } = useToast();

  const { data: orders = [], isLoading, refetch } = useQuery({
    queryKey: ['my-orders'],
    queryFn: getMyOrdersApi,
  });

  const handleCancelOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to cancel this order? This will restore the items back to stock.')) {
      try {
        const response = await cancelOrderApi(orderId);
        showToast(response.message || 'Order cancelled successfully', 'success');
        refetch();
      } catch (error) {
        showToast(getErrorMessage(error), 'error');
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'text-amber-500 bg-amber-500/10';
      case 'processing':
        return 'text-blue-500 bg-blue-50 dark:bg-blue-950/20';
      case 'shipped':
        return 'text-sky-500 bg-sky-50 dark:bg-sky-950/20';
      case 'delivered':
        return 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20';
      case 'cancelled':
        return 'text-red-500 bg-red-50 dark:bg-red-950/20';
      default:
        return 'text-dark-500 bg-dark-50';
    }
  };

  // Helper to determine active tracking steps
  const getTrackingStepIndex = (status) => {
    switch (status) {
      case 'pending': return 0;
      case 'processing': return 1;
      case 'shipped': return 2;
      case 'delivered': return 3;
      default: return -1; // Cancelled
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-txt-muted text-sm font-semibold">
        Loading your order history...
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center flex flex-col items-center justify-center min-h-[50vh]">
        <div className="w-20 h-20 rounded-full bg-bdr-light/40 text-dark-400 flex items-center justify-center mb-6">
          <ShoppingBag size={44} />
        </div>
        <h2 className="text-2xl font-bold font-display text-txt-title mb-2">
          No Orders Placed Yet
        </h2>
        <p className="text-dark-500 dark:text-dark-450 max-w-sm mb-8 leading-relaxed">
          Once you purchase medicines through the checkout flow, your order history and tracking details will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-left">
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold font-display text-txt-title">
          My Order History
        </h1>
        <p className="text-sm text-txt-muted mt-1">
          Monitor your prescription verification, delivery tracking details, and billing summaries.
        </p>
      </div>

      <div className="space-y-10">
        {orders.map((order) => {
          const stepIndex = getTrackingStepIndex(order.orderStatus);
          const steps = ['Order Placed', 'Processing (Pharmacist Verification)', 'Shipped (Transit)', 'Delivered'];

          // Calculate estimated delivery: 3-4 days from order.createdAt
          const createdDate = new Date(order.createdAt);
          const estMin = new Date(createdDate);
          estMin.setDate(createdDate.getDate() + 3);
          const estMax = new Date(createdDate);
          estMax.setDate(createdDate.getDate() + 4);
          const estDateString = `${estMin.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          })} - ${estMax.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;

          return (
            <div
              key={order._id}
              className="glass-panel p-8 rounded-3xl border border-dark-100 dark:border-dark-850 space-y-6"
            >
              {/* Order Top Bar Info */}
              <div className="flex flex-col md:flex-row justify-between gap-4 border-b border-dark-100 dark:border-dark-850 pb-4 text-xs font-semibold">
                <div className="space-y-1.5">
                  <p className="text-dark-400">TRACKING NUMBER</p>
                  <p className="text-sm font-bold text-txt-title">{order.trackingNumber}</p>
                </div>
                <div className="space-y-1.5">
                  <p className="text-dark-400">DATE PLACED</p>
                  <p className="text-sm font-bold text-txt-title flex items-center gap-1.5">
                    <Calendar size={14} />
                    {new Date(order.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <div className="space-y-1.5">
                  <p className="text-dark-400">EST. DELIVERY</p>
                  <p className="text-sm font-bold text-txt-title">
                    {order.orderStatus === 'delivered'
                      ? 'Delivered'
                      : order.orderStatus === 'cancelled'
                      ? 'N/A'
                      : estDateString}
                  </p>
                </div>
                <div className="space-y-1.5">
                  <p className="text-dark-400">TOTAL AMOUNT</p>
                  <p className="text-sm font-extrabold text-primary-500 font-display">
                    ${order.totalAmount.toFixed(2)}
                  </p>
                </div>
                <div className="space-y-1.5">
                  <p className="text-dark-400">STATUS</p>
                  <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wide inline-block ${getStatusColor(order.orderStatus)}`}>
                    {order.orderStatus}
                  </span>
                </div>
              </div>

              {/* Live Tracking Progress Timeline */}
              {order.orderStatus !== 'cancelled' ? (
                <div className="py-6">
                  <p className="text-xs font-bold text-dark-400 uppercase tracking-wider mb-6">
                    Live Tracking Progress
                  </p>
                  {/* Timeline Horizontal Layout */}
                  <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-2">
                    {/* Line Background */}
                    <div className="absolute left-3.75 md:left-0 md:right-0 top-0 md:top-1/2 bottom-0 md:bottom-auto h-full md:h-1 w-1 md:w-full bg-dark-200 dark:bg-dark-800 -z-10" />

                    {/* Filled progress line */}
                    {stepIndex >= 0 && (
                      <div
                        className="absolute left-3.75 md:left-0 top-0 md:top-1/2 bottom-auto h-0 md:h-1 w-1 md:w-full bg-primary-500 -z-10 transition-all duration-500"
                        style={{
                          height: window.innerWidth < 768 ? `${(stepIndex / 3) * 100}%` : 'auto',
                          width: window.innerWidth >= 768 ? `${(stepIndex / 3) * 100}%` : '4px',
                        }}
                      />
                    )}

                    {steps.map((step, idx) => {
                      const isCompleted = idx <= stepIndex;
                      const isCurrent = idx === stepIndex;

                      return (
                        <div key={idx} className="flex md:flex-col items-center gap-4 md:gap-2 md:text-center z-10 shrink-0">
                          {/* Dot Circle */}
                          <div
                            className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                              isCompleted
                                ? 'bg-primary-500 border-primary-500 text-white shadow-md shadow-primary-500/20'
                                : 'bg-bg-panel border-dark-300 dark:border-dark-700 text-dark-400'
                            } ${isCurrent ? 'ring-4 ring-primary-100 dark:ring-primary-950' : ''}`}
                          >
                            {idx === 0 && <ShoppingBag size={14} />}
                            {idx === 1 && <Clock size={14} />}
                            {idx === 2 && <Truck size={14} />}
                            {idx === 3 && <CheckCircle2 size={14} />}
                          </div>
                          {/* Title text */}
                          <div>
                            <p className={`text-xs font-bold ${isCompleted ? 'text-primary-500' : 'text-dark-500'}`}>
                              {step}
                            </p>
                            {idx === 1 && order.prescriptionImage && (
                              <a
                                href={order.prescriptionImage}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[10px] text-primary-400 font-semibold hover:underline block mt-0.5"
                              >
                                View Uploaded Rx
                              </a>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center gap-2 text-sm">
                  <AlertTriangle size={18} />
                  <span>This order has been cancelled. No shipping transit is active.</span>
                </div>
              )}

              {/* Split Details: Left items list, Right delivery address */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4 border-t border-dark-100 dark:border-dark-850">
                {/* Items list */}
                <div className="lg:col-span-2 space-y-3">
                  <p className="text-xs font-bold text-dark-400 uppercase tracking-wider">
                    Purchased Products
                  </p>
                  <div className="space-y-2">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-sm">
                        <div>
                          <p className="font-semibold text-txt-title">{item.name}</p>
                          <p className="text-xs text-dark-550">Quantity: {item.quantity} &nbsp;&middot;&nbsp; Price: ${item.price.toFixed(2)}</p>
                        </div>
                        <span className="font-bold text-txt-title">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Delivery Address & Actions */}
                <div className="lg:col-span-1 space-y-4">
                  <p className="text-xs font-bold text-dark-400 uppercase tracking-wider">
                    Delivery Destination
                  </p>
                  <div className="text-sm text-txt-muted space-y-1 bg-bdr-light/40 p-4.5 rounded-2xl border border-dark-100 dark:border-dark-850">
                    <p className="font-semibold text-txt-title flex items-center gap-1.5 mb-1.5">
                      <MapPin size={14} className="text-primary-500" />
                      Shipping Address
                    </p>
                    <p>{order.shippingAddress.street}</p>
                    <p>
                      {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                    </p>
                    <p>{order.shippingAddress.country}</p>
                    <p className="mt-2 text-xs text-dark-450">Phone: {order.shippingAddress.phone}</p>
                  </div>

                  {/* Cancel Button */}
                  {order.orderStatus === 'pending' && (
                    <Button
                      onClick={() => handleCancelOrder(order._id)}
                      variant="outline"
                      className="w-full text-red-500 border-red-200 dark:border-red-950/20 hover:bg-red-50 dark:hover:bg-red-950/10 cursor-pointer"
                    >
                      Cancel Order
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Orders;
