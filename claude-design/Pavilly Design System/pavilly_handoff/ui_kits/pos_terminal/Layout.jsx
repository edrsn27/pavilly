// Sidebar + TopBar + CategoryStrip for the POS terminal.

function Sidebar({ active = 'sale', onChange }) {
  const items = [
    { id: 'sale',    Icon: window.Icon.Cart,    label: 'Sale' },
    { id: 'items',   Icon: window.Icon.Items,   label: 'Items' },
    { id: 'orders',  Icon: window.Icon.Receipt, label: 'Orders' },
    { id: 'people',  Icon: window.Icon.Users,   label: 'People' },
    { id: 'reports', Icon: window.Icon.Chart,   label: 'Reports' },
  ];
  return (
    <aside className="sidebar">
      <img src="../../assets/pavilly-mark.svg" alt="Pavilly" className="logo"/>
      {items.map(({ id, Icon, label }) => (
        <button key={id}
          className={`side-btn ${active === id ? 'active' : ''}`}
          onClick={() => onChange && onChange(id)}
          title={label}>
          <Icon size={22}/>
        </button>
      ))}
      <div className="side-spacer"/>
      <button className="side-btn" title="Settings"><window.Icon.Settings size={22}/></button>
      <div className="side-avatar" title="Ada · Cashier #2">AD</div>
    </aside>
  );
}

function TopBar({ query, setQuery, cartCount }) {
  return (
    <div className="topbar">
      <div className="search">
        <window.Icon.Search size={18}/>
        <input
          placeholder="Search products, scan a barcode…"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        <span className="kbd">⌘K</span>
      </div>
      <div className="topbar-actions">
        <button className="btn-icon" title="Scan"><window.Icon.Barcode size={20}/></button>
        <button className="btn-icon" title="Notifications"><window.Icon.Bell size={20}/></button>
        <button className="btn-icon" title="Cash drawer"><window.Icon.Cash size={20}/></button>
      </div>
    </div>
  );
}

function CategoryStrip({ categories, active, onSelect }) {
  return (
    <div className="cat-strip">
      {categories.map(c => (
        <button key={c.id}
          className={`cat-chip ${active === c.id ? 'active' : ''}`}
          onClick={() => onSelect(c.id)}>
          {c.name}
          <span className="ct">{c.count}</span>
        </button>
      ))}
    </div>
  );
}

Object.assign(window, { Sidebar, TopBar, CategoryStrip });
