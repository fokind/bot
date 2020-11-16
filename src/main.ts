import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import * as dotenv from "dotenv";

dotenv.config();
const port = process.env.PORT || 3000;

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.setGlobalPrefix("api");
    await app.listen(port);
    console.log(`server started at http://localhost:${port}`);
}

bootstrap();
