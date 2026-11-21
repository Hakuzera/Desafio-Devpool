const API_URL = "/users";

const formulario = document.getElementById("formUsuario");
const listaUsuarios = document.getElementById("listaUsuarios");
const mensagem = document.getElementById("mensagem");

const campoNome = document.getElementById("nome");
const campoEmail = document.getElementById("email");
const campoLogin = document.getElementById("login");
const campoSenha = document.getElementById("senha");
const campoAtivo = document.getElementById("ativo");

const botaoCadastrar = document.getElementById("btnCadastrar");

// Botão para cancelar a edição (criado aqui, aparece só ao editar)
const botaoCancelar = document.createElement("button");
botaoCancelar.type = "button";
botaoCancelar.textContent = "Cancelar edição";
botaoCancelar.classList.add("botaoCancelar");
botaoCancelar.hidden = true;
botaoCadastrar.after(botaoCancelar);

let idEdicao = null;

// Exibe mensagens na tela
function mostrarMensagem(texto, tipo = "") {
    mensagem.textContent = texto;
    mensagem.className = tipo;
}

// Faz requisições para a API
async function requisicaoAPI(url, metodo = "GET", dados = null) {
    const configuracao = {
        method: metodo,
        headers: {
            "Content-Type": "application/json"
        }
    };

    if (dados !== null) {
        configuracao.body = JSON.stringify(dados);
    }

    let resposta;

    // Se o backend estiver desligado, o fetch falha
    try {
        resposta = await fetch(url, configuracao);
    } catch (erro) {
        throw new Error(
            "Não foi possível conectar ao servidor. Verifique se o backend está em execução."
        );
    }

    // A resposta pode vir sem JSON (ex.: erro do proxy)
    let resultado = null;

    try {
        resultado = await resposta.json();
    } catch (erro) {
        resultado = null;
    }

    if (!resposta.ok) {
        const textoErro = resultado && (resultado.erro || resultado.mensagem);

        throw new Error(textoErro || "Ocorreu um erro na requisição.");
    }

    return resultado;
}

// Limpa o formulário
function limparFormulario() {
    formulario.reset();

    campoAtivo.checked = true;
    campoSenha.required = false;

    idEdicao = null;

    botaoCadastrar.textContent = "Cadastrar";
    botaoCancelar.hidden = true;
}

// Carrega os usuários cadastrados
async function carregarUsuarios() {
    listaUsuarios.innerHTML = "<p>Carregando usuários...</p>";

    try {
        const usuarios = await requisicaoAPI(API_URL);

        listaUsuarios.innerHTML = "";

        if (!Array.isArray(usuarios) || usuarios.length === 0) {
            listaUsuarios.innerHTML = "<p>Nenhum usuário cadastrado.</p>";
            return;
        }

        usuarios.forEach((usuario) => {
            const elemento = document.createElement("div");
            elemento.classList.add("usuario");

            const nome = document.createElement("h3");
            nome.textContent = usuario.nome;

            const email = document.createElement("p");
            email.textContent = "E-mail: " + usuario.email;

            const login = document.createElement("p");
            login.textContent = "Login: " + usuario.login;

            const status = document.createElement("p");
            status.textContent = usuario.ativo ? "Ativo" : "Inativo";

            const botoes = document.createElement("div");
            botoes.classList.add("botoes");

            const botaoEditar = document.createElement("button");
            botaoEditar.textContent = "Editar";

            botaoEditar.addEventListener("click", () => {
                editarUsuario(usuario);
            });

            const botaoExcluir = document.createElement("button");
            botaoExcluir.textContent = "Excluir";
            botaoExcluir.classList.add("botaoExcluir");

            botaoExcluir.addEventListener("click", () => {
                excluirUsuario(usuario.id, botaoExcluir);
            });

            botoes.appendChild(botaoEditar);
            botoes.appendChild(botaoExcluir);

            elemento.appendChild(nome);
            elemento.appendChild(email);
            elemento.appendChild(login);
            elemento.appendChild(status);
            elemento.appendChild(botoes);

            listaUsuarios.appendChild(elemento);
        });

    } catch (erro) {
        listaUsuarios.innerHTML = "<p>Não foi possível carregar os usuários.</p>";
        mostrarMensagem(erro.message, "erro");
    }
}

// Preenche o formulário para edição
function editarUsuario(usuario) {
    idEdicao = usuario.id;

    campoNome.value = usuario.nome;
    campoEmail.value = usuario.email;
    campoLogin.value = usuario.login;
    campoSenha.value = "";
    campoAtivo.checked = usuario.ativo;

    campoSenha.required = false;

    botaoCadastrar.textContent = "Salvar alterações";
    botaoCancelar.hidden = false;

    mostrarMensagem(
        "Editando usuário. Deixe a senha em branco para mantê-la.",
        "sucesso"
    );

    formulario.scrollIntoView({
        behavior: "smooth"
    });
}

// Exclui um usuário
async function excluirUsuario(id, botao) {
    const confirmar = confirm("Tem certeza que deseja excluir este usuário?");

    if (!confirmar) {
        return;
    }

    // Feedback de carregamento durante a exclusão
    botao.disabled = true;
    botao.textContent = "Excluindo...";

    try {
        await requisicaoAPI(`${API_URL}/${id}`, "DELETE");

        // Se estava editando esse usuário, cancela a edição
        if (idEdicao === id) {
            limparFormulario();
        }

        mostrarMensagem("Usuário excluído com sucesso!", "sucesso");

        await carregarUsuarios();

    } catch (erro) {
        mostrarMensagem(erro.message, "erro");

        botao.disabled = false;
        botao.textContent = "Excluir";
    }
}

// Cancela a edição
botaoCancelar.addEventListener("click", () => {
    limparFormulario();

    mostrarMensagem("Edição cancelada.", "sucesso");
});

// Cadastra ou atualiza um usuário
botaoCadastrar.addEventListener("click", async () => {
    const nome = campoNome.value.trim();
    const email = campoEmail.value.trim();
    const login = campoLogin.value.trim();
    const senha = campoSenha.value;
    const ativo = campoAtivo.checked;

    if (nome.length < 3) {
        mostrarMensagem("O nome precisa ter pelo menos 3 caracteres.", "erro");
        return;
    }

    if (!email || !campoEmail.checkValidity()) {
        mostrarMensagem("Informe um e-mail válido.", "erro");
        return;
    }

    if (login.length < 3) {
        mostrarMensagem("O login precisa ter pelo menos 3 caracteres.", "erro");
        return;
    }

    if (idEdicao === null && senha.length < 8) {
        mostrarMensagem("A senha precisa ter pelo menos 8 caracteres.", "erro");
        return;
    }

    if (senha.length > 0 && senha.length < 8) {
        mostrarMensagem("A senha precisa ter pelo menos 8 caracteres.", "erro");
        return;
    }

    const dadosUsuario = {
        nome,
        email,
        login,
        ativo
    };

    if (senha.length > 0) {
        dadosUsuario.senha = senha;
    }

    const metodo = idEdicao === null ? "POST" : "PATCH";
    const url = idEdicao === null ? API_URL : `${API_URL}/${idEdicao}`;

    botaoCadastrar.disabled = true;
    botaoCancelar.disabled = true;
    botaoCadastrar.textContent = "Salvando...";

    try {
        await requisicaoAPI(url, metodo, dadosUsuario);

        mostrarMensagem(
            idEdicao === null
                ? "Usuário cadastrado com sucesso!"
                : "Usuário atualizado com sucesso!",
            "sucesso"
        );

        limparFormulario();

        await carregarUsuarios();

    } catch (erro) {
        mostrarMensagem(erro.message, "erro");

    } finally {
        botaoCadastrar.disabled = false;
        botaoCancelar.disabled = false;

        if (idEdicao === null) {
            botaoCadastrar.textContent = "Cadastrar";
        } else {
            botaoCadastrar.textContent = "Salvar alterações";
        }
    }
});

// Carrega a lista ao abrir a página
carregarUsuarios();
