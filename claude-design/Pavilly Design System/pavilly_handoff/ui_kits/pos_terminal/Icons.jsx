// Pavilly · icon library — minimal subset of Lucide, hand-traced
// so the kit is self-contained. Stroke 1.75, currentColor.

const Ic = ({ d, children, size = 22, sw = 1.75 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={sw}
    strokeLinecap="round" strokeLinejoin="round">
    {d ? <path d={d} /> : children}
  </svg>
);

const Icon = {
  Home:     (p) => <Ic {...p} d="M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-7h-6v7H4a1 1 0 0 1-1-1V9.5Z" />,
  Cart:     (p) => <Ic {...p}><circle cx="9" cy="21" r="1.5"/><circle cx="18" cy="21" r="1.5"/><path d="M3 3h2l3 13h11l3-9H6"/></Ic>,
  Items:    (p) => <Ic {...p}><path d="M20 7H4l1.5 11a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2L20 7ZM8 7V5a4 4 0 0 1 8 0v2"/></Ic>,
  Users:    (p) => <Ic {...p}><circle cx="9" cy="8" r="3.5"/><path d="M2 21a7 7 0 0 1 14 0"/><circle cx="17" cy="6" r="3"/><path d="M22 18a5 5 0 0 0-8-4"/></Ic>,
  Chart:    (p) => <Ic {...p}><path d="M3 3v18h18"/><path d="m7 14 4-4 4 4 5-7"/></Ic>,
  Settings: (p) => <Ic {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1A1.7 1.7 0 0 0 9 19.4a1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.7 1.7 0 0 0 4.7 15a1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.3-1.8L4.2 7a2 2 0 1 1 2.8-2.8l.1.1A1.7 1.7 0 0 0 9 4.7 1.7 1.7 0 0 0 10 3.2V3a2 2 0 1 1 4 0v.1A1.7 1.7 0 0 0 15 4.6a1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1A1.7 1.7 0 0 0 19.4 9"/></Ic>,
  Search:   (p) => <Ic {...p}><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></Ic>,
  Plus:     (p) => <Ic {...p} d="M12 5v14M5 12h14" sw={2} />,
  Minus:    (p) => <Ic {...p} d="M5 12h14" sw={2} />,
  Check:    (p) => <Ic {...p} d="M20 6 9 17l-5-5" sw={2.4} />,
  X:        (p) => <Ic {...p} d="M18 6 6 18M6 6l12 12" />,
  Arrow:    (p) => <Ic {...p} d="M5 12h14M12 5l7 7-7 7" />,
  Trash:    (p) => <Ic {...p}><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M5 6l1 14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-14"/></Ic>,
  Card:     (p) => <Ic {...p}><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M2 10h20M6 14h4"/></Ic>,
  Cash:     (p) => <Ic {...p}><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M5 9v6M19 9v6"/></Ic>,
  Receipt:  (p) => <Ic {...p}><path d="M4 22V4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v18l-3-2-3 2-3-2-3 2-3-2-1 1Z"/><path d="M8 7h8M8 11h8M8 15h5"/></Ic>,
  UserPlus: (p) => <Ic {...p}><circle cx="9" cy="8" r="4"/><path d="M2 21a7 7 0 0 1 14 0"/><path d="M19 8v6M22 11h-6"/></Ic>,
  Barcode:  (p) => <Ic {...p}><path d="M3 6v12M6 6v12M9 6v12M12 6v12M15 6v12M18 6v12M21 6v12" sw={1.4}/></Ic>,
  Bell:     (p) => <Ic {...p}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10 21a2 2 0 0 0 4 0"/></Ic>,
  Tag:      (p) => <Ic {...p}><path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8Z"/><circle cx="7.5" cy="7.5" r="1.2"/></Ic>,
  More:     (p) => <Ic {...p}><circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/></Ic>,
};

window.Icon = Icon;
