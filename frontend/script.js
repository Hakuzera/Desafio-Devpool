
// Encontrando o título da página
const titulo = document.querySelector("h1");

titulo.textContent = "Gerenciamento de Usuários";

// Encontrando os campos do formulário
const campoNome = document.querySelector("#nome");
const campoEmail = document.querySelector("#email");
const campoLogin = document.querySelector("#login");
const campoSenha = document.querySelector("#senha");
const campoAtivo = document.querySelector("#ativo");

// Encontrando os elementos da página
const listaUsuarios = document.querySelector("#listaUsuarios");
const botaoCadastrar = document.querySelector("#btnCadastrar");
const mensagem = document.querySelector("#mensagem");

// Criando o array que guarda os usuários
const usuarios = [];

// Variável para identificar se estamos editando alguém
let indiceEdicao = -1;

// Função para mostrar os usuários na tela
function exibirUsuarios() {

    // Limpa a lista antes de mostrar novamente
    listaUsuarios.textContent = "";

    // Percorre todos os usuários cadastrados
    for (let i = 0; i < usuarios.length; i++) {

        // Cria um espaço para mostrar os dados
        const paragrafo = document.createElement("p");

        // Verifica o status do usuário
        let status = "Inativo";

        if (usuarios[i].ativo) {
            status = "Ativo";
        }

        // Mostra as informações do usuário
        paragrafo.textContent =
            usuarios[i].nome + " - " +
            usuarios[i].email + " - " +
            usuarios[i].login + " - " +
            status;

        // Cria o botão de editar
        const botaoEditar = document.createElement("button");

        botaoEditar.textContent = "Editar";

        // Quando clicar, carrega os dados para edição
        botaoEditar.addEventListener("click", function() {

            campoNome.value = usuarios[i].nome;
            campoEmail.value = usuarios[i].email;
            campoLogin.value = usuarios[i].login;
            campoAtivo.checked = usuarios[i].ativo;

            // Guarda o índice do usuário que será editado
            indiceEdicao = i;

            // Altera o texto do botão
            botaoCadastrar.textContent = "Salvar alterações";

            mensagem.textContent = "Editando usuário: " + usuarios[i].nome;
        });

        // Cria o botão de excluir
        const botaoExcluir = document.createElement("button");

        botaoExcluir.textContent = "Excluir";

        // Quando clicar, remove o usuário
        botaoExcluir.addEventListener("click", function() {

            usuarios.splice(i, 1);

            exibirUsuarios();

            mensagem.textContent = "Usuário excluído com sucesso!";
        });

        // Adiciona os botões na página
        paragrafo.appendChild(botaoEditar);
        paragrafo.appendChild(botaoExcluir);

        // Adiciona o usuário na lista
        listaUsuarios.appendChild(paragrafo);
    }
}

// Detectando o clique no botão de cadastro
botaoCadastrar.addEventListener("click", function() {

    // Pegando os valores digitados
    const nomeDigitado = campoNome.value.trim();
    const emailDigitado = campoEmail.value.trim();
    const loginDigitado = campoLogin.value.trim();
    const senhaDigitada = campoSenha.value;

    // Verificando se a opção de usuário ativo está marcada
    const usuarioAtivo = campoAtivo.checked;

    // Variáveis para verificar duplicidade
    let emailJaCadastrado = false;
    let loginJaCadastrado = false;

    // Percorrendo os usuários cadastrados
    for (let i = 0; i < usuarios.length; i++) {

        // Não compara o usuário com ele mesmo durante a edição
        if (i !== indiceEdicao) {

            if (usuarios[i].email === emailDigitado) {
                emailJaCadastrado = true;
            }

            if (usuarios[i].login === loginDigitado) {
                loginJaCadastrado = true;
            }
        }
    }

    // Validando o nome
    if (nomeDigitado === "") {

        mensagem.textContent = "Preencha o nome!";

    } else if (nomeDigitado.length < 3) {

        mensagem.textContent = "O nome deve ter pelo menos 3 caracteres!";

    // Validando o e-mail
    } else if (emailDigitado === "") {

        mensagem.textContent = "Preencha o e-mail!";

    } else if (!emailDigitado.includes("@") || !emailDigitado.includes(".")) {

        mensagem.textContent = "Digite um e-mail válido!";

    } else if (emailJaCadastrado) {

        mensagem.textContent = "Este e-mail já está cadastrado!";

    // Validando o login
    } else if (loginDigitado === "") {

        mensagem.textContent = "Preencha o login!";

    } else if (loginDigitado.length < 3) {

        mensagem.textContent = "O login deve ter pelo menos 3 caracteres!";

    } else if (loginJaCadastrado) {

        mensagem.textContent = "Este login já está cadastrado!";

    // Validando a senha apenas durante o cadastro
    } else if (indiceEdicao === -1 && senhaDigitada === "") {

        mensagem.textContent = "Preencha a senha!";

    } else if (indiceEdicao === -1 && senhaDigitada.length < 8) {

        mensagem.textContent = "A senha deve ter pelo menos 8 caracteres!";

    } else {

        // Verifica se estamos editando ou cadastrando
        if (indiceEdicao === -1) {

            // Criando um novo usuário
            usuarios.push({
                nome: nomeDigitado,
                email: emailDigitado,
                login: loginDigitado,
                ativo: usuarioAtivo
            });

            mensagem.textContent = "Usuário cadastrado com sucesso!";

        } else {

            // Atualizando os dados do usuário
            usuarios[indiceEdicao].nome = nomeDigitado;
            usuarios[indiceEdicao].email = emailDigitado;
            usuarios[indiceEdicao].login = loginDigitado;
            usuarios[indiceEdicao].ativo = usuarioAtivo;

            mensagem.textContent = "Usuário atualizado com sucesso!";

            // Finaliza o modo de edição
            indiceEdicao = -1;

            botaoCadastrar.textContent = "Cadastrar";
        }

        // Atualiza a lista na tela
        exibirUsuarios();

        // Limpa os campos
        campoNome.value = "";
        campoEmail.value = "";
        campoLogin.value = "";
        campoSenha.value = "";

        // Deixa a opção ativo marcada novamente
        campoAtivo.checked = true;
    }
});
