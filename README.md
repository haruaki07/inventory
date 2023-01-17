## Minimum Requirements

1. Node.js 16.x

## Installation

1. Clone this repository

```shell
git clone https://github.com/haruaki07/inventory.git
cd inventory
```

2. Install node dependencies

```shell
npm install
```

4. Build tailwindcss

```shell
npm run build
```

5. Add .env file, then set the value as you like
```shell
# first copy .env.example to .env
cp .env.example .env
```

6. Run

```shell
# development
npm run dev
# or in production
npm run start
# or in production with pm2
npm run start:prod
```
