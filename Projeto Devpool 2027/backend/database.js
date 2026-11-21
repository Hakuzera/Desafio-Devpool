
// Importando as ferramentas necessárias
import initSqlJs from "sql.js";
import fs from "node:fs";

// Definindo o caminho do arquivo do banco
const caminhoBanco = "./backend/database.sqlite";

// Inicializando o SQLite
const SQL = await initSqlJs({
    locateFile: (arquivo) => "./node_modules/sql.js/dist/" + arquivo
});

// Verificando se o banco já existe
let db;

if (fs.existsSync(caminhoBanco)) {

    // Carregando o banco existente
    const dados = fs.readFileSync(caminhoBanco);

    db = new SQL.Database(dados);

} else {

    // Criando um novo banco
    db = new SQL.Database();

}

// Criando a tabela de usuários
db.run(`
    CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        login TEXT UNIQUE NOT NULL,
        senha TEXT NOT NULL,
        ativo INTEGER NOT NULL DEFAULT 1
    )
`);

// Função para salvar as alterações no arquivo
function salvarBanco() {

    const dados = db.export();

    fs.writeFileSync(caminhoBanco, Buffer.from(dados));

}

// Salvando o banco inicialmente
salvarBanco();

// Exportando o banco e a função de salvamento
export { db, salvarBanco };
