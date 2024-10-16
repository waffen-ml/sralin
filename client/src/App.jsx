import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { quickFetch, context } from './utils'
import {useState, useEffect} from 'react'
import { Link } from '@mui/material'

import Main from "./Pages/Main"
import CreateCountry from './Pages/Auth/CreateCountry'
import ContinuePlaying from './Pages/Auth/ContinuePlaying'

export default function App() {
    const [currentUser, setCurrentUser] = useState(null)
    
    useEffect(() => {
        quickFetch('/who_am_i')
        .then(data => {
            if (!data.country)
                throw Error()
            setCurrentUser(data.country)
        })
        .catch(() => {
            setCurrentUser({id: -1})
        })
    }, [])

    const logout = () => {
        quickFetch('logout')
        .then(() => {
            location.reload()
        })
    }

    return (
        <context.Provider value={{currentUser}}>
            <div className="w-[700px] max-w-full flex flex-col mx-auto">
                {currentUser && currentUser.id != -1 && (
                    <div>
                        <p>Великая страна {currentUser.name}</p>
                        <Link component="button" onClick={logout}>Выйти</Link>
                    </div>
                )}

                <div className="mt-3">
                    <Router>
                        <Routes>
                            <Route path="/" exact element={<Main/>}/>
                            <Route path="/continue_playing" element={<ContinuePlaying/>}/>
                            <Route path="/create_country" element={<CreateCountry/>}/>
                        </Routes>
                    </Router>
                </div>
            </div>
        </context.Provider>

    )
}