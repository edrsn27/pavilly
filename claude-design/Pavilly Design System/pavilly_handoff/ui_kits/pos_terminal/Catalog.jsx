// Product grid + tiles for the POS terminal.

const CATEGORIES = [
  { id: 'all',     name: 'All',        count: 24 },
  { id: 'drinks',  name: 'Drinks',     count: 8  },
  { id: 'pastry',  name: 'Pastry',     count: 6  },
  { id: 'food',    name: 'Food',       count: 5  },
  { id: 'merch',   name: 'Merch',      count: 3  },
  { id: 'beans',   name: 'Beans',      count: 2  },
];

const PRODUCTS = [
  // drinks
  { id: 'p1',  name: 'Iced oat latte',    price: 4.50, emoji: '☕', cat: 'drinks', stock: 'in',  bg: 'linear-gradient(135deg,#fde68a,#f59e0b)' },
  { id: 'p2',  name: 'Cortado',           price: 3.75, emoji: '☕', cat: 'drinks', stock: 'in',  bg: 'linear-gradient(135deg,#fed7aa,#ea580c)' },
  { id: 'p3',  name: 'Cold brew',         price: 4.25, emoji: '🥤', cat: 'drinks', stock: 'in',  bg: 'linear-gradient(135deg,#a78bfa,#7c3aed)' },
  { id: 'p4',  name: 'Matcha latte',      price: 5.00, emoji: '🍵', cat: 'drinks', stock: 'low', bg: 'linear-gradient(135deg,#bef264,#65a30d)' },
  { id: 'p5',  name: 'Hot chocolate',     price: 4.00, emoji: '🍫', cat: 'drinks', stock: 'in',  bg: 'linear-gradient(135deg,#d6a373,#92400e)' },
  { id: 'p6',  name: 'Sparkling water',   price: 3.00, emoji: '💧', cat: 'drinks', stock: 'in',  bg: 'linear-gradient(135deg,#bae6fd,#0284c7)' },
  // pastry
  { id: 'p7',  name: 'Butter croissant',  price: 3.75, emoji: '🥐', cat: 'pastry', stock: 'in',  bg: 'linear-gradient(135deg,#fed7aa,#ea580c)' },
  { id: 'p8',  name: 'Pain au chocolat',  price: 4.25, emoji: '🥐', cat: 'pastry', stock: 'in',  bg: 'linear-gradient(135deg,#fde68a,#d97706)' },
  { id: 'p9',  name: 'Sourdough loaf',    price: 9.00, emoji: '🍞', cat: 'pastry', stock: 'low', bg: 'linear-gradient(135deg,#fbf2e0,#a16207)' },
  { id: 'p10', name: 'Blueberry muffin',  price: 3.50, emoji: '🫐', cat: 'pastry', stock: 'in',  bg: 'linear-gradient(135deg,#c4b5fd,#5b21b6)' },
  // food
  { id: 'p11', name: 'Avocado toast',     price: 9.50, emoji: '🥑', cat: 'food',   stock: 'in',  bg: 'linear-gradient(135deg,#d9f99d,#65a30d)' },
  { id: 'p12', name: 'Turkey sandwich',   price: 11.0, emoji: '🥪', cat: 'food',   stock: 'in',  bg: 'linear-gradient(135deg,#fed7aa,#c2410c)' },
  { id: 'p13', name: 'Garden salad',      price: 10.0, emoji: '🥗', cat: 'food',   stock: 'out', bg: 'linear-gradient(135deg,#bbf7d0,#16a34a)' },
  { id: 'p14', name: 'Yogurt bowl',       price: 7.50, emoji: '🥣', cat: 'food',   stock: 'in',  bg: 'linear-gradient(135deg,#fce7f3,#db2777)' },
  // merch
  { id: 'p15', name: 'Pavilly tee',         price: 24.0, emoji: '👕', cat: 'merch',  stock: 'in',  bg: 'linear-gradient(135deg,#c7d2fe,#6366f1)' },
  { id: 'p16', name: 'Enamel mug',        price: 16.0, emoji: '🍶', cat: 'merch',  stock: 'in',  bg: 'linear-gradient(135deg,#a8cdd2,#35858E)' },
  // beans
  { id: 'p17', name: 'House blend 12oz',  price: 18.0, emoji: '🫘', cat: 'beans',  stock: 'in',  bg: 'linear-gradient(135deg,#d6d3d1,#57534e)' },
  { id: 'p18', name: 'Single origin 12oz',price: 22.0, emoji: '🫘', cat: 'beans',  stock: 'low', bg: 'linear-gradient(135deg,#e7e5e4,#78716c)' },
];

function ProductTile({ p, onAdd }) {
  const stockLabel = p.stock === 'out' ? 'Out of stock'
                   : p.stock === 'low' ? 'Low · 3 left'
                   : '';
  return (
    <button className={`product-tile ${p.stock === 'low' ? 'low' : ''} ${p.stock === 'out' ? 'out' : ''}`}
      onClick={() => onAdd(p)}>
      <div className="img" style={{ background: p.bg }}>{p.emoji}</div>
      <div className="name">{p.name}</div>
      <div className="meta">
        <div className="price">${p.price.toFixed(2)}</div>
        <div className="stock">{stockLabel || `#${p.id.toUpperCase()}`}</div>
      </div>
    </button>
  );
}

function ProductGrid({ onAdd, query, category }) {
  const filtered = PRODUCTS.filter(p => {
    if (category !== 'all' && p.cat !== category) return false;
    if (query && !p.name.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });
  return (
    <div className="grid-wrap">
      <div className="product-grid">
        {filtered.map(p => <ProductTile key={p.id} p={p} onAdd={onAdd} />)}
      </div>
    </div>
  );
}

Object.assign(window, { CATEGORIES, PRODUCTS, ProductTile, ProductGrid });
