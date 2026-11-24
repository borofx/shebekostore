/**
 * @param {HTMLSelectElement} selectElement
 * @param {Array<{ id: number, title: string }>} products
 */

function populateProductSelect(selectElement, products) {
  for (const product of products) {
    const option = document.createElement('option');

    option.textContent = product.title;
    option.value = String(product.id);

    selectElement.append(option);
  }
}

class ProductComparison extends HTMLElement {
  connectedCallback() {
    const productOneSelect = this.querySelector('select');
    const comparisonDataScript = this.querySelector('script[type="application/json"]');
    const productOneSearchInput = this.querySelector('input');
    const noResultsMessage = this.querySelector('[data-no-results]');

    if (
      !productOneSelect ||
      !productOneSearchInput ||
      !(noResultsMessage instanceof HTMLElement)
    ) return;

    noResultsMessage.hidden = true;
    productOneSelect.replaceChildren();
    productOneSelect.disabled = true;
    productOneSearchInput.disabled = true;
    productOneSearchInput.oninput = null;

    let comparisonData;
    try {
      comparisonData = JSON.parse(comparisonDataScript?.textContent ?? '');
    } catch {
      return;
    }

    if (!Array.isArray(comparisonData?.products)) {
      return;
    }

    for (const product of comparisonData.products) {
      if (!Number.isSafeInteger(product?.id) || typeof product?.title !== 'string') {
        return;
      }
    }

    /** @type {Array<{ id: number, title: string }>} */
    const products = comparisonData.products;
    productOneSearchInput.disabled = false;
    productOneSelect.disabled = products.length === 0;

    populateProductSelect(productOneSelect, products);

    productOneSearchInput.oninput = () => {
      const searchQuery = productOneSearchInput.value.trim().toLowerCase();

      const matchingProducts = products.filter(
        product => product.title.toLowerCase().includes(searchQuery)
      );

      productOneSelect.replaceChildren();
      populateProductSelect(productOneSelect, matchingProducts);
      productOneSelect.disabled = matchingProducts.length === 0;
      noResultsMessage.hidden = (searchQuery === '' || matchingProducts.length > 0);
    };
  }
}

if (!customElements.get('product-compare')) {
  customElements.define('product-compare', ProductComparison);
}