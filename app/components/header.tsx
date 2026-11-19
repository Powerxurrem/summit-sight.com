"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Arrow, Brand } from "./brand";

const links = [["/", "Home"], ["/services", "Services"], ["/work", "Work"], ["/how-it-works", "How it works"], ["/about", "About"], ["/contact", "Contact"]];

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  return <header className="site-header"><div className="header-inner"><Brand/><nav id="main-navigation" aria-label="Main navigation" className={open ? "main-nav is-open" : "main-nav"}>{links.map(([href,label]) => <Link key={href} href={href} onClick={() => setOpen(false)} aria-current={pathname === href ? "page" : undefined}>{label}</Link>)}</nav><Link className="header-cta" href="/contact">Start a project <Arrow diagonal /></Link><button className="menu-toggle" aria-expanded={open} aria-controls="main-navigation" aria-label={open ? "Close navigation" : "Open navigation"} onClick={() => setOpen(!open)}><span/><span className={open ? "cross" : ""}/></button></div></header>;
}
