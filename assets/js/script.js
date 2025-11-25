// ./assets/js/script.js

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
    if (stepNumber === 2 && !state.selectedService) {
        alert('Por favor, selecione um serviço primeiro!');
        return;
    }
    if (stepNumber === 3 && (!state.selectedDate || !state.selectedTime)) {
        alert('Por favor, selecione uma data e horário primeiro!');
        return;
    }

    // Atualiza o resumo antes de ir para o passo 3
    if (stepNumber === 3) {
        updateSummary();
    }

    // Esconde todos os passos
    document.querySelectorAll('.booking-step').forEach(step => {
        step.classList.remove('active');
        step.style.display = 'none';
    });
    
    // Mostra o passo alvo
    const nextStepEl = document.getElementById(`step-${stepNumber}`);
    if (nextStepEl) {
        nextStepEl.classList.add('active');
        nextStepEl.style.display = 'block';
    }
    
    state.currentStep = stepNumber;
    
    // Scroll suave para o topo
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function prevStep(stepNumber) {
    document.querySelectorAll('.booking-step').forEach(step => {
        step.classList.remove('active');
        step.style.display = 'none';
    });

    const prevStepEl = document.getElementById(`step-${stepNumber}`);
    if (prevStepEl) {
        prevStepEl.classList.add('active');
        prevStepEl.style.display = 'block';
    }
    
    state.currentStep = stepNumber;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ===========================================
// === FUNÇÕES DE SELEÇÃO E VALIDAÇÃO ===
// ===========================================

function updateServiceFromSelect(selectElement) {
    const serviceId = selectElement.value;
    
    if (state.services[serviceId]) {
        state.selectedService = state.services[serviceId];
        
        // Habilita o botão próximo
        const nextBtn = document.getElementById('next-step-1');
        if (nextBtn) {
            nextBtn.disabled = false;
        }
        
        // Reseta data/hora se o usuário mudou o serviço
        state.selectedDate = null;
        state.selectedTime = null;
        
        const dateInput = document.getElementById('booking-date');
        if (dateInput) {
            dateInput.value = '';
        }
        
        const timesContainer = document.getElementById('available-times');
        if (timesContainer) {
            timesContainer.innerHTML = '<p class="placeholder-text">Selecione uma data acima para ver os horários.</p>';
        }
        
        const nextBtn2 = document.getElementById('next-step-2');
        if (nextBtn2) {
            nextBtn2.disabled = true;
        }
    }
}

function selectTime(time) {
    state.selectedTime = time;
    
    // Remove destaque de todos os botões
    document.querySelectorAll('#available-times button').forEach(btn => {
        btn.classList.remove('selected');
    });
    
    // Adiciona destaque ao selecionado
    const selectedBtn = document.querySelector(`#available-times button[data-time="${time}"]`);
    if (selectedBtn) {
        selectedBtn.classList.add('selected');
    }

    // Habilita o botão próximo
    const nextBtn = document.getElementById('next-step-2');
    if (nextBtn) {
        nextBtn.disabled = false;
    }
}

function updateSummary() {
    const summaryService = document.getElementById('summary-service');
    const summaryDate = document.getElementById('summary-date');
    const summaryTime = document.getElementById('summary-time');
    
    if (summaryService && state.selectedService) {
        summaryService.textContent = state.selectedService.name;
    }
    
    if (summaryDate && state.selectedDate) {
        // Formata a data para DD/MM/YYYY
        const dateFormatted = state.selectedDate.split('-').reverse().join('/');
        summaryDate.textContent = dateFormatted;
    }
    
    if (summaryTime && state.selectedTime) {
        summaryTime.textContent = state.selectedTime;
    }
    
    // Habilita o botão submit ao entrar no passo 3
    enableSubmitButton();
}

function enableSubmitButton() {
    const submitBtn = document.getElementById('submit-booking');
    const nameInput = document.getElementById('client-name');
    
    if (submitBtn && nameInput) {
        // Habilita quando o nome for preenchido
        nameInput.addEventListener('input', () => {
            if (nameInput.value.trim().length > 0) {
                submitBtn.disabled = false;
            } else {
                submitBtn.disabled = true;
            }
        });
        
        // Verifica se já tem valor
        if (nameInput.value.trim().length > 0) {
            submitBtn.disabled = false;
        }
    }
}

// =============================================
// === FUNÇÕES DE SIMULAÇÃO DE BACKEND/HORÁRIOS ===
// =============================================

function fetchAvailableTimes() {
    const dateInput = document.getElementById('booking-date');
    if (!dateInput) return;
    
    state.selectedDate = dateInput.value;
    state.selectedTime = null;
    
    const nextBtn = document.getElementById('next-step-2');
    if (nextBtn) {
        nextBtn.disabled = true;
    }

    if (!state.selectedDate || !state.selectedService) {
        return;
    }

    const timeContainer = document.getElementById('available-times');
    const loadingMessage = document.getElementById('time-loading');
    
    if (!timeContainer || !loadingMessage) return;
    
    timeContainer.style.display = 'none';
    loadingMessage.style.display = 'block';

    // Simulação de chamada à API
    setTimeout(() => {
        const availableTimes = generateFakeAvailableTimes(state.selectedService.duration);
        timeContainer.innerHTML = '';

        if (availableTimes.length === 0) {
            timeContainer.innerHTML = '<p class="placeholder-text">Nenhum horário disponível para esta data. Tente outra.</p>';
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
    }, 1000);
}

function generateFakeAvailableTimes(duration) {
    const startHour = 9;
    const endHour = 19;
    const interval = 60;
    const available = [];
    
    // Simulação de horários já ocupados
    const bookedTimes = { '09:00': 120, '14:00': 60 };

    for (let hour = startHour; hour < endHour; hour++) {
        for (let minute = 0; minute < 60; minute += interval) {
            const startTime = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
            const endTimestamp = new Date(0, 0, 0, hour, minute + duration).getTime();
            const endHourCheck = new Date(endTimestamp).getHours();
            
            if (endHourCheck <= endHour) {
                let isAvailable = true;
                const startTimestamp = new Date(0, 0, 0, hour, minute).getTime();
                
                for (const bookedStart in bookedTimes) {
                    const [bookedHour, bookedMinute] = bookedStart.split(':').map(Number);
                    const bookedDuration = bookedTimes[bookedStart];
                    const bookedStartTime = new Date(0, 0, 0, bookedHour, bookedMinute).getTime();
                    const bookedEndTime = new Date(0, 0, 0, bookedHour, bookedMinute + bookedDuration).getTime();
                    
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
    
    const submitBtn = document.getElementById('submit-booking');
    if (submitBtn) {
        submitBtn.disabled = true;
    }

    const clientName = document.getElementById('client-name')?.value;
    const clientWhatsapp = document.getElementById('client-whatsapp')?.value || 'Não Informado';
    const service = state.selectedService;
    const time = state.selectedTime;
    
    if (!service || !state.selectedDate || !time || !clientName) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        if (submitBtn) {
            submitBtn.disabled = false;
        }
        return;
    }

    const whatsappPhone = '5546999813037';
    const dateFormatted = state.selectedDate.split('-').reverse().join('/');

    const whatsappMessage = 
        `Olá Paula Eliziane Tomé! 👋\n\n` + 
        `*SOLICITAÇÃO DE AGENDAMENTO*\n` +
        `--------------------------------\n` +
        `💅 Serviço: *${service.name}*\n` +
        `📅 Data: *${dateFormatted}*\n` +
        `⏰ Horário: *${time}*\n` +
        `👤 Cliente: *${clientName}*\n` +
        `📞 Contato: ${clientWhatsapp}\n` +
        `--------------------------------\n` +
        `Aguardo confirmação!`;
        
    const whatsappLink = 
        `https://api.whatsapp.com/send?phone=${whatsappPhone}&text=${encodeURIComponent(whatsappMessage)}`;
    
    // Atualiza UI
    document.querySelectorAll('.booking-step').forEach(step => {
        step.style.display = 'none';
    });
    
    const confirmationMsg = document.getElementById('confirmation-message');
    if (confirmationMsg) {
        confirmationMsg.style.display = 'block';
    }
    
    setTimeout(() => {
        window.open(whatsappLink, '_blank');
        if (submitBtn) {
            submitBtn.disabled = false;
        }
    }, 1500);
}

function resetBooking() {
    state.currentStep = 1;
    state.selectedService = null;
    state.selectedDate = null;
    state.selectedTime = null;

    const form = document.getElementById('booking-form');
    if (form) {
        form.reset();
    }
    
    document.querySelectorAll('.booking-step').forEach(step => {
        step.style.display = 'none';
    });
    
    const confirmationMsg = document.getElementById('confirmation-message');
    if (confirmationMsg) {
        confirmationMsg.style.display = 'none';
    }

    const step1 = document.getElementById('step-1');
    if (step1) {
        step1.classList.add('active');
        step1.style.display = 'block';
    }

    const nextBtn1 = document.getElementById('next-step-1');
    if (nextBtn1) {
        nextBtn1.disabled = true;
    }
    
    const timesContainer = document.getElementById('available-times');
    if (timesContainer) {
        timesContainer.innerHTML = '<p class="placeholder-text">Selecione uma data acima para ver os horários.</p>';
    }
    
    const nextBtn2 = document.getElementById('next-step-2');
    if (nextBtn2) {
        nextBtn2.disabled = true;
    }
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}