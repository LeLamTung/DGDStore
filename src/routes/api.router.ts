import express, { Express, NextFunction, Request, Response, Router } from "express";
import RoleApiController from "@controllers/api/role.api.controller";
import CategoriesApiController from "@controllers/api/category.api.controller";
import UserApiController from "@controllers/api/user.api.controller";
import ProductsApiController from "@controllers/api/product.api.controller";
import AuthApiController from "@controllers/api/auth.api.controller";
import OrderApiController from "@controllers/api/order.api.controller";
import upload from "@middlewares/upload.middleware";
import { verifyToken } from "@middlewares/verifyToken";
import { isAdmin } from "@middlewares/isAdmin";
import { isAuthenticated } from "@middlewares/checkAuth";
import ImagesApiController from "@controllers/api/images.controller";

const router: Router = express.Router();

// Auth
router.post('/auth/login', (req: Request, res:Response)=>{
    AuthApiController.login(req, res);
});
router.post('/auth/login-google', (req: Request, res: Response) => {
    AuthApiController.loginWithGoogle(req, res);});
router.post('/auth/register', (req: Request, res:Response)=>{
    AuthApiController.register(req, res);
});
router.post('/auth/logout', (req: Request, res: Response) => {
    AuthApiController.logout(req, res);
});

//ROLE
router.use(isAuthenticated);
router.use(verifyToken);
router.use(isAdmin);

router.get('/role/list', (req: Request, res: Response) => {
    RoleApiController.getAllRoles(req, res);
});
router.get('/role/:id',(req:Request,res:Response)=>{
    RoleApiController.getRoleById(req,res);
})
router.post('/role/create', (req: Request, res: Response) => {
    RoleApiController.storeRole(req, res);
});
router.put('/role/edit', (req: Request, res: Response) => {
    RoleApiController.updateRole(req, res);
});
router.delete('/role/delete/:id', (req: Request, res: Response) => {
    RoleApiController.deleteRole(req, res);
});
//CATEGORY
router.get('/categories/list', (req: Request, res: Response) => {
    CategoriesApiController.getAllCategories(req, res);
});
router.get('/categories/list/:id', (req: Request, res: Response) => {
    CategoriesApiController.getCategoryById(req, res);
});
router.post('/categories/create', upload.array("Images", 10), (req: Request, res: Response) => {
    CategoriesApiController.storeCategories(req, res);
});

router.put('/categories/edit', upload.array("Images", 10), (req: Request, res: Response) => {
    CategoriesApiController.updateCategories(req, res);
});

router.delete('/categories/delete/:id', (req: Request, res: Response) => {
    CategoriesApiController.deleteCategories(req, res);
});
//User
router.get('/user/list', (req: Request, res: Response) => {
    UserApiController.getAllUsers(req, res);
});
router.get('/user/:id',(req:Request,res:Response)=>{
    UserApiController.getUserById(req,res);
})
router.post('/user/create', (req: Request, res: Response) => {
    UserApiController.storeUser(req, res);
});
router.put('/user/edit', (req: Request, res: Response) => {
    UserApiController.updateUser(req, res);
});
router.delete('/user/delete/:id', (req: Request, res: Response) => {
    UserApiController.deleteUser(req, res);
});
// PRODUCT
router.get('/product/list', (req: Request, res: Response) => {
    ProductsApiController.getAllProducts(req, res);
});
router.get('/product/list/:id', (req: Request, res: Response) => {
    ProductsApiController.getProductById(req, res);
}),
router.post('/product/create',upload.array("Images", 10), (req: Request, res:Response) =>{
    console.log("test ben router",req.body);
    ProductsApiController.storeProducts(req, res);

});
 router.put('/product/edit',upload.array("Images", 10), (req: Request, res: Response) =>{
     ProductsApiController.updateProducts(req, res);
 });
router.delete('/product/delete/:id', (req: Request, res:Response) => {
    ProductsApiController.deleteProducts(req,res);
});
//Images
router.get('/images/list', (req: Request, res:Response) => {
    ImagesApiController.getAllImages(req, res);
});
router.put('/images/edit',upload.array("Images", 10), (req: Request,res:Response) =>{
    ImagesApiController.updateImages(req, res);
});
router.delete('/images/delete/:id', (req: Request, res:Response) => {
    ImagesApiController.deleteImages(req,res);
});
//Order-OrderDetail
router.get('/order/list', (req: Request, res:Response) => {
    OrderApiController.getAllOrders(req, res);
});
router.put('/order/edit', (req: Request, res:Response) => {
    OrderApiController.updateOrder(req, res);
});
router.delete('/order/delete/:id', (req: Request, res:Response) => {
    OrderApiController.deleteOrder(req, res);
});
router.get('/order/orderdetail/list', (req: Request, res:Response) => {
    OrderApiController.getAllOrderDetail(req, res);
});

export default router;