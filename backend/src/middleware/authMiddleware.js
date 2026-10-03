import { createClient } from '@supabase/supabase-js';
import { config } from '../config/env.js';
import { supabase } from '../config/supabase.js';

const supabaseAuth = createClient(
    config.supabase.url,
    config.supabase.anonKey
);

export const requireAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required.'
            });
        }

        const token = authHeader.replace('Bearer ', '');

        const {
            data: { user },
            error: authError
        } = await supabaseAuth.auth.getUser(token);

        if (authError || !user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired authentication token.'
            });
        }

        const { data: dbUser, error: userError } = await supabase
            .from('users')
            .select('id, auth_user_id, email, full_name, role')
            .eq('auth_user_id', user.id)
            .single();

        if (userError || !dbUser) {
            return res.status(403).json({
                success: false,
                message: 'Authenticated user profile not found.'
            });
        }

        req.user = dbUser;
        req.authUser = user;

        next();
    } catch (error) {
        next(error);
    }
};

export const requireRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required.'
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to perform this action.'
            });
        }

        next();
    };
};