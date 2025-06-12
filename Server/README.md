## Prerequisites

-   Node.js (v18 or higher recommended)
-   npm (comes with Node.js) or yarn
-   mongodb (setup locally)

## Setup

1. Clone the repository:

    ```bash
    git clone https://github.com/arisculala/React-Node-Test.git
    cd React-Node-Test
    cd SERVER
    ```

2. Set `env` variables

    ```bash
    cp .env.example .env
    ```

    - Setup the following variables:
        - NODE_ENV (environment)
        - HTTPS (`false` running locally)
        - DB_URL (local url of your mongodb e.g. `mongodb://127.0.0.1:27017`)
        - DB (database name e.g. `Prolink`)

3. Install dependency

    ```bash
    npm install
    ```

4. Run using npm
    - For initial run or fresh run, the application will initialized the collections and default collections data like users etc.
    ```bash
    npm run start
    ```

-   You can now access your server base url: `http://127.0.0.1:5001/`
