import './index.css'
import { forwardRef, useEffect, useRef, useState } from "react"
import { TNote } from "./model/TNote"
import { useAppContext } from "./provider/AppContextProvider"
import { ReplicationProvider, ReplicationProviderRef } from "./provider/ReplicationProvider"
import useReactThrow from "./assets/hooks/useReactThrow"


// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function saveNoteMock() : Promise<boolean> {
  return new Promise<boolean>(resolve => 
    setTimeout(()=>resolve(true),500)
  )
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function fetchNotesMock() : Promise<TNote[]> {
  // simmulate some delay
  return new Promise<TNote[]>(resolve => 
    setTimeout(()=>
      resolve([
        {id:1,finished:false,caption:"note1",text:"text to note 1"},
        {id:2,finished:false,caption:"note2",text:"text to note 2"},
      ]), 500))
}

const TNoteReplicationProvider = forwardRef(ReplicationProvider<TNote>)

function App() {
  // TODO clear Database
  const reactThrow = useReactThrow()
  const [status, setStatus] = useState<"ready" | "loading" |  "saving" | "error" >("loading")
  const [onlyUnfinished, setOnlyUnfinished]  = useState<boolean>(false)
  const [filter, setFilter] = useState<string>("")
  const [reload, setTriggerReload] = useState<boolean>(true)
  const [notes, setNotes] = useState<TNote[]>([])
  const [selected, setSelected] = useState<TNote | null>(null)
  const {dbmanager} = useAppContext()
  const replicationProviderRef = useRef<ReplicationProviderRef>(null)
  function triggerReload () {setTriggerReload(f=>!f)}

  // TODO, this effect relies on several dependencies, dbmanager is async, so it is initially later available than the others...
  //       is there a better solution, than letting the effect fire several times
  useEffect(() => {
      (async ()=> {
        console.log("useEffect ", dbmanager, reload)
        if(dbmanager) {
          const _notes = await dbmanager.list();
          setNotes(_notes.filter(n => (!onlyUnfinished || !n.finished) &&
                                      (
                                        (n.caption.indexOf(filter) !== -1) ||
                                        (n.text.indexOf(filter) !== -1)
                                      )
                                )
                  )
          setStatus("ready")
        }
      })().catch(reason => reactThrow(new Error(reason)))
  // eslint-disable-next-line react-hooks/exhaustive-deps -- loading only happens initialy
  },[dbmanager, onlyUnfinished, filter, reload])
  useEffect(() => {
    replicationProviderRef.current?.stop()
  },[replicationProviderRef])
  console.log(replicationProviderRef.current?.isRunning())
  return (
    <>
      <TNoteReplicationProvider ref={replicationProviderRef} dbmanager={dbmanager} />
      <div className='container'>
        <nav>
          <h1>Notes with indexDB</h1>
          <label >{replicationProviderRef.current?.isRunning() ? "replication acitve" : "replication not active"}</label>
          <button onClick={()=>{replicationProviderRef.current?.stop(); triggerReload()}}>Stop Replication</button>
          <button onClick={()=>{replicationProviderRef.current?.start(); triggerReload()}}>Restart Replication</button>
          <NewNoteForm onSubmit={async (newNote:TNote)=> {
            setStatus("saving")
            const newId = await dbmanager.add(newNote)
            setNotes([...notes, {...newNote, id:newId}])
            setStatus("ready") }}/>
        </nav>
        <div id="side">
            <ul>
              {status === "ready" ?
              notes.map(
                (n, i) => 
                  <li key={n.id}><Note key={n.id} note={n} onSelect={() => {console.log(i, notes[i]);setSelected(notes[i])}} onDelete={() => triggerReload(r=>!r)}/></li>
              )
              :
              <span>{status}</span>}
          </ul>
        </div>
        <main>
          { 
            selected && 
            <Note key={selected.id} note={selected} />
          }
        </main>
        <footer>
          <FilterForm onFinishFilterChange={f=>{ setOnlyUnfinished(f) }}
                      onFilterChange={s=>setFilter(s)} />
        </footer>
      </div>
    </>
  )
}

// TODO make caption mandatory, empty notes shouldnt be added
function NewNoteForm({onSubmit}:{onSubmit:(newNote:TNote)=>void}) {
  const [newNote, setNewNote] = useState<TNote>({ caption:"", text:"", finished:false})
  return (
    <form onSubmit={async (e)=> {
      e.preventDefault()
      onSubmit(newNote)
        setNewNote({ caption:"", text:"", finished:false})
    }}>
      <button type="submit">Add</button>
      <span>
        <label htmlFor="caption">Caption</label>
        <input id="caption" name="caption" type="text" 
                value={newNote.caption}
                onChange={(e)=>setNewNote({...newNote, caption:e.target.value})} />

      </span>
      <span>
        <label htmlFor="text">Text</label>
        <input id="text" name="text" type="text"
                value={newNote.text}
                onChange={(e)=>setNewNote({...newNote, text:e.target.value})}
                />
        </span>
    </form>
  )
}

interface NoteParams {
  note:TNote
  onSelect?:(key:number) => void
  onDelete?:(key?:number) => void
  onFinished?:(n:TNote) => void
}
function Note({note, onSelect, onDelete, onFinished}:NoteParams) {
  // TODO maybe it would be better to write to the storage in calling component via callbacks?
  const [value, setValue] = useState<TNote>(note)
  const {dbmanager} = useAppContext()
  return (
    <>
      <input type="checkbox" id={`${value.id}`} name={`${value.id}`} key={`${value.id}`}
              checked={value.finished} 
              onChange={()=>{
                const newValue:TNote = {...value,finished:!value.finished}
                setValue(newValue)
                // save to db
                dbmanager.update(newValue)
                if(onFinished) onFinished(newValue)
              }}/>
              <span onClick={() => {
                      const key = value.id
                      if(key) {
                        onSelect && onSelect(key)
                      }
                    }}>
                <span>{value.id}</span>
                <span>{value.caption}</span>
                <span>{value.text}</span>
              </span>
              {onDelete && 
                  <span onClick={()=>{
                          const delKey = value.id
                          if(delKey) {
                            dbmanager.del(delKey)
                            onDelete && onDelete(delKey)
                          }
                        }}>
                    &nbsp;⌦
                  </span>
              }
    </>
  )
} 

interface FilterFormProps {
  onFinishFilterChange:(finishFilter:boolean) => void
  onFilterChange:(s:string) => void
}
function FilterForm({onFinishFilterChange, onFilterChange}:FilterFormProps) {
  const [finishedFilter, setFinischedFilter] = useState<boolean>(false)
//  const [filter, setFilter] = useState<string>("")
  return (
    <form id="filter" onSubmit={async (e)=> {
      e.preventDefault()
    }}>
      <span>
      <label htmlFor="finishedFilter">only unfinished</label>
      <input  name="finishedFilter" 
              type="checkbox" 
              checked={finishedFilter} 
              onChange={()=>{
                const f = !finishedFilter
                setFinischedFilter(f)
                onFinishFilterChange(f)
              }}/>
      </span>
      <span>
        <label htmlFor="filter">Filter content</label>
        <input name="filter" type="text" 
//                value={filter}
                onChange={(e)=>{
//                    setFilter(e.target.value)
                    onFilterChange(e.target.value)
                }} /></span>
    </form>
  )
}

export default App
