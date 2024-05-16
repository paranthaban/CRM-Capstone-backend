import express from 'express';
import { verifyRolePermission } from '../middleware/verifyRolePermission.js';
import { USER_ROLES } from '../config/user_Roles.js';
import { verifyAccessToken } from '../middleware/verifyAccessToken.js';
import { getAvlProducts } from '../controllers/productsController.js';

const router = express.Router();

router.get('/avl-products', getAvlProducts) 
export const productsRouter = router;