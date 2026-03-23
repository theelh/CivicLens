import { Link, usePage } from "@inertiajs/react"
import i18next from "i18next"
import { ArrowRightIcon, Menu,  X } from "lucide-react"
import React, { useEffect, useRef, useState } from "react"
import { login, register } from "@/routes";
import type { SharedData } from '@/types';
import AppLogo from "./app-logo"

interface NavItem {
  title: string
  href: string
}

const AppTop: React.FC = ({canRegister = true,
}: {
    canRegister?: boolean;
}) => {
  const isRTL: boolean = i18next.language === "ar"
  const [isScrolled, setIsScrolled] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [isOpen, setIsOpen] = useState(false)

  const lastScrollY = useRef(0)
  const currentPath = window.location.pathname

  useEffect(() => {
    lastScrollY.current = window.scrollY

    const handleScroll = () => {
      const currentScrollY = window.scrollY
      const direction =
        currentScrollY > lastScrollY.current ? "down" : "up"

      setIsScrolled(currentScrollY > 20)

      if (direction === "down" && currentScrollY > 100) {
        setIsVisible(false)
      }

      if (direction === "up") {
        setIsVisible(true)
      }

      lastScrollY.current = currentScrollY
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navItems: NavItem[] = [
    { title: "Home", href: "/" },
    { title: "Services", href: "/service" },
    { title: "About us", href: "/about" },
    { title: "Contact", href: "/contact" },
  ]

  const { auth } = usePage<SharedData>().props;

  return (
    <header
      dir={isRTL ? "rtl" : "ltr"}
      className={`
        fixed top-3 left-1/2 -translate-x-1/2 z-50
        w-[95%] max-w-6xl
        rounded-4xl
        transition-all duration-500 ease-out bg-white border border-[#236aa41e]
        ${
          isVisible
            ? "translate-y-0 opacity-100 bg-white"
            : "-translate-y-24 opacity-0"
        }
        ${
          isScrolled
            ? "bg-black/80 backdrop-blur-xl border border-black/20 shadow-xl shadow-[#2369A4]/10"
            : "bg-transparent"
        }
      `}
    >
      <div className="pl-6 pr-3">
        <div className="flex h-16 items-center justify-between">

          {/* LOGO */}
          <Link href="/" className="flex items-center gap-2">
            <AppLogo />
          </Link>

          {/* DESKTOP NAV */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`relative px-3 py-2 text-[16px] font-medium transition-all
                  ${
                    currentPath === item.href
                      ? "text-[#2369A4]"
                      : "text-black"
                  }
                  hover:text-[#2369A4]
                `}
              >
                {item.title}

                {currentPath === item.href && (
                  <span className="absolute -bottom-1 left-1/2 h-0.5 w-10 -translate-x-1/2 bg-[#2369A4]" />
                )}
              </Link>
            ))}
          </nav>

          {/* DESKTOP BUTTON */}
          <div className="hidden md:flex items-center">
            <Link
                href={register()}
                target="_blank"
                className="flex items-center gap-2 justify-between border border-[#c0c0c0] bg-[#2369A4] text-white pr-2 pl-5 py-2 rounded-4xl text-sm">
              Get startes
              <span className="border bg-[#2771ad] border-white/15 rounded-xl py-1 px-3">
                  <ArrowRightIcon size={14} />
              </span>
            </Link>
          </div>

          {/* MOBILE HAMBURGER */}
          <button
            className="md:hidden text-white"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      <div
        className={`
          md:hidden overflow-hidden transition-all duration-500 ease-in-out
          ${isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}
        `}
      >
        <div className="flex flex-col gap-4 px-6 pb-6 pt-2 bg-black/90 backdrop-blur-xl rounded-b-3xl">

          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={`text-base font-medium transition-colors
                ${
                  currentPath === item.href
                    ? "text-[#7AF298]"
                    : "text-white"
                }
                hover:text-[#7AF298]
              `}
            >
              {item.title}
            </Link>
          ))}

          <nav className="flex items-center justify-end gap-4">
            {auth.user && auth.user.role == 'admin' ? (
                <Link
                    href="/admin/dashboard"
                    className="inline-block rounded-sm border border-[#19140035] px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b]"
                >
                    Weclome back Admine
                </Link>
            ) : auth.user && auth.user.role == 'staff' ? (
                    <Link
                    href="/staff/dashboard"
                    className="inline-block rounded-sm border border-[#19140035] px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b]"
                >
                    Weclome back Staff
                </Link>
            ) : auth.user && auth.user.role == 'user' ? (
                    <Link
                    href="/dashboard"
                    className="inline-block rounded-sm border border-[#19140035] px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b]"
                >
                    Weclome back User
                    </Link>
                    ) : (
                        <>
                    <Link
                        href={login()}
                        className="inline-block rounded-sm border border-transparent px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#19140035] dark:text-[#EDEDEC] dark:hover:border-[#3E3E3A]"
                    >
                        Log in
                    </Link>
                    {canRegister && (
                        <Link
                            href={register()}
                            className="inline-block rounded-sm border border-[#19140035] px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b]"
                        >
                            Register
                        </Link>
                    )}
                </>
            )}
        </nav>
        </div>
      </div>
    </header>
  )
}

export default AppTop
