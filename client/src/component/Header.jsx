import { Link, useNavigate, useLocation } from "react-router-dom"
import {useSelector, useDispatch} from "react-redux"
import { logoutUser } from "../feature/userSlice"

export default function Header() {
    const { loggedUser, isLoggedIn } = useSelector((state) => state.users);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const isHomePage = location.pathname === "/home";
    const isHistoryPage = location.pathname === "/history";
    const isBillFormPage = location.pathname === "/billform";

    const handleLogout = () => {
        dispatch(logoutUser());
        navigate('/');
    }
    
    return (
        <header className="bg-white border-b border-gray-200 shadow-sm">
            <div className="mx-auto max-w-6xl px-4 py-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-3">
                        {isLoggedIn && (
                            <Link
                                to="/home"
                                className={`text-lg font-semibold px-4 py-2 rounded-full transition ${isHomePage ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-800 hover:bg-blue-50 hover:text-blue-600'}`}
                            >
                                Home
                            </Link>
                        )}
                        {isLoggedIn && (
                            <Link
                                to="/history"
                                className={`text-lg px-4 py-2 rounded-full transition ${isHistoryPage ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'}`}
                            >
                                History
                            </Link>
                        )}
                        {/* {isLoggedIn && (
                            <Link
                                to="/billform"
                                className={`text-lg px-4 py-2 rounded-full transition ${isBillFormPage ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'}`}
                            >
                                Bill Form
                            </Link>
                        )} */}
                    </div>
                    <div className="flex items-center gap-4 text-gray-700">
                        {isLoggedIn ? (
                            <button
                                onClick={handleLogout}
                                className="rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700   transition cursor-pointer hover:bg-blue-600 hover:text-white"
                            >
                                Logout
                            </button>
                        ) : (
                            <Link
                                to="/"
                                className="text-lg font-semibold text-gray-800 hover:text-blue-600 transition"
                            >
                                Login
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </header>
    )
}