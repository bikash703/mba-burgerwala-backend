import express from 'express';
import { authorizeAdmin, isAuthenticated } from '../middelware/auth.js';
import { paymentVerification, placeorder, placeorderOnline } from '../controllers/order.js';
import { getAdminOrders, getMyOrders, getOrderDetails, processOrder } from '../controllers/order.js';


const router = express.Router()

router.post('/createorder',isAuthenticated,placeorder)
router.post('/createorderonline',isAuthenticated,placeorderOnline)
router.post('/paymentverification',isAuthenticated,paymentVerification)

router.get('/myorders',isAuthenticated,getMyOrders)
router.get("/order/:id",isAuthenticated,getOrderDetails)

//Add admin middleware
router.get("/admin/orders",isAuthenticated,authorizeAdmin,getAdminOrders)
router.get("/admin/order/:id",isAuthenticated,authorizeAdmin,processOrder)

export default router;