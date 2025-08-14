import { createContext, useContext, useReducer } from 'react';

const AppCtx = createContext();

const initial = {
  inputPath: '',
  outputPath: '',
  state: {},          
  graphPath: '',
  concepts: [],        
};

function reducer(state, action) {
  switch (action.type) {
    case 'setInput':   return { ...state, inputPath: action.payload };
    case 'setOutput':  return { ...state, outputPath: action.payload };
    case 'loadState':  return { ...state, state: action.payload };
    case 'setGraph':   return { ...state, graphPath: action.payload };
    case 'setConcepts':return { ...state, concepts: action.payload };
    default:           return state;
  }
}

export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initial);
  return <AppCtx.Provider value={{ state, dispatch }}>{children}</AppCtx.Provider>;
};

export const useApp = () => useContext(AppCtx);