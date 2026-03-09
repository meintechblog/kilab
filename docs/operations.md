# Operations

## Environment

Target runtime:
- Proxmox LXC: `kilab`
- App root: `/root/projects/kilab-webapp`
- Persistent service: `kilab-webapp.service`
- Port: `3000`

## Day-To-Day Commands

### Service

```bash
systemctl status kilab-webapp.service
systemctl restart kilab-webapp.service
journalctl -u kilab-webapp.service -n 100 --no-pager
```

### App

```bash
cd /root/projects/kilab-webapp
pnpm install
pnpm test
pnpm lint
pnpm build
```

### Manual Syncs

```bash
cd /root/projects/kilab-webapp
pnpm sync:prices -- --mode=day-ahead
pnpm sync:prices -- --mode=intraday
```

### Health Check

```bash
curl -I http://127.0.0.1:3000
```

## Scheduled Fetches

Configured Berlin-time sync schedule:
- `10:47`
- `12:58`
- `13:03`
- `13:10`
- `15:47`
- `22:47`

These jobs are meant to pick up early publication windows and follow-up corrections.

## Recovery

If the page is not reachable:
1. check the service status
2. inspect recent logs
3. rebuild if needed
4. restart the service
5. rerun the HTTP health check

Example:

```bash
cd /root/projects/kilab-webapp
pnpm build
systemctl restart kilab-webapp.service
curl -I http://127.0.0.1:3000
```

## Notes

- The repository is maintained directly from the container workflow.
- GitHub pushes are performed against `meintechblog/kilab`.
- The project is meant to stay operable as a real local service, not just as a demo repo.
