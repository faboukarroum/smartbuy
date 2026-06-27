import { createBrowserRouter } from 'react-router-dom'
import Home from '../pages/Home'
import Products from '../pages/Products'
import ProductDetail from '../pages/ProductDetail'
import Cart from '../pages/Cart'
import Checkout from '../pages/Checkout'
import OrderConfirmation from '../pages/OrderConfirmation'
import Login from '../pages/Login'
import Register from '../pages/Register'
import ForgotPassword from '../pages/ForgotPassword'
import ResetPassword from '../pages/ResetPassword'
import Profile from '../pages/Profile'
import AdminLayout from '../admin/AdminLayout'
import Dashboard from '../admin/Dashboard'
import ProductList from '../admin/ProductList'
import ProductForm from '../admin/ProductForm'
import ProductScanner from '../admin/ProductScanner'
import ScannedProducts from '../admin/ScannedProducts'
import ScannedProductDetail from '../admin/ScannedProductDetail'
import Orders from '../admin/Orders'
import Users from '../admin/Users'
import Settings from '../admin/Settings'
import ProtectedRoute from '../components/ProtectedRoute'

const router = createBrowserRouter([
  { path: '/', element: <Home /> },
  { path: '/products', element: <Products /> },
  { path: '/products/:id', element: <ProductDetail /> },
  { path: '/cart', element: <Cart /> },
  { path: '/checkout', element: <Checkout /> },
  { path: '/order-confirmation/:id/:receiptToken', element: <OrderConfirmation /> },
  { path: '/orders/:id', element: <ProtectedRoute requireAdmin={false}><OrderConfirmation /></ProtectedRoute> },
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },
  { path: '/forgot-password', element: <ForgotPassword /> },
  { path: '/reset-password/:token', element: <ResetPassword /> },
  { path: '/profile', element: <ProtectedRoute requireAdmin={false}><Profile /></ProtectedRoute> },
  {
    path: '/admin',
    element: <ProtectedRoute><AdminLayout /></ProtectedRoute>,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'products', element: <ProductList /> },
      { path: 'products/new', element: <ProductForm /> },
      { path: 'products/:id/edit', element: <ProductForm /> },
      { path: 'product-scanner', element: <ProductScanner /> },
      { path: 'scanned-products', element: <ScannedProducts /> },
      { path: 'scanned-products/:id', element: <ScannedProductDetail /> },
      { path: 'orders', element: <Orders /> },
      { path: 'users', element: <Users /> },
      { path: 'settings', element: <Settings /> },
    ]
  }
])

export default router
