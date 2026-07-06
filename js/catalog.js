/* catalog.js - Módulo de Gerenciamento do Catálogo da plataforma AgendaFácil */

document.addEventListener('DOMContentLoaded', () => {
  const elements = {
    catalogGrid: document.getElementById('catalog-grid-items'),
    btnFilterAll: document.getElementById('catalog-filter-all'),
    btnFilterProducts: document.getElementById('catalog-filter-produtos'),
    btnFilterServices: document.getElementById('catalog-filter-servicos'),
    
    // Modal
    btnAddItem: document.getElementById('btn-add-item'),
    productModalOverlay: document.getElementById('product-modal-overlay'),
    btnCloseProductModal: document.getElementById('btn-close-product-modal'),
    btnCancelProductModal: document.getElementById('btn-cancel-product-modal'),
    formProduct: document.getElementById('form-product'),
    modalProductTitle: document.getElementById('modal-product-title'),
    
    // Inputs modal
    productIdField: document.getElementById('product-id-field'),
    productNameField: document.getElementById('product-name-field'),
    productTypeField: document.getElementById('product-type-field'),
    productCategoryField: document.getElementById('product-category-field'),
    productPriceField: document.getElementById('product-price-field'),
    productDurationField: document.getElementById('product-duration-field'),
    productDurationGroup: document.getElementById('product-duration-group'),
    productDescField: document.getElementById('product-desc-field'),
    productFileInput: document.getElementById('product-file-input'),
    productImgPreview: document.getElementById('product-img-preview'),
    fileUploadPlaceholder: document.getElementById('file-upload-placeholder')
  };

  let filterType = 'todos'; // todos, produto, servico
  let currentBase64Image = '';

  function init() {
    setupFilters();
    setupModalEvents();
    renderCatalog();
  }

  // Configura filtros de tipo de catálogo
  function setupFilters() {
    const filters = [
      { btn: elements.btnFilterAll, val: 'todos' },
      { btn: elements.btnFilterProducts, val: 'produto' },
      { btn: elements.btnFilterServices, val: 'servico' }
    ];

    filters.forEach(item => {
      item.btn.addEventListener('click', () => {
        filters.forEach(i => i.btn.classList.remove('active'));
        item.btn.classList.add('active');
        filterType = item.val;
        renderCatalog();
      });
    });

    // Controla visibilidade do campo Duração baseado no Tipo do item no formulário
    elements.productTypeField.addEventListener('change', (e) => {
      elements.productDurationGroup.style.display = e.target.value === 'servico' ? 'block' : 'none';
    });
  }

  // Renderiza a grade de itens
  function renderCatalog() {
    const products = window.store.getProducts();
    elements.catalogGrid.innerHTML = '';

    const filtered = filterType === 'todos' 
      ? products 
      : products.filter(p => p.type === filterType);

    if (filtered.length === 0) {
      elements.catalogGrid.innerHTML = `<div class="text-center w-full p-8 text-muted">Nenhum item cadastrado.</div>`;
      return;
    }

    filtered.forEach(p => {
      const card = document.createElement('div');
      card.className = 'card card-hover catalog-card';
      
      const priceFormatted = p.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
      const infoText = p.type === 'servico' ? `⏱️ ${p.duration} min` : 'Venda Física';

      card.innerHTML = `
        <img src="${p.image}" alt="${p.name}" class="catalog-img">
        <div class="catalog-body">
          <div class="flex justify-between align-center" style="margin-bottom:0.25rem;">
            <h4 style="font-size:1.1rem;">${p.name}</h4>
            <span class="badge ${p.type === 'servico' ? 'badge-info' : 'badge-success'}" style="font-size:0.65rem;">
              ${p.type === 'servico' ? 'Serviço' : 'Produto'}
            </span>
          </div>
          <span class="text-dim" style="font-size: 0.8rem; margin-bottom: 0.5rem;">${infoText} • ${p.category}</span>
          <p class="text-muted" style="font-size:0.875rem; flex:1; margin-bottom: 0.75rem;">${p.desc || 'Sem descrição.'}</p>
          <div class="flex justify-between align-center" style="margin-top:auto;">
            <span style="font-weight: 700; font-size:1.15rem;">${priceFormatted}</span>
            <div class="flex gap-2">
              <button class="btn btn-outline btn-sm btn-edit" data-id="${p.id}" style="padding:0.4rem;">
                Editar
              </button>
              <button class="btn btn-danger btn-sm btn-delete" data-id="${p.id}" style="padding:0.4rem;">
                Excluir
              </button>
            </div>
          </div>
        </div>
      `;
      elements.catalogGrid.appendChild(card);
    });

    // Associa eventos de clique nos botões dinâmicos
    elements.catalogGrid.querySelectorAll('.btn-edit').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.getAttribute('data-id');
        openEditModal(id);
      });
    });

    elements.catalogGrid.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.getAttribute('data-id');
        if (confirm('Tem certeza que deseja excluir este item permanentemente?')) {
          window.store.deleteProduct(id);
          renderCatalog();
        }
      });
    });
  }

  // Gerenciamento do Modal de Criação / Edição
  function setupModalEvents() {
    elements.btnAddItem.addEventListener('click', () => openCreateModal());
    elements.btnCloseProductModal.addEventListener('click', closeModal);
    elements.btnCancelProductModal.addEventListener('click', closeModal);
    
    // Leitura e visualização da imagem
    elements.productFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          currentBase64Image = event.target.result;
          elements.productImgPreview.src = currentBase64Image;
          elements.productImgPreview.style.display = 'block';
          elements.fileUploadPlaceholder.style.display = 'none';
        };
        reader.readAsDataURL(file);
      }
    });

    // Envio do formulário (Salvar)
    elements.formProduct.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const id = elements.productIdField.value;
      const name = elements.productNameField.value.trim();
      const type = elements.productTypeField.value;
      const category = elements.productCategoryField.value.trim();
      const price = parseFloat(elements.productPriceField.value);
      const duration = type === 'servico' ? parseInt(elements.productDurationField.value) : 0;
      const desc = elements.productDescField.value.trim();
      
      // Imagem padrão caso o usuário não envie uma
      const defaultImage = type === 'servico'
        ? 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=500&auto=format&fit=crop&q=60'
        : 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=60';
      
      const image = currentBase64Image || defaultImage;

      const itemData = { name, type, category, price, duration, desc, image };

      if (id) {
        itemData.id = id;
        window.store.updateProduct(itemData);
      } else {
        window.store.addProduct(itemData);
      }

      closeModal();
      renderCatalog();
    });
  }

  function openCreateModal() {
    elements.modalProductTitle.textContent = 'Adicionar Item';
    elements.formProduct.reset();
    elements.productIdField.value = '';
    elements.productDurationGroup.style.display = 'none';
    currentBase64Image = '';
    elements.productImgPreview.style.display = 'none';
    elements.fileUploadPlaceholder.style.display = 'block';
    
    elements.productModalOverlay.classList.add('active');
  }

  function openEditModal(id) {
    const products = window.store.getProducts();
    const product = products.find(p => p.id === id);
    if (!product) return;

    elements.modalProductTitle.textContent = 'Editar Item';
    elements.productIdField.value = product.id;
    elements.productNameField.value = product.name;
    elements.productTypeField.value = product.type;
    elements.productCategoryField.value = product.category;
    elements.productPriceField.value = product.price;
    elements.productDescField.value = product.desc || '';
    
    if (product.type === 'servico') {
      elements.productDurationGroup.style.display = 'block';
      elements.productDurationField.value = product.duration;
    } else {
      elements.productDurationGroup.style.display = 'none';
    }

    currentBase64Image = product.image;
    elements.productImgPreview.src = product.image;
    elements.productImgPreview.style.display = 'block';
    elements.fileUploadPlaceholder.style.display = 'none';

    elements.productModalOverlay.classList.add('active');
  }

  function closeModal() {
    elements.productModalOverlay.classList.remove('active');
  }

  // Expõe a renderização para ser chamada de fora
  window.renderCatalog = renderCatalog;

  init();
});
