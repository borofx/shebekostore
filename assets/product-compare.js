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
    const productOneSelect = this.querySelector('select[data-product-one]');
    const productTwoSelect = this.querySelector('select[data-product-two]');
    const comparisonDataScript = this.querySelector('script[type="application/json"]');
    const productOneSearchInput = this.querySelector('input[data-search-one]');
    const productTwoSearchInput = this.querySelector('input[data-search-two]');
    const noResultsMessage = this.querySelector('[data-no-results]');
    const productTwoNoResultsMessage = this.querySelector('[data-no-results-two]');
    if (
      !(productOneSelect instanceof HTMLSelectElement) ||
      !(productTwoSelect instanceof HTMLSelectElement) ||
      !(productOneSearchInput instanceof HTMLInputElement) ||
      !(productTwoSearchInput instanceof HTMLInputElement) ||
      !(noResultsMessage instanceof HTMLElement) ||
      !(productTwoNoResultsMessage instanceof HTMLElement)
    ) return;

    noResultsMessage.hidden = true;
    productOneSelect.replaceChildren();
    productOneSelect.disabled = true;
    productTwoSelect.replaceChildren();
    productTwoSelect.disabled = true;
    productOneSearchInput.disabled = true;
    productOneSearchInput.oninput = null;
    productTwoSearchInput.disabled = true;
    productTwoSearchInput.oninput = null;

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
      if (!Number.isSafeInteger(product?.id) ||
        typeof product?.title !== 'string' ||
        typeof product?.type !== 'string'
      ) {
        return;
      }
    }

    /** @type {Array<{ id: number, title: string, type: string }>} */
    const products = comparisonData.products;
    productOneSearchInput.disabled = false;
    productOneSelect.disabled = products.length === 0;

    populateProductSelect(productOneSelect, products);

    const updateProductTwoOptions = () => {
      const previousProductTwoId = productTwoSelect.value;
      const selectedProduct = products.find(
        product => String(product.id) === productOneSelect.value
      );

      productTwoSelect.replaceChildren();
      productTwoSelect.disabled = true;
      productTwoSearchInput.disabled = true;
      productTwoNoResultsMessage.hidden = true;

      if (!selectedProduct) return;

      productTwoSearchInput.disabled = false;

      const compatibleProducts = products.filter(
        product => product.type === selectedProduct.type
      );
      const searchQuery = productTwoSearchInput.value.trim().toLowerCase();

      const matchingProducts = compatibleProducts.filter(
        product => product.title.toLowerCase().includes(searchQuery)
      );
      populateProductSelect(productTwoSelect, matchingProducts);
      const previousSelectionIsValid = matchingProducts.some(
        product => String(product.id) === previousProductTwoId
      );

      if (previousSelectionIsValid) {
        productTwoSelect.value = previousProductTwoId;
      } else {
        productTwoSelect.value = '';
      }

      productTwoSelect.disabled = matchingProducts.length === 0;
      productTwoNoResultsMessage.hidden =
              searchQuery === '' || matchingProducts.length > 0;
    };
    productOneSelect.onchange = updateProductTwoOptions;
    productTwoSearchInput.oninput = updateProductTwoOptions;
    updateProductTwoOptions();

    productOneSearchInput.oninput = () => {
      const searchQuery = productOneSearchInput.value.trim().toLowerCase();

      const matchingProducts = products.filter(
        product => product.title.toLowerCase().includes(searchQuery)
      );

      productOneSelect.replaceChildren();
      populateProductSelect(productOneSelect, matchingProducts);
      productOneSelect.disabled = matchingProducts.length === 0;
      noResultsMessage.hidden = (searchQuery === '' || matchingProducts.length > 0);
      updateProductTwoOptions();
    };
  }
}

if (!customElements.get('product-compare')) {
  customElements.define('product-compare', ProductComparison);
}