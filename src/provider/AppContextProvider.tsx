import { createContext, useContext, useEffect, useState } from "react";
import { DBManager, mkDBManager } from "../dbmanagement/DBManager";
import { TNote } from "../model/TNote";

type AppContextRecord = {
    dbmanager:DBManager<TNote>
}
const AppContext = createContext<AppContextRecord | undefined>(undefined)

export function AppContextProvider({children}:{children:React.ReactNode}) {
  //const dbmanager = useRef<DBManager|undefined>(undefined)
  const [dbmanager, setDbmanager] = useState<DBManager<TNote>|undefined>(undefined)
  useEffect(() => {
      (async ()=> {
        const dbm = await mkDBManager<TNote>("TODO", "Notes", 4)
        setDbmanager(dbm)
      })()
  },[])
  return (
        <AppContext.Provider value={{dbmanager:dbmanager!}}>
            {children}
        </AppContext.Provider>
  )
}
export const useAppContext = ():AppContextRecord => {
  const ctx = useContext(AppContext)
  if(!ctx) {
    console.error("Error: AppContext is undefined.")
    throw new Error("Something went wrong, please try again later.")
  }
  return ctx
}