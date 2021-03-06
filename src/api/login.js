import { Router } from 'express';
import axios from 'axios';
import { getToken } from '../lib/token';

export default function (config) {
  const router = Router();

  router.get('/', (req, res) => {
    config.setAppUrl(req.query.redirect);
    const base = config.ghLoginUrl;
    const id = config.ghClientID;
    const redirect = config.ghCallbackUrl;
    const state = Math.random().toString(36).substring(7);
    const scope = 'admin:org,admin:org_hook,repo,user';
    const url = `${base}?client_id=${id}&redirect_url=${redirect}&scope=${scope}&state=${state}`;
    res.redirect(url);
  });

  router.get('/callback', async (req, res, next) => {
    try {
      const token = await getToken(req, config);
      const headers = { Authorization: `token ${token}` };
      const user = await axios.get('https://api.github.com/user', { headers });
      res.redirect(`${config.appUrl}/+token=${token}&username=${user.data.login}`);
    } catch (err) {
      res.redirect(`${config.appUrl}/+error=${err.message}`);
    }
  });

  return router;
}
