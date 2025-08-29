import { createContext, useContext, useState } from "react";

// Create Context
const SelectedUserContext = createContext();

// Create a provider component
export const SelectedUserProvider = ({ children }) => {
  const [selectedUser, setSelectedUser] = useState(null);

  return (
    <SelectedUserContext.Provider
      value={{
        selectedUser,
        setSelectedUser,
      }}
    >
      {children}
    </SelectedUserContext.Provider>
  );
};

// Custom hook to access the selected user context
export const useSelectedUser = () => {
  return useContext(SelectedUserContext);
};
