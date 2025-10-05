// Lightweight client-side script for cart and contact form
// A much simpler script for teaching purposes.
// It supports: Add-to-Cart, showing cart count, rendering the cart page, and a demo contact submit.

// Use a single global object to keep code easy to read.
const SimpleCart = {
  key: 'petpals_cart',
  // Read cart from localStorage (or return empty array)
  read(){
    try { return JSON.parse(localStorage.getItem(this.key)) || []; } catch(e){ return []; }
  },
  // Save cart to localStorage
  write(cart){ localStorage.setItem(this.key, JSON.stringify(cart)); },
  // Add an item (if exists, increase qty)
  add(item){
    const cart = this.read();
    const found = cart.find(i=>i.id===item.id);
    if(found) found.qty = (found.qty||1) + 1; else cart.push(Object.assign({qty:1}, item));
    this.write(cart); this.updateBadge();
  },
  // Remove item by id
  remove(id){ const cart = this.read().filter(i=>i.id!==id); this.write(cart); this.updateBadge(); },
  // Set quantity
  setQty(id, qty){ const cart = this.read(); const it = cart.find(i=>i.id===id); if(it) it.qty = Math.max(1, qty); this.write(cart); this.updateBadge(); },
  // Simple helper to format currency
  money(n){ return '₹' + Number(n).toLocaleString('en-IN'); },
  // Update small badge in navbar
  updateBadge(){ const badge = document.querySelector('.cart-badge'); if(!badge) return; const total = this.read().reduce((s,i)=>s+(i.qty||0),0); badge.textContent = total; },
  // Render cart page into #cart-list
  renderCart(){
    const root = document.getElementById('cart-list'); if(!root) return;
    const cart = this.read(); root.innerHTML = '';
    if(cart.length===0){ root.innerHTML = '<p class="text-muted">Your cart is empty.</p>'; this.updateTotals(); return; }
    cart.forEach(item=>{
      const card = document.createElement('div'); card.className='card cart-card mb-3';
      card.innerHTML = `<div class="d-flex align-items-center cart-item" data-id="${item.id}" data-price="${item.price}">
        <img src="${item.image||'images/image1.png'}" style="width:96px;height:96px;object-fit:cover;border-radius:8px;margin-right:1rem;">
        <div class="flex-grow-1">
          <h6 class="mb-1">${item.name}</h6>
          <div class="d-flex align-items-center">
            <button class="btn btn-sm btn-outline-secondary me-2 decrease">-</button>
            <input type="number" class="form-control form-control-sm me-2 qty" style="width:72px" value="${item.qty}" min="1">
            <button class="btn btn-sm btn-outline-secondary me-3 increase">+</button>
            <strong class="price">${this.money(item.price)}</strong>
          </div></div>
        <button class="btn btn-sm btn-danger ms-3 remove">Remove</button>
      </div>`;
      root.appendChild(card);
    });
    // wire simple controls
    root.querySelectorAll('.increase').forEach(b=>b.onclick = (e)=>{ const itm = e.target.closest('.cart-item'); const id=itm.dataset.id; const q=itm.querySelector('.qty'); q.value = Number(q.value)+1; SimpleCart.setQty(id, Number(q.value)); SimpleCart.updateTotals(); });
    root.querySelectorAll('.decrease').forEach(b=>b.onclick = (e)=>{ const itm = e.target.closest('.cart-item'); const id=itm.dataset.id; const q=itm.querySelector('.qty'); q.value = Math.max(1, Number(q.value)-1); SimpleCart.setQty(id, Number(q.value)); SimpleCart.updateTotals(); });
    root.querySelectorAll('.qty').forEach(i=>i.onchange = (e)=>{ const itm = e.target.closest('.cart-item'); SimpleCart.setQty(itm.dataset.id, Number(e.target.value)); SimpleCart.updateTotals(); });
    root.querySelectorAll('.remove').forEach(b=>b.onclick = (e)=>{ const card = e.target.closest('.card'); const id = card.querySelector('.cart-item').dataset.id; SimpleCart.remove(id); card.remove(); SimpleCart.updateTotals(); });
    this.updateTotals();
  },
  // Update totals in the summary area
  updateTotals(){
    const items = document.querySelectorAll('.cart-item'); let total=0, count=0; items.forEach(it=>{ const price=Number(it.dataset.price)||0; const qty=Number(it.querySelector('.qty').value)||0; total += price*qty; count += qty; });
    const shipping = items.length ? 49 : 0; const order = total + shipping;
    const subtotal = document.getElementById('items-subtotal'); const itemsCount = document.getElementById('items-count'); const shippingEl = document.getElementById('shipping-fee'); const orderTotal = document.getElementById('order-total');
    if(subtotal) subtotal.textContent = this.money(total); if(itemsCount) itemsCount.textContent = count; if(shippingEl) shippingEl.textContent = this.money(shipping); if(orderTotal) orderTotal.textContent = this.money(order);
  }
};

// Wire simple Add-to-Cart buttons and contact demo
document.addEventListener('DOMContentLoaded', ()=>{
  // Make sure navbar has a badge span
  const cartLink = document.querySelector('.navbar a[href*="cart.html"]');
  if(cartLink && !cartLink.querySelector('.cart-badge')){ const span=document.createElement('span'); span.className='badge bg-danger ms-1 cart-badge'; span.textContent='0'; cartLink.appendChild(span); }
  SimpleCart.updateBadge();

  // Add-to-cart buttons use class .add-to-cart and data attributes
  document.querySelectorAll('.add-to-cart').forEach(btn=>{
    btn.onclick = ()=>{ const id=btn.dataset.id||Date.now(); const item={ id, name: btn.dataset.name, price: Number(btn.dataset.price)||0, image: btn.dataset.image }; SimpleCart.add(item); btn.textContent='Added'; setTimeout(()=>btn.textContent='Add to cart',800); };
  });

  // Contact form demo: form id is #contact-form
  const contact = document.getElementById('contact-form');
  if(contact){ contact.onsubmit = (e)=>{ e.preventDefault(); const b = contact.querySelector('button[type="submit"]'); const orig=b.textContent; b.textContent='Sending...'; b.disabled=true; setTimeout(()=>{ b.textContent=orig; b.disabled=false; const a=document.createElement('div'); a.className='alert alert-success mt-3'; a.textContent='Message sent (demo)'; contact.parentNode.insertBefore(a, contact.nextSibling); contact.reset(); },700); }; }

  // Render cart page if present
  SimpleCart.renderCart();
});
