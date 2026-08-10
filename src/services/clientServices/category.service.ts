import Categories from "@entities/Categories";
import { AppDataSource } from "@databases/data-source";
import { Request, Response } from "express";
import axios from "axios";
const CategoriesRepository = AppDataSource.getRepository(Categories);
class ClientCategoriesService {
    static async getAllCategories(): Promise<Categories[]> {
        const data: any = await CategoriesRepository.find()
        return data;
    }
}
export default ClientCategoriesService;