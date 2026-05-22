// Cart panel for POS terminal — header, customer row, line items, totals, charge.

function CartRow({ item, onInc, onDec, onRemove }) {
  return (
    <div className="cart-row">
      <div className="av" style={{ background: item.bg }}>{item.emoji}</div>
      <div style={{ minWidth: 0 }}>
        <div className="name" style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{item.name}</div>
        <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:4 }}>
          <button className="qty-btn" onClick={() => onDec(item.id)}><window.Icon.Minus size={14}/></button>
          <span className="qty-val">{item.qty}</span>
          <button className="qty-btn" onClick={() => onInc(item.id)}><window.Icon.Plus size={14}/></button>
        </div>
      </div>
      <div>
        <div className="amt">${(item.price * item.qty).toFixed(2)}</div>
        <div className="qty">${item.price.toFixed(2)} ea</div>
      </div>
    </div>
  );
}

function Cart({ items, onInc, onDec, onRemove, onCharge, onClear }) {
  const subtotal = items.reduce((s, it) => s + it.price * it.qty, 0);
  const tax = subtotal * 0.085;
  const total = subtotal + tax;
  const empty = items.length === 0;

  return (
    <aside className="cart">
      <div className="cart-head">
        <h2>Current sale</h2>
        <div className="order-no">#A2049</div>
      </div>
      <div className="cart-customer">
        <div className="av"><window.Icon.UserPlus size={16}/></div>
        <div>
          <div className="name">Guest</div>
          <div className="sub">No customer attached</div>
        </div>
        <button>Add</button>
      </div>

      {empty ? (
        <div className="cart-empty">
          <window.Icon.Cart size={40}/>
          <div className="t">Cart is empty</div>
          <div className="s">Tap a product to start a sale</div>
        </div>
      ) : (
        <div className="cart-items">
          {items.map(it => (
            <CartRow key={it.id} item={it}
              onInc={onInc} onDec={onDec} onRemove={onRemove}/>
          ))}
        </div>
      )}

      <div className="cart-foot">
        {!empty && (
          <div className="totals">
            <div className="k">Subtotal</div>
            <div className="v">${subtotal.toFixed(2)}</div>
            <div className="k">Tax · 8.5%</div>
            <div className="v">${tax.toFixed(2)}</div>
            <div className="k big">Total</div>
            <div className="v big">${total.toFixed(2)}</div>
          </div>
        )}
        <div className="cart-actions">
          <button className="btn btn-secondary" onClick={onClear} disabled={empty}>
            <window.Icon.Trash size={18}/>
          </button>
          <button className="btn btn-primary" onClick={onCharge} disabled={empty}>
            {empty ? 'Add items to charge' : `Charge $${total.toFixed(2)}`}
          </button>
        </div>
      </div>
    </aside>
  );
}

Object.assign(window, { Cart, CartRow });
