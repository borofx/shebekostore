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

    if (!productOneSelect || !comparisonDataScript?.textContent) return;

    const comparisonData = JSON.parse(comparisonDataScript.textContent);

    productOneSelect.replaceChildren();
    productOneSelect.disabled = comparisonData.products.length === 0;

    populateProductSelect(productOneSelect, comparisonData.products);
  }
}

if (!customElements.get('product-compare')) {
  customElements.define('product-compare', ProductComparison);
}