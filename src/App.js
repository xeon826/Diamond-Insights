import logo from "./logo.svg";
import "./App.css";
import Table from "./components/Table.tsx";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <div className="flex items-center">
          <h1>Player Stats</h1>
          <img
            src={logo}
            className="App-logo w-36 position-absolute top-0"
            alt="logo"
          />
        </div>
        <div className="w-full overflow-x-scroll">
          <Table />
        </div>
      </header>
    </div>
  );
}

export default App;
