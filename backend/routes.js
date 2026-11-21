// Importando as ferramentas necessárias
import express from "express";
import bcrypt from "bcryptjs";
import { db, salvarBanco } from "./database.js";

// Criando o agrupamento de rotas
const router = express.Router();

// Função para buscar um usuário pelo ID
function buscarUsuario(id) {
    const consulta = db.prepare(
        "SELECT * FROM usuarios WHERE id = ?"
    );

    consulta.bind([id]);

    let usuario = null;

    if (consulta.step()) {
        usuario = consulta.getAsObject();
    }

    consulta.free();

    return usuario;
}

// Função para verificar se e-mail ou login já existem
function verificarDuplicidade(campo, valor, id = null) {
    const consulta = db.prepare(
        `SELECT id FROM usuarios WHERE ${campo} = ?`
    );

    consulta.bind([valor]);

    let encontrado = false;

    if (consulta.step()) {
        const resultado = consulta.getAsObject();

        if (id === null || resultado.id !== id) {
            encontrado = true;
        }
    }

    consulta.free();

    return encontrado;
}

// Função para não enviar a senha na resposta
function dadosPublicos(usuario) {
    return {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        login: usuario.login,
        ativo: Boolean(usuario.ativo)
    };
}

// Verifica se o corpo da requisição é válido
function corpoValido(body) {
    return (
        body !== null &&
        typeof body === "object" &&
        !Array.isArray(body)
    );
}

// Verifica se o erro veio de uma duplicidade (UNIQUE) no banco
function erroDeDuplicidade(erro) {
    return String(erro && erro.message).includes("UNIQUE");
}

// ROTA 1: Cadastrar usuário
router.post("/", async (req, res) => {
    try {
        if (!corpoValido(req.body)) {
            return res.status(400).json({
                erro: "Envie os dados do usuário em formato válido!"
            });
        }

        const { nome, email, login, senha, ativo } = req.body;

        // Verificando os campos obrigatórios
        if (
            typeof nome !== "string" ||
            typeof email !== "string" ||
            typeof login !== "string" ||
            typeof senha !== "string" ||
            !nome.trim() ||
            !email.trim() ||
            !login.trim() ||
            !senha
        ) {
            return res.status(400).json({
                erro: "Preencha todos os campos obrigatórios corretamente!"
            });
        }

        const nomeLimpo = nome.trim();
        // E-mail em minúsculas para não duplicar com letras diferentes
        const emailLimpo = email.trim().toLowerCase();
        const loginLimpo = login.trim();

        // Verificando o tamanho do nome
        if (nomeLimpo.length < 3) {
            return res.status(400).json({
                erro: "O nome deve ter pelo menos 3 caracteres!"
            });
        }

        // Verificando o formato do e-mail
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLimpo)) {
            return res.status(400).json({
                erro: "Digite um e-mail válido!"
            });
        }

        // Verificando o tamanho do login
        if (loginLimpo.length < 3) {
            return res.status(400).json({
                erro: "O login deve ter pelo menos 3 caracteres!"
            });
        }

        // Verificando o tamanho da senha
        if (senha.length < 8) {
            return res.status(400).json({
                erro: "A senha deve ter pelo menos 8 caracteres!"
            });
        }

        // Verificando se o status foi enviado corretamente
        if (ativo !== undefined && typeof ativo !== "boolean") {
            return res.status(400).json({
                erro: "O campo ativo deve ser verdadeiro ou falso!"
            });
        }

        // Verificando se o e-mail já está cadastrado
        if (verificarDuplicidade("email", emailLimpo)) {
            return res.status(400).json({
                erro: "Este e-mail já está cadastrado!"
            });
        }

        // Verificando se o login já está cadastrado
        if (verificarDuplicidade("login", loginLimpo)) {
            return res.status(400).json({
                erro: "Este login já está cadastrado!"
            });
        }

        // Transformando a senha em hash
        const senhaHash = await bcrypt.hash(senha, 10);

        // Inserindo o usuário no banco
        db.run(
            `INSERT INTO usuarios (nome, email, login, senha, ativo)
             VALUES (?, ?, ?, ?, ?)`,
            [
                nomeLimpo,
                emailLimpo,
                loginLimpo,
                senhaHash,
                ativo === undefined || ativo ? 1 : 0
            ]
        );

        // Pegando o ID ANTES de salvar o arquivo.
        // O salvarBanco() usa db.export(), que reinicia o banco
        // e faz o last_insert_rowid() voltar para 0.
        const id = db.exec(
            "SELECT last_insert_rowid() AS id"
        )[0].values[0][0];

        // Salvando as alterações no arquivo SQLite
        salvarBanco();

        // Buscando o usuário criado
        const usuario = buscarUsuario(id);

        // Respondendo sem enviar a senha
        return res.status(201).json(dadosPublicos(usuario));

    } catch (erro) {
        // Duas requisições ao mesmo tempo podem passar pela verificação
        if (erroDeDuplicidade(erro)) {
            return res.status(400).json({
                erro: "E-mail ou login já cadastrado!"
            });
        }

        console.error("Erro ao cadastrar usuário:", erro);

        return res.status(500).json({
            erro: "Erro interno ao cadastrar usuário."
        });
    }
});

// ROTA 2: Listar usuários
router.get("/", (req, res) => {
    try {
        const resultado = db.exec(
            "SELECT id, nome, email, login, ativo FROM usuarios"
        );

        let usuarios = [];

        if (resultado.length > 0) {
            const colunas = resultado[0].columns;

            usuarios = resultado[0].values.map((linha) => {
                const usuario = {};

                colunas.forEach((coluna, indice) => {
                    usuario[coluna] = linha[indice];
                });

                usuario.ativo = Boolean(usuario.ativo);

                return usuario;
            });
        }

        return res.status(200).json(usuarios);

    } catch (erro) {
        console.error("Erro ao listar usuários:", erro);

        return res.status(500).json({
            erro: "Erro interno ao listar usuários."
        });
    }
});

// ROTA 3: Buscar usuário pelo ID
router.get("/:id", (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(404).json({
                erro: "Usuário não encontrado!"
            });
        }

        const usuario = buscarUsuario(id);

        if (!usuario) {
            return res.status(404).json({
                erro: "Usuário não encontrado!"
            });
        }

        return res.status(200).json(dadosPublicos(usuario));

    } catch (erro) {
        console.error("Erro ao buscar usuário:", erro);

        return res.status(500).json({
            erro: "Erro interno ao buscar usuário."
        });
    }
});

// ROTA 4: Atualizar usuário
router.patch("/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(404).json({
                erro: "Usuário não encontrado!"
            });
        }

        const usuario = buscarUsuario(id);

        if (!usuario) {
            return res.status(404).json({
                erro: "Usuário não encontrado!"
            });
        }

        if (!corpoValido(req.body)) {
            return res.status(400).json({
                erro: "Envie os dados para atualização em formato válido!"
            });
        }

        const { nome, email, login, senha, ativo } = req.body;

        // Verificando os tipos dos campos enviados
        if (
            (nome !== undefined && typeof nome !== "string") ||
            (email !== undefined && typeof email !== "string") ||
            (login !== undefined && typeof login !== "string") ||
            (senha !== undefined && typeof senha !== "string") ||
            (ativo !== undefined && typeof ativo !== "boolean")
        ) {
            return res.status(400).json({
                erro: "Um ou mais campos possuem formato inválido!"
            });
        }

        // Mantendo os dados antigos quando um campo não for enviado
        const novoNome = nome === undefined
            ? usuario.nome
            : nome.trim();

        // E-mail sempre em minúsculas
        const novoEmail = email === undefined
            ? usuario.email.toLowerCase()
            : email.trim().toLowerCase();

        const novoLogin = login === undefined
            ? usuario.login
            : login.trim();

        // Validando o nome
        if (novoNome.length < 3) {
            return res.status(400).json({
                erro: "O nome deve ter pelo menos 3 caracteres!"
            });
        }

        // Validando o e-mail
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(novoEmail)) {
            return res.status(400).json({
                erro: "Digite um e-mail válido!"
            });
        }

        // Validando o login
        if (novoLogin.length < 3) {
            return res.status(400).json({
                erro: "O login deve ter pelo menos 3 caracteres!"
            });
        }

        // Verificando se o e-mail já está cadastrado
        if (verificarDuplicidade("email", novoEmail, id)) {
            return res.status(400).json({
                erro: "Este e-mail já está cadastrado!"
            });
        }

        // Verificando se o login já está cadastrado
        if (verificarDuplicidade("login", novoLogin, id)) {
            return res.status(400).json({
                erro: "Este login já está cadastrado!"
            });
        }

        // Validando a senha, caso uma nova seja enviada
        if (senha !== undefined && senha.length < 8) {
            return res.status(400).json({
                erro: "A senha deve ter pelo menos 8 caracteres!"
            });
        }

        // Mantendo a senha antiga se uma nova não for enviada
        let novaSenhaHash = usuario.senha;

        if (senha !== undefined) {
            novaSenhaHash = await bcrypt.hash(senha, 10);
        }

        // Mantendo o status antigo se não for enviado
        const novoStatus = ativo === undefined
            ? usuario.ativo
            : (ativo ? 1 : 0);

        // Atualizando os dados no banco
        db.run(
            `UPDATE usuarios
             SET nome = ?, email = ?, login = ?, senha = ?, ativo = ?
             WHERE id = ?`,
            [
                novoNome,
                novoEmail,
                novoLogin,
                novaSenhaHash,
                novoStatus,
                id
            ]
        );

        // Salvando as alterações
        salvarBanco();

        const usuarioAtualizado = buscarUsuario(id);

        return res.status(200).json(dadosPublicos(usuarioAtualizado));

    } catch (erro) {
        // Duas requisições ao mesmo tempo podem passar pela verificação
        if (erroDeDuplicidade(erro)) {
            return res.status(400).json({
                erro: "E-mail ou login já cadastrado!"
            });
        }

        console.error("Erro ao atualizar usuário:", erro);

        return res.status(500).json({
            erro: "Erro interno ao atualizar usuário."
        });
    }
});

// ROTA 5: Excluir usuário
router.delete("/:id", (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(404).json({
                erro: "Usuário não encontrado!"
            });
        }

        const usuario = buscarUsuario(id);

        if (!usuario) {
            return res.status(404).json({
                erro: "Usuário não encontrado!"
            });
        }

        // Excluindo o usuário do banco
        db.run(
            "DELETE FROM usuarios WHERE id = ?",
            [id]
        );

        salvarBanco();

        return res.status(200).json({
            mensagem: "Usuário excluído com sucesso!"
        });

    } catch (erro) {
        console.error("Erro ao excluir usuário:", erro);

        return res.status(500).json({
            erro: "Erro interno ao excluir usuário."
        });
    }
});

// Exportando as rotas
export default router;
