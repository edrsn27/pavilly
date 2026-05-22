// Pavilly POS Terminal — wired interactive demo.

function App() {
  const [query, setQuery] = React.useState('');
  const [category, setCategory] = React.useState('all');
  const [active, setActive] = React.useState('sale');
  const [cart, setCart] = React.useState([
    { id: 'p1', name: 'Iced oat latte',  price: 4.50, emoji: '☕', qty: 2, bg: 'linear-gradient(135deg,#fde68a,#f59e0b)' },
    { id: 'p7', name: 'Butter croissant', price: 3.75, emoji: '🥐', qty: 1, bg: 'linear-gradient(135deg,#fed7aa,#ea580c)' },
    { id: 'p4', name: 'Matcha latte',     price: 5.00, emoji: '🍵', qty: 1, bg: 'linear-gradient(135deg,#bef264,#65a30d)' },
  ]);
  const [showPayment, setShowPayment] = React.useState(false);

  const subtotal = cart.reduce((s, it) => s + it.price * it.qty, 0);
  const total = subtotal * 1.085;

  const add = (p) => {
    setCart(prev => {
      const existing = prev.find(it => it.id === p.id);
      if (existing) return prev.map(it => it.id === p.id ? { ...it, qty: it.qty + 1 } : it);
      return [...prev, { ...p, qty: 1 }];
    });
  };
  const inc = (id) => setCart(prev => prev.map(it => it.id === id ? { ...it, qty: it.qty + 1 } : it));
  const dec = (id) => setCart(prev => prev.flatMap(it =>
    it.id === id ? (it.qty > 1 ? [{ ...it, qty: it.qty - 1 }] : []) : [it]
  ));
  const remove = (id) => setCart(prev => prev.filter(it => it.id !== id));
  const clear = () => setCart([]);

  return (
    <div className="shell">
      <window.Sidebar active={active} onChange={setActive}/>
      <main className="main">
        <window.TopBar query={query} setQuery={setQuery} cartCount={cart.length}/>
        <window.CategoryStrip
          categories={window.CATEGORIES}
          active={category}
          onSelect={setCategory}/>
        <window.ProductGrid onAdd={add} query={query} category={category}/>
      </main>
      <window.Cart
        items={cart}
        onInc={inc} onDec={dec} onRemove={remove}
        onCharge={() => setShowPayment(true)}
        onClear={clear}/>

      {showPayment && (
        <window.PaymentModal
          amount={total}
          onClose={() => setShowPayment(false)}
          onPaid={() => { setShowPayment(false); clear(); }}
        />
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('app')).render(<App/>);
