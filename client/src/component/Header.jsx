import { Link } from "react-router-dom"

export default function Header() {
    return (
        <header className="bg-base-300 border-b border-base-content/10">
            <div className="mx-auto max-w-6xl p-4">
                <div  className="flex justify-between items-center" >
                    
                        <Link to="/">Home</Link>
                    <div className="flex gap-4">
                        <Link to="/history">History</Link>
                        <Link to="/" >Login</Link>
                    </div>
                </div>
            </div>
        </header>
    )
}