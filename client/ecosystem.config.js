module.exports = {
    apps: [
        {
            name: "ZTUNClient",
            script: "start.prod.js",
            autorestart: true,
            watch: false,
            max_memory_restart: "1G",
            env: {
                NODE_ENV: "development"
            },
            env_production: {
                NODE_ENV: "production"
            }
        }
    ]
};