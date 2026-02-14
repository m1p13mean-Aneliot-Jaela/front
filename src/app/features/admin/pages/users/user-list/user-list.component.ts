import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container">
      <h2>Liste des Utilisateurs</h2>
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Nom</th>
              <th>Email</th>
              <th>Type</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>John Doe</td>
              <td>john</td>
              <td><span class="badge buyer">Acheteur</span></td>
              <td><span class="badge active">Actif</span></td>
              <td>
                <button class="btn-edit">✏️</button>
                <button class="btn-delete">🗑️</button>
              </td>
            </tr>
            <tr>
              <td>Jane Smith</td>
              <td>jane</td>
              <td><span class="badge shop">Boutique</span></td>
              <td><span class="badge active">Actif</span></td>
              <td>
                <button class="btn-edit">✏️</button>
                <button class="btn-delete">🗑️</button>
              </td>
            </tr>
          </tbody>
        </table>
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
    .table-container {
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    th, td {
      padding: 1rem;
      text-align: left;
      border-bottom: 1px solid #e2e8f0;
    }
    th {
      background: #f8fafc;
      font-weight: 600;
      color: #64748b;
    }
    .badge {
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 500;
    }
    .badge.buyer { background: #dbeafe; color: #1d4ed8; }
    .badge.shop { background: #fce7f3; color: #be185d; }
    .badge.admin { background: #fef3c7; color: #b45309; }
    .badge.active { background: #d1fae5; color: #059669; }
    button {
      background: none;
      border: none;
      cursor: pointer;
      padding: 0.5rem;
      margin: 0 0.25rem;
      border-radius: 6px;
      transition: background 0.2s;
    }
    .btn-edit:hover { background: #e0f2fe; }
    .btn-delete:hover { background: #fee2e2; }
  `]
})
export class UserListComponent {}
