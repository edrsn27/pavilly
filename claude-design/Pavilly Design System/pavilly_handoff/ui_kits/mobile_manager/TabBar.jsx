// Icons + tab bar for mobile manager — small set, hand-traced from Lucide.

const _Ic = ({ children, d, sw = 1.75, size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={sw}
    strokeLinecap="round" strokeLinejoin="round">{d ? <path d={d}/> : children}</svg>
);

const MIcon = {
  Home:    (p) => <_Ic {...p} d="M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-7h-6v7H4a1 1 0 0 1-1-1V9.5Z"/>,
  Receipt: (p) => <_Ic {...p}><path d="M4 22V4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v18l-3-2-3 2-3-2-3 2-3-2-1 1Z"/><path d="M8 7h8M8 11h8M8 15h5"/></_Ic>,
  Items:   (p) => <_Ic {...p}><path d="M20 7H4l1.5 11a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2L20 7ZM8 7V5a4 4 0 0 1 8 0v2"/></_Ic>,
  Chart:   (p) => <_Ic {...p}><path d="M3 3v18h18"/><path d="m7 14 4-4 4 4 5-7"/></_Ic>,
  User:    (p) => <_Ic {...p}><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></_Ic>,
  Plus:    (p) => <_Ic {...p} sw={2.2} d="M12 5v14M5 12h14"/>,
  Search:  (p) => <_Ic {...p}><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></_Ic>,
  Trend:   (p) => <_Ic {...p}><path d="M3 17 9 11l4 4 8-8"/><path d="M14 7h7v7"/></_Ic>,
  Cart:    (p) => <_Ic {...p}><circle cx="9" cy="21" r="1.5"/><circle cx="18" cy="21" r="1.5"/><path d="M3 3h2l3 13h11l3-9H6"/></_Ic>,
  People:  (p) => <_Ic {...p}><circle cx="9" cy="8" r="3.5"/><path d="M2 21a7 7 0 0 1 14 0"/><circle cx="17" cy="6" r="3"/><path d="M22 18a5 5 0 0 0-8-4"/></_Ic>,
  Avg:     (p) => <_Ic {...p}><circle cx="12" cy="12" r="9"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><circle cx="9" cy="10" r="1"/><circle cx="15" cy="10" r="1"/></_Ic>,
  Refund:  (p) => <_Ic {...p}><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v6h6"/></_Ic>,
  Check:   (p) => <_Ic {...p} sw={2.4} d="M20 6 9 17l-5-5"/>,
  Filter:  (p) => <_Ic {...p}><path d="M3 5h18M6 12h12M10 19h4"/></_Ic>,
};

function TabBar({ active, onChange }) {
  const tabs = [
    { id: 'home',    Icon: MIcon.Home,    label: 'Home' },
    { id: 'orders',  Icon: MIcon.Receipt, label: 'Orders' },
    { id: 'sell',    Icon: MIcon.Plus,    label: '', fab: true },
    { id: 'items',   Icon: MIcon.Items,   label: 'Items' },
    { id: 'me',      Icon: MIcon.User,    label: 'Me' },
  ];
  return (
    <div className="m-tabbar">
      {tabs.map(({ id, Icon, label, fab }) => (
        <button key={id}
          className={`m-tab ${active === id ? 'active' : ''} ${fab ? 'fab' : ''}`}
          onClick={() => onChange(id)}>
          <Icon size={fab ? 24 : 22}/>
          {label && <span>{label}</span>}
        </button>
      ))}
    </div>
  );
}

Object.assign(window, { MIcon, TabBar });
