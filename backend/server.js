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

// Rota não encontrada (responde em JSON)
app.use((req, res) => {

    res.status(404).json({
        erro: "Rota não encontrada!"
    });

});

// Tratamento de erros (JSON malformado e erros inesperados)
app.use((erro, req, res, next) => {

    // JSON com sintaxe inválida enviado pelo cliente
    if (erro.type === "entity.parse.failed") {

        return res.status(400).json({
            erro: "JSON inválido! Verifique o corpo da requisição."
        });

    }

    // Corpo grande demais
    if (erro.type === "entity.too.large") {

        return res.status(400).json({
            erro: "O corpo da requisição é muito grande!"
        });

    }

    console.error("Erro inesperado:", erro);

    res.status(500).json({
        erro: "Erro interno do servidor."
    });

});

app.listen(PORT, "0.0.0.0", () => {

    console.log("Servidor rodando na porta " + PORT);

});
