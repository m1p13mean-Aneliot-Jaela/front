import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-client-home',
  standalone: true,
  imports: [CommonModule],
  template: `
  <!-- Hero Section -->
  <section class="hero">
    <div class="hero-text">
      <h1>SHOPPING</h1>
      <h2>Online Shop</h2>
      <p>Découvrez nos meilleures boutiques et offres exclusives. Profitez de promotions exceptionnelles sur vos produits préférés !</p>
      <button class="btn-primary">Parcourir les boutiques</button>
    </div>
    <div class="hero-image">
      <img src="assets/images/acceuil.jpg" alt="Shopping" />
    </div>
  </section>

  `,
  styles: [`

/* Hero Section */
.hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
  margin-bottom: 3rem;
  flex-wrap: wrap;
}

.hero-text h1 {
  font-size: 2.5rem;
  letter-spacing: 0.5rem;
  margin: 0;
  color: #1e293b;
}

.hero-text h2 {
  font-size: 1.5rem;
  color: #64748b;
  margin: 0.5rem 0;
}

.hero-text p {
  color: #475569;
  margin: 1rem 0;
  max-width: 400px;
}

.btn-primary {
  background: #10b981;
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.2s;
}

.btn-primary:hover {
  background: #059669;
}

.hero-image img {
  max-width: 400px;
  border-radius: 12px;
}

/* Features / Quick Actions */
.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 1rem;
}

.feature-card {
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.feature-card:hover {
  border-color: #10b981;
  background: #f0fdf4;
}

.feature-card .icon {
  font-size: 2rem;
  display: block;
  margin-bottom: 0.5rem;
}
  `]
})
export class ClientHomeComponent {}
