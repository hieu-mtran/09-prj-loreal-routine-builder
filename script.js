/* Get references to DOM elements */
const categoryFilter = document.getElementById("categoryFilter");
const productSearch = document.getElementById("productSearch");
const clearSearchBtn = document.getElementById("clearSearch");
const productsContainer = document.getElementById("productsContainer");
const selectedProductsList = document.getElementById("selectedProductsList");
const generateRoutineBtn = document.getElementById("generateRoutine");
const clearAllBtn = document.getElementById("clearAllBtn");
const chatForm = document.getElementById("chatForm");
const chatWindow = document.getElementById("chatWindow");

/* Array to store selected products */
let selectedProducts = [];

/* Array to store conversation history */
let conversationHistory = [];

/* Store all products for filtering */
let allProducts = [];

/* Load selected products from localStorage on page load */
function loadSelectedProductsFromStorage() {
  try {
    const savedProducts = localStorage.getItem('loreal-selected-products');
    if (savedProducts) {
      selectedProducts = JSON.parse(savedProducts);
    }
  } catch (error) {
    console.error('Error loading selected products from localStorage:', error);
    selectedProducts = [];
  }
}

/* Save selected products to localStorage */
function saveSelectedProductsToStorage() {
  try {
    localStorage.setItem('loreal-selected-products', JSON.stringify(selectedProducts));
  } catch (error) {
    console.error('Error saving selected products to localStorage:', error);
  }
}

/* Clear all selected products */
function clearAllSelectedProducts() {
  /* Clear the selectedProducts array */
  selectedProducts = [];
  
  /* Remove from localStorage */
  try {
    localStorage.removeItem('loreal-selected-products');
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
  
  /* Remove selected class from all visible product cards */
  const allProductCards = document.querySelectorAll('.product-card.selected');
  allProductCards.forEach(card => {
    card.classList.remove('selected');
  });
  
  /* Update the display */
  updateSelectedProductsDisplay();
}

/* Show initial placeholder until user selects a category */
productsContainer.innerHTML = `
  <div class="placeholder-message">
    Select a category to view products
  </div>
`;

/* Load saved selected products from localStorage */
loadSelectedProductsFromStorage();

/* Initialize selected products section */
updateSelectedProductsDisplay();

/* Initialize products on page load */
loadProducts();

/* Load product data from JSON file */
async function loadProducts() {
  const response = await fetch("products.json");
  const data = await response.json();
  allProducts = data.products; // Store all products for filtering
  return data.products;
}

/* Filter products based on category and search term */
function filterProducts() {
  const selectedCategory = categoryFilter.value;
  const searchTerm = productSearch.value.toLowerCase().trim();
  
  let filteredProducts = allProducts;
  
  /* Filter by category if selected */
  if (selectedCategory) {
    filteredProducts = filteredProducts.filter(
      product => product.category === selectedCategory
    );
  }
  
  /* Filter by search term if provided */
  if (searchTerm) {
    filteredProducts = filteredProducts.filter(product => 
      product.name.toLowerCase().includes(searchTerm) ||
      product.brand.toLowerCase().includes(searchTerm) ||
      product.description.toLowerCase().includes(searchTerm) ||
      product.category.toLowerCase().includes(searchTerm)
    );
  }
  
  /* Show/hide clear search button */
  clearSearchBtn.style.display = searchTerm ? 'flex' : 'none';
  
  /* Display filtered products or show appropriate message */
  if (filteredProducts.length === 0) {
    if (searchTerm && !selectedCategory) {
      productsContainer.innerHTML = `
        <div class="placeholder-message">
          No products found matching "${searchTerm}". Try a different search term or select a category first.
        </div>
      `;
    } else if (searchTerm && selectedCategory) {
      productsContainer.innerHTML = `
        <div class="placeholder-message">
          No products found in "${selectedCategory}" category matching "${searchTerm}".
        </div>
      `;
    } else if (!selectedCategory) {
      productsContainer.innerHTML = `
        <div class="placeholder-message">
          Select a category to view products
        </div>
      `;
    } else {
      productsContainer.innerHTML = `
        <div class="placeholder-message">
          No products found in the "${selectedCategory}" category.
        </div>
      `;
    }
  } else {
    displayProducts(filteredProducts);
  }
}

/* Clear search input and refresh results */
function clearSearch() {
  productSearch.value = '';
  clearSearchBtn.style.display = 'none';
  filterProducts();
}

/* Create HTML for displaying product cards */
function displayProducts(products) {
  productsContainer.innerHTML = products
    .map(
      (product) => {
        /* Check if this product is already selected */
        const isSelected = selectedProducts.some(selected => selected.id === product.id);
        const selectedClass = isSelected ? 'selected' : '';
        
        return `
          <div class="product-card ${selectedClass}" data-product-id="${product.id}">
            <div class="product-content">
              <img src="${product.image}" alt="${product.name}">
              <div class="product-info">
                <h3>${product.name}</h3>
                <p class="brand-name">${product.brand}</p>
                <p class="hover-hint">Hover for details</p>
              </div>
            </div>
            <div class="product-description">
              ${product.description}
            </div>
          </div>
        `;
      }
    )
    .join("");
    
  /* Add click event listeners to all product cards */
  const productCards = document.querySelectorAll('.product-card');
  productCards.forEach(card => {
    /* Add click listener for product selection */
    card.addEventListener('click', () => {
      const productId = parseInt(card.dataset.productId);
      const product = products.find(p => p.id === productId);
      toggleProductSelection(product, card);
    });
  });
}

/* Toggle product selection when clicked */
function toggleProductSelection(product, cardElement) {
  /* Check if product is already selected */
  const existingIndex = selectedProducts.findIndex(selected => selected.id === product.id);
  
  if (existingIndex !== -1) {
    /* Product is already selected, so remove it */
    selectedProducts.splice(existingIndex, 1);
    cardElement.classList.remove('selected');
  } else {
    /* Product is not selected, so add it */
    selectedProducts.push(product);
    cardElement.classList.add('selected');
  }
  
  /* Save to localStorage */
  saveSelectedProductsToStorage();
  
  /* Update the selected products display */
  updateSelectedProductsDisplay();
}

/* Remove product from selected list */
function removeProduct(productId) {
  /* Remove from selectedProducts array */
  selectedProducts = selectedProducts.filter(product => product.id !== productId);
  
  /* Save to localStorage */
  saveSelectedProductsToStorage();
  
  /* Remove selected class from product card if it's currently visible */
  const productCard = document.querySelector(`[data-product-id="${productId}"]`);
  if (productCard) {
    productCard.classList.remove('selected');
  }
  
  /* Update the selected products display */
  updateSelectedProductsDisplay();
}

/* Update the selected products display section */
function updateSelectedProductsDisplay() {
  if (selectedProducts.length === 0) {
    /* Hide the clear all button */
    clearAllBtn.style.display = 'none';
    
    /* Show empty state message */
    selectedProductsList.innerHTML = `
      <div class="selected-products-empty">
        No products selected yet. Click on product cards to add them to your routine.
      </div>
    `;
    /* Disable the generate routine button */
    generateRoutineBtn.disabled = true;
  } else {
    /* Show and update the clear all button */
    clearAllBtn.style.display = 'flex';
    clearAllBtn.innerHTML = `<i class="fa-solid fa-trash"></i> Clear All (${selectedProducts.length})`;
    
    /* Display selected products as simple tags */
    selectedProductsList.innerHTML = `
      <div style="display: flex; flex-wrap: wrap; gap: 10px;">
        ${selectedProducts
          .map(product => `
            <div class="selected-product-item">
              <span>${product.name}</span>
              <button class="remove-btn" onclick="removeProduct(${product.id})" title="Remove ${product.name}">
                ×
              </button>
            </div>
          `)
          .join('')}
      </div>
    `;
    /* Enable the generate routine button */
    generateRoutineBtn.disabled = false;
  }
}

/* Format text with comprehensive markdown-style formatting */
function formatChatText(text) {
  return text
    /* Hyperlinks: [text](url) becomes <a href="url">text</a> */
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" style="color: var(--loreal-red); text-decoration: underline;">$1</a>')
    /* Bold text: **text** becomes <strong>text</strong> */
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    /* Italic text: *text* becomes <em>text</em> */
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    /* Strikethrough: ~~text~~ becomes <del>text</del> */
    .replace(/~~(.*?)~~/g, '<del>$1</del>')
    /* Inline code: `code` becomes <code>code</code> */
    .replace(/`([^`]+)`/g, '<code style="background: #f5f5f5; padding: 2px 4px; border-radius: 3px; font-family: monospace;">$1</code>')
    /* Headers: ### text becomes <h3>text</h3> */
    .replace(/^### (.*$)/gim, '<h3 style="color: var(--loreal-red); margin: 15px 0 10px 0;">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 style="color: var(--loreal-red); margin: 20px 0 15px 0;">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 style="color: var(--loreal-red); margin: 25px 0 20px 0;">$1</h1>')
    /* Line breaks: convert \n to <br> */
    .replace(/\n/g, '<br>')
    /* Numbered lists: 1. becomes proper list items */
    .replace(/(\d+\.\s)/g, '<br><strong style="color: var(--loreal-red);">$1</strong>')
    /* Bullet points: - or • or * becomes styled bullets */
    .replace(/^[\-•*]\s/gm, '<br><span style="color: var(--loreal-gold);">•</span> ')
    /* Sub-bullet points: indented - becomes sub-bullets */
    .replace(/^\s+[\-•*]\s/gm, '<br>&nbsp;&nbsp;<span style="color: var(--loreal-gold);">◦</span> ')
    /* Block quotes: > text becomes styled quote */
    .replace(/^>\s(.*$)/gim, '<blockquote style="border-left: 3px solid var(--loreal-gold); padding-left: 15px; margin: 10px 0; font-style: italic; color: #666;">$1</blockquote>')
    /* Horizontal rules: --- becomes <hr> */
    .replace(/^---$/gm, '<hr style="border: none; border-top: 2px solid var(--loreal-gold); margin: 20px 0;">')
    /* Clean up multiple consecutive <br> tags */
    .replace(/(<br>\s*){3,}/g, '<br><br>');
}

/* Add message to conversation history */
function addToConversationHistory(role, content) {
  conversationHistory.push({
    role: role,
    content: content
  });
}

/* Send chat message to OpenAI API */
async function sendChatMessage(userMessage) {
  try {
    /* Add user message to history */
    addToConversationHistory('user', userMessage);
    
    /* Display user message in chat */
    const userDiv = document.createElement('div');
    userDiv.style.cssText = 'margin-bottom: 15px; padding: 10px; background: #f0f0f0; border-radius: 8px; text-align: right;';
    userDiv.innerHTML = `<strong>You:</strong> ${formatChatText(userMessage)}`;
    chatWindow.appendChild(userDiv);
    
    /* Show loading message */
    const loadingDiv = document.createElement('div');
    loadingDiv.style.cssText = 'margin-bottom: 15px; padding: 10px; background: linear-gradient(135deg, rgba(255, 0, 59, 0.1), rgba(227, 165, 53, 0.1)); border-radius: 8px; border-left: 4px solid var(--loreal-red);';
    loadingDiv.innerHTML = '<strong>L\'Oréal Assistant:</strong> Thinking... 💭';
    chatWindow.appendChild(loadingDiv);
    
    /* Scroll to bottom */
    chatWindow.scrollTop = chatWindow.scrollHeight;

    /* Prepare system prompt and conversation for the new API format */
    const systemPrompt = "You are a professional beauty and skincare expert from L'Oréal. You help users with beauty routines, skincare advice, haircare tips, makeup guidance, and fragrance recommendations. Keep responses helpful, friendly, and professional. Focus only on beauty, skincare, haircare, makeup, and fragrance topics. ALWAYS search the web for the latest L'Oréal product information, current beauty trends, recent product launches, updated ingredient science, and current pricing when providing advice. Use the most recent and accurate information available. Always cite your sources with clickable links.";
    
    /* Combine system prompt with conversation history for input */
    const conversationText = conversationHistory.map(msg => 
      `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
    ).join('\n\n');
    
    const fullInput = systemPrompt + '\n\n' + conversationText;

    /* Send request to Cloudflare Worker */
    const response = await fetch('https://loreal-chatbot.tran-h10.workers.dev/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        input: fullInput,
        enableWebSearch: true
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    /* Remove loading message */
    chatWindow.removeChild(loadingDiv);

    /* Check if we got a valid response */
    if (data.output_text) {
      const assistantMessage = data.output_text;
      
      /* Add assistant response to history */
      addToConversationHistory('assistant', assistantMessage);
      
      /* Display assistant response with citations if available */
      const assistantDiv = document.createElement('div');
      assistantDiv.style.cssText = 'margin-bottom: 15px; padding: 15px; background: linear-gradient(135deg, rgba(255, 0, 59, 0.1), rgba(227, 165, 53, 0.1)); border-radius: 8px; border-left: 4px solid var(--loreal-red);';
      
      /* Format message and handle citations */
      let formattedMessage = formatChatText(assistantMessage);
      
      /* Add citations if web search was used */
      if (data.citations && data.citations.length > 0) {
        const citationsHtml = data.citations.map((citation, index) => 
          `<a href="${citation.url}" target="_blank" style="color: var(--loreal-red); text-decoration: none; font-size: 0.9em;">[${index + 1}] ${citation.title}</a>`
        ).join('<br>');
        
        formattedMessage += `<br><br><div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #ddd; font-size: 0.9em;"><strong>Sources:</strong><br>${citationsHtml}</div>`;
      }
      
      assistantDiv.innerHTML = `<strong style="color: var(--loreal-red);">L'Oréal Assistant:</strong><br>${formattedMessage}`;
      chatWindow.appendChild(assistantDiv);
      
    } else {
      throw new Error('Invalid response format from API');
    }

  } catch (error) {
    /* Remove loading message if it exists */
    const loadingMessages = chatWindow.querySelectorAll('div');
    loadingMessages.forEach(div => {
      if (div.innerHTML.includes('Thinking...')) {
        chatWindow.removeChild(div);
      }
    });
    
    /* Handle any errors */
    console.error('Error sending chat message:', error);
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = 'margin-bottom: 15px; padding: 15px; background: #ffebee; border-radius: 8px; border-left: 4px solid var(--loreal-red); color: var(--loreal-red);';
    errorDiv.innerHTML = '<strong>Error:</strong> Sorry, there was an error processing your message. Please try again.';
    chatWindow.appendChild(errorDiv);
  }
  
  /* Scroll to bottom */
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

/* Generate personalized routine using OpenAI API */
async function generatePersonalizedRoutine() {
  /* Check if products are selected */
  if (selectedProducts.length === 0) {
    chatWindow.innerHTML = '<p style="color: var(--loreal-red);">Please select some products first!</p>';
    return;
  }

  /* Clear previous conversation when generating new routine */
  conversationHistory = [];
  chatWindow.innerHTML = '<p>🔮 Creating your personalized routine...</p>';

  try {
    /* Prepare product data for the API */
    const productDetails = selectedProducts.map(product => ({
      name: product.name,
      brand: product.brand,
      category: product.category,
      description: product.description
    }));

    /* Create the user request message */
    const userRequest = `Please create a personalized beauty routine using these products: ${JSON.stringify(productDetails)}. 

    Include:
    1. Morning routine (if applicable)
    2. Evening routine (if applicable) 
    3. Order of application
    4. Tips for best results
    5. How often to use each product

    Make it easy to follow and explain the benefits of each step.`;

    /* Create the input for the new Responses API format */
    const systemPrompt = "You are a professional beauty and skincare expert from L'Oréal. Create personalized beauty routines based on the products provided. Give clear, step-by-step instructions and explain why each product should be used and when. Keep responses friendly, professional, and helpful. Use formatting like **bold** for headings and important points. ALWAYS search the web for the latest L'Oréal product information, current beauty trends, updated application techniques, recent ingredient research, and current product availability when creating routines. Ensure all advice is based on the most recent and accurate information available. Include citations to your sources.";
    
    const fullInput = systemPrompt + '\n\nUser Request: ' + userRequest;

    /* Send request to Cloudflare Worker */
    const response = await fetch('https://loreal-chatbot.tran-h10.workers.dev/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        input: fullInput,
        enableWebSearch: true
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    /* Check if we got a valid response */
    if (data.output_text) {
      /* Get the AI-generated routine */
      const routineContent = data.output_text;
      
      /* Add to conversation history */
      addToConversationHistory('user', userRequest);
      addToConversationHistory('assistant', routineContent);
      
      /* Format citations if web search was used */
      let citationsHtml = '';
      if (data.citations && data.citations.length > 0) {
        const citationsList = data.citations.map((citation, index) => 
          `<a href="${citation.url}" target="_blank" style="color: var(--loreal-red); text-decoration: none;">[${index + 1}] ${citation.title}</a>`
        ).join('<br>');
        
        citationsHtml = `
          <div style="margin-top: 15px; padding: 15px; background: #f9f9f9; border-radius: 8px; border-left: 4px solid var(--loreal-gold);">
            <p style="margin: 0 0 10px 0; font-weight: bold; color: var(--dark-gray);">📖 Sources:</p>
            ${citationsList}
          </div>
        `;
      }
      
      /* Display the AI-generated routine with formatting */
      chatWindow.innerHTML = `
        <div style="border: 2px solid var(--loreal-red); border-radius: 8px; padding: 20px; background: linear-gradient(135deg, rgba(255, 0, 59, 0.05), rgba(227, 165, 53, 0.05)); margin-bottom: 20px;">
          <h3 style="color: var(--loreal-red); margin-top: 0;">✨ Your Personalized L'Oréal Routine</h3>
          <div style="line-height: 1.6;">${formatChatText(routineContent)}</div>
          ${citationsHtml}
        </div>
        <div style="padding: 15px; background: #f9f9f9; border-radius: 8px; border-left: 4px solid var(--loreal-gold);">
          <p style="margin: 0; font-style: italic; color: var(--dark-gray);">
            💬 Have questions about your routine? Ask me anything about skincare, haircare, makeup, or how to use these products!
          </p>
        </div>
      `;
    } else {
      throw new Error('Invalid response format from API');
    }

  } catch (error) {
    /* Handle any errors */
    console.error('Error generating routine:', error);
    chatWindow.innerHTML = `
      <p style="color: var(--loreal-red);">
        Sorry, there was an error generating your routine. Please try again later.
      </p>
    `;
  }
}

/* Filter and display products when category changes */
categoryFilter.addEventListener("change", async (e) => {
  if (allProducts.length === 0) {
    await loadProducts(); // Load products if not already loaded
  }
  filterProducts();
});

/* Search products as user types */
productSearch.addEventListener("input", async () => {
  if (allProducts.length === 0) {
    await loadProducts(); // Load products if not already loaded
  }
  filterProducts();
});

/* Clear search when clear button is clicked */
clearSearchBtn.addEventListener("click", clearSearch);

/* Generate routine button event listener */
generateRoutineBtn.addEventListener("click", generatePersonalizedRoutine);

/* Chat form submission handler */
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  /* Get user input */
  const userInput = document.getElementById("userInput");
  const message = userInput.value.trim();

  /* Check if message is not empty */
  if (!message) {
    return;
  }

  /* Clear input field */
  userInput.value = "";

  /* Send message to chat */
  await sendChatMessage(message);
});
