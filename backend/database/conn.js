const mongoose = require("mongoose");

async function main() {
    try {
        // COLOQUE SUA STRING DE CONEXÃO AQUI DENTRO DAS ASPAS
        // Exemplo: await mongoose.connect("mongodb+srv://usuario:senha@cluster.mongodb.net/mofobot");
        
        await mongoose.connect("mongodb+srv://usuario:<SENHA_AQUI>@cluster...");
        
        console.log("Banco de Dados Conectado com Sucesso!");
    } catch (error) {
        console.log(`Erro ao conectar: ${error}`);
    }
}

module.exports = main;