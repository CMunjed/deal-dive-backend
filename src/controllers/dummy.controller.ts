import { Request, Response } from 'express';
import { getDummyData } from '../services/dummy.service.js';

export async function getDummyHandler(_req: Request, res: Response) {
    try {
        const data = await getDummyData();
        res.json(data);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
}
