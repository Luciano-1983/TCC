/**
 * SISTEMA DE CUIDADORES - FRONTEND
 * 
 * Este arquivo contém toda a lógica da interface do usuário (frontend).
 * É responsável por:
 * - Gerenciar a navegação entre as telas
 * - Processar formulários de cadastro e login
 * - Controlar o sistema de chat em tempo real
 * - Buscar e exibir profissionais
 * - Gerenciar a sessão do usuário
 * 
 * IMPORTANTE: Este código roda no navegador do usuário, não no servidor!
 */

// Aguarda o carregamento completo da página antes de executar o código
document.addEventListener('DOMContentLoaded', () => {
    // ========================================
    // INICIALIZAÇÃO DOS ELEMENTOS DA INTERFACE
    // ========================================
    
    // Botões da tela inicial (primeira tela que o usuário vê)
    const souProfissionalButton = document.getElementById('sou-profissional');        // Botão "Sou Profissional"
    const buscoProfissionalButton = document.getElementById('busco-profissional');    // Botão "Busco Profissional"
    const initialScreen = document.getElementById('initial-screen');                  // Tela inicial

    // Botões da barra de navegação (sempre visíveis no topo)
    const souProfissionalNavButton = document.getElementById('sou-profissional-nav');     // Navegação para área do profissional
    const buscoProfissionalNavButton = document.getElementById('busco-profissional-nav'); // Navegação para busca
    const voltarInicialNavButton = document.getElementById('voltar-inicial-nav');         // Voltar para tela inicial

    // ========================================
    // ELEMENTOS DO LOGIN E CADASTRO DE PROFISSIONAIS
    // ========================================
    
    // Elementos da tela de login do profissional
    const profissionalLoginForm = document.getElementById('profissional-login-form');              // Formulário de login
    const profissionalLoginSection = document.getElementById('profissional-login');                // Tela de login
    const profissionalRegisterButton = document.getElementById('profissional-register');           // Botão "Registrar"
    const voltarInicialProfissionalLoginButton = document.getElementById('voltar-inicial-profissional-login'); // Botão "Voltar"

    // Elementos da tela de cadastro do profissional
    const registerProfissionalFormSection = document.getElementById('profissional-register-form'); // Tela de cadastro
    const registerProfissionalForm = document.getElementById('register-profissional-form');       // Formulário de cadastro
    const voltarLoginButton = document.getElementById('voltar-login');                             // Botão "Voltar" do cadastro

    // ========================================
    // ELEMENTOS DO DASHBOARD DO PROFISSIONAL
    // ========================================
    
    // Tela principal do profissional logado
    const profissionalDashboardSection = document.getElementById('profissional-dashboard');        // Tela do dashboard
    
    // Elementos para exibir dados do profissional
    const profissionalNomeExibicao = document.getElementById('profissional-nome-exibicao');       // Nome no cabeçalho
    const profissionalNomeValor = document.getElementById('profissional-nome-valor');             // Nome na lista de dados
    const profissionalTelefoneValor = document.getElementById('profissional-telefone-valor');     // Telefone
    const profissionalCidadeValor = document.getElementById('profissional-cidade-valor');         // Cidade
    const profissionalEspecialidadeValor = document.getElementById('profissional-especialidade-valor'); // Especialidade
    const profissionalRegistroValor = document.getElementById('profissional-registro-valor');     // Registro profissional
    
    // Botões de ação do dashboard
    const editarDadosButton = document.getElementById('editar-dados');                             // Editar dados pessoais
    const abrirChatProfissionalButton = document.getElementById('abrir-chat-profissional');       // Abrir chat
    const logoutProfissionalButton = document.getElementById('logout-profissional');              // Fazer logout
    const excluirCadastroButton = document.getElementById('excluir-cadastro');                    // Excluir conta

    // Formulário de edição
    const editarProfissionalFormSection = document.getElementById('editar-profissional-form');
    const editarRegisterProfissionalForm = document.getElementById('editar-register-profissional-form');
    const cancelarEdicaoButton = document.getElementById('cancelar-edicao');

    // Tela de busca de profissionais
    const usuarioBuscaSection = document.getElementById('usuario-busca');
    const buscaProfissionalForm = document.getElementById('busca-profissional-form');
    const voltarInicialBuscaButton = document.getElementById('voltar-inicial-busca');
    const resultadosBuscaSection = document.getElementById('resultados-busca');
    const listaProfissionais = document.getElementById('lista-profissionais');

    // Login e Registro do usuário
    const usuarioLoginSection = document.getElementById('usuario-login');
    const usuarioLoginForm = document.getElementById('usuario-login-form');
    const usuarioRegisterButton = document.getElementById('usuario-register');
    const voltarInicialUsuarioLoginButton = document.getElementById('voltar-inicial-usuario-login');

    const usuarioRegisterFormSection = document.getElementById('usuario-register-form');
    const registerUsuarioForm = document.getElementById('register-usuario-form');
    const voltarLoginUsuarioButton = document.getElementById('voltar-login-usuario');

    // Conexão com o Socket.IO
    const socket = io();

    let profissionalLogado = null;
    let usuarioLogado = null;
    let profissionalIdSelecionado = null;

    function tocarNotificacao() {
        try {
            const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT');
            audio.volume = 0.3;
            audio.play();
        } catch (error) {
            console.log('Erro ao tocar notificação:', error);
        }
    }

    document.getElementById('lista-profissionais').addEventListener('click', function(event) {
        if (event.target.classList.contains('chat-button')) {
            profissionalIdSelecionado = event.target.dataset.profissionalId;
            iniciarChatComProfissional(profissionalIdSelecionado);
        }
    });

    let usuarioAtualChat = null;
    let profissionalAtualChat = null;

    document.getElementById('user-chat-send-button').addEventListener('click', () => {
        enviarMensagemUsuario();
    });

    function enviarMensagemUsuario() {
        const message = document.getElementById('user-chat-message-input').value;

        if (message.trim() !== "" && profissionalIdSelecionado) {
            socket.emit('send_message', { 
                fromUserId: usuarioLogado.id, 
                toProfessionalId: profissionalIdSelecionado, 
                message,
                fromUserName: usuarioLogado.nome
            });
            exibirMensagemNoChat('Você: ' + message, 'sent', 'user');
            document.getElementById('user-chat-message-input').value = ''; // Limpa o campo
        } else {
            alert("Digite uma mensagem para enviar.");
        }
    }

    // Enviar mensagem do usuário com Enter
    document.getElementById('user-chat-message-input').addEventListener('keypress', (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            enviarMensagemUsuario();
        }
    });

    // Envia a mensagem do profissional para o usuário
    document.getElementById('professional-chat-send-button').addEventListener('click', () => {
        enviarMensagemProfissional();
    });

    // Função para enviar mensagem do profissional
    function enviarMensagemProfissional() {
        const message = document.getElementById('professional-chat-message-input').value;

        if (message.trim() !== "" && usuarioAtualChat) {
            socket.emit('send_professional_message', { 
                fromProfessionalId: profissionalLogado.id, 
                toUserId: usuarioAtualChat.id, 
                message,
                fromProfessionalName: profissionalLogado.nome
            });
            exibirMensagemNoChat('Você: ' + message, 'sent', 'professional');
            document.getElementById('professional-chat-message-input').value = ''; // Limpa o campo
        } else {
            alert("Digite uma mensagem para enviar.");
        }
    }

    // Função para liberar dados do profissional
    function liberarDadosProfissional() {
        if (usuarioAtualChat) {
            const registroText = profissionalLogado.registro || 'Não informado';
            const registroLink = profissionalLogado.registro ? 
                `<a href="https://www.portalcoren-rs.gov.br/index.php?categoria=servicos&pagina=consulta-profissional" 
                   target="_blank" class="coren-link">
                    <span class="material-symbols-outlined coren-icon">open_in_new</span>
                </a>` : '';

            const dadosProfissional = `
                <div class="professional-data-container">
                    <div class="professional-data-header">
                        <span class="material-symbols-outlined">badge</span>
                        <strong>Dados do Profissional</strong>
                    </div>
                    <div class="professional-data-content">
                        <div class="data-item">
                            <span class="data-label">Nome Completo:</span>
                            <span class="data-value">${profissionalLogado.nome}</span>
                        </div>
                        <div class="data-item">
                            <span class="data-label">Telefone:</span>
                            <span class="data-value">${profissionalLogado.telefone}</span>
                        </div>
                        <div class="data-item">
                            <span class="data-label">Cidade:</span>
                            <span class="data-value">${profissionalLogado.cidade}</span>
                        </div>
                        <div class="data-item">
                            <span class="data-label">Especialidade:</span>
                            <span class="data-value">${profissionalLogado.especialidade}</span>
                        </div>
                        <div class="data-item">
                            <span class="data-label">Registro Profissional:</span>
                            <span class="data-value">${registroText} ${registroLink}</span>
                        </div>
                    </div>
                </div>
            `;
            
            // Envia os dados como uma mensagem especial
            socket.emit('send_professional_data', { 
                fromProfessionalId: profissionalLogado.id, 
                toUserId: usuarioAtualChat.id, 
                dados: dadosProfissional,
                fromProfessionalName: profissionalLogado.nome
            });
            
            // Exibe a mensagem no chat do profissional
            exibirMensagemNoChat('Sistema: Seus dados foram compartilhados com o usuário.', 'data-shared', 'professional');
        } else {
            alert("Nenhum usuário selecionado para compartilhar dados.");
        }
    }

    // Enviar mensagem do profissional com Enter
    document.getElementById('professional-chat-message-input').addEventListener('keypress', (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            enviarMensagemProfissional();
        }
    });

    // Botão para liberar dados do profissional
    document.getElementById('professional-chat-release-data-button').addEventListener('click', () => {
        liberarDadosProfissional();
    });

    // Exibe a mensagem no chat do usuário
    function exibirMensagemNoChat(message, type, chatType = 'user') {
        
        const messageContainer = chatType === 'user' 
            ? document.getElementById('user-chat-messages')
            : document.getElementById('professional-chat-messages');
        
        
        if (!messageContainer) {
            console.error('Container de mensagens não encontrado para chatType:', chatType);
            return;
        }
        
        const newMessage = document.createElement('div');
        newMessage.classList.add('message', type); // 'sent', 'received' ou 'data-shared'
        
        // Se a mensagem contém HTML (como dados do profissional), use innerHTML
        if (message.includes('<br>') || message.includes('<strong>') || message.includes('<a href=')) {
            newMessage.innerHTML = message;
        } else {
            newMessage.textContent = message;
        }
        
        messageContainer.appendChild(newMessage);
        messageContainer.scrollTop = messageContainer.scrollHeight;
    }

    // Recebe mensagens (tanto para usuário quanto para profissional)
    socket.on('receive_message', (data) => {
        const { fromUserId, fromProfessionalId, fromUserName, fromProfessionalName, message, type } = data;
        
        
        if (type === 'user' && profissionalLogado) {
            
            if (!usuarioAtualChat) {
                usuarioAtualChat = { id: fromUserId, nome: fromUserName };
                document.getElementById('professional-chat-recipient-name').textContent = fromUserName;
            }
            
            // Exibe o chat do profissional se estiver escondido
            const professionalChatSection = document.getElementById('professional-chat-section');
            if (professionalChatSection.classList.contains('hidden')) {
                professionalChatSection.classList.remove('hidden');
                // Adiciona uma notificação visual
                abrirChatProfissionalButton.style.backgroundColor = '#ff6b6b';
                abrirChatProfissionalButton.innerHTML = '💬 Chat (Nova Mensagem)';
                // Toca notificação sonora
                tocarNotificacao();
            } else {
                // Se o chat já estiver aberto, apenas toca notificação sonora
                tocarNotificacao();
            }
            
            exibirMensagemNoChat(`${fromUserName}: ${message}`, 'received', 'professional');
        } else if (type === 'professional' && usuarioLogado) {
            
            if (!profissionalAtualChat) {
                profissionalAtualChat = { id: fromProfessionalId, nome: fromProfessionalName };
            }
            exibirMensagemNoChat(`${fromProfessionalName}: ${message}`, 'received', 'user');
        } else {
            
        }
    });

    // Recebe dados do profissional
    socket.on('receive_professional_data', (data) => {
        const { fromProfessionalId, fromProfessionalName, dados, type } = data;
        
        
        if (type === 'professional_data' && usuarioLogado) {
            
            if (!profissionalAtualChat) {
                profissionalAtualChat = { id: fromProfessionalId, nome: fromProfessionalName };
            }
            exibirMensagemNoChat(dados, 'data-shared', 'user');
        } else {
            
        }
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



    // Fechar o chat
    document.getElementById('user-chat-close-button').addEventListener('click', () => {
        document.getElementById('chat-section').classList.add('hidden');
    });

    document.getElementById('professional-chat-close-button').addEventListener('click', () => {
        document.getElementById('professional-chat-section').classList.add('hidden');
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
            
            // Limpa dados do usuário se existirem
            localStorage.removeItem('usuarioLogado');
            usuarioLogado = null;
            
            // Conecta o profissional ao socket
            socket.emit('login', { userId: profissionalLogado.id, type: 'professional' });
            
            showProfissionalDashboard(profissionalLogado);
        }
    }

    // Verifica se há usuário logado
    function checkUsuarioLogin() {
        const usuarioLogadoData = localStorage.getItem('usuarioLogado');
        if (usuarioLogadoData) {
            usuarioLogado = JSON.parse(usuarioLogadoData);
            
            // Limpa dados do profissional se existirem
            localStorage.removeItem('logado');
            profissionalLogado = null;
            
            // Conecta o usuário ao socket
            socket.emit('login', { userId: usuarioLogado.id, type: 'user' });
            
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
        profissionalRegistroValor.textContent = profissional.registro || 'Não informado';
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

        const response = await fetch('/api/professionals/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha }),
        });

        if (response.ok) {
            const profissional = await response.json();
            
            // Limpa dados do usuário se existirem
            localStorage.removeItem('usuarioLogado');
            usuarioLogado = null;
            
            localStorage.setItem('logado', JSON.stringify(profissional));
            profissionalLogado = profissional;
            
            // Conecta o profissional ao socket
            socket.emit('login', { userId: profissional.id, type: 'professional' });
            
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

        // Se especialidade for "Cuidador", não enviar o campo registro
        const dataToSend = { nome, telefone, email, cidade, especialidade, senha };
        if (especialidade !== 'Cuidador') {
            dataToSend.registro = registro;
        }

        const response = await fetch('/api/professionals/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dataToSend),
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

    // ========================================
    // CONTROLE DE VISIBILIDADE DO CAMPO DE REGISTRO
    // ========================================
    // 
    // FUNCIONALIDADE IMPORTANTE: Cuidadores não precisam de registro profissional!
    // Esta seção controla quando o campo de registro deve aparecer ou não.
    
    // Elementos do campo de registro no formulário de cadastro
    const profissionalEspecialidadeSelect = document.getElementById('profissional-especialidade');  // Select de especialidade
    const profissionalRegistroLabel = document.getElementById('profissional-registro-label');       // Label do campo registro
    const profissionalRegistroInput = document.getElementById('profissional-registro');             // Input do campo registro

    /**
     * FUNÇÃO PARA CONTROLAR VISIBILIDADE DO CAMPO DE REGISTRO
     * 
     * Esta é uma das funcionalidades mais importantes do sistema!
     * 
     * REGRA DE NEGÓCIO: Cuidadores não precisam de registro profissional
     * porque esta especialidade não possui vínculo com órgão regulamentador.
     * 
     * Comportamento:
     * - Se especialidade = "Cuidador": Oculta o campo de registro
     * - Se especialidade = "Enfermeiro" ou "Técnico": Mostra o campo de registro
     */
    function toggleRegistroField() {
        const especialidade = profissionalEspecialidadeSelect.value;
        
        if (especialidade === 'Cuidador') {
            // CUIDADOR: Oculta o campo de registro (não é obrigatório)
            profissionalRegistroLabel.style.display = 'none';
            profissionalRegistroInput.style.display = 'none';
            profissionalRegistroInput.removeAttribute('required');
        } else {
            // OUTRAS ESPECIALIDADES: Mostra o campo de registro (é obrigatório)
            profissionalRegistroLabel.style.display = 'block';
            profissionalRegistroInput.style.display = 'block';
            profissionalRegistroInput.setAttribute('required', 'required');
        }
    }

    // Configura o evento para executar a função quando a especialidade mudar
    profissionalEspecialidadeSelect.addEventListener('change', toggleRegistroField);

    // Executa a função na inicialização para configurar o estado inicial
    toggleRegistroField();

    // === Edição dos dados do profissional ===
    editarDadosButton.addEventListener('click', () => {
        showSection(editarProfissionalFormSection);
        // Preenchendo os campos com os dados do profissional
        document.getElementById('editar-profissional-nome').value = profissionalLogado.nome;
        document.getElementById('editar-profissional-email').value = profissionalLogado.email;
        document.getElementById('editar-profissional-telefone').value = profissionalLogado.telefone;
        document.getElementById('editar-profissional-cidade').value = profissionalLogado.cidade;
        document.getElementById('editar-profissional-especialidade').value = profissionalLogado.especialidade;
        document.getElementById('editar-profissional-registro').value = profissionalLogado.registro || '';
        
        // Aplicar controle de visibilidade do campo de registro
        toggleEditarRegistroField();
    });

    // === Controle de visibilidade do campo de registro no formulário de edição ===
    const editarProfissionalEspecialidadeSelect = document.getElementById('editar-profissional-especialidade');
    const editarProfissionalRegistroLabel = document.getElementById('editar-profissional-registro-label');
    const editarProfissionalRegistroInput = document.getElementById('editar-profissional-registro');

    function toggleEditarRegistroField() {
        const especialidade = editarProfissionalEspecialidadeSelect.value;
        if (especialidade === 'Cuidador') {
            editarProfissionalRegistroLabel.style.display = 'none';
            editarProfissionalRegistroInput.style.display = 'none';
            editarProfissionalRegistroInput.removeAttribute('required');
        } else {
            editarProfissionalRegistroLabel.style.display = 'block';
            editarProfissionalRegistroInput.style.display = 'block';
            editarProfissionalRegistroInput.setAttribute('required', 'required');
        }
    }

    // Adicionar listener para mudança de especialidade no formulário de edição
    editarProfissionalEspecialidadeSelect.addEventListener('change', toggleEditarRegistroField);

    // === Abrir chat do profissional ===
    abrirChatProfissionalButton.addEventListener('click', () => {
        document.getElementById('professional-chat-section').classList.remove('hidden');
        // Reseta a notificação visual
        abrirChatProfissionalButton.style.backgroundColor = '';
        abrirChatProfissionalButton.innerHTML = '<span class="material-symbols-outlined">chat</span> Abrir Chat';
    });

    cancelarEdicaoButton.addEventListener('click', () => {
        showProfissionalDashboard(profissionalLogado);
    });

    editarRegisterProfissionalForm.addEventListener('submit', async (event) => {
        event.preventDefault(); 
        // Coletar os dados atualizados
        const especialidade = document.getElementById('editar-profissional-especialidade').value;
        const updatedData = {
            nome: document.getElementById('editar-profissional-nome').value,
            email: document.getElementById('editar-profissional-email').value,
            senha: document.getElementById('editar-profissional-senha').value,
            telefone: document.getElementById('editar-profissional-telefone').value,
            cidade: document.getElementById('editar-profissional-cidade').value,
            especialidade: especialidade
        };

        // Se especialidade for "Cuidador", não enviar o campo registro
        if (especialidade !== 'Cuidador') {
            updatedData.registro = document.getElementById('editar-profissional-registro').value;
        }

        const profissionalId = profissionalLogado.id;  

        try {
            const response = await fetch(`/api/professionals/${profissionalId}`, {
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
                const response = await fetch(`/api/professionals/${profissionalLogado.id}`, {
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

        const response = await fetch('/api/professionals');
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
        profissionalIdSelecionado = profissionalId;
        
        // Buscar informações do profissional para exibir o nome
        fetch(`/api/professionals/${profissionalId}`)
            .then(response => response.json())
            .then(profissional => {
                profissionalAtualChat = profissional;
                // Atualizar o título do chat se existir
                const chatTitle = document.querySelector('#chat-section h2');
                if (chatTitle) {
                    chatTitle.textContent = `Chat com ${profissional.nome}`;
                }
            })
            .catch(error => {
                console.error('Erro ao buscar informações do profissional:', error);
            });
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

        const response = await fetch('/api/users/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha }),
        });

        if (response.ok) {
            const usuario = await response.json();
            
            // Limpa dados do profissional se existirem
            localStorage.removeItem('logado');
            profissionalLogado = null;
            
            localStorage.setItem('usuarioLogado', JSON.stringify(usuario));
            usuarioLogado = usuario;
            
            // Conecta o usuário ao socket
            socket.emit('login', { userId: usuario.id, type: 'user' });
            
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

        const response = await fetch('/api/users/register', {
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



    // === Verificações de login automático na inicialização ===
    checkLogin();
    checkUsuarioLogin();
});
