import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-add',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <h2>Ajouter un Utilisateur</h2>
      <div class="form-container">
        <form>
          <div class="form-row">
            <div class="form-group">
              <label>Prénom</label>
              <input type="text" placeholder="John">
            </div>
            <div class="form-group">
              <label>Nom</label>
              <input type="text" placeholder="Doe">
            </div>
          </div>
          <div class="form-group">
            <label>Email</label>
            <input type="email" placeholder="email@example.com">
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Téléphone</label>
              <input type="tel" placeholder="+261 34 00 000 00">
            </div>
            <div class="form-group">
              <label>Type d'utilisateur</label>
              <select>
                <option value="buyer">Acheteur</option>
                <option value="shop">Boutique</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label>Mot de passe</label>
            <input type="password" placeholder="••••••••">
          </div>
          <div class="form-actions">
            <button type="button" class="btn-secondary">Annuler</button>
            <button type="submit" class="btn-primary">Créer l'utilisateur</button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .page-container {
      padding: 1.5rem;
    }
    h2 {
      margin-bottom: 1.5rem;
      color: #1e293b;
    }
    .form-container {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      max-width: 600px;
    }
    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }
    .form-group {
      margin-bottom: 1.25rem;
    }
    label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: #64748b;
      font-size: 0.875rem;
    }
    input, select {
      width: 100%;
      padding: 0.75rem 1rem;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      font-size: 1rem;
      box-sizing: border-box;
    }
    input:focus, select:focus {
      outline: none;
      border-color: #10b981;
    }
    .form-actions {
      display: flex;
      gap: 1rem;
      margin-top: 1.5rem;
    }
    button {
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-primary {
      background: #10b981;
      color: white;
      border: none;
    }
    .btn-primary:hover {
      background: #059669;
    }
    .btn-secondary {
      background: white;
      color: #64748b;
      border: 2px solid #e2e8f0;
    }
    .btn-secondary:hover {
      background: #f8fafc;
    }
  `]
})
export class UserAddComponent {}
