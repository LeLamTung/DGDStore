import { DataSource } from "typeorm";
import "dotenv/config";
export const AppDataSource = new DataSource({
  type: "mysql",
  host: process.env.DATABASE_HOST,
  port: 3306,
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASS,
  database: process.env.DATABASE_NAME,
  synchronize: false,
  dropSchema: false,
  logging: [ "error"],
  entities: ["src/entities/**.ts"],
  migrations: ["src/migrations/**/*.ts"], // 👈 thêm dòng này
  migrationsRun: false,
});
