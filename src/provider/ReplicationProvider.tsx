import { Ref, useImperativeHandle, useRef } from "react";
import { DBManager, TProvideNumericID } from "../dbmanagement/DBManager";


export interface ReplicationProviderRef {
  id?:number
  start:() => void
  stop:() => void
  isRunning:() => boolean
}
export interface ReplicationProviderProps<T extends TProvideNumericID> {
  dbmanager:DBManager<T>
}
export function ReplicationProvider<T extends TProvideNumericID>(props:ReplicationProviderProps<T>, ref:Ref<ReplicationProviderRef>) {
  const intervallID = useRef<number|undefined>(undefined)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const dbmanagerRef = useRef<DBManager<T>>(props.dbmanager)
  useImperativeHandle(ref, () => ({
    id:intervallID.current,
    start:() => {
      if(!intervallID.current) {
        intervallID.current = setInterval(()=>{console.log("hello")}, 1000)
        console.log("starting ", intervallID.current)
      }
    },
    stop:() => {
      console.log("stopping ", intervallID.current)
      if(intervallID.current) {
        clearInterval(intervallID.current)
        console.log("stopped")
        intervallID.current = undefined
      }
    },
    isRunning:() => {
      return intervallID.current !== undefined
    }
  }))
  return (
        <>  </>
  )
}

export function simpleHash(o:string):number {
    let hash:number = 0x00000000
    for (let i = 0; i < o.length; i++) {
        const char = o.charCodeAt(i)
        hash = ((hash << 5) - hash) + char
        hash &= 0xFFFFFFFF // enforce 32 bit
    }
    return hash
}