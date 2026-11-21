import express from "express";
import cors from "cors";
import userRoutes from "./routes.js";

const app = express();

const PORT = 3001;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {

    res.json({
        mensagem: "Backend funcionando!"
    });

});

app.use("/users", userRoutes);

app.listen(PORT, "0.0.0.0", () => {

    console.log("Servidor rodando na porta " + PORT);

});
