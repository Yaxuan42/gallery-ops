module.exports = {
  apps: [
    {
      name: "gallery-web",
      script: "node_modules/.bin/next",
      args: "start -H 0.0.0.0 -p 3000",
      cwd: "/Users/yaxuan/.openclaw/workspace/work/active/02-gallery-ops",
      env: {
        NODE_ENV: "production",
      },
      watch: false,
      max_restarts: 10,
      restart_delay: 3000,
    },
    {
      name: "gallery-studio",
      script: "node_modules/.bin/prisma",
      args: "studio --port 5555 --browser none",
      cwd: "/Users/yaxuan/.openclaw/workspace/work/active/02-gallery-ops",
      watch: false,
      max_restarts: 5,
      restart_delay: 5000,
    },
  ],
};
