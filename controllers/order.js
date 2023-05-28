import { asyncEror } from '../middelware/errorMiddleware.js'
import { Order } from '../models/order.js'
import { Payment } from '../models/Payment.js'
import { instance } from '../server.js';
import ErrorHandler from '../utils/ErrorHandler.js';
import crypto from 'crypto';

export const placeorder = asyncEror(async (req, res, next) => {
    const { shippingInfo, orderItems, paymentMethod, ItemsPrice, taxPrice, shippingCharges, totalAmount } = req.body;

    const user = req.user._id

    const orderOptions = {
        shippingInfo, orderItems, paymentMethod, ItemsPrice, taxPrice, shippingCharges, totalAmount, user
    }

    await Order.create(orderOptions);

    res.status(201).json({
        success: true,
        message: "Order Placed Successfully via Cash on Delivery",
    })
})


export const placeorderOnline = asyncEror(async (req, res, next) => {
    const { shippingInfo, orderItems, paymentMethod, ItemsPrice, taxPrice, shippingCharges, totalAmount } = req.body;

    const user = req.user._id

    const orderOptions = {
        shippingInfo, orderItems, paymentMethod, ItemsPrice, taxPrice, shippingCharges, totalAmount, user
    }


    var options = {
        amount: Number(totalAmount) * 100, 
        currency: "INR",
      };

      const order = await instance.orders.create(options)

    res.status(201).json({
        success: true,
        order,
        orderOptions,
    })
})

export const paymentVerification = asyncEror(async(req,res,next)=>{
 const { razorpay_payment_id,razorpay_order_id,razorpay_signature,orderOptions } = req.body

 const body = razorpay_order_id + "|" + razorpay_payment_id;

 const expectSignature = crypto.createHmac("sha256",process.env.RAZORPAY_API_SECRET).update(body).digest("hex")

const isauthentic = expectSignature === razorpay_signature

if(isauthentic){
    const payment = await Payment.create({
        razorpay_order_id,razorpay_payment_id,razorpay_signature
    })

    await Order.create({
        ...orderOptions,paidAt:new Date(Date.now()),paymentInfo:payment._id
    })

    res.status(201).json({
        success:true,
        message:`Order placed Successfully. Payment ID: ${payment._id}`
    })
}else{
    return next(new ErrorHandler("Payment Failed",400))
}

})


export const getMyOrders = asyncEror(async (req, res, next) => {
    const orders = await Order.find({
        user: req.user._id
    }).populate("user", "name")

    res.status(200).json({
        success: true,
        orders
    })

});

export const getOrderDetails = asyncEror(async (req, res, next) => {
    const order = await Order.findById(req.params.id).populate("user", "name")

    if (!order) return next(new ErrorHandler("Invalid Order Id", 404))

    res.status(200).json({
        success: true,
        order
    })
});

export const getAdminOrders = asyncEror(async (req, res, next) => {
    const orders = await Order.find({}).populate("user", "name")

    res.status(200).json({
        success: true,
        orders
    })

});

export const processOrder = asyncEror(async (req, res, next) => {
    const order = await Order.findById(req.params.id)

    if (!order) return next(new ErrorHandler("Invalid Order Id", 404))

    if(order.orderStatus === "Preparing") order.orderStatus = "Shipped";
    else if (order.orderStatus === "Shipped") {
        order.orderStatus = "Delivered";
        order.deliveredAt = Date.now();
    }
    else if(order.orderStatus === "Delivered")
        return next(new ErrorHandler("Food Already Delivered",400))

        await order.save()

    res.status(200).json({
        success: true,
        message:"Status Updated Successfully"
    })
});


