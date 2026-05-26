# e.Track - Gestionnaire de budgets personnels

e.Track est une application web de gestion budgétaire personnelle. Elle permet de créer des budgets, d'enregistrer des dépenses, de visualiser ses finances et de suivre l'évolution de ses dépenses dans le temps. Vous voulez prendre le controle de vos finances ? e.Track est la solution.

---

## Captures d'écran

| | | |
|---|---|---|
| **1. Page d'accueil** | **2. Bilan personnel** | **3. Page de connexion** |
| <img src="https://github.com/MrBrain314/E-Track/blob/main/Captures/ACCUEIL.png?raw=true" width="300"/> | <img src="https://github.com/MrBrain314/E-Track/blob/main/Captures/BILAN.png?raw=true" width="300"/> | <img src="https://github.com/MrBrain314/E-Track/blob/main/Captures/CONNEXION.png?raw=true" width="300"/> |
| **4. Mes budgets** | **5. Création d'un budget** | **6. Détail d'un budget** |
| <img src="https://github.com/MrBrain314/E-Track/blob/main/Captures/BUDGETS.png?raw=true" width="300"/> | <img src="https://github.com/MrBrain314/E-Track/blob/main/Captures/CREATION%20DE%20BUDGET.png?raw=true" width="300"/> | <img src="https://github.com/MrBrain314/E-Track/blob/main/Captures/DETAIL%20BUDGET.png?raw=true" width="300"/> |
| **7. Ajout d'une transaction** | **8. Tableau de bord** | **9. Historique des transactions** |
| <img src="https://github.com/MrBrain314/E-Track/blob/main/Captures/AJOUT%20DE%20TRANSACTION.png?raw=true" width="300"/> | <img src="https://github.com/MrBrain314/E-Track/blob/main/Captures/DASHBOARD.png?raw=true" width="300"/> | <img src="https://github.com/MrBrain314/E-Track/blob/main/Captures/HISTORIQUE%20DES%20TRANSACTIONS.png?raw=true" width="300"/> |


---

## Aperçu

- Création et gestion de budgets avec émoji personnalisé
- Ajout de transactions liées à chaque budget
- Tableau de bord avec graphiques et statistiques
- Historique des transactions filtrable par période
- **Multi-devises en temps réel** : EUR, USD, FCFA avec taux de change live via [open.er-api.com](https://open.er-api.com) (sans clé API)
- Authentification sécurisée via Clerk
- Base de données PostgreSQL hébergée sur Supabase
- Interface responsive en français

---

## Stack technique

| Couche | Technologie |
|---|---|
| Framework | Next.js 16 (App Router) |
| Langage | TypeScript |
| UI | Tailwind CSS v4 + DaisyUI v5 |
| Graphiques | Recharts |
| Authentification | Clerk |
| ORM | Prisma 7 |
| Base de données | PostgreSQL (Supabase) |
| Driver DB | @prisma/adapter-pg |
| Taux de change | open.er-api.com (gratuit, sans clé) |
| Icônes | Lucide React, React Icons |

---

## Prérequis

- Node.js 18+
- Un compte [Clerk](https://clerk.com) (authentification)
- Un projet [Supabase](https://supabase.com) (base de données PostgreSQL)

---

## Installation

### 1. Cloner le dépôt

```bash
git clone https://github.com/MrBrain314/E-Track.git
cd E-Track
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configurer les variables d'environnement

Crée un fichier `.env` à la racine du projet :

```env
# Clerk - Authentification
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/

# Supabase - Base de données PostgreSQL
DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres"
```

> Les clés Clerk se trouvent dans votre dashboard Clerk → API Keys.  
> Les URLs Supabase se trouvent dans votre dashboard Supabase → Connect → ORM.

### 4. Initialiser la base de données

```bash
npx prisma migrate dev --name init
```

### 5. Lancer le serveur de développement

```bash
npm run dev
```

L'application est accessible sur [https://e-track-gray.vercel.app](https://e-track-gray.vercel.app).

---

## Structure du projet

```
etrack/
├── app/
│   ├── budgets/           # Page de gestion des budgets
│   ├── dashboard/         # Tableau de bord analytique
│   ├── transactions/      # Historique des transactions
│   ├── manage/[budgetId]  # Détail d'un budget
│   ├── sign-in/           # Page de connexion (Clerk)
│   ├── sign-up/           # Page d'inscription (Clerk)
│   ├── actions.ts         # Server actions (logique base de données)
│   ├── data.ts            # Données fictives pour la démo
│   ├── layout.tsx         # Layout racine
│   └── page.tsx           # Page d'accueil
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx     # Sélecteur de devise intégré
│   │   └── Footer.tsx
│   └── section/
│       ├── BudgetItem.tsx
│       ├── BilanSection.tsx   # Bilan global de la page d'accueil
│       ├── Notification.tsx
│       └── Wrapper.tsx
├── context/
│   └── CurrencyContext.tsx    # Contexte devises + conversion temps réel
├── lib/
│   └── prisma.ts          # Client Prisma (singleton)
├── prisma/
│   ├── schema.prisma      # Schéma de base de données
│   └── migrations/        # Historique des migrations
├── prisma.config.ts       # Configuration Prisma 7
└── .env                   # Variables d'environnement (non versionné)
```

---

## Schéma de base de données

```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  createdAt DateTime @default(now())
  budgets   Budget[]
}

model Budget {
  id           String        @id @default(uuid())
  name         String
  amount       Float
  emoji        String?
  userId       String
  user         User          @relation(fields: [userId], references: [id])
  transactions Transaction[]
  createdAt    DateTime      @default(now())
}

model Transaction {
  id          String   @id @default(uuid())
  description String
  amount      Float
  emoji       String?
  date        DateTime @default(now())
  budgetId    String
  budget      Budget   @relation(fields: [budgetId], references: [id])
  createdAt   DateTime @default(now())
}
```

---

## Scripts disponibles

| Commande | Description |
|---|---|
| `npm run dev` | Lance le serveur de développement |
| `npm run build` | Génère le client Prisma et compile l'application |
| `npm start` | Lance le serveur de production |

---

## Déploiement sur Vercel

1. Pusher le projet sur GitHub
2. Importer le dépôt sur [Vercel](https://vercel.com)
3. Ajouter les variables d'environnement dans Vercel → Settings → Environment Variables
4. Déployer

> Vercel exécute automatiquement `npm run build` qui inclut `prisma generate`.

---

## Démo

Une démonstration vidéo de l'application est disponible ici :  
[Regarder la démo](https://drive.google.com/file/d/1SgnKmcKrYlTubNnzXS6P2dLP_Q9w0cRZ/view?usp=drive_link)

---

## Auteur

**@MrBrain** - [GitHub](https://github.com/MrBrain314) · [LinkedIn](https://www.linkedin.com/in/ouro-tagbabastou/) · [Email](mailto:ourotagbabastouu@gmail.com)
