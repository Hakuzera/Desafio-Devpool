
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

// ROTA 1: Cadastrar usuário
router.post("/", async (req, res) => {

    const { nome, email, login, senha, ativo } = req.body;

    // Verificando os campos obrigatórios
    if (!nome || !email || !login || !senha) {
        return res.status(400).json({
            erro: "Preencha todos os campos obrigatórios!"
        });
    }

    // Verificando o tamanho do nome
    if (nome.trim().length < 3) {
        return res.status(400).json({
            erro: "O nome deve ter pelo menos 3 caracteres!"
        });
    }

    // Verificando o formato do e-mail
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({
            erro: "Digite um e-mail válido!"
        });
    }

    // Verificando o tamanho do login
    if (login.trim().length < 3) {
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
    if (verificarDuplicidade("email", email.trim())) {
        return res.status(400).json({
            erro: "Este e-mail já está cadastrado!"
        });
    }

    // Verificando se o login já está cadastrado
    if (verificarDuplicidade("login", login.trim())) {
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
            nome.trim(),
            email.trim(),
            login.trim(),
            senhaHash,
            ativo === undefined || ativo ? 1 : 0
        ]
    );

    // Salvando as alterações no arquivo SQLite
    salvarBanco();

    // Buscando o usuário criado
    const id = db.exec("SELECT last_insert_rowid() AS id")[0].values[0][0];

    const usuario = buscarUsuario(id);

    // Respondendo sem enviar a senha
    res.status(201).json(dadosPublicos(usuario));

});

// ROTA 2: Listar usuários
router.get("/", (req, res) => {

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

    res.status(200).json(usuarios);

});

// ROTA 3: Buscar usuário pelo ID
router.get("/:id", (req, res) => {

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

    res.status(200).json(dadosPublicos(usuario));

});

// ROTA 4: Atualizar usuário
router.patch("/:id", async (req, res) => {

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

    const { nome, email, login, senha, ativo } = req.body;

    // Mantendo os dados antigos quando um campo não for enviado
    const novoNome = nome === undefined ? usuario.nome : nome.trim();
    const novoEmail = email === undefined ? usuario.email : email.trim();
    const novoLogin = login === undefined ? usuario.login : login.trim();

    if (typeof novoNome !== "string" || novoNome.length < 3) {
        return res.status(400).json({
            erro: "O nome deve ter pelo menos 3 caracteres!"
        });
    }

    if (
        typeof novoEmail !== "string" ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(novoEmail)
    ) {
        return res.status(400).json({
            erro: "Digite um e-mail válido!"
        });
    }

    if (typeof novoLogin !== "string" || novoLogin.length < 3) {
        return res.status(400).json({
            erro: "O login deve ter pelo menos 3 caracteres!"
        });
    }

    if (verificarDuplicidade("email", novoEmail, id)) {
        return res.status(400).json({
            erro: "Este e-mail já está cadastrado!"
        });
    }

    if (verificarDuplicidade("login", novoLogin, id)) {
        return res.status(400).json({
            erro: "Este login já está cadastrado!"
        });
    }

    if (ativo !== undefined && typeof ativo !== "boolean") {
        return res.status(400).json({
            erro: "O campo ativo deve ser verdadeiro ou falso!"
        });
    }

    if (senha !== undefined && (typeof senha !== "string" || senha.length < 8)) {
        return res.status(400).json({
            erro: "A senha deve ter pelo menos 8 caracteres!"
        });
    }

    // Mantendo a senha antiga se uma nova não for enviada
    let novaSenhaHash = usuario.senha;

    if (senha !== undefined) {
        novaSenhaHash = await bcrypt.hash(senha, 10);
    }

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

    salvarBanco();

    const usuarioAtualizado = buscarUsuario(id);

    res.status(200).json(dadosPublicos(usuarioAtualizado));

});

// ROTA 5: Excluir usuário
router.delete("/:id", (req, res) => {

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
    db.run("DELETE FROM usuarios WHERE id = ?", [id]);

    salvarBanco();

    res.status(200).json({
        mensagem: "Usuário excluído com sucesso!"
    });

});

// Exportando as rotas
export default router;
