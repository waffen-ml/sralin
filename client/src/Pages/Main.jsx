import { socket } from "../socket";
import { context } from "../utils";
import { useEffect, useState, useContext} from "react";

export default function Main() {
    const [data, setData] = useState({})
    const {currentUser} = useContext(context)

    useEffect(() => {
        if(!currentUser)
            return
        if(currentUser.id == -1)
            location.replace('/continue_playing')
    }, [currentUser])

    useEffect(() => {

        socket.connect()

        socket.on('data', (data) => {
            setData(data)
        })

        return () => {
            socket.off('data')
        }

    }, [])
    
    return <p>{JSON.stringify(data)}</p>

}