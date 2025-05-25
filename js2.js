        // Variáveis globais
        let cart = [];
        let currentPage = 'main';
        // IDs dos serviços (para controle de quantidades)
        const SERVICE_IDS = {
            COMPUTER_REPAIR: 'servico_computador',
            PHONE_REPAIR: 'servico_smartphone'
        };
        // Função para alternar entre abas de produtos
        function showTab(tabId) {
            document.querySelectorAll('.tab-content').forEach(tab => {
                tab.classList.remove('active');
            });
            document.getElementById(tabId).classList.add('active');

            // Fechar menu mobile após selecionar uma aba
            document.getElementById('mobile-menu').classList.remove('show');
        }

        // Função para alternar menu mobile
        document.getElementById('mobile-menu-button').addEventListener('click', function () {
            const menu = document.getElementById('mobile-menu');
            menu.classList.toggle('show');
        });

        // Função para formatar preço
        function formatPrice(price) {
            return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);
        }

        // Função para adicionar item ao carrinho (atualizada)
function addToCart(name, price, image, type = 'product', serviceId = null) {
    // Verifica se é um plano que não pode ser duplicado
    if (type === 'plan') {
        if (cart.some(item => item.type === 'plan')) {
            showNotification('Você só pode ter um plano no carrinho. Remova o plano atual para alterar.');
            return;
        }
        
        // Adiciona o plano
        cart.push({
            name,
            price,
            image,
            quantity: 1,
            type: 'plan'
        });
        updateCart();
        showNotification("Plano adicionado ao carrinho");
        goToCart();
        return;
    }

    // Verifica se é um serviço com quantidade limitada
    if (type === 'service' && serviceId) {
        const existingService = cart.find(item => 
            item.type === 'service' && 
            item.serviceId === serviceId
        );

        if (existingService) {
            // Aumenta a quantidade do serviço existente
            existingService.quantity += 1;
            updateCart();
            showNotification(`Quantidade do serviço ${name} aumentada para ${existingService.quantity}`);
            goToCart();
            return;
        }

        // Verifica se já tem outro serviço do mesmo tipo
        if (cart.some(item => item.serviceId === serviceId)) {
            showNotification('Você já possui este serviço no carrinho');
            return;
        }

        // Adiciona novo serviço
        const newItem = {
            name,
            price,
            image,
            quantity: 1,
            type: 'service',
            serviceId
        };
        cart.push(newItem);
        updateCart();
        showNotification("Serviço adicionado ao carrinho");
        goToCart();
        return;
    }

    // Lógica para produtos normais
    const existingItem = cart.find(item =>
        item.name === name &&
        item.type === 'product' // Apenas produtos normais podem ser duplicados
    );

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            name,
            price,
            image,
            quantity: 1,
            type: 'product'
        });
    }
    updateCart();
    showNotification(`${name} foi adicionado ao carrinho!`);
}

        // Função para atualizar o carrinho
        function updateCart() {
            const cartCount = document.getElementById('cart-count');
            cartCount.textContent = cart.reduce((total, item) => total + item.quantity, 0);

            // Atualizar página do carrinho se estiver visível
            if (currentPage === 'cart') {
                renderCartItems();
            }

            // Atualizar página de checkout se estiver visível
            if (currentPage === 'checkout') {
                renderCheckoutItems();
            }
        }

        // Função para renderizar itens do carrinho (atualizada)
        function renderCartItems() {
            const container = document.getElementById('cart-items-container');
            const emptyMessage = document.getElementById('empty-cart-message');
            const checkoutBtn = document.getElementById('checkout-btn');

            if (cart.length === 0) {
                container.innerHTML = '<p class="text-center text-gray-500 py-8" id="empty-cart-message">Seu carrinho está vazio</p>';
                checkoutBtn.disabled = true;
                return;
            }

            emptyMessage?.remove();
            checkoutBtn.disabled = false;

            let html = '';
            let total = 0;

            cart.forEach((item, index) => {
                const itemTotal = item.price * item.quantity;
                total += itemTotal;

                // Determina o tipo de item para exibição
                let typeBadge = '';
                if (item.type === 'service') {
                    typeBadge = '<span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">SERVIÇO</span>';
                } else if (item.type === 'plan') {
                    typeBadge = '<span class="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">PLANO</span>';
                }

                html += `
                <div class="flex items-center py-4 border-b border-gray-200">
                    <div class="flex-shrink-0 w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
                        <img src="${item.image}" alt="${item.name}" class="w-full h-full object-cover">
                    </div>
                    <div class="ml-4 flex-grow">
                        <div class="flex items-center">
                            <h4 class="font-medium">${item.name}</h4>
                            <div class="ml-2">${typeBadge}</div>
                        </div>
                        <p class="text-primary font-semibold">${formatPrice(item.price)}</p>
                    </div>
                    <div class="flex items-center">
                        ${item.type === 'plan' ?
                        '<span class="text-gray-500 px-4">1x</span>' :
                        `<button onclick="updateQuantity(${index}, -1)" class="quantity-btn rounded-l-lg">-</button>
                             <input type="text" value="${item.quantity}" class="quantity-input" readonly>
                             <button onclick="updateQuantity(${index}, 1)" class="quantity-btn rounded-r-lg">+</button>`
                    }
                    </div>
                    <div class="ml-6 w-24 text-right">
                        <p class="font-semibold">${formatPrice(itemTotal)}</p>
                    </div>
                    <button onclick="removeFromCart(${index})" class="ml-4 text-red-500 hover:text-red-700">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            });

            container.innerHTML = html;
            document.getElementById('cart-total').textContent = formatPrice(total);
        }

        // Função para atualizar quantidade
        function updateQuantity(index, change) {
            // Não permite alterar quantidade de planos
            if (cart[index].type === 'plan') return;

            const newQuantity = cart[index].quantity + change;

            if (newQuantity < 1) {
                removeFromCart(index);
                return;
            }

            cart[index].quantity = newQuantity;
            updateCart();
        }

        // Função para remover item do carrinho
        function removeFromCart(index) {
            const removedItem = cart.splice(index, 1)[0];
            updateCart();
            showNotification(`${removedItem.name} foi removido do carrinho`);
        }

        // Função para mostrar notificação
        function showNotification(message) {
            const notification = document.createElement('div');
            notification.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg animate-fade-in-up';
            notification.textContent = message;
            document.body.appendChild(notification);

            setTimeout(() => {
                notification.classList.add('animate-fade-out');
                setTimeout(() => notification.remove(), 500);
            }, 3000);
        }

        // Função para ir para a página do carrinho
        function goToCart() {
            document.getElementById('main-page').classList.add('hidden');
            document.getElementById('cart-page').classList.remove('hidden');
            document.getElementById('checkout-page').classList.add('hidden');
            currentPage = 'cart';
            renderCartItems();
        }

        // Função para voltar aos produtos
        function goBackToProducts() {
            document.getElementById('main-page').classList.remove('hidden');
            document.getElementById('cart-page').classList.add('hidden');
            document.getElementById('checkout-page').classList.add('hidden');
            currentPage = 'main';
        }

        // Função para ir para o checkout
        function goToCheckout() {
            document.getElementById('main-page').classList.add('hidden');
            document.getElementById('cart-page').classList.add('hidden');
            document.getElementById('checkout-page').classList.remove('hidden');
            currentPage = 'checkout';
            renderCheckoutItems();
        }

        // Função para voltar ao carrinho
        function goBackToCart() {
            document.getElementById('main-page').classList.add('hidden');
            document.getElementById('cart-page').classList.remove('hidden');
            document.getElementById('checkout-page').classList.add('hidden');
            currentPage = 'cart';
        }

        // Função para renderizar itens no checkout (atualizada)
        function renderCheckoutItems() {
            const container = document.getElementById('checkout-items-container');
            let html = '';
            let subtotal = 0;

            cart.forEach(item => {
                const itemTotal = item.price * item.quantity;
                subtotal += itemTotal;

                html += `
                <div class="flex items-center py-4 border-b border-gray-200">
                    <div class="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                        <img src="${item.image}" alt="${item.name}" class="w-full h-full object-cover">
                    </div>
                    <div class="ml-4 flex-grow">
                        <h4 class="font-medium">${item.name}</h4>
                        <div class="flex items-center mt-1">
                            <span class="text-gray-600">${item.quantity}x</span>
                            <span class="text-primary font-semibold ml-2">${formatPrice(item.price)}</span>
                        </div>
                    </div>
                    <div class="ml-6 w-24 text-right">
                        <p class="font-semibold">${formatPrice(itemTotal)}</p>
                    </div>
                </div>
            `;
            });

            container.innerHTML = html;
            document.getElementById('checkout-subtotal').textContent = formatPrice(subtotal);
            document.getElementById('checkout-total').textContent = formatPrice(subtotal);
        }

        // Função para gerar PDF e enviar para WhatsApp
        function generatePDFAndSend() {
            // Validar formulário
            const name = document.getElementById('checkout-name').value;
            const cpf = document.getElementById('checkout-cpf').value;
            const email = document.getElementById('checkout-email').value;
            const phone = document.getElementById('checkout-phone').value;

            if (!name || !cpf || !email || !phone) {
                showNotification('Por favor, preencha todos os campos obrigatórios');
                return;
            }

            const element = document.getElementById('checkout-page');
            const opt = {
                margin: 10,
                filename: 'pedido_nicktech.pdf',
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2 },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };

            // Gerar PDF
            html2pdf().set(opt).from(element).save().then(() => {
                // Mensagem para WhatsApp
                let message = `Olá, gostaria de finalizar este pedido:\n\n`;
                message += `Cliente: ${name}\n`;
                message += `CPF: ${cpf}\n`;
                message += `E-mail: ${email}\n`;
                message += `Telefone: ${phone}\n\n`;
                message += `Itens do Pedido:\n`;

                cart.forEach(item => {
                    message += `${item.quantity}x ${item.name} - ${formatPrice(item.price)} cada\n`;
                    if (item.type === 'service') {
                        message += `  (Serviço técnico)\n`;
                    } else if (item.type === 'plan') {
                        message += `  (Plano mensal)\n`;
                    }
                });

                message += `\nTotal: ${document.getElementById('checkout-total').textContent}\n`;
                message += "\nPor favor, confirme os dados e me informe as próximas etapas.";

                // Codificar mensagem para URL
                const encodedMessage = encodeURIComponent(message);

                // Redirecionar para WhatsApp
                window.open(`https://wa.me/5519999307916?text=${encodedMessage}`, '_blank');
            });
        }

        // Event Listeners
        document.addEventListener('DOMContentLoaded', function () {
            // Atualizar carrinho ao carregar a página
            updateCart();

            // Botão de checkout no carrinho
            document.getElementById('checkout-btn').addEventListener('click', goToCheckout);

            // Botão de gerar PDF e enviar para WhatsApp
            document.getElementById('generate-pdf-btn').addEventListener('click', generatePDFAndSend);

            // Formulário de contato
            document.getElementById('contact-form').addEventListener('submit', function (e) {
                e.preventDefault();
                showNotification('Mensagem enviada com sucesso! Entraremos em contato em breve.');
                this.reset();
            });

            // Formulário de newsletter
            document.getElementById('newsletter-form').addEventListener('submit', function (e) {
                e.preventDefault();
                showNotification('Obrigado por assinar nossa newsletter!');
                this.reset();
            });
        });
