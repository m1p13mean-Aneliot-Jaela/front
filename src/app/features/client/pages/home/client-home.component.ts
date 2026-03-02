import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-client-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
  <div class="home-container">
    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-content">
        <div class="hero-badge">
          <span class="badge-icon">◆</span>
          <span class="badge-text">Nouveau: Promo du mois</span>
        </div>
        <h1 class="hero-title">
          Faites vos achats<br/>
          <span class="gradient-text">en ligne</span>
        </h1>
        <p class="hero-description">
          Découvrez nos meilleures boutiques et offres exclusives. 
          Profitez de promotions exceptionnelles sur vos produits préférés !
        </p>
        <div class="hero-actions">
          <button class="btn-primary" routerLink="/client/shops">
            <span class="btn-icon">▣</span>
            Parcourir les boutiques
          </button>
          <button class="btn-secondary" routerLink="/client/search">
            <span class="btn-icon">⌕</span>
            Rechercher
          </button>
        </div>
        <div class="hero-stats">
          <div class="stat-item">
            <span class="stat-value">500+</span>
            <span class="stat-label">Produits</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-value">50+</span>
            <span class="stat-label">Boutiques</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-value">24/7</span>
            <span class="stat-label">Support</span>
          </div>
        </div>
      </div>
      <div class="hero-visual">
        <div class="visual-card card-1">
          <div class="card-icon">�</div>
          <div class="card-label">Shopping</div>
        </div>
        <div class="visual-card card-2">
          <div class="card-icon">◆</div>
          <div class="card-label">Rapide</div>
        </div>
        <div class="visual-card card-3">
          <div class="card-icon">◈</div>
          <div class="card-label">Promos</div>
        </div>
        <div class="hero-image">
          <img src="assets/images/acceuil.jpg" alt="Shopping" />
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features-section">
      <h2 class="section-title">Pourquoi nous choisir ?</h2>
      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-icon">▸</div>
          <h3>Livraison rapide</h3>
          <p>Recevez vos commandes en 24-48h partout dans le pays</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">▭</div>
          <h3>Paiement sécurisé</h3>
          <p>Transactions 100% sécurisées avec cryptage SSL</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">↻</div>
          <h3>Retour gratuit</h3>
          <p>30 jours pour changer d'avis sans frais supplémentaires</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">◎</div>
          <h3>Qualité garantie</h3>
          <p>Produits vérifiés et certifiés par nos équipes</p>
        </div>
      </div>
    </section>
  </div>
  `,
  styles: [`
/* Home Container */
.home-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem 0;
}

/* Hero Section */
.hero {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
  margin-bottom: 5rem;
  padding: 3rem 2rem;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7));
  border-radius: 32px;
  box-shadow: 0 24px 64px rgba(30, 41, 59, 0.08);
  backdrop-filter: blur(8px);
}

.hero-content {
  z-index: 2;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1.25rem;
  background: linear-gradient(135deg, #3B82F6, #1D4ED8);
  color: white;
  border-radius: 50px;
  font-family: 'Nunito', sans-serif;
  font-weight: 700;
  font-size: 0.875rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.3);
}

.badge-icon {
  font-size: 1rem;
  animation: pulse 2s ease-in-out infinite;
}

.hero-title {
  font-family: 'Nunito', sans-serif;
  font-weight: 900;
  font-size: 3.5rem;
  line-height: 1.1;
  color: #1e293b;
  margin: 0 0 1.5rem 0;
  letter-spacing: -0.02em;
}

.gradient-text {
  background: linear-gradient(135deg, #3B82F6, #1D4ED8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-description {
  font-family: 'Inter', sans-serif;
  font-size: 1.125rem;
  line-height: 1.7;
  color: #64748B;
  margin: 0 0 2rem 0;
  max-width: 500px;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  margin-bottom: 3rem;
  flex-wrap: wrap;
}

.btn-primary, .btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  border-radius: 50px;
  font-family: 'Nunito', sans-serif;
  font-weight: 800;
  font-size: 1rem;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  letter-spacing: 0.02em;
}

.btn-primary {
  background: linear-gradient(135deg, #3B82F6, #1D4ED8);
  color: white;
  box-shadow: 0 8px 24px rgba(29, 78, 216, 0.25);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(29, 78, 216, 0.35);
}

.btn-secondary {
  background: rgba(59, 130, 246, 0.1);
  color: #1D4ED8;
  border: 2px solid rgba(59, 130, 246, 0.3);
}

.btn-secondary:hover {
  background: rgba(59, 130, 246, 0.15);
  border-color: #3B82F6;
  transform: translateY(-2px);
}

.btn-icon {
  font-size: 1.2rem;
}

.hero-stats {
  display: flex;
  align-items: center;
  gap: 2rem;
  padding-top: 2rem;
  border-top: 2px solid rgba(226, 232, 240, 0.5);
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.stat-value {
  font-family: 'Nunito', sans-serif;
  font-weight: 900;
  font-size: 1.75rem;
  color: #1e293b;
}

.stat-label {
  font-family: 'Inter', sans-serif;
  font-size: 0.875rem;
  color: #64748B;
  font-weight: 500;
}

.stat-divider {
  width: 1px;
  height: 40px;
  background: rgba(226, 232, 240, 0.8);
}

/* Hero Visual */
.hero-visual {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 500px;
}

.visual-card {
  position: absolute;
  background: white;
  border-radius: 20px;
  padding: 1.5rem;
  box-shadow: 0 12px 32px rgba(30, 41, 59, 0.15);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  backdrop-filter: blur(8px);
  border: 2px solid rgba(255, 255, 255, 0.8);
  animation: float 3s ease-in-out infinite;
}

.card-1 {
  top: 10%;
  left: -10%;
  animation-delay: 0s;
}

.card-2 {
  top: 60%;
  left: 5%;
  animation-delay: 1s;
}

.card-3 {
  top: 30%;
  right: -5%;
  animation-delay: 2s;
}

.card-icon {
  font-size: 2rem;
}

.card-label {
  font-family: 'Nunito', sans-serif;
  font-weight: 700;
  font-size: 0.875rem;
  color: #1e293b;
}

.hero-image {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 450px;
  margin: 0 auto;
}

.hero-image img {
  width: 100%;
  height: auto;
  border-radius: 24px;
  box-shadow: 0 24px 64px rgba(30, 41, 59, 0.2);
}

/* Features Section */
.features-section {
  padding: 4rem 2rem;
}

.section-title {
  font-family: 'Nunito', sans-serif;
  font-weight: 900;
  font-size: 2.5rem;
  text-align: center;
  color: #1e293b;
  margin: 0 0 3rem 0;
  letter-spacing: -0.02em;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 2rem;
}

.feature-card {
  background: white;
  border-radius: 20px;
  padding: 2.5rem 2rem;
  text-align: center;
  box-shadow: 0 4px 16px rgba(30, 41, 59, 0.08);
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.feature-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 32px rgba(30, 41, 59, 0.15);
  border-color: rgba(59, 130, 246, 0.2);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 1.5rem;
  display: inline-block;
  animation: pulse 3s ease-in-out infinite;
}

.feature-card h3 {
  font-family: 'Nunito', sans-serif;
  font-weight: 800;
  font-size: 1.25rem;
  color: #1e293b;
  margin: 0 0 1rem 0;
}

.feature-card p {
  font-family: 'Inter', sans-serif;
  font-size: 0.9375rem;
  line-height: 1.6;
  color: #64748B;
  margin: 0;
}

/* Animations */
@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(2deg);
  }
}

/* Responsive Design */
@media (max-width: 1024px) {
  .hero {
    grid-template-columns: 1fr;
    gap: 3rem;
    padding: 2.5rem 1.5rem;
  }

  .hero-title {
    font-size: 3rem;
  }

  .hero-visual {
    min-height: 400px;
  }

  .visual-card {
    padding: 1rem 1.25rem;
  }
}

@media (max-width: 768px) {
  .home-container {
    padding: 1rem 0;
  }

  .hero {
    padding: 2rem 1.25rem;
    margin-bottom: 3rem;
  }

  .hero-title {
    font-size: 2.5rem;
  }

  .hero-description {
    font-size: 1rem;
  }

  .hero-actions {
    flex-direction: column;
    width: 100%;
  }

  .btn-primary, .btn-secondary {
    width: 100%;
    justify-content: center;
  }

  .hero-stats {
    gap: 1rem;
    flex-wrap: wrap;
  }

  .stat-divider {
    display: none;
  }

  .visual-card {
    display: none;
  }

  .hero-visual {
    min-height: 300px;
  }

  .features-section {
    padding: 3rem 1rem;
  }

  .section-title {
    font-size: 2rem;
  }

  .features-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
}

@media (max-width: 480px) {
  .hero-title {
    font-size: 2rem;
  }

  .hero-badge {
    font-size: 0.75rem;
    padding: 0.4rem 1rem;
  }

  .btn-primary, .btn-secondary {
    padding: 0.875rem 1.5rem;
    font-size: 0.9375rem;
  }

  .section-title {
    font-size: 1.75rem;
  }
}
  `]
})
export class ClientHomeComponent {}
