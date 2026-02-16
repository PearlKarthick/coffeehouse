async function renderProducts(){
  try{
    const res = await fetch('data/products.json');
    const items = await res.json();
    // Home top 3
    const homeEl = document.getElementById('home-products');
    if (homeEl){
      homeEl.innerHTML = items.slice(0,3).map(p => {
        const priceHtml = p.price ? ('<div class="price">₹' + p.price + '</div>') : '';
        return (
          '<article class="card">' +
            '<img src="' + p.image + '" alt="' + p.name + '" loading="lazy"/>' +
            '<h3>' + p.name + '</h3>' +
            '<p class="muted">' + p.description + '</p>' + priceHtml +
          '</article>'
        );
      }).join('');
    }
    // Products page full list
    const listEl = document.getElementById('products-list');
    if (listEl){
      listEl.innerHTML = items.map(p => {
        const priceHtml = p.price ? ('<div class="price">₹' + p.price + '</div>') : '';
        return (
          '<article class="card product-card">' +
            '<img src="' + p.image + '" alt="' + p.name + '" loading="lazy"/>' +
            '<h3>' + p.name + '</h3>' +
            '<p class="muted">' + p.description + '</p>' + priceHtml +
          '</article>'
        );
      }).join('');
    }
  }catch(err){
    const el = document.getElementById('products-list') || document.getElementById('home-products');
    if (el) el.innerHTML = '<p>Unable to load products right now.</p>';
  }
}

document.addEventListener('DOMContentLoaded', renderProducts);
