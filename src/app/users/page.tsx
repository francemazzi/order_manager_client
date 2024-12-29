"use client";

import { LayoutWithNav } from "../layout-with-nav";

export default function UsersPage() {
  return (
    <LayoutWithNav>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Gestione Utenti</h1>
        <div className="bg-white rounded-lg shadow p-6">
          {/* Contenuto della pagina utenti */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Lista Utenti</h2>
              {/* Qui potrai aggiungere il pulsante per creare nuovi utenti */}
            </div>
            {/* Qui verrà aggiunta la tabella degli utenti */}
          </div>
        </div>
      </div>
    </LayoutWithNav>
  );
}
