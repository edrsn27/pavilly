// Payment + confirm modal for POS terminal.

function PaymentModal({ amount, onClose, onPaid }) {
  const [method, setMethod] = React.useState('card');
  const [step, setStep] = React.useState('select'); // select | processing | confirm

  const charge = () => {
    setStep('processing');
    setTimeout(() => setStep('confirm'), 900);
  };

  React.useEffect(() => {
    if (step === 'confirm') {
      const t = setTimeout(() => onPaid && onPaid(), 1800);
      return () => clearTimeout(t);
    }
  }, [step]);

  if (step === 'confirm') {
    return (
      <div className="overlay">
        <div className="modal">
          <div className="confirm">
            <div className="check"><window.Icon.Check size={42}/></div>
            <h2>Payment received</h2>
            <div className="total">${amount.toFixed(2)}</div>
            <div style={{ color:'var(--fg-3)', fontSize:13, fontFamily:'var(--font-mono)' }}>
              {method === 'card' ? 'Visa •••• 4242' : 'Cash · Drawer #2'} · #A2049
            </div>
            <div style={{ display:'flex', gap:10, marginTop:24 }}>
              <button className="btn btn-secondary" onClick={onPaid}>
                <window.Icon.Receipt size={18}/> Email receipt
              </button>
              <button className="btn btn-primary" onClick={onPaid}>
                New sale
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
          <div>
            <h2>Take payment</h2>
            <div className="sub">Order #A2049 · 3 items</div>
          </div>
          <button className="btn-icon" onClick={onClose}><window.Icon.X size={20}/></button>
        </div>

        <div className="pay-amount">
          <div className="lbl">Amount due</div>
          <div className="val">${amount.toFixed(2)}</div>
        </div>

        <div className="pay-methods">
          <button className={`pay-method ${method === 'card' ? 'selected' : ''}`}
            onClick={() => setMethod('card')}>
            <window.Icon.Card size={26}/>
            <div className="name">Card</div>
            <div className="hint">Tap, insert, or swipe</div>
          </button>
          <button className={`pay-method ${method === 'cash' ? 'selected' : ''}`}
            onClick={() => setMethod('cash')}>
            <window.Icon.Cash size={26}/>
            <div className="name">Cash</div>
            <div className="hint">Open drawer</div>
          </button>
        </div>

        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={charge}>
            {step === 'processing'
              ? <><Spinner/> Processing…</>
              : <>Charge ${amount.toFixed(2)} <window.Icon.Arrow size={18}/></>}
          </button>
        </div>
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <span style={{
      width:16, height:16, borderRadius:'50%',
      border:'2px solid rgba(255,255,255,0.35)',
      borderTopColor:'#fff',
      animation:'spin 700ms linear infinite',
      display:'inline-block'
    }}/>
  );
}

Object.assign(window, { PaymentModal, Spinner });
