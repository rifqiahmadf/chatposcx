// lib/cors.ts
import Cors from "cors"
import initMiddleware from "./init-middleware"

// Only allow specific origin (adjust as needed)
const cors = initMiddleware(
    Cors({
        origin: "http://localhost:3000",
        methods: ["POST", "GET", "OPTIONS"],
        credentials: true,
    })
)

export default cors
