🤖 Mofobot Sense - Sistema Integrado IoT

O Mofobot é um sistema IoT Full Stack desenvolvido para monitorar ambientes e prevenir a proliferação de mofo. Através de sensores de hardware e uma aplicação web em tempo real, o sistema identifica níveis críticos de umidade e qualidade do ar, permitindo ações preventivas antes que os danos ocorram.

Este projeto não apenas coleta dados, mas possui comunicação bidirecional, permitindo que o usuário calibre os limiares de alerta do hardware diretamente pelo navegador.
🚀 Principais Funcionalidades

    Monitoramento em Tempo Real: Leitura contínua de umidade (DHT11) e gases (MQ-2).
    Dashboard Interativo: Interface gráfica com painéis de alerta dinâmicos e gráficos de histórico.
    Comunicação Bidirecional via MQTT: Ajuste de limiares de alerta enviados do Frontend (React) para o Backend (Node.js), que repassa a configuração diretamente para o hardware (ESP32) em tempo real.
    Persistência de Dados: Armazenamento de histórico de leituras na nuvem.

🛠️ Tecnologias Utilizadas

Hardware (Edge)

    Placa: ESP32
    Sensores: DHT11 (Umidade/Temperatura) e MQ-2 (Gases)
    Linguagem: C/C++ (Arduino IDE / PlatformIO)

Backend (Servidor & API)

    Node.js com Express
    MQTT.js (Integração com o Broker MQTT)
    MongoDB Atlas + Mongoose (Banco de Dados em Nuvem)

Frontend (Aplicação Web)

    React.js
    Axios (Consumo de API REST)
    Componentização e Hooks (useState, useEffect)

⚙️ Como Executar o Projeto
1. Configurando o Backend

Navegue até a pasta backend e instale as dependências:

cd backend
npm install

Crie um arquivo .env na pasta backend e adicione sua string de conexão com o banco (ex: MONGO_URI=...). Em seguida, inicie o servidor:

npm start

2. Configurando o Frontend

Abra um novo terminal, navegue até a pasta frontend e instale as dependências:

cd frontend
npm install

Inicie a aplicação React:

npm start

A aplicação abrirá automaticamente no seu navegador em http://localhost:3000.
3. Hardware

Carregue o código fonte (arquivos .ino ou .cpp) no seu ESP32, garantindo que as credenciais de Wi-Fi e o endereço do Broker MQTT estejam configurados corretamente para o seu ambiente.

Desenvolvido como Projeto Integrador no curso de Análise e Desenvolvimento de Sistemas (ADS).