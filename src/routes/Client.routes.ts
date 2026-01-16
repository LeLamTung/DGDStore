import express, { Express, Router } from "express";
import CartController from "@controllers/clientController/cart.controller";
import upload from "@middlewares/upload.middleware";
import OrderController from "@controllers/clientController/order.controller";
// import ProductsApiController from "@controllers/api/product.api.controller";
// import CategoriesApiController from "@controllers/api/category.api.controller";
import ProductsClientController from "@controllers/clientController/product.controler";
import CategoriesClientController from "@controllers/clientController/category.controller";
import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
// import { isAuthenticated } from "@middlewares/checkAuth";
import { verifyToken } from "@middlewares/verifyToken";
const axios = require("axios");
const app: Express = express();
const routerClient = express.Router();

// route


routerClient.get("/product/list", (req, res) => {
  ProductsClientController.getAllProducts(req, res);
});
routerClient.get("/product/list/:id", (req, res) => {
  ProductsClientController.getProductById(req, res);
});
routerClient.get("/category/list", (req, res) => {
  CategoriesClientController.getAllCategories(req, res);
});
// routerClient.post("/order/momo-ipn", (req, res) => {
//   OrderController.momoIPN(req, res);
// });

const asyncHandler =
  (fn: any) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
routerClient.post("/order/momo-ipn", async (req, res) => {
  try {
    await OrderController.momoIPN(req, res);
  } catch (err: any) {
    console.error("❌ [MoMo IPN] Lỗi:", err);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: err.message });
  }
});
// routerClient.post("/order/momo-ipn", asyncHandler(OrderController.momoIPN));
routerClient.get("/momo-status/:orderId?", (req, res) => {
  OrderController.getOrderStatus(req, res);
});
routerClient.post(
  "/transaction-status",
  asyncHandler(async (req: Request, res: Response) => {
    const accessKey = process.env.MOMO_ACCESS_KEY || "F8BBA842ECF85";
    const secretKey =
      process.env.MOMO_SECRET_KEY || "K951B6PE1waDMi640xX08PD3vg6EkVlz";
    const { orderId } = req.body;
    console.log("transaction-status", req.body);
    const rawSignature = `accessKey=${accessKey}&orderId=${orderId}&partnerCode=MOMO&requestId=${orderId}`;
    const signature = crypto
      .createHmac("sha256", secretKey)
      .update(rawSignature)
      .digest("hex");

    const requestBody = {
      partnerCode: "MOMO",
      requestId: orderId,
      orderId: orderId,
      signature: signature,
      lang: "vi",
    };
    try {
      console.log("🟢 MoMo requestBody gửi đi:", requestBody);
      const result = await axios.post(
        "https://test-payment.momo.vn/v2/gateway/api/query",
        requestBody,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return res.status(200).json(result.data);
    } catch (error: any) {
      console.error("MoMo API Error:", error.response?.data || error.message);
      return res.status(500).json({
        statusCode: 500,
        message: "MoMo API Error",
        error: error.response?.data || error.message,
      });
    }
  })
);
routerClient.use(verifyToken);
routerClient.post("/cart/addtoCart", upload.none(), (req, res) => {
  CartController.AddtoCart(req, res);
});
routerClient.get("/cart/ListItem", (req, res) => {
  CartController.GetCart(req, res);
});
routerClient.put("/cart/updateQuantity", upload.none(), (req, res) => {
  CartController.updateProductQuantity(req, res);
});
routerClient.delete("/cart/remove/:id", (req, res) => {
  CartController.removeProductFromCart(req, res);
});
// routerClient.post( "/callback", asyncHandler((req: Request, res: Response) => {
//     console.log("callback đây nè ", req.body);
//     return res.status(200).json(req.body);
//   })
// );
routerClient.post("/order/Checkout", (req, res) => {
  OrderController.createOrder(req, res);
});
export default routerClient;
