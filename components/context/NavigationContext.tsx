import React, { createContext, useContext, useState } from 'react';

// Define the shape of the context
interface NavigationContextProps {

  levelId: string | undefined;     // id for this question attempt
  setLevelId: React.Dispatch<React.SetStateAction<string | undefined>>;
  levelName: string | undefined;   // name for this question attempt
  setLevelName: React.Dispatch<React.SetStateAction<string | undefined>>;

  categoryId: string | undefined;     // id for this question attempt
  setCategoryId: React.Dispatch<React.SetStateAction<string | undefined>>;
  categoryName: string | undefined;   // name for this question attempt
  setCategoryName: React.Dispatch<React.SetStateAction<string | undefined>>;

 
  unitId: string | undefined;     // id for this question attempt
  setUnitId: React.Dispatch<React.SetStateAction<string | undefined>>;
  unitName: string | undefined;   // name for this question attempt
  setUnitName: React.Dispatch<React.SetStateAction<string | undefined>>;
}

// Create the context with default values
const NavigationContext = createContext<NavigationContextProps>({

  levelId: undefined,
  setLevelId: () => {},
  levelName: undefined,
  setLevelName: () => {},
  
  categoryId: undefined,
  setCategoryId: () => {},
  categoryName: undefined,
  setCategoryName: () => {},

  unitId: undefined,
  setUnitId: () => {},
  unitName: undefined,
  setUnitName: () => {},
});

// Custom hook to use the context
export const useNavigationContext = () => useContext(NavigationContext);

// Provider component to wrap the app or specific parts of the app
export const NavigationContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [levelId, setLevelId] = useState<string | undefined>(undefined);
  const [levelName, setLevelName] = useState<string | undefined>(undefined);
  
  const [categoryId, setCategoryId] = useState<string | undefined>(undefined);
  const [categoryName, setCategoryName] = useState<string | undefined>(undefined);
 
  const [unitId, setUnitId] = useState<string | undefined>(undefined);
  const [unitName, setUnitName] = useState<string | undefined>(undefined);

  return (
    <NavigationContext.Provider value={{
      
      levelId: levelId, setLevelId: setLevelId,
      levelName: levelName, setLevelName: setLevelName, 

      categoryId,  setCategoryId , 
      categoryName, setCategoryName,
   
      unitId, setUnitId,
      unitName, setUnitName
    
     }}
      >
      {children}
    </NavigationContext.Provider>
  );
};