import express from 'express';
import { verifyRolePermission } from '../middleware/verifyRolePermission.js';
import { USER_ROLES } from '../config/user_Roles.js';
import { verifyAccessToken } from '../middleware/verifyAccessToken.js';
import { cancelOrder, getOrders, getProductSold, getRevenue, handleCreateOrder, monthlyOrders, updateOrderStatus } from '../controllers/productsController.js';

const router = express.Router();

router.post('/get-orders', verifyAccessToken, getOrders )

router.post('/create-order', verifyAccessToken, verifyRolePermission(USER_ROLES.Customer, USER_ROLES.Admin),  handleCreateOrder )

router.post('/cancel-order', verifyAccessToken, verifyRolePermission(USER_ROLES.Customer, USER_ROLES.Sales, USER_ROLES.Admin),  cancelOrder )

router.post('/update-order', verifyAccessToken, verifyRolePermission( USER_ROLES.Sales, USER_ROLES.Admin),  updateOrderStatus )

router.post('/monthly-orders', verifyAccessToken, verifyRolePermission( USER_ROLES.Sales, USER_ROLES.Admin, USER_ROLES.Marketing),  monthlyOrders ) 

router.post('/get-revenue', verifyAccessToken, verifyRolePermission( USER_ROLES.Sales, USER_ROLES.Admin, USER_ROLES.Marketing),  getRevenue ) 

router.post('/get-products-data', verifyAccessToken, verifyRolePermission(USER_ROLES.Marketing, USER_ROLES.Admin, USER_ROLES.Sales), getProductSold )
export const ordersRouter = router;