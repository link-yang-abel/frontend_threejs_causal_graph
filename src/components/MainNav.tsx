import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Link } from "react-router-dom"

const MainNav = () => {
  const routes = [
    {
      href: "/sphere-points",
      label: "Sphere Points"
    },
    // 可以在这里添加更多路由
  ]

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex items-center bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        {/* 移动端菜单 */}
        <Sheet>
          <SheetTrigger asChild className="lg:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[240px] sm:w-[280px]">
            <nav className="flex flex-col gap-4">
              {routes.map((route) => (
                <Link
                  key={route.href}
                  to={route.href}
                  className="text-sm font-medium transition-colors hover:text-primary"
                >
                  {route.label}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>

        {/* Logo */}
        <Link to="/" className="mr-6 flex items-center space-x-2">
          <span className="font-bold sm:inline-block">
            Sphere Points
          </span>
        </Link>

        {/* 桌面端导航 */}
        <nav className="hidden lg:flex lg:items-center lg:space-x-6">
          {routes.map((route) => (
            <Link
              key={route.href}
              to={route.href}
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              {route.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  )
}

export default MainNav 