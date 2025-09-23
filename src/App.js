import logo from "./logo.svg";
import "./App.css";
import Table from "./components/Table.tsx";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <Table />
      </header>
    </div>
  );
}

export default App;
