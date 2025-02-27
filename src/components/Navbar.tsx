import { Link, useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ThemeToggle"
import { routes } from "@/lib/routes"

export function Navbar() {
  const location = useLocation()

  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4">
        <div className="flex items-center space-x-4">
          <Link to="/" className="font-bold text-xl">
            abel.ai demo
          </Link>
        </div>
        <div className="ml-auto flex items-center space-x-4">
          {routes.map((route) => (
            <Button
              key={route.path}
              variant={location.pathname === route.path ? "default" : "outline"}
              size="sm"
            >
              <Link to={route.path}>
                {route.label}
              </Link>
            </Button>
          ))}
          <ThemeToggle />
        </div>
      </div>
    </div>
  )
} 