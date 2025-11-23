// ./assets/js/booking-system.js

// REMOÇÃO DA API_BASE_URL e das chamadas ao Backend
// O script agora constrói a mensagem do WhatsApp diretamente no frontend.

const state = {
    currentStep: 1,
    selectedService: null,
    selectedDate: null,
    selectedTime: null,
    services: {
    'pe-mao': { name: 'Pé e Mão Completo', duration: 120 },
    'somente-maos': { name: 'Somente Mãos', duration: 60 },
    'somente-pes': { name: 'Somente Pés', duration: 90 },
    'corte-escova': { name: 'Corte + Escova', duration: 90 },
    'escova': { name: 'Escova', duration: 60 },
    'progressiva': { name: 'Escova Progressiva', duration: 240 },
    'coloracao': { name: 'Coloração', duration: 60 },
    'reconstrucao': { name: 'Reconstrução Capilar', duration: 40 },
    'nutricao': { name: 'Nutrição', duration: 40 },
    'hidratacao': { name: 'Hidratação', duration: 40 },
    'cronograma': { name: 'Cronograma Capilar Completo', duration: 120 },
    'design': { name: 'Design de Sobrancelha', duration: 40 },
    'buco': { name: 'Buço com cera', duration: 15 },
    'maquiagem-simples': { name: 'Maquiagem Simples', duration: 60 },
    'penteado': { name: 'Penteado', duration: 120 },
    'maquiagem': { name: 'Maquiagem Completa', duration: 120 },
    }
};

// =======================================================
// === FUNÇÕES DE NAVEGAÇÃO ENTRE PASSOS DO FORMULÁRIO ===
// =======================================================

function nextStep(stepNumber) {
    if (stepNumber === 2 && !state.selectedService) return;
    if (stepNumber === 3 && (!state.selectedDate || !state.selectedTime)) return;

    // Atualiza o resumo antes de ir para o passo 3
    if (stepNumber === 3) {
        document.getElementById('summary-service').textContent = state.selectedService.name;
        // Usa a função de formatação do HTML
        document.getElementById('summary-date').textContent = formatDateDisplay(state.selectedDate); 
        document.getElementById('summary-time').textContent = state.selectedTime;
    }

    // Esconde todos os passos e mostra o passo alvo
    document.querySelectorAll('.booking-step').forEach(step => step.classList.remove('active'));
    document.getElementById(`step-${stepNumber}`).classList.add('active');
    state.currentStep = stepNumber;
}

function prevStep(stepNumber) {
    document.querySelectorAll('.booking-step').forEach(step => step.classList.remove('active'));
    document.getElementById(`step-${stepNumber}`).classList.add('active');
    state.currentStep = stepNumber;
}

// ===========================================
// === FUNÇÕES DE SELEÇÃO E VALIDAÇÃO ===
// ===========================================

function updateService(serviceId) {
    state.selectedService = state.services[serviceId];
    document.getElementById('next-step-1').disabled = false; // Habilita o Próximo
    // Reseta data/hora ao trocar o serviço
    state.selectedDate = null;
    state.selectedTime = null;
    document.getElementById('booking-date').value = '';
    document.getElementById('available-times').innerHTML = '<p class="placeholder-text">Selecione uma data para ver os horários.</p>';
    document.getElementById('next-step-2').disabled = true;
}

function selectTime(time) {
    state.selectedTime = time;
    // Remove destaque de todos e adiciona ao selecionado
    document.querySelectorAll('#available-times button').forEach(btn => btn.classList.remove('selected'));
    document.querySelector(`button[data-time="${time}"]`).classList.add('selected');

    document.getElementById('next-step-2').disabled = false;
}

// =============================================
// === FUNÇÕES DE SIMULAÇÃO DE BACKEND/HORÁRIOS ===
// =============================================

function fetchAvailableTimes() {
    state.selectedDate = document.getElementById('booking-date').value;
    state.selectedTime = null; // Reseta o horário ao mudar a data
    document.getElementById('next-step-2').disabled = true; // Desabilita o Próximo

    if (!state.selectedDate || !state.selectedService) return;

    const timeContainer = document.getElementById('available-times');
    const loadingMessage = document.getElementById('time-loading');
    
    timeContainer.style.display = 'none';
    loadingMessage.style.display = 'block';

    // SIMULAÇÃO DE CHAMADA À API (Delay de 1.5s)
    setTimeout(() => {
        const availableTimes = generateFakeAvailableTimes(state.selectedService.duration);
        timeContainer.innerHTML = ''; // Limpa o container

        if (availableTimes.length === 0) {
            timeContainer.innerHTML = '<p class="placeholder-text">Nenhum horário disponível para o serviço/dia selecionado. Por favor, escolha outra data.</p>';
        } else {
            availableTimes.forEach(time => {
                const button = document.createElement('button');
                button.type = 'button';
                button.textContent = time;
                button.setAttribute('data-time', time);
                button.onclick = () => selectTime(time);
                timeContainer.appendChild(button);
            });
        }

        loadingMessage.style.display = 'none';
        timeContainer.style.display = 'grid';
    }, 1500);
}

/**
 * Simula a geração de horários com base na duração do serviço.
 * Horário de funcionamento simulado: 09:00h às 19:00h (intervalo de 1h)
 * @param {number} duration - Duração do serviço em minutos.
 * @returns {Array<string>} Lista de horários disponíveis.
 */
function generateFakeAvailableTimes(duration) {
    const startHour = 9; // 09:00
    const endHour = 19;  // 19:00
    const interval = 60; // Intervalo de 60 minutos entre os inícios de agendamento
    const available = [];
    
    // Simulação de horários já ocupados para demonstração
    const bookedTimes = {
        '09:00': 120, // 09:00-11:00
        '14:00': 60   // 14:00-15:00
    };

    for (let hour = startHour; hour < endHour; hour++) {
        for (let minute = 0; minute < 60; minute += interval) {
            const startTime = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
            const endTimestamp = new Date(0, 0, 0, hour, minute + duration).getTime();
            const endHourCheck = new Date(endTimestamp).getHours();
            
            // Verifica se o serviço termina antes do fim do expediente (19:00)
            if (endHourCheck <= endHour) {
                let isAvailable = true;
                
                // Conversão do horário de início para um carimbo de data/hora (milissegundos no dia 0)
                const startTimestamp = new Date(0, 0, 0, hour, minute).getTime();
                
                // Verifica sobreposição com horários simulados já ocupados
                for (const bookedStart in bookedTimes) {
                    const [bookedHour, bookedMinute] = bookedStart.split(':').map(Number);
                    const bookedDuration = bookedTimes[bookedStart];
                    
                    const bookedStartTime = new Date(0, 0, 0, bookedHour, bookedMinute).getTime();
                    const bookedEndTime = new Date(0, 0, 0, bookedHour, bookedMinute + bookedDuration).getTime();
                    
                    // Condições de sobreposição:
                    // 1. O novo agendamento começa antes do fim de um agendamento existente E
                    // 2. O novo agendamento termina depois do início de um agendamento existente
                    if (startTimestamp < bookedEndTime && endTimestamp > bookedStartTime) {
                        isAvailable = false;
                        break;
                    }
                }

                if (isAvailable) {
                    available.push(startTime);
                }
            }
        }
    }

    return available;
}

// ===========================================
// === FUNÇÕES DE SUBMISSÃO E WHATSAPP ===
// ===========================================

function submitBooking(event) {
    event.preventDefault();
    document.getElementById('submit-booking').disabled = true; // Desabilita para evitar cliques múltiplos

    const clientName = document.getElementById('client-name').value;
    const clientWhatsapp = document.getElementById('client-whatsapp').value || 'Não Informado';
    const service = state.selectedService;
    const time = state.selectedTime;
    
    // 1. Validação final
    if (!service || !state.selectedDate || !time || !clientName) {
        alert('Erro interno de validação. Recarregue a página.');
        document.getElementById('submit-booking').disabled = false;
        return;
    }

    // 2. Definir a Mensagem e Link do WhatsApp
    // Número de Paula Eliziane Tomé (46) 99981-3037
    const whatsappPhone = '5546999813037'; 

    const whatsappMessage = 
        `Olá Paula Eliziane Tomé!\\n\\n` + // NOME DA NOVA EMPRESA
        `*SOLICITAÇÃO DE AGENDAMENTO*\\n\\n` +
        `Por favor, confirme se o horário que estou solicitando está livre.\\n\\n` +
        `💅 Serviço: *${service.name}*\\n` +
        `🗓 Data: *${formatDateDisplay(state.selectedDate)}*\\n` +
        `⏰ Horário: *${time}*\\n` +
        `👤 Cliente: *${clientName}* (WhatsApp: ${clientWhatsapp})\\n\\n` +
        `⚠️ ATENÇÃO: Confirme este agendamento manualmente!`;
        
    const whatsappLink = 
    `https://api.whatsapp.com/send?phone=${whatsappPhone}&text=${encodeURIComponent(whatsappMessage)}`;
    
    // 3. Exibir sucesso
    document.querySelectorAll('.booking-step').forEach(step => step.classList.remove('active'));
    document.getElementById('confirmation-message').classList.add('active');
    
    // 4. Redirecionar para o WhatsApp após um breve delay (para o usuário ver a confirmação)
    setTimeout(() => {
        window.open(whatsappLink, '_blank');
        document.getElementById('submit-booking').disabled = false; // Reabilita o botão para novo agendamento
    }, 1000); 
}

function resetBooking() {
    // Reseta o estado
    state.currentStep = 1;
    state.selectedService = null;
    state.selectedDate = null;
    state.selectedTime = null;

    // Reseta o formulário/campos
    document.getElementById('booking-form').reset();
    
    // Reseta a navegação
    document.querySelectorAll('.booking-step').forEach(step => step.classList.remove('active'));
    document.getElementById('step-1').classList.add('active');

    // Reseta os elementos do passo 1
    document.getElementById('next-step-1').disabled = true;

    // Reseta os elementos do passo 2
    document.getElementById('booking-date').value = '';
    document.getElementById('available-times').innerHTML = '<p class="placeholder-text">Selecione uma data para ver os horários.</p>';
    document.getElementById('next-step-2').disabled = true;

    // Redefine a data mínima
    const today = new Date();
    today.setDate(today.getDate() + 1);
    const tomorrow = today.toISOString().split('T')[0];
    document.getElementById('booking-date').setAttribute('min', tomorrow);

    // Oculta a mensagem de confirmação se ainda estiver visível
    document.getElementById('confirmation-message').classList.remove('active');
}