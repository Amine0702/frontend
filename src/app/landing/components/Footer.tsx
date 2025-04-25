"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

const Footer = () => {
  const [currentYear, setCurrentYear] = useState<number | null>(null);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="footer">
      <div className="container">
        <div className="pro_border"></div>
      </div>
      <div className="footer_top">
        <div className="container">
          <div className="row">
            {/* Logo et description */}
            <div className="col-xl-3 col-md-6 col-lg-3">
              <div className="footer_widget">
                <div className="Logo">
                  <Link href="/">
                    <Image
                      src="/img/logo/logo.png"
                      alt="Logo"
                      width={150}
                      height={50}
                      priority
                    />
                  </Link>
                </div>
                <p>
                  Simplifiez la gestion de vos projets avec notre plateforme
                  tout-en-un pour la collaboration et la productivité.
                </p>
                <div className="socail_links">
                  <ul>
                    <li>
                      <a href="#" aria-label="Facebook">
                        <i className="ti-facebook"></i>
                      </a>
                    </li>
                    <li>
                      <a href="#" aria-label="Twitter">
                        <i className="ti-twitter-alt"></i>
                      </a>
                    </li>
                    <li>
                      <a href="#" aria-label="Instagram">
                        <i className="fa fa-instagram"></i>
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Services */}
            <div className="col-xl-2 col-md-6 col-lg-3">
              <div className="footer_widget">
                <h3 className="footer_title">Services</h3>
                <ul>
                  <li>
                    <Link href="#">Gestion des utilisateurs</Link>
                  </li>
                  <li>
                    <Link href="#">Gestion de projet</Link>
                  </li>
                  <li>
                    <Link href="#">Suivi du temps</Link>
                  </li>
                  <li>
                    <Link href="#">Intégration IA</Link>
                  </li>
                  <li>
                    <Link href="#">Tableau de bord Admin</Link>
                  </li>
                </ul>
              </div>
            </div>

            {/* Liens utiles */}
            <div className="col-xl-2 col-md-6 col-lg-2">
              <div className="footer_widget">
                <h3 className="footer_title">Liens utiles</h3>
                <ul id="navigation">
                  <li>
                    <Link href="/">Accueil</Link>
                  </li>
                  <li>
                    <Link href="/#services">Services</Link>
                  </li>
                  <li>
                    <Link href="/#features">Fonctionnalités</Link>
                  </li>
                  <li>
                    <Link href="/#CompanyInfo">À propos</Link>
                  </li>
                </ul>
              </div>
            </div>

            {/* Newsletter */}
            <div className="col-xl-4 offset-xl-1 col-md-6 col-lg-4">
              <div className="footer_widget">
                <h3 className="footer_title">Abonnez-vous</h3>
                <form action="#" className="newsletter_form">
                  <input type="email" placeholder="Votre email" required />
                  <button type="submit">S&apos;abonner</button>
                </form>
                <p className="newsletter_text">
                  Recevez des mises à jour sur nos fonctionnalités et
                  améliorations directement dans votre boîte de réception.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
