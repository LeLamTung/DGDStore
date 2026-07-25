import { error } from "console";
import { AppDataSource } from "../src/databases/data-source";
import Product from "../src/entities/Products";

class TestArray {

    static async TinhDiem(x: number, y:number) {
        try{
        const diem=(((x+7+8)/3)*7+y*3);
        console.log(diem)
    }catch(err){
        throw error(err);
    }
    }
}
export default TestArray;
TestArray.TinhDiem(7,8.5);