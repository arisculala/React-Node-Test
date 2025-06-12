## Prerequisites

-   Node.js (v18 or higher recommended)
-   npm (comes with Node.js) or yarn

## Setup

1. Clone the repository:

    ```bash
    git clone https://github.com/arisculala/React-Node-Test.git
    cd React-Node-Test
    cd CLIENT
    ```

2. Set `env` variables

    ```bash
    cp .env.example .env
    ```

    - Setup the following variables:
        - REACT_APP_BASE_URL (backend server base url e.g. `http://127.0.0.1:5001/`)

3. Install dependency

    ```bash
    npm install
    ```

4. Run using npm
    ```bash
    npm run start
    ```

-   Running locally will open `http://localhost:3000/` in your browser.
    -   Default Login Credentials:
        -   email: admin@gmail.com
        -   password: admin123
