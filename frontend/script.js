// Aguarda o carregamento completo do DOM antes de executar o script
document.addEventListener('DOMContentLoaded', () => {
    // === Inicialização dos elementos da interface (botões, seções, formulários, etc.) ===
    
    // Botões da tela inicial
    const souProfissionalButton = document.getElementById('sou-profissional');
    const buscoProfissionalButton = document.getElementById('busco-profissional');
    const initialScreen = document.getElementById('initial-screen');

    // Botões da barra de navegação
    const souProfissionalNavButton = document.getElementById('sou-profissional-nav');
    const buscoProfissionalNavButton = document.getElementById('busco-profissional-nav');
    const voltarInicialNavButton = document.getElementById('voltar-inicial-nav');

    // Login do profissional
    const profissionalLoginForm = document.getElementById('profissional-login-form');
    const profissionalLoginSection = document.getElementById('profissional-login');
    const profissionalRegisterButton = document.getElementById('profissional-register');
    const voltarInicialProfissionalLoginButton = document.getElementById('voltar-inicial-profissional-login');

    // Registro do profissional
    const registerProfissionalFormSection = document.getElementById('profissional-register-form');
    const registerProfissionalForm = document.getElementById('register-profissional-form');
    const voltarLoginButton = document.getElementById('voltar-login');

    // Painel (dashboard) do profissional logado
    const profissionalDashboardSection = document.getElementById('profissional-dashboard');
    const profissionalNomeExibicao = document.getElementById('profissional-nome-exibicao');
    const profissionalNomeValor = document.getElementById('profissional-nome-valor');
    const profissionalTelefoneValor = document.getElementById('profissional-telefone-valor');
    const profissionalCidadeValor = document.getElementById('profissional-cidade-valor');
    const profissionalEspecialidadeValor = document.getElementById('profissional-especialidade-valor');
    const profissionalRegistroValor = document.getElementById('profissional-registro-valor');
    const editarDadosButton = document.getElementById('editar-dados');
    const logoutProfissionalButton = document.getElementById('logout-profissional');
    const excluirCadastroButton = document.getElementById('excluir-cadastro');

    // Formulário de edição dos dados do profissional
    const editarProfissionalFormSection = document.getElementById('editar-profissional-form');
    const editarRegisterProfissionalForm = document.getElementById('editar-register-profissional-form');
    const cancelarEdicaoButton = document.getElementById('cancelar-edicao');

    // Tela de busca de profissionais (usuário)
    const usuarioBuscaSection = document.getElementById('usuario-busca');
    const buscaProfissionalForm = document.getElementById('busca-profissional-form');
    const voltarInicialBuscaButton = document.getElementById('voltar-inicial-busca');
    const resultadosBuscaSection = document.getElementById('resultados-busca');
    const listaProfissionais = document.getElementById('lista-profissionais');

    // Login e Registro do usuário comum (usuário que busca profissionais)
    const usuarioLoginSection = document.getElementById('usuario-login');
    const usuarioLoginForm = document.getElementById('usuario-login-form');
    const usuarioRegisterButton = document.getElementById('usuario-register');
    const voltarInicialUsuarioLoginButton = document.getElementById('voltar-inicial-usuario-login');

    const usuarioRegisterFormSection = document.getElementById('usuario-register-form');
    const registerUsuarioForm = document.getElementById('register-usuario-form');
    const voltarLoginUsuarioButton = document.getElementById('voltar-login-usuario');

    // Conexão com o Socket.IO
    const socket = io(); // Conecta ao servidor Socket.IO

    let profissionalLogado = null;
    let usuarioLogado = null;
    let profissionalIdSelecionado = null;  // Armazena o ID do profissional escolhido pelo usuário

// Verifique se o 'profissionalIdSelecionado' está sendo atribuído corretamente
document.getElementById('lista-profissionais').addEventListener('click', function(event) {
    if (event.target.classList.contains('chat-button')) {
        profissionalIdSelecionado = event.target.dataset.profissionalId;
        iniciarChatComProfissional(profissionalIdSelecionado);
    }
});

    // Envia a mensagem para o Socket.IO
document.getElementById('user-chat-send-button').addEventListener('click', () => {
    const message = document.getElementById('user-chat-message-input').value;

    if (message.trim() !== "" && profissionalIdSelecionado) {
        socket.emit('send_message', { fromUserId: usuarioLogado.id, toProfessionalId: profissionalIdSelecionado, message });
        exibirMensagemNoChat('Você: ' + message, 'sent');
        document.getElementById('user-chat-message-input').value = ''; // Limpa o campo
    } else {
        alert("Digite uma mensagem para enviar.");
    }
});

    // Exibe a mensagem no chat
    function exibirMensagemNoChat(message, type) {
    const messageContainer = document.getElementById('user-chat-messages');
    const newMessage = document.createElement('div');
    newMessage.classList.add('message', type); // 'sent' ou 'received'
    newMessage.textContent = message;
    messageContainer.appendChild(newMessage);
    messageContainer.scrollTop = messageContainer.scrollHeight;
}

// Verifique se o profissional está recebendo as mensagens também
socket.on('receive_message', (data) => {
    const { fromUserId, message } = data;
    exibirMensagemNoChat('Profissional: ' + message, 'received');
});

    // Função para login do usuário ou profissional
    function login(userId, type) {
        socket.emit('login', { userId, type });
        
        // Exibe a seção de chat para o usuário
        if (type === 'user') {
            document.getElementById('chat-section').classList.remove('hidden'); 
        }
        
        // Exibe a tela de chat para o profissional
        if (type === 'professional') {
            document.getElementById('professional-chat-section').classList.remove('hidden');
            profissionalLogado = { id: userId };  
        }
    }

    // Função para selecionar o profissional e abrir o chat
    document.getElementById('lista-profissionais').addEventListener('click', function(event) {
        if (event.target.classList.contains('chat-button')) {
            profissionalIdSelecionado = event.target.dataset.profissionalId;
            iniciarChatComProfissional(profissionalIdSelecionado);
        }
    });

    function iniciarChatComProfissional(profissionalId) {
        console.log(`Iniciando chat com o profissional de ID: ${profissionalId}`);
        document.getElementById('chat-section').classList.remove('hidden');
        profissionalIdSelecionado = profissionalId;
    }

    // Fechar o chat
    document.getElementById('user-chat-close-button').addEventListener('click', () => {
        document.getElementById('chat-section').classList.add('hidden');
    });

    document.getElementById('professional-chat-close-button').addEventListener('click', () => {
        document.getElementById('professional-chat-section').classList.add('hidden');
    });

    // Simulação de login
    document.getElementById('profissional-login-form').addEventListener('submit', (event) => {
        event.preventDefault();
        login(1, 'professional'); // Exemplo de login para o profissional
    });

    document.getElementById('usuario-login-form').addEventListener('submit', (event) => {
        event.preventDefault();
        login(2, 'user'); // Exemplo de login para o usuário
    });

    

    // === Funções para exibir diferentes seções da interface ===
    function showSection(section) {
        document.querySelectorAll('section').forEach(sec => sec.classList.add('hidden'));
        section.classList.remove('hidden');
    }

    // Verifica se há profissional logado
    function checkLogin() {
        const logado = localStorage.getItem('logado');
        if (logado) {
            profissionalLogado = JSON.parse(logado);
            showProfissionalDashboard(profissionalLogado);
        }
    }

    // Verifica se há usuário logado
    function checkUsuarioLogin() {
        const usuarioLogadoData = localStorage.getItem('usuarioLogado');
        if (usuarioLogadoData) {
            usuarioLogado = JSON.parse(usuarioLogadoData);
            showUsuarioBusca(); // Vai direto para tela de busca
        }
    }

    // Exibe tela de busca para o usuário
    function showUsuarioBusca() {
        showSection(usuarioBuscaSection);
    }

    // Exibe o dashboard com os dados do profissional logado
    function showProfissionalDashboard(profissional) {
        profissionalNomeExibicao.textContent = profissional.nome;
        profissionalNomeValor.textContent = profissional.nome;
        profissionalTelefoneValor.textContent = profissional.telefone;
        profissionalCidadeValor.textContent = profissional.cidade;
        profissionalEspecialidadeValor.textContent = profissional.especialidade;
        profissionalRegistroValor.textContent = profissional.registro;
        showSection(profissionalDashboardSection);
    }

    // === Eventos: botões da tela inicial ===
    souProfissionalButton.addEventListener('click', () => {
        showSection(profissionalLoginSection);
    });

    buscoProfissionalButton.addEventListener('click', () => {
        showSection(usuarioLoginSection);
    });

    // === Eventos: barra de navegação ===
    souProfissionalNavButton.addEventListener('click', () => {
        showSection(profissionalLoginSection);
    });

    buscoProfissionalNavButton.addEventListener('click', () => {
        showSection(usuarioLoginSection);
    });

    voltarInicialNavButton.addEventListener('click', () => {
        showSection(initialScreen);
    });

    // === Login do profissional ===
    profissionalLoginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const email = document.getElementById('profissional-login-email').value;
        const senha = document.getElementById('profissional-login-password').value;

        const response = await fetch('http://localhost:5000/api/professionals/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha }),
        });

        if (response.ok) {
            const profissional = await response.json();
            localStorage.setItem('logado', JSON.stringify(profissional));
            profissionalLogado = profissional;
            showProfissionalDashboard(profissional);
        } else {
            alert('Credenciais inválidas.');
        }
    });

    profissionalRegisterButton.addEventListener('click', () => {
        showSection(registerProfissionalFormSection);
    });

    voltarInicialProfissionalLoginButton.addEventListener('click', () => {
        showSection(initialScreen);
    });

    // === Cadastro do profissional ===
    registerProfissionalForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const nome = document.getElementById('profissional-nome').value;
        const telefone = document.getElementById('profissional-telefone').value;
        const email = document.getElementById('profissional-email').value;
        const cidade = document.getElementById('profissional-cidade').value;
        const especialidade = document.getElementById('profissional-especialidade').value;
        const registro = document.getElementById('profissional-registro').value;
        const senha = document.getElementById('profissional-senha').value;

        const response = await fetch('http://localhost:5000/api/professionals/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, telefone, email, cidade, especialidade, registro, senha }),
        });

        if (response.ok) {
            alert('Cadastro realizado com sucesso!');
            showSection(profissionalLoginSection);
        } else {
            alert('Erro ao cadastrar profissional.');
        }
    });

    voltarLoginButton.addEventListener('click', () => {
        showSection(profissionalLoginSection);
    });

    // === Edição dos dados do profissional ===
    editarDadosButton.addEventListener('click', () => {
        showSection(editarProfissionalFormSection);
        // Preenchendo os campos com os dados do profissional
        document.getElementById('editar-profissional-nome').value = profissionalLogado.nome;
        document.getElementById('editar-profissional-email').value = profissionalLogado.email;
        document.getElementById('editar-profissional-telefone').value = profissionalLogado.telefone;
        document.getElementById('editar-profissional-cidade').value = profissionalLogado.cidade;
        document.getElementById('editar-profissional-especialidade').value = profissionalLogado.especialidade;
        document.getElementById('editar-profissional-registro').value = profissionalLogado.registro;
    });

    cancelarEdicaoButton.addEventListener('click', () => {
        showProfissionalDashboard(profissionalLogado);
    });

    editarRegisterProfissionalForm.addEventListener('submit', async (event) => {
        event.preventDefault(); 
        // Coletar os dados atualizados
        const updatedData = {
            nome: document.getElementById('editar-profissional-nome').value,
            email: document.getElementById('editar-profissional-email').value,
            senha: document.getElementById('editar-profissional-senha').value,
            telefone: document.getElementById('editar-profissional-telefone').value,
            cidade: document.getElementById('editar-profissional-cidade').value,
            especialidade: document.getElementById('editar-profissional-especialidade').value,
            registro: document.getElementById('editar-profissional-registro').value
        };

        const profissionalId = profissionalLogado.id;  

        try {
            const response = await fetch(`http://localhost:5000/api/professionals/${profissionalId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData),
            });

            if (!response.ok) {
                throw new Error('Erro ao atualizar os dados.');
            }

            const updatedProfessional = await response.json();
            localStorage.setItem('logado', JSON.stringify(updatedProfessional));  
            profissionalLogado = updatedProfessional;
            showProfissionalDashboard(updatedProfessional);  
            alert('Dados atualizados com sucesso!');
        } catch (error) {
            console.error('Erro ao atualizar:', error);
            alert(`Erro ao atualizar: ${error.message}`);
        }
    });

    logoutProfissionalButton.addEventListener('click', () => {
        localStorage.removeItem('logado');
        profissionalLogado = null;
        showSection(initialScreen);
    });

    excluirCadastroButton.addEventListener('click', async () => {
        if (confirm('Tem certeza que deseja excluir seu cadastro? Esta ação não poderá ser desfeita.')) {
            try {
                const response = await fetch(`http://localhost:5000/api/professionals/${profissionalLogado.id}`, {
                    method: 'DELETE',
                });

                if (response.ok) {
                    alert('Cadastro excluído com sucesso!');
                    localStorage.removeItem('logado');
                    profissionalLogado = null;
                    showSection(initialScreen);
                } else {
                    alert('Erro ao excluir cadastro.');
                }
            } catch (error) {
                console.error('Erro ao excluir cadastro:', error);
                alert('Erro ao excluir cadastro.');
            }
        }
    });

    // === Busca de profissionais por especialidade e cidade ===
    voltarInicialBuscaButton.addEventListener('click', () => {
        showSection(initialScreen);
    });

    buscaProfissionalForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const especialidade = document.getElementById('busca-especialidade').value;
        const cidade = document.getElementById('busca-cidade').value;

        const response = await fetch('http://localhost:5000/api/professionals');
        const profissionais = await response.json();

        const resultados = profissionais.filter(profissional => {
            if (especialidade && cidade) {
                return profissional.especialidade === especialidade &&
                       profissional.cidade.toLowerCase().includes(cidade.toLowerCase());
            } else if (especialidade) {
                return profissional.especialidade === especialidade;
            } else if (cidade) {
                return profissional.cidade.toLowerCase().includes(cidade.toLowerCase());
            } else {
                return true;
            }
        });

        listaProfissionais.innerHTML = ''; // Limpa lista anterior
        if (resultados.length > 0) {
            resultados.forEach(profissional => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <strong>${profissional.nome}</strong><br>
                    Cidade: ${profissional.cidade}<br>
                    Especialidade: ${profissional.especialidade}<br>
                    <button class="chat-button" data-profissional-id="${profissional.id}">Iniciar Chat</button>
                `;
                listaProfissionais.appendChild(li);
            });
        } else {
            listaProfissionais.innerHTML = '<p>Nenhum profissional encontrado com os critérios de busca.</p>';
        }

        resultadosBuscaSection.classList.remove('hidden');
    });

    listaProfissionais.addEventListener('click', function(event) {
        if (event.target.classList.contains('chat-button')) {
            const profissionalId = event.target.dataset.profissionalId;
            iniciarChatComProfissional(profissionalId);
        }
    });

    // Função para iniciar o chat com o profissional
    function iniciarChatComProfissional(profissionalId) {
        console.log("Iniciando chat com o profissional com ID: " + profissionalId);
        document.getElementById('chat-section').classList.remove('hidden');
    }

    // === Login e registro do usuário comum ===
    usuarioRegisterButton.addEventListener('click', () => {
        showSection(usuarioRegisterFormSection);
    });

    voltarInicialUsuarioLoginButton.addEventListener('click', () => {
        showSection(initialScreen);
    });

    usuarioLoginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const email = document.getElementById('usuario-login-email').value;
        const senha = document.getElementById('usuario-login-password').value;

        const response = await fetch('http://localhost:5000/api/users/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha }),
        });

        if (response.ok) {
            const usuario = await response.json();
            localStorage.setItem('usuarioLogado', JSON.stringify(usuario));
            usuarioLogado = usuario;
            showUsuarioBusca();
        } else {
            alert('Credenciais inválidas.');
        }
    });

    voltarLoginUsuarioButton.addEventListener('click', () => {
        showSection(usuarioLoginSection);
    });

    registerUsuarioForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const nome = document.getElementById('usuario-nome').value;
        const email = document.getElementById('usuario-email').value;
        const senha = document.getElementById('usuario-senha').value;

        const response = await fetch('http://localhost:5000/api/users/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, email, senha }),
        });

        if (response.ok) {
            alert('Cadastro realizado com sucesso!');
            showSection(usuarioLoginSection);
        } else {
            alert('Erro ao cadastrar usuário.');
        }
    });

    // Função para inicializar a sessão do usuário/profissional
function login(userId, type) {
    socket.emit('login', { userId, type });
    
    // Verifica se o elemento de chat existe antes de tentar exibi-lo
    const chatSection = document.getElementById('chat-section');
    if (chatSection) {
        chatSection.classList.remove('hidden'); // Exibe a seção de chat para o usuário
    } else {
        console.error('Elemento de chat não encontrado!');
    }

    // Verifica se o profissional está logado e exibe o chat para o profissional
    if (type === 'professional') {
        const professionalChatSection = document.getElementById('professional-chat-section');
        if (professionalChatSection) {
            professionalChatSection.classList.remove('hidden');
        } else {
            console.error('Elemento de chat do profissional não encontrado!');
        }
    }

    }

    // === Verificações de login automático na inicialização ===
    checkLogin();
    checkUsuarioLogin();
});
