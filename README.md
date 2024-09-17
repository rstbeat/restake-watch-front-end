# Restake Watch

Restake Watch is a web application dedicated to providing transparency to the restaking ecosystem. It serves as an impartial and autonomous watchdog, always acting in the best interest of users and the broader ecosystem.

## Features

- Overview of key metrics for different restaking platforms (EigenLayer, Symbiotic, Karak)
- Detailed operator and restaker information
- Risk assessment based on operator concentration
- Interactive charts for visualizing data

## Technologies Used

- React
- TypeScript
- Next.js
- Tailwind CSS
- Recharts for data visualization
- Bun as the JavaScript runtime and package manager

## Prerequisites

Before you begin, ensure you have installed:
- [Bun](https://bun.sh/)

## Getting Started

1. Clone the repository:
   ```
   git clone https://github.com/rstbeat/restake-watch-front-end.git
   cd restake-watch-front-end
   ```

2. Install dependencies:
   ```
   bun install
   ```

3. Run the development server:
   ```
   bun run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
.
├── public/
│   └── restake-watch-logo.png
├── src/
│   ├── app/
│   │   ├── favicon.ico
│   │   ├── fonts/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── ui/
│   │   ├── Footer.tsx
│   │   ├── MetricCard.tsx
│   │   ├── OperatorOverview.tsx
│   │   ├── Overview.tsx
│   │   ├── RestakeWatch.tsx
│   │   ├── RestakerOverview.tsx
│   │   └── Sidebar.tsx
│   ├── hooks/
│   │   └── use-toast.ts
│   ├── lib/
│   │   └── utils.ts
│   ├── next-env.d.ts
│   └── tsconfig.json
├── tmp/
│   └── llamadapeprators.json
├── .gitignore
├── bun.lockb
├── components.json
├── next.config.mjs
├── package.json
├── postcss.config.mjs
├── README.md
├── tailwind.config.ts
└── tsconfig.json
```

- `public/`: Static files
- `src/`: Source files
  - `app/`: Next.js 13+ app directory
  - `components/`: React components
    - `ui/`: Reusable UI components
  - `hooks/`: Custom React hooks
  - `lib/`: Utility functions and libraries
- `tmp/`: Temporary files (not tracked in version control)

## Code Formatting

We use a standardized code formatting approach to maintain consistency across the project. Before committing any changes, please ensure you format your code using the following command:

```
bun run format
```

### Important:
Always run the formatting command before committing your code. This helps maintain a consistent code style throughout the project and makes code reviews easier.

## Contributing

We welcome contributions to Restake Watch! Please follow these steps when contributing:

1. Fork the repository and create your branch from `main`.
2. Make your changes and add any necessary tests.
3. Ensure your code is formatted by running `bun run format`.
4. Commit your changes with a clear and descriptive commit message.
5. Push your branch and submit a pull request.

Please read our full contributing guidelines before submitting pull requests.

## Funding

Restake Watch receives funding from the Ethereum Foundation Ecosystem Support Grants. We are also actively seeking further funding and donations to enhance our monitoring capabilities and continue advancing the ecosystem.

## License

[MIT License](LICENSE)

## Contact

For more information, please visit [our website](https://restakewatch.com) or contact us at info@restakewatch.com.