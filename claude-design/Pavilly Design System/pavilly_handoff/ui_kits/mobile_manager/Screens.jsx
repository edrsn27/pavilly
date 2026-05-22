// Screen content for the mobile manager app — Home, Orders, Items.

const ORDERS = [
  { id: 'A2049', who: 'Walk-in',          when: '2 min ago',  amt: 18.42, status: 'paid',   emoji: '☕', col: 'green' },
  { id: 'A2048', who: 'Ada Lovelace',     when: '14 min ago', amt: 32.15, status: 'paid',   emoji: '🥐', col: 'green' },
  { id: 'A2047', who: 'Walk-in',          when: '28 min ago', amt: 9.50,  status: 'paid',   emoji: '🍵', col: 'green' },
  { id: 'A2046', who: 'Grace H.',         when: '41 min ago', amt: 47.80, status: 'pend',   emoji: '🥗', col: 'amber' },
  { id: 'A2045', who: 'Walk-in',          when: '55 min ago', amt: 12.00, status: 'paid',   emoji: '🥪', col: 'green' },
  { id: 'A2044', who: 'Ada Lovelace',     when: '1 hr ago',   amt: 24.00, status: 'refund', emoji: '👕', col: 'red'   },
  { id: 'A2043', who: 'Walk-in',          when: '1 hr ago',   amt: 7.50,  status: 'paid',   emoji: '🥣', col: 'green' },
];

function HomeScreen() {
  return (
    <div className="m-body">
      <div className="m-hdr">
        <div>
          <div className="greet">Saturday · 22 Mar</div>
          <h1>Good morning</h1>
        </div>
        <div className="av">AD</div>
      </div>

      <div className="m-kpi-hero">
        <div className="lbl">Today · sales so far</div>
        <div className="val">$1,248<span className="cents">.50</span></div>
        <div className="delta">
          <window.MIcon.Trend size={14}/> +18% vs. last Sat
        </div>
        <svg className="spark" width="100" height="40" viewBox="0 0 100 40" fill="none">
          <path d="M2 32 L18 24 L30 28 L44 16 L58 22 L72 10 L86 18 L98 6"
            stroke="#559aa4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M2 32 L18 24 L30 28 L44 16 L58 22 L72 10 L86 18 L98 6 L98 40 L2 40 Z"
            fill="url(#sparkfill)" opacity="0.4"/>
          <defs>
            <linearGradient id="sparkfill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#559aa4"/>
              <stop offset="1" stopColor="#559aa4" stopOpacity="0"/>
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="m-kpi-grid">
        <div className="m-kpi">
          <div className="ico green"><window.MIcon.Cart/></div>
          <div className="lbl">Orders</div>
          <div className="val">82</div>
        </div>
        <div className="m-kpi">
          <div className="ico blue"><window.MIcon.Avg/></div>
          <div className="lbl">Avg. order</div>
          <div className="val">$15.22</div>
        </div>
        <div className="m-kpi">
          <div className="ico amber"><window.MIcon.People/></div>
          <div className="lbl">New customers</div>
          <div className="val">11</div>
        </div>
        <div className="m-kpi">
          <div className="ico red"><window.MIcon.Refund/></div>
          <div className="lbl">Refunds</div>
          <div className="val">1</div>
        </div>
      </div>

      <div className="m-section">
        <h2>Recent orders</h2>
        <button className="link">View all</button>
      </div>
      <div className="m-orders">
        {ORDERS.slice(0, 4).map(o => <OrderRow key={o.id} o={o}/>)}
      </div>
    </div>
  );
}

function OrderRow({ o }) {
  const statusLabel = { paid: 'Paid', pend: 'Pending', refund: 'Refunded' }[o.status];
  return (
    <div className="m-order">
      <div className={`av ${o.col}`}>{o.emoji}</div>
      <div>
        <div className="num">#{o.id}</div>
        <div className="who">{o.who}</div>
        <div className="when">{o.when}</div>
      </div>
      <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end' }}>
        <div className="amt">${o.amt.toFixed(2)}</div>
        <span className={`badge ${o.status}`}><span className="dot"/>{statusLabel}</span>
      </div>
    </div>
  );
}

function OrdersScreen() {
  return (
    <div className="m-body">
      <div className="m-hdr">
        <div>
          <div className="greet">82 orders today</div>
          <h1>Orders</h1>
        </div>
        <div className="av">AD</div>
      </div>
      <div className="m-toolbar">
        <div className="m-search">
          <window.MIcon.Search size={16}/>
          <input placeholder="Search orders, customers…"/>
        </div>
        <button className="m-kpi" style={{ width:42, padding:0, alignItems:'center', justifyContent:'center' }}>
          <window.MIcon.Filter size={18}/>
        </button>
      </div>
      <div className="m-orders">
        {ORDERS.map(o => <OrderRow key={o.id} o={o}/>)}
      </div>
    </div>
  );
}

const ITEMS = [
  { id: 'p1',  name: 'Iced oat latte',   sku: 'DRK-021', price: 4.50, emoji: '☕', bg: 'linear-gradient(135deg,#fde68a,#f59e0b)', stock: 32, },
  { id: 'p7',  name: 'Butter croissant', sku: 'PSY-014', price: 3.75, emoji: '🥐', bg: 'linear-gradient(135deg,#fed7aa,#ea580c)', stock: 18, },
  { id: 'p4',  name: 'Matcha latte',     sku: 'DRK-007', price: 5.00, emoji: '🍵', bg: 'linear-gradient(135deg,#bef264,#65a30d)', stock: 3,  low: true },
  { id: 'p15', name: 'Pavilly tee',        sku: 'MRC-001', price: 24.0, emoji: '👕', bg: 'linear-gradient(135deg,#c7d2fe,#6366f1)', stock: 12, },
  { id: 'p9',  name: 'Sourdough loaf',   sku: 'PSY-005', price: 9.00, emoji: '🍞', bg: 'linear-gradient(135deg,#fbf2e0,#a16207)', stock: 0,  out: true },
  { id: 'p17', name: 'House blend 12oz', sku: 'BNS-002', price: 18.0, emoji: '🫘', bg: 'linear-gradient(135deg,#d6d3d1,#57534e)', stock: 24, },
];

function ItemsScreen() {
  return (
    <div className="m-body">
      <div className="m-hdr">
        <div>
          <div className="greet">24 items · 2 low stock</div>
          <h1>Items</h1>
        </div>
        <div className="av">AD</div>
      </div>
      <div className="m-toolbar">
        <div className="m-search">
          <window.MIcon.Search size={16}/>
          <input placeholder="Search items, SKUs…"/>
        </div>
      </div>
      <div className="m-items-list">
        {ITEMS.map(it => (
          <div key={it.id} className="m-item">
            <div className="img" style={{ background: it.bg }}>{it.emoji}</div>
            <div>
              <div className="name">{it.name}</div>
              <div className="meta">SKU · {it.sku}</div>
              {it.low && <div className="stock-pill low">Low · {it.stock} left</div>}
              {it.out && <div className="stock-pill out">Out of stock</div>}
            </div>
            <div style={{ textAlign:'right' }}>
              <div className="price">${it.price.toFixed(2)}</div>
              {!it.low && !it.out && <div style={{ fontSize:11, color:'var(--fg-3)', fontFamily:'var(--font-mono)', marginTop:2 }}>{it.stock} in stock</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { HomeScreen, OrdersScreen, ItemsScreen, OrderRow, ORDERS, ITEMS });
