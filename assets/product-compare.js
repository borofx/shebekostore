/**
 * @param {HTMLSelectElement} selectElement
 * @param {Array<{ id: number, title: string }>} products
 */

function populateProductSelect(selectElement, products){
 for(const product of products){
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

    if (!productOneSelect) return;

    productOneSelect.replaceChildren();
    productOneSelect.disabled = true;

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

    productOneSelect.disabled = comparisonData.products.length === 0;

    populateProductSelect(productOneSelect, comparisonData.products);
  }
}

if (!customElements.get('product-compare')) {
  customElements.define('product-compare', ProductComparison);
}