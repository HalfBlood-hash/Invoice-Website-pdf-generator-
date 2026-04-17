import { Link, useNavigate } from "react-router-dom"
import {useSelector, useDispatch} from "react-redux"
import { logoutUser } from "../feature/userSlice"

export default function Header() {
    const { loggedUser, isLoggedIn } = useSelector((state) => state.users);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    const handleLogout = () => {
        dispatch(logoutUser());
        navigate('/');
    }
    
    return (
        <header className="bg-base-300 border-b border-base-content/10">
            <div className="mx-auto max-w-6xl p-4">
                <div  className="flex justify-between items-center" >
                    
                    {isLoggedIn && <Link to="/home" className="text-lg text-red-900">Home</Link>}
                    <div className="flex gap-4 text-lg text-red-900">
                        {isLoggedIn && <Link to="/history">History</Link>}
                        {isLoggedIn && <Link to="/billform">BillForm</Link>}
                        {
                            isLoggedIn ? (
                                <button onClick={handleLogout} className="hover:underline">Logout</button>
                            ): (
                                <Link to="/" >Login</Link>
                            )
                        }
                    </div>
                </div>
            </div>
        </header>
    )
}