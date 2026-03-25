import { Link, useNavigate } from "react-router-dom"
import {useSelector, useDispatch} from "react-redux"
import { logout } from "../feature/userSlice"

export default function Header() {
    const { loggedUser, isLoggedIn } = useSelector((state) => state.users);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    const handleLogout = () => {
        dispatch(logout());
        navigate('/');
    }
    
    return (
        <header className="bg-base-300 border-b border-base-content/10">
            <div className="mx-auto max-w-6xl p-4">
                <div  className="flex justify-between items-center" >
                    
                    {isLoggedIn && <Link to="/home">Home</Link>}
                    <div className="flex gap-4">
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