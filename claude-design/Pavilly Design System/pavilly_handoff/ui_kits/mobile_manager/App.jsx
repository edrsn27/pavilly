// Pavilly Manager · App orchestrator — wraps screens in IOSDevice with tab bar.

function App() {
  const [tab, setTab] = React.useState('home');
  const Screen = {
    home:   window.HomeScreen,
    orders: window.OrdersScreen,
    items:  window.ItemsScreen,
    me:     window.HomeScreen, // reuse — owner profile not in scope
    sell:   window.OrdersScreen,
  }[tab] || window.HomeScreen;

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(ellipse at top, #f4f4ee 0%, #e8e8df 100%)',
      padding: '40px 20px',
    }}>
      <window.IOSDevice width={402} height={874}>
        <div className="m-screen">
          <Screen/>
          <window.TabBar active={tab} onChange={setTab}/>
        </div>
      </window.IOSDevice>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('app')).render(<App/>);
