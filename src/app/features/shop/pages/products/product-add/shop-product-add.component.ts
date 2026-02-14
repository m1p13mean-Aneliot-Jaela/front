import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-shop-product-add',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <h2>Ajouter un Produit</h2>
      <div class="form-container">
        <form>
          <div class="form-group">
            <label>Nom du produit</label>
            <input type="text" placeholder="Nom du produit">
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Prix (Ar)</label>
              <input type="number" placeholder="0">
            </div>
            <div class="form-group">
              <label>Stock</label>
              <input type="number" placeholder="0">
            </div>
          </div>
          <div class="form-group">
            <label>Catégorie</label>
            <select>
              <option>Électronique</option>
              <option>Mode</option>
              <option>Maison</option>
              <option>Sport</option>
            </select>
          </div>
          <div class="form-group">
            <label>Description</label>
            <textarea rows="4" placeholder="Description du produit..."></textarea>
          </div>
          <div class="form-actions">
            <button type="button" class="btn-secondary">Annuler</button>
            <button type="submit" class="btn-primary">Ajouter le produit</button>
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
    input, select, textarea {
      width: 100%;
      padding: 0.75rem 1rem;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      font-size: 1rem;
      box-sizing: border-box;
      font-family: inherit;
    }
    textarea {
      resize: vertical;
    }
    input:focus, select:focus, textarea:focus {
      outline: none;
      border-color: #8b5cf6;
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
      background: #8b5cf6;
      color: white;
      border: none;
    }
    .btn-primary:hover {
      background: #7c3aed;
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
export class ShopProductAddComponent {}
