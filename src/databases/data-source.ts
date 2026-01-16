import { DataSource } from "typeorm";
import "dotenv/config";
// Kiểm tra xem có đang ở môi trường Production (Render) không
const isProduction = process.env.NODE_ENV === 'production';
export const AppDataSource = new DataSource({
  type: isProduction ? "postgres":"mysql",
  host: process.env.DATABASE_HOST,
  port: isProduction ? 5432 : 3306,
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASS,
  database: process.env.DATABASE_NAME,
  //Cấu hình SSL (Chỉ bật khi lên Render/Postgres)
    // MySQL ở local bật cái này lên thường sẽ bị lỗi kết nối
  ssl: isProduction ? { rejectUnauthorized: false } : false,
  synchronize: false,
  dropSchema: false,
  logging: [ "error"],
  entities: ["src/entities/**.ts"],
  migrations: ["src/migrations/**/*.ts"], // 👈 thêm dòng này
  migrationsRun: false,
});
