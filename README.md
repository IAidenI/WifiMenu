# WifiMenu

Menu Wi‑Fi minimaliste écrit en **TypeScript + GJS**, basé sur **GTK4** et **libadwaita**.

Ce projet est un petit proof‑of‑concept permettant de :
- activer / désactiver le Wi‑Fi
- afficher un état de chargement pendant la recherche des réseaux
- afficher une liste de réseaux simulée
- afficher un état “Wi‑Fi désactivé” avec une icône GNOME
- respecter le style Adwaita (clair / sombre)

---

## Fonctionnalités

- Bouton ON / OFF avec indicateur visuel
- Loading pendant la recherche des réseaux
- Liste de réseaux Wi‑Fi (mock)
- État “Wi‑Fi désactivé” centré avec icône
- Compatible thème clair / sombre (libadwaita)

---

## Installation & lancement

### Dépendances système

Fedora :
```bash
sudo dnf install gjs gtk4 libadwaita
```

Arch :
```bash
sudo pacman -S gjs gtk4 libadwaita
```

Debian / Ubuntu :
```bash
sudo apt install gjs gir1.2-gtk-4.0 gir1.2-adw-1
```

### Lancer le projet

```bash
bun install
bun run dev
```

Commande exécutée :
```bash
tsc && gjs -m dist/main.js
```

---
