import { createStore } from "redux";
import { Provider } from "react-redux";
import "./App.css";

import appReducer from "./main/reducer/appReducer";
import AppBuilder from "./main/AppBuilder";

function App() {
  const store = createStore(appReducer);

  return (
    <Provider store={store}>
      <AppBuilder />
    </Provider>
  );
}

export default App;
