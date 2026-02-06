module.exports = {
    apps: [
        {
            name: 'bbp-api',
            script: './dist/src/index.js',
            exec_mode: 'cluster',
            instances: 3,
            env: {
                NODE_ENV: 'production',
            },
        },
    ],
};
